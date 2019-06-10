import { MessageUpdateSpec, message_updater } from '../../message';
import { narrative_fsa_builder } from '../../narrative_fsa';
import { Parser, ParserThread, gate, ConsumeSpec } from '../../parser';
import { make_puffer_world_spec, Puffer, PufferAndWorld } from '../../puffer';
import { update, Updater, entries, cond } from '../../utils';
import { get_initial_world, World, world_driver } from '../../world';
import { LocalInterpretations, find_historical, self_interpretation } from '../../interpretation';

/*
    TODO
        - Convert various expositive bits to "consider" or "remember" commands, so they can be repeated.
        - use separate state machines for the various flowy bits
            - e.g. first waking up, you awaken, sit up, try to remember, numbers,
            lie down, etc.
        - fix up the parser dsl to support arb token labels
*/


type ObserverMomentID =
    'bed' |
    'desk, sitting down' |
    'desk, opening the envelope' |
    'desk, reacting' |
    'desk, trying to understand 1' |
    'desk, trying to understand 2' |
    'desk, considering the sense of panic' |
    'desk, searching for the notes' |
    'grass, slipping further' |
    'grass, considering the sense of dread' |
    'grass, asking 1' |
    'grass, asking 2' |
    'alcove, beginning interpretation' |
    'alcove, ending interpretation' |
    'alcove, entering the forest' |
    'title' |
    'alone in the woods'
    ;

interface Venience {
    node: ObserverMomentID;
    has_perceived: Partial<Record<PerceptID, boolean>>;
    alcove_interp: AlcoveInterp;
    bed_scene_state: BedSceneID;
    current_interpretation: number | null;
    has_acquired: Record<AbstractionID, boolean>;
}

type AbstractAction = {
    name: string, // e.g. gravity
    get_wrong_msg: (facet_phrase: string) => MessageUpdateSpec, // e.g. judging the direction of gravity
    get_cmd: (facet_phrase: ConsumeSpec) => ConsumeSpec
}

type AbstractionID = string;
type Abstraction = {
    name: AbstractionID, // e.g. "the Mountain"
    phrase: ConsumeSpec,
    actions: AbstractAction[]
}

const AbstractionIndex: readonly Abstraction[] = [
{
    name: 'the Mountain',
    phrase: 'the_Mountain',
    actions: [
    {
        name: 'gravity',
        get_cmd: (facet) => ['judge the_direction_of_gravity for', facet],
        get_wrong_msg: (facet) => `You struggle to connect the direction of gravity to ${facet}.`
    },
    {
        name: 'ice',
        get_cmd: (facet) => ['judge the_slickness_of_the_ice for', facet],
        get_wrong_msg: (facet) => `You struggle to connect the slickness of the ice to ${facet}.`
    },
    {
        name: 'horizon',
        get_cmd: (facet) => ['survey the_horizon from', facet],
        get_wrong_msg: (facet) => `You struggle to connect the horizon to ${facet}.`
    }]
}
];

// FACETS
type FacetID = string;

type FacetSpec = {
    id: FacetID,
    name: string, // e.g. "the sense of dread"
    phrase: ConsumeSpec,
    can_interpret: (current_world: PW, interpretted_world: PW) => boolean,
    used: (action: [AbstractionID, string], world: PW) => boolean,
    interpret: (action: [AbstractionID, string], current_world: PW, interpretted_world: PW) => PW | false
};

function make_facet(spec: FacetSpec): Puffer<Venience> {
    return {
        handle_command: {
            0: (world, parser) => {
                if (world.current_interpretation === null) {
                    return parser.eliminate();
                }

                let interpretted_world = find_historical(world, w => w.index === world.current_interpretation)!;

                if (!spec.can_interpret(world, interpretted_world)){
                    parser.eliminate();
                }

                for (let [k, on] of Object.entries(world.has_acquired)) {
                    if (on) {
                        const abs = AbstractionIndex.find((a => a.name === k));
                        if (abs === undefined) {
                            throw Error('Invalid abstraction name: '+k);
                        }
                        
                        let threads: ParserThread<PW>[] = [];

                        for (let action of abs.actions) {
                            threads.push(() => {
                                let used = spec.used([abs.name, action.name], world);
                                parser.consume({
                                    tokens: ['invoking', abs.phrase],
                                    used
                                });
                                parser.consume(action.get_cmd(spec.phrase));
                                parser.submit();

                                let result = spec.interpret([abs.name, action.name], world, interpretted_world);
                                if (result === false) {
                                    return update(world, {
                                        message: message_updater(action.get_wrong_msg(spec.name))
                                    });
                                }
                                return result;
                            })
                        }

                        return parser.split(threads);
                    }
                }
                return world;
            }
        }
    }
}

let InterpPuffer: Puffer<Venience> = {
    handle_command: {
        2: (world, parser) => {
            if (world.current_interpretation === null) {
                parser.consume('begin_interpretation');
                parser.submit();

                let index = world.previous && world.previous.index;
                let new_interps: Updater<PW> = {};
                if (index !== null) {
                    new_interps = { interpretations: {
                        [index]: {
                            'interpretation-block': true,
                            'interpretation-active': true
                        }
                    }};
                }
                return update(world,
                    { current_interpretation: index },
                    new_interps
                );
            } else {
                parser.consume('end_interpretation');
                parser.submit();

                return update(world, {
                    current_interpretation: null,
                    interpretations: {
                        [world.current_interpretation]: {'interpretation-active': false}
                    }
                });
            }
        }
    }
};


type PW = PufferAndWorld<Venience>;

let transition_to = (w: PW, node: ObserverMomentID) => update(w, { node });

let {
    make_transitioner,
    make_state,
    apply_state,
    apply_states
} = narrative_fsa_builder<Venience, ObserverMomentID>(w => w.node, transition_to);

const ObserverMomentIndex: Puffer<Venience>[] = [];

let ObserverMoments = apply_states()(p => { ObserverMomentIndex.push(p) });


type BedSceneID =
    'bed, sleeping 1' |
    'bed, awakening 1' |
    'bed, sitting up 1' |
    'bed, trying to remember 1' |
    'bed, trying to remember 2' |
    'bed, trying to remember 3' |
    'bed, trying to remember 4' |
    'bed, trying to remember 5' |
    'bed, trying to remember 6' |
    'bed, lying down 1' |
    'bed, sleeping 2' |
    'bed, awakening 2' |
    'bed, sitting up 2' |
    'done';

let bed_scene = narrative_fsa_builder<Venience, BedSceneID>(
    (w) => w.bed_scene_state,
    (w, id) => update(w, { bed_scene_state: id })
);

let BedSceneMomentIndex: Puffer<Venience>[] = [];
let BedSceneMoments = bed_scene.apply_states()(p => {
    let result = make_state({
        id: 'bed',
        ...p
    });
    ObserverMomentIndex.push(result);
});


BedSceneMoments(
{
    id: 'bed, sleeping 1',
    enter_message: '',
    transitions: {'bed, awakening 1': 'awaken'}
},
{
    id: 'bed, awakening 1',
    enter_message: 'You awaken in your bed.',
    transitions: {'bed, sitting up 1': 'sit_up'},
},
{
    id: 'bed, sitting up 1',
    enter_message: `You push yourself upright, blankets falling to your waist.
    You squint and see only the palest light of dawn.
    Crickets chirp in the forest bordering your alcove.
    <br /><br />
    Your body still feels heavy with sleep.
    <br /><br />
    Something important nags quietly at you from the back of your mind...`,
    transitions: {'bed, trying to remember 1': 'try_to_remember'}
},
{
    id: 'bed, trying to remember 1',
    enter_message: `
    Something to do with Katya's twelfth sequence.`,
    transitions: {'bed, trying to remember 2': 'remember the_twelfth_sequence'}
},
{
    id: 'bed, trying to remember 2',
    enter_message: `
    The twelfth sequence was the first purely numeric one in Katya's notes.
    <br/><br/>
    None of the greek symbols, none of the allusions to physical constants.
    <br/><br/>
    Just numbers. Eighty-seven of them.`,
    transitions: {'bed, trying to remember 3': 'remember the_numbers'}
},
{
    id: 'bed, trying to remember 3',
    enter_message: `
    For years, the meaning of this sequence has eluded you.
    <br/><br/>
    It begins:
    <br/><br/>
    57 44 35
    <br/><br/>
    and continues:`,
    transitions: {'bed, trying to remember 4': '20 699 319'}
},
{
    id: 'bed, trying to remember 4',
    enter_message: `
    Your favorite bit is positions fifty-one through fifty-three:`,
    transitions: {'bed, trying to remember 5': '936 5223 2717'}
},
{
    id: 'bed, trying to remember 5',
    enter_message: `
    Such strange poetry in these numbers.
    <br/><br/>
    You know they must mean <i>something.</i>
    <br/><br/>
    Katya was brilliant, after all.
    <br/><br/>
    Sometimes frighteningly so.`,
    transitions: {'bed, trying to remember 6': 'remember Katya'}
},
{
    id: 'bed, trying to remember 6',
    enter_message: `
    She was your advisor.
    <br/><br/>
    But she treated you like family.
    <br/><br/>
    You miss her.
    <br/><br/>
    <div class="interp">
    <i>"Go back to sleep, my dear.
    <br/><br/>
    Number Twelve can wait til morning,"</i> you imagine she'd say.
    </div>`,
    transitions: {'bed, lying down 1': 'lie_down'}
},
{
    id: 'bed, lying down 1',
    enter_message: `
    Yes, no reason to be up now.
    <br/><br/>
    You can update your notes first thing tomorrow.
    <br/><br/>
    You slide back under the blankets. The pre-spring breeze cools your face.`,
    transitions: {'bed, sleeping 2': 'sleep until_sunrise'},
    interpretations: {
        'bed, trying to remember 1': { forgotten: true },
        'bed, trying to remember 2': { forgotten: true },
        'bed, trying to remember 3': { forgotten: true },
        'bed, trying to remember 4': { forgotten: true },
        'bed, trying to remember 5': { forgotten: true }
    }
},
{
    id: 'bed, sleeping 2',
    enter_message: `You dream of<br /><br />
    <div class="alien-interp"><i>
    calamity
    <br/><br/>
    </i></div>
    <div class="interp">
    a <i>shattered mirror</i>
    <br/><br/>
    an <i>ice-covered mountain</i>
    <br/><br/>
    and <i>her voice.</i>
    </div>`,
    transitions: {'bed, awakening 2': 'awaken'}
},
{
    id: 'bed, awakening 2',
    enter_message: `You awaken in your bed again.`,
    transitions: {'done': 'sit_up'}, //{'bed, sitting up 2': 'sit_up'},
    exit_message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
    interpretations: {
        'bed, sleeping 1': { forgotten: true },
        'bed, awakening 1': { forgotten: true },
        'bed, sitting up 1': { forgotten: true },
        'bed, trying to remember 1': { forgotten: true },
        'bed, trying to remember 2': { forgotten: true },
        'bed, trying to remember 3': { forgotten: true },
        'bed, trying to remember 4': { forgotten: true },
        'bed, trying to remember 5': { forgotten: true },
        'bed, trying to remember 6': { forgotten: true },
        'bed, lying down 1': { forgotten: true },
        'bed, sleeping 2': { forgotten: true }
    }
},
);

ObserverMoments(
{
    id: 'bed', //'bed, sitting up 2',
    handle_command: (world, parser) => {
        if (world.bed_scene_state !== 'done') {
            parser.eliminate();
        }

        let look_consumer = make_perceiver(world, {
            'alcove, general': '&around',
            'self, 1': '&at_myself'
        });

        let other_consumer = (p: Parser) => {
            let can_appproach = ['alcove, general', 'self, 1'].every(p => world.has_perceived[p]);
            p.consume(`${can_appproach ? '' : '^'}*approach the_desk`);
            p.submit();
            return transition_to(world, 'desk, sitting down');
        };

        return parser.split([look_consumer, other_consumer]);
    },
    // dest_oms: ['desk, sitting down']
},
{
    id: 'desk, sitting down',
    enter_message: `You pace across the grass and take your seat at the leather-backed study chair.
    <br /><br />
    On the desk is a large parchment envelope, bound in twine.`,
    handle_command: (world, parser) => {
        let look_consumer = make_perceiver(world, {
            'alcove, envelope': '&at_the_envelope',
            'alcove, general': '&around',
            'self, 1': '&at_myself'
        });

        let open_consumer = gate(
            () => world.has_perceived['alcove, envelope'] || false,
            make_transitioner(world, {
                'desk, opening the envelope': '*open the_envelope'
            }));

        
        return parser.split([
            look_consumer,
            open_consumer
        ]);
    },
    // dest_oms: ['desk, sitting down', 'desk, opening the envelope']
},
{
    id: 'desk, opening the envelope',
    enter_message: `You undo the twine, leaving it in a loop on the desk.
    <br /><br />
    You unfold the envelope’s flap.
    <br /><br />
    It’s empty.`,
    transitions: {'desk, reacting': 'what?'}
},
{
    id: 'desk, reacting',
    enter_message: `
    Empty?
    <br/><br/>
    No, it can't be empty.
    <br/><br/>
    You closed it up last night, bound it in twine and went to sleep.
    <br/><br/>
    <i>Empty?</i>`,
    transitions: {
        // 'try_to ^*remember': null,
        'desk, trying to understand 1': 'try_to *understand'
    }
},
{
    id: 'desk, trying to understand 1',
    enter: (world) => update(world, {
        message: message_updater(`
        Years of work.
        <br/><br/>
        Sequence Number Twelve.
        </br><br/>
        How does it go?`)}),
    enter_message: `
    Years of work.
    <br/><br/>
    Sequence Number Twelve.
    </br><br/>
    How does it go?`,
    handle_command: (world, parser) => {
        const r = [
            [9735, 4130, 3261],
            [3538, 8177, 3424],
            [6930, 3134, 2822]
        ];

        for (let opts of r) {
            parser.split(opts.map(o => () => parser.consume(`${o}?`)))
        }
        parser.submit();

        return transition_to(world, 'desk, trying to understand 2');
    },
    // dest_oms: ['desk, trying to understand 2']

},
{
    id: 'desk, trying to understand 2',
    enter_message: `        
    A panic comes over you. Without your notes, how will you continue your work?
    <br /><br />
    How will you possibly understand? How will you honor Katya’s memory?`,
    transitions: {
        'desk, considering the sense of panic': '*consider the_sense_of &panic'
    }
},
{
    id: 'desk, considering the sense of panic',
    enter_message: `<div class="interp">
    Katya used to say that panic was like slipping down an ice-covered mountain face.
    <br /><br />
    It throws one particular path into relief: the path to the bottom.
    </div>`,
    transitions: {
        'desk, searching for the notes': 'search_for the_notes'
    }
},
{
    id: 'desk, searching for the notes',
    enter_message: `You look in the envelope again.
    <br /><br />
    You look in the grass under the desk, under the chair.
    <br /><br />
    You strip your bed, finding nothing within the folds.
    <br /><br />
    <div class="interp">
    You can feel yourself slipping down an icy hill.
    </div>`,
    transitions: {
        'grass, slipping further': 'slip further'
    }
},
{
    id: 'grass, slipping further',
    enter_message: `Thoughts of dread, of a terrible, empty future, fill your mind.
    <br /><br />
    You curl up on the grass beneath you, holding yourself.`,
    handle_command: (world, parser) => {
        parser.consume('*consider the_sense_of');
        parser.split([
            () => parser.consume('^panic'),
            () => parser.consume('&dread')
        ]);
        parser.submit();
        return transition_to(world, 'grass, considering the sense of dread');
    },
    // dest_oms: ['grass, considering the sense of dread']
},
{
    id: 'grass, considering the sense of dread',
    enter_message: `<div class="interp">
    <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
    </div>`,
    transitions: {'grass, asking 1': 'tell_me_what?'}
},
{
    id: 'grass, asking 1',
    enter_message: `<div class="interp">
    <i>"That you are capable of a great deal of care, my dear.
    <br /><br />
    That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
    </div>`,
    transitions: {'grass, asking 2': 'what_should_I_do?'}
},
{
    id: 'grass, asking 2',
    enter_message: `<div class="interp"><i>
    "Judge the direction of gravity. Judge the slickness of the ice.
    <br /><br />
    Survey the horizon.
    <br /><br />
    And then, choose where to go."
    </i></div>`,
    transitions: {'alcove, beginning interpretation': '*begin_interpretation'}
},
);

type AlcoveInterp = {
    gravity: boolean,
    slickness: boolean,
    horizon: boolean
}

const initial_alcove_interp: AlcoveInterp = {
    gravity: false,
    slickness: false,
    horizon: false
}

function find_box(world: PufferAndWorld<Venience>) {
    return find_historical(world, (w) => 
        w.node === 'alcove, beginning interpretation' &&
        Object.entries(w.alcove_interp).every(([k, v]) => !v)
    );
}

let dread_facet = make_facet({
    id: 'dread',
    name: 'the sense of dread',
    phrase: 'the_sense_of_dread',
    can_interpret: (current_world, interp_world) =>
        interp_world.node === 'alcove, beginning interpretation',

    used: ([abs, action], world) => world.alcove_interp[action],
    
    interpret: ([abstraction, action], world, interp_world) => {
        if (action === 'gravity') {
            let used = world.alcove_interp.gravity;
            //correct
            if (used) {
                return update(world, {
                    interpretations: { [interp_world.index]: {
                        [`interp-alcove-gravity-blink`]: Symbol('Once')
                    }}
                });
            } else {
                return update(world, {
                    alcove_interp: { gravity: true }
                });
            }
        } else {
            return false;
        }
    }
});
ObserverMomentIndex.push(dread_facet);

ObserverMoments(
{
    id: 'alcove, beginning interpretation',
    enter_message: `
    <div class="face-of-it-1">
    A nervous energy buzzes within your mind.
    </div>
    <br/>
    {{#interp-alcove-gravity-enabled}}
    <div class="interp-alcove-gravity">
    Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
    <br/><br/>
    </div>
    {{/interp-alcove-gravity-enabled}}
    <div class="face-of-it-2">
    Your notes are gone.
    </div>
    <br/>
    {{#interp-alcove-slickness-enabled}}
    <div class="interp-alcove-slickness">
    Your effort to organize and understand everything Katya taught you over the years. If your notes are truly gone, it is a great setback.
    <br/><br/>
    But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
    <br/><br/>
    </div>
    {{/interp-alcove-slickness-enabled}}
    <div class="face-of-it-3">
    You are alone in a grassy alcove in the forest.
    </div>
    {{#interp-alcove-horizon-enabled}}
    <div class="interp-alcove-horizon">
    <br/>
    Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
    <br/><br/>
    Your view of the horizon is occluded by the trees from in here. Set out, seeking <i>new vantages.</i>
    </div>
    {{/interp-alcove-horizon-enabled}}`,
    handle_command: (world, parser) => {
        let box_index = find_box(world)!.index;

        let interp_consumer = () => {
            let stuff = {
                gravity: '*judge the_direction_of_gravity',
                slickness: '*judge the_slickness_of_the_ice',
                horizon: '*survey the_horizon'
            };

            return parser.split(Object.entries(stuff).map(([k, cmd]) => () => {
                let used = world.alcove_interp[k] ? '~' : '';
                parser.consume(`${used}${cmd}`);
                parser.submit();

                if (used) {
                    return update(world, {
                        interpretations: { [box_index]: {
                            [`interp-alcove-${k}-blink`]: Symbol('Once')
                        }}
                    });
                } else {
                    return update(world, {
                        alcove_interp: { [k]: true },
                        
                    });
                }
            }))
        };

        let end_consumer = gate(
            () => Object.entries(world.alcove_interp).every(([k, v]) => v),
            make_transitioner(world, {
                'alcove, ending interpretation': '*end_interpretation'
            }));

        return parser.split([
            interp_consumer,
            end_consumer
        ]);
    },
    // dest_oms: ['alcove, ending interpretation'],
    here: (world) => {
        let box = find_box(world)!;
        if (world.index === box.index) {
            return update(world, { interpretations: {
                [world.index]: {
                    'interpretation-block': true,
                    'interpretation-active': true
                }
            }});
        }
        return update(world, {
            interpretations: { [box.index]: Object.fromEntries(
                ['gravity', 'slickness', 'horizon'].map(k =>
                    [`interp-alcove-${k}-enabled`, world.alcove_interp[k]])
            )}
        });
    }
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
    {
        id: 'alcove, general',
        message: `
        You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
        <br /><br />
        You see your desk and chair a few paces away, in the center of the alcove.
        <br /><br />
        On all sides you are surrounded by trees.`
    },
    {
        id: 'self, 1',
        message: `
        You are wearing a perfectly dignified pair of silk pajamas.`
    },
    {
        id: 'alcove, envelope',
        message: `
        You keep your research in this thick envelope.
        <br/><br/>
        You've been analyzing Katya's work for years now.
        <br/><br/>
        Your career is built in reverence of hers.`
    },
    {
        id: 'sequence, 12',
        message: `
        The twelfth sequence was the first purely numeric one in Katya's notes.
        <br/><br/>
        None of the greek symbols, none of the allusions to physical constants.
        <br/><br/>
        Just numbers. Eighty-seven of them.`,
    },
];

interface VenienceWorld extends World, Venience {}

const initial_venience_world: VenienceWorld = {
    ...get_initial_world<VenienceWorld>(),
    node: 'bed', //'grass, asking 2', //'bed, sleeping 1',
    has_perceived: {},
    alcove_interp: initial_alcove_interp,
    bed_scene_state: 'bed, sleeping 1',
    current_interpretation: null,
    has_acquired: { 'the Mountain': false }
};

const venience_world_spec = make_puffer_world_spec(initial_venience_world, [InterpPuffer, ...ObserverMomentIndex]);


export function new_venience_world() {
    return world_driver(venience_world_spec);
}


