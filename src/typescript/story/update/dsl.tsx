import { DSLProps, make_dsl, ReplaceReturn, DSL } from '../../dsl_utils';
import { history_array } from "../../history";
import { Parsing } from "../../parser";
import { stages, Stages, stage_entries, stage_keys } from "../../stages";
import { ParsedTextStory } from "../../UI/components/parsed_text";
import { append, update } from "../../utils";
import { World } from "../../world";
import { createElement } from '../create';
import { Fragment, is_story_hole, is_story_node, StoryHole, StoryNode } from "../story";
import { CSSUpdates, StoryOps, StoryOpSpec, story_op } from './op';
import { StoryQueries, StoryQuerySpec, story_query } from './query';
import { Story, StoryUpdatePlan, StoryUpdateSpec, StoryUpdateStage, story_update } from "./update";

// TODO: Update Group dsl
// - includes standard text shortcuts
// - includes css applied to multiple indexes
// - other arbitrary groups of updates
/**
 *  
 * update(world, story_updates(u =>
 * u.group()(
 *      u.frame(5)(
 *          u.action().add(<div>He does it</div>),
 *          u.consequence().add('He is bad now.')
 *      )
 * )
 * 
 * group([
 *      frame(5, [
 *          action(<div>He does it</div>),
 *          consequence('He is bad now')
 *          css({butt: true})
 *      )
 *      
 *      frame((w, f) => f().data.frame_index > 3)
 *      has_class('butt').css()
 * 
 *      
 * ])
 * 
 * 
 */
//

type QuerySpecDomain = {
    [K in keyof StoryQueries]: (...params: Parameters<StoryQueries[K]>) => StoryQuerySpec
};

export const query_dsl = make_dsl<QuerySpecDomain>((name) => (...params) => story_query(name, ...params))
export const op_dsl = make_dsl<ReplaceReturn<StoryOps, StoryOpSpec>>(name => (...params) => story_op(name, ...params));

type UpdateDSL = ReplaceReturn<StoryQueries, DSLProps<UpdateDSL2>>;
type UpdateDSL2 = ReplaceReturn<StoryOps, StoryUpdateSpec>;

export const update_dsl = make_dsl<UpdateDSL>(
    (q_name) => (...q_params) =>
        make_dsl<UpdateDSL2>(
            (op_name) => (...op_params) =>
                story_update(
                    story_query(q_name, ...q_params),
                    story_op(op_name, ...op_params)
                )
    )
);


export interface StoryUpdateBuilders {
    frame(index: number, updates: (StoryUpdateSpec | StoryOpSpec)[]): StoryUpdateSpec[];
    frame(index: number[], updates: (StoryUpdateSpec | StoryOpSpec)[]): StoryUpdateSpec[];
    frame(f: (w: World, frame_thunk: () => StoryNode) => boolean, updates: (StoryUpdateSpec | StoryOpSpec)[]): StoryUpdateSpec[];
    
    actions: (children: Fragment | Fragment[], index?: number) => StoryUpdateSpec;
    consequences: (children: Fragment | Fragment[], index?: number) => StoryUpdateSpec;
    description: (children: Fragment | Fragment[], index?: number) => StoryUpdateSpec;
    prompt: (children: Fragment | Fragment[], index?: number) => StoryUpdateSpec;
    
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
