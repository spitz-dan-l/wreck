/*
    The Pillaging (l. 108–114): the other abstract sequence, on the shelf of
    past lessons. Data only in v1: it is rememberable, and has no candidate
    table in any story (SPEC §5.5).
*/
import { AbstractSequence } from './types';
import { voice } from './voices';

export const PILLAGING: AbstractSequence = {
    voice: voice('the Pillaging'),
    roles: ['Someone', 'their home', 'the Pillager', 'things taken'],
    steps: [
        {
            index: 1,
            chalk: 'Someone lives in their home.',
            name: 'the living in their home',
            command: 'live in your home',
            consequence: 'You live in your home, as you always have.',
            role: 'Someone',
            after: []
        },
        {
            index: 2,
            chalk: 'The Pillager enters their home.',
            name: 'the entering of their home',
            command: 'enter their home',
            consequence: 'You enter their home. No one asked you in.',
            role: 'the Pillager',
            after: [1]
        },
        {
            index: 3,
            chalk: 'The Pillager takes things from their home.',
            name: 'the taking of things from their home',
            command: 'take things from their home',
            consequence: 'You take what you want from their home, and leave.',
            role: 'things taken',
            after: [2]
        }
    ],
    default_nudges: {
        step: {
            1: 'Someone lives here. Who?',
            2: 'They came upon it. Did they go in?',
            3: 'What did they take?'
        },
        L1: 'The Pillaging does not skip, my dear. Something is missing from the board.',
        L3: 'Taken before anyone lived there? Nothing is taken from an empty house.',
        L6: 'One line at a time, my dear. Who lives there, and who enters?'
    }
};
