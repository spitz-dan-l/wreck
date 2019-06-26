import * as assert from 'assert';
import 'babel-polyfill'; // TODO put this somewhere that makes more sense
import 'mocha';
import { new_hex_world, Hex } from '../typescript/demo_worlds/hex_port';
import { new_bird_world, BirdWorld } from '../typescript/demo_worlds/puffer_bird_world';
import { VenienceWorld, new_venience_world } from '../typescript/demo_worlds/narrascope/narrascope';
import { Gist } from '../typescript/demo_worlds/narrascope/metaphor';
import { search_future, NarrativeDimension, NarrativeGoal } from '../typescript/supervenience';
import { find_index } from '../typescript/interpretation';
import { deep_equal, included, array_last, drop_keys } from '../typescript/utils';



describe('supervenience birdworld', () => {
    it('beats birdworld', () => {
        
        let {initial_result, thread_maker} = new_bird_world();

        function goal_met(w: BirdWorld): boolean {
            return w.is_in_heaven && w.has_seen_zarathustra && w.role === 'vulnerable';
        }

        let narrative_dimensions: NarrativeDimension<BirdWorld>[] = [
            w => w.is_in_heaven,
            w => w.has_seen_zarathustra,
            w => w.role === 'vulnerable'
        ];

        search_future(thread_maker, initial_result.world, [goal_met], narrative_dimensions);
    });
});

describe.only('supervenience narrascope', () => {
    let {initial_result, thread_maker} = new_venience_world();

    function goal_met(w: VenienceWorld): boolean {
        return w.end;
    }

    let narrative_goals: NarrativeGoal<VenienceWorld>[] = [
        w => !!w.has_chill,
        w => !!w.has_recognized_something_wrong,
        w => !!w.is_curious_about_history,
        w => !!w.has_admitted_negligence,
        w => !!w.has_unpacked_culpability,
        w => !!w.has_volunteered,
        goal_met
    ]

    let narrative_dimensions: NarrativeDimension<VenienceWorld>[] = [
        w => {
            if (w.owner !== 'Metaphor') {
                return false;
            }

            let g = find_index(w, w.current_interpretation!)!.gist;

            return g === null ? null :
            included(g.name, ['your impression of Sam', 'your impression of your history with Sam'])
            ? g.name
            : null;
        },
        w => w.has_considered,
        w => w.has_acquired,
        w => [!!w.has_chill, !!w.has_recognized_something_wrong, !!w.is_curious_about_history, !!w.has_admitted_negligence, !!w.has_unpacked_culpability, !!w.has_volunteered, !!w.end],
    ];

    it('beats narrascope demo using dimensions', () => {
        search_future(thread_maker, initial_result.world, [goal_met], narrative_dimensions);
    });

    it('beats narrascope demo using subgoals', () => {
        search_future(thread_maker, initial_result.world, narrative_goals, [w => drop_keys(w, 'previous', 'index', 'parsing', 'interpretations')]);
    });

    it('beats narrascope demo using both', () => {
        search_future(thread_maker, initial_result.world, narrative_goals, narrative_dimensions);
    })

});