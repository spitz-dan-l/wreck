import { ConsumeSpec } from './parser';
import { StaticIndex } from './static_resources';

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

/* This will produce an error only if GistSpecs is invalid. */ const InvalidSpecs: never = <InvalidSpecs><unknown>null;

export type GistStructure = {
    tag: string,
    children?: Record<string | number, GistStructure>
}

export type Gist<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    children: GistChildren & GistSpecs[Tag]
}

type GistChildren = undefined | Record<string | number, Gist>;


export type GistRenderer<Tag extends keyof GistSpecs=keyof GistSpecs> = {
    tag: Tag,
    text: (child_text: { [K in keyof GistSpecs[Tag]]: string }) => string,
    command: (child_commands: { [K in keyof GistSpecs[Tag]]: ConsumeSpec }) => ConsumeSpec
};


export const gist_renderer_index = new StaticIndex<GistRenderer>();

export function render_gist_text(gist: Gist): string {
    let spec = gist_renderer_index.find((gs) => {
        return gs.tag === gist.tag
    });
    if (spec === undefined) {
        return gist.tag;
    }

    if (gist.children === undefined) {
        return spec.text({});
    } else {

    let sub_text: any = {};
    for (const k in gist.children) {
        sub_text[k] = render_gist_text(gist.children[k]);
    }
    return spec.text(sub_text);
}
}

export function render_gist_command(gist: Gist): ConsumeSpec {
    let spec = gist_renderer_index.find((gs) => {
        return gs.tag === gist.tag
    });
    if (spec === undefined) {
        return gist.tag.replace(' ', '_');
    }

    let sub_commands: any = {};

    if (gist.children === undefined) {
        return spec.command({});
    }

    for (const k in gist.children) {
        sub_commands[k] = render_gist_command(gist.children[k]);
    }
    return spec.command(sub_commands);
}

export function Gists<Tag extends keyof GistSpecs=keyof GistSpecs>(renderer: GistRenderer<Tag>) {
    gist_renderer_index.add(renderer);
}


type NoChildren<X, Y> = undefined extends X ? Y : never;

export function gist<Tag extends keyof GistSpecs>(tag: NoChildren<GistSpecs[Tag], Tag>): Gist<Tag>//GistVerbose<GistSpecs, Tag>;
export function gist<Tag extends keyof GistSpecs>(tag: Tag, children: GistSpecs[Tag]): Gist<Tag>//GistVerbose<GistSpecs, Tag>;
export function gist<Tag extends keyof GistSpecs>(tag: Tag, children?: GistSpecs[Tag]) {
    return {
        tag,
        children
    }
}

export function gist_to_string(gist: Gist): string {
    let result = gist.tag;

    if (gist.children === undefined) {
        return result;
    }

    result += ';';

    for (let [k, v] of Object.entries(gist.children)) {
        result += k + '|' + gist_to_string(v);
    }

    result += ';';

    return result;
}

export function gists_equal(gist1: Gist, gist2: Gist): boolean {
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
        if (!gists_equal(gist1.children[k], gist2.children![k])) {
            return false;
        }
    }
    return true;
}

export function includes_tag<Tag extends keyof GistSpecs>(tag: Tag, gist: Gist) {
    if (gist.tag === tag) {
        return true;
    }

    if (gist.children === undefined) {
        return false;
    }

    for (const k in gist.children) {
        const g = gist.children[k];
        if (includes_tag(tag, g)) {
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

export function gist_matches(gist: Gist, pattern: GistPattern) {
    if (pattern === undefined) {
        return true;
    }

    if (pattern instanceof Array) {
        return pattern.some(pat => gist_matches(gist, pat));
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

    for (const k in pattern.children as {}) {
        if (!gist_matches(gist.children[k], pattern.children[k])) {
            return false;
        }
    }
    return true;
}

// TODO: includes subpattern





