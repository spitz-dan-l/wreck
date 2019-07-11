import { World } from './world';
import {deep_equal, update, Updater, empty} from './utils';
import { GistStructure } from './gist';


export type InterpretationLabel = string;

export type InterpretationType = boolean | symbol;
export type LocalInterpretations = { [K in InterpretationLabel]: InterpretationType }
export type Interpretations = { [k: number]: LocalInterpretations };

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

export function history_array<W extends World>(world: W) {
    let w: W | null = world;
    let result: W[] = [];
    while (w != null) {
        result.push(w);
        w = w.previous;
    }

    return result;
}




