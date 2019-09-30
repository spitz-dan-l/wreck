import { Story, StoryUpdates, FrameUpdate, apply_story_updates, apply_frame_update, find_eph, remove_eph } from "../text";
import { World } from "../world";
import { stage_entries, stages, map_stages, stage_keys, Stages } from "../stages";
import { update } from "../utils";
import { P } from "ts-toolbelt/out/types/src/Object/_api";

export type AnimationState = {
    story_updates: StoryUpdates,
    current_stage: number | undefined,
    lock_input: boolean
}
  
export const empty_animation_state: AnimationState = {
    story_updates: stages(),
    current_stage: undefined,
    lock_input: false
};
  
export function new_animation_state(world: World): AnimationState {
    // produce a new AnimationState object according to the changes, with stage set to the lowest included stage
    const story_updates = world.story_updates;
    let stages = stage_keys(story_updates);
    let current_stage: number | undefined = stages[0];
    return {
        story_updates,
        current_stage,
        lock_input: stages.length > 0 };
}
  
export function advance_animation(state: AnimationState) {
    let stages = stage_keys(state.story_updates);
    let next_stage = stages[stages.indexOf(state.current_stage!) + 1];
    return update(state, {
        current_stage: next_stage,
        lock_input: next_stage !== undefined
    });
}
  
export function set_history_view(root: HTMLElement, story: Story) {
    for (const [stage, frame] of stage_entries(story)) {
        let prev_frame = root.querySelector(`[data-index="${stage}"]`);
        if (prev_frame === null) {
            root.appendChild(frame);
        } else {
            if (prev_frame !== frame) {
                prev_frame.replaceWith(frame);
            }
        }
    }
    return root;
}

export function extract_story(root: HTMLElement): Story {
    const result: Story = stages();
    const children = Array.from(root.children) as HTMLElement[];
    for (const child of children) {
        const index = parseInt(child.dataset.index!);
        if (index == NaN) {
            throw new Error('Tried to extract a story frame with missing or invalid data-index attribute.');
        }
        result.set(index, child);
    }

    return result;
}


// update the view for one stage of changes
export function update_history_view(root_elt: HTMLElement, updates: FrameUpdate[]) {
    const story = extract_story(root_elt);
    let result = stages(...story);

    for (const update of updates) {
        apply_frame_update(result, update); 
    }

    for (const [stage, elt] of stage_entries(result)) {
        const old_elt = story.get(stage);
        if (elt === old_elt) {
            continue;
        }
        if (old_elt === undefined) {
            root_elt.appendChild(elt);
        } else {
            root_elt.replaceChild(elt, old_elt);
        }
    }

    return result;
}

export async function start_animations(root_elt: HTMLElement, story: Story) {
    await Promise.all(map_stages(story, elt => animate(elt)).values());
    return remove_eph(root_elt);
}

export function compute_possible_labels(possible_world: World): FrameUpdate[] {
    // find all class differences between story and possible_story.
    // add would-add/would-remove classes to story

    // scan through the CSS changes for this frame, keeping only the last class for each index and selector.
    const possible_updates = stage_entries(possible_world.story_updates)
        .flatMap(([s, updates]) =>
            updates.filter(update =>
                update.op.kind === 'CSS'));
    
    const final_story = apply_story_updates(possible_world.story, possible_world.story_updates);
    const would_updates: FrameUpdate[] = [];

    for (const update of possible_updates) {
        if (update.op.kind !== 'CSS') {
            continue;
        }

        const frame_0 = possible_world.story.get(update.index);
        const frame_1 = final_story.get(update.index);

        if (frame_0 === undefined || frame_0 === frame_1) {
            continue;
        }

        let target_elt_0: HTMLElement, target_elt_1: HTMLElement;
        if (update.selector === undefined) {
            target_elt_0 = frame_0;
            target_elt_1 = frame_1!;
        } else {
            target_elt_0 = frame_0.querySelector(update.selector)! as HTMLElement;
            target_elt_1 = frame_1!.querySelector(update.selector)! as HTMLElement;
        }
        
        for (const cls in update.op.updates) {
            let sign: 'add' | 'remove';
            const present_0 = target_elt_0.classList.contains(cls);
            const present_1 = target_elt_1.classList.contains(cls);
            if (present_0 && !present_1) {
                sign = 'remove';
            } else if (!present_0 && present_1) {
                sign = 'add';
            } else if (cls.startsWith('eph-')) {
                // weird corner case where eph- classes wouldn't otherwise show up but it's useful
                // to have them trigger would- classes.
                sign = update.op.updates[cls] ? 'add' : 'remove';
            } else {
                continue;
            }

            would_updates.push({
                index: update.index,
                selector: update.selector,
                op: {
                    kind: 'CSS',
                    updates: {
                        [`would-${sign}-${cls}`]: true
                    }
                }
            });
        }
    }
    return would_updates;
}

export function animate(comp_elt: HTMLElement) {
    if (find_eph(comp_elt).length === 0) {
        return Promise.resolve();
    }

    return new Promise<void>((resolve) => {
        // Momentarily apply the animation-pre-compute class
        // to accurately measure the target maxHeight
        // and check for the custom --is-collapsing property
        // (This is basically an abomination and I am sorry.)
        comp_elt.classList.add('animation-pre-compute');

        walkElt(comp_elt, (e) => e.dataset.maxHeight = `${e.scrollHeight}px`);

        comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0 as any;

        comp_elt.classList.remove('animation-pre-compute');

        comp_elt.classList.add('animation-start');

        // If --is-collapsing was set by the animation-pre-compute class,
        // then apply the maxHeight update at the end of this animation frame
        // rather than the beginning of the next one.
        // I have no idea why this works/is necessary, but it does/is.
        if (comp_elt.dataset.isCollapsing == 1 as any) {
            walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight as any);
        }

        requestAnimationFrame(() => {
        // If --is-collapsing wasn't set in the animation-pre-compute class,
        // then apply the maxHeight update now.
        // Websites technology keyboard mouse.
        if (comp_elt.dataset.isCollapsing != 1 as any) {
            walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight as any);
        }

        comp_elt.classList.add('animation-active');

        setTimeout(() => {
            comp_elt.classList.remove(
                'animation-start',
                'animation-active');

            walkElt(comp_elt, (e) => {
                e.style.maxHeight = null; // = '';
                delete e.dataset.maxHeight;
                delete e.dataset.isCollapsing;
            });

            if (comp_elt.classList.contains('eph-new')) {
                scroll_down();
            }
            resolve();
        }, 700)

        });
    });
}
  
function walkElt(elt, f: (e: HTMLElement) => void){
    let children = elt.children;
    for (let i = 0; i < children.length; i++) {
        let child = children.item(i);
        walkElt(child, f);
    }
    f(elt);
}
  
export function scroll_down() {
    let bottom = document.querySelector('.typeahead .footer')!;
    bottom.scrollIntoView({behavior: "smooth", block: "end", inline: "end"});
}