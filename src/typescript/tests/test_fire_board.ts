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
import { CAMPFIRE, FireWorld, HOUSE, STORIES, WISE_MAN } from 'demo_worlds/fire';
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
        assert.ok(has(one(story, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        // The remainder of ¶ 7 is no longer lit once both events are issued.
        const pieces = S.has_gist({ tag: 'prose', params: { seq: 'campfire', n: 7 } }).has_class('piece').query(story).map(([n]) => n as StoryNode);
        assert.equal(pieces.length, 2);
        assert.ok(pieces.every(p => !has(p, 'remainder')));
    });

    it('starts with the notation folded, offers expand first, shows it on later boards, and leaves reprints alone', () => {
        const w = world_at('notation remembered');
        assert.ok(accepts(w, 'expand the steps'));
        const folded = S.has_gist({ tag: 'right' }).has_class('notation').query(tree(w)).map(([n]) => n as StoryNode);
        assert.equal(folded.length, 8);
        assert.ok(folded.every(n => has(n, 'collapsed') && !has(n, 'absent')));
        // A reprint is a replay: never folded, and never touched by expand/collapse.
        const notation = (story: Story) => S.has_class('steps-memory').has_class('notation').query(story).map(([n]) => n as StoryNode);
        assert.ok(notation(tree(w)).length >= 8 && notation(tree(w)).every(n => !has(n, 'collapsed')));
        const expanded = play(w, ['expand the steps']);
        const story = tree(expanded);
        assert.ok(frame_text(expanded).endsWith('The steps unfold.'));
        const on_board = S.has_gist({ tag: 'right' }).has_class('notation').query(story).map(([n]) => n as StoryNode);
        assert.equal(on_board.length, 8);
        assert.ok(on_board.every(n => !has(n, 'collapsed')));
        assert.ok(notation(story).every(n => !has(n, 'collapsed')));
        assert.ok(accepts(expanded, 'collapse the steps'));
        // A board opened afterwards shows its notation too.
        const opened = tree(play(expanded, ['listen', 'say that the Voice of Fire is contained in this one', 'pick up the chalk']));
        const campfire = S.has_gist(exact(right_gist('campfire'))).has_class('notation').query(opened).map(([n]) => n as StoryNode);
        assert.ok(campfire.length === 8 && campfire.every(n => !has(n, 'collapsed')));
        // Folded again, the reprint stays as it was.
        const refolded = tree(play(expanded, ['collapse the steps']));
        assert.ok(S.has_gist({ tag: 'right' }).has_class('notation').query(refolded).every(([n]) => has(n as StoryNode, 'collapsed')));
        assert.ok(notation(refolded).every(n => !has(n, 'collapsed')));
    });

    it('badges the rows on map, bands them from the mapping, and folds to a chip on say all set', () => {
        const after_line = tree(world_at('campfire lined'));
        assert.ok(!has(one(after_line, S.has_gist(exact(right_gist('campfire')))), 'hidden'));
        assert.deepEqual(hole_path(after_line).slice(0, -1), S.has_gist(exact(ledger_gist('campfire'))).query(after_line)[0][1]);

        // A placed then erased step leaves no badge, no reference and no band.
        const e4 = world_at('campfire first map');
        const placed = tree(e4);
        const row = event_frame(e4, CAMPFIRE, 4)!;
        assert.ok(has(frame(placed, row), 'band-1') && has(frame(placed, row), 'mapped'));
        const erased = tree(world_at('campfire erased'));
        assert.equal(badges(erased, 'campfire').length, 0);
        assert.ok(!has(frame(erased, row), 'band-1') && !has(frame(erased, row), 'mapped'));
        assert.equal(one(erased, S.has_gist(exact(targets_gist('campfire', 1)))).children.length, 0);

        const after_maps = tree(world_at('campfire applied'));
        assert.equal(badges(after_maps, 'campfire').length, 8);
        assert.ok(badges(after_maps, 'campfire').every(b => has(b, 'solid')));
        for (let s = 1; s <= 8; s++) {
            assert.equal(one(after_maps, S.has_gist(exact(targets_gist('campfire', s)))).children.length, 1, `step ${s} has one reference`);
            assert.equal(one(after_maps, S.has_gist(exact(spoken_gist('campfire', s)))).children.length, 1, `the Fire speaks under step ${s}`);
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
});
