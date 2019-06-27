import {World, WorldSpec, update_thread_maker} from './world';
import { traverse_thread, ParserThread, PossibleConsumeSpec } from './parser';
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

/*
    Take a world and return whether some narratively-relevant goal state has been
    reached in that world.
    
    A world's "score" is the number of goals it has met.
    
    This is used to constrain the future search so that candidate states are skipped
    if they have a lower score than the current.
*/
export type NarrativeGoal<W extends World> = (w: W) => boolean;


export type CommandFilter<W extends World> = (w: W, command: PossibleConsumeSpec[]) => boolean;

function get_score<W extends World>(w: W, goals: NarrativeGoal<W>[]) {
    return goals.map(g => g(w)).reduce((acc, goal_met) => acc + (goal_met ? 1 : 0), 0);
}

export type FutureSearchSpec<W extends World> = {
    thread_maker: (w: W) => ParserThread<W>,
    goals: NarrativeGoal<W>[],
    space: NarrativeDimension<W>[],
    give_up_after?: number,
    max_steps?: number,
    command_filter?: CommandFilter<W>
}

export const worlds_under_search: Set<World> = new Set();

export function is_simulated<W extends World>(world: W) {
    return find_historical(world, w => worlds_under_search.has(w)) !== null;
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
    if (is_simulated(world)) {
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
        // throw new Error('Tried to search the future while searching the future');
    }

    try {
        worlds_under_search.add(world);
    
        if (spec.space === undefined) {
            spec.space = [w => drop_keys(w, 'previous', 'index', 'parsing')];
        }

        type Entry = [W, any[], number];

        let n_skipped = 0;
        const visited: Entry[] = [[
            world,
            spec.space.map(dim => dim(world)),
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
                return {
                    kind: 'FutureSearchResult',
                    status: 'Unreachable',
                    result: null,
                    stats: make_stats()
                };
                // throw new Error('Failed future world search, goal is unreachable');
            }

            const [w, pos, score] = visited[next_index];

            if (score === spec.goals.length) {
                let n_turns = w.index - world.index;
                // console.log(`Future search reached goal in ${i} iterations and ${n_turns} turns. ${visited.length} states were considered, and ${n_skipped} states were skipped.`);
                return {
                    kind: 'FutureSearchResult',
                    status: 'Found',
                    result: w,
                    stats: make_stats(n_turns)
                };
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
                const dest_pos = spec.space.map(dim => dim(dest));
                const dest_score = get_score(dest, spec.goals);
                
                if (dest_score > score) {
                    // skip ahead to only search from this node now
                    // console.log(`met a subgoal, skipping ${visited.length - 1 - i} states.`)
                    
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

        return {
            kind: 'FutureSearchResult',
            status: 'Timeout',
            result: null,
            stats: make_stats()
        }
        // throw new Error('Failed future world search after '+i+' iterations');

    } finally {
        worlds_under_search.delete(world);
    }
}