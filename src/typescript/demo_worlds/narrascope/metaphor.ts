import { Gist, gist, gists_equal, gist_to_string, render_gist_command, render_gist_text, has_tag, Gists } from '../../gist';
import { find_historical, find_index, history_array, interpretation_updater, interps } from "../../interpretation";
import { MessageUpdateSpec, message_updater } from "../../message";
import { ConsumeSpec, ParserThread, Parser } from "../../parser";
import { Puffer } from "../../puffer";
import { StaticIndex, StaticMap } from '../../static_resources';
import { is_simulated, search_future } from '../../supervenience';
import { bound_method, map, update, Updater } from "../../utils";
import { ActionID, FacetID, lock_and_brand, Owner, Puffers, resource_registry, Venience, VeniencePuffer, StaticActionIDs, StaticFacetIDs } from "./prelude";
import { get_thread_maker } from './supervenience_spec';
import Handlebars from 'handlebars';
import { stages } from '../../stages';

export interface Metaphors {
    gist: Gist | null,

    readonly current_interpretation: number | null;

    has_acquired: Map<ActionID, boolean>;

    has_tried: Map<ActionID, Map<FacetID, boolean>>;
    owner: Owner | null;
}

declare module './prelude' {
    export interface Venience extends Metaphors {}

    export interface StaticResources {
        initial_world_metaphor: Metaphors;
        action_index: StaticMap<Record<ActionID, Action>>;
        facet_index: StaticMap<Record<FacetID, FacetSpec>>;
    }
}

resource_registry.initialize('initial_world_metaphor', {
    gist: null,
    owner: null,
    current_interpretation: null,

    has_acquired: map(),
    has_tried: map()
});

const global_lock = resource_registry.get('global_lock', false);

let null_lock = global_lock(null);
let metaphor_lock = global_lock('Metaphor');

export type Action = {
    name: ActionID,
    noun: string,
    noun_cmd: ConsumeSpec,
    description: string,
    slug: string,
    get_wrong_msg: (facet_phrase: string) => MessageUpdateSpec,
    get_cmd: (facet_phrase: ConsumeSpec) => ConsumeSpec
}

type ActionGists = { [K in ActionID]: undefined }

declare module '../../gist' {
    export interface GistSpecs extends ActionGists {
        contemplation: { subject: Gist };
    }
}

function make_action(spec: Action): VeniencePuffer {
    return {
        css_rules: [
            `.history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
                animation-name: interpreting, would-cite !important;
                animation-duration: 2s, 2s !important;
                animation-iteration-count: infinite, infinite !important;
            }`
        ]
    };
}

let action_index = resource_registry.initialize('action_index',
    new StaticMap(StaticActionIDs, [
        function add_action_to_puffers(action: Action) {
            Puffers(make_action(action));
            Gists({
                tag: action.name,
                text: () => action.noun,
                command: () => action.noun_cmd
            });
            return action;
        }
    ])
);

export const Actions = (spec: Action) => action_index.initialize(spec.name, spec);


function get_actions(world: Venience) {
    let actions: Action[] = [];
    for (let [act_id, on] of world.has_acquired) {
        if (on) {
            actions.push(action_index.get(act_id));
        }
    }
    return actions;
}

function any_actions(world: Venience) {
    return [...world.has_acquired].some(([act, on]) => on);
}

function apply_action(world: Venience, facet: FacetSpec, action: Action) {
    if (world.current_interpretation === null) {
        throw new Error(`Tried to apply an action without having a current interpretation.`);
    }
    let interpretted_world = find_index(world, world.current_interpretation)!;
    
    if (!facet.can_recognize(world, interpretted_world)) {
        throw new Error(`Tried to interact with facet ${facet.name} without being able to recognize it.`);
    }

    if (!facet.can_apply(action)) {
        throw new Error(`Tried to apply action ${action.name} to facet ${facet.name}, but it can't be applied.`);
    }
    let already_solved = facet.solved(world);
    
    world = facet.handle_action(action, world);

    world = update(world,
        interpretation_updater(world, (w) =>
            w.index > world.current_interpretation! ? {
                [`descr-${action.slug}-blink`]: Symbol('Once'),
                [`descr-${facet.slug}-blink`]: Symbol('Once')
            } : {}),
        { 
            interpretations: interps({
                [interpretted_world.index]: {
                    [`interp-${facet.slug}-blink`]: Symbol('Once')
                },
                [world.index]: {
                    'animation-new': {
                        kind: 'Interpretation',
                        value: Symbol(),
                        stage: 1
                    }
                }
            }),
            has_tried: map([action.name, map([facet.name, true])])
        });

    let solved = facet.solved(world)
    if (solved) {
        if (!already_solved) {
            return update(world,
                { interpretations: interps({ [interpretted_world.index]: {
                    [`interp-${facet.slug}`]: true
                }})}
            );
        } else if (solved !== already_solved) { // The player picked the right answer again. blink it.
            return update(world, {
                interpretations: interps({ [interpretted_world.index]: {
                    [`interp-${facet.slug}-solved-blink`]: Symbol('Once')
                }})
            });
        }
    }
    return world;
};

export const make_action_applicator = (world: Venience, facet_id: FacetID, action_id: ActionID) => (parser: Parser) => {
        if (!world.has_acquired.get(action_id)) {
            return parser.eliminate();
        }
        
        const facet = facet_index.get(facet_id);
        if (facet === undefined) {
            throw Error('Invalid facet name: '+facet_id);
        }

        const action = action_index.get(action_id);
        if (action === undefined) {
            throw Error('Invalid action name: '+action_id);
        }
        
        if (!facet.can_apply(action)) {
            return parser.eliminate();
        }

        let already_solved = facet.solved(world);
        return (
            parser.consume(
                {
                    tokens: action.get_cmd(facet.noun_phrase_cmd),
                    used: !!already_solved || (world.has_tried.has(action.name) && world.has_tried.get(action.name)![facet.name]),
                    labels: { interp: true, filler: true }
                }, () =>
            parser.submit(() => {
            
            return apply_action(world, facet, action);
            })))

}

// Begin and end contemplations
Puffers(lock_and_brand('Metaphor', {
    pre: world => update(world, { gist: null }),    

    handle_command: stages(
        [2, (world, parser) => {
            if (!any_actions(world)) {
                return parser.eliminate();
            }

            if (world.current_interpretation === null) {
                if (world.previous === null) {
                    return parser.eliminate();
                }

                let contemplatable_worlds: Venience[] = history_array(world).filter(w => w.gist !== null && w.gist.tag !== 'contemplation');

                let gists: Gist[] = [];
                for (let w of contemplatable_worlds) {
                    if (gists.findIndex(g2 => gists_equal(w.gist!, g2)) === -1) {
                        gists.push(w.gist!);
                    }
                }

                parser.label_context = { interp: true, filler: true };

                const immediate_world: Venience | null = (world.previous.gist !== null && world.previous.gist.tag !== 'contemplation') ?
                    world.previous :
                    null;

                const direct_thread: ParserThread<Venience> = () => {
                    if (immediate_world === null) {
                        return parser.eliminate();
                    }
                    return parser.consume(['contemplate', render_gist_command(immediate_world.gist!)], () =>
                    parser.submit(() => {

                    const index = immediate_world.index;
                
                    let descriptions: string[] = [];

                    for (let facet of Object.values(facet_index.all())) {
                        if (!facet.can_recognize(world, immediate_world)) {
                            continue;
                        }
                        descriptions.push(`
                            <blockquote class="descr-${facet.slug}">
                                ${facet.noun_phrase}
                            </blockquote>
                        `);
                    }
                    if (descriptions.length === 0) {
                        descriptions.push('However, nothing about it seems particularly notable.');
                    } else {
                        descriptions.unshift('You notice the following aspects:');
                    }

                    return update(world,
                        w => metaphor_lock.lock(w, index),
                        { 
                            current_interpretation: index,
                            interpretations: interps({
                                [index]: {
                                    'interpretation-block': true,
                                    'interpretation-active': true
                                }
                            }),
                            gist: () => gist('contemplation', {subject: immediate_world.gist!})
                        },
                        message_updater({
                            action: [`You contemplate ${render_gist_text(immediate_world.gist!)}. A sense of focus begins to permeate your mind.`],
                            description: [descriptions.join('')]
                        }),
                    );
                }))};

                const indirect_simulator = 'indirect_contemplation';
                
                if (gists.length === 1 || is_simulated(indirect_simulator, world)) {
                    return direct_thread(parser);
                }

                const indirect_thread: ParserThread<Venience> = (() =>
                    parser.consume({
                        tokens: 'contemplate',
                        labels: {interp: true, filler: true}
                    }, () => {
                    const indirect_threads: ParserThread<Venience>[] = gists.map(g => () => {
                        const indirect_search_id = `contemplate-indirect-${world.index}-${gist_to_string(g)}`;

                        if (immediate_world !== null && gists_equal(g, immediate_world.gist!)) {
                            return parser.eliminate();
                        }

                        const target_gist = gist('contemplation', {
                            subject: has_tag(g, 'memory') ? gist('notes about', {topic: g.children.action}) : g
                        });

                        const result = search_future({
                                thread_maker: get_thread_maker(),
                                goals: [w => !!w.gist && gists_equal(w.gist, target_gist)],
                                max_steps: 2,
                                space: [w => w.gist && gist_to_string(w.gist)],
                                search_id: indirect_search_id,
                                simulator_id: indirect_simulator,
                                command_filter: (w, cmd) => {
                                    let would_contemplate = cmd[0] && cmd[0].token === 'contemplate';

                                    if (w.gist && gists_equal(w.gist, target_gist.children.subject)) {
                                        return would_contemplate;
                                    }
                                    return !would_contemplate;
                                }
                            },
                            world.previous!);
                        if (result.result === null) {
                            return parser.eliminate();
                        }

                        return parser.consume({
                            tokens: render_gist_command(g),
                            labels: {interp: true, filler: true}
                        }, () =>
                        parser.submit(() =>
                        update(world, { child: () => result.result! })));
                    });

                    return parser.split(indirect_threads);
                }
                ));

                const result = parser.split([direct_thread, indirect_thread]);
                return result

            } else {
                return parser.consume({
                    tokens: 'end_contemplation',
                    labels: {interp: true, filler: true}
                }, () => parser.submit(() =>
                update(world,
                    metaphor_lock.release,
                    {
                        current_interpretation: null,
                        interpretations: interps({
                            [world.current_interpretation!]: {'interpretation-active': false}
                        }),
                        has_tried: () => new Map(),
                        
                    },
                    message_updater({
                        action: [`Your mind returns to a less focused state.`]
                    }),
                )));
            }
        }]
    ),
}));

// FACETS

type FacetSpec = {
    name: FacetID, // e.g. "the sense of dread"
    slug: string,
    noun_phrase: string,
    noun_phrase_cmd: ConsumeSpec,

    // assuming the facet's content occurs in the message of the world under interpretation,
    // can the player recognize it as a facet?
    can_recognize: (current_world: Venience, interpretted_world: Venience) => boolean,
    can_apply: (action: Action) => boolean,
    solved: (world: Venience) => boolean | symbol,
    handle_action: (action: Action, world: Venience) => Venience,

    content?: string
};

const facet_index = resource_registry.initialize('facet_index',
    new StaticMap(StaticFacetIDs, [
        function add_facet_to_puffers(spec: FacetSpec) {
            Puffers(make_facet(spec));
            return spec;
        },
        function register_handlebars_partial(spec) {
            if (spec.content !== undefined) {
                Handlebars.registerPartial(spec.name, spec.content);
            }
            return spec;
        }
    ])
);

const make_facet = (spec: FacetSpec): Puffer<Venience> => lock_and_brand('Metaphor', {
    handle_command: (world, parser) => {
        if (world.current_interpretation === null) {
            return parser.eliminate();
        }

        let interpretted_world = find_index(world, world.current_interpretation)!;

        if ( !spec.can_recognize(world, interpretted_world)){
            return parser.eliminate();
        }

        let threads: ParserThread<Venience>[] = [];

        for (let action of Object.values(action_index.all())) {
            threads.push(make_action_applicator(world, spec.name, action.name));
        }

        return parser.split(threads);
    },
    post: (world2, world1) => {
        let updates: Updater<Venience>[] = [];

        if (world2.current_interpretation !== null && world2.current_interpretation === world1.current_interpretation) {
            let interpretted_world = find_historical(world2, w => w.index === world2.current_interpretation)!;
            if (!spec.can_recognize(world1, interpretted_world) && spec.can_recognize(world2, interpretted_world)) {
                updates.push(message_updater({
                    prompt: [`
                    You notice an aspect that you hadn't before:
                    <blockquote class="descr-${spec.slug}">
                        ${spec.noun_phrase}
                    </blockquote>`]}));
            }
        }

        if (spec.can_recognize(world2, world2) && spec.solved(world2)) {
            updates.push(
                { interpretations: interps({ [world2.index]: {
                    [`interp-${spec.slug}`]: true
                }})}
            );
        }
        return update(world2, ...updates);
    },
    css_rules: [`
        .history .would-add-interp-${spec.slug}-blink .${spec.slug} {
            animation-name: interpreting, would-interpret !important;
            animation-duration: 2s, 2s !important;
            animation-iteration-count: infinite, infinite !important;
        }`,

        `.history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
            animation-name: interpreting, would-cite !important;
            animation-duration: 2s, 2s !important;
            animation-iteration-count: infinite, infinite !important;
        }`,

        `.history .adding-interp-${spec.slug}.animation-start .${spec.slug} .interp-${spec.slug} {
            opacity: 0.01;
            max-height: 0px;
        }`,

        `.history .adding-interp-${spec.slug}.animation-start.animation-active .${spec.slug} .interp-${spec.slug} {
            opacity: 1.0;
            transition: max-height 400ms linear, opacity 300ms ease-in;
            transition-delay: 0ms, 400ms;
        }`,

        `.history .interp-${spec.slug} .output-text .interp-${spec.slug} {
            display: block;
            color: gold;
            opacity: 1;
        }`,

        `.history .output-text .interp-${spec.slug} {
            display: none;
        }`,

        `.history .adding-interp-${spec.slug}-blink.animation-start .${spec.slug} .interp-${spec.slug} {
            background-color: orange;
        }`,

        `.history .adding-interp-${spec.slug}-blink.animation-start.animation-active .${spec.slug} .interp-${spec.slug} {
            background-color: inherit;
            transition: background-color 700ms linear;
        }`
    ]
});

export const Facets = (spec: FacetSpec) => facet_index.initialize(spec.name, spec);

