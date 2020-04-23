import { StoryNode, StoryUpdateCompilationOp, UpdatesBuilder, StoryUpdaterSpec, Updates as S, story_updater, apply_story_updates_all, Story, sort_targets, is_story_node, Fragment,  } from "story";
import { AssocList } from "../lib/assoc";
import { Gist, gists_equal, gist_to_string, gist, ValidTags, Gists, match, GistRenderer, GistPattern } from "gist";
import { update } from "../lib/update";
import { World } from "../world";
import { Puffer } from "../puffer";
import { stages } from "../lib/stages";
import { compute_const, map_values } from "../lib/utils";

declare module 'gist' {
    export interface StaticGistTypes {
        knowledge: [{
            context?: 'knowledge',
            content: ValidTags
        }];
    }
};

gist('knowledge', { content: ['Sam']})

// It's always an error to render a pure knowledge gist.
// It always has to be wrapped or unpacked as something "observable" for the player.
GistRenderer(['knowledge'], {
    noun_phrase: g => {
        throw new Error('Tried to render a pure knowledge gist as a noun_phrase: '+gist_to_string(g));
    },
    command_noun_phrase: g => {
        throw new Error('Tried to render a pure knowledge gist as a command_noun_phrase: '+gist_to_string(g));
    },
    command_verb_phrase: g => {
        throw new Error('Tried to render a pure knowledge gist as a command_verb_phrase: '+gist_to_string(g));
    }
});

type KnowledgeEntry =  {
    key: Gists['knowledge'],
    story: StoryNode,
    story_updates: StoryUpdateCompilationOp[]
    children: Gists['knowledge'][]
}

export class GistAssoc<T, Tags extends ValidTags=ValidTags> extends AssocList<Gists[Tags], T> {    
    key_equals(k1: Gists[Tags], k2: Gists[Tags]) {
        return gists_equal(k1, k2);
    }
}

type KnowledgeAssoc = GistAssoc<KnowledgeEntry, 'knowledge'>;

export class Knowledge {
    ['constructor']: new (knowledge: KnowledgeAssoc) => this;
    constructor(
        public knowledge: KnowledgeAssoc = new GistAssoc([]),
    ) {}

    get_entries(g: Gist): KnowledgeAssoc {
        if (g[0] === 'knowledge') {
            return this.knowledge.filter(k => gists_equal(k, g));
        }
        
        const pat: GistPattern<'knowledge'> = ['knowledge', { content: g }];
        return this.knowledge.filter((k) =>
            !!match(k)(pat)
        );
    }

    get_entry(g: Gist): KnowledgeEntry | undefined {
        const matches = this.get_entries(g);
        if (matches.data.length > 1) {
            debugger;
            throw new Error(`Ambiguous knowledge key: ${JSON.stringify(g)}. Found ${matches.data.length} matching entries. Try passing a knowledge key with explicit parent context.`);
        }
        if (matches.data.length === 0) {
            return undefined;
        }
        return matches.data[0].value;
    }

    get(g: Gist): StoryNode | undefined {
        return this.get_entry(g)?.story;
    }

    ingest(story_or_func: (Fragment | ((k: this) => Fragment)), parent_context?: Gists['knowledge'], allow_replace=false): this {
        let result = this;
            
        // for (const story_or_func of stories) {
        const story = compute_const(() => {
            if (typeof story_or_func === 'function') {
                return story_or_func(result);
            }
            return story_or_func;
        });
        
        if (!is_story_node(story)) {
            throw new Error('Passed a non-StoryNode to ingest().');
        }
        if (story.data.gist === undefined) {
            throw new Error('Passed a story node without a gist to initialize().');
        }

        const g = story.data.gist;
        if (g[0] === 'knowledge') {
            throw new Error('Gist must not be a pure knowledge gist. "knowledge" is a special tag used internally by the knowledge base only.');
        }

        const k = gist('knowledge', { content: g, context: parent_context});

        const old_child_entry = this.get_entry(k); //this.knowledge.get(g);
        if (old_child_entry !== undefined) {
            if (story === old_child_entry.story) {
                console.log('saving time by skipping a knowledge subtree update')
                return result;
            } else if (!allow_replace){
                throw new Error(`Tried to overwrite the knowledge entry for ${gist_to_string(g)}`)
            }
            
        }

        const child_knowledge = immediate_child_gists().query(story);
        
        for (const [c, path] of child_knowledge) {
            result = result.ingest(c as StoryNode, k);
        }
        
        const child_gists = sort_targets(child_knowledge).map(([node, path]) =>
            gist('knowledge', { content: (node as StoryNode).data.gist!, context: k })
        )
        
        let new_knowledge = result.knowledge.set(k, {
            key: k,
            story,
            story_updates: [],
            children: child_gists
        });

        return new (this.constructor)(new_knowledge);
    }

    update(k: Gist, f: (builder: UpdatesBuilder) => StoryUpdaterSpec): this {
        const old_entry = this.get_entry(k);

        if (old_entry === undefined) {
            throw new Error('Tried to update a non-existent knowledge entry: ' + JSON.stringify(k));
        }
        const g = old_entry.key;
        const updates = f(S.story_root());

        const new_entry = update(old_entry, {
            story_updates: story_updater(updates)
        });

        return new (this.constructor)(this.knowledge.set(g, new_entry));
    }

    bottom_up_order(): Gists['knowledge'][] {
        const result: Gists['knowledge'][] = [];

        const remaining = this.knowledge.keys();
        
        while (remaining.length > 0) {
            const g = remaining.pop()!;
            const {children: cs} = this.knowledge.get(g)!;
            // if every child is already included in the results, append the parent to the results.
            if (cs.every(c => result.some(r => gists_equal(c, r)))) {
                result.push(g);
            } else { // else stick the parent at the end of the line to try again later.
                remaining.unshift(g);
            }
        }

        return result;
    }

    consolidate(): this {
        const bottom_up_order = this.bottom_up_order();

        let result = this;
        for (const g of bottom_up_order) {
            let updates: StoryUpdateCompilationOp[] = [];

            const entry = result.knowledge.get(g)!;
            const children = entry.children;

            for (const c of children) {
                const prev_entry = this.knowledge.get(c)!;
                const child_entry = result.knowledge.get(c)!;

                // this child had no updates
                if (prev_entry === child_entry) {
                    continue;
                }

                updates = story_updater(
                    immediate_child_gists(c[1].content).replace([child_entry.story]),
                )(updates);
            }

            updates.push(...entry.story_updates);

            if (updates.length > 0) {
                const new_story = apply_story_updates_all(entry.story as Story, updates);
                result = result.ingest(new_story, entry.key[1].context, true);
                // TODO Prune any orphaned entries
            }
        }
        return result;
    }
    
    push_updates(builder: UpdatesBuilder): StoryUpdateCompilationOp[] {
        return this.bottom_up_order().flatMap(g => {
            const us = this.knowledge.get(g)!.story_updates;
            const selector = knowledge_selector(g);
            return us.map(u =>
                builder.chain(selector).prepend_to(u)
            );                    
        });
    }
}

export function immediate_child_gists(child_pattern?: GistPattern) {
    return S.first_level(S
        .children()
        .has_gist(child_pattern)
    )
}

export function knowledge_selector(g: Gists['knowledge']) {
    const parent_stack: Gists['knowledge'][] = []
    let ptr: Gists['knowledge'] | undefined = g;
    while (ptr !== undefined) {
        parent_stack.unshift(ptr);
        ptr = ptr[1].context;
    }

    // for the topmost parent, it doesn't have to be a step removed from the root.
    let builder = S.has_gist(parent_stack.shift()![1].content);
    for (const parent of parent_stack) {
        builder = builder.chain(immediate_child_gists(parent[1].content));
    }
    return builder;
}

export function knowledge_gist(content0: Gist, ...content: Gist[]): Gists['knowledge'] {
    return _knowledge_gist(content0, ...content) as Gists['knowledge'];
}
function _knowledge_gist(...content: Gist[]): Gists['knowledge'] | undefined {
    if (content.length === 0) {
        return undefined;
    }

    return ['knowledge', { content: content.shift()!, context: _knowledge_gist(...content) }]
}


export type KnowledgePufferSpec<W extends World> = {
    get_knowledge: (w: W) => Knowledge,
    set_knowledge: (w: W, k: Knowledge) => W,
    get_dynamic_region: (w: W) => UpdatesBuilder | undefined,
    push_updates_stage?: number
};

export function make_knowledge_puffer<W extends World>(
    {
        get_knowledge,
        set_knowledge,
        get_dynamic_region,
        push_updates_stage
    }: KnowledgePufferSpec<W>
): Puffer<W> {
    return {
        pre: (w) => {
            //consolidate all knowledge updates into the story trees for each entry
            return set_knowledge(w, get_knowledge(w).consolidate());
        },

        post: stages([push_updates_stage ?? 2,
            (w) => {
                const selector = get_dynamic_region(w);
                if (selector === undefined) {
                    return w;
                }

                return update(w as World, {
                    story_updates: story_updater(get_knowledge(w).push_updates(selector))
                }) as W;
            }
        ])
    };
}

/*
    TODO: Try out this knowledge base, but getting and updating are done using
    GistPatterns, not Gists. Insertion still uses Gists.

    Given a pattern, you'd need to find the *most specific* matching gist, not just the first one.
    There would be ties. Unsure if you'd want to prioritize the context-level
    specificity before the content-level, or vice-versa?
*/