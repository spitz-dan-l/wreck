import {BoxMesh, FaceMesh} from './box_geometry'

import {Item, RendOperation, Edge, EdgeState, CardboardEdge, Dangle, TapeEdge, SpillageLevel, Partition, Weight, Direction, Face, RendState} from './datatypes'

import {WorldUpdateEffects, world_update, with_world_update} from './world_update_effects'

import {Codex, CityKey, Pinecone} from './items'

import {Map, List, Set} from 'immutable'


class Box {
    readonly box_mesh: BoxMesh;
    readonly rend_state: Map<Partition, RendState>;
    readonly dangle_state: Map<Dangle, RendState>;
    readonly edge_state: Map<Edge, EdgeState>;
    readonly contents: List<Item>;

    constructor(box_mesh?, rend_state?, dangle_state?, edge_state?, contents?){
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

    update(box_mesh?, rend_state?, dangle_state?, edge_state?, contents?){
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

        return new Box(box_mesh, rend_state, dangle_state, edge_state, contents);
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
            throw new Error('rend does not exist on the box');
        }

        if (this.box_mesh.is_partition_fixed(rend)) {
            throw new Error('cannot open or close a fixed rend');
        }

        let new_rend_state = this.rend_state;
        let intended_new_state = operation == RendOperation.close ? RendState.closed : RendState.open;
        if (intended_new_state == new_rend_state.get(rend)) {
            throw Error(`cannot ${operation} a rend that is already ${intended_new_state}`);
        }

        new_rend_state = new_rend_state.set(rend, intended_new_state);

        let new_box = this.update(undefined, new_rend_state);

        if (new_box.is_collapsed()) {
            let effects = world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items = effects.collapse_spilled_items.push(...new_box.contents.toArray());
            let new_contents = List<Item>();
            new_box = new_box.update(undefined, undefined, undefined, undefined, new_contents);
        }

        return new_box;
    }

    is_collapsed(){
        // TODO
    }
}

