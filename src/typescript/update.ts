/*
update.ts - Concise, typed immutable updates to deeply-nested objects

Daniel Spitz

Use it like this:

    import {update} from 'update';
    let obj = { a: 3, b: 'horse', c: { d: [1,2,3] }};
    let obj2 = update(obj, { a: 0, c: { d: _ => [..._, 4] } });

Concise: you only need to type the keys being updated once.
Typed: It typechecks the second argument. It infers the types of all nested update values and updater functions.
Immutable: Doesn't modify the original object. Reuses substructures without copying where possible.

In the above example, the function in the 'd' property is an updater function; it will be
called with the old value of d, and the result will be used to replace it in obj2.

Inspired indirectly by discussions here 
https://github.com/Microsoft/TypeScript/issues/13923
in which it is discussed how to use recursive mapped types to enforce immutability
through a deeply-nested object

Issues:
- Awkward to update embedded functions. You are forced to always supply an updater function for them.
  (Otherwise, it would be ambiguous at runtime whether you had supplied a replacement or an updater function.)
- Behavior for "unique symbol" types is finnicky/does not work
- It should be possible to specify a new typing of this, with the same underlying impl,
    which can transform from the source type to a new target type

I strongly encourage you to stake your professional reputation on the behavior of this code.
*/

// This version is more correct but triggers TS' 50-type-instantiation limit.
// Currently using the alternative to avoid the limit and the issue caused (sometimes inferred updater function args are wrong)
// seems minor.

// export type Updater<T> =
//     // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
//     // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
//     [T] extends [NotFunction<T>] ?
//             (T extends Primitive | any[] | Set<any> ? T :
//                 T extends object ? ObjectUpdater<T> :
//                     never) |
//             ((x: T) => T) :
//         (x: T) => T;

// export type Updater<T> =
//     // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
//     // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
//     [T] extends [(...args: any) => any] ? (x: T) => T :
//         ((T extends Primitive | any[] | Set<any> | Map<any, any> ? T :
//             T extends object ? ObjectUpdater<T> :
//                 never) |
//          ((x: T) => T));

// export type Updater<T> =
//     // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
//     // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
//     [T] extends [(...args: any) => any] ?
//         (((x: T) => T) |
//          // "unknown extends T" will check if T is any, in which case we want to match an update function *or* T.
//          unknown extends T ? T : never) :
//         ((T extends Primitive | any[] | Set<any> ? T :
//             T extends Map<infer K, infer V> ? MapUpdater<K, V> :
//             T extends object ? ObjectUpdater<T> :
//                 never) |
//          ((x: T) => T));

// export type Updater<T> =
//     // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
//     // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
//     [T] extends [(...args: any) => any] ?
//         (((x: T) => T) |
//          // "unknown extends T" will check if T is any, in which case we want to match an update function *or* T.
//          unknown extends T ? T : never) :
//         ((T extends Primitive | Set<any> ? T :
//             T extends Map<infer K, infer V> ? MapUpdater<K, V> :
//             T extends any[] ? 
//                 T extends {0: any} ? TupleUpdater<T> : ArrayUpdater<T> :
//             T extends object ? ObjectUpdater<T> :
//                 never) |
//          ((x: T) => T));

export type Updater<T, Del extends boolean=false> =
    // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
    // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
    [T] extends [(...args: any) => any] ?
        (((x: T) => Maybe<T, Del>) |
         // "unknown extends T" will check if T is any, in which case we want to match an update function *or* T.
         ([unknown] extends [T] ? Maybe<T, Del> : never)) :
        (Maybe<(T extends Primitive | Set<any> ? T :
            T extends Map<infer K, infer V> ? MapUpdater<K, V> :
            T extends any[] ? 
                T extends {0: any} ? TupleUpdater<T> : ArrayUpdater<T> :
            T extends object ? ObjectUpdater<T> :
                never), Del> |
         ((x: T) => Maybe<T, Del>));

type Maybe<T, Delete extends boolean> = Delete extends true ? T | undefined : T;

type Primitive = undefined | null | boolean | string | number | symbol;


type ArrayIndices<T extends any[]> = {
    [K in keyof T]: K
}[number];

export type TupleUpdater<T extends any[] & {0: any}> = Partial<T>;

export type ArrayUpdater<T extends any[]> = {
    [K in ArrayIndices<T>]?: Updater<T[K], true>
}

export interface MapUpdater<K, V> extends Map<K, Updater<V, true>> {};

export type ObjectUpdater<T> = {
    [K in keyof T]?: Updater<T[K], true>
};

import {F} from 'ts-toolbelt';

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function update1<S>(source: S, updater: F.NoInfer<Updater<S>>): S {
    // if updater is a function, call it and return the result
    if (updater instanceof Function) {
        return <S>(<Function> updater)(source);
    }

    // if updater is a non-traversible value
    // check for all types we don't intend to recursively traverse.
    // this means all (non-function) primitives, and arrays
    if ( !(updater instanceof Object) || updater instanceof Set) {
        return <S>updater;
    }

    if (updater instanceof Array) {
        let result: any[];
        if (source instanceof Array) {
            result = [...source];
        } else {
            result = [];
        }

        for (let i = 0; i < updater.length; i++) {
            const x = updater[i];
            if (x === undefined) {
                continue;
            }
            result[i] = update(result[i], x);
        }
        return <S><unknown>result;
    }

    if (updater instanceof Map){
        let result: Map<any, any>;
        const ctor = <MapConstructor>updater.constructor;
        if (source instanceof Map) {
            result = new ctor([...source]);
        } else {
            result = new ctor();
        }

        for (let [k, v] of updater) {
            if (v === undefined) {
                result.delete(k);
            } else {
                const r = update(result.get(k), v);
                if (r === undefined) {
                    result.delete(k);
                } else {
                    result.set(k, r)
                }
            }
        }

        return <S><unknown>result;
    }

    // updater is an Object, traverse each key/value and update recursively.
    // note: if you are just trying to set to a deeply-nested object with no traversal,
    // you can achieve this by passing a function returning your desired object.
    if (updater instanceof Object) {
        let result: Partial<S>;
        if (source instanceof Array) {
            result = [...source] as any;
        } else if (source instanceof Object) {
            result = {...source};
        } else {
            result = {};
        }
        
        for (let [n, v] of Object.entries(updater)) {
            if (v === undefined) {
                delete result[n as keyof S];
            } else {
                const r = update(result[n as keyof S], v);
                if (r === undefined) {
                    delete result[n as keyof S];
                } else {
                    result[n as keyof S] = r;
                }
            }
        }

        if (result instanceof Array) {
            // flatten to remove empty (deleted) slots
            result = <S><unknown>result.flat(0);
        }

        return <S>result;
    }

    throw Error('Should never get here');
}

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function update<S>(source: S, updater: F.NoInfer<Updater<S>>): S;
export function update<S>(source: S, ...updaters: F.NoInfer<Updater<S>>[]): S;
export function update<S>(source: S, ...updaters: F.NoInfer<Updater<S>>[]): S {
    return updaters.reduce(update1, source);
}

export function update_any<S>(source: S, updater: any): S {
    return update(source, updater);
}