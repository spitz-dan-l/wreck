/*
    Frame bookkeeping: before each command the world forgets what the player
    "just did"; after it, the frame is labelled with the gist the handler set
    (a story event, or a classroom command), so that `remember` can find it,
    and every frame that is not a story event is marked as the player's own
    (the `You` voice mark, SPEC §0.10).

    And it puts the frame where it belongs. While a board is transcribing the
    hole stands after the cursor ¶, so that the next event's frame lands
    under it (SPEC §8) — but a frame that is not part of the transcription
    would come between the ¶ and its events and push them apart (a player who
    stops to `remember` twenty things mid-story left the ¶ 2,600 px from the
    event that converts it, Phase B13). Those frames — the `remember` reprints,
    the expand/collapse echoes — are moved down into the board's ledger
    instead, where the mapping's frames go; the hole does not move, so the next
    event still lands at the cursor ¶. The transcription's own frames stay
    there, and so do the lesson's scripted lines (SPEC §8's pause at the
    house).
*/
import { update } from 'lib/utils';
import { Puffer } from 'puffer';
import { story_updater, Updates as S } from 'story';
import { aside_frame_ops } from '../board';
import { board_story, FireWorld, phase } from '../world';

export const frames_puffer: Puffer<FireWorld> = {
    pre: world => update(world, { gist: () => undefined, at_the_cursor: () => false }),

    post: (world, old_world) => {
        const g = world.gist;
        const is_event = g !== undefined && g.tag === 'event';
        // A line of the lesson's own script belongs in the story where the .md
        // puts it (SPEC §8: l. 348–350 at the house's pause, between ¶8 and ¶9),
        // so it stays at the cursor ¶ like the transcription's own frames.
        const is_script_line = g !== undefined && g.tag === 'classroom';
        // Where the hole stood when the frame was made: the board open before
        // the command, in the middle of its transcription. (The command that
        // opens a board prints before it, at the root.)
        const story = board_story(old_world);
        const aside = !world.at_the_cursor && !is_script_line && story !== undefined && story === board_story(world)
            && phase(old_world, story) === 'transcribing';
        return update(world, {
            story_updates: story_updater(
                aside ? aside_frame_ops(story.id, world.index) : [],
                g === undefined ? [] : S.frame().set_gist(g),
                is_event ? [] : S.frame().css({ you: true })
            )
        });
    }
};
