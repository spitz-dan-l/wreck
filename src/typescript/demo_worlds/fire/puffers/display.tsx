/*
    Expand and collapse (SPEC §6): display-only toggles on the things the
    board can fold — the steps' notation, a board's story (its ¶s), its
    unmapped rows, an event's consequence, a finished sequence's chip. Each
    is a class on a gist-addressed node of a board (and, for the unmapped
    rows, one bar); reprints made by `remember` are never touched. Each
    prints one line, so the player has confirmation when the board is off
    screen (SPEC §8); a chip expanded while no board is open takes the hole
    into its ledger, so the reopened board is in view.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { EVENT_NAMES, STORIES, StorySpec } from '../data';
import { chip_ops, event_ops, paragraphs, steps_ops, story_ops, unmapped_ops } from '../board';
import { capitalised } from '../names';
import { BEAT, board_story, event_frame, FireWorld, mappings_on, phase, phrase } from '../world';

interface Thing {
    name: string;
    id: string;
    subject: string;        // "the steps": the one-line consequence reads "The steps fold." / "The steps unfold."
    ops: (collapsed: boolean) => StoryUpdaterSpec[];
}

function unmapped_count(w: FireWorld, story: StorySpec): number {
    const mapped = new Set(mappings_on(w, story).flatMap(m => m.placements.map(p => p.event)));
    return (w.sequences[story.id]?.events.length ?? 0) - mapped.size;
}

function things(w: FireWorld): Thing[] {
    const result: Thing[] = [];
    if (w.lesson >= BEAT.chalk) {
        result.push({ name: 'the steps', id: 'steps', subject: 'the steps', ops: steps_ops });
    }
    const story = board_story(w);
    if (story !== undefined) {
        result.push({ name: 'the story', id: `${story.id}:story`, subject: 'the story', ops: c => story_ops(story, c) });
        if (phase(w, story) === 'lined' || phase(w, story) === 'mapping') {
            result.push({ name: 'the unmapped', id: `${story.id}:unmapped`, subject: 'the unmapped rows', ops: c => unmapped_ops(story, c, unmapped_count(w, story)) });
        }
        const transcribed = w.sequences[story.id]?.events.length ?? 0;
        for (let n = 1; n <= transcribed; n++) {
            const name = EVENT_NAMES[story.id][n - 1];
            result.push({ name, id: `${story.id}:${n}`, subject: name, ops: c => event_ops(event_frame(w, story.id, n)!, c) });
        }
    }
    for (const s of STORIES) {
        if (w.sequences[s.id]?.finished && s.id !== w.board) {
            result.push({ name: s.title, id: `${s.id}:chip`, subject: s.title, ops: c => chip_ops(s, c, w.board === undefined) });
        }
    }
    return result;
}

function toggle(w: FireWorld, thing: Thing): FireWorld {
    const collapsed = !w.collapsed.includes(thing.id);
    const plural = thing.subject === 'the steps' || thing.subject === 'the unmapped rows';
    const line = `${capitalised(thing.subject)} ${collapsed ? 'fold' : 'unfold'}${plural ? '' : 's'}.`;
    return update(w, {
        collapsed: c => collapsed ? [...c, thing.id] : c.filter(x => x !== thing.id),
        story_updates: story_updater(S.consequence(paragraphs([line])), thing.ops(collapsed))
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
