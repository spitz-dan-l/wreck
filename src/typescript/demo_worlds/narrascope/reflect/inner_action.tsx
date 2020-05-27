import { Gists, Gist, EXACT } from "gist";
import { Updates as S, StoryNode, UpdatesBuilder, StoryUpdaterSpec, story_updater } from "../../../story";
import { Knowledge } from "../../../knowledge";
import { Venience, resource_registry } from "../prelude";
import { update, if_not_null, if_not_null_array, if_array, compute_const } from "lib/utils";
import { misinterpret_facet_class, interpret_facet_class, would_interpret_facet_class, cite_facet_class, would_cite_facet_class } from "../styles";
import { StaticNameIndex, Seal } from "lib/static_resources";


interface StaticInnerActionGistTypes {
    // contemplation-level actions
    scrutinize:[{ facet: 'facet' }];
    hammer: [{ facet: 'facet' }];
    volunteer: [{ facet: 'facet' }];
}

export type InnerActionID = keyof StaticInnerActionGistTypes;
export const INNER_ACTION_IDS: StaticNameIndex<InnerActionID> = {
    scrutinize: null,
    hammer: null,
    volunteer: null
};

declare module '../prelude' {
    export interface StaticActionGistTypes extends StaticInnerActionGistTypes {
    }

    export interface StaticResources {
        exposition_func: typeof Exposition;
    }
}

type InnerActionGist = Gists[InnerActionID];

type Exposition = {
    revealed_child_story?: StoryNode,
    knowledge_updater?: (action_gist: InnerActionGist, k: Knowledge) => Knowledge,
    commentary?: (action_gist: InnerActionGist, current_frame_builder: UpdatesBuilder, w: Venience) => StoryUpdaterSpec[],
};

const init_knowledge = resource_registry.get('initial_world_knowledge');

export function Exposition(exposition: Exposition) {
    const child_gist = if_not_null(exposition.revealed_child_story, (s) => {
        if (s.data.gist === undefined) {
            throw new Error('Passed in a reavealed_child_story without a gist attribute set. Must be set.');
        }
        init_knowledge.update(k => k.ingest(s));
        return s.data.gist;
    });

    return <G extends InnerActionGist>(action_gist: G) => (world: Venience): Venience => {
        const parent_gist = action_gist[1].facet[1].knowledge;
        
        return update(world,
            w => apply_facet_interpretation(w, {
                parent_gist,
                child_gist,
                commentary: if_not_null(exposition.commentary,
                    (c) => (frame, world) => c(action_gist, frame, world))
            }),
            {
                ...if_not_null(exposition.knowledge_updater, (ku) => ({
                    knowledge: k => ku(action_gist, k)
                }))
            }
        );
    }
}

resource_registry.initialize('exposition_func', Exposition)[Seal]();
// resource_registry.get('exposition_func')[Seal]();

declare module '../../../story/update/update_group' {
    interface StoryUpdateGroups {
        'interpretation_effects': 'Effects on text that occurs in the past.'
    }
}

type FacetInterpretationSpec = {
    parent_gist: Gists['knowledge'],
    child_gist?: Gist,
    commentary?: (current_frame_builder: UpdatesBuilder, w: Venience) => StoryUpdaterSpec[]
}

function apply_facet_interpretation(world: Venience, {parent_gist, child_gist, commentary}: FacetInterpretationSpec) {
    // add a new animation stage where we do interpretation stuff first,
    // then add any present tense stuff second.
    const interp_class = child_gist === undefined ? misinterpret_facet_class : interpret_facet_class;

    return update(world, {
        story_updates: story_updater(
            S.group_name('init_frame').group_stage(0).move_group_to(-1),
            ...if_not_null_array(commentary, (c) => [
                c(S.group_stage(0).frame(), world)
            ])
        ),
        knowledge: k =>
            k.update([EXACT, parent_gist], b => [b
                .group_name('interpretation_effects')
                .group_stage(-1)
                .apply(b => [
                    b.css({ [interp_class]: true }),
                    b.would().css({ [would_interpret_facet_class]: true })
                ]),
                ...if_array(() => {
                    if (child_gist === undefined) {
                        return false;
                    }
                    const parent_story = k.get_exact(parent_gist);
                    if (parent_story === undefined) {
                        throw new Error('Tried to add a timbre to a story whose gist is not in knowledge base.');
                    }

                    const has_timbre_already = S.children(S.has_gist(child_gist)).query(parent_story);
                    return has_timbre_already.length === 0;
                }, () => {
                        const child_story = k.get_exact(child_gist!)!
                        // TODO: This is resulting in a story update that
                        // adds the child story twice.
                        // The query returns 2 copies of the parent node, not one.
                        // Still attempting to figure out why.
                        return [b
                            .group_name('interpretation_effects')
                            .group_stage(-1)
                            .debug('addboi')
                            .add(child_story)
                        ];
                    })
            ]).update(['facet', { knowledge: parent_gist }], b => b
                .group_name('interpretation_effects')
                .group_stage(-1)
                .apply(b => [
                    b.css({ [cite_facet_class]: true }),
                    b.would().css({ [would_cite_facet_class]: true })
                ])
            )
    });
}