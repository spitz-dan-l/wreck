import { gist, Gist, gists_equal, gist_matches, render_gist } from "gist";
import { make_puffer_world_spec, Puffer } from "../puffer";
import { NameOf, StaticIndex, StaticMap } from "../lib/static_resources";
import { createElement, find_all_nodes, Fragment, Groups, is_story_node, StoryNode, story_updater, Updates as S } from "../story";
import { update } from "../lib/update";
import { assert, bound_method, enforce_always_never } from "../lib/utils";
import { get_initial_world, World, world_driver } from "../world";

export interface SamWorld extends World {
}

export const PufferIndex = new StaticIndex<Puffer<SamWorld>>();
const Puffers = bound_method(PufferIndex, 'add');


declare module 'gist' {
    export interface GistSpecs {
        'Sam': undefined;
        'Sam\'s identity': undefined;
        'Sam\'s demeanor': undefined;

        facet: {parent: Gist, child: Gist};

        'consideration': {topic: Gist};
        'contemplation': {event: Gist};
        'recollection': {event: Gist};

    }
}

const StaticTopicIDs = {
    'Sam': null
};
type TopicID = NameOf<typeof StaticTopicIDs>;

enforce_always_never(
    null as Exclude<TopicID, keyof GistSpecs>
);

const TopicContents = new StaticMap<Record<TopicID, Fragment>>(StaticTopicIDs);

TopicContents.initialize('Sam', <div gist="Sam">
    <div gist="Sam's identity">
        An old friend on his way to work.
    </div>
    <div gist="Sam's demeanor">
        He glances at you, smiling vaguely.
    </div>
</div>);

Gists({
    tag: 'Sam',
    command_noun_phrase: () => 'sam',
    noun_phrase: () => 'Sam',
});

Gists({
    tag: 'facet',
    noun_phrase: ({child}) => child,
    command_noun_phrase: ({child}) => child
});

function story_facets(node: Fragment) {
    if (!is_story_node(node) || node.data.gist === undefined) {
        return [];
    }

    const predicate = (f: Fragment): f is StoryNode & { data: { gist: Gist }} =>
        (
            f !== node &&
            is_story_node(f) &&
            f.data?.gist !== undefined
        );
    
    const gist_nodes = find_all_nodes(node, predicate); 
    
    return gist_nodes.map(([f, p]) => f.data.gist);
}

function render_facet(facet: Gist): Fragment {
    return <blockquote gist={facet}>
        {render_gist.noun_phrase(facet)}
    </blockquote>
}

Puffers({
    handle_command: (w, p) =>
        p.consume('consider', () =>
        p.split(Object.keys(StaticTopicIDs).map(
            (t_id: TopicID) => () =>
                p.consume(render_gist.command_noun_phrase(gist(t_id)), () =>
                p.submit(() =>
                update(w, story_updater(
                    S.description(TopicContents.get(t_id)),
                    S.set_gist(gist('consideration', {topic: gist(t_id)}))
                )))))
        ))
    
});

// Puffers({
//     handle_command: (w, p) =>
//         p.consume('contemplate', () =>
//         p.split(Object.keys(StaticTopicIDs).map(
//             (t_id: TopicID) => () =>
//                 p.consume(render_gist.command_noun_phrase(gist(t_id)), () =>
//                 p.submit(() => {
//                     const topic_story = TopicContents.get(t_id);
//                     const facets = story_facets(topic_story);
//                     return update(w, story_updater(
//                         S.description(
//                             TopicContents.get(t_id)),
//                         S.prompt(<br />),
//                         S.prompt(<div>
//                             You notice the following facets:
//                             { facets.map(f => render_facet(f)) }
//                         </div>),
                        
//                         Groups.name('init_frame').push(
//                             S.set_gist(gist('contemplation', {topic: gist(t_id)}))
//                         )
//                     ));
//                 })))        
//         ))
// });

Puffers({
    handle_command: (w, p) => {
        if (w.index < 2) {
            return p.eliminate();
        }
        return (
            p.consume('contemplate_that', () =>
            p.submit(() => {
                const [focus_story] = StoryQueryIndex.get('frame')(w.index - 1)(w.story)[0];
                assert(is_story_node(focus_story));
                const facets = story_facets(focus_story);
                return update(w, story_updater(
                    // S.description(focus_story),
                    // S.prompt(<br />),
                    S.prompt(<div>
                        You notice the following facets:
                        {facets.map(f => render_facet(f))}
                    </div>),
                    Groups.name('init_frame').push(
                        S.set_gist(gist('contemplation', { event: focus_story.data.gist! })))));
        })));
    }
});

Gists({
    tag: 'consideration',
    noun_phrase: ({topic}) => `your consideration of ${topic}`,
    command_noun_phrase: ({topic}) => ['my_consideration_of', topic]
});

Gists({
    tag: 'contemplation',
    noun_phrase: ({event}) => `your contemplation of ${event}`,
    command_noun_phrase: ({event}) => ['my_contemplation_of', event]
});

Gists({
    tag: 'recollection',
    noun_phrase: ({event}) => `your recollection of ${event}`,
    command_noun_phrase: ({event}) => ['my_recollection_of', event]
});

Puffers({
    handle_command: (w, p) => {
        const past_actions = find_all_nodes(w.story, (f) => (
            is_story_node(f) &&
            f.data.gist !== undefined &&
            f.data.frame_index !== undefined
        )).filter(([f, p]) => {
            let n: StoryNode = w.story;
            for (const i of p.slice(0, -1)) {
                n = n.children[i] as StoryNode;
                if (
                    n.data.gist !== undefined &&
                    gist_matches(n.data.gist, {tag: 'recollection'})
                ) {
                    return false;
                }
            }
            return true;
        });

        if (past_actions.length === 0) {
            return p.eliminate();
        }

        const past_actions_most_recent: (StoryNode & { data: { gist: Gist } })[] = [];
        for (const [f] of past_actions.reverse()) {
            const f_ = (f as StoryNode).data.gist!
            if (past_actions_most_recent.find(f2 => gists_equal(f2.data.gist, (f as StoryNode).data.gist!)) === undefined) {
                past_actions_most_recent.unshift(f as (StoryNode & { data: { gist: Gist } }));
            }
        }

        return (
            p.consume('recall', () =>
            p.split(past_actions_most_recent.map(
                (f) => {
                    const g = f.data.gist!;
                    return () =>
                        p.consume(render_gist.command_noun_phrase(g), () =>
                        p.submit(() =>
                        update(w, story_updater(
                            S.consequence('You remember it going something like this:'),
                            S.description(<blockquote>{f}</blockquote>),
                            Groups.name('init_frame').push(
                                S.set_gist(gist('recollection', {event: g}))
                            )
                        ))));
                }
            )))
        );
    }
});

TopicContents.seal();
PufferIndex.seal();
StoryQueryIndex.seal();
gist_renderer_index.seal();
/**
 *  
 *  
 *
 */

const initial_sam_world: SamWorld = {
    ...get_initial_world<SamWorld>()
};

export const sam_world_spec = make_puffer_world_spec(initial_sam_world, PufferIndex.all());

export function new_world() {
    return world_driver(sam_world_spec);
}