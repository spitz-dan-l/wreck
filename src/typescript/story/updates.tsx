import { Stages, stages, stage_entries, map_stages } from '../stages';
import { StoryNode, Fragment, is_story_node, replace_in, is_path_empty, is_path_full, find_all_nodes, is_story_hole, find_node, FoundNode, StoryHole } from './story';
import { createElement } from './create';
import { World } from '../world';
import { Updater, append, map } from '../utils';
import { update } from '../update';
import { history_array } from '../history';
import { Parsing } from '../parser';
import { ParsedText, ParsedTextStory } from '../UI/components/parsed_text';
import { StoryQuerySpec, StoryQueryIndex, compile_query, StoryQueryTypes, query } from './story_query';

export type StoryUpdate = {
    query: StoryQuerySpec,
    op: StoryUpdateOp
};

export function story_update(query: StoryQuerySpec, op: StoryUpdateOp): StoryUpdate {
    return { query, op };
}

export type AddOp = {
    kind: 'Add';
    elements: Fragment | Fragment[];
};

export type RemoveOp = {
    kind: 'Remove';
};

type CSSUpdates = {
    [class_name: string]: boolean;
};

type CSSOp = {
    kind: 'CSS';
    updates: CSSUpdates;
};

type ReplaceOp = {
    kind: 'Replace';
    element: Fragment;
}

export type StoryUpdateOp =
    | AddOp
    | RemoveOp
    | CSSOp
    | ReplaceOp
    ;

export function add_op(elements: Fragment | Fragment[]): AddOp {
    return { kind: 'Add', elements };
}

export function remove_op(): RemoveOp {
    return { kind: 'Remove' };
}

export function css_op(updates: CSSUpdates): CSSOp {
    return { kind: 'CSS', updates };
}

export function replace_op(element: Fragment): ReplaceOp {
    return { kind: 'Replace', element };
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
    switch (op.kind) {
        case 'Add': {
            return add_child(elt, op.elements);
        }
        case 'CSS': {
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
        }
        case 'Remove': {
            return undefined;
        }
        case 'Replace': {
            return op.element
        }
        default: {
            throw new Error('Should not get here');
        }
    }
}

export function apply_story_update(story: Story, story_update: StoryUpdate) {
    const query = compile_query(story_update.query);
    const targets = query(story);

    if (targets.length === 0) {
        throw new Error('StoryUpdate query returned no matches: '+JSON.stringify(story_update.query));
    }

    // sort the deepest and last children first
    // this guarantees that no parent will be updated before its children
    // and no child array's indices will move before its children are updated
    targets.sort(([,path1], [,path2]) => {
        if (path2.length !== path1.length) {
            return path2.length - path1.length;
        }
        for (let i = 0; i < path1.length; i++) {
            if (path1[i] !== path2[i]) {
                return path2[i] - path1[i];
            }
        }
        return 0;
    });

    for (const [target, path] of targets) {
        const updated_child = apply_story_update_op(target, story_update.op);
        if (is_path_full(path)) {
            story = replace_in(story, path, updated_child);
        } else {
            if (updated_child === undefined || !is_story_node(updated_child)) {
                throw new Error('Update would have deleted entire story: '+JSON.stringify(story_update));
            }
            story = replace_in(story, path as [], updated_child);
        }
        
    }

    return story;
}

declare module './story_query' {
    export interface StoryQueryTypes {
        story_root: {};
        story_hole: {};
        eph: {};
        has_class: { class: string | RegExp };
        frame: { index: number, subquery?: StoryQuerySpec };
    }
}

StoryQueryIndex.initialize('story_root', () => story => [[story, []]]);

StoryQueryIndex.initialize('story_hole', () =>
    (story) => {
        const result = find_all_nodes(story, n => is_story_hole(n));
        if (result.length !== 1) {
            throw new Error(`Found ${result.length} story holes. There should only ever be one.`);
        }
        return result;
    })

StoryQueryIndex.initialize('eph', () =>
    (story) => find_all_nodes(story,
        (n) => Object.entries(n.classes)
            .some(([cls, on]) => on && cls.startsWith('eph-'))));

StoryQueryIndex.initialize('has_class', (params) =>
    (story) => find_all_nodes(story,
        (n) => typeof(params.class) === 'string'
            ? !!n.classes[params.class]
            : Object.entries(n.classes)
                .some(([cls, on]) =>
                    on && (params.class as RegExp).test(cls))));

StoryQueryIndex.initialize('frame', ({index, subquery}) =>
    (story) => {
        const found = find_node(story,
            (n) => n.data.frame_index === index);
        if (found === null) {
            return [];
        }
        if (subquery === undefined) {
            return [found];
        }
        const [frame, path] = found;
        return compile_query(subquery)(frame)
            .map(([n, p]) => [n, [...path, ...p]]);
    });

export function remove_eph(story: Story) {
    return apply_story_update(story, {
        query: {
            name: 'eph',
            parameters: {}
        },
        op: { kind: 'Remove' }
    });
}

export function apply_story_updates(story: Story, story_updates: StoryUpdates) {
    let result = story;

    for (const [stage, updates] of stage_entries(story_updates)) {
        result = updates.reduce((story, update) => apply_story_update(story, update), result);
        result = remove_eph(result);
    }
    return result;
}

export type TextAddSpec = {
    action?: Fragment | Fragment[]
    consequence?: Fragment | Fragment[]
    description?: Fragment | Fragment[]
    prompt?: Fragment | Fragment[]
} | Fragment | Fragment[];

function is_fragment(spec: TextAddSpec): spec is Fragment | Fragment[] {
    return (typeof spec === 'string' || spec instanceof Array || is_story_node(spec as Fragment) || is_story_hole(spec as Fragment));
}

export const make_text_additions = (index: number, spec: TextAddSpec) => {
    if (is_fragment(spec)) {
        spec = {
            consequence: spec
        };
    }
    const result: StoryUpdate[] = [];
    for (const prop of ['action', 'consequence', 'description', 'prompt'] as const) {
        const elements = spec[prop];
        if (elements !== undefined) {
            result.push(
                story_update(
                    query('frame', {
                        index,
                        subquery: query('has_class', { class: prop }) }),
                    add_op(elements)
                )
            );
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

            return [story_update(
                query('frame', { index: w.index }),
                css_op(f(w))
            )]
        });

        return update(world as World, {
            story_updates: stages([0, append(...css_updates)])
        }) as W
    }

export const add_input_text = (world: World, parsing: Parsing) => {
    return update(world, {
        story_updates: stages([0, append(
            story_update(
                query('frame', {
                    index: world.index,
                    subquery: query('has_class', {class: 'input-text'})
                }),
                add_op(<ParsedTextStory parsing={parsing} />)
            )
        )])
    });
}

const empty_frame = <div className="frame">
    <div className="input-text" />
    <div className="output-text">
        <div className="action"></div>
        <div className="consequence"></div>
        <div className="description"></div>
        <div className="prompt"></div>
    </div>
</div> as StoryNode;

export const EmptyFrame = (props: { index: number }) => 
    update(empty_frame, {
        data: { frame_index: props.index }
    });

export const make_frame = (frame_index: number) => {
    return update(empty_frame, {
        data: { frame_index }
    });
};

export function StoryHole(): StoryHole {
    return { kind: 'StoryHole' };
}

export const init_story = <div className="story">
    <EmptyFrame index={0} />
    <StoryHole />
</div> as Story;

export function init_story_updates(new_index: number): StoryUpdates {
    return stages([0, [
        story_update(
            query('story_hole', {}),
            replace_op(<EmptyFrame index={new_index} />)
        ),
        story_update(
            query('story_root', {}),
            add_op(<StoryHole />)
        )
    ]]);
}