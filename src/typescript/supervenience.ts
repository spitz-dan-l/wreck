import {World, WorldSpec, update_thread_maker} from './world';
import { traverse_thread, ParserThread } from './parser';
import { deep_equal } from './utils';

// do a breadth-first search of possible futures for some goal state
export function search_future<W extends World>(
    thread_maker: (w: W) => ParserThread<W>,
    world: W,
    goals: NarrativeGoal<W>[],
    narrative_space: NarrativeDimension<W>[],
    give_up_after: number = 2000
) {
    type Entry = [W, any[], number];

    let n_skipped = 0;
    let visited: Entry[] = [[
        world,
        narrative_space.map(dim => dim(world)),
        get_score(world, goals)
    ]];
    let i = 0;
    let anchor = 0;
    lup: while (give_up_after === undefined || i < give_up_after) {
        let next_index = visited.length - 1 - i;

        if (next_index < 0) {
            throw new Error('Failed future world search, goal is unreachable');
        }

        const [w, pos, score] = visited[visited.length - 1 - i];

        if (score === goals.length) {
            let n_turns = w.index - world.index;
            console.log(`Future search reached goal in ${i} iterations and ${n_turns} turns. ${visited.length} states were considered, and ${n_skipped} states were skipped.`);
            return w;
        }

        const transitions = traverse_thread(thread_maker(w));

        if (Object.keys(transitions).length === 0) {
            throw new Error('Future search reached a non-goal terminal state');
        }
        for (let parse_result of Object.values(transitions)) {
            const dest = parse_result.result;
            const dest_pos = narrative_space.map(dim => dim(dest));
            const dest_score = get_score(dest, goals);
            
            if (dest_score > score) {
                // skip ahead to only search from this node now
                console.log(`met a subgoal, skipping ${visited.length - 1 - i} states.`)
                
                visited.unshift([dest, dest_pos, dest_score]);
                n_skipped += visited.length - 1 - i;
                i = visited.length - 1;
                anchor = i;
                
                continue lup;
            } else if (dest_score < score) {
                n_skipped++;
            } else

            if (!visited.slice(0, visited.length - anchor).some(([, pos]) => dest_pos.every((d, j) => deep_equal(d, pos[j])))) {
                visited.unshift([dest, dest_pos, dest_score]);
            } else {
                n_skipped++;
            }
        }
        i++;
    }
    throw new Error('Failed future world search after '+i+' iterations');

}

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
    Take a world and return whether some narratively-relevant goal state has been reached in that world.
    A world's "score" is the number of goals it has met.
    This is used to constrain the future search so that candidate states are skipped if they have a lower score than the current
*/
export type NarrativeGoal<W extends World> = (w: W) => boolean;


function get_score<W extends World>(w: W, goals: NarrativeGoal<W>[]) {
    return goals.map(g => g(w)).reduce((acc, goal_met) => acc + (goal_met ? 1 : 0), 0);
}