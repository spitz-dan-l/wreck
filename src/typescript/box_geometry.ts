import {
    Dangle,
    Direction,
    Edge,
    EdgeOperation,
    Face,
    faces,
    Matrix2,
    make_matrix2,
    Partition,
    Point2,
 } from './datatypes';

import {is, List, Map, Set} from 'immutable';

let face_vertices = Map<Face, Matrix2>([
    [Face.t, make_matrix2([
        [0,  1,  2 ],
        [9,  25, 15],
        [16, 24, 22]])],
    [Face.b, make_matrix2([
        [20, 19, 18],
        [13, 12, 11],
        [8,  7,  6 ]])],
    [Face.n, make_matrix2([
        [2,  1,  0 ],
        [5,  4,  3 ],
        [8,  7,  6 ]])],
    [Face.e, make_matrix2([
        [22, 15, 2 ],
        [21, 14, 5 ],
        [20, 13, 8 ]])],
    [Face.s, make_matrix2([
        [16, 24, 22],
        [17, 23, 21],
        [18, 19, 20]])],
    [Face.w, make_matrix2([
        [0,  9,  16],
        [3,  10, 17],
        [6,  11, 18]])]
]);

let face_quadrants = Map<Face, Matrix2>([
    [Face.t, make_matrix2([
        [0,  1 ],
        [2,  3 ]])],
    [Face.b, make_matrix2([
        [4,  5 ],
        [6,  7 ]])],
    [Face.n, make_matrix2([
        [8,  9 ],
        [10, 11]])],
    [Face.e, make_matrix2([
        [12, 13],
        [14, 15]])],
    [Face.s, make_matrix2([
        [16, 17],
        [18, 19]])],
    [Face.w, make_matrix2([
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
            quadrant_2_edges = quadrant_2_edges.set(qs.get(x, y), q_edges);
            q_edges.forEach(function (qe) {
                let q = qs.get(x, y);
                if (edge_2_quadrants.has(qe)) {
                    edge_2_quadrants = edge_2_quadrants.update(qe, (xs) => xs.push(q));
                } else {
                    edge_2_quadrants = edge_2_quadrants.set(qe, List<number>([q]));
                }
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
        let e1 = m.get(x+x1, y+y1);
        let e2 = m.get(x+x2, y+y2);
        if (e2 < e1){
            edges = edges.push(new Edge(e2, e1));
        } else {
            edges = edges.push(new Edge(e1, e2));
        }
    }
    return edges;
}

export let [quadrant_2_edges, edge_2_quadrants] = build_edge_quadrant_mappings();

function get_quadrant_partition(quadrant: number, cut_edges: List<Edge>) {
    let current_partition = Set<number>([quadrant]).asMutable();
    let horizon = List<Edge>(quadrant_2_edges.get(quadrant)).asMutable();

    while (horizon.size > 0){
        let e = horizon.first(); horizon = horizon.shift();
        if (cut_edges.contains(e)){
            continue;
        }
        let next_qs = Set<number>(edge_2_quadrants.get(e));
        let new_qs = next_qs.subtract(current_partition);
        if (new_qs.size > 0) {
            new_qs.forEach(function (q){
                horizon.push(...quadrant_2_edges.get(q).toArray());
                current_partition.add(q);
            });
        }
    }
    return current_partition.asImmutable();
}

function range(x: number){
    let arr: number[] = [];
    for (let i = 0; i < x; i++){
         arr.push(i);
    } 
    return arr;
}

function get_partitions(cut_edges: List<Edge>){
    let partitions = List<Partition>().asMutable();
    let quadrants = Set<number>(range(24)).asMutable();
    while (quadrants.size > 0){
        let q = quadrants.first(); quadrants.remove(q);
        let partition = get_quadrant_partition(q, cut_edges);
        partitions.push(partition);
        quadrants.subtract(partition);
    }
    return partitions.asImmutable();
}

export class FaceMesh {
    readonly vertices: Matrix2;
    readonly quadrants: Matrix2;

    constructor(vertices, quadrants){
        this.vertices = vertices;
        this.quadrants = quadrants;
    }

    rotate(degrees) {
        return new FaceMesh(this.vertices.rotate(degrees), this.quadrants.rotate(degrees));
    }
}

interface BoxMeshParams {
    dimensions?: [number, number, number],
    face_meshes?: Map<Face, FaceMesh>,
    cut_edges?: List<Edge>
}

export class BoxMesh{
    readonly dimensions: [number, number, number];
    readonly face_meshes: Map<Face, FaceMesh>;
    readonly cut_edges: List<Edge>;

    constructor({dimensions, face_meshes, cut_edges}: BoxMeshParams){
        this.dimensions = dimensions;
        
        if (face_meshes === undefined) {
            face_meshes = Map<Face, FaceMesh>();
            for (let f of faces){
                face_meshes = face_meshes.set(f,
                    new FaceMesh(face_vertices.get(f), face_quadrants.get(f)));
            }
        }
        this.face_meshes = face_meshes;

        if (cut_edges === undefined){
            cut_edges = List<Edge>();
        }
        this.cut_edges = cut_edges;
    }

    update({dimensions, face_meshes, cut_edges}: BoxMeshParams){
        if (dimensions === undefined){
            dimensions = this.dimensions;
        }

        if (face_meshes === undefined){
            face_meshes = this.face_meshes;
        }

        if (cut_edges === undefined){
            cut_edges = this.cut_edges;
        }
        return new BoxMesh({dimensions, face_meshes, cut_edges});
    }

    cut(face: Face, start: Point2, end: Point2){
        return this.cut_or_tape(EdgeOperation.cut, face, start, end);
    }

    tape(face: Face, start: Point2, end: Point2){
        return this.cut_or_tape(EdgeOperation.tape, face, start, end);
    }

    cut_or_tape(operation: EdgeOperation, face: Face, start: Point2, end: Point2): BoxMesh {
        let [x1, y1] = start;
        let [x2, y2] = end;

        if (Math.abs(x2 - x1) + Math.abs(y2 - y1) != 1){
            throw `start and end points of cut/tape are not adjacent: ${start} and ${end}`;
        }

        let f = this.face_meshes.get(face).vertices;
        let fs = f.get(x1, y1);
        let fe = f.get(x2, y2);

        let new_edge = new Edge(fs, fe);

        let new_cut_edges = this.cut_edges;
        if (operation == EdgeOperation.cut && !new_cut_edges.contains(new_edge)) {
            new_cut_edges = new_cut_edges.push(new_edge);
        }

        if (operation == EdgeOperation.tape && new_cut_edges.contains(new_edge)) {
            new_cut_edges = new_cut_edges.remove(new_cut_edges.indexOf(new_edge));
        }

        return this.update({cut_edges: new_cut_edges});
    }

    get_rends() {
        return get_partitions(this.cut_edges);
    }

    get_free_rends() {
        return this.get_rends().filter(x => !this.is_partition_fixed(x));
    }

    is_partition_fixed(partition: Set<number>) {
        let face_membership = this.get_partition_face_membership(partition);
        return face_membership.get(Face.b) > 0;
    }

    get_partition_face_membership(partition) {
        let face_membership = Map<Face, number>().asMutable();
        for (let f of faces) {
            let total = 0;
            let quadrants = this.face_meshes.get(f).quadrants;
            partition.forEach(function (q) {
                if (quadrants.contains(q)){
                    total += 1;
                }
            });
            face_membership.set(f, total);
        }
        return face_membership.asImmutable();
    }

    get_quadrant_face(quadrant: number){
        for (let f of faces){
            if (this.face_meshes.get(f).quadrants.contains(quadrant)) {
                return f;
            }
        }
    }

    get_dangles() {
        let rends = this.get_rends();
        let fixed_rends = rends.filter(x => this.is_partition_fixed(x));

        let dangles = List<Dangle>().asMutable();
        let inner_this = this;

        this.get_box_edges().forEach(function ([e1, e2]) {
            let e_2_q_2_f = Map<Edge, Map<number, Face>>().asMutable();
            for (let e of [e1, e2]){ //initialize e_2_q_2_f
                let inner_map = Map<number, Face>().asMutable();
                edge_2_quadrants.get(e).forEach(function (q) {
                    inner_map.set(q, inner_this.get_quadrant_face(q));
                });
                 inner_map = inner_map.asImmutable()
                e_2_q_2_f.set(e, inner_map);
            }
            e_2_q_2_f = e_2_q_2_f.asImmutable();

            let edge_dangles = List<Dangle>().asMutable();

            for (let es of [[e1, e2], [e1], [e2]]) {
                let new_cut_edges = inner_this.cut_edges.push(...es);
                let new_partitions = get_partitions(new_cut_edges);

                if (new_partitions.size != rends.size) {

                    new_partitions.forEach(function (np) {
                        if (rends.contains(np)){
                            return;
                        }

                        if (inner_this.is_partition_fixed(np)) {
                            return;
                        }

                        let any_intersections = false;
                        fixed_rends.forEach(function (fixed_rend) {
                            if (np.intersect(fixed_rend).size > 0){
                                any_intersections = true;
                            }
                        });
                        if (!any_intersections) {
                            return;
                        }

                        let any_dangle_matches = false;
                        edge_dangles.forEach(function (ed) {
                            if (is(np, ed.partition)){
                                any_dangle_matches = true;
                                return;
                            }
                        });
                        if (any_dangle_matches){
                            return;
                        }

                        let q_2_fs = List<Map<number, Face>>().asMutable();
                        for (let e of es) {
                            q_2_fs.push(e_2_q_2_f.get(e));
                        }
                        q_2_fs = q_2_fs.asImmutable();

                        let fixed_fs = List<Face>().asMutable();
                        let dangle_fs = List<Face>().asMutable();

                        q_2_fs.forEach(function (q_2_f) {
                            q_2_f.entrySeq().forEach(function ([q, f]) {
                                if (np.contains(q)) {
                                    dangle_fs = dangle_fs.push(f);
                                } else {
                                    fixed_fs = fixed_fs.push(f);
                                }
                            });
                        });
                        fixed_fs = fixed_fs.asImmutable();
                        dangle_fs = dangle_fs.asImmutable();

                        if (fixed_fs.toSet().size != 1 || dangle_fs.toSet().size != 1) {
                            return;
                        }

                        edge_dangles.push(new Dangle(
                            np, es, fixed_fs.get(0), dangle_fs.get(0)));
                    });
                }
            }
            edge_dangles = edge_dangles.asImmutable();
            dangles.push(...edge_dangles.toArray());
        });
        dangles = List<Dangle>(dangles.sortBy(x => x.partition.size));

        let final_dangles = List<Dangle>().asMutable();

        for (let i = 0; i < dangles.size; i++) {
            let p = dangles.get(i).partition;

            let any_supersets = false;
            dangles.skip(i+1).forEach(function (d) {
                if (p.isSubset(d.partition)) {
                    any_supersets = true;
                }
            })
            if (!any_supersets) {
                final_dangles.push(dangles.get(i));
            }
        }
        final_dangles = final_dangles.asImmutable();

        return final_dangles;
    }

    get_box_edges() {
        let edges = List<[Edge, Edge]>();

        let t_b_edge_coords: [number, number][][] = [
            [[0,0], [0,1], [0,2]],
            [[0,0], [1,0], [2,0]],
            [[2,0], [2,1], [2,2]],
            [[0,2], [1,2], [2,2]]
        ];

        for (let f of [Face.t, Face.b]) {
            let m = this.face_meshes.get(f).vertices;

            for (let [[p1x, p1y], [p2x, p2y], [p3x, p3y]] of t_b_edge_coords) {
                let v1 = m.get(p1x, p1y);
                let v2 = m.get(p2x, p2y);
                let v3 = m.get(p3x, p3y);

                let e1 = new Edge(v1, v2);

                let e2 = new Edge(v2, v3);

                edges = edges.push([e1, e2]);
            }
        }

        for (let f of [Face.n, Face.e, Face.s, Face.w]) {
            let m = this.face_meshes.get(f).vertices;

            let v1 = m.get(0,0);
            let v2 = m.get(0,1);
            let v3 = m.get(0,2);

            let e1 = new Edge(v1, v2);

            let e2 = new Edge(v2, v3);

            edges = edges.push([e1, e2]);

        }
        return edges;
    }    

    rotate_y(degrees) {
        //validate degrees somehow

        if (degrees == 0 || degrees == 360) {
            return this;
        }

        let new_faces = rotate_y_faces(this.face_meshes, degrees);
    
        if (degrees = 180) {
            return this.update({face_meshes: new_faces});
        } else {
            let [x, y, z] = this.dimensions;
            return this.update({dimensions: [z, y, x], face_meshes: new_faces});
        }
    }

    roll(direction: Direction){
        let [x, y, z] = this.dimensions;
        let new_x, new_y, new_z;
        if (direction == Direction.n || direction == Direction.s) {
            [new_x, new_y, new_z] = [x, y, z];
        } else {
            [new_x, new_y, new_z] = [y, x, z];
        }

        let new_faces = roll_faces(this.face_meshes, direction);

        return this.update({dimensions: [new_x, new_y, new_z], face_meshes: new_faces});
    }

    description(){
        let face_descr = Map<Face, string>([
            [Face.t, 'top'],
            [Face.b, 'bottom'],
            [Face.n, 'back'],
            [Face.e, 'right'],
            [Face.s, 'front'],
            [Face.w, 'left']
        ]);

        let [x, y, z] = this.dimensions;

        let result = `The box's dimensions measure ${x} by ${y} by ${z}`;

        let rends = this.get_free_rends();
        let inner_this = this;

        rends.forEach(function (fr) {
            let face_membership = inner_this.get_partition_face_membership(fr);
            let faces_present: Face[] =[];
            for (let f of faces){
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }

            let faces_text: string;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length-1])} faces`;
            }

            result += `\nA portion of the box's ${faces_text} has been rended free; it lies on the floor off to the side.`;
        });

        let dangles = this.get_dangles();

        dangles.forEach(function (d) {
            let face_membership = inner_this.get_partition_face_membership(d.partition);
            let faces_present: Face[] = [];
            for (let f of faces){
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }

            let faces_text: string;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length-1])} faces`;
            }

            result += `\nA portion of the box's ${faces_text} sits on a free hinge; from the ${face_descr.get(d.free_face)} face it can be swung to the ${face_descr.get(d.fixed_face)}.`;
        });

        return result;
    }
}

function rotate_y_faces(fs: Map<Face, FaceMesh>, degrees) {
    if (degrees == 0 || degrees == 360) {
        return fs;
    }

    let shift = degrees / 90;
    let face_cycle = [Face.n, Face.w, Face.s, Face.e, Face.n, Face.w, Face.s, Face.e];

    let new_faces = Map<Face, FaceMesh>();

    for (let f of [Face.n, Face.e, Face.s, Face.w]){
        let ind = face_cycle.indexOf(f);
        new_faces = new_faces.set(f, fs.get(face_cycle[ind + shift]));
    }

    for (let f of [Face.t, Face.b]){
        new_faces = new_faces.set(f, fs.get(f).rotate(degrees));
    }

    return new_faces;
}

function roll_faces(fs: Map<Face, FaceMesh>, direction: Direction){
    let new_faces = Map<Face, FaceMesh>().asMutable();

    if (direction == Direction.n) {
        new_faces.set(
            Face.n, fs.get(Face.t).rotate(180)).set(
            Face.t, fs.get(Face.s)).set(
            Face.s, fs.get(Face.b)).set(
            Face.b, fs.get(Face.n).rotate(180)).set(
            Face.e, fs.get(Face.e).rotate(90)).set(
            Face.w, fs.get(Face.w).rotate(270));
    } else if (direction == Direction.s) {
        new_faces.set(
            Face.s, fs.get(Face.t)).set(
            Face.t, fs.get(Face.n).rotate(180)).set(
            Face.n, fs.get(Face.b)).set(
            Face.b, fs.get(Face.s).rotate(180)).set(
            Face.e, fs.get(Face.e).rotate(270)).set(
            Face.w, fs.get(Face.w).rotate(90));
    } else if (direction == Direction.e) {
        new_faces.set(
            Face.e, fs.get(Face.t).rotate(90)).set(
            Face.t, fs.get(Face.w).rotate(90)).set(
            Face.w, fs.get(Face.b).rotate(270)).set(
            Face.b, fs.get(Face.e).rotate(270)).set(
            Face.n, fs.get(Face.n).rotate(270)).set(
            Face.s, fs.get(Face.s).rotate(90));
    } else if (direction == Direction.w) {
        new_faces.set(
            Face.w, fs.get(Face.t).rotate(270)).set(
            Face.t, fs.get(Face.e).rotate(270)).set(
            Face.e, fs.get(Face.b).rotate(90)).set(
            Face.b, fs.get(Face.w).rotate(90)).set(
            Face.n, fs.get(Face.n).rotate(90)).set(
            Face.s, fs.get(Face.s).rotate(270));
    }

    return new_faces.asImmutable();
}


export function test(){
    let bm = new BoxMesh({dimensions: [2,3,4]});

    let bm2 = bm.cut(Face.t, [0,0], [1,0]).cut(Face.t, [1,0], [1,1]).cut(Face.t, [1,1], [0,1]).cut(Face.t, [0,1], [0,0]);
    let bm3 = bm2.cut(Face.t, [0,1], [0,2]).cut(Face.s, [0, 0], [0, 1]).cut(Face.s, [0,1], [1,1]).cut(Face.s, [1,1], [1,0]).cut(Face.t, [1, 2], [1,1])

    let bm4 = bm.cut(Face.t, [0,0], [1,0]).roll(Direction.s).cut(Face.t, [0,2], [0,1]).cut(Face.t, [0,1], [1,1]).cut(Face.t, [1,1], [1,2]);

    let bm5 = bm.cut(Face.n, [0,0], [1,0]).cut(Face.n, [1,0], [2,0]).cut(Face.n, [2,0], [2,1]).cut(Face.n, [2,1], [1,1]).cut(Face.n, [1,1], [0,1]).cut(Face.n, [1,1], [1, 0]).cut(Face.n, [0,1], [0,0]);

    let bm6 = bm.cut(Face.t, [0,0], [0,1]).cut(Face.t, [0,1], [1,1]).cut(Face.t, [1,1], [1,0]);
    let bm7 = bm2.cut(Face.t, [0,1], [0,2]).cut(Face.t, [1,1], [1,2]);

    let bm8 = (bm.cut(Face.t, [0,0], [1,0]).cut(Face.t, [1,0], [2,0]).cut(Face.t, [2,0], [2,1]).cut(Face.t, [2,1], [2,2])
             .cut(Face.t, [0,2], [0,1]).cut(Face.t, [0,1], [1,1]).cut(Face.t, [1,1], [1,2])
             .cut(Face.s, [1,0], [1,1]).cut(Face.s, [1,1], [0,1])
             .cut(Face.w, [0,0], [0,1]).cut(Face.w, [0,1], [1,1]).cut(Face.w, [1,1], [2,1]));

    let bms: BoxMesh[] = [bm, bm2, bm3, bm4, bm5, bm6, bm7, bm8];
    for (let i = 0; i < bms.length; i++) {
        let b = bms[i];

        console.log('Box #', i+1);
        console.log();
        console.log(b.description());
        console.log();
        console.log();
    }
}

test();