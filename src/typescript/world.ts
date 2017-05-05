import {BoxMesh, edge_2_quadrants, FaceMesh} from './box_geometry';

import {
    CardboardEdge,
    CommandError,
    Counter,
    counter_update,
    Dangle,
    Direction,
    directions,
    Edge,
    EdgeOperation,
    EdgeState,
    Face,
    Item,
    Partition,
    Point2,
    RendOperation,
    RendState,
    RollDirection,
    RotateYDirection,
    SpillageLevel,
    TapeEdge,
    Weight,
    WorldUpdateError
} from './datatypes';

import {WorldUpdateEffects, with_world_update, world_update} from './world_update_effects';

import {CityKey, Codex, Pinecone} from './items';

import {capitalize, uncapitalize} from './text_tools';

import {List, Map, Set} from 'immutable';

interface BoxParams {
    box_mesh?: BoxMesh,
    rend_state?: Map<Partition, RendState>,
    dangle_state?: Map<Dangle, RendState>,
    edge_state?: Map<Edge, EdgeState>,
    contents?: List<Item>
}

class Box {
    readonly box_mesh: BoxMesh;
    readonly rend_state: Map<Partition, RendState>;
    readonly dangle_state: Map<Dangle, RendState>;
    readonly edge_state: Map<Edge, EdgeState>;
    readonly contents: List<Item>;

    constructor({box_mesh, rend_state, dangle_state, edge_state, contents}: BoxParams){
        if (box_mesh === undefined) {
            box_mesh = new BoxMesh([2, 2, 2]);
        }
        this.box_mesh = box_mesh;

        if (rend_state === undefined) {
            rend_state = this.default_rend_state(this.box_mesh);
        }
        this.rend_state = rend_state;

        if (dangle_state === undefined) {
            dangle_state = this.default_dangle_state(this.box_mesh);
        }
        this.dangle_state = dangle_state;

        if (edge_state === undefined) {
            edge_state = Map<Edge, EdgeState>();
        }
        this.edge_state = edge_state;

        if (contents === undefined) {
            contents = List<Item>();
        }
        this.contents = contents;
    }

    update({box_mesh, rend_state, dangle_state, edge_state, contents}: BoxParams){
        if (box_mesh === undefined) {
            box_mesh = this.box_mesh;
        }

        if (rend_state === undefined) {
            rend_state = this.rend_state;
        }

        if (dangle_state === undefined) {
            dangle_state = this.dangle_state;
        }

        if (edge_state === undefined) {
            edge_state = this.edge_state;
        }
        
        if (contents === undefined) {
            contents = this.contents;
        }

        return new Box({box_mesh, rend_state, dangle_state, edge_state, contents});
    }

    default_rend_state(box_mesh: BoxMesh) {
        let rends = box_mesh.get_free_rends();
        let result = Map<Partition, RendState>().asMutable();
        rends.forEach(function (r) {
            result.set(r, RendState.closed);
        });
        return result.asImmutable();
    }

    default_dangle_state(box_mesh: BoxMesh) {
        let dangles = box_mesh.get_dangles();
        let result = Map<Dangle, RendState>().asMutable();
        dangles.forEach(function (d) {
            result.set(d, RendState.closed);
        });
        return result.asImmutable();
    }

    open_or_close_rend(operation: RendOperation, rend: Partition) {
        let box_rends = this.box_mesh.get_rends();

        if (!box_rends.contains(rend)){
            throw new CommandError('rend does not exist on the box');
        }

        if (this.box_mesh.is_partition_fixed(rend)) {
            throw new WorldUpdateError('cannot open or close a fixed rend');
        }

        let new_rend_state = this.rend_state;
        let intended_new_state = operation == RendOperation.close ? RendState.closed : RendState.open;
        if (intended_new_state == new_rend_state.get(rend)) {
            throw new WorldUpdateError(`cannot ${operation} a rend that is already ${intended_new_state}`);
        }

        new_rend_state = new_rend_state.set(rend, intended_new_state);

        let new_box = this.update({rend_state: new_rend_state});

        if (new_box.is_collapsed()) {
            let effects = world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items = effects.collapse_spilled_items.push(...new_box.contents.toArray());
            let new_contents = List<Item>();
            new_box = new_box.update({contents: new_contents});
        }

        return new_box;
    }

    open_or_close_dangle(operation: RendOperation, dangle: Dangle) {
        if (this.box_mesh.is_partition_fixed(dangle.partition)) {
            throw new WorldUpdateError('cannot open or close a fixed dangle');
        }

        let box_dangles = this.box_mesh.get_dangles();

        if (box_dangles.some((d) => dangle == d)){
            throw new CommandError('dangle does not exist on the box');
        }

        let intended_new_state = operation == RendOperation.close ? RendState.closed : RendState.open;
        if (this.dangle_state.get(dangle) == intended_new_state) {
            throw new WorldUpdateError('cannot ${operation} a dangle that is already ${intended_new_state}');
        }

        let new_dangle_state = this.dangle_state.set(dangle, intended_new_state);

        let new_box = this.update({dangle_state: new_dangle_state});
        if (new_box.is_collapsed()) {
            let effects = world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items = effects.collapse_spilled_items.push(...new_box.contents.toArray());
            let new_contents = List<Item>();
            new_box = new_box.update({contents: new_contents});
        }
        return new_box;
    }

    rotate_y(degrees) {
        let new_box_mesh = this.box_mesh.rotate_y(degrees);
        return this.update(new_box_mesh);
    }

    roll(direction: Direction) {
        if (this.dangle_state.some((state) => state == RendState.open)) {
            throw new WorldUpdateError('cannot roll a box with open dangles');
        }

        let new_box_mesh = this.box_mesh.roll(direction);
        let dir_face = Face[Direction[direction]];

        let new_contents = this.contents;
        let rend_state_updates = this.rend_state;
        let dangle_state_updates = this.dangle_state;

        let inner_this = this;
        let effects = world_update.effects;

        if (new_contents.size > 0){
            let dir_2_opposite = Map<Face, Face>([
                [Face.n, Face.s],
                [Face.s, Face.n],
                [Face.e, Face.w],
                [Face.w, Face.e]]);
 
            let heavy_spill_faces: [Face, Face][] = [
                [Face[Direction[direction]], Face.b],
                [Face.t, dir_face],
                [Face.b, dir_2_opposite.get(dir_face)]];
            let light_spill_faces = ([Face.n, Face.s, Face.e, Face.w]
                .filter((d) => d !== dir_face && d !== dir_2_opposite.get(dir_face))
            );
                
            this.rend_state.forEach(function (state, r) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                        
                for (let [test_face, spill_face] of heavy_spill_faces) {
                    if (face_membership.get(test_face) > 0) {
                        effects.spill_faces = effects.spill_faces.push(spill_face);
                        effects.spillage_level = SpillageLevel.heavy;
                        effects.spilled_items = effects.spilled_items.push(...new_contents.toArray());
                        new_contents = List<Item>();

                        if (state == RendState.closed) {
                            effects.spilled_rends == effects.spilled_rends.add(r);
                            rend_state_updates = rend_state_updates.set(r, RendState.open);
                        }

                    }
                }

                for (let spill_face of light_spill_faces) {
                    if (face_membership.get(spill_face) > 0) {
                        effects.spill_faces = effects.spill_faces.push(spill_face);
                        if (effects.spillage_level < SpillageLevel.light) {
                            effects.spillage_level = SpillageLevel.light;
                        }
                        if (new_contents.size > 0) {
                            effects.spilled_items = effects.spilled_items.push(new_contents.first());
                            new_contents = new_contents.rest();
                        }
                    }
                }
            });

            this.box_mesh.get_dangles().forEach(function (d) {
                let spillage_level = SpillageLevel.none;
                let spill_face: Face;
                if (d.free_face == Face.t) {
                    spillage_level = SpillageLevel.heavy;
                    spill_face = Face[Direction[direction]];
                } else if (d.free_face == dir_face) {
                    spillage_level = SpillageLevel.heavy;
                    spill_face = Face.b;
                } else if (light_spill_faces.indexOf(d.free_face) !== -1) {
                    spillage_level = SpillageLevel.light;
                    spill_face = d.free_face;
                }

                if (spillage_level !== SpillageLevel.none) {
                    if (spillage_level > effects.spillage_level) {
                        effects.spillage_level = spillage_level;
                    }
                    effects.spill_faces = effects.spill_faces.push(spill_face);

                    if (spillage_level == SpillageLevel.light) {
                        if (new_contents.size > 0) {
                            effects.spilled_items = effects.spilled_items.push(new_contents.first());
                            new_contents = new_contents.rest();
                        }
                    } else if (spillage_level == SpillageLevel.heavy) {
                        effects.spilled_items = effects.spilled_items.push(...new_contents.toArray());
                        new_contents = List<Item>();
                    }

                    effects.spilled_dangles = effects.spilled_dangles.add(d);
                    dangle_state_updates = dangle_state_updates.set(d, RendState.open);
                }
            });
            
            new_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == dir_2_opposite.get(dir_face)) {
                    effects.spillage_level = SpillageLevel.heavy;
                    effects.spill_faces = effects.spill_faces.push(dir_2_opposite.get(dir_face));

                    effects.spilled_items = effects.spilled_items.push(...new_contents.toArray());
                    new_contents = List<Item>();

                    effects.spilled_dangles = effects.spilled_dangles.add(d);
                    dangle_state_updates = dangle_state_updates.set(d, RendState.open);
                }
            });
        }
        let new_box = this.update({
            box_mesh: new_box_mesh,
            rend_state: rend_state_updates,
            dangle_state: dangle_state_updates,
            contents: new_contents
        });

        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items = effects.collapse_spilled_items.push(...new_contents.toArray());
            new_contents = List<Item>();
            new_box = new_box.update({contents: new_contents});
        }

        return new_box;
    }

    lift() {
        let effects = world_update.effects;
        let inner_this = this;

        let new_contents = this.contents;
        let new_rend_state = this.rend_state;
        let new_dangle_state = this.dangle_state;

        if (new_contents.size > 0) {
            let test_box_mesh = this.box_mesh.roll(Direction.s).roll(Direction.s);

            test_box_mesh.get_free_rends().forEach(function (r) {
                let face_membership = test_box_mesh.get_partition_face_membership(r);
                let test_faces = [Face.b, Face.n, Face.s, Face.e, Face.w];
                let count = test_faces.map(face_membership.get).reduce((x, y) => x + y);
                if (face_membership.get(Face.t) > count) {
                    effects.spillage_level = SpillageLevel.heavy;
                    effects.spill_faces = effects.spill_faces.push(Face.b);

                    effects.spilled_items = effects.spilled_items.push(...new_contents.toArray());
                    new_contents = List<Item>();

                    if (new_rend_state.get(r, RendState.closed) == RendState.closed) {
                        effects.spilled_rends = effects.spilled_rends.add(r);
                        new_rend_state = new_rend_state.set(r, RendState.open);
                    }
                }
            });

            test_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == Face.t) {
                    effects.spillage_level = SpillageLevel.heavy;
                    effects.spill_faces = effects.spill_faces.push(Face.b);

                    effects.spilled_items = effects.spilled_items.push(...new_contents.toArray());
                    new_contents = List<Item>();

                    effects.spilled_dangles = effects.spilled_dangles.add(d);
                    new_dangle_state = new_dangle_state.set(d, RendState.open);
                }
            });

            this.rend_state.forEach(function (state, r) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                let light_spill_faces = [Face.n, Face.s, Face.e, Face.w].filter((f) => face_membership.get(f) > 0);
                if (light_spill_faces.length > 0) {
                    if (effects.spillage_level < SpillageLevel.light) {
                        effects.spillage_level = SpillageLevel.light;
                    }
                    effects.spill_faces.push(...light_spill_faces);

                    if (new_contents.size > 0) {
                        effects.spilled_items = effects.spilled_items.push(new_contents.first());
                        new_contents = new_contents.rest();
                    }
                    if (state == RendState.closed) {
                        effects.spilled_rends.add(r);
                        new_rend_state = new_rend_state.set(r, RendState.open);
                    }
                }
            });

            this.dangle_state.forEach(function (state, d) {
                if ([Face.n, Face.s, Face.e, Face.w].indexOf(d.free_face) !== -1) {
                    if (effects.spillage_level < SpillageLevel.light) {
                        effects.spillage_level = SpillageLevel.light;
                    }
                    effects.spill_faces.push(d.free_face);

                    if (new_contents.size > 0) {
                        effects.spilled_items = effects.spilled_items.push(new_contents.first());
                        new_contents = new_contents.rest();
                    }
                }
            });
        }

        let new_box = this.update({rend_state: new_rend_state, dangle_state: new_dangle_state, contents: new_contents});

        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items = effects.collapse_spilled_items.push(...new_contents.toArray());
            new_contents = List<Item>();
            new_box = new_box.update({contents: new_contents});
        }

        return new_box;
    }

    cut(face: Face, start, end) {
        return this.cut_or_tape(EdgeOperation.cut, face, start, end);
    }

    tape(face, start, end) {
        return this.cut_or_tape(EdgeOperation.tape, face, start, end);
    }

    cut_or_tape(operation: EdgeOperation, face: Face, start: Point2, end: Point2) {
        let effects = world_update.effects;
        let inner_this = this;

        if (face !== Face.s && face !== Face.t) {
            throw new WorldUpdateError('cannot cut or tape sides other than top or front');
        }

        let [x1, y1] = start;
        let [x2, y2] = end;
        let v1 = this.box_mesh.face_meshes.get(face).vertices.get(x1, y1);
        let v2 = this.box_mesh.face_meshes.get(face).vertices.get(x2, y2);

        let edge = new Edge(v1, v2);

        let quadrants = edge_2_quadrants.get(edge);

        this.rend_state.forEach(function (state, r) {
            if (state == RendState.open && quadrants.every(r.contains)) {
                throw new WorldUpdateError('cannot cut or tape on an open rend');
            }
        });

        this.dangle_state.forEach(function (state, d) {
            if (state == RendState.open && quadrants.every(d.partition.contains)) {
                throw new WorldUpdateError('cannot cut or tape on an open dangle');
            }
        });

        let new_box_mesh: BoxMesh;
        if (operation == EdgeOperation.cut) {
            new_box_mesh = this.box_mesh.cut(face, start, end);
        } else {
            new_box_mesh = this.box_mesh.tape(face, start, end);
        }

        let new_rend_state = this.default_rend_state(new_box_mesh);
        this.rend_state.forEach(function (state, r) {
            if (new_rend_state.has(r)) {
                new_rend_state = new_rend_state.set(r, state);
            } else {
                effects.repaired_rends = effects.repaired_rends.push(r);
            }
        });

        new_rend_state.forEach(function (state, new_r) {
            if (!inner_this.rend_state.has(new_r)) {
                effects.new_rends = effects.new_rends.push(new_r);
            }
        });

        let new_dangle_state = this.default_dangle_state(new_box_mesh);
        this.dangle_state.forEach(function (state, d) {
            if (new_dangle_state.has(d)) {
                new_dangle_state = new_dangle_state.set(d, state);
            } else {
                effects.repaired_dangles = effects.repaired_dangles.push(d);
            }
        });

        new_dangle_state.forEach(function (state, new_d) {
            if (!inner_this.dangle_state.has(new_d)) {
                effects.new_dangles = effects.new_dangles.push(new_d);
            }
        });

        let new_edge_state = this.edge_state;
        if (operation == EdgeOperation.cut) {
            new_edge_state = new_edge_state.set(edge, new_edge_state.get(edge).cut());
        } else {
            new_edge_state = new_edge_state.set(edge, new_edge_state.get(edge).apply_tape());
        }

        return this.update({box_mesh: new_box_mesh, rend_state: new_rend_state, dangle_state: new_dangle_state});
    }

    take_next_item() {
        let effects = world_update.effects;

        if (this.contents.size == 0) {
            throw new WorldUpdateError('cannot take an item from an empty box');
        }

        if (!self.appears_open()) {
            throw new WorldUpdateError('cannot take an item from a box with no visible openings');
        }

        let new_contents = this.contents;
        effects.taken_items = effects.taken_items.push(new_contents.first());
        new_contents = new_contents.rest();

        return this.update({contents: new_contents});
    }

    next_item() {
        if (this.contents.size == 0) {
            return null;
        }
        return this.contents.first();
    }

    appears_open() {
        if (this.rend_state.some((state) => state == RendState.open)) {
            return true;
        }
        if (this.dangle_state.some((state) => state == RendState.open)) {
            return true;
        }
        return false;
    }

    appears_empty() {
        return this.appears_open() && this.contents.size == 0;
    }

    is_collapsed(){
        let open_faces = Map<Face, number>().asMutable();
        let inner_this = this;
        
        this.rend_state.forEach(function (state, r) {
            if (state == RendState.open){
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                counter_update(open_faces, face_membership);
            }
        });

        this.dangle_state.forEach(function (state, d) {
            if (state == RendState.open){
                let face_membership = inner_this.box_mesh.get_partition_face_membership(d.partition);
                counter_update(open_faces, face_membership);
            }
        });

        let total_open_sides = 0;
        open_faces.forEach(function (count, face) {
            if (count > 0) {
                total_open_sides += 1;
            }
        });

        return total_open_sides >= 3;
    }
}

interface SingleBoxWorldParams {
    box?: Box,
    taken_items?: List<Item>,
    spilled_items?: List<Item>
}

class SingleBoxWorld {
    readonly box: Box;
    readonly taken_items: List<Item>;
    readonly spilled_items: List<Item>;

    constructor({box, taken_items, spilled_items}: SingleBoxWorldParams) {
        if (box === undefined) {
            box = new Box({});
        }
        this.box = box;

        if (taken_items === undefined) {
            taken_items = List<Item>();
        }
        this.taken_items = taken_items;

        if (spilled_items === undefined) {
            spilled_items = List<Item>();
        }
        this.spilled_items = spilled_items;
    }

    update({box, taken_items, spilled_items}: SingleBoxWorldParams) {
        if (box === undefined) {
            box = this.box;
        }

        if (taken_items === undefined) {
            taken_items = this.taken_items;
        }

        if (spilled_items === undefined) {
            spilled_items = this.spilled_items;
        }

        return new SingleBoxWorld({box, taken_items, spilled_items});
    }

    command_rotate_y_box(dir: RotateYDirection): [SingleBoxWorld, string] {
        let degrees = dir == 'right' ? 90 : 270;
        let new_box = this.box.rotate_y(degrees);
        let new_world = this.update({box: new_box});

        let message = `You turn the box 90 degrees to the ${dir}`;

        return [new_world, message];
    }

    command_roll_box(cmd: RollDirection): [SingleBoxWorld, string] {
        let inner_this = this;
        return with_world_update(function (effects) {
            let cmd_2_direction = Map<RollDirection, Direction>([
                ['forward', Direction.n],
                ['backward', Direction.s],
                ['left', Direction.w],
                ['right', Direction.e]
            ]);

            let direction = cmd_2_direction.get(cmd);
            let new_box = inner_this.box.roll(direction);

            let dir_msg = (cmd == 'left' || cmd == 'right') ? `over to the ${cmd}` : cmd;

            let message: string;
            let new_world: SingleBoxWorld;
            if (effects.spillage_level == SpillageLevel.none) {
                message = `You roll the box ${dir_msg}`;
                new_world = inner_this.update({box: new_box});
            } else {
                let spill_msg = uncapitalize(inner_this.spill_message(new_box));
                message = `As you roll the box ${dir_msg}, ${spill_msg}`;

                new_world = inner_this.update({box: new_box, spilled_items: effects.spilled_items});
            }

            if (effects.box_collapsed) {
                message += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.size > 0) {
                    message += ' ';
                    message += inner_this.item_spill_message(effects.collapse_spilled_items);
                }
            }

            return [new_world, message];
        });
    }

    item_spill_message(spilled_items: List<Item>){
        let si = spilled_items;
        let during_spill_msg: string;
        let after_spill_msg: string;

        if (si.size == 1) {
            let item_msg = si.get(0).pre_gestalt();
            during_spill_msg = `${capitalize(item_msg)} spills out before you.`;
            after_spill_msg = `It's ${si.get(0).article()} ${si.get(0).name()} - ${si.get(0).post_gestalt()}.`;
        } else {

        }
    }
}
