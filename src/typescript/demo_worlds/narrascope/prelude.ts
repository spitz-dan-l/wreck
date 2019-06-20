import { lock_builder } from '../../lock';
import { Puffer } from '../../puffer';
import { update } from '../../utils';
import { World, get_initial_world } from '../../world';

export type TopicID =
    'Sam' |
    'yourself' |
    'your notebook' |
    'your history with Sam';

export type AbstractionID =
    'the attentive mode' |
    'the scrutinizing mode' |
    'the hammer' |
    'the volunteer';

export type ActionID =
    'attend' |
    'scrutinize' |
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


export const global_lock = lock_builder<Venience, Owner>({
    owner: (w) => w.owner,
    set_owner: (w, owner) => update(w, { owner} )
});

export const PufferIndex: Puffer<Venience>[] = [];

export function Puffers(...puffers: Puffer<Venience>[]) {
    PufferIndex.push(...puffers)
}

const initializers: (() => void)[] = [];
export function Initializers(initializer: () => void) {
    initializers.push(initializer);
}

export function initialize() {
    for (let i of initializers) {
        i();
    }
}

// interface VenienceWorld extends Venience, World {};

// //TODO set up a registry of partial initial worlds
// export interface initializers extends Array<any> {
//     0: World
// }

// type inits = initializers[0 | 1];

// declare let xxx: initializers;

// xxx[0]