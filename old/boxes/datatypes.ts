import {FuckSet, arrays_fuck_equal} from '../datatypes';

export type Partition = FuckSet<number>;

export class Edge {
    readonly start: number;
    readonly end: number;

    constructor(start: number, end: number){
        if (end < start){
            this.start = end;
            this.end = start;
        } else {
            this.start = start;
            this.end = end;
        }
    }

    equals(other:Edge){
        return (this.start === other.start && this.end === other.end);
    }

    toString(): string {
        return `Edge<${this.start},${this.end}>`;
    }
}

export enum Face {
    n = 0,
    s = 1,
    e = 2,
    w = 3,
    t = 4,
    b = 5
}

export let faces = [Face.n, Face.s, Face.e, Face.w, Face.t, Face.b];

export enum Direction {
    n = 0,
    s = 1,
    e = 2,
    w = 3
}

export let directions = [Direction.n, Direction.s, Direction.e, Direction.w];

export let direction_2_face = new Map<Direction, Face>([
    [Direction.n, Face.n],
    [Direction.s, Face.s],
    [Direction.e, Face.e],
    [Direction.w, Face.w]
]);

export class Dangle {
    readonly partition: Partition;
    readonly edges: Edge[];
    readonly fixed_face: Face;
    readonly free_face: Face;

    constructor(partition: Partition, edges: Edge[], fixed_face: Face, free_face: Face) {
        this.partition = partition;
        this.edges = edges;
        this.fixed_face = fixed_face;
        this.free_face = free_face;
    }

    equals(other: Dangle){
        return (
            this.partition.keys_equal(other.partition)
            && arrays_fuck_equal(this.edges, other.edges)
            && this.fixed_face === other.fixed_face
            && this.free_face === other.free_face);
    }

    toString() {
        return `Dangle<${this.partition},${this.edges},${this.fixed_face},${this.free_face}>`;
        
        //let faces_hash = (this.fixed_face << 16) ^ this.free_face; //fuck!
        //return this.partition.hashCode() + this.edges.hashCode() + faces_hash;
    }
}




export enum CardboardEdge {
    intact = 0,
    cut = 1,
}

export enum TapeEdge {
    untaped = 0,
    taped = 1,
    cut = 2
}

export class EdgeState {
    readonly cardboard: CardboardEdge;
    readonly tape: TapeEdge;

    constructor (cardboard?: CardboardEdge, tape?: TapeEdge){
        if (cardboard === undefined) {
            cardboard = CardboardEdge.intact;
        }
        this.cardboard = cardboard;

        if (tape === undefined) {
            tape = TapeEdge.untaped;
        }
        this.tape = tape;
    }

    cut() {
        let new_tape: TapeEdge;
        if (this.tape == TapeEdge.taped) {
            new_tape = TapeEdge.cut;
        } else {
            new_tape = this.tape
        }

        return new EdgeState(CardboardEdge.cut, new_tape);
    }


    apply_tape() {
        return new EdgeState(this.cardboard, TapeEdge.taped);
    }
}

export enum EdgeOperation {
    cut = 0,
    tape = 1
}

export enum EdgeDirection {
    horizontal = 0,
    vertical = 1
}

export enum RendState {
    closed = 0,
    open = 1
}

export enum RendOperation {
    close = 0,
    open = 1
}

export enum SpillageLevel {
    none = 0,
    light = 1,
    heavy = 2
}

export enum Weight {
    empty = 0,
    very_light = 1,
    light = 2,
    medium = 3,
    heavy = 4,
    very_heavy = 5
}


export enum RelativePosition {
    left = 0, center = 1, right = 2,
    top = 3, middle = 4, bottom = 5
}

export class WreckError extends Error {}

// used to signal errors caused by trying to update world state in a way that breaks the reality of the world
// so assumes that commands are already valid, the attempted update *could work* if the state were different
export class WorldUpdateError extends WreckError {}

// used to signal that a command/pseudo command is not specified legally
// the command cannot be executed because it *cannot be interpreted*
export class CommandError extends WreckError {}