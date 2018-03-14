import {
    ObserverMoment,
    Perception,
    PerceptionID
} from '../observer_moments';

import {
    wrap_handler,
    VenienceWorldCommandResult
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
    DisplayEltType
} from '../../parser';

let prologue_oms: () => ObserverMoment[] = () => [
    {
        id: 'bed, sleeping 1',
        enter_message: '',
        transitions: [
            [['awaken'], 'bed, awakening 1']]
    },
    {
        id: 'bed, awakening 1',
        enter_message: 'You awaken in your bed.',
        transitions: [
            [['sit', 'up'], 'bed, sitting up 1']]
    },
    {
        id: 'bed, sitting up 1',
        enter_message: `You push yourself upright, blankets falling to your waist. You squint and see only the palest light of dawn. Crickets chirp in the forest bordering your alcove.
        <br /><br />
        Your body still feels heavy with sleep.
        <br /><br />
        Perhaps you’ll doze until the sun rises properly.`,
        transitions: [
            [['lie', 'down'], 'bed, lying down 1']]
    },
    {
        id: 'bed, lying down 1',
        enter_message: `Yes, no reason to be up now.
        <br /><br />
        You slide back under the blankets. The autumn breeze cools your face.`,
        transitions: [
            [['sleep', 'until', 'sunrise'], 'bed, sleeping 2']]
    },
    {
        id: 'bed, sleeping 2',
        enter_message: `You dream of<br /><br />
        <i>calamity,</i><br /><br />
        a <i>shattered mirror,</i><br /><br />
        an <i>ice-covered mountain,</i><br /><br />
        <div class="interp">and <i>her voice.</i></div>`,
        transitions: [
            [['awaken'], 'bed, awakening 2']]
    },
    {
        id: 'bed, awakening 2',
        enter_message: `You awaken in your bed again.`,
        transitions: [
            [['sit', 'up'], 'bed, sitting up 2']]
    },
    {
        id: 'bed, sitting up 2',
        enter_message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            let look_options: PerceptionID[] = ['alcove, general', 'self, 1'];


            let cmd_options = []
            cmd_options.push(annotate(['look'], {
                enabled: !look_options.every(p => this.state.has_regarded[p]),
                display: DisplayEltType.keyword
            }));

            cmd_options.push(annotate(['approach'], {display: DisplayEltType.keyword}));

            let cmd = yield parser.consume_option(cmd_options);

            if (cmd === 'look') {
                return this.look_handler([
                    [['around'], 'alcove, general'],
                    [['at', 'myself'], 'self, 1']
                ]).call(this, parser);
            }

            yield parser.consume_filler(['the', 'desk']);
            yield parser.done();

            return this.transition_to('desk, sitting down');
        }),
        dest_oms: ['desk, sitting down']
        // transitions: [
        //     [['look', '&around'], 'bed, looking around']]
    },
    // {
    //     id: 'bed, looking around',
    //     enter_message: `You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
    //     <br /><br />
    //     You see your desk and chair a few paces away, in the center of the alcove.
    //     <br /><br />
    //     On all sides you are surrounded by trees.`,
    //     transitions: [
    //         [['sit', 'at', 'the', 'desk'], 'desk, sitting down']]
    // },
    {
        id: 'desk, sitting down',
        enter_message: `You pace across the grass and take your seat at the leather-backed study chair.
        <br /><br />
        On the desk is a large parchment envelope, bound in twine.`,
        transitions: [
            [['open', 'the', 'envelope'], 'desk, opening the envelope']]
    },
    {
        id: 'desk, opening the envelope',
        enter_message: `You undo the twine, leaving it in a loop on the desk.
        <br /><br />
        You unfold the envelope’s flap.
        <br /><br />
        It’s empty. But it shouldn’t be.`,
        transitions: [
            [['try', 'to', '*understand'], 'desk, trying to understand']]
    },
    {
        id: 'desk, trying to understand',
        enter_message: `A panic comes over you. Without your notes, how will you continue your work?
        <br /><br />
        How will you understand? How will you honor Katya’s memory?`,
        transitions: [
            [['*consider', 'the', 'sense of', '&panic'], 'desk, considering the sense of panic']]
    },
    {
        id: 'desk, considering the sense of panic',
        enter_message: `<div class="interp">
        Katya used to say that panic was like slipping down an ice-covered mountain face.
        <br /><br />
        It throws one particular path into relief: the path to the bottom.
        </div>`,
        transitions: [
            [['search', 'for', 'the', 'notes'], 'desk, searching for the notes']]
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
        transitions: [
            [['slip', 'further'], 'grass, slipping further']]
    },
    {
        id: 'grass, slipping further',
        enter_message: `Thoughts of dread, of a terrible, empty future, fill your mind.
        <br /><br />
        You curl up on the grass beneath you, holding yourself.`,
        handle_command: wrap_handler(function* (parser: CommandParser) {
            yield parser.consume_exact(['consider']);
            yield parser.consume_filler(['the']);
            yield parser.consume_filler(['sense', 'of']);
            yield parser.consume_option([
                set_enabled(['panic'], false),
                set_enabled(['dread'], true)
            ]);
            yield parser.done();
            return this.transition_to('grass, considering the sense of dread');
        }),
        dest_oms: ['grass, considering the sense of dread']

        // transitions: [
        //     [['*consider', 'the sense of', '&dread'], 'grass, considering the sense of dread']]
    },
    {
        id: 'grass, considering the sense of dread',
        enter_message: `<div class="interp">
        <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
        </div>`,
        transitions: [
            [['tell', 'me', 'what?'], 'grass, asking 1']]
    },
    {
        id: 'grass, asking 1',
        enter_message: `<div class="interp">
        <i>"That you are capable of a great deal of care, my dear.
        <br /><br />
        That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
        </div>`,
        transitions: [
            [['what', 'should', 'I', 'do?'], 'grass, asking 2']]
    },
    {
        id: 'grass, asking 2',
        enter_message: `<div class="interp"><i>
        "Judge the direction of gravity. Judge the slickness of the ice.
        <br /><br />
        "Survey the horizon.
        <br /><br />
        "And then, choose where to go."
        </i></div>`,
        transitions: [
            [['begin', '*interpretation'], 'alcove, beginning interpretation']]
    },
    {
        id: 'alcove, beginning interpretation',
        enter_message: `
        <div class="face-of-it">
        A nervous energy buzzes within your mind.
        <br />
        <br />
        </div>
        <div class="interp-alcove-1">
        Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
        <br />
        <br />
        </div>
        <div class="face-of-it">
        Your notes are gone.
        <br />
        <br />
        </div>
        <div class="interp-alcove-2">
        Your effort to organize and understand everything Katya taught you, over the years. If they are truly gone, it is a great setback.
        <br />
        <br />
        But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
        <br />
        <br />
        </div>
        <div class="face-of-it">
        You are alone in a grassy alcove in the forest.
        </div>
        <div class="interp-alcove-3">
        <br />
        Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
        <br /><br />
        Your view of the horizon is occluded by the trees, from in here. Set out, seeking <i>new vantages.</i>
        </div>`,
        handle_command: wrap_handler(function* (parser: CommandParser) {
            let display = DisplayEltType.keyword;
            yield parser.consume_option([
                annotate(['judge'], {enabled: true, display}),
                annotate(['survey'], {enabled: false, display})
            ]);
            yield parser.consume_option([
                set_enabled(['the', 'direction', 'of', 'gravity'], true),
                set_enabled(['the', 'slickness', 'of', 'the', 'ice'], false),
            ]);
            yield parser.done();
            return this.transition_to('alcove, interpreting 1');
        }),
        dest_oms: ['alcove, interpreting 1']

        // transitions: [
        //     [['*judge', '&the direction of gravity'], 'alcove, interpreting 1']]
    },
    {
        id: 'alcove, interpreting 1',
        enter_message: ``,
        handle_command: wrap_handler(function* (parser: CommandParser) {
            let display = DisplayEltType.keyword;
            yield parser.consume_option([
                annotate(['judge'], {enabled: true, display}),
                annotate(['survey'], {enabled: false, display})
            ]);
            yield parser.consume_option([
                set_enabled(['the', 'direction', 'of', 'gravity'], false),
                set_enabled(['the', 'slickness', 'of', 'the', 'ice'], true),
            ]);
            yield parser.done();
            return this.transition_to('alcove, interpreting 2');
        }),
        dest_oms: ['alcove, interpreting 2']
        // transitions: [
        //     [['*judge', '&the slickness of the ice'], 'alcove, interpreting 2']]
    },
    {
        id: 'alcove, interpreting 2',
        enter_message: ``,
        handle_command: wrap_handler(function* (parser: CommandParser) {
            let display = DisplayEltType.keyword;
            yield parser.consume_option([
                annotate(['judge'], {enabled: false, display}),
                annotate(['survey'], {enabled: true, display})
            ]);
            yield parser.consume_exact(['the', 'horizon'], DisplayEltType.option);

            // yield parser.consume_option([
            //     set_enabled(['the', 'direction', 'of', 'gravity'], false),
            //     set_enabled(['the', 'slickness', 'of', 'the', 'ice'], true),
            // ]);
            yield parser.done();
            return this.transition_to('alcove, interpreting 3');
        }),
        dest_oms: ['alcove, interpreting 3']
        // transitions: [
        //     [['*survey', '&the horizon'], 'alcove, interpreting 3']]
    },
    {
        id: 'alcove, interpreting 3',
        enter_message: ``,
        transitions: [
            [['end', '*interpretation'], 'alcove, ending interpretation']]
    },
    {
        id: 'alcove, ending interpretation',
        enter_message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
        <br /><br />
        You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
        <br /><br />
        But your sense of purpose compels you. To go. To seek. To try to understand.`,
        transitions: [
            [['enter', 'the', 'forest'], 'alcove, entering the forest']]
    },
    {
        id: 'alcove, entering the forest',
        enter_message: `What lies within the forest, and beyond? What will it be like, out there?`,
        transitions: [[['continue'], 'title']]
    },
    {
        id: 'title',
        enter_message: `VENIENCE WORLD
        <br />
        <br />
        An Interactive Fiction by Daniel Spitz`,
        transitions: [[['continue'], 'alone in the woods']]
    }
];

let prologue_perceptions: () => Perception[] = () => [
    {
        id: 'alcove, general',
        content: `
        You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
        <br /><br />
        You see your desk and chair a few paces away, in the center of the alcove.
        <br /><br />
        On all sides you are surrounded by trees.`
    },
    {
        id: 'self, 1',
        content: `
        You are wearing a perfectly dignified pair of silk pajamas.`
    }
];

export default {
    observer_moments: prologue_oms,
    perceptions: prologue_perceptions
};