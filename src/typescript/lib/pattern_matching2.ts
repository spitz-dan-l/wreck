import { A } from "ts-toolbelt";
import { dangerous_assert } from "./type_predicate_utils";
import { Match } from "Any/_Internal";

/*
    Value-based structural pattern matching.
    I am pretty surprised that this works.
    During development I ran into the type
    instantiation limit a few times and found
    workarounds each time.

    Can't represent intersections in a pattern,
    would love to get that figured out. Syntactically
    the Array would be convenient for this, but it's
    already being used for unions, plus I would expect
    the typing for intersections in MatchedValue to be
    expensive and hard to keep in the instantiation limit.

    Can't handle core data structures like Map and Set.
    This is definitely worth adding.
*/
export const Any: unique symbol = Symbol('Any');
export const NotNull: unique symbol = Symbol('NotNull');

type Primitive = boolean | string | symbol | number | null | undefined;

// export type Pattern<Value> =
//     | ObjectPattern<Value>
//     | (
//         Value extends Primitive ?
//             Value :
//             never )
//     | ((x: Value) => x is any)
//     | ((x: Value) => boolean)
//     | typeof Any
//     | typeof NotNull
//     | Pattern<Value>[]
//     ;

// export type Pattern<Value> =
//     | PatternSingle<Value>
//     | PatternCombiner<Value>

type MatchBindings = Record<string, unknown>;

export type Pattern<Value, Bindings extends MatchBindings> =
    | PatternBinding<Value, Bindings>[keyof Bindings]
    // | PatternCombiner<Value>
    | typeof Any
    | typeof NotNull
    // | Extract<Value, undefined | null> extends never ?
    //     never : typeof NotNull
    | (
        Value extends Primitive ?
            Value :
        Value extends object ?
            ObjectPattern<Value, Bindings>:
        never )
    | ((x: Value) => x is any)
    | ((x: Value) => boolean)
    ;

export const PatternSlot: unique symbol = Symbol('PatternSlot');

export const Binding: unique symbol = Symbol('Binding');

type PatternBinding<Value, Bindings extends MatchBindings> = 
    { [K in keyof Bindings]:
        [Bindings[K]] extends [Value] ?
            ((x: Value) => {
                [PatternSlot]: typeof Binding,
                name: K,
                pattern: Pattern<Value, Omit<Bindings, K>>            
            }) :
            never
    }

export function bind<
    Value,
    Bindings extends MatchBindings,
    Name extends keyof Bindings,
    Pat extends Pattern<Value, Omit<Bindings, Name>>
>(name: Name, val: Value, pattern: MatchedValue<Value, Pat> extends Bindings[Name] ? Pat: never) {
    return {
        [PatternSlot]: Binding as typeof Binding,
        name,
        pattern
    }
}

// const Union: unique symbol = Symbol('Union');
// const Intersection: unique symbol = Symbol('Intersection');

// type Combiner = typeof Union | typeof Intersection;

// type PatternCombiner<Value, Bindings extends MatchBindings> = {
//     [PatternSlot]: Combiner,
//     patterns: Pattern<Value, MatchBindings>[]
// }

// export function intersection<Value, Patterns extends Pattern<Value>[]>(...patterns: Patterns){
//     return { [PatternSlot]: Intersection as typeof Intersection, patterns };
// }
// export function union<Value, Patterns extends Pattern<Value>[]>(...patterns: Patterns) {
//     return { [PatternSlot]: Union as typeof Union, patterns };
// }

type Keys<Value> = (Value extends object ? keyof Value : never);

export type ObjectPattern<Value, Bindings extends MatchBindings> =
    Keys<Value> extends never ? never :
        { [K in Keys<Value>]?:
            Value extends {[K_ in K]?: unknown} ?
                Pattern<Value[K], Bindings> :
                never
        };


// export function matcher<Value, Bindings extends MatchBindings>() {
//     return  <Pat extends Pattern<Value, MatchBindings>>(pattern: Pat) =>
//         (value: Value): Bindings | undefined => match(value, pattern)
// }


export function make_matcher<Value, Bindings extends MatchBindings>(
    f: (
        bind: <
            Val,
            Name extends keyof Bindings,
            Pat extends Pattern<Val, Omit<Bindings, Name>>
        >(name: Name, val: Val, pattern: MatchedValue<Val, Pat> extends Bindings[Name] ? Pat: never) =>
                {
                    [PatternSlot]: typeof Binding,
                    pattern: Pattern<Val, Omit<Bindings, Name>>,
                    name: Name
                }
    ) => Pattern<Value, Bindings>
) {
    const pat = f((name, v, pattern) => ({
        [PatternSlot]: Binding as typeof Binding,
        name,
        pattern
    }) as any)
    return (value: Value): Bindings | undefined =>
        match(value, pat)
}

export function match<Value, Bindings extends MatchBindings>(value: Value, pattern: Pattern<Value, Bindings>): Bindings | undefined {
    const bindings = {} as Bindings;

    function _match(value: any, pattern: any) {
        if (typeof(pattern) === 'function') {
            return pattern(value);
        } else if (pattern === Any) {
            return true;
        } else if (pattern === NotNull) {
            return value !== undefined && value !== null;
        } else if (typeof(pattern) === 'object'){
            if (PatternSlot in pattern) {
                if (pattern[PatternSlot] === Binding) {
                    const name = pattern.name
                    if (_match(value, pattern.pattern)) {
                        bindings[name as keyof Bindings] = value;
                        return true;
                    }
                    return false;
                }
                // TODO FIll in for combinators
            }

            if (typeof(value) !== 'object') {
                return false;
            }
            for (const k in pattern) {
                if (!_match(value[k], pattern[k])) {
                    return false;
                }
            }
            return true;
        } else {
            return pattern === value;
        }
    }

    if (_match(value, pattern)) {
        return bindings;
    }

    return undefined;
}

type ArrayIndices<T extends readonly any[]> = {
    [K in keyof T]: K
}[number];


type HasNevers<Obj> = true extends { [K in keyof Obj]: Obj[K] extends never ? true : false}[keyof Obj] ? true : false;//false;

type Get<X, K> = X[K extends keyof X ? K : never]

// Module-private unique symbol to trick typescript into doing the right thing.
const MappedPatternBrand: unique symbol = Symbol('MappedPatternBrand');

/*
    Given a value type V and a Pattern<V> subtype Pat, what
    further type information can we infer about any value that
    successfully matched Pat?

    This lets us write matches() as a custom type predicate. Rather
    than have the signature
    
    <V>(value: V, pattern: Pattern<V>) => boolean,

    It has the signature

    <V, Pat extends Pattern<V>>(value: V, patter: Pat) => value is MatchedValue<V, Pat>

    Which means cleaner code with fewer type assertions inside the branches.
*/
// export type MatchedValue<V, Pat> = (
//     Pat extends never[] ?
//         V :
//     Pat extends readonly any[] ?
//         {
//             [K in ArrayIndices<Pat>]: MatchedValue<V, Pat[K]>
//         }[ArrayIndices<Pat>] :
//     Pat extends typeof Any ?
//         V :
//     Pat extends typeof NotNull ?
//         (NonNullable<V>) :
//     Pat extends (x: unknown) => x is infer TNarrow ?
//         TNarrow :
//     Pat extends (x: V) => boolean ?
//         V :
//     Pat extends Primitive ?
//         Pat :    
//     Pat extends object ?
//         MatchedValueForObjectPattern<V, Pat>:
//     never
// );

// export type MatchedValue<V, Pat> =
//     Pat extends { [CombinerSlot]: Combiner } ?
//     //     MatchedValueCombiner<V, Pat> :
//     MatchedValueSingle<V, Pat>;

// type MatchedValueCombiner<V, Pat> =
//     Pat extends { [PatternSlot]: infer C, patterns: infer P } ?
//         C extends Combiner ?
//             P extends unknown[] ?
//                 P[number] extends infer U ?
//                     {
//                         [Union]: 
//                             U extends unknown ? MatchedValue<V, U> : never,
//                         [Intersection]:
//                             (U extends unknown ? (k: MatchedValue<V, U>) => void : never) extends ((k: infer I) => void) ?
//                                 (V & I) :
//                                 never
//                     }[C] :
//                     never :
//                 never :
//             never :
//         never;



export type MatchedValue<V, Pat> = (
    // Pat extends { [CombinerSlot]: Combiner } ?
    //     MatchedValueCombiner<V, Pat> :
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
        MatchedValueForObjectPattern<V, Pat>:
    never
);


type MatchedValueForObjectPattern<V, Pat extends object> =
    V extends object ?
        keyof Pat extends keyof V ?
            (
                & { [K in keyof Pat]:
                    MatchedValue<Get<V, K>, Pat[K]>
                } 
                & V
                /*
                    This somehow prevents a case where typescript would eliminate
                    values with valid properties if those properties were optional.
                */
                & { [MappedPatternBrand]: unknown }
            ) extends infer MappedPattern ? 
                HasNevers<MappedPattern> extends true ?
                    never :
                    MappedPattern :
                never :
            never :
    never;


// export function matches<V, Pat extends Pattern<V>>(value: V, pat: Pat): value is MatchedValue<V, Pat>;
// // export function matches<V>(value: V, pat: Pattern<V>): boolean;
// export function matches(value: any, pat: any): boolean {
//     if (typeof(pat) === 'function') {
//         return pat(value);
//     } else if (pat === Any) {
//         return true;
//     } else if (pat === NotNull) {
//         return value !== undefined && value !== null;
//     } else if (pat instanceof Array) {
//         for (const p of pat) {
//             if (matches(value as any, p)) {
//                 return true;
//             }
//         }
//         return false;
//     } else if (typeof(pat) === 'object'){
//         if (typeof(value) !== 'object') {
//             return false;
//         }
//         for (const k in pat) {
//             if (!matches(value[k], pat[k])) {
//                 return false;
//             }
//         }
//         return true;
//     } else {
//         return pat === value;
//     }
// }

// export function make_matcher<V>() {
//     function make_matcher_inner<Pat extends Pattern<V>>(pattern: Pat): (value: V) => value is MatchedValue<V, Pat>;
//     // function make_matcher_inner(pattern: Pattern<V>): (value: V) => boolean;
//     function make_matcher_inner<Pat extends Pattern<V>>(pattern: Pat) {
//         return (value: V): value is MatchedValue<V, Pat> => matches(value, pattern);
//     }
//     return make_matcher_inner;
// }

// export function make_matcher2<V, Pat extends Pattern<V>>(pattern: Pat) {//: (value: V) => value is MatchedValue<V, Pat> {
//     return (value: V): value is MatchedValue<V, Pat> => matches(value, pattern);
// }

// class Matcher<V> {
    
// }