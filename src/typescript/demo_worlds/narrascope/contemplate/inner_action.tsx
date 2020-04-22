import { Gists, Gist } from "gist";
import { Updates as S, StoryNode, UpdatesBuilder, StoryUpdaterSpec, story_updater } from "../../../story";
import { Knowledge } from "../../../knowledge";
import { Venience, resource_registry } from "../prelude";
import { update, if_not_null, if_not_null_array, if_array } from "lib/utils";
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

const init_knowledge = resource_registry.get_resource('initial_world_knowledge');

export function Exposition(exposition: Exposition) {
    if (exposition.revealed_child_story !== undefined) {
        init_knowledge.update(k => k.ingest(exposition.revealed_child_story!));
    }

    return <G extends InnerActionGist>(action_gist: G) => (world: Venience): Venience => {
        const parent_gist = action_gist[1].facet[1].knowledge[1].content;
        const child_gist = exposition.revealed_child_story?.data.gist;

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

resource_registry.initialize('exposition_func', Exposition);
resource_registry.get_resource('exposition_func')[Seal]();

declare module '../../../story/update/update_group' {
    interface StoryUpdateGroups {
        'interpretation_effects': 'Effects on text that occurs in the past.'
    }
}

type FacetInterpretationSpec = {
    parent_gist: Gist,
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
            k.update(parent_gist, b => [b
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
                    const parent_story = k.get(parent_gist);
                    if (parent_story === undefined) {
                        throw new Error('Tried to add a timbre to a story whose gist is not in knowledge base.');
                    }

                    const has_timbre_already = S.children(S.has_gist(child_gist)).query(parent_story);
                    return has_timbre_already.length === 0;
                }, () => [
                    b.add(k.get(child_gist!)!)
                ])
            ]).update(['facet', { knowledge: ['knowledge', {content: parent_gist}]}], b => b
                .group_name('interpretation_effects')
                .group_stage(-1)
                .apply(b => [
                    b.css({ [cite_facet_class]: true }),
                    b.would().css({ [would_cite_facet_class]: true })
                ])
            )
    });
}
