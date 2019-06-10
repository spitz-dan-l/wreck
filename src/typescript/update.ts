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
- Does not deal with Maps in a useful way (ignores their keys, looks at their object properties)
  (because I don't use them because they don't support compound keys)
- The type signature of update() uses two type parameters, when only one really ought to be necessary.
- Behavior for "unique symbol" types is finnicky
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

export type Updater<T> =
    // Wrapping in [] makes typescript not distribute unions down the tree (seems pretty dumb to me)
    // See discussion here: https://github.com/Microsoft/TypeScript/issues/22596
    [T] extends [(...args: any) => any] ? (x: T) => T :
        ((T extends Primitive | any[] | Set<any> ? T :
            T extends object ? ObjectUpdater<T> :
                never) |
         ((x: T) => T));


type NotFunction<T> = T extends (...args: any) => any ? never : T;

type Primitive = undefined | null | boolean | string | number | symbol;

type ObjectUpdater<T> = {
    [K in keyof T]?: Updater<T[K]>
}

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function update1<S, U extends S=S>(source: S, updater: Updater<U>): S {
    // if updater is a function, call it and return the result
    if (updater instanceof Function) {
        return <S>(<Function> updater)(source);
    }

    // if updater is a non-traversible value
    // check for all types we don't intend to recursively traverse.
    // this means all (non-function) primitives, and arrays
    if ( !(updater instanceof Object) || updater instanceof Array || updater instanceof Set ) {
        return <S>updater;
    }

    // updater is an Object, traverse each key/value and update recursively.
    // note: if you are just trying to set to a deeply-nested object with no traversal,
    // you can achieve this by passing a function returning your desired object.
    if (updater instanceof Object) {
        let result: Partial<S>;
        if (source instanceof Object) {
            result = {...source};
        } else {
            result = {};
        }
        
        for (let [n, v] of Object.entries(updater)) {
            if (v === undefined) {
                delete result[n];
            } else {
                result[n] = update(result[n], v);
            }
        }

        return <S>result;
    }

    throw Error('Should never get here');
}

// The second generic type parameter is a hack to prevent typescript from using the contents of updater
// to figure out the source and return types when doing type inference on calls to this function.
export function update<S, U extends S=S>(source: S, updater: Updater<U>): S;
export function update<S, U extends S=S>(source: S, ...updaters: Updater<U>[]): S;
export function update<S, U extends S=S>(source: S, ...updaters: Updater<U>[]): S {
    return updaters.reduce(update1, source);
}

export function update_any<S>(source: S, updater: any): S {
    return update(source, updater);
}


type AtLeastOne<T, U = {[K in keyof T]: Omit<T, Exclude<keyof T, K>> }> = U[keyof U];

let xxx = {a: 'butt', b: { c: 4, d: [1,2,3]}};
type XXX = typeof xxx;

type ZZZ = AtLeastOne<XXX>;
let zzz: ZZZ = { a: 'hgorse', b: { c: 5, d: []}};





