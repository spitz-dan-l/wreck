import { TopicID, AbstractionID, ActionID, FacetID, global_lock, Owner, Puffers, Venience } from "./prelude";
import { ConsumeSpec } from '../../parser';
import { PufferAndWorld, Puffer } from '../../puffer';
import { message_updater, MessageUpdateSpec } from '../../message';
import { Gist, AbstractionIndex } from './metaphor';
import { update, cond } from '../../utils';
import { find_historical } from '../../interpretation';

export interface Topics {
    has_considered: { [K in TopicID]?: boolean }
}

declare module './prelude' {
    export interface Venience extends Topics {}
}

type PW = PufferAndWorld<Venience>;

export type TopicSpec = {
    name: TopicID,
    cmd: ConsumeSpec,
    can_consider: (w: PW) => boolean,
    message: MessageUpdateSpec,
    consider?: (w: PW) => PW,
    reconsider?: (w2: PW, w1: PW) => boolean
}

export function make_topic(spec: TopicSpec): Puffer<Venience> {
    return {
        handle_command: (world, parser) => {
            if (!spec.can_consider(world)) {
                parser.eliminate();
            }

            parser.consume({
                tokens: ['consider', spec.cmd],
                used: world.has_considered[spec.name]
            });
            parser.submit();

            return update(world,
                message_updater(spec.message),
                {
                    gist: {
                        name: `your impression of ${spec.name}`,
                        cmd: ['my_impression_of', spec.cmd]
                    },
                    has_considered: { [spec.name]: true } },
                ...cond(!!spec.consider, () => spec.consider!)
            );
        },
        post: (world2, world1) => {
            if (spec.reconsider === undefined ||
                world2.gist && world2.gist.name === `your impression of ${spec.name}` ||
                !spec.reconsider(world2, world1)) {
                return world2;
            }

            return update(world2, {
                has_considered: { [spec.name]: false }
            })
        }
    }
}

const null_lock = global_lock(null);

export const TopicIndex: TopicSpec[] = [];
export function Topics(...specs: TopicSpec[]) {
    TopicIndex.push(...specs);
    Puffers(...specs
        .map(make_topic)
        .map(null_lock.lock_puffer));
}


export type MemorySpec = {
    abstraction: AbstractionID,
    could_remember: (w: PW) => boolean,
}

export function make_memory(spec: MemorySpec): Puffer<Venience> {
    return {
        handle_command: (world, parser) => {
            if (world.has_acquired[spec.abstraction] || !spec.could_remember(world)) {
                parser.eliminate();
            }

            parser.consume('remember_something');
            parser.submit();

            let abstraction = AbstractionIndex.find(a => a.name === spec.abstraction)!;

            return update(world,
                {
                    has_acquired: { [spec.abstraction]: true },
                    gist: {
                        name: `your memory of ${abstraction.name}`,
                        cmd: ['my_memory_of', abstraction.name_cmd]
                    }
                },
                message_updater(`
                    You close your eyes, and hear Katya's voice:
                    <div class="interp">
                        ${abstraction.description}
                    </div>
                    You write this down.`
                ));
        },
        post: (world2, world1) => {
            // weird workaround for when you get locked out. seems to work *shrugs*
            world1 = find_historical(world1, w => w.owner === null)!;

            if (spec.could_remember(world2) &&
                !spec.could_remember(world1) &&
                world2.message.prompt.length === 0) {
                return update(world2, message_updater({
                    prompt: ['You feel as though you might <strong>remember something...</strong>']
                }));
            }
            return world2;
        }
    }
}

export const MemoryIndex: MemorySpec[] = [];
export function Memories(...specs: MemorySpec[]) {
    MemoryIndex.push(...specs);
    Puffers(...specs
        .map(make_memory)
        .map(null_lock.lock_puffer));
}


















