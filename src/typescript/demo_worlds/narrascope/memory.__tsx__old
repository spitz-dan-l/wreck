import { gist, GistRendererRule, render_gist, Gists, GistRenderer, ValidTags } from 'gist';
import { find_historical } from '../../history';
import { Puffer } from '../../puffer';
import { StaticIndex } from '../../lib/static_resources';
import { createElement, story_updater, Fragment, Updates, apply_story_updates_all, Queries, compile_story_query } from '../../story';
import { capitalize } from '../../lib/text_utils';
import { bound_method, map, update } from '../../lib/utils';
import { add_to_notes, Notes } from './notes';
import { ActionID, Puffers, resource_registry, Venience } from "./prelude";


export type MemorySpec = {
    action: ActionID,
    could_remember: (w: Venience) => boolean,
    description: () => Fragment
}

declare module './prelude' {
    export interface StaticResources {
        memory_index: StaticIndex<MemorySpec>;
    }
}

declare module 'gist' {
    export interface StaticGistTypes{
        'memory about': { children: {
            subject: ValidTags
        } };
    }
}


const action_index = resource_registry.get('action_index', false);

function memory_description(spec: MemorySpec) {
    const action = action_index.get(spec.action);
    return <div>
        <div className="interp">
            {spec.description()}
        </div>
        <br/>
        {capitalize(render_gist.noun_phrase(gist(spec.action)))} confers:
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
                    gist: () => gist({ tag: 'memory about', children: { subject: action.id } }),
                    story_updates: story_updater(Updates.consequence(<div>
                        You close your eyes, and hear Katya's voice:
                        {memory_description(spec)}
                    </div>))
                },
                w => add_to_notes(w, spec.action)
            );
        },
        post: (world2, world1) => {
            // weird workaround for when you get locked out. seems to work *shrugs*
            if (!spec.could_remember(world2)) {
                return world2;
            }

            world1 = find_historical(world1, w => w.owner === null)!;

            if (!spec.could_remember(world1)) {
                const updated_story = apply_story_updates_all(world2.story, world2.story_updates);
                const existing_prompts = Updates.frame().has_class('prompt').children().to_query()(updated_story);
                if (existing_prompts.length === 0) {
                    return update(world2, {
                        story_updates: story_updater(Updates.prompt(<div>
                                You feel as though you might <strong>remember something...</strong>
                            </div>
                        ))
                    });
                }
            }
            return world2;
        }
    }
}

GistRenderer('Katya on', {
    noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {action}) => `Katya's words about ${action}`,
    },
    command_noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {action}) => ["Katya's_words about", action]
    }
});

GistRenderer('memory about', {
    noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {subject}) => `your memory of ${subject}`,
    },
    command_noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {subject}) => ['my_memory of', subject]
    }
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