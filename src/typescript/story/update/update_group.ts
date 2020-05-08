import { StoryUpdateSpec, StoryUpdateStage, StoryUpdatePlan } from "./update";
import { Stages, stage_entries, stages } from "../../lib/stages";
import { append, update, Updater, map } from "../../lib/utils";

export interface StoryUpdateGroups {
    init_frame: 'Updates that initialize the new frame and move the storyhole forward';
    updates: "Generic updates that you don't need a distinct group for.";
}

export type GroupName = keyof StoryUpdateGroups;

export type StoryUpdateGroup = {
    kind: 'StoryUpdateGroup',
    name: GroupName,
    update_specs: StoryUpdateSpec[]
}

export type StoryUpdateCompilationOp =
    | PushStoryUpdate
    | PushWouldUpdate
    | MoveGroup;

export type PushStoryUpdate = {
    kind: 'PushStoryUpdate',
    group_name?: GroupName,
    stage?: number,
    update_spec: StoryUpdateSpec,
};

export type PushWouldUpdate = {
    kind: 'PushWouldUpdate',
    update_spec: StoryUpdateSpec
};

export type MoveGroup = {
    kind: 'MoveGroup',
    name: GroupName,
    source_stage: number,
    dest_stage: number
};

export function apply_story_update_compilation_op(plan: StoryUpdatePlan, op: StoryUpdateCompilationOp): StoryUpdatePlan {
    if (op.kind === 'MoveGroup') {
        return {
            effects: move_group(plan.effects, op.name, op.source_stage, op.dest_stage),
            would_effects: plan.would_effects
        };
    }

    if (op.kind === 'PushWouldUpdate') {
        return update(plan, {
            would_effects: append(op.update_spec)
        })
    }
    
    const group_name = op.group_name ?? 'updates';
    let group_index: number | undefined = undefined;
    let stage = op.stage;

    function find_group_index(groups: StoryUpdateStage) {
        return groups.findIndex(g => g.name === group_name);
    }

    if (stage === undefined) {
        for (const [s, groups] of stage_entries(plan.effects)) {
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

    if (!plan.effects.has(stage)) {
        group_index = -1;
    }

    if (group_index === undefined) {
        group_index = find_group_index(plan.effects.get(stage)!);
    }

    if (group_index === -1) {
        return update(plan, {
            effects: stages([stage, append<StoryUpdateGroup>({
                kind: 'StoryUpdateGroup',
                name: group_name,
                update_specs: [op.update_spec]
            })])
        });
    } else {
        return update(plan, {
            effects: stages([stage, {
                [group_index]: {
                    update_specs: append(op.update_spec)
                }
            }])
        });
    }
}

export function move_group(plan: StoryUpdatePlan['effects'], name: keyof StoryUpdateGroups, source_stage: number, dest_stage: number) {
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