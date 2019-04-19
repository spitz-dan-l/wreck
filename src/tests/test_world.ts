import 'babel-polyfill'; // TODO put this somewhere that makes more sense

import 'mocha'
import * as assert from 'assert';

import { update } from '../typescript/datatypes';
import { World, WorldDriver, CommandHandler, HistoryInterpreter, get_initial_world } from '../typescript/world';

import { Parser, consume, make_consumer, raw } from '../typescript/parser2';

describe('world', () => {
    it('thingy', () => {
        interface MyWorld extends World {
            readonly is_in_heaven: boolean
        }

        let initial_world: MyWorld = {
            ...get_initial_world<MyWorld>(),
            is_in_heaven: false,
            message: 'You are currently down.',
        };

        let handle_command: CommandHandler<MyWorld> = (parser, world) => {
            parser.consume([{ token: 'go', token_type: {kind: 'Keyword'}}]);

            let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

            let dir = parser.split(
                ['up', 'down'].map(dir =>
                    () => parser.consume([{
                        token: dir,
                        token_type: {kind: 'Option'},
                        typeahead_type: (is_locked[dir] ? {kind: 'Locked'} : {kind: 'Available'})
                    }], dir)
                )
            );

            parser.submit();
            
            return update(world, {
                message: `You are currently ${dir}.`,
                is_in_heaven: _ => !_
            });
        }

        let interpret_history: HistoryInterpreter<MyWorld> = (old_world, new_world) => {
            return null;
        }

        let driver = new WorldDriver({initial_world, handle_command, interpret_history});

        assert.equal(driver.current_world.message, 'You are currently down.');
        // This world is a flip flop.
        debugger;
        driver.apply_command(raw('go down')); // this will be invalid
        driver.apply_command(raw('go up')); // this will be valid
        driver.apply_command(raw('go up')); // this will be invalid

        assert.equal(driver.current_world.message, 'You are currently up.');
        assert.equal(driver.current_world.index, 1);

    });
});