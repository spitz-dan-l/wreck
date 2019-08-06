import Handlebars from 'handlebars';
import { World } from './world';
import { appender, update, Updater, merge_objects, drop_keys, map_values } from './utils';
import { InterpretationLabel, LocalInterpretations, label_value } from './interpretation';

/*
    Message is comprised of (any of)

    - Immediate narrative description of action
    - Immediate narrative description of consequence
    - Idle descriptions of world state
    - Prompts for player action

    One issue with the above is that it could threaten "poetic flow",
    by regimenting out the form of the output messages too much.
        I think this has to be an experiment that gets done though.
        Poetic flow also threatens systematicity of world.
        We need to find a way for them to coexist.

    Another issue with the above: it presuposes that the player took an action
        What about "inventory"? Which of the above four facets does the list of your stuff
        go in?
        Answer: "Idle descriptions of world state"? Haha I dunno

*/

// A Fragment is any string. If it is a Mustache template, it will have the current
// interpretation tags used to render it for display.
export type Fragment = string;

export type Message = {
    kind: 'Message',
    action: Fragment[],
    consequence: Fragment[],
    description: Fragment[],
    prompt: Fragment[]
};

export const INITIAL_MESSAGE: Message = {
    kind: 'Message',
    action: [],
    consequence: [],
    description: [],
    prompt: []
};

export type MessageUpdateSpec =
    Fragment | 
    {
        action?: Fragment[],
        consequence?: Fragment[],
        description?: Fragment[],
        prompt?: Fragment[]
    };

function is_fragment(spec: MessageUpdateSpec): spec is Fragment {
    return typeof spec === 'string';
}

export let message_updater = (spec: MessageUpdateSpec) => ({
    message: (orig_message: Message) => {
        if (is_fragment(spec)) {
            return update(orig_message, {
                consequence: appender(spec)
            });
        }

        let updater: Updater<Message> = {};
        for (let prop of ['action', 'consequence', 'description', 'prompt', 'css_rules'] as const) {
            if (spec[prop] !== undefined && spec[prop]!.length > 0) {
                updater[prop] = appender(...spec[prop]!);
            }
        }

        return update(orig_message, updater);
    }
});

export type Renderer = (world: World, labels?: LocalInterpretations, possible_labels?: LocalInterpretations) => string;

// export let standard_render2: Renderer = function(world: World, labels: LocalInterpretations = {}, possible_labels: LocalInterpretations = {}): string {
//     return (['action', 'consequence', 'description', 'prompt'] as const)
//         .map(f => world.message[f])
//         .filter(x => x.length > 0)
//         .map(x => x.map(f => Mustache.render(f,
//             Object.entries(labels).reduce((obj, [lab, val]) => ({...obj, [lab]: val.value}), <LocalInterpretations>{})
//         )).join('<br/>'))
//         .join('<br/>');
// }

export let standard_render: Renderer = function(world: World, labels: LocalInterpretations = {}, possible_labels: LocalInterpretations = {}): string {
    const template = (['action', 'consequence', 'description', 'prompt'] as const)
        .map(f => world.message[f])
        .filter(x => x.length > 0)
        .map(x => x.join('<br/>'))
        .join('<br/>');
    return Handlebars.compile(template)({
        ...map_values(labels, i => !!i.value),
        '@world': world,
    });
}