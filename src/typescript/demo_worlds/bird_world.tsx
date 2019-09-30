import { createElement } from '../UI/framework/framework';
import { random_choice } from '../text_tools';
import { update } from '../utils';
import { CommandHandler, get_initial_world, make_world_spec, World, world_driver, Narrator } from '../world';
import { failed } from '../parser';
import { story_updater, css_updater } from '../text';
import { stages } from '../stages';

interface BirdWorld extends World {
    readonly is_in_heaven: boolean
}

let initial_world: BirdWorld = {
    ...get_initial_world<BirdWorld>(),
    is_in_heaven: false,
};

export const bird_world_spec = () => make_world_spec({
    initial_world,
    handle_command,
    post
});

export function new_bird_world() {
    return world_driver(bird_world_spec());
}

let post: Narrator<BirdWorld> = (new_world, old_world) => {
    return update(new_world,
        css_updater(w => {
            if (w.is_in_heaven === new_world.is_in_heaven) {
                return { happy: true };
            } else {
                return { happy: false };
            }    
        })
    );
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
    parser.consume({ tokens: 'go', labels: { keyword: true}});
    if (parser.failure) {
        return parser.failure;
    }

    let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

    let dir = parser.split(
        (['up', 'down'] as const).map(dir =>
            () =>
                parser.consume({
                    tokens: `${dir}_stairs`,
                    locked: is_locked[dir],
                    labels: {option: true}
                }, dir)
        )
    );

    if (failed(dir)) {
        return dir;
    }

    parser.submit();
    if (parser.failure) {
        return parser.failure;
    }

    return update(world,
        story_updater({
            consequence: <div>You are currently {dir}.</div>
        }),
        { is_in_heaven: _ => !_}
    );
}

let mispronounce_cmd: CommandHandler<BirdWorld> = (world, parser) => {
    if (!world.is_in_heaven) {
        return parser.eliminate();
    }

    parser.consume({ tokens: "mispronounce zarathustra's name", labels: {keyword: true}});
    if (parser.failure) {
        return parser.failure;
    }
    parser.submit();
    if (parser.failure) {
        return parser.failure;
    }

    let utterance_options = [
        'Zammersretter',
        'Hoosterzaro',
        'Rooster Thooster',
        'Thester Zar',
        'Zerthes Threstine'
    ]

    let message = `"${random_choice(utterance_options)}," you say.`;

    return update(world,
        story_updater({
            action: <div>{message}</div>
        })
    );
}

let be_cmd: CommandHandler<BirdWorld> = (world, parser) => {
    parser.consume({ tokens: 'be', labels: { keyword: true }});
    if (parser.failure) {
        return parser.failure;
    }

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
            () => parser.consume({ tokens: `${r.replace(/ /g, '_')}`, labels: { option: true }}, qualities[i]))
    );
    if (failed(quality)) {
        return quality;
    }

    parser.submit();
    if (parser.failure) {
        return parser.failure;
    }

    return update(world,
        story_updater({
            consequence: <div>You feel {quality}.</div>
        })
    );
}
