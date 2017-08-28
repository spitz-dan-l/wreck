import * as Datatypes from './datatypes';

export class WorldUpdateEffects {
    spill_faces: Datatypes.Face[] = [];
    spilled_items: Datatypes.Item[] = [];
    spilled_rends: Datatypes.FuckSet<Datatypes.Partition> = new Datatypes.FuckDict<Datatypes.Partition, undefined>();
    spilled_dangles: Datatypes.FuckSet<Datatypes.Dangle> = new Datatypes.FuckDict<Datatypes.Dangle, undefined>();
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