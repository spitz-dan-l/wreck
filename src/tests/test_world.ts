import 'babel-polyfill'; // TODO put this somewhere that makes more sense

import 'mocha'
import * as assert from 'assert';

import { update } from '../typescript/datatypes';
import { World, WorldDriver, CommandHandler, HistoryInterpreter, get_initial_world } from '../typescript/world';

import { Parser, raw } from '../typescript/parser2';

import { new_bird_world } from '../typescript/demo_worlds/bird_world';


describe('world', () => {
    it('thingy', () => {
        
        let driver = new_bird_world();

        assert.equal(driver.current_world.message, 'You are currently down.');
        // This world is a flip flop.
        driver.apply_command(raw('go down')); // this will be invalid
        driver.apply_command(raw('go up')); // this will be valid
        driver.apply_command(raw('go up')); // this will be invalid

        assert.equal(driver.current_world.message, 'You are currently up.');
        assert.equal(driver.current_world.index, 1);
    });
});