/*
    Remembering: recalling one of Katya's lessons, which teaches an action.
    Memories become available as the puzzle progresses.
*/
import { child, gist, Gist, GistRenderer, render_gist } from 'gist';
import { update } from 'lib/utils';
import { GAP, SUBMIT } from 'parser';
import { createElement, lookup_or_throw, story_updater, Updates as S } from 'story';
import { Action, action_consume_spec } from './action';
import { ActionHandler, Venience } from './prelude';
import { insight_text_class } from './styles';

Action({
    id: 'remember',
    render: {
        noun_phrase: g => `your memory of ${render_gist.noun_phrase(child(g, 'subject'))}`,
        command_noun_phrase: g => ['my_memory of', render_gist.command_noun_phrase(child(g, 'subject'))],
        command_verb_phrase: g => ['remember', GAP, render_gist.command_noun_phrase(gist('memory prompt', { memory: g }))]
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
                const action = gist('remember', { subject: memory });
                return (
                    parser.consume([action_consume_spec(action, world), SUBMIT], () =>
                    update(world, {
                        gist: () => action,
                        could_remember: _ => _.filter((m, j) => j !== i)
                    }))
                );
            }));
        }
    }
});

ActionHandler({ tag: 'remember' }, (action) => (world) =>
    update(world, {
        story_updates: story_updater(
            S.description(lookup_or_throw(world.knowledge, action))
        )
    })
);

// The vague prompt, when an action doesn't have its own: "remember something".
GistRenderer({ tag: 'memory prompt' }, {
    noun_phrase: () => 'something',
    command_noun_phrase: () => 'something'
}, 5);

export function make_memory_available(subject: Gist) {
    return (world: Venience): Venience => {
        const memory = gist('remember', { subject });
        return update(world, {
            could_remember: _ => [..._, subject],
            story_updates: story_updater(
                S.prompt(<div>
                    You feel as though you might <strong>remember {render_gist.noun_phrase(gist('memory prompt', { memory }))}</strong>...
                </div>)
            )
        });
    };
}
