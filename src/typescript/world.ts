import {BoxMesh, FaceMesh} from './box_geometry';

import {
    CardboardEdge,
    CommandError,
    Counter,
    counter_update,
    Dangle,
    Direction,
    directions,
    Edge,
    EdgeState,
    Face,
    Item,
    Partition,
    RendOperation,
    RendState,
    SpillageLevel,
    TapeEdge,
    Weight,
    WorldUpdateError
} from './datatypes';

import {WorldUpdateEffects, with_world_update, world_update} from './world_update_effects';

import {CityKey, Codex, Pinecone} from './items';

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

