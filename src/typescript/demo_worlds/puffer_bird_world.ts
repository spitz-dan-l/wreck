import { make_puffer_world_spec, Puffer } from '../puffer';
import { random_choice } from '../text_tools';
import { appender, update } from '../utils';
import { get_initial_world, World, world_driver } from '../world';
import { interpretation_updater } from '../interpretation';

export interface BirdWorld extends World {}

interface Location {
    is_in_heaven: boolean;
}

export interface BirdWorld extends Location {}

let LocationPuffer: Puffer<BirdWorld> = {
    handle_command: (world, parser) => {
        parser.consume('go');

        let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

        let dir = parser.split(
            (['up', 'down'] as const).map(dir =>
                () => parser.consume({
                    tokens: `${dir}_stairs`,
                    locked: is_locked[dir],
                    labels: {option: true}
                }, dir)
            )
        );

        parser.submit();

        let new_pos = !world.is_in_heaven;
        let loc = new_pos ? 'in Heaven' : 'standing around on the ground';
        
        return update(world, {
            message: {
                consequence: appender(`You are currently ${loc}.`)
            },
            is_in_heaven: new_pos
        });
    },

    post: (new_world, old_world) => {
        return update(new_world, interpretation_updater(new_world, (w) => {
            if (w.is_in_heaven === new_world.is_in_heaven) {
                return {happy: true };
            } else {
                return {happy: false };
            }
        }));
    }
};

interface Zarathustra {
    is_in_heaven: boolean;
    has_seen_zarathustra: boolean;
}

export interface BirdWorld extends Zarathustra {}

let ZarathustraPuffer: Puffer<BirdWorld> = {
    handle_command: (world, parser) => {
        if (!world.is_in_heaven) {
            parser.eliminate();
        }

        parser.consume("mispronounce zarathustra's name");
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

    post: (new_world, old_world) => {
        if (old_world.is_in_heaven && !new_world.is_in_heaven) {
            return update(new_world, { message:
                { action: appender('You wave bye to Zarathustra.')}
            });
        }
        if (!old_world.is_in_heaven && new_world.is_in_heaven) {
            return update(new_world, {
                message: {
                    description: appender(
                        !new_world.has_seen_zarathustra ?
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
        return new_world;
    },
};

const roles = [
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
] as const;

const qualities = [
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
] as const;
type Qualities = typeof qualities;

interface Roles {
    is_in_heaven: boolean
    role: Qualities[number] | undefined;
}

export interface BirdWorld extends Roles {}

let RolePuffer: Puffer<BirdWorld> = {
    handle_command: (world, parser) => {
        if (world.is_in_heaven) {
            parser.eliminate();
        }

        parser.consume('be');

        let choice = parser.split(
            roles.map((r, i) =>
                () => parser.consume(`${r.replace(/ /g, '_')}`, i))
        );

        parser.submit();

        return update(world, {
            role: qualities[choice],
            message: {
                consequence: appender(`You feel ${qualities[choice]}.`)
            }
        });
    },

    post: (new_world, old_world) =>
        update(new_world, interpretation_updater(new_world, (w) => {
            if (new_world.role === 'vulnerable') {
                return {vulnerable: true };
            } else {
                return {vulnerable: false };
            }        
        }))
};

export interface BirdWorld extends World
    , Location
    , Zarathustra
    , Roles
{

};

const BirdWorldPuffers = [
    LocationPuffer,
    ZarathustraPuffer,
    RolePuffer
] as const;

const initial_bird_world: BirdWorld = {
    ...get_initial_world<BirdWorld>(),
    
    // location
    is_in_heaven: false,
    
    // zarathustra
    has_seen_zarathustra: false,

    // roles
    role: undefined
};

export const bird_world_spec = make_puffer_world_spec(initial_bird_world, BirdWorldPuffers);

import {WorldUpdater} from '../world';

export function new_bird_world() {
    return world_driver(bird_world_spec);
}

/*

    What is the correct means of factoring narrative text generation logic?

    - There is the KISS perspective. We simply deny any abstraction above that of text generation.
        The code becomes an expression of pushing text fragments together in the correct order.
    - There is the DIFF perspective. Narrative text is a function of the change between the
        previous world state and next one. State-update logic is segregated from narrative generation,
        which really only happens *after* the full state update is done.
    - Structural narrative perspective. We posit a structure for a narrative step:
        - Action
        - Consequence
        - Description
        - Prompt
        This works decently well for standard text adventure style narratives but obviously
        breaks down as you get more complicated.
        Also, if there are multiple "facets" to the narrative world, additional structure must
        be imposed to determine the order in which "sub-actions", "sub-consequences", etc. appear.


*/

