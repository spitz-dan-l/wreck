export {ObjectUpdater, Updater, update, update_any} from './update';

export type Point2 = [number, number];

export function make_matrix2(data_obj: number[][]) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;

    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}

export function zeros(dim_x: number, dim_y: number) {
    return new Matrix2(new Int16Array(dim_x * dim_y), dim_x, dim_y);
}

export class Matrix2 {
    readonly dim_x: number;
    readonly dim_y: number;
    readonly data: Int16Array;
    
    constructor (data: Int16Array, dim_x: number, dim_y: number) {
        this.data = data;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
    }

    get(x: number, y: number): number {
        return this.data[y * this.dim_x + x];
    }

    set(x: number, y: number, value: number) {
        this.data[y * this.dim_x + x] = value;
    }

    rotate(degrees: number): Matrix2 {
        //validate input better

        if (degrees == 360 || degrees == 0) {
            return this;
        }

        const n_rotations = degrees / 90;
        let m: Matrix2 = this;
        const dim_x = this.dim_x;
        const dim_y = this.dim_y;
        for (let i = 0; i < n_rotations; i++){
            let new_data = new Int16Array(dim_x * dim_y);
            let new_mat2 = new Matrix2(new_data, dim_y, dim_x);
            for (let y = 0; y < dim_y; y++){
                for (let x = 0; x < dim_x; x++){
                    new_mat2.set(dim_y - 1 - y, x, m.get(x, y));
                }
            }
            m = new_mat2;
        }
        return m
    }

    contains(value: number): boolean{
        return this.data.indexOf(value) !== -1;
    }

    copy(): Matrix2 {
        return new Matrix2(this.data.slice(), this.dim_x, this.dim_y);
    }
}


export type Counter<T> = Map<T, number>;

export function counter_add<T>(counter: Counter<T>, key: T, inc: number){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = <number>counter.get(key);
    }
    return counter.set(key, cur_val + inc);
}

export function counter_get<T>(counter: Counter<T>, key: T){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = <number>counter.get(key);
    }
    return cur_val;
}

export function counter_update<T>(counter1: Counter<T>, counter2: Counter<T>){
    counter2.forEach(function (v, k){
        counter_add(counter1, k, v);
    });

    return counter1;
}

export function counter_order<T>(counter: Counter<T>, include_zero=false){
    let result = Array.from(counter.entries()).sort((a, b) => a[1] - b[1]);
    if (!include_zero) {
        result = result.filter(([t, i]) => i > 0);
    }
    return result.map(([t, i]) => t);
}

// EDIT: actually, the below is made irrelevant by "as const" in 3.4.
// Holy dang this is cool:
// https://stackoverflow.com/questions/46445115/derive-a-type-a-from-a-list-of-strings-a
//
// Point here is to define the list of ObserverMomentIDs and PerceptionIDs
// as a constant, and get string literal typechecking elsewhere in the code.
export function infer_literal_array<T extends string>(...arr: T[]): T[] {
  return arr;
}

// Array helpers //

export function append<T>(...elts: T[]){
    function _append(arr: T[]): T[];
    // function _append(arr?: T[]): T[];
    function _append(arr?: T[]): T[] {
        return [...(arr || []), ...elts];
    }
    return _append;
    return (arr?: T[]) => [...(arr || []), ...elts];
}

export function appender_uniq<T>(...elts: T[]) {
    return (arr: T[]) => [...arr, ...elts.filter(t => !arr.includes(t))];
}

export function array_last<T>(arr: T[] & { 0: T }): T;
export function array_last<T>(arr: T[]): T | undefined;
export function array_last<T>(arr: T[]): T | undefined {
    return arr[arr.length - 1];
}

export function empty(x: Object): boolean {
    return Object.keys(x).length === 0;
}

export function set_eq(arr1: any[], arr2: any[]) {
    if (arr1 === undefined && arr2 === undefined) {
        return true;
    }
    if (typeof arr1 !== typeof arr2) {
        return false;
    }
    return arr1.every(x => arr2.includes(x)) && arr2.every(x => arr1.includes(x));
}

// Helper for building lists with optional elements
export function cond<R>(c: boolean, r: () => R) {
    if (c) {
        return [r()];
    }
    return [];
}
// type SpreadableMaybe<R extends {}> = (R | {}) & Iterable<R>

// export function cond<R extends {}>(c: boolean, r: () => R): SpreadableMaybe<R> {
//     let result_obj: R | {} = {};
//     let result_arr: R[] = [];
//     if (c) {
//         result_obj = r();
//         result_arr.push(<R>result_obj);        
//     }
    
//     result_obj[Symbol.iterator] = result_arr[Symbol.iterator];
//     return <SpreadableMaybe<R>>result_obj;

//     // return <SpreadableMaybe<R>> new Proxy(result_obj, {
//     //     get: (target, prop, receiver) => {
//     //         if (prop === Symbol.iterator) {
//     //             return result_arr[prop];
//     //         }
//     //         return Reflect.get(target, prop, receiver);
//     //     }
//     // })
// }

// export function included<T, T2 extends readonly T[]>(value: T, arr: T2): value is T2[number] {
//     return arr.includes(value);
// }

export function included<T, Arr extends readonly any[]>(value: T, arr: Arr): value is Arr[number] {
    return arr.includes(value);
}

// Object helpers //


export function cond_obj<R extends {}>(c: boolean, r: () => R) {
    if (c) {
        return r();
    }
    return {};
}

export function merge_objects<T extends {}>(arr: T[]): T {
    return arr.reduce((acc, cur) => ({...acc, ...cur}), {} as T);
}

export type Entry<Obj extends {}> = Exclude<{
    [K in keyof Obj]: [K, Exclude<Obj[K], undefined>]
}[keyof Obj], undefined>;

export function entries<Obj extends {}>(obj: Obj): Entry<Obj>[] {
    return <Entry<Obj>[]> Object.entries(obj);
}

export function set_prop<Obj extends {}>(obj: Obj, ...pair: Entry<Obj>) {
    obj[pair[0]] = pair[1];
}

// WARNING: this will break if obj has a property that is explicitly set to undefined!
// export function entries<K extends keyof any, V>(obj: {[k in K]?: V}): [K, V][] {
//     return <[K, Exclude<V, undefined>][]>Object.entries(obj).filter((k, v) => v !== undefined);
// }
export function keys<K extends keyof any>(obj: {[k in K]?: any}): K[] {
    return <K[]>Object.keys(obj);
}

export function drop_keys<O extends {}, K extends keyof O>(obj: O, ...keys: K[]): Omit<O, K> {
    let result: any = {};

    for (let [k, v] of Object.entries(obj)) {
        if (!keys.includes(<K>k)) {
            result[k] = v;
        }
    }
    return result;
}

export function from_entries<K extends keyof any, V>(entries: ReadonlyArray<readonly [K, V]>): {[k in K]: V} {
    let result: any = {};

    entries.forEach(([k, v]) => {
        result[k] = v;
    });

    return result;
}

export function construct_from_keys<O extends { [K in keyof any]: any}>(keys: readonly (keyof O)[], f: <K extends keyof O>(k: K) => O[K]): O {
    const result: O = <O>{};

    for (let k of keys) {
        result[k] = f(k)
    }
    return result;
}

export function map_values<V1 extends { [K in keyof any]: any }, V2 extends { [K in keyof V1]: any }=V1>(obj: V1, f: <K extends keyof V1>(v: V1[K], k: K) => V2[K]): V2 {
    return <V2>from_entries(entries(obj).map(([k, v]) => [k, f(v, k)]));
}


// export function map_values<K extends keyof any, V1 extends { [k in K]: any }, V2 extends { [k in K]: any }=V1>(obj: V1, f: <k extends K>(v: V1[k]) => V2[k]): V2 {
//     return from_entries(entries(obj).map(([k, v]) => [k, f(v)]));
// }

// export function map_values<K extends keyof any, V1, V2=V1>(obj: Partial<Record<K, V1>>, f: (v: V1) => V2): Record<K, V2> {
//     return from_entries(entries(obj).map(([k, v]) => [k, f(v)]));
// }

export function filter_values<K extends keyof any, V1>(obj: Partial<Record<K, V1>>, f: (v: V1) => boolean): Record<K, V1> {
    return from_entries(entries(obj).filter(([k, v]) => f(v)));
}

export function key_union(a: {}, b: {}) {
  return [...new Set([...Object.keys(a), ...Object.keys(b)]).values()];
}

// Map helpers
export function map<K, V>(...args: [K, V][]) {
    return new Map(args);
}

export function copy_map<K, V>(m: Map<K, V>) {
    return new Map(m.entries());
}

export function map_updater<K, V>(x: [K, V][]) {
    return (m: Map<K, V>) => new Map([...m, ...x]);
}

// Helper for declaring values with tuple types.
// "as const" would nearly make this unnecessary but @babel/preset-typescript 3.7.7 doesn't parse as const

// type AsConstPrimitive = undefined | null | boolean | string | number | symbol | ((...args: any) => any);

// export function tuple<T extends AsConstPrimitive[] & {0: unknown}>(...t: T): T;
// export function tuple<T extends unknown[] & {0: any}>(...t: T): T; 
// export function tuple<T extends any[] & {0: any}>(...t: T): T {
//     return t
// }

// Mapped Type helper //
// export type Omit<T, K extends keyof any, X extends keyof T = Exclude<keyof T, K>> = {
//   [P in X]: T[X]
// };
// export type Omit<T, K extends keyof any> = {
//     [P in Exclude<keyof T, K>]: T[P]
// };

// Currying //
export type FirstArg<F> = F extends (arg0: infer P, ...args: any) => any ? P : never;
export type RestArgs<F> = F extends (arg0: any, ...args: infer Ps) => any ? Ps : never;
export function curry
    <F extends (arg0: any, ...args: any) => any>
    (f: F, arg0: FirstArg<F>): (...args: RestArgs<F>) => ReturnType<F> {
        return (...args: RestArgs<F>) => f(arg0, ...<any[]>args);
}

// Chain/Compose //

/*
    Uses .z() to compose functions in a type-aware way

    let f1 = (a: string) => a + '-horse';
    let f2 = (a: string) => a + '-goat';

    let result = begin('ronald').z(f1).z(f2)()
    // "ronald-horse-goat"

    (The "z" kinda looks like a zig-zagging line connecting points together
     in left-to-right, top-to-bottom order.)
*/
export interface Chain<A, B> {
    z<C>(f: (b: B) => C): Chain<A, C>
    (a: A): B
}

export function chain<B>(f: () => B): Chain<void, B>;
export function chain<A, B>(f: (a: A) => B): Chain<A, B>;
export function chain<A, B>(f: (a: A) => B): Chain<A, B> {
    let f2: Chain<A, B> = <Chain<A, B>> f;
    f2.z = <C>(f2: (b: B) => C): Chain<A, C> =>
        chain((a: A) => f2(f(a)));
    
    return f2
}

export function begin<T>(): Chain<T, T>;
export function begin<T>(t: T): Chain<void, T>; 
export function begin<T>(t?: T): Chain<any, T> {
    if (t === undefined) {
        return chain((t: any) => t);
    } else {
        return chain(() => t);
    }
}

// Convert a tuple of types to an intersection of those types.
// lifted from https://stackoverflow.com/questions/51603250/typescript-3-parameter-list-intersection-type/51604379

type TupleTypes<T extends { [k: number]: any }> = { [P in keyof T]: T[P] }[number];

// Unsure of the benefit to using "Exclude<keyof T, keyof any[]>" over "number". The former makes the type name way more verbose.
// type BoxedTupleTypes<T extends { [k: number]: any }> =
//   { [P in keyof T]: [T[P]] }[Exclude<keyof T, keyof any[]>]
type BoxedTupleTypes<T extends { [k: number]: any }> =
  { [P in keyof T]: [T[P]] }[number]

// No clue why this works. Something about function types whose first parameter is a union
// inferring as a intersection.
type UnionToIntersection<U> =
  (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

type UnboxIntersection<T> = T extends { 0: infer U } ? U : never;

export type IntersectTupleTypes<T extends { [k: number]: any }> = UnionToIntersection<TupleTypes<T>>;
export type IntersectBoxedTupleTypes<T extends { [k: number]: any }> = UnboxIntersection<UnionToIntersection<BoxedTupleTypes<T>>>;

import lodash from 'lodash'
export const deep_equal = lodash.isEqual;


export const statics =
    <T extends new (...args: Array<unknown>) => void>
    (): ((c: T) => void) =>
        (_ctor: T): void => {};

// type MyButt = {}

// interface MyStaticType {
//   new (urn: string): MyButt;
//   isMember: boolean;
// }

// @statics<MyStaticType>()
// class MyClassWithStaticMembers {
//   static isMember: string;
//   // ...
// }

export const let_ = <T>(f: (...args: any) => T) => f();

import {A, F, T} from 'ts-toolbelt'
import { P } from 'ts-toolbelt/out/types/src/Object/_api';

type MethodProperties<T extends {}> = {
    [K in keyof T]: T[K] extends (...args: any) => any ? K : never
}[keyof T];

export function bound_method<T, K extends MethodProperties<T>>(instance: T, name: K): T[K] {
    return (instance[name] as unknown as F.Function).bind(instance) as unknown as T[K];
}

type Maybe<T> = T | null;

let div = (a: number, b: number) => {
    let result = a / b;
    return new Promise<number>((resolve, reject) => {
        if (result === NaN) {
            reject();
        } else {
            resolve(result);
        }
    })

    
}

async function buh() {
    return await div(1, 0);
}

function wrap<T>(f: Promise<T>): Maybe<T> {
    let result: T | null = null;

    Promise.resolve(f.then(r => {
        result = r;
    }));

    return result;
}


export function with_context<C, R>(f: (set: (c: C) => void) => R): [R, C | undefined] {
    let context: C | undefined;

    const setter = (c: C) => {
        if (context !== undefined) {
            throw new Error(`Multiple calls to context setter. First ${context} then ${c}.`)
        }
        context = c;
    }

    const result = f(setter);

    return [result, context];
}
