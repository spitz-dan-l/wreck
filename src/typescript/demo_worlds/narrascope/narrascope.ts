import { MessageUpdateSpec, message_updater } from '../../message';
import { narrative_fsa_builder } from '../../narrative_fsa';
import { Parser, ParserThread, gate, ConsumeSpec } from '../../parser';
import { make_puffer_world_spec, Puffer, PufferAndWorld } from '../../puffer';
import { update, Updater, entries, cond } from '../../utils';
import { get_initial_world, World, world_driver } from '../../world';
import { LocalInterpretations, find_historical, self_interpretation } from '../../interpretation';
import { Metaphors, init_metaphors, Facets, Abstractions, init_metaphor_puffers } from './metaphors';

/*
    TODO
        - Convert various expositive bits to "consider" or "remember" commands, so they can be repeated.
        - use separate state machines for the various flowy bits
            - e.g. first waking up, you awaken, sit up, try to remember, numbers,
            lie down, etc.
        - fix up the parser dsl to support arb token labels
*/


type ObserverMomentID =
    'start' |
    'learning the mountain' |
    'alcove, beginning interpretation' |
    'alcove, ending interpretation' |
    'alcove, entering the forest' |
    'title' |
    'alone in the woods'
    ;

export type AbstractionID =
    'the mountain';

export type ActionID =
    'gravity' |
    'ice' |
    'horizon';

export type FacetID =
    'the sense of dread' |
    'the missing notes' |
    'your location';

export interface Venience extends Metaphors {
    node: ObserverMomentID;
    has_perceived: Partial<Record<PerceptID, boolean>>;
    alcove_interp: AlcoveInterp;
}

const PufferIndex: Puffer<Venience>[] = [];
export function Puffers(...puffers: Puffer<Venience>[]) {
    PufferIndex.push(...puffers)
}

type PW = PufferAndWorld<Venience>;

let transition_to = (w: PW, node: ObserverMomentID) => update(w, { node });

let {
    make_transitioner,
    make_state,
    apply_state,
    apply_states
} = narrative_fsa_builder<Venience, ObserverMomentID>(w => w.node, transition_to);

// type ObserverMomentSpec = Parameters<(typeof make_state)>[0];

// const ObserverMomentIndex: ObserverMomentSpec[] = [];

let ObserverMoments = apply_states()(p => { PufferIndex.push(p) });


type AlcoveInterp = {
    dread: boolean,
    ice: boolean,
    horizon: boolean
}

const initial_alcove_interp: AlcoveInterp = {
    dread: false,
    ice: false,
    horizon: false
}

init_metaphor_puffers();

Abstractions({
    name: 'the mountain',
    get_cmd: (action) => ['invoking_the_mountain,', action],
    actions: [
    {
        name: 'gravity',
        get_cmd: (facet) => ['judge the_direction_of_gravity_for', facet],
        get_wrong_msg: (facet) => `You struggle to connect the direction of gravity to ${facet}.`
    },
    {
        name: 'ice',
        get_cmd: (facet) => ['judge the_slickness_of_the_ice_for', facet],
        get_wrong_msg: (facet) => `You struggle to connect the slickness of the ice to ${facet}.`
    },
    {
        name: 'horizon',
        get_cmd: (facet) => ['survey the_horizon_from', facet],
        get_wrong_msg: (facet) => `You struggle to connect the horizon to ${facet}.`
    }]
});

Facets({
    name: 'the sense of dread',
    description: `The sense of nervous dread weighing down your mind.`,

    slug: 'dread',
    phrase: 'the_sense_of_dread',
    can_recognize: (current_world, interp_world) =>
        interp_world.node === 'alcove, beginning interpretation' &&
        interp_world.previous!.node !== 'alcove, beginning interpretation',

    correct: ([abs, action], world) => action === 'gravity',

    solved: (world) => world.alcove_interp.dread,

    set_solved: (world) => update(world, {
        alcove_interp: { dread: true }}),
},
{
    name: 'the missing notes',
    description: `The disappearance of your notes.`,

    slug: 'missing',
    phrase: 'the_missing_notes',
    can_recognize: (current_world, interp_world) =>
        interp_world.node === 'alcove, beginning interpretation' &&
        interp_world.previous!.node !== 'alcove, beginning interpretation',

    correct: ([abs, action], world) => action === 'ice',

    solved: (world) => world.alcove_interp.ice,

    set_solved: (world) => update(world, {
        alcove_interp: { ice: true }}),
},
{
    name: 'your location',
    description: `Your location within the woods; your alcove.`,

    slug: 'lost',
    phrase: 'my_location',
    can_recognize: (current_world, interp_world) =>
        interp_world.node === 'alcove, beginning interpretation' &&
        interp_world.previous!.node !== 'alcove, beginning interpretation',

    correct: ([abs, action], world) => action === 'horizon',

    solved: (world) => world.alcove_interp.horizon,

    set_solved: (world) => update(world, {
        alcove_interp: { horizon: true }}),
},);


ObserverMoments(
{
    id: 'start',
    transitions: {
        "learning the mountain": 'learn the_mountain'
    }
},
{
    id: 'learning the mountain',
    enter_message: `<div class="interp">
    <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
    </div>
    <div class="interp">
    <i>"That you are capable of a great deal of care, my dear.
    <br /><br />
    That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
    </div>
    <div class="interp"><i>
    "Judge the direction of gravity. Judge the slickness of the ice.
    <br /><br />
    Survey the horizon.
    <br /><br />
    And then, choose where to go."
    </i></div>`,
    handle_command: (world, parser) => {
        parser.consume('think_about_what_is_going_on');
        parser.submit();

        return update(transition_to(world, 'alcove, beginning interpretation'), {
            has_acquired: { 'the mountain': true }
        })
    },
});

ObserverMoments(
{
    id: 'alcove, beginning interpretation',
    // TODO: fix the style/line breaks here
    enter_message: `
    <div class="dread">
        A nervous energy buzzes within your mind.
        {{#interp-dread}}
            <div class="interp-dread">
                Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
            </div>
        {{/interp-dread}}
    </div>
    <div class="missing">
        Your notes are gone.
        {{#interp-missing}}
            <div class="interp-missing">
                Your effort to organize and understand everything Katya taught you over the years. If your notes are truly gone, it is a great setback.
                <br/>
                But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
                <br/>
            </div>
        {{/interp-missing}}
    </div>
    <div class="lost">
        You are alone in a grassy alcove in the forest.
        {{#interp-lost}}
            <div class="interp-lost">
                <br/>
                Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
                <br/>
                Your view of the horizon is occluded by the trees from in here. Set out, seeking <i>new vantages.</i>
            </div>
        {{/interp-lost}}
    </div>`,
    
},
{
    id: 'alcove, ending interpretation',
    enter_message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
    <br /><br />
    You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
    <br /><br />
    But your sense of purpose compels you. To go. To seek. To try to understand.`,
    transitions: {
        'alcove, entering the forest': 'enter the forest',
    },
    interpretations: {
        'alcove, beginning interpretation': { 'interpretation-active': false }
    }
},
{
    id: 'alcove, entering the forest',
    enter_message: `What lies within the forest, and beyond? What will it be like, out there?`,
    transitions: {'title': 'continue'}
},
{
    id: 'title',
    enter_message: `VENIENCE WORLD
    <br />
    <br />
    An Interactive Fiction by Daniel Spitz`,
    transitions: {'alone in the woods': 'continue'}
}
)

type PerceptID =
    'alcove, general' |
    'self, 1' |
    'alcove, envelope' |
    'sequence, 12';

type Percept = {
    id: PerceptID,
    prereqs?: readonly PerceptID[],
    message: MessageUpdateSpec
};

function percieve(world: PW, perc: PerceptID) {
    return update(world, {
        has_perceived: { [perc]: true },
        message: message_updater(Percepts.find(p => p.id === perc)!.message)
    });
}

type PerceptSpec = Partial<Record<PerceptID, ConsumeSpec>>;

// TODO: Have this take a proper spec as input, like make_transitioner
function make_perceiver(world: PW, percs: PerceptSpec, prepend_look: boolean=true) {
    return (parser: Parser) =>
        parser.split(
            entries(percs).map(([pid, cmd]) => () => {
                let perc = Percepts.find(p => p.id === pid)!;
                if (perc.prereqs !== undefined && perc.prereqs.some(p => !world.has_perceived[p])) {
                    parser.eliminate();
                }
                let cs: ConsumeSpec[] = [
                    ...cond(prepend_look, () => ({tokens: 'look', labels: {keyword: true}})),
                    cmd
                ];
                parser.consume({tokens: cs, used: world.has_perceived[pid]});
                parser.submit();
                return percieve(world, pid);
            })
        );
}

const Percepts: Percept[] = [
    // {
    //     id: 'alcove, general',
    //     message: `
    //     You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
    //     <br /><br />
    //     You see your desk and chair a few paces away, in the center of the alcove.
    //     <br /><br />
    //     On all sides you are surrounded by trees.`
    // },
    // {
    //     id: 'self, 1',
    //     message: `
    //     You are wearing a perfectly dignified pair of silk pajamas.`
    // },
    // {
    //     id: 'alcove, envelope',
    //     message: `
    //     You keep your research in this thick envelope.
    //     <br/><br/>
    //     You've been analyzing Katya's work for years now.
    //     <br/><br/>
    //     Your career is built in reverence of hers.`
    // },
    // {
    //     id: 'sequence, 12',
    //     message: `
    //     The twelfth sequence was the first purely numeric one in Katya's notes.
    //     <br/><br/>
    //     None of the greek symbols, none of the allusions to physical constants.
    //     <br/><br/>
    //     Just numbers. Eighty-seven of them.`,
    // },
];

interface VenienceWorld extends World, Venience {}

const initial_venience_world: VenienceWorld = {
    ...get_initial_world<VenienceWorld>(),
    node: 'start', //'grass, asking 2', //'bed, sleeping 1',
    has_perceived: {},
    alcove_interp: initial_alcove_interp,
    ...init_metaphors
    
};

const venience_world_spec = make_puffer_world_spec(initial_venience_world, PufferIndex);


export function new_venience_world() {
    return world_driver(venience_world_spec);
}


