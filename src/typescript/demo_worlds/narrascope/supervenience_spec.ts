

import { GistPattern, gist_pattern, gist_to_string, match, UNION } from 'gist';
import { find_index } from '../../history';
import { CommandFilter, FutureSearchSpec, NarrativeDimension, NarrativeGoal, search_future } from '../../supervenience';
import { update_thread_maker } from '../../world';
import { Venience, resource_registry } from './prelude';

export const goals: NarrativeGoal<Venience>[] = [
    w => !!w.has_chill,
    w => !!w.has_recognized_something_wrong,
    w => !!w.is_curious_about_history,
    w => !!w.has_admitted_negligence,
    w => !!w.has_unpacked_culpability,
    w => !!w.has_volunteered,
    w => w.end
];

const gist_pat: GistPattern = ['consider', {
    subject: [UNION,
        ['Sam'],
        ['your history with Sam']
    ]
}];

// Which frame is under reflection, if it is one of the puzzle's topics.
export const reflection_dimension: NarrativeDimension<Venience> = w => {
    if (w.owner !== 'Metaphor') {
        return false;
    }

    let g = find_index(w, w.current_interpretation!)!.gist;

    if (g === undefined) {
        return undefined;
    }
    if (match(g)(gist_pat)) {
        return g;
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
    w.can_consider.data.filter(e => e.value).map(e => gist_to_string(e.key)).sort();

// Progress through the puzzle.
export const progress_dimension: NarrativeDimension<Venience> = w =>
    [!!w.has_chill, !!w.has_recognized_something_wrong, !!w.is_curious_about_history, !!w.has_admitted_negligence, !!w.has_unpacked_culpability, !!w.has_volunteered, !!w.end];

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
}

export function get_thread_maker() {
    const venience_world_spec = resource_registry.get('venience_world_spec').get();
    return update_thread_maker(venience_world_spec);
}

export function find_world_at(world: Venience, goals_met: number) {
    const thread_maker = get_thread_maker();
    
    let spec = {
        thread_maker,
        goals,
        space,
        command_filter,
        simulator_id: 'playtester',
        search_id: 'reach-subgoal-'+goals_met
    };
    
    spec.goals = spec.goals.slice(0, goals_met);

    return search_future(spec, world);
}
