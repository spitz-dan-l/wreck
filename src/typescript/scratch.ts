import { Pattern, matches, NotNull, Any } from "./pattern_matching";
import { AsProperty } from "./utils";
import { A, U } from "ts-toolbelt";

type T11 = number | {a: number, b: string} | {b: number} | {};
type T22 = {a: number} | {b: number} | {};
type T22a = keyof T22


type TTT<T> =
    ( T extends object ? T : never) extends infer TObj ?
        (TObj extends unknown ? keyof TObj : never) extends infer Keys ?
            [Keys] extends [string] ?
                { [K in Keys]:
                    (TObj extends Record<K, unknown> ? TObj : never)[K] 
                } :
                never :
            never :
        never;
type TTT2 = TTT<T11>

type x = {a: number} extends object ? 't' : 'f'

type xxx = never extends unknown ? 't' : 'f'

type PP = Pattern<T11>

const pp: Pattern<T22> = {
    b: 22
}

type Testbbb = [string] extends [never] ? 't' : 'f'
type Testbbb33 = never extends string ? 't' : 'f'

type T3TT = Record<'a' | 'b', unknown> extends {a:number} ? 't' : 'f'

type T444 = never | unknown

type AA = 'a' | 'b' | 'c' | 'd';

type AAA<X> =
    [X] extends [(infer X1)] ?
        X extends unknown ?
            X1 extends unknown ?
                {a: X, b: X1} :
                never :
            never :
        never;

type AAA2<X> =
    U.TupleOf<X> extends infer Tup ?
        { [K in keyof Tup]: {
            [K2 in keyof Tup]: {a: K, b: K2}
        }} :
        never

type AAA3<X> =
    {a: X, b: X} extends infer U ?
        U extends unknown ?
            U :
            never :
        never;

type T1 = AAA<AA>
type T12 = AAA2<AA>
type T13 = AAA3<AA>

type FF = { name: 'a' } | { name: 'b' }

type Unior = U.TupleOf<FF>

export const inferer = <T>() => <T1 extends T>(t: T1) => t;

type x2 = number | undefined extends infer T ? T & undefined extends never ? { butt: T} : {butt?: T} : never

type T555 = AsProperty<'butt', undefined>

type T556<X extends number | undefined> = X
type T556a = T556<undefined>


type MyUnior = { tag: 't1', a: string } | { tag: 't2', a?: number } | { tag: 't3', b: 'squash' };
function matchtest(u: NoQuestionMarks<MyUnior>) {
    if (matches(u, {
        tag: 't2',
        a: NotNull
    })) {
        type T7 = typeof u;
        type T7t = U.TupleOf<T7>;
        type T7t0 = A.Compute<T7t[0]>
        type T7t1 = A.Compute<T7t[1]>
        type T7t2 = A.Compute<T7t[2]>
        type T7t3 = A.Compute<T7t[3]>
        type T7t4 = A.Compute<T7t[4]>
        type T7t5 = A.Compute<T7t[5]>
        
    
    }
}

const Sym: unique symbol = Symbol('Sym');

type T3331 = typeof Sym extends object ? 't' : 'f'

type TestNU = never extends unknown ? 't' : 'f'

type T44<Obj extends object> = Record<any, never> extends Obj ? 't' : 'f';
type T44a = T44<{a: number}>
type T44b = T44<{a: number, b: never}>

type Get<X, K> = X[K extends keyof X ? K : never]

type NoQuestionMarks<X> =
    X extends object ?
        { [K in keyof Required<X>]:
            X[K]
        } :
        X;

type T77 = {horse: true,  a?: 15} | { horse: false, a: 15}
type T77a = {[K in 'horse' | 'a']: T77[K] | (undefined extends T77[K] ? undefined : never)}
type T77b = A.Compute<NoQuestionMarks<T77>>
type T77c = A.Compute<NoQuestionMarks<T77> & {a: number}>;

declare const t77c: T77c;
t77c.

function t77_match(t77: T77) {
    if (matches(t77, { a: NotNull })) {
        type T77m = typeof t77;
        type T77mt = U.TupleOf<T77m>;
        type T77mt0 = T77mt[0]
        type T77mt1 = T77mt[1]

        t77.
    }
}

type TNN = never extends number ? 't' : 'f'