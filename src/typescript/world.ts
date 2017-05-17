import {BoxMesh, edge_2_quadrants, FaceMesh} from './box_geometry';

import {
    CardboardEdge,
    CommandError,
    Counter,
    counter_order,
    counter_update,
    Dangle,
    Direction,
    directions,
    direction_2_face,
    Edge,
    EdgeDirection,
    EdgeOperation,
    EdgeState,
    Face,
    Item,
    Partition,
    Point2,
    RelativePosition,
    RendOperation,
    RendState,
    SpillageLevel,
    TapeEdge,
    Weight,
    WorldUpdateError
} from './datatypes';

import {
    EdgeDirWord,
    EdgeOpWord,
    FaceWord,
    PositionWord,
    RendOpWord,
    RollDirWord,
    RotateYDirWord,
    Token,
    word_2_degrees,
    word_2_dir,
    word_2_edge_dir,
    word_2_edge_op,
    word_2_face,
    word_2_relative_position,
    word_2_rend_op
} from './commands'

import {WorldUpdateEffects, with_world_update, world_update} from './world_update_effects';

import {CityKey, Codex, Pinecone} from './items';

import {capitalize, face_message, uncapitalize} from './text_tools';

import {List, Map, Set} from 'immutable';

export interface BoxParams {
    box_mesh?: BoxMesh,
    rend_state?: Map<Partition, RendState>,
    dangle_state?: Map<Dangle, RendState>,
    edge_state?: Map<Edge, EdgeState>,
    contents?: List<Item>
}

export class Box {
    readonly box_mesh: BoxMesh;
    readonly rend_state: Map<Partition, RendState>;
    readonly dangle_state: Map<Dangle, RendState>;
    readonly edge_state: Map<Edge, EdgeState>;
    readonly contents: List<Item>;

    constructor({box_mesh, rend_state, dangle_state, edge_state, contents}: BoxParams){
        if (box_mesh === undefined) {
            box_mesh = new BoxMesh({dimensions: [2, 2, 2]});
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

    rotate_y(degrees: number) {
        let new_box_mesh = this.box_mesh.rotate_y(degrees);
        return this.update(new_box_mesh);
    }

    roll(direction: Direction) {
        if (this.dangle_state.some((state) => state == RendState.open)) {
            throw new WorldUpdateError('cannot roll a box with open dangles');
        }

        let new_box_mesh = this.box_mesh.roll(direction);
        let dir_face: Face = direction_2_face.get(direction);

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
                [dir_face, Face.b],
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
                    spill_face = dir_face;
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

    cut(face: Face, start: Point2, end: Point2) {
        return this.cut_or_tape(EdgeOperation.cut, face, start, end);
    }

    tape(face: Face, start: Point2, end: Point2) {
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
            new_edge_state = new_edge_state.set(edge, new_edge_state.get(edge, new EdgeState()).cut());
        } else {
            new_edge_state = new_edge_state.set(edge, new_edge_state.get(edge, new EdgeState()).apply_tape());
        }

        return this.update({box_mesh: new_box_mesh, rend_state: new_rend_state, dangle_state: new_dangle_state});
    }

    take_next_item() {
        let effects = world_update.effects;

        if (this.contents.size == 0) {
            throw new WorldUpdateError('cannot take an item from an empty box');
        }

        if (!this.appears_open()) {
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

export interface SingleBoxWorldParams {
    box?: Box,
    taken_items?: List<Item>,
    spilled_items?: List<Item>
}

export type CommandResult = [SingleBoxWorld, string];

export class SingleBoxWorld {
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

    command_rotate_y_box(dir: RotateYDirWord): CommandResult {
        let degrees = dir == 'right' ? 90 : 270;
        let new_box = this.box.rotate_y(degrees);
        let new_world = this.update({box: new_box});

        let message = `You turn the box 90 degrees to the ${dir}`;

        return [new_world, message];
    }

    command_roll_box(cmd: RollDirWord): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let direction = word_2_dir.get(cmd);
            let new_box = inner_this.box.roll(direction);

            let dir_msg = (cmd == 'left' || cmd == 'right') ? `over to the ${cmd}` : cmd;

            let message: string;
            let new_world: SingleBoxWorld;
            if (effects.spillage_level == SpillageLevel.none) {
                message = `You roll the box ${dir_msg}.`;
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

    command_lift_box(): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let new_box = inner_this.box.lift();

            let msg: string;
            let new_world: SingleBoxWorld;
            if (effects.spillage_level == SpillageLevel.none) {
                msg = 'You lift up the box in place.';
                new_world = inner_this.update({box: new_box});
            } else {
                let spill_msg = uncapitalize(inner_this.spill_message(new_box));
                msg = 'As you start to lift up the box, ' + spill_msg;
                new_world = inner_this.update({box: new_box, spilled_items: effects.spilled_items});
            }

            if (effects.spillage_level <= SpillageLevel.heavy && !effects.box_collapsed) {
                let total_weight = new_box.contents.reduce((x, i) => x + i.weight(), 0);
                total_weight = Math.floor(total_weight / 2.9); //rule of thumb for translating "normal item weights" to "normal box weights"

                if (total_weight > Weight.very_heavy) {
                    total_weight = Weight.very_heavy;
                }
                let weight_2_msg = Map<Weight, string>([
                    [Weight.empty, 'so light as to be empty'],
                    [Weight.very_light, 'quite light'],
                    [Weight.light, 'light'],
                    [Weight.medium, 'medium'],
                    [Weight.heavy, 'somewhat heavy'],
                    [Weight.very_heavy, 'very heavy']
                ]);
                let weight_msg = weight_2_msg.get(total_weight);
                let subject = effects.spillage_level == SpillageLevel.none ? 'It' : 'The box';
                msg += `\n${subject} feels ${weight_msg}. You set it back down.`;
            }

            if (effects.box_collapsed) {
                msg += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.size > 0) {
                    msg += ' ' + inner_this.item_spill_message(effects.collapse_spilled_items);
                }
            }

            return [new_world, msg];
        });
    }

    cut_or_tape_box(operation: EdgeOpWord, face_w: FaceWord, dir: EdgeDirWord, start_pos_a: PositionWord, start_pos_b: PositionWord, end_pos_b: PositionWord): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let face = word_2_face.get(face_w);
            if (face !== Face.t && face !== Face.s) {
                throw new CommandError(`face must be either top or front. got ${face}`);
            }

            let dim_2_pos = [
                ['left', 'center', 'right'],
                ['top','middle', 'bottom']
            ];

            let dim_a: number;
            let dim_b: number;

            if (dir == 'vertically') {
                dim_a = 0;
                dim_b = 1
            } else {
                dim_a = 1;
                dim_b = 0;
            }

            if (dim_2_pos[dim_a].indexOf(start_pos_a) == -1) {
                throw new CommandError(`invalid start_pos_a for ${dir} ${operation}: ${start_pos_a}`);
            }
            if (dim_2_pos[dim_b].indexOf(start_pos_b) == -1) {
                throw new CommandError(`invalid start_pos_b for ${dir} ${operation}: ${start_pos_b}`);
            }
            if (dim_2_pos[dim_b].indexOf(end_pos_b) == -1) {
                throw new CommandError(`invalid end_pos_b for ${dir} ${operation}: ${end_pos_b}`);
            }

            let pt1: Point2 = [null, null];
            let pt2: Point2 = [null, null];

            pt1[dim_a] = pt2[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);

            pt1[dim_b] = dim_2_pos[dim_b].indexOf(start_pos_b);
            pt2[dim_b] = dim_2_pos[dim_b].indexOf(end_pos_b);

            if (Math.abs(pt1[dim_b] - pt2[dim_b]) == 0) {
                throw new CommandError('no change between start_pos_b and end_pos_b.');
            }

            let cut_points: [Point2, Point2][];
            if (Math.abs(pt1[dim_b] - pt2[dim_b]) == 2) {
                let pt3: Point2 = [null, null];
                pt3[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);
                pt3[dim_b] = 1;

                cut_points = [[pt1, pt3], [pt3, pt2]];
            } else {
                cut_points = [[pt1, pt2]];
            }

            let cut_edge_states = List<EdgeState>();

            let new_box = inner_this.box;

            cut_points.forEach(function ([p1, p2]) {
                let vertices = new_box.box_mesh.face_meshes.get(face).vertices;
                let v1 = vertices.get(p1[0], p1[1]);
                let v2 = vertices.get(p2[0], p2[1]);
                let edge = new Edge(v1, v2);

                cut_edge_states = cut_edge_states.push(new_box.edge_state.get(edge, new EdgeState()));
                new_box = new_box.cut_or_tape(word_2_edge_op.get(operation), face, p1, p2);
            });

            effects.new_dangles.forEach(function (nd) {
                if (effects.new_rends.contains(nd.partition)) {
                    effects.new_dangles = effects.new_dangles.remove(effects.new_dangles.indexOf(nd));
                }
            });

            effects.repaired_dangles.forEach(function (rd) {
                if (effects.new_rends.contains(rd.partition)) {
                    effects.repaired_dangles = effects.repaired_dangles.remove(effects.repaired_dangles.indexOf(rd));
                }
            });

            let message: string;
            if (operation == 'cut') {
                message = inner_this.cut_message(new_box, cut_edge_states, effects);
            } else {
                message = inner_this.tape_message(new_box, cut_edge_states, effects);
            }

            return [inner_this.update({box: new_box}), message];
        });
    }

    cut_message(new_box: Box, cut_edge_states: List<EdgeState>, effects: WorldUpdateEffects) {
        let cut_message: string;
        if (cut_edge_states.get(0).cardboard == CardboardEdge.intact) {
            cut_message = 'You slide your blade along the cardboard';
            if (cut_edge_states.get(0).tape == TapeEdge.taped) {
                cut_message += ' and tape';
            }
            cut_message += '.';
        } else {
            if (cut_edge_states.get(0).tape == TapeEdge.taped) {
                cut_message = 'You draw your blade easily along the line. It slits open the thin layer of tape covering the gap in the cardboard.';
            } else {
                cut_message = 'You slide your blade along the line, but nothing is there to resist it.';
            }
        }

        if (cut_edge_states.size > 1) {
            if (cut_edge_states.get(1).cardboard != cut_edge_states.get(0).cardboard) {
                if (cut_edge_states.get(1).cardboard == CardboardEdge.intact) {
                    cut_message += ' Halfway across, it catches on solid cardboard, and you pull it along the rest of the way.';
                } else {
                    if (cut_edge_states.get(1).tape == TapeEdge.taped) {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade slides easily along the thin layer of tape.';
                    } else {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade is met with no further resistance.';
                    }
                }
            }
        }

        let message = cut_message;
        if (effects.new_rends.size > 0) {
            let total_face_membership = Map<Face, number>();
            effects.new_rends.forEach(function (r) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(r);
                total_face_membership = counter_update(total_face_membership, face_membership);
            })
            let face_order = counter_order(total_face_membership);
            let face_msg = face_message(face_order);

            let new_rends_message: string;
            if (effects.new_rends.size == 1) {
                new_rends_message = `A new section of cardboard comes free on the ${face_msg}.`;
            } else {
                new_rends_message = `${face_order.size} new sections of cardboard come free on the ${face_msg}`;
            }
            message += '\n' + new_rends_message;
        }

        if (effects.new_dangles.size > 0) {
            let total_face_membership = Map<Face, number>();
            effects.new_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = counter_update(total_face_membership, face_membership);
            })
            let face_order = counter_order(total_face_membership);
            let face_msg = face_message(face_order);

            let new_rends_message: string;
            if (effects.new_dangles.size == 1) {
                new_rends_message = `A new section of cardboard on the ${face_msg} can be swung freely on a hinge.`;
            } else {
                new_rends_message = `${face_order.size} new sections of cardboard on the ${face_msg} can be swung freely on a hinge`;
            }
            message += '\n' + new_rends_message;
        }
        return message;
    }

    tape_message(new_box: Box, cut_edge_states: List<EdgeState>, effects: WorldUpdateEffects) {
        let tape_message: string;
        if (cut_edge_states.some((ces) => ces.cardboard == CardboardEdge.intact)) {
            tape_message = 'You draw out a length of tape and fasten it to the cardboard.';
        } else {
            if (cut_edge_states.some((ces) => ces.tape == TapeEdge.taped)) {
                tape_message = 'You lay another length of tape over the cut edge.';
            } else {
                tape_message = 'You seal the gap in the cardboard with a length of tape.';
            }
        }

        let message = tape_message;
        if (effects.repaired_dangles.size > 0) {
            let total_face_membership = Map<Face, number>();
            effects.repaired_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = counter_update(total_face_membership, face_membership);
            })
            let face_order = counter_order(total_face_membership);
            let face_msg = face_message(face_order);

            let repaired_dangles_message: string;
            if (effects.new_rends.size == 1) {
                repaired_dangles_message = `A formerly freely-swinging section of cardboard on the ${face_msg} can no longer swing on its hinge.`;
            } else {
                repaired_dangles_message = `${face_order.size} formerly freely-swinging sections of cardboard on the ${face_msg} can no longer swing on their hinges.`;
            }
            message += '\n' + repaired_dangles_message;
        }
        return message;
    }

    command_cut_box(face_w: FaceWord, dir: EdgeDirWord, start_pos_a: PositionWord, start_pos_b: PositionWord, end_pos_b: PositionWord): CommandResult {
        return this.cut_or_tape_box('cut', face_w, dir, start_pos_a, start_pos_b, end_pos_b);
    }

    command_tape_box(face_w: FaceWord, dir: EdgeDirWord, start_pos_a: PositionWord, start_pos_b: PositionWord, end_pos_b: PositionWord): CommandResult {
        return this.cut_or_tape_box('tape', face_w, dir, start_pos_a, start_pos_b, end_pos_b);
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
            let item_msg = si.butLast().map((i) => i.pre_gestalt()).join(', ') + ' and ' + si.last().pre_gestalt();
            during_spill_msg = capitalize(`${item_msg} spill out before you.`);

            let after_msgs = si.map((i) => `${i.article()} ${i.name()} - ${i.post_gestalt()}`);
            after_spill_msg = "It's " + after_msgs.butLast().join(', ') + ' and ' + after_msgs.last() + '.';
        }

        let spill_msg = during_spill_msg + ' ' + after_spill_msg;
        return spill_msg;
    }

    spill_message(new_box: Box) {
        let effects = world_update.effects;

        let structural_dmg_msgs = List<string>();

        if (effects.spilled_rends.size > 0) {
            let total_face_membership = Map<Face, number>();
            effects.spilled_rends.forEach(function (sr) {
                let sr_mem = new_box.box_mesh.get_partition_face_membership(sr);
                total_face_membership = counter_update(total_face_membership, sr_mem);
            });
            let sr_faces = counter_order(total_face_membership);
            let f_msg = face_message(sr_faces);
            let spilled_rends_msg = `free cardboard on the ${f_msg} falls away`;
            structural_dmg_msgs = structural_dmg_msgs.push(spilled_rends_msg);
        }

        if (effects.spilled_dangles.size > 0) {
            let total_face_membership = Map<Face, number>();
            effects.spilled_dangles.forEach(function (sd) {
                let sd_mem = new_box.box_mesh.get_partition_face_membership(sd.partition);
                total_face_membership = counter_update(total_face_membership, sd_mem);
            });
            let sd_faces = counter_order(total_face_membership);
            let f_msg = face_message(sd_faces);
            let spilled_dangles_msg = `dangling cardboard on the ${f_msg} swings open`;
            structural_dmg_msgs = structural_dmg_msgs.push(spilled_dangles_msg);
        }

        let spill_msg = this.item_spill_message(effects.spilled_items);
        let result: string;

        if (structural_dmg_msgs.size > 0) {
            let structure_dmg_msg = structural_dmg_msgs.join(' and ');
            result = `${structure_dmg_msg}. ${spill_msg}`;
        } else {
            result = spill_msg;
        }
        return result;
    }

    command_open_dangle(face: FaceWord): CommandResult {
        return this.open_or_close_dangle('open', face);
    }

    command_close_dangle(face: FaceWord): CommandResult {
        return this.open_or_close_dangle('close', face);
    }

    open_or_close_dangle(operation: RendOpWord, face_w: FaceWord): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let face = word_2_face.get(face_w)
            let applicable_dangles = inner_this.box.dangle_state.keySeq().filter((d) => d.free_face == face);
            let new_box = inner_this.box;
            let updated = List<Dangle>();
            applicable_dangles.forEach(function (d){
                let err = false;
                try {
                    new_box = new_box.open_or_close_dangle(word_2_rend_op.get(operation), d);
                } catch (e) {
                    err = true;
                    if (!(e instanceof WorldUpdateError)) {
                        throw e;
                    }
                }
                if (!err) {
                    updated = updated.push(d);
                }
            });
            if (updated.size == 0) {
                throw new WorldUpdateError(`No dangles to ${operation} on ${face} face`);
            }

            let swing_dir_msg = operation == 'close' ? 'in' : 'out';
            let num_hinges = updated.map((d) => d.fixed_face).toSet().size;
            let hinge_msg: string;
            if (num_hinges == 1) {
                hinge_msg = 'hinge';
            } else {
                hinge_msg = 'hinges';
            }

            let message = `You swing the cardboard on the ${Face[face]} of the box ${swing_dir_msg} on its ${hinge_msg}`;
            if (!inner_this.box.appears_open() && new_box.appears_open()) {
                message += '\nYou get a glimpse inside the box through the opening.';

                if (new_box.appears_empty()) {
                    message += " It's empty.";
                } else {
                    message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
                }
            }
            if (effects.box_collapsed) {
                message += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.size > 0) {
                    message += ' ' + inner_this.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return [inner_this.update({box: new_box}), message];
        });
    }

    command_open_rend(face_w: FaceWord): CommandResult {
        return this.open_or_close_rend('open', face_w);
    }

    command_close_rend(face_w: FaceWord): CommandResult {
        return this.open_or_close_rend('close', face_w);
    }

    open_or_close_rend(operation: RendOpWord, face_w: FaceWord): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let face = word_2_face.get(face_w);
            let applicable_rends = List<Partition>();
            inner_this.box.rend_state.forEach(function (s, r) {
                let face_membership = inner_this.box.box_mesh.get_partition_face_membership(r);
                if (face_membership.get(face) > 0) {
                    applicable_rends = applicable_rends.push(r);
                }
            });

            let new_box = inner_this.box;
            let updated = List<Partition>();
            applicable_rends.forEach(function (r){
                let err = false;
                try {
                    new_box = new_box.open_or_close_rend(word_2_rend_op.get(operation), r);
                } catch (e) {
                    err = true;
                    if (!(e instanceof WorldUpdateError)) {
                        throw e;
                    }
                }
                if (!err) {
                    updated = updated.push(r);
                }
            });
            if (updated.size == 0) {
                throw new WorldUpdateError(`No rends to ${operation} on ${face} face`);
            }

            let total_face_membership = Map<Face, number>();
            total_face_membership = updated.reduce(
                (total, r) => counter_update(
                    total,
                    inner_this.box.box_mesh.get_partition_face_membership(r)),
                total_face_membership);

            let face_msg = face_message(counter_order(total_face_membership));

            let message: string;
            if (operation == 'open') {
                message = `You remove the free cardboard from the ${face_msg} and place it to the side.`;
            } else {
                `You replace the missing cardboard from the ${face_msg}.`;
            }

            if (!inner_this.box.appears_open() && new_box.appears_open()) {
                message += '\nYou get a glimpse inside the box through the opening.';

                if (new_box.appears_empty()) {
                    message += " It's empty.";
                } else {
                    message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
                }
            }
            if (effects.box_collapsed) {
                message += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.size > 0) {
                    message += ' ' + inner_this.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return [inner_this.update({box: new_box}), message];
        });
    }

    command_take_item_box(): CommandResult {
        let inner_this = this;
        return with_world_update(function (effects) {
            let new_box = inner_this.box.take_next_item();

            let new_taken_items = inner_this.taken_items;
            new_taken_items.push(...effects.taken_items.toArray());

            let item = effects.taken_items.get(0);
            let message = `You reach in and take ${item.pre_gestalt()}. It's ${item.post_gestalt()}; ${item.article()} ${item.name()}.`;
        
            if (new_box.appears_empty()) {
                message += '\nThe box is empty now.';
            } else {
                message += `\nYou can now see ${new_box.next_item().pre_gestalt()} inside the box.`;
            }

            return [inner_this.update({box: new_box, taken_items: new_taken_items}), message];
        });
    }
}

export class WorldDriver {
    world: SingleBoxWorld;

    constructor (initial_world: SingleBoxWorld) {
        this.world = initial_world;
    }

    apply_command(cmd_name: Token, ...cmd_args: Token[]) {
        let cmd_method: (...cmd_args: Token[]) => CommandResult;
        switch (cmd_name) {
            case 'rotate_y_box':
                cmd_method = this.world.command_rotate_y_box;
                break;
            case 'roll_box':
                cmd_method = this.world.command_roll_box;
                break;
            case 'lift_box':
                cmd_method = this.world.command_lift_box;
                break;
            case 'cut_box':
                cmd_method = this.world.command_cut_box;
                break;
            case 'tape_box':
                cmd_method = this.world.command_tape_box;
                break;
            case 'open_dangle':
                cmd_method = this.world.command_open_dangle;
                break;
            case 'close_dangle':
                cmd_method = this.world.command_close_dangle;
                break;
            case 'open_rend':
                cmd_method = this.world.command_open_rend;
                break;
            case 'close_rend':
                cmd_method = this.world.command_close_rend;
                break;
            case 'take_item_box':
                cmd_method = this.world.command_take_item_box;
                break;
            default:
                throw new CommandError(`invalid cmd_name given: ${cmd_name}`);
        }
        let [new_world, msg] = cmd_method.apply(this.world, cmd_args);
        let tokens: Token[] = [cmd_name];
        tokens.push(...cmd_args);
        //console.log('> ' + tokens.join(' ') + '\n');
        //console.log(msg + '\n');
        this.world = new_world;
        return msg
    }

    run(cmd: string) {
        let [cmd_name, cmd_args]: [Token, Token[]] = parse_command(cmd);
        return this.apply_command(cmd_name, ...cmd_args);
    }
}

export function parse_command(cmd: string): [Token, Token[]] {
    let tokens = cmd.split(/\s+/);
    console.log(tokens);
    return [tokens[0], tokens.slice(1)];
}

export function test() {
    let contents = List<Item>([new Codex(), new Pinecone(), new CityKey()]);
    let world = new SingleBoxWorld({box: new Box({contents: contents})});

    console.log('NEW WORLD: test heavy spillage when rolling\n\n\n');

    let d = new WorldDriver(world);
    d.apply_command('lift_box');
    d.apply_command('roll_box', 'forward');
    d.apply_command('rotate_y_box', 'left');

    // cut the top face vertically along the center from top to bottom
    d.apply_command('cut_box', 'top', 'vertically', 'center', 'top', 'bottom');

    // cut the top face vertically along the right edge from top to bottom
    d.apply_command('cut_box', 'top', 'vertically', 'right', 'top', 'bottom');

    // should result in a dangle
    // cut the top face horizontally along the top edge from center to right
    d.apply_command('cut_box', 'top', 'horizontally', 'top', 'center', 'right');

    // should result in a rend
    // cut the top face horizontally along the bottom edge from center to right
    d.apply_command('cut_box', 'top', 'horizontally', 'bottom', 'center', 'right');

    d.apply_command('roll_box', 'forward');

    // should result in the rend facing straight down, maybe spilling
    d.apply_command('roll_box', 'forward');

    d.apply_command('lift_box');

    console.log('\n\n\nNEW WORLD: test heavy spillage and collapse from bottom when lifting\n\n\n');
    let d2 = new WorldDriver(world);

    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right');
    d2.apply_command('rotate_y_box', 'left');
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right');
    d2.apply_command('rotate_y_box', 'left');
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right');
    d2.apply_command('rotate_y_box', 'left');
    d2.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right');
    d2.apply_command('lift_box');
    
    console.log('\n\n\nNEW WORLD: test taping\n\n\n');
    let d3 = new WorldDriver(world);

    d3.apply_command('cut_box', 'top', 'horizontally', 'top', 'left', 'right');
    d3.apply_command('cut_box', 'top', 'horizontally', 'bottom', 'left', 'right');
    d3.apply_command('cut_box', 'top', 'vertically', 'left', 'top', 'bottom');

    d3.apply_command('open_dangle', 'top');
    d3.apply_command('take_item_box');

    d3.apply_command('close_dangle', 'top');

    d3.apply_command('cut_box', 'top', 'vertically', 'right', 'top', 'bottom');
    d3.apply_command('open_rend', 'top');
    d3.apply_command('take_item_box');
    d3.apply_command('take_item_box');
    d3.apply_command('close_rend', 'top');

    d3.apply_command('tape_box', 'top', 'vertically', 'right', 'top', 'bottom');
    d3.apply_command('tape_box', 'top', 'vertically', 'left', 'top', 'middle');

    console.log('\n\n\nNEW WORLD: test light spillage when rolling and lifting\n\n\n');
    let d4 = new WorldDriver(world);

    d4.apply_command('cut_box', 'front', 'horizontally', 'top', 'left', 'right');
    d4.apply_command('cut_box', 'front', 'horizontally', 'bottom', 'left', 'right');
    d4.apply_command('cut_box', 'front', 'vertically', 'left', 'top', 'bottom');

    d4.apply_command('lift_box');

    d4.apply_command('cut_box', 'front', 'vertically', 'right', 'top', 'bottom');

    d4.apply_command('roll_box', 'right');
}
