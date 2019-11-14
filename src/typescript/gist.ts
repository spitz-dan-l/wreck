import { ConsumeSpec } from './parser';
import { StaticIndex, StaticNameIndexFor } from './static_resources';
import { Fragment, is_story_node, createElement } from './story';
import { compute_const, map_values, enforce_always_never } from './utils';
import { update } from './update';
import { A } from 'ts-toolbelt';

/*
    Use Cases
        - composable topics, e.g. my impression of sam, my contemplation of my impression of sam
        - ability to query for subgists, so ie. "does it mention sam?"
        - TODO ability to splice text in to messages in structured way
        - TODO ability to adjust interpretation classes with a function
    For gists, consider using a StaticIndex of GistRenderers
    the GistRenderer would contain the functions about how to transform Gist trees into text phrases or commands
*/


export interface GistSpecs {}

type Validate<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends GistChildren ? T[K] : never
};

type ValidatedSpecs = Validate<GistSpecs>;

export type InvalidGistSpecs = {
    [K in keyof GistSpecs]: ValidatedSpecs[K] extends never ? K : never
}[keyof GistSpecs];

enforce_always_never(
    /* This will produce an error only if GistSpecs is invalid. */
    null as InvalidGistSpecs
);

export type GistStructure = {
    tag: string,
    children?: Record<string | number, GistStructure>
}

export type Gist<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    children: GistSpecs[Tag] //GistChildren & GistSpecs[Tag]
}

type GistChildren = undefined | Record<string | number, Gist>;


type GistRenderFunction<Tag extends keyof GistSpecs, OutType, PreRender extends 'prerender' | 'preserve'='prerender'> =
    (children: {[K in keyof GistSpecs[Tag]]: PreRender extends 'prerender' ? OutType : GistSpecs[Tag][K]}) => OutType;

type GistRendererType = {
    noun_phrase: string,
    command_noun_phrase: ConsumeSpec,
    // story: Fragment
}
const StaticGistRendererNames: StaticNameIndexFor<GistRendererType> = {
    noun_phrase: null,
    command_noun_phrase: null,
    // story: null
}

type GistRenderMethods<Tag extends keyof GistSpecs, PreRender extends 'prerender' | 'preserve'='prerender'> = {
    [K in keyof GistRendererType]?: GistRenderFunction<Tag, GistRendererType[K], PreRender>
}

export type GistRenderer<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    patterns?: [GistPattern, GistRenderMethods<Tag, 'preserve'>][],
} & GistRenderMethods<Tag, 'prerender'>
;


export const gist_renderer_index = new StaticIndex<GistRenderer>();

export function make_renderer<T extends keyof GistRendererType>(t: T, compute_default: (g: Gist) => GistRendererType[T], post_process?: (output: GistRendererType[T], gist: Gist) => GistRendererType[T]) {
    function _render(gist: Gist): GistRendererType[T];
    function _render(gist: GistStructure): GistRendererType[T] {
        const result = compute_const(() => {
            const spec = gist_renderer_index.find((gs) => {
                return gs.tag === gist.tag
            });

            if (spec === undefined) {
                return compute_default(gist as Gist);
            }

            type PreservedFunc = GistRenderFunction<keyof GistSpecs, GistRendererType[T], 'preserve'>;
            if (spec.patterns) {
                for (const [pat, handlers] of spec.patterns) {
                    if (gist_matches(gist as Gist, pat) && handlers[t]) {
                        return (handlers[t] as PreservedFunc)(gist.children || {})
                    }
                }
            }
            
            if (spec[t] === undefined) {
                return compute_default(gist as Gist);
            }

            type PreRenderedFunc = GistRenderFunction<keyof GistSpecs, GistRendererType[T], 'prerender'>;
            if (gist.children === undefined) {  
                return (spec[t] as PreRenderedFunc)({});
            } else {
                let rendered_children: any = {};
                for (const k in gist.children) {
                    rendered_children[k] = _render(gist.children[k] as Gist);
                }
                return (spec[t] as PreRenderedFunc)(rendered_children);
            }
        });

        if (post_process !== undefined) {
            return post_process(result, gist as Gist);
        }
        return result;
    }
    return _render;
}

export const render_gist: {
    [K in keyof GistRendererType]: (gist: Gist) => GistRendererType[K]
} = {
    noun_phrase: make_renderer('noun_phrase', g => g.tag),
    command_noun_phrase: make_renderer('command_noun_phrase', g => g.tag.replace(' ', '_')),
    // story: make_renderer('story', g => g.tag, (result, gist) => {
    //     if (is_story_node(result)) {
    //         return update(result, {
    //             data: { gist: () => gist }
    //         });
    //     } else {
    //         return createElement('span', { gist: gist as GistParam }, result)
    //     }
    // })
}


export function Gists<Tag extends keyof GistSpecs=keyof GistSpecs>(renderer: GistRenderer<Tag>) {
    gist_renderer_index.add(renderer);
}


type NoChildren<X, Y> = undefined extends X ? Y : never;

export type GistParam = {
    [K in keyof GistSpecs]: (GistSpecs[K] extends undefined ? K : never)
}[keyof GistSpecs] | Gist;

export function my_gist(g: GistParam): Gist {
    if (typeof(g) === 'string'){
        return { tag: g, children: undefined }
    }
    return g;
}

export function gist<Tag extends keyof GistSpecs>(tag: NoChildren<GistSpecs[Tag], Tag>): Gist<Tag>//GistVerbose<GistSpecs, Tag>;
export function gist<Tag extends keyof GistSpecs>(tag: Tag, children: GistSpecs[Tag]): Gist<Tag>//GistVerbose<GistSpecs, Tag>;
export function gist(g: GistParam): Gist;
export function gist<Tag extends keyof GistSpecs>(tag: Tag | Gist, children?: GistSpecs[Tag]) {
    if (typeof(tag) === 'string') {
        return {
            tag,
            children
        }
    }
    return tag;
}

export function has_tag<Tag extends keyof GistSpecs>(gist: Gist, tag: Tag): gist is Gist<Tag> {
    return gist.tag === tag;
}

export function gist_to_string(gist: Gist): string;
export function gist_to_string(gist: GistStructure): string {
    return JSON.stringify(gist);
}

export function parse_gist(gist_json: string): Gist {
    return JSON.parse(gist_json);
}

export function gists_equal(gist1: Gist, gist2: Gist): boolean;
export function gists_equal(gist1: GistStructure, gist2: GistStructure): boolean {
    if (gist1.tag !== gist2.tag) {
        return false;
    }

    if (typeof gist1.children !== typeof gist2.children) {
        return false;
    }

    if (gist1.children === undefined) {
        return true;
    }

    for (const k in gist1.children) {
        if (!(k in gist2.children!)) {
            debugger;
            return false;
        }
        if (!gists_equal(gist1.children[k] as Gist, gist2.children![k] as Gist)) {
            return false;
        }
    }
    return true;
}

export function includes_tag<Tag extends keyof GistSpecs>(tag: Tag, gist: Gist): boolean;
export function includes_tag<Tag extends keyof GistSpecs>(tag: Tag, gist: GistStructure) {
    if (gist.tag === tag) {
        return true;
    }

    if (gist.children === undefined) {
        return false;
    }

    for (const k in gist.children) {
        const g = gist.children[k];
        if (includes_tag(tag, g as Gist)) {
            return true;
        }
    }

    return false;
}


export type GistFromPattern<Pat> =
    & Gist
    & (
        Pat extends undefined ?
            unknown :
        Pat extends keyof GistSpecs ?
            { tag: Pat } :
        Pat extends any[] ?
            {
                [K in ArrayIndices<Pat>]: GistFromPattern<Pat[K]>
            }[ArrayIndices<Pat>] :
        Pat extends object ? (
            & (Pat extends { children: {} } ?
                & { 
                    children: { [K in keyof Pat['children']]: GistFromPattern<Pat['children'][K]> },
                    tag: { [Tag in keyof GistSpecs]:
                        keyof Pat['children'] extends keyof GistSpecs[Tag] ?
                            Tag :
                            never  
                    }[keyof GistSpecs]
                }
                & {
                    children: { [Tag in keyof GistSpecs]:
                        keyof Pat['children'] extends keyof GistSpecs[Tag] ?
                            GistSpecs[Tag] :
                            never  
                    }[keyof GistSpecs]
                }:
                & unknown
            )
            & (Pat extends { tag: keyof GistSpecs } ?
                & { tag: Pat['tag'], children: GistSpecs[Pat['tag']] } :
                unknown)
        ) : 
        never
    )
;

type ArrayIndices<T extends any[]> = {
    [K in keyof T]: K
}[number];

export type GistPattern<Tag extends keyof GistSpecs=keyof GistSpecs> = Tag | undefined | GistPatternSingle<Tag> | (GistPattern<Tag>[] & {0: GistPattern<Tag>});

type GistPatternSingle<Tag extends keyof GistSpecs> = {
    tag?: Tag,
    children?: ChildrenPattern<Tag>
};

type ChildrenPattern<Tag extends keyof GistSpecs> = 
    {
        [K in keyof GistSpecs]:
            GistSpecs[K] extends {} ?
                { [K1 in keyof GistSpecs[K]]?: GistPattern } :
                undefined
    }[Tag];

const pat1: ChildrenPattern<keyof GistSpecs> = { child: "Sam's identity"};

type T11 = GistSpecs[keyof GistSpecs];

export function pattern<Pattern extends GistPattern>(pat: Pattern): Pattern {
    return pat;
}

export function gist_matches<Pattern extends GistPattern>(gist: Gist, pattern: Pattern): gist is GistFromPattern<Pattern>;
export function gist_matches(gist: Gist, pattern: GistPattern): boolean;
export function gist_matches(gist: GistStructure, pattern: GistPattern): boolean {
    if (pattern === undefined) {
        return true;
    }

    if (typeof pattern === 'string') {
        return pattern === gist.tag;
    }

    if (pattern instanceof Array) {
        return pattern.some(pat => gist_matches(gist as Gist, pat));
    }

    if (gist.tag !== pattern.tag) {
        return false;
    }

    if (pattern.children === undefined) {
        return true;
    }

    if (gist.children === undefined) {
        return false;
    }

    for (const k in (pattern as GistStructure).children) {
        if (!gist_matches(gist.children[k] as Gist, (pattern as GistStructure).children![k as keyof (typeof pattern)['children']] as Gist)) {
            return false;
        }
    }
    return true;
}

export function gist_tag_equals<Tag extends keyof GistSpecs>(g: Gist, tag: Tag): g is Gist<Tag> {
    return g.tag === tag;
}
export function assert_gist_tag<Tag extends keyof GistSpecs>(g: Gist, tag: Tag): asserts g is Gist<Tag> {
    if (!gist_tag_equals(g, tag)) {
        throw new Error(`Gist ${gist_to_string(g)} did not have expected tag ${tag}`);
    }
}

export type GistMatcherPair<Pattern extends GistPattern=GistPattern, F extends ((g: GistFromPattern<Pattern>) => any)=((g: GistFromPattern<Pattern>) => any)> = readonly [Pattern, F];

export function match<Pattern extends GistPattern, F extends ((g: GistFromPattern<Pattern>) => any)>(pat: Pattern, f: F): GistMatcherPair<Pattern, F> {
    return [pat, f];
}

export function matcher<MatchPairs extends GistMatcherPair[]>(...match_pairs: MatchPairs): (gist: Gist) => MatchPairs[number][1] {
    return (gist: Gist): MatchPairs[number][1] => {
        for (const [pattern, func] of match_pairs) {
            if (gist_matches(gist, pattern)) {
                return func(gist);
            }
        }
        throw new Error('Failed to match the input gist: ' + JSON.stringify(gist));
    }
}

// TODO: includes subpattern





