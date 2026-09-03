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
import { FireWorld, HOUSE } from 'demo_worlds/fire';
import {
    board_gist, ledger_gist, left_gist, lesson_board_gist, reference_gist, right_gist, spoken_gist, targets_gist
} from 'demo_worlds/fire/board';
import { find_all_nodes, FoundNode, Fragment, is_story_hole, is_story_node, Story, StoryNode, Updates as S } from 'story';
import { commands, map_cmd, play, story_of, text, world_after } from './test_fire_walkthrough';

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

const badges = (story: Story, seq: string) => S.has_gist({ tag: 'badge', params: { seq } }).query(story).map(([b]) => b as StoryNode);

describe('the board', function () {
    this.timeout(120000);

    it('has the lesson board, then the campfire board with the frames in its left column and the hole moving through it', () => {
        const w = world_after('touch the flame to the tinder');
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
        assert.ok(has(one(story, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        // The remainder of ¶ 7 is no longer lit once both events are issued.
        const pieces = S.has_gist({ tag: 'prose', params: { seq: 'campfire', n: 7 } }).has_class('piece').query(story).map(([n]) => n as StoryNode);
        assert.equal(pieces.length, 2);
        assert.ok(pieces.every(p => !has(p, 'remainder')));
    });

    it('starts with the notation folded, offers expand first, and leaves reprints alone', () => {
        const w = world_after('remember the Voice of Fire', 2);
        assert.ok(commands(w).includes('expand the steps'));
        const expanded = play(w, ['expand the steps']);
        const story = tree(expanded);
        // The lesson board's notation is unfolded; the reprint in the remember frame is untouched.
        const on_board = S.has_gist({ tag: 'right' }).has_class('notation').query(story).map(([n]) => n as StoryNode);
        assert.equal(on_board.length, 8);
        assert.ok(on_board.every(n => !has(n, 'collapsed')));
        const reprinted = S.has_class('steps-memory').has_class('notation').query(story).map(([n]) => n as StoryNode);
        assert.ok(reprinted.length > 0 && reprinted.every(n => has(n, 'collapsed')));
        assert.ok(commands(expanded).includes('collapse the steps'));
    });

    it('badges the rows on map, bands them from the mapping, and folds to a chip on say all set', () => {
        const after_line = tree(world_after('draw a vertical line'));
        assert.ok(!has(one(after_line, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        assert.deepEqual(hole_path(after_line).slice(0, -1), S.has_gist(exact(ledger_gist('campfire'))).query(after_line)[0][1]);

        // A placed then erased step leaves no badge, no reference and no band.
        const e4 = world_after('map the laying of the tinder to the laying of the tinder in the pit');
        const placed = tree(e4);
        const row = e4.sequences.campfire.events[3];
        assert.ok(has(frame(placed, row), 'band-1') && has(frame(placed, row), 'mapped'));
        const erased = tree(world_after('erase the laying of the tinder'));
        assert.equal(badges(erased, 'campfire').length, 0);
        assert.ok(!has(frame(erased, row), 'band-1') && !has(frame(erased, row), 'mapped'));
        assert.equal(one(erased, S.has_gist(exact(targets_gist('campfire', 1)))).children.length, 0);

        const after_maps = tree(world_after('apply the Voice of Fire', 4));
        assert.equal(badges(after_maps, 'campfire').length, 8);
        assert.ok(badges(after_maps, 'campfire').every(b => has(b, 'solid')));
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(after_maps, S.has_gist(exact(targets_gist('campfire', s)))).children.length, 1, `step ${s} has one reference`);
            assert.equal(one(after_maps, S.has_gist(exact(spoken_gist('campfire', s)))).children.length, 1, `the Fire speaks under step ${s}`);
        }
        // Steps 4, 5, 6 share the touch: three renditions, one consequence; three annotations, one per role.
        const touch = e4.sequences.campfire.events[7];
        const touched = frame(after_maps, touch);
        assert.ok(has(touched, 'band-4') && has(touched, 'band-5') && has(touched, 'band-6') && !has(touched, 'band-1'));
        assert.equal(S.frame(touch).has_gist({ tag: 'annotation' }).query(after_maps).length, 3);
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_maps).length, 8);

        // Set aside: badges hollow, rendition and annotations gone; resume: back.
        const after_aside = tree(world_after('set aside the mapping'));
        assert.ok(badges(after_aside, 'campfire').every(b => has(b, 'hollow') && !has(b, 'solid')));
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_aside).length, 0);
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_aside).length, 0);
        const after_resume = tree(world_after('resume the mapping'));
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_resume).length, 8);
        assert.ok(badges(after_resume, 'campfire').every(b => has(b, 'solid')));

        // Say all set: the board is a chip with a barcode, and the hole is back at the root; expand reopens it.
        const chipped = tree(world_after('say all set'));
        const board = one(chipped, S.has_gist(exact(board_gist('campfire'))));
        assert.ok(has(board, 'chip'));
        const title = board.children[0] as StoryNode;
        assert.ok(has(title, 'board-title') && title.children.some(c => is_story_node(c) && has(c, 'barcode')));
        assert.equal(hole_path(chipped).length, 1);
        assert.ok(!has(one(tree(world_after('expand the campfire story')), S.has_gist(exact(board_gist('campfire')))), 'chip'));
    });

    it('draws the voice bars and the You marks at l. 350', () => {
        const story = tree(world_after('speak as the children'));
        assert.ok(has(story, 'voices-taught'));
        assert.ok(!has(tree(world_after('let it follow', 4)), 'voices-taught'));
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
        const applied = world_after('apply the Voice of Fire', 5);
        const story = tree(applied);
        const scatter = applied.sequences.house.events[12];
        assert.deepEqual(S.frame(scatter).has_gist({ tag: 'annotation' }).query(story).map(([n]) => (n as StoryNode).data.gist!.params!.role), ['flame', 'blaze', 'ash']);
        // The unmapped bar's count follows the mapping.
        const folded = world_after('collapse the unmapped');
        assert.ok(text(folded).includes('▸ 9 events not in the mapping'));
        const remapped = world_after(map_cmd(HOUSE, 4, 11));
        assert.ok(text(remapped).includes('▸ 8 events not in the mapping'));
        // Put down: a chip; the ledger's last frame is the put-down frame.
        const down = tree(world_after('put down the chalk'));
        assert.ok(has(one(down, S.has_gist(exact(board_gist('house')))), 'chip'));
        const ledger = one(down, S.has_gist(exact(ledger_gist('house'))));
        const last = ledger.children[ledger.children.length - 1] as StoryNode;
        assert.ok(is_story_node(last) && last.data.frame_index !== undefined && has(last, 'you'));
        assert.equal(hole_path(down).length, 1);
    });

    it('ends with both solutions on the wise man\'s board', () => {
        const w = world_after('say Ok, I guess');
        const story = tree(w);
        const board = one(story, S.has_gist(exact(board_gist('wise_man'))));
        assert.ok(!has(board, 'chip'));
        const [first, second] = w.mappings.filter(m => m.sequence === 'wise_man').map(m => m.id);
        const of = (id: number) => S.has_gist({ tag: 'badge', params: { seq: 'wise_man', id } }).query(story).map(([b]) => b as StoryNode);
        assert.equal(of(first).length, 8);
        assert.equal(of(second).length, 8);
        assert.ok(of(first).every(b => has(b, 'hollow')));
        assert.ok(of(second).every(b => has(b, 'solid')));
        // Each step has both references, one hollow; the Fire speaks only for the applied solution.
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(story, S.has_gist(exact(targets_gist('wise_man', s)))).children.length, 2);
            assert.ok(has(one(story, S.has_gist(exact(reference_gist('wise_man', s, first)))), 'hollow'));
            assert.equal(one(story, S.has_gist(exact(spoken_gist('wise_man', s)))).children.length, 1);
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
    });
});
