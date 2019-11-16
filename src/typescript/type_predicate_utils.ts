import { U, A } from "ts-toolbelt";

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