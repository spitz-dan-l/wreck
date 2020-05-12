import { make_dsl, ParametersFor, ReplaceReturn, DMFParameters } from '../../lib/dsl_utils';
import { history_array } from "../../history";
import { Parsing } from '../../parser';
import { stages } from "../../lib/stages";
import { ParsedTextStory } from '../../UI/components/parsed_text';
import { keys, update, Updater, flat_deep, append, included, compute_const } from "../../lib/utils";
import { World } from "../../world";
import { createElement } from '../create';
import { Fragment, StoryHole, StoryNode, FoundNode } from "../story";
import { StoryOps, StoryOpSpec, story_op } from './op';
import { StoryQueries, StoryQuerySpec, story_query, StoryQuery, compile_story_query } from './query';
import { Story, StoryUpdatePlan, StoryUpdateSpec, story_update } from "./update";
import { apply_story_update_compilation_op, StoryUpdateCompilationOp, StoryUpdateGroups, GroupName, MoveGroup } from './update_group';
import { A } from 'ts-toolbelt';
import { StaticNameIndex } from 'lib/static_resources';

type QuerySpecDomain = ReplaceReturn<StoryQueries, StoryQuerySpec>;
export const Queries = make_dsl<QuerySpecDomain>((name) => (...params) => story_query(name, params))

type OpSpecDomain = ReplaceReturn<StoryOps, StoryOpSpec>;
export const Ops = make_dsl<OpSpecDomain>(name => (...params) => story_op(name, ...params));


type StoryUpdateBuilderContext = {
    query?: StoryQuerySpec;
    would_effect?: boolean;
    group_name?: GroupName;
    group_stage?: number;
};

export class UpdatesBuilder {
    ['constructor']: new (context?: StoryUpdateBuilderContext) => this;
    constructor(public context: StoryUpdateBuilderContext = {}) {};

    update_context(updater: Updater<StoryUpdateBuilderContext>): this {
        return new (this.constructor)(update(this.context, updater));
    }

    apply(f: (builder: UpdatesBuilder) => StoryUpdaterSpec): StoryUpdaterSpec[] {
        return flat_deep([f(this)]);
    }

    apply_op(op: StoryOpSpec): StoryUpdateCompilationOp {
        const q = compute_const(() => {
            if (this.context.query === undefined) {
                return Queries.frame(); //Queries.story_root();
            } else {
                return this.context.query;
            }
        });

        if (this.context.would_effect) {
            return {
                kind: 'PushWouldUpdate',
                update_spec: story_update(q, op)
            }
        }

        return {
            kind: 'PushStoryUpdate',
            group_name: this.context.group_name,
            stage: this.context.group_stage,
            update_spec: story_update(q, op)
        };
    }

    would(would: boolean=true): this {
        if (this.context.would_effect !== undefined) {
            throw new Error('Tried to redefine the group name on an UpdatesBuilder.');
        }
        return this.update_context({ would_effect: would });
    }

    group_name(name: GroupName): this {
        if (this.context.group_name !== undefined) {
            throw new Error('Tried to redefine the group name on an UpdatesBuilder.');
        }
        return this.update_context({ group_name: name });
    }

    group_stage(stage: number): this {
        if (this.context.group_stage !== undefined) {
            throw new Error('Tried to redefine the group stage on an UpdatesBuilder.');
        }
        return this.update_context({ group_stage: stage });
    }

    move_group_to(dest_stage: number): MoveGroup {
        if (this.context.group_name === undefined) {
            throw new Error('Tried to call move_group_to() without defining a group_name.');
        }
        if (this.context.group_stage === undefined) {
            throw new Error('Tried to call move_group_to() without defining a group_stage (source stage).');
        }
        return {
            kind: 'MoveGroup',
            name: this.context.group_name,
            source_stage: this.context.group_stage,
            dest_stage
        };
    }

    to_query_spec(): StoryQuerySpec {
        if (this.context.query === undefined) {
            throw new Error("Tried to convert an UpdatesBuilder to query before any query methods were called");
        }
        return this.context.query;
    }

    to_query(): StoryQuery {
        return compile_story_query(this.to_query_spec());
    }

    query(story: Fragment): FoundNode[] {
        return this.to_query()(story);
    }

    prepend_to(update_spec: StoryUpdateCompilationOp | StoryUpdateSpec): StoryUpdateCompilationOp {
        let b = this;

        if (is_compilation_op(update_spec)) {
            if (update_spec.kind === 'MoveGroup') {
                return update_spec;
            }
            
            if (update_spec.kind === 'PushWouldUpdate') {
                if (this.context.would_effect === undefined) {
                    b = b.would();
                }
            } else {
                if (this.context.group_name === undefined && update_spec.group_name !== undefined) {
                    b = b.group_name(update_spec.group_name);
                }

                if (this.context.group_stage === undefined && update_spec.stage !== undefined) {
                    b = b.group_stage(update_spec.stage);
                }
            }

            update_spec = update_spec.update_spec;
        }
        return b.chain(update_spec.query).apply_op(update_spec.op)
    }

    map_worlds<W extends World>(world: W, f: (w: W, frame: UpdatesBuilder) => StoryUpdaterSpec): StoryUpdateSpec[] {
        const results: StoryUpdaterSpec[] = [];
        for (const w of history_array(world).reverse()) {
            const w_frame = this.frame(w.index);
            results.push(f(w, w_frame));
        }
        return flat_deep(results); //.flat(Infinity);
    }
}

const TEXT_CATEGORY_NAMES = ['action', 'consequence', 'description', 'prompt'] as const;
type TextMethodNames = (typeof TEXT_CATEGORY_NAMES)[number];

type TextAddMethods = {
    [K in TextMethodNames]:
        (children: Fragment | Fragment[]) => StoryUpdateCompilationOp
}

// Merge in the text add methods to the interface
export interface UpdatesBuilder extends TextAddMethods {}

// Merge in the implementations to the class proto
for (const prop of TEXT_CATEGORY_NAMES) {
    UpdatesBuilder.prototype[prop] = function(children) {
        let b = this;
        if (b.context.query === undefined) {
            b = b.frame();
        }
        return b
            .children(Updates.has_class('output-text'))
            .children(Updates.has_class(prop))
            .add(children);
    }
}

type QueryMethods = {
    [K in keyof QuerySpecDomain]:
        ((...params: ParametersFor<QuerySpecDomain>[K]) => UpdatesBuilder)
}



export interface UpdatesBuilder extends QueryMethods {
    // override some signatures to accept an UpdatesBuilder where a StoryQuerySpec would be expected
    first: (query: StoryQuerySpec | UpdatesBuilder) => UpdatesBuilder;
    first_level: (query: StoryQuerySpec | UpdatesBuilder) => UpdatesBuilder;
    chain: (...queries: (StoryQuerySpec | UpdatesBuilder)[]) => UpdatesBuilder;
    children: (subquery?: StoryQuerySpec | UpdatesBuilder) => UpdatesBuilder;
    
}

// function query_method<K extends keyof QueryMethods>(this: UpdatesBuilder, k: K, ...params: ParametersFor<QueryMethods>[K]): UpdatesBuilder {
function query_method<K extends keyof QueryMethods>(this: UpdatesBuilder, k: K, ...params: ParametersFor<Pick<UpdatesBuilder, keyof QueryMethods>>[K]): UpdatesBuilder {   
    if (k === 'debug' && params[1] === undefined) {
        const e = new Error('Getting current call stack');
        (params as any[]).push(e.stack);
    }
    
    const converted_params: ParametersFor<QueryMethods>[K] =
        (params as unknown[]).map(
            p => p instanceof UpdatesBuilder ?
                p.to_query_spec() :
                p
        ) as ParametersFor<QueryMethods>[K];

    
    
    const q = story_query(k, converted_params);
    const base_query = this.context.query;
    
    if (base_query === undefined) {
        return this.update_context({
            query: q
        });
    }
    return this.update_context({
        query: _ => Queries.chain(_!, q)
    });
}

for (const k of keys(StoryQueries)) {
    UpdatesBuilder.prototype[k] = function(...params: any[]) {
        return query_method.call(this, k, ...params);
    }
}

type OpMethods = A.Compute<{
    [K in keyof StoryOps]:
        (...params: ParametersFor<StoryOps>[K]) => StoryUpdateCompilationOp
}>

export interface UpdatesBuilder extends OpMethods {}

function op_method<K extends keyof StoryOps>(this: UpdatesBuilder, k: K, ...params: ParametersFor<StoryOps>[K]): StoryUpdateCompilationOp {
    const op = story_op(k, ...params);
    return this.apply_op(op);
}

for (const k of keys(StoryOps)){
    UpdatesBuilder.prototype[k] = function(...params: any[]) {
        return op_method.call(this, k, ...params);
    }
}

export const Updates = new UpdatesBuilder();


export type StoryUpdaterSpec = StoryUpdateCompilationOp | StoryUpdateSpec | StoryUpdaterSpec[];

function is_compilation_op(x: StoryUpdateCompilationOp | StoryUpdateSpec): x is StoryUpdateCompilationOp {
    const accepted_kinds: StaticNameIndex<StoryUpdateCompilationOp['kind']> = {
        MoveGroup: null,
        PushStoryUpdate: null,
        PushWouldUpdate: null
    }
    return included((x as any).kind, keys(accepted_kinds));
}

export function story_updater(...updates: StoryUpdaterSpec[]) {
    const flat_updates = flat_deep(updates) as (StoryUpdateCompilationOp | StoryUpdateSpec)[];
    
    const normalized_updates: StoryUpdateCompilationOp[] = flat_updates.map(up => {
        if (is_compilation_op(up)) {
            return up;
        }
        return {
            kind: 'PushStoryUpdate',
            update_spec: up
        };
    });

    return (prev_updates: StoryUpdateCompilationOp[]) => [...prev_updates, ...normalized_updates];
}


export const add_input_text = (world: World, parsing: Parsing) => {
    return update(world, {
        story_updates: story_updater(
            Updates
                .group_name('init_frame')
                .frame(world.index).first(Updates.has_class('input-text'))
                .add(<ParsedTextStory parsing={parsing} />, true)

        )
    });
}

export const EmptyFrame = (props: { index: number }) => 
    <div className="frame" frame_index={props.index}>
        <div className="input-text" />
        <div className="output-text">
            <div className={TEXT_CATEGORY_NAMES[0]}></div>
            <div className={TEXT_CATEGORY_NAMES[1]}></div>
            <div className={TEXT_CATEGORY_NAMES[2]}></div>
            <div className={TEXT_CATEGORY_NAMES[3]}></div>
        </div>
    </div> as StoryNode;

export const Hole = (props?: {}): StoryHole => {
    return { kind: 'StoryHole' };
}

export const init_story = <div className="story">
    <EmptyFrame index={0} />
    <Hole />
</div> as Story;

export function init_story_updates(new_index: number): StoryUpdateCompilationOp[] {
    return [
            Updates
                .group_name('init_frame')
                .story_hole()
                .replace([
                    <EmptyFrame index={new_index} />,
                    <Hole />
                ])
            
    ];
}

// consider using a pattern language for story transformations like this
