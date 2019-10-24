import { StoryUpdateSpec, StoryUpdateStage } from "./update";
import { Stages, stage_entries, stages } from "../../stages";
import { append, update } from "../../utils";

export interface StoryUpdateGroups {
    init_frame: 'Updates that initialize the new frame and move the storyhole forward';
    updates: "Generic updates that you don't need a distinct group for.";
}

export type StoryUpdateGroup = {
    name: keyof StoryUpdateGroups,
    updates: StoryUpdateSpec[]
}

export function story_update_group(updates: StoryUpdateSpec[]): StoryUpdateGroup;
export function story_update_group<K extends keyof StoryUpdateGroups>(updates: StoryUpdateSpec[], name: K): StoryUpdateGroup;
export function story_update_group(updates: StoryUpdateSpec[], name: keyof StoryUpdateGroups='updates'): StoryUpdateGroup {
    return { name, updates };
}

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