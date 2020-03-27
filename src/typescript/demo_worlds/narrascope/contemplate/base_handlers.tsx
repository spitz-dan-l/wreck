import { createElement } from 'story'
import { Action, ActionHandler } from "../action";
import { Exposition, INNER_ACTION_IDS } from "./inner_action";
import { render_gist, gist } from "gist";
import { Puffers, lock_and_brand, Venience } from '../prelude';
import { keys, update } from 'lib/utils';
import { get_facets } from '../facet';
import { find_historical } from 'history';
import { ParserThread } from 'parser';

// scrutinize
Action({
    id: 'scrutinize',
    render_impls: {
        command_verb_phrase: {
            order: 'BottomUp',
            impl: (tag, {facet}) => ['scrutinize', facet]
        }
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

ActionHandler('scrutinize', Exposition({
    commentary: (action, frame) => [
        frame.description('There is nothing particular about ' + render_gist.noun_phrase(action.children.facet))
    ]
}));

// hammer
Action({
    id: 'hammer',
    render_impls: {
        command_verb_phrase: {
            order: 'BottomUp',
            impl: (tag, {facet}) => ['hammer_against the_foundations_of', facet]
        }
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

ActionHandler('hammer', Exposition({
    commentary: (action, frame, world) => [
        frame.description(`Despite your attempts to dismantle ${render_gist.noun_phrase(action.children.facet)}, its foundation appears strong.`)
    ]
}));

// volunteer
Action({
    id: 'volunteer',
    render_impls: {
        command_verb_phrase: {
            order: 'BottomUp',
            impl: (tag, {facet}) => ['volunteer to_foster', facet]
        }
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

ActionHandler('volunteer', Exposition({
    commentary: (action, frame, world) => [
        frame.description(`You don't feel as if a mere act of will could improve ${render_gist.noun_phrase(action.children.facet)}.`)
    ]
}));


// The inner action command handler.
// All special behavior will come from ActionHandler rules on specific action/facet combinations.
// Hence
Puffers(lock_and_brand('Metaphor', {
    handle_command: (world, parser) => {
        const interp_world = find_historical(world, w => w.index === world.current_interpretation!)!;
        const observable_facets = get_facets(world, interp_world.gist!)
        
        const threads: ParserThread<Venience>[] = [];
        for (const action of keys(INNER_ACTION_IDS)) {
            if (!world.has_acquired.get(action)) {
                continue;
            }
            for (const facet of observable_facets) {
                threads.push(() => {
                    const action_gist = gist(action, { facet });
                    return (
                        parser.consume(render_gist.command_verb_phrase(action_gist), () =>
                        parser.submit(() =>
                        update(world, {
                            gist: () => action_gist
                        }))));
                })
            }
        }

        return parser.split(threads);
    }
}));

