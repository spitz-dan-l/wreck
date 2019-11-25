/*
import 'setup';
import * as assert from 'assert';
// import 'babel-polyfill'; // TODO put this somewhere that makes more sense
import 'mocha';
import { new_bird_world, bird_world_spec } from '../typescript/demo_worlds/bird_world';
import { new_bird_world as new_puffer_bird_world, bird_world_spec as puffer_bird_world_spec } from '../typescript/demo_worlds/puffer_bird_world';
import { raw, traverse_thread } from '../typescript/parser';
import { make_update_thread } from '../typescript/world';
import { structurally_equal } from '../typescript/story';

describe('world', () => {
    it('thingy', () => {
        
        let {initial_result: result, update} = new_bird_world();

        assert.ok(structurally_equal(result.world.story, 'You are currently down.'));
        // This world is a flip flop.
        result = update(result.world, raw('go down stairs')); // this will be invalid
        result = update(result.world, raw('go up stairs')); // this will be valid
        result = update(result.world, raw('go up stairs')); // this will be invalid

        assert.ok(structurally_equal(result.world.story, 'You are currently up.'));
        assert.equal(result.world.index, 1);

        console.time('walk_birdworld');
        let x = traverse_thread(make_update_thread(bird_world_spec(), result.world));
        console.timeEnd('walk_birdworld');
    });

    it('thingy2', () => {
        let {initial_result: result, update} = new_puffer_bird_world();

        // assert.equal(render(result.world.message), 'You are currently down.');
        // This world is a flip flop.
        result = update(result.world, raw('go up stairs')); // this will be valid
        // debugger;
        result = update(result.world, raw('go down stairs')); // this will be invalid
        
        assert.ok(structurally_equal(result.world.story, 'You wave bye to Zarathustra.<br/>You are currently standing around on the ground.'));
        assert.equal(result.world.index, 2);

        console.time('walk_puffer_birdworld');
        traverse_thread(make_update_thread(puffer_bird_world_spec, result.world));
        console.timeEnd('walk_puffer_birdworld');

    });
});
*/