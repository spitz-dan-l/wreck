/*
    Integrating interpretations and gists...

    It has always seemed like interpretations were a good way to do more than just post-hoc
    css class changes...

    For instance you could use them to change the actual contents of displayed text

    As a point about design, changing the displayed text arbitrarily is almost definitely a
    bad idea. But:
        - It could also be a natural way to *reveal* text, or update it in a way that
            doesn't feel confusing/disorienting
        - The fact that the original message must contain all possible content *feels* wrong,
            metaphysically.

    The lack of composability of messages has been annoying for awhile, if a message is
    actually just a Message gist, it can be composed and have its structure queried easily.

    Gists could also be used to express view change logic. The renderer could gain a new method
    for rendering interpretation label changes
        - How does it work?
            - does the render method return on/off values for one css class, or
            - returns a new css label dictionary?
            - returns an updater function that updates the previous css label dictionary?
            - or... the whole idea of interpretation labels mapped to on/off changes...
                A Message is a gist. An "interpretation" for a given frame is just an updated gist.

                Gists can have a new static method associated with their tags for
                    rendering themselves as html
                    animating an old gist into a new gist

...

        return update(world,
            message_updater({
                description: [
                    `There's a bird up here. His name is Zarathustra.`,
                    impression
                ]
            })
        )

...

// way out at shallowest indentation... :/

const impression = Fragments({
    text: interps => `He is ${interps.vulnerable ? 'sexy' : 'ugly'}.`
});

type Fragment = {
    fragment_id?: string,
    text: (interps: LocalInterpretations) => string,
    effects: (interps2: LocalInterpretations, interps1: LocalInterpretations) => Stages<(elt: HTMLElement) => void>
}

Problems with above
    - Feels awkward to shunt these fragment refs in next to raw text
        when composing messages
    - need some better method of composition

    - need a way to control element first-appearance effects
        - how to tell that it's being created vs it used to have empty interpretations?
        - how to indicate that its creation effect should happen at a later stage?


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
import { key_union } from '../typescript/utils';
import { empty, update, ObjectUpdater, Updater } from './utils';
import { World } from './world';

export type InterpretationLabel = string;

// TODO: when saving/loading, all symbols must be converted to true.
export type InterpretationValue = boolean | symbol;

export type Interpretation = {
    kind: 'Interpretation',
    value: InterpretationValue,
    stage?: number
} 
export type LocalInterpretations = Record<InterpretationLabel, Interpretation>;

export type LocalInterpretationSpec = Record<InterpretationLabel, InterpretationValue | Interpretation>;

export function make_local_interps(spec: LocalInterpretationSpec): LocalInterpretations {
    let result: LocalInterpretations = {};
    for (const [label, value] of Object.entries(spec)) {
        if (typeof value !== 'object') {
            const value2: Interpretation = {
                kind: 'Interpretation',
                value
            };
            result[label] = value2;
        } else {
            result[label] = value;
        }
    }

    return result;
}

export function interps(spec: Record<number, LocalInterpretationSpec>): Interpretations {
    let result: Interpretations = {};

    for (const [index, local_spec] of Object.entries(spec)) {
        result[index] = make_local_interps(local_spec);
    }

    return result;
}

export function label_value(local_interps: LocalInterpretations, label: InterpretationLabel): boolean | symbol {
    if (local_interps[label] === undefined) {
        return false;
    }
    return local_interps[label].value;
}

// export type LocalInterpretations = { [K in InterpretationLabel]: InterpretationType }
export type Interpretations = { [k: number]: LocalInterpretations };

export function interpretation_of(world: World, interps: Interpretations) {
    return interps[world.index];
}

export function self_interpretation<W extends World>(world: W, updater: Updater<LocalInterpretations>) {
    return {
        interpretations: {
            [world.index]: updater
        }
    };
}

// TODO - set all interp stages to undefined
export function pre_interp(interps: Interpretations): Interpretations {
    let u: Updater<Interpretations> = {};
    for (let [index, interp] of Object.entries(interps)) {
        for (let [label, {value, stage}] of Object.entries(interp)) {
            if (typeof value === 'symbol') {
                if (u[index] === undefined) {
                    u[index] = {};
                }
                u[index][label] = undefined;
            }
        }
    }

    if (empty(u)) {
        return interps;
    }

    return update(interps, u);
}

export function interpretation_updater<W extends World>(world: W, f: (w: W) => LocalInterpretationSpec) {
    return { interpretations: (prev_interps: Interpretations) => {
        let hist_world: W | null = world;
        let u: Updater<Interpretations> = {};
        
        while (hist_world !== null) {
            let uu = make_local_interps(f(hist_world));
            
            if (!empty(uu)) {
                u[hist_world.index] = uu;
            }
            hist_world = hist_world.previous;
        }

        if (empty(u)) {
            return prev_interps;
        }

        return update(prev_interps, u);
    }};
}

export function find_historical<W extends World>(world: W, f: (w: W) => boolean) {
    let w: W | null = world;

    while (w != null) {
        if (f(w)) {
            return w;
        }
        w = w.previous;
    }

    return null;
}

export function find_index<W extends World>(world: W, index: number) {
    return find_historical(world, w => w.index === index);
}

// When mapping or filtering history, simply converting to an array is easier than
// reimplementing all the various traversal methods on the linked list
export function history_array<W extends World>(world: W) {
    let w: W | null = world;
    let result: W[] = [];
    while (w != null) {
        result.push(w);
        w = w.previous;
    }

    return result;
}

export type CompoundWorld<W extends World> = {
    kind: 'CompoundWorld',
    root: W,
    children: MaybeCompoundWorld<W>[]
}
export type MaybeCompoundWorld<W extends World> = CompoundWorld<W> | W;
export function is_compound_world<W extends World>(x: MaybeCompoundWorld<W>): x is CompoundWorld<W> {
    return (x as any).kind === 'CompoundWorld'; 
}

export function group_compound_worlds<W extends World>(world: W) {
    type RunInfo = null | { start: number, parent: W };

    let result: MaybeCompoundWorld<W>[] = history_array(world).reverse();

    let another_pass: boolean;
    do {
        another_pass = false;
        const next_result: MaybeCompoundWorld<W>[] = [];
        let run_info: RunInfo = null;
        
        function push_run(r_info: Exclude<RunInfo, null>, end: number) {
            const run = result.slice(r_info.start, end);
            next_result.push({
                kind: 'CompoundWorld',
                root: r_info.parent,
                children: run
            });
            run_info = null;
            another_pass = true;
        }
        
        for (let i = 0; i < result.length; i++) {
            const w = result[i];
            const parent = (is_compound_world(w) ? w.root : w).parent;

            if (run_info !== null) {
                if (parent !== run_info.parent) {
                    // this is the end of a run
                    push_run(run_info, i);
                } else {
                    continue;
                }
            }

            if (parent !== null) {
                run_info = {
                    start: i,
                    parent: parent
                };            
            } else {
                next_result.push(w);
            }

        }

        if (run_info !== null) {
            push_run(run_info, result.length);
        }
        result = next_result;
    } while (another_pass);

    return result;
}