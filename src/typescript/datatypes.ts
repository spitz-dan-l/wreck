import {List, Set, Collection, } from 'immutable';

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
        return List<number>([this.start, this.end]).hashCode();
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
}

export type Point2 = [number, number];

export class Matrix2 {
    readonly data: number[][];
    constructor (data: number[][]) {
        this.data = data;
    }

    get(pt: Point2): number {
        return this.data[pt[1]][pt[0]];
    }

    rotate(degrees: number): Matrix2 {
        //validate input better

        if (degrees == 360 || degrees == 0) {
            return this;
        }

        const n_rotations = degrees / 90;

        const dim_x = this.data[0].length;
        const dim_y = this.data.length;

        let m: Matrix2 = this;
        for (let i = 0; i < n_rotations; i++){
            let new_data: number[][] = [];
            for (let y = 0; y < dim_y; y++){
                let row: number[] = [];
                for (let x = 0; x < dim_x; x++){
                    row.push(m.get([y, dim_x - 1 - x]));
                }
                new_data.push(row);
            }
            m = new Matrix2(new_data);
        }
        return m
    }

    contains(value: number): boolean{
        let found = false;
        for (let row of this.data){
            if (row.includes(value)){
                found = true;
                break;
            }
        }
        return found;
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