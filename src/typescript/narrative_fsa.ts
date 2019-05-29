import { Parser, ParserThread } from './parser';
import { knit_puffers, map_puffer, Puffer, PufferAndWorld, PufferMapper } from './puffer';
import { appender, update, Updater } from './utils';
import { message_updater, MessageUpdateSpec } from './message';
import { InterpretationOp } from './world';

// export type BaseGraphWorld<NodeID extends string=string> = {
//     node: NodeID
// }

// export type Transitions<NodeID extends string=string> = Record<string, NodeID>;
// export type Interpretations<NodeID extends string=string> = Record<NodeID, InterpretationOp[]>;

// export type NodeSpec<W extends BaseGraphWorld<NodeID>, NodeID extends string=W['node']> = {
//     id: NodeID,
//     enter_message?: MessageUpdateSpec,
//     transitions?: Transitions<NodeID>,
//     interpretations?: Interpretations<NodeID>
//     debug?: boolean
// } & Puffer<W>;

type GraphWorld<Prop extends string, NodeID extends string> = {
    [K in Prop]: NodeID
}

export function narrative_fsa_builder<W extends GraphWorld<Prop, NodeID>, Prop extends string, NodeID extends string=string>(prop_name: Prop) {
    if (prop_name === undefined) {
        prop_name = <Prop>'state';
    }

    type Transitions<NodeID extends string=string> = Record<string, NodeID>;
    type Interpretations<NodeID extends string=string> = Record<NodeID, InterpretationOp[]>;

    type NodeSpec = {
        id: NodeID,
        enter_message?: MessageUpdateSpec,
        transitions?: Transitions<NodeID>,
        interpretations?: Interpretations<NodeID>
        debug?: boolean
    } & Puffer<W>;

    type PW = PufferAndWorld<W>;

    function node_of(world: PW): NodeID {
        return <NodeID><unknown>world[prop_name];
    }

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
    function transition_to(world: PW, dest: NodeID, updater?: Updater<Omit<PW, Prop>>) {
        return update(world, <Updater<PW>> <unknown> {
            ...(updater !== undefined ? updater : {}),
            [prop_name]: dest
        });
    }

    function make_node<W extends PW>(spec: NodeSpec): Puffer<W> {
        // The base_puffer interprets the declarative transitions
        // and produces command handling logic for them.
        // It also prints the enter fragment upon entering a given node
        let base_puffer: Puffer<PW> = {
            handle_command: (world, parser) => {
                if (node_of(world) !== spec.id) {
                    parser.eliminate();
                }

                let threads: ParserThread<PufferAndWorld<PW>>[] = [];

                if (spec.transitions !== undefined) {
                    threads.push(make_transitioner(world, spec.transitions, spec.debug));
                }

                return parser.split(threads);
            },
            post: (world_2, world_1) => {
                if (node_of(world_2) === spec.id &&
                    node_of(world_1) !== spec.id &&
                    spec.enter_message !== undefined) {
                    
                    if (spec.debug) {
                        debugger;
                    }
                    return update(world_2, <Updater<PW>> <unknown> {
                        message: message_updater(spec.enter_message)
                    });
                }
                return world_2;
            },
            interpret_history: (world_2, world_1) => {
                if (node_of(world_2) === spec.id &&
                    spec.interpretations !== undefined &&
                    spec.interpretations[node_of(world_1)] !== undefined) {

                    if (spec.debug) {
                        debugger;
                    }
                    return spec.interpretations[node_of(world_1)];
                }
                return [];
            }
        }

        // The mapper gates all of the passed-in "custom" puffer handlers behind a
        // conditional check that we are currently at the node in question.
        // This is a little confusing for post()- it will be allowed when *either*
        // the previous world *or* the current world is at the node in question.
        let mapper: PufferMapper<PW> = {
            pre: (cb) => (world) => {
                if (cb === undefined || node_of(world) !== spec.id) {
                    return world;
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world);
            },

            handle_command: (cb, stage) => (world, parser) => {
                if (cb === undefined || node_of(world) !== spec.id) {
                    parser.eliminate();
                }
                return cb!(world, parser);
            },
            post: (cb) => (world_2, world_1) => {
                if (node_of(world_2) === spec.id || node_of(world_1) === spec.id) {

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
                if (cb === undefined || node_of(world_2) !== spec.id) {
                    return [];
                }

                if (spec.debug) {
                    debugger;
                }

                return cb(world_2, world_1);
            }
        };

        return <Puffer<W>><unknown>knit_puffers([map_puffer(mapper, spec), base_puffer]);
    }

    return {
        make_transitioner,
        transition_to,
        make_node
    };
};

