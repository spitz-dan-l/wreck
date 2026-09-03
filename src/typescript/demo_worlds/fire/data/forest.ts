/*
    The forest fire (SPEC §5.3): the prose (l. 395–417) and its events, all
    authored, each spoken by a disembodied or abstract voice. There are no
    people in this story and no intentions at all.
*/
import { StorySpec } from './types';

export const FOREST: StorySpec = {
    id: 'forest',
    title: 'the forest fire',
    voices: ['the seed', 'the tree', 'the forest', 'the weather', 'the fire', 'the season', 'time'],
    prose: [
        'A seed takes root in fertile ground.',
        'The season is right, and the weather is right, and a sapling rises forth.',
        'It grows, and time passes, and the weather is right, and it lives to become a tree.',
        'The tree sprouts leaves and seeds, and the season changes, and the seeds fall to the ground and the leaves protect them.',
        'Gradually, more trees sprout and grow and spread.',
        'Much time passes. The trees flourish, a forest.',
        'The weather becomes dry and hot, and the forest suffers. Many trees die and the ground is covered in dead brush.',
        'The weather happens to bring a thunderstorm. A lightning bolt strikes a dead tree, and it begins to burn.',
        'The flame spreads to the dead brush on the ground, and out to more trees.',
        'The fire burns in a rapidly-growing circle around the lightning strike.',
        'The forest is consumed in fire. Trees and brush are burnt to the ground.',
        'The flame stops at rivers and sand and rocks. The forest burns down to ash.'
    ],
    events: [
        {
            index: 1, voices: ['the seed'], prose: 1,
            command: 'take root',
            name: 'the taking root',
            consequence: ['The seed takes root in fertile ground.'],
            authored: true
        },
        {
            index: 2, voices: ['the season'], prose: 2,
            command: 'turn',
            name: 'the turning of the season',
            consequence: ['The season is right, and the weather is right, and a sapling rises forth.'],
            authored: true
        },
        {
            index: 3, voices: ['the tree'], prose: 3,
            command: 'grow',
            name: 'the growing',
            consequence: ['The sapling grows, and time passes, and the weather is right, and it lives to become a tree.'],
            authored: true
        },
        {
            index: 4, voices: ['the tree'], prose: 4,
            command: 'sprout leaves and seeds',
            name: 'the sprouting of leaves and seeds',
            consequence: ['The tree sprouts leaves and seeds. The season changes, and the seeds fall to the ground, and the leaves protect them.'],
            authored: true
        },
        {
            index: 5, voices: ['the forest'], prose: 5,
            command: 'spread',
            name: 'the spreading of the forest',
            consequence: ['Gradually, more trees sprout and grow and spread.'],
            authored: true
        },
        {
            index: 6, voices: ['time'], prose: 6,
            command: 'pass',
            name: 'the passing of time',
            consequence: ['Much time passes. The trees flourish, a forest.'],
            authored: true
        },
        {
            index: 7, voices: ['the weather'], prose: 7,
            command: 'turn dry and hot',
            name: 'the turning dry and hot',
            consequence: ['The weather becomes dry and hot, and the forest suffers. Many trees die. The forest stands full of dead trees, and the ground is covered in dead brush.'],
            absorbs: [1, 2],
            authored: true
        },
        {
            index: 8, voices: ['the weather'], prose: 8,
            command: 'bring a thunderstorm',
            name: 'the bringing of a thunderstorm',
            consequence: ['A thunderstorm comes over the forest. A lightning bolt strikes a dead tree, and it begins to burn.'],
            authored: true
        },
        {
            index: 9, voices: ['the fire'], prose: 9,
            command: 'spread to the dead brush',
            name: 'the spreading to the dead brush',
            consequence: ['The flame spreads to the dead brush on the ground, and out to more trees.'],
            absorbs: [5, 6],
            authored: true
        },
        {
            index: 10, voices: ['the fire'], prose: 10,
            command: 'burn in a growing circle',
            name: 'the burning in a growing circle',
            consequence: ['The fire burns in a rapidly-growing circle around the lightning strike.'],
            authored: true
        },
        {
            index: 11, voices: ['the fire'], prose: 11,
            command: 'consume the forest',
            name: 'the consuming of the forest',
            consequence: ['The forest is consumed in fire. Trees and brush are burnt to the ground.'],
            authored: true
        },
        {
            index: 12, voices: ['the fire'], prose: 12,
            command: 'stop at the rivers',
            name: 'the stopping at the rivers',
            consequence: ['The flame stops at rivers and sand and rocks. The forest burns down to ash.'],
            authored: true
        }
    ],
    follows: [],
    traps: [
        {
            command: 'speak as the Voice of Fire',
            nudge: 'Not the one on the board, my dear. That one we are looking for. Lend the story a fire of its own.'
        }
    ],
    candidates: {
        'the Voice of Fire': {
            first: {
                1: [{ event: 7, derives: 'the dead brush' }],
                2: [{ event: 7, derives: 'the dead trees' }],
                3: [{ event: 5, derives: 'the trees' }, { event: 6, derives: 'the forest' }],
                4: [{ event: 8, derives: 'the lightning' }],
                5: [{ event: 9, derives: 'the flame' }],
                6: [{ event: 9, derives: 'the fire in the trees' }, { event: 10, derives: 'the fire in the trees' }],
                7: [{ event: 10, derives: 'the blaze' }, { event: 11, derives: 'the blaze' }],
                8: [{ event: 12, derives: 'the forest, as ash' }]
            }
        }
    },
    nudges: [
        { step: 1, event: 1, text: 'A seed is not laid to burn. What here is dry?' },
        { step: 4, event: 7, text: 'Dry is not lit. What strikes?' }
    ],
    feelings: [
        'like nothing, because no one wanted it',
        'a bit familiar, because the thin voices sounded like the one on the right'
    ],
    apply_text: {
        first: [
            'There are no people in this story, no intentions at all. The forest is not a well-constructed fireplace at all, but the conditions of nature happened to conspire to burn it down.'
        ]
    }
};
