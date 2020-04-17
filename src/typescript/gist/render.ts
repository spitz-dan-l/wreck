import { Gist, GistPattern, Gists, gist_matches, ValidTags, InferPatternTags, gist_to_string, GistConstructor, gist } from './gist';
import { StaticIndex, StaticNameIndexFor, StaticMap } from '../lib/static_resources';
import { map_values, keys, values, entries } from '../lib/utils';
import { ConsumeSpec } from '../parser';
import { GistPatternDispatcher } from './dispatch';

type GistRenderFunction<OutType> =
    (gist: GistConstructor) => OutType;

type GistRendererType = {
    noun_phrase: string,
    command_noun_phrase: ConsumeSpec,
    command_verb_phrase: ConsumeSpec
}
const STATIC_GIST_RENDERER_NAMES: StaticNameIndexFor<GistRendererType> = {
    noun_phrase: null,
    command_noun_phrase: null,
    command_verb_phrase: null
}

type GistRenderMethods = {
    [K in keyof GistRendererType]: GistRenderFunction<GistRendererType[K]>
}

export type GistRendererRule<Tags extends ValidTags=ValidTags> = {
    pattern: GistPattern<Tags>,
    methods: Partial<GistRenderMethods>
}

export const GIST_RENDERER_DISPATCHERS = new StaticMap<{
    [K in keyof GistRendererType]: GistPatternDispatcher<GistRendererType[K]>
}>(STATIC_GIST_RENDERER_NAMES);

for (const k of keys(STATIC_GIST_RENDERER_NAMES)) {
    GIST_RENDERER_DISPATCHERS.initialize(k, new GistPatternDispatcher());
}

export type RenderImpls = {
    [K in keyof GistRendererType]?: (g: Gist) => GistRendererType[K]
}

export type RenderImplsForPattern<Pat extends GistPattern> = {
    [K in keyof GistRendererType]?: (g: Gists[InferPatternTags<Pat>]) => GistRendererType[K]
}

export function GistRenderer<Pat extends GistPattern>(pattern: Pat, impls: RenderImplsForPattern<Pat>, stage?: number): void;
export function GistRenderer(pattern: GistPattern, impls: RenderImpls, stage: number=0): void {
    for (const [k, v] of entries(impls)) {
        if (v !== undefined) {
            (GIST_RENDERER_DISPATCHERS.get(k, false).add_rule as any)(pattern, v, 0);
        }
    }
}

export const render_gist: GistRenderMethods =
    map_values(STATIC_GIST_RENDERER_NAMES,
        (_, method_name) =>
            ((g: GistConstructor) => {
                const gi = gist(g);   
                const dispatcher = GIST_RENDERER_DISPATCHERS.get(method_name);
                return dispatcher.dispatch(gi);
            }) as GistRenderMethods[typeof method_name]);


// export const GIST_RENDERER_INDEX = new StaticIndex<GistRendererRule>();

// export type GistRenderMethodsImpl<Tags extends ValidTags> = {    
//     [K in keyof GistRendererType]?:
//         | {
//             order: 'TopDown',
//             impl: (gist: Gists[Tags]) => GistRendererType[K]
//         }
//         | {
//             order: 'BottomUp',
//             impl: (
//                 tag: Tags,
//                 children: {[CK in keyof Gists[Tags]['children']]: GistRendererType[K]},
//                 parameters: Gists[Tags]['parameters']) => GistRendererType[K]
//         }
// }

export function bottom_up<G extends Gist, R>(
    g: G,
    f: (
        tag: G['tag'],
        children: {[CK in keyof G['children']]: R},
        parameters: G['parameters']
    ) => R,
    render_child: (g: Gist) => R
): R {
    return f(
        g.tag,
        map_values(g.children, (c) => render_child(c)),
        g.parameters
    )
}

// export function GistRenderer<PatternTags extends ValidTags>(pattern: GistPattern<PatternTags>, method_impls: GistRenderMethodsImpl<PatternTags>): GistRendererRule<PatternTags>;
// export function GistRenderer<Pat extends GistPattern, PatternTags extends InferPatternTags<Pat>>(pattern: Pat, method_impls: GistRenderMethodsImpl<PatternTags>): GistRendererRule<PatternTags>;
// export function GistRenderer(pattern: GistPattern, method_impls: GistRenderMethodsImpl<ValidTags>): GistRendererRule {
//     const result: GistRendererRule = {
//         pattern,
//         methods: {}
//     };

//     result.methods = map_values(method_impls, (impl, meth_name) => {
//         if (impl === undefined) {
//             return undefined;
//         }
//         if (impl.order === 'TopDown') {
//             return impl.impl as GistRenderMethods[typeof meth_name];
//         } else {
//             return ((gist: Gist) =>
//                 impl.impl(
//                     gist.tag,
//                     map_values(gist.children, (g) => (render_gist[meth_name] as any)(g)),
//                     gist.parameters
//                 )
//             ) as GistRenderMethods[typeof meth_name];
//         }
//     });

//     GIST_RENDERER_INDEX.add(result);
//     return result;
// }

// function render_for_method<MethodName extends keyof GistRendererType>(method: MethodName, gist_ctor: GistConstructor): GistRendererType[MethodName] {
//     const g = gist(gist_ctor);

//     const renderers = GIST_RENDERER_INDEX.all();

//     for (let i = renderers.length - 1; i >= 0; i--) {
//         const r = renderers[i];
//         if (gist_matches(g, r.pattern)) {
//             const m = r.methods[method];
//             if (m !== undefined) {
//                 return m(g) as GistRendererType[MethodName];
//             }
//         }
//     }
//     throw new Error('No renderers matched with the gist: ' + JSON.stringify(g));
// }

// the default renderer just prints out the gist tag.
GistRenderer(undefined, {
    noun_phrase: (g) => {
        if (Object.keys(g.children).length === 0 && Object.keys(g.parameters).length === 0) {
            throw new Error(`No noun_phrase renderer matched a compound gist: ${gist_to_string(g)}`);
        }
        return g.tag
    },
    command_noun_phrase: (g) => {
        if (Object.keys(g.children).length === 0 && Object.keys(g.parameters).length === 0) {
            throw new Error(`No command_noun_phrase renderer matched a compound gist: ${gist_to_string(g)}`);
        }
        return g.tag.replace(' ', '_');
    },
    command_verb_phrase: (g) => {
        throw new Error(`No command_verb_phrase renderer matched a gist. (Verb phrases don't have default behavior even for atomic gists.) Gist: ${gist_to_string(g)}`);
    }
}, 5);

// export const render_gist: GistRenderMethods =
//     map_values(STATIC_GIST_RENDERER_NAMES,
//         (_, method_name) =>
//             ((g: GistConstructor) => render_for_method(method_name, g)) as GistRenderMethods[typeof method_name]);
