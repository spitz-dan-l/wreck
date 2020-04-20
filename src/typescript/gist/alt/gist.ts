import { key_union } from "lib/utils";
import { StaticGistTypes, ValidTags } from "./static_gist_types";


// export type Gists = { [Tag in ValidTags]: [
//     Tag,
//     // GistChildren[Tag],
//     StaticGistTypes[Tag] extends {0: object} ?
//         StaticGistTypes[Tag][0] extends infer Children ?
//         keyof StaticGistTypes[Tag][0] extends never ?
//             undefined :
//             {[K in keyof Children]: 
//                 Children[K] extends infer C ?
//                     C extends undefined ? undefined :
//                     C extends ValidTags ? Gists[C] :
//                     never :
//                 never
//             } :
//             never :
//         undefined,
//     StaticGistTypes[Tag] extends {1: object} ?
//         HandleEmpty<StaticGistTypes[Tag][1]> : undefined
// ]};

// export type Gist = Gists[ValidTags];

// export type GistStructure = [string, Record<string, GistStructure | undefined> | undefined, Record<string, unknown | undefined> | undefined];

export type FilledGists = { [Tag in ValidTags]: readonly [
    Tag,
    StaticGistTypes[Tag] extends {0: object} ?
        StaticGistTypes[Tag][0] extends infer Children ?
        keyof StaticGistTypes[Tag][0] extends never ?
            undefined :
            { readonly [K in keyof Children]: 
                Children[K] extends infer C ?
                    C extends undefined ? undefined :
                    C extends ValidTags ? FilledGists[C] :
                    never :
                never
            } :
            never :
        undefined,
    StaticGistTypes[Tag] extends {1: object} ?
        HandleEmpty<Readonly<StaticGistTypes[Tag][1]>> : undefined
]};

export type FilledGist = FilledGists[ValidTags];

export type FilledGistStructure = [string, Record<string, FilledGistStructure | undefined> | undefined, Record<string, unknown | undefined> | undefined];

type TagsWithOptionalParameters = {
    [Tag in ValidTags]:
        StaticGistTypes[Tag] extends {1: unknown} ?
            object extends StaticGistTypes[Tag][1] ?
                Tag :
                never :
            Tag
}[ValidTags];

type TagsWithOptionalChildren = {
    [Tag in ValidTags]:
        StaticGistTypes[Tag] extends {0: unknown} ?
            object extends StaticGistTypes[Tag][0] ?
                Tag :
                never :
            Tag
}[ValidTags];

// type GistDSLStructure = [string, Record<string, GistDSLStructure | undefined>?, Record<string, unknown | undefined>?];

// export type GistDSL = {
//     [Tag in ValidTags]: (
//         Tag extends TagsWithOptionalChildren & TagsWithOptionalParameters ?
//             [Tag, GistDSLChildren[Tag]?, HandleEmpty<Gists[Tag][2]>?] :
//         Tag extends TagsWithOptionalParameters ?
//             [Tag, GistDSLChildren[Tag], HandleEmpty<Gists[Tag][2]>?] :
//         [Tag, GistDSLChildren[Tag], Gists[Tag][2]]
//     )
// };

// type HandleEmpty<Obj extends object | undefined> = (
//     keyof Obj extends never ?
//         undefined :
//         Obj
// );

// type GistDSLChildren = {
//     [Tag in ValidTags]:
//         keyof Gists[Tag][1] extends never ?
//             undefined :
//             Gists[Tag][1] extends infer Children ?
//                 {
//                     [K in keyof Children]:
//                         Children[K] extends infer CK ?
//                             CK extends undefined ? undefined :
//                             CK extends [ValidTags, unknown, unknown] ? GistDSL[CK[0]] :
//                             never :
//                         never
//                 } :
//                 never
// };

export type GistStructure = [string, Record<string, GistStructure | undefined>?, Record<string, unknown | undefined>?];

export type Gists = {
    [Tag in ValidTags]: (
        Tag extends TagsWithOptionalChildren & TagsWithOptionalParameters ?
            readonly [Tag, GistChildren[Tag]?, HandleEmpty<FilledGists[Tag][2]>?] :
        Tag extends TagsWithOptionalParameters ?
            readonly [Tag, GistChildren[Tag], HandleEmpty<FilledGists[Tag][2]>?] :
        readonly [Tag, GistChildren[Tag], FilledGists[Tag][2]]
    )
};

type HandleEmpty<Obj extends object | undefined> = (
    keyof Obj extends never ?
        undefined :
        Obj
);

type GistChildren = {
    [Tag in ValidTags]:
        keyof FilledGists[Tag][1] extends never ?
            undefined :
            FilledGists[Tag][1] extends infer Children ?
                {
                    [K in keyof Children]:
                        Children[K] extends infer CK ?
                            CK extends undefined ? undefined :
                            CK extends {0: ValidTags} ? Gists[CK[0]] :
                            never :
                        never
                } :
                never
};

export type Gist = Gists[ValidTags];

// export type GistDSLArgs = {
//     [Tag in ValidTags]: GistDSL[Tag] | [GistDSL[Tag]]
// }


// type GistConstructor<Tags extends ValidTags=ValidTags> = (
//         Extract<Tags, TagsWithRequiredChildren & TagsWithRequiredParameters> extends never ?
//             Extract<Tags, TagsWithRequiredParameters> extends never ?
//                 [Tags, GistConstructorChildren<Tags>, (Gists[Tags][2])?] :
//                 [Tags, GistConstructorChildren<Tags>, Gists[Tags][2]] :
//             [Tags, (GistConstructorChildren<Tags>)?, (Gists[Tags][2])?]     
// ) & {0: Tags};


// type GistConstructorChildren<Tags extends ValidTags> = (
//     StaticGistTypes[Tags] extends infer STS ?
//         (STS extends {0: object} ? STS[0] : object) extends infer Children ?
//             Union.IntersectOf<Children> extends infer Common ?
//                 (Children extends unknown ?
//                     Any.Extends<Children, Common> :
//                     never) extends 0 ? never : ProcessChildren<Common> :
//             never :
//         never :
//     never
// );    
    
//     Gists[Tags] extends {1: object} ?
//             {
//                 [K in (keyof Gists[Tags][1])]:
//                     Gists[Tags][1][K] extends infer CK ?
//                         CK extends undefined ? undefined :
//                         CK extends [ValidTags, unknown, unknown] ? GistConstructor<CK[0]> :
//                         never :
//                     never
//             } & object : never
// );

// const zzz: ZZZ = [tag, { facet }]

// type ZZ2 = Gists['consider' | 'Sam'][1];
// type ZZ22 = keyof ZZ2
// const bbb: GistDSL<'consider' | 'Sam'> = ['Sam', {subject: ['Sam']}];
// const bbb2: ["Sam" | "consider", object?, (object | undefined)?] = ['Sam', {subject: ['Sam']}];
// type TagsWithRequiredBoth = TagsWithOptionalChildren & TagsWithOptionalParameters;
// type TestTags = 'consider' | 'Sam';

// type ZZ3 = TestTags extends TagsWithOptionalBoth ? 'yes' : 'no';
// type ZZ4 = TagsWithOptionalBoth extends TestTags ? 'yes' : 'no';

// type ZZ5 = Extract<TestTags, TagsWithOptionalBoth> extends never ? 'yes' : 'no'

// export type GistDSLArgs = {
//     [Tag in ValidTags]: GistDSL[Tag] | [GistDSL[Tag]]
// }

// export type GistConstructor = GistDSL[ValidTags];
// export type GistConstructorArgs = {
//     [Tag in ValidTags]: [GistDSL[Tag]]
// };

// function is_naked_ctor(args: GistConstructor | GistConstructorArgs[ValidTags]): args is GistConstructor {
//     return !(args[0] instanceof Array);
// }

export function gist<Tags extends ValidTags>(...ctor: {0: Tags} & Gists[Tags]): Gists[Tags];
export function gist(...ctor: Gist) {
    return ctor;
    // const result: GistStructure = ctor as GistStructure; //noramlize_gist_ctor_args(ctor) as GistDSLStructure;

    // if (result[1] !== undefined) {
    //     result[1] = map_values(result[1], (v) =>
    //         v === undefined ? undefined : gist(...v as Gist));
    // }

    // return result;
}

// type ExtractTag<Ctor extends GistConstructor> = (
//     Ctor extends [unknown] ?
//         Ctor[0] extends [ValidTags, unknown, unknown] ?
//             Ctor[0][0] :
//             never :
//     Ctor[0] extends ValidTags ?
//         Ctor[0] :
//     never
// );

// export function gist<Tags extends ValidTags>(...ctor: {0: Tags} & GistDSL[Tags]): Gists[Tags];
// export function gist(...ctor: GistConstructor | GistConstructorArgs[ValidTags]) {
//     const result: GistDSLStructure = ctor as GistDSLStructure; //noramlize_gist_ctor_args(ctor) as GistDSLStructure;

//     if (result[1] !== undefined) {
//         result[1] = map_values(result[1], (v) =>
//             v === undefined ? undefined : gist(...v as GistConstructor));
//     }

//     return result;
// }


export function gists_equal<Tags extends ValidTags>(g1: Gists[Tags], g2: Gists[Tags]): boolean;
export function gists_equal(g1: GistStructure, g2: GistStructure): boolean {
    if (g1 === g2) {
        return true;
    }

    const [t1, c1, p1] = g1;
    const [t2, c2, p2] = g2;

    if (t1 !== t2) {
        return false;
    }

    if (p1 !== undefined && p2 !== undefined) {
        for (const k of key_union(p1, p2)) {
            if (p1[k] !== p2[k]) {
                return false;
            }
        }
    } else if (p1 !== p2) {
        return false;
    }

    if (c1 !== undefined && c2 !== undefined) {
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
    } else if (c1 !== c2) {
        return false;
    }

    return true;
}

export function gist_to_string(g: Gist): string {
    return JSON.stringify(g);
}

export const enum GistAccessors {
    tag = 0,
    children = 1,
    parameters = 2
}
