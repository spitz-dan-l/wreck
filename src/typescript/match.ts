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

export type Matcher<T> =
    // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
    // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
    [T] extends [(...args: any) => any] ?
        (((x: T) => boolean) |
         // "unknown extends T" will check if T is any, in which case we want to match an update function *or* T.
         ([unknown] extends [T] ? T : never)) :
        ((T extends Primitive | Set<any> ? T :
            T extends Map<infer K, infer V> ? MapMatcher<K, V> :
            T extends any[] ? 
                T extends {0: any} ? TupleMatcher<T> : ArrayMatcher<T> :
            T extends object ? ObjectMatcher<T> :
                never) |
         ((x: T) => boolean));

type Primitive = undefined | null | boolean | string | number | symbol;


type ArrayIndices<T extends any[]> = {
    [K in keyof T]: K
}[number];

export type TupleMatcher<T extends any[] & {0: any}> = Partial<T>;

export type ArrayMatcher<T extends any[]> = {
    [K in ArrayIndices<T>]?: Matcher<T[K]>
}

export interface MapMatcher<K, V> extends Map<K, Matcher<V>> {};

export type ObjectMatcher<T> = {
    [K in keyof T]?: Matcher<T[K]>
};

import {F, Any} from 'ts-toolbelt';
import { isEqual } from 'lodash';

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function match1<S>(source: S, matcher: F.NoInfer<Matcher<S>>): boolean {
    // if updater is a function, call it and return the result
    if (matcher instanceof Function) {
        return <boolean>(<Function> matcher)(source);
    }

    // if updater is a non-traversible value
    // check for all types we don't intend to recursively traverse.
    // this means all (non-function) primitives, and arrays
    if ( !(matcher instanceof Object) || matcher instanceof Set) {
        return isEqual(source, matcher);
    }

    if (matcher instanceof Array) {
        if (!(source instanceof Array)) {
            return false;
        }
        for (let i = 0; i < matcher.length; i++) {
            const x = matcher[i];
            if (x === undefined) {
                continue;
            }
            if (source[i] !== matcher[i]) {
                return false
            }
        }
        return true;
    }

    if (matcher instanceof Map){
        if (!(source instanceof Map)) {
            return false;
        }

        for (let [k, v] of matcher) {
            if (v === undefined) {
                continue
            } else {
                if (!isEqual((source as unknown as Map<any, any>).get(k), v)) {
                    return false;
                }
            }
        }

        return true;
    }

    // updater is an Object, traverse each key/value and update recursively.
    // note: if you are just trying to set to a deeply-nested object with no traversal,
    // you can achieve this by passing a function returning your desired object.
    if (matcher instanceof Object) {
        if (!(source instanceof Object)) {
            return false;
        }
        for (let [n, v] of Object.entries(matcher)) {
            if (v === undefined) {
                continue;
            } else {
                if (!match1((source as any)[n], v)) {
                    return false;
                }
            }
        }
        return true;
    }

    throw Error('Should never get here');
}

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function match<S>(source: S, matcher: F.NoInfer<Matcher<S>>): boolean;
export function match<S>(source: S, ...matchers: F.NoInfer<Matcher<S>>[]): boolean;
export function match<S>(source: S, ...matchers: F.NoInfer<Matcher<S>>[]): boolean {
    return matchers.every(m => match1(source, m));
}

export function match_any<S>(source: S, matcher: any): boolean {
    return match(source, matcher);
}