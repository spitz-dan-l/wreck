import { createElement } from '../../UI/framework/framework';
import { gist, Gists, render_gist_text } from '../../gist';
import { find_historical } from '../../history';
import { Puffer } from '../../puffer';
import { StaticIndex } from '../../static_resources';
import { bound_method, map, update } from '../../utils';
import { add_to_notes, Notes } from './notes';
import { ActionID, Puffers, resource_registry, Venience } from "./prelude";
import { capitalize } from '../../text_tools';
import { story_updater } from '../../text';


export type MemorySpec = {
    action: ActionID,
    could_remember: (w: Venience) => boolean,
    description: () => HTMLElement
}

declare module './prelude' {
    export interface StaticResources {
        memory_index: StaticIndex<MemorySpec>;
    }
}

declare module '../../gist' {
    export interface GistSpecs{
        'memory': { action: Gist<ActionID> };
    }
}


const action_index = resource_registry.get('action_index', false);

function memory_description(spec: MemorySpec) {
    const action = action_index.get(spec.action);
    return <div>
        <div class="interp">
            {spec.description()}
        </div>
        <br/>
        {capitalize(render_gist_text(gist(spec.action)))} confers:
        <blockquote>
            {action.description}
        </blockquote>
    </div>
}

export function make_memory(spec: MemorySpec): Puffer<Venience> {
    return {
        handle_command: (world, parser) => {
            if (world.has_acquired.get(spec.action) || !spec.could_remember(world)) {
                return parser.eliminate();
            }

            let result = parser.consume('remember_something', () => parser.submit());
            if (parser.failure) {
                return parser.failure;
            }

            let action = action_index.get(spec.action);

            return update(world,
                {
                    has_acquired: map([spec.action, true]),
                    gist: () => gist('memory', { action: gist(action.name)})
                },
                w => add_to_notes(w, spec.action),
                story_updater(<div>
                    You close your eyes, and hear Katya's voice:
                    {memory_description(spec)}
                </div>)
            );
        },
        post: (world2, world1) => {
            // weird workaround for when you get locked out. seems to work *shrugs*
            if (!spec.could_remember(world2)) {
                return world2;
            }

            world1 = find_historical(world1, w => w.owner === null)!;

            if (!spec.could_remember(world1)) {
                return update(world2,
                    story_updater({
                        prompt: <div>
                            You feel as though you might <strong>remember something...</strong>
                        </div>
                    })
                );
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

const memory_index = resource_registry.initialize('memory_index',
    new StaticIndex([
        function add_memory_to_puffers(spec) {
            Puffers(make_memory(spec));
            Notes({
                note_id: spec.action,
                description: () => memory_description(spec)
            });
            return spec;
        }
    ])
);

export const Memories = bound_method(memory_index, 'add');