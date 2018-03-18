import {
    CommandResult,
    CommandHandler,
    InterstitialUpdateResult,
    HistoryInterpreter,
    HistoryInterpretationOp,
    World
} from '../commands'

import {
    CommandParser,
    DisplayEltType,
    with_early_stopping,
    consume_option_stepwise_eager,
    PhraseDSLValidator
} from '../parser'

import {
    FuckDict,
    FuckSet,
    array_fuck_contains,
    set_enabled,
    annotate,
    ValidString
} from '../datatypes';

import {
    tokenize,
    untokenize,
    wrap_in_div
} from '../text_tools';

import {
    ObserverMomentID,
    ObserverMoment,
    are_transitions_declarative,
    has_interpretations,
    are_interpretations_declarative,
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

export type VenienceWorldState = {
    experiences?: ObserverMomentID[],
    history_index?: number,
    om_state?: {[K in ObserverMomentID]?: any},
    has_regarded?: {[K in PerceptionID]?: boolean}
}

export type VenienceWorldCommandHandler = CommandHandler<VenienceWorldState>;

export type VenienceWorldCommandResult = CommandResult<VenienceWorldState>;

export type VenienceWorldInterstitialUpdateResult = InterstitialUpdateResult<VenienceWorldState> & {
    world: VenienceWorld
}

export type VenienceWorldHistoryInterpreter = {
    interpret_history(this: VenienceWorld, history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp
};

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
            experiences = ['bed, sleeping 1'];
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
            let exp: ObserverMomentID = this.state.experiences[i];
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null or empty history.";
    }

    get_om_state(om_id: ObserverMomentID) {
        return this.state.om_state[om_id] || {};
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

            if (!are_transitions_declarative(om)) {
                //dispatch to a more specific handler
                return om.handle_command.call(this, parser)
                
            }

            // we know these are valid because we indexed them
            // too lazy to thread the validity tag up thru the types :(
            let cmd_options = <ValidString<PhraseDSLValidator>[][]>om.transitions.map(([cmd, om_id]) => cmd)

            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }

            let cmd_choice = consume_option_stepwise_eager(parser, cmd_options);

            if (cmd_choice !== false){
                yield parser.done();
            }

            let om_id_choice: ObserverMomentID = this.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });

            return this.transition_to(om_id_choice);

        });
    }

    make_look_consumer(look_options: [string[], PerceptionID][], enabled=true) {
        return wrap_handler(function*(parser: CommandParser){
            let cmd_enabled = enabled && !look_options.every(([cmd, t]) => this.state.has_regarded[t])
            
            yield parser.consume_option([annotate(['look'], {
                enabled: cmd_enabled,
                display: DisplayEltType.keyword
            })]);

            // let options = look_options.map(([opt_toks, t]) => {
            //     if (this.state.has_regarded[t]) {
            //         return ['~' + opt_toks[0], ...opt_toks.slice(1)];
            //     } else {
            //         return opt_toks;
            //     }
            // });

            // let opt = yield consume_option_stepwise_eager(parser, options);
            // yield parser.done();

            let options = look_options.map(([opt_toks, t]) =>
                set_enabled(opt_toks, !(this.state.has_regarded[t] || false))
            );

            let opt = yield parser.consume_option(options);
            yield parser.done();

            let target: PerceptionID = null;
            for (let [opt_toks, t] of look_options) {
                if (untokenize(opt_toks) === opt) {
                    target = t;
                    break;
                }
            } 

            let result: VenienceWorldCommandResult = {
                world: this.update({
                    has_regarded: {
                        [target]: true
                    }
                }),
                message: wrap_in_div(VenienceWorld.perceptions[target].content)
            };
            return result;
        });
    }

    interstitial_update(message?: HTMLElement) {
        let result: CommandResult<VenienceWorldState> = {};
        let world_update: VenienceWorldState = {};

        // apply loop erasure
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

    interpret_history(history_elt: VenienceWorldInterstitialUpdateResult): HistoryInterpretationOp {
        // apply loop erasure mechanic
        if (this.state.experiences[history_elt.world.state.history_index] === null) {
            return [{'add': 'forgotten'}];
        }

        // apply the OM-specific interpretation
        let om = VenienceWorld.observer_moments.get(this.current_om());
        if (has_interpretations(om)) {
            if (are_interpretations_declarative(om)) {
                return om.interpretations[history_elt.world.current_om()];
            } else {
                return om.interpret_history.call(this, history_elt);
            }
        }
    }
}
