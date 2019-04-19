import { update } from '../datatypes';
import { World, WorldDriver, CommandHandler, HistoryInterpreter, get_initial_world } from '../world';

import { Parser, consume, make_consumer, raw } from '../parser2';


interface BirdWorld extends World {
    readonly is_in_heaven: boolean
}

let initial_world: BirdWorld = {
    ...get_initial_world<BirdWorld>(),
    is_in_heaven: false,
    message: 'You are currently down.',
};

let handle_command: CommandHandler<BirdWorld> = (parser, world) => {
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

let interpret_history: HistoryInterpreter<BirdWorld> = (old_world, new_world) => {
    if (old_world.is_in_heaven) {
        return [{ kind: 'Add', label: 'happy' }];
    }
}

export function new_bird_world() {
    return new WorldDriver({initial_world, handle_command, interpret_history});
}