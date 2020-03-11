import { StoryNode, StoryUpdateGroupOp, UpdatesBuilder, StoryUpdaterSpec, Updates, story_updater, apply_story_updates_all, Story, sort_targets,  } from "./story";
import { AssocList } from "./lib/assoc";
import { Gist, gists_equal, gist_to_string } from "./gist";
import { update } from "./lib/update";
import { World } from "./world";
import { Puffer } from "./puffer";

type KnowledgeEntry =  {
    story: StoryNode,
    story_updates: StoryUpdateGroupOp[]
}

export class GistAssoc<T> extends AssocList<Gist, T> {    
    key_equals(k1: Gist, k2: Gist) {
        return gists_equal(k1, k2);
    }
}

type KnowledgeAssoc = GistAssoc<KnowledgeEntry>;
type Dependencies = GistAssoc<Gist[]>;

export class Knowledge {
    ['constructor']: new (knowledge: KnowledgeAssoc, dependencies: Dependencies) => this;
    constructor(
        public knowledge: KnowledgeAssoc = new GistAssoc([]),
        public dependencies: Dependencies = new GistAssoc([])
    ) {}

    initialize(story: StoryNode): this {
        if (story.data.gist === undefined) {
            throw new Error('Passed a story node without a gist to initialize().');
        }

        const g = story.data.gist!;

        if (story === this.knowledge.get(g)?.story) {
            return this;
        }

        const child_knowledge = Updates.first_level(
            Updates
                .children()
                .has_gist(undefined)
                .to_query_spec()
        ).to_query()(story);
        
        let result = this;
        for (const [c, path] of child_knowledge) {
            result = result.initialize(c as StoryNode);
        }
        
        const child_gists = sort_targets(child_knowledge).map(([node, path]) => (node as StoryNode).data.gist!)
        
        let new_dependencies = result.dependencies.set(g, child_gists);

        let new_knowledge = result.knowledge.set(g, {
            story,
            story_updates: []
        });

        return new (this.constructor)(new_knowledge, new_dependencies);
    }

    update(k: Gist, f: (builder: UpdatesBuilder) => StoryUpdaterSpec): this {
        const old_entry = this.knowledge.get(k);

        if (old_entry === null) {
            throw new Error('Tried to update a non-existent knowledge entry: ' + gist_to_string(k));
        }
        
        const builder = Updates.has_gist(k);

        const updates = f(builder);

        const new_entry = update(old_entry, {
            story_updates: story_updater(updates)
        });

        return new (this.constructor)(this.knowledge.set(k, new_entry), this.dependencies);
    }

    bottom_up_order(): Gist[] {
        const result = this.knowledge.keys().filter(g =>
            this.dependencies.get(g) === null);
        
        const remaining = this.dependencies.keys();

        while (remaining.length > 0) {
            const g = remaining.pop()!;
            const cs = this.dependencies.get(g)!;
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

            const children = result.dependencies.get(g)!;

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

            const entry = result.knowledge.get(g)!;
            updates.push(...entry.story_updates);

            if (updates.length > 0) {
                const new_story = apply_story_updates_all(entry.story as Story, updates);
                
                result = result.initialize(new_story);
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

const KnowledgePuffer: Puffer<World & { knowledge: Knowledge }> = {
    pre: (w) => {
        //consolidate all knowledge updates into the story trees for each entry
        return update(w, {
            knowledge: (k) => k.consolidate()
        });
    },

    // post: stages([2,
    //     (w) => {
    //         if (w.current_interpretation !== null) {
    //             const updated_story = apply_story_updates_all(w.story, w.story_updates);
    //             const q = S.frame(range(w.current_interpretation!, w.index + 1));
    //             const things_to_update = compile_story_query(q.has_gist(undefined).to_query())(updated_story);

    //             for (const [node, path] of things_to_update) {
    //                 const g = (node as StoryNode).data.gist!
    //                 const entry = w.knowledge.get(g);
    //                 if (entry !== null) {
    //                     w = update(w, {
    //                         story_updates: story_updater(
    //                             entry.story_updates.map(grp => {
    //                                 if (grp.kind === 'PushGroup') {
    //                                     return update(grp, {
    //                                         updates: _ => _.map(s =>
    //                                             q.prepend_to(s))
    //                                     });
    //                                 }
    //                                 return grp;
    //                             })
    //                         )
    //                     });
    //                 }
    //             }

    //             return update(w, { story_updates: story_updater(
    //                 ...w.knowledge.data.map(({key, value}) => {
    //                     return value.story_updates;
    //                 })
    //             ) });
    //         }
    //         return w;
    //     }
    // ])
};