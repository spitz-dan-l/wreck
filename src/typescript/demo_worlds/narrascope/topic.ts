import { gist, Gists, gists_equal } from '../../gist';
import { ConsumeSpec } from '../../parser';
import { Puffer } from '../../puffer';
import { StaticIndex, StaticMap } from '../../static_resources';
import { bound_method, cond, update, map } from '../../utils';
import { ActionID, Puffers, resource_registry, TopicID, Venience, StaticTopicIDs } from "./prelude";
import { story_updater, StoryUpdaterSpec, Fragment, Updates } from '../../story';

export interface Topics {
    has_considered: Map<TopicID, boolean>;
}

export type TopicSpec = {
    name: TopicID,
    cmd: ConsumeSpec,
    can_consider: (w: Venience) => boolean,
    message: (w: Venience) => StoryUpdaterSpec,
    consider?: (w: Venience) => Venience,
    reconsider?: (w2: Venience, w1: Venience) => boolean
}

declare module './prelude' {
    export interface Venience extends Topics {}

    export interface StaticResources {
        initial_world_topic: Topics;
        topic_index: StaticMap<Record<TopicID, TopicSpec>>;
    }
}

resource_registry.initialize('initial_world_topic', {
    has_considered: map()
});

type TopicGists = { [K in TopicID]: undefined };

declare module '../../gist' {
    export interface GistSpecs extends TopicGists {
        'impression': { subject: Gist<TopicID> };
    }
}

Gists({
    tag: 'impression',
    text: ({subject}) => `your impression of ${subject}`,
    command: ({subject}) => ['my_impression of', subject]
});

export function make_topic(spec: TopicSpec): Puffer<Venience> {
    return {
        handle_command: (world, parser) => {
            if (!spec.can_consider(world)) {
                return parser.eliminate();
            }

            return parser.consume({
                tokens: ['consider', spec.cmd],
                used: world.has_considered.get(spec.name)
            }, () =>
                parser.submit(
                    () => update(world,
                        story_updater(spec.message(world)),
                        {
                            gist: () => gist('impression', { subject: gist(spec.name)}),
                            has_considered: map( [spec.name, true] )
                        },
                        ...cond(!!spec.consider, () => spec.consider!)
                    )));
        },
        post: (world2, world1) => {
            if (spec.reconsider === undefined ||
                world2.gist && gists_equal(world2.gist, gist('impression', { subject: gist(spec.name) }) ) ||
                !spec.reconsider(world2, world1)) {
                return world2;
            }

            return update(world2, {
                has_considered: map( [spec.name, false] )
            })
        }
    }
}

const topic_index = resource_registry.initialize('topic_index',
    new StaticMap(StaticTopicIDs, [
        function add_topic_to_puffers(spec) {
            Puffers(make_topic(spec));
            return spec;
        },
        function add_topic_to_gists(spec) {
            Gists({
                tag: spec.name,
                text: () => spec.name,
                command: () => spec.cmd
            });
            return spec;
        }
    ])
);

export const Topics = (spec: TopicSpec) => topic_index.initialize(spec.name, spec);