import * as Mustache from 'mustache';
import { InterpretationLabel, World, Renderer } from './world';
import { appender, update, Updater } from './utils';

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

export let message_updater = (spec: MessageUpdateSpec) =>
    (orig_message: Message) => {
        if (is_fragment(spec)) {
            return update(orig_message, {
                consequence: appender(spec)
            });
        }

        let updater: Updater<Message> = {};
        for (let prop of ['action', 'consequence', 'description', 'prompt'] as const) {
            if (spec[prop] !== undefined && spec[prop].length > 0) {
                updater[prop] = appender(...spec[prop]);
            }
        }

        return update(orig_message, updater);
    }

export function filter_for_render(world: World) {
    let result = {...world};

    for (let k of ['parsing', 'previous', 'index', 'interpretations', 'message', 'interpretation_receptors']) {
        delete result[k];
    }

    return result;
}

export let standard_render: Renderer;
standard_render = function(world: World, labels: InterpretationLabel[] = [], possible_labels: InterpretationLabel[] = []): string {
    return (['action', 'consequence', 'description', 'prompt'] as const)
        .map(f => world.message[f])
        .filter(x => x.length > 0)
        .map(x => x.map(f => Mustache.render(f,
            labels.reduce((obj, lab) => ({...obj, [lab]: true}), filter_for_render(world))
        )).join(' '))
        .join('<br/><br/>');
}

// find interp labels inside any message fragments
export function infer_fragment_labels(f: Fragment): InterpretationLabel[] {
    let extract_labels = (tokens: any[]): InterpretationLabel[] =>
        tokens.flatMap(token => {
            switch (token[0]) {
                case '#':
                case '^':
                    return [token[1], ...extract_labels(token[4])];
                default:
                    return [];
            }
        });
    
    let parsed = Mustache.parse(f);

    return extract_labels(parsed);
}

export let infer_message_labels = (m: Message): InterpretationLabel[] =>
    (['action', 'consequence', 'description', 'prompt'] as const)
        .flatMap(prop => m[prop].flatMap(infer_fragment_labels));
