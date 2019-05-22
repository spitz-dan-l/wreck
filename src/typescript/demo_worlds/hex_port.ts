import { narrative_fsa_builder } from '../narrative_fsa';
import { Parser } from '../parser';
import { make_puffer_world_spec, Puffer, PufferAndWorld } from '../puffer';
import { split_tokens } from '../text_tools';
import { appender, update } from '../utils';
import { get_initial_world, World, world_driver } from '../world';
import { MessageUpdateSpec, message_updater } from '../message';

/*
    TODO:
        Add exit fragment

        Write game traverser for testing
*/

type PerceptID = string;

type Percept = {
    id: PerceptID,
    prereqs?: readonly PerceptID[],
    message: MessageUpdateSpec
};

const Percepts: readonly Percept[] = [
    {
        id: 'myself',
        message: `
            Merfolk. Father. Researcher.`
    },
    {
        id: 'merfolk',
        message: `
            Dark semi-firm scales coat your green flesh.
            <br/><br/>
            Your people are born of the sea. Vast, fluid, salty life.`
    },
    {
        id: 'family',
        message: `
            Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit.
            <br/><br/>
            And always at odds with each other, always fighting each other.
            <br/><br/>
            You wish they would work together, help each other.`
    },
    {
        id: 'researcher',
        message: `
            You are finishing up your experiment for the day at the Dark Pool.`
    },
    {
        id: 'dark pool',
        prereqs: ['researcher'],
        message: `
            A very strange phenomenon indeed. The Dark Pool is an underwater pool of dark- something.
            <br/><br/>
            Discovered within an underwater cave near your island home, it is a layer of thick, black fluid resting beneath the clear seawater.
            <br/><br/>
            The constitution of the dark substance is unknown, but by now it is recognized by your village to be dangerous.`
    },
    {
        id: 'failed experiments',
        prereqs: ['researcher'],
        message: `
            You have been trying to measure the Dark Pool's true depth.
            <br/><br/>
            All previous attempts to insert measuring devices into it have been unsuccessful.
            <br/><br/>
            In every case, the object submerged in the pool could not be retrieved.
            <br/><br/>
            Trained animals, and even some brave merfolk sent in after your instruments have never returned.`
    },
    {
        id: 'experiment',
        prereqs: ['researcher'],
        message: `
            Today's experiment is different. Today you are attempting to induce the pool to <i>tell</i> you its depth.
            <br/><br/>
            By asking it the right question, and listening carefully.
            <br/><br/>
            You have developed a broadcaster for just this purpose.`
    },
    {
        id: 'broadcaster',
        prereqs: ['experiment'],
        message: `
            A surprisingly simple application of mind control, of your own design.
            <br/><br/>
            First, find and trap a young dolphin. Make it your mindslave.
            <br/><br/>
            With some practice, you can psychically manipulate the dolphin's vocal chords to emit sonar pings.
            <br/><br/>
            Interpretting the resulting echoes is easier if you let the dolphin's inner ear and brain do the work.
            <br/><br/>
            You found that surgical removal of extraneous brain matter helps clean up the signal coming through the mindlink.
            <br/><br/>
            Ingenious, really.`
    }
] as const;

type ObserverMomentID = string;

interface Hex {
    node: ObserverMomentID;
    has_perceived: { [K in PerceptID]: boolean };
    with_daughters: boolean;
}

type PW = PufferAndWorld<Hex>;

function percieve(world: PW, perc: PerceptID) {
    return update(world, {
        has_perceived: { [perc]: true },
        message: message_updater(Percepts.find(p => p.id === perc).message)
    });
}

function make_perceiver(world: PW, percs: readonly PerceptID[]) {
    return (parser: Parser) =>
        parser.split(
            percs.map(pid => () => {
                let perc = Percepts.find(p => p.id === pid);
                if (perc.prereqs !== undefined && perc.prereqs.some(p => !world.has_perceived[p])) {
                    parser.eliminate();
                }
                parser.consume(`${world.has_perceived[pid] ? '~' : ''}${split_tokens(pid).join('_')}`);
                parser.submit();
                return percieve(world, pid);
            })
        );
}


let {
    make_transitioner,
    transition_to,
    make_node
} = narrative_fsa_builder<Hex, 'node', ObserverMomentID>('node');

const ObserverMomentIndex: Puffer<Hex>[] = [];

type NodeSpec = Parameters<typeof make_node>[0]

function ObserverMoments(...spec: NodeSpec[]) {
    ObserverMomentIndex.push(...spec.map(make_node));
}

ObserverMoments(
{
    id: "imagining 0",
    transitions: {
        'who_am_I?': 'imagining 1'
    }
},
{
    id: 'imagining 1',
    // debug: true,
    enter_message: `
        <div class="interp">
            That doesn't matter right now.
            <br/><br/>
            Imagine you're Chitin Wastrel.
        </div>`,
    
    handle_command: { 
        0: (world, parser) => {
            let percepts = [
                'myself',
                'merfolk',
                'family',
                'researcher',
                'dark pool',
                'failed experiments',
                'experiment',
                'broadcaster'
            ];

            return make_perceiver(world, percepts)(parser);
        },
        // NOTE: the "1:"" here causes this handler's typeahead to appear *after* the options for the percepts.
        1: (world, parser) => {
            if (!world.has_perceived['experiment']) {
                parser.eliminate();
            }
            
            return make_transitioner(world, {'operate_broadcaster': 'imagining 2'})(parser);
        }
    },
},
{
    id: 'imagining 2',
    enter_message: `
        You mentally aim your cetacean broadcaster at the center of the Dark Pool, and fire a ping.
        <br/><br/>
        You hear the dolphin's click, first through its eardrums, and then, a split second later, through yours.`,
    transitions: {
        'listen_for_echoes': 'imagining 3'
    }
},
{
    id: 'imagining 3',
    enter_message: `
        You wait one second, three seconds, ten, twenty...
        <br/><br/>
        ...nothing.
        <br/><br/>
        Does the Dark Pool absorb sound too? Or is it just enormous within its depths?`,
    transitions: {
        'focus': 'imagining 4'
    }
},
{
    id: 'imagining 4',
    enter_message: `
        You close your eyes and inhabit the mind of your broadcaster.
        <br/><br/>
        You hear something.
        <br/><br/>
        It's impossible, though. A <i>voice</i> is speaking to you.
        <br/><br/>
        <div class="interp">
            "Ah, I see you're playing Mad Scientist again, eh?
            <br/><br/>
            That's a fun one."
        </div>`,
    transitions: {
        'what?': 'imagining 5'
    }
},
{
    id: 'imagining 5',
    enter_message: `
        <div class="interp">
            "Oh, I'm sorry. Did I surprise you?
            <br/><br/>
            Listen, <i>Professor Wastrel</i>. Let me give you some advice.
            <br/><br/>
            Go home. Now.
            <br/><br/>
            And leave me your little lobotomized toy to play with."
        </div>
        <br/>
        You feel yourself suddenly forced out of the mind of your broadcaster.
        <br/><br/>
        The dolphin drifts slowly downward, into the Dark Pool, until its body is enveloped.`,
    transitions: {
        'go_home': 'home 1'
    }
},
{
    id: 'home 1',
    enter_message: `
        The fear pushes you to swim faster than Poseides herself.
        <br/><br/>
        ***
        <br/><br/>
        You sit in your island hut, ruminating. Afraid of what you've just witnessed.
        <br/><br/>
        Dasani and Aechtuo enter, shouting at each other like always.
        <br/><br/>
        Such rage seethes within them. Such spirit.`,
    transitions: {
        '&silence_them': 'home silenced',
        '&listen_to_them': 'home listened'
    }
},
{
    id: 'home silenced',
    enter_message: `
        They are suddenly silent.
        <br/><br/>
        Their faces go blank.
        <br/><br/>
        They turn to look at you.
        <br/><br/>
        You can hear the faint sound of laughter somewhere outside.`,
    transitions: {
        'follow_the_laughter': 'outside 1'
    }
},
{
    id: 'home listened',
    enter_message: `
        The girls are arguing about Officer Marley.
        <br/><br/>
        Apparently she's not acting like herself.
        <br/><br/>
        You can hear the faint sound of laughter somewhere outside.`,
    transitions: {
        'follow_the_laughter': 'outside 1'
    }
},
{
    id: 'outside 1',
    enter_message: `
        Dasani and Aechtuo begin to follow you as you wander out the door toward the laughter.`,
    handle_command: (world, parser) => {
        let they_can_come = parser.split([
            () => parser.consume('&they_can_come', true),
            () => parser.consume('&they_must_stay', false)
        ]);
        parser.submit();

        return transition_to(world, 'outside 2', {
            with_daughters: they_can_come
        });
    }
},
{
    id: 'outside 2',
    enter_message: {
        action: [`
            {{#with_daughters}}They fall into step behind you.{{/with_daughters}}
            {{^with_daughters}}They remain in the hut, gazing after you in silence.{{/with_daughters}}    
        `],
        consequence: [`The laughter grows more raucous as you approach.`],
        description: [`You can make out a figure in the distance.`]
    },
    transitions: {
        'continue': 'outside 3'
    }
},
{
    id: 'outside 3',
    enter_message: `
        It's Officer Marley. She howls in apparent maniacal joy.
        <br/><br/>
        {{#with_daughters}}
        "Ah, the three Wastrels!" she cries.
        <br/><br/>
        "Two hateful girls and their poor, obsessive, withdrawn father!"
        {{/with_daughters}}
        {{^with_daughters}}
        "Ah, the distinguished Professor Wastrel!" she cries.
        <br/><br/>
        "Has the fool finally decided to come and see where his studies have gotten him?"
        {{/with_daughters}}
        <br/><br/>
        You notice an open wound on Officer Marley's neck.
        <br/><br/>
        Trickling forth is a pitch dark fluid, nothing like Mer blood.
        <br/><br/>
        You notice a trail of the black liquid along the ground, leading from Officer Marley back to the sea,
        <br/><br/>
        and towards the Dark Pool.`,
    handle_command: (world, parser) => {
        parser.consume('follow_the_trail');
        parser.submit();

        if (world.with_daughters) {
            return transition_to(world, 'outside 4');
        } else {
            return transition_to(world, 'outside 4, death');
        }
    }
},
{
    id: 'outside 4, death',
    enter_message: `
        As you begin to wander towards the sea, Officer Marley steps in your way.
        <br/><br/>
        "Going back? To figure all this out once and for all?
        <br/><br/>
        I think not!"
        <br/><br/>
        She draws her sword and cuts your throat, laughing all the while.
        <br/><br/>
        Pitch black not-blood streams from neck, mouth, nose, eyes.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
},
{
    id: 'outside 4',
    enter_message: `
        As you begin to wander towards the sea, Officer Marley steps in your way.
        <br/><br/>
        "Going back? To figure all this out once and for all?
        <br/><br/>
        I think not!"
        <br/><br/>
        She draws her sword, and Dasani lunges in front of you, drawing a knife.
        <br/><br/>
        "I'll protect you, father!" Dasani screams.`,
    transitions: {
        '&stop_her': 'outside 5, death',
        '&let_her': 'outside 5'
    }
},
{
    id: 'outside 5',
    enter_message: `
        Your daughter and Officer Marley meet in a blur of green flesh and steel.
        <br/><br/>
        An instant later, they both lie in a heap on the ground. Dead.
        <br/><br/>
        "Father," mutters Aechtuo. "We have to go. We have to understand.
        <br/><br/>
        She saved you so that you could understand."`,
    transitions: {
        'proceed': 'dark pool 1'
    }
},
{
    id: 'outside 5, death',
    enter_message: `
        Your daughter's body is suddenly calm, the rage suddenly extinguished.
        <br/><br/>
        She drops her knife and turns away from Officer Marley.
        <br/><br/>
        She gazes at you. Her eyes appear vacant.
        <br/><br/>
        Officer Marley loses no time.
        <br/><br/>
        She swiftly beheads Dasani before your eyes.
        <br/><br/>
        She proceeds to execute Aechtuo and you in turn.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
},
{
    id: 'dark pool 1',
    enter_message: `
        You and Aechtuo swim to the cave, arriving at the Dark Pool.
        <br/><br/>
        There it lies. Impassable, impossible, all-consuming.
        <br/><br/>
        <div class="interp">
            "Back again, eh?
            <br/><br/>
            And with your beloved daughter in tow?
            <br/><br/>
            What happened to the other one?
            <br/><br/>
            I always liked her better."
        </div>
        <br/>
        That voice again? It's time. Time to understand.
        <br/><br/>
        What lies within the depths?`,
    transitions: {
        'enter_the_Dark_Pool': 'dark pool 2'
    }
},
{
    id: 'dark pool 2',
    enter_message: `
        As you swim towards the pool's black surface, a form emerges from its depths, shrouded in black clouds.
        <br/><br/>
        <div class="interp">
            "Remember your little toy?
            <br/><br/>
            Your little broadcaster?
            <br/><br/>
            I couldn't resist having some fun with it.
            <br/><br/>
            I think you'll like my improvements."
        </div>`,
    transitions: {
        'look_at_it': 'dark pool 3'
    }
},
{
    id: 'dark pool 3',
    enter_message: `  
        It's your dolphin. Or, it was.
        <br/><br/>
        Its body is contorted into a spiral shape,
        <br/><br/>
        its fins bulge and bend unnaturally, like powerful arms,
        <br/><br/>
        its blowhole has been widened out,
        <br/><br/>
        allowing the brain to float gently outside the skull,
        <br/><br/>
        tethered by the pulsating brainstem,
        <br/><br/>
        like a fishing buoy.`,
    transitions: {
        'listen_through_it': 'dark pool 4'
    }
},
{
    id: 'dark pool 4',
    enter_message: ` 
        And suddenly, you are in its mind again
        <br/><br/>
        and you are consumed by the sound of every
        <br/><br/>
        eddy and every grain of sand and every
        <br/><br/>
        beating animal heart in this cave
        <br/><br/>
        and your daughter aechtuo is
        <br/><br/>
        swimming towards you
        <br/><br/>
        r dolphin and she is strangling
        <br/><br/>
        it by the brain
        <br/><br/>
        stem and you really want to`,
    transitions: {
        '&stop_her': 'dark pool 5, death',
        '&let_her': 'dark pool 5'
    }
},
{
    id: 'dark pool 5, death',
    enter_message: `
        so of course she stops
        <br/><br/>
        and the dolphin gathers her up in
        <br/><br/>
        your arms and bites her in
        <br/><br/>
        half
        <br/><br/>
        and the sound rings out more clearly
        <br/><br/>
        in your mind than anything you have ever known
        <br/><br/>
        and you are nothing after that.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
},
{
    id: 'dark pool 5',
    enter_message: `
        so of course she continues
        <br/><br/>
        and the sound begins to dissipate
        <br/><br/>
        and your thoughts are a bit more coherent than before
        <br/><br/>
        and you find you can return to your own mind.
        <br/><br/>
        But as you look through your own eyes again,
        <br/><br/>
        you see that Aechtuo and the dolphin have drifted into the Dark Pool.
        <br/><br/>
        And now she is gone.`,
    transitions: {
        'follow_her': 'dark pool 6'
    }
},
{
    id: 'dark pool 6',
    enter_message: `
        You drift into the thick, black liquid,
        <br/><br/>
        becoming nothing.
        <br/><br/>
        <div class="interp">
            I knew I couldn't keep you here forever.
            <br/><br/>
            I'm glad we got to play together, for awhile.
            <br/><br/>
            If you see the real Chitin Wastrel,
            <br/><br/>
            tell him I said Hi,
            <br/><br/>
            and that I'll be right here
            <br/><br/>
            waiting.
        </div>
        <br/>
        YOU WIN.`
}
);

interface HexWorld extends World, Hex {}

const initial_hex_world: HexWorld = {
    ...get_initial_world<HexWorld>(),

    node: 'imagining 0',
    with_daughters: false,
    has_perceived: {},
}

const hex_world_spec = make_puffer_world_spec(initial_hex_world, ObserverMomentIndex);

export function new_hex_world() {
    return world_driver(hex_world_spec);
}

