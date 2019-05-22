import { narrative_fsa_builder } from '../../narrative_fsa';
import { make_puffer_world_spec, Puffer, PufferAndWorld } from '../../puffer';
import { MessageUpdateSpec, message_updater } from '../../message';
import { update, appender_uniq } from '../../utils';
import { Parser, ParserThread } from '../../parser';
import {split_tokens} from '../../text_tools';
import {World, get_initial_world, world_driver, InterpretationOp} from '../../world';

type ObserverMomentID = string;

interface Venience {
    node: ObserverMomentID;
    has_perceived: Record<PerceptID, boolean>,
    alcove_interp_step: number
}

type PW = PufferAndWorld<Venience>;

let {
    make_transitioner,
    transition_to,
    make_node
} = narrative_fsa_builder<Venience, 'node', ObserverMomentID>('node');

const ObserverMomentIndex: Puffer<Venience>[] = [];

type NodeSpec = Parameters<typeof make_node>[0]

function ObserverMoments(...spec: NodeSpec[]) {
    ObserverMomentIndex.push(...spec.map(make_node));
}

ObserverMoments(
{
    id: 'bed, sleeping 1',
    enter_message: '',
    transitions: {'awaken': 'bed, awakening 1'}
},
{
    id: 'bed, awakening 1',
    enter_message: 'You awaken in your bed.',
    transitions: {'sit_up': 'bed, sitting up 1'},
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
    transitions: {'try_to *remember': 'bed, trying to remember 1'}
},
{
    id: 'bed, trying to remember 1',
    enter_message: `
    Something to do with Katya's twelfth sequence.`,
    transitions: {'remember the_twelfth_sequence': 'bed, trying to remember 2'}
},
{
    id: 'bed, trying to remember 2',
    enter_message: `
    The twelfth sequence was the first purely numeric one in Katya's notes.
    <br/><br/>
    None of the greek symbols, none of the allusions to physical constants.
    <br/><br/>
    Just numbers. Eighty-seven of them.`,
    transitions: {'remember the_numbers': 'bed, trying to remember 3'}
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
    transitions: {'20 699 319': 'bed, trying to remember 4'}
},
{
    id: 'bed, trying to remember 4',
    enter_message: `
    Your favorite bit is positions fifty-one through fifty-three:`,
    transitions: {'936 5223 2717': 'bed, trying to remember 5'}
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
    transitions: {'remember Katya': 'bed, trying to remember 6'}
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
    transitions: {'lie_down': 'bed, lying down 1'}
},
{
    id: 'bed, lying down 1',
    enter_message: `
    Yes, no reason to be up now.
    <br/><br/>
    You can update your notes first thing tomorrow.
    <br/><br/>
    You slide back under the blankets. The pre-spring breeze cools your face.`,
    transitions: {'sleep until_sunrise': 'bed, sleeping 2'},
    interpretations: {
        'bed, trying to remember 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 2': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 3': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 4': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 5': [{kind: 'Add', label: 'forgotten'}]
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
    transitions: {'awaken': 'bed, awakening 2'}
},
{
    id: 'bed, awakening 2',
    enter_message: `You awaken in your bed again.`,
    transitions: {'sit_up': 'bed, sitting up 2'},
    interpretations: {
        'bed, sleeping 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, awakening 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, sitting up 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 2': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 3': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 4': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 5': [{kind: 'Add', label: 'forgotten'}],
        'bed, trying to remember 6': [{kind: 'Add', label: 'forgotten'}],
        'bed, lying down 1': [{kind: 'Add', label: 'forgotten'}],
        'bed, sleeping 2': [{kind: 'Add', label: 'forgotten'}]
    }
});

function gate<Ret>(cond: () => boolean, t: ParserThread<Ret>): ParserThread<Ret> {
    return p => {
        if (!cond()) {
            p.eliminate();
        }
        return t(p);
    }
}


ObserverMoments(
{
    id: 'bed, sitting up 2',
    enter_message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
    handle_command: (world, parser) => {
        let look_consumer = make_perceiver(world, {
            '&around': 'alcove, general',
            '&at_myself': 'self, 1'
        });

        let other_consumer = (p: Parser) => {
            let can_appproach = ['alcove, general', 'self, 1'].every(p => world.has_perceived[p]);
            p.consume(`${can_appproach ? '' : '~'}*approach the_desk`);
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
            '&at_the_envelope': 'alcove, envelope',
            '&around': 'alcove, general',
            '&at_myself': 'self, 1'
        });

        let open_consumer = gate(
            () => world.has_perceived['alcove, envelope'],
            make_transitioner(world, {
                '*open the_envelope': 'desk, opening the envelope'
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
    transitions: {'what?': 'desk, reacting'}
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
        // 'try_to ~*remember': null,
        'try_to *understand': 'desk, trying to understand 1'
    }
},
{
    id: 'desk, trying to understand 1',
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
        '*consider the_sense_of &panic': 'desk, considering the sense of panic'
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
        'search_for the_notes': 'desk, searching for the notes'
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
        'slip further': 'grass, slipping further'
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
            () => parser.consume('~panic'),
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
    transitions: {'tell_me_what?': 'grass, asking 1'}
},
{
    id: 'grass, asking 1',
    enter_message: `<div class="interp">
    <i>"That you are capable of a great deal of care, my dear.
    <br /><br />
    That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
    </div>`,
    transitions: {'what_should_I_do?': 'grass, asking 2'}
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
    transitions: {'*begin_interpretation': 'alcove, beginning interpretation'}
},
);

ObserverMoments(
{
    id: 'alcove, beginning interpretation',
    pre: world => update(world, { local_interpretations: {
        'interpretation-block': false,
        'interpretation-active': false
    }}),
    enter_message: `
    <div class="face-of-it">
    A nervous energy buzzes within your mind.
    <br/><br/>
    </div>
    {{#interp-alcove-1-enabled}}
    <div class="interp-alcove-1">
    Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
    <br/><br/>
    </div>
    {{/interp-alcove-1-enabled}}
    <div class="face-of-it">
    Your notes are gone.
    <br/><br/>
    </div>
    {{#interp-alcove-2-enabled}}
    <div class="interp-alcove-2">
    Your effort to organize and understand everything Katya taught you over the years. If your notes are truly gone, it is a great setback.
    <br/><br/>
    But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
    <br/><br/>
    </div>
    {{/interp-alcove-2-enabled}}
    <div class="face-of-it">
    You are alone in a grassy alcove in the forest.
    </div>
    {{#interp-alcove-3-enabled}}
    <div class="interp-alcove-3">
    <br/>
    Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
    <br/><br/>
    Your view of the horizon is occluded by the trees from in here. Set out, seeking <i>new vantages.</i>
    </div>
    {{/interp-alcove-3-enabled}}`,
    handle_command: (world, parser) => {
        let next_interp = () => update(world, {
            alcove_interp_step: _ => _ + 1
        });

        let step = world.alcove_interp_step;

        let judge_consumer = () => {
            let locked = step < 2 ? '' : '~';
            parser.consume(`${locked}*judge`);

            parser.split([
                () => parser.consume(`${step === 0 ? '' : '~'}&the_direction_of_gravity`),
                () => parser.consume(`${step === 1 ? '' : '~'}&the_slickness_of_the_ice`)
            ]);

            parser.submit();
            return next_interp();
        };

        let survey_consumer = () => {
            let locked = step === 2 ? '' : '~';
            parser.consume(`${locked}*survey the_horizon`);
            parser.submit();
            return next_interp();
        };

        let end_consumer = gate(
            () => step === 3,
            make_transitioner(world, {
                '*end_interpretation': 'alcove, ending interpretation'
            }));

        return parser.split([
            judge_consumer,
            survey_consumer,
            end_consumer]);
    },
    // dest_oms: ['alcove, ending interpretation'],

    interpret_history: (world_2, world_1) => {
        let hist_om = world_1.node;
        let result: InterpretationOp[] = [];
        if (hist_om === 'alcove, beginning interpretation') {
            let hist_step = world_1.alcove_interp_step;    
            if (hist_step=== 0) {
                let step = world_2.alcove_interp_step;
                if (step > 0) {
                    result.push({kind: 'Add', label: `interp-alcove-${step}-enabled`});
                } else {
                    result.push({kind: 'Add', label: 'interpretation-block'});
                    result.push({kind: 'Add', label: 'interpretation-active'});
                }
            }
        }
        return result;
    }
},
)

type PerceptID = string;

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

type PerceptSpec = Record<string, PerceptID>;

// TODO: Have this take a proper spec as input, like make_transitioner
function make_perceiver(world: PW, percs: PerceptSpec, prepend_look: boolean=true) {
    return (parser: Parser) =>
        parser.split(
            Object.entries(percs).map(([cmd, pid]) => () => {
                let perc = Percepts.find(p => p.id === pid)!;
                if (perc.prereqs !== undefined && perc.prereqs.some(p => !world.has_perceived[p])) {
                    parser.eliminate();
                }
                parser.consume(`${prepend_look ? '*look ' : ''}${world.has_perceived[pid] ? '~' : ''}${cmd}`);
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
    }
];

interface VenienceWorld extends World, Venience {}

const initial_venience_world: VenienceWorld = {
    ...get_initial_world<VenienceWorld>(),
    node: 'bed, sleeping 1',
    has_perceived: {},
    alcove_interp_step: 0,
    local_interpretations: { forgotten: false }
};

let Meta: Puffer<Venience> = {
    pre: world => update(world, {
        local_interpretations: { forgotten: false }
    })
};

const venience_world_spec = make_puffer_world_spec(initial_venience_world, [Meta, ...ObserverMomentIndex]);


export function new_venience_world() {
    return world_driver(venience_world_spec);
}


