/*
    Facets: the gist-labelled passages inside a frame under reflection.
    Inner actions (scrutinize, hammer, volunteer) are applied to facets.
*/
import { child, gist, Gist, GistRenderer, gists_equal, render_gist } from 'gist';
import { createElement, Fragment, gist_descendants, Updates as S } from 'story';
import { Venience } from '../prelude';

// A facet gist wraps the gist of the passage it refers to, so that a facet
// listing can be told apart from the passage itself.
export function facet(of: Gist): Gist {
    return gist('facet', { of });
}

GistRenderer({ tag: 'facet' }, {
    noun_phrase: g => render_gist.noun_phrase(child(g, 'of')),
    command_noun_phrase: g => render_gist.command_noun_phrase(child(g, 'of'))
});

// Passages with these gist tags are the *results* of interpretation, never facets.
const NON_FACET_TAGS = ['insight', 'remember', 'facet'];

// The facets of the frame belonging to `interp_world`: every gist-labelled
// passage inside it, except the frame's own label and the topic wrapper.
export function get_facets(world: Venience, interp_world: Venience): Gist[] {
    const frame_gist = interp_world.gist;
    if (frame_gist === undefined) {
        throw new Error('Tried to get the facets of a frame with no gist.');
    }
    const found = S.frame(interp_world.index).query(world.story);
    if (found.length === 0) {
        throw new Error(`Frame ${interp_world.index} was not found in the story.`);
    }
    const wrapper = frame_gist.tag === 'consider' ? child(frame_gist, 'subject') : undefined;

    return gist_descendants(found[0][0])
        .map(n => n.data.gist)
        .filter(g =>
            !NON_FACET_TAGS.includes(g.tag)
            && !gists_equal(g, frame_gist)
            && !(wrapper !== undefined && gists_equal(g, wrapper)));
}

export function render_facet_list(facets: Gist[]): Fragment {
    if (facets.length === 0) {
        return <div>However, nothing about it seems particularly notable.</div>;
    }

    return <div>
        You notice the following facets:
        {facets.map(f => <blockquote gist={facet(f)}>
            {render_gist.noun_phrase(f)}
        </blockquote>)}
    </div>;
}
