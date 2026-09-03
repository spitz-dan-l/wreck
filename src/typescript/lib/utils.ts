export { Updater, update } from './update';

import lodash from 'lodash';
export const deep_equal: (a: unknown, b: unknown) => boolean = lodash.isEqual;

export function range(stop: number): number[];
export function range(start: number, stop: number): number[];
export function range(arg1: number, arg2?: number): number[] {
    const [start, stop] = arg2 === undefined ? [0, arg1] : [arg1, arg2];
    const result: number[] = [];
    for (let i = start; i < stop; i++) {
        result.push(i);
    }
    return result;
}

// An updater function that appends elements to an array.
export function append<T>(...elts: T[]): (arr: T[] | undefined) => T[] {
    return (arr) => [...(arr ?? []), ...elts];
}

export function array_last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

export function flat_deep(arr: unknown[]): unknown[] {
    const result: unknown[] = [];
    for (const elt of arr) {
        if (elt instanceof Array) {
            result.push(...flat_deep(elt));
        } else {
            result.push(elt);
        }
    }
    return result;
}

export function included<T, Arr extends readonly unknown[]>(value: T, arr: Arr): value is T & Arr[number] {
    return arr.includes(value);
}

export function keys<K extends string>(obj: { [k in K]?: unknown }): K[] {
    return Object.keys(obj) as K[];
}

export function entries<V>(obj: { [k: string]: V | undefined }): [string, V][] {
    return Object.entries(obj).filter((e): e is [string, V] => e[1] !== undefined);
}

export function drop_keys<O extends object, K extends keyof O>(obj: O, ...dropped: K[]): Omit<O, K> {
    const result: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(obj)) {
        if (!dropped.includes(k as K)) {
            result[k] = v;
        }
    }
    return result as Omit<O, K>;
}

export function map_values<V1, V2>(obj: { [k: string]: V1 }, f: (v: V1, k: string) => V2): { [k: string]: V2 } {
    const result: { [k: string]: V2 } = {};
    for (const [k, v] of Object.entries(obj)) {
        result[k] = f(v, k);
    }
    return result;
}

export function map<K, V>(...args: [K, V][]): Map<K, V> {
    return new Map(args);
}

export function compute_const<R>(f: () => R): R {
    return f();
}

export function assert(condition: unknown, msg?: string): asserts condition {
    if (!condition) {
        throw new Error(msg);
    }
}
