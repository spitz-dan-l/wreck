/*
    Tests for the settled core of the Voice of Fire demo: the data lints
    clean and quotes the document verbatim, the names are well formed and
    collide with nothing, and the judge admits every mapping the document
    draws and rejects every placement SPEC §4 says it must, with the right
    rule and nudge.
*/
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import 'mocha';
import {
    ABSTRACT_SEQUENCES, AbstractSequence, CAMPFIRE, event_consequence, FOREST, HOUSE, Mapping, PILLAGING,
    StepIndex, STORIES, StorySpec, SUB_SEQUENCES, TODAYS_LESSON, TWO_LINES, VOICE_OF_FIRE, VOICES, WISE_MAN
} from 'demo_worlds/fire/data';
import { CLASSROOM_EVENT_NAMES } from 'demo_worlds/fire/data/katya';
import {
    apply, candidates_for, erase, lint_sequence, lint_story, new_mapping, pass_for, place, Rejected, role_entries, violations
} from 'demo_worlds/fire/judge';
import { event_name, event_names, name_collisions } from 'demo_worlds/fire/names';

const FIRE = VOICE_OF_FIRE;
const NUDGE = FIRE.nudges;

// Place each step in turn, asserting that every placement is admitted.
function chain(story: StorySpec, placements: [StepIndex, number][], mapping = new_mapping(story, FIRE, 'first'), set_aside: Mapping[] = []): Mapping {
    for (const [step, event] of placements) {
        const verdict = place(story, FIRE, mapping, step, event, set_aside);
        assert.ok(verdict.ok, `step ${step} on event ${event} of ${story.title} was rejected: ${(verdict as Rejected).rule} "${(verdict as Rejected).nudge}"`);
        mapping = verdict.mapping;
    }
    return mapping;
}

function rejected(story: StorySpec, mapping: Mapping, step: StepIndex, event: number, set_aside: Mapping[] = []): Rejected {
    const verdict = place(story, FIRE, mapping, step, event, set_aside);
    assert.ok(!verdict.ok, `step ${step} on event ${event} of ${story.title} was admitted, deriving "${verdict.ok && verdict.derives}"`);
    return verdict as Rejected;
}

function applied(story: StorySpec, mapping: Mapping, set_aside: Mapping[] = []) {
    const result = apply(story, FIRE, mapping, set_aside);
    assert.ok(result.ok, `apply failed: ${(result as Rejected).rule} "${(result as Rejected).nudge}"`);
    return result;
}

const CAMPFIRE_MAPPING: [StepIndex, number][] = [[1, 4], [2, 5], [3, 6], [4, 8], [5, 8], [6, 8], [7, 10], [8, 12]];
const LITERAL: [StepIndex, number][] = [[1, 9], [2, 9], [3, 9], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11]];
const FIGURATIVE: [StepIndex, number][] = [[1, 2], [2, 4], [3, 5], [4, 12], [5, 12], [6, 13], [7, 14], [8, 15]];

export function normalise(s: string): string {
    return s.replace(/\s+/g, ' ').trim();
}

// The document, whitespace-normalised, without its footnote markers.
export function document_text(): string {
    const raw = fs.readFileSync(path.join(__dirname, '..', '..', 'dist', 'posts', 'puzzle_lofty.md'), 'utf8');
    return normalise(raw.replace(/\[\d\]/g, ''));
}

describe('fire data', () => {
    it('lints clean', () => {
        for (const seq of ABSTRACT_SEQUENCES) {
            assert.deepEqual(lint_sequence(seq), []);
        }
        for (const story of STORIES) {
            assert.deepEqual(lint_story(story, FIRE), []);
            assert.deepEqual(lint_story(story, PILLAGING), []);
            for (const v of story.voices) {
                assert.ok(VOICES.some(voice => voice.id === v), `${story.title} offers the voice ${v}, which does not exist.`);
            }
        }
        for (const sub of SUB_SEQUENCES) {
            const story = STORIES.find(s => s.id === sub.story)!;
            assert.ok(sub.events.every(e => story.events.some(ev => ev.index === e)));
        }
    });

    it('has the shape the document describes', () => {
        assert.equal(FIRE.steps.length, 8);
        assert.equal(PILLAGING.steps.length, 3);
        assert.deepEqual(STORIES.map(s => s.prose.length), [12, 13, 12, 14]);
        assert.deepEqual(STORIES.map(s => s.events.length), [12, 13, 12, 15]);
        // The second paragraph of the touching of the flame follows from ¶ 8.
        assert.deepEqual(event_consequence(CAMPFIRE, 8), [
            'The tinder burns quickly on contact with the flame.',
            'The fire starts, spreading first to the kindling and then the logs.'
        ]);
        // The house's burning lines all follow from the scattering.
        assert.equal(event_consequence(HOUSE, 13).length, 5);
        assert.equal(event_consequence(HOUSE, 10).length, 3);
        assert.deepEqual(TWO_LINES.events, [9, 11]);
    });

    it('quotes the document verbatim', () => {
        const md = document_text();
        const check = (text: string, what: string) =>
            assert.ok(md.includes(normalise(text)), `${what} is not in the document verbatim: "${text}"`);

        for (const seq of ABSTRACT_SEQUENCES) {
            for (const step of seq.steps) {
                check(step.chalk, `${seq.voice.name} step ${step.index}'s chalk form`);
                if (seq === FIRE) {
                    check(step.command, `step ${step.index}'s command`);
                    check(step.consequence, `step ${step.index}'s consequence`);
                }
            }
        }
        // Where the document gives the notation itself, the commands are quoted too.
        const notation_from_md = (story: StorySpec, event: number) =>
            story === CAMPFIRE || (story === HOUSE && event <= 6);
        for (const story of STORIES) {
            story.prose.forEach((line, i) => check(line, `${story.title} ¶ ${i + 1}`));
            for (const e of story.events) {
                if (e.remainder !== undefined) {
                    check(e.remainder, `${story.title} event ${e.index}'s remainder`);
                }
                if (e.authored) {
                    continue;
                }
                if (notation_from_md(story, e.index)) {
                    check(e.command, `${story.title} event ${e.index}'s command`);
                }
                for (const paragraph of e.consequence) {
                    check(paragraph, `${story.title} event ${e.index}'s consequence`);
                }
            }
            // The apply texts are the document's own sentences, except the campfire's.
            if (story !== CAMPFIRE) {
                for (const paragraphs of Object.values(story.apply_text)) {
                    for (const p of paragraphs) {
                        check(p, `${story.title}'s apply text`);
                    }
                }
            }
        }
    });
});

describe('fire names', () => {
    it('numbers repeats within a sequence and qualifies repeats across sequences', () => {
        const campfire = event_names(CAMPFIRE, STORIES);
        assert.equal(campfire[8], 'the first singing');
        assert.equal(campfire[10], 'the second singing');
        assert.equal(campfire[3], 'the laying of the tinder in the pit');
        const house = event_names(HOUSE, STORIES);
        assert.deepEqual(house.slice(0, 4), ['the packing', 'the first traveling', 'the second traveling', 'the third traveling']);
        assert.equal(event_name(FOREST, 6, STORIES), 'the passing of time, in the forest fire');
        assert.equal(event_name(WISE_MAN, 15, STORIES), "the passing of time, in the wise man's story");
        assert.equal(event_name(WISE_MAN, 1, STORIES), 'the being born');
    });

    it('collide with nothing, as one global set', () => {
        const extra = [...SUB_SEQUENCES.map(s => s.title), TODAYS_LESSON, ...CLASSROOM_EVENT_NAMES];
        assert.deepEqual(name_collisions(STORIES, ABSTRACT_SEQUENCES, extra), []);
        // A step named like an event, or a title named like a role, would be caught.
        const clash: AbstractSequence = { ...FIRE, steps: [{ ...FIRE.steps[0], name: 'the first singing' }, ...FIRE.steps.slice(1)] };
        assert.equal(name_collisions(STORIES, [clash]).length, 1);
        assert.equal(name_collisions(STORIES, ABSTRACT_SEQUENCES, ['the ash']).length, 1);
    });
});

describe('the judge: the campfire', () => {
    it('admits the mapping the document draws', () => {
        const mapping = chain(CAMPFIRE, CAMPFIRE_MAPPING);
        const result = applied(CAMPFIRE, mapping);
        assert.equal(result.mapping.status, 'applied');
        assert.deepEqual(result.participants.map(p => [p.role, p.derives]), [
            ['tinder', 'the tinder'], ['kindling', 'the kindling'], ['firewood', 'the logs'],
            ['ember', 'the ember'], ['flame', 'the flame'], ['blaze', 'the blaze'],
            ['blaze', 'the blaze'], ['ash', 'a pile of ash']
        ]);
        // The roles gain one entry per (role, sequence): the blaze only once.
        assert.deepEqual(role_entries(result.participants, CAMPFIRE.title).map(r => r.role),
            ['tinder', 'kindling', 'firewood', 'ember', 'flame', 'blaze', 'ash']);
    });

    it('rejects the laying of the tinder on the gathering (L4)', () => {
        const r = rejected(CAMPFIRE, new_mapping(CAMPFIRE, FIRE, 'first'), 1, 2);
        assert.equal(r.rule, 'L4');
        assert.equal(r.nudge, NUDGE.step[1]);
    });

    it('rejects anything on either singing (L4)', () => {
        const empty = new_mapping(CAMPFIRE, FIRE, 'first');
        for (const step of FIRE.steps) {
            for (const sing of [9, 11]) {
                assert.equal(rejected(CAMPFIRE, empty, step.index, sing).rule, 'L4');
            }
        }
        assert.equal(rejected(CAMPFIRE, empty, 8, 11).nudge, 'The singing is not ash. What is left behind, afterward, when no one is tending?');
        assert.equal(rejected(CAMPFIRE, empty, 8, 9).nudge, NUDGE.step[8]);
    });

    it('says the authored nudges for the match', () => {
        const empty = new_mapping(CAMPFIRE, FIRE, 'first');
        assert.equal(rejected(CAMPFIRE, empty, 7, 7).nudge, 'The match is a small thing. Look for the hearth burning bright and hot, for a time.');
        assert.equal(rejected(CAMPFIRE, empty, 4, 7).nudge, 'Lit, but not yet touched to anything. Find the touch.');
        // The spark on the match with nothing laid: no order failure, just not a candidate.
        assert.equal(rejected(CAMPFIRE, empty, 4, 7).rule, 'L4');
    });

    it('rejects spreading to the firewood on the stacking after spreading to the kindling on the touch (L3)', () => {
        const mapping = chain(CAMPFIRE, [[5, 8]]);
        const r = rejected(CAMPFIRE, mapping, 6, 6);
        assert.equal(r.rule, 'L3');
        assert.equal(r.nudge, NUDGE.L3);
        // The order rule is checked first, even where a candidate row exists elsewhere.
        assert.equal(rejected(CAMPFIRE, chain(CAMPFIRE, [[6, 8]]), 7, 7).rule, 'L3');
    });

    it('rejects a spark before the fuel (L3), but not before an unplaced prerequisite', () => {
        const mapping = chain(CAMPFIRE, [[4, 8]]);
        const r = rejected(CAMPFIRE, mapping, 1, 10);
        assert.equal(r.rule, 'L3');
        assert.equal(r.nudge, NUDGE.L3);
        // Spark first, nothing laid: fine at placement; apply then fails L1.
        const spark_only = chain(CAMPFIRE, [[4, 8]]);
        const result = apply(CAMPFIRE, FIRE, spark_only);
        assert.ok(!result.ok && result.rule === 'L1');
    });

    it('rejects two fuel steps on one plain event (L6)', () => {
        // The tinder and the kindling both on the gathering: neither is a candidate there, and the gathering absorbs nothing.
        const gathered: Mapping = { ...new_mapping(CAMPFIRE, FIRE, 'first'), placements: [{ step: 1, event: 2 }, { step: 2, event: 2 }] };
        const broken = violations(CAMPFIRE, FIRE, gathered).filter(v => v.rule !== 'L1');
        assert.deepEqual(broken.map(v => [v.rule, v.step]), [['L4', 1], ['L6', 1], ['L4', 2], ['L6', 2]]);
        assert.equal(broken[1].nudge, NUDGE.L6);
        // Reached one placement at a time, the first of the two is refused as not a candidate.
        assert.equal(rejected(CAMPFIRE, new_mapping(CAMPFIRE, FIRE, 'first'), 2, 2).rule, 'L4');
        // Sharing is fine where the event absorbs the steps.
        const shared = chain(CAMPFIRE, [[4, 8], [5, 8], [6, 8]]);
        assert.equal(shared.placements.length, 3);
    });

    it('rejects apply with a hole (L1)', () => {
        const mapping = chain(CAMPFIRE, CAMPFIRE_MAPPING.slice(0, 7));
        const result = apply(CAMPFIRE, FIRE, mapping);
        assert.ok(!result.ok);
        assert.equal(result.rule, 'L1');
        assert.equal(result.step, 8);
        assert.equal(result.nudge, NUDGE.L1);
        // Erasing a step reopens the hole.
        const full = chain(CAMPFIRE, CAMPFIRE_MAPPING);
        assert.equal(apply(CAMPFIRE, FIRE, erase(full, 3)).ok, false);
    });

    it('moves a step that is placed again (L2)', () => {
        const mapping = chain(HOUSE, [[1, 11], [1, 9]]);
        assert.deepEqual(mapping.placements, [{ step: 1, event: 9 }]);
    });

    it('never reads the voices of an event (L5)', () => {
        const revoiced: StorySpec = {
            ...CAMPFIRE,
            voices: [...CAMPFIRE.voices, 'the Voice of Fire'],
            events: CAMPFIRE.events.map(e => ({ ...e, voices: ['the Voice of Fire'] }))
        };
        const a = applied(CAMPFIRE, chain(CAMPFIRE, CAMPFIRE_MAPPING));
        const b = applied(revoiced, chain(revoiced, CAMPFIRE_MAPPING));
        assert.deepEqual(a.participants, b.participants);
        assert.deepEqual(rejected(revoiced, new_mapping(revoiced, FIRE, 'first'), 8, 11), rejected(CAMPFIRE, new_mapping(CAMPFIRE, FIRE, 'first'), 8, 11));
    });
});

describe('the judge: the house in the woods', () => {
    const burning: [StepIndex, number][] = [[5, 13], [6, 13], [7, 13], [8, 13]];

    it('admits all four legal mappings, with the spark on the stick', () => {
        const fuels: [[StepIndex, number], [StepIndex, number], [StepIndex, number]][] = [
            [[1, 11], [2, 9], [3, 8]],
            [[1, 11], [2, 9], [3, 7]],
            [[1, 11], [2, 8], [3, 7]],
            [[1, 9], [2, 8], [3, 7]]
        ];
        const derived = fuels.map(fuel =>
            applied(HOUSE, chain(HOUSE, [...fuel, [4, 12], ...burning])).participants.slice(0, 3).map(p => p.derives));
        assert.deepEqual(derived, [
            ['the oil-soaked rag', 'the thatch', 'the frame'],
            ['the oil-soaked rag', 'the thatch', 'the foundation'],
            ['the oil-soaked rag', 'the frame', 'the foundation'],
            ['the thatch', 'the frame', 'the foundation']
        ]);
    });

    it('admits the rag as both tinder and spark', () => {
        const result = applied(HOUSE, chain(HOUSE, [[1, 11], [2, 9], [3, 8], [4, 11], ...burning]));
        assert.deepEqual(result.participants.slice(0, 4).map(p => p.derives), ['the oil-soaked rag', 'the thatch', 'the frame', 'the lit rag']);
        // With the thatch as tinder, the lit rag still comes after it, so the rules admit that spark as well (a fifth legal mapping).
        applied(HOUSE, chain(HOUSE, [[1, 9], [2, 8], [3, 7], [4, 11], ...burning]));
    });

    it('keeps the fuel lines distinct (L6)', () => {
        const thatch = chain(HOUSE, [[1, 9]]);
        const r = rejected(HOUSE, thatch, 2, 9);
        assert.equal(r.rule, 'L6');
        assert.equal(r.nudge, NUDGE.L6);
        const frame = chain(HOUSE, [[2, 8]], thatch);
        assert.equal(rejected(HOUSE, frame, 3, 8).rule, 'L6');
        chain(HOUSE, [[3, 7]], frame);
    });

    it('does not mind that the fuel is laid in reverse order', () => {
        // Steps 1–3 are unordered among themselves: foundation, frame, thatch come in the order 7, 8, 9.
        chain(HOUSE, [[3, 7], [2, 8], [1, 9]]);
    });

    it('says the authored nudge for the cutting of wood', () => {
        const empty = new_mapping(HOUSE, FIRE, 'first');
        assert.equal(rejected(HOUSE, empty, 1, 5).nudge, 'Wood that is cut is not yet laid.');
        assert.equal(rejected(HOUSE, empty, 2, 1).nudge, NUDGE.step[2]);
    });
});

describe('the judge: the forest fire', () => {
    it('admits the loose mapping', () => {
        const a = applied(FOREST, chain(FOREST, [[1, 7], [2, 7], [3, 5], [4, 8], [5, 9], [6, 9], [7, 10], [8, 12]]));
        assert.deepEqual(a.participants.map(p => p.derives), [
            'the dead brush', 'the dead trees', 'the trees', 'the lightning', 'the flame', 'the fire in the trees', 'the blaze', 'the forest, as ash'
        ]);
        applied(FOREST, chain(FOREST, [[1, 7], [2, 7], [3, 6], [4, 8], [5, 9], [6, 10], [7, 11], [8, 12]]));
    });

    it('keeps the circle and the blaze apart on the burning (L6)', () => {
        const mapping = chain(FOREST, [[6, 10]]);
        assert.equal(rejected(FOREST, mapping, 7, 10).rule, 'L6');
        chain(FOREST, [[7, 11]], mapping);
    });

    it('says the authored nudges', () => {
        const empty = new_mapping(FOREST, FIRE, 'first');
        assert.equal(rejected(FOREST, empty, 1, 1).nudge, 'A seed is not laid to burn. What here is dry?');
        assert.equal(rejected(FOREST, chain(FOREST, [[1, 7]]), 4, 7).nudge, 'Dry is not lit. What strikes?');
    });
});

describe("the judge: the wise man's story", () => {
    function literal_set_aside(): Mapping {
        return { ...applied(WISE_MAN, chain(WISE_MAN, LITERAL)).mapping, status: 'set aside' };
    }

    it('admits the literal solution on two lines', () => {
        const result = applied(WISE_MAN, chain(WISE_MAN, LITERAL));
        assert.deepEqual(result.participants.map(p => p.event), [9, 9, 9, 11, 11, 11, 11, 11]);
        assert.equal(result.participants[7].derives, 'his body, as ash');
    });

    it('rejects all eight steps on the lighting of the pyre (L4 for 1–3; L6)', () => {
        const empty = new_mapping(WISE_MAN, FIRE, 'first');
        const burning = chain(WISE_MAN, LITERAL.slice(3));
        for (const step of [1, 2, 3] as StepIndex[]) {
            assert.equal(rejected(WISE_MAN, empty, step, 11).rule, 'L4');
            const r = rejected(WISE_MAN, burning, step, 11);
            assert.equal(r.rule, 'L4');
            assert.equal(r.nudge, 'It burns here, my dear. Where was it built?');
        }
        const all_on_pyre: Mapping = { ...empty, placements: FIRE.steps.map(s => ({ step: s.index, event: 11 })) };
        const broken = violations(WISE_MAN, FIRE, all_on_pyre);
        assert.deepEqual(broken.filter(v => v.rule === 'L4').map(v => v.step), [1, 2, 3]);
        assert.deepEqual(broken.filter(v => v.rule === 'L6').map(v => v.step), [1, 2, 3, 4, 5, 6, 7, 8]);
        assert.ok(!broken.some(v => v.rule === 'L1'));
    });

    it('sends the fuel steps to the wood in the first pass', () => {
        const empty = new_mapping(WISE_MAN, FIRE, 'first');
        for (const step of [1, 2, 3] as StepIndex[]) {
            for (const event of [2, 4, 5]) {
                assert.equal(rejected(WISE_MAN, empty, step, event).nudge, 'Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep.');
            }
        }
    });

    it('opens the second pass once the first solution is set aside (L7)', () => {
        const first = literal_set_aside();
        assert.equal(pass_for(WISE_MAN, FIRE, []), 'first');
        assert.equal(pass_for(WISE_MAN, FIRE, [first]), 'second');
        const rows = candidates_for(WISE_MAN, FIRE, 'second', [first]);
        for (const step of FIRE.steps) {
            assert.ok(rows[step.index]!.every(c => c.event !== 9 && c.event !== 11));
        }
        // It is L7 that removes them: the table itself still lists the literal rows.
        const unpruned = candidates_for(WISE_MAN, FIRE, 'second', []);
        assert.ok(unpruned[1]!.some(c => c.event === 9) && unpruned[8]!.some(c => c.event === 11));
        // The first pass loses its rows too, if it were somehow asked for.
        assert.deepEqual(candidates_for(WISE_MAN, FIRE, 'first', [first])[1], []);
    });

    it('admits the figurative solution, with either spark', () => {
        const first = literal_set_aside();
        const second = new_mapping(WISE_MAN, FIRE, 'second');
        const myth = applied(WISE_MAN, chain(WISE_MAN, FIGURATIVE, second, [first]), [first]);
        assert.deepEqual(myth.participants.map(p => p.derives), [
            'his wisdom', 'his central followers', 'the wider community', 'the myth of his death', 'the distortions', 'the books', 'the echoes', 'the distorted doctrine'
        ]);
        const with_death = place(WISE_MAN, FIRE, chain(WISE_MAN, FIGURATIVE.filter(([s]) => s !== 4), second, [first]), 4, 8, [first]);
        assert.ok(with_death.ok);
        assert.equal(with_death.derives, 'his death');
        assert.equal(with_death.mark, 'His death. Very well. Hold that.');
        const death = applied(WISE_MAN, with_death.mapping, [first]);
        assert.equal(death.participants[3].event, 8);
        // Both solutions can be held at once: one applied, one set aside, on different events.
        assert.ok(first.placements.every(p => !death.mapping.placements.some(q => q.event === p.event)));
    });

    it('rejects the literal lines in the second pass (L7), and fails without L7', () => {
        const first = literal_set_aside();
        const second = new_mapping(WISE_MAN, FIRE, 'second');
        const r = rejected(WISE_MAN, second, 8, 11, [first]);
        assert.equal(r.rule, 'L7');
        assert.equal(r.nudge, "That is the first solution's ash. It is spoken for. Where does the wisdom end up?");
        const r2 = rejected(WISE_MAN, second, 1, 9, [first]);
        assert.equal(r2.rule, 'L7');
        assert.equal(r2.nudge, NUDGE.L7);
        // With the set-aside mapping withheld from the judge (as if L7 were deleted), the literal lines are admitted again.
        assert.ok(place(WISE_MAN, FIRE, second, 8, 11, []).ok);
        assert.ok(place(WISE_MAN, FIRE, second, 1, 9, []).ok);
    });
});
