import { Parser, RawInput } from './parser2';
import { CommandHandler, CommandResult, HistoryInterpreter, MetaLevelKeys, MessageGenerator, ObjectLevel, World, WorldSpec, get_initial_world } from './world';
import { update} from './datatypes';

export type PufferActivator<W> = (world: W) => number | boolean;
export type PufferCommandHandler<W> = (world: W, parser: Parser) => W;
export type PufferUpdater<W> = (world: W) => W;
export type PufferHistoryInterpreter<W> = HistoryInterpreter<W & World>;
export type PufferMessageGenerator<W> = MessageGenerator<W & World>;

export type Puffer<W={}> = {
    readonly activate: PufferActivator<W>,
    readonly pre?: PufferUpdater<W>,
    readonly handle_command?: PufferCommandHandler<W>,
    readonly post?: PufferUpdater<W>,
    readonly interpret_history?: PufferHistoryInterpreter<W>,
    readonly generate_message?: PufferMessageGenerator<W>
}

export interface PufferWorld extends World {
    active_puffer_indices: number[]
}

export function get_initial_puffer_world<W extends PufferWorld>(): Pick<W, keyof PufferWorld> {
    return {
        ...get_initial_world<W>(),
        active_puffer_indices: []
    };
}

type PufferLevel<W extends PufferWorld> = Pick<W, Exclude<keyof W, MetaLevelKeys | 'active_puffer_indices'>>;
type PufferForWorld<W extends PufferWorld> = Puffer<Partial<PufferLevel<W>>>;

type CompatPuffer<W0 extends PufferWorld, P> = P & (P extends Puffer<infer W1> ?
    Extract<PufferLevel<Required<W0>>, Required<W1>> extends never ? 
        'Puffer type not a strict subset of world type' :
        unknown :
    'P is not a puffer');

// TODO: Probably we don't need PufferIndex and ValidPufferIndex to be separate things
//    The more general "invalid puffer index" error does not appear to ever bubble up.
type PufferIndex<W extends PufferWorld, Index extends readonly PufferForWorld<W>[]> = {
    [K in keyof Index]: Index[K] & CompatPuffer<W, Index[K]>
};

type ValidPufferIndex<W extends PufferWorld, Index extends readonly PufferForWorld<W>[]> = PufferIndex<W, Index> &
    (Extract<Index, PufferIndex<W, Index>> extends never ?
        'Invalid puffer index' :
        unknown);

export type PufferWorldSpec<W extends PufferWorld, Index extends readonly PufferForWorld<W>[]> =
    WorldSpec<W> &
    { readonly puffer_index: ValidPufferIndex<W, Index> };

export function make_puffer_world_spec<W extends PufferWorld, Index extends readonly PufferForWorld<W>[]>
    (initial_world: W, puffer_index: ValidPufferIndex<W, Index>)
    : PufferWorldSpec<W, Index> {

    function lookup_active_puffers(indices: number[]) {
        return indices.map(i => puffer_index[i])
    }

    function pre(world: ObjectLevel<W>): ObjectLevel<W> {
        let active_puffer_indices =
            puffer_index
                .reduce((lst, p, i) => {
                    let res = p.activate(world as PufferLevel<W>);
                    if (res === false) {
                        return lst;
                    } else if (res === true) {
                        return [...lst, [i, 1]]
                    } else {
                        return [...lst, [i, res]];
                    }
                }, [])
                .sort(([pa, a], [pb, b]) => b - a)
                .map(x => x[0]);

        world = <W>update(world as ObjectLevel<PufferWorld>, { active_puffer_indices })

        let puffers = lookup_active_puffers(active_puffer_indices);
        return <ObjectLevel<W>> puffers.reduce((w, p) => p.pre === undefined ? w : p.pre(w as PufferLevel<W>), world);
    }

    
    function handle_command(world: ObjectLevel<W>, parser: Parser): ObjectLevel<W> {
        let active_puffers = lookup_active_puffers(world.active_puffer_indices);

        return parser.split(
            active_puffers
                .filter(puffer => puffer.handle_command !== undefined)
                .map(puffer => () => <ObjectLevel<W>>puffer.handle_command(<PufferLevel<W>>world, parser))
        );
    }

    function post(world: ObjectLevel<W>): ObjectLevel<W> {
        let active_puffers = lookup_active_puffers(world.active_puffer_indices);
        
        return <ObjectLevel<W>> active_puffers.reduce((w, p) => p.post === undefined ? w : p.post(w as PufferLevel<W>), world);
    }

    function interpret_history(new_world: W, old_world: W) {
        let active_puffers = lookup_active_puffers(new_world.active_puffer_indices);

        return active_puffers
            .filter(puffer => puffer.interpret_history !== undefined)
            .flatMap(puffer => puffer.interpret_history(new_world, old_world));
    }

    function generate_message(world: W) {
        // TODO: This part is gonna be hard to do right
        let active_puffers = lookup_active_puffers(world.active_puffer_indices);
        return active_puffers
            .map(puffer => puffer.generate_message(world))
            .filter(m => m !== undefined)
            .join('<br/><br/>');
    }

    return {
        initial_world,
        puffer_index,
        pre,
        handle_command,
        post,
        interpret_history,
        generate_message
    }
}
