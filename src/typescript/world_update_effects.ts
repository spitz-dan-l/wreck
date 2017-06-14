import {Matrix2, make_matrix2, Dangle, Face, Edge, Partition, faces, EdgeOperation, Point2, Direction, Item, SpillageLevel} from './datatypes';

import {Map, List, Set, OrderedSet, is} from 'immutable';

export class WorldUpdateEffects {
    spill_faces = List<Face>();
    spilled_items = List<Item>();
    spilled_rends = Set<Partition>();
    spilled_dangles = Set<Dangle>();
    spillage_level = SpillageLevel.none;
    taken_items = List<Item>();
    new_rends = List<Partition>();
    new_dangles = List<Dangle>();
    repaired_rends = List<Partition>();
    repaired_dangles = List<Dangle>();
    box_collapsed = false;
    collapse_spilled_items = List<Item>();
}

interface WorldUpdateEffectsRef {
    effects?: WorldUpdateEffects
}

export let world_update: WorldUpdateEffectsRef = {};

export function with_world_update<T>(f: (effects: WorldUpdateEffects) => T) {
    //TODO validate: error if world_update.effects isn't null/undefined
    world_update.effects = new WorldUpdateEffects();
    let result = f(world_update.effects);
    world_update.effects = undefined;
    return result;
}

//TODO define world update exceptions