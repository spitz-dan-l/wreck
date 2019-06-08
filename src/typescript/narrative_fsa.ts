import { MessageUpdateSpec, message_updater } from './message';
import { Parser, ParserThread, ConsumeSpec } from './parser';
import { knit_puffers, bake_puffers, map_puffer, MaybeStages, normalize_stages, Puffer, PufferAndWorld, PufferMapper, PufferNarrator, Stages } from './puffer';
import { update, Updater, entries } from './utils';
import { LocalInterpretations, map_interpretations } from './interpretation';
import { World } from './world';

export function narrative_fsa_builder
<W, StateID extends string=string>
(
    get_state_id: (w:PufferAndWorld<W>) => StateID,
    transition_to: (w: PufferAndWorld<W>, state: StateID) => PufferAndWorld<W>
) {
    type Transitions = Partial<Record<StateID, ConsumeSpec>>;//{ [K in StateID]: ConsumeSpec };
    type Interpretations = Partial<Record<StateID, LocalInterpretations>>;

    type PWUpdate<W> = (world: PufferAndWorld<W>) => PufferAndWorld<W>;

    type StateSpec<W1 extends W=W> = {
        id: StateID,
        enter_message?: MessageUpdateSpec,
        exit_message?: MessageUpdateSpec,
        transitions?: Transitions,
        interpretations?: Interpretations,
        enter?: MaybeStages<PWUpdate<W1>>,
        exit?: MaybeStages<PWUpdate<W1>>,
        here?: MaybeStages<PWUpdate<W1>>,
        debug?: boolean
    } & Puffer<W1>;

    type PW<W1 extends W=W> = PufferAndWorld<W1>;

    // Return a parser thread that consumes commands to transition the player to
    // the nodes specified in transitions.
    function make_transitioner(world: PW, transitions: Transitions, debug: boolean=false) {
        return (parser: Parser) => {
            if (transitions === undefined || Object.keys(transitions).length === 0) {
                parser.eliminate();
            }
            if (debug) {
                debugger;
            }
            
            return parser.split(
                Object.entries(transitions).map(([destination, consume_spec]) => () => {
                    parser.consume(<ConsumeSpec>consume_spec);
                    parser.submit();
                    return transition_to(world, <StateID>destination);
                })
            );
        }
    }

    function make_state<W1 extends W>(spec: StateSpec<W1>): Puffer<W1>;
    function make_state(spec: StateSpec): Puffer<W> {
        let enter = normalize_stages(spec.enter);
        let exit = normalize_stages(spec.exit);
        let here = normalize_stages(spec.here);

        let stages: number[] = [0];
        stages.push(...Object.keys(enter).map(x => parseInt(x)));
        stages.push(...Object.keys(exit).map(x => parseInt(x)));
        stages.push(...Object.keys(here).map(x => parseInt(x)));

        stages = [...new Set(stages)];
        stages.sort();

        let post: Stages<PufferNarrator<W>> = {};

        for (let stage of stages) {
            post[stage] = (world_2, world_1) => {
                if (spec.debug) {
                    debugger;
                }

                // exiting
                if (get_state_id(world_2) !== spec.id &&
                    get_state_id(world_1) === spec.id) {

                    if (exit[stage] !== undefined) {
                        world_2 = exit[stage](world_2);
                    }

                    if (stage === 0 && spec.exit_message !== undefined) {
                        world_2 = update(world_2, <Updater<PW>> <unknown> {
                            message: message_updater(spec.exit_message)
                        });
                    }
                }

                // entering
                if (get_state_id(world_2) === spec.id &&
                    get_state_id(world_1) !== spec.id) {
                    
                    if (enter[stage] !== undefined) {
                        world_2 = enter[stage](world_2);
                    }

                    if (stage === 0 && spec.enter_message !== undefined) {
                        world_2 = update(world_2, <Updater<PW>> <unknown> {
                            message: message_updater(spec.enter_message)
                        });
                    }
                }

                // here
                if (get_state_id(world_2) === spec.id) {
                    if (spec.interpretations !== undefined) {
                        world_2 = <PW><unknown> update(<World><unknown>world_2, {
                            interpretations: map_interpretations(world_2, (w, prev) => 
                                ({...prev, ...spec.interpretations![get_state_id(w)]!})
                            )
                        });
                    }
                    if (here[stage] !== undefined) {
                        world_2 = here[stage](world_2);
                    }
                }

                return world_2;
            }
        }

        // The base_puffer interprets the declarative transitions
        // and produces command handling logic for them.
        // It also prints the enter fragment upon entering a given node
        let base_puffer: Puffer<W> = {
            handle_command: (world, parser) => {
                if (get_state_id(world) !== spec.id) {
                    parser.eliminate();
                }

                let threads: ParserThread<PufferAndWorld<PW>>[] = [];

                if (spec.transitions !== undefined) {
                    threads.push(make_transitioner(world, spec.transitions, spec.debug));
                }

                return parser.split(threads);
            },
            post
        }

        // The mapper gates all of the passed-in "custom" puffer handlers behind a
        // conditional check that we are currently at the node in question.
        // This is a little confusing for post()- it will be allowed when *either*
        // the previous world *or* the current world is at the node in question.
        let mapper: PufferMapper<W> = {
            pre: (cb) => (world) => {
                if (cb === undefined || get_state_id(world) !== spec.id) {
                    return world;
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world);
            },

            handle_command: (cb, stage) => (world, parser) => {
                if (cb === undefined || get_state_id(world) !== spec.id) {
                    parser.eliminate();
                }
                return cb!(world, parser);
            },
            post: (cb) => (world_2, world_1) => {
                if (get_state_id(world_2) === spec.id || get_state_id(world_1) === spec.id) {

                    if (cb !== undefined) {
                        if (spec.debug) {
                            debugger;
                        }
                        return cb(world_2, world_1);
                    }
                }
                return world_2;
            }
        };

        return <Puffer<W>><unknown>knit_puffers([map_puffer(mapper, spec), base_puffer]);
    }

    let apply_state = <W1 extends W>() => <R>(f: (p: Puffer<W1>) => R) =>
        (spec: StateSpec<W1>) => f(make_state(spec));

    let apply_states = <W1 extends W>() => <R>(f: (p: Puffer<W1>) => R) =>
        (...specs: StateSpec<W1>[]) => specs.map(make_state).map(f);

    return {
        make_transitioner,
        make_state,
        apply_state,
        apply_states
    };
};

