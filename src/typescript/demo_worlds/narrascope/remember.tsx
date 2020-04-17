import {createElement, story_updater, Updates as S} from 'story';
import { ValidTags, Gist, gist, bottom_up, render_gist } from "gist";
import { Action, action_consume_spec, ActionHandler } from "./action";
import { insight_text_class } from './styles';
import { resource_registry, Venience } from './prelude';
import { update, append } from 'lib';


interface Memory {
    could_remember: Gist[];
}

declare module './prelude' {
    export interface Venience extends Memory {
    }

    export interface StaticResources {
        initial_world_memory: Memory
    }

    export interface StaticActionGistTypes {
        remember: [{ subject: ValidTags }];
    }
}

resource_registry.initialize('initial_world_memory', {
    could_remember: []
});

Action({
    id: 'remember',
    render_impls: {
        noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => 'your memory of ' + subject,
            render_gist.noun_phrase
        ),
        command_noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => ['my_memory of', subject],
            render_gist.command_noun_phrase
        ),
        command_verb_phrase: () => 'remember_something'
    },

    description_noun_phrase: 'memory',
    description_command_noun_phrase: 'memory',
    description: "The ability to recall your previous experiences.",

    katya_quote: `"Our memories tell us about ourselves as much as they do about the past, my dear."`,
    memory: <div>
        She continued: <span className={insight_text_class}>
            "What your mind saw fit to remember reveals something deeper: What it saw fit to forget."
        </span>
    </div>,

    puffer: {
        handle_command: (world, parser) => {
            if (world.could_remember.length === 0) {
                return parser.eliminate();
            }

            const action_gist = gist('remember', {subject: world.could_remember[0]});
            return (
                parser.consume(action_consume_spec(action_gist, world), () =>
                parser.submit(() =>
                update(world, {
                    gist: () => action_gist,
                    could_remember: _ => _.slice(1)
                })))
            );
        }
    }
});

ActionHandler(['remember'], (action_gist) => (world) =>
    update(world, {
        story_updates: story_updater(
            S.description(world.knowledge.get(action_gist)!)
        )
    })
);

export function make_memory_available(world: Venience, subject_gist: Gist) {
    return update(world, {
        could_remember: append(subject_gist),
        story_updates: story_updater(
            S.prompt(<div>You feel as though you might <strong>remember something...</strong></div>)
        )
    });
}
