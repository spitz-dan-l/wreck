import { MessageUpdateSpec, message_updater } from "../../message";
import { ConsumeSpec, ParserThread } from "../../parser";
import { Puffer, PufferAndWorld } from "../../puffer";
import { find_historical } from "../../interpretation";
import { update, Updater } from "../../utils";
import { Venience, Puffers, AbstractionID, ActionID, FacetID } from "./narrascope";

export interface Metaphors {
    current_interpretation: number | null;
    current_interp_description: number | null;

    has_acquired: {[K in AbstractionID]?: boolean};

    // NOTE: assumes there is a single correct interp per facet
    // may want to change this later but for now let's go with it
    has_solved: {[K in FacetID]?: boolean};

    has_tried: {[K in ActionID]?: {[K2 in FacetID]?: boolean}};
}

export const init_metaphors: Metaphors = {
    current_interpretation: null,
    current_interp_description: null,

    has_acquired: {},
    has_solved: {},
    has_tried: {}
}


type PW<W extends Metaphors=Metaphors> = PufferAndWorld<W>;

type Action = {
    name: ActionID, // e.g. the direction of gravity
    get_wrong_msg: (facet_phrase: string) => MessageUpdateSpec, // e.g. judging the direction of gravity
    get_cmd: (facet_phrase: ConsumeSpec) => ConsumeSpec
}

type Abstraction = {
    name: AbstractionID, // e.g. "the Mountain"
    get_cmd: (action_phrase: ConsumeSpec) => ConsumeSpec,
    actions: Action[]
}

export const AbstractionIndex: Abstraction[] = [];
export function Abstractions(...abstractions: Abstraction[]) {
    AbstractionIndex.push(...abstractions);
}

// TODO: Change this to refer to any of the past X pieces of history
//        Each world history must be summarizable as a phrase.
let InterpPuffer: Puffer<Metaphors> = {
    handle_command: {
        2: (world, parser) => {
            if (world.current_interpretation === null) {

                // TODO: The actual index should be the most recent world
                // in which certain important bits of state have changed
                let index = world.previous && world.previous.index;
                if (index === null) {
                    return parser.eliminate();
                }

                parser.consume('begin_interpretation');
                parser.submit();

                let new_interps: Updater<PW> = {};
                if (index !== null) {
                    new_interps = { interpretations: {
                        [index]: {
                            'interpretation-block': true,
                            'interpretation-active': true
                        }
                    }};
                } 

                let descriptions: string[] = [];

                for (let facet of FacetIndex) {
                    if (!facet.can_recognize(world, world.previous!)) {
                        continue;
                    }
                    descriptions.push(`
                        <blockquote class="descr-${facet.slug}">
                            ${facet.description}
                        </blockquote>
                    `);
                }
                if (descriptions.length === 0) {
                    descriptions.push('However, nothing about it seems particularly interpretable.');
                } else {
                    descriptions.unshift('You notice the following aspects:');
                }

                return update(world,
                    { 
                        current_interpretation: index,
                        current_interp_description: world.index,
                        message: message_updater({
                            action: ['You consider the above. A sense of focus begins to permeate your mind.'],
                            description: descriptions
                        })
                    },
                    new_interps
                );
            } else {
                parser.consume('end_interpretation');
                parser.submit();

                return update(world, {
                    current_interpretation: null,
                    current_interp_description: null,
                    interpretations: {
                        [world.current_interpretation]: {'interpretation-active': false, 'interpretation-block': false}
                    },
                    has_tried: () => ({}),
                    message: message_updater({
                        action: [`You return`]
                    }),
                });
            }
        }
    }
};
export function init_metaphor_puffers() {
    Puffers(InterpPuffer as Puffer<Venience>);    
}



// FACETS

type FacetSpec<W extends Metaphors=Metaphors> = {
    name: FacetID, // e.g. "the sense of dread"
    slug: string,
    phrase: ConsumeSpec,
    description: string,
    can_recognize: (current_world: PW<W>, interpretted_world: PW<W>) => boolean,
    solved: (world: PW<W>) => boolean,
    set_solved: (world: PW<W>) => PW<W>,
    correct: (action: [AbstractionID, ActionID], world: PW<W>) => boolean,
};

const FacetIndex: FacetSpec[] = [];

function make_facet<W extends Venience>(spec: FacetSpec<W>): Puffer<W>;
function make_facet(spec: FacetSpec<Metaphors>): Puffer<Metaphors> { return {
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
                let qual_action: [AbstractionID, ActionID] = [abs.name, action.name];
                threads.push(() => {
                    let solved = spec.solved(world);
                    parser.consume({
                        tokens: abs.get_cmd(action.get_cmd(spec.phrase)),
                        // TODO: this is breaking typeahead used logic
                        used: solved || (world.has_tried[action.name] && world.has_tried[action.name]![spec.name]) 
                    });
                    parser.submit();

                    world = update(world, {
                        interpretations: {
                            [interpretted_world.index]: {
                                [`interp-${spec.slug}-blink`]: Symbol('Once')
                            },
                            [world.current_interp_description!]: {
                                [`descr-${spec.slug}-blink`]: Symbol('Once')
                            }
                        },
                        has_tried: { [action.name]: { [spec.name]: true }}
                    });

                    if (spec.correct(qual_action, world)) {
                        if (solved) {
                            return update(world, {
                                interpretations: { [interpretted_world.index]: {
                                    [`interp-${spec.slug}-solved-blink`]: Symbol('Once')
                                }}
                            });
                        } else {
                            return update(spec.set_solved(world), {
                                interpretations: { [interpretted_world.index]: {
                                    [`interp-${spec.slug}`]: true
                                }}
                            });
                        }
                    } else {
                        return update(world, {
                            message: message_updater(action.get_wrong_msg(spec.name))
                        });
                    }
                });
            }
        }
        return parser.split(threads);
    },
    css_rules: [`
        .history .would-add-interp-${spec.slug}-blink .${spec.slug},
        .history .would-add-descr-${spec.slug}-blink .descr-${spec.slug} {
            background-color: black;
            animation-name: interpreting, would-interpret !important;
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

        `.history .interp-${spec.slug} .interp-${spec.slug} {
            display: block;
            color: gold;
            opacity: 1;
        }`,

        `.history .adding-interp-${spec.slug}-blink.animation-start .${spec.slug} .interp-${spec.slug} {
            background-color: orange;
        }`,

        `.history .adding-interp-${spec.slug}-blink.animation-start.animation-active .${spec.slug} .interp-${spec.slug} {
            background-color: inherit;
            transition: background-color 700ms linear;
        }`
    ]
};}

export function Facets<W extends Venience>(...facet_specs: FacetSpec<W>[]) {
    FacetIndex.push(...facet_specs);
    Puffers(...facet_specs.map(make_facet));
}

