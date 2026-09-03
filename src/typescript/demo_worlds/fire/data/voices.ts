/*
    Every voice that commands an event in the demo (SPEC §2): the embodied
    ones, the disembodied things the forest lends a voice to, and the
    abstract ones, including the two abstract sequences themselves.
*/
import { Voice, VoiceId } from './types';

export const VOICES: Voice[] = [
    { id: 'the friends', name: 'the friends', kind: 'embodied' },
    { id: 'the family', name: 'the family', kind: 'embodied' },
    { id: 'the children', name: 'the children', kind: 'embodied' },
    { id: 'the boy', name: 'the boy', kind: 'embodied' },
    { id: 'the man', name: 'the man', kind: 'embodied' },
    { id: 'the followers', name: 'the followers', kind: 'embodied' },
    { id: 'the closest followers', name: 'the closest followers', kind: 'embodied' },
    { id: 'you', name: 'You', kind: 'embodied' },

    { id: 'the seed', name: 'the seed', kind: 'disembodied' },
    { id: 'the tree', name: 'the tree', kind: 'disembodied' },
    { id: 'the forest', name: 'the forest', kind: 'disembodied' },
    { id: 'the weather', name: 'the weather', kind: 'disembodied' },
    { id: 'the fire', name: 'the fire', kind: 'disembodied' },
    { id: 'the books', name: 'the books', kind: 'disembodied' },

    { id: 'the season', name: 'the season', kind: 'abstract' },
    { id: 'time', name: 'time', kind: 'abstract' },
    { id: 'the Voice of Fire', name: 'the Voice of Fire', kind: 'abstract' },
    { id: 'the Pillaging', name: 'the Pillaging', kind: 'abstract' }
];

export function voice(id: VoiceId): Voice {
    const v = VOICES.find(v => v.id === id);
    if (v === undefined) {
        throw new Error(`There is no voice called ${id}.`);
    }
    return v;
}
