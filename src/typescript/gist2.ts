import { ConsumeSpec } from './parser';
import { StaticIndex, StaticNameIndexFor } from './lib/static_resources';
import { Fragment, is_story_node, createElement } from './story';
import { compute_const, map_values, enforce_always_never, entries, AsProperty, assert, deep_equal } from './utils';
import { update } from './lib/utils';
import { A, U } from 'ts-toolbelt';
import { matches, Pattern, NotNull, Any } from './lib/pattern_matching';

/*
    A gist is a composable structure that can be rendered into a noun phrase as a game command or as output text

    Current design is:
        Gist
            tag: statically-registered string
            children: mapping of attributes to other gists
    
    Limitations are that children must always be gists, and the type representation of children
        is in terms of Gist subtypes, not tags.
    
    Proposed new design:
        Gist
            tag: statically-registered string
            attributes: any object type, with other gists recognized specially

    Questions:
        - Is the gist renderer also where you implement short descriptions for the noun phrase?
            Or is that all built somewhere else, e.g. a map where the gist tags are keys?
            Leaning toward somewhere else, because also decided that *story* snippets should not be
            coupled to the gist renderer.
        - Do we still want an interface of tag names to attribute types? Or do we just want
            a danged type hierarchy?

*/


interface StaticGistTypes {
    Sam: {};
    butt1: {
        parameters: {horse: number},
        children: { horse: ValidTags }
    };
    butt2: {
        parameters: {horse?: number},
        children: { horse?: ValidTags }
    };
    facet: {
        children: {
            parent?: ValidTags,
            child: ValidTags
        }
    }
    // butt3: {
    //     parameters: {horse?: number}
    //     children: { horse?: Gist }
    // }
    // butt4: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt5: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt6: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt7: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt8: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt9: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt10: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt11: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt12: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt13: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt14: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt15: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt16: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt17: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt18: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt19: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt20: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt21: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt22: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
    // butt23: {
    //     parameters: {horse?: number}
    //     children: { horse: Gist }
    // }
};
type ValidTags = keyof StaticGistTypes;

export type ChildrenType = {[K in string]?: ValidTags};
export type MakeStaticGistType<Children extends ChildrenType | undefined=undefined, Parameters extends object | undefined=undefined> =
    & AsProperty<'children', Children> //(Children & undefined extends never ? { children: Children} : { children?: Children })
    & AsProperty<'parameters', Parameters> //(Parameters & undefined extends never ? { parameters: Parameters } : { parameters?: Parameters })

type ValidGistKeys = 'parameters' | 'children';

enforce_always_never(
    null as (
        { [K in keyof StaticGistTypes]:
            {} extends StaticGistTypes[K] ? never :
            StaticGistTypes[K] extends object ?
                | StaticGistTypes[K] extends { children?: object } ?
                    undefined extends StaticGistTypes[K]['children'] ?
                        [K, 'children property itself cannot be optional/undefined'] :     
                    StaticGistTypes[K]['children'] extends {[C in string]?: keyof StaticGistTypes} ?
                        never :
                        [K, 'has invalid children:', StaticGistTypes[K]['children']] :
                    never
                | StaticGistTypes[K] extends { parameters?: object } ?
                    undefined extends StaticGistTypes[K]['parameters'] ?
                        [K, 'parameters property itself cannot be optional/undefined'] :
                    StaticGistTypes[K]['parameters'] extends {[C in string]?: unknown} ?
                        never :
                        [K, 'has invalid parameters:', StaticGistTypes[K]['parameters']] :
                    never
                | keyof StaticGistTypes[K] extends ValidGistKeys ?
                    never :
                    [K, 'has extra properties', Exclude<keyof StaticGistTypes[K], ValidGistKeys>] :
                [K, 'is not an object type. It is', StaticGistTypes[K]]
        }[keyof StaticGistTypes]
    )
)

// type GistTypes = {
//     [Tag in ValidTags]: {
//         tag: Tag,
//         children: StaticGistTypes[Tag] extends { children: {} } ?
//             StaticGistTypes[Tag]['children'] :
//             {},
//         parameters: StaticGistTypes[Tag] extends { parameters: {} } ?
//             StaticGistTypes[Tag]['parameters'] :
//             {},
//     }
// }

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

type TagsWithEmptyParameters = {
    [Tag in ValidTags]: {} extends Gists[Tag]['parameters'] ? Tag : never 
}[ValidTags];

type TagsWithEmptyChildren = {
    [Tag in ValidTags]: {} extends Gists[Tag]['children'] ? Tag : never 
}[ValidTags];

type GistStructure = {
    tag: string,
    parameters: Record<string, unknown | undefined>,
    children: Record<string, GistStructure | undefined>
}

type GistDSLStructure = string | {
    tag: string,
    parameters?: Record<string, unknown | undefined>,
    children?: Record<string, GistDSLStructure | undefined>
}

type AllowOptional<Obj, Key extends keyof Obj, Value=Obj[Key]> =
    object extends Obj[Key] ?
        { [K in Key]?: Value } :
        { [K in Key]: Value };

type GistDSL = {
    [Tag in ValidTags]: (
        | (
            & { tag: Tag }
            & AllowOptional<Gists[Tag], 'parameters'>
            & AllowOptional<Gists[Tag], 'children', GistDSLChildren[Tag]>
        )
        | (
            object extends Gists[Tag]['parameters'] ?
                object extends Gists[Tag]['children'] ?
                    Tag :
                    never :
                never
        )
    )
};

type GistDSLChildren = {
    [Tag in ValidTags]:
        FillMissing<StaticGistTypes[Tag], 'children'> extends infer Children ?
            {
                [K in keyof Children]:
                    Children[K] extends undefined ?
                        undefined :
                    Children[K] extends ValidTags ?
                        GistDSL[Children[K]] :
                    never
            } :
            never
};

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
            result.children[k] = translate_dsl(v as any) as GistStructure;
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

export function gist<DSL extends GistDSL[ValidTags]>(spec: DSL): Gists[InferTags<DSL>];
export function gist(spec: GistDSL[ValidTags]): Gist;
export function gist(spec: GistDSL[ValidTags]): Gist {
    return translate_dsl(spec);
}

type GistPatternStructure =
    | string
    | {
        tag?: string,
        parameters?: (parameters: Record<string, unknown>) => boolean
        children?: Record<string, GistPatternStructure | undefined>
    }

type GistPattern = {
    [Tag in ValidTags]:
        | Tag
        | {
            tag?: Tag,
            parameters?: (
                | ((parameters: Gists[Tag]['parameters']) => parameters is any)
                | ((parameters: Gists[Tag]['parameters']) => boolean)
            )
            children?: GistPatternChildren[Tag]
        }
}

type GistPatternChildren = {
    [Tag in ValidTags]:
        FillMissing<StaticGistTypes[Tag], 'children'> extends infer Children ?
        {
            [K in keyof Children]?:
                Children[K] extends ValidTags ?
                    GistPattern[Children[K]] :
                never
        } :
        never
}

type ChildTags = {
    [Tag in ValidTags]:
        { [K in keyof FillMissing<StaticGistTypes[Tag], 'children'>]:
            
            
}

export type MatchedGistValue<PatternTags extends ValidTags, Pattern extends GistPattern[PatternTags]> =
    Pattern extends PatternTags ?
        { tag: Pattern } :
        (
            & Pattern extends { tag: PatternTags } ?
                { tag: Pattern['tag'] } :
                unknown
            & Pattern extends { parameters: unknown } ?
                Pattern['parameters'] extends ((parameters: unknown) => parameters is infer PNarrow) ?
                    { parameters: PNarrow } :
                    unknown :
                unknown
            & Pattern extends { children: Record<string, GistPattern[ValidTags]> } ?
                { children: { [K in keyof Pattern['children']]:
                    StaticGistTypes[PatternTags]
                    Pattern['children'][K] extends infer ChildPattern ?
                        ?
                            GistPattern[ChildTags] :
                            never :
                        never
                }} :
                unknown
        )
    ;

function gist_matches<Value extends Gist, PatternTag extends InferTags<Value>, Pattern extends GistPattern[PatternTag]>(value: Value, pattern: Pattern): value is MatchedGistValue<PatternTag, Pattern>
function gist_matches<ValueTag extends ValidTags, PatternTag extends ValueTag, Pattern extends GistPattern[PatternTag]>(value: Gists[ValueTag], pattern: Pattern): boolean;
function gist_matches(value: GistStructure, pattern: GistPatternStructure) {
    if (typeof(pattern) === 'string') {
        return pattern === value.tag;
    }
    
    if (pattern.tag !== undefined && pattern.tag === value.tag) {
        return false;
    }

    for (const k in pattern?.parameters) {
        if (!deep_equal(pattern.parameters[k], value.parameters[k])) {
            return false;
        }
    }

    for (const k in pattern?.children) {
        const vc = value.children[k];
        const pc = pattern.children[k];
        if ((vc === undefined) || (pc === undefined)) {
            if (vc !== pc) {
                return false;
            }
        } else if (!gist_matches(vc as Gist, pc as GistPattern[ValidTags])) {
            return false;
        }
    }

    return true;
}

const x = gist({
    tag: 'butt1',
    parameters: {
        horse: 3
    },
    children: {
        horse: 'butt2'
    }
})

gist('Sam')


function foo(g: Gist) {
    if (matches(g, {
        children: {
            child: { tag: 'Sam' }
        },
    })) {
        g
        g.tag
        g.children
    }
}

if (gist_matches(x, 'Sam')) {
    x.
}