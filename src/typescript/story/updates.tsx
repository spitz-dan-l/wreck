import { Stages, stages, stage_entries, map_stages } from '../stages';
import { createElement, StoryNode, Fragment, is_story_node, replace_in } from './story';
import { World } from '../world';
import { Updater, append, map } from '../utils';
import { update } from '../update';
import { history_array } from '../history';
import { Parsing } from '../parser';
import { ParsedText } from '../UI/components/parsed_text';
import { StoryQuerySpec, StoryQueryIndex, build_query } from './story_query';

export type StoryUpdate = {
    query: StoryQuerySpec,
    op: StoryUpdateOp
};

export function story_update(update: StoryUpdate) {
    return update;
}

type CSSUpdates = {
    [class_name: string]: boolean;
};

export type AddOp = {
    kind: 'Add';
    elements: Fragment[];
};

export type RemoveOp = {
    kind: 'Remove';
};

type CSSOp = {
    kind: 'CSS';
    updates: CSSUpdates;
};

export type StoryUpdateOp =
    | AddOp
    | RemoveOp
    | CSSOp
    ;

export function add_op(elements: Fragment[]): AddOp {
    return { kind: 'Add', elements };
}

export function remove_op(): RemoveOp {
    return { kind: 'Remove' };
}

export function css_op(updates: CSSUpdates): CSSOp {
    return { kind: 'CSS', updates };
}

export type Story = StoryNode & { __brand: 'Story' };
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

function add_child(parent: StoryNode, child: Fragment | Fragment[]): StoryNode {
    if (child instanceof Array) {
        return child.reduce<StoryNode>((p, c) => add_child(p, c), parent);
    }

    if (eph_effects && is_story_node(child)){
        child = update(child, {
            classes: { ['eph-new']: true }
        });
    }
    return update(parent, {
        children: append(child)
    });
}

export function apply_story_update_op(elt: StoryNode, op: StoryUpdateOp) {
    if (op.kind === 'Add') {
        return add_child(elt, op.elements);
    } else if (op.kind === 'CSS') {
        const updates = {...op.updates};
        if (eph_effects) {
            for (const [cls, on] of Object.entries(updates)) {
                if (!!on !== !!elt.classes[cls]) {
                    updates[`eph-${on ? 'adding' : 'removing'}-$cls`] = true;
                }
            }
        }
        
        return update(elt, {
            classes: updates
        });        
    } else {
        throw new Error('Should not get here');
    }
}

export function apply_story_update(story: Story, story_update: StoryUpdate) {
    const query = build_query(story_update.query);
    const targets = query(story);

    if (targets.length === 0) {
        throw new Error('StoryUpdate query returned no matches: '+JSON.stringify(story_update.query));
    }

    // sort in descending order of path length.
    // this guarantees that no parent will be updated before its children
    targets.sort(([,path1], [,path2]) => path2.length - path1.length);

    // TODO this is slightly more complicated by the ability to remove
    for (const [target, path] of targets) {
        const updated_child = apply_story_update_op(target, story_update.op);
        story = replace_in(story, path, updated_child) as Story;
    }

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
