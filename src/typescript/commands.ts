import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

import {
    Annotatable,
    annotate,
    Disablable,
    unwrap,
    get_annotation,
    with_annotatable,
    with_disablable,
    set_enabled,
    is_enabled
} from './datatypes';

import {CommandParser, DisplayEltType, Token, MatchValidity} from './parser';

export interface WorldType<T extends WorldType<T>> {
    handle_command(parser: CommandParser): CommandResult<T>,
    interstitial_update?(): InterstitialUpdateResult<T>,
    interpret_history?(history: InterstitialUpdateResult<T>): HistoryInterpretationOp
}

export type InterstitialUpdateResult<T extends WorldType<T>> = {
    world?: T;
    message?: HTMLElement;
} | undefined;

export type CommandResult<T extends WorldType<T>> = InterstitialUpdateResult<T> & {
    parser?: CommandParser;
} | undefined;

export type HistoryInterpretation = string[];

export type HistoryInterpretationOp = ({'add': string} | {'remove': string})[];

export type PostProcessedCommandResult<T extends WorldType<T>> = CommandResult<T> & {
    index?: number;
    message_classes?: HistoryInterpretation;
}

export interface Command<T extends WorldType<T>> {
    command_name: Token[];
    execute: (world: T, parser: CommandParser) => CommandResult<T>;
}

export function apply_command<T extends WorldType<T>> (world: T, cmd: string) {
    let parser = new CommandParser(cmd);

    let result: CommandResult<T> = {parser: parser, world: world};
    let cmd_result = world.handle_command(parser)
    
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

function apply_interstitial_update<T extends WorldType<T>>(result: CommandResult<T>): CommandResult<T> {
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

class HistoryInterpretationError extends Error {};

function apply_history_interpretation_op(interp: HistoryInterpretation, op: HistoryInterpretationOp): HistoryInterpretation {
    if (op === undefined || op.length === 0){
        return interp;
    }
    let new_interp: HistoryInterpretation;
    if (interp === undefined) {
        new_interp = [];
    } else {
        new_interp = [...interp];
    }
    for (let o of op) {
        if (o['add'] !== undefined){
            let message_class = o['add'];
            if (new_interp.indexOf(message_class) === -1) {
                new_interp.push(message_class);
            }
        }
        if (o['remove'] !== undefined){
            let message_class = o['remove'];
            let idx = new_interp.indexOf(message_class);
            if (idx !== -1) {
                new_interp.splice(idx, 1);
            }
        }
    }
    return new_interp;
}

function apply_history_interpretation<T extends WorldType<T>>(history: PostProcessedCommandResult<T>[], world: T): PostProcessedCommandResult<T>[] {
    if (world.interpret_history === undefined) {
        return history;
    } else {
        let history_input = history.map(({world, message}) => ({world, message}));

        let interp_ops = history_input.map(world.interpret_history, world);

        let new_history = [];
        for (let i = 0; i < interp_ops.length; i++) {
            let new_elt = {...history[i]};
            let msg_clss = new_elt.message_classes;
            let op = interp_ops[i];
            new_elt.message_classes = apply_history_interpretation_op(msg_clss, op);
            new_history.push(new_elt);
        }
        return new_history;
    }
}

export class WorldDriver<T extends WorldType<T>> {
    previous_histories: PostProcessedCommandResult<T>[][] = [];

    history: PostProcessedCommandResult<T>[];

    possible_history: PostProcessedCommandResult<T>[];
    current_state: CommandResult<T>;

    constructor (initial_world: T) {
        let initial_result: PostProcessedCommandResult<T> = {world: initial_world};
        initial_result = apply_interstitial_update(initial_result);
        initial_result.index = 0;
        this.history = apply_history_interpretation([initial_result], initial_world);
 
        this.apply_command('', false); //populate this.current_state
    }

    apply_command(cmd: string, commit: boolean = true) {
        let prev_state = unwrap(this.history[this.history.length - 1]);
        let result: PostProcessedCommandResult<T> = apply_command(prev_state.world, cmd);
         
        result.index = prev_state.index + 1;

        this.current_state = result;

        if (this.current_state.parser.validity === MatchValidity.valid) {
            this.possible_history = apply_history_interpretation([...this.history, this.current_state], this.current_state.world);
            if (commit) {
                this.commit();
            }
        } else {
            this.possible_history = this.history;
        }
        return result;
    }

    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);

        //filter out any disabled history
        this.history = this.possible_history.filter(is_enabled); //.map(x => annotate(x, 1));

        this.apply_command('', false);
        return this.current_state;
    }
}

// eager dispatch

type WorldWithEagerDispatch<T extends WorldType<T>> = WorldType<T> & {
    get_commands(): Disablable<Command<T>>[],
}

export function eager_dispatch<T extends WorldWithEagerDispatch<T>>(world: T, parser: CommandParser) {
    let commands = world.get_commands();
    let options = commands.map((cmd) => with_disablable(cmd, (c) => c.command_name));
    
    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword);
    let result: CommandResult<T> = {parser: parser, world: world};

    if (!cmd_name) {
        return result;
    }

    let command = unwrap(commands[commands.findIndex((cmd) => (
        cmd_name === untokenize(unwrap(cmd).command_name)))]);

    let cmd_result = command.execute(world, parser);

    return cmd_result
}
