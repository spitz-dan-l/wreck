import { array_last } from "./utils";

export class Stages<X> extends Map<number, X> {
}

// export function stages<X extends Array<readonly[number, unknown]>>(...args: X): Stages<X[number][1]> {
//     return new Stages(args);
// }

export function stages<X>(...args: Array<readonly [number, X]>): Stages<X>;
export function stages<X extends Array<readonly[number, unknown]>>(...args: X): Stages<X[number][1]>;
export function stages<X>(...args: Array<readonly [number, X]>): Stages<X> {
    return new Stages(args);
}

export function array_to_stages<X>(arr: X[]): Stages<X> {
    return stages(...arr.map((x, i) => [i, x] as const));
}

export type MaybeStages<X> = X | Stages<X>

export function is_stages<T>(x: MaybeStages<T>): x is Stages<T> {
    return x instanceof Stages;
}

export function normalize_stages<T>(x?: MaybeStages<T>): Stages<T> {
    if (x === undefined) {
        return new Stages();
    }
    if (is_stages(x)) {
        return x;
    }
    return stages([0, x]);
}

export function stage_keys(x: Stages<any>): number[] {
    return [...x.keys()].sort((a,b) => a - b);
}

export function stage_values<X>(x: Stages<X>): X[] {
    return stage_keys(x).map(s => x.get(s)!);
}

export function stage_entries<X>(x: Stages<X>): [number, X][] {
    return stage_keys(x).map(s => [s, x.get(s)!]);
}

export function map_stages<T, R>(x: Stages<T>, f: (t: T, stage?: number) => R): Stages<R> {
    return stages(
        ...stage_entries(x).map(([s, t]) => [s, f(t, s)] as const))
}

export function foreach_stages<T>(x: Stages<T>, f: (t: T, stage?: number) => void): void {
    for (let [stage, t] of stage_entries(x)) {
        f(t, stage);
    }
}

export function merge_stages<T>(x: MaybeStages<T>, reducer: (acc: T, next: T) => T, init: T, stage_limit?: number): T {
    if (is_stages(x)) {
        let result: T = init;
        for (let stage of stage_keys(x)) {
            if (stage_limit === undefined || stage <= stage_limit) {
                result = reducer(result, x.get(stage)!);
            } else {
                break;
            }
        }
        return result;
    } else {
        return x;
    }
}

// export function find_and_move_to_stage<X extends unknown[]>(obj: Stages<X>, find: (x: X[number]) => boolean, update: (n: number) => number): Stages<X> {
export function find_and_move_to_stage<X>(obj: Stages<X[]>, find: (x: X) => boolean, update: (n: number) => number): Stages<X[]> {
    let result = stages(...obj);
    let additions: Stages<X[]> = stages();

    for (let [stage, xs] of stage_entries(obj)) {
        let to_move = xs.filter(x => find(x));
        let to_keep = xs.filter(x => !find(x));

        if (to_move.length > 0) {
            additions.set(update(stage), to_move);
            result.set(stage, to_keep);
        }
    }

    for (let [stage, moved_xs] of stage_entries(additions)) {
        let xs = result.get(stage);
        if (xs === undefined) {
            result.set(stage, moved_xs);
        } else {
            xs.push(...moved_xs);
        }
    }

    return result;
}

export function make_consecutive<X>(objs: Stages<X>[]): Stages<X> {
    return array_to_stages(objs.flatMap(s => stage_values(s)))
}

// TODO arbitrarily-nested Stages tree for precise decentralized ordering
export type StageTree<X> = undefined | X | StageTreeBranch<X>;
export interface StageTreeBranch<X> extends Stages<StageTree<X>> {};

export function is_stree_branch<X>(x: StageTree<X>): x is StageTreeBranch<X> {
    return x instanceof Stages;
}

export function stree_to_array<X>(stree: StageTree<X>): X[] {
    if (stree === undefined) {
        return [];
    } else if (is_stree_branch(stree)) {
        return stage_values(stree).flatMap(x => stree_to_array(x))
    } else {
        return [stree];
    }
}

export type StagePath = number[];
export function stree_find<X>(stree: StageTree<X>, f: (x: X) => boolean): StagePath | null {
    if (is_stree_branch(stree)) {
        for (const [stage, x] of stage_entries(stree)) {
            const child_path = stree_find(x, f);
            if (child_path !== null) {
                return [stage, ...child_path];
            }
        }
        return null;
    }
    if (stree === undefined) {
        return null;
    }
    return f(stree) ? [] : null;
}

export function stree_find_all<X>(stree: StageTree<X>, f: (x: X) => boolean): StagePath[] {
    const result: StagePath[] = [];
    if (is_stree_branch(stree)) {
        for (const [stage, x] of stage_entries(stree)) {
            const child_paths = stree_find_all(x, f);
            result.push(...child_paths.map(p => [stage, ...p]));
        }
    } else if (stree !== undefined && f(stree)) {
        result.push([]);
    }
    return result;
}

export function stree_get<X>(stree: StageTree<X>, path: StagePath): StageTree<X> | undefined {
    let node: StageTree<X> | undefined = stree;
    for (const i of path) {
        if (node === undefined) {
            break;
        } else if (is_stree_branch(node)) {
            node = node.get(i);
        } else {
            if (i !== 0) {
                break;
            }
        }
    }
    return node;
}

export function stree_cut<X>(stree: StageTree<X>, path: StagePath): [StageTree<X>, StageTree<X>] {
    if (path.length === 0) {
        return [undefined, stree];
    }

    const i = path[0];
    if (is_stree_branch(stree)) {
        if (!stree.has(i)) {
            return [stree, undefined];
        }
        let [child, found] = stree_cut(stree.get(i), path.slice(1));
        if (found === undefined) {
            return [stree, undefined];
        }
        return [stages(...stree, [i, child]), found];
    } else {
        if (i === 0) {
            return stree_cut(stree, path.slice(1));
        }
        return [stree, undefined];
    }
}

export function stree_append<X>(stree: StageTree<X>, x: StageTree<X>, path: StagePath = []): StageTree<X> {
    let result: StageTree<X>;
    if (stree === undefined) {
        result = undefined;
    } else if (is_stages(stree)) {
        result = stages(...stree);
    } else {
        result = stages([0, stree]);
    }

    if (path.length === 0) {
        if (result === undefined) {
            return x;
        } else {
            let idx = array_last(stage_keys(result));
            if (idx === undefined) {
                idx = 0;
            } else {
                idx += 1;
            }
            result.set(idx, x);
        }
    } else {
        if (result === undefined) {
            result = stages();
        }
        const i = path[0];
        result.set(i, stree_append(result.get(i), x, path.slice(1)));
    }

    return result;
}

export function stree_move<X>(stree: StageTree<X>, from: StagePath, to: StagePath): StageTree<X> {
    const [stree2, child] = stree_cut(stree, from);
    return stree_append(stree2, child, to);
}