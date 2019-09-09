/** @jsx createElement */
import Handlebars from 'handlebars';
import { Gist } from './gist';
import { LocalInterpretations } from './interpretation';
import { Stages, stage_entries } from './stages';
import { appender, map_values, update, Updater } from './utils';
import { World } from './world';

import { createElement } from './UIBuilder/UIBuilder';

const INITIAL_TEXT = <div className="eph-new">
    <div className="action"></div>
    <div className="consequence"></div>
    <div className="description"></div>
    <div className="prompt"></div>
</div>

export type TextInfo = {
    gist?: Gist,
    static_effects?: Record<string, boolean>,
    dynamic_effects?: Record<string, boolean>
};

export type Text = {
    kind: 'Text',
    action: Fragment[],
    consequence: Fragment[],
    description: Fragment[],
    prompt: Fragment[],
    info: TextInfo
};

export type Fragment = {
    kind: 'Fragment',
    element_type: string,
    text: string,
    children: Fragment[],
    info: TextInfo
};

export type History = Stages<Text>;


export type FragmentUpdate = {
    kind: 'FragmentUpdate',
    element_type?: string,
    text?: string,
    children?: Stages<FragmentUpdate>,
    info?: TextInfo
};

export type TextUpdate = {
    kind: 'TextUpdate',
    action?: Stages<FragmentUpdate>,
    consequence?: Stages<FragmentUpdate>,
    description?: Stages<FragmentUpdate>,
    prompt?: Stages<FragmentUpdate>,
    info?: TextInfo
}

export type HistoryUpdate = Stages<TextUpdate>;
export type HistoryUpdates = Stages<HistoryUpdate>;

export function apply_fragment_update(source: Fragment, fragment_update: FragmentUpdate) {
    const updater: Updater<Fragment> = {};

    for (const prop of ['element_type', 'text']) {
        if (fragment_update[prop] !== undefined) {
            updater[prop] = fragment_update[prop];
        }
    }

    if (fragment_update.info !== undefined) {
        updater.info = {...fragment_update.info};

        if (fragment_update.info.gist !== undefined) {
            updater.info.gist = () => fragment_update.info!.gist
        }
    }

    if (fragment_update.children !== undefined) {
        updater.children = (prev_children) => {
            const updated_children = [...prev_children];
            for (const [i, child_update] of stage_entries(fragment_update.children!)) {
                // TODO: check for index in bounds
                updated_children[i] = apply_fragment_update(updated_children[i], child_update);
            }
            return updated_children;
        };
    }

    return update(source, updater);
}

export function apply_text_update(source: Text, text_update: TextUpdate) {
    const updater: Updater<Text> = {};
    
    if (text_update.info !== undefined) {
        updater.info = {...text_update.info};

        if (text_update.info.gist !== undefined) {
            updater.info.gist = () => text_update.info!.gist
        }
    }

    for (const prop of ['action', 'consequence', 'description', 'prompt'] as const) {
        if (text_update[prop] !== undefined) {
            updater[prop] = (previous_fragments) => {
                const result = [...previous_fragments];
                for (const [i, fragment_update] of text_update[prop]!) {
                    // TODO: check i in bounds
                    result[i] = apply_fragment_update(result[i], fragment_update);
                }
                return result;
            }
        }
    }

    return update(source, updater);
}

export function apply_history_updates(previous: History, updates: HistoryUpdates) {
    let result = previous;
    for (const [stage, frame] of stage_entries(updates)) {
        for (const [index, text_update] of stage_entries(frame)) {
            let source = result.get(index);

            if (source === undefined) {
                // assert/check that text_update has all required fields in this case. if not, error.
                source = INITIAL_TEXT;
            }

            result.set(index, apply_text_update(source, text_update));
        }
    }

    return result;
}

// export const INITIAL_TEXT: Text = {
//     kind: 'Text',
//     action: [],
//     consequence: [],
//     description: [],
//     prompt: [],
//     info: {}
// };

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

// export let message_updater = (spec: MessageUpdateSpec) => ({
//     message: (orig_message: Message) => {
//         if (is_fragment(spec)) {
//             return update(orig_message, {
//                 consequence: appender(spec)
//             });
//         }

//         let updater: Updater<Message> = {};
//         for (let prop of ['action', 'consequence', 'description', 'prompt'] as const) {
//             if (spec[prop] !== undefined && spec[prop]!.length > 0) {
//                 updater[prop] = appender(...spec[prop]!);
//             }
//         }

//         return update(orig_message, updater);
//     }
// });

export type Renderer = (world: World, labels?: LocalInterpretations, possible_labels?: LocalInterpretations) => string;

export let render_message: Renderer = function(world: World, labels: LocalInterpretations = {}): string {
    const template = (['action', 'consequence', 'description', 'prompt'] as const)
        .map(f => world.message[f])
        .filter(x => x.length > 0)
        .map(x => x.join('<br/>'))
        .join('<br/>');
    return Handlebars.compile(template)(
        map_values(labels, i => !!i.value),
        { data: { world: world } },
    );
}

export const register_helper = (name: string, fn: Handlebars.HelperDelegate) => {
    if (name in Handlebars.helpers) {
        throw new Error('Tried to register helper with duplicate name: ' + name);
    }
    return Handlebars.registerHelper(name, fn);
}
