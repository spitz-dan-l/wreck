import { Venience } from "./prelude";

import { ValidTags, Gists, GistRenderer, Gist, gist_to_string, gist, render_gist, bottom_up } from "gist";
import { createElement, Fragment } from "story";

// FACETS

declare module 'gist' {
    export interface StaticGistTypes {
        facet: [{ knowledge: 'knowledge' }];
    }
}

// base renderer will just ignore the parent gist and refer to it as the child gist's rendering
GistRenderer(['facet'], {
    noun_phrase: g => render_gist.noun_phrase(g[1].knowledge[1].content),
    command_noun_phrase: g => render_gist.command_noun_phrase(g[1].knowledge[1].content)
});

// Given a gist, return the list of its facets.
export function get_facets(w: Venience, parent: Gist): Gists['facet'][] {
    const entry = w.knowledge.get_entry({kind: 'Exact', gist: parent});
    if (entry === undefined) {
        throw new Error('Tried to look up gist '+gist_to_string(parent)+' without an entry in the knowledge base.');
    }

    return [['facet', {knowledge: entry.key}], ...entry.children.map((knowledge) => gist('facet', { knowledge }))];
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