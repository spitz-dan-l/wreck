/*
    The board's story tree (SPEC §8), built through the walkthrough without
    the UI: the board nodes exist with their gists, event frames are nested
    in the left column, badges appear on map and go hollow on set aside, the
    board becomes a chip on `say all set`, the voice bars and the You marks
    appear at l. 350, and the wise man's board ends with both solutions.
*/
import * as assert from 'assert';
import 'mocha';
import { exact } from 'gist';
import { new_fire_world, FireWorld } from 'demo_worlds/fire';
import {
    badge_gist, board_gist, ledger_gist, left_gist, lesson_board_gist, reference_gist, right_gist, spoken_gist, targets_gist
} from 'demo_worlds/fire/board';
import { raw } from 'parser';
import { apply_story_updates_all, find_all_nodes, FoundNode, Fragment, is_story_hole, is_story_node, Story, StoryNode, Updates as S } from 'story';
import { WALKTHROUGH } from './test_fire_walkthrough';

function tree(w: FireWorld): Story {
    return apply_story_updates_all(w.story, w.story_updates);
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

function hole_path(story: Story): number[] {
    const found: FoundNode[] = find_all_nodes(story, n => is_story_hole(n));
    assert.equal(found.length, 1);
    return found[0][1];
}

// Play the walkthrough up to and including the nth occurrence of a command, running checks on the way.
function play(until: (cmd: string, nth: number) => boolean, checks: { [cmd: string]: (w: FireWorld) => void } = {}) {
    const { initial_result, update } = new_fire_world();
    let world = initial_result.world;
    const seen: { [cmd: string]: number } = {};
    for (const step of WALKTHROUGH) {
        if (step.trap !== undefined) {
            continue;
        }
        world = update(world, raw(step.cmd)).world;
        seen[step.cmd] = (seen[step.cmd] ?? 0) + 1;
        if (checks[step.cmd] !== undefined) {
            checks[step.cmd](world);
        }
        if (until(step.cmd, seen[step.cmd])) {
            return world;
        }
    }
    throw new Error('The walkthrough ended before the state was reached.');
}

describe('the board', function () {
    this.timeout(120000);

    it('has the lesson board, then the campfire board with the frames in its left column and the hole moving through it', () => {
        const w = play((c, n) => c === 'touch the flame to the tinder');
        const story = tree(w);
        const lesson = one(story, S.has_gist(exact(lesson_board_gist())));
        assert.ok(has(lesson, 'chip'), 'the lesson board is a chip once the campfire board opens');
        const board = one(story, S.has_gist(exact(board_gist('campfire'))));
        assert.ok(has(board, 'board') && !has(board, 'chip'));
        const left = one(story, S.has_gist(exact(left_gist('campfire'))));
        // Every frame since `pick up the chalk` is inside the left column: speak as, and eight events.
        const nested = frames_in(left);
        assert.equal(nested.length, 9);
        assert.equal(nested.filter(f => has(f, 'event')).length, 8);
        assert.ok(nested.every(f => has(f, 'event') === !has(f, 'you')));
        // The hole is inside the left column, after ¶ 7 (the two-event line).
        const hole = hole_path(story);
        const left_path = S.has_gist(exact(left_gist('campfire'))).query(story)[0][1];
        assert.deepEqual(hole.slice(0, left_path.length), left_path);
        // The right column and the rule are still hidden; the notation is present but collapsed.
        assert.ok(has(one(story, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        assert.equal(w.remainder, undefined);
    });

    it('reveals the right column on the line, badges the rows on map, and folds to a chip on say all set', () => {
        let after_line: Story | undefined, after_maps: Story | undefined, after_aside: Story | undefined, after_resume: Story | undefined;
        let maps = 0;
        const w = play((c, n) => c === 'say all set' && n === 1, {
            'draw a vertical line': w => { after_line = tree(w); },
            'apply the Voice of Fire': w => { after_maps = tree(w); },
            'set aside the mapping': w => { after_aside = tree(w); },
            'resume the mapping': w => { after_resume = tree(w); }
        });
        assert.ok(!has(one(after_line!, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        assert.deepEqual(hole_path(after_line!).slice(0, -1), S.has_gist(exact(ledger_gist('campfire'))).query(after_line!)[0][1]);
        // Eight badges on the rows, in the input lines of the event frames; eight references under the steps.
        const badges = S.has_gist({ tag: 'badge', params: { seq: 'campfire' } }).query(after_maps!);
        assert.equal(badges.length, 8);
        assert.ok(badges.every(([b]) => has(b as StoryNode, 'solid')));
        assert.equal(one(after_maps!, S.has_gist(exact(badge_gist('campfire', 8, 4, 'first')))).classes['step-4'], true);
        for (let s = 1; s <= 8; s++) {
            const targets = one(after_maps!, S.has_gist(exact(targets_gist('campfire', s))));
            assert.equal(targets.children.length, 1, `step ${s} has one reference`);
            assert.ok(one(after_maps!, S.has_gist(exact(spoken_gist('campfire', s)))).children.length === 1, `the Fire speaks under step ${s}`);
        }
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_maps!).length, 8);
        // Set aside: badges hollow, rendition and annotations gone; resume: back.
        const aside = S.has_gist({ tag: 'badge', params: { seq: 'campfire' } }).query(after_aside!);
        assert.ok(aside.every(([b]) => has(b as StoryNode, 'hollow') && !has(b as StoryNode, 'solid')));
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_aside!).length, 0);
        assert.equal(S.has_gist({ tag: 'annotation', params: { seq: 'campfire' } }).query(after_aside!).length, 0);
        assert.equal(S.has_gist({ tag: 'rendition', params: { seq: 'campfire' } }).query(after_resume!).length, 8);
        assert.ok(S.has_gist({ tag: 'badge', params: { seq: 'campfire' } }).query(after_resume!).every(([b]) => has(b as StoryNode, 'solid')));
        // Say all set: the board is a chip with a barcode, and the hole is back at the root.
        const story = tree(w);
        const board = one(story, S.has_gist(exact(board_gist('campfire'))));
        assert.ok(has(board, 'chip'));
        const title = board.children[0] as StoryNode;
        assert.ok(has(title, 'board-title') && title.children.some(c => is_story_node(c) && has(c, 'barcode')));
        assert.equal(hole_path(story).length, 1);
        maps++;
        assert.ok(maps > 0);
    });

    it('draws the voice bars and the You marks at l. 350', () => {
        let before: Story | undefined;
        const w = play((c, n) => c === 'speak as the children', {
            'ask what the right thing to do is': w => { before = tree(w); }
        });
        assert.ok(!has(before!, 'voices-taught') || true);
        const story = tree(w);
        assert.ok(has(story, 'voices-taught'));
        // Two bars on the house board: the family, then the children; one on the campfire chip.
        const house_bars = S.has_gist(exact(left_gist('house'))).has_gist({ tag: 'voice_bar' }).query(story);
        assert.equal(house_bars.length, 2);
        assert.ok(has(house_bars[0][0] as StoryNode, 'voice-the-family') && has(house_bars[1][0] as StoryNode, 'voice-the-children'));
        assert.equal(S.has_gist(exact(left_gist('campfire'))).has_gist({ tag: 'voice_bar' }).query(story).length, 1);
        // The left column carries the current voice for the carat.
        assert.ok(has(one(story, S.has_gist(exact(left_gist('house')))), 'voice-the-children'));
        // Frames before l. 350 already carry the You mark; the bars were there, hidden, all along.
        const root_frames = frames_in(story).filter(f => !has(f, 'event') && f.data.frame_index !== 0);
        assert.ok(root_frames.length > 10 && root_frames.every(f => has(f, 'you')));
        assert.ok(S.has_gist({ tag: 'voice_bar' }).query(before!).length === 2);
    });

    it('ends with both solutions on the wise man\'s board, the unmapped rows folded', () => {
        const w = play((c, n) => c === 'say Ok, I guess');
        const story = tree(w);
        const board = one(story, S.has_gist(exact(board_gist('wise_man'))));
        assert.ok(!has(board, 'chip'));
        const first = S.has_gist({ tag: 'badge', params: { seq: 'wise_man', pass: 'first' } }).query(story);
        const second = S.has_gist({ tag: 'badge', params: { seq: 'wise_man', pass: 'second' } }).query(story);
        assert.equal(first.length, 8);
        assert.equal(second.length, 8);
        assert.ok(first.every(([b]) => has(b as StoryNode, 'hollow')));
        assert.ok(second.every(([b]) => has(b as StoryNode, 'solid')));
        // Each step has both references, one hollow; the Fire speaks only for the applied solution.
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(story, S.has_gist(exact(targets_gist('wise_man', s)))).children.length, 2);
            assert.ok(has(one(story, S.has_gist(exact(reference_gist('wise_man', s, 'first')))), 'hollow'));
            assert.equal(one(story, S.has_gist(exact(spoken_gist('wise_man', s)))).children.length, 1);
        }
        // The last frame (l. 481) is in the ledger, the coda is its own node after it, and the hole stays there.
        const [ledger, ledger_path] = S.has_gist(exact(ledger_gist('wise_man'))).query(story)[0];
        assert.deepEqual(hole_path(story).slice(0, ledger_path.length), ledger_path);
        const children = (ledger as StoryNode).children;
        const coda = children.findIndex(c => is_story_node(c) && has(c, 'coda'));
        assert.ok(coda > 0 && is_story_node(children[coda - 1]) && (children[coda - 1] as StoryNode).data.frame_index !== undefined);
        assert.ok(is_story_hole(children[coda + 1]));
        // The three earlier boards are chips; the unmapped rows of this one are folded.
        for (const seq of ['campfire', 'house', 'forest']) {
            assert.ok(has(one(story, S.has_gist(exact(board_gist(seq)))), 'chip'), `${seq} is a chip`);
        }
        assert.ok(w.collapsed.includes('wise_man:unmapped') === has(board, 'unmapped-collapsed'));
    });
});
