/*
    How the future search understands the demo: what counts as progress,
    and which differences between worlds matter.
*/
import { any_of, gist_to_string, match } from 'gist';
import { find_index } from 'history';
import { CommandFilter, NarrativeDimension, NarrativeGoal, search_future } from 'supervenience';
import { update_thread_maker, WorldSpec } from 'world';
import { Venience } from './prelude';

export const goals: NarrativeGoal<Venience>[] = [
    w => w.has_chill,
    w => w.has_recognized_something_wrong,
    w => w.is_curious_about_history,
    w => w.has_admitted_negligence,
    w => w.has_unpacked_culpability,
    w => w.has_volunteered,
    w => w.end
];

// Which frame is under reflection, if it is one of the puzzle's topics.
export const reflection_dimension: NarrativeDimension<Venience> = w => {
    if (w.owner !== 'Metaphor' || w.current_interpretation === undefined) {
        return false;
    }
    const g = find_index(w, w.current_interpretation)?.gist;
    if (match(g, { tag: 'consider', children: { subject: any_of({ tag: 'Sam' }, { tag: 'your history with Sam' }) } })) {
        return gist_to_string(g!);
    }
    return undefined;
};

// What the player just did. This determines what can be reflected on directly next.
export const last_action_dimension: NarrativeDimension<Venience> = w =>
    w.gist === undefined ? undefined : gist_to_string(w.gist);

// The set of actions acquired so far.
export const acquired_dimension: NarrativeDimension<Venience> = w =>
    [...w.has_acquired].filter(([, on]) => on).map(([id]) => id).sort();

// Which memories are currently available to remember.
export const memories_dimension: NarrativeDimension<Venience> = w =>
    w.could_remember.map(gist_to_string).sort();

// Which topics can currently be considered.
export const topics_dimension: NarrativeDimension<Venience> = w =>
    w.can_consider.entries().filter(([, on]) => on).map(([g]) => gist_to_string(g)).sort();

// Progress through the puzzle.
export const progress_dimension: NarrativeDimension<Venience> = w => goals.map(g => g(w));

/*
    The narrative dimensions used to prune the future search. Two worlds that
    agree on all of these are treated as the same state.

    Note that "which commands have been tried" is deliberately *not* a
    dimension: it only affects how commands are displayed, and including it
    makes the number of distinct states exponential in the number of commands.
*/
export const space: NarrativeDimension<Venience>[] = [
    reflection_dimension,
    last_action_dimension,
    acquired_dimension,
    memories_dimension,
    topics_dimension,
    progress_dimension
];

export const command_filter: CommandFilter<Venience> = (w, cmd) => {
    if (cmd[0] && cmd[0].token === 'notes') {
        return false;
    }
    return true;
};

// The world spec is set by the world module once it is built (it can't be
// imported here without a circular import).
let world_spec: WorldSpec<Venience> | undefined = undefined;

export function set_world_spec(spec: WorldSpec<Venience>) {
    world_spec = spec;
}

export function get_thread_maker() {
    if (world_spec === undefined) {
        throw new Error('The world spec has not been set yet.');
    }
    return update_thread_maker(world_spec);
}

// Search for the world in which the first `goals_met` goals have been reached.
export function find_world_at(world: Venience, goals_met: number) {
    return search_future({
        thread_maker: get_thread_maker(),
        goals: goals.slice(0, goals_met),
        space,
        command_filter,
        simulator_id: 'playtester',
        search_id: 'reach-subgoal-' + goals_met
    }, world);
}
