/*
    Interpreting a facet: what happens when an inner action is applied to a
    facet of the frame under reflection.

    A successful interpretation reveals text. The revealed text is grafted
    beneath the facet's passage, both in the past frame (retroactively, with
    an animation) and in the knowledge base, so that considering the topic
    again shows it too.
*/
import { child, exact, Gist } from 'gist';
import { range, update } from 'lib/utils';
import { graft, has_revealed, StoryNode, story_updater, StoryUpdaterSpec, Updates as S, UpdatesBuilder } from 'story';
import { Venience } from '../prelude';
import { cite_facet_class, interpret_facet_class, misinterpret_facet_class, would_cite_facet_class, would_interpret_facet_class } from '../styles';
import { facet } from './facet';

declare module 'story/update/update_group' {
    interface StoryUpdateGroups {
        interpretation_effects: 'Effects on text in past frames, animated before the present-tense text.';
    }
}

export type Interpretation = {
    // Text grafted beneath the facet when the action succeeds. Its presence marks the action as a success.
    revealed?: StoryNode,
    // Present-tense text added to the current frame.
    commentary?: (action: Gist, current_frame: UpdatesBuilder, w: Venience) => StoryUpdaterSpec[],
    // Any further changes to the world (puzzle flags, newly available memories, ...).
    world_updater?: (action: Gist, w: Venience) => Venience,
};

// An action handler for an inner action (a gist with a `facet` child).
export function Exposition(spec: Interpretation) {
    return (action: Gist) => (world: Venience): Venience => {
        const result = apply_facet_interpretation(world, {
            facet: child(action, 'facet'),
            revealed: spec.revealed,
            commentary: spec.commentary === undefined ? undefined
                : (frame, w) => spec.commentary!(action, frame, w)
        });
        return spec.world_updater === undefined ? result : spec.world_updater(action, result);
    };
}

export type FacetInterpretationSpec = {
    facet: Gist,
    revealed?: StoryNode,
    commentary?: (current_frame: UpdatesBuilder, w: Venience) => StoryUpdaterSpec[]
};

export function apply_facet_interpretation(world: Venience, spec: FacetInterpretationSpec): Venience {
    if (world.current_interpretation === undefined) {
        throw new Error('Tried to interpret a facet outside of a reflection.');
    }
    const revealed_gist = spec.revealed?.data.gist;
    if (spec.revealed !== undefined && revealed_gist === undefined) {
        throw new Error('Revealed text must have a gist.');
    }
    const already_revealed = revealed_gist !== undefined && has_revealed(world.knowledge, exact(spec.facet), revealed_gist);

    // The frames from the one under reflection up to the current one.
    const region = range(world.current_interpretation, world.index + 1);
    const passage = () => S.group_name('interpretation_effects').group_stage(-1).frame(region).has_gist(exact(spec.facet));
    const listing = () => S.group_name('interpretation_effects').group_stage(-1).frame(region).has_gist(exact(facet(spec.facet)));

    const interp_class = spec.revealed === undefined ? misinterpret_facet_class : interpret_facet_class;

    return update(world, {
        story_updates: story_updater(
            // Interpretation effects animate first, then the present-tense text.
            S.group_name('init_frame').group_stage(0).move_group_to(-1),

            passage().css({ [interp_class]: true }),
            S.frame(region).has_gist(exact(spec.facet)).would().css({ [would_interpret_facet_class]: true }),
            ...(spec.revealed !== undefined && !already_revealed ? [passage().add(spec.revealed)] : []),

            listing().css({ [cite_facet_class]: true }),
            S.frame(region).has_gist(exact(facet(spec.facet))).would().css({ [would_cite_facet_class]: true }),

            ...(spec.commentary === undefined ? [] : spec.commentary(S.group_stage(0).frame(), world))
        ),
        knowledge: k => (spec.revealed !== undefined && !already_revealed) ? graft(k, exact(spec.facet), spec.revealed) : k
    });
}
