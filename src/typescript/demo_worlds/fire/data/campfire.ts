/*
    The campfire story (SPEC §5.1): the prose (l. 220–242), its conversion
    to the standard notation (l. 251–306), and the candidate table for the
    Voice of Fire. Voice: the friends.
*/
import { StorySpec } from './types';

export const CAMPFIRE: StorySpec = {
    id: 'campfire',
    title: 'the campfire story',
    voices: ['the friends'],
    prose: [
        'A group of friends takes a weekend trip to camp in the woods.',
        'As it darkens outside, they gather tinder, kindling and firewood.',
        'They dig a pit in the ground.',
        'They lay the tinder in the middle of the pit.',
        'They pile the kindling on over it.',
        'They stack the logs in layers over the kindling.',
        'One of them lights a match, and carefully touches its flame to the tinder.',
        'The fire starts, spreading first to the kindling and then the logs.',
        'The group begins to sing an old song together.',
        'The fire burns brightly for awhile, and the friends tend to it, adding more logs periodically, as they continue to sing and tell stories.',
        'As it grows late, they stop adding wood, and the flame dwindles. The friends retreat to their tents.',
        'The remaining embers fizzle out, leaving behind ash.'
    ],
    events: [
        {
            index: 1, voice: 'the friends', prose: 1,
            command: 'travel to the woods',
            consequence: [
                'You all make your way out of town, in cars piled full of food, tents and musical instruments.',
                'You arrive at the campground in the woods.'
            ]
        },
        {
            index: 2, voice: 'the friends', prose: 2,
            command: 'gather tinder, kindling and firewood',
            consequence: ['As it begins to grow dark, your group searches for and finds:\n  - tinder\n  - kindling\n  - firewood']
        },
        {
            index: 3, voice: 'the friends', prose: 3,
            command: 'dig a pit in the ground',
            consequence: ['You dig a pit, a foot deep and 3 feet in diameter.']
        },
        {
            index: 4, voice: 'the friends', prose: 4,
            command: 'lay the tinder in the pit',
            consequence: ['You place a patch of fluffy tinder in the pit.']
        },
        {
            index: 5, voice: 'the friends', prose: 5,
            command: 'pile the kindling over the tinder',
            consequence: ['You gently pile the thin, dry sticks of kindling over the tinder.']
        },
        {
            index: 6, voice: 'the friends', prose: 6,
            command: 'stack the logs over the kindling',
            consequence: ['You stack several layers of logs, in square fashion, over the pile of kindling.']
        },
        {
            index: 7, voice: 'the friends', prose: 7,
            command: 'light a match',
            consequence: ['The match head flickers into a tiny flame.'],
            remainder: 'and carefully touches its flame to the tinder.'
        },
        {
            index: 8, voice: 'the friends', prose: 7,
            command: 'touch the flame to the tinder',
            consequence: ['The tinder burns quickly on contact with the flame.'],
            absorbs: [4, 5, 6]
        },
        {
            index: 9, voice: 'the friends', prose: 9,
            command: 'sing',
            consequence: ['You all begin to sing an old song together.']
        },
        {
            index: 10, voice: 'the friends', prose: 10,
            command: 'add logs to the fire',
            consequence: ['The fire burns brightly for awhile, and your group tends to it, adding more logs periodically, as you continue to sing and tell stories.']
        },
        {
            index: 11, voice: 'the friends', prose: 11,
            command: 'sing',
            consequence: ['As your group sings late into the night, you stop adding wood, and the flame dwindles.'],
            remainder: 'The friends retreat to their tents.'
        },
        {
            index: 12, voice: 'the friends', prose: 11,
            command: 'sleep in tents',
            consequence: ['Your group, growing weary, crawl into their tents to sleep.']
        }
    ],
    follows: [8, 12],
    traps: [
        { prose: 8, voice: 'the friends', command: 'spread to the kindling', nudge: 'The friends do not command the fire, my dear.' }
    ],
    candidates: {
        'the Voice of Fire': {
            first: {
                1: [{ event: 4, derives: 'the tinder' }],
                2: [{ event: 5, derives: 'the kindling' }],
                3: [{ event: 6, derives: 'the logs' }],
                4: [{ event: 8, derives: 'the ember' }],
                5: [{ event: 8, derives: 'the flame' }],
                6: [{ event: 8, derives: 'the blaze' }],
                7: [{ event: 10, derives: 'the blaze' }],
                8: [{ event: 12, derives: 'a pile of ash' }]
            }
        }
    },
    nudges: [
        { step: 8, event: 11, text: 'The singing is not ash. What is left behind, afterward, when no one is tending?' },
        { step: 7, event: 7, text: 'The match is a small thing. Look for the hearth burning bright and hot, for a time.' },
        { step: 4, event: 7, text: 'Lit, but not yet touched to anything. Find the touch.' }
    ],
    feelings: [
        'a bit warm, because they sang',
        'a bit neat, because the fire was built to be burnt'
    ],
    apply_text: {
        first: 'You step back. The evening in the woods and the hearth on the board are the same shape. It is pleasant, the way a rhyme is pleasant.'
    }
};
