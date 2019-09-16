import { World } from "./world";

export function find_historical<W extends World>(world: W, f: (w: W) => boolean) {
    let w: W | null = world;

    while (w != null) {
        if (f(w)) {
            return w;
        }
        w = w.previous;
    }

    return null;
}

export function find_index<W extends World>(world: W, index: number) {
    return find_historical(world, w => w.index === index);
}

// When mapping or filtering history, simply converting to an array is easier than
// reimplementing all the various traversal methods on the linked list
export function history_array<W extends World>(world: W) {
    let w: W | null = world;
    let result: W[] = [];
    while (w != null) {
        result.push(w);
        w = w.previous;
    }

    return result;
}

export type CompoundWorld<W extends World> = {
    kind: 'CompoundWorld',
    root: W,
    children: MaybeCompoundWorld<W>[]
}
export type MaybeCompoundWorld<W extends World> = CompoundWorld<W> | W;
export function is_compound_world<W extends World>(x: MaybeCompoundWorld<W>): x is CompoundWorld<W> {
    return (x as any).kind === 'CompoundWorld'; 
}

export function group_compound_worlds<W extends World>(world: W) {
    type RunInfo = null | { start: number, parent: W };

    let result: MaybeCompoundWorld<W>[] = history_array(world).reverse();

    let another_pass: boolean;
    do {
        another_pass = false;
        const next_result: MaybeCompoundWorld<W>[] = [];
        let run_info: RunInfo = null;
        
        function push_run(r_info: Exclude<RunInfo, null>, end: number) {
            const run = result.slice(r_info.start, end);
            next_result.push({
                kind: 'CompoundWorld',
                root: r_info.parent,
                children: run
            });
            run_info = null;
            another_pass = true;
        }
        
        for (let i = 0; i < result.length; i++) {
            const w = result[i];
            const parent = (is_compound_world(w) ? w.root : w).parent;

            if (run_info !== null) {
                if (parent !== run_info.parent) {
                    // this is the end of a run
                    push_run(run_info, i);
                } else {
                    continue;
                }
            }

            if (parent !== null) {
                run_info = {
                    start: i,
                    parent: parent
                };            
            } else {
                next_result.push(w);
            }

        }

        if (run_info !== null) {
            push_run(run_info, result.length);
        }
        result = next_result;
    } while (another_pass);

    return result;
}