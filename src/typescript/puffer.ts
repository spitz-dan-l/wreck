/*
    A puffer is a type of pattern described in Conway's Game of Life.
    http://www.conwaylife.com/wiki/Puffer

    It is an object that moves itself through the Life grid, and leaves behind debris where it has been.

    Here, a Puffer is a bundle of world behaviors that run within the game world,
    reading and updating game state, and leaving behind the "debris" of those updates.
    Sometimes that "debris" is just incidental bits of state, sometimes it is
    read or otherwise used by other Puffers sharing the world.

    Each of a puffer's three handlers can be split into numbered stages; when
    puffers are combined, all their stage-0 handlers run before any stage-1
    handlers, and so on.
*/

import { map_stages, MaybeStages, normalize_stages, Stages, stages, stage_keys } from './lib/stages';
import { CommandHandler, make_world_spec, Narrator, World, WorldSpec, WorldUpdater } from './world';

type PufferSpec<W extends World> = {
    pre: WorldUpdater<W>,
    handle_command: CommandHandler<W>,
    post: Narrator<W>,
    css_rules: string[]
}

type HandlerName = 'pre' | 'handle_command' | 'post';

export type Puffer<W extends World> = {
    pre?: MaybeStages<WorldUpdater<W>>,
    handle_command?: MaybeStages<CommandHandler<W>>,
    post?: MaybeStages<Narrator<W>>,
    css_rules?: string[]
};

export type PufferNormalForm<W extends World> = {
    pre: Stages<WorldUpdater<W>>,
    handle_command: Stages<CommandHandler<W>>,
    post: Stages<Narrator<W>>,
    css_rules: string[]
};

export function normalize_puffer<W extends World>(puffer: Puffer<W>): PufferNormalForm<W> {
    return {
        ...puffer,
        pre: normalize_stages(puffer.pre),
        handle_command: normalize_stages(puffer.handle_command),
        post: normalize_stages(puffer.post),
        css_rules: puffer.css_rules ?? []
    };
}

export type PufferMapper<W extends World> = {
    pre?: (cb: WorldUpdater<W>, stage?: number) => WorldUpdater<W>,
    handle_command?: (cb: CommandHandler<W>, stage?: number) => CommandHandler<W>,
    post?: (cb: Narrator<W>, stage?: number) => Narrator<W>
};

export function map_puffer<W extends World>(mapper: PufferMapper<W>, puffer: Puffer<W>): Puffer<W> {
    const norm = normalize_puffer(puffer);
    return {
        ...puffer,
        pre: mapper.pre ? map_stages(norm.pre, mapper.pre) : norm.pre,
        handle_command: mapper.handle_command ? map_stages(norm.handle_command, mapper.handle_command) : norm.handle_command,
        post: mapper.post ? map_stages(norm.post, mapper.post) : norm.post,
        css_rules: norm.css_rules
    };
}

// Only run the puffer when cond() holds. (For post, when it held either before or after the command.)
export function gate_puffer<W extends World>(cond: (world: W, old_world?: boolean) => boolean, puffer: Puffer<W>): Puffer<W> {
    return map_puffer<W>({
        pre: (cb) => (world) => cond(world) ? cb(world) : world,
        handle_command: (cb) => (world, parser) => cond(world) ? cb(world, parser) : parser.eliminate(),
        post: (cb) => (new_world, old_world) =>
            (cond(new_world, false) || cond(old_world, true)) ? cb(new_world, old_world) : new_world
    }, puffer);
}

function all_stage_keys<W extends World>(puffers: PufferNormalForm<W>[], prop: HandlerName): number[] {
    const ks = new Set(puffers.flatMap(p => stage_keys(p[prop])));
    return [...ks].sort((a, b) => a - b);
}

// Combine puffers into a single puffer, keeping the stages separate.
export function knit_puffers<W extends World>(puffers: Puffer<W>[]): PufferNormalForm<W> {
    const normalized = puffers.map(normalize_puffer);

    function iterate<Prop extends HandlerName>(prop: Prop, combine: (cbs: PufferSpec<W>[Prop][]) => PufferSpec<W>[Prop]): Stages<PufferSpec<W>[Prop]> {
        const result: Stages<PufferSpec<W>[Prop]> = stages();
        for (const stage of all_stage_keys(normalized, prop)) {
            const cbs = normalized.map(p => p[prop].get(stage) as PufferSpec<W>[Prop] | undefined)
                .filter((cb): cb is PufferSpec<W>[Prop] => cb !== undefined);
            result.set(stage, combine(cbs));
        }
        return result;
    }

    return {
        pre: iterate('pre', (pres) => (world) => pres.reduce((acc, p) => p(acc), world)),
        handle_command: iterate('handle_command', (hcs) => (world, parser) =>
            parser.split(hcs.map((hc) => () => hc(world, parser)))),
        post: iterate('post', (posts) => (new_world, old_world) =>
            posts.reduce((acc, p) => p(acc, old_world), new_world)),
        css_rules: normalized.flatMap(p => p.css_rules)
    };
}

// "Bake" puffers into a single spec with all stages flattened, in stage order.
export function bake_puffers<W extends World>(puffers: Puffer<W>[]): PufferSpec<W> {
    const normalized = puffers.map(normalize_puffer);

    function collect<Prop extends HandlerName>(prop: Prop): PufferSpec<W>[Prop][] {
        const cbs: PufferSpec<W>[Prop][] = [];
        for (const stage of all_stage_keys(normalized, prop)) {
            for (const p of normalized) {
                const cb = p[prop].get(stage) as PufferSpec<W>[Prop] | undefined;
                if (cb !== undefined) {
                    cbs.push(cb);
                }
            }
        }
        return cbs;
    }

    const pres = collect('pre');
    const hcs = collect('handle_command');
    const posts = collect('post');

    return {
        pre: (world) => pres.reduce((acc, cb) => cb(acc), world),
        handle_command: (world, parser) => parser.split(hcs.map(cb => (p) => cb(world, p))),
        post: (new_world, old_world) => posts.reduce((acc, cb) => cb(acc, old_world), new_world),
        css_rules: normalized.flatMap(p => p.css_rules)
    };
}

export function make_puffer_world_spec<W extends World>(initial_world: W, puffers: Puffer<W>[]): WorldSpec<W> {
    return make_world_spec({
        initial_world,
        ...bake_puffers(puffers)
    });
}
