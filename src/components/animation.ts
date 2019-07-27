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

import {World} from '../typescript/world';
import {IndexChanges, interpretation_changes, InterpretationChanges} from '../typescript/interpretation';
import {key_union, update} from '../typescript/utils';
import * as React from 'react';
import {Stages, stage_keys} from '../typescript/stages';

export type AnimationState = {
  changes: InterpretationChanges,
  current_stage: number | undefined
}

export const empty_animation_state: AnimationState = {
  changes: { label_changes: { kind: 'Stages' }, new_frames: {} },
  current_stage: undefined
};

export function new_animation_state(new_world: World, old_world: World): AnimationState {
  // produce a new AnimationState object according to the changes, with stage set to the lowest included stage
  let changes = interpretation_changes(new_world, old_world);
  let stages = stage_keys(changes.label_changes);
  let current_stage: number | undefined = stage_keys(changes.label_changes)[0];
  return { changes, current_stage };
}

export function is_animating(a: AnimationState) {
  return a.current_stage !== undefined;
}

export function advance_animation(state: AnimationState) {
  let stages = stage_keys(state.changes.label_changes)
  let next_stage = stages[stages.indexOf(state.current_stage!) + 1];
  return update(state, { current_stage: next_stage });
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
          // 'animation-new',
          'animation-start',
          'animation-active',
          ...edit_classes);

        walkElt(comp_elt, (e) => e.style.maxHeight = '');
        
        if (changes['animation-new'] === 'Adding') {
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
    walkElt(child, f)
  }
  f(elt)
}

export function scroll_down() {
  let bottom = document.querySelector('.typeahead .footer')!;
  bottom.scrollIntoView({behavior: "smooth", block: "end", inline: "end"});
}




