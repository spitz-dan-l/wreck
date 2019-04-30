import { tuple, update } from '../datatypes';
import { get_initial_puffer_world, make_puffer_world_spec, Puffer, PufferWorld } from '../puffer';
import { random_choice } from '../text_tools';
import { world_driver } from '../world';

interface Location {
    is_in_heaven: boolean;
    moving: boolean;
}

let LocPuffer: Puffer<Location> = {
    activate: world => true,

    pre: world => update(world, {moving: false}),

    handle_command: (world, parser) => {
        parser.consume('*go');

        let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

        let dir = parser.split(
            (['up', 'down'] as const).map(dir =>
                () => parser.consume(`${is_locked[dir] ? '~' : ''}&${dir}_stairs`, dir)
            )
        );

        parser.submit();

        return update(world, {
            moving: true,
            is_in_heaven: _ => !_
        });
    },

    interpret_history: (new_world, old_world) => {
        if (old_world.is_in_heaven === new_world.is_in_heaven) {
            return [{ kind: 'Add', label: 'happy' }];
        } else {
            return [{ kind: 'Remove', label: 'happy' }];
        }
    },

    generate_message: (world) => {
        if (world.moving) {
            let loc = world.is_in_heaven ? 'in Heaven' : 'standing around on the ground';
            return `You are currently ${loc}.`
        }
    }
}

interface Zarathustra {
    is_in_heaven: boolean;
    has_seen_zarathustra: boolean;
    mispronunciation: string | undefined;
}

let ZarathustraPuffer: Puffer<Zarathustra> = {
    activate: world => world.is_in_heaven,

    pre: world => update(world, { mispronunciation: undefined }),

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
        return update(world, { mispronunciation });
    },

    generate_message: (world) => {
        if (world.mispronunciation !== undefined) {
            return `"${world.mispronunciation}," you say.`
        }
    },

    post: world => {
        if (!world.has_seen_zarathustra) {
            return update(world, {
                has_seen_zarathustra: true
            });
        }
        return world
    }
}

interface Roles {
    is_in_heaven: boolean,
    role_id: number | undefined
}

let BePuffer: Puffer<Roles> = {
    activate: world => !world.is_in_heaven,

    pre: world => update(world, { role_id: undefined }),

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

        return update(world, { role_id: choice });
    },


    generate_message: (world) => {
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
        if (world.role_id !== undefined) {
            return `You feel ${qualities[world.role_id]}.`;
        }
    }
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
    moving: true,
    
    // zarathustra
    has_seen_zarathustra: false,
    mispronunciation: undefined,

    // roles
    role_id: undefined
};

const bird_world_spec = make_puffer_world_spec(initial_bird_world, BirdWorldPuffers);

export function new_bird_world() {
    return world_driver(bird_world_spec);
}

/*
Thoughts from this

- Puffers seem good
- Adding stuff to messages feels weird/lame
    - Don't want to go too hard on abstraction building for it
    - Something like:
        - an ordered map of names -> paragraph generators
        - a given generator has a given set of params
        - puffers can update the params for particular paragraphs
        - at the very end all the paragraphs get generated







*/
