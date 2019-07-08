import { ConsumeSpec } from './parser';
import { StaticIndex } from './static_resources';


/*
    Use Cases
        - composable topics, e.g. my impression of sam, my contemplation of my impression of sam
        - ability to query for subgists, so ie. "does it mention sam?"

    For gists, consider using a StaticIndex of GistSpecs
    the GistSpec would contain the functions about how to compose Gist trees into text phrases or commands
*/

export interface GistSpecs extends ValidateGistSpecs<GistSpecs>  {
    // contemplate: { subject: Gist };
    // consider: { subject: Gist };
    // list: { [k: number]: Gist };
    // sam: null;
}

type ValidateGistSpecs<T extends Record<string, any>> = {
    [K in keyof T]: T[K] extends GistChildren<T> ? T[K] : never
}

export type Gist<Specs extends ValidateGistSpecs<Specs>=GistSpecs, Tag extends string=keyof Specs> = {
    tag: Tag extends keyof Specs ? Tag : string,
    children: GistChildren<Specs> & Specs[Tag]
}
// export type Gist<Specs=GistSpecs, Tag extends keyof Specs=keyof Specs> = {
//     tag: keyof Specs,
//     children: GistChildren<Specs> & Specs[Tag]
// }

type GistChildren<Specs> = null | Record<string | number, Gist<Specs>>;

export type GistRenderer<Specs extends GistSpecs=GistSpecs, Tag extends keyof Specs=keyof Specs> = {
    tag: Tag,
    text: (child_text: { [K in keyof Specs[Tag]]: string }) => string,
    command: (child_commands: { [K in keyof Specs[Tag]]: ConsumeSpec }) => ConsumeSpec
};


export const gist_renderer_index = new StaticIndex<GistRenderer>();

export function render_gist_text(gist: Gist): string {
    let spec = gist_renderer_index.find(gs => gs.tag === gist.tag);
    if (spec === undefined) {
        throw new Error('Missing spec for '+gist.tag);
    }

    if (gist.children === null) {
        return spec.text({});
    }

    let sub_text: any = {};
    for (let [k, v] of Object.entries(gist.children)) {
        sub_text[k] = render_gist_text(v);
    }
    return spec.text(sub_text);
}

export function render_gist_command(gist: Gist): ConsumeSpec {
    let spec = gist_renderer_index.find(gs => gs.tag === gist.tag);
    if (spec === undefined) {
        throw new Error('Missing spec for '+gist.tag);
    }

    let sub_commands: any = {};

    if (gist.children === null) {
        return spec.command({});
    }

    for (let [k, v] of Object.entries(gist.children)) {
        sub_commands[k] = render_gist_command(v);
    }
    return spec.command(sub_commands);
}

export function Gists<Tag extends keyof GistSpecs=keyof GistSpecs>(renderer: GistRenderer<GistSpecs, Tag>) {
    gist_renderer_index.add(renderer);
}


type NoChildren<X> = null extends X ? X : never;

export function gist<Tag extends keyof GistSpecs, C extends NoChildren<GistSpecs[Tag]>>(tag: Tag): Gist<GistSpecs, Tag>;
export function gist<Tag extends keyof GistSpecs>(tag: Tag, children: GistSpecs[Tag]): Gist<GistSpecs, Tag>;
export function gist<Tag extends keyof GistSpecs>(tag: Tag, children?: GistSpecs[Tag]) {
    return {
        tag,
        children: children || null
    }
}


// function is_about_sam(gist: Gist) {
//     if (gist.tag === 'sam') {
//         return true;
//     }

//     if (gist.children === null) {
//         return false;
//     }

//     for (let g of Object.values(gist.children)) {
//         if (is_about_sam(g)) {
//             return true;
//         }
//     }

//     return false;
// }
