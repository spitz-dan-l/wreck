import { World } from './world';
import { Parser, ParserThread, ConsumeSpec, gate } from './parser';
import { map_puffer, gate_puffer, Puffer, PufferAndWorld } from './puffer';
import { LocalInterpretations, interpretation_updater, find_historical } from './interpretation';
import {update, Updater} from './utils';

export type LockStatus = 'Unlocked' | 'Mine' | 'Locked';

export type LockSpec<W, Owner extends string> = {
    owner: (w: PufferAndWorld<W>) => Owner | null,
    set_owner: (w: PufferAndWorld<W>, owner: Owner | null) => PufferAndWorld<W>
}

export function lock_builder<W, Owner extends string>(spec: LockSpec<W, Owner>) {
    return (owner: Owner | null) => {
        function has_permission(w: PufferAndWorld<W>) {
            let o = spec.owner(w);
            return o === null || o === owner;
        }

        function lock_puffer(puffer: Puffer<W>): Puffer<W> {
            return gate_puffer(has_permission, puffer);
        }

        function lock(world: PufferAndWorld<W>, start_index?: number) {
            if (start_index === undefined) {
                start_index = world.index;
            }

            return <PufferAndWorld<W>>update(<World>spec.set_owner(world, owner),
                interpretation_updater(world, w => {
                    if (w.index < start_index!) {
                        return { unfocused: true };
                    }
                    return {};
                }));
        }

        function release(world: PufferAndWorld<W>) {
            return <PufferAndWorld<W>>update(<World>spec.set_owner(world, null),
                interpretation_updater(world, () => ({ unfocused: false })));
        }

        function lock_parser_thread<R>(world: PufferAndWorld<W>, thread: ParserThread<R>) {
            return gate(() => has_permission(world), thread);
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