import { AsProperty, deep_equal, enforce_always_never, entries, key_union } from '../lib/utils';

import { StaticGistTypes } from './static_gist_types';

/*
    A gist is a composable structure that can be rendered into a noun phrase as a game command or as output text

    Current design is:
        Gist
            tag: statically-registered string
            children: mapping of attributes to other gists
            parameters: arbitrary tag-specific name-value pairs
        
    New gist tags are registered statically, by declaration merging the
    StaticGistTypes interface and adding the tag as a new attribute.
*/


export type ValidTags = keyof StaticGistTypes;

export type ChildrenType = {[K in string]?: ValidTags};
export type MakeStaticGistType<Children extends ChildrenType | undefined=undefined, Parameters extends object | undefined=undefined> =
    & AsProperty<'children', Children>
    & AsProperty<'parameters', Parameters>
    ;



// enforce_always_never( // Static check that when StaticGistTypes is extended, it is done correctly
//     null as (
//         { [K in keyof StaticGistTypes]:
//             {} extends StaticGistTypes[K] ? never :
//             StaticGistTypes[K] extends object ?
//                 | StaticGistTypes[K] extends { children?: object } ?
//                     undefined extends StaticGistTypes[K]['children'] ?
//                         [K, 'children property itself cannot be optional/undefined'] :     
//                     StaticGistTypes[K]['children'] extends {[C in string]?: keyof StaticGistTypes} ?
//                         never :
//                         [K, 'has invalid children:', StaticGistTypes[K]['children']] :
//                     never
//                 | StaticGistTypes[K] extends { parameters?: object } ?
//                     undefined extends StaticGistTypes[K]['parameters'] ?
//                         [K, 'parameters property itself cannot be optional/undefined'] :
//                     StaticGistTypes[K]['parameters'] extends {[C in string]?: unknown} ?
//                         never :
//                         [K, 'has invalid parameters:', StaticGistTypes[K]['parameters']] :
//                     never
//                 | keyof StaticGistTypes[K] extends ValidGistKeys ?
//                     never :
//                     [K, 'has extra properties', Exclude<keyof StaticGistTypes[K], ValidGistKeys>] :
//                 [K, 'is not an object type. It is', StaticGistTypes[K]]
//         }[keyof StaticGistTypes]
//     )
// )

type FillMissing<Obj, Key extends string> =
    Key extends keyof Obj ?
        Obj[Key] :
        object;

export type Gists = {
    [Tag in ValidTags]: {
        tag: Tag,
        parameters:
            FillMissing<StaticGistTypes[Tag], 'parameters'>,
        children: 
            FillMissing<StaticGistTypes[Tag], 'children'> extends infer Children ?
            { [K in keyof Children]:
                Children[K] extends infer T ?
                    T extends undefined ? undefined :
                    T extends ValidTags ? Gists[T] :
                    never :
                never
            } :
                never
    }
};

export type Gist = Gists[ValidTags];

export function gist_to_string(gist: Gist): string {
    return JSON.stringify(gist);
}

export function parse_gist(gist_json: string): Gist {
    return JSON.parse(gist_json);
}

export type GistStructure = {
    tag: string,
    parameters: { [K in string]?: unknown } //Record<string, unknown | undefined>,
    children: { [K in string]?: GistStructure } //Record<string, GistStructure | undefined>
}

type GistDSLStructureObject = {
    tag: string;
    parameters?: Record<string, unknown | undefined>;
    children?: Record<string, GistDSLStructure | undefined>;
};

type GistDSLStructure = string | GistDSLStructureObject;

type AllowOptional<Obj, Key extends keyof Obj, Value=Obj[Key]> =
    object extends Obj[Key] ?
        { [K in Key]?: Value } :
        { [K in Key]: Value };

type GistDSL = {
    [Tag in ValidTags]: (
        | GistDSLObject[Tag]
        | (
            object extends Gists[Tag]['parameters'] ?
                object extends Gists[Tag]['children'] ?
                    Tag :
                    never :
                never
        )
    )
};

type GistDSLObject = {
    [Tag in ValidTags]:
        & { tag: Tag }
        & AllowOptional<Gists[Tag], 'parameters'>
        & AllowOptional<Gists[Tag], 'children', GistDSLChildren[Tag]>
};

type GistDSLChildren = {
    [Tag in ValidTags]:
        FillMissing<StaticGistTypes[Tag], 'children'> extends infer Children ?
            {
                [K in keyof Children]:
                    Children[K] extends infer CK ?
                        CK extends undefined ?
                            undefined :
                        CK extends ValidTags ?
                            GistDSL[CK] :
                        never :
                    never
            } :
            never
};

export type GistConstructor = GistDSL[ValidTags];

function translate_dsl(x: GistDSL[ValidTags]): Gists[ValidTags];
function translate_dsl(x: GistDSLStructure) {
    if (typeof(x) === 'string') {
        return {
            tag: x,
            children: {},
            parameters: {}
        } as Gist    
    }
    const result = {...x} as GistStructure;
    if (x.parameters === undefined) {
        result.parameters = {}
    }
    result.children = {};
    if (x.children !== undefined) {
        result.children = {};
        for (const [k, v] of entries(x.children)) {
            result.children[k] = translate_dsl(v as GistDSL[ValidTags]) as GistStructure;
        }
    }
    return result;
}

type InferTags<DSLOrGist> =
    DSLOrGist extends ValidTags ?
        DSLOrGist :
    DSLOrGist extends { tag: ValidTags } ?
        DSLOrGist['tag'] :
    never;

type TagsWithOptionalParameters = {
    [Tag in ValidTags]: object extends Gists[Tag]['parameters'] ? Tag : never 
}[ValidTags];

type TagsWithOptionalChildren = {
    [Tag in ValidTags]: object extends Gists[Tag]['children'] ? Tag : never 
}[ValidTags];

export function gist<DSL extends GistDSL[ValidTags]>(spec: DSL): Gists[InferTags<DSL>];
export function gist(spec: GistDSL[ValidTags]): Gist;
export function gist<Tag extends TagsWithOptionalParameters & TagsWithOptionalChildren>(tag: Tag, children?: GistDSLObject[Tag]['children'], parameters?: GistDSLObject[Tag]['parameters']): Gists[Tag]
export function gist<Tag extends TagsWithOptionalParameters>(tag: Tag, children: GistDSLObject[Tag]['children'], parameters?: GistDSLObject[Tag]['parameters']): Gists[Tag]
export function gist(spec: GistDSLStructure, children?: GistDSLStructureObject['children'], parameters?: GistDSLStructureObject['parameters']): Gist {
    const result = translate_dsl(spec as GistDSL[ValidTags]);
    if (children !== undefined) {
        result.children = children;
    }
    if (parameters !== undefined) {
        result.parameters = parameters;
    }

    return result;
}

export function gists_equal(gist1: Gist, gist2: Gist): boolean;
export function gists_equal(gist1: GistStructure, gist2: GistStructure): boolean {
    if (gist1 === gist2) {
        return true;
    }

    if (gist1.tag !== gist2.tag) {
        return false;
    }

    for (const k in key_union(gist1.parameters, gist2.parameters)) {
        if (!deep_equal((gist1.parameters)[k], (gist2.parameters)[k])) {
            return false;
        }
    }

    for (const k in key_union(gist1.children, gist2.children)) {
        const c1 = gist1.children[k];
        const c2 = gist2.children[k];

        if (c1 === c2) {
            continue;
        }

        if ((c1 === undefined) !== (c2 === undefined)) {
            return false;
        }

        if (!gists_equal(c1! as Gist, c2! as Gist)) {
            return false
        }
    }

    return true;
}

export function has_tag<Tag extends ValidTags>(gist: Gist, tag: Tag): gist is Gists[Tag] {
    return gist.tag === tag;
}

export function find_tag(tag: ValidTags, gist: Gist): Gist | null;
export function find_tag(tag: ValidTags, gist: GistStructure) {
    if (gist.tag === tag) {
        return gist;
    }

    for (const k in gist.children) {
        const g = gist.children[k];
        const found = find_tag(tag, g as Gist);
        if (found !== null) {
            return found;
        }
    }

    return null;
}

type GistPatternObjectStructure = {
    tag: string;
    parameters?: { [P in string]?: unknown | unknown[] };// Record<string, unknown | unknown[]>; // (parameters: Record<string, unknown>) => boolean
    children?: { [C in string]?: GistPatternStructure }; //Record<string, GistPatternStructure>;
};

type GistPatternSingleStructure =
    | string
    | GistPatternObjectStructure

export type GistPatternStructure =
    | undefined
    | GistPatternSingleStructure
    | GistPatternSingleStructure[];


// type GistPatternSingle<Tags extends ValidTags> =
//     | Tags
//     | GistPatternObject<Tags>;

// type GistPatternObject<Tags extends ValidTags> = {
//     tag: Tags | Tags[],
//     parameters?: {
//         [T in Tags]?:
//             Gists[T]['parameters'] extends infer PS ?
//                 {
//                     [PK in keyof PS]?: PS[PK] | PS[PK][]
//                 } : never
//     }[Tags],
//     children?: {
//         [T in Tags]?:
//             { [CK in keyof Gists[T]['children']]: Gists[T]['children'][CK] extends { tag: ValidTags } ? GistPattern<Gists[T]['children'][CK]['tag']> : never }  
//     }[Tags]
// }

// export type GistPattern<Tags extends ValidTags=ValidTags> =
//     | undefined
//     | GistPatternSingle<Tags>
//     | GistPatternSingle<Tags>[]

type GistPatternSingle = {
    [Tag in ValidTags]:
        | Tag
        | GistPatternObject[Tag];
};
type GistPatternObject = {
    [Tag in ValidTags]: {
        tag: Tag,
        parameters?: 
            Gists[Tag]['parameters'] extends infer PS ?
                {
                    [PK in keyof PS]?: PS[PK] | PS[PK][]
                } : never,
        children?:
            { [CK in keyof Gists[Tag]['children']]?:
                Gists[Tag]['children'][CK] extends infer CKV ? 
                    GistPattern<
                        CKV extends { tag: ValidTags } ?
                            CKV['tag'] :
                            never
                    > :
                    never
            }  
    }
};
export type GistPattern<Tags extends ValidTags=ValidTags> =
        | undefined
        | GistPatternSingle[Tags]
        | GistPatternSingle[Tags][];

export type InferPatternTags<Pat extends GistPattern> =
    Pat extends undefined ? ValidTags :
    Pat extends Array<infer SubPat> ?
        SubPat extends GistPatternSingle[ValidTags] ?
            InferPatternTagsSingle<SubPat> :
            never :
    Pat extends GistPatternSingle[ValidTags] ?
        InferPatternTagsSingle<Pat> :
    never;

type InferPatternTagsSingle<PatSingle extends GistPatternSingle[ValidTags]> =
    PatSingle extends ValidTags ?
        PatSingle :
    PatSingle extends { 'tag': infer Tag } ?
        Tag :
    never;

export function gist_pattern<Pat extends GistPattern>(pattern: Pat): GistPattern<InferPatternTags<Pat>>;
export function gist_pattern<PatternTags extends ValidTags>(pattern: GistPattern<PatternTags>) {
    return pattern;
}

export function gist_matches<PatternTags extends ValidTags, GistTags extends ValidTags>(value: Gists[GistTags], pattern: GistPattern<PatternTags>): boolean;
export function gist_matches(value: GistStructure, pattern: GistPatternStructure): boolean {
    if (pattern === undefined) {
        return true;
    }

    if (typeof(pattern) === 'string') {
        return pattern === value.tag;
    }

    if (pattern instanceof Array) {
        return pattern.some(p => gist_matches(value as Gist, p as GistPattern));
    }
    
    if (pattern.tag !== undefined) {
        if (typeof pattern.tag === 'string' && pattern.tag !== value.tag) {
            return false;
        }
    }

    if (pattern.parameters !== undefined) {
        for (const [p, v] of entries(pattern.parameters)) {
            const test = pattern.parameters[p];
            if (test instanceof Array) {
                if (!test.includes(value.parameters[p])) {
                    return false;
                }
            } else {
                if (test !== value.parameters[p]) {
                    return false;
                }
            }
        }
    }

    for (const k in pattern?.children) {
        const vc = value.children[k];
        const pc = pattern.children[k];
        if ((vc === undefined) || (pc === undefined)) {
            if (vc !== pc) {
                return false;
            }
        } else if (!gist_matches(vc as Gist, pc as GistPattern)) {
            return false;
        }
    }

    return true;
}