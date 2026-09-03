/*
    The whole demo, played by commands (SPEC §11.4–5), once, in a `before`;
    then one `it` per beat checks, against the recorded worlds, that the
    expected .md line is in the frame; that every trap is enumerable and
    Available and, issued, prints its nudge and advances nothing; that wrong
    maps print the right nudge; that `set aside` reverses an apply; that
    `say that you see it` is Locked; that the end state has both wise-man
    mappings and the roles as expected; and that at the scripted states
    every candidate placement is enumerable. WALKTHROUGH is also the
    acceptance script for play.js.
*/
import * as assert from 'assert';
import 'mocha';
import { candidates_for, place, placed } from 'demo_worlds/fire/judge';
import { EVENT_NAMES, fire_world_spec, FireWorld, new_fire_world, PILLAGING, STORIES, StorySpec, VOICE_OF_FIRE, WISE_MAN } from 'demo_worlds/fire';
import { AUTHORED, QUOTED } from 'demo_worlds/fire/data/katya';
import { SCRIPT } from 'demo_worlds/fire/puffers/classroom';
import { applied_mapping, expanded_chip, mappings_on, open_mapping, remainder, role_history, sequence_finished, set_aside_mappings } from 'demo_worlds/fire/world';
import { raw, traverse_thread } from 'parser';
import { apply_story_updates_all, Story, to_basic_text, Updates as S } from 'story';
import { apply_command, make_update_thread } from 'world';
import { document_text, normalise, unquote } from './test_fire_judge';

const FIRE = VOICE_OF_FIRE;

// One step of the walkthrough: a command, and what must be true after it.
export interface Step {
    cmd: string;
    label?: string;                     // a name for the world after it, for world_at
    expect?: string[];                  // text that must appear in the command's own frame afterwards
    expect_tree?: string[];             // text that must appear anywhere in the story (the board)
    trap?: string;                      // if set, the command is a trap: prints this nudge and changes nothing
    check?: (w: FireWorld, before: FireWorld) => void;
}

const step_name = (n: number) => FIRE.steps[n - 1].name;
const ev = (story: StorySpec, n: number) => EVENT_NAMES[story.id][n - 1];
export const map_cmd = (story: StorySpec, s: number, e: number) => `map ${step_name(s)} to ${ev(story, e)}`;
const [CAMPFIRE, HOUSE, FOREST] = STORIES;

function maps(story: StorySpec, placements: [number, number][]): Step[] {
    return placements.map(([s, e]) => ({ cmd: map_cmd(story, s, e) }));
}

// Every candidate placement of the current pass is a command the parser accepts.
function candidates_enumerable(story: StorySpec) {
    return (w: FireWorld) => {
        const aside = set_aside_mappings(w, story);
        const pass = aside.length > 0 ? 'second' : 'first';
        const rows = candidates_for(story, FIRE, pass, aside);
        for (const step of FIRE.steps) {
            for (const c of rows[step.index]!) {
                assert.ok(accepts(w, map_cmd(story, step.index, c.event)), `${map_cmd(story, step.index, c.event)} is not accepted`);
            }
        }
        assert.ok(accepts(w, 'apply the Voice of Fire'));
    };
}

// The L1 nudge, then the plain list of every step still off the board.
const L1 = (...steps: number[]) =>
    `The Voice of Fire does not skip, my dear. ${step_name(steps[0])[0].toUpperCase()}${step_name(steps[0]).slice(1)} is not on the board.`
    + ` Unplaced: ${steps.map(step_name).join(', ')}.`;
const ALL_STEPS = [1, 2, 3, 4, 5, 6, 7, 8];

// A line the character cannot yet say is offered Locked (SPEC §0.11): its verb typed, the rest shows dimmed.
function locked(w: FireWorld, verb: string, rest: string) {
    const options = typeahead(w, verb);
    assert.ok(options.some(o => o.availability === 'Locked' && o.tokens.join(' ') === rest), `"${verb} ${rest}" is not Locked: ${JSON.stringify(options)}`);
    assert.ok(!accepts(w, `${verb} ${rest}`));
}
const current = (w: FireWorld, role: string) => role_history(w, role).filter(r => r.current);

// The walkthrough, beat by beat.
export const BEATS: { name: string, steps: Step[] }[] = [
    { name: 'beat 0: the classroom', steps: [
        { cmd: 'look at the board', expect: AUTHORED.shelf, check: w => assert.ok(accepts(w, 'remember the Pillaging')) },
        { cmd: 'remember the Pillaging', expect: ['Someone lives in their home.', 'take things from their home'] },
        // Nothing to fold before the notation exists: neither expand nor collapse is offered yet.
        { cmd: 'listen', expect: QUOTED.l162, expect_tree: ['The laying of the tinder', 'The ash left behind'],
          check: w => assert.ok(!accepts(w, 'expand the steps') && !accepts(w, 'collapse the steps')) },
        { cmd: 'remember the Voice of Fire', expect: ['The ash left behind'], check: w => assert.ok(!frame_text(w).includes('reduce to ash')) },
        { cmd: 'listen', expect: QUOTED.l182, expect_tree: ['lay the tinder', 'A pile of black ash is left behind in the hearth.'],
          check: w => assert.ok(accepts(w, 'remember the laying of the tinder') && accepts(w, 'collapse the steps') && !accepts(w, 'expand the steps')) },
        { cmd: 'remember the Voice of Fire', label: 'notation remembered', expect: ['reduce to ash'] },
        { cmd: 'remember the kindling', expect: ['Nothing has been the kindling yet.'] },
        { cmd: 'listen', expect: [...QUOTED.l218, CAMPFIRE.prose[0], CAMPFIRE.prose[11]] },
        { cmd: 'say that the Voice of Fire is contained in this one', expect: [...QUOTED.l244, ...QUOTED.l246] },
        { cmd: 'pick up the chalk', expect: QUOTED.l248,
          check: w => assert.deepEqual(commands(w).filter(c => !c.startsWith('remember') && !c.startsWith('collapse') && !c.startsWith('expand')), ['speak as the friends']) }
    ] },
    { name: 'beat 1: the campfire', steps: [
        // No mark in the text before Katya teaches the notation (l. 350).
        { cmd: 'speak as the friends', expect: ['You speak as the friends.'],
          check: w => { assert.equal(w.voice, 'the friends'); assert.ok(!frame_text(w).includes('— the friends —')); } },
        { cmd: 'travel to the woods', expect: ['You arrive at the campground in the woods.'] },
        { cmd: 'gather tinder, kindling and firewood' },
        { cmd: 'dig a pit in the ground' },
        { cmd: 'lay the tinder in the pit' },
        { cmd: 'pile the kindling over the tinder' },
        { cmd: 'stack the logs over the kindling' },
        { cmd: 'light a match', check: w => { assert.equal(w.cursor, 7); assert.equal(remainder(w, CAMPFIRE), 'and carefully touches its flame to the tinder.'); } },
        { cmd: 'touch the flame to the tinder', label: 'campfire touched', check: w => { assert.equal(w.cursor, 8); assert.equal(remainder(w, CAMPFIRE), undefined); } },
        { cmd: 'spread to the kindling', trap: 'The friends do not command the fire, my dear. Let it follow.' },
        { cmd: 'let it follow', expect: ['↳ The fire starts, spreading first to the kindling and then the logs.'] },
        { cmd: 'sing' },
        { cmd: 'add logs to the fire' },
        { cmd: 'sing' },
        { cmd: 'sleep in tents' },
        { cmd: 'let it follow', check: w => assert.equal(w.cursor, 13) },
        { cmd: 'draw a vertical line', label: 'campfire lined', expect: QUOTED.l309, check: candidates_enumerable(CAMPFIRE) },
        { cmd: map_cmd(CAMPFIRE, 8, 11), trap: 'The singing is not ash. What is left behind, afterward, when no one is tending?' },
        { cmd: map_cmd(CAMPFIRE, 1, 2), trap: FIRE.nudges.step[1]! },
        { cmd: 'apply the Voice of Fire', trap: L1(...ALL_STEPS) },
        { cmd: map_cmd(CAMPFIRE, 1, 4), label: 'campfire first map', expect: ['→ the laying of the tinder in the pit'] },
        // Erasing a step leaves nothing behind on the row; re-mapping it comes back.
        { cmd: 'erase the laying of the tinder', label: 'campfire erased', check: w => { assert.equal(open_mapping(w, CAMPFIRE)!.placements.length, 0); assert.ok(!accepts(w, 'erase the laying of the tinder')); } },
        { cmd: 'apply the Voice of Fire', trap: L1(...ALL_STEPS) },
        ...maps(CAMPFIRE, [[1, 4], [2, 5], [3, 6], [4, 8], [5, 8], [6, 8], [7, 10]]),
        { cmd: 'apply the Voice of Fire', trap: L1(8) },
        ...maps(CAMPFIRE, [[8, 12]]),
        { cmd: 'apply the Voice of Fire', label: 'campfire applied', expect: [...CAMPFIRE.apply_text.first!, '> lay the tinder — a patch of tinder'], expect_tree: ['— the ash'],
          check: w => {
              assert.deepEqual(role_history(w, 'tinder'), [{ what: 'a patch of tinder', where: CAMPFIRE.title, current: true }]);
              // The rendition is grouped by event: the three steps on the touch share one consequence.
              assert.equal(frame_text(w).split('The tinder burns quickly on contact with the flame.').length - 1, 1);
              assert.ok(!accepts(w, 'apply the Voice of Fire'));
          } },
        { cmd: 'set aside the mapping', label: 'campfire set aside', check: w => {
            assert.deepEqual(role_history(w, 'tinder'), [{ what: 'a patch of tinder', where: CAMPFIRE.title, current: false }]);
            assert.ok(!text(w).includes('> lay the tinder — a patch of tinder'));
            assert.ok(!text(w).includes('— the ash'));
            assert.equal(applied_mapping(w, CAMPFIRE), undefined);
            // No second pass here: the mapping is open again with its placements kept.
            assert.ok(!accepts(w, 'say all set') && accepts(w, 'resume the mapping') && accepts(w, 'apply the Voice of Fire'));
            assert.ok(accepts(w, 'erase the laying of the tinder') && accepts(w, map_cmd(CAMPFIRE, 1, 4)));
        } },
        { cmd: 'resume the mapping', label: 'campfire resumed', check: w => {
            assert.deepEqual(current(w, 'tinder').map(r => r.what), ['a patch of tinder']);
            // A resume prints the rendition alone, never the apply text again.
            assert.ok(!frame_text(w).includes(normalise(CAMPFIRE.apply_text.first![0])));
            assert.ok(text(w).includes('> lay the tinder — a patch of tinder'));
            assert.equal(applied_mapping(w, CAMPFIRE)?.status, 'applied');
        } },
        { cmd: 'say all set', label: 'campfire closed', expect: [...QUOTED.l313, ...QUOTED.l315], check: w => assert.ok(accepts(w, 'remember the campfire story')) },
        { cmd: 'remember the campfire story', expect: ['It went like this:', 'It felt:', '— a bit warm, because they sang', '— like the Voice of Fire, because the tinder was a patch of tinder'] },
        { cmd: 'remember the tinder', expect: ['The tinder has been: a patch of tinder, in the campfire story.'] },
        { cmd: 'remember the touching of the flame to the tinder', expect: ['It went like this:', 'It felt like the ember, and the flame, and the blaze, in the Voice of Fire.'],
          check: w => assert.ok(!frame_text(w).includes('— the ember, in the Voice of Fire')) },
        { cmd: 'remember the ember', expect: ["The ember has been: the match's flame, in the campfire story."] },
        // l. 288 belongs to the touch alone, not to the match.
        { cmd: 'remember the lighting of a match', expect: ['The match head flickers into a tiny flame.', 'It has not been read in any voice yet.'],
          check: w => assert.ok(!frame_text(w).includes(normalise(CAMPFIRE.prose[7]))) },
        { cmd: 'expand the campfire story', label: 'campfire chip expanded', check: w => assert.ok(!w.collapsed.includes('campfire:chip') && accepts(w, 'collapse the campfire story')) },
        { cmd: 'collapse the campfire story', label: 'campfire chip collapsed', check: w => assert.ok(w.collapsed.includes('campfire:chip')) }
    ] },
    { name: 'beat 2: the house', steps: [
        { cmd: 'listen', expect: [HOUSE.prose[0], HOUSE.prose[12]] },
        { cmd: 'say that it is a sad story', expect: [...QUOTED.l344, ...QUOTED.l346] },
        { cmd: 'pick up the chalk' },
        { cmd: 'speak as the family' },
        { cmd: 'pack' }, { cmd: 'travel' }, { cmd: 'travel' }, { cmd: 'travel' },
        { cmd: 'cut wood' }, { cmd: 'dig a hole' }, { cmd: 'build the foundation' }, { cmd: 'raise the frame' },
        { cmd: 'lay walls and a roof', expect: ['a roof of thatch'] },
        { cmd: 'move in' },
        { cmd: 'let it follow' },
        { cmd: 'let it follow', label: 'house second follow', check: w => {
            assert.equal(w.cursor, 9);
            assert.ok(accepts(w, 'light the rag') && accepts(w, 'ask what the right thing to do is'));
            assert.ok(!accepts(w, 'speak as the children'));
        } },
        { cmd: 'light the rag', trap: 'You are still speaking as the family, my dear. Would the family light the rag? Change the voice, then command.' },
        { cmd: 'ask what the right thing to do is', expect: [...QUOTED.l348, ...QUOTED.l350, ...AUTHORED.voice_switches, ...QUOTED.l350b],
          check: w => assert.ok(accepts(w, 'speak as the children')) },
        { cmd: 'speak as the children', label: 'children speaking', expect: ['— the children —', 'You speak as the children.'] },
        { cmd: 'light the rag', expect: ['one of you lights an oil-soaked rag'] },
        { cmd: 'hurl it onto the roof' },
        { cmd: 'scatter', expect: AUTHORED.burning_lines, check: w => assert.equal(w.cursor, 10) },
        { cmd: 'spread to the thatch', label: 'thatch trap', trap: 'The children have run, my dear.' },
        { cmd: 'speak as the family', trap: 'No one speaks here, my dear. Let it follow.' },
        { cmd: 'let it follow' }, { cmd: 'let it follow' }, { cmd: 'let it follow' }, { cmd: 'let it follow' },
        { cmd: 'draw a vertical line', expect: QUOTED.l383, check: candidates_enumerable(HOUSE) },
        { cmd: map_cmd(HOUSE, 1, 9) },
        { cmd: map_cmd(HOUSE, 2, 9), trap: FIRE.nudges.L6 },
        { cmd: map_cmd(HOUSE, 1, 11) },
        ...maps(HOUSE, [[2, 9], [3, 8], [4, 12], [5, 13], [6, 13], [7, 13], [8, 13]]),
        { cmd: 'apply the Voice of Fire', label: 'house applied', expect: HOUSE.apply_text.first!, check: w => {
            assert.deepEqual(current(w, 'tinder').map(r => r.what), ['a patch of tinder', 'the oil-soaked rag']);
            // l. 385 reports having tried both tinders (l. 140): Locked until the thatch has been read too.
            locked(w, 'object', 'that there is no clear tinder');
            assert.ok(!accepts(w, 'put down the chalk'));
        } },
        // l. 336 belongs to the scattering alone, not to the lighting of the rag; one annotation per role on the scattering.
        { cmd: 'remember the lighting of the rag', check: w => assert.ok(!frame_text(w).includes(normalise(HOUSE.prose[9]))) },
        { cmd: 'remember the scattering', expect: ['It felt like the flame, and the blaze, and the ash, in the Voice of Fire.'],
          check: w => assert.equal(frame_text(w).split('— the blaze').length - 1, 1) },
        // A change of mind after apply (l. 140): the thatch as tinder, the lit rag as spark (the fifth legal mapping).
        { cmd: 'set aside the mapping', check: w => {
            // The mapping reopens with its placements kept; the thatch can be tried.
            assert.equal(open_mapping(w, HOUSE)!.placements.length, 8);
            assert.ok(accepts(w, map_cmd(HOUSE, 2, 8)));
        } },
        // Erased, the spark's event (the hurling) is unmapped again: 5 of the 13 events were mapped, now 4.
        { cmd: `erase ${step_name(4)}`, check: w => assert.equal(placed(open_mapping(w, HOUSE)!, 4), undefined) },
        { cmd: 'collapse the unmapped', label: 'house unmapped folded', expect_tree: ['▸ 9 events not in the mapping'] },
        // Each fuel line must be freed before another step takes it (L6): foundation, then frame, then thatch.
        { cmd: map_cmd(HOUSE, 1, 9), trap: FIRE.nudges.L6 },
        ...maps(HOUSE, [[3, 7], [2, 8], [1, 9]]),
        // The spark on the stick: the bar's count follows the later map.
        { cmd: map_cmd(HOUSE, 4, 11), label: 'house spark on the stick', check: (w, before) => assert.ok(text(before).includes('▸ 9 events not in the mapping') && text(w).includes('▸ 8 events not in the mapping')) },
        { cmd: 'expand the unmapped', check: w => assert.ok(!text(w).includes('events not in the mapping')) },
        { cmd: 'apply the Voice of Fire', check: w => {
            assert.deepEqual(current(w, 'tinder').map(r => r.what), ['a patch of tinder', 'the thatch']);
            // The second apply of the pass prints the rendition alone; both tinders read, l. 385 can be said.
            assert.ok(!frame_text(w).includes(normalise(HOUSE.apply_text.first![0])));
            assert.ok(frame_text(w).includes('> lay the tinder — the thatch'));
            assert.ok(accepts(w, 'object that there is no clear tinder'));
        } },
        // The history of readings keeps the rag, marked.
        { cmd: 'remember the tinder', expect: ['The tinder has been: a patch of tinder, in the campfire story; the oil-soaked rag, in the house in the woods, set aside; the thatch, in the house in the woods.'] },
        { cmd: 'object that there is no clear tinder', expect: [...QUOTED.l385, ...QUOTED.l387] },
        { cmd: 'say that it knows nothing of the morality of the burning either', expect: [...QUOTED.l389, ...QUOTED.l391] },
        { cmd: 'put down the chalk', label: 'house closed', expect: QUOTED.l393, check: w => assert.equal(w.board, undefined) },
        { cmd: `remember ${HOUSE.title}`, expect: ['— like the Voice of Fire, because the tinder was the thatch, and before that the oil-soaked rag'] }
    ] },
    { name: 'beat 3: the forest', steps: [
        { cmd: 'listen', expect: [FOREST.prose[0]] },
        { cmd: 'pick up the chalk', check: w => {
            assert.equal(w.voice, undefined);
            const cmds = commands(w).filter(c => !c.startsWith('remember') && !c.startsWith('collapse') && !c.startsWith('expand'));
            assert.deepEqual(cmds.sort(), FOREST.voices.map(v => `speak as ${v}`).concat(['speak as the Voice of Fire']).sort());
        } },
        { cmd: 'speak as the Voice of Fire', trap: FOREST.traps[0].nudge },
        { cmd: 'speak as the fire', trap: 'No line here for the fire, my dear. Who acts?' },
        { cmd: 'speak as the seed', expect: ['— the seed —', ...AUTHORED.disembodied] },
        { cmd: 'take root' },
        { cmd: 'speak as the season', expect: [...AUTHORED.abstract, ...QUOTED.l419b] },
        { cmd: 'turn', expect: ['The season turns. The weather is right, and a sapling rises forth.'] },
        { cmd: 'speak as the tree', check: w => assert.ok(!frame_text(w).includes(normalise(AUTHORED.disembodied[2]))) },
        { cmd: 'grow' }, { cmd: 'sprout leaves and seeds' },
        { cmd: 'speak as the forest' }, { cmd: 'spread' },
        { cmd: 'speak as time' }, { cmd: 'pass' },
        { cmd: 'speak as the weather' }, { cmd: 'turn dry and hot' }, { cmd: 'bring a thunderstorm' },
        { cmd: 'speak as the fire' }, { cmd: 'spread to the dead brush' }, { cmd: 'burn in a growing circle' },
        { cmd: 'consume the forest' }, { cmd: 'stop at the rivers' },
        { cmd: 'draw a vertical line', expect: QUOTED.l419, check: candidates_enumerable(FOREST) },
        ...maps(FOREST, [[1, 7], [2, 7], [3, 5], [4, 8], [5, 9], [6, 9], [7, 10], [8, 12]]),
        { cmd: 'apply the Voice of Fire', expect: FOREST.apply_text.first! },
        // The forest's set aside reopens the mapping too; a second apply repeats nothing in the roles.
        { cmd: 'set aside the mapping', check: w => assert.ok(accepts(w, 'erase the ash left behind')) },
        { cmd: 'apply the Voice of Fire', check: w => assert.deepEqual(role_history(w, 'ash').map(r => [r.where, r.current]), [[CAMPFIRE.title, true], [HOUSE.title, true], [FOREST.title, true]]) },
        { cmd: 'put down the chalk', expect: QUOTED.l421 }
    ] },
    { name: 'beat 4: the wise man, literal', steps: [
        { cmd: 'listen', expect: [WISE_MAN.prose[0], WISE_MAN.prose[13]] },
        { cmd: 'pick up the chalk' },
        { cmd: 'speak as the boy' }, { cmd: 'be born' }, { cmd: 'grow up and acquire wisdom' },
        { cmd: 'speak as the man' }, { cmd: 'seek answers to old questions' }, { cmd: 'gain a small circle of seekers' },
        { cmd: 'speak as the followers' }, { cmd: 'grow in number' },
        { cmd: 'speak as the man' }, { cmd: 'give speeches' },
        { cmd: 'speak as the followers' }, { cmd: 'write down his teachings' },
        { cmd: 'speak as the man' }, { cmd: 'die unexpectedly' },
        { cmd: 'speak as the closest followers' }, { cmd: 'construct a pyre and lay his body on it' },
        { cmd: 'speak as the followers' }, { cmd: 'attend the funeral' },
        { cmd: 'speak as the closest followers' }, { cmd: 'light the pyre', expect: [WISE_MAN.prose[10]] },
        { cmd: 'adjust and embellish his words' },
        { cmd: 'speak as the books' }, { cmd: 'spread across the land' }, { cmd: 'be read and repeated and reprinted' },
        { cmd: 'speak as time' }, { cmd: 'pass' },
        { cmd: 'draw a vertical line', check: w => assert.ok(!verbs(w).includes('map')) },
        { cmd: 'say that the Voice of Fire is contained in just two lines', expect: [...QUOTED.l451, ...QUOTED.l453], check: candidates_enumerable(WISE_MAN) },
        { cmd: map_cmd(WISE_MAN, 1, 2), trap: WISE_MAN.nudges[0].text },
        { cmd: map_cmd(WISE_MAN, 1, 11), trap: 'It burns here, my dear. Where was it built?' },
        { cmd: map_cmd(WISE_MAN, 4, 8), trap: WISE_MAN.step_nudges!.first![4]! },
        ...maps(WISE_MAN, [[1, 9], [2, 9], [3, 9], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11]]),
        { cmd: 'apply the Voice of Fire', expect: [...WISE_MAN.apply_text.first!, ...WISE_MAN.apply_after!.first!],
          check: w => {
              assert.ok(accepts(w, 'remember the two lines'));
              assert.ok(!accepts(w, 'set aside the first solution'));
              // l. 455–463, then the Fire's rendition, then l. 465.
              const frame = frame_text(w);
              const a = frame.indexOf('participate in the mapping.'), b = frame.indexOf("> lay the tinder — the pyre's tinder"), c = frame.indexOf(normalise(WISE_MAN.apply_after!.first![0]));
              assert.ok(a >= 0 && a < b && b < c, `order: ${a} ${b} ${c}`);
          } },
        { cmd: 'remember the two lines', expect: ['— contained, because everything else stood outside'] },
        { cmd: 'collapse the unmapped', expect_tree: ['▸ 13 events not in the mapping'] },
        { cmd: 'expand the unmapped' }
    ] },
    { name: 'beat 5: the wise man, figurative', steps: [
        { cmd: 'ask what she means', expect: [...QUOTED.l467, ...QUOTED.l469] },
        { cmd: 'set aside the first solution', label: 'first solution set aside', check: w => {
            assert.equal(set_aside_mappings(w, WISE_MAN).length, 1);
            assert.deepEqual(current(w, 'tinder').map(r => r.where), [CAMPFIRE.title, HOUSE.title, FOREST.title]);
            candidates_enumerable(WISE_MAN)(w);
        } },
        { cmd: map_cmd(WISE_MAN, 8, 11), trap: FIRE.nudges.L7_step[8]! },
        { cmd: map_cmd(WISE_MAN, 1, 9), trap: FIRE.nudges.L7 },
        // The second pass is corrected in the figurative reading's terms.
        { cmd: map_cmd(WISE_MAN, 1, 3), trap: WISE_MAN.step_nudges!.second![1]! },
        // The fuel lines' authored nudges are the literal pass's: here the kindling on the growing in number is corrected figuratively.
        { cmd: map_cmd(WISE_MAN, 2, 5), trap: 'Who caught from him first, my dear? The few, before the many.' },
        { cmd: map_cmd(WISE_MAN, 4, 10), trap: WISE_MAN.step_nudges!.second![4]! },
        ...maps(WISE_MAN, [[1, 2], [2, 4], [3, 5]]),
        { cmd: map_cmd(WISE_MAN, 4, 8), expect: ['"His death. Very well. Hold that," says Katya.'] },
        ...maps(WISE_MAN, [[4, 12], [5, 12], [6, 13], [7, 14], [8, 15]]),
        { cmd: 'apply the Voice of Fire', expect: WISE_MAN.apply_text.second!, check: w => {
            assert.ok(sequence_finished(w, WISE_MAN));
            assert.ok(accepts(w, 'object that there is no fire'));
            assert.ok(!accepts(w, 'object that the fireplace is too abstract'));
        } },
        { cmd: 'collapse the unmapped', label: 'wise man unmapped folded', expect_tree: ['▸ 6 events in neither solution'], check: w => assert.ok(w.collapsed.includes('wise_man:unmapped')) },
        { cmd: 'object that there is no fire', expect: [...QUOTED.l473, ...QUOTED.l475, ...QUOTED.l477_fire] },
        // The second solution set aside reopens it with its placements, never a third pass; the objections wait.
        { cmd: 'set aside the second solution', check: w => {
            locked(w, 'object', 'that the fireplace is too abstract');
            assert.ok(accepts(w, 'resume the second solution') && accepts(w, 'resume the first solution'));
            assert.ok(accepts(w, 'erase the ash left behind') && accepts(w, map_cmd(WISE_MAN, 8, 15)));
            assert.equal(w.mappings.filter(m => m.story === 'wise_man').length, 2);
        } },
        // The spark moved to the death while the second is open; resuming the first holds the second as it stands, set aside.
        { cmd: map_cmd(WISE_MAN, 4, 8), expect: ['"His death. Very well. Hold that," says Katya.'] },
        { cmd: 'resume the first solution', label: 'second held aside', check: w => {
            locked(w, 'object', 'that the fireplace is too abstract');
            assert.ok(!frame_text(w).includes(normalise(WISE_MAN.apply_text.first![0])));
            assert.deepEqual(w.mappings.filter(m => m.story === 'wise_man').map(m => [m.pass, m.status, m.placements.length]), [['first', 'applied', 8], ['second', 'set aside', 8]]);
            assert.equal(placed(mappings_on(w, WISE_MAN)[1], 4), 8);
        } },
        { cmd: 'set aside the first solution', check: w => assert.equal(open_mapping(w, WISE_MAN)!.placements.length, 8) },
        ...maps(WISE_MAN, [[4, 12]]),
        { cmd: 'resume the second solution', label: 'second solution resumed', check: w => assert.ok(accepts(w, 'object that the fireplace is too abstract')) },
        { cmd: 'object that the fireplace is too abstract', expect: QUOTED.l477_abstract },
        { cmd: 'object that the spark is the myth, not the death', expect: QUOTED.l477_spark },
        { cmd: 'object that the ash is still structured', label: 'l. 479', expect: [...QUOTED.l477_ash, ...QUOTED.l479], check: w => {
            const options = typeahead(w, 'say');
            assert.ok(options.some(o => o.availability === 'Locked' && o.tokens.join(' ') === 'that you see it'), JSON.stringify(options));
            assert.ok(accepts(w, 'say Ok, I guess'));
            assert.ok(!accepts(w, 'say that you see it'));
        } },
        { cmd: "remember the wise man's story", check: w => assert.ok(!frame_text(w).includes("unconvincing, because you don't really see it")) },
        { cmd: 'say Ok, I guess', label: 'the end', expect: QUOTED.l481, expect_tree: AUTHORED.coda, check: w => {
            // The coda is its own node after the frame, not part of what was said.
            assert.ok(frame_text(w).endsWith("But you don't really see it."));
            const m = w.mappings.filter(m => m.story === 'wise_man');
            assert.deepEqual(m.map(x => [x.pass, x.status]), [['first', 'set aside'], ['second', 'applied']]);
            assert.deepEqual(current(w, 'tinder').map(r => r.what), ['a patch of tinder', 'the thatch', 'the dead brush', 'his wisdom']);
            assert.deepEqual(role_history(w, 'tinder').map(r => r.what), ['a patch of tinder', 'the oil-soaked rag', 'the thatch', 'the dead brush', "the pyre's tinder", 'his wisdom']);
            assert.deepEqual(current(w, 'ash').map(r => r.what), ['a pile of ash', 'a field of ash', 'the forest, as ash', 'the distorted doctrine']);
            assert.deepEqual(current(w, 'blaze').map(r => r.where), STORIES.map(s => s.title));
            assert.ok(accepts(w, 'remember the saying of Ok, I guess'));
            assert.ok(!verbs(w).some(v => ['map', 'set_aside'].includes(v)));
            // The line you cannot say stays on the board after the end.
            locked(w, 'say', 'that you see it');
            assert.ok(!accepts(w, 'say Ok, I guess'));
        } },
        { cmd: "remember the wise man's story", expect: ["— unconvincing, because you don't really see it"] },
        { cmd: 'remember the saying of Ok, I guess', expect: ['It went like this:', "But you don't really see it.", 'It felt a bit untrue, because it was.'],
          check: w => { const f = frame_text(w); assert.ok(f.endsWith('It felt a bit untrue, because it was.') && !f.includes(normalise(AUTHORED.coda[0]))); } },
        // Only the three classroom events with a feeling of their own are rememberable (SPEC §10).
        { cmd: 'remember the second picking up of the chalk', expect: ['It felt a bit ordinary, because it was chalk.'],
          check: w => assert.ok(!accepts(w, 'remember the second listening') && !accepts(w, 'remember the looking at the board')) },
        // Every reading of the ember, the set-aside ones kept: the rag's stick, then the lit rag; the literal flame, then the myth.
        { cmd: 'remember the ember', expect: ["The ember has been: the match's flame, in the campfire story; the burning stick, in the house in the woods, set aside; the lit rag, in the house in the woods; the lightning, in the forest fire; the flame, in the wise man's story, set aside; the myth of his death, in the wise man's story."] },
        // An event read only by a set-aside solution remembers that reading, marked.
        { cmd: 'remember the lighting of the pyre', expect: ['It felt like the ember, and the flame, and the blaze, and the ash, in the Voice of Fire; set aside.'] }
    ] },
    { name: 'after the end: the Pillaging on the house', steps: [
        { cmd: 'try the Pillaging on the house in the woods', label: 'pillaging attempt', check: w => {
            assert.equal(w.board, HOUSE.id);
            assert.ok(accepts(w, 'map the living in their home to the moving in') && accepts(w, 'apply the Pillaging'));
            assert.ok(!accepts(w, map_cmd(HOUSE, 1, 9)) && !accepts(w, 'set aside the mapping'));
            locked(w, 'say', 'that you see it');
        } },
        { cmd: 'apply the Pillaging', trap: 'The Pillaging does not skip, my dear. The living in their home is not on the board.'
            + ' Unplaced: the living in their home, the entering of their home, the taking of things from their home.' },
        { cmd: 'map the living in their home to the moving in', label: 'pillaging placed', expect: ['→ the moving in'],
          check: w => assert.deepEqual(mappings_on(w, HOUSE, PILLAGING).map(m => m.placements), [[{ step: 1, event: 10 }]]) },
        // The refusals are in the acceptance script (they are the attempt), so they are steps, not traps: a nudge, and nothing changes.
        { cmd: `map the entering of their home to ${ev(HOUSE, 11)}`, expect: [PILLAGING.nudges.step[2]],
          check: (w, before) => { assert.equal(state_snapshot(w), state_snapshot(before)); assert.ok(!text(w).includes(AUTHORED.no_fit[0])); } },
        // Refused on both of the steps that fit nothing, Katya's one line (SPEC §12), once.
        { cmd: `map the taking of things from their home to ${ev(HOUSE, 12)}`, expect: [PILLAGING.nudges.step[3], ...AUTHORED.no_fit],
          check: (w, before) => { assert.equal(state_snapshot(w), state_snapshot(before)); assert.equal(text(w).split(AUTHORED.no_fit[0]).length - 1, 1); } },
        // A third refusal: the nudge alone.
        { cmd: `map the entering of their home to ${ev(HOUSE, 13)}`, expect: [PILLAGING.nudges.step[2]],
          check: (w, before) => { assert.equal(state_snapshot(w), state_snapshot(before)); assert.ok(frame_text(w).endsWith(PILLAGING.nudges.step[2])); } },
        { cmd: 'apply the Pillaging', trap: 'The Pillaging does not skip, my dear. The entering of their home is not on the board.'
            + ' Unplaced: the entering of their home, the taking of things from their home.' },
        { cmd: 'remember the tinder', expect: ['The tinder has been: a patch of tinder, in the campfire story; the oil-soaked rag, in the house in the woods, set aside; the thatch, in the house in the woods; the dead brush, in the forest fire; the pyre\'s tinder, in the wise man\'s story, set aside; his wisdom, in the wise man\'s story.'] },
        { cmd: 'put down the chalk', label: 'attempt folded', check: w => {
            assert.equal(w.board, WISE_MAN.id);
            assert.ok(w.collapsed.includes('house:chip') && !accepts(w, 'try the Pillaging on the house in the woods') && !accepts(w, 'put down the chalk'));
            assert.equal(text(w).split(AUTHORED.no_fit[0]).length - 1, 1);
            locked(w, 'say', 'that you see it');
        } },
        { cmd: 'remember the Pillaging', expect: ['Someone lives in their home.', 'take things from their home'] }
    ] }
];

export const WALKTHROUGH: Step[] = BEATS.flatMap(b => b.steps);
export const ACCEPTANCE_SCRIPT: string[] = WALKTHROUGH.filter(s => s.trap === undefined).map(s => s.cmd);

// THE REPLAY, ONCE

export interface Played {
    worlds: FireWorld[];            // worlds[i] is the world after WALKTHROUGH[i]
    initial: FireWorld;
    refused?: number;               // the index of the first command not accepted
}

let played: Played | undefined;

export function play_walkthrough(): Played {
    if (played !== undefined) {
        return played;
    }
    const { initial_result, update } = new_fire_world();
    let world = initial_result.world;
    const worlds: FireWorld[] = [];
    let refused: number | undefined;
    for (let i = 0; i < WALKTHROUGH.length; i++) {
        const result = update(world, raw(WALKTHROUGH[i].cmd));
        if (result.world === world) {
            refused = i;
            break;
        }
        // The next world's story is this one's with its updates applied: keep it for story_of.
        stories.set(world, result.world.story);
        world = result.world;
        worlds.push(world);
    }
    played = { worlds, initial: initial_result.world, refused };
    return played;
}

// The world after the step labelled so.
export function world_at(label: string): FireWorld {
    const i = WALKTHROUGH.findIndex(s => s.label === label);
    if (i < 0) {
        throw new Error(`No step of the walkthrough is labelled "${label}".`);
    }
    const p = play_walkthrough();
    if (i >= p.worlds.length) {
        throw new Error(`The walkthrough stopped before "${label}".`);
    }
    return p.worlds[i];
}

// The world after the nth occurrence of a command in the walkthrough.
export function world_after(cmd: string, nth = 1): FireWorld {
    const p = play_walkthrough();
    let seen = 0;
    for (let i = 0; i < WALKTHROUGH.length; i++) {
        if (WALKTHROUGH[i].cmd === cmd && ++seen === nth) {
            if (i >= p.worlds.length) {
                throw new Error(`The walkthrough stopped before "${cmd}".`);
            }
            return p.worlds[i];
        }
    }
    throw new Error(`"${cmd}" (${nth}) is not in the walkthrough.`);
}

// HELPERS

// A world's story with its own frame's updates applied, computed once per world.
const stories = new WeakMap<FireWorld, Story>();
export function story_of(w: FireWorld): Story {
    let story = stories.get(w);
    if (story === undefined) {
        story = apply_story_updates_all(w.story, w.story_updates);
        stories.set(w, story);
    }
    return story;
}

export function text(w: FireWorld): string {
    return normalise(to_basic_text(story_of(w)));
}

// The text of the latest frame alone.
export function frame_text(w: FireWorld): string {
    return normalise(to_basic_text(S.frame().query(story_of(w))[0][0]));
}

// Every command the world accepts, enumerated once per world (traverse_thread reruns the parser per prefix).
const enumerated = new WeakMap<FireWorld, string[]>();
export function commands(w: FireWorld): string[] {
    let cmds = enumerated.get(w);
    if (cmds === undefined) {
        cmds = Object.keys(traverse_thread(make_update_thread(fire_world_spec, w)));
        enumerated.set(w, cmds);
    }
    return cmds;
}

// Whether the world accepts this command: one non-submitting parse, where enumerating every command costs seconds.
export function accepts(w: FireWorld, cmd: string): boolean {
    return apply_command(fire_world_spec, w, raw(cmd, false)).parsing.view.submittable;
}

// The first tokens on offer (the verbs), from one empty parse.
export function verbs(w: FireWorld): string[] {
    return typeahead(w, '').map(o => o.tokens[0]);
}

export function play(w: FireWorld, cmds: string[]): FireWorld {
    const { update } = new_fire_world();
    for (const cmd of cmds) {
        const r = update(w, raw(cmd));
        if (r.world === w) {
            throw new Error(`"${cmd}" was not accepted. Available: ${commands(w).join(' | ')}`);
        }
        w = r.world;
    }
    return w;
}

function typeahead(w: FireWorld, input: string): { tokens: string[], availability: string }[] {
    return apply_command(fire_world_spec, w, raw(input, false)).parsing.view.typeahead_grid.map(o => ({
        availability: o.availability,
        tokens: o.option.filter(m => m !== undefined).map(m => String(m!.expected.token))
    }));
}

function state_snapshot(w: FireWorld) {
    return JSON.stringify({ lesson: w.lesson, voice: w.voice, board: w.board, cursor: w.cursor, finished: w.finished, mappings: w.mappings });
}

describe('the Voice of Fire, played through', function () {
    this.timeout(120000);

    before(() => { play_walkthrough(); });

    it('quotes every Katya and character line verbatim', () => {
        const md = document_text();
        for (const [key, lines] of Object.entries(QUOTED)) {
            for (const line of lines) {
                assert.ok(md.includes(unquote(normalise(line))), `${key} is not in the document verbatim: "${line}"`);
            }
        }
    });

    it('starts in the classroom', () => {
        const w = play_walkthrough().initial;
        assert.ok(text(w).includes(normalise(QUOTED.l160[0])));
        assert.deepEqual(commands(w).sort(), ['listen', 'look at the board']);
    });

    let offset = 0;
    for (const beat of BEATS) {
        const start = offset;
        offset += beat.steps.length;
        it(beat.name, () => {
            const p = play_walkthrough();
            beat.steps.forEach((step, j) => {
                const i = start + j;
                if (p.refused !== undefined && p.refused <= i) {
                    const before = i === 0 ? p.initial : p.worlds[i - 1];
                    assert.fail(`"${WALKTHROUGH[p.refused].cmd}" was not accepted. Available: ${commands(before).join(' | ')}`);
                }
                const before = i === 0 ? p.initial : p.worlds[i - 1];
                const world = p.worlds[i];
                const frame = frame_text(world);
                if (step.trap !== undefined) {
                    assert.ok(accepts(before, step.cmd), `the trap "${step.cmd}" is not accepted`);
                    assert.ok(frame.endsWith(normalise(step.trap)), `"${step.cmd}" did not print its nudge; the frame ends: ${frame.slice(-200)}`);
                    assert.equal(state_snapshot(world), state_snapshot(before), `"${step.cmd}" changed the state`);
                }
                for (const expected of step.expect ?? []) {
                    assert.ok(frame.includes(normalise(expected)), `after "${step.cmd}", expected in the frame: "${expected}"; the frame: ${frame.slice(-300)}`);
                }
                for (const expected of step.expect_tree ?? []) {
                    assert.ok(text(world).includes(normalise(expected)), `after "${step.cmd}", expected on the board: "${expected}"`);
                }
                if (step.check !== undefined) {
                    step.check(world, before);
                }
            });
        });
    }

    it('offers nothing but display commands and remember while a chip is expanded, and never builds inside a chip', () => {
        // The critic's sequence: with the campfire chip expanded and no board open, the lesson cannot go on inside it.
        const expanded = world_at('campfire chip expanded');
        assert.equal(expanded_chip(expanded), CAMPFIRE);
        assert.ok(!accepts(expanded, 'listen') && !accepts(expanded, 'pick up the chalk') && !accepts(expanded, 'look at the board'));
        assert.ok(accepts(expanded, 'collapse the campfire story') && accepts(expanded, 'remember the campfire story') && accepts(expanded, 'collapse the steps'));
        const folded = play(expanded, ['collapse the campfire story']);
        assert.equal(expanded_chip(folded), undefined);
        assert.ok(accepts(folded, 'listen'));
        // Two chips: expanding the second folds the first; folding the second leaves nothing expanded.
        const closed = world_at('house closed');
        const two = play(closed, ['expand the campfire story', 'expand the house in the woods']);
        assert.ok(two.collapsed.includes('campfire:chip') && !two.collapsed.includes('house:chip'));
        assert.equal(expanded_chip(two), HOUSE);
        assert.ok(!accepts(two, 'listen') && accepts(two, 'expand the campfire story'));
        const none = play(two, ['collapse the house in the woods']);
        assert.equal(expanded_chip(none), undefined);
        assert.ok(accepts(none, 'listen'));
        // A chip expanded while a board is open is folded when the board closes.
        const during = play(world_at('house spark on the stick'), ['expand the campfire story']);
        assert.equal(expanded_chip(during), undefined);
        const after = play(during, ['expand the unmapped', 'apply the Voice of Fire', 'object that there is no clear tinder',
            'say that it knows nothing of the morality of the burning either', 'put down the chalk']);
        assert.ok(after.collapsed.includes('campfire:chip') && after.collapsed.includes('house:chip'));
        assert.ok(accepts(after, 'listen'));
    });

    it('names every line of the script for remember', () => {
        const by_command = new Map<string, string>();
        for (const line of SCRIPT) {
            assert.ok(line.name.startsWith('the '), `"${line.name}" is not a name`);
            if (typeof line.command === 'string') {
                const other = by_command.get(line.command);
                assert.ok(other === undefined || other === line.name, `"${line.command}" is named twice`);
                by_command.set(line.command, line.name);
            }
        }
        assert.equal(new Set(by_command.values()).size, by_command.size);
    });

    it('remembers an event of the wise man with both solutions held', () => {
        // The second solution lit, the first set aside: the pyre is read by the first alone (marked), the wisdom by the second.
        const w = world_at('second solution resumed');
        assert.equal(set_aside_mappings(w, WISE_MAN).length, 1);
        const pyre = play(w, ['remember the constructing of the pyre']);
        assert.ok(frame_text(pyre).endsWith('It felt like the tinder, and the kindling, and the firewood, in the Voice of Fire; set aside.'));
        const wisdom = play(w, ['remember the growing up and acquiring of wisdom']);
        assert.ok(frame_text(wisdom).endsWith('It felt like the tinder, in the Voice of Fire.'));
    });

    it('lets "Ok, I guess" be said whichever solution is lit', () => {
        const w = play(world_at('l. 479'), ['set aside the second solution', 'say Ok, I guess']);
        assert.ok(frame_text(w).endsWith("But you don't really see it."));
        assert.equal(applied_mapping(w, WISE_MAN), undefined);
    });

    it('ends on "But you don\'t really see it."', () => {
        const p = play_walkthrough();
        assert.equal(p.refused, undefined);
        assert.ok(text(p.worlds[p.worlds.length - 1]).includes("But you don't really see it."));
    });

    it('measures the keystroke parse time at the wise man\'s mapping state', () => {
        const world = world_after('set aside the first solution');
        const started = Date.now();
        for (const input of ['', 'm', 'map', 'map the', 'map the laying of the tinder to', 'r', 'remember the']) {
            apply_command(fire_world_spec, world, raw(input, false));
        }
        const per_keystroke = (Date.now() - started) / 7;
        assert.ok(per_keystroke < 500, `a keystroke took ${per_keystroke} ms`);
        // The judge agrees with the parser about what is placeable here.
        const aside = set_aside_mappings(world, WISE_MAN);
        assert.ok(place(WISE_MAN, FIRE, { id: 99, voice: FIRE.voice.id, story: 'wise_man', pass: 'second', placements: [], status: 'open' }, 1, 2, aside).ok);
    });
});
