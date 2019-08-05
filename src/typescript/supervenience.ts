import {World, WorldSpec, update_thread_maker} from './world';
import { traverse_thread, ParserThread, RawConsumeSpec, Parser, gate } from './parser';
import { deep_equal, drop_keys } from './utils';
import { find_historical } from './interpretation';

/*
    Take a world and return some projection of it that is somehow descriptive
    of a single narrative dimension.
    
    The result of the projection will be compared using deep_equal to values
    produced by applying the same projection to different worlds.

    This is used to perform cycle elimination in the future-search. If a candidate
    world is equal on every narrative dimension to some previously-visited state,
    it is skipped.
*/
export type NarrativeDimension<W extends World> = (w: W) => any;

function default_narrative_space<W extends World>(): NarrativeDimension<W>[] {
    return [w => drop_keys(w, 'previous', 'index', 'parsing', 'parent', 'child')];
}

/*
    Take a world and return whether some narratively-relevant goal state has been
    reached in that world.
    
    A world's "score" is the number of goals it has met.
    
    This is used to constrain the future search so that candidate states are skipped
    if they have a lower score than the current.
*/
export type NarrativeGoal<W extends World> = (w: W) => boolean;


export type CommandFilter<W extends World> = (w: W, command: RawConsumeSpec[]) => boolean;

function get_score<W extends World>(w: W, goals: NarrativeGoal<W>[]) {
    return goals.map(g => g(w)).reduce((acc, goal_met) => acc + (goal_met ? 1 : 0), 0);
}

export type FutureSearchSpec<W extends World> = {
    search_id?: string,
    simulator_id: string,
    thread_maker: (w: W) => ParserThread<W>,
    goals: NarrativeGoal<W>[],
    space?: NarrativeDimension<W>[],
    give_up_after?: number,
    max_steps?: number,
    command_filter?: CommandFilter<W>
}

export type FutureSearchStats = {
    iterations: number,
    steps_in_solution?: number,
    states_enumerated: number,
    states_skipped: number
}

export type FutureSearchStatus =
    'Found' |
    'Timeout' |
    'Unreachable' |
    'InSimulation';

export type FutureSearchResult<W extends World> = {
    kind: 'FutureSearchResult',
    status: FutureSearchStatus,
    result: W | null,
    stats: FutureSearchStats | null
};

// do a breadth-first search of possible futures for some goal state
export function search_future<W extends World>(spec: FutureSearchSpec<W>, world: W): FutureSearchResult<W>
{
    if (is_simulated(spec.simulator_id, world)) {
        // A future search for this world's timeline is already running.
        // Recursive future searches are most likely too inefficient to allow, so
        // we return null in this case, indicating to the caller who would have
        // conducted the future search that she is already in a simulation, and should
        // therefore only take atomic/non-recursive actions.
        return {
            kind: 'FutureSearchResult',
            status: 'InSimulation',
            result: null,
            stats: null
        };
    }
    if (spec.search_id !== undefined) {
        let cached_result = lookup_cache<W>(spec.search_id, world);
        if (cached_result !== undefined) {
            return cached_result
        }
    }
    try {
        function cache(result: FutureSearchResult<W>) {
            return cache_search_result(spec, world, result);
        }
        begin_search(spec.simulator_id, world);
    
        if (spec.space === undefined) {
             spec = {...spec, space: default_narrative_space()};
        }

        type Entry = [W, any[], number];

        let n_skipped = 0;
        const visited: Entry[] = [[
            world,
            spec.space!.map(dim => dim(world)),
            get_score(world, spec.goals)
        ]];
        let i = 0;
        let anchor = 0;

        function make_stats(steps_in_solution?: number): FutureSearchStats {
            return {
                iterations: i,
                steps_in_solution,
                states_enumerated: visited.length,
                states_skipped: n_skipped
            }
        }

        lup: while (spec.give_up_after === undefined || i < spec.give_up_after) {
            const next_index = visited.length - 1 - i;

            if (next_index < 0) {
                // Failed future world search, goal is unreachable
                // (If max_steps was set in the spec, it could be due to no solution being available in max_steps)
                return cache({
                    kind: 'FutureSearchResult',
                    status: 'Unreachable',
                    result: null,
                    stats: make_stats()
                });
            }

            const [w, pos, score] = visited[next_index];

            if (score === spec.goals.length) {
                let n_turns = w.index - world.index;
                return cache({
                    kind: 'FutureSearchResult',
                    status: 'Found',
                    result: w,
                    stats: make_stats(n_turns)
                });
            }

            if (spec.max_steps !== undefined && w.index - world.index >= spec.max_steps) {
                i++;
                continue;
            }
            
            const transitions = traverse_thread(
                spec.thread_maker(w), 
                spec.command_filter !== undefined
                    ? (cmd) => spec.command_filter!(w, cmd)
                    : undefined);

            const neighbor_states = Object.values(transitions);
            if (neighbor_states.length === 0) {
                throw new Error('Future search reached a non-goal terminal state');
            }
            for (let parse_result of neighbor_states) {
                const dest = {...parse_result.result, parsing: parse_result.parsing};
                const dest_pos = spec.space!.map(dim => dim(dest));
                const dest_score = get_score(dest, spec.goals);
                
                if (dest_score > score) {
                    // skip ahead to only search from this node now
                    visited.unshift([dest, dest_pos, dest_score]);
                    n_skipped += visited.length - 1 - i;
                    i = visited.length - 1;
                    anchor = i;
                    
                    continue lup;
                } else if (dest_score < score) {
                    n_skipped++;
                } else if (!visited.slice(0, visited.length - anchor).some(([, pos]) => dest_pos.every((d, j) => deep_equal(d, pos[j])))) {
                    visited.unshift([dest, dest_pos, dest_score]);
                } else {
                    n_skipped++;
                }
            }
            i++;
        }

        return cache({
            kind: 'FutureSearchResult',
            status: 'Timeout',
            result: null,
            stats: make_stats()
        });

    } finally {
        end_search(spec.simulator_id, world);
    }
}

const active_simulators: { [K: string]: Set<World> } = {};

export function is_simulated<W extends World>(simulator_id: string, world: W) {
    if (!(simulator_id in active_simulators)) {
        return false;
    }

    const entry = active_simulators[simulator_id];
    return find_historical(world, w => entry.has(w)) !== null;
}

function begin_search<W extends World>(simulator_id: string, world: W) {
    let entry: Set<World>;
    if (simulator_id in active_simulators) {
        entry = active_simulators[simulator_id];
    } else {
        entry = active_simulators[simulator_id] = new Set();
    }
    entry.add(world);
}

function end_search<W extends World>(simulator_id: string, world: W) {
    let entry = active_simulators[simulator_id];
    entry.delete(world);

    if (entry.size === 0) {
        delete active_simulators[simulator_id];
    }
}

const cache_size = 100;

type CacheEntry<W extends World> = {
    kind: 'CacheEntry',
    spec: FutureSearchSpec<W>,
    results: {
        world: W, position: any[], result: FutureSearchResult<W>
    }[]
}
const cached_searches: { [K in string]?: CacheEntry<any> } = {};

function cache_search_result<W extends World>(search_spec: FutureSearchSpec<W>, world: W, search_result: FutureSearchResult<W>) {
    if (search_spec.search_id === undefined) {
        return search_result;
    }

    let entry: CacheEntry<W>;
    if (search_spec.search_id in cached_searches) {
        entry = cached_searches[search_spec.search_id]!;
    } else {
        entry = cached_searches[search_spec.search_id] = {
            kind: 'CacheEntry',
            spec: search_spec,
            results: []
        };
    }

    let position = get_position(search_spec, world);
    let match = find_in_entry(entry, position);

    if (match === undefined) {
        entry.results.push({ world, position, result: search_result });
        if (cached_searches[search_spec.search_id] === undefined) {
            cached_searches[search_spec.search_id] = entry;
        }
    }

    let search_ids = Object.keys(cached_searches);
    if (search_ids.length > cache_size) {
        for (let sid of search_ids.slice(0, search_ids.length - cache_size)) {
            delete cached_searches[sid];
        }
    }

    return search_result;
}

function find_in_entry<W extends World>(entry: CacheEntry<W>, world_position: any[]) {
    for (let result of entry.results) {
        if (deep_equal(world_position, result.position)) {
            return result;
        }
    }
    return undefined;
}

function lookup_cache<W extends World>(search_id: string, world: W): FutureSearchResult<W> | undefined {
    let entry = cached_searches[search_id];

    if (entry === undefined) {
        return undefined;
    }

    let match = find_in_entry(entry, get_position(entry.spec, world));

    if (match === undefined) {
        return undefined;
    }

    return match.result;
}

function get_position<W extends World>(spec: FutureSearchSpec<W>, world: W): any[] {
    let space: NarrativeDimension<W>[];
    if (spec.space === undefined) {
        space = default_narrative_space();
    } else {
        space = spec.space;
    }

    return space.map(d => d(world));
}

/*
    TODO
    For the narrative dimensions, each narrative dimension can be paired with a command filter.

    This would be useful for fully automating the bright/dim text logic.

    A command is bright if it participates in a shortest path to advancing in a narrative dimension
*/