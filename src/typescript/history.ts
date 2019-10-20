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
export function history_array<W extends World>(world: W, take_while?: (w: W) => boolean) {
    let w: W | null = world;
    let result: W[] = [];
    while (w != null) {
        if (take_while !== undefined && !take_while(w)) {
            break;
        }
        result.push(w);
        w = w.previous;
    }

    return result;
}
