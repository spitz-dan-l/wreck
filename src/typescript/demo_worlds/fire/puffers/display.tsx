/*
    Expand and collapse (SPEC §6): display-only toggles on the things the
    board can fold — the steps' notation, a board's story (its ¶s), its
    unmapped rows, a finished sequence's chip. Each is a class on a
    gist-addressed node of a board (and, for the unmapped rows, one bar);
    reprints made by `remember` are never touched. Each prints one line, so
    the player has confirmation when the board is off screen (SPEC §8).

    A toggle is offered only where it has something to do (Phase B9): the
    steps only once Katya has written the notation (l. 182), the unmapped
    rows only where some row is mapped and some is not. SPEC §6's per-event
    `expand <event>` is not offered: one entry per transcribed event flooded
    the list (fifteen of them by the wise man) and buried the way on.

    Chips: while no board is open, at most one chip is expanded at a time
    (expanding another folds the first), the hole sits in its ledger so the
    reopened board is in view, and only display commands and `remember` are
    offered (world.ts expanded_chip); `collapse` returns the hole to the root.
    While a board is open, a chip expands where it is and the hole stays
    with the board.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { STORIES, StorySpec } from '../data';
import { chip_ops, paragraphs, steps_ops, story_ops } from '../board';
import { capitalised } from '../names';
import { BEAT, board_story, ended, expanded_chip, FireWorld, phase, phrase } from '../world';
import { rows_of, unmapped_rows } from './mapping';

interface Thing {
    name: string;
    id: string;
    subject: string;        // "the steps": the one-line consequence reads "The steps fold." / "The steps unfold."
    plural?: true;
    ops: (w: FireWorld, collapsed: boolean) => StoryUpdaterSpec[];   // `w` has the toggle applied
}

// At the end the lesson's last board stays open: a chip is expanded as if none were, and the hole returns to that board's ledger.
function chip(w: FireWorld, story: StorySpec): Thing {
    const alone = w.board === undefined || ended(w);
    return { name: story.title, id: `${story.id}:chip`, subject: story.title, ops: (_, c) => chip_ops(story, c, alone, ended(w) ? w.board : undefined) };
}

function things(w: FireWorld): Thing[] {
    const result: Thing[] = [];
    // Not before the second `listen`: until Katya rewrites them there is no notation to fold.
    if (w.lesson >= BEAT.notation) {
        result.push({ name: 'the steps', id: 'steps', subject: 'the steps', plural: true, ops: (_, c) => steps_ops(c) });
    }
    const story = board_story(w);
    if (story !== undefined) {
        result.push({ name: 'the story', id: `${story.id}:story`, subject: 'the story', ops: (_, c) => story_ops(story, c) });
        // Only where there is something to fold and something to keep.
        const rows = unmapped_rows(w, story);
        if ((phase(w, story) === 'lined' || phase(w, story) === 'mapping') && rows.unmapped > 0 && rows.mapped > 0) {
            result.push({ name: 'the unmapped', id: `${story.id}:unmapped`, subject: 'the unmapped rows', plural: true, ops: next => rows_of(next, story) });
        }
    }
    for (const s of STORIES) {
        if (w.finished.includes(s.id) && s.id !== w.board) {
            result.push(chip(w, s));
        }
    }
    return result;
}

function toggle(w: FireWorld, thing: Thing): FireWorld {
    const collapsed = !w.collapsed.includes(thing.id);
    const line = `${capitalised(thing.subject)} ${collapsed ? 'fold' : 'unfold'}${thing.plural ? '' : 's'}.`;
    // Expanding a chip with no board open folds the chip expanded before it.
    const other = !collapsed && thing.id.endsWith(':chip') ? expanded_chip(w) : undefined;
    const next = update(w, {
        collapsed: c => [...c.filter(x => x !== thing.id), ...(collapsed ? [thing.id] : []), ...(other === undefined ? [] : [`${other.id}:chip`])]
    });
    return update(next, {
        story_updates: story_updater(
            S.consequence(paragraphs([line])),
            other === undefined ? [] : chip_ops(other, true, false),
            thing.ops(next, collapsed)
        )
    });
}

export const display_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const threads: ParserThread<FireWorld>[] = things(world).map(t => p =>
            p.consume([world.collapsed.includes(t.id) ? 'expand' : 'collapse', GAP, phrase(t.name)], () =>
            p.submit(() => toggle(world, t))));
        return parser.split(threads);
    }
};
