import { map_values, enforce_always_never, entries, key_union } from "lib/utils";
import { Tail, Tuple } from "Tuple/_api";

export interface StaticGistTypes {
    'Sam': [];
    'consider': [{subject: ValidTags}];
    'abstract description': [{}, {subject: ValidTags}];
    'knowledge': [{parent?: ValidTags, child: ValidTags}];

    'knowledge1': [{parent?: ValidTags, child: ValidTags}];
    'knowledge2': [{parent?: ValidTags, child: ValidTags}];
    'knowledge3': [{parent?: ValidTags, child: ValidTags}];
    'knowledge4': [{parent?: ValidTags, child: ValidTags}];
    'knowledge5': [{parent?: ValidTags, child: ValidTags}];
    'knowledge6': [{parent?: ValidTags, child: ValidTags}];
    'knowledge7': [{parent?: ValidTags, child: ValidTags}];
    'knowledge8': [{parent?: ValidTags, child: ValidTags}];
    'knowledge9': [{parent?: ValidTags, child: ValidTags}];
    'knowledge0': [{parent?: ValidTags, child: ValidTags}];
    
    'knowledge11': [{parent?: ValidTags, child: ValidTags}];
    'knowledge22': [{parent?: ValidTags, child: ValidTags}];
    'knowledge33': [{parent?: ValidTags, child: ValidTags}];
    'knowledge44': [{parent?: ValidTags, child: ValidTags}];
    'knowledge55': [{parent?: ValidTags, child: ValidTags}];
    'knowledge66': [{parent?: ValidTags, child: ValidTags}];
    'knowledge77': [{parent?: ValidTags, child: ValidTags}];
    'knowledge88': [{parent?: ValidTags, child: ValidTags}];
    'knowledge99': [{parent?: ValidTags, child: ValidTags}];
    'knowledge00': [{parent?: ValidTags, child: ValidTags}];

    'knowledge111': [{parent?: ValidTags, child: ValidTags}];
    'knowledge222': [{parent?: ValidTags, child: ValidTags}];
    'knowledge333': [{parent?: ValidTags, child: ValidTags}];
    'knowledge444': [{parent?: ValidTags, child: ValidTags}];
    'knowledge555': [{parent?: ValidTags, child: ValidTags}];
    'knowledge666': [{parent?: ValidTags, child: ValidTags}];
    'knowledge777': [{parent?: ValidTags, child: ValidTags}];
    'knowledge888': [{parent?: ValidTags, child: ValidTags}];
    'knowledge999': [{parent?: ValidTags, child: ValidTags}];
    'knowledge000': [{parent?: ValidTags, child: ValidTags}];

    'knowledge1111': [{parent?: ValidTags, child: ValidTags}];
    'knowledge2222': [{parent?: ValidTags, child: ValidTags}];
    'knowledge3333': [{parent?: ValidTags, child: ValidTags}];
    'knowledge4444': [{parent?: ValidTags, child: ValidTags}];
    'knowledge5555': [{parent?: ValidTags, child: ValidTags}];
    'knowledge6666': [{parent?: ValidTags, child: ValidTags}];
    'knowledge7777': [{parent?: ValidTags, child: ValidTags}];
    'knowledge8888': [{parent?: ValidTags, child: ValidTags}];
    'knowledge9999': [{parent?: ValidTags, child: ValidTags}];
    'knowledge0000': [{parent?: ValidTags, child: ValidTags}];

    'knowledge11111': [{parent?: ValidTags, child: ValidTags}];
    'knowledge22222': [{parent?: ValidTags, child: ValidTags}];
    'knowledge33333': [{parent?: ValidTags, child: ValidTags}];
    'knowledge44444': [{parent?: ValidTags, child: ValidTags}];
    'knowledge55555': [{parent?: ValidTags, child: ValidTags}];
    'knowledge66666': [{parent?: ValidTags, child: ValidTags}];
    'knowledge77777': [{parent?: ValidTags, child: ValidTags}];
    'knowledge88888': [{parent?: ValidTags, child: ValidTags}];
    'knowledge99999': [{parent?: ValidTags, child: ValidTags}];
    'knowledge00000': [{parent?: ValidTags, child: ValidTags}];

    // 'buh': [{}, {}, {}];
    // 'buh2': string[];
    
}

type Atom = number | string | symbol | undefined | null | boolean;

enforce_always_never( // Static check that when StaticGistTypes is extended, it is done correctly
    null as (
        { [K in keyof StaticGistTypes]:
            StaticGistTypes[K] extends [] ? never :
            StaticGistTypes[K] extends Array<unknown> ?
                | (StaticGistTypes[K] extends { 0?: object } ?
                    undefined extends StaticGistTypes[K][0] ?
                        [K, 'children property itself cannot be optional/undefined'] :     
                    StaticGistTypes[K][0] extends {[C in string]?: keyof StaticGistTypes} ?
                        never :
                        [K, 'has invalid children:', StaticGistTypes[K][0]] :
                    never
                )
                | (StaticGistTypes[K] extends { 1?: object } ?
                    undefined extends StaticGistTypes[K][1] ?
                        [K, 'parameters property itself cannot be optional/undefined'] :
                    StaticGistTypes[K][1] extends {[C in string]?: Atom} ?
                        never :
                        [K, 'has invalid parameters:', StaticGistTypes[K][1]] :
                    never
                )
                | (StaticGistTypes[K]['length'] extends 0 | 1 | 2 ?
                    never :
                    [K, 'is too long or not a tuple', StaticGistTypes[K]['length']]
                ) :
                [K, 'is not a tuple type. It is', StaticGistTypes[K]]
        }[keyof StaticGistTypes]
    )
);


export type ValidTags = keyof StaticGistTypes;

export type Gists = { [Tag in ValidTags]: [
    Tag,
    StaticGistTypes[Tag] extends {0: unknown} ?
        StaticGistTypes[Tag][0] extends infer Children ?
            {[K in keyof Children]: 
                Children[K] extends infer C ?
                    C extends undefined ? undefined :
                    C extends ValidTags ? Gists[C] :
                    never :
                never
            } :
            never :
        object,
    StaticGistTypes[Tag] extends {1: unknown} ? StaticGistTypes[Tag][1] : object
]};

type Gist = Gists[ValidTags];

type GistStructure = [string, Record<string, GistStructure | undefined>, Record<string, unknown | undefined>];

const zzz: Gists['consider'] = ['consider', {subject: ['Sam', {}, {}]}, {}]

type TagsWithOptionalParameters = {
    [Tag in ValidTags]: object extends Gists[Tag][2] ? Tag : never 
}[ValidTags];

type TagsWithOptionalChildren = {
    [Tag in ValidTags]: object extends Gists[Tag][1] ? Tag : never 
}[ValidTags];

type GistDSLStructure = [string, Record<string, GistDSLStructure | undefined>?, Record<string, unknown | undefined>?];

type GistDSL = {
    [Tag in ValidTags]: 
        Tag extends TagsWithOptionalChildren & TagsWithOptionalParameters ?
            [Tag, GistDSLChildren[Tag]?, Gists[Tag][2]?] :
        Tag extends TagsWithOptionalParameters ?
            [Tag, GistDSLChildren[Tag], Gists[Tag][2]?] :
        [Tag, GistDSLChildren[Tag], Gists[Tag][2]]
};

type GistDSLChildren = {
    [Tag in ValidTags]:
        Gists[Tag] extends {1: unknown} ?
            Gists[Tag][1] extends infer Children ?
                {
                    [K in keyof Children]:
                        Children[K] extends infer CK ?
                            CK extends undefined ? undefined :
                            CK extends [ValidTags, unknown, unknown] ? GistDSL[CK[0]] :
                            never :
                        never
                } :
                never :
            never
};

const my_zzz: GistDSL[ValidTags] = ['consider', {subject: ['consider', {subject: ['Sam']}]}]
const zz = my_zzz[2]

export type GistConstructor = GistDSL[ValidTags];

function gist<Tags extends ValidTags>(ctor: GistDSL[Tags] & {0: Tags}): Gists[Tags];
function gist(ctor: GistDSLStructure) {
    const result= [...ctor] as GistDSLStructure;
    if (result[2] === undefined) {
        result[2] = {};
    }

    if (result[1] === undefined) {
        result[1] = {};
    } else {
        result[1] = map_values(result[1], (v) =>
            v === undefined ? undefined : gist(v as GistConstructor));
    }

    return result;
}

const zzz1 = gist(['abstract description', {}, {subject: 'consider'}])
const zzz2 = gist(['knowledge', { child: ['Sam'] }])

// gist2(['knowledge444', {child: ['abstract description', {}, {subject: 'knowledge111'}]}]);

function gists_equal<Tags extends ValidTags>(g1: Gists[Tags], g2: Gists[Tags]): boolean;
function gists_equal(g1: GistStructure, g2: GistStructure): boolean {
    if (g1 === g2) {
        return true;
    }

    const [t1, c1, p1] = g1;
    const [t2, c2, p2] = g2;

    if (t1 !== t2) {
        return false;
    }

    for (const k of key_union(p1, p2)) {
        if (p1[k] !== p2[k]) {
            return false;
        }
    }

    for (const k of key_union(c1, c2)) {
        if (c1[k] === undefined || c2[k] === undefined) {
            if (c1[k] !== c2[k]) {
                return false;
            }
        }
        if (!gists_equal(c1[k] as Gist, c2[k] as Gist)) {
            return false;
        }
    }
    return true;
}

type GistPatternCore<Tags extends ValidTags=ValidTags> =
    | undefined
    | GistPatternSingle[Tags]
    | GistPatternDeep<Tags>
    ;
type GistPatternNullable<Tags extends ValidTags=ValidTags> =
    | GistPatternCore<Tags>
    | GistPatternEmpty
    | GistPatternUnionNullable<Tags>
    ;

type GistPattern<Tags extends ValidTags=ValidTags> =
    | GistPatternCore<Tags>
    | GistPatternUnion<Tags>
    ;

type GistPatternSingle = {
    [Tag in ValidTags]: [
        Tag,
        // children
        { [CK in keyof Gists[Tag][1]]?:
            Gists[Tag][1][CK] extends infer CKV ?
                undefined extends CKV ?
                    GistPatternNullable<
                        CKV extends {0: ValidTags} ? CKV[0] : never
                    > :
                    GistPattern<
                        CKV extends {0: ValidTags} ? CKV[0] : never
                    > :
                never
        }?,
        // parameters
        (Gists[Tag][2] extends infer PS ? {
            [PK in keyof PS]?: PS[PK] | PS[PK][]
        } : never)?
    ]
};

export const FIND_DEEP: unique symbol = Symbol('FIND_DEEP');
export type FIND_DEEP = typeof FIND_DEEP;
type GistPatternDeep<RootTags extends ValidTags, ChildTags extends ValidTags=ValidTags> =
    [FIND_DEEP, GistPattern<RootTags>, GistPattern<ChildTags>]

export const EMPTY: unique symbol = Symbol('EMPTY');
export type EMPTY = typeof EMPTY
type GistPatternEmpty = [EMPTY];

export const UNION: unique symbol = Symbol('UNION');
export type UNION = typeof UNION;
type GistPatternUnion<Tags extends ValidTags> = [UNION, ...GistPattern<Tags>[]];
type GistPatternUnionNullable<Tags extends ValidTags> = [UNION, ...GistPatternNullable<Tags>[]];


type _MatchResult<Pat> =
    | (
        Pat extends undefined ? Gist :
        Pat extends {0: ValidTags | FIND_DEEP | EMPTY | UNION} ? (
            // "literal" pattern - just a gist structure with various things left out.
            & {
                [T in ValidTags]: [
                    T,
                    // children
                    (Pat extends {1: object} ? {
                        [CK in keyof Required<Gists[T][1]>]:
                            Pat extends {1: {[ck in CK]: any} } ?
                                Extract<Gists[T][1][CK], _MatchResult<Pat[1][CK]>> :
                                Gists[T][1][CK] 
                    } : Gists[T][1]),
                    // parameters
                    (Gists[T][2] &
                        (Pat extends {2: object} ? {
                            [PK in keyof Pat[2]]:
                                Pat[2][PK] extends unknown[] ?
                                    Pat[2][PK][number] :
                                    Pat[2][PK]
                        } :
                        unknown)
                    )
                ]
            }
            // special query patterns
            & {
                [FIND_DEEP]: Pat extends {1: any} ? _MatchResult<Pat[1]> : never,
                [EMPTY]: undefined,
                [UNION]: Pat extends Tuple ? 
                    Tail<Pat> extends infer T ?
                        T extends any[] ? {
                            [I in keyof T]: _MatchResult<T[I]>
                        }[number] : never :
                            never :
                        never
            }
        )[Pat[0]] :
        never
    );

type MatchResult<Pat extends GistPatternNullable, PossibleTags extends ValidTags> =
    false | Extract<_MatchResult<Pat>, undefined | {0: PossibleTags}>


function gist_pattern<Pat extends GistPattern>(pattern: Pat): Pat;
function gist_pattern<Pat extends GistPatternNullable>(pattern: Pat): Pat;
function gist_pattern(pattern: GistPatternNullable): GistPatternNullable {
    return pattern;
}

const my_pat = gist_pattern([UNION, ['consider', {subject: ['Sam']}], [FIND_DEEP, ['Sam'], ['Sam']]]);

declare function match<Tags extends ValidTags>(g: Gist & {0: Tags}): <Pat extends GistPattern<Tags>>(pattern: Pat) => MatchResult<Pat, Tags>; // Extract<_MatchResult<Pat>, false | {0: Tags}>;
declare function match<Tags extends ValidTags>(g: (Gist & {0: Tags}) | undefined): <Pat extends GistPatternNullable<Tags>>(pattern: Pat) => MatchResult<Pat, Tags>; //Extract<_MatchResult<Pat>, false | undefined | {0: Tags}>;

// declare function gist_matches<G extends Gist | undefined, Pat extends GistPatternNullable<Exclude<G, undefined>[0]>>(g: G, pattern: Pat): MatchResult<Pat, Exclude<G, undefined>[0]>;


declare let my_g: Gist;

const xx = match(my_g as Gist | undefined)([UNION, [EMPTY]]);

const result0 = match(my_g as Gist);
const result = result0(['knowledge', { parent: [UNION, [EMPTY], [FIND_DEEP, ['consider'], ['Sam']]], child: ['Sam']}]);
if (result) {
    result[1].parent;
    result[1].child
}


const result2 = match(gist(['abstract description', {}, {subject: 'knowledge'}]))(undefined);
type result2_type = typeof result2;

if (result2 !== false) {
    type ttt = typeof result2[2];
    result2[2]
}


type T1 = [{a?: number}];

type T12 = {[K in (keyof T1[0])]-?: Extract<T1[0][K], undefined>}