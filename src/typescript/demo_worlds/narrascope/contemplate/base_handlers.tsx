import { bottom_up, gist, Gist, render_gist, Gists } from "gist";
import { find_historical } from 'history';
import { keys, update } from 'lib/utils';
import { ParserThread } from 'parser';
import { createElement } from 'story';
import { Action, ActionHandler, action_consume_spec, ACTION_HANDLER_FALLTHROUGH_STAGE } from "../action";
import { get_facets } from '../facet';
import { lock_and_brand, Puffers, Venience } from '../prelude';
import { Exposition, INNER_ACTION_IDS } from "./inner_action";

// scrutinize
Action({
    id: 'scrutinize',
    render_impls: {
        command_verb_phrase: (g) => bottom_up(g)(
            (tag, {facet}) => ['scrutinize', facet],
            render_gist.command_verb_phrase
        )
    },

    memory_prompt_impls: {
        noun_phrase: g => 'something focused',
        command_noun_phrase: g => 'something_focused'
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

ActionHandler(['scrutinize'], 
    Exposition({
        commentary: (action, frame) => [
            frame.description('There is nothing particular about ' + render_gist.noun_phrase(action[1].facet))
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE
);

// hammer
Action({
    id: 'hammer',
    render_impls: {
        command_verb_phrase: (g) => bottom_up(g)(
            (tag, {facet}) => ['hammer_against the_foundations_of', facet],
            render_gist.command_verb_phrase
        )
    },

    memory_prompt_impls: {
        noun_phrase: g => 'something blasphemous',
        command_noun_phrase: g => 'something_blasphemous'
    },

    description_noun_phrase: 'the Hammer',
    description_command_noun_phrase: 'the Hammer',

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

ActionHandler(['hammer'],
    Exposition({
        commentary: (action, frame, world) => [
            frame.description(`Despite your attempts to dismantle ${render_gist.noun_phrase(action[1].facet)}, its foundation appears strong.`)
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE    
);

// volunteer
Action({
    id: 'volunteer',
    render_impls: {
        command_verb_phrase: (g) => bottom_up(g)(
            (tag, {facet}) => ['volunteer to_foster', facet],
            render_gist.command_verb_phrase
        )
    },

    memory_prompt_impls: {
        noun_phrase: g => 'something generous',
        command_noun_phrase: g => 'something_generous'
    },

    description_noun_phrase: 'the Volunteer',
    description_command_noun_phrase: 'the Volunteer',

    description: "The offering of an active intervention in the world, to change it for the better.",

    katya_quote: <div>
        "Do more than merely receive and respond, my dear. We must participate, as best as we can. We must <strong>volunteer</strong> ourselves to the world."
    </div>,

    memory: <div>
        This is one of the last things she said to you, before she left.
    </div>
});

ActionHandler(['volunteer'],
    Exposition({
        commentary: (action, frame, world) => [
            frame.description(`You don't feel as if a mere act of will could improve ${render_gist.noun_phrase(action[1].facet)}.`)
        ]
    }),
    ACTION_HANDLER_FALLTHROUGH_STAGE    
);


// The inner action command handler.
// All special behavior will come from ActionHandler rules on specific action/facet combinations.
// Hence
Puffers(lock_and_brand('Metaphor', {
    handle_command: (world, parser) => {
        const interp_world = find_historical(world, w => w.index === world.current_interpretation!)!;
        const observable_facets = get_facets(world, interp_world.gist!)
        
        const threads: ParserThread<Venience>[] = [];
        // for_each_entries(INNER_ACTION_IDS, ([action]) => {
        //     if (!world.has_acquired.get(action)) {
        //         return;
        //         //continue;
        //     }
        //     for (const facet of observable_facets) {
        //         threads.push(() => {
        //             // const action_gist = gist(action, { facet });
        //             const action_gist = gist([action, { facet }] as {
        //                 [T in typeof action]: GistDSL[T]
        //             }[typeof action]);
        //             return (
        //                 parser.consume(action_consume_spec(action_gist, world), () =>
        //                 parser.submit(() =>
        //                 update(world, {
        //                     gist: () => action_gist
        //                 })))
        //             );
        //         })
        //     }
        // });
        for (const action of keys(INNER_ACTION_IDS)) {
            if (!world.has_acquired.get(action)) {
                continue;
            }
            for (const facet of observable_facets) {
                threads.push(() => {
                    const action_gist = [action, { facet }] as Gists[typeof action];
                    return (
                        parser.consume(
                            action_consume_spec(action_gist, world), () =>
                        parser.submit(() =>
                        update(world, {
                            gist: () => action_gist
                        })))
                    );
                })
            }
        }

        return parser.split(threads);
    }
}));

