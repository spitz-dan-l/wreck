import { lock_builder } from '../../lock';
import { Puffer } from '../../puffer';
import { update } from '../../utils';
import { World, get_initial_world } from '../../world';

export type TopicID =
    'Sam' |
    'myself' |
    'my notebook';

export type AbstractionID =
    'the attentive mode' |
    'the scrutinizing mode' |
    'the hammer' |
    'participation';

export type ActionID =
    'attend' |
    'scrutinize' |
    'hammer';

export type FacetID =
    "Sam" |
    "Sam's demeanor";

export type Owner =
    'Metaphor';

export interface Venience {
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