import { appender, appender_uniq, tuple, update } from '../datatypes';
import { get_initial_puffer_world, make_puffer_world_spec, Puffer, PufferWorld } from '../puffer';
import { random_choice } from '../text_tools';
import { world_driver } from '../world';

interface Location {
    is_in_heaven: boolean;
    moving: boolean;
}

let LocationPuffer: Puffer<Location> = {
    activate: world => true,

    pre: world => update(world, {
        moving: false,
        interpretation_receptors: appender_uniq('happy')
    }),

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
    moving: boolean; // listens to LocationPuffer, to determine when to describe zarathustra
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
                        `There's a bird up here. His name is Zarathustra.
                         {{#vulnerable}}He is sexy.{{/vulnerable}}
                         {{^vulnerable}}He is ugly.{{/vulnerable}}` :
                        `Zarathustra is here.
                         {{#vulnerable}}(What a sexy bird.){{/vulnerable}}`
                    )
                },
                has_seen_zarathustra: true
            });
        }
        return world
    }
}

const roles = tuple(
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
);

const qualities = tuple(
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
);
type Qualities = typeof qualities;

interface Roles {
    is_in_heaven: boolean
    role: Qualities[number];
    // readonly index: number;
}

let RolePuffer: Puffer<Roles> = {
    activate: world => true,

    handle_command: (world, parser) => {
        if (world.is_in_heaven) {
            parser.eliminate();
        }

        parser.consume('*be');

        let choice = parser.split(
            roles.map((r, i) =>
                () => parser.consume(`&${r.replace(/ /g, '_')}`, i))
        );

        parser.submit();

        return update(world, {
            role: qualities[choice],
            message: {
                consequence: appender(`You feel ${qualities[choice]}.`)
            }
        });
    },
    interpret_history: (new_world, old_world) => {
        if (new_world.role === 'vulnerable') {
            return [{ kind: 'Add', label: 'vulnerable' }];
        } else {
            return [{ kind: 'Remove', label: 'vulnerable' }];
        }
    }

}

interface BirdWorld extends PufferWorld
    , Location
    , Zarathustra
    , Roles
    {};

// Would use "as const" instead of tuple() but @babel/preset-typescript 7.3.3 has bugs parsing that construct
const BirdWorldPuffers = tuple(
    LocationPuffer,
    ZarathustraPuffer,
    RolePuffer
);

const initial_bird_world: BirdWorld = {
    ...get_initial_puffer_world<BirdWorld>(),
    
    // location
    is_in_heaven: false,
    moving: false,
    
    // zarathustra
    has_seen_zarathustra: false,

    // roles
    role: undefined
};

const bird_world_spec = make_puffer_world_spec(initial_bird_world, BirdWorldPuffers);

export function new_bird_world() {
    return world_driver(bird_world_spec);
}

