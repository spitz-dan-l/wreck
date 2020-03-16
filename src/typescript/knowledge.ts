import { StoryNode, StoryUpdateGroupOp, UpdatesBuilder, StoryUpdaterSpec, Updates, story_updater, apply_story_updates_all, Story, sort_targets, is_story_node, Fragment,  } from "./story";
import { AssocList } from "./lib/assoc";
import { Gist, gists_equal, gist_to_string, GistConstructor, gist } from "./gist";
import { update } from "./lib/update";
import { World } from "./world";
import { Puffer } from "./puffer";
import { stages } from "./lib/stages";
import { range, compute_const } from "./lib/utils";

declare module './story/update/update_group' {
    export interface StoryUpdateGroups {
        knowledge_updates: "Updates to in-game Knowledge."
    }
}

type KnowledgeEntry =  {
    story: StoryNode,
    story_updates: StoryUpdateGroupOp[]
    dependencies: Gist[]
}

export class GistAssoc<T> extends AssocList<Gist, T> {    
    key_equals(k1: Gist, k2: Gist) {
        return gists_equal(k1, k2);
    }
}

type KnowledgeAssoc = GistAssoc<KnowledgeEntry>;

export class Knowledge {
    ['constructor']: new (knowledge: KnowledgeAssoc) => this;
    constructor(
        public knowledge: KnowledgeAssoc = new GistAssoc([]),
    ) {}

    get(g: GistConstructor): StoryNode | null {
        const entry = this.knowledge.get(gist(g));
        if (entry === null) {
            return null;
        }

        return entry.story;
    }

    ingest(...stories: (Fragment | ((k: this) => Fragment))[]): this {
        let result = this;
            
        for (const story_or_func of stories) {
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

            const g = story.data.gist!;

            const old_child_entry = this.knowledge.get(g);
            if (old_child_entry !== null) {
                if (story === old_child_entry.story) {
                    console.log('saving time by skipping a knowledge subtree update')
                    continue;
                } else {
                    throw new Error(`Tried to overwrite the knowledge entry for ${gist_to_string(g)}`)
                }
                
            }

            const child_knowledge = Updates.first_level(
                Updates
                    .children()
                    .has_gist(undefined)
                    .to_query_spec()
            ).to_query()(story);
            
            for (const [c, path] of child_knowledge) {
                result = result.ingest(c as StoryNode);
            }
            
            const child_gists = sort_targets(child_knowledge).map(([node, path]) => (node as StoryNode).data.gist!)
            
            let new_knowledge = result.knowledge.set(g, {
                story,
                story_updates: [],
                dependencies: child_gists
            });

            result = new (this.constructor)(new_knowledge);
        }
        return result;
    }

    update(k: GistConstructor, f: (builder: UpdatesBuilder) => StoryUpdaterSpec): this {
        const g = gist(k)
        const old_entry = this.knowledge.get(g);

        if (old_entry === null) {
            throw new Error('Tried to update a non-existent knowledge entry: ' + gist_to_string(g));
        }
        
        const builder = Updates.has_gist(g);

        const updates = f(builder);

        const new_entry = update(old_entry, {
            story_updates: story_updater(updates)
        });

        return new (this.constructor)(this.knowledge.set(g, new_entry));
    }

    bottom_up_order(): Gist[] {
        const result: Gist[] = [];

        const remaining = this.knowledge.keys();
        
        while (remaining.length > 0) {
            const g = remaining.pop()!;
            const {dependencies: cs} = this.knowledge.get(g)!;
            if (cs.every(c => result.some(r => gists_equal(c, r)))) {
                result.push(g);
            } else {
                remaining.unshift(g);
            }
        }

        return result;
    }

    consolidate(): this {
        const bottom_up_order = this.bottom_up_order();

        let result = this;
        for (const g of bottom_up_order) {
            let updates: StoryUpdateGroupOp[] = [];

            const entry = result.knowledge.get(g)!;
            const children = entry.dependencies;

            for (const c of children) {
                const prev_entry = this.knowledge.get(c)!;
                const child_entry = result.knowledge.get(c)!;

                // this child had no updates
                if (prev_entry === child_entry) {
                    continue;
                }

                updates = story_updater(
                    Updates.children().has_gist(c).replace([child_entry.story])
                )(updates);
            }

            updates.push(...entry.story_updates);

            if (updates.length > 0) {
                const new_story = apply_story_updates_all(entry.story as Story, updates);
                result = result.ingest(new_story);
            }
        }
        return result;
    }
    
    push_updates(builder: UpdatesBuilder): StoryUpdateGroupOp[] {
        return this.bottom_up_order().flatMap(g => {
            const us = this.knowledge.get(g)!.story_updates;
            return us.map(u =>
                u.kind === 'PushGroup' ?
                    update(u, {
                        updates: _ => _.map(u1 => builder.prepend_to(u1))
                    }) :
                    u
            );                    
        });
    }
}

/**
 * TODO:
 * A piece of world state that maps gists to the current
 * story subtree to print when "considering" that gist
 * 
 * This should get updated when the player "solves a puzzle"
 * or otherwise changes how they think about a given topic
 * 
 * It should be used when rendering most parts of the story
 */
export type KnowledgePufferSpec<W extends World> = {
    get_knowledge: (w: W) => Knowledge,
    set_knowledge: (w: W, k: Knowledge) => W,
    get_dynamic_region: (w: W) => UpdatesBuilder | null
};

export function make_knowledge_puffer<W extends World>(
    {
        get_knowledge,
        set_knowledge,
        get_dynamic_region
    }: KnowledgePufferSpec<W>
): Puffer<W> {
    return {
        pre: (w) => {
            //consolidate all knowledge updates into the story trees for each entry
            return set_knowledge(w, get_knowledge(w).consolidate());
        },

        post: stages([2,
            (w) => {
                const selector = get_dynamic_region(w);
                if (selector === null) {
                    return w;
                }

                return update(w as World, {
                    story_updates: story_updater(get_knowledge(w).push_updates(selector))
                }) as W;
            }
        ])
    };
}