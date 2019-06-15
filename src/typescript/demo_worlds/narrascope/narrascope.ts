import { message_updater } from '../../message';
import { make_puffer_world_spec, Puffer, PufferAndWorld } from '../../puffer';
import { included, update, cond } from '../../utils';
import { get_initial_world, World, world_driver } from '../../world';
import { Abstractions, Facets, init_metaphors } from './metaphor';
import { global_lock, initialize, PufferIndex, Venience, Puffers } from './prelude';
import { Memories, Topics } from './topic';


export const null_lock = global_lock(null);


type PW = PufferAndWorld<Venience>;

interface PuzzleState {
    has_scrutinized_memory: {
        [K in 1 | 2 | 3 | 4]: boolean | symbol
    };
    has_chill: boolean | symbol;
    has_recognized_something_wrong: boolean | symbol;
    is_curious_about_history: boolean | symbol;
    has_admitted_negligence: boolean | symbol;
    has_unpacked_culpability: boolean | symbol;
    has_volunteered: boolean | symbol;
    end: boolean;
}


declare module './prelude' {
    export interface Venience extends PuzzleState {
    }
}

initialize();

Abstractions({
    name: 'the attentive mode',
    name_cmd: 'the_attentive_mode',
    slug: 'attentive-mode',
    description: `
    <div class="memory-1">
        "Wake up, my dear. Attend to the world around you."
        <blockquote class="interp-memory-1">
            Katya took you the <a target="_blank" href="https://en.wikipedia.org/wiki/Mauna_Kea_Observatories">Mauna Kea Observatories</a> in Hawaii once, to study the astronomers at work.
            <br/>
            There was to be little time to relax or sleep in; astronomers are busy folk.
        </blockquote>
    </div>`,
    get_cmd: (action) => action,
    actions: [
        {
            name: 'attend' as const,
            description: "The ability to attend to particular facets of one's perception.",
            slug: 'attend',
            get_cmd: (facet) => ['attend_to', facet],
            get_wrong_msg: (facet) => `Merely paying more attention to ${facet} does not seem to be enough.`
        }
    ]
});

function about_attentive(w: PW) {
    return w.gist !== null && w.gist.name.endsWith('the attentive mode');
}

Facets({
    name: 'a memory 1',
    description: "A memory.",
    slug: 'memory-1',
    phrase: 'the_memory',
    can_recognize: (w2, w1) =>
        about_attentive(w1) && !!w2.has_acquired['the attentive mode'],
    can_apply: ([abstraction, action]) => action.name === 'scrutinize',
    solved: w => w.has_scrutinized_memory[1],
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world, 
                { has_scrutinized_memory:  { 1: Symbol() }},
            );
        }
        return world;
    }     
});

function about_scrutinizing(w: PW) {
    return w.gist !== null && w.gist.name.endsWith('the scrutinizing mode');
}

Facets({
    name: 'a memory 2',
    description: "A memory.",
    slug: 'memory-2',
    phrase: 'the_memory',
    can_recognize: (w2, w1) =>
        about_scrutinizing(w1) && !!w2.has_acquired['the scrutinizing mode'],
    can_apply: ([abstraction, action]) => action.name === 'scrutinize',
    solved: w => w.has_scrutinized_memory[2],
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world, 
                { has_scrutinized_memory:  { 2: Symbol() }},
            );
        }
        return world;
    }     
});

function about_hammer(w: PW) {
    return w.gist !== null && w.gist.name.endsWith('the hammer');
}

Facets({
    name: 'a memory 3',
    description: "A memory.",
    slug: 'memory-3',
    phrase: 'the_memory',
    can_recognize: (w2, w1) =>
        about_hammer(w1) && !!w2.has_acquired['the hammer'],
    can_apply: ([abstraction, action]) => action.name === 'scrutinize',
    solved: w => w.has_scrutinized_memory[3],
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world, 
                { has_scrutinized_memory:  { 3: Symbol() }},
            );
        }
        return world;
    }     
});

function about_volunteer(w: PW) {
    return w.gist !== null && w.gist.name.endsWith('the volunteer');
}

Facets({
    name: 'a memory 4',
    description: "A memory.",
    slug: 'memory-4',
    phrase: 'the_memory',
    can_recognize: (w2, w1) =>
        about_volunteer(w1) && !!w2.has_acquired['the volunteer'],
    can_apply: ([abstraction, action]) => action.name === 'scrutinize',
    solved: w => w.has_scrutinized_memory[4],
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world, 
                { has_scrutinized_memory:  { 4: Symbol() }},
            );
        }
        return world;
    }     
});

Topics({
    name: 'Sam',
    cmd: 'sam',
    can_consider: () => true,
    message: `
    <div class="sam">
        <div class="friendship-sam">
            An old friend on his way to work.
            <blockquote class="interp-friendship-sam">
                You realize how long it's been since you've seen him anywhere other than the bus.
            </blockquote>
        </div>
        <div class="sam-demeanor">
            He glances at you, smiling vaguely.
            <blockquote class="interp-sam-demeanor">
                Something about his smile feels... false. A lie.
                <br/>
                And his eyes. Flicking here and there. Noncommital. Nervous.
            </blockquote>
        </div>
        <div class="interp-sam affinity">
            ...Something is wrong.
            <blockquote class="interp-affinity">
                Indeed. It's time to try to do something about it.
            </blockquote>
        </div>
    </div>`,
    reconsider: (w2, w1) => {
        if (w2.has_acquired['the attentive mode'] && !w2.has_chill) {
            return true;
        }

        if (w2.has_acquired['the scrutinizing mode'] && !w2.has_recognized_something_wrong) {
            return true;
        }

        if (w2.has_acquired['the hammer'] && !w2.is_curious_about_history) {
            return true;
        }

        if (w2.has_acquired['the volunteer'] && !w2.has_volunteered) {
            return true;
        }
        return false;
    }
});

Topics({
    name: 'yourself',
    cmd: 'myself',
    can_consider: () => true,
    message: `You haven't entirely woken up.
    <br/>
    A <strong>thick notebook</strong> sits at your lap.`,
});

Topics({
    name: 'your notebook',
    cmd: 'my_notebook',
    can_consider: (world) => !!world.has_considered['yourself'],
    message: {
        description: [`
            You keep it with you at all times.
            <br/>
            It is filled with the words of someone very wise, who you once knew.`],
        prompt: [`
            Each day you try to <strong>remember something</strong> that she told you, and write it down.`]
    }
});

Memories({
    abstraction: 'the attentive mode',
    could_remember: world => !!world.has_considered['your notebook']
});

// Big old hack but it'll do for now
function about_sam(world: PW) {
    return world.gist !== null && world.gist.name === 'your impression of Sam';
}

Facets({
    name: 'Sam',
    description: "Sam's presence by your side.",
    slug: 'sam',
    phrase: 'sam',
    can_recognize: (w2, w1) =>
        about_sam(w1) && !!w2.has_acquired['the attentive mode'],
    can_apply: ([abstraction, action]) => action.name === 'attend',
    solved: w => w.has_chill,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'attend') {
            return update(world, 
                { has_chill: Symbol() },    
                message_updater({
                    consequence: cond(!world.has_chill, () => `A chill comes over you.`),
                    description: [`
                        Something about Sam is <i>incorrect</i>.
                        <br/>
                        You can feel the discordance in your bones. It scares you.`]
                })
            );
        } else {
            // TODO: replace generic wrong msg with hint asking for more specifity
            if (action.name === 'scrutinize') {
                return update(world, message_updater("You'll need to be more specific about what to scrutinize."))
            }
            return update(world, message_updater(action.get_wrong_msg('sam')));
        }
    }
});

Abstractions({
    name: 'the scrutinizing mode',
    name_cmd: 'the_scrutinizing_mode',
    slug: 'scrutinizing-mode',
    description: `
    <div class="memory-2">
        "Look beyond your initial impressions, my dear. Scrutinize. Concern yourself with nuance."
        <blockquote class="interp-memory-2">
            She mentioned this while making a point about the intricacies of the <a target="_blank" href="https://en.wikipedia.org/wiki/Observer_effect_(physics)">Observer Effect</a>.
        </blockquote>
    </div>`,
    get_cmd: (action) => action,
    actions: [
        {
            name: 'scrutinize' as const,
            description: "The ability to unpack details and look beyond your initial assumptions.",
            slug: 'scrutinize',
            get_cmd: (facet) => ['scrutinize', facet],
            get_wrong_msg: (facet) => `Despite your thorough scrutiny, ${facet} remains concerning.`
        }
    ]
});

Memories({
    abstraction: 'the scrutinizing mode',
    could_remember: world => !!world.has_chill
});

Facets({
    name: "Sam's demeanor",
    description: "Sam's demeanor",
    slug: 'sam-demeanor',
    phrase: "sam's_demeanor",
    can_recognize: (w2, w1) =>
        about_sam(w1) && !!w2.has_acquired['the scrutinizing mode'],
    can_apply: ([abstraction, action]) => action.name === 'scrutinize',
    solved: w => w.has_recognized_something_wrong,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world,
                { has_recognized_something_wrong: Symbol() },
                message_updater(`
                    You are struck by the alarming incongruence of his demeanor.
                    <br/>
                    The initial pleasant, mild impression, revealed upon further scrutiny to be a veneer, a mask, a lie.`));
        } else if (action.name === 'attend') {
            return update(world,
                message_updater(`You notice nothing new about his demeanor.`));
        } else {
            return update(world, message_updater(action.get_wrong_msg("sam's demeanor")));
        }
    }
});

Abstractions({
    name: 'the hammer',
    name_cmd: 'the_hammer',
    slug: 'hammer',
    description: `
        <div class="memory-3">
            "Take a hammer to your assumptions, my dear. If they are ill-founded, let them crumble."
            <blockquote class="interp-memory-3">
                She always pushed you.
                </br>
                Katya was always one to revel in the overturning of wrong ideas.
            </blockquote>
        </div>`,
    get_cmd: (action) => action,
    actions: [
        {
            name: 'hammer' as const,
            description: "The act of dismantling one's own previously-held beliefs.",
            slug: 'to-hammer',
            get_cmd: (facet) => ['hammer_against the_foundations_of', facet],
            get_wrong_msg: (facet) => `You find yourself unable to shake ${facet}, despite your efforts.`
        }
    ]
});

Memories({
    abstraction: 'the hammer',
    could_remember: world => !!world.has_recognized_something_wrong
});

Facets({
    name: 'your friendship with Sam',
    slug: 'friendship-sam',
    phrase: 'my_friendship_with_sam',
    description: 'Your friendship with Sam.',

    can_recognize: (w2, w1) =>
        about_sam(w1) && !!w2.has_acquired['the hammer'],
    can_apply: ([abstraction, action]) => included(action.name, ['hammer']),
    solved: w => w.is_curious_about_history,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'hammer') {
            return update(world,
                message_updater({
                    action: [`You ask yourself a hard question: <i>Is Sam really your friend?</i>`],
                    consequence: ["You realize you don't know anymore."],
                    prompt: ["You'll have to <strong>consider your history</strong>."]
                }),
                { is_curious_about_history: Symbol() }
            );
        }
        return world;
    }

});

Topics({
    name: 'your history with Sam',
    cmd: 'my_history_with_Sam',
    can_consider: (w) => !!w.is_curious_about_history,
    message: { description: [
        `You've known Sam since you both arrived in Boston about 10 years ago.
        <br/>
        You were studying under Katya, and he was doing agricultural engineering a few buildings over.
        <div class="falling-out">
            At some point along the way, you drifted apart.
            <blockquote class="interp-falling-out culpability">
                It wasn't mutual. It was <i>you</i>.
                <blockquote class="interp-culpability">
                    After Katya left, you turned inward. Closed off.
                    <br/>
                    You stopped being curious about people like Sam.
                </blockquote>
            </blockquote>
        </div>`]
    },
    reconsider: (w2, w1) => {
        if (!w2.has_unpacked_culpability) {
            return true;
        }
        return false;
    }
});


function is_about_history(w: PW) {
    return w.gist !== null && w.gist.name === 'your impression of your history with Sam';
}

Facets({
    name: 'your drifting apart',
    slug: 'falling-out',
    phrase: 'our_drifting_apart',
    description: 'Your drifting apart.',

    can_recognize: (w2, w1) => is_about_history(w1),
    can_apply: ([abstraction, action]) => included(action.name, ['hammer']),
    solved: w => w.has_admitted_negligence,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'hammer') {
            return update(world,
                { has_admitted_negligence: Symbol() },
                message_updater(`
                    You force yourself to look the truth in the eye: <i>You</i> bowed out of the friendship.
                    <br/>
                    There was nothing mutual about it. You sidelined him without explanation.`));
        }
        return world;
    }
});

Facets({
    name: 'your culpability',
    slug: 'culpability',
    phrase: 'my_culpability',
    description: 'Your culpability.',

    can_recognize: (w2, w1) => is_about_history(w1) && !!w2.has_admitted_negligence,
    can_apply: ([abstraction, action]) => included(action.name, ['scrutinize']),
    solved: w => w.has_unpacked_culpability,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world,
                { has_unpacked_culpability: Symbol() },
                message_updater(`
                    There's no doubt you did it out of self-preservation.
                    <br/>
                    There's also no doubt he deserved better.
                    <br/>
                    You wince at the guilt.`));
        }
        return world;
    }
});

Abstractions({
    name: 'the volunteer',
    name_cmd: 'the_volunteer',
    slug: 'volunteer',
    description: `
    <div class="memory-4">
        "Do more than merely receive and respond, my dear. We must participate, as best as we can. We must volunteer ourselves to the world."
        <blockquote class="interp-memory-4">
            This is one of the last things she said to you, before she left.
        </blockquote>
    </div>`,
    get_cmd: (action) => action,
    actions: [
        {
            name: 'volunteer' as const,
            description: "The offering of an active intervention in the world, to change it for the better.",
            slug: 'volunteer',
            get_cmd: (facet) => ['volunteer to_foster', facet],
            get_wrong_msg: (facet) => `Despite your thorough scrutiny, ${facet} remains concerning.`
        }
    ]
})

Memories({
    abstraction: 'the volunteer',
    could_remember: world => !!world.has_unpacked_culpability
});

Facets({
    name: 'the old affinity',
    slug: 'affinity',
    phrase: 'the_old_affinity',
    description: 'The old affinity you once had for each other.',

    can_recognize: (w2, w1) => about_sam(w1) && !!w2.has_acquired['the volunteer'],
    can_apply: ([abstraction, action]) => included(action.name, ['volunteer']),
    solved: w => w.has_volunteered,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'volunteer') {
            return update(world,
                { has_volunteered: Symbol(), },
                message_updater(`
                    You turn in your seat, and look him in the eyes, and say,`));
        }
        return world;
    }
});

let outro_lock = global_lock('Outro');

Puffers({
    pre: world => {
        if (world.has_volunteered) {
            return update(world, w => outro_lock.lock(w));
        }
        return world;
    },

    handle_command: (world, parser) => {
            if (!world.has_volunteered || world.end) {
                parser.eliminate();
            }

            parser.consume('How are you, Sam?');
            parser.submit();

            return update(world,
                { end: true },
                message_updater(`
                    <div class="interp">
                        VENIENCE WORLD
                    </div>
                    A work of <span class="blue">interactive fiction</span>
                    <br/>
                    by <div class="interp-inline">Daniel Spitz</div>
                    <br/><br/>
                    Thank you for playing the demo!`));
    }
});


interface VenienceWorld extends World, Venience {}

const initial_venience_world: VenienceWorld = update({
        ...get_initial_world<VenienceWorld>(),
        ...init_metaphors,
        owner: null,
        gist: null,
        has_acquired: {},
        has_considered: {},
        has_tried: {},
        has_chill: false,
        has_recognized_something_wrong: false,
        is_curious_about_history: false,
        has_admitted_negligence: false,
        has_unpacked_culpability: false,
        has_volunteered: false,
        end: false,

        has_scrutinized_memory: {
            1: false,
            2: false,
            3: false,
            4: false
        }
    },
    message_updater('You and Sam are sitting together on the bus.')
);

const venience_world_spec = make_puffer_world_spec(initial_venience_world, PufferIndex);

export function new_venience_world() {
    return world_driver(venience_world_spec);
}


