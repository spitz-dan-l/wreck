import * as assert from 'assert';
import 'babel-polyfill'; // TODO put this somewhere that makes more sense
import 'mocha';
import { new_bird_world } from '../typescript/demo_worlds/bird_world';
import { new_bird_world as new_puffer_bird_world } from '../typescript/demo_worlds/puffer_bird_world';
import { raw } from '../typescript/parser';
import { standard_render } from '../typescript/message';

describe('world', () => {
    it('thingy', () => {
        
        let [result, updater] = new_bird_world();

        assert.equal(standard_render(result.world), 'You are currently down.');
        // This world is a flip flop.
        result = updater(result.world, raw('go down stairs')); // this will be invalid
        result = updater(result.world, raw('go up stairs')); // this will be valid
        result = updater(result.world, raw('go up stairs')); // this will be invalid

        assert.equal(standard_render(result.world), 'You are currently up.');
        assert.equal(result.world.index, 1);
    });

    it('thingy2', () => {
        let [result, updater] = new_puffer_bird_world();

        // assert.equal(render(result.world.message), 'You are currently down.');
        // This world is a flip flop.
        result = updater(result.world, raw('go up stairs')); // this will be valid
        // debugger;
        result = updater(result.world, raw('go down stairs')); // this will be invalid
        
        assert.equal(standard_render(result.world), 'You wave bye to Zarathustra.<br/>You are currently standing around on the ground.');
        assert.equal(result.world.index, 2);
    });
});