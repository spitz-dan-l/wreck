/*
    The notebook: the player's notes about every action they have learned.
*/
import { gist, Gist, render_gist } from 'gist';
import { stages } from 'lib/stages';
import { capitalize } from 'lib/text_utils';
import { update } from 'lib/utils';
import { GAP, ParserThread } from 'parser';
import { createElement, lookup_or_throw, story_updater, Updates as S } from 'story';
import { Action, action_consume_spec, action_description } from './action';
import { ACTION_IDS, ActionHandler, Venience } from './prelude';

Action({
    id: 'notes',

    render: {
        noun_phrase: g => g.children?.subject !== undefined
            ? `your notes about ${render_gist.noun_phrase(g.children.subject)}`
            : 'your notes',
        command_noun_phrase: g => g.children?.subject !== undefined
            ? ['my_notes', GAP, 'about', render_gist.command_noun_phrase(g.children.subject)]
            : 'my_notes',
        command_verb_phrase: g => g.children?.subject !== undefined
            ? ['notes', GAP, 'about', render_gist.command_noun_phrase(g.children.subject)]
            : 'notes'
    },

    memory_prompt: {
        noun_phrase: 'something scholarly',
        command_noun_phrase: 'something_scholarly'
    },

    description_noun_phrase: 'note taking',
    description_command_noun_phrase: 'note_taking',

    description: 'The ability to externalize knowledge for later use. Your notebook contains everything you have seen fit to write down.',
    katya_quote: '"Write that down, my dear."',
    memory: <div>
        Even before you met her, you wrote. Putting your thoughts to the page elevated them for you, made them meaningful.
    </div>,

    puffer: {
        handle_command: stages(
            [3, (world, parser) => {
                const actions: Gist[] = [gist('notes')];
                for (const id of ACTION_IDS) {
                    if (world.has_acquired.get(id)) {
                        actions.push(gist('notes', { subject: action_description(id) }));
                    }
                }

                const threads: ParserThread<Venience>[] = actions.map(action => () =>
                    parser.consume(action_consume_spec(action, world), () =>
                    parser.submit(() =>
                    update(world, {
                        gist: () => action
                    })))
                );

                return parser.split(threads);
            }]
        ),

        // Whenever an action is acquired, the player writes about it.
        post: stages(
            [1, (world2, world1) => {
                let result = world2;
                for (const id of ACTION_IDS) {
                    if (!world1.has_acquired.get(id) && world2.has_acquired.get(id)) {
                        result = prompt_to_notes(result, id);
                    }
                }
                return result;
            }]
        )
    }
});

export function prompt_to_notes(world: Venience, id: (typeof ACTION_IDS)[number]): Venience {
    return update(world, {
        story_updates: story_updater(
            S.prompt(<div>
                You write about {render_gist.noun_phrase(action_description(id))} in your <strong>notes</strong>.
            </div>)
        )
    });
}

// "notes": list everything written down.
ActionHandler({ tag: 'notes', children: { subject: null } }, () => (world) =>
    update(world, {
        story_updates: story_updater(S.description(<div>
            You have written down notes about the following:
            {ACTION_IDS
                .filter(id => !!world.has_acquired.get(id))
                .map(id => <blockquote>
                    {capitalize(render_gist.noun_phrase(action_description(id)))}
                </blockquote>)}
            </div>
        ))
    })
);

// "notes about X": reread the notes on one action.
ActionHandler({ tag: 'notes', children: { subject: { tag: 'action description' } } }, (action) => (world) =>
    update(world, {
        story_updates: story_updater(
            S.description(lookup_or_throw(world.knowledge, action))
        )
    })
);
