/*
    A puffer is a type of pattern described in Conway's Game of Life.
    http://www.conwaylife.com/wiki/Puffer

    It is an object that moves itself through the Life grid, and leaves behind debris where it has been.

    Here, a Puffer is a bundle of world behaviors that run within the game world,
    reading and updating game state, and leaving behind the "debris" of those updates.
    Sometimes that "debris" is just incidental bits of state, sometimes it is
    read or otherwise used by other Puffers sharing the world.
*/

import { Omit, update, Updater, IntersectTupleTypes, IntersectBoxedTupleTypes } from './utils';
import { Parser, ParserThread } from './parser';
import { get_initial_world, Message, CommandHandler, InterpretationOp, HistoryInterpreter, make_world_spec, MetaLevelKeys, ObjectLevel, Renderer, World, WorldSpec } from './world';

export type PufferAndWorld<W> = W & ObjectLevel<World>;

export type PufferCommandHandler<W> = (world: PufferAndWorld<W>, parser: Parser) => PufferAndWorld<W>;
export type PufferUpdater<W> = (world: PufferAndWorld<W>) => PufferAndWorld<W>;
export type PufferNarrator<W> = (new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>) => PufferAndWorld<W>;
export type PufferHistoryInterpreter<W> = (new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>) => InterpretationOp[] | undefined;


type Stages<X> = { [stage: number]: X };
type MaybeStages<X> = X | Stages<X>
type Handler<T extends MaybeStages<any>> = T extends Stages<infer U> ? U : never;

function is_handler<T>(x: MaybeStages<T>): x is T {
    return typeof x === 'function';
}

type PufferSpec<W> = {
    readonly pre?: PufferUpdater<W>,
    readonly handle_command?: PufferCommandHandler<W>,
    readonly post?: PufferNarrator<W>,
    readonly interpret_history?: PufferHistoryInterpreter<W>,
}

export type Puffer<W> = {
    [K in keyof PufferSpec<W>]: MaybeStages<PufferSpec<W>[K]>
};

type PufferForWorld<W extends World> = Puffer<Partial<ObjectLevel<W>>>;
type PufferSpecForWorld<W extends World> = PufferSpec<ObjectLevel<W>>;

// type CompatPuffer<W0 extends World, P> = P & (P extends Puffer<infer W1> ?
//     Extract<ObjectLevel<Required<W0>>, Required<W1>> extends never ? 
//         'Puffer type not a strict subset of world type' :
//         unknown :
//     'P is not a puffer');

// type PufferIndex<W extends World, Index extends readonly PufferForWorld<W>[]> = {
//     [K in keyof Index]: Index[K] & CompatPuffer<W, Index[K]>
// };

/*
    2 useful things
        - Sharing a conditional "gate" across pre, handle_command, post, interpret_history calls
            Thus far it seems like pre and handle_command often like sharing the gate,
            but post wants the gate for both the current world and the previous one
                That means post still needs to do the check for which world met the condition
        - Flexibly controlling the priority of different phases relative to other puffers
            - Suggestion: You can map the phase handlers to integers.
                        A puffer can have multiple versions of a handler, which run in the order
                        of their integer assignments
*/

export type PufferMapper<T> = {
    [K in keyof PufferSpec<T>]?: (cb: undefined | PufferSpec<T>[K], stage?: number) => PufferSpec<T>[K]
};

export function map_puffer<T>(mapper: PufferMapper<T>, puffer: Puffer<T>): Puffer<T> {
    function visit<P extends 'pre' | 'handle_command' | 'post' | 'interpret_history'>(prop: P) {
        if (mapper[prop] === undefined) {
            return puffer[prop];
        }
        if (puffer[prop] === undefined || typeof puffer[prop] === 'function') {
            return mapper[prop](puffer[prop] as any, 0);
        } else if (puffer[prop] instanceof Array) {
            return (puffer[prop] as any[]).map(mapper[prop] as any);
        } else {
            let result = {};
            for (let [stage, cb] of Object.entries(puffer[prop])) {
                result[stage] = mapper[prop](cb, parseInt(stage));
            }
            return result;
        }
    }

    let result = {};
    for (let p of ['pre', 'handle_command', 'post', 'interpret_history'] as const) {
        result[p] = visit(p);
    }

    return result;
}


type UnwrapPuffer<T> = T extends Puffer<infer U> ? U : never;
type UnwrapPufferTuple<T extends { [k: number]: Puffer<any> }> = { [P in keyof T]: UnwrapPuffer<T[P]> };

export function knit_puffers<T extends readonly Puffer<any>[]>(puffers: T): PufferSpec<IntersectTupleTypes<UnwrapPufferTuple<T>>> {
    type W = IntersectTupleTypes<UnwrapPufferTuple<T>>;

    // let puffers: Puffer<W>[] = puffers_tuple as unknown as Puffer<W>[];
    function get_stages<P extends 'pre' | 'handle_command' | 'post' | 'interpret_history'>(prop: P) {
        let stages = new Set<number>();
        puffers.forEach(p => {
            if (p[prop] === undefined) {
                return;
            }
            if (is_handler<Puffer<any>[P]>(p[prop])) {
                stages.add(0);
            }
            Object.keys(p[prop]).map(parseInt).forEach(stages.add.bind(stages));
        });
        let ordered_stages = [...stages.values()];
        ordered_stages.sort();
        return ordered_stages;
    }

    // This winds up "sort of" typechecking. It thinks that p[prop] is always PufferNarrator
    function iterate<P extends 'pre' | 'handle_command' | 'post' | 'interpret_history'>(prop: P, f: (cb: PufferSpec<W>[P]) => void) {
        let stages = get_stages(prop);
        for (let stage of stages) {
            for (let p of puffers) {
                let handler = p[prop];
                if (is_handler(handler) && stage === 0) {
                    f(handler);
                } else if (handler !== undefined && handler[stage] !== undefined) {
                    f(handler[stage]);
                }
            }
        }
    }

    function pre(world: PufferAndWorld<W>): PufferAndWorld<W> {
        let result = world;

        iterate('pre', pre => { result = pre(result); });

        return result;
    }

    function handle_command(world: PufferAndWorld<W>, parser: Parser): PufferAndWorld<W> {
        let threads: ParserThread<PufferAndWorld<W>>[] = [];

        iterate('handle_command', cb => threads.push(() => cb(world, parser)));

        return parser.split(threads);
    }

    function post(new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>): PufferAndWorld<W> {
        let result = new_world;

        iterate('post', post => { result = post(result, old_world); });

        return result;
    }

    function interpret_history(new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>) {
        let ops: InterpretationOp[] = [];

        iterate('interpret_history', cb => { ops.push(...cb(new_world, old_world)); });

        return ops;
    }

    return {
        pre,
        handle_command,
        post,
        interpret_history
    }
}

export function make_puffer_world_spec<W extends World & IntersectTupleTypes<UnwrapPufferTuple<Index>>, Index extends readonly PufferForWorld<W>[]>
    (initial_world: W, puffer_index: Index, render?: Renderer)
    : WorldSpec<W> {
    
    let spec: Required<PufferSpecForWorld<W>> = <Required<PufferSpecForWorld<W>>> <unknown> knit_puffers(puffer_index);


    return make_world_spec({
        initial_world,
        ...spec,
        render
    });
}