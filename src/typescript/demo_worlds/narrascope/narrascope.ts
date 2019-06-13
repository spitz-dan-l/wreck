import { narrative_fsa_builder } from '../../narrative_fsa';
import { make_puffer_world_spec, PufferAndWorld } from '../../puffer';
import { update } from '../../utils';
import { get_initial_world, World, world_driver } from '../../world';
import { global_lock, Owner, PufferIndex, Puffers, Venience, TopicID, initialize } from './prelude';
import { Abstractions, Facets, init_metaphors } from './metaphor';
import { Topics, Memories } from './topic';
import { message_updater } from '../../message';


export const null_lock = global_lock(null);


type PW = PufferAndWorld<Venience>;

declare module './prelude' {
    export interface Venience {}
}

initialize();

/*

    The attendant - notices something amiss, panics at disorientation
    The examiner - focuses on Sam, notes that something is amiss behind his eyes, but cannot fathom what
    The hammer - dismantles the perrception that Sam is doing well, but leaves the view in ruin, cannot build back up
    The participant - provides the courage/self-importance to ask what is wrong

*/

Abstractions({
    name: 'the attentive mode',
    name_cmd: 'the_attentive_mode',
    slug: 'attentive-mode',
    description: '"Wake up, my dear. Attend to the world around you."',
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

Topics({
    name: 'Sam',
    cmd: 'sam',
    can_consider: () => true,
    message: `
    <div class="sam">
        An old friend.
        <br/>
        On his way to work.
        <br/>
        <div class="sam-demeanor">
            He glances at you, smiling vaguely.
            {{#interp-sam-demeanor}}
            <blockquote class="interp-sam-demeanor">
                Something about his smile feels... wrong. False. A lie.
                <br/>
                And his eyes. Flicking here and there. Noncommital. Nervous.
            </blockquote>
            {{/interp-sam-demeanor}}
        </div>
        {{#interp-sam}}
        <div class="interp-sam">
            ...Something is wrong.
        </div>
        {{/interp-sam}}

    </div>`,
    reconsider: (w2, w1) => {
        if (w2.has_acquired['the attentive mode'] && !w2.has_chill) {
            return true;
        }

        if (w2.has_acquired['the scrutinizing mode'] && !w2.has_recognized_something_wrong) {
            return true;
        }

        return false;
    }
});

Topics({
    name: 'myself',
    cmd: 'myself',
    can_consider: () => true,
    message: `You haven't entirely woken up.
    <br/>
    A <strong>thick notebook</strong> sits at your lap.`,
});

Topics({
    name: 'my notebook',
    cmd: 'my_notebook',
    can_consider: (world) => !!world.has_considered['myself'],
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
    could_remember: world => !!world.has_considered['my notebook']
});


declare module './prelude' {
    export interface Venience {
        has_chill: boolean;
        has_recognized_something_wrong: boolean;
    }
}


// Big old hack but it'll do for now
function about_sam(world: PW) {
    return world.gist !== null && world.gist.name.endsWith('Sam');
}

Facets({
    name: 'Sam',
    description: "Sam's presence by your side.",
    slug: 'sam',
    phrase: 'sam',
    can_recognize: (w2, w1) =>
        about_sam(w1) && !!w2.has_acquired['the attentive mode'],
    solved: w => w.has_chill,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'attend') {
            return update(world, 
                { has_chill: true },
                message_updater(`A chill comes over you.
                    <br/>
                    Something about Sam is incorrect.
                    <br/>
                    You can feel the discordance in your bones. It scares you.`)
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
    description: '"Look beyond your initial impressions, my dear. Scrutinize. Concern yourself with nuance."',
    get_cmd: (action) => action,
    actions: [
        {
            name: 'scrutinize' as const,
            description: "The ability to unpack details and look beyond your initial assumptions.",
            slug: 'scrutinize',
            get_cmd: (facet) => ['scrutinize', facet],
            get_wrong_msg: (facet) => `Despite your thorough scrutiny, ${facet} remains conerning.`
        }
    ]
});

Memories({
    abstraction: 'the scrutinizing mode',
    could_remember: world => !!world.has_chill
})

Facets({
    name: "Sam's demeanor",
    description: "Sam's typical, warm demeanor",
    slug: 'sam-demeanor',
    phrase: "sam's_demeanor",
    can_recognize: (w2, w1) =>
        about_sam(w1) && !!w2.has_acquired['the scrutinizing mode'],
    solved: w => w.has_recognized_something_wrong,
    handle_action: ([abstraction, action], world) => {
        if (action.name === 'scrutinize') {
            return update(world,
                { has_recognized_something_wrong: true },
                message_updater(`
                    You are struck by the alarming incongruence of his demeanor.
                    <br/>
                    The initial pleasant, mild impression, revealed upon further scrutiny to be a veneer, a mask, a lie.`))
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
    description: '"Take a hammer to your assumptions, my dear. If they are ill-founded, let them crumble."',
    get_cmd: (action) => action,
    actions: [
        {
            name: 'hammer' as const,
            description: "The act of dismantling one's own previously-held beliefs.",
            slug: 'to-hammer',
            get_cmd: (facet) => ['hammer_against_the_foundations_of', facet],
            get_wrong_msg: (facet) => `You find yourself unable to shake ${facet}, despite your efforts.`
        }
    ]
});

Memories({
    abstraction: 'the hammer',
    could_remember: world => !!world.has_recognized_something_wrong
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
        has_recognized_something_wrong: false
    },
    message_updater('You and Sam are sitting together on the bus.')
);

const venience_world_spec = make_puffer_world_spec(initial_venience_world, PufferIndex);

export function new_venience_world() {
    return world_driver(venience_world_spec);
}


