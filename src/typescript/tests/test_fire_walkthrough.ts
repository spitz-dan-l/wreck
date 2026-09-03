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
import { EVENT_NAMES, fire_world_spec, FireWorld, new_fire_world, STORIES, StorySpec, VOICE_OF_FIRE, WISE_MAN } from 'demo_worlds/fire';
import { AUTHORED, QUOTED } from 'demo_worlds/fire/data/katya';
import { applied_mapping, open_mapping, remainder, set_aside_mappings } from 'demo_worlds/fire/world';
import { raw, traverse_thread } from 'parser';
import { apply_story_updates_all, Story, to_basic_text, Updates as S } from 'story';
import { apply_command, make_update_thread } from 'world';
import { document_text, normalise, unquote } from './test_fire_judge';

const FIRE = VOICE_OF_FIRE;

// One step of the walkthrough: a command, and what must be true after it.
export interface Step {
    cmd: string;
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

// Every candidate placement of the current pass is a command the parser enumerates.
function candidates_enumerable(story: StorySpec) {
    return (w: FireWorld) => {
        const cmds = commands(w);
        const aside = set_aside_mappings(w, story);
        const pass = aside.length > 0 ? 'second' : 'first';
        const rows = candidates_for(story, FIRE, pass, aside);
        for (const step of FIRE.steps) {
            for (const c of rows[step.index]!) {
                assert.ok(cmds.includes(map_cmd(story, step.index, c.event)), `${map_cmd(story, step.index, c.event)} is not enumerable`);
            }
        }
        assert.ok(cmds.includes('apply the Voice of Fire'));
    };
}

const L1 = (step: number) => `The Voice of Fire does not skip, my dear. ${step_name(step)[0].toUpperCase()}${step_name(step).slice(1)} is not on the board.`;

// The walkthrough, beat by beat.
export const BEATS: { name: string, steps: Step[] }[] = [
    { name: 'beat 0: the classroom', steps: [
        { cmd: 'look at the board', expect: AUTHORED.shelf, check: w => assert.ok(commands(w).includes('remember the Pillaging')) },
        { cmd: 'remember the Pillaging', expect: ['Someone lives in their home.', 'take things from their home'] },
        { cmd: 'listen', expect: QUOTED.l162, expect_tree: ['The laying of the tinder', 'The ash left behind'],
          check: w => { const c = commands(w); assert.ok(c.includes('expand the steps') && !c.includes('collapse the steps')); } },
        { cmd: 'remember the Voice of Fire', expect: ['The ash left behind'], check: w => assert.ok(!frame_text(w).includes('reduce to ash')) },
        { cmd: 'listen', expect: QUOTED.l182, expect_tree: ['lay the tinder', 'A pile of black ash is left behind in the hearth.'],
          check: w => assert.ok(commands(w).includes('remember the laying of the tinder')) },
        { cmd: 'remember the Voice of Fire', expect: ['reduce to ash'] },
        { cmd: 'remember the kindling', expect: ['Nothing has been the kindling yet.'] },
        { cmd: 'listen', expect: [...QUOTED.l218, CAMPFIRE.prose[0], CAMPFIRE.prose[11]] },
        { cmd: 'say that the Voice of Fire is contained in this one', expect: [...QUOTED.l244, ...QUOTED.l246] },
        { cmd: 'pick up the chalk', expect: QUOTED.l248,
          check: w => assert.deepEqual(commands(w).filter(c => !c.startsWith('remember') && !c.startsWith('collapse') && !c.startsWith('expand')), ['speak as the friends']) }
    ] },
    { name: 'beat 1: the campfire', steps: [
        { cmd: 'speak as the friends', check: w => assert.equal(w.voice, 'the friends') },
        { cmd: 'travel to the woods', expect: ['You arrive at the campground in the woods.'] },
        { cmd: 'gather tinder, kindling and firewood' },
        { cmd: 'dig a pit in the ground' },
        { cmd: 'lay the tinder in the pit' },
        { cmd: 'pile the kindling over the tinder' },
        { cmd: 'stack the logs over the kindling' },
        { cmd: 'light a match', check: w => { assert.equal(w.cursor, 7); assert.equal(remainder(w, CAMPFIRE), 'and carefully touches its flame to the tinder.'); } },
        { cmd: 'touch the flame to the tinder', check: w => { assert.equal(w.cursor, 8); assert.equal(remainder(w, CAMPFIRE), undefined); } },
        { cmd: 'spread to the kindling', trap: 'The friends do not command the fire, my dear.' },
        { cmd: 'let it follow', expect: ['↳ The fire starts, spreading first to the kindling and then the logs.'] },
        { cmd: 'sing' },
        { cmd: 'add logs to the fire' },
        { cmd: 'sing' },
        { cmd: 'sleep in tents' },
        { cmd: 'let it follow', check: w => assert.equal(w.cursor, 13) },
        { cmd: 'draw a vertical line', expect: QUOTED.l309, check: candidates_enumerable(CAMPFIRE) },
        { cmd: map_cmd(CAMPFIRE, 8, 11), trap: 'The singing is not ash. What is left behind, afterward, when no one is tending?' },
        { cmd: map_cmd(CAMPFIRE, 1, 2), trap: FIRE.nudges.step[1]! },
        { cmd: 'apply the Voice of Fire', trap: L1(1) },
        { cmd: map_cmd(CAMPFIRE, 1, 4), expect: ['→ the laying of the tinder in the pit'] },
        // Erasing a step leaves nothing behind on the row; re-mapping it comes back.
        { cmd: 'erase the laying of the tinder', check: w => { assert.equal(open_mapping(w, CAMPFIRE)!.placements.length, 0); assert.ok(!commands(w).includes('erase the laying of the tinder')); } },
        { cmd: 'apply the Voice of Fire', trap: L1(1) },
        ...maps(CAMPFIRE, [[1, 4], [2, 5], [3, 6], [4, 8], [5, 8], [6, 8], [7, 10]]),
        { cmd: 'apply the Voice of Fire', trap: L1(8) },
        ...maps(CAMPFIRE, [[8, 12]]),
        { cmd: 'apply the Voice of Fire', expect: [...CAMPFIRE.apply_text.first!, '> lay the tinder — a patch of tinder'], expect_tree: ['— the ash'],
          check: w => {
              assert.deepEqual(w.roles.tinder, [{ role: 'tinder', what: 'a patch of tinder', where: CAMPFIRE.title }]);
              // The rendition is grouped by event: the three steps on the touch share one consequence.
              assert.equal(frame_text(w).split('The tinder burns quickly on contact with the flame.').length - 1, 1);
              assert.ok(!commands(w).includes('apply the Voice of Fire'));
          } },
        { cmd: 'set aside the mapping', check: w => {
            assert.deepEqual(w.roles.tinder, []);
            assert.ok(!text(w).includes('> lay the tinder — a patch of tinder'));
            assert.ok(!text(w).includes('— the ash'));
            assert.equal(applied_mapping(w, CAMPFIRE), undefined);
            // No second pass here: the mapping is open again with its placements kept.
            const cmds = commands(w);
            assert.ok(!cmds.includes('say all set') && cmds.includes('resume the mapping') && cmds.includes('apply the Voice of Fire'));
            assert.ok(cmds.includes('erase the laying of the tinder') && cmds.includes(map_cmd(CAMPFIRE, 1, 4)));
        } },
        { cmd: 'resume the mapping', check: w => {
            assert.equal(w.roles.tinder.length, 1);
            assert.ok(text(w).includes('> lay the tinder — a patch of tinder'));
            assert.equal(applied_mapping(w, CAMPFIRE)?.status, 'applied');
        } },
        { cmd: 'say all set', expect: [...QUOTED.l313, ...QUOTED.l315], check: w => assert.ok(commands(w).includes('remember the campfire story')) },
        { cmd: 'remember the campfire story', expect: ['It went like this:', 'It felt:', '— a bit warm, because they sang', '— like the Voice of Fire, because the tinder was a patch of tinder'] },
        { cmd: 'remember the tinder', expect: ['The tinder has been: a patch of tinder, in the campfire story.'] },
        { cmd: 'remember the touching of the flame to the tinder', expect: ['It went like this:', 'It felt like the ember, and the flame, and the blaze, in the Voice of Fire.'],
          check: w => assert.ok(!frame_text(w).includes('— the ember, in the Voice of Fire')) },
        // l. 288 belongs to the touch alone, not to the match.
        { cmd: 'remember the lighting of a match', expect: ['The match head flickers into a tiny flame.', 'It felt like nothing yet. It has not been read.'],
          check: w => assert.ok(!frame_text(w).includes(normalise(CAMPFIRE.prose[7]))) },
        { cmd: 'expand the campfire story', check: w => assert.ok(!w.collapsed.includes('campfire:chip') && commands(w).includes('collapse the campfire story')) },
        { cmd: 'collapse the campfire story', check: w => assert.ok(w.collapsed.includes('campfire:chip')) }
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
        { cmd: 'let it follow', check: w => {
            assert.equal(w.cursor, 9);
            const cmds = commands(w);
            assert.ok(cmds.includes('light the rag') && cmds.includes('ask what the right thing to do is'));
            assert.ok(!cmds.includes('speak as the children'));
        } },
        { cmd: 'light the rag', trap: 'You are still speaking as the family, my dear. Would the family light the rag? Change the voice, then command.' },
        { cmd: 'ask what the right thing to do is', expect: [...QUOTED.l348, ...QUOTED.l350, ...AUTHORED.voice_switches, ...QUOTED.l350b],
          check: w => assert.ok(commands(w).includes('speak as the children')) },
        { cmd: 'speak as the children', expect: ['— the children —'] },
        { cmd: 'light the rag', expect: ['one of you lights an oil-soaked rag'] },
        { cmd: 'hurl it onto the roof' },
        { cmd: 'scatter', expect: AUTHORED.burning_lines, check: w => assert.equal(w.cursor, 10) },
        { cmd: 'spread to the thatch', trap: 'The children have run, my dear.' },
        { cmd: 'speak as the family', trap: 'The family have no line here, my dear. Who acts?' },
        { cmd: 'let it follow' }, { cmd: 'let it follow' }, { cmd: 'let it follow' }, { cmd: 'let it follow' },
        { cmd: 'draw a vertical line', expect: QUOTED.l383, check: candidates_enumerable(HOUSE) },
        { cmd: map_cmd(HOUSE, 1, 9) },
        { cmd: map_cmd(HOUSE, 2, 9), trap: FIRE.nudges.L6 },
        { cmd: map_cmd(HOUSE, 1, 11) },
        ...maps(HOUSE, [[2, 9], [3, 8], [4, 12], [5, 13], [6, 13], [7, 13], [8, 13]]),
        { cmd: 'apply the Voice of Fire', expect: HOUSE.apply_text.first!,
          check: w => assert.deepEqual(w.roles.tinder.map(r => r.what), ['a patch of tinder', 'the oil-soaked rag']) },
        // l. 336 belongs to the scattering alone, not to the lighting of the rag; one annotation per role on the scattering.
        { cmd: 'remember the lighting of the rag', check: w => assert.ok(!frame_text(w).includes(normalise(HOUSE.prose[9]))) },
        { cmd: 'remember the scattering', expect: ['It felt like the flame, and the blaze, and the ash, in the Voice of Fire.'],
          check: w => assert.equal(frame_text(w).split('— the blaze').length - 1, 1) },
        { cmd: 'object that there is no clear tinder', expect: [...QUOTED.l385, ...QUOTED.l387] },
        // A change of mind after apply (l. 140): the thatch as tinder, the lit rag as spark (the fifth legal mapping).
        { cmd: 'set aside the mapping', check: w => {
            // The mapping reopens with its placements kept; the thatch can be tried.
            assert.equal(open_mapping(w, HOUSE)!.placements.length, 8);
            assert.ok(commands(w).includes(map_cmd(HOUSE, 2, 8)));
        } },
        // Erased, the spark's event (the hurling) is unmapped again: 5 of the 13 events were mapped, now 4.
        { cmd: `erase ${step_name(4)}`, check: w => assert.equal(placed(open_mapping(w, HOUSE)!, 4), undefined) },
        { cmd: 'collapse the unmapped', expect_tree: ['▸ 9 events not in the mapping'] },
        // Each fuel line must be freed before another step takes it (L6): foundation, then frame, then thatch.
        { cmd: map_cmd(HOUSE, 1, 9), trap: FIRE.nudges.L6 },
        ...maps(HOUSE, [[3, 7], [2, 8], [1, 9]]),
        // The spark on the stick: the bar's count follows the later map.
        { cmd: map_cmd(HOUSE, 4, 11), check: (w, before) => assert.ok(text(before).includes('▸ 9 events not in the mapping') && text(w).includes('▸ 8 events not in the mapping')) },
        { cmd: 'expand the unmapped', check: w => assert.ok(!text(w).includes('events not in the mapping')) },
        { cmd: 'apply the Voice of Fire', check: w => assert.deepEqual(w.roles.tinder.map(r => r.what), ['a patch of tinder', 'the thatch']) },
        { cmd: 'remember the tinder', expect: ['the thatch, in the house in the woods'] },
        { cmd: 'say that it knows nothing of the morality of the burning either', expect: [...QUOTED.l389, ...QUOTED.l391] },
        { cmd: 'put down the chalk', expect: QUOTED.l393, check: w => assert.equal(w.board, undefined) }
    ] },
    { name: 'beat 3: the forest', steps: [
        { cmd: 'listen', expect: [FOREST.prose[0]] },
        { cmd: 'pick up the chalk', check: w => {
            assert.equal(w.voice, undefined);
            const cmds = commands(w).filter(c => !c.startsWith('remember') && !c.startsWith('collapse') && !c.startsWith('expand'));
            assert.deepEqual(cmds.sort(), FOREST.voices.map(v => `speak as ${v}`).concat(['speak as the Voice of Fire']).sort());
        } },
        { cmd: 'speak as the Voice of Fire', trap: FOREST.traps[0].nudge },
        { cmd: 'speak as the fire', trap: 'The fire has no line here, my dear. Who acts?' },
        { cmd: 'speak as the seed', expect: ['— the seed —', ...AUTHORED.disembodied] },
        { cmd: 'take root' },
        { cmd: 'speak as the season', expect: [...AUTHORED.abstract, ...QUOTED.l419b] },
        { cmd: 'turn' },
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
        { cmd: 'set aside the mapping', check: w => assert.ok(commands(w).includes('erase the ash left behind')) },
        { cmd: 'apply the Voice of Fire', check: w => assert.deepEqual(w.roles.ash.map(r => r.where), [CAMPFIRE.title, HOUSE.title, FOREST.title]) },
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
        { cmd: 'draw a vertical line', check: w => assert.ok(!commands(w).some(c => c.startsWith('map '))) },
        { cmd: 'say that the Voice of Fire is contained in just two lines', expect: [...QUOTED.l451, ...QUOTED.l453], check: candidates_enumerable(WISE_MAN) },
        { cmd: map_cmd(WISE_MAN, 1, 2), trap: WISE_MAN.nudges[0].text },
        { cmd: map_cmd(WISE_MAN, 1, 11), trap: 'It burns here, my dear. Where was it built?' },
        ...maps(WISE_MAN, [[1, 9], [2, 9], [3, 9], [4, 11], [5, 11], [6, 11], [7, 11], [8, 11]]),
        { cmd: 'apply the Voice of Fire', expect: [...WISE_MAN.apply_text.first!, ...WISE_MAN.apply_after!.first!],
          check: w => {
              assert.ok(commands(w).includes('remember the two lines'));
              assert.ok(!commands(w).includes('set aside the first solution'));
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
        { cmd: 'set aside the first solution', check: w => {
            assert.equal(set_aside_mappings(w, WISE_MAN).length, 1);
            assert.deepEqual(w.roles.tinder.map(r => r.where), [CAMPFIRE.title, HOUSE.title, FOREST.title]);
            candidates_enumerable(WISE_MAN)(w);
        } },
        { cmd: map_cmd(WISE_MAN, 8, 11), trap: FIRE.nudges.L7_step[8]! },
        { cmd: map_cmd(WISE_MAN, 1, 9), trap: FIRE.nudges.L7 },
        ...maps(WISE_MAN, [[1, 2], [2, 4], [3, 5]]),
        { cmd: map_cmd(WISE_MAN, 4, 8), expect: ['"His death. Very well. Hold that," says Katya.'] },
        ...maps(WISE_MAN, [[4, 12], [5, 12], [6, 13], [7, 14], [8, 15]]),
        { cmd: 'apply the Voice of Fire', expect: WISE_MAN.apply_text.second!, check: w => {
            assert.ok(w.sequences.wise_man.finished);
            assert.ok(commands(w).includes('object that there is no fire'));
            assert.ok(!commands(w).includes('object that the fireplace is too abstract'));
        } },
        { cmd: 'collapse the unmapped', expect_tree: ['▸ 6 events not in the mapping'], check: w => assert.ok(w.collapsed.includes('wise_man:unmapped')) },
        { cmd: 'object that there is no fire', expect: [...QUOTED.l473, ...QUOTED.l475, ...QUOTED.l477_fire] },
        // The second solution set aside reopens it with its placements, never a third pass; the objections wait.
        { cmd: 'set aside the second solution', check: w => {
            const cmds = commands(w);
            assert.ok(!cmds.some(c => c.startsWith('object')));
            assert.ok(cmds.includes('resume the second solution') && cmds.includes('resume the first solution'));
            assert.ok(cmds.includes('erase the ash left behind') && cmds.includes(map_cmd(WISE_MAN, 8, 15)));
            assert.equal(w.mappings.filter(m => m.sequence === 'wise_man').length, 2);
        } },
        { cmd: 'resume the first solution', check: w => {
            assert.ok(!commands(w).some(c => c.startsWith('object')));
            assert.deepEqual(w.mappings.filter(m => m.sequence === 'wise_man').map(m => [m.pass, m.status, m.placements.length]), [['first', 'applied', 8], ['second', 'set aside', 8]]);
        } },
        { cmd: 'set aside the first solution', check: w => assert.equal(open_mapping(w, WISE_MAN)!.placements.length, 8) },
        { cmd: 'resume the second solution', check: w => assert.ok(commands(w).includes('object that the fireplace is too abstract')) },
        { cmd: 'object that the fireplace is too abstract', expect: QUOTED.l477_abstract },
        { cmd: 'object that the spark is the myth, not the death', expect: QUOTED.l477_spark },
        { cmd: 'object that the ash is still structured', expect: [...QUOTED.l477_ash, ...QUOTED.l479], check: w => {
            const options = typeahead(w, 'say');
            assert.ok(options.some(o => o.availability === 'Locked' && o.tokens.join(' ') === 'that you see it'), JSON.stringify(options));
            assert.ok(commands(w).includes('say Ok, I guess'));
            assert.ok(!commands(w).includes('say that you see it'));
        } },
        { cmd: "remember the wise man's story", check: w => assert.ok(!frame_text(w).includes("unconvincing, because you don't really see it")) },
        { cmd: 'say Ok, I guess', expect: QUOTED.l481, expect_tree: AUTHORED.coda, check: w => {
            // The coda is its own node after the frame, not part of what was said.
            assert.ok(frame_text(w).endsWith("But you don't really see it."));
            const m = w.mappings.filter(m => m.sequence === 'wise_man');
            assert.deepEqual(m.map(x => [x.pass, x.status]), [['first', 'set aside'], ['second', 'applied']]);
            assert.deepEqual(w.roles.tinder.map(r => r.what), ['a patch of tinder', 'the thatch', 'the dead brush', 'his wisdom']);
            assert.deepEqual(w.roles.ash.map(r => r.what), ['a pile of ash', 'a field of ash', 'the forest, as ash', 'the distorted doctrine']);
            assert.deepEqual(w.roles.blaze.map(r => r.where), STORIES.map(s => s.title));
            assert.ok(commands(w).includes('remember the saying of Ok, I guess'));
            assert.ok(!commands(w).some(c => c.startsWith('map ') || c.startsWith('set aside') || c.startsWith('say ')));
        } },
        { cmd: "remember the wise man's story", expect: ["— unconvincing, because you don't really see it"] },
        { cmd: 'remember the saying of Ok, I guess', expect: ['It went like this:', "But you don't really see it.", 'It felt a bit untrue, because it was.'],
          check: w => { const f = frame_text(w); assert.ok(f.endsWith('It felt a bit untrue, because it was.') && !f.includes(normalise(AUTHORED.coda[0]))); } },
        { cmd: 'remember the second listening', expect: ['It felt like nothing in particular.'] }
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
    return JSON.stringify({ lesson: w.lesson, voice: w.voice, board: w.board, cursor: w.cursor, sequences: w.sequences, mappings: w.mappings, roles: w.roles });
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
                    assert.ok(commands(before).includes(step.cmd), `the trap "${step.cmd}" is not enumerable`);
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
        assert.ok(place(WISE_MAN, FIRE, { id: 99, voice: FIRE.voice.id, sequence: 'wise_man', pass: 'second', placements: [], status: 'open' }, 1, 2, aside).ok);
    });
});
