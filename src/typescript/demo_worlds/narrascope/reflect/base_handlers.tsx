/*
    The inner actions: scrutinize, hammer, volunteer. Each is an Action with
    a default handler for when it is applied to a facet it does nothing to.
    Specific facet handlers live with the content (narrascope.tsx).
*/
import { child, gist, render_gist } from 'gist';
import { find_index } from 'history';
import { update } from 'lib/utils';
import { GAP, ParserThread, SUBMIT } from 'parser';
import { createElement } from 'story';
import { Action, action_consume_spec } from '../action';
import { ACTION_HANDLER_FALLTHROUGH_STAGE, ActionHandler, INNER_ACTION_IDS, lock_puffer, Puffers, Venience } from '../prelude';
import { get_facets } from './facet';
import { Exposition } from './inner_action';

// scrutinize
Action({
    id: 'scrutinize',
    render: {
        command_verb_phrase: g => ['scrutinize', GAP, render_gist.command_noun_phrase(child(g, 'facet'))]
    },

    memory_prompt: {
        noun_phrase: 'something focused',
        command_noun_phrase: 'something_focused'
    },

    description_noun_phrase: 'scrutiny',
    description_command_noun_phrase: 'scrutiny',

    description: "The ability to unpack details and look beyond your initial assumptions.",

    katya_quote: <div>
        "Look beyond your initial impressions, my dear. <strong>Scrutinize</strong>. Concern yourself with nuance."
    </div>,

    memory: <div>
        She mentioned this while making a point about the intricacies of the <a target="_blank" href="https://en.wikipedia.org/wiki/Observer_effect_(physics)">Observer Effect</a>.
    </div>
});

ActionHandler({ tag: 'scrutinize' },
    Exposition({
        commentary: (action, frame) => [
            frame.description(<div>There is nothing particular about {render_gist.noun_phrase(child(action, 'facet'))}</div>)
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE
);

// hammer
Action({
    id: 'hammer',
    render: {
        command_verb_phrase: g => ['hammer_against the_foundations_of', render_gist.command_noun_phrase(child(g, 'facet'))]
    },

    memory_prompt: {
        noun_phrase: 'something blasphemous',
        command_noun_phrase: 'something_blasphemous'
    },

    description_noun_phrase: 'the Hammer',
    description_command_noun_phrase: 'the_Hammer',

    description: "The act of dismantling one's own previously-held beliefs.",

    katya_quote: <div>
        "Take a <strong>hammer</strong> to your assumptions, my dear. If they are ill-founded, let them crumble."
    </div>,

    memory: <div>
        She always pushed you.
        <br />
        Katya was always one to revel in the overturning of wrong ideas.
    </div>
});

ActionHandler({ tag: 'hammer' },
    Exposition({
        commentary: (action, frame) => [
            frame.description(<div>Despite your attempts to dismantle {render_gist.noun_phrase(child(action, 'facet'))}, its foundation appears strong.</div>)
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE
);

// volunteer
Action({
    id: 'volunteer',
    render: {
        command_verb_phrase: g => ['volunteer to_foster', render_gist.command_noun_phrase(child(g, 'facet'))]
    },

    memory_prompt: {
        noun_phrase: 'something generous',
        command_noun_phrase: 'something_generous'
    },

    description_noun_phrase: 'the Volunteer',
    description_command_noun_phrase: 'the_Volunteer',

    description: "The offering of an active intervention in the world, to change it for the better.",

    katya_quote: <div>
        "Do more than merely receive and respond, my dear. We must participate, as best as we can. We must <strong>volunteer</strong> ourselves to the world."
    </div>,

    memory: <div>
        This is one of the last things she said to you, before she left.
    </div>
});

ActionHandler({ tag: 'volunteer' },
    Exposition({
        commentary: (action, frame) => [
            frame.description(<div>You don't feel as if a mere act of will could improve {render_gist.noun_phrase(child(action, 'facet'))}.</div>)
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE
);

// While reflecting, every acquired inner action can be applied to every facet.
Puffers(lock_puffer('Metaphor', {
    handle_command: (world, parser) => {
        if (world.current_interpretation === undefined) {
            return parser.eliminate();
        }
        const interp_world = find_index(world, world.current_interpretation)!;
        const facets = get_facets(world, interp_world);

        const threads: ParserThread<Venience>[] = [];
        for (const id of INNER_ACTION_IDS) {
            if (!world.has_acquired.get(id)) {
                continue;
            }
            for (const f of facets) {
                threads.push(() => {
                    const action = gist(id, { facet: f });
                    return (
                        parser.consume([action_consume_spec(action, world), SUBMIT], () =>
                        update(world, {
                            gist: () => action
                        }))
                    );
                });
            }
        }

        return parser.split(threads);
    }
}));
