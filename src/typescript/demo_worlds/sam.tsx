import { gist, Gists, gist_renderer_index, GistSpecs, render_gist, Gist, gist_matches, gists_equal } from "../gist";
import { make_puffer_world_spec, Puffer } from "../puffer";
import { NameOf, StaticIndex } from "../static_resources";
import { createElement, find_all_nodes, Fragment, is_story_node, StoryNode, StoryQueryIndex, story_updater, Updates as S, Groups, find_all_chain } from "../story";
import { update } from "../update";
import { bound_method, compute_const, enforce_always_never } from "../utils";
import { get_initial_world, World, world_driver } from "../world";

export interface SamWorld extends World {
}

export const PufferIndex = new StaticIndex<Puffer<SamWorld>>();
const Puffers = bound_method(PufferIndex, 'add');


declare module '../gist' {
    export interface GistSpecs {
        'Sam': undefined;
        'Sam\'s identity': undefined;
        'Sam\'s demeanor': undefined;

        facet: {parent: Gist, child: Gist};

        'consideration': {topic: Gist};
        'contemplation': {topic: Gist};
        'recollection': {event: Gist}
    }
}

const StaticTopicIDs = compute_const(() => ({
    'Sam': null
}));
type TopicID = NameOf<typeof StaticTopicIDs>;

enforce_always_never(
    null as Exclude<TopicID, keyof GistSpecs>
);


Gists({
    tag: 'Sam',
    command_noun_phrase: () => 'sam',
    noun_phrase: () => 'Sam',
    story: () => <div>
        <div gist="Sam's identity">
            An old friend on his way to work.
        </div>
        <div gist="Sam's demeanor">
            He glances at you, smiling vaguely.
        </div>
    </div> 
});

Gists({
    tag: 'facet',
    noun_phrase: ({child}) => child,
    command_noun_phrase: ({child}) => child,
    
    patterns: [[undefined, {
        story: ({child}) => <blockquote>
            {render_gist.noun_phrase(child)}
        </blockquote>   
    }]]
    

})

function story_facets(node: Fragment) {
    if (!is_story_node(node) || node.data.gist === undefined) {
        return [];
    }
    const parent = node.data.gist;
    return find_all_nodes(node,
        n => n !== node && is_story_node(n) && n.data.gist !== undefined)
        .map(([n]) => gist('facet', {
            child: (n as StoryNode).data.gist!,
            parent
        }));
}

Puffers({
    handle_command: (w, p) =>
        p.consume('consider', () =>
        p.split(Object.keys(StaticTopicIDs).map(
            (t_id: TopicID) => () =>
                p.consume(render_gist.command_noun_phrase(gist(t_id)), () =>
                p.submit(() =>
                update(w, story_updater(
                    S.description(
                        render_gist.story(gist(t_id))),
                    S.set_gist(gist('consideration', {topic: gist(t_id)}))
                )))))
        ))
    
});

Puffers({
    handle_command: (w, p) =>
        p.consume('contemplate', () =>
        p.split(Object.keys(StaticTopicIDs).map(
            (t_id: TopicID) => () =>
                p.consume(render_gist.command_noun_phrase(gist(t_id)), () =>
                p.submit(() => {
                    const topic_story = render_gist.story(gist(t_id));
                    const facets = story_facets(topic_story);
                    return update(w, story_updater(
                        S.description(
                            render_gist.story(gist(t_id))),
                        S.prompt(<br />),
                        S.prompt(<div>
                            You notice the following facets:
                            { facets.map(f => render_gist.story(f)) }
                        </div>),
                        
                        Groups.name('init_frame').push(
                            S.set_gist(gist('contemplation', {topic: gist(t_id)}))
                        )
                    ));
                })))        
        ))
});

Gists({
    tag: 'consideration',
    noun_phrase: ({topic}) => `your consideration of ${topic}`,
    command_noun_phrase: ({topic}) => ['my_consideration_of', topic]
});

Gists({
    tag: 'contemplation',
    noun_phrase: ({topic}) => `your contemplation of ${topic}`,
    command_noun_phrase: ({topic}) => ['my_contemplation_of', topic]
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

PufferIndex.seal();
StoryQueryIndex.seal();
gist_renderer_index.seal();
/**
 * Ability to "consider sam", and get the topic
 * Ability to "contemplate sam" and get a list of the facets
 */

const initial_sam_world: SamWorld = {
    ...get_initial_world<SamWorld>()
};

export const sam_world_spec = make_puffer_world_spec(initial_sam_world, PufferIndex.all());

export function new_world() {
    return world_driver(sam_world_spec);
}