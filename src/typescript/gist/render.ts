import { Gist, GistPattern, Gists, gist_matches, ValidTags, InferPatternTags } from './gist';
import { StaticIndex, StaticNameIndexFor } from '../lib/static_resources';
import { map_values } from '../lib/utils';
import { ConsumeSpec } from '../parser';

type GistRenderFunction<OutType> =
    (gist: Gist) => OutType;

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

type GistRenderMethods = {
    [K in keyof GistRendererType]?: GistRenderFunction<GistRendererType[K]>
}

export type GistRendererRule<Tags extends ValidTags=ValidTags> = {
    pattern: GistPattern<Tags>,
    methods: GistRenderMethods
}

export const GIST_RENDERER_INDEX = new StaticIndex<GistRendererRule>();

export type GistRenderImpl<Tag extends ValidTags, OutType, PreRender extends 'prerender' | 'preserve'> =
    (children: {[K in keyof Gists[Tag]['children']]: PreRender extends 'prerender' ? OutType : Gists[Tag]['children'][K]},
     parameters: Gists[Tag]['parameters']) => OutType;


// import {make_adt, ADT, TagName} from '../lib/adt_utils';

// export type GistRenderMethodsImpl<Tags extends ValidTags> = {    
//     [K in keyof GistRendererType]?:
//         ADT<{
//             [TagName]: 'order',
//             TopDown: {
//                 impl: (gist: Gists[Tags]) => GistRendererType[K]    
//             },
//             BottomUp: {
//                 impl: (
//                     tag: Tags,
//                     children: {[CK in keyof Gists[Tags]['children']]: GistRendererType[K]},
//                     parameters: Gists[Tags]['parameters']) => GistRendererType[K]
//             }
//         }>
// }

export type GistRenderMethodsImpl<Tags extends ValidTags> = {    
    [K in keyof GistRendererType]?:
        | {
            order: 'TopDown',
            impl: (gist: Gists[Tags]) => GistRendererType[K]
        }
        | {
            order: 'BottomUp',
            impl: (
                tag: Tags,
                children: {[CK in keyof Gists[Tags]['children']]: GistRendererType[K]},
                parameters: Gists[Tags]['parameters']) => GistRendererType[K]
        }
}

// export function GistRenderer<PatternTags extends ValidTags>(pattern: GistPattern<PatternTags>, method_impls: GistRenderMethodsImpl<PatternTags>): GistRendererRule<PatternTags>;
export function GistRenderer<Pat extends GistPattern, PatternTags extends InferPatternTags<Pat>>(pattern: Pat, method_impls: GistRenderMethodsImpl<PatternTags>): GistRendererRule<PatternTags>;
export function GistRenderer(pattern: GistPattern, method_impls: GistRenderMethodsImpl<ValidTags>): GistRendererRule {
    const result: GistRendererRule = {
        pattern,
        methods: {}
    };

    result.methods = map_values(method_impls, (impl, meth_name) => {
        if (impl === undefined) {
            return undefined;
        }
        if (impl.order === 'TopDown') {
            return impl.impl as GistRenderMethods[typeof meth_name];
        } else {
            return ((gist: Gist) =>
                impl.impl(
                    gist.tag,
                    map_values(gist.children, (g) => (render_gist[meth_name] as any)(g)),
                    gist.parameters
                )
            ) as GistRenderMethods[typeof meth_name];
        }
    });

    GIST_RENDERER_INDEX.add(result);
    return result;
}

function render_for_method<MethodName extends keyof GistRendererType>(method: MethodName, gist: Gist): GistRendererType[MethodName] {
    const renderers = GIST_RENDERER_INDEX.all();

    for (let i = renderers.length - 1; i >= 0; i--) {
        const r = renderers[i];
        if (gist_matches(gist, r.pattern)) {
            const m = r.methods[method];
            if (m !== undefined) {
                return m(gist) as GistRendererType[MethodName];
            }
        }
    }
    throw new Error('No renderers matched with the gist: ' + JSON.stringify(gist));
}

// the default renderer just prints out the gist tag.
GistRenderer(undefined, {
    noun_phrase: {
        order: 'TopDown',
        impl: (g) => g.tag
    },
    command_noun_phrase: {
        order: 'TopDown',
        impl: (g) => g.tag.replace(' ', '_')
    }
});

export const render_gist: {
    [K in keyof GistRendererType]: (gist: Gist) => GistRendererType[K]
} = {
    noun_phrase: (g: Gist) => render_for_method('noun_phrase', g),
    command_noun_phrase: (g: Gist) => render_for_method('command_noun_phrase', g)
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