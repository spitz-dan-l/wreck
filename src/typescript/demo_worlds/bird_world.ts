import { update } from '../utils';
import { random_choice } from '../text_tools';
import { CommandHandler, get_initial_world, INITIAL_MESSAGE, HistoryInterpreter, make_world_spec, World, world_driver } from '../world';


interface BirdWorld extends World {
    readonly is_in_heaven: boolean
}

let initial_world: BirdWorld = {
    ...get_initial_world<BirdWorld>(),
    is_in_heaven: false,
    message: {
        kind: 'Message',
        action: [],
        consequence: ['You are currently down.'],
        description: [],
        prompt: []
    },
    interpretations: { 0: {happy: true} }
};

export function new_bird_world() {
    return world_driver(make_world_spec({
        initial_world,
        handle_command,
        interpret_history
    }));
}

let interpret_history: HistoryInterpreter<BirdWorld> = (old_world, new_world) => {
    if (old_world.is_in_heaven === new_world.is_in_heaven) {
        return [{ kind: 'Add', label: 'happy' }];
    } else {
        return [{ kind: 'Remove', label: 'happy' }];
    }
}

let handle_command: CommandHandler<BirdWorld> = (world, parser) => {
    let cmds = [
        go_cmd,
        mispronounce_cmd,
        be_cmd
    ];

    return parser.split(cmds.map(cmd => () => cmd(world, parser)))
}

let go_cmd: CommandHandler<BirdWorld> = (world, parser) => {
    parser.consume('*go');

    let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

    let dir = parser.split(
        (['up', 'down'] as const).map(dir =>
            () => parser.consume(`${is_locked[dir] ? '~' : ''}&${dir}_stairs`, dir)
        )
    );

    parser.submit();

    return update(world, {
        message: {
            consequence: _ => [..._, `You are currently ${dir}.`]
        },
        is_in_heaven: _ => !_
    });
}

let mispronounce_cmd: CommandHandler<BirdWorld> = (world, parser) => {
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

    return update(world, { 
        message: {
            action: _ => [..._, message]
        }
    });
}

let be_cmd: CommandHandler<BirdWorld> = (world, parser) => {
    parser.consume('*be');

    let roles: string[] = [
        'the One Who Gazes Ahead',
        'the One Who Gazes Back',
        'the One Who Gazes Up',
        'the One Who Gazes Down',
        'the One Whose Palms Are Open',
        'the One Whose Palms Are Closed',
        'the One Who Is Strong',
        'the One Who Is Weak',
        'the One Who Seduces',
        'the One Who Is Seduced'
    ];

    let qualities: string[] = [
        'outwardly curious',
        'introspective',
        'transcendent',
        'sorrowful',
        'receptive',
        'adversarial',
        'confident',
        'impressionable',
        'predatory',
        'vulnerable'
    ];

    let quality = parser.split(
        roles.map((r, i) =>
            () => parser.consume(`&${r.replace(/ /g, '_')}`, qualities[i]))
    );

    parser.submit();

    return update(world, {
        message: {
            consequence: _ => [..._, `You feel ${quality}.`] 
        }
    });
}
