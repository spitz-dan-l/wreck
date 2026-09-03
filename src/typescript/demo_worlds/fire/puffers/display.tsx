/*
    Expand and collapse (SPEC §6): display-only toggles on the things the
    board can fold — the steps' notation, a board's story, its unmapped
    rows, an event's consequence, a finished sequence's chip. In phase B1
    they only record the state; B2 renders it.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { update } from 'lib/utils';
import { STORIES } from '../data';
import { event_names } from '../names';
import { board_story, FireWorld, phrase, scene_of } from '../world';

function toggle(w: FireWorld, id: string): FireWorld {
    return update(w, {
        collapsed: c => c.includes(id) ? c.filter(x => x !== id) : [...c, id]
    });
}

export const display_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const things: { name: string, id: string }[] = [];
        if (world.scene !== 'classroom') {
            things.push({ name: 'the steps', id: 'steps' });
        }
        const story = board_story(world);
        if (story !== undefined) {
            things.push({ name: 'the story', id: `${story.id}:story` });
            if (world.scene !== scene_of(story, 'transcribing')) {
                things.push({ name: 'the unmapped', id: `${story.id}:unmapped` });
            }
            const names = event_names(story, STORIES);
            const transcribed = world.sequences[story.id]?.events.length ?? 0;
            for (let n = 1; n <= transcribed; n++) {
                things.push({ name: names[n - 1], id: `${story.id}:${n}` });
            }
        }
        for (const s of STORIES) {
            if (world.sequences[s.id]?.finished && s.id !== world.board) {
                things.push({ name: s.title, id: `${s.id}:chip` });
            }
        }
        const threads: ParserThread<FireWorld>[] = things.map(t => p =>
            p.consume([world.collapsed.includes(t.id) ? 'expand' : 'collapse', GAP, phrase(t.name)], () =>
            p.submit(() => toggle(world, t.id))));
        return parser.split(threads);
    }
};
