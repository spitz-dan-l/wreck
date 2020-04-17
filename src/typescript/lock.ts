import { gate, ParserThread } from './parser';
import { gate_puffer, Puffer } from './puffer';
import { update } from './lib/utils';
import { World } from './world';

export type LockStatus = 'Unlocked' | 'Mine' | 'Locked';

export type LockSpec<W extends World, Owner extends string> = {
    owner: (w: W) => Owner | undefined,
    set_owner: (w: W, owner: Owner | undefined) => W
}

export type Lock<W extends World, Owner extends string> = {
    lock(world: W, start_index?: number): W,
    release(world: W): W,
    lock_puffer(puffer: Puffer<W>): Puffer<W>,
    owner(w: W): Owner | undefined,
    lock_parser_thread<R>(world: W, thread: ParserThread<R>): ParserThread<R>
}

export function lock_builder<
    W extends World,
    Owner extends string
>(spec: LockSpec<W, Owner>): (owner: Owner | undefined) => Lock<W, Owner> {
    return (owner: Owner | undefined) => {
        function has_permission(w: W) {
            let o = spec.owner(w);
            return o === undefined || o === owner;
        }

        function lock_puffer(puffer: Puffer<W>): Puffer<W> {
            return gate_puffer((w, old=false) => !old && has_permission(w), puffer);
        }

        function lock(world: W, start_index?: number) {
            if (start_index === undefined) {
                start_index = world.index;
            }

            return <W>update(<World>spec.set_owner(world, owner));
        }

        function release(world: W) {
            return <W>update(<World>spec.set_owner(world, undefined),
                );
        }

        function lock_parser_thread<R>(world: W, thread: ParserThread<R>) {
            return gate(has_permission(world), thread);
        }

        return {
            lock,
            release,
            lock_puffer,
            owner: spec.owner,
            lock_parser_thread
        };
    };
}