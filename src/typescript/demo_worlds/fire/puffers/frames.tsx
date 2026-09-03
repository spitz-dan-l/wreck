/*
    Frame bookkeeping: before each command the world forgets what the player
    "just did"; after it, the frame is labelled with the gist the handler set
    (a story event, or a classroom command), so that `remember` can find it.
*/
import { update } from 'lib/utils';
import { Puffer } from 'puffer';
import { story_updater, Updates as S } from 'story';
import { FireWorld } from '../world';

export const frames_puffer: Puffer<FireWorld> = {
    pre: world => update(world, { gist: () => undefined }),

    post: world => {
        const g = world.gist;
        if (g === undefined) {
            return world;
        }
        return update(world, {
            story_updates: story_updater(S.frame().set_gist(g))
        });
    }
};
