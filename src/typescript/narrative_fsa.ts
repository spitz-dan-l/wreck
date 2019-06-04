import { MessageUpdateSpec, message_updater } from './message';
import { Parser, ParserThread } from './parser';
import { knit_puffers, map_puffer, MaybeStages, normalize_stages, Puffer, PufferAndWorld, PufferMapper, PufferNarrator, Stages } from './puffer';
import { update, Updater } from './utils';
import { LocalInterpretations, map_interpretations } from './interpretation';
import { World } from './world';

type FSAWorld<Prop extends string, StateID extends string> = {
    [K in Prop]: StateID
}

export function narrative_fsa_builder
<
    W extends FSAWorld<Prop, StateID>,
    Prop extends string,
    StateID extends string=string
>
(prop_name: Prop) {

    type Transitions = Record<string, StateID>;
    type Interpretations = Record<StateID, LocalInterpretations>;

    type PWUpdate<W> = (world: PufferAndWorld<W>) => PufferAndWorld<W>;

    type NodeSpec = {
        id: StateID,
        enter_message?: MessageUpdateSpec,
        transitions?: Transitions,
        interpretations?: Interpretations,
        enter?: MaybeStages<PWUpdate<W>>,
        exit?: MaybeStages<PWUpdate<W>>,
        here?: MaybeStages<PWUpdate<W>>,
        debug?: boolean
    } & Puffer<W>;

    type PW = PufferAndWorld<W>;

    function state_id_of(world: PW): StateID {
        return <StateID><unknown>world[prop_name];
    }

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
                Object.entries(transitions).map(([consume_spec, destination]) => () => {
                    parser.consume(consume_spec);
                    parser.submit();
                    return transition_to(world, destination);
                })
            );
        }
    }
    function transition_to(world: PW, dest: StateID, updater?: Updater<Omit<PW, Prop>>) {
        return update(world, <Updater<PW>> <unknown> {
            ...(updater !== undefined ? updater : {}),
            [prop_name]: dest
        });
    }

    function make_state(spec: NodeSpec): Puffer<W>;
    function make_state(spec: NodeSpec): Puffer<W> {
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
                if (state_id_of(world_2) !== spec.id &&
                    state_id_of(world_1) === spec.id) {

                    if (exit[stage] !== undefined) {
                        world_2 = exit[stage](world_2);
                    }
                }

                // entering
                if (state_id_of(world_2) === spec.id &&
                    state_id_of(world_1) !== spec.id) {
                    
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
                if (state_id_of(world_2) === spec.id) {
                    if (spec.interpretations !== undefined) {
                        world_2 = <PW><unknown> update(<World><unknown>world_2, {
                            interpretations: map_interpretations(world_2, (w, prev) => 
                                ({...prev, ...spec.interpretations![state_id_of(w)]})
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
                if (state_id_of(world) !== spec.id) {
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
                if (cb === undefined || state_id_of(world) !== spec.id) {
                    return world;
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world);
            },

            handle_command: (cb, stage) => (world, parser) => {
                if (cb === undefined || state_id_of(world) !== spec.id) {
                    parser.eliminate();
                }
                return cb!(world, parser);
            },
            post: (cb) => (world_2, world_1) => {
                if (state_id_of(world_2) === spec.id || state_id_of(world_1) === spec.id) {

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

    return {
        make_transitioner,
        transition_to,
        make_state
    };
};

