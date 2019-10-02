import { array_last } from "./utils";

export class Stages<X> extends Map<number, X> {
}

export function stages<X>(...args: Array<readonly [number, X]>) {
    return new Stages(args);
}

export function array_to_stages<X>(arr: X[]): Stages<X> {
    return stages(...arr.map((x, i) => [i, x] as const));
}

export type MaybeStages<X> = X | Stages<X>

export function is_stages<T>(x: MaybeStages<T>): x is Stages<T> {
    return x instanceof Stages;
}

export function normalize_stages<T>(x?: MaybeStages<T>): Stages<T> {
    if (x === undefined) {
        return new Stages();
    }
    if (is_stages(x)) {
        return x;
    }
    return stages([0, x]);
}

export function stage_keys(x: Stages<any>): number[] {
    return [...x.keys()].sort((a,b) => a - b);
}

export function stage_values<X>(x: Stages<X>): X[] {
    return stage_keys(x).map(s => x.get(s)!);
}

export function stage_entries<X>(x: Stages<X>): [number, X][] {
    return stage_keys(x).map(s => [s, x.get(s)!]);
}

export function map_stages<T, R>(x: Stages<T>, f: (t: T, stage?: number) => R): Stages<R> {
    return stages(
        ...stage_entries(x).map(([s, t]) => [s, f(t, s)] as const))
}

export function foreach_stages<T>(x: Stages<T>, f: (t: T, stage?: number) => void): void {
    for (let [stage, t] of stage_entries(x)) {
        f(t, stage);
    }
}

export function merge_stages<T>(x: MaybeStages<T>, reducer: (acc: T, next: T) => T, init: T, stage_limit?: number): T {
    if (is_stages(x)) {
        let result: T = init;
        for (let stage of stage_keys(x)) {
            if (stage_limit === undefined || stage <= stage_limit) {
                result = reducer(result, x.get(stage)!);
            } else {
                break;
            }
        }
        return result;
    } else {
        return x;
    }
}

export function find_and_move_to_stage<X>(obj: Stages<X[]>, find: (x: X) => boolean, update: (n: number) => number): Stages<X[]> {
    let result = stages(...obj);
    let additions: Stages<X[]> = stages();

    for (let [stage, xs] of stage_entries(obj)) {
        let to_move = xs.filter(x => find(x));
        let to_keep = xs.filter(x => !find(x));

        if (to_move.length > 0) {
            additions.set(update(stage), to_move);
            result.set(stage, to_keep);
        }
    }

    for (let [stage, moved_xs] of stage_entries(additions)) {
        let xs = result.get(stage);
        if (xs === undefined) {
            result.set(stage, moved_xs);
        } else {
            xs.push(...moved_xs);
        }
    }

    return result;
}

export function make_consecutive<X>(objs: Stages<X>[]): Stages<X> {
    return array_to_stages(objs.flatMap(s => stage_values(s)))
}