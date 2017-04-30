import {List, Set, Collection} from 'immutable';

export type Partition = Set<number>;

export class Edge {
    readonly start: number;
    readonly end: number;

    constructor(start, end){
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
        // fuck
        return ( this.end << 16 ) ^ this.start;
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

export class Dangle {
    readonly partition: Partition;
    readonly edges: List<Edge>;
    readonly fixed_face: Face;
    readonly free_face: Face;

    constructor(partition, edges, fixed_face, free_face) {
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
        let faces_hash = (this.fixed_face << 16) ^ this.free_face; //fuck!
        return this.partition.hashCode() + this.edges.hashCode() + faces_hash;
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

    constructor (cardboard: CardboardEdge, tape: TapeEdge){
        this.cardboard = cardboard;
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