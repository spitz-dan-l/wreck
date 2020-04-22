import { make_puffer_world_spec, Puffer } from '../puffer';
import { random_choice } from '../lib/text_utils';
import { update } from '../lib/utils';
import { get_initial_world, World, world_driver } from '../world';
import { story_updater, Updates, createElement, StoryQueryIndex } from '../story';
import { failed } from '../parser';
import * as TypeStyle from 'typestyle';

export interface BirdWorld extends World {}

interface Location {
    is_in_heaven: boolean;
}

export interface BirdWorld extends Location {}

StoryQueryIndex.seal();

let LocationPuffer: Puffer<BirdWorld> = {
    handle_command: (world, parser) => {
        return parser.consume('go', () => {
            let is_locked = { 'up': world.is_in_heaven, 'down': !world.is_in_heaven };

            return parser.split(
                (['up', 'down'] as const).map(dir =>
                    () => parser.consume({
                        tokens: `${dir}_stairs`,
                        locked: is_locked[dir],
                        labels: {option: true}
                    }, dir)
                ),
                (dir) => parser.submit(() => { 
                    let new_pos = !world.is_in_heaven;
                    let loc = new_pos ? 'in Heaven' : 'standing around on the ground';
                    
                    return update(world,
                        story_updater(Updates.consequence(`You are currently ${loc}.`)),
                        { is_in_heaven: new_pos }
                    );
                })
            );   
        });
    },

    post: (new_world, old_world) => {
        return update(new_world, story_updater(
            Updates.map_worlds(new_world, (w, frame) =>
                frame.css({happy: w.is_in_heaven === new_world.is_in_heaven})
            )
        ));
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
            return parser.eliminate();
        }
        parser.consume("mispronounce zarathustra's name");
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
        let mispronunciation = random_choice(utterance_options);
        return update(world,
            story_updater(Updates.action(`"${mispronunciation}," you say.`))
        );
    },

    post: (new_world, old_world) => {
        if (old_world.is_in_heaven && !new_world.is_in_heaven) {
            return update(new_world,
                story_updater(
                    Updates.action('You wave bye to Zarathustra.')
                )
            );
        }
        if (!old_world.is_in_heaven && new_world.is_in_heaven) {
            return update(new_world, 
                story_updater(
                    Updates.description(
                        !new_world.has_seen_zarathustra ?
                            <div>
                                There's a bird up here. His name is Zarathustra.
                                <span className="vulnerable">&nbsp;He is sexy.</span>
                                <span className="no-vulnerable">&nbsp;He is ugly.</span>
                            </div> :
                            <div>
                                Zarathustra is here.
                                <span className="vulnerable">&nbsp;(What a sexy bird.)</span>
                            </div>
                    )
                ),
                { has_seen_zarathustra: true }
            );
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

const hidden_class = TypeStyle.style({
    display: 'none'
});

let RolePuffer: Puffer<BirdWorld> = {
    handle_command: (world, parser) => {
        if (world.is_in_heaven) {
            return parser.eliminate();
        }

        parser.consume('be');
        if (parser.failure) {
            return parser.failure;
        }

        let choice = parser.split(
            roles.map((r, i) =>
                () => parser.consume(`${r.replace(/ /g, '_')}`, i))
        );

        if (failed(choice)) {
            return choice;
        }

        parser.submit();
        if (parser.failure) {
            return parser.failure;
        }

        return update(world,
            { role: qualities[choice] },
            story_updater(Updates.consequence(`You feel ${qualities[choice]}.`))
        );
    },

    post: (new_world, old_world) =>
        update(new_world, story_updater(
            Updates.map_worlds(new_world, (w, frame) => [
                frame.has_class('vulnerable').css({[hidden_class]: new_world.role !== 'vulnerable'}),
                frame.has_class('no-vulnerable').css({[hidden_class]: new_world.role === 'vulnerable'})
            ])))
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

