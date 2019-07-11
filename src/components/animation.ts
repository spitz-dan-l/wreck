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



*/


import anime from 'animejs';


anime({ targets: 'butt' });
