import { Parser, ParserThread } from './parser';
import { knit_puffers, map_puffer, Puffer, PufferAndWorld, PufferMapper } from './puffer';
import { appender, Omit, update, Updater } from './utils';
import { message_updater, MessageUpdateSpec } from './message';

export type BaseGraphWorld<NodeID extends string=string> = {
    location: NodeID
}

export type Transitions<NodeID extends string=string> = Record<string, NodeID>;

export type NodeSpec<W extends BaseGraphWorld<NodeID>, NodeID extends string=W['location']> = {
    id: NodeID,
    enter_message?: MessageUpdateSpec,
    transitions?: Transitions<NodeID>,
    debug?: boolean
} & Puffer<W>;

export const narrative_graph_builder = <W extends BaseGraphWorld<NodeID>, NodeID extends string=W['location']>() => {
    type PW = PufferAndWorld<W>;

    // Return a parser thread that consumes commands to transition the player to
    // the nodes specified in transitions.
    function make_transitioner(world: PW, transitions: Transitions<NodeID>, debug: boolean=false) {
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
    function transition_to(world: PW, dest: NodeID, updater?: Updater<Omit<PW, 'location'>>) {
        return update(world, <Updater<PW>> <unknown> {
            ...(updater !== undefined ? updater : {}),
            location: dest
        });
    }

    function make_node(spec: NodeSpec<PW, NodeID>): Puffer<PW> {
        // The base_puffer interprets the declarative transitions
        // and produces command handling logic for them.
        // It also prints the enter fragment upon entering a given node
        let base_puffer: Puffer<PW> = {
            handle_command: (world, parser) => {
                if (world.location !== spec.id) {
                    parser.eliminate();
                }

                let threads: ParserThread<PufferAndWorld<PW>>[] = [];

                if (spec.transitions !== undefined) {
                    threads.push(make_transitioner(world, spec.transitions, spec.debug));
                }

                return parser.split(threads);
            },
            post: (world_2, world_1) => {
                if (world_2.location === spec.id &&
                    world_1.location !== spec.id &&
                    spec.enter_message !== undefined) {
                    
                    if (spec.debug) {
                        debugger;
                    }
                    return update(world_2, <Updater<PW>> <unknown> {
                        message: message_updater(spec.enter_message)
                    });
                }
                return world_2;
            }
        }

        // The mapper gates all of the passed-in "custom" puffer handlers behind a
        // conditional check that we are currently at the node in question.
        // This is a little confusing for post()- it will be allowed when *either*
        // the previous world *or* the current world is at the node in question.
        let mapper: PufferMapper<PW> = {
            pre: (cb) => (world) => {
                if (cb === undefined || world.location !== spec.id) {
                    return world;
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world);
            },

            handle_command: (cb, stage) => (world, parser) => {
                if (cb === undefined || world.location !== spec.id) {
                    parser.eliminate();
                }
                return cb(world, parser);
            },
            post: (cb) => (world_2, world_1) => {
                if (world_2.location === spec.id || world_1.location === spec.id) {

                    if (cb !== undefined) {
                        if (spec.debug) {
                            debugger;
                        }
                        return cb(world_2, world_1);
                    }
                }
                return world_2;
            },

            interpret_history: (cb) => (world_2, world_1) => {
                if (cb === undefined || world_2.location !== spec.id) {
                    return [];
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world_2, world_1);
            }
        };

        return <Puffer<PW>><unknown>knit_puffers([map_puffer(mapper, spec), base_puffer]);
    }

    return {
        make_transitioner,
        transition_to,
        make_node
    };
};



