import {
    CommandResult,
    CommandHandler,
    InterstitialUpdateResult,
    HistoryInterpretationOp,
    WorldType
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
    array_fuck_contains
} from '../datatypes';

import {tokenize, untokenize} from '../text_tools';

import {
    ObserverMomentID,
    ObserverMoment,
    alcove_oms
} from './observer_moments';

import {
    has_transition_list
} from './transition_list';


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
}

export type VenienceWorldCommandHandler = CommandHandler<VenienceWorld>;

export class VenienceWorld implements WorldType<VenienceWorld>{

    readonly experiences: ObserverMomentID[];
    readonly history_index: number;
    
    constructor({experiences, history_index}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        
        this.experiences = experiences;
        this.history_index = history_index;
    }

    update({experiences, history_index}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = this.experiences;
        }
        if (history_index === undefined) {
            history_index = this.history_index;
        }

        return new VenienceWorld({experiences, history_index});
    }

    current_om(): ObserverMomentID {
        for (let i = this.experiences.length - 1; i >= 0; i--) {
            let exp = this.experiences[i]
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null history.";
    }

    handle_command(parser: CommandParser) {
        let world = this;
        return with_early_stopping(function*(parser: CommandParser) {
            let om = alcove_oms.get(world.current_om());

            if (!has_transition_list(om)) {
                //dispatch to a fancier handler
                return;
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
                    tokenize(phrase)
                    yield parser.consume_exact(tokenize(phrase)[0], display);
                }
                yield parser.done();

            } else {
                let cmd_choice = yield* consume_option_stepwise_eager(parser, cmd_options);

                yield parser.done();

                om_id_choice = world.current_om();
                om.transitions.forEach(([cmd, om_id]) => {
                    if (cmd_choice === untokenize(cmd)) {
                        om_id_choice = om_id;
                    }
                });
            }

            return {world: world.update({
                        experiences: [...world.experiences, om_id_choice],
                        history_index: world.history_index + 1
                    })};
        })(parser);
    }

    interstitial_update() {
        let result: CommandResult<VenienceWorld> = {};
        let world_update: VenienceWorldState = {};

        let message_parts: string[] = [];

        let om_descr = alcove_oms.get(this.current_om()).message;

        message_parts.push(om_descr);

        if (this.experiences.length > 0) {
            let loop_idx = this.experiences.indexOf(this.current_om());
            if (loop_idx !== this.experiences.length - 1) {
                let new_experiences = this.experiences.slice().fill(null, loop_idx + 1);
                world_update.experiences = new_experiences;
            }
        }

        if (message_parts.length > 0) {
            result.message = document.createElement('div');
            result.message.innerHTML = message_parts.join('\n\n');
        }

        if (Object.keys(world_update).length > 0){
            result.world = this.update(world_update);
        }

        return result;
    }

    interpret_history(history_elt: InterstitialUpdateResult<VenienceWorld>): HistoryInterpretationOp {
        
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

        if (this.experiences[history_elt.world.history_index] === null) {
            interpretation_op.push({'add': 'forgotten'});
        }

        return interpretation_op;
    }
}
