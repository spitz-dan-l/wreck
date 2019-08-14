import { lock_builder, Lock } from '../../lock';
import { Puffer } from '../../puffer';
import { update, entries, bound_method, merge_objects } from '../../utils';
import { World, get_initial_world } from '../../world';
import { FutureSearchSpec } from '../../supervenience';
import {ResourcesFor, StaticMap, StaticResource, StaticIndex, StaticNameIndexFor, NameOf} from '../../static_resources';
import { GistRenderer, gist_renderer_index } from '../../gist';

export const StaticTopicIDs = [
    'Sam',
    'yourself',
    'your notebook',
    'your history with Sam'
] as const;
export type TopicID = NameOf<typeof StaticTopicIDs>;

export const StaticActionIDs = [
    'to attend',
    'to scrutinize',
    'to hammer',
    'to volunteer'
] as const;
export type ActionID = NameOf<typeof StaticActionIDs>;

export const StaticNoteIDs = StaticActionIDs;
export type NoteID = ActionID;

export const StaticFacetIDs = [
    "Sam",
    "Sam's demeanor",
    "your friendship with Sam",
    "your drifting apart",
    "your culpability",
    "the old affinity",
    'a memory 1',
    'a memory 2',
    'a memory 3',
    'a memory 4'
] as const;
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

const static_resource_names: StaticNameIndexFor<StaticResources> = [
    'initial_world_prelude',
    'puffer_index',
    'global_lock',
    'gist_renderer_index',
    'initial_world_metaphor',
    'action_index',
    'facet_index',
    'initial_world_topic',
    'topic_index',
    'initial_world_notes',
    'note_index',
    'memory_index',
    'initial_world_narrascope',
    'venience_world_spec'
]

export const resource_registry = new StaticMap<StaticResources>(static_resource_names);


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

resource_registry.initialize('gist_renderer_index', gist_renderer_index);

export const Puffers = bound_method(puffer_index, 'add');

export function lock_and_brand(owner: Owner | null, puffer: VeniencePuffer) {
    return update<VeniencePuffer>(puffer,
        global_lock(owner).lock_puffer,
        { role_brand: true }
    )
}
