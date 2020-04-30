import { bottom_up, EMPTY, gist, Gists, PositiveMatchResult, render_gist } from 'gist';
import { stages } from '../../lib/stages';
import { capitalize } from '../../lib/text_utils';
import { update } from '../../lib/update';
import { if_not_null_array, keys } from '../../lib/utils';
import { ParserThread, GAP } from '../../parser';
import { createElement, story_updater, Updates as S } from '../../story';
import { Action, ActionHandler, action_consume_spec } from './action';
import { STATIC_ACTION_IDS, Venience } from './prelude';

declare module './prelude' {
    export interface StaticActionGistTypes {
        notes: [{ subject?: 'action description' }];
    }
}

declare const nn: PositiveMatchResult<['notes']>;

Action({
    id: 'notes',

    render_impls: {
        noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => 'your notes' + subject !== undefined ? ` about ${subject}` : '',
            render_gist.noun_phrase
        ),
        command_noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => ['my_notes', GAP, ...if_not_null_array(subject, (t) => ['about', t] as const)],
            render_gist.command_noun_phrase
        ),
        command_verb_phrase: g => bottom_up(g)(
            (tag, {subject}) => ['notes', GAP, ...if_not_null_array(subject, (t) => ['about', t] as const)],
            render_gist.command_noun_phrase
        )
    },

    memory_prompt_impls: {
        noun_phrase: () => 'something scholarly',
        command_noun_phrase: () => 'something_scholarly'
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
                if (!world.has_acquired.get('notes')) {
                    return parser.eliminate();
                }
    
                const action_gists: Gists['notes'][] = []
    
                action_gists.push(gist('notes'));
    
                for (const subject of keys(STATIC_ACTION_IDS)) {
                    if (!!world.has_acquired.get(subject)) {
                        const subject_gist = gist('action description', undefined, {action: subject});
                        const action_gist = gist('notes', {subject: subject_gist});
                        action_gists.push(action_gist);
                    }
                }
    
                const threads: ParserThread<Venience>[] = action_gists.map(ag => () =>
                    parser.consume(action_consume_spec(ag, world), () =>
                    parser.submit(() =>
                    update(world, {
                        gist: () => ag
                    })))
                );
    
                return parser.split(threads);
            }]
        ),
    
        post: stages(
            [1, (world2, world1) => {
                let result = world2;
                for (const action_id of keys(STATIC_ACTION_IDS)) {
                    if (!world1.has_acquired.get(action_id) && world2.has_acquired.get(action_id)) {
                        result = prompt_to_notes(result, gist('action description', undefined, { action: action_id }));
                    }
                }
                return result;
            }]
        )
    }
});

export function prompt_to_notes(world: Venience, action_descr: Gists['action description']) {
    return update(world, {
        story_updates: story_updater(
            S.prompt(<div>
                You write about {render_gist.noun_phrase(action_descr)} in your <strong>notes</strong>.
            </div>)
        )
    });
}

ActionHandler(['notes', { subject: [EMPTY] }], (action) => (world) =>
    update(world, {
        story_updates: story_updater(S.description(<div>
            You have written down notes about the following:
            {keys(STATIC_ACTION_IDS)
                .filter(n => !!world.has_acquired.get(n))
                .map(n => <blockquote>
                    {capitalize(render_gist.noun_phrase(gist('action description', undefined, {action: n})))}
                </blockquote>)}
            </div>
        ))
    })
);

ActionHandler(['notes', { subject: ['action description'] }], (action) => (world) =>
    update(world, {
        story_updates: story_updater(
            S.description(world.knowledge.get_exact(action)!)
        )
    })
);