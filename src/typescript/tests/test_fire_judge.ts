/*
    Tests for the settled core of the Voice of Fire demo: the data lints
    clean and quotes the document verbatim, event names are well formed and
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
    StepIndex, STORIES, StorySpec, VOICE_OF_FIRE, VOICES, WISE_MAN
} from 'demo_worlds/fire/data';
import { apply, candidates_for, erase, lint_sequence, lint_story, new_mapping, pass_for, place, Rejected, violations } from 'demo_worlds/fire/judge';
import { event_names, name_collisions, nominalise } from 'demo_worlds/fire/names';

const FIRE = VOICE_OF_FIRE;
const NUDGE = FIRE.default_nudges;

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
    });

    it('quotes the document verbatim', () => {
        const md = normalise(fs.readFileSync(path.join(__dirname, '..', '..', 'dist', 'posts', 'puzzle_lofty.md'), 'utf8'));
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
                if (e.authored) {
                    continue;
                }
                if (notation_from_md(story, e.index)) {
                    check(e.command, `${story.title} event ${e.index}'s command`);
                }
                for (const paragraph of e.consequence) {
                    check(paragraph, `${story.title} event ${e.index}'s consequence`);
                }
                if (e.remainder !== undefined) {
                    check(e.remainder, `${story.title} event ${e.index}'s remainder`);
                }
            }
        }
    });
});

describe('fire names', () => {
    it('nominalises commands', () => {
        assert.equal(nominalise('lay the tinder in the pit'), 'the laying of the tinder in the pit');
        assert.equal(nominalise('sing'), 'the singing');
        assert.equal(nominalise('be born'), 'the being born');
        assert.equal(nominalise('let it follow'), undefined);
        assert.equal(nominalise('travel'), 'the traveling');
        assert.equal(nominalise('dig a hole'), 'the digging of a hole');
        assert.equal(nominalise('light a match'), 'the lighting of a match');
        assert.equal(nominalise('die unexpectedly'), 'the dying unexpectedly');
        assert.equal(nominalise('write down his teachings'), 'the writing down of his teachings');
        assert.equal(nominalise('move in'), 'the moving in');
        assert.equal(nominalise('grow up and acquire wisdom'), 'the growing up and acquiring of wisdom');
        assert.equal(nominalise('gather tinder, kindling and firewood'), 'the gathering of tinder, kindling and firewood');
        assert.equal(nominalise('turn dry and hot'), 'the turning dry and hot');
        assert.equal(nominalise('stop at the rivers'), 'the stopping at the rivers');
    });

    it('numbers repeats within a sequence', () => {
        const campfire = event_names(CAMPFIRE);
        assert.equal(campfire[8], 'the first singing');
        assert.equal(campfire[10], 'the second singing');
        assert.equal(campfire[3], 'the laying of the tinder in the pit');
        const house = event_names(HOUSE);
        assert.deepEqual(house.slice(0, 4), ['the packing', 'the first traveling', 'the second traveling', 'the third traveling']);
        assert.equal(event_names(FOREST)[0], 'the taking root');
        assert.equal(event_names(WISE_MAN)[8], 'the constructing of a pyre and laying of his body on it');
    });

    it('collide with nothing', () => {
        assert.deepEqual(name_collisions(STORIES, ABSTRACT_SEQUENCES), []);
        // A step named like an event would be caught.
        const clash: AbstractSequence = { ...FIRE, steps: [{ ...FIRE.steps[0], name: 'the first singing' }, ...FIRE.steps.slice(1)] };
        assert.equal(name_collisions(STORIES, [clash]).length, 1);
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
        // The authored nudge wins even when the order rule is the one that fails.
        const with_blaze = chain(CAMPFIRE, [[6, 8]]);
        const r = rejected(CAMPFIRE, with_blaze, 7, 7);
        assert.equal(r.rule, 'L3');
        assert.equal(r.nudge, 'The match is a small thing. Look for the hearth burning bright and hot, for a time.');
    });

    it('rejects spreading to the firewood above spreading to the kindling (L3)', () => {
        const mapping = chain(CAMPFIRE, [[5, 8]]);
        const r = rejected(CAMPFIRE, mapping, 6, 7);
        assert.equal(r.rule, 'L3');
        assert.equal(r.nudge, NUDGE.step[6]);
    });

    it('rejects a spark before the fuel (L3)', () => {
        const mapping = chain(CAMPFIRE, [[4, 8]]);
        const r = rejected(CAMPFIRE, mapping, 1, 10);
        assert.equal(r.rule, 'L3');
        assert.equal(r.nudge, NUDGE.L3);
        // And the fuel placed first, then the spark above it.
        const fuel_late = { ...new_mapping(CAMPFIRE, FIRE, 'first'), placements: [{ step: 1 as StepIndex, event: 10 }] };
        const r2 = rejected(CAMPFIRE, fuel_late, 4, 8);
        assert.equal(r2.rule, 'L3');
        assert.equal(r2.nudge, NUDGE.L3);
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

    it('never reads the voice of an event (L5)', () => {
        const revoiced: StorySpec = {
            ...CAMPFIRE,
            voices: [...CAMPFIRE.voices, 'the Voice of Fire'],
            events: CAMPFIRE.events.map(e => ({ ...e, voice: 'the Voice of Fire' }))
        };
        const a = applied(CAMPFIRE, chain(CAMPFIRE, CAMPFIRE_MAPPING));
        const b = applied(revoiced, chain(revoiced, CAMPFIRE_MAPPING));
        assert.deepEqual(a.participants, b.participants);
        assert.deepEqual(rejected(revoiced, new_mapping(revoiced, FIRE, 'first'), 8, 11), rejected(CAMPFIRE, new_mapping(CAMPFIRE, FIRE, 'first'), 8, 11));
    });
});

describe('the judge: the house in the woods', () => {
    const burning: [StepIndex, number][] = [[4, 12], [5, 13], [6, 13], [7, 13], [8, 13]];

    it('admits the rag as tinder, with either thatch and frame or frame and foundation beneath', () => {
        const a = applied(HOUSE, chain(HOUSE, [[1, 11], [2, 9], [3, 8], ...burning]));
        assert.deepEqual(a.participants.slice(0, 3).map(p => p.derives), ['the oil-soaked rag', 'the thatch', 'the frame']);
        const b = applied(HOUSE, chain(HOUSE, [[1, 11], [2, 8], [3, 7], ...burning]));
        assert.deepEqual(b.participants.slice(0, 3).map(p => p.derives), ['the oil-soaked rag', 'the frame', 'the foundation']);
        assert.equal(a.participants[7].derives, 'a field of ash');
    });

    it('admits the thatch as tinder, which forces the frame and the foundation', () => {
        const thatch = chain(HOUSE, [[1, 9]]);
        const r = rejected(HOUSE, thatch, 2, 9);
        assert.equal(r.rule, 'L6');
        assert.equal(r.nudge, NUDGE.L6);
        const frame = chain(HOUSE, [[2, 8]], thatch);
        assert.equal(rejected(HOUSE, frame, 3, 8).rule, 'L6');
        const full = chain(HOUSE, [[3, 7], ...burning], frame);
        const result = applied(HOUSE, full);
        assert.deepEqual(result.participants.slice(0, 3).map(p => p.derives), ['the thatch', 'the frame', 'the foundation']);
    });

    it('does not mind that the fuel is laid in reverse order', () => {
        // Steps 1–3 are unordered among themselves: foundation, frame, thatch come in the order 7, 8, 9.
        chain(HOUSE, [[3, 7], [2, 8], [1, 9]]);
    });

    it('says the authored nudges', () => {
        const empty = new_mapping(HOUSE, FIRE, 'first');
        assert.equal(rejected(HOUSE, empty, 1, 5).nudge, 'Wood that is cut is not yet laid.');
        assert.equal(rejected(HOUSE, empty, 4, 11).nudge, 'Lit, but not yet touched to anything. What does it fall upon?');
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
            assert.equal(rejected(WISE_MAN, burning, step, 11).rule, 'L4');
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

    it('rejects the literal ash in the second pass (L7)', () => {
        const first = literal_set_aside();
        const second = new_mapping(WISE_MAN, FIRE, 'second');
        const r = rejected(WISE_MAN, second, 8, 11, [first]);
        assert.equal(r.rule, 'L7');
        assert.equal(r.nudge, "That is the first solution's ash. It is spoken for. Where does the wisdom end up?");
        assert.equal(rejected(WISE_MAN, second, 1, 9, [first]).rule, 'L7');
        // Without a set-aside mapping, the lines are simply not candidates.
        assert.equal(rejected(WISE_MAN, second, 8, 11).rule, 'L4');
    });
});

function normalise(s: string): string {
    return s.replace(/\s+/g, ' ').trim();
}
