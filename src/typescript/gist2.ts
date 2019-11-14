import { ConsumeSpec } from './parser';
import { StaticIndex, StaticNameIndexFor } from './static_resources';
import { Fragment, is_story_node, createElement } from './story';
import { compute_const, map_values, enforce_always_never, entries } from './utils';
import { update } from './update';
import { A, U } from 'ts-toolbelt';
import { matches, Pattern, NotNull, infer_pattern, infer_matched_value, Any } from './type_predicate_utils';

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
    Sam: {},
    butt1: {
        parameters: {horse?: number},
        children: { horse: ValidTags }
    }
    butt2: {
        parameters: {horse?: number},
        children: { horse?: ValidTags }
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

type ValidChildren = Record<string, Gist>;

type GistTypes = {
    [Tag in ValidTags]: {
        tag: Tag,
        children: StaticGistTypes[Tag] extends { children: {} } ?
            StaticGistTypes[Tag]['children'] :
            {},
        parameters: StaticGistTypes[Tag] extends { parameters: {} } ?
            StaticGistTypes[Tag]['parameters'] :
            {},
    }
}

export type Gists = {
    [Tag in ValidTags]: {
        tag: GistTypes[Tag]['tag'],
        parameters: GistTypes[Tag]['parameters'],
        children: {
            [K in keyof GistTypes[Tag]['children']]:
                GistTypes[Tag]['children'][K] extends infer T ?
                    T extends undefined ? undefined :
                    T extends ValidTags ? Gists[T] :
                    never :
                never
        }
    }
};

export type Gist = Gists[ValidTags];

type TagsWithEmptyParameters = {
    [Tag in ValidTags]: {} extends GistTypes[Tag]['parameters'] ? Tag : never 
}[ValidTags];

type TagsWithEmptyChildren = {
    [Tag in ValidTags]: {} extends GistTypes[Tag]['children'] ? Tag : never 
}[ValidTags];

type GistStructure = {
    tag: string,
    parameters: object,
    children: Record<string, GistStructure | undefined>
}

type GistDSLStructure = string | {
    tag: string,
    parameters?: object,
    children?: Record<string, GistDSLStructure | undefined>
}

type GistDSL<T extends Gist> = (
    T extends Gist ? (
        | (
            & { tag: T['tag'] }
            & ({} extends T['parameters'] ?
                { parameters?: T['parameters'] } :
                { parameters: T['parameters'] })
            & ({} extends T['children'] ?
                { children?: GistDSLChildren<T['children']> } :
                { children: GistDSLChildren<T['children']> })
        )
        | (
            {} extends T['parameters'] ?
                {} extends T['children'] ?
                    T['tag'] :
                    never :
                never
        )
        ) :
        never
);

type GistDSLChildren<Children extends {}> = {
    [K in keyof Children]:
        Children[K] extends infer C ?
            C extends undefined ? undefined :
            C extends Gist ? GistDSL<C> :
            never :
        never
};

type TTTT = Gists['butt2']['children']

declare const gcc: GistDSLChildren<Gists['butt2']['children']>;
gcc.horse

function translate_dsl<G extends Gist>(x: G/*GistDSL<Gist>*/): G;//Gist;
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


type EmptyTags = TagsWithEmptyParameters & TagsWithEmptyChildren;

export function gist<Tag extends ValidTags>(spec: GistDSL<Gist & { tag: Tag }>): Extract<Gist, { tag: Tag }>;
export function gist(spec: GistDSLStructure): Gist {
    return translate_dsl(spec as Gist);
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
        // tag: ['Sam', 'butt1'],
        children: {
            horse: NotNull
        }
    })) {
    }
}

// const ppp: Pattern<Gist> = {
//     tag: ['butt2', 'Sam'],
//     // children: {
//     //     horse: NotNull
//     // }
// }

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

type T11 = AAA<AA>
type T12 = AAA2<AA>
type T13 = AAA3<AA>

type FF = { name: 'a' } | { name: 'b' }
const ff_recognizer = infer_matched_value<FF>();
const pff1 = ff_recognizer([
    { name: 'a' },
    { name: 'b' }
]);

const pff2 = ff_recognizer({
    name: ['a', 'b']
});

type Unior = U.TupleOf<FF>

export const inferer = <T>() => <T1 extends T>(t: T1) => t;
