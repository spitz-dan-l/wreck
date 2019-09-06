export class Stages<X> extends Map<number, X> {
}

export function stages<X>(...args: Array<readonly [number, X]>) {
    return new Stages(args);
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

export function stage_entries<X>(x: Stages<X>): [number, X][] {
    return stage_keys(x).map(s => [s, x.get(s)!]);
}

export function map_stages<T, R>(f: (t: T, stage?: number) => R, x: Stages<T>): Stages<R> {
    return stages(
        ...stage_entries(x).map(([s, t]) => [s, f(t, s)] as const))
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