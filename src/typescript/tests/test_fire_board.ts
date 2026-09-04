/*
    The board's story tree (SPEC §8), taken from the walkthrough's recorded
    worlds: the board nodes exist with their gists, event frames are nested
    in the left column, badges appear on map and go hollow on set aside,
    bands and annotations follow the mapping, the board becomes a chip when
    it is put down, the voice bars and the You marks appear at l. 350, and
    the wise man's board ends with both solutions.
*/
import * as assert from 'assert';
import 'mocha';
import { exact } from 'gist';
import { CAMPFIRE, FireWorld, HOUSE, PILLAGING, STORIES, VOICE_OF_FIRE, WISE_MAN } from 'demo_worlds/fire';

const FIRE = VOICE_OF_FIRE.voice.id;
import {
    board_gist, ledger_gist, left_gist, lesson_board_gist, reference_gist, right_gist, spoken_gist, targets_gist
} from 'demo_worlds/fire/board';
import { find_all_nodes, FoundNode, Fragment, is_story_hole, is_story_node, Story, StoryNode, Updates as S } from 'story';
import { accepts, frame_text, play, play_walkthrough, story_of, text, world_at } from './test_fire_walkthrough';
import { event_frame } from 'demo_worlds/fire/world';

function tree(w: FireWorld): Story {
    return story_of(w);
}

function one(story: Story, q: ReturnType<typeof S.has_gist>): StoryNode {
    const found = q.query(story);
    assert.equal(found.length, 1, `expected one node, found ${found.length}`);
    return found[0][0] as StoryNode;
}

function has(node: StoryNode, cls: string): boolean {
    return !!node.classes[cls];
}

function frames_in(node: Fragment): StoryNode[] {
    return find_all_nodes(node, n => is_story_node(n) && n.data.frame_index !== undefined && n !== node).map(([n]) => n as StoryNode);
}

function frame(story: Story, index: number): StoryNode {
    return S.frame(index).query(story)[0][0] as StoryNode;
}

function hole_path(story: Story): number[] {
    const found: FoundNode[] = find_all_nodes(story, n => is_story_hole(n));
    assert.equal(found.length, 1);
    return found[0][1];
}

const applied_of = (w: FireWorld, seq: string) => w.mappings.find(m => m.story === seq && m.status === 'applied')!.id;
const badges = (story: Story, seq: string) => S.has_gist({ tag: 'badge', params: { seq } }).query(story).map(([b]) => b as StoryNode);

describe('the board', function () {
    this.timeout(120000);

    it('has the lesson board, then the campfire board with the frames in its left column and the hole moving through it', () => {
        const w = world_at('campfire touched');
        const story = tree(w);
        assert.ok(has(one(story, S.has_gist(exact(lesson_board_gist()))), 'chip'), 'the lesson board is a chip once the campfire board opens');
        const board = one(story, S.has_gist(exact(board_gist('campfire'))));
        assert.ok(has(board, 'board') && !has(board, 'chip'));
        const left = one(story, S.has_gist(exact(left_gist('campfire'))));
        // Every frame since `pick up the chalk` is inside the left column: speak as, and eight events.
        const nested = frames_in(left);
        assert.equal(nested.length, 9);
        assert.equal(nested.filter(f => has(f, 'event')).length, 8);
        assert.ok(nested.every(f => has(f, 'event') === !has(f, 'you')));
        // The hole is inside the left column; the right column and the rule are still hidden.
        const left_path = S.has_gist(exact(left_gist('campfire'))).query(story)[0][1];
        assert.deepEqual(hole_path(story).slice(0, left_path.length), left_path);
        assert.ok(has(one(story, S.has_gist(exact(right_gist('campfire', FIRE)))), 'hidden'));
        // The remainder of ¶ 7 is no longer lit once both events are issued.
        const pieces = S.has_gist({ tag: 'prose', params: { seq: 'campfire', n: 7 } }).has_class('piece').query(story).map(([n]) => n as StoryNode);
        assert.equal(pieces.length, 2);
        assert.ok(pieces.every(p => !has(p, 'remainder')));
    });

    it('shows the notation once Katya rewrites it, folds and unfolds it, shows it on later boards, and leaves reprints alone', () => {
        const w = world_at('notation remembered');
        // After the second `listen` the notation is on the board, unfolded.
        assert.ok(accepts(w, 'collapse the steps') && !accepts(w, 'expand the steps'));
        const shown = S.has_gist({ tag: 'right' }).has_class('notation').query(tree(w)).map(([n]) => n as StoryNode);
        assert.equal(shown.length, 8);
        assert.ok(shown.every(n => !has(n, 'collapsed') && !has(n, 'absent')));
        // A reprint is a replay: never folded, and never touched by expand/collapse.
        const notation = (story: Story) => S.has_class('steps-memory').has_class('notation').query(story).map(([n]) => n as StoryNode);
        assert.ok(notation(tree(w)).length >= 8 && notation(tree(w)).every(n => !has(n, 'collapsed')));
        const folded = play(w, ['collapse the steps']);
        assert.ok(frame_text(folded).endsWith('The steps fold.'));
        const on_board = S.has_gist({ tag: 'right' }).has_class('notation').query(tree(folded)).map(([n]) => n as StoryNode);
        assert.equal(on_board.length, 8);
        assert.ok(on_board.every(n => has(n, 'collapsed')));
        assert.ok(notation(tree(folded)).every(n => !has(n, 'collapsed')));
        assert.ok(accepts(folded, 'expand the steps'));
        // A board opened while folded is folded too; unfolded again, the reprint stays as it was.
        const opened = tree(play(folded, ['listen', 'say that the Voice of Fire is contained in this one', 'pick up the chalk']));
        const campfire = S.has_gist(exact(right_gist('campfire', FIRE))).has_class('notation').query(opened).map(([n]) => n as StoryNode);
        assert.ok(campfire.length === 8 && campfire.every(n => has(n, 'collapsed')));
        const expanded = tree(play(folded, ['expand the steps']));
        assert.ok(S.has_gist({ tag: 'right' }).has_class('notation').query(expanded).every(([n]) => !has(n as StoryNode, 'collapsed')));
        assert.ok(notation(expanded).every(n => !has(n, 'collapsed')));
    });

    it('badges the rows on map, bands them from the mapping, and folds to a chip on say all set', () => {
        const after_line = tree(world_at('campfire lined'));
        assert.ok(!has(one(after_line, S.has_gist(exact(right_gist('campfire', FIRE)))), 'hidden'));
        assert.deepEqual(hole_path(after_line).slice(0, -1), S.has_gist(exact(ledger_gist('campfire'))).query(after_line)[0][1]);

        // A placed then erased step leaves no badge, no reference and no band.
        const e4 = world_at('campfire first map');
        const placed = tree(e4);
        const row = event_frame(e4, CAMPFIRE, 4)!;
        assert.ok(has(frame(placed, row), 'band-1') && has(frame(placed, row), 'mapped'));
        const erased = tree(world_at('campfire erased'));
        assert.equal(badges(erased, 'campfire').length, 0);
        assert.ok(!has(frame(erased, row), 'band-1') && !has(frame(erased, row), 'mapped'));
        assert.equal(one(erased, S.has_gist(exact(targets_gist('campfire', FIRE, 1)))).children.length, 0);

        const after_maps = tree(world_at('campfire applied'));
        assert.equal(badges(after_maps, 'campfire').length, 8);
        assert.ok(badges(after_maps, 'campfire').every(b => has(b, 'solid')));
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(after_maps, S.has_gist(exact(targets_gist('campfire', FIRE, s)))).children.length, 1, `step ${s} has one reference`);
            assert.equal(one(after_maps, S.has_gist(exact(spoken_gist('campfire', FIRE, s)))).children.length, 1, `the Fire speaks under step ${s}`);
        }
        // Steps 4, 5, 6 share the touch: three renditions, one consequence; three annotations, one per role.
        const touch = event_frame(e4, CAMPFIRE, 8)!;
        const touched = frame(after_maps, touch);
        assert.ok(has(touched, 'band-4') && has(touched, 'band-5') && has(touched, 'band-6') && !has(touched, 'band-1'));
        assert.equal(S.frame(touch).has_gist({ tag: 'annotation' }).query(after_maps).length, 3);
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_maps).length, 8);

        // Set aside: badges hollow, rendition and annotations gone; resume: back.
        const after_aside = tree(world_at('campfire set aside'));
        assert.ok(badges(after_aside, 'campfire').every(b => has(b, 'hollow') && !has(b, 'solid')));
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_aside).length, 0);
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_aside).length, 0);
        const after_resume = tree(world_at('campfire resumed'));
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_resume).length, 8);
        assert.ok(badges(after_resume, 'campfire').every(b => has(b, 'solid')));

        // Say all set: the board is a chip with a barcode, and the hole is back at the root; expand reopens it.
        const chipped = tree(world_at('campfire closed'));
        const board = one(chipped, S.has_gist(exact(board_gist('campfire'))));
        assert.ok(has(board, 'chip'));
        const title = board.children[0] as StoryNode;
        assert.ok(has(title, 'board-title') && title.children.some(c => is_story_node(c) && has(c, 'barcode')));
        assert.equal(hole_path(chipped).length, 1);
        // Expand takes the hole into the reopened board's ledger, so it is in view; collapse takes it back to the root.
        const reopened = tree(world_at('campfire chip expanded'));
        assert.ok(!has(one(reopened, S.has_gist(exact(board_gist('campfire')))), 'chip'));
        const ledger_path = S.has_gist(exact(ledger_gist('campfire'))).query(reopened)[0][1];
        assert.deepEqual(hole_path(reopened).slice(0, ledger_path.length), ledger_path);
        assert.ok(frame_text(world_at('campfire chip expanded')).endsWith('The campfire story unfolds.'));
        const refolded = tree(world_at('campfire chip collapsed'));
        assert.ok(has(one(refolded, S.has_gist(exact(board_gist('campfire')))), 'chip'));
        assert.equal(hole_path(refolded).length, 1);
    });

    it('draws the voice bars and the You marks at l. 350', () => {
        const story = tree(world_at('children speaking'));
        assert.ok(has(story, 'voices-taught'));
        const before = tree(world_at('house second follow'));
        assert.ok(!has(before, 'voices-taught'));
        // One YOU bar at the head of the transcript, after the opening, once the notation is taught.
        assert.equal(S.has_gist({ tag: 'you_bar' }).query(before).length, 0);
        const you_bar = S.has_gist({ tag: 'you_bar' }).query(story);
        assert.equal(you_bar.length, 1);
        assert.deepEqual(you_bar[0][1], [1]);
        assert.ok(is_story_node(story.children[0]) && (story.children[0] as StoryNode).data.frame_index === 0);
        // The frames are classed for the CSS to place the marks: speak as, traps, followed lines.
        const speak = S.frame().query(story)[0][0] as StoryNode;
        assert.ok(has(speak, 'speak-as') && has(speak, 'you'));
        const trap = world_at('thatch trap');
        assert.ok(has(frame(tree(trap), trap.index), 'nudge') && has(frame(tree(trap), trap.index), 'you'));
        assert.ok(has(frame(story, world_at('house second follow').index), 'follows'));
        // Two bars on the house board: the family, then the children; one on the campfire chip.
        const house_bars = S.has_gist(exact(left_gist('house'))).has_gist({ tag: 'voice_bar' }).query(story);
        assert.equal(house_bars.length, 2);
        assert.ok(has(house_bars[0][0] as StoryNode, 'voice-the-family') && has(house_bars[1][0] as StoryNode, 'voice-the-children'));
        assert.equal(S.has_gist(exact(left_gist('campfire'))).has_gist({ tag: 'voice_bar' }).query(story).length, 1);
        // The left column carries the current voice for the carat.
        assert.ok(has(one(story, S.has_gist(exact(left_gist('house')))), 'voice-the-children'));
        // Every frame of the player's own carries the You mark (frame 0, the opening, has no command).
        const own = frames_in(story).filter(f => !has(f, 'event') && f.data.frame_index !== 0);
        assert.ok(own.length > 10 && own.every(f => has(f, 'you')));
    });

    it('annotates a row once per role, folds the unmapped rows, and makes a chip of the house when the chalk is put down', () => {
        const applied = world_at('house applied');
        const story = tree(applied);
        const scatter = event_frame(applied, HOUSE, 13)!;
        assert.deepEqual(S.frame(scatter).has_gist({ tag: 'annotation' }).query(story).map(([n]) => (n as StoryNode).data.gist!.params!.role), ['flame', 'blaze', 'ash']);
        // The unmapped bar's count follows the mapping.
        const folded = world_at('house unmapped folded');
        assert.ok(text(folded).includes('▸ 9 events not in the mapping'));
        const remapped = world_at('house spark on the stick');
        assert.ok(text(remapped).includes('▸ 8 events not in the mapping'));
        // Folding the unmapped rows marks the voice runs that hold none of the mapping (the set-aside literal solution's rows count).
        const wise = tree(world_at('wise man unmapped folded'));
        const bars = S.has_gist(exact(left_gist('wise_man'))).has_gist({ tag: 'voice_bar' }).query(wise).map(([n]) => n as StoryNode);
        assert.equal(bars.length, 11);
        assert.deepEqual(bars.map(b => has(b, 'empty')), [false, false, false, true, true, true, false, true, false, false, false]);
        const switches = S.has_gist(exact(left_gist('wise_man'))).has_class('speak-as').query(wise).map(([n]) => n as StoryNode);
        assert.equal(switches.length, 11);
        assert.deepEqual(switches.map(f => has(f, 'empty')), bars.map(b => has(b, 'empty')));
        // Put down: a chip; the ledger's last frame is the put-down frame.
        const down = tree(world_at('house closed'));
        assert.ok(has(one(down, S.has_gist(exact(board_gist('house')))), 'chip'));
        const ledger = one(down, S.has_gist(exact(ledger_gist('house'))));
        const last = ledger.children[ledger.children.length - 1] as StoryNode;
        assert.ok(is_story_node(last) && last.data.frame_index !== undefined && has(last, 'you'));
        assert.equal(hole_path(down).length, 1);
    });

    it('ends with both solutions on the wise man\'s board', () => {
        const w = world_at('the end');
        const story = tree(w);
        const board = one(story, S.has_gist(exact(board_gist('wise_man'))));
        assert.ok(!has(board, 'chip'));
        const [first, second] = w.mappings.filter(m => m.story === WISE_MAN.id).map(m => m.id);
        const of = (id: number) => S.has_gist({ tag: 'badge', params: { seq: 'wise_man', id } }).query(story).map(([b]) => b as StoryNode);
        assert.equal(of(first).length, 8);
        assert.equal(of(second).length, 8);
        assert.ok(of(first).every(b => has(b, 'hollow')));
        assert.ok(of(second).every(b => has(b, 'solid')));
        // Each step has both references, one hollow; the Fire speaks only for the applied solution.
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(story, S.has_gist(exact(targets_gist('wise_man', FIRE, s)))).children.length, 2);
            assert.ok(has(one(story, S.has_gist(exact(reference_gist('wise_man', s, first)))), 'hollow'));
            assert.equal(one(story, S.has_gist(exact(spoken_gist('wise_man', FIRE, s)))).children.length, 1);
        }
        // The last frame (l. 481) is in the ledger, the coda is its own node after it, and the hole stays there.
        const [ledger, ledger_path] = S.has_gist(exact(ledger_gist('wise_man'))).query(story)[0];
        assert.deepEqual(hole_path(story).slice(0, ledger_path.length), ledger_path);
        const children = (ledger as StoryNode).children;
        const coda = children.findIndex(c => is_story_node(c) && has(c, 'coda'));
        assert.ok(coda > 0 && is_story_node(children[coda - 1]) && (children[coda - 1] as StoryNode).data.frame_index !== undefined);
        assert.ok(is_story_hole(children[coda + 1]));
        for (const seq of ['campfire', 'house', 'forest']) {
            assert.ok(has(one(story, S.has_gist(exact(board_gist(seq)))), 'chip'), `${seq} is a chip`);
        }
        assert.ok(has(board, 'unmapped-collapsed'));
        // Resuming the other solution hollows every badge and reference of the one it holds aside.
        const held = world_at('second held aside');
        const held_story = tree(held);
        const held_id = held.mappings.filter(m => m.story === WISE_MAN.id)[1].id;
        const held_badges = S.has_gist({ tag: 'badge', params: { seq: 'wise_man', id: held_id } }).query(held_story).map(([b]) => b as StoryNode);
        assert.equal(held_badges.length, 8);
        assert.ok(held_badges.every(b => has(b, 'hollow') && !has(b, 'held') && !has(b, 'solid')));
        assert.ok(S.has_gist({ tag: 'reference', params: { seq: 'wise_man', id: held_id } }).query(held_story).every(([r]) => has(r as StoryNode, 'hollow')));
        // At the end a chip expands into view (the hole in its ledger) and collapse returns the hole to the wise man's ledger, after the coda.
        const reopened = play(w, ['expand the campfire story']);
        const campfire_ledger = S.has_gist(exact(ledger_gist('campfire'))).query(tree(reopened))[0][1];
        assert.deepEqual(hole_path(tree(reopened)).slice(0, campfire_ledger.length), campfire_ledger);
        const back = tree(play(reopened, ['collapse the campfire story']));
        const [wise_ledger, wise_path] = S.has_gist(exact(ledger_gist('wise_man'))).query(back)[0];
        assert.deepEqual(hole_path(back).slice(0, wise_path.length), wise_path);
        const kids = (wise_ledger as StoryNode).children;
        assert.ok(is_story_hole(kids[kids.length - 1]) && kids.slice(0, -1).some(c => is_story_node(c) && has(c, 'coda')));
    });

    it('carries the Pillaging as a second column on the house, its placements never touching the Fire\'s', () => {
        const w = world_at('pillaging attempt');
        const story = tree(w);
        const board = one(story, S.has_gist(exact(board_gist('house'))));
        assert.ok(!has(board, 'chip'));
        const columns = S.has_gist(exact(board_gist('house'))).has_gist({ tag: 'right' }).query(story).map(([n]) => n as StoryNode);
        assert.deepEqual(columns.map(c => c.data.gist!.params!.pattern), [FIRE, PILLAGING.voice.id]);
        assert.ok(has(columns[1], 'second'));
        assert.equal(S.has_gist({ tag: 'step', params: { seq: 'house', pattern: PILLAGING.voice.id } }).query(story).length, 3);
        assert.equal(S.has_gist({ tag: 'step', params: { seq: 'house', pattern: FIRE } }).query(story).length, 8);
        // The hole is in the house's ledger.
        const ledger_path = S.has_gist(exact(ledger_gist('house'))).query(story)[0][1];
        assert.deepEqual(hole_path(story).slice(0, ledger_path.length), ledger_path);
        // Placed, the Pillaging's badge is on the moving in, in its own colours, with no band; the Fire's eight are as they were.
        const placed = world_at('pillaging placed');
        const placed_story = tree(placed);
        const fire_id = applied_of(placed, 'house');
        const fire_badges = S.has_gist({ tag: 'badge', params: { seq: 'house', id: fire_id } }).query(placed_story).map(([b]) => b as StoryNode);
        assert.equal(fire_badges.length, 8);
        assert.ok(fire_badges.every(b => has(b, 'solid') && !has(b, 'pattern-the-pillaging')));
        const pillaging = placed.mappings.filter(m => m.story === 'house' && m.voice === PILLAGING.voice.id)[0];
        const badges_of = S.has_gist({ tag: 'badge', params: { seq: 'house', id: pillaging.id } }).query(placed_story).map(([b]) => b as StoryNode);
        assert.equal(badges_of.length, 1);
        assert.ok(has(badges_of[0], 'pattern-the-pillaging') && has(badges_of[0], 'held'));
        assert.equal(one(placed_story, S.has_gist(exact(targets_gist('house', PILLAGING.voice.id, 1)))).children.length, 1);
        const row = frame(placed_story, event_frame(placed, HOUSE, 10)!);
        assert.ok(!has(row, 'band-1') && !has(row, 'mapped'));
        // Folded again: the house is a chip and the hole is back in the wise man's ledger.
        const folded = tree(world_at('attempt folded'));
        assert.ok(has(one(folded, S.has_gist(exact(board_gist('house')))), 'chip'));
        const wise_path = S.has_gist(exact(ledger_gist('wise_man'))).query(folded)[0][1];
        assert.deepEqual(hole_path(folded).slice(0, wise_path.length), wise_path);
    });

    it('never builds a board or a frame inside a chip', () => {
        // The structure board.css folds: a `.board.chip` hides every `.columns` beneath it, so no board may ever be nested in another.
        const boards = (story: Story) => S.has_class('board').query(story).map(([n, path]) => ({ node: n as StoryNode, path }));
        for (const w of [play_walkthrough().initial, ...play_walkthrough().worlds]) {
            const found = boards(tree(w));
            for (const a of found) {
                for (const b of found) {
                    const nested = a !== b && b.path.length > a.path.length && a.path.every((x, i) => b.path[i] === x);
                    assert.ok(!nested, `a board is nested in another at world ${w.index}`);
                }
            }
        }
        // What is done while a chip is expanded is logged in its ledger; folded, the chip shows its closing frame (l. 313–315), not the log.
        const reopened = world_at('campfire chip expanded');
        const folded = play(reopened, ['remember the campfire story', 'collapse the campfire story']);
        const ledger = one(tree(folded), S.has_gist(exact(ledger_gist(CAMPFIRE.id))));
        const logged = frames_in(ledger);
        assert.ok(logged.some(f => f.data.frame_index === folded.index));
        assert.deepEqual(logged.filter(f => has(f, 'closing')).map(f => f.data.frame_index), [world_at('campfire closed').index]);
        assert.equal(hole_path(tree(folded)).length, 1);
        assert.equal(STORIES.length, 4);
    });

    // Phase B13: a player who stops mid-story to look things up must not push
    // a ¶ away from the events that convert it.
    it('keeps every ¶ next to its own events when the player stops to remember, and prints the asides in the ledger', () => {
        const asides = [
            'remember the Voice of Fire',
            'remember the laying of the tinder',
            'remember the traveling to the woods',
            'remember the digging of a pit'
        ];
        const w = play(world_at('campfire touched'), [
            'let it follow',            // ¶ 8
            ...asides,
            'sing',                     // ¶ 9
            'add logs to the fire',     // ¶ 10
            ...asides,
            'sing',                     // ¶ 11, first of two
            ...asides,
            'sleep in tents'            // ¶ 11, second of two
        ]);
        const story = tree(w);
        const kids = one(story, S.has_gist(exact(left_gist(CAMPFIRE.id)))).children;
        const at = (pred: (n: StoryNode) => boolean) => kids.findIndex(n => is_story_node(n) && pred(n));
        const prose = (n: number) => at(k => has(k, 'prose') && (k.data.gist?.params as { n?: number } | undefined)?.n === n);
        const event = (n: number) => at(k => k.data.frame_index === event_frame(w, CAMPFIRE, n));
        // Each ¶'s event frame is its immediate next sibling; a two-event ¶'s second event follows the first.
        assert.equal(event(9), prose(9) + 1, 'the event of ¶ 9 is the next sibling of ¶ 9');
        assert.equal(event(10), prose(10) + 1, 'the event of ¶ 10 is the next sibling of ¶ 10');
        assert.equal(event(11), prose(11) + 1, 'the first event of ¶ 11 is the next sibling of ¶ 11');
        assert.equal(event(12), prose(11) + 2, 'the second event of ¶ 11 is the next sibling of the first');
        // The twelve reprints are in the board's ledger instead, in the order they were made.
        const ledger = one(story, S.has_gist(exact(ledger_gist(CAMPFIRE.id))));
        const logged = frames_in(ledger).map(f => f.data.frame_index as number);
        assert.equal(logged.length, asides.length * 3);
        assert.deepEqual(logged, [...logged].sort((a, b) => a - b));
        // The hole did not move: it still stands after the cursor ¶'s events, in the left column.
        const left_path = S.has_gist(exact(left_gist(CAMPFIRE.id))).query(story)[0][1];
        assert.deepEqual(hole_path(story).slice(0, left_path.length), left_path);
        // And the reprints are not in the left column at all.
        assert.ok(frames_in(one(story, S.has_gist(exact(left_gist(CAMPFIRE.id))))).every(f => !logged.includes(f.data.frame_index as number)));
    });
});
