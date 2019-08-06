import { lock_builder, Lock } from '../../lock';
import { Puffer } from '../../puffer';
import { update, entries, bound_method } from '../../utils';
import { World, get_initial_world } from '../../world';
import { FutureSearchSpec } from '../../supervenience';
import {ResourcesFor, StaticResourceRegistry, StaticResource, StaticIndex} from '../../static_resources';
import { GistRenderer, gist_renderer_index } from '../../gist';

export type TopicID =
    'Sam' |
    'yourself' |
    'your notebook' |
    'your history with Sam';

// export type AbstractionID =
//     'the attentive mode' |
//     'the scrutinizing mode' |
//     'the hammer' |
//     'the volunteer';

export type ActionID =
    'attend' |
    'scrutiny' |
    'hammer' |
    'volunteer';

export type FacetID =
    "Sam" |
    "Sam's demeanor" |
    "Sam's personality" |
    "your friendship with Sam" |
    "your drifting apart" |
    "your culpability" |
    "the old affinity" |
    'a memory 1' |
    'a memory 2' |
    'a memory 3' |
    'a memory 4';

export type Owner =
    'Metaphor' |
    'Outro';

export interface Venience extends World {
    owner: Owner | null;
}

export interface VeniencePuffer extends Puffer<Venience> {
    role_brand?: true;
}

// SETUP STATIC RESOURCES
export interface StaticResources {};
export const resource_registry = new StaticResourceRegistry<StaticResources>();


// Create some basic resources:
// initial world values
// global lock
// puffer index

export interface StaticResources {
    initial_world_prelude: Pick<Venience, 'owner'>;
    puffer_index: StaticIndex<VeniencePuffer>;
    global_lock: (o: Owner | null) => Lock<Venience, Owner>;
    gist_renderer_index: StaticIndex<GistRenderer>;
};

resource_registry.create('initial_world_prelude',
    {owner: null});


const global_lock = resource_registry.create('global_lock',
    lock_builder<Venience, Owner>({
        owner: (w) => w.owner,
        set_owner: (w, owner) => update(w, { owner} )
    })
).get();

const puffer_index = resource_registry.create('puffer_index',
    new StaticIndex([
        function ensure_lock(puffer) {
            if (puffer.role_brand === undefined) {
                return lock_and_brand(null, puffer);
            }
            return puffer;
        }
    ])
).get();

resource_registry.create('gist_renderer_index', gist_renderer_index);

export const Puffers = bound_method(puffer_index, 'add');

export function lock_and_brand(owner: Owner | null, puffer: VeniencePuffer) {
    return update<VeniencePuffer>(puffer,
        global_lock(owner).lock_puffer,
        { role_brand: true }
    )
}

