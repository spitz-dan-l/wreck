/*
    A small builder for story updates. Query methods narrow down which nodes
    to touch, op methods produce the update. For example:

        S.frame(3).has_gist({tag: 'Sam'}).css({ highlighted: true })

    An update with no query targets the latest frame.

    Updates are grouped (by name) and staged (by number) so that they can be
    animated in order; see update_group.ts.
*/
import { Gist, GistPattern } from 'gist';
import { Gensym } from 'lib/gensym';
import { history_array } from '../../history';
import { Parsing } from '../../parser';
import { ParsedTextStory } from '../../UI/components/parsed_text';
import { flat_deep, update } from '../../lib/utils';
import { World } from '../../world';
import { createElement } from '../create';
import { Fragment, FoundNode, Path, StoryHole, StoryNode } from '../story';
import { CSSUpdates, story_op, StoryOpSpec } from './op';
import { compile_story_query, story_query, StoryQuery, StoryQuerySpec } from './query';
import { Story, story_update, StoryUpdateSpec } from './update';
import { GroupName, MoveGroup, StoryUpdateCompilationOp } from './update_group';

type BuilderContext = {
    query?: StoryQuerySpec;
    would?: boolean;
    group_name?: GroupName;
    group_stage?: number;
};

export type StoryUpdaterSpec = StoryUpdateCompilationOp | StoryUpdateSpec | StoryUpdaterSpec[];

export class UpdatesBuilder {
    constructor(readonly context: BuilderContext = {}) {}

    private with(patch: Partial<BuilderContext>): UpdatesBuilder {
        return new UpdatesBuilder({ ...this.context, ...patch });
    }

    private then(q: StoryQuerySpec): UpdatesBuilder {
        if (this.context.query === undefined) {
            return this.with({ query: q });
        }
        return this.with({ query: story_query('chain', [this.context.query, q]) });
    }

    private static to_spec(q: StoryQuerySpec | UpdatesBuilder): StoryQuerySpec {
        return q instanceof UpdatesBuilder ? q.to_query_spec() : q;
    }

    // QUERIES
    path(path: Path) { return this.then(story_query('path', [path])); }
    key(key: Gensym) { return this.then(story_query('key', [key])); }
    first(q: StoryQuerySpec | UpdatesBuilder) { return this.then(story_query('first', [UpdatesBuilder.to_spec(q)])); }
    first_level(q: StoryQuerySpec | UpdatesBuilder) { return this.then(story_query('first_level', [UpdatesBuilder.to_spec(q)])); }
    story_root() { return this.then(story_query('story_root', [])); }
    story_hole() { return this.then(story_query('story_hole', [])); }
    eph() { return this.then(story_query('eph', [])); }
    has_class(cls: string | RegExp) { return this.then(story_query('has_class', [cls])); }
    frame(index?: number | number[]) { return this.then(story_query('frame', [index])); }
    chain(...qs: (StoryQuerySpec | UpdatesBuilder)[]) { return this.then(story_query('chain', qs.map(UpdatesBuilder.to_spec))); }
    children(q?: StoryQuerySpec | UpdatesBuilder) { return this.then(story_query('children', [q === undefined ? undefined : UpdatesBuilder.to_spec(q)])); }
    has_gist(pattern: GistPattern) { return this.then(story_query('has_gist', [pattern])); }

    // CONTEXT
    // A "would" update describes what a partially entered command would do; it is shown while typing and never committed.
    would(would: boolean = true) {
        if (this.context.would !== undefined) {
            throw new Error('Tried to redefine would() on an UpdatesBuilder.');
        }
        return this.with({ would });
    }
    group_name(name: GroupName) {
        if (this.context.group_name !== undefined) {
            throw new Error('Tried to redefine the group name on an UpdatesBuilder.');
        }
        return this.with({ group_name: name });
    }
    group_stage(stage: number) {
        if (this.context.group_stage !== undefined) {
            throw new Error('Tried to redefine the group stage on an UpdatesBuilder.');
        }
        return this.with({ group_stage: stage });
    }
    move_group_to(dest_stage: number): MoveGroup {
        if (this.context.group_name === undefined || this.context.group_stage === undefined) {
            throw new Error('move_group_to() needs both a group_name and a group_stage (the source stage).');
        }
        return { kind: 'MoveGroup', name: this.context.group_name, source_stage: this.context.group_stage, dest_stage };
    }

    // OPS
    add(children: Fragment | Fragment[], no_animate?: boolean) { return this.apply_op(story_op('add', [children, no_animate])); }
    insert_after(siblings: Fragment | Fragment[], no_animate?: boolean) { return this.apply_op(story_op('insert_after', [siblings, no_animate])); }
    css(updates: CSSUpdates) { return this.apply_op(story_op('css', [updates])); }
    remove_eph() { return this.apply_op(story_op('remove_eph', [])); }
    remove() { return this.apply_op(story_op('remove', [])); }
    replace(replacement: Fragment[]) { return this.apply_op(story_op('replace', [replacement])); }
    replace_children(replacement: Fragment[]) { return this.apply_op(story_op('replace_children', [replacement])); }
    set_gist(g: Gist) { return this.apply_op(story_op('set_gist', [g])); }

    // Add text to one of the four categories of output text in a frame.
    action(children: Fragment | Fragment[]) { return this.add_text('action', children); }
    consequence(children: Fragment | Fragment[]) { return this.add_text('consequence', children); }
    description(children: Fragment | Fragment[]) { return this.add_text('description', children); }
    prompt(children: Fragment | Fragment[]) { return this.add_text('prompt', children); }

    private add_text(category: TextCategory, children: Fragment | Fragment[]) {
        const frame = this.context.query === undefined ? this.frame() : this;
        return frame
            .children(Updates.has_class('output-text'))
            .children(Updates.has_class(category))
            .add(children);
    }

    apply_op(op: StoryOpSpec): StoryUpdateCompilationOp {
        const q = this.context.query ?? story_query('frame', [undefined]);
        if (this.context.would) {
            return { kind: 'PushWouldUpdate', update_spec: story_update(q, op) };
        }
        return {
            kind: 'PushStoryUpdate',
            group_name: this.context.group_name,
            stage: this.context.group_stage,
            update_spec: story_update(q, op)
        };
    }

    // HELPERS
    apply(f: (builder: UpdatesBuilder) => StoryUpdaterSpec): StoryUpdaterSpec[] {
        return flat_deep([f(this)]) as StoryUpdaterSpec[];
    }

    to_query_spec(): StoryQuerySpec {
        if (this.context.query === undefined) {
            throw new Error('Tried to convert an UpdatesBuilder to a query before any query methods were called.');
        }
        return this.context.query;
    }

    to_query(): StoryQuery {
        return compile_story_query(this.to_query_spec());
    }

    query(story: Fragment): FoundNode[] {
        return this.to_query()(story);
    }

    // Build an update for every frame in the world's history.
    map_worlds<W extends World>(world: W, f: (w: W, frame: UpdatesBuilder) => StoryUpdaterSpec): StoryUpdaterSpec[] {
        const results = history_array(world).reverse().map(w => f(w, this.frame(w.index)));
        return flat_deep(results) as StoryUpdaterSpec[];
    }
}

const TEXT_CATEGORIES = ['action', 'consequence', 'description', 'prompt'] as const;
type TextCategory = (typeof TEXT_CATEGORIES)[number];

export const Updates = new UpdatesBuilder();

function is_compilation_op(x: StoryUpdateCompilationOp | StoryUpdateSpec): x is StoryUpdateCompilationOp {
    return 'kind' in x;
}

// An updater for world.story_updates that appends the given updates.
export function story_updater(...updates: StoryUpdaterSpec[]): (prev: StoryUpdateCompilationOp[]) => StoryUpdateCompilationOp[] {
    const flat = flat_deep(updates) as (StoryUpdateCompilationOp | StoryUpdateSpec)[];
    const normalized: StoryUpdateCompilationOp[] = flat.map(up =>
        is_compilation_op(up) ? up : { kind: 'PushStoryUpdate', update_spec: up });
    return (prev) => [...prev, ...normalized];
}

export const add_input_text = (world: World, parsing: Parsing): World => {
    return update(world, {
        story_updates: story_updater(
            Updates
                .group_name('init_frame')
                .frame(world.index).first(Updates.has_class('input-text'))
                .add(<ParsedTextStory parsing={parsing} />, true)
        )
    });
};

export const EmptyFrame = (props: { index: number }): StoryNode =>
    <div className="frame" frame_index={props.index}>
        <div className="input-text" />
        <div className="output-text">
            {TEXT_CATEGORIES.map(c => <div className={c}></div>)}
        </div>
    </div> as StoryNode;

export const Hole = (props?: {}): StoryHole => ({ kind: 'StoryHole' });

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
