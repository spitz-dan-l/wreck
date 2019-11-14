import { Pattern, infer_pattern } from "./type_predicate_utils";

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

infer_pattern<T22>()({
    b: 33
})

const pp: Pattern<T22> = {
    b: 22
}

type Primitives = string | number;
type T333 = Primitives extends infer T ? T extends string ? 'y' : 'n' : never;

type Literal<T extends Primitives> = Exclude<Primitives, T>;
type L11 = Literal<'a'>

type Testbbb = [string] extends [never] ? 't' : 'f'
type Testbbb33 = number extends never ? 't' : 'f'