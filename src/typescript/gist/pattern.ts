import { Tail, Tuple } from "Tuple/_api";
import { ValidTags, Atom } from "./static_gist_types";
import { Gists, Gist, GistStructure, FilledGists } from "./gist";
import { values, entries } from "lib/utils";

type GistPatternStructure =
    | undefined
    | [string, Record<string, GistPatternStructure>?, Record<string, unknown | Array<unknown>>?]
    | [FIND_DEEP, GistPatternStructure, GistPatternStructure]
    | [EMPTY]
    | [UNION, ...(GistPatternStructure[])]
    ;

type GistPatternCore<Tags extends ValidTags=ValidTags> =
    | undefined
    | GistPatternSingle[Tags]
    | GistPatternDeep<Tags>
    ;
export type GistPatternNullable<Tags extends ValidTags=ValidTags> =
    | GistPatternCore<Tags>
    | GistPatternEmpty
    | GistPatternUnionNullable<Tags>
    ;

export type GistPattern<Tags extends ValidTags=ValidTags> =
    | GistPatternCore<Tags>
    | GistPatternUnion<Tags>
    ;

type GistPatternSingle = {
    [Tag in ValidTags]: {
        readonly 0: Tag,
        // children
        readonly 1?: { [CK in keyof FilledGists[Tag][1]]?:
            FilledGists[Tag][1][CK] extends infer CKV ?
                undefined extends CKV ?
                    GistPatternNullable<
                        CKV extends {0: ValidTags} ? CKV[0] : never
                    > :
                    GistPattern<
                        CKV extends {0: ValidTags} ? CKV[0] : never
                    > :
                never
        },
        // parameters
        readonly 2?: (FilledGists[Tag][2] extends infer PS ? {
            [PK in keyof PS]?: PS[PK] | PS[PK][]
        } : never)
    }
};

export const FIND_DEEP: unique symbol = Symbol('FIND_DEEP');
export type FIND_DEEP = typeof FIND_DEEP;
type GistPatternDeep<RootTags extends ValidTags, ChildTags extends ValidTags=ValidTags> =
    readonly [FIND_DEEP, GistPattern<RootTags>, GistPattern<ChildTags>]

export const EMPTY: unique symbol = Symbol('EMPTY');
export type EMPTY = typeof EMPTY
type GistPatternEmpty = readonly [EMPTY];

export const UNION: unique symbol = Symbol('UNION');
export type UNION = typeof UNION;
type GistPatternUnion<Tags extends ValidTags> = readonly [UNION, ...GistPattern<Tags>[]];
type GistPatternUnionNullable<Tags extends ValidTags> = readonly [UNION, ...GistPatternNullable<Tags>[]];


export type InferPatternTags<Pat extends GistPattern> = _InferPatternTags<Pat>;

type _InferPatternTags<Pat> = (
    Pat extends undefined ? ValidTags :
    Pat extends {0: ValidTags | FIND_DEEP | EMPTY | UNION} ? (
        & { [T in ValidTags]: T }
        & { [K in EMPTY]: ValidTags }
        & { [K in FIND_DEEP]: Pat extends {1: any} ? _InferPatternTags<Pat[1]> : never }
        & { [K in UNION]: Pat extends Tuple ? 
            Tail<Pat> extends infer T ?
                T extends any[] ? {
                    [I in keyof T]: _InferPatternTags<T[I]>
                }[number] : never :
                    never :
                never
        }
    )[Pat[0]] :
    never
);

export type _MatchResult<Pat> = (
    Pat extends undefined ? Gist | undefined :
    Pat extends {0: ValidTags | FIND_DEEP | EMPTY | UNION} ? (
        // "literal" pattern - just a gist structure with various things left out.
        & {
            [T in ValidTags]: {
                readonly 0: T,
                // children
                readonly 1: (Pat extends {1: object} ? {
                    [CK in keyof Required<FilledGists[T][1]>]:
                        Pat extends {1: {[ck in CK]: any} } ?
                            Extract<_MatchResult<Pat[1][CK]>, FilledGists[T][1][CK]> ://| {___hoit: FilledGists[T][1][CK], ___duggard: _MatchResult<Pat[1][CK]>} :
                            FilledGists[T][1][CK] 
                } : FilledGists[T][1]),
                // parameters
                readonly 2: (FilledGists[T][2] &
                    (Pat extends {2: object} ? {
                        [PK in keyof Pat[2]]:
                            Pat[2][PK] extends unknown[] ?
                                Pat[2][PK][number] :
                                Pat[2][PK]
                    } : unknown)
                )
            }
        }
        // special query patterns
        & { [K in EMPTY]: undefined }
        & { [K in FIND_DEEP]: Pat extends {1: any} ? _MatchResult<Pat[1]> : never }
        & { [K in UNION]: Pat extends Tuple ? (
            Tail<Pat> extends infer T ? (
                [T] extends [any[]] ? {
                    [I in keyof T]: _MatchResult<T[I]>
                }[number] : never
            ) : never 
        ) : never }
    )[Pat[0]] :
    never
);

export type MatchResult<Pat extends GistPatternNullable, PossibleTags extends ValidTags> =
    false | Extract<_MatchResult<Pat>, {0: PossibleTags}>;

export type MatchResultNullable<Pat extends GistPatternNullable, PossibleTags extends ValidTags> =
    false | Extract<_MatchResult<Pat>, undefined | {0: PossibleTags}>;


export type PositiveMatchResult<Pat extends GistPattern, PossibleTags extends ValidTags=ValidTags> =
    Extract<_MatchResult<Pat>, {0: PossibleTags}>;

export function gist_pattern<Pat extends GistPattern>(pattern: Pat): Pat;
export function gist_pattern<Pat extends GistPatternNullable>(pattern: Pat): Pat;
export function gist_pattern(pattern: GistPatternNullable): GistPatternNullable {
    return pattern;
}

/*
declare const tag: 'scrutinize' | 'hammer';
declare const tag2: 'Sam' | 'consider';
// declare const facet1: Gists1['facet'];
declare const facet2: Gists['facet'];

const p1 = gist_pattern([tag])
const p2: GistPattern<typeof tag> = [tag]

const g1: Gists1[typeof tag] = [tag, { facet: facet2 }];
const g2: Gists[typeof tag] = [tag, { facet: facet2 }]
const g3: Gists[typeof tag2] = [tag2, { subject: ['Sam']}]

const m1 = match(g2)(p1);
if (m1 !== false) {
    m1[1].facet
}

const m2 = match(facet2)(['facet', { knowledge: ['knowledge', { content: ['Sam']}] }])
if (m2 !== false) {
    m2[1].knowledge[1].content
}

const my_pat = gist_pattern([UNION, ['consider', {subject: ['Sam']}], [FIND_DEEP, ['Sam'], ['Sam']]]);
*/
export function match<Tags extends ValidTags>(g: Gist & {0: Tags}): <Pat extends GistPattern<Tags>>(pattern: Pat) => MatchResult<Pat, Tags>;
export function match<Tags extends ValidTags>(g: (Gist & {0: Tags}) | undefined): <Pat extends GistPatternNullable<Tags>>(pattern: Pat) => MatchResultNullable<Pat, Tags>;
export function match(gist: Gist | undefined) {
    const _match: (gist: GistStructure | undefined) => (pattern: GistPatternStructure) => false | undefined | GistStructure = match as any;
    
    const g = gist as GistStructure | undefined;
    return (pattern: GistPatternStructure) => {
        if (pattern === undefined) {
            return g;
        }

        switch(pattern[0]) {
            case EMPTY: {
                if (g === undefined) {
                    return g;
                }
                return false;
            }
            case UNION: {
                const sub_pats = pattern.slice(1) as GistPatternStructure[];
                for (const sub_pat of sub_pats) {
                    const result = _match(g)(sub_pat);
                    if (result !== false) {
                        return result;
                    }
                }
                return false;
            }
            case FIND_DEEP: {
                if (g === undefined) {
                    return false;
                }
                const root_match = _match(g)(pattern[1]);
                if (root_match === false) {
                    return false;
                }
                //traverse children uhhhh, depth first, to find child.
                const frontier: GistStructure[] = [...values(g[1] ?? {})];
                while (frontier.length > 0) {
                    const child = frontier.pop()!;
                    const child_match = _match(child)(pattern[2]);
                    if (child_match !== false) {
                        return root_match;
                    }
                    frontier.push(...values(child[1] ?? {}));
                }
                return false;
            }
            default: {
                if (g === undefined) {
                    return false;
                }
                const [g_tag, g_children, g_params] = g;
                const [p_tag, p_children, p_params] = pattern;

                if (g_tag !== p_tag) {
                    return false;
                }
                if (p_params !== undefined) {
                    for (const [k, v] of entries(p_params)) {
                        if (v instanceof Array) {
                            if (!v.includes((g_params ?? {})[k])) {
                                return false;
                            }
                        } else {
                            if (v !== (g_params ?? {})[k]) {
                                return false;
                            }
                        }
                    }
                }
                if (p_children !== undefined) {
                    for (const [k, v] of entries(p_children)) {
                        if (_match((g_children ?? {})[k])(v) === false) {
                            return false;
                        }
                    }
                }
                return g;
            }
        }
    }
}
