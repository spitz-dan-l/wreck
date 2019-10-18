import { Effects } from '../effect_utils';
import { history_array } from '../history';
import { Parsing } from '../parser';
import { Stages, stages, stage_entries } from '../stages';
import { ParsedTextStory } from '../UI/components/parsed_text';
import { append, map_values, update } from '../utils';
import { World } from '../world';
import { createElement } from './create';
import { compile_query, query, StoryQueryIndex, StoryQuerySpec } from './query';
import { find_all_nodes, find_node, Fragment, is_story_hole, is_story_node, Path, replace_in, StoryHole, StoryNode, story_to_dom, splice_in } from './story';

export type Story = StoryNode & { __brand: 'Story' };

export type StoryOp = (story_elt: Fragment, effects?: Effects<HTMLElement | Text>) => Fragment | Fragment[]
export type StoryUpdate = (story: Story, effects?: Effects<HTMLElement>) => Story;


export type StoryUpdateSpec<Q extends StoryQuerySpec=StoryQuerySpec, O extends StoryOpSpec=StoryOpSpec> = {
    query: Q,
    op: O
};

export type ReversibleOpSpec = StoryOpSpec<'css'>;
export type ReversibleUpdateSpec = StoryUpdateSpec<StoryQuerySpec, ReversibleOpSpec>;

// StoryUpdates stages are the groupings of updates for animation.
export type StoryUpdatePlan = {
    would_effects: ReversibleUpdateSpec[]
    effects: Stages<StoryUpdateSpec[]>;
}

declare module './query' {
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
        (n) => is_story_node(n) && Object.entries(n.classes)
            .some(([cls, on]) => on && cls.startsWith('eph-'))));

StoryQueryIndex.initialize('has_class', (params) =>
    (story) => find_all_nodes(story,
        (n) => is_story_node(n) &&
            (typeof(params.class) === 'string'
                ? !!n.classes[params.class]
                : Object.entries(n.classes)
                    .some(([cls, on]) =>
                        on && (params.class as RegExp).test(cls)))));

StoryQueryIndex.initialize('frame', ({index, subquery}) =>
    (story) => {
        const found = find_node(story,
            (n) => is_story_node(n) && n.data.frame_index === index);
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


export function story_update<Q extends StoryQuerySpec=StoryQuerySpec, O extends StoryOpSpec=StoryOpSpec>(query: Q, op: O): StoryUpdateSpec<Q, O> {
    return { query, op };
}

export interface StoryOpTypes {
    add: { children: Fragment | Fragment[] };
    remove: {};
    css: CSSUpdates;
    remove_eph: {};
    replace: { replacement: Fragment[] };
    insert_after: { nodes: Fragment | Fragment[] };
}

export type CSSUpdates = {
    [class_name: string]: boolean;
};

export type StoryOpSpec<Key extends keyof StoryOpTypes=keyof StoryOpTypes> = {
    [K in Key]: {
        name: K,
        parameters: StoryOpTypes[K]
    }
}[Key];

export function story_op<O extends keyof StoryOpTypes>(name: O, parameters: StoryOpTypes[O]): StoryOpSpec<O> {
    return  { name, parameters };
}

export type StoryOps = {
    [K in keyof StoryOpTypes]: (parameters: StoryOpTypes[K]) => StoryOp
};

export const StoryUpdateOps: StoryOps = {
    add: ({children}) => (parent, effects?) => {
        if (!is_story_node(parent)) {
            throw new Error('Tried to append children to terminal node '+JSON.stringify(parent));
        }
        if (children instanceof Array) {
            return children.reduce((p, c) => StoryUpdateOps.add({children: c})(p, effects), parent);
        }
        
        if (is_story_node(children)){
            children = update(children, {
                classes: { ['eph-new']: true }
            });
        }

        if (effects) {
            effects.push(dom => {
                const child_dom = story_to_dom(children as Fragment);
                dom.appendChild(child_dom);
            });
        }
        return update(parent, {
            children: append(children)
        });
    },
    css: (updates) => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode '+JSON.stringify(elt));
        }
        updates = {...updates};
        for (const [cls, on] of Object.entries(updates)) {
            if (!!on !== !!elt.classes[cls]) {
                updates[`eph-${on ? 'adding' : 'removing'}-${cls}`] = true;
            }
        }
        if (effects) {
            effects.push(dom => {
                for (const [cls, on] of Object.entries(updates)) {
                    (dom as HTMLElement).classList.toggle(cls, on);
                }
            });
        }
        return update(elt, {
            classes: updates
        });
    },
    remove_eph: () => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode '+JSON.stringify(elt));
        }
        
        return update(elt, {
            classes: _ => map_values(_, (on, cls) => {
                if (on && cls.startsWith('eph-')) {
                    if (effects) {
                        effects.push(dom => {
                            (dom as HTMLElement).classList.remove(cls);
                        });
                    }
                    return false;
                }
                return on;

            })
        });
    },
    remove: () => (elt, effects?) => {
        if (effects) {
            effects.push(dom => dom.remove());
        }
        return [];
    },
    replace: ({replacement}) => (elt, effects?) => {
        if (effects) {
            effects.push(dom => {
                if (replacement instanceof Array) {
                    dom.replaceWith(...replacement.map(story_to_dom));    
                } //else {
                //     dom.replaceWith(story_to_dom(replacement));
                // }
            })
        }
        return replacement;
    },
    insert_after: ({nodes}) => (elt, effects?) => {
        if (effects) {
            effects.push(dom => {
                if (nodes instanceof Array) {
                    dom.replaceWith(dom, ...nodes.map(story_to_dom));    
                } else {
                    dom.replaceWith(dom, story_to_dom(nodes));
                }
            })
        }
        if (nodes instanceof Array) {
            return [elt, ...nodes];
        } else {
            return [elt, nodes];
        }
    }
}

export function compile_story_update_op(op_spec: StoryOpSpec): StoryOp {
    return StoryUpdateOps[op_spec.name](op_spec.parameters as any);
}

export function dom_lookup_path(elt: HTMLElement | Text, path: Path): HTMLElement | Text {
    if (path.length === 0) {
        return elt;
    }
    if (!(elt instanceof HTMLElement)) {
        throw new Error('Tried to get child of non HTMLElement');
    }

    const child = elt.childNodes[path[0]];
    if (!(child instanceof HTMLElement) && !(child instanceof Text)) {
        throw new Error('Encountered unexpected child in get_path_dom: '+child);
    }
    return dom_lookup_path(child, path.slice(1));
}

export function compile_story_update(story_update: StoryUpdateSpec): StoryUpdate {
    return (story, effects?): Story => {
        const targets = compile_query(story_update.query)(story);        
        const op = compile_story_update_op(story_update.op);
        for (const [target, path] of targets) {
            const updated_child = op(target, effects ? effects.then(dom => dom_lookup_path(dom, path)) : undefined);
            let result: Fragment | undefined;
            if (updated_child instanceof Array) {
                result = splice_in(story, path, updated_child);
            } else {
                result = replace_in(story, path, updated_child);
            }
            
            if (result === undefined) {
                throw new Error('Update deleted the entire story: '+JSON.stringify(story_update));
            }
            if (!is_story_node(result)) {
                throw new Error('Updated replaced the story root with invalid value: ' + JSON.stringify(result));
            }

            story = result as Story;
        }
    
        return story;
    }
}

export function apply_story_update(story: Story, story_update: StoryUpdateSpec, effects?: Effects<HTMLElement>): Story {
    return compile_story_update(story_update)(story, effects);
}


export function remove_eph(story: Story, effects?: Effects<HTMLElement>) {
    return apply_story_update(
        story,
        story_update(
            query('eph', {}),
            story_op('remove_eph', {})
        ),
        effects
    );
}

export function apply_story_updates_stage(story: Story, story_updates: StoryUpdateSpec[], effects?: Effects<HTMLElement>) {
    return story_updates.reduce((story, update) => apply_story_update(story, update, effects), story);
}

export function apply_story_updates_all(story: Story, story_updates: StoryUpdatePlan) {
    let result = story;

    for (const [stage, updates] of stage_entries(story_updates.effects)) {
        result = apply_story_updates_stage(result, updates);
        result = remove_eph(result);
    }
    return result;
}

// Helpers for doing common story updates
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
    const result: StoryUpdateSpec[] = [];
    for (const prop of ['action', 'consequence', 'description', 'prompt'] as const) {
        const children = spec[prop];
        if (children !== undefined) {
            result.push(
                story_update(
                    query('frame', {
                        index,
                        subquery: query('has_class', { class: prop }) }),
                    story_op('add', { children })
                )
            );
        }
    }
    return result;
}

export const story_updater = (spec: TextAddSpec, stage=0) =>
    <W extends World>(world: W) => update(world as World, {
        story_updates: { effects: stages([stage, append(...make_text_additions(world.index, spec))]) }
    }) as W;

export const css_updater = <W extends World>(f: (w: W) => CSSUpdates) =>
    (world: W) => {
        const history = history_array(world);
        const css_updates: StoryUpdateSpec[] = history.flatMap(w => {
            const updates = f(w);

            if (Object.keys(updates).length === 0) {
                return [];
            }

            return [story_update(
                query('frame', { index: w.index }),
                story_op('css', f(w))
            )]
        });

        return update(world as World, {
            story_updates: { effects: stages([0, append(...css_updates)]) }
        }) as W
    }

export const add_input_text = (world: World, parsing: Parsing, index?: number) => {
    if (index === undefined) {
        index = world.index
    }
    return update(world, {
        story_updates: { effects: stages([0, append(
            story_update(
                query('frame', {
                    index,
                    subquery: query('has_class', {class: 'input-text'})
                }),
                story_op('add', {children: <ParsedTextStory parsing={parsing} />}))
        )]) }
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
    <div className="frame" data={{frame_index: props.index}}>
        <div className="input-text" />
        <div className="output-text">
            <div className="action"></div>
            <div className="consequence"></div>
            <div className="description"></div>
            <div className="prompt"></div>
        </div>
    </div> as StoryNode;
    // update(empty_frame, {
    //     data: { frame_index: props.index }
    // });

export const make_frame = (frame_index: number) => {
    return update(empty_frame, {
        data: { frame_index }
    });
};

export const Hole = (props?: {}): StoryHole => {
    return { kind: 'StoryHole' };
}

export const init_story = <div className="story">
    <EmptyFrame index={0} />
    <Hole />
</div> as Story;

export function init_story_updates(new_index: number): StoryUpdatePlan {
    return {
        would_effects: [],
        effects: stages([0, [
            story_update(
                query('story_hole', {}),
                story_op('replace', { replacement: [
                    <EmptyFrame index={new_index} />,
                    <Hole />
                ]})
            )
        ]])
    };
}

// consider using a pattern language for story transformations like this
