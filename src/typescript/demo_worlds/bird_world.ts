import { update } from '../datatypes';
import { CommandHandler, get_initial_world, HistoryInterpreter, World, apply_command, world_driver } from '../world';
import { raw } from '../parser2';
import { random_choice } from '../text_tools';


interface BirdWorld extends World {
    readonly is_in_heaven: boolean
}

let initial_world: BirdWorld = {
    ...get_initial_world<BirdWorld>(),
    is_in_heaven: false,
    message: 'You are currently down.',
};

export function new_bird_world() {
    return world_driver({ initial_world, handle_command, interpret_history });
}

let interpret_history: HistoryInterpreter<BirdWorld> = (old_world, new_world) => {
    if (old_world.is_in_heaven === new_world.is_in_heaven) {
        return [{ kind: 'Add', label: 'happy' }];
    } else {
        return [{ kind: 'Remove', label: 'happy' }];
    }
}

let handle_command: CommandHandler<BirdWorld> = (parser, world) =>
    parser.split([
        () => go_cmd(parser, world),
        () => mispronounce_cmd(parser, world)
    ]);

let go_cmd: CommandHandler<BirdWorld> = (parser, world) => {
    parser.consume('*go');

    let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

    let dir = parser.split(
        (['up', 'down'] as const).map(dir =>
            () => parser.consume(`${is_locked[dir] ? '~' : ''}&${dir}_stairs`, dir)
        )
    );

    parser.submit();

    return update(world, {
        message: `You are currently ${dir}.`,
        is_in_heaven: _ => !_
    });
}

let mispronounce_cmd: CommandHandler<BirdWorld> = (parser, world) => {
    if (!world.is_in_heaven) {
        parser.eliminate();
    }

    parser.consume("*mispronounce zarathustra's name");
    parser.submit();

    let utterance_options = [
        'Zammersretter',
        'Hoosterzaro',
        'Rooster Thooster',
        'Thester Zar',
        'Zerthes Threstine'
    ]

    let message = `"${random_choice(utterance_options)}," you say.`;

    return update(world, { message });
}
