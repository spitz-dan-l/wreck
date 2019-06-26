import { World } from './world';
import {deep_equal, update, Updater, empty} from './utils';


export type InterpretationLabel = string;

export type InterpretationType = boolean | symbol;
export type LocalInterpretations = { [K in InterpretationLabel]: InterpretationType }
export type Interpretations = { [k: number]: LocalInterpretations };

let x: Updater<Interpretations> = {
    [0]: {
        horse: Symbol()
    }
}

export function interpretation_of(world: World, interps: Interpretations) {
    return interps[world.index];
}

export function self_interpretation(world: World) {
    return world.interpretations[world.index];
}

export function pre_interp(interps: Interpretations): Interpretations {
    let u: Updater<Interpretations> = {};
    for (let [index, interp] of Object.entries(interps)) {
        for (let [label, val] of Object.entries(interp)) {
            if (typeof val === 'symbol') {
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

// export function map_interpretations<W extends World>(world: W, f: (w: W, prev_interp?: LocalInterpretations) => LocalInterpretations) {
//     let hist_world: W | null = world;
//     let u: Updater<Interpretations> = {};
    
//     while (hist_world !== null) {
//         let old_interp = world.interpretations[hist_world.index];
//         let new_interp = f(hist_world, old_interp);
        
//         if (!deep_equal(new_interp, old_interp)) {
//             u[hist_world.index] = () => new_interp;
//         }

//         hist_world = hist_world.previous;
//     }

//     if (empty(u)) {
//         return world.interpretations;
//     }
//     return update(world.interpretations, u);
// }

export function interpretation_updater<W extends World>(world: W, f: (w: W) => Updater<LocalInterpretations>) {
    return { interpretations: (prev_interps: Interpretations) => {
        let hist_world: W | null = world;
        let u: Updater<Interpretations> = {};
        
        while (hist_world !== null) {
            let old_interp = prev_interps[hist_world.index];
            let uu = f(hist_world);
            
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