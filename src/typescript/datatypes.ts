import {
    Collection,
    hash,
    isImmutable,
    List,
    Map,
    Set
} from 'immutable';

export type Partition = Set<number>;

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
        return (this.start == other.start && this.end == other.end);
    }

    hashCode() {
        return hash(hash(this.start) + hash(this.end));
        // fuck
        // return ( this.end << 16 ) ^ this.start;
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

export let direction_2_face = Map<Direction, Face>([
    [Direction.n, Face.n],
    [Direction.s, Face.s],
    [Direction.e, Face.e],
    [Direction.w, Face.w]
]);

export class Dangle {
    readonly partition: Partition;
    readonly edges: List<Edge>;
    readonly fixed_face: Face;
    readonly free_face: Face;

    constructor(partition: Partition, edges: List<Edge>, fixed_face: Face, free_face: Face) {
        this.partition = partition;
        this.edges = edges;
        this.fixed_face = fixed_face;
        this.free_face = free_face;
    }

    equals(other: Dangle){
        return (
            this.partition.equals(other.partition)
            && this.edges.equals(other.edges)
            && this.fixed_face === other.fixed_face
            && this.free_face === other.free_face);
    }

    hashCode() {
        return hash(hash(this.partition) + hash(this.edges) + hash(this.fixed_face) + hash(this.free_face));
        //let faces_hash = (this.fixed_face << 16) ^ this.free_face; //fuck!
        //return this.partition.hashCode() + this.edges.hashCode() + faces_hash;
    }
}

export type Point2 = [number, number];

export function make_matrix2(data_obj: number[][]) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;

    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}

export class Matrix2 {
    readonly dim_x: number;
    readonly dim_y: number;
    readonly data: Int16Array;
    
    constructor (data: Int16Array, dim_x: number, dim_y: number) {
        this.data = data;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
    }

    get(x: number, y: number): number {
        return this.data[y * this.dim_x + x];
    }

    set(x: number, y: number, value: number) {
        this.data[y * this.dim_x + x] = value;
    }

    rotate(degrees: number): Matrix2 {
        //validate input better

        if (degrees == 360 || degrees == 0) {
            return this;
        }

        const n_rotations = degrees / 90;
        let m: Matrix2 = this;
        const dim_x = this.dim_x;
        const dim_y = this.dim_y;
        for (let i = 0; i < n_rotations; i++){
            let new_data = new Int16Array(dim_x * dim_y);
            let new_mat2 = new Matrix2(new_data, dim_y, dim_x);
            for (let y = 0; y < dim_y; y++){
                for (let x = 0; x < dim_x; x++){
                    new_mat2.set(dim_y - 1 - y, x, m.get(x, y));
                }
            }
            m = new_mat2;
        }
        return m
    }

    contains(value: number): boolean{
        return this.data.indexOf(value) !== -1;
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

export abstract class Item {
    abstract weight(): Weight;
    abstract name(): string;
    abstract pre_gestalt(): string;
    abstract post_gestalt(): string;
    article(): string {
        return 'a';
    }
}


export type Counter<T> = Map<T, number>;

export function counter_add<T>(counter: Counter<T>, key: T, inc: number){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = counter.get(key);
    }
    return counter.set(key, cur_val + inc);
}

export function counter_get<T>(counter: Counter<T>, key: T){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = counter.get(key);
    }
    return cur_val;
}

export function counter_update<T>(counter1: Counter<T>, counter2: Counter<T>){
    let switch_to_immutable = isImmutable(counter1);
    let result = counter1.asMutable();

    counter2.forEach(function (v, k){
        counter_add(result, k, v);
    });

    if (switch_to_immutable) {
        result = result.asImmutable();
    }
    return result;
}

export function counter_order<T>(counter: Counter<T>, include_zero=false){
    let result = counter.sort();
    if (!include_zero) {
        result = result.filter((count) => count > 0);
    }
    return result.keySeq().toList().reverse();
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