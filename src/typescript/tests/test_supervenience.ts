// import './setup';
import * as assert from 'assert';
import 'mocha';
import { deep_equal, included, array_last, drop_keys } from 'lib/utils';

// import { new_hex_world, Hex } from '../typescript/demo_worlds/hex_port';
// import { new_bird_world, BirdWorld } from '../typescript/demo_worlds/puffer_bird_world';
import { Venience, new_venience_world } from 'demo_worlds/narrascope';
import { goals as demo_goals, space as demo_space, command_filter as demo_command_filter } from 'demo_worlds/narrascope/supervenience_spec';
import { search_future, NarrativeDimension, NarrativeGoal, FutureSearchSpec, CommandFilter } from 'supervenience';

const simulator_id = 'playtester';

// describe('supervenience birdworld', () => {
//     it.only('beats birdworld', () => {
        
//         let {initial_result, thread_maker} = new_bird_world();

//         function goal_met(w: BirdWorld): boolean {
//             return w.is_in_heaven && w.has_seen_zarathustra && w.role === 'vulnerable';
//         }

//         let space: NarrativeDimension<BirdWorld>[] = [
//             w => w.is_in_heaven,
//             w => w.has_seen_zarathustra,
//             w => w.role === 'vulnerable'
//         ];

//         let search_spec: FutureSearchSpec<BirdWorld> = {
//             simulator_id,
//             thread_maker,
//             goals: [goal_met],
//             space,
//             command_filter: (w, cmd) => {
//                 if (cmd[0]
//                     && cmd[0].token === 'be'
//                     && cmd[5]
//                     && cmd[5].token !== 'seduced') {
//                     return false;
//                 }
//                 return true;
//             }
//         };
//         console.profile('supervenience');
//         search_future(search_spec, initial_result.world);
//         console.profileEnd('supervenience');
//     });
// });


describe('supervenience narrascope', () => {
    let {initial_result, thread_maker} = new_venience_world();

    function goal_met(w: Venience): boolean {
        return w.end;
    }

    // The goals, dimensions and command filter are the ones the game itself uses
    // (see demo_worlds/narrascope/supervenience_spec).
    const goals: NarrativeGoal<Venience>[] = demo_goals;
    const space: NarrativeDimension<Venience>[] = demo_space;
    const command_filter: CommandFilter<Venience> = demo_command_filter;

    it('beats narrascope demo using dimensions', () => {
        let spec: FutureSearchSpec<Venience> = {
            simulator_id,
            thread_maker,
            goals: [goal_met],
            space
        };
        let result = search_future(spec, initial_result.world);
        assert.equal(result.status, 'Found');
    });

    it.skip('beats narrascope demo using subgoals', () => {
        let spec: FutureSearchSpec<Venience> = {
            simulator_id,
            thread_maker,
            goals,
            space: [w => drop_keys(w, 'previous', 'index', 'parsing')],
            command_filter
        };
        let result = search_future(spec, initial_result.world);
        assert.equal(result.status, 'Found');
    });

    it('beats narrascope demo using both', () => {
        let spec: FutureSearchSpec<Venience> = {
            simulator_id,
            thread_maker,
            goals,
            space
        };
        let result = search_future(spec, initial_result.world);
        assert.equal(result.status, 'Found');
    });

    it('beats narrascope demo using both + command filtering', () => {
        let spec: FutureSearchSpec<Venience> = {
            simulator_id,
            thread_maker,
            goals,
            space,
            command_filter
        };
        // console.profile('supervenience_narrascope');
        let result = search_future(spec, initial_result.world);
        // console.profileEnd('supervenience_narrascope');
        assert.equal(result.status, 'Found');
    });
    

});
