/** @jsx createElement */
import { Stages, stages, stage_entries, map_stages } from './stages';
import { createElement } from './UIBuilder/UIBuilder';
import { World } from './world';
import { Updater, appender, map } from './utils';
import { update } from './update';
import { history_array } from './interpretation';


export const init_frame = (index: number) => <div className="frame eph-new" data-index={index}>
    <div className="action"></div>
    <div className="consequence"></div>
    <div className="description"></div>
    <div className="prompt"></div>
</div>;

export type FrameUpdate = {
    index: number,
    selector?: string,
    op: FrameUpdateOp
};

type CSSUpdates = {
    [class_name: string]: boolean;
};

export type FrameUpdateOp =
    | { kind: 'Add', elements: HTMLElement | HTMLElement[] }
    | { kind: 'CSS', updates: CSSUpdates }
    ;

// Note that the meaning of Story stages is different than that of StoryUpdates stages.
// Story stages are the frame indexes of each story frame.
export type Story = Stages<HTMLElement>;
// StoryUpdates stages are the groupings of updates for animation.
export type StoryUpdates = Stages<FrameUpdate[]>;

function add_child(parent: HTMLElement | null, child: HTMLElement) {
    child = child.cloneNode(true) as HTMLElement;
    child.classList.add('eph-new');
    if (parent !== null) {
        parent.appendChild(child);
    }
    return child;
}

export function apply_frame_update_op(elt: HTMLElement | null, op: FrameUpdateOp) {
    if (op.kind === 'Add') {
        if (elt === null) {
            if (op.elements instanceof Array) {
                throw new Error(`Tried to add a list of elements without a parent`);
            }
            return add_child(null, op.elements);
        } else {
            if (op.elements instanceof Array) {
                op.elements.forEach(e => add_child(elt, e));
            } else {
                add_child(elt, op.elements);
            }
            return elt;
        }
    } else if (op.kind === 'CSS') {
        if (elt === null) {
            throw new Error("Tried to update CSS for null element.");
        }
        for (const [cls, on] of Object.entries(op.updates)) {
            if (!on) {
                if (elt.classList.contains(cls)) {
                    elt.classList.remove(cls);
                    elt.classList.add(`eph-removing-${cls}`);
                }
            } else {
                if (!elt.classList.contains(cls)) {
                    elt.classList.add(cls);
                    elt.classList.add(`eph-adding-${cls}`);
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
        match.classList.forEach(class_name => {
            if (class_name.startsWith('eph-')) {
                match.classList.remove(class_name);
            }
        });
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
        const matches = result.querySelectorAll('[class*="eph-"]');

        matches.forEach(match => {
            match.classList.forEach(class_name => {
                if (class_name.startsWith('eph-')) {
                    match.classList.remove(class_name);
                }
            });
        });
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

export type TextAddSpec = {
    action?: HTMLElement | HTMLElement[]
    consequence?: HTMLElement | HTMLElement[]
    description?: HTMLElement | HTMLElement[]
    prompt?: HTMLElement | HTMLElement[]
}

export const make_text_additions = (index: number, spec: TextAddSpec) => {
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
        story_updates: stages([stage, appender(...make_text_additions(world.index, spec))])
    }) as W;

export const css_updater = <W extends World>(f: (w: W) => CSSUpdates) =>
    (world: W) => {
        const history = history_array(world);
        const css_updates: FrameUpdate[] = history.map(w => ({
            index: w.index,
            op: { kind: 'CSS', updates: f(w) }
        }));

        return update(world as World, {
            story_updates: stages([0, appender(...css_updates)])
        }) as W
    }
