import { Effects } from '../../effect_utils';
import { history_array } from '../../history';
import { Parsing } from '../../parser';
import { Stages, stages, stage_entries, stage_keys } from '../../stages';
import { ParsedTextStory } from '../../UI/components/parsed_text';
import { append, update } from '../../utils';
import { World } from '../../world';
import { createElement } from '../create';
import { find_all_nodes, find_node, FoundNode, Fragment, is_story_hole, is_story_node, Path, replace_in, splice_in, StoryHole, StoryNode } from '../story';
import { compile_story_update_op, StoryOpSpec, story_op, StoryOpSpecs } from './op';
import { compile_story_query, StoryQueryIndex, StoryQuerySpec, story_query, StoryQueries, StoryQuerySpecs } from './query';
import { StoryUpdateGroup } from './update_group';

export type Story = StoryNode & { __brand: 'Story' };

export type StoryUpdate = (story: Story, effects?: Effects<HTMLElement>) => Story;


export type StoryUpdateSpec = {
    query: StoryQuerySpec,
    op: StoryOpSpec
};

export type ReversibleOpSpec = StoryOpSpec & { name: 'css' };
export type ReversibleUpdateSpec = StoryUpdateSpec & { op: ReversibleOpSpec };

// StoryUpdates stages are the groupings of updates for animation.
export type StoryUpdatePlan = {
    would_effects: ReversibleUpdateSpec[]
    effects: Stages<StoryUpdateGroup[]>;
}

export type StoryUpdateStage = StoryUpdateGroup[];

// export type StoryUpdatePlan = {
//     would_effects: ReversibleUpdateSpec[]
//     effects: Stages<StoryUpdateSpec[]>;
// }

export function story_update(query: StoryQuerySpec, op: StoryOpSpec): StoryUpdateSpec {
    return { query, op };
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

export function sort_targets(targets: FoundNode[]) {
    // sort the deepest and last children first
    // this guarantees that no parent will be updated before its children
    // and no child array's indices will move before its children are updated
    return [...targets].sort(([,path1], [,path2]) => {
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
}

export function compile_story_update(story_update: StoryUpdateSpec): StoryUpdate {
    return (story, effects?): Story => {
        const targets = compile_story_query(story_update.query)(story);        
        const op = compile_story_update_op(story_update.op);

        for (const [target, path] of sort_targets(targets)) {
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


export function apply_story_updates_stage(story: Story, story_updates: StoryUpdateStage, effects?: Effects<HTMLElement>) {
    return story_updates.reduce((story, update_group) => 
        update_group.updates.reduce((story, update) =>
            apply_story_update(story, update, effects),
            story),
        story);
}

export function remove_eph(story: Story, effects?: Effects<HTMLElement>) {
    return apply_story_update(
        story,
        story_update(
            story_query('eph', {}),
            story_op('remove_eph', {})
        ),
        effects
    );
}

export function apply_story_updates_all(story: Story, story_updates: StoryUpdatePlan) {
    let result = story;

    for (const [stage, updates] of stage_entries(story_updates.effects)) {
        result = apply_story_updates_stage(result, updates);
        result = remove_eph(result);
    }
    return result;
}