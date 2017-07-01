import * as Datatypes from './datatypes';

// import {Map, List, Set, OrderedSet, is} from 'immutable';

export class WorldUpdateEffects {
    spill_faces: Datatypes.Face[] = [];
    spilled_items: Datatypes.Item[] = [];
    spilled_rends: Set<Datatypes.Partition> = new Set<Datatypes.Partition>();
    spilled_dangles: Set<Datatypes.Dangle> = new Set<Datatypes.Dangle>();
    spillage_level = Datatypes.SpillageLevel.none;
    taken_items: Datatypes.Item[] = [];
    new_rends: Datatypes.Partition[] = [];
    new_dangles: Datatypes.Dangle[] = [];
    repaired_rends: Datatypes.Partition[] = [];
    repaired_dangles: Datatypes.Dangle[] = [];
    box_collapsed = false;
    collapse_spilled_items: Datatypes.Item[] = [];
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