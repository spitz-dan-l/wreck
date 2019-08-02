import { TopicID, ActionID, FacetID, Owner, Puffers, Venience, resource_registry } from "./prelude";
import { ConsumeSpec } from '../../parser';
import { Puffer } from '../../puffer';
import { message_updater, MessageUpdateSpec } from '../../message';
import { gist, Gists, render_gist_text, render_gist_command, gists_equal } from '../../gist';
import { update, cond, bound_method, } from '../../utils';
import { find_historical } from '../../interpretation';
import { StaticIndex } from '../../static_resources';

export interface Topics {
    has_considered: { [K in TopicID]?: boolean }
}

declare module './prelude' {
    export interface Venience extends Topics {}

    export interface StaticResources {
        initial_world_topic: Topics;
        topic_index: StaticIndex<TopicSpec>;
        memory_index: StaticIndex<MemorySpec>;
    }
}

resource_registry.create('initial_world_topic', {
    has_considered: {}
});

export type TopicSpec = {
    name: TopicID,
    cmd: ConsumeSpec,
    can_consider: (w: Venience) => boolean,
    message: MessageUpdateSpec,
    consider?: (w: Venience) => Venience,
    reconsider?: (w2: Venience, w1: Venience) => boolean
}

type TopicGists = { [K in TopicID]: undefined };

declare module '../../gist' {
    export interface GistSpecs extends TopicGists {
        'memory': { action: Gist<ActionID> };        
        'impression': { subject: Gist<TopicID> };
        // 'butt': 15;
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
                used: world.has_considered[spec.name]
            }, () =>
                parser.submit(
                    () => update(world,
                        message_updater(spec.message),
                        {
                            gist: () => gist('impression', { subject: gist(spec.name)}),
                            has_considered: { [spec.name]: true } },
                        ...cond(!!spec.consider, () => spec.consider!)
                    )));
        },
        post: (world2, world1) => {
            if (spec.reconsider === undefined ||
                world2.gist && gists_equal(world2.gist, gist('impression', { subject: gist(spec.name) }) ) ||
                // world2.gist && world2.gist.name === `your impression of ${spec.name}` ||
                !spec.reconsider(world2, world1)) {
                return world2;
            }

            return update(world2, {
                has_considered: { [spec.name]: false }
            })
        }
    }
}

const topic_index = resource_registry.create('topic_index',
    new StaticIndex([
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
).get();

export const Topics = bound_method(topic_index, 'add');


export type MemorySpec = {
    action: ActionID,
    could_remember: (w: Venience) => boolean,
}

const action_index = resource_registry.get('action_index', false);

export function make_memory(spec: MemorySpec): Puffer<Venience> {
    return {
        handle_command: (world, parser) => {
            if (world.has_acquired[spec.action] || !spec.could_remember(world)) {
                return parser.eliminate();
            }

            let result = parser.consume('remember_something', () => parser.submit());
            if (parser.failure) {
                return parser.failure;
            }

            let action = action_index.find(a => a.name === spec.action)!;

            return update(world,
                {
                    has_acquired: { [spec.action]: true },
                    gist: () => gist('memory', { action: gist(action.name)})
                },
                message_updater(`
                    You close your eyes, and hear Katya's voice:
                    <div class="interp">
                        ${action.description}
                    </div>
                    You write this down in your <strong>notes</strong>.`
                ));
        },
        post: (world2, world1) => {
            // weird workaround for when you get locked out. seems to work *shrugs*
            if (!spec.could_remember(world2)) {
                return world2;
            }

            world1 = find_historical(world1, w => w.owner === null)!;

            if (!spec.could_remember(world1) &&
                world2.message.prompt.length === 0) {
                return update(world2, message_updater({
                    prompt: ['You feel as though you might <strong>remember something...</strong>']
                }));
            }
            return world2;
        }
    }
}

Gists({
    tag: 'memory',
    text: ({action}) => `your memory of ${action}`,
    command: ({action}) => ['my_memory of', action]
});

const memory_index = resource_registry.create('memory_index',
    new StaticIndex([
        function add_memory_to_puffers(spec) {
            Puffers(make_memory(spec));
            return spec;
        }
    ])
).get();

export const Memories = bound_method(memory_index, 'add');

