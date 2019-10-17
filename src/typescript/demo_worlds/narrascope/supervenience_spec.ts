import { GistPattern, gist_matches } from '../../gist';
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

const gist_pat: GistPattern = {
    tag: 'impression',
    children: {
        subject: [
            { tag: 'Sam'},
            { tag: 'your history with Sam' }
        ]
    }
};
export const space: NarrativeDimension<Venience>[] = [
    w => {
        if (w.owner !== 'Metaphor') {
            return false;
        }

        let g = find_index(w, w.current_interpretation!)!.gist;

        if (g === null) {
            return null;
        }
        if (gist_matches(g, gist_pat)) {
            return g;
        }
        return null;
    },
    w => w.has_considered,
    w => w.has_acquired,
    w => [!!w.has_chill, !!w.has_recognized_something_wrong, !!w.is_curious_about_history, !!w.has_admitted_negligence, !!w.has_unpacked_culpability, !!w.has_volunteered, !!w.end],
];

export const command_filter: CommandFilter<Venience> = (w, cmd) => {
    if (cmd[0] && cmd[0].token === 'notes') {
        return false;
    }
    return true;
}

export function get_thread_maker() {
    const venience_world_spec = resource_registry.get('venience_world_spec');
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
