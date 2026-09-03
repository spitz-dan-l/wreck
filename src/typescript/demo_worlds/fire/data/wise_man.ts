/*
    The wise man's story (SPEC §5.4): the prose (l. 423–449), its events
    (authored, except the lighting of the pyre, which is ¶ 11 verbatim), and
    two candidate tables: the literal solution on two lines, and the
    figurative one, found once the first has been set aside. Also "the two
    lines", the sub-sequence the literal solution registers.
*/
import { Nudge, StorySpec, SubSequenceSpec } from './types';

const WOOD_MY_DEAR = 'Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep.';
const IT_BURNS_HERE = 'It burns here, my dear. Where was it built?';

// The fuel steps on the lines the second solution will use, and on the burning itself: the literal pass's nudges.
const fuel_nudges: Nudge[] = [];
for (const step of [1, 2, 3]) {
    for (const event of [2, 4, 5]) {
        fuel_nudges.push({ step, event, text: WOOD_MY_DEAR, pass: 'first' });
    }
    fuel_nudges.push({ step, event: 11, text: IT_BURNS_HERE, pass: 'first' });
}

const LITERAL_ROWS = {
    1: [{ event: 9, derives: "the pyre's tinder" }],
    2: [{ event: 9, derives: "the pyre's kindling" }],
    3: [{ event: 9, derives: "the pyre's wood" }],
    4: [{ event: 11, derives: 'the flame' }],
    5: [{ event: 11, derives: 'the flame' }],
    6: [{ event: 11, derives: 'the blaze' }],
    7: [{ event: 11, derives: 'the blaze' }],
    8: [{ event: 11, derives: 'his body, as ash' }]
};

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
            index: 1, voices: ['the boy'], prose: 1,
            command: 'be born',
            name: 'the being born',
            consequence: ['You are born to parents of no consequence.'],
            authored: true
        },
        {
            index: 2, voices: ['the boy'], prose: 2,
            command: 'grow up and acquire wisdom',
            name: 'the growing up and acquiring of wisdom',
            consequence: ['You are curious, charismatic, intelligent. You grow up and acquire wisdom.'],
            authored: true
        },
        {
            index: 3, voices: ['the man'], prose: 3,
            command: 'seek answers to old questions',
            name: 'the seeking of answers',
            consequence: ['You seek answers to old questions. Questions of purpose, consciousness, the dynamics of reality.'],
            authored: true
        },
        {
            index: 4, voices: ['the man'], prose: 4,
            command: 'gain a small circle of seekers',
            name: 'the gaining of a small circle',
            consequence: ['You gain a small circle of like-minded seekers who listen to you, astounded by your ideas.'],
            authored: true
        },
        {
            index: 5, voices: ['the followers'], prose: 5,
            command: 'grow in number',
            name: 'the growing in number',
            consequence: ["You grow in number. Word of the man's wisdom spreads, and more of you come."],
            authored: true
        },
        {
            index: 6, voices: ['the man'], prose: 6,
            command: 'give speeches',
            name: 'the giving of speeches',
            consequence: ['You give speeches to more and more devoted followers. You begin to repeat yourself. Your words become ear-worms, ever more viral and convincing.'],
            authored: true
        },
        {
            index: 7, voices: ['the followers'], prose: 7,
            command: 'write down his teachings',
            name: 'the writing down of his teachings',
            consequence: ["Some of you begin to write down the wise man's teachings."],
            authored: true
        },
        {
            index: 8, voices: ['the man'], prose: 8,
            command: 'die unexpectedly',
            name: 'the dying unexpectedly',
            consequence: ['You die unexpectedly.'],
            authored: true
        },
        {
            index: 9, voices: ['the closest followers'], prose: 9,
            command: 'construct a pyre and lay his body on it',
            name: 'the constructing of the pyre',
            consequence: ['You construct a great funeral pyre, and lay his body on it.'],
            absorbs: [1, 2, 3],
            authored: true
        },
        {
            index: 10, voices: ['the followers'], prose: 10,
            command: 'attend the funeral',
            name: 'the attending of the funeral',
            consequence: ["You attend the wise man's funeral in multitudes."],
            authored: true
        },
        {
            index: 11, voices: ['the closest followers'], prose: 11,
            command: 'light the pyre',
            name: 'the lighting of the pyre',
            consequence: ["The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash."],
            absorbs: [4, 5, 6, 7, 8]
        },
        {
            index: 12, voices: ['the closest followers'], prose: 12,
            command: 'adjust and embellish his words',
            name: 'the adjusting of his words',
            consequence: ["You continue to write the dead man's words, and in time you adjust his words, and embellish the stories about him, in the interest of reaching as many people as possible. His death becomes mythologized."],
            absorbs: [4, 5],
            authored: true
        },
        {
            index: 13, voices: ['the books'], prose: 13,
            command: 'spread across the land',
            name: 'the spreading across the land',
            consequence: ['Books spread across the land.'],
            remainder: "The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted.",
            authored: true
        },
        {
            index: 14, voices: ['the books'], prose: 13,
            command: 'be read and repeated and reprinted',
            name: 'the being read and repeated and reprinted',
            consequence: ["The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted."],
            authored: true
        },
        {
            index: 15, voices: ['time'], prose: 14,
            command: 'pass',
            name: 'the passing of time',
            consequence: ['Time passes. The words are interpreted and reinterpreted until they hardly resemble the original ideas at all.'],
            authored: true
        }
    ],
    follows: [],
    traps: [],
    // Two solutions (SPEC §9 beats 4–5): mapping begins after l. 451, and the first may be set aside after l. 467.
    map_after: 'say that the Voice of Fire is contained in just two lines',
    set_aside_after: 'ask what she means',
    candidates: {
        'the Voice of Fire': {
            first: LITERAL_ROWS,
            // The literal rows are listed again so that L7, not the table, removes them (SPEC §4 L7).
            second: {
                1: [...LITERAL_ROWS[1], { event: 2, derives: 'his wisdom' }],
                2: [...LITERAL_ROWS[2], { event: 4, derives: 'his central followers' }],
                3: [...LITERAL_ROWS[3], { event: 5, derives: 'the wider community' }],
                4: [
                    ...LITERAL_ROWS[4],
                    { event: 12, derives: 'the myth of his death' },
                    { event: 8, derives: 'his death', mark: '"His death. Very well. Hold that," says Katya.' }
                ],
                5: [...LITERAL_ROWS[5], { event: 12, derives: 'the distortions' }],
                6: [...LITERAL_ROWS[6], { event: 13, derives: 'the books' }],
                7: [...LITERAL_ROWS[7], { event: 14, derives: 'the echoes' }],
                8: [...LITERAL_ROWS[8], { event: 15, derives: 'the distorted doctrine' }]
            }
        }
    },
    nudges: fuel_nudges,
    // The second pass is corrected in the figurative reading's terms (l. 471), not the literal fire's.
    step_nudges: {
        first: {
            4: 'Nothing burns here yet, my dear. Find the lighting.'
        },
        second: {
            1: 'Not wood this time, my dear. What was laid in him, before anyone else came?',
            2: 'Who caught from him first, my dear? The few, before the many.',
            3: 'And who caught from them? The many.',
            4: 'What set it going, once he could no longer speak for himself?',
            5: 'What spread, my dear, and through whom?',
            6: 'What spread, my dear, and through whom?',
            7: 'Where did it burn longest, and in whose hands?',
            8: 'What is left of him at the end, my dear? Not his body.'
        }
    },
    feelings: [
        'a bit relieving, at first, because only two lines burned',
        'then not, because all of them did'
    ],
    grafted_feeling: "unconvincing, because you don't really see it",
    apply_after: {
        first: ['"Now, my dear, please find the second solution," says Katya.']
    },
    apply_text: {
        first: [
            'You do. Just',
            'His closest followers construct a great funeral pyre, and lay his body on it.',
            'and',
            "The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash.",
            'participate in the mapping.'
        ],
        second: [
            "It takes you some time, but you gradually work it out. The construction of the fireplace is the replication of the man's wisdom within his mind (tinder), his initial and central followers (kindling), and the wider community of followers (firewood). The mythologizing of his death marks the spark, which yields ever increasing distortions to his ideology, which spread through his original community and beyond. At the end, his wisdom has become ash, spread far and wide across the adherents to the book."
        ]
    }
};

// The literal solution's two lines, registered as a sequence of their own when it is applied.
export const TWO_LINES: SubSequenceSpec = {
    id: 'two_lines',
    title: 'the two lines',
    story: 'wise_man',
    pass: 'first',
    events: [9, 11],
    feelings: ['contained, because everything else stood outside']
};
