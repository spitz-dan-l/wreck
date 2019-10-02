import { Stages, stages, stage_entries, map_stages } from './stages';
import { createElement } from './UI/framework/framework';
import { World } from './world';
import { Updater, append, map } from './utils';
import { update } from './update';
import { history_array } from './history';
import { Parsing } from './parser';
import { ParsedText } from './UI/components/parsed_text';


const empty_frame = <div className="frame">
    <div className="input-text" />
    <div className="output-text">
        <div className="action"></div>
        <div className="consequence"></div>
        <div className="description"></div>
        <div className="prompt"></div>
    </div>
</div> as HTMLElement;

export const init_frame = (index: number) => {
    const result = empty_frame.cloneNode(true) as HTMLElement;
    result.setAttribute('data-index', index.toString());
    return result;
};
// export const init_frame = (index: number) => <div className="frame" data-index={index}>
//     <div className="input-text" />
//     <div className="output-text">
//         <div className="action"></div>
//         <div className="consequence"></div>
//         <div className="description"></div>
//         <div className="prompt"></div>
//     </div>
// </div> as HTMLElement;

export type FrameUpdate = {
    index: number,
    selector?: string,
    op: FrameUpdateOp
};

export function frame_update(update: FrameUpdate) {
    return update;
}

type CSSUpdates = {
    [class_name: string]: boolean;
};

export type TextFragment = HTMLElement | string | TextFragmentArray;
interface TextFragmentArray extends Array<TextFragment> {};

export type FrameUpdateOp =
    | { kind: 'Add', elements: TextFragment }
    | { kind: 'CSS', updates: CSSUpdates }
    ;

export function add_op(elements: TextFragment) {
    return { kind: 'Add', elements } as const;
}

export function css_op(updates: CSSUpdates) {
    return { kind: 'CSS', updates } as const;
}

// Note that the meaning of Story stages is different than that of StoryUpdates stages.
// Story stages are the frame indexes of each story frame.
export type Story = Stages<HTMLElement>;
// StoryUpdates stages are the groupings of updates for animation.
export type StoryUpdates = Stages<FrameUpdate[]>;


let eph_effects = true;

export function with_eph_effects<R>(effects_on: boolean, f: () => R) {
    const prev = eph_effects;
    eph_effects = effects_on;
    const result = f();
    eph_effects = prev;
    return result;
}


function add_child(parent: HTMLElement | null, child: TextFragment) {
    if (child instanceof Array) {
        child.map(c => add_child(parent, c));
        return;
    }
    let c: Node;
    if (typeof child === 'string') {
        c = document.createTextNode(child);
    } else {
        c = child.cloneNode(true) as HTMLElement;    
    }

    if (eph_effects && c instanceof HTMLElement) {
        c.classList.add('eph-new');
    }
    if (parent !== null) {
        parent.appendChild(c);
    }
    return c;
}

export function apply_frame_update_op(elt: HTMLElement | null, op: FrameUpdateOp) {
    if (op.kind === 'Add') {
        if (elt === null) {
            if (typeof(op.elements) === 'string' || op.elements instanceof Array) {
                throw new Error(`Tried to add a string or list of elements without a parent`);
            }
            return add_child(null, op.elements) as HTMLElement;
        } else {
            add_child(elt, op.elements);
            return elt;
        }
    } else if (op.kind === 'CSS') {
        if (elt === null) {
            debugger;
            throw new Error("Tried to update CSS for null element.");
        }
        for (const [cls, on] of Object.entries(op.updates)) {
            if (!on) {
                if (elt.classList.contains(cls)) {
                    elt.classList.remove(cls);
                    if (eph_effects) {
                        elt.classList.add(`eph-removing-${cls}`);
                    }
                }
            } else {
                if (!elt.classList.contains(cls)) {
                    elt.classList.add(cls);
                    if (eph_effects) {
                        elt.classList.add(`eph-adding-${cls}`);
                    }
                }
            }
        }
        return elt;
    } else {
        throw new Error('Should not get here');
    }
}

export function apply_frame_update(story: Story, update: FrameUpdate) {
    let target_frame = story.get(update.index);

    let target_elt: HTMLElement | null;
    if (target_frame === undefined) {
        if (update.selector !== undefined) {
            debugger;
            throw new Error(`Tried to select an element from nonexistent index: ${update.index}. Selector: ${update.selector}`);
        }
        target_elt = null;
    } else {
        target_frame = target_frame.cloneNode(true) as HTMLElement;
        if (update.selector === undefined) {
            target_elt = target_frame;
        } else {
            target_elt = target_frame.querySelector(update.selector);   
        }
    }
        let updated = apply_frame_update_op(target_elt, update.op);

        if (target_frame === undefined) {
            target_frame = updated;
        }
        story.set(update.index, target_frame);
}

export function find_eph(elt: HTMLElement) {
    const sel = '[class*="eph-"]';
    const result = Array.from(elt.querySelectorAll(sel));
    if (elt.matches(sel)) {
        result.push(elt);
    }
    return result;
}

export function remove_eph(elt: HTMLElement) {
    const matches = find_eph(elt);

    matches.forEach(match => {
        const to_remove: string[] = [];
        match.classList.forEach(class_name => {
            if (class_name.startsWith('eph-')) {
                to_remove.push(class_name);
            }
        });
        for (let class_name of to_remove) {
            match.classList.remove(class_name);
        }
    });
}

export function remove_eph_story(story: Story) {
    // remove all css classes that contain "eph-" as a prefix.
    return map_stages(story, elt => {
        let match = find_eph(elt);
        if (match.length === 0) {
            return elt;
        }

        const result = elt.cloneNode(true) as HTMLElement;
        remove_eph(result);
        return result;
    });
}

export function apply_story_updates(story: Story, story_updates: StoryUpdates) {
    let result = stages(...story);

    for (const [stage, updates] of stage_entries(story_updates)) {
        updates.forEach(update => apply_frame_update(result, update));
        result = remove_eph_story(result);
    }
    return result;
}

// export type FrameUpdateSpec = {
//     index: number,
//     stage?: number,
//     selector?: string,
//     op: FrameUpdateOp
// }

// export function add_story_updates(...specs: FrameUpdateSpec[]) {
//     return <W extends World>(world: W) => {

//     };
// }

export type TextAddSpec = {
    action?: TextFragment
    consequence?: TextFragment
    description?: TextFragment
    prompt?: TextFragment
} | TextFragment;

export const make_text_additions = (index: number, spec: TextAddSpec) => {
    if (typeof spec === 'string' || spec instanceof Array || spec instanceof HTMLElement) {
        spec = {
            consequence: spec
        };
    }
    const result: FrameUpdate[] = [];
    for (const prop of ['action', 'consequence', 'description', 'prompt'] as const) {
        const elements = spec[prop];
        if (elements !== undefined) {
            result.push({
                index,
                selector: `.${prop}`,
                op: {
                    kind: 'Add',
                    elements
                }
            });
        }
    }
    return result;
}

export const story_updater = (spec: TextAddSpec, stage=0) =>
    <W extends World>(world: W) => update(world as World, {
        story_updates: stages([stage, append(...make_text_additions(world.index, spec))])
    }) as W;

export const css_updater = <W extends World>(f: (w: W) => CSSUpdates) =>
    (world: W) => {
        const history = history_array(world);
        const css_updates: FrameUpdate[] = history.flatMap(w => {
            const updates = f(w);

            if (Object.keys(updates).length === 0) {
                return [];
            }

            return [{
                index: w.index,
                op: { kind: 'CSS', updates: f(w) }
            }]
        });

        return update(world as World, {
            story_updates: stages([0, append(...css_updates)])
        }) as W
    }

export const add_input_text = (world: World, parsing: Parsing) => {
    return update(world, {
        story_updates: stages([0, append({
            index: world.index,
            selector: '.input-text',
            op: {
                kind: 'Add',
                elements: <ParsedText parsing={parsing} />
            }
        } as FrameUpdate)])
    });
}

/*
    TODO: experiment with better schemes for collecting story updates in a given frame

    Problem:
        We need to be able to organize groups of story updates in stages.
        We also need to be able to e.g.
            move all story updates pertaining to frame 7 from stage 0 to stage 1
            and have this apply to any future story updates made to frame 7 this tick.
    
    Change the data structure representing story updates?
    Or, develop more sophisticated operators for updating the current data structure?



*/

