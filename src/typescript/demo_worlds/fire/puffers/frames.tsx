/*
    Frame bookkeeping: before each command the world forgets what the player
    "just did"; after it, the frame is labelled with the gist the handler set
    (a story event, or a classroom command), so that `remember` can find it,
    and every frame that is not a story event is marked as the player's own
    (the `You` voice mark, SPEC §0.10).
*/
import { update } from 'lib/utils';
import { Puffer } from 'puffer';
import { story_updater, Updates as S } from 'story';
import { FireWorld } from '../world';

export const frames_puffer: Puffer<FireWorld> = {
    pre: world => update(world, { gist: () => undefined }),

    post: world => {
        const g = world.gist;
        const is_event = g !== undefined && g.tag === 'event';
        return update(world, {
            story_updates: story_updater(
                g === undefined ? [] : S.frame().set_gist(g),
                is_event ? [] : S.frame().css({ you: true })
            )
        });
    }
};
