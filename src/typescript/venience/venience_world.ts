import {
    CommandResult,
    InterstitialUpdateResult,
    HistoryInterpretationOp,
    WorldType
} from '../commands'

import {
    CommandParser,
    with_early_stopping,
    consume_option_stepwise_eager
} from '../parser'

import {
    FuckDict,
    FuckSet,
    array_fuck_contains
} from '../datatypes';

import {untokenize} from '../text_tools';

import {
    ObserverMomentID,
    ObserverMoment,
    alcove_oms
} from './observer_moments';



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
    remembered_meditation?: boolean
}

export class VenienceWorld implements WorldType<VenienceWorld>{

    readonly experiences: ObserverMomentID[];
    readonly history_index: number;
    
    readonly remembered_meditation: boolean;

    constructor({experiences, history_index, remembered_meditation}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = false;
        }

        this.experiences = experiences;
        this.history_index = history_index;
        this.remembered_meditation = remembered_meditation;
    }

    update({experiences, history_index, remembered_meditation}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = this.experiences;
        }
        if (history_index === undefined) {
            history_index = this.history_index;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = this.remembered_meditation;
        }

        return new VenienceWorld({experiences, history_index, remembered_meditation});
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

            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd)

            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }

            let cmd_choice = yield* consume_option_stepwise_eager(parser, cmd_options);

            yield parser.done();

            let om_id_choice = world.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });

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

        if (this.current_om() === 'top, surveying') {
            world_update.remembered_meditation = true;
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
        
        let interp_op: HistoryInterpretationOp = [];

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
                interp_op.push({'add': 'forgotten'});
            }
        }

        if (current_om === 'alcove, interpreting 1') {
            if (hist_om === 'alcove, beginning interpretation'){
                interp_op.push({'add': 'interp-alcove-1-enabled'})
            }
        }

        if (current_om === 'alcove, interpreting 2') {
            if (hist_om === 'alcove, beginning interpretation'){
                interp_op.push({'add': 'interp-alcove-2-enabled'})
            }
        }

        if (current_om === 'alcove, interpreting 3') {
            if (hist_om === 'alcove, beginning interpretation'){
                interp_op.push({'add': 'interp-alcove-3-enabled'})
            }
        }

        if (this.experiences[history_elt.world.history_index] === null) {
            interp_op.push({'add': 'forgotten'});
        }

        if (this.remembered_meditation && history_elt.message !== undefined) {
            let notes = history_elt.message.querySelectorAll('.meditation-1');
            if (notes.length > 0){
                console.log('enabling meditation on an elt');
                interp_op.push({'add': 'meditation-1-enabled'});
            }
        }

        return interp_op;
    }
}
