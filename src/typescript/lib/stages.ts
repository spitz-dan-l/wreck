/*
    Stages: values keyed by a stage number, applied in ascending order.
    Used to order puffer handlers and to sequence animated story updates.
*/

export class Stages<X> extends Map<number, X> {
}

export function stages<X>(...args: Array<readonly [number, X]>): Stages<X> {
    return new Stages(args);
}

export type MaybeStages<X> = X | Stages<X>;

export function normalize_stages<T>(x?: MaybeStages<T>): Stages<T> {
    if (x === undefined) {
        return new Stages();
    }
    if (x instanceof Stages) {
        return x;
    }
    return stages([0, x]);
}

export function stage_keys(x: Stages<unknown>): number[] {
    return [...x.keys()].sort((a, b) => a - b);
}

export function stage_entries<X>(x: Stages<X>): [number, X][] {
    return stage_keys(x).map(s => [s, x.get(s)!]);
}

export function map_stages<T, R>(x: Stages<T>, f: (t: T, stage?: number) => R): Stages<R> {
    return stages(...stage_entries(x).map(([s, t]) => [s, f(t, s)] as const));
}

// Renumber the stages of several Stages consecutively, in order.
export function make_consecutive<X>(objs: Stages<X>[]): Stages<X> {
    const all = objs.flatMap(s => stage_entries(s).map(([, x]) => x));
    return stages(...all.map((x, i) => [i, x] as const));
}
