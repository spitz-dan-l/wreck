/*
    The wise man's story (SPEC §5.4): the prose (l. 423–449), its events
    (authored, except the lighting of the pyre, which is ¶ 11 verbatim), and
    two candidate tables: the literal solution on two lines, and the
    figurative one, found once the first has been set aside.
*/
import { Nudge, StepIndex, StorySpec } from './types';

const WOOD_MY_DEAR = 'Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep.';

// In the first pass, any fuel step on the lines that the second solution will use.
const first_pass_nudges: Nudge[] = [];
for (const step of [1, 2, 3] as StepIndex[]) {
    for (const event of [2, 4, 5]) {
        first_pass_nudges.push({ step, event, pass: 'first', text: WOOD_MY_DEAR });
    }
}

export const WISE_MAN: StorySpec = {
    id: 'wise_man',
    title: "the wise man's story",
    voices: ['the boy', 'the man', 'the followers', 'the closest followers', 'the books', 'time'],
    prose: [
        'A boy is born to parents of no consequence.',
        'The boy is curious, charismatic, intelligent. He grows up and acquires wisdom.',
        'As a man, he seeks answers to old questions. Questions of purpose, consciousness, the dynamics of reality.',
        'The man gains a small circle of like-minded seekers who listen to him, astounded by his ideas.',
        "The man's followers grow in number. Word of his wisdom spreads, attracting more followers.",
        'The man begins to give speeches to more and more devoted followers. He begins to repeat himself. His words become ear-worms, ever more viral and convincing.',
        "Some of his followers begin to write down the wise man's teachings.",
        'The man dies unexpectedly.',
        'His closest followers construct a great funeral pyre, and lay his body on it.',
        "The wise man's funeral is attended by multitudes of his followers.",
        "The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash.",
        "The most central followers continue to write the dead man's words, and in time they adjust his words, and embellish the stories about him, in the interest of reaching as many people as possible. His death becomes mythologized.",
        "Books spread across the land. The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted.",
        'Time passes. The words are interpretted and reinterpretted until they hardly resemble the original ideas at all.'
    ],
    events: [
        {
            index: 1, voice: 'the boy', prose: 1,
            command: 'be born',
            consequence: ['You are born to parents of no consequence.'],
            authored: true
        },
        {
            index: 2, voice: 'the boy', prose: 2,
            command: 'grow up and acquire wisdom',
            consequence: ['You are curious, charismatic, intelligent. You grow up and acquire wisdom.'],
            authored: true
        },
        {
            index: 3, voice: 'the man', prose: 3,
            command: 'seek answers to old questions',
            consequence: ['You seek answers to old questions. Questions of purpose, consciousness, the dynamics of reality.'],
            authored: true
        },
        {
            index: 4, voice: 'the man', prose: 4,
            command: 'gain a small circle of seekers',
            consequence: ['You gain a small circle of like-minded seekers who listen to you, astounded by your ideas.'],
            authored: true
        },
        {
            index: 5, voice: 'the followers', prose: 5,
            command: 'grow in number',
            consequence: ['You grow in number. Word of his wisdom spreads, and more of you come.'],
            authored: true
        },
        {
            index: 6, voice: 'the man', prose: 6,
            command: 'give speeches',
            consequence: ['You give speeches to more and more devoted followers. You begin to repeat yourself. Your words become ear-worms, ever more viral and convincing.'],
            authored: true
        },
        {
            index: 7, voice: 'the followers', prose: 7,
            command: 'write down his teachings',
            consequence: ["Some of you begin to write down the wise man's teachings."],
            authored: true
        },
        {
            index: 8, voice: 'the man', prose: 8,
            command: 'die unexpectedly',
            consequence: ['You die unexpectedly.'],
            authored: true
        },
        {
            index: 9, voice: 'the closest followers', prose: 9,
            command: 'construct a pyre and lay his body on it',
            consequence: ['You construct a great funeral pyre, and lay his body on it.'],
            absorbs: [1, 2, 3],
            authored: true
        },
        {
            index: 10, voice: 'the followers', prose: 10,
            command: 'attend the funeral',
            consequence: ["You attend the wise man's funeral in multitudes."],
            authored: true
        },
        {
            index: 11, voice: 'the closest followers', prose: 11,
            command: 'light the pyre',
            consequence: ["The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash."],
            absorbs: [4, 5, 6, 7, 8]
        },
        {
            index: 12, voice: 'the closest followers', prose: 12,
            command: 'adjust and embellish his words',
            consequence: ["You continue to write the dead man's words, and in time you adjust his words, and embellish the stories about him, in the interest of reaching as many people as possible. His death becomes mythologized."],
            absorbs: [4, 5],
            authored: true
        },
        {
            index: 13, voice: 'the books', prose: 13,
            command: 'spread across the land',
            consequence: ['Books spread across the land.'],
            remainder: "The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted.",
            authored: true
        },
        {
            index: 14, voice: 'the books', prose: 13,
            command: 'be read and repeated and reprinted',
            consequence: ["The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted."],
            authored: true
        },
        {
            index: 15, voice: 'time', prose: 14,
            command: 'pass',
            consequence: ['Time passes. The words are interpreted and reinterpreted until they hardly resemble the original ideas at all.'],
            authored: true
        }
    ],
    follows: [],
    traps: [],
    candidates: {
        'the Voice of Fire': {
            first: {
                1: [{ event: 9, derives: "the pyre's tinder" }],
                2: [{ event: 9, derives: "the pyre's kindling" }],
                3: [{ event: 9, derives: "the pyre's wood" }],
                4: [{ event: 11, derives: 'the flame' }],
                5: [{ event: 11, derives: 'the flame' }],
                6: [{ event: 11, derives: 'the blaze' }],
                7: [{ event: 11, derives: 'the blaze' }],
                8: [{ event: 11, derives: 'his body, as ash' }]
            },
            second: {
                1: [{ event: 2, derives: 'his wisdom' }],
                2: [{ event: 4, derives: 'his central followers' }],
                3: [{ event: 5, derives: 'the wider community' }],
                4: [
                    { event: 12, derives: 'the myth of his death' },
                    { event: 8, derives: 'his death', mark: 'His death. Very well. Hold that.' }
                ],
                5: [{ event: 12, derives: 'the distortions' }],
                6: [{ event: 13, derives: 'the books' }],
                7: [{ event: 14, derives: 'the echoes' }],
                8: [{ event: 15, derives: 'the distorted doctrine' }]
            }
        }
    },
    nudges: [
        ...first_pass_nudges,
        { step: 8, event: 11, pass: 'second', text: "That is the first solution's ash. It is spoken for. Where does the wisdom end up?" }
    ],
    feelings: [
        'a bit relieving, at first, because only two lines burned',
        'then not, because all of them did',
        "unconvincing, because you don't really see it"
    ],
    apply_text: {
        first: "Two lines, boxed. The rest of the man's life stands outside the box, unburnt. You are relieved, and you notice that you are relieved.",
        second: "It locks. Wisdom, circle, community, myth, distortion, echo, ash. The whole man's life is in the box now, and nothing is outside it."
    }
};
