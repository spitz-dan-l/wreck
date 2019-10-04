import { Stages, stages, stage_entries, map_stages } from '../stages';
import { createElement, StoryNode, Fragment } from './story';
import { World } from '../world';
import { Updater, append, map } from '../utils';
import { update } from '../update';
import { history_array } from '../history';
import { Parsing } from '../parser';
import { ParsedText } from '../UI/components/parsed_text';

export type StoryUpdate = {
    selector: string,
    op: StoryUpdateOp
};

export function frame_update(update: StoryUpdate) {
    return update;
}

type CSSUpdates = {
    [class_name: string]: boolean;
};

export type TextFragment = HTMLElement | string | TextFragmentArray;
interface TextFragmentArray extends Array<TextFragment> {};

export type StoryUpdateOp =
    | { kind: 'Add', elements: TextFragment }
    | { kind: 'CSS', updates: CSSUpdates }
    ;

export function add_op(elements: TextFragment) {
    return { kind: 'Add', elements } as const;
}

export function css_op(updates: CSSUpdates) {
    return { kind: 'CSS', updates } as const;
}

export type Story = StoryNode;
// StoryUpdates stages are the groupings of updates for animation.
export type StoryUpdates = Stages<StoryUpdate[]>;

/*
    Implement story updates both on StoryNodes, and on DOM ?
*/

let eph_effects = true;

export function with_eph_effects<R>(effects_on: boolean, f: () => R) {
    const prev = eph_effects;
    eph_effects = effects_on;
    const result = f();
    eph_effects = prev;
    return result;
}

function add_child_mut(parent: HTMLElement, child: TextFragment): void {
    if (child instanceof Array) {
        child.map(c => add_child_mut(parent, c));
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
    parent.appendChild(c);
    return;
}

function add_child(parent: StoryNode, child: Fragment) {
    if (eph_effects) {

    }
    return update(parent, {
        children: append(child)
    });
}

export function apply_story_update_op(elt: HTMLElement, op: StoryUpdateOp) {
    if (op.kind === 'Add') {
        return add_child(elt, op.elements);
    } else if (op.kind === 'CSS') {
        elt = elt.cloneNode(true) as HTMLElement;
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

export function apply_story_update(story: Story, update: StoryUpdate) {
    story = story.cloneNode(true) as Story;
    
    let target_elt: HTMLElement | null;
    target_elt = story.querySelector(update.selector);   
    
    if (target_elt === null) {
        throw new Error('StoryUpdate had bad selector: '+update.selector);
    }

    target_elt.replaceWith(apply_story_update_op(target_elt, update.op));

    return story;
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
    elt = elt.cloneNode(true) as HTMLElement;
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
    return elt;
}

export function apply_story_updates(story: Story, story_updates: StoryUpdates) {
    let result = story.cloneNode(true) as Story;

    for (const [stage, updates] of stage_entries(story_updates)) {
        updates.forEach(update => apply_story_update(result, update));
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
    const result: StoryUpdate[] = [];
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
        const css_updates: StoryUpdate[] = history.flatMap(w => {
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
        } as StoryUpdate)])
    });
}

const empty_frame = <div className="frame" dataset={{buh: 3}}>
    <div className="input-text" />
    <div className="output-text">
        <div className="action"></div>
        <div className="consequence"></div>
        <div className="description"></div>
        <div className="prompt" style="buh"></div>
    </div>
</div>;

export const init_frame = (index: number) => {
    return update(empty_frame, {
        dataset: { index }
    });
};
