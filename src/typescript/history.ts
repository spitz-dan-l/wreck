import { World } from "./world";

export function find_historical<W extends World>(world: W, f: (w: W) => boolean): W | undefined {
    let w: W | undefined = world;

    while (w !== undefined) {
        if (f(w)) {
            return w;
        }
        w = w.previous;
    }

    return undefined;
}

export function find_historical_all<W extends World>(world: W, f: (w: W) => boolean): W[] {
    const result: W[] = [];
    let w: W | undefined = world;

    while (w !== undefined) {
        if (f(w)) {
            result.push(w);
        }
        w = w.previous;
    }

    return result;
}

export function find_index<W extends World>(world: W, index: number) {
    return find_historical(world, w => w.index === index);
}

export function indices_where<W extends World>(world: W, f: (w: W) => boolean): number[] {
    return find_historical_all(world, f).map(w => w.index);
}

// When mapping or filtering history, simply converting to an array is easier than
// reimplementing all the various traversal methods on the linked list
export function history_array<W extends World>(world: W, take_while?: (w: W) => boolean) {
    let w: W | undefined = world;
    let result: W[] = [];
    while (w !== undefined) {
        if (take_while !== undefined && !take_while(w)) {
            break;
        }
        result.push(w);
        w = w.previous;
    }

    return result;
}
