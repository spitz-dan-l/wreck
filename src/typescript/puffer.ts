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
import { IntersectTupleTypes, drop_keys, from_entries } from './utils';
import { make_world_spec, World, WorldSpec, WorldUpdater, CommandHandler, Narrator } from './world';
import {normalize_stages, Stages, MaybeStages, map_stages, stage_keys} from './stages';


type PufferSpec<W extends World> = {
    pre: WorldUpdater<W>,
    handle_command: CommandHandler<W>,
    post: Narrator<W>,
    css_rules: string[]
}

export type Puffer<W extends World> = {
    [K in Exclude<keyof PufferSpec<W>, 'css_rules'>]?: MaybeStages<PufferSpec<W>[K]>
} & {
    css_rules?: string[]
};

export type PufferNormalForm<W extends World> = {
    [K in Exclude<keyof PufferSpec<W>, 'css_rules'>]: Stages<PufferSpec<W>[K]>
} & {
    css_rules: string[]
};

export function normalize_puffer<W extends World>(puffer: Puffer<W>): PufferNormalForm<W> {
    return {
        pre: normalize_stages(puffer.pre),
        handle_command: normalize_stages(puffer.handle_command),
        post: normalize_stages(puffer.post),
        css_rules: puffer.css_rules || [],
        ...drop_keys(puffer, 'pre', 'handle_command', 'post', 'css_rules')
    }
}

export type PufferMapper<T extends World> = {
    [K in keyof PufferSpec<T>]?: (cb: PufferSpec<T>[K], stage?: number) => PufferSpec<T>[K]
};

export function map_puffer<T extends World>(mapper: PufferMapper<T>, puffer: Puffer<T>): Puffer<T> {
    let norm_puffer = normalize_puffer(puffer);

    return {
        pre: mapper.pre ? map_stages(mapper.pre, norm_puffer.pre) : norm_puffer.pre,
        handle_command: mapper.handle_command ? map_stages(mapper.handle_command, norm_puffer.handle_command) : norm_puffer.handle_command,
        post: mapper.post ? map_stages(mapper.post, norm_puffer.post) : norm_puffer.post,
        css_rules: norm_puffer.css_rules,
        ...drop_keys(puffer, 'pre', 'handle_command', 'post', 'css_rules')
    }
}

export function gate_puffer<W extends World>(cond: (world: W, old_world?: boolean) => boolean, puffer: Puffer<W>): Puffer<W> {
    return map_puffer({
        pre: (cb) => {
            return (world) => {
                if (cond(world)) {
                    return cb(world);
                }
                return world;
            };
        },
        handle_command: (cb) => {
            return (world, parser) => {
                if (!cond(world)) {
                    return parser.eliminate();
                }
                return cb(world, parser);
            };
        },
        post: (cb) => {
            return (new_world, old_world) => {
                if (cond(new_world, false) || cond(old_world, true)) {
                    return cb(new_world, old_world);
                }
                return new_world;
            };
        }
    }, puffer);
}

type UnwrapPuffer<T> = T extends Puffer<infer U> ? U : never;
type UnwrapPufferTuple<T extends { [k: number]: Puffer<World> }> = { [P in keyof T]: UnwrapPuffer<T[P]> };

export function knit_puffers<T extends readonly Puffer<World>[]>(puffers: T): PufferNormalForm<World & IntersectTupleTypes<UnwrapPufferTuple<T>>>;
export function knit_puffers(puffers: Puffer<World>[]): PufferNormalForm<World> {
    let normalized: PufferNormalForm<World>[] = puffers.map(normalize_puffer);

    let stages: { [K in 'pre' | 'handle_command' | 'post']: number[] } = {
        pre: [],
        handle_command: [],
        post: []
    };
    for (let prop of ['pre', 'handle_command', 'post'] as const) {
        for (let puffer of normalized) {
            stages[prop].push(...stage_keys(puffer[prop]));
        }
        stages[prop] = [...new Set(stages[prop]).values()].sort();
    }

    function iterate<Prop extends 'pre' | 'handle_command' | 'post'>(prop: Prop, combine: (cbs: PufferSpec<World>[Prop][]) => PufferSpec<World>[Prop]) {
        let result: Stages<PufferSpec<any>[Prop]> = {kind: 'Stages'};
        for (let stage of stages[prop]) {
            let cbs: PufferSpec<any>[Prop][] = [];
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
        pre: {kind: 'Stages'},
        handle_command: {kind: 'Stages'},
        post: {kind: 'Stages'},
        css_rules: []
    };
    
    result.pre = iterate('pre', (pres) => (world) => {
        return pres.reduce((acc, p) => p(acc), world)
    });

    result.handle_command = iterate('handle_command', (hcs) => (world, parser) => {
        return parser.split(
            hcs.map((hc) => () => hc(world, parser)));
    });

    result.post = iterate('post', (posts) => (new_world, old_world) => {
        return posts.reduce((acc, p) => p(acc, old_world), new_world);
    });

    result.css_rules = normalized.flatMap(p => p.css_rules);
    
    return result;
}

// "Bakes" a list of puffers into a single PufferSpec_ with all stages removed
export function bake_puffers<T extends readonly Puffer<World>[]>(puffers: T): PufferSpec<World & IntersectTupleTypes<UnwrapPufferTuple<T>>>;
export function bake_puffers(puffers: Puffer<World>[]): PufferSpec<World> {
    let normalized = puffers.map(normalize_puffer);

    let all_stages: { [K in 'pre' | 'handle_command' | 'post']: number[] } = {
        pre: [],
        handle_command: [],
        post: []
    };
    for (let prop of ['pre', 'handle_command', 'post'] as const) {
        for (let puffer of normalized) {
            all_stages[prop].push(...stage_keys(puffer[prop]));
        }
        all_stages[prop] = [...new Set(all_stages[prop]).values()].sort();
    }

    function iterate<Prop extends 'pre' | 'handle_command' | 'post'>(prop: Prop, combine: (cbs: PufferSpec<World>[Prop][]) => PufferSpec<World>[Prop]) {
        let result: PufferSpec<any>[Prop];
        let cbs: PufferSpec<any>[Prop][] = [];
        for (let stage of all_stages[prop]) {
            for (let p of normalized) {
                if (p[prop][stage] !== undefined) {
                    cbs.push(<any>p[prop][stage]);
                }
            }
        }
        return combine(cbs);
    }

    let pre = iterate('pre', (cbs) => (world) =>
        cbs.reduce((acc, cb) => cb(acc), world));

    let handle_command = iterate('handle_command', (cbs) => (world, parser) =>
        parser.split(cbs.map(cb => (p) => cb(world, p))));

    let post = iterate('post', (cbs) => (new_world, old_world) =>
        cbs.reduce((acc, cb) => cb(acc, old_world), new_world));

    let css_rules = puffers.flatMap(p => p.css_rules || []);

    let result: PufferSpec<World> = {
        pre,
        handle_command,
        post,
        css_rules
    };

    return result;
}

export function make_puffer_world_spec<Index extends readonly Puffer<World & Partial<W>>[], W extends World & IntersectTupleTypes<UnwrapPufferTuple<Index>>>
    (initial_world: W, puffer_index: Index)
    : WorldSpec<W> {
    
    let spec: PufferSpec<W> = <PufferSpec<W>> bake_puffers(puffer_index);


    return make_world_spec({
        initial_world,
        ...spec,
    });
}