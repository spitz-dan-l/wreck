import { Venience } from "./prelude";

import { ValidTags, GistPattern, GistRenderMethodsImpl, Gists, GistRenderer, Gist, gist_to_string, gist, render_gist } from "gist";
import { createElement, Fragment } from "story";

// FACETS

declare module 'gist' {
    export interface StaticGistTypes {
        facet: {
            children: {
                parent?: ValidTags,
                child: ValidTags
            }
        };
    }
}

// base renderer will just ignore the parent gist and refer to it as the child gist's rendering
GistRenderer('facet', {
    noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {child}) => child
    },
    command_noun_phrase: {
        order: 'BottomUp',
        impl: (tag, {child}) => child
    }
});

// Given a gist, return the list of its facets.
export function get_facets(w: Venience, parent: Gist): Gists['facet'][] {
    const entry = w.knowledge.get_entry(parent);
    if (entry === null) {
        throw new Error('Tried to look up gist '+gist_to_string(parent)+' without an entry in the knowledge base.');
    }

    return entry.dependencies.map((d) => gist('facet', { parent, child: d }));
}

// render story for listing facets and their descriptions
export function render_facet_list(facets: Gists['facet'][]): Fragment {
    if (facets.length === 0) {
        return <div>However, nothing about it seems particularly notable.</div>;
    }

    return <div>
        You notice the following facets:
        {facets.map(f => <blockquote gist={f}>
            {render_gist.noun_phrase(f)}
        </blockquote>)}
    </div>
}