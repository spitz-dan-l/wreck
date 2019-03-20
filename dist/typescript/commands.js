"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = require("./datatypes");
const parser_1 = require("./parser");
class World {
    constructor(state) {
        this.state = state;
    }
    update(state_updates, replace_keys) {
        let new_state = datatypes_1.chain_update(this.state, state_updates, replace_keys);
        return new this.constructor(new_state);
    }
}
exports.World = World;
function apply_command(world, cmd) {
    let parser = new parser_1.CommandParser(cmd);
    let result = { parser: parser, world: world };
    let cmd_result = world.handle_command(parser);
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
        result = apply_interstitial_update(result);
    }
    return result;
}
exports.apply_command = apply_command;
function apply_interstitial_update(result) {
    if (result.world.interstitial_update !== undefined) {
        let res2 = result.world.interstitial_update();
        if (res2 !== undefined) {
            if (res2.world !== undefined) {
                result.world = res2.world;
            }
            if (res2.message !== undefined) {
                //assume they updated the original message in some way   
                result.message = res2.message;
            }
        }
    }
    return result;
}
class HistoryInterpretationError extends Error {
}
;
function apply_history_interpretation_op(interp, op) {
    if (op === undefined || op.length === 0) {
        return interp;
    }
    let new_interp;
    if (interp === undefined) {
        new_interp = [];
    }
    else {
        new_interp = [...interp];
    }
    for (let o of op) {
        if (o['add'] !== undefined) {
            let message_class = o['add'];
            if (new_interp.indexOf(message_class) === -1) {
                new_interp.push(message_class);
            }
        }
        if (o['remove'] !== undefined) {
            let message_class = o['remove'];
            let idx = new_interp.indexOf(message_class);
            if (idx !== -1) {
                new_interp.splice(idx, 1);
            }
        }
    }
    return new_interp;
}
function apply_history_interpretation(history, world) {
    if (world.interpret_history === undefined) {
        return history;
    }
    else {
        let history_input = history.map(({ world, message }) => ({ world, message }));
        let interp_ops = history_input.map(world.interpret_history, world);
        let new_history = [];
        for (let i = 0; i < interp_ops.length; i++) {
            let new_elt = Object.assign({}, history[i]);
            let msg_clss = new_elt.message_classes;
            let op = interp_ops[i];
            new_elt.message_classes = apply_history_interpretation_op(msg_clss, op);
            new_history.push(new_elt);
        }
        return new_history;
    }
}
class WorldDriver {
    constructor(initial_world) {
        this.previous_histories = [];
        let initial_result = { world: initial_world };
        initial_result = apply_interstitial_update(initial_result);
        initial_result.index = 0;
        this.history = apply_history_interpretation([initial_result], initial_world);
        this.apply_command('', false); //populate this.current_state
    }
    apply_command(cmd, commit = true) {
        let prev_state = datatypes_1.unwrap(this.history[this.history.length - 1]);
        let result = apply_command(prev_state.world, cmd);
        result.index = prev_state.index + 1;
        this.current_state = result;
        if (this.current_state.parser.validity === parser_1.MatchValidity.valid) {
            this.possible_history = apply_history_interpretation([...this.history, this.current_state], this.current_state.world);
            if (commit) {
                this.commit();
            }
        }
        else {
            this.possible_history = this.history;
        }
        return result;
    }
    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);
        //filter out any disabled history
        this.history = this.possible_history.filter(datatypes_1.is_enabled); //.map(x => annotate(x, 1));
        this.apply_command('', false);
        return this.current_state;
    }
}
exports.WorldDriver = WorldDriver;
// eager dispatch
// type WorldWithEagerDispatch<T> = World<T> & {
//     get_commands(): Disablable<Command<T>>[],
// }
// export function eager_dispatch<T>(world: WorldWithEagerDispatch<T>, parser: CommandParser) {
//     let commands = world.get_commands();
//     let options = commands.map((cmd) => with_disablable(cmd, (c) => c.command_name));
//     let cmd_name = parser.consume_option(options, 'command');
//     let result: CommandResult<T> = {parser: parser, world: world};
//     if (!cmd_name) {
//         return result;
//     }
//     let command = unwrap(commands[commands.findIndex((cmd) => (
//         cmd_name === untokenize(unwrap(cmd).command_name)))]);
//     let cmd_result = command.execute(world, parser);
//     return cmd_result
// }
//# sourceMappingURL=commands.js.map