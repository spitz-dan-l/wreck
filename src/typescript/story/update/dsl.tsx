import { make_dsl, ParametersFor, ReplaceReturn } from '../../lib/dsl_utils';
import { history_array } from "../../history";
import { Parsing } from '../../parser';
import { stages } from "../../lib/stages";
import { ParsedTextStory } from '../../UI/components/parsed_text';
import { keys, update, Updater, flat_deep, append } from "../../lib/utils";
import { World } from "../../world";
import { createElement } from '../create';
import { Fragment, StoryHole, StoryNode } from "../story";
import { StoryOps, StoryOpSpec, story_op } from './op';
import { StoryQueries, StoryQuerySpec, story_query, StoryQuery, compile_story_query } from './query';
import { Story, StoryUpdatePlan, StoryUpdateSpec, story_update } from "./update";
import { apply_story_update_group_op, StoryUpdateGroupOp, StoryUpdateGroups } from './update_group';
import { A } from 'ts-toolbelt';

type QuerySpecDomain = ReplaceReturn<StoryQueries, StoryQuerySpec>;
export const Queries = make_dsl<QuerySpecDomain>((name) => (...params) => story_query(name, params))

type OpSpecDomain = ReplaceReturn<StoryOps, StoryOpSpec>;
export const Ops = make_dsl<OpSpecDomain>(name => (...params) => story_op(name, ...params));



type UpdateSpecs = StoryUpdateSpec | UpdateSpecArray;
interface UpdateSpecArray extends Array<UpdateSpecs> {};

type StoryUpdateBuilderContext = {
    query?: StoryQuerySpec;
};

export class UpdatesBuilder {
    constructor(public context: StoryUpdateBuilderContext = {}) {};

    update_context(updater: Updater<StoryUpdateBuilderContext>): UpdatesBuilder {
        return new UpdatesBuilder(update(this.context, updater));
    }

    apply(f: (builder: UpdatesBuilder) => UpdateSpecs): StoryUpdateSpec[] {
        return flat_deep([f(this)]);
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

    prepend_to(update_spec: StoryUpdateSpec): StoryUpdateSpec {
        return {
            query: this.chain(update_spec.query).to_query_spec(),
            op: update_spec.op
        };
    }

    map_worlds<W extends World>(world: W, f: (w: W, frame: UpdatesBuilder) => UpdateSpecs): StoryUpdateSpec[] {
        const results: UpdateSpecs[] = [];
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
        (children: Fragment | Fragment[]) => StoryUpdateSpec
}

// Merge in the text add methods to the interface
export interface UpdatesBuilder extends TextAddMethods {}

// Merge in the implementations to the class proto
for (const prop of TEXT_CATEGORY_NAMES) {
    UpdatesBuilder.prototype[prop] = function(children) {
        let base_query = this.context.query;
        if (base_query === undefined) {
            base_query = Queries.frame();
        }
        return story_update(
            Queries.chain(base_query, Queries.children(Queries.has_class('output-text')), Queries.children(Queries.has_class(prop))),
            Ops.add(children)
        );
    }
}

type QueryMethods = {
    [K in keyof QuerySpecDomain]:
        ((...params: ParametersFor<QuerySpecDomain>[K]) => UpdatesBuilder)
}

export interface UpdatesBuilder extends QueryMethods {
    // has_gist(gist_pattern: GistPattern): UpdatesBuilder;

}

function query_method<K extends keyof QueryMethods>(this: UpdatesBuilder, k: K, ...params: ParametersFor<QueryMethods>[K]): UpdatesBuilder {
    const q = story_query(k, params);
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
        (...params: ParametersFor<StoryOps>[K]) => StoryUpdateSpec
}>

export interface UpdatesBuilder extends OpMethods {}

function op_method<K extends keyof StoryOps>(this: UpdatesBuilder, k: K, ...params: ParametersFor<StoryOps>[K]): StoryUpdateSpec {
    const op = story_op(k, ...params);
    let q: StoryQuerySpec;
    if (this.context.query === undefined) {
        q = Queries.frame(); //Queries.story_root();
    } else {
        q = this.context.query;
    }
    return story_update(q, op);
}

for (const k of keys(StoryOps)){
    UpdatesBuilder.prototype[k] = function(...params: any[]) {
        return op_method.call(this, k, ...params);
    }
}

export const Updates = new UpdatesBuilder();

type GroupBuilderContext = {
    name?: keyof StoryUpdateGroups,
    stage?: number
}

class GroupBuilder {
    constructor(public context: GroupBuilderContext = {}) {  
    }

    update_context(updater: Updater<GroupBuilderContext>): GroupBuilder {
        return new GroupBuilder(update(this.context, updater));
    }

    name(name: keyof StoryUpdateGroups): GroupBuilder {
        if (this.context.name !== undefined) {
            throw new Error('Tried to redefine the group name which is probably a mistake.');
        }
        return this.update_context({ name }); //as Omit<GroupBuilder, 'name'>;
    }

    stage(stage: number): GroupBuilder {
        if (this.context.stage !== undefined) {
            throw new Error('Tried to redefine the group stage which is probably a mistake.');
        }
        return this.update_context({ stage }); // as Omit<GroupBuilder, 'stage'>;
    }

    move_to(dest_stage: number): StoryUpdateGroupOp {
        if (this.context.name === undefined) {
            throw new Error('Tried to move a group without specifying the name.');
        }
        if (this.context.stage === undefined) {
            throw new Error('Tried to move a group without defining the source stage');
        }
        return {
            kind: 'MoveGroup',
            name: this.context.name!,
            source_stage: this.context.stage!,
            dest_stage
        };
    }

    push(...update_specs: UpdateSpecs[]): StoryUpdateGroupOp {
        return {
            kind: 'PushGroup',
            name: this.context.name || 'updates',
            stage: this.context.stage,
            updates: flat_deep(update_specs) //.flat(Infinity)
        };
    }
}

export const Groups = new GroupBuilder();

export type StoryUpdaterSpec = StoryUpdateGroupOp | StoryUpdateSpec | StoryUpdaterSpecArray;
interface StoryUpdaterSpecArray extends Array<StoryUpdaterSpec> {}

function is_group(x: StoryUpdateGroupOp | StoryUpdateSpec): x is StoryUpdateGroupOp {
    return (x as any).kind === 'MoveGroup' || (x as any).kind === 'PushGroup';
}

export function story_updater(...updates: StoryUpdaterSpec[]) {
    const flat_updates = flat_deep(updates)/*.flat(Infinity)*/ as (StoryUpdateGroupOp | StoryUpdateSpec)[];
    
    const groups: StoryUpdateGroupOp[] = []
    let default_group_updates: StoryUpdateSpec[] = [];
    
    function flush_default_group() {
        if (default_group_updates.length > 0) {
            groups.push(Groups.push(...default_group_updates));
            default_group_updates = [];
        }
    }

    for (const up of flat_updates) {
        if (is_group(up)) {
            flush_default_group();
            groups.push(up);
        } else {
            default_group_updates.push(up);
        }
    }
    flush_default_group();

    return (updates: StoryUpdateGroupOp[]) => [...updates, ...groups];
}


export const add_input_text = (world: World, parsing: Parsing) => {
    return update(world, {
        story_updates: story_updater(
            Groups.name('init_frame').push(
                Updates
                    .frame(world.index).first(Updates.has_class('input-text').to_query_spec())
                    .add(<ParsedTextStory parsing={parsing} />, true)
            )
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

export function init_story_updates(new_index: number): StoryUpdateGroupOp[] {
    return [
            Groups.name('init_frame').push(
                Updates.story_hole().replace([
                    <EmptyFrame index={new_index} />,
                    <Hole />
                ])
            )
    ];
}

// consider using a pattern language for story transformations like this
