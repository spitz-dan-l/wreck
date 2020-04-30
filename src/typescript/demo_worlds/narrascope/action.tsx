import { gist, GistPattern, GistPatternUpdateDispatcher, GistRenderer, Gists, RenderImplsForPattern, render_gist, Gist, match, MatchResult, ValidTags, _MatchResult, FilledGists, GIST_RENDERER_DISPATCHERS } from 'gist';
import { gate_puffer } from 'puffer';
import { GistAssoc, Knowledge, make_knowledge_puffer } from 'knowledge';
import { StaticMap, OnSealed } from 'lib/static_resources';
import { capitalize } from 'lib/text_utils';
import { bound_method, map, range, update } from "lib/utils";
import { ConsumeSpec } from "parser";
import { createElement, Fragment, StoryNode, story_updater, Updates as S } from 'story';
import { ActionID, Owner, Puffers, resource_registry, STATIC_ACTION_IDS, Venience, VeniencePuffer } from "./prelude";
import { insight_text_class } from './styles';


export interface Actions {
    gist: Gists[ActionID] | undefined,

    readonly current_interpretation: number | undefined;

    knowledge: Knowledge,

    has_acquired: Map<ActionID, boolean>;

    has_tried: GistAssoc<boolean, ActionID>;
    owner: Owner | undefined;
}

declare module './prelude' {
    export interface Venience extends Actions {}

    export interface StaticResources {
        initial_world_metaphor: Actions;
        action_index: StaticMap<Record<ActionID, Action>>;
        initial_world_knowledge: Knowledge;
        action_handler_dispatcher: GistPatternUpdateDispatcher<Venience, ActionID>
    }
}

declare module 'gist' {
    export interface StaticGistTypes {
        // action exposition/description gists
        // use a parameter rather than child so we can just use the tag,
        // without caring about children.
        'action description': [{}, { action: ActionID }];
        'Katya on': [{
            action_description: 'action description'
        }];
    }
}

resource_registry.initialize('initial_world_knowledge',
    new Knowledge(),
    (k) => {
        resource_registry.initialize('initial_world_metaphor', {
            gist: undefined,
            owner: undefined,
            current_interpretation: undefined,
            knowledge: k.get(),
            has_acquired: map(['consider', true], ['remember', true]),
            has_tried: new GistAssoc([])// map()
        });
    }
);
const init_knowledge = resource_registry.get('initial_world_knowledge');

Puffers(make_knowledge_puffer({
    get_knowledge: w => w.knowledge,
    set_knowledge: (w, k) => update(w, { knowledge: () => k }),
    get_dynamic_region: w => {
        if (w.current_interpretation === undefined) {
            return undefined;
        }
        return S.frame(range(w.current_interpretation!, w.index + 1));
    }
}));

export type Action =
& { 
    [ID in ActionID]: {
        id: ID,
        
        render_impls: RenderImplsForPattern<Gists[ID]>,

        memory_prompt_impls?: RenderImplsForPattern<
            ['memory prompt', { memory:
                ['remember', { subject:
                    ['action description', undefined, {action: ID}]}]}]
        >
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
    new StaticMap(STATIC_ACTION_IDS)
).get_pre_runtime();

export function Action(spec: Action) {
    GistRenderer([spec.id] as GistPattern<typeof spec.id>, spec.render_impls);

    const descr_gist = gist('action description', undefined, {action: spec.id});

    GistRenderer(descr_gist, {
        noun_phrase: () => spec.description_noun_phrase,
        command_noun_phrase: () => spec.description_command_noun_phrase
    });

    const katya_on_gist = gist('Katya on', {action_description: descr_gist});
    // const descr_gist = gist('action description', {}, {action: spec.id});
    GIST_RENDERER_DISPATCHERS[OnSealed](() => {
        init_knowledge.update(k => (k
            // main story bit about the action
            .ingest(<div gist={descr_gist}>
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
            </div>)
            
            // the notes about the action, which contains the main body above
            .ingest((k) => <div gist={['notes', { subject: descr_gist }]}>
                <strong>{capitalize(render_gist.noun_phrase(descr_gist))}</strong>
                {k.get_exact(descr_gist)!}
            </div>)

            .ingest((k) => <div gist={['remember', { subject: descr_gist }]}>
                You close your eyes, and hear Katya's voice:
                {k.get_exact(descr_gist)!}
            </div>)
        ));
    });

    if (spec.memory_prompt_impls !== undefined) {
        GistRenderer(['memory prompt', {memory: ['remember', {subject: descr_gist}]}], spec.memory_prompt_impls);
    }

    if (spec.memory !== undefined) {
        resource_registry.get('exposition_func')[OnSealed](e => {
            const Exposition = e.get();
            ActionHandler(['scrutinize', {
                facet: ['facet', { knowledge: ['knowledge', { content: katya_on_gist }]}]
            }], Exposition({
                // the expanded memory associated w the action, once you uncover it
                revealed_child_story:
                    <blockquote
                        gist={['remember', { subject: katya_on_gist }]}
                        className={insight_text_class}
                    >
                        {spec.memory}
                    </blockquote> as StoryNode
            }));
        });
    }

    if (spec.puffer !== undefined) {
        Puffers(
            gate_puffer(
                (w, is_old) => w.has_acquired.get(spec.id)!!,
                spec.puffer
            )
        );
    }

    action_index.initialize(spec.id, spec);

    return spec;
}

const ACTION_HANDLER_DISPATCHER = resource_registry.initialize('action_handler_dispatcher', new GistPatternUpdateDispatcher()).get_pre_runtime();
export const ACTION_HANDLER_FALLTHROUGH_STAGE = 5;

export const ActionHandler = bound_method(ACTION_HANDLER_DISPATCHER, 'add_rule');

export function handle_action(action_gist: Gists[ActionID], w: Venience): Venience {    
    return ACTION_HANDLER_DISPATCHER.apply_all(action_gist, w, ACTION_HANDLER_FALLTHROUGH_STAGE);
}

export function action_consume_spec(action_gist: Gists[ActionID], world: Venience): ConsumeSpec {
    return {
        tokens: render_gist.command_verb_phrase(action_gist),
        used: world.has_tried.get(action_gist)
    };
}

// trigger action handlers based on the action that just occurred.
Puffers({
    pre: world => {
        let result = world;
        if (world.previous !== undefined) {
            const prev_gist = world.previous.gist;
            if (prev_gist !== undefined) {
                if (world.knowledge.get_entry({ kind: 'Exact', gist: ['knowledge', {content: prev_gist}]}) === undefined) {
                    const prev_frame = S.frame(world.previous!.index).query(world.story)[0][0]
                    result = update(result, {
                        knowledge: _ => _.ingest(prev_frame)
                    });
                }
                
            }
        }
        return update(result, {
            gist: undefined
        });
    },
    
    post: (w2, w1) => {
        if (w2.gist !== undefined) {
            w2 = update(w2, {
                story_updates: story_updater(
                    S.frame().set_gist(w2.gist!)
                )
            });

            w2 = handle_action(w2.gist!, w2);

            w2 = update(w2, {
                has_tried: _ => _.set(w2.gist!, true)
            });

            
        }

        return w2;
    }
});

// for the special case of remembering an action description,
// now add the action id to has_acquired so the player can do that action.
ActionHandler(['remember', { subject: ['action description'] } ],
    (action_gist) => (world) => {
       const new_action_id = action_gist[1].subject[2].action;

        return update(world, {
            has_acquired: map([new_action_id, true])
        })
    }
);


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

