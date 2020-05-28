import { history_array } from "history";
import { make_consecutive, stages, stage_keys } from "lib/stages";
import { update } from "lib/utils";
import { apply_story_updates_all, Story, StoryUpdatePlan, StoryUpdateSpec, compile_story_update_group_ops } from "story";
import { World } from "world";
import { eph_new, animation_pre_compute, animation_start, animation_active } from './styles';

export type AnimationState = {
    update_plan: StoryUpdatePlan['effects'],
    current_stage: number | undefined,
    current_story: Story | undefined,
    lock_input: boolean
}
  
export const empty_animation_state: AnimationState = {
    update_plan: stages(),
    current_stage: undefined,
    current_story: undefined,
    lock_input: false
};
  
export function new_animation_state(world: World, previous_world: World | undefined): AnimationState {
    // produce a new AnimationState object according to the changes, with stage set to the lowest included stage
    const index_threshold = previous_world ? previous_world.index : -1;//world.index - 1;
    const new_frames = history_array(world).filter(w => w.index > index_threshold).reverse();
    const story_updates = make_consecutive(new_frames.map(w => compile_story_update_group_ops(w.story_updates).effects));
    let stages = stage_keys(story_updates);
    let current_stage: number | undefined = stages[0];
    return {
        update_plan: story_updates,
        current_stage,
        current_story: new_frames[0].story,
        lock_input: stages.length > 0 };
}
  
export function advance_animation(state: AnimationState, next_story: Story) {
    let stages = stage_keys(state.update_plan);
    let next_stage = stages[stages.indexOf(state.current_stage!) + 1];
    return update(state, {
        current_stage: next_stage,
        current_story: next_story,
        lock_input: next_stage !== undefined
    });
}

export function final_story(world: World) {
    return apply_story_updates_all(world.story, world.story_updates);
}

export function compute_possible_effects(world: World, possible_world: World): StoryUpdateSpec[] {
    const p_worlds = history_array(possible_world).filter(w => w.index >= world.index);
    return p_worlds.reverse().flatMap(p => compile_story_update_group_ops(p.story_updates).would_effects);
} 

// export function compute_possible_effects(world: World, possible_world: World): ReversibleUpdateSpec[] {
//     const p_worlds = history_array(possible_world).filter(w => w.index > world.index);

//     const result: StoryUpdateSpec[] = [];
//     for (const p_world of p_worlds) {
//         for (const w_ef of p_world.story_updates.would_effects) {
//             const matches = compile_story_query(w_ef.query)(p_world.story);
//             for (const [m, p] of matches) {
//                 if (!is_story_node(m)) {
//                     continue;
//                 }
//                 if (find_node(world.story, (n => is_story_node(n) && n.key === m.key)) !== null) {
//                     result.push(story_update(
//                         story_query('key', m.key),
//                         w_ef.op
//                     ))
//                 }
//             }
//         }
//     }
//     return result;
// }

export function animate(comp_elt: HTMLElement) {
    return new Promise<void>((resolve) => {
        // Momentarily apply the animation-pre-compute class
        // to accurately measure the target maxHeight
        // and check for the custom --is-collapsing property
        // (This is basically an abomination and I am sorry.)
        
        // comp_elt.classList.add('animation-pre-compute');
        comp_elt.classList.add(animation_pre_compute);

        walkElt(comp_elt, (e) => e.dataset.maxHeight = `${e.scrollHeight}px`);

        comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0 as any;

        // comp_elt.classList.remove('animation-pre-compute');

        // comp_elt.classList.add('animation-start');
        comp_elt.classList.remove(animation_pre_compute);

        comp_elt.classList.add(animation_start);

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

            // comp_elt.classList.add('animation-active');
            comp_elt.classList.add(animation_active);

            setTimeout(() => {
                // comp_elt.classList.remove(
                //     'animation-start',
                //     'animation-active');
                comp_elt.classList.remove(
                    animation_start,
                    animation_active);

                walkElt(comp_elt, (e) => {
                    e.style.maxHeight = '';
                    delete e.dataset.maxHeight;
                    delete e.dataset.isCollapsing;
                });

                let anything_new = false;
                walkElt(comp_elt, e => {
                    // if (e.classList.contains('eph-new')) {
                    if (e.classList.contains(eph_new)) {
                        anything_new = true;
                    }
                });
                if (anything_new) {
                    scroll_down();
                }
                resolve();
            }, 700)
        });
    });
}
  
function walkElt(elt: HTMLElement, f: (e: HTMLElement) => void){
    let children = elt.children;
    for (let i = 0; i < children.length; i++) {
        let child = children.item(i);
        walkElt(child as HTMLElement, f);
    }
    f(elt);
}
  
export function scroll_down() {
    let bottom = document.querySelector('.typeahead .footer')!;
    bottom.scrollIntoView({behavior: "smooth", block: "end", inline: "end"});
}