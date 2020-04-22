import { key_union } from "lib/utils";
import { StaticGistTypes, ValidTags } from "./static_gist_types";


export type FilledGists = { [Tag in ValidTags]: {
    readonly 0: Tag,
    readonly 1: StaticGistTypes[Tag] extends {0: object} ?
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
    readonly 2: StaticGistTypes[Tag] extends {1: object} ?
        keyof StaticGistTypes[Tag][1] extends never ?
            undefined :
            { readonly [PK in keyof StaticGistTypes[Tag][1]]: StaticGistTypes[Tag][1][PK] } :
        undefined
}};

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

export type GistStructure = [string, Record<string, GistStructure | undefined>?, Record<string, unknown | undefined>?];

export type Gists = {
    [Tag in ValidTags]: (
        Tag extends TagsWithOptionalChildren & TagsWithOptionalParameters ?
            {readonly 0: Tag, readonly 1?: GistChildren[Tag], readonly 2?: HandleEmpty<FilledGists[Tag][2]>} :
        Tag extends TagsWithOptionalParameters ?
            {readonly 0: Tag, readonly 1: GistChildren[Tag], readonly 2?: HandleEmpty<FilledGists[Tag][2]>} :
        {readonly 0: Tag, readonly 1: GistChildren[Tag], readonly 2: FilledGists[Tag][2]}
    )
};

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

type HandleEmpty<Obj extends object | undefined> = (
    keyof Obj extends never ?
        undefined :
        Obj
);

export type Gist = Gists[ValidTags];

export function gist<Tags extends TagsWithOptionalChildren & TagsWithOptionalParameters>(tag: Tags, children?: GistChildren[Tags], parameters?: HandleEmpty<FilledGists[Tags][2]>): Gists[Tags];
export function gist<Tags extends TagsWithOptionalParameters>(tag: Tags, children: GistChildren[Tags], parameters?: HandleEmpty<FilledGists[Tags][2]>): Gists[Tags];
export function gist<Tags extends ValidTags>(tag: Tags, children: GistChildren[Tags], parameters: HandleEmpty<FilledGists[Tags][2]>): Gists[Tags];
export function gist(...ctor: Gist & unknown[]) {
    return ctor;
}

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
