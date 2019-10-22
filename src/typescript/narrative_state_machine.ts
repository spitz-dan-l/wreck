import { ConsumeSpec, Parser, ParserThread } from './parser';
import { knit_puffers, map_puffer, Puffer, PufferMapper } from './puffer';
import { MaybeStages, normalize_stages, Stages, stages, stage_keys } from './stages';
import { CSSUpdates, css_updater, story_updater, TextAddSpec } from './story';
import { update, Updater } from './utils';
import { Narrator, World } from './world';

export function narrative_state_machine
<W extends World, StateID extends string=string>
(
    get_state_id: (w: W) => StateID,
    transition_to: (w: W, state: StateID) => W
) {
    type Transitions = Map<StateID, ConsumeSpec>;
    type StateCSSUpdates = Map<StateID, CSSUpdates>;

    type PWUpdate<W> = (world: W) => W;

    type StateSpec<W1 extends W=W> = {
        id: StateID,
        enter_message?: TextAddSpec,
        exit_message?: TextAddSpec,
        transitions?: Transitions,
        css_updates?: StateCSSUpdates,
        enter?: MaybeStages<PWUpdate<W1>>,
        exit?: MaybeStages<PWUpdate<W1>>,
        here?: MaybeStages<PWUpdate<W1>>,
        debug?: boolean
    } & Puffer<W1>;

    type PW<W1 extends W=W> = W1;

    // Return a parser thread that consumes commands to transition the player to
    // the nodes specified in transitions.
    function make_transitioner(world: PW, transitions: Transitions, debug: boolean=false) {
        return (parser: Parser) => {
            if (transitions === undefined || transitions.size === 0) {
                return parser.eliminate();
            }
            if (debug) {
                debugger;
            }
            
            return parser.split(
                [...transitions].map(([destination, consume_spec]) => () => {
                    parser.consume(<ConsumeSpec>consume_spec);
                    if (parser.failure) {
                        return parser.failure;
                    }
                    parser.submit();
                    if (parser.failure) {
                        return parser.failure;
                    }
                    return transition_to(world, destination);
                })
            );
        }
    }

    function make_state<W1 extends W>(spec: StateSpec<W1>): Puffer<W1>;
    function make_state(spec: StateSpec): Puffer<W> {
        let enter = normalize_stages(spec.enter);
        let exit = normalize_stages(spec.exit);
        let here = normalize_stages(spec.here);

        let stage_levels: number[] = [0];
        stage_levels.push(...stage_keys(enter));
        stage_levels.push(...stage_keys(exit));
        stage_levels.push(...stage_keys(here));

        stage_levels = [...new Set(stage_levels)].sort((a,b)=>a-b);

        let post: Stages<Narrator<W>> = stages();

        for (let stage of stage_levels) {
            post.set(stage, (world_2, world_1) => {
                if (spec.debug) {
                    debugger;
                }

                // exiting
                if (get_state_id(world_2) !== spec.id &&
                    get_state_id(world_1) === spec.id) {

                    if (exit.has(stage)) {
                        world_2 = exit.get(stage)!(world_2);
                    }

                    if (stage === 0 && spec.exit_message !== undefined) {
                        world_2 = update(world_2, <Updater<PW>> story_updater(spec.exit_message));
                    }
                }

                // entering
                if (get_state_id(world_2) === spec.id &&
                    get_state_id(world_1) !== spec.id) {
                    
                    if (enter.has(stage)) {
                        world_2 = enter.get(stage)!(world_2);
                    }

                    if (stage === 0 && spec.enter_message !== undefined) {
                        world_2 = update(world_2, <Updater<PW>> story_updater(spec.enter_message));
                    }
                }

                // here
                if (get_state_id(world_2) === spec.id) {
                    if (spec.css_updates !== undefined) {
                        world_2 = <PW><unknown> update(<World><unknown>world_2,
                            css_updater((w: W) => spec.css_updates!.get(get_state_id(w)) || {}))
                    }
                    if (here.has(stage)) {
                        world_2 = here.get(stage)!(world_2);
                    }
                }

                return world_2;
            });
        }

        // The base_puffer interprets the declarative transitions
        // and produces command handling logic for them.
        // It also prints the enter fragment upon entering a given node
        let base_puffer: Puffer<W> = {
            handle_command: (world, parser) => {
                if (get_state_id(world) !== spec.id) {
                    return parser.eliminate();
                }

                let threads: ParserThread<PW>[] = [];

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
                    return parser.eliminate();
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

