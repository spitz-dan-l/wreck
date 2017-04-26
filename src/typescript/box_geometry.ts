import {Matrix2, Dangle, Face, Edge, Partition, faces} from './datatypes';

import {Map, List, Set, OrderedSet} from 'immutable';

let face_vertices = Map<Face, Matrix2>([
    [Face.t, new Matrix2([
        [0,  1,  2 ],
        [9,  25, 15],
        [16, 24, 22]])],
    [Face.b, new Matrix2([
        [20, 19, 18],
        [13, 12, 11],
        [8,  7,  6 ]])],
    [Face.n, new Matrix2([
        [2,  1,  0 ],
        [5,  4,  3 ],
        [8,  7,  6 ]])],
    [Face.e, new Matrix2([
        [22, 15, 2 ],
        [21, 14, 5 ],
        [20, 13, 8 ]])],
    [Face.s, new Matrix2([
        [16, 24, 22],
        [17, 23, 21],
        [18, 19, 20]])],
    [Face.w, new Matrix2([
        [0,  9,  16],
        [3,  10, 17],
        [6,  11, 18]])]
]);

let face_quadrants = Map<Face, Matrix2>([
    [Face.t, new Matrix2([
        [0,  1 ],
        [2,  3 ]])],
    [Face.b, new Matrix2([
        [4,  5 ],
        [6,  7 ]])],
    [Face.n, new Matrix2([
        [8,  9 ],
        [10, 11]])],
    [Face.e, new Matrix2([
        [12, 13],
        [14, 15]])],
    [Face.s, new Matrix2([
        [16, 17],
        [18, 19]])],
    [Face.w, new Matrix2([
        [20, 21],
        [22, 23]])],
]);

function build_edge_quadrant_mappings(): [Map<number, List<Edge>>, Map<Edge, List<number>>] {
    let quadrant_2_edges = Map<number, List<Edge>>();
    let edge_2_quadrants = Map<Edge, List<number>>();

    for (let f of faces){
        let vs = face_vertices.get(f);
        let qs = face_quadrants.get(f);
        for (let [x, y] of [[0,0], [1,0], [0,1], [1,1]]){
            let q_edges = get_quadrant_edges(vs, x, y);
            quadrant_2_edges = quadrant_2_edges.set(qs.get([x, y]), q_edges);
            q_edges.forEach(function (qe) {
                edge_2_quadrants = edge_2_quadrants.update(qe, (xs) => xs.push(qs.get([x, y])));
            });
        }
    }

    return [quadrant_2_edges, edge_2_quadrants];
}

function get_quadrant_edges(m: Matrix2, x: number, y: number): List<Edge> {
    let offsets = [
        [0,0,0,1],
        [0,0,1,0],
        [1,1,0,1],
        [1,1,1,0]
    ];
    let edges = List<Edge>();
    for (let [x1, y1, x2, y2] of offsets){
        let e1 = m.get([x+x1, y+y1]);
        let e2 = m.get([x+x2, y+y2]);
        if (e2 < e1){
            edges = edges.push([e2, e1]);
        } else {
            edges = edges.push([e1, e2]);
        }
    }
    return edges;
}

let [quadrant_2_edges, edge_2_quadrants] = build_edge_quadrant_mappings();

function get_quadrant_partition(quadrant: number, cut_edges: List<Edge>) {
    let current_partition = Set<number>([quadrant]);
    let horizon = List<Edge>(quadrant_2_edges.get(quadrant));

    while (horizon.size > 0){
        let e = horizon.first(); horizon = horizon.shift();
        if (cut_edges.contains(e)){
            continue;
        }
        let next_qs = Set<number>(edge_2_quadrants.get(e));
        let new_qs = next_qs.subtract(current_partition);
        if (new_qs.size > 0) {
            new_qs.forEach(function (q){
                horizon = horizon.push(...quadrant_2_edges.get(q).toArray());
                current_partition = current_partition.add(q);
            });
        }
    }
    return current_partition;
}

function range(x: number){
    let arr: number[];
    for (let i = 0; i < x; i++){
         arr.push(i);
    } 
    return arr;
}

function get_partitions(cut_edges: List<Edge>){
    let quadrants = OrderedSet<number>(range(24));
    let partitions = List<Partition>();
    while (quadrants.size > 0){
        let q = quadrants.first(); quadrants = OrderedSet(quadrants.rest());
        let partition = get_quadrant_partition(q, cut_edges);
        partitions.push(partition);
        quadrants = quadrants.subtract(partition);
    }
    return partitions;
}

interface FaceMesh {
    vertices: Matrix2,
    quadrants: Matrix2
}

function face_mesh_rotate(fm, degrees){
    return {vertices: fm.vertices.rotate(degrees), quadrants: fm.quadrants.rotate(degrees)};
}


class BoxMesh{
    dimensions: [number, number, number];
    face_meshes: Map<Face, FaceMesh>;
    cut_edges: List<Edge>;

    constructor()
}