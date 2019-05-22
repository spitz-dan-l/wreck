export class FuckDict<K, V> {
    readonly keys_map: Map<string, K>;
    readonly values_map: Map<string, V>;

    size: number = 0

    constructor(a?: [K, V][]) {
        this.keys_map = new Map<string, K>();
        this.values_map = new Map<string, V>();

        if (a !== undefined) {
            for (let [k, v] of a) {
                this.set(k, v);
            }
        }
    }

    set(k: K, v: V) {
        let s = k.toString();
        this.keys_map.set(s, k);
        this.values_map.set(s, v);
        this.size = this.keys_map.size;
        return this;
    }

    get(k: K, default_value?: V): V | undefined {
        if (!this.has_key(k) && default_value !== undefined) {
            this.set(k, default_value);
            return default_value;
        }
        let s = k.toString();
        return this.values_map.get(s);
    }

    update(a: [K, V][]): FuckDict<K, V> {
        let updated = this.copy();
        for (let [k, v] of a) {
            updated.set(k, v);
        }
        return updated;
    }

    has_key(k: K) {
        return this.keys_map.has(k.toString());
    }

    keys_array() {
        return Array.from(this.keys_map.values());
    }

    values_array() {
        return Array.from(this.values_map.values());
    }

    entries_array(): [K, V][] {
        let result: [K, V][] = [];
        for (let [s, k] of this.keys_map.entries()) {
            result.push([k, <V>this.values_map.get(s)]);
        }
        return result;
    }

    keys_equal(other: FuckDict<K, V>) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)){
                return false;
            }
        }

        for (let elem of other.keys_array()) {
            if (!this.has_key(elem)){
                return false;
            }
        }

        return true;
    }

    keys_intersect(other: FuckDict<K, V>) {
        let result: K[] = [];
        for (let k of this.keys_array()) {
            if (other.has_key(k)) {
                result.push(k)
            }
        }
        return result;
    }

    keys_subset(other: FuckDict<K, V>) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)){
                return false;
            }
        }
        return true;
    }

    toString() {
        let entry_strings: string[] = this.entries_array().map((x) => x.toString()).sort();

        return `FuckDict<${entry_strings.join(',')}>`;
    }

    copy() {
        return new FuckDict(this.entries_array());
    }
}

// export type FuckSet<T> = FuckDict<T, undefined>;
export class FuckSet<T> extends FuckDict<T, undefined> {
    constructor(a?: T[]) {
        if (a !== undefined) {
            super(a.map(t => <[T, undefined]>[t, undefined]));
        } else {
            super();
        }
    }
}

export {Updater, update, update_any} from './update';

export function arrays_fuck_equal<T>(ar1: T[], ar2: T[]) {
    if (ar1.length !== ar2.length) {
        return false;
    }

    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i].toString() !== ar2[i].toString()) {
            return false;
        }
    }
    return true;
}

export function array_fuck_contains<T>(ar: T[], elt: T){
    return ar.some((x) => x.toString() === elt.toString())
}

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

export function array_last<T>(arr: T[]): T {
    return arr[arr.length - 1];
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

export function merge_objects<T extends {}>(arr: T[]): T {
    return arr.reduce((acc, cur) => ({...acc, ...cur}), {} as T);
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
export type Omit<T, K extends keyof any> = {
    [P in Exclude<keyof T, K>]: T[P]
};

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