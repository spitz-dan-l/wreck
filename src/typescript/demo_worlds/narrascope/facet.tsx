import { Venience } from "./prelude";

import { ValidTags, Gists, GistRenderer, Gist, gist_to_string, gist, render_gist, gists_equal, EXACT } from "gist";
import { immediate_child_gists } from "knowledge";
import { included } from "lib/utils";
import { createElement, Fragment, is_story_node, StoryNode } from "story";

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

// Gist tags whose story nodes are never offered as facets, even though they
// live in the knowledge base. These are the *results* of interpretation
// (revealed text), or internal bookkeeping, rather than things to interpret.
const NON_FACET_TAGS: ValidTags[] = ['insight', 'remember', 'knowledge', 'facet'];

// Given a gist (typically the gist of a frame under reflection), return the
// list of its facets: every gist-bearing story node nested anywhere beneath
// it in the knowledge base, in document order.
export function get_facets(w: Venience, parent: Gist): Gists['facet'][] {
    const entry = w.knowledge.get_entry([EXACT, parent]);
    if (entry === undefined) {
        throw new Error('Tried to look up gist '+gist_to_string(parent)+' without an entry in the knowledge base.');
    }

    // When reflecting on your impression of a topic, the topic node itself is
    // just a wrapper around its facets, so skip it.
    const wrapper: Gist | undefined = parent[0] === 'consider' ? parent[1].subject : undefined;

    const result: Gists['facet'][] = [];

    // The knowledge entry's child list is not in document order, so read the
    // children back out of the entry's story instead.
    const children_in_order = (story: StoryNode, context: Gists['knowledge']): Gists['knowledge'][] =>
        immediate_child_gists().query(story)
            .sort(([, p1], [, p2]) => compare_paths(p1, p2))
            .map(([node]) => gist('knowledge', { content: (node as StoryNode).data.gist!, context }));

    const visit = (knowledge: Gists['knowledge']) => {
        const content = knowledge[1].content;
        const is_wrapper = wrapper !== undefined && gists_equal(content, wrapper);
        if (!is_wrapper && !included(content[0], NON_FACET_TAGS)) {
            result.push(gist('facet', { knowledge }));
        }
        const child_entry = w.knowledge.get_entry([EXACT, knowledge]);
        if (child_entry !== undefined) {
            for (const c of children_in_order(child_entry.story, knowledge)) {
                visit(c);
            }
        }
    };

    for (const c of children_in_order(entry.story, entry.key)) {
        visit(c);
    }

    return result;
}

function compare_paths(p1: number[], p2: number[]): number {
    for (let i = 0; i < Math.min(p1.length, p2.length); i++) {
        if (p1[i] !== p2[i]) {
            return p1[i] - p2[i];
        }
    }
    return p1.length - p2.length;
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
