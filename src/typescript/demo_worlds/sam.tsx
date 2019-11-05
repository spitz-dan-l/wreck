import { gist, Gists, gist_renderer_index, render_gist_command, render_gist_story, render_gist_text } from "../gist";
import { make_puffer_world_spec, Puffer } from "../puffer";
import { NameOf, StaticIndex } from "../static_resources";
import { createElement, find_all_nodes, Fragment, is_story_node, StoryNode, StoryQueryIndex, story_updater, Updates as S } from "../story";
import { update } from "../update";
import { bound_method, compute_const } from "../utils";
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
    }
}

const StaticTopicIDs = compute_const(() => ({
    'Sam': null,
}))
type TopicID = NameOf<typeof StaticTopicIDs>;


Gists({
    tag: 'Sam',
    command: () => 'sam',
    text: () => 'Sam',
    story: () => <div>
        <div gist="Sam's identity">
            An old friend on his way to work.
        </div>
        <div gist="Sam's demeanor">
            He glances at you, smiling vaguely.
        </div>
    </div> 
});

function story_facets(node: Fragment) {
    return find_all_nodes(node,
        n => n !== node && is_story_node(n) && n.data.gist !== undefined)
        .map(([n]) => (n as StoryNode).data.gist!);
}

Puffers({
    handle_command: (w, p) =>
        p.split(Object.keys(StaticTopicIDs).map(
            (t_id: TopicID) => () =>
                p.consume('consider', () =>
                p.consume(render_gist_command(gist(t_id)), () =>
                p.submit(() =>
                update(w, story_updater(
                    S.description(
                        render_gist_story(gist(t_id)))
                )))))
        ))
    
});

Puffers({
    handle_command: (w, p) =>
        p.split(Object.keys(StaticTopicIDs).map(
            (t_id: TopicID) => () =>
                p.consume('contemplate', () =>
                p.consume(render_gist_command(gist(t_id)), () =>
                p.submit(() => {
                    const topic_story = render_gist_story(gist(t_id));
                    const facets = story_facets(topic_story);
                    return update(w, story_updater(
                        S.description(
                            render_gist_story(gist(t_id))),
                        S.prompt(<br />),
                        S.prompt(<div>
                            You notice the following facets:
                            {
                                facets.map(f => <blockquote>
                                    {render_gist_text(f)}
                                </blockquote>)
                            }
                        </div>)
                    ));
                })))        
        ))
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