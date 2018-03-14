import {
    CommandResult,
    CommandHandler,
    InterstitialUpdateResult,
    HistoryInterpretationOp,
    World
} from '../commands'

import {
    CommandParser,
    DisplayEltType,
    with_early_stopping,
    consume_option_stepwise_eager
} from '../parser'

import {
    FuckDict,
    FuckSet,
    array_fuck_contains,
    set_enabled,
    annotate
} from '../datatypes';

import {
    tokenize,
    untokenize,
    wrap_in_div
} from '../text_tools';

import {
    ObserverMomentID,
    ObserverMoment,
    //venience_world_oms,
    is_declarative,
    index_oms,
    index_perceptions,
    PerceptionID
} from './observer_moments';

import prologue from './chapters/00_prologue';
import chapter_1 from './chapters/01_chapter_1';

//instead of homes, boxes

// Charlotte
// Southern rural culture
// Pacifier, baby's clothes, blanket
// Medical writeup, printed out

// Ben
// New england mist, trees
// All notes
// Musical score of numbers

// Danielle
// Coffee mug
// 

type VenienceWorldState = {
    experiences?: ObserverMomentID[],
    history_index?: number,
    om_state?: {[K in ObserverMomentID]?: any},
    has_regarded?: {[K in PerceptionID]?: boolean}
}

export type VenienceWorldCommandHandler = CommandHandler<VenienceWorldState>;

export type VenienceWorldCommandResult = CommandResult<VenienceWorldState>;

export let wrap_handler = (handler: (this: VenienceWorld, parser: CommandParser) => IterableIterator<any>): (parser: CommandParser) => VenienceWorldCommandResult => 
    function(this: VenienceWorld, parser: CommandParser) { return with_early_stopping(handler.bind(this))(parser); }

export class VenienceWorld extends World<VenienceWorldState>{

    static observer_moments = index_oms([
        ...prologue.observer_moments(),
        ...chapter_1.observer_moments()
    ]);

    static perceptions = index_perceptions([
        ...prologue.perceptions(),
        ...chapter_1.perceptions()
    ]);
    
    constructor({experiences, history_index, om_state, has_regarded}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1']; //['alcove, entering the forest']; 
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (om_state === undefined) {
            om_state = {};
        }
        if (has_regarded === undefined) {
            has_regarded = {};
        }
        
        super({experiences, history_index, om_state, has_regarded});
    }

    current_om(): ObserverMomentID {
        for (let i = this.state.experiences.length - 1; i >= 0; i--) {
            let exp = this.state.experiences[i]
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null or empty history.";
    }

    transition_to(dest: ObserverMomentID, include_enter_message=true) {
        let result: VenienceWorldCommandResult = {
            world: this.update({
                experiences: [...this.state.experiences, dest],
                history_index: this.state.history_index + 1
            })
        };
        if (include_enter_message) {
            let msg = VenienceWorld.observer_moments.get(dest).enter_message;
            if (msg !== undefined) {
                result.message = wrap_in_div(msg);
            }
        }
        return result;
    }

    get handle_command() {
        return wrap_handler(function*(parser: CommandParser) {
            let om = VenienceWorld.observer_moments.get(this.current_om());

            if (!is_declarative(om)) {
                //dispatch to a more specific handler
                return om.handle_command.call(this, parser)
                
            }

            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd)

            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }

            let om_id_choice: ObserverMomentID;

            if (cmd_options.length === 1) {
                let cmd = cmd_options[0];
                om_id_choice = om.transitions[0][1];
                for (let phrase of cmd) {
                    let display: DisplayEltType = DisplayEltType.filler;
                    if (phrase.charAt(0) === '*') {
                        display = DisplayEltType.keyword;
                        phrase = phrase.substring(1);
                    } else if (phrase.charAt(0) === '&') {
                        display = DisplayEltType.option;
                        phrase = phrase.substring(1);
                    }
                    yield parser.consume_exact(tokenize(phrase)[0], display);
                }
                yield parser.done();

            } else {
                let cmd_choice = yield* consume_option_stepwise_eager(parser, cmd_options);

                yield parser.done();

                om_id_choice = this.current_om();
                om.transitions.forEach(([cmd, om_id]) => {
                    if (cmd_choice === untokenize(cmd)) {
                        om_id_choice = om_id;
                    }
                });
            }

            return this.transition_to(om_id_choice);

        });
    }

    make_look_handler(look_options: [string[], PerceptionID][]) {
        return wrap_handler(function*(parser: CommandParser){
            if (look_options.every(([cmd, t]) => this.state.has_regarded[t])) {
                yield parser.consume_option([annotate(['look'], {enabled: false, display: DisplayEltType.keyword})]);
            }

            yield parser.consume_exact(['look']);

            let options = look_options.map(([opt_toks, t]) =>
                set_enabled(opt_toks, !(this.state.has_regarded[t] || false))
            );

            let opt = yield parser.consume_option(options);
            yield parser.done();

            let targ: PerceptionID = null;
            for (let [opt_toks, t] of look_options) {
                if (untokenize(opt_toks) === opt) {
                    targ = t;
                    break;
                }
            } 

            let result: VenienceWorldCommandResult = {
                world: this.update({
                    has_regarded: {
                        [targ]: true
                    }
                }),
                message: wrap_in_div(VenienceWorld.perceptions[targ].content)
            };
            return result;
        });
    }

    interstitial_update(message?: HTMLElement) {
        let result: CommandResult<VenienceWorldState> = {};
        let world_update: VenienceWorldState = {};

        let om = VenienceWorld.observer_moments.get(this.current_om());

        if (this.state.experiences.length > 0) {
            let loop_idx = this.state.experiences.indexOf(this.current_om());
            if (loop_idx !== this.state.experiences.length - 1) {
                let new_experiences = this.state.experiences.slice().fill(null, loop_idx + 1);
                world_update.experiences = new_experiences;
            }
        }

        if (Object.keys(world_update).length > 0){
            result.world = this.update(world_update);
        }

        return result;
    }

    interpret_history(history_elt: InterstitialUpdateResult<VenienceWorldState> & {world: VenienceWorld}): HistoryInterpretationOp {
        
        let interpretation_op: HistoryInterpretationOp = [];

        let current_om = this.current_om();
        let hist_om = history_elt.world.current_om();

        if (current_om === 'bed, awakening 2') {
            let to_forget: ObserverMomentID[] = [
                'bed, sleeping 1',
                'bed, awakening 1',
                'bed, sitting up 1',
                'bed, lying down 1',
                'bed, sleeping 2'
            ];
            if (array_fuck_contains(to_forget, hist_om)) {
                interpretation_op.push({'add': 'forgotten'});
            }
        }

        if (current_om === 'alcove, interpreting 1') {
            if (hist_om === 'alcove, beginning interpretation'){
                interpretation_op.push({'add': 'interp-alcove-1-enabled'})
            }
        }

        if (current_om === 'alcove, interpreting 2') {
            if (hist_om === 'alcove, beginning interpretation'){
                interpretation_op.push({'add': 'interp-alcove-2-enabled'})
            }
        }

        if (current_om === 'alcove, interpreting 3') {
            if (hist_om === 'alcove, beginning interpretation'){
                interpretation_op.push({'add': 'interp-alcove-3-enabled'})
            }
        }

        if (this.state.experiences[history_elt.world.state.history_index] === null) {
            interpretation_op.push({'add': 'forgotten'});
        }

        return interpretation_op;
    }
}
