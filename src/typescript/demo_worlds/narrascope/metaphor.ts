import { find_historical, interpretation_updater } from "../../interpretation";
import { MessageUpdateSpec, message_updater } from "../../message";
import { ConsumeSpec, ParserThread } from "../../parser";
import { Puffer, PufferAndWorld } from "../../puffer";
import { capitalize } from '../../text_tools';
import { update, Updater } from "../../utils";
import { AbstractionID, ActionID, FacetID, global_lock, Owner, Puffers, Venience, Initializers } from "./prelude";

export interface Metaphors {
    gist: Gist | null,

    current_interpretation: number | null;

    has_acquired: {[K in AbstractionID]?: boolean};

    has_tried: {[K in ActionID]?: {[K2 in FacetID]?: boolean}};
    owner: Owner | null;
}

declare module './prelude' {
    export interface Venience extends Metaphors {}

    export interface initializers {
        1: Metaphors
    }
}

export const init_metaphors: Metaphors = {
    gist: null,
    owner: null,
    current_interpretation: null,

    has_acquired: {},
    has_tried: {}
}

let null_lock = global_lock(null);
let metaphor_lock = global_lock('Metaphor');


type PW = PufferAndWorld<Venience>;

export type Gist = {
    cmd: ConsumeSpec,
    name: string
}

type Action = {
    name: ActionID, // e.g. the direction of gravity
    description: string,
    slug: string,
    get_wrong_msg: (facet_phrase: string) => MessageUpdateSpec, // e.g. judging the direction of gravity
    get_cmd: (facet_phrase: ConsumeSpec) => ConsumeSpec
}

type Abstraction = {
    name: AbstractionID, // e.g. "the mountain",
    name_cmd: ConsumeSpec,
    description: string,
    slug: string,
    get_cmd: (action_phrase: ConsumeSpec) => ConsumeSpec,
    actions: Action[]
}

function make_abstraction(spec: Abstraction): Puffer<Venience> {
    return null_lock.lock_puffer({
        handle_command: { 1: (world, parser) => {
            if (!world.has_acquired[spec.name]) {
                return parser.eliminate();
            }

            parser.consume(['notes about', spec.name_cmd]);
            parser.submit();

            let msg: MessageUpdateSpec = {
                description: ['<div class="interp">'+spec.description+'</div>']
            };

            if (spec.actions.length === 1) {
                let act = spec.actions[0];
                msg.description!.push(
                    `${capitalize(spec.name)} confers:`,
                    `<span class="descr-${act.slug}">${act.description}</span>`
                );
            } else {
                msg.description!.push(
                    `<br/>Comprising ${spec.name} confers:`,
                    ...spec.actions.map(act =>
                        `<blockquote class="descr-${act.slug}">${act.description}</blockquote>`)
                );
            }

            return update(world,
                message_updater(msg),
                {
                    gist: {
                        name: `your notes about ${spec.name}`,
                        cmd: ['my_notes about', spec.name_cmd]
                    }
                });
        }},
        css_rules: [
            `${spec.actions.map(a =>
                `.history .would-add-descr-${a.slug}-blink .descr-${a.slug},\n`)
                .join('')}
            .history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
                animation-name: interpreting, would-cite !important;
                animation-duration: 2s, 2s !important;
                animation-iteration-count: infinite, infinite !important;
            }`
        ]
    });
}

export const AbstractionIndex: Abstraction[] = [];

export function Abstractions(...abstractions: Abstraction[]) {
    AbstractionIndex.push(...abstractions);

    Puffers(...<Puffer<Venience>[]>abstractions.map(make_abstraction));

    // TODO: push puffers containining css rules for each abstraction
}

function get_abstractions(world: PW) {
    let abstractions: Abstraction[] = [];
    Object.entries(world.has_acquired).forEach(([abs_id, on]) => {
        if (on) {
            abstractions.push(AbstractionIndex.find(a => a.name === abs_id)!)
        }
    });
    return abstractions;
}

function any_abstractions(world: PW) {
    return Object.entries(world.has_acquired).some(([abs, on]) => on);
}

let InterpPuffer: Puffer<Venience> = metaphor_lock.lock_puffer({
    pre: world => update(world, { gist: null }),    

    handle_command: {
        1: (world, parser) => {
            let list_consumer = null_lock.lock_parser_thread(
                world,
                () => {
                    if (!any_abstractions(world)) {
                        parser.eliminate();
                    }

                    parser.consume('notes');
                    parser.submit();

                    let abstractions = get_abstractions(world);

                    return update(world,
                        message_updater({
                            description: ['You have written down notes about:',
                                ...abstractions.map(a => `<blockquote class="descr-${a.slug}">${capitalize(a.name)}</blockquote>`)
                            ]
                        }),
                        {
                            gist: {
                                name: 'your notes',
                                cmd: 'my_notes'
                            }
                        }
                    )
                });
            return list_consumer(parser);
        },

        2: (world, parser) => {
            if (!any_abstractions(world)) {
                parser.eliminate();
            }

            if (world.current_interpretation === null) {

                // TODO: The actual index should be the most recent world
                // in which certain important bits of state have changed
                if (world.previous === null) {
                    return parser.eliminate();
                }

                let threads: ParserThread<PW>[] = [];
                let w: PW | null = world.previous;
                let i = 0;
                while (w !== null && i < 1) {
                    const i_world: PW = w; // gross way of having each thread capture a different world ref
                    w = i_world.previous;
                    i++;

                    if (i_world.gist === null) {
                        continue;
                    }
                    threads.push(() => {
                        parser.consume(['contemplate', i_world.gist!.cmd]);
                        return parser.submit(i_world);
                    });
                }

                let interp_world = parser.split(threads);
                const index = interp_world.index;
                
                let descriptions: string[] = [];

                for (let facet of FacetIndex) {
                    if (!facet.can_recognize(world, interp_world)) {
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
                        interpretations: {
                            [index]: {
                                'interpretation-block': true,
                                'interpretation-active': true
                            }
                        }
                    },
                    message_updater({
                        action: [`You contemplate ${interp_world.gist!.name}. A sense of focus begins to permeate your mind.`],
                        description: descriptions
                    }),
                );
            } else {
                parser.consume('end_contemplation');
                parser.submit();

                return update(world,
                    metaphor_lock.release,
                    {
                        current_interpretation: null,
                        interpretations: {
                            [world.current_interpretation]: {'interpretation-active': false}
                        },
                        has_tried: () => ({}),
                        
                    },
                    message_updater({
                        action: [`Your mind returns to a less focused state.`]
                    }),
                );
            }
        }
    },
});

Initializers(() => {
    Puffers(InterpPuffer as Puffer<Venience>);
});

// FACETS

type FacetSpec = {
    name: FacetID, // e.g. "the sense of dread"
    slug: string,
    phrase: ConsumeSpec,
    description: string,
    can_recognize: (current_world: PW, interpretted_world: PW) => boolean,
    can_apply: (action: [Abstraction, Action]) => boolean,
    solved: (world: PW) => boolean | symbol,
    handle_action: (action: [Abstraction, Action], world: PW) => PW
};

const FacetIndex: FacetSpec[] = [];

// function make_facet<W extends Venience>(spec: FacetSpec<W>): Puffer<W>;
function make_facet(spec: FacetSpec): Puffer<Venience> { return metaphor_lock.lock_puffer({
    handle_command: (world, parser) => {
        if (world.current_interpretation === null) {
            return parser.eliminate();
        }

        let interpretted_world = find_historical(world, w => w.index === world.current_interpretation)!;

        if (!spec.can_recognize(world, interpretted_world)){
            parser.eliminate();
        }

        let threads: ParserThread<PW>[] = [];

        for (let [k, on] of Object.entries(world.has_acquired)) {
            if (!on) {
                continue;
            }
            
            const abs = AbstractionIndex.find((a => a.name === k));
            if (abs === undefined) {
                throw Error('Invalid abstraction name: '+k);
            }
            
            for (let action of abs.actions) {
                let qual_action: [Abstraction, Action] = [abs, action];
                
                if (!spec.can_apply(qual_action)) {
                    continue;
                }
                // TODO: disable certain actions

                threads.push(() => {
                    let already_solved = spec.solved(world);
                    parser.consume({
                        tokens: abs.get_cmd(action.get_cmd(spec.phrase)),
                        used: !!already_solved || (world.has_tried[action.name] && world.has_tried[action.name]![spec.name]),
                        labels: { interp: true, filler: true }
                    });
                    parser.submit();
                    
                    world = spec.handle_action(qual_action, world);

                    world = update(world,
                        interpretation_updater(world, (w) =>
                            w.index > world.current_interpretation! ? {
                                [`descr-${abs.slug}-blink`]: Symbol('Once'),
                                [`descr-${action.slug}-blink`]: Symbol('Once'),
                                [`descr-${spec.slug}-blink`]: Symbol('Once')
                            } : {}),
                        { 
                            interpretations: {
                                [interpretted_world.index]: {
                                    [`interp-${spec.slug}-blink`]: Symbol('Once')
                                }
                            },
                            has_tried: { [action.name]: { [spec.name]: true }}
                        });

                    let solved = spec.solved(world)
                    if (solved) {
                        if (!already_solved) {
                            return update(world,
                                { interpretations: { [interpretted_world.index]: {
                                    [`interp-${spec.slug}`]: true
                                }}}
                            );
                        } else if (solved !== already_solved) { // The player picked the right answer again. blink it.
                            return update(world, {
                                interpretations: { [interpretted_world.index]: {
                                    [`interp-${spec.slug}-solved-blink`]: Symbol('Once')
                                }}
                            });
                        }
                    }
                    return world;
                
                });
            }
        }
        return parser.split(threads);
    },
    post: (world2, world1) => {
        let updates: Updater<PW>[] = [];

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
                { interpretations: { [world2.index]: {
                    [`interp-${spec.slug}`]: true
                }}}
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

export function Facets(facet_spec: FacetSpec) {
    FacetIndex.push(facet_spec);
    Puffers(make_facet(facet_spec));
}

