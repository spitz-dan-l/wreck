import { gist, GistPattern, GistRenderer, GistRenderMethodsImpl, Gists, gist_matches, gist_to_string, InferPatternTags, render_gist } from 'gist';
import { GistAssoc, Knowledge, make_knowledge_puffer } from '../../knowledge';
import { StaticIndex, StaticMap } from '../../lib/static_resources';
import { capitalize } from '../../lib/text_utils';
import { map, range, update } from "../../lib/utils";
import { ConsumeSpec } from "../../parser";
import { createElement, Fragment, StoryNode, story_updater, Updates as S } from '../../story';
import { Exposition } from './contemplate';
import { ActionID, lock_and_brand, Owner, Puffers, resource_registry, StaticActionIDs, Venience, VeniencePuffer } from "./prelude";
import { insight_text_class } from './styles';

export interface Metaphors {
    gist: Gists[ActionID] | null,

    readonly current_interpretation: number | null;

    knowledge: Knowledge,

    has_acquired: Map<ActionID, boolean>;

    has_tried: GistAssoc<boolean, ActionID>;
    // has_tried: Map<ActionID, Map<FacetID, boolean>>;
    owner: Owner | null;
}

declare module './prelude' {
    export interface Venience extends Metaphors {}

    export interface StaticResources {
        initial_world_metaphor: Metaphors;
        action_index: StaticMap<Record<ActionID, Action>>;
        // facet_index: GistAssoc<FacetSpec, 'facet'>; //StaticMap<Record<FacetID, FacetSpec>>;
        initial_world_knowledge: Knowledge;
        // exposition_index: GistAssoc<Exposition>;
    }
}

declare module 'gist' {
    export interface StaticGistTypes {
        // action exposition/description gists
        // use a parameter rather than child so we can just use the tag,
        // without caring about children.
        'action description': {
            parameters: {
                action: ActionID
            }
        };
        'Katya on': { children: {
            action_description: 'action description'
        }};

        // details: { children: {subject: ValidTags } };

    }
}

resource_registry.initialize('initial_world_knowledge',
    new Knowledge(),
    (k) => {
        resource_registry.initialize('initial_world_metaphor', {
            gist: null,
            owner: null,
            current_interpretation: null,
            knowledge: k,
            has_acquired: map(),
            has_tried: new GistAssoc([])// map()
        });
    }
);
const init_knowledge = resource_registry.get_resource('initial_world_knowledge');

// resource_registry.initialize('exposition_index', new GistAssoc<Exposition>([]));
// const exposition_index = resource_registry.get_resource('exposition_index');

Puffers(make_knowledge_puffer({
    get_knowledge: w => w.knowledge,
    set_knowledge: (w, k) => update(w, { knowledge: () => k }),
    get_dynamic_region: w => {
        if (w.current_interpretation === null) {
            return null;
        }
        return S.frame(range(w.current_interpretation!, w.index + 1));
    }
}));

export type Action =
& { 
    [ID in ActionID]: {
        id: ID,
        
        render_impls: GistRenderMethodsImpl<ID>
    }
}[ActionID]
& {
    description_noun_phrase: string,
    description_command_noun_phrase: ConsumeSpec,
    description: Fragment, // probably make this a fragment
    katya_quote: Fragment, // probably make this a fragment
    memory?: Fragment,

    puffer?: VeniencePuffer
};

let action_index = resource_registry.initialize('action_index',
    new StaticMap(StaticActionIDs)
);

export function Action(spec: Action) {
    GistRenderer(spec.id, spec.render_impls);

    const descr_gist = gist({ tag: 'action description', parameters: {action: spec.id}});

    GistRenderer(descr_gist, {
        noun_phrase: {
            order: 'TopDown',
            impl: () => spec.description_noun_phrase
        },
        command_noun_phrase: {
            order: 'TopDown',
            impl: () => spec.description_command_noun_phrase
        }
    });

    const katya_on_gist = gist('Katya on', {action_description: descr_gist});
    // const descr_gist = gist('action description', {}, {action: spec.id});
    init_knowledge.update(k => k.ingest(
        // main story bit about the action
        <div gist={descr_gist}>
            <div
                gist={katya_on_gist}
                className={insight_text_class}
            >
                {spec.katya_quote}
            </div>
            <br />
            {capitalize(render_gist.noun_phrase(descr_gist))} confers:
            <blockquote>
                {spec.description}
            </blockquote>
        </div>,

        // the notes about the action, which contains the main body above
        (k) => <div gist={{ tag: 'notes about', children: { subject: descr_gist }}}>
            <strong>{capitalize(render_gist.noun_phrase(descr_gist))}</strong>
            {k.get(descr_gist)!}
        </div>
    ));

    if (spec.memory !== undefined) {
        ActionHandler({
            tag: 'scrutinize',
            children: {
                facet: {
                    tag: 'facet', 
                    children: { child: katya_on_gist }
                }
            }
        }, Exposition({
            // the expanded memory associated w the action, once you uncover it
            revealed_child_story:
                <blockquote
                    gist={{ tag: 'memory about', children: { subject: katya_on_gist }}}
                    className={insight_text_class}
                >
                    {spec.memory}
                </blockquote> as StoryNode
        }));
    }

    if (spec.puffer !== undefined) {
        Puffers(spec.puffer);
    }

    action_index.initialize(spec.id, spec);

    return spec;
}

// type InnerActionGist = Gists['attend' | 'scrutinize' | 'hammer' | 'volunteer'];

// type Exposition = {
//     revealed_child_story?: StoryNode,
//     knowledge_updater?: (k: Knowledge, action_gist?: InnerActionGist) => Knowledge,
//     commentary?: (current_frame_builder: UpdatesBuilder, w?: Venience, action_gist?: InnerActionGist) => StoryUpdaterSpec[],
// };

// export function Exposition(exposition: Exposition) {
//     // exposition_index.update(e => e.set(spec.triggering_action, spec));

//     if (exposition.revealed_child_story !== undefined) {
//         init_knowledge.update(k => k.ingest(exposition.revealed_child_story!));
//     }

//     return (action_gist: InnerActionGist, world: Venience) => {
//         const parent_gist = action_gist.children.facet.children.child;
//         const child_gist = exposition.revealed_child_story?.data.gist;

//         return update(world,
//             w => apply_facet_interpretation(w, {parent_gist, child_gist, commentary: exposition.commentary}),
//             {
//                 ...if_not_null(exposition.knowledge_updater, (ku) => ({
//                     knowledge: k => ku(k, action_gist)
//                 }))
//             }
//         );
//     }
// }

// declare module '../../story/update/update_group' {
//     interface StoryUpdateGroups {
//         'interpretation_effects': 'Effects on text that occurs in the past.'
//     }
// }

// type FacetInterpretationSpec = {
//     parent_gist: Gist,
//     child_gist?: Gist,
//     commentary?: (current_frame_builder: UpdatesBuilder, w?: Venience, action_gist?: Gist) => StoryUpdaterSpec[]
// }

// function apply_facet_interpretation(world: Venience, {parent_gist, child_gist, commentary}: FacetInterpretationSpec) {
//     // add a new animation stage where we do interpretation stuff first,
//     // then add any present tense stuff second.
//     const interp_class = child_gist === undefined ? misinterpret_facet_class : interpret_facet_class;

//     return update(world, {
//         story_updates: story_updater(
//             S.group_name('init_frame').group_stage(0).move_group_to(-1),
//             ...if_not_null_array(commentary, (c) => [
//                 c(S.group_stage(0).frame(), world)
//             ])
//         ),
//         knowledge: k =>
//             k.update(parent_gist, b => [b
//                 .group_name('interpretation_effects')
//                 .group_stage(-1)
//                 .apply(b => [
//                     b.css({ [interp_class]: true }),
//                     b.would().css({ [would_interpret_facet_class]: true })
//                 ]),
//                 ...if_array(() => {
//                     if (child_gist === undefined) {
//                         return false;
//                     }
//                     const parent_story = k.get(parent_gist);
//                     if (parent_story === null) {
//                         throw new Error('Tried to add a timbre to a story whose gist is not in knowledge base.');
//                     }

//                     const has_timbre_already = S.children(S.has_gist(child_gist)).query(parent_story);
//                     return has_timbre_already.length === 0;
//                 }, () => [
//                     b.add(k.get(child_gist!)!)
//                 ])
//             ]).update({ tag: 'facet', children: { child: parent_gist }}, b => b
//                 .group_name('interpretation_effects')
//                 .group_stage(-1)
//                 .apply(b => [
//                     b.css({ [cite_facet_class]: true }),
//                     b.would().css({ [would_cite_facet_class]: true })
//                 ])
//             )
//     });
// }

type ActionHandlerRule<AID extends ActionID=ActionID> = {
    action_pattern: GistPattern<AID>,

    handle: (g: Gists[AID], w: Venience) => Venience
}

const ACTION_HANDLER_INDEX = new StaticIndex<ActionHandlerRule>();

export function ActionHandler<Pat extends GistPattern<ActionID>>(pattern: Pat, handler: (g: Gists[InferPatternTags<Pat>], w: Venience) => Venience): ActionHandlerRule<InferPatternTags<Pat> & ActionID>;
export function ActionHandler(pattern: GistPattern<ActionID>, handler: (g: Gists[ActionID], w: Venience) => Venience) {
    const result: ActionHandlerRule = {
        action_pattern: pattern,
        handle: handler
    }

    ACTION_HANDLER_INDEX.add(result);
    return result;
}

export function handle_action(action_gist: Gists[ActionID], w: Venience): Venience {    
    const handlers = ACTION_HANDLER_INDEX.all();
    
    for (let i = handlers.length - 1; i >= 0; i--) {
        const h = handlers[i]
        if (gist_matches(action_gist, h.action_pattern)) {
            return h.handle(action_gist, w);
        }
    }
    throw new Error('No handlers matches with the action gist: ' + gist_to_string(action_gist));
}

// trigger action handlers based on the action that just occurred.
Puffers(lock_and_brand('Metaphor', {
    pre: world => update(world, { gist: null }),
    
    post: (w2, w1) => {
        if (w2.gist !== null) {
            
            w2 = handle_action(w2.gist, w2);

            w2 = update(w2, {
                has_tried: _ => _.set(w2.gist!, true),
                story_updates: story_updater(
                    S.frame().set_gist(w2.gist!)
                )
            });
        }
        return w2;
    }
}));


// export const Action = (spec: Action) => action_index.initialize(spec.id, spec);


// function get_actions(world: Venience) {
//     let actions: Action[] = [];
//     for (let [act_id, on] of world.has_acquired) {
//         if (on) {
//             actions.push(action_index.get(act_id));
//         }
//     }
//     return actions;
// }

// export function any_actions(world: Venience) {
//     return [...world.has_acquired].some(([act, on]) => on);
// }

// function apply_action(world: Venience, facet: FacetSpec, action: Action) {
//     if (world.current_interpretation === null) {
//         throw new Error(`Tried to apply an action without having a current interpretation.`);
//     }
//     let interpretted_world = find_index(world, world.current_interpretation)!;
    
//     if (!facet.can_recognize(world, interpretted_world)) {
//         throw new Error(`Tried to interact with facet ${facet.name} without being able to recognize it.`);
//     }

//     if (!facet.can_apply(action)) {
//         throw new Error(`Tried to apply action ${action.id} to facet ${facet.name}, but it can't be applied.`);
//     }
//     let already_solved = facet.solved(world);
    
//     world = facet.handle_action(action, world);

//     world = update(world, { 
//         has_tried: map([action.id, map([facet.name, true])]),
//         story_updates: story_updater(
//             Groups.name('init_frame').stage(0).move_to(-1),
//             Groups.name('interpretation_effects').stage(-1).push(
//                 S.frame(indices_where(world, (w => w.index > world.current_interpretation!)))
//                     .has_gist({ tag: 'facet', children: { child: facet.name }})
                
//                     .css({
//                         [`eph-descr-${action.slug}-blink`]: true,
//                         [`eph-descr-${facet.slug}-blink`]: true
//                     }),
//                 S.frame(world.current_interpretation!)
//                     .css({
//                         [`eph-interp-${facet.slug}-blink`]: true
//                     })
//             )
//         )
//     });

//     let solved = facet.solved(world)
//     if (solved) {
//         if (!already_solved) {
//             return update(world, {
//                 story_updates: story_updater(
//                     Groups.name('interpretation_effects').push(
//                         S.frame(interpretted_world.index).css({ [`interp-${facet.slug}`]: true })
//                     )
//                 )
//             });
//         } else if (solved !== already_solved) { // The player picked the right answer again. blink it.
//             return update(world, {
//                 story_updates: story_updater(
//                     Groups.name('interpretation_effects').push(
//                         S.frame(interpretted_world.index).css({ [`eph-interp-${facet.slug}-solved-blink`]: true })
//                     )
//                 )
//             });
//         }
//     }
//     return world;
// };

// export const make_action_applicator = (world: Venience, facet_id: FacetID, action_id: ActionID) => (parser: Parser) => {
//         if (!world.has_acquired.get(action_id)) {
//             return parser.eliminate();
//         }
        
//         const facet = facet_index.get(facet_id);
//         if (facet === undefined) {
//             throw Error('Invalid facet name: '+facet_id);
//         }

//         const action = action_index.get(action_id);
//         if (action === undefined) {
//             throw Error('Invalid action name: '+action_id);
//         }
        
//         if (!facet.can_apply(action)) {
//             return parser.eliminate();
//         }

//         let already_solved = facet.solved(world);
//         return (
//             parser.consume(
//                 {
//                     tokens: render_gist.command_verb_phrase(gist({
//                         tag: action_id,
//                         children: {
//                             facet: facet.name
//                         }
//                     })), // action.get_cmd(facet.noun_phrase_cmd),
//                     used: !!already_solved || (world.has_tried.has(action.id) && world.has_tried.get(action.id)!.get(facet.name)),
//                     labels: { interp: true, filler: true }
//                 }, () =>
//             parser.submit(() => {
            
//             return apply_action(world, facet, action);
//             })))

// }




// // FACETS

// type FacetGists = { [K in FacetID]: {} };
// declare module 'gist' {
//     export interface StaticGistTypes extends FacetGists {
//         facet: {
//             children: {
//                 parent?: ValidTags,
//                 child: ValidTags
//             }
//         };
//     }
// }


// type Facet = {
//     pattern: GistPattern<'facet'>,
//     render_impls?: GistRenderMethodsImpl<'facet'>,

//     // assuming the facet's content occurs in the message of the world under interpretation,
//     // can the player recognize it as a facet?
//     can_recognize?: (facet: Gists['facet'], current_world: Venience, interpretted_world: Venience) => boolean,
    
//     // can action be applied to the facet? (ie should it show up in the typeahead?)
//     can_apply?: (facet: Gists['facet'], action: Action) => boolean,

//     handle_action: (facet: Gists['facet'], action: Action, world: Venience) => Venience,
// };

// function process_facet(spec: Facet) {
//     if (spec.render_impls !== undefined) {
//         GistRenderer(spec.pattern, spec.render_impls);
//     }
//     return spec;
// }

// // base renderer will just ignore the parent gist and refer to it as the child gist's rendering
// GistRenderer('facet', {
//     noun_phrase: {
//         order: 'BottomUp',
//         impl: (tag, {child}) => child
//     },
//     command_noun_phrase: {
//         order: 'BottomUp',
//         impl: (tag, {child}) => child
//     }
// });

// type FacetSpec = {
//     name: FacetID, // e.g. "the sense of dread"
//     slug: string,
//     noun_phrase: string,
//     noun_phrase_cmd: ConsumeSpec,

//     // assuming the facet's content occurs in the message of the world under interpretation,
//     // can the player recognize it as a facet?
//     can_recognize: (current_world: Venience, interpretted_world: Venience) => boolean,
//     can_apply: (action: Action) => boolean,
//     solved: (world: Venience) => boolean | symbol,
//     handle_action: (action: Action, world: Venience) => Venience,

//     content?: Fragment
// };

// export function RenderFacet(props: { name: FacetID }) {
//     const f = facet_index.get(props.name);
//     if (f.content === undefined) {
//         throw new Error(`Tried to render facet ${props.name} with no content set.`);
//     }
//     return f.content;
// }

// const facet_index = resource_registry.initialize('facet_index',
//     new StaticMap(StaticFacetIDs, [
//         function add_facet_to_puffers(spec: FacetSpec) {
//             Puffers(make_facet(spec));
//             return spec;
//         }
//     ])
// );

// const make_facet = (spec: FacetSpec): Puffer<Venience> => lock_and_brand('Metaphor', {
//     handle_command: (world, parser) => {
//         if (world.current_interpretation === null) {
//             return parser.eliminate();
//         }

//         let interpretted_world = find_index(world, world.current_interpretation)!;

//         if ( !spec.can_recognize?.(world, interpretted_world)){
//             return parser.eliminate();
//         }

//         let threads: ParserThread<Venience>[] = [];

//         for (let action of Object.values(action_index.all())) {
//             threads.push(make_action_applicator(world, spec.name, action.id));
//         }

//         return parser.split(threads);
//     },
//     post: (world2, world1) => {
//         let updates: Updater<Venience>[] = [];

//         if (world2.current_interpretation !== null && world2.current_interpretation === world1.current_interpretation) {
//             let interpretted_world = find_historical(world2, w => w.index === world2.current_interpretation)!;
//             if (!spec.can_recognize(world1, interpretted_world) && spec.can_recognize(world2, interpretted_world)) {
//                 updates.push({ story_updates: story_updater(
//                     S.prompt(<div>
//                         You notice an aspect that you hadn't before:
//                         <blockquote className={`descr-${spec.slug}`}>
//                             {spec.noun_phrase}
//                         </blockquote>
//                     </div>)
//                 ) });
//             }
//         }

//         if (spec.can_recognize(world2, world2) && spec.solved(world2)) {
//             updates.push({ story_updates: story_updater(
//                 S.frame().css({ [`interp-${spec.slug}`]: true })
//             ) });
//         }
//         return update(world2, ...updates);
//     },
//     css_rules: [`
//         .history .would-add-interp-${spec.slug}-blink .${spec.slug} {
//             animation-name: interpreting, would-interpret !important;
//             animation-duration: 2s, 2s !important;
//             animation-iteration-count: infinite, infinite !important;
//         }`,

//         `.history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
//             animation-name: interpreting, would-cite !important;
//             animation-duration: 2s, 2s !important;
//             animation-iteration-count: infinite, infinite !important;
//         }`,

//         `.history .adding-interp-${spec.slug}.animation-start .${spec.slug} .interp-${spec.slug} {
//             opacity: 0.01;
//             max-height: 0px;
//         }`,

//         `.history .adding-interp-${spec.slug}.animation-start.animation-active .${spec.slug} .interp-${spec.slug} {
//             opacity: 1.0;
//             transition: max-height 400ms linear, opacity 300ms ease-in;
//             transition-delay: 0ms, 400ms;
//         }`,

//         `.history .interp-${spec.slug} .output-text .interp-${spec.slug} {
//             display: block;
//             color: gold;
//             opacity: 1;
//         }`,

//         `.history .output-text .interp-${spec.slug} {
//             display: none;
//         }`,

//         `.history .adding-interp-${spec.slug}-blink.animation-start .${spec.slug} .interp-${spec.slug} {
//             background-color: orange;
//         }`,

//         `.history .adding-interp-${spec.slug}-blink.animation-start.animation-active .${spec.slug} .interp-${spec.slug} {
//             background-color: inherit;
//             transition: background-color 700ms linear;
//         }`
//     ]
// });

// export const Facets = (spec: FacetSpec) => facet_index.initialize(spec.name, spec);

