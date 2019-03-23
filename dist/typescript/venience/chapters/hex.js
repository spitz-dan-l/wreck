"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const venience_world_1 = require("../venience_world");
const text_tools_1 = require("../../text_tools");
const datatypes_1 = require("../../datatypes");
const parser_1 = require("../../parser");
let hex_oms = () => [
    {
        id: "imagining 0",
        enter_message: '',
        transitions: [
            [['who', 'am', 'I?'], 'imagining 1']
        ]
    },
    {
        id: "imagining 1",
        enter_message: `
        <div class="interp">
            That doesn't matter right now.
            <br/><br/>
            Imagine you're Chitin Wastrel.
        </div>`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let make_regard_handler = (perceptions) => {
                return venience_world_1.wrap_handler(function* (parser) {
                    let option = yield parser.consume_option(perceptions.map(p => datatypes_1.annotate(text_tools_1.tokenize(p)[0], {
                        enabled: !this.state.has_regarded[p],
                        display: parser_1.DisplayEltType.filler
                    })));
                    console.log(option);
                    return this.regard(option);
                });
            };
            let intro_perceptions = [
                'myself',
                'merfolk',
                'family',
                'researcher'
            ];
            let intro_consumer = make_regard_handler(intro_perceptions);
            let research_perceptions = [
                'dark pool',
                'failed experiments',
                'experiment'
            ];
            let research_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (!this.state.has_regarded['researcher']) {
                    return parser.invalidate();
                }
                return make_regard_handler(research_perceptions).call(this, parser);
            });
            let broadcaster_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (!this.state.has_regarded['experiment']) {
                    return parser.invalidate();
                }
                let broadcaster_regarder = make_regard_handler(['broadcaster']);
                let do_broadcast = venience_world_1.wrap_handler(function* (parser) {
                    yield parser.consume_filler(['operate', 'broadcaster']);
                    return this.transition_to('imagining 2');
                });
                return parser_1.combine.call(this, parser, [broadcaster_regarder, do_broadcast]);
            });
            return parser_1.combine.call(this, parser, [intro_consumer, research_consumer, broadcaster_consumer]);
        }),
        dest_oms: ["imagining 2"]
    },
    {
        id: 'imagining 2',
        enter_message: `
        You mentally aim your cetacean broadcaster at the center of the Dark Pool, and fire a ping.
        <br/><br/>
        You hear the dolphin's click, first through its eardrums, and then, a split second later, through yours.`,
        transitions: [
            [['listen for echoes'], 'imagining 3']
        ]
    },
    {
        id: 'imagining 3',
        enter_message: `
        You wait one second, three seconds, ten, twenty...
        <br/><br/>
        ...nothing.
        <br/><br/>
        Does the Dark Pool absorb sound too? Or is it just enormous within its depths?`,
        transitions: [
            [['focus'], 'imagining 4']
        ]
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
        </div>
        `,
        transitions: [
            [['what?'], 'imagining 5']
        ]
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
        transitions: [
            [['go', 'home'], 'home 1']
        ]
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
        transitions: [
            [['&silence', '&them'], 'home silenced'],
            [['&listen', '&to', '&them'], 'home listened']
        ]
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
        transitions: [
            [['follow', 'the', 'laughter'], 'outside 1']
        ]
    },
    {
        id: 'home listened',
        enter_message: `
        The girls are arguing about Officer Marley.
        <br/><br/>
        Apparently she's not acting like herself.
        <br/><br/>
        You can hear the faint sound of laughter somewhere outside.`,
        transitions: [
            [['follow', 'the', 'laughter'], 'outside 1']
        ]
    },
    {
        id: 'outside 1',
        enter_message: `Dasani and Aechtuo begin to follow you as you wander out the door toward the laughter.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let option = yield parser.consume_option([
                ['they', 'can', 'come'],
                ['they', 'must', 'stay']
            ]);
            let with_daughters;
            let message;
            if (option === 'they can come') {
                with_daughters = true;
                message = 'They fall into step behind you.';
            }
            else {
                with_daughters = false;
                message = 'They remain in the hut, gazing after you in silence.';
            }
            message += `
            <br/><br/>
            The laughter grows more raucous as you approach.
            <br/><br/>
            You can make out a figure in the distance.`;
            return this.transition_to('outside 2', { with_daughters }, text_tools_1.wrap_in_div(message));
        }),
        dest_oms: ['outside 2']
    },
    {
        id: 'outside 2',
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_filler(['continue']);
            let with_daughters = this.get_current_om_state().with_daughters;
            let message = `
            It's Officer Marley. She howls in apparent maniacal joy.`;
            if (with_daughters) {
                message += `
                <br/><br/>
                "Ah, the three Wastrels!" she cries.
                <br/><br/>
                "Two hateful girls and their poor, obsessive, withdrawn father!"`;
            }
            else {
                message += `
                <br/><br/>
                "Ah, the distinguished Professor Wastrel!" she cries.
                <br/><br/>
                "Has the fool finally decided to come and see where his studies have gotten him?"`;
            }
            message += `
            <br/><br/>
            You notice an open wound on Officer Marley's neck.
            <br/><br/>
            Trickling forth is a pitch dark fluid, nothing like Mer blood.
            <br/><br/>
            You notice a trail of the black liquid along the ground, leading from Officer Marley back to the sea,
            <br/><br/>
            and towards the Dark Pool.`;
            return this.transition_to('outside 3', { with_daughters }, text_tools_1.wrap_in_div(message));
        }),
        dest_oms: ['outside 3']
    },
    {
        id: 'outside 3',
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_filler(['follow', 'the', 'trail']);
            let with_daughters = this.get_current_om_state().with_daughters;
            if (with_daughters) {
                return this.transition_to('outside 4');
            }
            else {
                return this.transition_to('outside 4, death');
            }
        }),
        dest_oms: ['outside 4', 'outside 4, death']
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
        transitions: []
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
        transitions: [
            [['&stop', '&her'], 'outside 5, death'],
            [['&let', '&her'], 'outside 5']
        ]
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
        transitions: [
            [['proceed'], 'dark pool 1']
        ]
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
        transitions: []
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
        transitions: [
            [['enter', 'the', 'Dark', 'Pool'], 'dark pool 2']
        ]
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
        transitions: [
            [['look', 'at', 'it'], 'dark pool 3']
        ]
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
        transitions: [
            [['listen', 'through', 'it'], 'dark pool 4']
        ]
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
        transitions: [
            [['&stop', '&her'], 'dark pool 5, death'],
            [['&let', '&her'], 'dark pool 5']
        ]
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
        transitions: []
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
        transitions: [
            [['follow', 'her'], 'dark pool 6']
        ]
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
        YOU WIN.`,
        transitions: []
    }
];
let hex_perceptions = () => [
    {
        id: 'myself',
        content: `
        Merfolk. Father. Researcher.`
    },
    {
        id: 'merfolk',
        content: `
        Dark semi-firm scales coat your green flesh.
        <br/><br/>
        Your people are born of the sea. Vast, fluid, salty life.`
    },
    {
        id: 'family',
        content: `
        Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit.
        <br/><br/>
        And always at odds with each other, always fighting each other.
        <br/><br/>
        You wish they would work together, help each other.`
    },
    {
        id: 'researcher',
        content: `
        You are finishing up your experiment for the day at the Dark Pool.`
    },
    {
        id: 'dark pool',
        content: `
        A very strange phenomenon indeed. The Dark Pool is an underwater pool of dark- something.
        <br/><br/>
        Discovered within an underwater cave near your island home, it is a layer of thick, black fluid resting beneath the clear seawater.
        <br/><br/>
        The constitution of the dark substance is unknown, but by now it is recognized by your village to be dangerous.`
    },
    {
        id: 'failed experiments',
        content: `
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
        content: `
        Today's experiment is different. Today you are attempting to induce the pool to <i>tell</i> you its depth.
        <br/><br/>
        By asking it the right question, and listening carefully.
        <br/><br/>
        You have developed a broadcaster for just this purpose.`
    },
    {
        id: 'broadcaster',
        content: `
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
];
/*

Imagine you're Chitin Wastrel

> myself
Merfolk. Father. Researcher. And something else.

> merfolk
Dark semi-firm scales coat your green flesh.

Your people are born of the sea. Vast, fluid, salty life.

> father
Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit. And always at odds with each other.

> researcher
You are finishing up your experiment for the day on the Dark Pool.

[It is a pool of pitch black fluid within a submerged cave. Like a brine pool. Those who have entered did not return.]
[A voice emits from the pool. It tells you that you are not really Chitin Wastrel anymore.]

[Returning home, Dasani and Aechtuo are bickering about Officer Marley acting strange.]
[If you tell them to stop fighting, they do so immediately, uncharacteristically.]

[Laughter (Officer Marley) is heard in the distance.]

[You leave the house to find her.]
[Daughters make to follow you, you can prevent them or not.]

[The island birds seem to suddenly startle and take flight.]
[You can make them calm and land again.]

[Marley has an open wound, continues to laugh. Instead of blood, pure black fluid flows from it.]
[A trail of black fluid leads from Marley out to the sea, towards the Dark Pool.]

[Marley vomits up black muck, which begins to take shape and move.]
[If you allowed daughters to come, Dasani stays to hold back Marley.]

[You (and Aechtuo) follow the black trail to the Dark Pool.]

[The booming voice speaks again: "You cannot save them. It is too late. This dream is already mine."]

[If Aechtuo is here: "Father, what should I do?"]

[If "Stay back": You attempt to approach the Dark Pool. A giant fish emerges from it first, and eats you.]
[If "Kill it": Aechtuo's eyes go dark and vacant. "Yes, lord." A giant fish emerges from the pool, and eats Aechtuo. She cuts her way out of its belly with a knife.]
    [You swim towards the pool.]
    ["Look at what you did to them. Look at what you made them do."]
    [You enter the pool, and it envelopes you, and the dream fades, and you are nowhere.]

*/
exports.default = {
    observer_moments: hex_oms,
    perceptions: hex_perceptions
};
//# sourceMappingURL=hex.js.map