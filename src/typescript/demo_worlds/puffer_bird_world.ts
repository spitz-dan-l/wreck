import { tuple, update, appender } from '../datatypes';
import { get_initial_puffer_world, make_puffer_world_spec, Puffer, PufferWorld } from '../puffer';
import { random_choice } from '../text_tools';
import { world_driver } from '../world';

interface Location {
    is_in_heaven: boolean;
    moving: boolean;
}

let LocPuffer: Puffer<Location> = {
    activate: world => true,

    pre: world => update(world, { moving: false }),

    handle_command: (world, parser) => {
        parser.consume('*go');

        let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

        let dir = parser.split(
            (['up', 'down'] as const).map(dir =>
                () => parser.consume(`${is_locked[dir] ? '~' : ''}&${dir}_stairs`, dir)
            )
        );

        parser.submit();

        let new_pos = !world.is_in_heaven;
        let loc = new_pos ? 'in Heaven' : 'standing around on the ground';
        
        return update(world, {
            message: {
                consequence: appender(`You are currently ${loc}.`)
            },
            is_in_heaven: new_pos,
            moving: true
        });
    },

    interpret_history: (new_world, old_world) => {
        if (old_world.is_in_heaven === new_world.is_in_heaven) {
            return [{ kind: 'Add', label: 'happy' }];
        } else {
            return [{ kind: 'Remove', label: 'happy' }];
        }
    }
}

interface Zarathustra {
    is_in_heaven: boolean;
    has_seen_zarathustra: boolean;
    moving: boolean; // listens to LocPuffer, to determine when to describe zarathustra
}

let ZarathustraPuffer: Puffer<Zarathustra> = {
    activate: world => world.is_in_heaven,

    handle_command: (world, parser) => {
        parser.consume("*mispronounce zarathustra's name");
        parser.submit();

        let utterance_options = [
            'Zammersretter',
            'Hoosterzaro',
            'Rooster Thooster',
            'Thester Zar',
            'Zerthes Threstine'
        ]
        let mispronunciation = random_choice(utterance_options);
        return update(world, {
            message: {
                action: appender(`"${mispronunciation}," you say.`)
            }
        });
    },

    post: world => {
        if (world.moving) {
            return update(world, {
                message: {
                    description: appender(
                        !world.has_seen_zarathustra ?
                        "There's a bird up here. His name is Zarathustra. He is ugly." :
                        'Zarathustra is here.'
                    )
                },
                has_seen_zarathustra: true
            });
        }
        return world
    }
}

interface Roles {
    is_in_heaven: boolean
}

let BePuffer: Puffer<Roles> = {
    activate: world => !world.is_in_heaven,

    handle_command: (world, parser) => {
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

        let choice = parser.split(
            roles.map((r, i) =>
                () => parser.consume(`&${r.replace(/ /g, '_')}`, i))
        );

        parser.submit();

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

        return update(world, {
            message: {
                consequence: appender(`You feel ${qualities[choice]}.`)
            }
        });
    },
}

interface BirdWorld extends PufferWorld,
    Location,
    Zarathustra,
    Roles {};

const BirdWorldPuffers = tuple([
    LocPuffer,
    ZarathustraPuffer,
    BePuffer
]);

const initial_bird_world: BirdWorld = {
    ...get_initial_puffer_world<BirdWorld>(),
    
    // location
    is_in_heaven: false,
    moving: false,
    
    // zarathustra
    has_seen_zarathustra: false,

    // roles
};

const bird_world_spec = make_puffer_world_spec(initial_bird_world, BirdWorldPuffers);

export function new_bird_world() {
    return world_driver(bird_world_spec);
}

