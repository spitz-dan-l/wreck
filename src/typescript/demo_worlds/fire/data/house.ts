/*
    The house in the woods (SPEC §5.2): the prose (l. 318–342), the family's
    events (l. 354–378, the rest authored), the children's, the burning lines
    that follow, and a candidate table with a real choice of tinder.
    Voices: the family, then the children.
*/
import { StorySpec } from './types';
import { AUTHORED } from './katya';

export const HOUSE: StorySpec = {
    id: 'house',
    line_text: 'l383',
    reached: { 10: AUTHORED.burning_lines },     // Katya on the burning lines, when ¶10 is reached (SPEC §5.2)
    title: 'the house in the woods',
    voices: ['the family', 'the children'],
    prose: [
        'A young family moves out of the city.',
        "After some travel, they find a clearing in the woods, away from everything and everyone they've ever known.",
        'They begin to cut the trees in the surrounding wood. They begin to dig into the ground in the clearing.',
        'They build a wooden foundation into the ground, and upon this structure a frame for the house that they will make.',
        'They toil for weeks, chopping and laying wood over the frame, building walls and a roof.',
        'Once ready, the young family moves into their new home.',
        'Time passes.',
        'One day, a small group of children happens upon the house while wandering through the woods.',
        'Egging each other on, one of the children lights an oil-soaked rag on the end of a stick. He hurls it onto the roof of the house. The children scatter frantically into the woods.',
        "The flame from the burning stick spreads to the thatch of the house's roof. Soon, the whole roof is ablaze.",
        "The fire spreads to roof's frame, and the roof falls in.",
        'The whole house burns to the ground, the family trapped within.',
        'A field of ash is all that remains the next morning.'
    ],
    events: [
        {
            index: 1, voices: ['the family'], prose: 1,
            command: 'pack',
            name: 'the packing',
            consequence: ['You gather what you need, and leave the rest.']
        },
        {
            index: 2, voices: ['the family'], prose: 1,
            command: 'travel',
            name: 'the traveling',
            consequence: ['You depart the city together, entering the woods.']
        },
        {
            index: 3, voices: ['the family'], prose: 2,
            command: 'travel',
            name: 'the traveling',
            consequence: ['You march through the woods, making camp at night, taking shelter when the weather is bad.']
        },
        {
            index: 4, voices: ['the family'], prose: 2,
            command: 'travel',
            name: 'the traveling',
            consequence: [
                'You reach a clearing within the woods.',
                'The ground here is flat and healthy.'
            ]
        },
        {
            index: 5, voices: ['the family'], prose: 3,
            command: 'cut wood',
            name: 'the cutting of wood',
            consequence: ['You cut down the trees surrounding your clearing, and strip them of their bark.'],
            remainder: 'They begin to dig into the ground in the clearing.'
        },
        {
            index: 6, voices: ['the family'], prose: 3,
            command: 'dig a hole',
            name: 'the digging of a hole',
            consequence: ["You dig into the ground in the clearing where you intend to build your home's foundation."]
        },
        {
            index: 7, voices: ['the family'], prose: 4,
            command: 'build the foundation',
            name: 'the building of the foundation',
            consequence: ['You build a wooden foundation into the ground you have dug.'],
            remainder: 'and upon this structure a frame for the house that they will make.',
            authored: true
        },
        {
            index: 8, voices: ['the family'], prose: 4,
            command: 'raise the frame',
            name: 'the raising of the frame',
            consequence: ['Upon the foundation you raise a frame for the house that you will make.'],
            authored: true
        },
        {
            index: 9, voices: ['the family'], prose: 5,
            command: 'lay walls and a roof',
            name: 'the laying of walls and a roof',
            consequence: ['You toil for weeks, chopping and laying wood over the frame. The walls go up, and over them a roof of thatch.'],
            authored: true
        },
        {
            index: 10, voices: ['the family'], prose: 6,
            command: 'move in',
            name: 'the moving in',
            consequence: ['Once it is ready, you move into your new home.'],
            authored: true
        },
        {
            index: 11, voices: ['the children'], prose: 9,
            command: 'light the rag',
            name: 'the lighting of the rag',
            consequence: ['Egging each other on, one of you lights an oil-soaked rag on the end of a stick.'],
            remainder: 'He hurls it onto the roof of the house. The children scatter frantically into the woods.',
            absorbs: [1, 4],
            authored: true
        },
        {
            index: 12, voices: ['the children'], prose: 9,
            command: 'hurl it onto the roof',
            name: 'the hurling of the rag onto the roof',
            consequence: ['One of you hurls the burning stick onto the roof of the house.'],
            remainder: 'The children scatter frantically into the woods.',
            authored: true
        },
        {
            index: 13, voices: ['the children'], prose: 9,
            command: 'scatter',
            name: 'the scattering',
            consequence: ['You scatter frantically into the woods.'],
            absorbs: [5, 6, 7, 8],
            authored: true
        }
    ],
    follows: [7, 8, 10, 11, 12, 13],
    traps: [
        {
            prose: 9, voice: 'the family', command: 'light the rag',
            nudge: 'You are still speaking as the family, my dear. Would the family light the rag? Change the voice, then command.'
        },
        {
            prose: 10, voice: 'the children', command: 'spread to the thatch',
            nudge: 'The children have run, my dear.'
        }
    ],
    candidates: {
        'the Voice of Fire': {
            first: {
                1: [{ event: 11, derives: 'the oil-soaked rag' }, { event: 9, derives: 'the thatch' }],
                2: [{ event: 9, derives: 'the thatch' }, { event: 8, derives: 'the frame' }],
                3: [{ event: 8, derives: 'the frame' }, { event: 7, derives: 'the foundation' }],
                4: [{ event: 12, derives: 'the burning stick' }, { event: 11, derives: 'the lit rag' }],
                5: [{ event: 13, derives: 'the flame on the thatch' }],
                6: [{ event: 13, derives: 'the blaze in the frame' }],
                7: [{ event: 13, derives: 'the blaze' }],
                8: [{ event: 13, derives: 'a field of ash' }]
            }
        }
    },
    nudges: [
        { step: 1, event: 5, text: 'Wood that is cut is not yet laid.' }
    ],
    feelings: [
        'sad, because it was a home',
        'a bit cold, because the pattern did not mind',
        'unfinished, because the tinder is still two things'
    ],
    apply_text: {
        first: ["You struggle a bit more to map the steps from the Voice of Fire to the steps of this story. It's less clear what part of the house is the tinder, or the kindling, or the firewood. Nevertheless, you find an acceptable mapping."]
    }
};
