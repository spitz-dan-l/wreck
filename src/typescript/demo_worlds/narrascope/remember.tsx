import { bottom_up, Gist, gist, render_gist, ValidTags, Gists, GistRenderer } from "gist";
import { append, map, update } from 'lib/utils';
import { createElement, story_updater, Updates as S } from 'story';
import { Action, ActionHandler, action_consume_spec } from "./action";
import { resource_registry, Venience } from './prelude';
import { insight_text_class } from './styles';
import { GAP, SUBMIT } from "parser";


interface Memories {
    could_remember: Gist[];
}

declare module './prelude' {
    export interface Venience extends Memories {
    }

    export interface StaticResources {
        initial_world_memories: Memories
    }

    export interface StaticActionGistTypes {
        remember: [{ subject: ValidTags }];
    }
}

declare module 'gist' {
    export interface StaticGistTypes {
        'memory prompt': [{ memory: 'remember' }];
    }
}

resource_registry.initialize('initial_world_memories', {
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
        command_verb_phrase: (g) => ['remember', GAP, render_gist.command_noun_phrase(['memory prompt', {memory: g}])]
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

            return parser.split(world.could_remember.map((memory, i) => () => {
            // const memory = world.could_remember[0];
                const action_gist = gist('remember', {subject: memory});
                return (
                    parser.consume([action_consume_spec(action_gist, world), SUBMIT], () =>
                    update(world, {
                        gist: () => action_gist,
                        could_remember: _ => { const r = [..._]; r.splice(i, 1); return r }
                    }))
                );
            }));
        }
    }
});

ActionHandler(['remember'], (action_gist) => (world) =>
    update(world, {
        story_updates: story_updater(
            S.description(world.knowledge.get_exact(action_gist)!)
        )
    })
);

GistRenderer(['memory prompt'], {
    noun_phrase: (g) => 'something',
    command_noun_phrase: (g) => 'something'
}, 5);

export function make_memory_available(subject_gist: Gist) {
    return (world: Venience) =>  {
        const memory_gist: Gists['remember'] = ['remember', {subject: subject_gist}];

        const memory_prompt = <div>
            You feel as though you might <strong>remember {render_gist.noun_phrase(['memory prompt', {memory: memory_gist}])}</strong>...
        </div>
    
        return update(world, {
            could_remember: append(subject_gist),
            story_updates: story_updater(
                S.prompt(memory_prompt)
            )
        });
        
    };
}
