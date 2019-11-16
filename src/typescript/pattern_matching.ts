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

type ObjectPattern<Value> =
    Keys<Value> extends never ? never :
        { [K in Keys<Value>]?:
            Pattern<(Value extends Record<K, unknown> ? Value : never)[K]>
        };

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
export type MatchedValue<V, Pat> = (
    Pat extends never[] ?
        V :
    Pat extends readonly any[] ?
        {
            [K in ArrayIndices<Pat>]: MatchedValue<V, Pat[K]>
        }[ArrayIndices<Pat>] :
    Pat extends typeof Any ?
        V :
    Pat extends typeof NotNull ?
        (NonNullable<V>) :
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


export function matches<V, Pat extends Pattern<V>>(value: V, pat: Pat): value is MatchedValue<V, Pat>;
export function matches<V>(value: V, pat: Pattern<V>): boolean;
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
        for (const k in pat) {
            if (!matches(value[k], pat[k])) {
                return false;
            }
        }
        return true;
    } else {
        return pat === value;
    }
}

export function make_matcher<V>() {
    function make_matcher_inner<Pat extends Pattern<V>>(pattern: Pat): (value: V) => value is MatchedValue<V, Pat>;
    function make_matcher_inner(pattern: Pattern<V>): (value: V) => boolean;
    function make_matcher_inner<Pat extends Pattern<V>>(pattern: Pat) {
        return (value: V): value is MatchedValue<V, Pat> => matches(value, pattern);
    }
    return make_matcher_inner;
}