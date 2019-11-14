import { U } from "ts-toolbelt";

// Some help-y types

export type UntypedPredicate<T> = (x: T) => boolean;

export type TypePredicate<T, TNarrow extends T> = (x: T) => x is TNarrow;
export type TypeAssertion<T, TNarrow extends T> = (x: T) => asserts x is TNarrow;

export function assert_type_predicate<V, F extends ((x: V) => x is any)>(predicate: F, value: V): asserts value is V & (F extends (x: V) => x is V & (infer V2) ? V2 : unknown) {
    if (!predicate(value)) {
        throw new Error('assertion failed');
    }
}

export function fake_assert<T>(x: unknown): asserts x is T {
    console.warn('You are doing a fake assert, you are bad.');
    return;
}

// Function versions of operator-based type predicates

type TypeofName = {
    'number': number,
    'string': string,
    'boolean': boolean,
    'symbol': symbol
}
export const typeof_ = <T extends keyof TypeofName>(t: T) => (x: any): x is TypeofName[T] => typeof(x) === t;

type In_<K extends string, T extends unknown> =
    T extends {} ?
        K extends keyof T ? T : never :
        never
export const in_ = <K extends string>(k: K) =>
    <T extends {}>(x: T): x is In_<K, T> => k in x;


export const instanceof_ = <C extends new (...args: any) => any>(ctor: C) => <T>(x: T | InstanceType<C>): x is InstanceType<C> => x instanceof ctor;

export const not_ = <T1, T2 extends T1>(f: TypePredicate<T1, T2>) => (value: T1): value is Exclude<T1, T2> => !f(value)

export const not_nullish_ = <T>(value: T | undefined | null): value is T => value !== undefined && value !== null;
export const nullish_ = <T>(value: T | undefined | null): value is (undefined | null) => value === undefined || value === null;

export function and_<T, Narrow1 extends T>(pred1: TypePredicate<T, Narrow1>): {
    <Narrow2 extends Narrow1>(pred2: TypePredicate<Narrow1, Narrow2>): TypePredicate<T, Narrow2>;
    (pred2: UntypedPredicate<Narrow1>): TypePredicate<T, Narrow1>; 
};
export function and_<T>(pred1: UntypedPredicate<T>): {
    <Narrow2 extends T>(pred2: TypePredicate<T, Narrow2>): TypePredicate<T, Narrow2>;
    (pred2: UntypedPredicate<T>): TypePredicate<T, T>;
}
export function and_<T, Narrow1 extends T>(pred1: TypePredicate<T, Narrow1>) {
    function and_inner_<Narrow2 extends Narrow1>(pred2: TypePredicate<Narrow1, Narrow2>): TypePredicate<T, Narrow2>;
    function and_inner_(pred2: UntypedPredicate<Narrow1>): TypePredicate<T, Narrow1>;
    function and_inner_<Narrow2 extends Narrow1>(pred2: TypePredicate<Narrow1, Narrow2>) {
        return (value: T): value is Narrow2 => pred1(value) && pred2(value);
    }
    return and_inner_;
}

export function or_<T, Narrow1 extends T>(pred1: TypePredicate<T, Narrow1>): {
    <Narrow2 extends Exclude<T, Narrow1>>(pred2: TypePredicate<Exclude<T, Narrow1>, Narrow2>): TypePredicate<T, [Narrow1, Narrow2][number]>;
    (pred2: UntypedPredicate<Exclude<T, Narrow1>>): TypePredicate<T, T>;
};
export function or_<T>(pred1: UntypedPredicate<T>): {
    <Narrow2 extends T>(pred2: TypePredicate<T, Narrow2>): TypePredicate<T, T>;
    (pred2: UntypedPredicate<T>): TypePredicate<T, T>;
}
export function or_<T, Narrow1 extends T>(pred1: TypePredicate<T, Narrow1>) {
    function or_inner_<Narrow2 extends Exclude<T, Narrow1>>(pred2: TypePredicate<Exclude<T, Narrow1>, Narrow2>): TypePredicate<T, [Narrow1, Narrow2][number]>;
    function or_inner_(pred2: UntypedPredicate<Exclude<T, Narrow1>>): TypePredicate<T, T>;
    function or_inner_<Narrow2 extends Exclude<T, Narrow1>>(pred2: TypePredicate<Exclude<T, Narrow1>, Narrow2>) {
        return (value: T): value is Narrow1 | Narrow2 => pred1(value) || pred2(value as Exclude<T, Narrow1>);
    }

    return or_inner_
}


/*
    Value-based structural pattern matching.
    I am pretty surprised that this works.
    During development I ran into the type
    instantiation limit a few times and found
    workarounds each time.

    Can't do intersections in the same pattern.
*/
export const Any: unique symbol = Symbol('Any');
export const NotNull: unique symbol = Symbol('NotNull');

type Primitive = boolean | string | symbol | number | null | undefined;

export type Pattern<Value> =
    | ObjectPattern<Value>
    | (
        Value extends Primitive ?
            Value :
            never )
    | ((x: Value) => x is any)
    | ((x: Value) => boolean)
    | typeof Any
    | typeof NotNull
    | Pattern<Value>[]
    ;

type Keys<Value> = (Value extends object ? keyof Value : never);

export type ObjectPattern<Value> =
    Keys<Value> extends never ? never :
        { readonly [K in Keys<Value>]?:
            Pattern<(Value extends Record<K, unknown> ? Value : never)[K]>
        };

type ArrayIndices<T extends readonly any[]> = {
    [K in keyof T]: K
}[number];

type HasNevers<Obj extends {}> = false extends { [K in keyof Obj]: Obj[K] extends never ? true : false}[keyof Obj] ? false : Obj;//false;

export type MatchedValue<V, Pat> =
    Pat extends readonly any[] ?
        {
            [K in ArrayIndices<Pat>]: MatchedValue<V, Pat[K]>
        }[ArrayIndices<Pat>] | V :
    Pat extends typeof Any ?
        V :
    Pat extends typeof NotNull ?
        NonNullable<V> :
    Pat extends (x: unknown) => x is infer TNarrow ?
        TNarrow :
    Pat extends (x: V) => boolean ?
        V :
    Pat extends Primitive ?
        Pat :
    Pat extends object ?
        V extends object ?
            // keyof Pat extends keyof V ?
            { [K in keyof Pat]:
                K extends keyof V ?
                    MatchedValue<V[K], Pat[K]> :
                    never
            } extends infer C ?
                HasNevers<C> extends false ?
                    & C
                    & V :
                    never:
                never :
            never :
    // Pat extends object ?
    //     V extends object ?
    //         // keyof Pat extends keyof V ?
    //         { [K in keyof Pat]:
    //             K extends keyof V ?
    //                 MatchedValue<V[K], Pat[K]> :
    //                 never
    //         } extends infer C ?
    //             HasNevers<C> extends true ?
    //                 never :
    //                 & C
    //                 & V :
    //             never :
    //         never :
    never;



export function infer_pattern<V>(){
    return <Pat extends Pattern<V>>(pattern: Pat) => pattern;
}

export function infer_matched_value<V>() {
    return <Pat extends Pattern<V>>(pattern: Pat) => null as MatchedValue<V, Pat>;
}

export function matches<V, Pat extends Pattern<V>>(value: V, pat: Pat): value is MatchedValue<V, Pat>;
export function matches(value: any, pat: any): boolean {
    if (typeof(pat) === 'function') {
        return pat(value);
    } else if (pat === Any) {
        return true;
    } else if (pat === NotNull) {
        return value !== undefined && value !== null;
    } else if (pat instanceof Array) {
        for (const p of pat) {
            if (matches(value as any, p)) {
                return true;
            }
        }
        return false;
    } else if (typeof(pat) === 'object'){
        if (typeof(value) !== 'object') {
            return false;
        }
        for (const [k, v] of Object.entries(pat)) {
            if (!matches(value[k], v)) {
                return false;
            }
        }
        return true;
    } else {
        return pat === value;
    }
}

export function make_matcher<V>() {
    return <Pat extends Pattern<V>>(pattern: Pat) => (value: V): value is MatchedValue<V, Pat> => matches(value, pattern);
}