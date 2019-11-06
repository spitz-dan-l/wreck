import { ConsumeSpec } from './parser';
import { StaticIndex, StaticNameIndexFor } from './static_resources';
import { Fragment, is_story_node, createElement } from './story';
import { compute_const, map_values, enforce_always_never } from './utils';
import { update } from './update';

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

type InvalidSpecs = {
    [K in keyof GistSpecs]: ValidatedSpecs[K] extends never ? K : never
}[keyof GistSpecs];

enforce_always_never(
    /* This will produce an error only if GistSpecs is invalid. */
    null as InvalidSpecs
);

export type GistStructure = {
    tag: string,
    children?: Record<string | number, GistStructure>
}

export type Gist<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    children: GistChildren & GistSpecs[Tag]
}

type GistChildren = undefined | Record<string | number, Gist>;


type GistRenderFunction<Tag extends keyof GistSpecs, OutType, PreRender extends 'prerender' | 'preserve'='prerender'> =
    (children: {[K in keyof GistSpecs[Tag]]: PreRender extends 'prerender' ? OutType : GistSpecs[Tag][K]}) => OutType;

type GistRendererType = {
    noun_phrase: string,
    command_noun_phrase: ConsumeSpec,
    story: Fragment
}
const StaticGistRendererNames: StaticNameIndexFor<GistRendererType> = {
    noun_phrase: null,
    command_noun_phrase: null,
    story: null
}

type GistRenderMethods<Tag extends keyof GistSpecs, PreRender extends 'prerender' | 'preserve'='prerender'> = {
    [K in keyof GistRendererType]?: GistRenderFunction<Tag, GistRendererType[K], PreRender>
}

export type GistRenderer<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    patterns?: [GistPattern<Tag>, GistRenderMethods<Tag, 'preserve'>][],
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
    story: make_renderer('story', g => g.tag, (result, gist) => {
        if (is_story_node(result)) {
            return update(result, {
                data: { gist: () => gist }
            });
        } else {
            return createElement('span', { gist: gist as GistParam }, result)
        }
    })
}

// export function render_gist_noun_phrase(gist: Gist): string;
// export function render_gist_noun_phrase(gist: GistStructure): string {
//     const spec = gist_renderer_index.find((gs) => {
//         return gs.tag === gist.tag
//     });

//     const compute_default = () => gist.tag;

//     if (spec === undefined) {
//         return compute_default();
//     }

//     if (spec.patterns) {
//         for (const [pat, handlers] of spec.patterns) {
//             if (gist_matches(gist as Gist, pat) && handlers.noun_phrase) {
//                 return handlers.noun_phrase(gist.children || {})
//             }
//         }
//     }
    
//     if (spec.noun_phrase === undefined) {
//         return compute_default();
//     }
    

//     if (gist.children === undefined) {  
//         return spec.noun_phrase({});
//     } else {
//         let sub_text: any = {};
//         for (const k in gist.children) {
//             sub_text[k] = render_gist_noun_phrase(gist.children[k] as Gist);
//         }
//         return spec.noun_phrase(sub_text);
//     }
// }

// export function render_gist_command_noun_phrase(gist: Gist): ConsumeSpec;
// export function render_gist_command_noun_phrase(gist: GistStructure): ConsumeSpec {
//     let spec = gist_renderer_index.find((gs) => {
//         return gs.tag === gist.tag
//     });
//     if (spec === undefined || spec.command_noun_phrase === undefined) {
//         return gist.tag.replace(' ', '_');
//     }

//     let sub_commands: any = {};

//     if (gist.children === undefined) {
//         return spec.command_noun_phrase({});
//     }

//     for (const k in gist.children) {
//         sub_commands[k] = render_gist_command_noun_phrase(gist.children[k] as Gist);
//     }
//     return spec.command_noun_phrase(sub_commands);
// }

// export function render_gist_story(gist: Gist): Fragment;
// export function render_gist_story(gist: GistStructure): Fragment {
//     const spec = gist_renderer_index.find((gs) => {
//         return gs.tag === gist.tag
//     });
//     if (spec === undefined || spec.story === undefined) {
//         return gist.tag;
//     }

//     const sub_stories: any = {};

//     const result = compute_const(() => {
//         if (gist.children === undefined) {
//             return spec.story!({});
//         }

//         for (const k in gist.children) {
//             sub_stories[k] = render_gist_story(gist.children[k] as Gist);
//         }
//         return spec.story!(sub_stories);
//     });
//     if (is_story_node(result)) {
//         return update(result, {
//             data: { gist: () => gist as Gist }
//         });
//     } else {
//         return createElement('span', { gist: gist as GistParam }, result)
//     }
// }

export function Gists<Tag extends keyof GistSpecs=keyof GistSpecs>(renderer: GistRenderer<Tag>) {
    gist_renderer_index.add(renderer);
}


type NoChildren<X, Y> = undefined extends X ? Y : never;

export type GistParam = {
    [K in keyof GistSpecs]: Gist<K> | (GistSpecs[K] extends undefined ? K : never)
}[keyof GistSpecs];

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


export type GistPattern<Tag extends keyof GistSpecs=keyof GistSpecs> = GistPatternSingle<Tag> | GistPatternUnion<Tag> | undefined;

type GistPatternUnion<Tag extends keyof GistSpecs=keyof GistSpecs> = GistPatternSingle<Tag>[];

type GistPatternSingle<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    children?: ChildrenPattern<Tag, GistSpecs[Tag]>
}

type ChildrenPattern<Tag extends keyof GistSpecs, Children extends GistSpecs[Tag]> = 
    Children extends undefined ? undefined :
    {
        [K in keyof Children]: GistPattern
    };

export function gist_matches(gist: Gist, pattern: GistPattern): boolean;
export function gist_matches(gist: GistStructure, pattern: GistPattern): boolean {
    if (pattern === undefined) {
        return true;
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

// TODO: includes subpattern





