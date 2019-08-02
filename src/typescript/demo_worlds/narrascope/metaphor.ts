import { Gist, gist, Gists, gists_equal, gist_renderer_index, render_gist_command, render_gist_text, gist_to_string } from '../../gist';
import { find_historical, history_array, interpretation_updater, find_index, interps } from "../../interpretation";
import { MessageUpdateSpec, message_updater } from "../../message";
import { ConsumeSpec, ParserThread } from "../../parser";
import { Puffer } from "../../puffer";
import { StaticIndex } from '../../static_resources';
import { FutureSearchSpec, is_simulated, search_future } from '../../supervenience';
import { capitalize } from '../../text_tools';
import { bound_method, update, Updater } from "../../utils";
import { ActionID, FacetID, lock_and_brand, Owner, Puffers, resource_registry, Venience, VeniencePuffer } from "./prelude";
import { get_thread_maker } from './supervenience_spec';

export interface Metaphors {
    gist: Gist | null,

    readonly current_interpretation: number | null;

    has_acquired: {[K in ActionID]?: boolean};

    has_tried: {[K in ActionID]?: {[K2 in FacetID]?: boolean}};
    owner: Owner | null;
}

declare module './prelude' {
    export interface Venience extends Metaphors {}

    export interface StaticResources {
        initial_world_metaphor: Metaphors;
        action_index: StaticIndex<Action>;
        facet_index: StaticIndex<FacetSpec>;
        gist_renderer_index: typeof gist_renderer_index;
    }
}

resource_registry.create('initial_world_metaphor', {
    gist: null,
    owner: null,
    current_interpretation: null,

    has_acquired: {},
    has_tried: {}
});

resource_registry.create('gist_renderer_index', gist_renderer_index);

const global_lock = resource_registry.get('global_lock', false);

let null_lock = global_lock(null);
let metaphor_lock = global_lock('Metaphor');

type Action = {
    name: ActionID, // e.g. the direction of gravity
    name_cmd: ConsumeSpec,
    description: string,
    slug: string,
    get_wrong_msg: (facet_phrase: string) => MessageUpdateSpec, // e.g. judging the direction of gravity
    get_cmd: (facet_phrase: ConsumeSpec) => ConsumeSpec
}

// type Abstraction = {
//     name: AbstractionID, // e.g. "the mountain",
//     name_cmd: ConsumeSpec,
//     description: string,
//     slug: string,
//     get_cmd: (action_phrase: ConsumeSpec) => ConsumeSpec,
//     actions: Action[]
// }

type ActionGists = { [K in ActionID]: undefined }

declare module '../../gist' {
    export interface GistSpecs extends ActionGists {
        notes: undefined;
        'notes about': { action: Gist<ActionID> };
        contemplation: { subject: Gist };
    }
}

Gists({
    tag: 'notes',
    text: () => 'your notes',
    command: () => 'my_notes'
});

Gists({
    tag: 'notes about',
    text: ({action}) => `your notes about ${action}`,
    command: ({action}) => ['my_notes about', action]
});


function make_action(spec: Action): VeniencePuffer {
    return {
        handle_command: { 
            kind: 'Stages',
            3: ((world, parser) => 
                !world.has_acquired[spec.name] ?
                    parser.eliminate() :
                
                parser.consume(['notes about', spec.name_cmd], () => parser.submit(() => {

                let msg: MessageUpdateSpec = {
                    description: ['<div class="interp">'+spec.description+'</div>']
                };

                msg.description!.push(
                    `${capitalize(spec.name)} confers:`,
                    `<span class="descr-${spec.slug}">${spec.description}</span>`
                );

                return update(world,
                    message_updater(msg),
                    {
                        gist: () => gist('notes about', { action: gist(spec.name) })
                    });
            })))
        },
        css_rules: [
            `.history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
                animation-name: interpreting, would-cite !important;
                animation-duration: 2s, 2s !important;
                animation-iteration-count: infinite, infinite !important;
            }`
        ]
    };
}

let action_index = resource_registry.create('action_index',
    new StaticIndex([
        function add_abstraction_to_puffers(action: Action) {
            Puffers(make_action(action));
            return action;
        }
    ])
).get();

export const Actions = bound_method(action_index, 'add');


function get_actions(world: Venience) {
    let actions: Action[] = [];
    Object.entries(world.has_acquired).forEach(([act_id, on]) => {
        if (on) {
            actions.push(action_index.find(a => a.name === act_id)!)
        }
    });
    return actions;
}

function any_actions(world: Venience) {
    return Object.entries(world.has_acquired).some(([act, on]) => on);
}

let InterpPuffer: Puffer<Venience> = lock_and_brand('Metaphor', {
    pre: world => update(world, { gist: null }),    

    handle_command: {
        kind: 'Stages',
        3: (world, parser) => {
            let list_consumer = null_lock.lock_parser_thread(
                world,
                (() => 
                    !any_actions(world) ?
                        parser.eliminate() :

                    parser.consume('notes', () => parser.submit(() => {

                    let abstractions = get_actions(world);

                    return update(world,
                        message_updater({
                            description: ['You have written down notes about:',
                                ...abstractions.map(a => `<blockquote class="descr-${a.slug}">${capitalize(a.name)}</blockquote>`)
                            ]
                        }),
                        { gist: () => gist('notes') }
                    )
                })))
            );
            return list_consumer(parser);
        },
        2: (world, parser) => {
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

                    for (let facet of facet_index.all()) {
                        if (!facet.can_recognize(world, immediate_world)) {
                            continue;
                        }
                        descriptions.push(`
                            <blockquote class="descr-${facet.slug}">
                                ${facet.description}
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
                            subject: update(g, {
                                tag: t => t === 'memory' ? 'notes about' : t
                            })
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
                        has_tried: () => ({}),
                        
                    },
                    message_updater({
                        action: [`Your mind returns to a less focused state.`]
                    }),
                )));
            }
        }
    },
});

Puffers(InterpPuffer as Puffer<Venience>);

// FACETS

type FacetSpec = {
    name: FacetID, // e.g. "the sense of dread"
    slug: string,
    phrase: ConsumeSpec,
    description: string,
    can_recognize: (current_world: Venience, interpretted_world: Venience) => boolean,
    can_apply: (action: Action) => boolean,
    solved: (world: Venience) => boolean | symbol,
    handle_action: (action: Action, world: Venience) => Venience
};

const facet_index = resource_registry.create('facet_index',
    new StaticIndex([
        function add_facet_to_puffers(spec: FacetSpec) {
            Puffers(make_facet(spec));
            return spec;
        }
    ])
).get();

function make_facet(spec: FacetSpec): Puffer<Venience> { return lock_and_brand('Metaphor', {
    handle_command: (world, parser) => {
        if (world.current_interpretation === null) {
            return parser.eliminate();
        }

        let interpretted_world = find_index(world, world.current_interpretation)!;

        if (!spec.can_recognize(world, interpretted_world)){
            return parser.eliminate();
        }

        let threads: ParserThread<Venience>[] = [];

        for (let [k, on] of Object.entries(world.has_acquired)) {
            if (!on) {
                continue;
            }
            
            const action = action_index.find((a => a.name === k));
            if (action === undefined) {
                throw Error('Invalid abstraction name: '+k);
            }
            
            if (!spec.can_apply(action)) {
                continue;
            }

            threads.push(() => {
                let already_solved = spec.solved(world);
                return (
                    parser.consume(
                        {
                            tokens: action.get_cmd(action.get_cmd(spec.phrase)),
                            used: !!already_solved || (world.has_tried[action.name] && world.has_tried[action.name]![spec.name]),
                            labels: { interp: true, filler: true }
                        }, () =>
                    parser.submit(() => {

                    world = spec.handle_action(action, world);

                    world = update(world,
                        interpretation_updater(world, (w) =>
                            w.index > world.current_interpretation! ? {
                                [`descr-${action.slug}-blink`]: Symbol('Once'),
                                [`descr-${spec.slug}-blink`]: Symbol('Once')
                            } : {}),
                        { 
                            interpretations: interps({
                                [interpretted_world.index]: {
                                    [`interp-${spec.slug}-blink`]: Symbol('Once')
                                },
                                [world.index]: {
                                    'animation-new': {
                                        kind: 'Interpretation',
                                        value: Symbol(),
                                        stage: 1
                                    }
                                }
                            }),
                            has_tried: { [action.name]: { [spec.name]: true }}
                        });

                    let solved = spec.solved(world)
                    if (solved) {
                        if (!already_solved) {
                            return update(world,
                                { interpretations: interps({ [interpretted_world.index]: {
                                    [`interp-${spec.slug}`]: true
                                }})}
                            );
                        } else if (solved !== already_solved) { // The player picked the right answer again. blink it.
                            return update(world, {
                                interpretations: interps({ [interpretted_world.index]: {
                                    [`interp-${spec.slug}-solved-blink`]: Symbol('Once')
                                }})
                            });
                        }
                    }
                    return world;
                
                }))); 
            });
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
                        ${spec.description}
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
});}

export const Facets = bound_method(facet_index, 'add');