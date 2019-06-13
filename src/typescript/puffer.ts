/*
    A puffer is a type of pattern described in Conway's Game of Life.
    http://www.conwaylife.com/wiki/Puffer

    It is an object that moves itself through the Life grid, and leaves behind debris where it has been.

    Here, a Puffer is a bundle of world behaviors that run within the game world,
    reading and updating game state, and leaving behind the "debris" of those updates.
    Sometimes that "debris" is just incidental bits of state, sometimes it is
    read or otherwise used by other Puffers sharing the world.
*/

import { Parser, ParserThread, gate } from './parser';
import { IntersectTupleTypes } from './utils';
import { make_world_spec, ObjectLevel, ObjectLevelWorld, World, WorldSpec } from './world';

export type PufferAndWorld<W> = W & World;

export type PufferCommandHandler<W> = (world: PufferAndWorld<W>, parser: Parser) => PufferAndWorld<W>;
export type PufferUpdater<W> = (world: PufferAndWorld<W>) => PufferAndWorld<W>;
export type PufferNarrator<W> = (new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>) => PufferAndWorld<W>;
// export type PufferHistoryInterpreter<W> = (new_world: PufferAndWorld<W>, old_world: PufferAndWorld<W>) => LocalInterpretations;


export type Stages<X extends (...args: any) => any> = { [stage: number]: X };
export type MaybeStages<X extends (...args: any) => any> = X | Stages<X>
export type Handler<T extends MaybeStages<any>> = T extends Stages<infer U> ? U : never;

export function is_handler<T extends (...args: any) => any>(x: MaybeStages<T>): x is T {
    return typeof x === 'function';
}

export function normalize_stages<T extends (...args: any) => any>(x?: MaybeStages<T>): Stages<T> {
    if (x === undefined) {
        return {};
    }

    if (is_handler(x)) {
        return { [0]: x };
    }

    return x;
}

// type PufferSpec<W> = {
//     readonly pre?: PufferUpdater<W>,
//     readonly handle_command?: PufferCommandHandler<W>,
//     readonly post?: PufferNarrator<W>,
//     readonly interpret_history?: PufferHistoryInterpreter<W>,
// }

type PufferSpec_<W> = {
    pre: PufferUpdater<W>,
    handle_command: PufferCommandHandler<W>,
    post: PufferNarrator<W>,
    css_rules: string[]
}
export type PufferSpec<W> = Partial<PufferSpec_<W>>;

type Puffer_<W> = {
    [K in Exclude<keyof PufferSpec_<W>, 'css_rules'>]: MaybeStages<PufferSpec_<W>[K]>
} & {
    css_rules: string[]
};

export type Puffer<W> = Partial<Puffer_<W>>;

export type PufferNormalForm<W> = {
    [K in Exclude<keyof PufferSpec_<W>, 'css_rules'>]: Stages<PufferSpec_<W>[K]>
} & {
    css_rules: string[]
};

type PufferForWorld<W extends World> = Puffer<Partial<W>>;
type PufferSpecForWorld<W extends World> = PufferSpec<W>;

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
    function visit<P extends 'pre' | 'handle_command' | 'post'>(prop: P) {
        if (mapper[prop] === undefined) {
            return puffer[prop];
        }
        if (puffer[prop] === undefined || typeof puffer[prop] === 'function') {
            return (mapper[prop] as any)(puffer[prop] as any, 0);
        } else if (puffer[prop] instanceof Array) {
            return (puffer[prop] as any[]).map(mapper[prop] as any);
        } else {
            let result = {};
            for (let [stage, cb] of Object.entries(<any>puffer[prop])) {
                result[stage] = (<any>mapper[prop])(cb, parseInt(stage));
            }
            return result;
        }
    }

    let result: Puffer<T> = {};
    for (let p of ['pre', 'handle_command', 'post'] as const) {
        result[p] = visit(p);
    }

    if (puffer.css_rules !== undefined) {
        result.css_rules = puffer.css_rules;
    }

    return result;
}

export function gate_puffer<W>(cond: (world: PufferAndWorld<W>) => boolean, puffer: Puffer<W>): Puffer<W> {
    return map_puffer({
        pre: (cb) => {
            if (cb === undefined) {
                return undefined;
            }
            return (world) => {
                if (cond(world)) {
                    return cb(world);
                }
                return world;
            };
        },
        handle_command: (cb) => {
            if (cb === undefined) {
                return undefined;
            }
            return (world, parser) => {
                if (!cond(world)) {
                    parser.eliminate();
                }
                return cb(world, parser);
            };
        },
        post: (cb) => {
            if (cb === undefined) {
                return undefined;
            }
            return (new_world, old_world) => {
                if (cond(new_world) || cond(old_world)) {
                    return cb(new_world, old_world);
                }
                return new_world;
            };
        }
    }, puffer);
}

type UnwrapPuffer<T> = T extends Puffer<infer U> ? U : never;
type UnwrapPufferTuple<T extends { [k: number]: Puffer<any> }> = { [P in keyof T]: UnwrapPuffer<T[P]> };


export function knit_puffers<T extends readonly Puffer<any>[]>(puffers: T): PufferNormalForm<IntersectTupleTypes<UnwrapPufferTuple<T>>>;
export function knit_puffers(puffers: Puffer<{}>[]): PufferNormalForm<{}> {
    let normalized: PufferNormalForm<{}>[] = []

    let stages: { [K in keyof PufferSpec_<{}>]: number[] } = {
        pre: [],
        handle_command: [],
        post: [],
        css_rules: []
    };
    for (let puffer of puffers) {
        let norm_puffer: PufferNormalForm<{}> = <any>{};

        for (let prop of ['pre', 'handle_command', 'post'] as const) {
            norm_puffer[prop] = <any>normalize_stages<PufferSpec_<any>[typeof prop]>(puffer[prop]);
            stages[prop].push(...Object.keys(norm_puffer[prop]).map(x => parseInt(x)))
        }
        norm_puffer.css_rules = puffer.css_rules || [];
        
        normalized.push(norm_puffer);
    }

    function iterate<Prop extends 'pre' | 'handle_command' | 'post'>(prop: Prop, combine: (cbs: PufferSpec_<{}>[Prop][]) => PufferSpec_<{}>[Prop]) {      
        stages[prop].sort();

        let result: Stages<PufferSpec_<any>[Prop]> = {};
        for (let stage of stages[prop]) {
            let cbs: PufferSpec_<any>[Prop][] = [];
            for (let p of normalized) {
                if (p[prop][stage] !== undefined) {
                    cbs.push(<any>p[prop][stage]);
                }
            }
            result[stage] = combine(cbs);
        }
        return result;
    }

    let result: PufferNormalForm<any> = {
        pre: {},
        handle_command: {},
        post: {},
        css_rules: []
    };
    
    result.pre = iterate('pre', (pres) => (world) => {
        for (let p of pres) {
            world = p(world);
        }
        return world;
    });

    result.handle_command = iterate('handle_command', (hcs) => (world, parser) => {
        let threads: ParserThread<any>[] = [];

        for (let hc of hcs) {
            threads.push(() => hc(world, parser));
        }

        return parser.split(threads);
    });

    result.post = iterate('post', (posts) => (new_world, old_world) => {
        let result = new_world;

        for (let p of posts) {
            result = p(result, old_world);
        }

        return result;
    });

    result.css_rules = normalized.flatMap(p => p.css_rules);
    
    return result;
}


export function bake_puffers<T extends readonly Puffer<any>[]>(puffers: T): PufferSpec<IntersectTupleTypes<UnwrapPufferTuple<T>>>;
export function bake_puffers(puffers: Puffer<{}>[]): PufferSpec<{}> {
    function get_stages<P extends 'pre' | 'handle_command' | 'post'>(prop: P) {
        let stages = new Set<number>();
        puffers.forEach(p => {
            let p_ = p[prop];
            if (p_ === undefined) {
                return;
            }
            if (is_handler<PufferSpec_<any>[P]>(<any>p_)) {
                stages.add(0);
                return;
            }
            Object.keys(p[prop] as any).map(k => parseInt(k)).forEach(s => stages.add(s));
        });
        let ordered_stages = [...stages.values()];
        ordered_stages.sort();
        return ordered_stages;
    }

    // This winds up "sort of" typechecking. It thinks that p[prop] is always PufferNarrator
    function iterate<P extends 'pre' | 'handle_command' | 'post'>(prop: P, f: (cb: PufferSpec_<{}>[P]) => void) {
        let stages = get_stages(prop);
        for (let stage of stages) {
            for (let p of puffers) {
                let handler = p[prop]!;
                if (handler === undefined) {
                    continue;
                }
                if (is_handler(<any>handler) && stage === 0) {
                    f(<any>handler!);
                } else if (handler[stage] !== undefined) {
                    f(handler[stage]);
                }
            }
        }
    }

    function pre(world: World): World {
        let result = world;

        iterate('pre', pre => { result = pre(result); });

        return result;
    }

    function handle_command(world: World, parser: Parser): World {
        let threads: ParserThread<World>[] = [];

        iterate('handle_command', cb => threads.push(() => cb(world, parser)));

        return parser.split(threads);
    }

    function post(new_world: World, old_world: World): World {
        let result = new_world;

        iterate('post', post => { result = post(result, old_world); });

        return result;
    }

    let css_rules = puffers.flatMap(p => p.css_rules || []);

    let result: PufferSpec<{}> = {
        pre,
        handle_command,
        post,
    };
    if (css_rules.length > 0) {
        result.css_rules = css_rules;
    }

    return result;
}

export function make_puffer_world_spec<W extends World & IntersectTupleTypes<UnwrapPufferTuple<Index>>, Index extends readonly PufferForWorld<W>[]>
    (initial_world: W, puffer_index: Index)
    : WorldSpec<W> {
    
    let spec: Required<PufferSpecForWorld<W>> = <Required<PufferSpecForWorld<W>>> <unknown> bake_puffers(puffer_index);


    return make_world_spec({
        initial_world,
        ...spec,
    });
}