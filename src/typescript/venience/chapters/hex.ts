import {
    HistoryInterpretationOp
} from '../../commands';

import {
    ObserverMoment,
    Perception,
    PerceptionID
} from '../observer_moments';

import {
    wrap_handler,
    VenienceWorldCommandResult,
    VenienceWorldInterstitialUpdateResult
} from '../venience_world';

import {
    tokenize,
    wrap_in_div
} from '../../text_tools';

import {
    set_enabled,
    is_enabled,
    annotate
} from '../../datatypes';

import {
    CommandParser,
    DisplayEltType,
    combine
} from '../../parser';

let hex_oms: () => ObserverMoment[] = () => [
    {
        id: "imagining 1",
        enter_message: "Imagine you're Chitin Wastrel.",
        handle_command: wrap_handler(function*(parser: CommandParser) {
            
            let intro_perceptions: PerceptionID[] = [
                'myself',
                'merfolk',
                'family',
                'researcher'
            ];

            let intro_consumer = wrap_handler(function*(parser: CommandParser) {
                let option = yield parser.consume_option(intro_perceptions.map(p => 
                    annotate([p], {
                        enabled: !this.state.has_regarded[p]
                    })));
                return this.regard(<PerceptionID>option);
            });
            
            return combine.call(this, parser, [intro_consumer]);
        }),

        dest_oms: ["imagining 2"]
    },
    {
        id: "imagining 2",
        enter_message: 'You are him.',
        transitions: []
    },
];

let hex_perceptions: () => Perception[] = () => [
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
        Trained animals, and even some brave merfolk, seem no better at returning from the Dark Pool's depths than your instruments.
        <br/><br/>
        Light of every shade is simply absorbed by the dark substance, so attempts to measure the depth with light rays have also failed.`
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
        With some practice, you can manipulate the dolphin's vocal chords to emit controlled sonar pings.
        <br/><br/>
        Interpretting the resulting echos is easier if you let the dolphin's inner ear and brain do the work.
        <br/><br/>
        Surgical removal of unnecessary parts of the brain helps clean up the signal coming through the mindlink.
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

export default {
    observer_moments: hex_oms,
    perceptions: hex_perceptions
};