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
    untokenize,
    wrap_in_div
} from '../../text_tools';

import {
    set_enabled,
    is_enabled,
    annotate,
    Annotatable,
    FuckDict,
    infer_literal_array,
    chain_update
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
        begin_tag: number,
        hide_failures: boolean
    };

    const om_id_2_contention: {[K in ObserverMomentID]?: ('tangle, 1' | 'tangle, 2' | 'tangle, 3')} = {
        'tower, peak': 'tangle, 2',
        'woods, tangle': 'tangle, 1',
        'woods, clearing': 'tangle, 3'
        // 'woods, clearing 2': 'tangle, 3',
        // 'woods, clearing 3': 'tangle, 3'
    };

    let make_tangle_consumer = (begin_enabled=true) => wrap_handler(function*(parser: CommandParser) {
        if (this.state.has_understood[om_id_2_contention[this.current_om()]]) {
            yield parser.invalidate();
        }

        let {
            prev_interp_action = 'ending interpretation',
            index = 0,
            begin_tag = -1,
            hide_failures = false
        }: InterpState = this.get_current_om_state();

        let begin_consumer = wrap_handler(function*(parser: CommandParser) {
            if (prev_interp_action !== 'ending interpretation') {
                yield parser.invalidate();
            }
            yield parser.consume_option([
                annotate(['begin'], {
                    display: DisplayEltType.filler,
                    enabled: begin_enabled
                })]);
            yield parser.consume_exact(['interpretation']);

            // Begin message

            // Depending on
            // How many times you have begun an interpretation?
            let message: HTMLElement;
            if (!this.state.has_understood['tangle, 1']) {
                message = wrap_in_div(`
                You have all three fragments.
                <br/><br/>
                Considered together, their words rouse a sense of wonder in you.
                <br/><br/>
                You are determined to understand them.`);
            } else if (!this.state.has_understood['tangle, 2']) {
                message = wrap_in_div(`What did Katya mean?`);
            } else {                
                message = wrap_in_div(`The words beckon you.`);
            }
            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: 'beginning interpretation',
                            index: index + 1,
                            begin_tag: index,
                            hide_failures: this.state.has_understood['tangle, failure']
                        }
                    }
                }, ['prev_interp_action']),
                message
            }
        
        });

        let end_consumer = wrap_handler(function*(parser: CommandParser) {
            if (prev_interp_action === 'ending interpretation') {
                yield parser.invalidate();
            }

            yield parser.consume_filler(['end']);
            yield parser.consume_exact(['interpretation']);
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
                let understood = om_id_2_contention[this.current_om()];
                world_update.has_understood = {
                    [understood]: true
                };

                // TODO: different messages depending on:
                // Where you are
                // Which step of the interpretation you're up to
                if (understood === 'tangle, 1') {
                    message = `
                    <div class="interp"><i>
                    "You are beginning to understand, my dear.
                    <br/><br/>
                    Keep going."
                    </i></div>`;
                } else if (understood === 'tangle, 2') {
                    message = `
                    <div class="interp"><i>
                    "Indeed.
                    <br/><br/>
                    Don't stop now. Follow the thread to its end."
                    </i></div>`;
                } else {
                    message = `
                    You feel, once again, as though the world around you has changed.
                    <br/><br/>
                    Your understanding encompasses more than the space around you, the trees, your body.
                    <br/><br/>
                    It is further comprised by your path through that space,
                    <br/><br/>
                    the way in which you navigate it over time,
                    <br/><br/>
                    the way your feelings change to reflect the circumstances.
                    <br/><br/>
                    <div class="interp"><i>
                    "You are writing your story now, my dear.
                    <br/><br/>
                    And reading it too.
                    <br/><br/>
                    Where will you go?"
                    </i></div>`;
                }
            } else {
                message = `
                There must be more to understand.`;

                world_update = chain_update(world_update, {
                    has_understood: {
                        'tangle, failure': true
                    }
                });
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

            let choice_str: string = yield parser.consume_option([
                set_enabled(['first', 'fragment'], !this.state.has_understood['tangle, 1'] && prev_contention !== 'tangle, 1'),
                set_enabled(['second', 'fragment'], !this.state.has_understood['tangle, 2'] && prev_contention !== 'tangle, 2'),
                set_enabled(['third', 'fragment'], !this.state.has_understood['tangle, 3'] && prev_contention !== 'tangle, 3')
            ]);
            let choice = tokenize(choice_str)[0][0];

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
            
            const contentions = infer_literal_array(
                'tangle, 1',
                'tangle, 2',
                'tangle, 3'
            )

            type ContentionID = typeof contentions[number];

            let contention_2_option: {[K in ContentionID]: string[]} = {
                'tangle, 1': ['tangle'],
                'tangle, 2': ['outside', 'vantage'],
                'tangle, 3': ['dance']
            };

            let choice = yield parser.consume_option(contentions.map(c =>
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
                // TODO: different messages depending on
                // Where you are
                // Which thing you tried to reify
                if (prev_interp_action['considering a fragment'] !== om_id_2_contention[this.current_om()]) {
                    message = wrap_in_div(`
                    You struggle to connect "the ${choice}" to your present environment and circumstance.`);
                } else {
                    if (prev_interp_action['considering a fragment'] === 'tangle, 2') {
                        message = wrap_in_div(`
                        You think the viewing tower might correspond to "the ${choice}".
                        <br/><br/>
                        However, the first fragment mentions a "tangle", which you still don't entirely understand.
                        <br/><br/>
                        Until you do, it will be hard to say what this ${choice} helps to elucidate.`);
                    } else if (prev_interp_action['considering a fragment'] === 'tangle, 3') {
                        // If they have visited both the tangle and viewing tower
                        let must_have_visited: ObserverMomentID[] = ['woods, tangle', 'tower, peak'];
                        if (must_have_visited.every(x => this.state.experiences.includes(x))) {
                            let incomplete_msg_parts: string[] = [];
                            if (!this.state.has_understood['tangle, 1']) {
                                incomplete_msg_parts.push(`the first fragment's "tangle"`)
                            }
                            if (!this.state.has_understood['tangle, 2']) {
                                incomplete_msg_parts.push(`the second fragment's "outside vantage"`);
                            }

                            let incomplete_msg = incomplete_msg_parts.join(' or ');

                            message = wrap_in_div(`
                            The idea of "the ${choice}" is beginning to feel familiar, with all your motion in and out of the twisting woods, up and down the viewing tower.
                            <br/><br/>
                            But you still don't entirely understand ${incomplete_msg}.
                            <br/><br/>
                            Until you do, it will be hard to say why this ${choice} is worth returning to.`);
                        } else {
                            message = wrap_in_div(`
                            You struggle to connect "the ${choice}" to your present environment and circumstance.`);
                        }
                    }
                }
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
        if (h_world.current_om() === this.current_om() && h_world.current_om() in om_id_2_contention) {
            let {
                prev_interp_action = 'ending interpretation',
                index = 0,
                begin_tag = -1
            }: InterpState = this.get_current_om_state();

            let {
                prev_interp_action: h_prev_inter_action = 'ending interpretation',
                index: h_index = 0,
                begin_tag: h_begin_tag = -1,
                hide_failures: h_hide_failures = false
            }: InterpState = h_world.get_current_om_state();
            
            if (prev_interp_action === 'ending interpretation') {
                if (!this.state.has_understood[om_id_2_contention[this.current_om()]]) {
                    if (h_hide_failures) {
                        if (h_index > begin_tag && h_index <= index) {
                            return [{'add': 'forgotten'}];
                        }
                    } else {
                        if (h_index > begin_tag + 1 && h_index < index) {
                            return [{'add': 'forgotten'}];
                        }
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
            You notice that the brown trunks of oak are sprinkled with the white of birch here and there.
            <br/><br/>
            And on the ground, partially covered in leaves, is a fragment of parchment paper.`,
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
                            [['at', 'the', 'fragment'], 'note fragment']]).call(this, parser);
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
                        yield parser.consume_filler(['it']);
                        yield parser.done()

                        return {
                            message: wrap_in_div(`
                            You pick it up.
                            <br/><br/>
                            It's been torn from a full page.
                            <br/><br/>
                            You recognize your own loopy scrawl on the parchment paper.
                            <br/><br/>
                            <div class="alien-interp">
                            Who would tear apart your <i>life's work?</i>
                            <br/><br/>
                            Is there any hope at all that it can be recovered?
                            </div>`),
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
                    yield parser.consume_option([
                        annotate(['continue'], {
                            display: DisplayEltType.keyword,
                            enabled: this.state.has_regarded['tangle, 1']
                        })]);
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
            More birch trees appear as your trudge onward.
            <br/><br/>
            Another fragment of parchment paper catches your eye on the ground.`,
            handle_command: wrap_handler(function *(parser: CommandParser) {
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
                    yield parser.consume_filler(['the', 'second', 'fragment']);
                    yield parser.done();

                    return this.regard('tangle, 2', (msg) => wrap_in_div(`
                    It reads:
                    <br/><br/>
                    ${msg}`));

                });

                let continue_consumer = wrap_handler(function*(parser:CommandParser) {
                    yield parser.consume_option([
                        annotate(['continue'], {
                            enabled: Boolean(this.state.has_regarded['tangle, 2']),
                            display: DisplayEltType.keyword
                        })]);
                    yield parser.consume_filler(['through', 'the']);
                    yield parser.consume_filler(['birch', 'forest']);
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
            id: 'woods, clearing',
            enter_message: `
            You arrive at a small clearing, surrounded by the parchment-white of birch.
            <br/><br/>
            The path forward branches in two:
            <br/>
            <blockquote>
                In one direction, the path narrows and bends sharply behind a roiling wall of birch.
                <br/><br/>
                In another, a looming structure of some kind stands beyond the trees.
            </blockquote>
            A third fragment lies on the ground.`,
            short_enter_message: `
            You arrive back at the clearing.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let take_consumer = wrap_handler(function*(parser: CommandParser) {
                    if (this.state.has_regarded['tangle, 3']) {
                        yield parser.invalidate();
                    }

                    yield parser.consume_option([
                        annotate(['take'], {
                            display: DisplayEltType.keyword,
                            enabled: !this.state.has_regarded['tangle, 3']
                        })
                    ]);
                    yield parser.consume_filler(['the', 'third', 'fragment']);
                    yield parser.done()

                    return this.regard('tangle, 3', (msg) => wrap_in_div(`
                    It reads:
                    <br/><br/>
                    ${msg}
                    <br/>
                    This completes the transcript!
                    <br/><br/>
                    The three fragments comprise a full page from your notes.`));
                });

                let go_consumer = wrap_handler(function*(parser:CommandParser) {
                    let {prev_interp_action = 'ending interpretation'} : InterpState = this.get_current_om_state();

                    if (prev_interp_action !== 'ending interpretation') {
                        yield parser.invalidate();
                    }

                    yield parser.consume_option([
                        annotate(['proceed'], {
                            enabled: this.state.has_regarded['tangle, 3'],
                            display: DisplayEltType.keyword
                        })]);

                    let go_tangle_consumer = wrap_handler(function*(parser: CommandParser) {
                        if (!this.state.has_understood['tangle, 3']) {
                            yield parser.consume_filler(['inward']);
                            yield parser.consume_filler(['on', 'the']);
                            yield parser.consume_exact(['narrow', 'path'], DisplayEltType.option);
                            yield parser.done();

                            return this.transition_to('woods, tangle');
                        } else {
                            yield parser.consume_filler(['inward,']);
                            yield parser.consume_filler(['interrogating']);
                            yield parser.consume_exact(['my', 'perceptions'], DisplayEltType.option);
                            yield parser.done();

                            return this.transition_to('inward, 1');
                        }
                    });
                    
                    let go_tower_consumer = wrap_handler(function*(parser: CommandParser) {
                        if (!this.state.has_understood['tangle, 3']) {
                            yield parser.consume_filler(['outward']);
                            yield parser.consume_filler(['to', 'the']);
                            yield parser.consume_exact(['looming', 'structure'], DisplayEltType.option);
                            yield parser.done();

                            return this.transition_to('tower, base');
                        } else {
                            yield parser.consume_filler(['outward,']);
                            yield parser.consume_filler(['seeking']);
                            yield parser.consume_exact(['the', 'mountain'], DisplayEltType.option);
                            yield parser.done();

                            return this.transition_to('outward, 1');
                        }
                    });

                    return combine.call(this, parser, [go_tangle_consumer, go_tower_consumer]);
                });

                return combine.call(this, parser, [
                    take_consumer,
                    make_tangle_consumer(Boolean(this.state.has_regarded['tangle, 3'])),
                    go_consumer
                ]);
            }),
            dest_oms: ['woods, clearing', 'woods, tangle', 'tower, base', 'inward, 1', 'outward, 1'],
            interpret_history: function (this: VenienceWorld, history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
                let result: HistoryInterpretationOp = tangle_interpreter.call(this, history_elt) || [];

                let ending_oms: ObserverMomentID[] = [
                    'inward, 1',
                    'inward, 2',
                    'inward, 3',
                    'inward, 4',
                    'inward, 5',
                    'reading the story of charlotte',
                    'outward, 1',
                    'outward, 2',
                    'outward, 3',
                    'outward, 4',
                ];

                if (ending_oms.includes(history_elt.world.current_om())) {
                    result.push({'add': 'forgotten'});
                } else if (history_elt.world.current_om() === 'woods, clearing') {
                    if (['inward, 1', 'outward, 1'].some(x => history_elt.world.state.has_visited[x])) {
                        result.push({'add': 'forgotten'});
                    }
                }
                return result;
            }
        },
        {
            id: 'woods, tangle',
            enter_message: `
            The path narrows to form a space just wide enough to fit your body.
            <br/><br/>
            You step carefully, bending around corners, surrounded by parchment-white bark.
            <br/><br/>
            You arrive at a dead end.
            <br/><br/>
            You feel as though you have arrived somewhere significant, though you have nowhere to go now but back.`,
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

                    let dest: ObserverMomentID = 'woods, clearing';
                
                    return this.transition_to(dest);
                });

                return combine.call(this, parser, [make_tangle_consumer(), return_consumer]);

            }),
            dest_oms: ['woods, tangle', 'woods, clearing'],
            interpret_history: tangle_interpreter
        },
        {
            id: 'tower, base',
            enter_message: `
            As you make your way outward, the forest begins to thin.
            <br/><br/>
            You arrive at the base of a wooden viewing tower, erected perfectly among the trees.`,
            short_enter_message: `
            You arrive at the viewing tower's base.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let look_consumer = this.make_look_consumer([[['at', 'the', 'tower'], 'tangle, tower base']]);

                let ascend_consumer = wrap_handler(function*(parser: CommandParser) {
                    // Climbs the tower
                    yield parser.consume_option([
                        annotate(['ascend'], {
                            display: DisplayEltType.keyword,
                            enabled: this.state.has_regarded['tangle, tower base']
                        })]);
                    yield parser.consume_filler(['the', 'viewing', 'tower']);
                    yield parser.done();

                    return this.transition_to('tower, peak');
                });

                let return_consumer = wrap_handler(function*(parser: CommandParser) {
                    // Returns to the clearing
                    yield parser.consume_exact(['return']);
                    yield parser.consume_filler(['to', 'the']);
                    yield parser.consume_filler(['clearing']);

                    yield parser.done();

                    let dest: ObserverMomentID = 'woods, clearing';

                    return this.transition_to(dest);
                });

                return combine.call(this, parser, [look_consumer, ascend_consumer, return_consumer]);
            }),
            dest_oms: ['tower, peak', 'woods, clearing']
        },
        {
            id: 'tower, peak',
            enter_message: `
            As your feet thud up the heavy stairs, your view begins to change.
            <br/><br/>
            You can see over the parchment-white treeline.
            <br/><br/>
            The sky streches further and further across the horizon.
            <br/><br/>
            You set foot on the top platform.`,
            short_enter_message: `
            You climb the stairs and arrive at the tower's top platform.`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let survey_consumer = wrap_handler(function*(parser: CommandParser) {
                    yield parser.consume_option([
                        annotate(['survey'], {
                            display: DisplayEltType.keyword,
                            enabled: !this.state.has_regarded['tangle, tower peak']
                        })]);

                    yield parser.consume_filler(['the', 'horizon']);
                    yield parser.done();

                    return this.regard('tangle, tower peak');
                });

                let descend_consumer = wrap_handler(function*(parser: CommandParser) {
                    let {prev_interp_action = 'ending interpretation'} : InterpState = this.get_current_om_state();

                    if (prev_interp_action !== 'ending interpretation') {
                        yield parser.invalidate();
                    }

                    yield parser.consume_exact(['descend']);
                    yield parser.done();

                    return this.transition_to('tower, base');
                });
                
                return combine.call(this, parser, [
                    make_tangle_consumer(Boolean(this.state.has_regarded['tangle, tower peak'])),
                    survey_consumer,
                    descend_consumer
                ]);       
            }),
            interpret_history: tangle_interpreter,
            dest_oms: ['tower, base', 'tower, peak'] // , 'tower, base 2'
        },
        {
            id: 'inward, 1',
            enter_message: `
            You proceed again into the narrow, winding path.
            <br/><br/>
            The parchment-white trees surrounding you ebb and flow, carving a tangled, wild route to the center.`,
            transitions: [
                [['*consider', 'the', 'familiar qualities', 'of', 'birch bark'], 'inward, 2']]
        },
        {
            id: 'inward, 2',
            enter_message: `
            It strikes you how <i>parchment-like</i> birch bark is.
            <br/><br/>
            It has roughly the same off-white color as your own note paper.
            <br/><br/>
            And it often appears embedded with dark, script-like etchings.
            <br/><br/>
            <div class="interp"><i>
            "Indeed.
            <br/><br/>
            Like writing."
            </i></div>`,
            transitions: [
            [['begin', '*interpretation'], 'inward, 3']]
        },
        {
            id: 'inward, 3',
            enter_message: `
            You are surrounded by a twisting, roiling wall of birch trees.
            <div class="interp-parchment-trees">
            <br/>
            You are surrounded by a meticulous, exhaustive continuum of etched parchment.
            </div>`,
            transitions: [
            [['*consider', 'the', 'second sense', 'of', 'birch bark'], 'inward, 4']]
        },
        {
            id: 'inward, 4',
            transitions: [
            [['end', '*interpretation'], 'inward, 5']],
            interpretations: {
                'inward, 3': [{add: 'interp-parchment-trees-enabled'}]
            }
        },
        {
            id: 'inward, 5',
            enter_message: `
            <div class="interp">
            The parchment surrounding you teems with scrawlings of
            <br/><br/>
            stories,
            <br/><br/>
            transcripts,
            <br/><br/>
            annotations,
            <br/><br/>
            <i>
            and interpretations.
            </i>
            </div>`,
            handle_command: wrap_handler(function*(parser: CommandParser) {
                let {read_state = 0}: {read_state: number} = this.get_current_om_state();
                

                let apply_read_update = (world=this) => world.update({
                    om_state: {
                        [this.current_om()]: {
                            read_state: read_state + 1
                        }
                    }
                });

                let read_consumer = wrap_handler(function*(parser: CommandParser) {
                    yield parser.consume_option([
                        annotate(['read'], {
                            display: DisplayEltType.keyword,
                            enabled: true
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
                            <div class="interp">
                            Your eyes skim over the vast text laid out before you for a moment, searching.
                            <br/><br/>
                            Then, you come to rest on one particular story.
                            </div>`)
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

                return combine.call(this, parser, [read_consumer]);

            }),
            dest_oms: ['reading the story of charlotte']
        },
        {
            id: 'reading the story of charlotte',
            enter_message: `
            <i>You have reached the end of the demo.
            <br/><br/>
            Charlotte's story will be told in Chapter 2.
            <br/><br/>
            Thanks for playing Venience World!
            <br/><br/>
            Feel free to return to the clearing and proceed differently.
            </i>`,
            transitions: [
            [['*return', 'to the', 'clearing'], 'woods, clearing']]
        },
        {
            id: 'outward, 1',
            enter_message: `
            You walk back out to the base of the viewing tower, and continue past it,
            <br/><br/>
            cutting into the woods where the footpath ends.
            <br/><br/>
            As you proceed, the birch trees become sparser, and the oak thickens again.`,
            transitions: [
                [['*consider', 'what lies ahead'], 'outward, 2']]
        },
        {
            id: 'outward, 2',
            enter_message: `
            <div class="interp"><i>
            "An adventure, my dear.
            <br/><br/>
            Challenges, the likes of which you have not anticipated.
            <br/><br/>
            Opportunities to learn and grow."
            </i></div>`,
            transitions: [
                [['begin', '*interpretation'], 'outward, 3']]
        },
        (() => {
            const interp_steps = infer_literal_array(
                'the calamity',
                'the shattered mirror',
                'the ice-covered mountain',
                'her voice'
            );
            type InterpStep = typeof interp_steps[number];

            return<ObserverMoment>{
                id: 'outward, 3',
                enter_message: `
                You remember fragments from your dream last night.
                <br/><br/>
                There was
                <br/><br/>
                
                <div class="alien-interp"><i>
                calamity
                <br/><br/>
                </i></div>
                <div class="reif-dream-1">
                Katya's death,
                <br/><br/>
                and the destruction that her loss wrought on your life
                <br/><br/>
                </div>
                
                <div class="interp">
                a <i>shattered mirror</i>
                <br/><br/>
                </div>
                <div class="reif-dream-2">
                the unexplained scattering of your notes across the land
                <br/><br/>
                </div>
                
                <div class="interp">
                an <i>ice-covered mountain</i>
                <br/><br/>
                </div>
                <div class="reif-dream-3">
                the literal mountain that stands in wait across the river
                <br/><br/>
                </div>
                
                <div class="interp">
                and <i>her voice.</i>
                </div>
                <div class="reif-dream-4">
                <br/>
                and <i>your determination to understand;</i>
                <br/><br/>
                to return to the world you left;
                <br/><br/>
                to intervene in its unfolding.
                </div>`,
                handle_command: wrap_handler(function*(parser: CommandParser) {
                    let {
                        has_interpreted = {},
                        prev_interp = null
                    }: {
                        has_interpreted: {
                            [K in InterpStep]: boolean
                        },
                        prev_interp: InterpStep
                    } = this.get_current_om_state();

                    let ready_for_last = interp_steps.slice(0, 3).every(x => has_interpreted[x]);
                    let finished = interp_steps.every(x => has_interpreted[x]);

                    let reify_consumer = wrap_handler(function*(parser: CommandParser) {
                        yield parser.consume_option([
                            annotate(['reify'], {
                                display: DisplayEltType.keyword,
                                enabled: !finished
                            })]);

                        let opt1: string = yield parser.consume_option([
                            annotate(['the'], {
                                display: DisplayEltType.filler,
                                enabled: !ready_for_last
                            }),
                            annotate(['her'], {
                                display: DisplayEltType.filler,
                                enabled: ready_for_last
                            })
                        ]);

                        let opt2: string;

                        if (opt1 === 'the') {
                            opt2 = yield parser.consume_option([
                                annotate(['calamity'], {enabled: !has_interpreted['the calamity']}),
                                annotate(['shattered', 'mirror'], {enabled: !has_interpreted['the shattered mirror']}),
                                annotate(['ice-covered', 'mountain'], {enabled: !has_interpreted['the ice-covered mountain']})
                            ]);
                        } else {
                            yield parser.consume_exact(['voice'], DisplayEltType.option);
                            opt2 = 'voice';
                        }

                        yield parser.done();

                        let chosen_step: InterpStep = <InterpStep>(opt1 + ' ' + opt2);
                        
                        return {
                            world: this.update({
                                om_state: {
                                    [this.current_om()]: {
                                        has_interpreted: {
                                            [chosen_step]: true
                                        },
                                        prev_interp: chosen_step
                                    }
                                }
                            })
                        }
                    });

                    let end_consumer = wrap_handler(function*(parser: CommandParser) {
                        yield parser.consume_option([
                            annotate(['end'], {
                                display: DisplayEltType.filler,
                                enabled: finished
                            })]);

                        yield parser.consume_exact(['interpretation']);
                        yield parser.done();

                        let result = this.transition_to('outward, 4');
                        result.world = result.world.update({
                            om_state: {
                                [this.current_om()]: {
                                    has_interpreted: {},
                                    prev_interp: null
                                }
                            }
                        }, [this.current_om()]);

                        return result;
                    });

                    return combine.call(this, parser, [reify_consumer, end_consumer]);
                }),
                dest_oms: ['outward, 4'],
                interpret_history: function (this: VenienceWorld, history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
                    
                    if (history_elt.world.current_om() === this.current_om()) {
                        let {
                            has_interpreted = {},
                            prev_interp = null
                        }: {
                            has_interpreted: {
                                [K in InterpStep]: boolean
                            },
                            prev_interp: InterpStep
                        } = this.get_current_om_state();

                        let {prev_interp: h_prev_interp = null} = history_elt.world.get_current_om_state();

                        if (h_prev_interp === null) {
                            if (prev_interp === 'the calamity') {
                                return [{add: 'reif-dream-1-enabled'}];
                            } else if (prev_interp === 'the shattered mirror') {
                                return [{add: 'reif-dream-2-enabled'}];
                            } else if (prev_interp === 'the ice-covered mountain') {
                                return [{add: 'reif-dream-3-enabled'}];
                            } else if (prev_interp === 'her voice') {
                                return [{add: 'reif-dream-4-enabled'}];
                            }
                        }
                    }
                }
            }
        })(),
        {
            id: 'outward, 4',
            enter_message: `
            <i>You have reached the end of the demo.
            <br/><br/>
            Your journey to the mountain will be told in Chapter 2.
            <br/><br/>
            Thanks for playing Venience World!
            <br/><br/>
            Feel free to return to the clearing and proceed differently.
            </i>`,
            transitions: [
            [['*return', 'to the', 'clearing'], 'woods, clearing']]
        }
    ];
});

let ch1_perceptions: () => Perception[] = () => [
    {
        id: 'forest, general',
        content: `
        The sun trickles through the thick brush.
        <br/><br/>
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
        It appears to be a fragment from your missing notes.`
    },
    {
        id: 'tangle, tower base',
        content: `
        The tower evokes a solid, steadfast presence.
        <br/><br/>
        Its construction is orderly and massive.
        <br/><br/>
        A grid of thick, vertical wooden beams rooted deep within the ground provides its sturdy foundation.
        <br/><br/>
        Heavy wooden slabs form a railed stairway that winds up to the top platform.
        <br/><br/>
        The wood is damp and weathered to a greenish brown, as though it has been here for an eternity.`
    },
    {
        id: 'tangle, tower peak',
        content: `
        The sun dances over the top of the canopy. You see the parchment-white birch trees flow into the brown of oak, and the fuzzy-green of distant pine.
        <br/><br/>
        You survey the looping threads of passage through the woods.
        <br/><br/>
        You see the trail you took to reach this viewing tower. You see it flow back into the clearing, which in turn flows into the narrow, winding path through the birch thicket.
        <br/><br/>
        Further out, a frozen river carves the forest in half.
        </br><br/>
        And beyond that, the base of a snow-covered mountain.`
    },
    {
        id: 'tangle, 1',
        content: `
        <div class="interp"><i>
        "We wander, for the most part, within a tangled, looping mess of thought;
        <br/><br/>
        a haphazard ligature of unrelated perceptions.
        <br/><br/>
        Within the tangle, we lack the perspective to find the meaning we seek.”
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
        All there is to do, once one has stood outside the tangle for a while and surveyed it,
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