/*
    The Voice of Fire: the eight steps in chalk form (l. 166–180) and in the
    standard notation (l. 185–215), their roles, the partial order, and the
    nudges Katya gives when a placement fails (SPEC §10).
*/
import { AbstractSequence } from './types';
import { voice } from './voices';

export const FIRE_ROLES = ['tinder', 'kindling', 'firewood', 'ember', 'flame', 'blaze', 'ash'];

export const VOICE_OF_FIRE: AbstractSequence = {
    voice: voice('the Voice of Fire'),
    roles: FIRE_ROLES,
    steps: [
        {
            index: 1,
            chalk: 'The laying of the tinder',
            name: 'the laying of the tinder',
            command: 'lay the tinder',
            consequence: 'A small patch of tinder is placed in the hearth.',
            role: 'tinder',
            after: []
        },
        {
            index: 2,
            chalk: 'The laying of the kindling over the tinder',
            name: 'the laying of the kindling',
            command: 'lay the kindling',
            consequence: 'A layer of kindling is added over the tinder.',
            role: 'kindling',
            after: []
        },
        {
            index: 3,
            chalk: 'The stacking of the firewood over the kindling',
            name: 'the stacking of the firewood',
            command: 'stack the firewood',
            consequence: 'Logs of firewood are stacked systematically over the kindling.',
            role: 'firewood',
            after: []
        },
        {
            index: 4,
            chalk: 'The sparking of the tinder, creating an ember',
            name: 'the sparking of the tinder',
            command: 'spark the tinder',
            consequence: 'A single spark is added to the tinder. It catches and forms an ember.',
            role: 'ember',
            after: [1]
        },
        {
            index: 5,
            chalk: 'The spreading of the ember to the kindling, creating a flame',
            name: 'the spreading of the ember',
            command: 'spread to the kindling',
            consequence: 'The ember glows, spreading to the kindling above. The kindling is acquired by a growing flame.',
            role: 'flame',
            after: [2, 4]
        },
        {
            index: 6,
            chalk: 'The spreading of the flame to the firewood, creating a blaze',
            name: 'the spreading of the flame',
            command: 'spread to the firewood',
            consequence: 'The flame grows, and reaches the firewood, setting it alight. The blaze glows, feeding on the wooden fuel.',
            role: 'blaze',
            after: [3, 5]
        },
        {
            index: 7,
            chalk: 'The consumption of all within the blaze',
            name: 'the consumption of all',
            command: 'burn',
            consequence: 'The blaze continues to spread through the logs, arranged perfectly to give themselves up to the burning. The hearth burns bright and hot, for a time.',
            role: 'blaze',
            after: [6]
        },
        {
            index: 8,
            chalk: 'The ash left behind',
            name: 'the ash left behind',
            command: 'reduce to ash',
            consequence: 'As the wooden fuel is spent, the blaze dies down, gradually dwindling to nothing. A pile of black ash is left behind in the hearth.',
            role: 'ash',
            after: [7]
        }
    ],
    nudges: {
        step: {
            1: 'The tinder is the first thing to catch. Nothing here catches.',
            2: 'Wood, my dear. You are looking for what will be fuel.',
            3: 'Wood, my dear. You are looking for what will be fuel.',
            4: 'What was touched to the tinder? Find the touch.',
            5: 'The fire spreads from what has caught to what has not. Find the catching.',
            6: 'The fire spreads from what has caught to what has not. Find the catching.',
            7: 'Look for the hearth burning bright and hot, for a time.',
            8: 'What is left behind, afterward, when no one is tending?'
        },
        L1: 'The Voice of Fire does not skip, my dear. {step} is not on the board.',
        L3: 'The Voice of Fire proceeds in order, my dear. It does not reach the firewood before the kindling has caught.',
        L6: 'One line cannot be two things at once, my dear. What was laid first, and what over it?',
        L7: 'That line is spoken for, my dear. It belongs to the first solution.',
        L7_step: {
            8: "That is the first solution's ash. It is spoken for. Where does the wisdom end up?"
        }
    }
};
