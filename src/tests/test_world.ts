import 'babel-polyfill'; // TODO put this somewhere that makes more sense

import 'mocha'
import * as assert from 'assert';

import { update } from '../typescript/datatypes';
import { World, CommandHandler, HistoryInterpreter, get_initial_world } from '../typescript/world';

import { Parser, raw } from '../typescript/parser2';

import { new_bird_world } from '../typescript/demo_worlds/bird_world';


describe('world', () => {
    it('thingy', () => {
        
        let [result, updater] = new_bird_world();

        assert.equal(result.world.message, 'You are currently down.');
        // This world is a flip flop.
        result = updater(result.world, raw('go down stairs')); // this will be invalid
        result = updater(result.world, raw('go up stairs')); // this will be valid
        result = updater(result.world, raw('go up stairs')); // this will be invalid

        assert.equal(result.world.message, 'You are currently up.');
        assert.equal(result.world.index, 1);
    });
});