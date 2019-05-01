import { Omit, update } from './datatypes';
import { Parser } from './parser2';
import { get_initial_world, HistoryInterpreter, make_world_spec, MetaLevelKeys, ObjectLevel, Renderer, World, WorldSpec } from './world';

export type PufferAndWorld<W> = W & PufferLevel<PufferWorld>;

export type PufferActivator<W> = (world: PufferAndWorld<W>) => number | boolean;
export type PufferCommandHandler<W> = (world: PufferAndWorld<W>, parser: Parser) => PufferAndWorld<W>;
export type PufferUpdater<W> = (world: PufferAndWorld<W>) => PufferAndWorld<W>;
export type PufferHistoryInterpreter<W> = HistoryInterpreter<W & World>;

export type Puffer<W={}> = {
    readonly activate: PufferActivator<W>,
    readonly pre?: PufferUpdater<W>,
    readonly handle_command?: PufferCommandHandler<W>,
    readonly post?: PufferUpdater<W>,
    readonly interpret_history?: PufferHistoryInterpreter<W>,
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

type PufferLevel<W extends PufferWorld> = Omit<W, MetaLevelKeys | 'active_puffer_indices'>;
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

export function make_puffer_world_spec<W extends PufferWorld, Index extends readonly PufferForWorld<W>[]>
    (initial_world: W, puffer_index: PufferIndex<W, Index>, render?: Renderer)
    : WorldSpec<W> {
    function activate_puffers(world: ObjectLevel<W>): number[] {
        return puffer_index
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
    }

    function lookup_active_puffers(indices: number[]) {
        return indices.map(i => puffer_index[i])
    }

    function pre(world: ObjectLevel<W>): ObjectLevel<W> {
        let active_puffer_indices = activate_puffers(world);

        world = <W>update(world as ObjectLevel<PufferWorld>, { active_puffer_indices });

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
        let active_puffer_indices = activate_puffers(world);

        world = <W>update(world as ObjectLevel<PufferWorld>, { active_puffer_indices });
        
        let active_puffers = lookup_active_puffers(active_puffer_indices);
        
        return <ObjectLevel<W>> active_puffers.reduce((w, p) => p.post === undefined ? w : p.post(w as PufferLevel<W>), world);
    }

    function interpret_history(new_world: W, old_world: W) {
        let active_puffers = lookup_active_puffers(new_world.active_puffer_indices);

        return active_puffers
            .filter(puffer => puffer.interpret_history !== undefined)
            .flatMap(puffer => puffer.interpret_history(new_world, old_world));
    }

    return make_world_spec({
        initial_world,
        pre,
        handle_command,
        post,
        interpret_history,
        render
    })
}
