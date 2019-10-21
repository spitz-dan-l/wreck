import {FuckSet, FuckDict} from '../datatypes';

import * as Datatypes from './datatypes';

import {Item} from './items';

export class WorldUpdateEffects {
    spill_faces: Datatypes.Face[] = [];
    spilled_items: Item[] = [];
    spilled_rends: FuckSet<Datatypes.Partition> = new FuckDict<Datatypes.Partition, undefined>();
    spilled_dangles:FuckSet<Datatypes.Dangle> = new FuckDict<Datatypes.Dangle, undefined>();
    spillage_level = Datatypes.SpillageLevel.none;
    taken_items: Item[] = [];
    new_rends: Datatypes.Partition[] = [];
    new_dangles: Datatypes.Dangle[] = [];
    repaired_rends: Datatypes.Partition[] = [];
    repaired_dangles: Datatypes.Dangle[] = [];
    box_collapsed = false;
    collapse_spilled_items: Item[] = [];
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