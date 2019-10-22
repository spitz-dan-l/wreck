import { createElement } from '../create';
import { Fragment, is_story_node, is_story_hole, StoryNode, StoryHole } from "../story";

import { story_query, StoryQueryTypes, StoryQuerySpec, StoryQueryName, StoryQuerySpecs } from './query';
import { story_op, CSSUpdates, StoryOpTypes, StoryOpSpec, StoryOpSpecs, StoryUpdateOps, StoryOps, StoryOp } from './op';
import { StoryUpdateSpec, story_update, Story, StoryUpdatePlan, StoryUpdateGroups, StoryUpdateStage, StoryUpdateGroup, ReversibleUpdateSpec } from "./update";

import { World } from "../../world";
import { stages, stage_keys, stage_entries, Stages } from "../../stages";

import { append, update, map_values } from "../../utils";

import { history_array } from "../../history";

import { Parsing } from "../../parser";

import { ParsedTextStory } from "../../UI/components/parsed_text";
import { StaticNameIndexFor } from '../../static_resources';


/** 
 * DSL ideas
 * 
 * shortened expressions for raw story_updates...
 *      builder.eph().remove_eph()     
 * 
 *      ['eph', 'remove_eph']
 *      ['story_hole', 'replace', ]
 * 
 * 
*/

export type DSLHelper<ParamTypes, Out> = {
    [K in keyof ParamTypes]: (parameters: ParamTypes[K]) => Out
};


export function dsl_helper<
    ParamTypes,
    Out
>(
    static_names: StaticNameIndexFor<ParamTypes>,
    constructor: <K extends keyof ParamTypes>(name: K, parameters: ParamTypes[K]) => Out
): DSLHelper<ParamTypes, Out> {
    return map_values(static_names,
        <K extends keyof ParamTypes>(x: unknown, name: K) => {
            function _dsl_inner(parameters: ParamTypes[K]): Out {
                return constructor(name, parameters);
            }
            return _dsl_inner
        });
}

export const query_dsl = dsl_helper<StoryQueryTypes, StoryQuerySpec>(StoryQueryName, story_query);
export const op_dsl = dsl_helper<StoryOpTypes, StoryOpSpec>(StoryUpdateOps, story_op)

export const update_dsl = dsl_helper(StoryQueryName, (q_name, q_params) => {
    return dsl_helper(StoryUpdateOps as StaticNameIndexFor<StoryOpTypes>, (op_name, op_params) =>
        story_update(
            story_query(q_name, q_params),
            story_op(op_name, op_params)
        )
    ); 
});

const xxxd = update_dsl.has_class({class: 'buh'}).remove()

// TODO: Update Group dsl
// - includes standard text shortcuts
// - includes css applied to multiple indexes
// - other arbitrary groups of updates

export function push_group(plan: Stages<StoryUpdateStage>, group: StoryUpdateGroup, stage?: number) {
    let group_index: number | undefined = undefined;

    function find_group_index(groups: StoryUpdateStage) {
        return groups.findIndex(g => g.name === group.name);
    }

    if (stage === undefined) {
        for (const [s, groups] of stage_entries(plan)) {
            const idx = find_group_index(groups);
            if (idx !== -1) {
                stage = s;
                group_index = idx;
            }
        }
    }

    if (stage === undefined) {
        stage = 0;
    }

    if (!plan.has(stage)) {
        group_index = -1;
    }

    if (group_index === undefined) {
        group_index = find_group_index(plan.get(stage)!);
    }

    if (group_index === -1) {
        return update(plan, stages([stage, append(group)]));
    } else {
        return update(plan, stages([stage, {
            [group_index]: {
                updates: append(...group.updates)
            }
        }]));
    }
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
                    story_query('frame', {
                        index,
                        subquery: story_query('has_class', { class: prop }) }),
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
                story_query('frame', { index: w.index }),
                story_op('css', f(w))
            )]
        });

        return update(world as World, {
            story_updates: { effects: stages([0, append(...css_updates)]) }
        }) as W
    }

export const add_input_text = (world: World, parsing: Parsing) => {
    const lowest_stage = stage_keys(world.story_updates.effects)[0];
    return update(world, {
        story_updates: { effects: stages([lowest_stage, append(
            story_update(
                story_query('frame', {
                    index: world.index,
                    subquery: story_query('first', { subquery: story_query('has_class', {class: 'input-text'}) })
                }),
                story_op('add', {no_animate: true, children: <ParsedTextStory parsing={parsing} />}))
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
                story_query('story_hole', {}),
                story_op('replace', { replacement: [
                    <EmptyFrame index={new_index} />,
                    <Hole />
                ]})
            )
        ]])
    };
}

// consider using a pattern language for story transformations like this
