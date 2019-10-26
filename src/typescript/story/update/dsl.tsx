import { DSLProps, make_dsl, ReplaceReturn, DSL, ContextualFunction, contextual_function, with_context, bind, bind_all } from '../../dsl_utils';
import { history_array } from "../../history";
import { Parsing } from "../../parser";
import { stages, Stages, stage_entries, stage_keys } from "../../stages";
import { ParsedTextStory } from "../../UI/components/parsed_text";
import { append, update, lazy_map_values, Updater } from "../../utils";
import { World } from "../../world";
import { createElement } from '../create';
import { Fragment, is_story_hole, is_story_node, StoryHole, StoryNode } from "../story";
import { CSSUpdates, StoryOps, StoryOpSpec, story_op } from './op';
import { StoryQueries, StoryQuerySpec, story_query } from './query';
import { Story, StoryUpdatePlan, StoryUpdateSpec, StoryUpdateStage, story_update } from "./update";
import { StoryUpdateGroups } from './update_group';
import { Update } from 'ts-toolbelt/out/types/src/Tuple/_api';
import { F } from 'ts-toolbelt';

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

type UpdateSpecs = StoryUpdateSpec | UpdateSpecArray;
interface UpdateSpecArray extends Array<UpdateSpecs> {};

type StoryUpdateBuilderContext = {
    query?: StoryQuerySpec;
    op?: StoryOpSpec;

    group_name?: keyof StoryUpdateGroups;
    stage?: number;
};

interface UpdatesConstructor<T extends Updates_> {
    new(context?: StoryUpdateBuilderContext): T
}

class Updates_ {
    constructor(public context: StoryUpdateBuilderContext = {}) {};

    update_context(updater: Updater<StoryUpdateBuilderContext>): this {    
        return new (this.constructor as UpdatesConstructor<this>)(update(this.context, updater));
    }

    frame(index?: number | number[] | undefined): this {
        return this.update_context({
            query: (q) => {
                if (q === undefined) {
                    return Queries.frame(index)
                }
                return Queries.chain(q, Queries.frame(index))
            }
        });
    }

    css(updates: CSSUpdates): StoryUpdateSpec {
        let builder: this = this;
        if (this.context.query === undefined) {
            builder = this.update_context({
                query: Queries.frame()
            })
        }
        return story_update(builder.context.query!, Ops.css(updates));
    }

    apply(f: (builder: this) => UpdateSpecs): UpdateSpecs {
        return f(this);
    }
}

const text_methods = ['actions', 'consequences', 'description', 'prompt'] as const;
type TextMethodNames = (typeof text_methods)[number];

type TextAddMethods = {
    [K in TextMethodNames]:
        (this: Updates_, children: Fragment | Fragment[]) => StoryUpdateSpec
}

// Merge in the text add methods to the interface
interface Updates_ extends TextAddMethods {}

// Merge in the implementations to the class proto
for (const prop of text_methods) {
    Updates_.prototype[prop] = function(children) {
        let base_query = this.context.query;
        if (base_query === undefined) {
            base_query = Queries.frame();
        }
        return story_update(
            Queries.chain(base_query, Queries.has_class(prop)),
            Ops.add(children)
        );
    }
}

const u1 = new Updates_();
const ccc = u1.constructor

type QuerySpecDomain = {
    [K in keyof StoryQueries]: (...params: Parameters<StoryQueries[K]>) => StoryQuerySpec
};

export const Queries = make_dsl<QuerySpecDomain>((name) => (...params) => story_query(name, ...params))
export const Ops = make_dsl<ReplaceReturn<StoryOps, StoryOpSpec>>(name => (...params) => story_op(name, ...params));

type UpdateDSL = ReplaceReturn<StoryQueries, DSLProps<UpdateDSL2>>;
type UpdateDSL2 = ReplaceReturn<StoryOps, StoryUpdateSpec>;

export const Updates = make_dsl<UpdateDSL>(
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
    frame(index: number | number[] | undefined, update_f: (dsl: DSL<Buh>) => FrameUpdates): StoryUpdateSpec[];

    actions: (children: Fragment | Fragment[]) => StoryUpdateSpec;
    consequences: (children: Fragment | Fragment[]) => StoryUpdateSpec;
    description: (children: Fragment | Fragment[]) => StoryUpdateSpec;
    prompt: (children: Fragment | Fragment[]) => StoryUpdateSpec;

    css: (updates: CSSUpdates) => StoryUpdateSpec;

    story_update: () => UpdateDSL;
}

export type Buh = {
    [K in keyof StoryUpdateBuilders]: ContextualFunction<StoryQuerySpec, StoryUpdateBuilders[K]>
}

export declare const BuhImpls: Buh;

type BuhDSL = DSL<Buh>;
declare let buh_dsl: BuhDSL;

const x = buh_dsl.css({a: true});
const x1 = buh_dsl.frame(5, bind_all(buh_dsl, (dsl) => [
    dsl.css({a:true}),
    dsl.frame(3, (dsl) => []),
    dsl.story_update().has_class('steve').add('buh'),
    dsl.actions('sef')
]))


const css = contextual_function(
    ((ctx) => (updates: CSSUpdates) =>
        story_update(ctx(), Ops.css(updates))),
    Queries.frame());
// const zzz = css({a: true});

const frame: Buh['frame'] = contextual_function((ctx: () => StoryQuerySpec) => {
    
    function _frame(index: number | number[] | undefined, update_f: (dsl: DSL<Buh>) => FrameUpdates): StoryUpdateSpec[] {
        const q = Queries.chain(ctx(), Queries.frame(index));
        const dsl = lazy_map_values(BuhImpls, (x: ContextualFunction<StoryQuerySpec, any>) => with_context(x, q))
        const result = update_f(dsl);
        if (result instanceof Array) {
            return result.flat(Infinity);
        }
        return [result];
    }
    return _frame;
}, Queries.story_root()
);

with_context(css, Queries.eph())({a: true})

frame(undefined, contextual_function((ctx) => () => [with_context(css, ctx())({a: true})]))

frame(undefined, bind(css, (css) => [css({'a': true})]));

frame(undefined, (dsl) => [
    dsl.description('horse')
]);

const zzz = bind_all({css, frame}, ({css, frame}) => [css({'a': true})]);
zzz()

let xxx1 = with_context(() => 4, 15);

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
