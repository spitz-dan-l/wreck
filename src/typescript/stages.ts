import { from_entries } from './utils';

export type Stages<X> = { kind: 'Stages', [stage: number]: X };
export type MaybeStages<X> = X | Stages<X>

export function is_stages<T>(x: MaybeStages<T>): x is Stages<T> {
    return (<any>x).kind === 'Stages';
}

export function normalize_stages<T>(x?: MaybeStages<T>): Stages<T> {
    if (x === undefined) {
        return { kind: 'Stages' };
    }
    if (is_stages(x)) {
        return x;
    }
    return { kind: 'Stages', [0]: x };
}

export function stage_keys(x: Stages<any>): number[] {
    return Object.keys(x).filter(s => s !== 'kind').map(s => parseInt(s)).sort((a,b) => a - b);
}

export function stage_entries<X>(x: Stages<X>): [number, X][] {
    return stage_keys(x).map(s => [s, x[s]]);
}

export function map_stages<T, R>(f: (t: T, stage?: number) => R, x: Stages<T>): Stages<R> {
    return {
        kind: 'Stages',
        ...from_entries(
            stage_entries(x)
            .map(([s, t]) => [s, f(t, s)] as const))
    }
}

export function merge_stages<T>(x: MaybeStages<T>, reducer: (acc: T, next: T) => T, init: T, stage_limit?: number): T {
    if (is_stages(x)) {
        let result: T = init;
        for (let stage of stage_keys(x)) {
            if (stage_limit === undefined || stage <= stage_limit) {
                result = reducer(result, x[stage]);
            } else {
                break;
            }
        }
        return result;
    } else {
        return x;
    }
}