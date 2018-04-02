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
            [['sit', 'up'], 'bed, sitting up 1']],
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
        transitions: [
            [['try', 'to', '*remember'], 'bed, trying to remember 1']]
    },
    {
        id: 'bed, trying to remember 1',
        enter_message: `
        Something to do with Katya's twelfth sequence.`,
        transitions: [
            [['remember', 'the', 'twelfth', 'sequence'], 'bed, trying to remember 2']]
    },
    {
        id: 'bed, trying to remember 2',
        enter_message: `
        The twelfth sequence was the first purely numeric one in Katya's notes.
        <br/><br/>
        None of the greek symbols, none of the allusions to physical constants.
        <br/><br/>
        Just numbers. Eighty-seven of them.`,
        transitions: [
            [['remember', 'the', 'numbers'], 'bed, trying to remember 3']]
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
        transitions: [
            [['20', '699', '319'], 'bed, trying to remember 4']]
    },
    {
        id: 'bed, trying to remember 4',
        enter_message: `
        Your favorite bit is positions fifty-one through fifty-three:`,
        transitions: [
            [['936', '5223', '2717'], 'bed, trying to remember 5']]
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
        transitions: [
            [['remember', 'Katya'], 'bed, trying to remember 6']]
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
        transitions: [
            [['lie', 'down'], 'bed, lying down 1']]
    },
    {
        id: 'bed, lying down 1',
        enter_message: `
        Yes, no reason to be up now.
        <br/><br/>
        You can update your notes first thing tomorrow.
        <br/><br/>
        You slide back under the blankets. The pre-spring breeze cools your face.`,
        transitions: [
            [['sleep', 'until', 'sunrise'], 'bed, sleeping 2']],
        interpretations: {
            'bed, trying to remember 1': [{'add': 'forgotten'}],
            'bed, trying to remember 2': [{'add': 'forgotten'}],
            'bed, trying to remember 3': [{'add': 'forgotten'}],
            'bed, trying to remember 4': [{'add': 'forgotten'}],
            'bed, trying to remember 5': [{'add': 'forgotten'}]
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
        transitions: [
            [['awaken'], 'bed, awakening 2']]
    },
    {
        id: 'bed, awakening 2',
        enter_message: `You awaken in your bed again.`,
        transitions: [
            [['sit', 'up'], 'bed, sitting up 2']],
        interpretations: {
            'bed, sleeping 1': [{'add': 'forgotten'}],
            'bed, awakening 1': [{'add': 'forgotten'}],
            'bed, sitting up 1': [{'add': 'forgotten'}],
            'bed, trying to remember 1': [{'add': 'forgotten'}],
            'bed, trying to remember 2': [{'add': 'forgotten'}],
            'bed, trying to remember 3': [{'add': 'forgotten'}],
            'bed, trying to remember 4': [{'add': 'forgotten'}],
            'bed, trying to remember 5': [{'add': 'forgotten'}],
            'bed, trying to remember 6': [{'add': 'forgotten'}],
            'bed, lying down 1': [{'add': 'forgotten'}],
            'bed, sleeping 2': [{'add': 'forgotten'}]
        }
    },
    {
        id: 'bed, sitting up 2',
        enter_message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            let look_consumer = this.make_look_consumer([
                [['around'], 'alcove, general'],
                [['at', 'myself'], 'self, 1']
            ])

            let other_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['approach'], {
                    enabled: ['alcove, general', 'self, 1'].every(p => this.state.has_regarded[p]), //this.state.has_regarded['alcove, general'],
                    display: DisplayEltType.keyword
                })]);
                yield parser.consume_filler(['the', 'desk']);
                yield parser.done();

                return this.transition_to('desk, sitting down');
            })

            return combine.call(this, parser, [look_consumer, other_consumer]);
        }),
        dest_oms: ['desk, sitting down']
    },
    {
        id: 'desk, sitting down',
        enter_message: `You pace across the grass and take your seat at the leather-backed study chair.
        <br /><br />
        On the desk is a large parchment envelope, bound in twine.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            let look_consumer = this.make_look_consumer([
                [['at', 'the', 'envelope'], 'alcove, envelope'],
                [['around'], 'alcove, general'],
                [['at', 'myself'], 'self, 1']]);

            let open_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([
                    annotate(['open'], {
                        enabled: this.state.has_regarded['alcove, envelope'] || false,
                        display: DisplayEltType.keyword
                    })
                ]);

                yield parser.consume_filler(['the']);
                yield parser.consume_filler(['envelope']);
                yield parser.done();

                return this.transition_to('desk, opening the envelope');
            });

            return combine.call(this, parser, [
                look_consumer,
                open_consumer
            ]);
        }),
        dest_oms: ['desk, sitting down', 'desk, opening the envelope']


        // transitions: [
        //     [['open', 'the', 'envelope'], 'desk, opening the envelope']]
    },
    {
        id: 'desk, opening the envelope',
        enter_message: `You undo the twine, leaving it in a loop on the desk.
        <br /><br />
        You unfold the envelope’s flap.
        <br /><br />
        It’s empty.`,
        transitions: [
            [['what?'], 'desk, reacting']]
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
        transitions: [
            [['try', 'to', '~*remember'], null],
            [['try', 'to', '*understand'], 'desk, trying to understand 1']]
    },
    {
        id: 'desk, trying to understand 1',
        enter_message: `
        Years of work.
        <br/><br/>
        Sequence Number Twelve.
        </br><br/>
        How does it go?`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            const r = [
                [9735, 4130, 3261],
                [3538, 8177, 3424],
                [6930, 3134, 2822]
            ];

            for (let i = 0; i < 3; i++){
                let options = [];
                for (let j = 0; j < 3; j++){
                    let n = r[i][j]
                    let opt = annotate([n.toString() + '?'], {
                        display: DisplayEltType.filler
                    });
                    options.push(opt);
                }
                yield parser.consume_option(options);
            }
            yield parser.done();

            return this.transition_to('desk, trying to understand 2');
        }),
        dest_oms: ['desk, trying to understand 2']

    },
    {
        id: 'desk, trying to understand 2',
        enter_message: `        
        A panic comes over you. Without your notes, how will you continue your work?
        <br /><br />
        How will you possibly understand? How will you honor Katya’s memory?`,
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
        Survey the horizon.
        <br /><br />
        And then, choose where to go."
        </i></div>`,
        transitions: [
            [['begin', '*interpretation'], 'alcove, beginning interpretation']]
    },
    {
        id: 'alcove, beginning interpretation',
        enter_message: `
        <div class="face-of-it">
        A nervous energy buzzes within your mind.
        <br/><br/>
        </div>
        <div class="interp-alcove-1">
        Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
        <br/><br/>
        </div>
        <div class="face-of-it">
        Your notes are gone.
        <br/><br/>
        </div>
        <div class="interp-alcove-2">
        Your effort to organize and understand everything Katya taught you over the years. If your notes are truly gone, it is a great setback.
        <br/><br/>
        But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
        <br/><br/>
        </div>
        <div class="face-of-it">
        You are alone in a grassy alcove in the forest.
        </div>
        <div class="interp-alcove-3">
        <br/>
        Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
        <br/><br/>
        Your view of the horizon is occluded by the trees from in here. Set out, seeking <i>new vantages.</i>
        </div>`,
        handle_command: wrap_handler(function* (parser: CommandParser) {
            let {interp_step = 0} = this.get_om_state('alcove, beginning interpretation');

            let next_interp = () => ({
                world: this.update({
                    om_state: {
                        ['alcove, beginning interpretation']: {
                            interp_step: interp_step + 1
                        }
                    }
                })
            });

            let judge_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['judge'], {
                    display: DisplayEltType.keyword,
                    enabled: interp_step < 2})]);

                yield parser.consume_filler(['the']);

                yield parser.consume_option([
                    annotate(['direction', 'of', 'gravity'], {enabled: interp_step === 0}),
                    annotate(['slickness', 'of', 'the', 'ice'], {enabled: interp_step === 1}),
                ]);

                yield parser.done();

                return next_interp();
            });

            let survey_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['survey'], {
                    display: DisplayEltType.keyword,
                    enabled: interp_step === 2
                })]);

                yield parser.consume_filler(['the']);
                yield parser.consume_filler(['horizon']);
                yield parser.done();

                return next_interp();
            });

            let end_consumer = wrap_handler(function*(parser: CommandParser) {
                if (interp_step < 3) {
                    yield parser.invalidate();
                }

                yield parser.consume_filler(['end']);
                yield parser.consume_exact(['interpretation']);
                yield parser.done();

                return this.transition_to('alcove, ending interpretation');
            });

            return combine.call(this, parser, [
                judge_consumer,
                survey_consumer,
                end_consumer]);
        }),
        dest_oms: ['alcove, ending interpretation'],

        interpret_history(history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
            let hist_om = history_elt.world.current_om();
            let result: HistoryInterpretationOp = [];
            if (hist_om === 'alcove, beginning interpretation') {
                let {interp_step: hist_interp_step = 0} = history_elt.world.get_om_state('alcove, beginning interpretation');    
                if (hist_interp_step === 0) {
                    let {interp_step = 0} = this.get_om_state('alcove, beginning interpretation');
                    if (interp_step > 0) {
                        result.push({'add': `interp-alcove-${interp_step}-enabled`});
                    } else {
                        result.push({'add': 'interpretation-block'});
                        result.push({'add': 'interpretation-active'});
                    }
                }
            }
            return result;
        }
    },
    {
        id: 'alcove, ending interpretation',
        enter_message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
        <br /><br />
        You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
        <br /><br />
        But your sense of purpose compels you. To go. To seek. To try to understand.`,
        transitions: [
            [['enter', 'the', 'forest'], 'alcove, entering the forest']],
        interpretations: {
            'alcove, beginning interpretation': [{'remove': 'interpretation-active'}]
        }
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
    },
    {
        id: 'alcove, envelope',
        content: `
        You keep your research in this thick envelope.
        <br/><br/>
        You've been analyzing Katya's work for years now.
        <br/><br/>
        Your career is built in reverence of hers.`
    }
];

export default {
    observer_moments: prologue_oms,
    perceptions: prologue_perceptions
};