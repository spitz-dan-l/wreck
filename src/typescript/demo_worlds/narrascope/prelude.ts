import { lock_builder, Lock } from '../../lock';
import { Puffer } from '../../puffer';
import { update, entries, bound_method, merge_objects, enforce_always_never } from '../../lib/utils';
import { World, get_initial_world } from '../../world';
import { FutureSearchSpec } from '../../supervenience';
import {ResourcesFor, StaticMap, StaticResource, StaticIndex, StaticNameIndexFor, NameOf} from '../../lib/static_resources';
import { GistRendererRule, GIST_RENDERER_DISPATCHERS, ValidTags, GistPatternDispatcher } from 'gist';

export const STATIC_TOPIC_IDS = {
    'the present moment': null,
    'Sam': null,
    'yourself': null,
    'your notebook': null,
    'your history with Sam': null
 };
export type TopicID = NameOf<typeof STATIC_TOPIC_IDS>;

export interface StaticActionGistTypes {
};

declare module 'gist' {
    export interface StaticGistTypes extends StaticActionGistTypes {}
}

export type ActionID = keyof StaticActionGistTypes; //NameOf<typeof StaticActionIDs>;
export const STATIC_ACTION_IDS: StaticNameIndexFor<StaticActionGistTypes> = {
    consider: null,
    reflect: null,
    notes: null,
    remember: null,
    scrutinize: null,
    hammer: null,
    volunteer: null
};

export const StaticFacetIDs = {
    "Sam's presence": null,
    "Sam's demeanor": null,
    "your friendship with Sam": null,
    "your drifting apart": null,
    "your culpability": null,
    "the old affinity": null,
    'a memory 1': null,
    'a memory 2': null,
    'a memory 3': null,
    'a memory 4': null
 } as const;
export type FacetID = NameOf<typeof StaticFacetIDs>;

export type Owner =
    'Metaphor' |
    'Outro';

export interface Venience extends World {
    owner: Owner | undefined;
}

export interface VeniencePuffer extends Puffer<Venience> {
    role_brand?: true;
}

// SETUP STATIC RESOURCES
export interface StaticResources {};

const static_resource_names: StaticNameIndexFor<StaticResources> = {
    'initial_world_knowledge': null,
    'initial_world_prelude': null,
    'puffer_index': null,
    'global_lock': null,
    'gist_renderer_dispatchers': null,
    'topic_index': null,
    'initial_world_metaphor': null,
    'action_index': null,
    'action_handler_dispatcher': null,
    'initial_world_narrascope': null,
    'venience_world_spec': null,
    'initial_world_consider': null,
    'initial_world_memories': null,
    exposition_func: null
}

export const resource_registry = new StaticMap<StaticResources>(static_resource_names);


// Create some basic resources:
// initial world values
// global lock
// puffer index

export interface StaticResources {
    initial_world_prelude: Pick<Venience, 'owner'>;
    puffer_index: StaticIndex<VeniencePuffer>;
    global_lock: (o: Owner | undefined) => Lock<Venience, Owner>;
    gist_renderer_dispatchers: typeof GIST_RENDERER_DISPATCHERS;
};

resource_registry.initialize('initial_world_prelude',
    {owner: undefined});


const global_lock = resource_registry.initialize('global_lock',
    lock_builder<Venience, Owner>({
        owner: (w) => w.owner,
        set_owner: (w, owner) => update(w, { owner } )
    })
).get_pre_runtime();

const puffer_index = resource_registry.initialize('puffer_index',
    new StaticIndex([
        function ensure_lock(puffer) {
            if (puffer.role_brand === undefined) {
                return lock_and_brand(undefined, puffer);
            }
            return puffer;
        }
    ])
).get_pre_runtime();

resource_registry.initialize('gist_renderer_dispatchers', GIST_RENDERER_DISPATCHERS);

export const Puffers = bound_method(puffer_index, 'add');

export function lock_and_brand(owner: Owner | undefined, puffer: VeniencePuffer) {
    return update<VeniencePuffer>(puffer,
        global_lock(owner).lock_puffer,
        { role_brand: true }
    )
}
