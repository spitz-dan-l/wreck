/*
    Goals
        - Multi-step animations
            - first reveal text changes up top, then after a confirmation prompt, reveal text down below
            - For compound commands/actions, animate each component action in series (separated by confirmation prompts)
        - better factoring of animation logic than the current CSS spaghetti
            - Should be "aware" of interpretations and what can happen with them,
                rather than "just happening" to have them correspond with css classes?
        - more concise expression of animation logic than CSS transitions
        - if I can remove the gross animate() function from Terminal.tsx, great

        - maintain positive aspects of current system
            - the static appearance of a history elt correspends to its current
                interpretation labels used as css classes
                - Undo "just worked" because of this.
            - currently the lack of sequential or input-interrupted effects makes
                the general UI more functional/declarative.
                No state to maintain about where in the current animation we are, no need to
                prevent or intercept keyboard inputs.


        Idea:
        Explicitize "the previous state" (ie the previous compound command)
        in either the world model or just the UI model. Then the UI will have access to
            - which history elements are appearing
            - which are changing their interps and in what way
        By knowing this up-front, we can determine what order to animate things in.
            - Handle the case of non-compound commands first, because it already exists

        Do some experiments to find better factorings of the actual animation logic
            - could be animejs, could be gsap, could be neither
            - whatever it is, the logic/rules for this will be registered by WorldSpec/puffers.


        Animating in stages
        Can the stage separation and order be determined by static css-like rules?
            I don't think so
        Extend interpretations to provide a numeric stage along with the "value"
            Should it reuse the Stages type from puffers? Or should the interp values
            become compound and include a stage?

        In the UI, check how many total stages there are after an update,
        and schedule out each stage sequentially

* after a weekend of vacation and reflection *

Ultimately Interpretations still need to be just boolean or symbol.

No Gists. Gists do not map well enough onto the css-class/effect use case.

For updatable, composable text we just need statically registered functions
    which take the interpretations, (or maybe the world plus most recent interpretations)
    as input and return a string as output.


Now onto animations/effects.

The key realization for effects is that they always happen on a
per-interpretation-label basis.

So there is less need for multi-label rules than I had thought.

I think what is really needed is a system of coordinating effects in stages

The basic scheme would be:

- A state variable is set to disable normal user control
- World updates.
- UI looks at new world state, and still has previous state on hand.
    - Finds which labels are being added/removed to which frames
        - If multiple frames added, the effects of each successive frame will be applied
        in order
    - For each added or removed label, it will have a stage number
        - if none provided, default 0.
    - Initial creation of the frame will have a stage assignment too
        - To control whether it appears before or after label changes on previous states
- All effects will be grouped by their stage
- For each stage:
    - The result css classes are applied to compute layout
    - For each 1-label effect (or frame creation) in that stage:
        - A layout frame callback is invoked to handle that one label.
        - Whenever it is done, it will call a done callback
    - When all callbacks are done,
        - Possibly prompt the user for an input?
        - proceed to the next stage
- When all stages are done
    - Return control to the user

TODO
- start by just updating the UI logic to explicitly find the changed interp labels per-frame,
- set up the logic that schedules one animation callback per changed label
- and waits for the results
- add creation as a special case

- then turn all interpretations into Stages<LocalInterpretations>
- UI groups by stage and dispatches changes per-stage

- add ability to specify static interp-label animator callbacks,
    separate from css classes
- add input prompt/disable normal user inputs

*/

import { label_value, LocalInterpretations, InterpretationValue } from '../typescript/interpretation';
import { Stages, stage_keys, stages } from '../typescript/stages';
import { key_union, update } from '../typescript/utils';
import { World } from '../typescript/world';
import { normalize_whitespace } from '../typescript/text_tools';
import { Story, StoryUpdates } from '../typescript/text';

export type AnimationState = {
  changes: InterpretationChanges,
  current_stage: number | undefined,
  lock_input: boolean
}

export const empty_animation_state: AnimationState = {
  changes: { label_changes: stages(), new_frames: {}, base_state: {} },
  current_stage: undefined,
  lock_input: false
};

export function new_animation_state(new_world: World, old_world: World): AnimationState {
  // produce a new AnimationState object according to the changes, with stage set to the lowest included stage
  let changes = interpretation_changes(new_world, old_world);
  let stages = stage_keys(changes.label_changes);
  let current_stage: number | undefined = stages[0];
  return { changes, current_stage, lock_input: stages.length > 0 };
}

export function advance_animation(state: AnimationState) {
  let stages = stage_keys(state.changes.label_changes)
  let next_stage = stages[stages.indexOf(state.current_stage!) + 1];
  return update(state, {
    current_stage: next_stage,
    lock_input: next_stage !== undefined// && next_stage < stages[stages.length - 1]
  });
}

export function animate(comp_elt: HTMLDivElement, changes: IndexChanges) {
  return new Promise<void>((resolve) => {
    // Momentarily apply the animation-pre-compute class
    // to accurately measure the target maxHeight
    // and check for the custom --is-collapsing property
    // (This is basically an abomination and I am sorry.)
    comp_elt.classList.add('animation-pre-compute');

    walkElt(comp_elt, (e) => e.dataset.maxHeight = `${e.scrollHeight}px`);

    comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0 as any;

    comp_elt.classList.remove('animation-pre-compute');

    // TODO: dispatch all the changes separately based on label and op

    let edit_classes = Object.entries(changes).map(([label, op]) =>
      (op === 'Adding' ? 'adding-' : 'removing-') + label);

    comp_elt.classList.add('animation-start', ...edit_classes);

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
          'animation-active',
          ...edit_classes);

        walkElt(comp_elt, (e) => e.style.maxHeight = '');

        if (changes['animation-new'] === 'Adding') {
          scroll_down();
          // function post_scroll(e) {
          //   window.removeEventListener('scroll', post_scroll);
          //   resolve();
          // }
          // window.addEventListener('scroll', post_scroll);
          // setTimeout(post_scroll, 200);
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

export type IndexChanges = { [label: string]: 'Adding' | 'Removing' };

export type InterpretationChanges = {
    label_changes: Stages<{ [index: number]: IndexChanges }>,
    new_frames: { [index: number]: number }
    base_state: { [index: number]: Stages<{ [label: string]: boolean }> }
}

/*
    TODO
    adopt a consistent iteration style (for in, for of Object.entries, ...)
    somehow organize/shorten this...
*/
export function interpretation_changes(world2: World, world1: World): InterpretationChanges {
    const changes_per_stage: Stages<{ [index: number]: IndexChanges }> = stages();
    const new_frames: { [index: number]: number } = {};
    const base_state: { [index: number]: Stages<{ [label: string]: boolean }> } = {};
    
    let max_stage = 0;
    function add_change(stage: number, index: number, label: string, op: 'Adding' | 'Removing') {
        /*
            If the change is for a new history elt and the animation-new for it would happen after
            the passed in stage, clamp the stage for this change to happen on the same stage
            as the animation-new.
        */
        if (new_frames[index] !== undefined && new_frames[index] > stage) {
            console.log(`Clamping an interpretation change for ${label}. Would have happened at ${stage}, now at ${new_frames[index]}. Op is ${op}`);
            stage = new_frames[index];
        }

        let stage_changes = changes_per_stage.get(stage);
        if (stage_changes === undefined) {
            stage_changes = {};
            changes_per_stage.set(stage, stage_changes);
        }

        let idx_changes = stage_changes[index];
        if (idx_changes === undefined) {
            idx_changes = stage_changes[index] = {};
        }

        idx_changes[label] = op;

        if (stage > max_stage) {
            max_stage = stage;
        }
    }

    function add_base_state(index: number, stage: number, label: string, value: boolean) {
      let idx_base_state = base_state[index];
      if (idx_base_state === undefined) {
        idx_base_state = base_state[index] = stages();
      }

      let stage_base_state = idx_base_state.get(stage);
      if (stage_base_state === undefined) {
        stage_base_state = {};
        idx_base_state.set(stage, stage_base_state); 
      }

      stage_base_state[label] = value;
    }

    // add the pseudo-label "animation-new" for any additional frames
    const new_worlds: World[] = [];
    let w2: World | null = world2;
    while (w2 !== null && w2.index > world1.index) {
        new_worlds.unshift(w2);
        w2 = w2.previous;
    }

    let stage_offset = 0;
    for (let w2 of new_worlds) {
        const w1 = w2.previous!;
        const new_stages = new Set<number>();

        let animation_new_stage = 0;
        if (w2.interpretations[w2.index] &&
            w2.interpretations[w2.index]['animation-new'] &&
            w2.interpretations[w2.index]['animation-new'].stage !== undefined) {
            animation_new_stage = w2.interpretations[w2.index]['animation-new'].stage!;
        }
        new_frames[w2.index] = animation_new_stage + stage_offset;
        add_change(animation_new_stage + stage_offset, w2.index, 'animation-new', 'Adding');
        new_stages.add(animation_new_stage + stage_offset);

        // perform the actual diff across frames.
        for (const i in w2.interpretations) {
            const interps2 = w2.interpretations[i];
            if (i in w1.interpretations) {
                const interps1 = w1.interpretations[i];
                if (interps2 === interps1) {
                    continue;
                }
                for (const label of key_union(interps2, interps1)) {
                    if (label_value(interps2, label) !== label_value(interps1, label) &&
                        (label_value(interps2, label) || label_value(interps1, label) === true)) {
                        const s = (interps2[label].stage || 0) + stage_offset;
                        add_change(s, i as unknown as number, label, label_value(interps2, label) ? 'Adding' : 'Removing');
                        new_stages.add(s);
                    }
                }
            } else {
                for (const label of Object.keys(interps2)) {
                    if (label_value(interps2, label)) {
                        const s = (interps2[label].stage || 0) + stage_offset;
                        add_change(s, i as unknown as number, label, 'Adding');
                        new_stages.add(s);
                    }
                }
            }
        }

        const new_stages2 = [...new_stages.values()].sort((a,b) => a-b);

        for (let i = 0; i < new_stages2.length; i++) {
            const new_stage = new_stages2[i];
            for (const ind in w1.interpretations) {
                const index = ind as unknown as number;
                for (const label in w1.interpretations[index]) {
                    const value = w1.interpretations[index][label];
                    add_base_state(index, new_stage, label, !!value.value);
                }
            }

            let idx_changes = changes_per_stage.get(new_stage)!;
            for (let [index, changes] of Object.entries(idx_changes)) {
                for (let [label, op] of Object.entries(changes)) {
                    if (label === 'animation-new') {
                        continue;
                    }
                    // backfill with would-add/would-remove
                    const would_class = `would-${op === 'Adding' ? 'add' : 'remove'}-${label}`;
                    for (let j = 0; j < i; j++) {
                        const prev_stage = new_stages2[j];
                        add_base_state(index as unknown as number, prev_stage, would_class, true);
                    }
                    // frontfill with the new value
                    const new_value = label_value(w2.interpretations[index as unknown as number], label);
                    for (let j = i; j < new_stages2.length; j++) {
                        const updated_stage = new_stages2[j];
                        add_base_state(index as unknown as number, updated_stage, label, !!new_value);
                    }
                }
            }
        }

        stage_offset = max_stage + 1;
    }

    const stage_levels = stage_keys(changes_per_stage);
    for (const [index, stage] of Object.entries(new_frames)) {
        let stage_idx = stage_levels.indexOf(stage);
        for (let i = 0; i < stage_idx; i++) {
            let s = stage_levels[i];
            add_base_state(index as unknown as number, s, 'would-add-animation-new', true);
        }
    }

    return {
        label_changes: changes_per_stage,
        new_frames,
        base_state
    };
}