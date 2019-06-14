export {Updater, update, update_any} from './update';

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

export function appender<T>(...elts: T[]){
    return (arr: T[]) => [...arr, ...elts];
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

export function sorted<X>(arr: X[]): X[] {
    return [...arr].sort();
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

export const included = <T, T2 extends T=T>(value: T, arr: readonly T2[]) =>
    arr.includes(<T2>value);

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

// WARNING: this will break if obj has a property that is explicitly set to undefined!
export function entries<K extends string, V>(obj: {[k in K]?: V}) {
    return <[K, Exclude<V, undefined>][]>Object.entries(obj).filter((k, v) => v !== undefined);
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


// Helper for declaring values with tuple types.
// "as const" would nearly make this unnecessary but @babel/preset-typescript 3.7.7 doesn't parse as const

type AsConstPrimitive = undefined | null | boolean | string | number | symbol | ((...args: any) => any);

export function tuple<T extends AsConstPrimitive[] & {0: unknown}>(...t: T): T;
export function tuple<T extends unknown[] & {0: any}>(...t: T): T; 
export function tuple<T extends any[] & {0: any}>(...t: T): T {
    return t
}

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
        return chain(t => t);
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


// This is really dumb
import _deep_equal from 'deep-equal';
export let deep_equal = _deep_equal



export {lens} from 'lens.ts';


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



