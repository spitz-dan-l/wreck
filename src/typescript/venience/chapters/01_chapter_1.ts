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
    annotate,
    Annotatable
} from '../../datatypes';

import {
    CommandParser,
    DisplayEltType,
    AMatch,
    combine
} from '../../parser';

let ch1_oms: () => ObserverMoment[] = () => [
    {
        id: 'alone in the woods',
        enter_message: `Chapter 1 - A Sense Of Direction
        <br />
        <br />
        You are alone in the woods in midmorning.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            let {has_travelled = []} = this.get_om_state('alone in the woods');

            let look_consumer = this.make_look_consumer([
                [['around'], 'forest, general'],
                [['at', 'myself'], 'self, 2']
            ]);

            let go_consumer = wrap_handler(function*(parser: CommandParser){
                
                yield parser.consume_option([
                    annotate(['go'], {
                        enabled: (has_travelled.length < 4
                                  && this.state.has_regarded['self, 2']
                                  && this.state.has_regarded['forest, general']),
                        display: DisplayEltType.keyword
                    })]);
                
                let dir = yield parser.consume_option([
                    ['north?'],
                    ['east?'],
                    ['south?'],
                    ['west?']
                ].map(d => set_enabled(d, has_travelled.indexOf(d[0]) === -1)));
                yield parser.done();

                let message: HTMLElement;
                if (has_travelled.length === 0){
                    message = wrap_in_div(`
                    You take a few steps ${dir.slice(0, -1)}.
                    <br/><br/>
                    Your surroundings appear similar.
                    <br/><br/>
                    Perhaps this isn't the right way.`);
                } else if (has_travelled.length === 1) {
                    message = wrap_in_div(`
                    You feel no different after the second attempt to advance.
                    <br/><br/>
                    You have moved, but not meaningfully.
                    `);
                } else if (has_travelled.length === 2) {
                    message = wrap_in_div(`
                    A swirling cocktail of
                    <br/><br/>
                    doubt,
                    <br/><br/>
                    confusion
                    <br/><br/>
                    and disorientation
                    <br/><br/>
                    begins to set in.
                    `);
                } else if (has_travelled.length === 3) {
                    message = wrap_in_div(`
                    You are lost in the woods in midmorning.
                    <br/><br/>
                    You miss the security of your alcove.
                    <br/><br/>
                    <div class="alien-interp">
                    <i>"You were a fool to leave
                    <br/><br/>
                    too fragile
                    <br/><br/>
                    too sensitive
                    <br/><br/>
                    to find your own way."</i>
                    </div>`)
                }
                return {
                    world: this.update({
                        om_state: {
                            ['alone in the woods']: {
                                has_travelled: [...has_travelled, dir]
                            }
                        }
                    }),
                    message
                };
            });

            let understand_consumer = wrap_handler(function*(parser: CommandParser) {
                if (!(has_travelled.length >= 4)) {
                    yield parser.invalidate();
                }
                yield parser.consume_filler(['try']);
                yield parser.consume_filler(['to']);
                yield parser.consume_exact(['understand']);
                yield parser.done();

                return this.transition_to('woods, trying to understand');
            });

            return combine.call(this, parser, [
                look_consumer,
                go_consumer,
                understand_consumer]);
        }),
        dest_oms: ['alone in the woods', 'woods, trying to understand']
    },
    {
        id: 'woods, trying to understand',
        enter_message: `
        You are overwhelmed by the number of indistinct options.
        <br/><br/>
        The trees surrounding you are like a wall, made of irrelevance and uncertainty rather than impermeability.
        <br/><br/>
        You are unsure of what your heading should be.`,
        transitions: [
            [['*consider', 'the', 'sense of', '&uncertainty'], 'woods, considering the sense of uncertainty']
        ]
    },
    {
        id: 'woods, considering the sense of uncertainty',
        enter_message: `
        <div class="interp">
        Katya used to say that a circle, when considered in relation to nothing,
        is about as useful as a point, a dot, considered in the same context.
        <br/><br/>
        <i>“It is only important that a circle is circular when something other than the circle exists in terms of it,”</i>
        she’d say, chuckling as you wracked your brain to understand.
        </div>`,
        transitions: [
            [['where', 'should', 'I', 'go?'], 'woods, asking 1']
        ]
    },
    {
        id: 'woods, asking 1',
        enter_message: `
        <div class="interp">
        <i>"I certainly can’t answer that, my dear.
        <br/><br/>
        But I assure you, you can do this."</i>
        </div>`,
        transitions: [
            [['what', 'should', 'I', 'do?'], 'woods, asking 2']
        ]
    },
    {  
        id: 'woods, asking 2',
        enter_message: `
        <div class="interp">
        <i>"Judge the circle in terms of the world.
        <br/><br/>
        Question its circlehood.
        <br/><br/>
        Take the only path forward."</i>
        </div>`,
        transitions: [
            [['begin', '*interpretation'], 'woods, beginning interpretation']
        ]
    },
    {
        id: 'woods, beginning interpretation',
        enter_message: `
        You are surrounded in all directions by the forest.
        <br/><br/>
        <div class="interp-woods-1">
        The circle that is the forest encloses you.
        <br/><br/>
        It separates you from the world.
        <br/><br/>
        </div> 
        You are unsure of which direction to go.
        <br/><br/>
        <div class="interp-woods-2">
        It is primarily important that the occluding wood is a boundary, not that it is circular in shape.
        <br/><br/>
        <i>"The circularity is a mere artifact of our Euclidean heritage, my dear."</i>
        <br/><br/>
        A boundary separates you from the answers you seek.
        <br/><br/>
        </div>
        You feel lost.
        <div class="interp-woods-3">
        <br/>
        A circle may offer a continuum of freedom, and with it, an infinity of wrong ways.
        <br/><br/>
        But what of an enclosing boundary?
        <br/><br/>
        You’re either within it, or you’re free of it.
        <br/><br/>
        In, or Out.
        <br/><br/>
        Perhaps there is only a single way forward after all.
        </div>
        `,
        handle_command: wrap_handler(function*(parser: CommandParser){
            let {interp_step = 0} = this.get_om_state('woods, beginning interpretation');

            let next_interp = () => ({
                world: this.update({
                    om_state: {
                        ['woods, beginning interpretation']: {
                            interp_step: interp_step + 1
                        }
                    }
                })
            });

            let judge_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['judge'], {
                    display: DisplayEltType.keyword,
                    enabled: interp_step === 0
                })]);
                yield parser.consume_filler(['the', 'circle']);
                yield parser.consume_filler(['in', 'terms', 'of', 'the', 'world']);
                yield parser.done()

                return next_interp();
            });

            let question_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['question'], {
                    display: DisplayEltType.keyword,
                    enabled: interp_step === 1
                })]);

                yield parser.consume_filler(['its', 'circlehood']);
                yield parser.done()

                return next_interp();
            });

            let take_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([annotate(['take'], {
                    display: DisplayEltType.keyword,
                    enabled: interp_step === 2
                })]);

                yield parser.consume_filler(['the', 'only', 'path', 'forward']);
                yield parser.done()

                return next_interp();
            });

            let end_consumer = wrap_handler(function*(parser: CommandParser) {
                if (interp_step < 3) {
                    yield parser.invalidate();
                }

                yield parser.consume_filler(['end']);
                yield parser.consume_exact(['interpretation']);
                yield parser.done();

                return this.transition_to('woods, ending interpretation');
            });

            return combine.call(this, parser, [
                judge_consumer,
                question_consumer,
                take_consumer,
                end_consumer]);

        }),
        dest_oms: ['woods, beginning interpretation', 'woods, ending interpretation'],
        interpret_history(history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
            if (history_elt.world.current_om() === 'woods, beginning interpretation') {
                let {interp_step: hist_interp_step = 0} = history_elt.world.get_om_state('woods, beginning interpretation');
                if (hist_interp_step === 0) {
                    let {interp_step = 0} = this.get_om_state('woods, beginning interpretation');
                    if (interp_step > 0) {
                        return [{'add': `interp-woods-${interp_step}-enabled`}];
                    }
                }
            }
        }
    },
    {
        id: 'woods, ending interpretation',
        enter_message: `
        You haven’t moved an inch.
        <br/><br/>
        And yet, the world around you seems to have been reshaped.
        <br/><br/>
        The proliferation of possibly-wrong paths forward has collapsed to a single binary choice:`,
        transitions: [
            [['*remain', 'within the boundary'], 'woods, considering remaining'],
            [['~*cross', 'the boundary'], 'woods, crossing the boundary 1']
        ]
    },
    {
        id: 'woods, considering remaining',
        enter_message: `or...`,
        transitions: [
            [['~*remain', 'within the boundary'], 'woods, considering remaining'],
            [['*cross', 'the boundary'], 'woods, crossing the boundary 1']]
    },
    {
        id: 'woods, crossing the boundary 1',
        enter_message: `
        The particular direction of travel is unimportant.
        <br/><br/>
        <div class="interp">
        <i>"Our world is one in which most degrees of freedom are accompanied by entropy production;
        <br/><br/>
        that is to say, arbitrariness is rarely scarce, my dear."</i>
        <br/><br/>
        </div>
        You choose a direction <span class="interp-inline">(Arbitrarily! <i>"Thanks, <a href="https://arxiv.org/abs/cond-mat/0005382">Dewar</a>!"</i>)</span> and take it.
        <br/><br/>
        The forest around you remains an undifferentiated boundary of New England brush and flora...`,
        transitions: [
            [['continue'], 'woods, crossing the boundary 2']],
        interpretations: {
            'woods, considering remaining': [{'add': 'forgotten'}]
        }
    },
    {
        id: 'woods, crossing the boundary 2',
        enter_message: `
        ...until it begins to change.
        <br/><br/>
        You notice that the brown trunks of Oak are peppered with the white of Birch, here and there...`,
        transitions: [
            [['continue'], 'woods, crossing the boundary 3']]
    },
    {
        id: 'woods, crossing the boundary 3',
        enter_message: `
        ...and now it is mostly Birch...`,
        transitions: [
            [['continue'], 'woods, crossing the boundary 4']]
    },
    {
        id: 'woods, crossing the boundary 4',
        enter_message: `
        ...and now the white bark of the Birch trees blurs into a continuum of etched parchment.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            let look_consumer = this.make_look_consumer([
                [['at', 'the', 'parchment'], 'forest, parchment trees']]);

            let {read_state = 0}: {read_state: number} = this.get_om_state('woods, crossing the boundary 4');
            

            let apply_read_update = (world=this) => world.update({
                om_state: {
                    ['woods, crossing the boundary 4']: {
                        read_state: read_state + 1
                    }
                }
            });

            let read_consumer = wrap_handler(function*(parser: CommandParser) {
                yield parser.consume_option([
                    annotate(['read'], {
                        display: DisplayEltType.keyword,
                        enabled: this.state.has_regarded['forest, parchment trees']
                    })
                ]);

                let read_0_consumer = wrap_handler(function*(parser: CommandParser) {
                    yield parser.consume_option([
                        annotate(['the', 'parchment'], {
                            display: DisplayEltType.filler,
                            enabled: read_state === 0
                        })
                    ]);

                    yield parser.done();

                    return {
                        world: apply_read_update(),
                        message: wrap_in_div(`
                        Your eyes skim over the vast text laid out before you for a moment,
                        <br/><br/>
                        searching.
                        <br/><br/>
                        Then, you come to rest on one particular story.`)
                    };
                });

                let read_1_consumer = wrap_handler(function*(parser: CommandParser) {
                    if (read_state < 1) {
                        yield parser.invalidate();
                    }

                    yield parser.consume_filler(['the', 'story', 'of']);
                    yield parser.consume_exact(['Charlotte'], DisplayEltType.option);

                    yield parser.done();

                    let result = this.transition_to('reading the story of charlotte');
                    result.world = apply_read_update(result.world);
                    return result;
                });

                return combine.call(this, parser, [
                    read_0_consumer, read_1_consumer
                ]);

            });

            return combine.call(this, parser, [look_consumer, read_consumer]);

        }),
        dest_oms: ['woods, crossing the boundary 4', 'reading the story of charlotte']
    },
    {
        id: 'reading the story of charlotte',
        enter_message: `
        <i>You have reached the end of the demo.
        <br/><br/>
        Charlotte's story will be told in Chapter 2.
        <br/><br/>
        Thanks for playing Venience World!</i>`,
        transitions: []
    }
];

let ch1_perceptions: () => Perception[] = () => [
    {
        id: 'forest, general',
        content: `
        The sun trickles through the thick brush.
        <br />
        <br />
        The growth of the forest surrounds you in every direction.`
    },
    {
        id: 'self, 2',
        content: `
        Your silk pajamas glisten in the midmorning sun.
        <br/><br/>
        You are determined to continue your life's work.
        <br/><br/>
        To find or rewrite your missing notes.`
    },
    {
        id: 'forest, parchment trees',
        content: `
        The parchment teems with scrawlings of
        <br/><br/>
        stories,
        <br/><br/>
        transcripts,
        <br/><br/>
        annotations,
        <br/><br/>
        <div class="interp">
        and interpretations.
        </div>`
    }
]

export default {
    observer_moments: ch1_oms,
    perceptions: ch1_perceptions
};