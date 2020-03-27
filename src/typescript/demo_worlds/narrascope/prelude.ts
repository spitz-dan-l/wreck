import { lock_builder, Lock } from '../../lock';
import { Puffer } from '../../puffer';
import { update, entries, bound_method, merge_objects, enforce_always_never } from '../../lib/utils';
import { World, get_initial_world } from '../../world';
import { FutureSearchSpec } from '../../supervenience';
import {ResourcesFor, StaticMap, StaticResource, StaticIndex, StaticNameIndexFor, NameOf} from '../../lib/static_resources';
import { GistRendererRule, GIST_RENDERER_INDEX, ValidTags } from 'gist';

export const STATIC_TOPIC_IDS = {
    'Sam': null,
    'yourself': null,
    'your notebook': null,
    'your history with Sam': null
 };
export type TopicID = NameOf<typeof STATIC_TOPIC_IDS>;

export interface StaticActionGistTypes {
    notes: {
        children: {
            topic?: 'action description'
        }
    };
    remember: {
        children: {
            topic: 'action description'
        }
    };
};

declare module 'gist' {
    export interface StaticGistTypes extends StaticActionGistTypes {}
}

export type ActionID = keyof StaticActionGistTypes; //NameOf<typeof StaticActionIDs>;
export const StaticActionIDs: StaticNameIndexFor<StaticActionGistTypes> = {
    consider: null,
    contemplate: null,
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
    owner: Owner | null;
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
    'gist_renderer_index': null,
    'initial_world_topic': null,
    'topic_index': null,
    'initial_world_metaphor': null,
    'action_index': null,
    'initial_world_notes': null,
    'note_index': null,
    'memory_index': null,
    'initial_world_narrascope': null,
    'venience_world_spec': null,
    'initial_world_can_consider': null
}

export const resource_registry = new StaticMap<StaticResources>(static_resource_names);


// Create some basic resources:
// initial world values
// global lock
// puffer index

export interface StaticResources {
    initial_world_prelude: Pick<Venience, 'owner'>;
    puffer_index: StaticIndex<VeniencePuffer>;
    global_lock: (o: Owner | null) => Lock<Venience, Owner>;
    gist_renderer_index: StaticIndex<GistRendererRule>;
};

resource_registry.initialize('initial_world_prelude',
    {owner: null});


const global_lock = resource_registry.initialize('global_lock',
    lock_builder<Venience, Owner>({
        owner: (w) => w.owner,
        set_owner: (w, owner) => update(w, { owner} )
    })
);

const puffer_index = resource_registry.initialize('puffer_index',
    new StaticIndex([
        function ensure_lock(puffer) {
            if (puffer.role_brand === undefined) {
                return lock_and_brand(null, puffer);
            }
            return puffer;
        }
    ])
);

resource_registry.initialize('gist_renderer_index', GIST_RENDERER_INDEX);

export const Puffers = bound_method(puffer_index, 'add');

export function lock_and_brand(owner: Owner | null, puffer: VeniencePuffer) {
    return update<VeniencePuffer>(puffer,
        global_lock(owner).lock_puffer,
        { role_brand: true }
    )
}
