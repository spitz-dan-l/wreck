import { Parser, ParserThread } from '../parser';
import { Puffer, PufferAndWorld, PufferFragment, knit_puffer } from '../puffer';
import { Fragment } from '../world';
import { appender, update, Omit } from '../utils';

/*
    Pattern to support: PerceptionID and ObserverMomentID enforced statically somehow

*/

/*
    TODO:
        Put perceptions behind another thing, "pieces of knowledge"
        A "piece of knowledge" can be "understood" by the player
            But the opportunity to understand it is gated behind understanding other things, and other
            contextual state conditions.
*/
type PerceptID = string;

type Percept = {
    id: PerceptID,
    prereqs?: readonly PerceptID[],
    fragment: Fragment
};

const Percepts: readonly Percept[] = [
    {
        id: 'myself',
        fragment: `
            Merfolk. Father. Researcher.`
    },
    {
        id: 'merfolk',
        fragment: `
            Dark semi-firm scales coat your green flesh.
            <br/><br/>
            Your people are born of the sea. Vast, fluid, salty life.`
    },
    {
        id: 'family',
        fragment: `
            Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit.
            <br/><br/>
            And always at odds with each other, always fighting each other.
            <br/><br/>
            You wish they would work together, help each other.`
    },
    {
        id: 'researcher',
        fragment: `
            You are finishing up your experiment for the day at the Dark Pool.`
    },
    {
        id: 'dark pool',
        prereqs: ['researcher'],
        fragment: `
            A very strange phenomenon indeed. The Dark Pool is an underwater pool of dark- something.
            <br/><br/>
            Discovered within an underwater cave near your island home, it is a layer of thick, black fluid resting beneath the clear seawater.
            <br/><br/>
            The constitution of the dark substance is unknown, but by now it is recognized by your village to be dangerous.`
    },
    {
        id: 'failed experiments',
        prereqs: ['researcher'],
        fragment: `
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
        fragment: `
            Today's experiment is different. Today you are attempting to induce the pool to <i>tell</i> you its depth.
            <br/><br/>
            By asking it the right question, and listening carefully.
            <br/><br/>
            You have developed a broadcaster for just this purpose.`
    },
    {
        id: 'broadcaster',
        prereqs: ['experiment'],
        fragment: `
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

interface HexObserverMoments {
    location: ObserverMomentID;
    moving: boolean;

    has_perceived: { [K in PerceptID]: boolean };
}

const MetaPuffer: Puffer<HexObserverMoments> = {
    activate: world => 2,
    pre: world => update(world, { moving: false })
}

type PW = PufferAndWorld<HexObserverMoments>;

function transition_to(world: PW, dest: ObserverMomentID) {
    return update(world, {
        location: dest,
        moving: true
    });
}

function percieve(world: PW, perc: PerceptID) {
    return update(world, {
        has_perceived: { [perc]: true },
        message: { consequence: appender(Percepts.find(p => p.id === perc).fragment) }
    });
}

function make_perceiver(world: PW, ...percs: PerceptID[]) {
    return (parser: Parser) =>
        parser.split(
            percs.map(pid => () => {
                let perc = Percepts.find(p => p.id === pid);
                if (perc.prereqs !== undefined && perc.prereqs.some(p => !world.has_perceived[p])) {
                    parser.eliminate();
                }
                parser.consume(`${world.has_perceived[pid] ? '~' : ''}${pid}`);
                parser.submit();
                return percieve(world, pid);
            })
        );
}

type ObserverMomentSpec = {
    id: ObserverMomentID,
    enter_fragment?: string,
    transitions?: { [k: string]: ObserverMomentID },
    percepts?: PerceptID[]
} & PufferFragment<HexObserverMoments>;

function make_observer_moment(spec: ObserverMomentSpec): Puffer<HexObserverMoments> {
    function activate(world: PW) {
        return world.location === spec.id;
    }

    let pf: PufferFragment<HexObserverMoments> = {
        handle_command: (world, parser) => {
            if (spec.transitions === undefined || Object.keys(spec.transitions).length === 0) {
                parser.eliminate();
            }
            return parser.split(
                Object.entries(spec.transitions).map(([toks, dest]) => () => {
                    parser.consume(toks);
                    parser.submit();
                    return transition_to(world, dest);
                })
            )
        },
        post: world => {
            if (world.moving && spec.enter_fragment !== undefined) {
                return update(world, {
                    message: { consequence: appender(spec.enter_fragment) }
                });
            }
            return world;
        }
    }

    return knit_puffer(activate, [spec, pf]);
}

const ObserverMoments: { [K in ObserverMomentID]: Puffer<HexObserverMoments> } = {
    "imagining 0": make_observer_moment({
        id: "imagining 0",
        transitions: {
            'who am I?': 'imagining 1'
        }
    }),
    "imagining 1": make_observer_moment({
        id: 'imagining 1',
        enter_fragment: `
            <div class="interp">
                That doesn't matter right now.
                <br/><br/>
                Imagine you're Chitin Wastrel.
            </div>`,
        percepts: [
            'myself',
            'merfolk',
            'family',
            'researcher',
            'dark pool',
            'failed experiments',
            'experiment'
        ],
        handle_command: (world, parser) => {
            if (!world.has_perceived['experiment']) {
                parser.eliminate();
            }

            parser.consume('operate broadcaster');
            parser.submit();
            return transition_to(world, 'imagining 2');
        },
    })
};
