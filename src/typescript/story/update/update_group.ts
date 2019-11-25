import { StoryUpdateSpec, StoryUpdateStage } from "./update";
import { Stages, stage_entries, stages } from "../../lib/stages";
import { append, update, Updater, map } from "../../lib/utils";

export interface StoryUpdateGroups {
    init_frame: 'Updates that initialize the new frame and move the storyhole forward';
    updates: "Generic updates that you don't need a distinct group for.";
}

export type StoryUpdateGroup = {
    kind: 'StoryUpdateGroup',
    name: keyof StoryUpdateGroups,
    stage?: number,
    updates: StoryUpdateSpec[]
}

export function push_group(plan: Stages<StoryUpdateStage>, group: StoryUpdateGroup) {
    let group_index: number | undefined = undefined;
    let stage = group.stage;

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

export function move_group(plan: Stages<StoryUpdateStage>, name: keyof StoryUpdateGroups, source_stage: number, dest_stage: number) {
    if (source_stage === dest_stage) {
        throw new Error('source_stage and dest_stage cannot be equal');
    }
    const found_grp_i = (plan.get(source_stage) || []).findIndex(g => g.name === name);
    if (found_grp_i === -1) {
        return plan;
    }

    const found_grp = plan.get(source_stage)![found_grp_i];

    return update(plan, stages(
        [source_stage, {
            [found_grp_i]: undefined
        }],
        [dest_stage, append(found_grp)]
    ));
}