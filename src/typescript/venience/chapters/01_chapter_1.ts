import {
    HistoryInterpretationOp
} from '../../commands';

import {
    ObserverMoment,
    ObserverMomentID,
    Perception,
    PerceptionID
} from '../observer_moments';

import {
    wrap_handler,
    VenienceWorld,
    VenienceWorldCommandResult,
    VenienceWorldInterstitialUpdateResult,
    VenienceWorldState
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


let ch1_oms: () => ObserverMoment[] = (() => {
    type TangleContention = (
        'tangle, 1' |
        'tangle, 2' |
        'tangle, 3'
    );

    type InterpAction = (
        'beginning interpretation' |
        { 'considering a fragment': TangleContention } |
        { 'reifying a fragment': TangleContention, correctly: boolean } |
        'ending interpretation'
    );

    function is_considering(a: InterpAction): a is {'considering a fragment' : TangleContention} {
        return typeof a === 'object' && <any>a['considering a fragment'] !== undefined;
    }

    function is_reifying(a: InterpAction): a is {'reifying a fragment' : TangleContention, correctly: boolean} {
        return typeof a === 'object' && <any>a['reifying a fragment'] !== undefined;
    }

    type InterpState = {
        prev_interp_action: InterpAction
        index: number,
        begin_tag: number
    };

    const om_id_2_contention: {[K in ObserverMomentID]?: ('tangle, 1' | 'tangle, 2' | 'tangle, 3')} = {
        'tower, peak': 'tangle, 2',
        'woods, tangle': 'tangle, 1',
        'woods, clearing 3': 'tangle, 3'
    };

    let tangle_consumer = wrap_handler(function*(parser: CommandParser) {
        if (this.state.has_understood[om_id_2_contention[this.current_om()]]) {
            yield parser.invalidate();
        }

        let {
            prev_interp_action = 'ending interpretation',
            index = 0,
            begin_tag = -1
        }: InterpState = this.get_current_om_state();

        let begin_consumer = wrap_handler(function*(parser: CommandParser) {
            if (prev_interp_action !== 'ending interpretation') {
                yield parser.invalidate();
            }

            yield parser.consume_filler(['begin']);
            yield parser.consume_exact(['reification']);

            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: 'beginning interpretation',
                            index: index + 1,
                            begin_tag: index
                        }
                    }
                }, ['prev_interp_action']),
                message: wrap_in_div(`
                You're upstairs, alright.`)
            }
        
        });

        let end_consumer = wrap_handler(function*(parser: CommandParser) {
            if (prev_interp_action === 'ending interpretation') {
                yield parser.invalidate();
            }

            yield parser.consume_filler(['end']);
            yield parser.consume_exact(['reification']);
            yield parser.done()

            let world_update: VenienceWorldState = {
                om_state: {
                    [this.current_om()]: {
                        prev_interp_action: 'ending interpretation',
                        index: index + 1
                    }
                }
            };

            let message: string;

            // check if they successfully reified the correct contention
            if (is_reifying(prev_interp_action) && prev_interp_action.correctly) {
                world_update.has_understood = {
                    [om_id_2_contention[this.current_om()]]: true
                };

                message = `
                You are beginning to understand, my dear.`
            } else {
                message = `
                There must be more to understand.`;
            }

            return {
                world: this.update(world_update, ['prev_interp_action']),
                message: wrap_in_div(message)
            };
        });

        let consider_consumer = wrap_handler(function*(parser: CommandParser) {
            if (prev_interp_action === 'ending interpretation') {
                yield parser.invalidate();
            }
            yield parser.consume_option([
                annotate(['consider'], {
                    display: DisplayEltType.keyword,
                    enabled: !is_reifying(prev_interp_action) || !prev_interp_action.correctly
                })]);
            yield parser.consume_filler(['the']);

            let prev_contention: string = null;
            if (is_considering(prev_interp_action)){
                prev_contention = prev_interp_action['considering a fragment'];
            } else if (is_reifying(prev_interp_action)) {
                prev_contention = prev_interp_action['reifying a fragment'];
            }

            let choice: string = yield parser.consume_option([
                set_enabled(['first'], !this.state.has_understood['tangle, 1'] && prev_contention !== 'tangle, 1'),
                set_enabled(['second'], !this.state.has_understood['tangle, 2'] && prev_contention !== 'tangle, 2'),
                set_enabled(['third'], !this.state.has_understood['tangle, 3'] && prev_contention !== 'tangle, 3')
            ]);
            yield parser.consume_filler(['fragment']);
            yield parser.done();

            let choice_2_contention: {[K: string]: 'tangle, 1' | 'tangle, 2' | 'tangle, 3'} = {
                'first': 'tangle, 1',
                'second': 'tangle, 2',
                'third': 'tangle, 3'
            };

            let x: Perception = VenienceWorld.perceptions[choice_2_contention[choice]]

            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: {
                                'considering a fragment': choice_2_contention[choice]
                            },
                            index: index + 1
                        }
                    }
                }, ['prev_interp_action']),
                message: wrap_in_div(`
                The ${choice} fragment reads:
                <br/><br/>
                ${VenienceWorld.perceptions[choice_2_contention[choice]].content}`)
            };
        });

        let reify_consumer = wrap_handler(function*(parser: CommandParser) {
            if (!is_considering(prev_interp_action)) {
                yield parser.invalidate();
                return;
            }

            yield parser.consume_exact(['reify']);
            yield parser.consume_filler(['the']);
            
            let contention_2_option = {
                'tangle, 1': ['tangle'],
                'tangle, 2': ['outside', 'vantage'],
                'tangle, 3': ['dance']
            };

            yield parser.consume_option(['tangle, 1', 'tangle, 2', 'tangle, 3'].map(c =>
                set_enabled(contention_2_option[c], c === prev_interp_action['considering a fragment'])));

            yield parser.done();

            let message: HTMLElement;

            let correctly = prev_interp_action['considering a fragment'] === om_id_2_contention[this.current_om()];

            if (prev_interp_action['considering a fragment'] === 'tangle, 2') {
                correctly = correctly && this.state.has_understood['tangle, 1'];
            } else if (prev_interp_action['considering a fragment'] === 'tangle, 3') {
                correctly = correctly && this.state.has_understood['tangle, 2'];
            }
            
            if (correctly) {
                // all the work gets done in the interpret history bit
            } else {
                message = wrap_in_div(`
                Wrong answer.`);
            }

            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: {
                                'reifying a fragment': prev_interp_action['considering a fragment'],
                                correctly
                            },
                            index: index + 1
                        }
                    }
                }, ['prev_interp_action']),
                message
            };

        });

        return combine.call(this, parser, [
            begin_consumer,
            reify_consumer,
            consider_consumer,
            end_consumer
        ]);
    });

    function tangle_interpreter(this: VenienceWorld, history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
        let h_world = history_elt.world;
        if (h_world.current_om() === this.current_om() && history_elt.world.current_om() in om_id_2_contention) {
            let {
                prev_interp_action = 'ending interpretation',
                index = 0,
                begin_tag = -1
            }: InterpState = this.get_current_om_state();

            let {
                prev_interp_action: h_prev_inter_action = 'ending interpretation',
                index: h_index = 0,
                begin_tag: h_begin_tag = -1
            }: InterpState = h_world.get_current_om_state();
            
            if (prev_interp_action === 'ending interpretation') {
                if (!this.state.has_understood[om_id_2_contention[this.current_om()]]) {
                    if (h_index > begin_tag + 1 && h_index < index) {
                        return [{'add': 'forgotten'}];
                    }
                }
            } else if (is_considering(prev_interp_action)) {
                // forget back to last 'beginning interpretation'
                
                if (h_index > begin_tag + 1 && h_index < index) {
                    return [{'add': 'forgotten'}];
                }
            } else if (is_reifying(prev_interp_action)) {
                if (prev_interp_action.correctly) {
                    // find most recent considering (it will be index - 1)
                    // add reify-tangle-N class
                    if (h_index === index - 1) {
                        let n: number;
                        if (prev_interp_action['reifying a fragment'] === 'tangle, 1') {
                            n = 1;
                        } else if (prev_interp_action['reifying a fragment'] === 'tangle, 2') {
                            n = 2;
                        } else {
                            n = 3;
                        }
                        return [{'add': `reif-tangle-${n}-enabled`}];
                    }
                }
            }
        }
    }

    return [
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
            In or Out.
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
            You choose a direction <span class="interp-inline">(Arbitrarily! <i>"Thanks, <a target="_blank" href="https://arxiv.org/abs/cond-mat/0005382">Dewar</a>!"</i>)</span> and take it.
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
            You notice that the brown trunks of oak are peppered with the white of birch here and there.
            <br/><br/>
            And on the ground, partially covered in leaves, is a slip of parchment paper.`,
            handle_command: wrap_handler(function* (parser: CommandParser) {
                let {
                    has_taken_note = false
                } = this.get_current_om_state();

                let fragment_thread = wrap_handler(function*(parser: CommandParser) {
                    let look_consumer = wrap_handler(function*(parser: CommandParser) {
                        if (this.state.has_regarded['note fragment']) {
                            yield parser.invalidate();
                        }

                        return this.make_look_consumer([
                            [['at', 'the', 'parchment'], 'note fragment']]).call(this, parser);
                    });
                    
                    let take_consumer = wrap_handler(function*(parser: CommandParser) {
                        if (!this.state.has_regarded['note fragment'] || has_taken_note) {
                            yield parser.invalidate();
                        }

                        yield parser.consume_option([
                            annotate(['take'], {
                                display: DisplayEltType.keyword,
                                enabled: !has_taken_note
                            })
                        ]);
                        yield parser.consume_filler(['the', 'fragment']);
                        yield parser.done()

                        return {
                            message: wrap_in_div(`
                            You pick it up.
                            <br/><br/>
                            It's been torn from a full page.
                            <br/><br/>
                            You recognize your own loopy scrawl on the parchment paper.
                            <br/><br/>
                            What is it doing out here? And where are the rest of your notes?`),
                            world: this.update({
                                om_state: {
                                    [this.current_om()] : {
                                        has_taken_note: true
                                    }
                                }
                            })
                        };
                    });

                    let read_consumer = wrap_handler(function*(parser: CommandParser) {
                        if (!has_taken_note || this.state.has_regarded['tangle, 1']) {
                            yield parser.invalidate();
                        }
                        yield parser.consume_option([
                            annotate(['read'], {
                                display: DisplayEltType.keyword,
                                enabled: !this.state.has_regarded['tangle, 1']
                            })]);
                        yield parser.consume_filler(['it']);
                        yield parser.done();

                        return this.regard('tangle, 1', (msg) => wrap_in_div(`
                        It's the beginning of a transcript you took.
                        <br/><br/>
                        Something Katya said, that you wanted to remember:
                        <br/><br/>
                        ${msg}`));
                    });

                    return combine.call(this, parser, [
                        look_consumer,
                        take_consumer,
                        read_consumer
                    ]);
                });

                let consumer = wrap_handler(function*(parser: CommandParser) {
                    if (!this.state.has_regarded['tangle, 1']) {
                        yield parser.invalidate();
                    }

                    yield parser.consume_filler(['continue']);
                    yield parser.done();

                    return this.transition_to('woods, crossing the boundary 3');
                });

                return combine.call(this, parser, [fragment_thread, consumer]);
            }),
            dest_oms: ['woods, crossing the boundary 2', 'woods, crossing the boundary 3']
        },
        {
            id: 'woods, crossing the boundary 3',
            enter_message: `
            The birch representation continues to grow relative to the oak.
            <br/><br/>
            Another slip of parchment paper catches your eye on the ground.`,
            handle_command: wrap_handler(function *(parser: CommandParser) {
                // let {
                //     has_taken_note = false
                // } = this.get_om_state('woods, crossing the boundary 3');

                let take_consumer = wrap_handler(function*(parser: CommandParser) {
                    if (this.state.has_regarded['tangle, 2']) {
                        yield parser.invalidate();
                    }

                    yield parser.consume_option([
                        annotate(['take'], {
                            display: DisplayEltType.keyword,
                            enabled: !this.state.has_regarded['tangle, 2']
                        })
                    ]);
                    yield parser.consume_filler(['the', 'fragment']);
                    yield parser.done()

                    return this.regard('tangle, 2', (msg) => wrap_in_div(`
                    ${msg}`));

                });

                let continue_consumer = wrap_handler(function*(parser:CommandParser) {
                    yield parser.consume_option([
                        annotate(['continue'], {
                            enabled: !this.state.has_regarded['tangle, 2'],
                            display: DisplayEltType.keyword
                        })]);
                    yield parser.consume_filler(['up', 'the', 'birch', 'gradient']);
                    yield parser.done();

                    return this.transition_to('woods, clearing');
                });

                return combine.call(this, parser, [
                    take_consumer,
                    continue_consumer
                ]);
            }),
            dest_oms: ['woods, crossing the boundary 3', 'woods, clearing']
        },
        {
            id: ['woods, clearing', 'woods, clearing 2', 'woods, clearing 3'],
            enter_message: `
            You arrive at a small clearing, surrounded by the parchment-white of birch.
            <br/><br/>
            The path forward branches in two.
            <br/><br/>
            In one direction, the path narrows and bends sharply behind a roiling wall of birch.
            <br/><br/>
            In another, a looming structure of some kind stands beyond the trees.
            <br/><br/>
            A third note fragment lies on the ground.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let {
                    has_taken_note = false
                } = this.get_current_om_state();

                let take_consumer = wrap_handler(function*(parser: CommandParser) {
                    if (this.state.has_regarded['tangle, 3']) {
                        yield parser.invalidate();
                    }

                    yield parser.consume_option([
                        annotate(['take'], {
                            display: DisplayEltType.keyword,
                            enabled: !has_taken_note
                        })
                    ]);
                    yield parser.consume_filler(['the', 'fragment']);
                    yield parser.done()

                    return this.regard('tangle, 3', (msg) => wrap_in_div(`
                    ${msg}`));
                });

                let go_consumer = wrap_handler(function*(parser:CommandParser) {
                    yield parser.consume_option([
                        annotate(['go'], {
                            enabled: this.state.has_regarded['tangle, 3'],
                            display: DisplayEltType.keyword
                        })]);
                    
                    yield parser.consume_filler(['to']);
                    let opt = yield parser.consume_option([['tangle'], ['tower']]);
                    yield parser.done();

                    if (opt === 'tangle') {
                        if (this.state.has_understood['tangle, 3']) {
                            return this.transition_to('woods, tangle 2');
                        } else {
                            return this.transition_to('woods, tangle');
                        }
                    } else {
                        if (this.state.has_understood['tangle, 2']) {
                            return this.transition_to('tower, base 2');
                        } else {
                            return this.transition_to('tower, base');
                        }
                    }
                });

                // TODO: add tangle consumer
                // need gentler way of introducing it

                return combine.call(this, parser, [
                    take_consumer,
                    go_consumer
                ]);
            }),
            dest_oms: ['woods, clearing', 'woods, tangle', 'tower, base', 'tower, base 2', 'woods, tangle 2'],
            interpret_history: tangle_interpreter
        },
        {
            id: ['woods, tangle'],
            enter_message: `
            Gee dang is it hard to stay oriented in here.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let return_consumer = wrap_handler(function*(parser: CommandParser) {
                    let {prev_interp_action = 'ending interpretation'} : InterpState = this.get_current_om_state();

                    if (prev_interp_action !== 'ending interpretation') {
                        yield parser.invalidate();
                    }

                    yield parser.consume_exact(['return']);
                    yield parser.consume_filler(['to', 'the']);
                    yield parser.consume_filler(['clearing']);

                    yield parser.done();

                    let dest: ObserverMomentID;
                    if (this.state.has_understood['tangle, 1']) {
                        dest = 'woods, clearing 2';
                    } else {
                        dest = 'woods, clearing';
                    }

                    return this.transition_to(dest);
                });

                return combine.call(this, parser, [tangle_consumer, return_consumer]);

            }),
            dest_oms: ['woods, tangle', 'woods, clearing', 'woods, birch parchment 1'],
            interpret_history: tangle_interpreter
        },
        {
            id: ['tower, base', 'tower, base 2'],
            enter_message: `
            Big old tower stick up in the middle of the earth.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let ascend_consumer = wrap_handler(function*(parser: CommandParser) {
                    // Climbs the tower
                    yield parser.consume_exact(['ascend']);
                    yield parser.done();

                    return this.transition_to('tower, peak');
                });

                let return_consumer = wrap_handler(function*(parser: CommandParser) {
                    // Returns to the clearing
                    yield parser.consume_exact(['return']);
                    yield parser.consume_filler(['to', 'the']);
                    yield parser.consume_filler(['clearing']);

                    yield parser.done();

                    let dest: ObserverMomentID;
                    if (this.state.has_understood['tangle, 2']) {
                        dest = 'woods, clearing 3';
                    } else if (this.state.has_understood['tangle, 1']) {
                        dest = 'woods, clearing 2';
                    } else {
                        dest = 'woods, clearing';
                    }

                    return this.transition_to(dest);
                });

                return combine.call(this, parser, [ascend_consumer, return_consumer]);
            }),
            dest_oms: ['tower, peak', 'woods, clearing', 'woods, clearing 2', 'woods, clearing 3']
        },
        {
            id: 'tower, peak',
            enter_message: `
            Top o' the tower.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {

                let descend_consumer = wrap_handler(function*(parser: CommandParser) {
                    let {prev_interp_action = 'ending interpretation'} : InterpState = this.get_current_om_state();

                    if (prev_interp_action !== 'ending interpretation') {
                        yield parser.invalidate();
                    }

                    yield parser.consume_exact(['descend']);
                    yield parser.done();

                    if (this.state.has_understood['tangle, 2']) {
                        return this.transition_to('tower, base 2');
                    } else {
                        return this.transition_to('tower, base');
                    }
                });
                
                return combine.call(this, parser, [
                    tangle_consumer,
                    descend_consumer
                ]);       
            }),
            interpret_history: tangle_interpreter,
            dest_oms: ['tower, base', 'tower, base 2', 'tower, peak']
        },
        {
            id: 'woods, tangle 2',
            enter_message: `
            You did it. Yayy`,
            transitions: [
                [['continue'], 'woods, birch parchment 1']]
        },
        {
            id: 'woods, birch parchment 1',
            enter_message: `
            ...and now it is mostly birch...`,
            transitions: [
                [['continue'], 'woods, birch parchment 2']]
        },
        {
            id: 'woods, birch parchment 2',
            enter_message: `
            ...and now the white bark of the birch trees blurs into a continuum of etched parchment.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let look_consumer = this.make_look_consumer([
                    [['at', 'the', 'parchment'], 'forest, parchment trees']]);

                let {read_state = 0}: {read_state: number} = this.get_om_state('woods, birch parchment 2');
                

                let apply_read_update = (world=this) => world.update({
                    om_state: {
                        ['woods, birch parchment 2']: {
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
            dest_oms: ['woods, birch parchment 2', 'reading the story of charlotte']
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
});


// "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
// "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
// "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
// "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
// "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
// "Do not fret, my dear. Return to the madness of life after your brief respite."
// You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
// "Expect to forget; to be turned around; to become tangled up."
// "Find some joy in it; some exhilaration."
// "And know that you have changed, dear. That your ascent has taught you something."

//             <br /><br />
//             You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
//             <br /><br />
//             You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
//             <br /><br />
//             <div class="meditation-1">
//             "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
//             </div>`,


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
    },
    {
        id: 'note fragment',
        content: `
        You brush aside the leaves.
        <br/><br/>
        It appears to be a fragment from your missing notes!`
    },
    {
        id: 'tangle, 1',
        content: `
        <div class="interp"><i>
        "We wander, for the most part, within a tangled, looping mess of thought;
        <br/><br/>
        a haphazard ligature of unrelated perceptions.
        <br/><br/>
        We lack the perspective to find meaning in it.”
        </i></div>
        <div class="reif-tangle-1">
        <br/>
        This winding maze of birch <i>is</i> the tangle.
        <br/><br/>
        It disorients you, subsumes you in its curves.
        </div>
        `,
    },
    {
        id: 'tangle, 2',
        content: `
        <div class="interp"><i>
        “It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds.
        <br/><br/>
        The twisting fibres of our journey are put into perspective.
        <br/><br/>
        It is peaceful from up there."
        </i></div>
        <div class="reif-tangle-2">
        <br/>
        This tower <i>is</i> the outside vantage.
        <br/><br/>
        It gives you the perspective to see how far you've come, and what waits for you ahead.
        </div>`,
    },
    {
        id: 'tangle, 3',
        content: `
        <div class="interp"><i>
        "But do not grow too comfortable in that peace’s embrace.
        <br/><br/>
        It is a respite. And it must end.
        <br/><br/>
        All there is to do, once one has stood above the tangle for a while and surveyed it,
        <br/><br/>
        is to return to it.
        <br/><br/>
        To dance."
        </i></div>
        <div class="reif-tangle-3">
        <br/>
        Your own motion through the birch tangle and back out
        <br/><br/>
        your climb up the tower and back down
        <br/><br/>
        your exodus from the world into your alcove
        <br/><br/>
        your years spent in solitude
        <br/><br/>
        your setting forth this morning, and arriving here
        <br/><br/>
        this <i>is</i> the dance.
        </div>`
    }

]

export default {
    observer_moments: ch1_oms,
    perceptions: ch1_perceptions
};