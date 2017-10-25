import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

import {
    Disablable,
    unwrap,
    is_enabled,
    set_enabled,
    with_disablable
} from './datatypes';

import {CommandParser, DisplayEltType, Token} from './parser';

export interface WorldType<T extends WorldType<T>> {
    get_commands(): Disablable<Command<T>>[],
    interstitial_update?(): InterstitialUpdateResult<T>,
}

export type InterstitialUpdateResult<T extends WorldType<T>> = {
    world?: T;
    message?: string;
    history_updater?: (history: CommandResult<T>[], world?: T) => Disablable<CommandResult<T>>[];
} | undefined;

export type CommandResult<T extends WorldType<T>> = {
    world?: T;
    message?: string;
    parser?: CommandParser;
    history_updater?: (history: CommandResult<T>[], world?: T) => Disablable<CommandResult<T>>[];
} | undefined;

export interface Command<T extends WorldType<T>> {
    command_name: Token[];
    execute: (world: T, parser: CommandParser) => CommandResult<T>;
}

export function apply_command<T extends WorldType<T>> (world: T, cmd: string) {
    let parser = new CommandParser(cmd);

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
    
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
        if (cmd_result.history_updater !== undefined) {
            result.history_updater = cmd_result.history_updater;
        }
    }

    result = apply_interstitial_update(result);
    
    return result;
}

function apply_interstitial_update<T extends WorldType<T>>(result: CommandResult<T>): CommandResult<T> {
    if (result.world.interstitial_update !== undefined) {
        //confusing, but we are running pre_command for the *next* command, not the one that just ran
        let res2 = result.world.interstitial_update();
        if (res2 !== undefined) {
            if (res2.world !== undefined) {
                result.world = res2.world;
            }
            if (res2.message !== undefined) {
                if (result.message !== undefined){
                    result.message += '\n\n' + res2.message;
                } else {
                    result.message = res2.message;
                }
            }
            if (res2.history_updater !== undefined) {
                result.history_updater = res2.history_updater;
            }
        }
    }
    return result;
}

function apply_history_update<T extends WorldType<T>>(history: CommandResult<T>[], result: CommandResult<T>): Disablable<CommandResult<T>>[] {
    if (result.history_updater === undefined) {
        return [...history, result];
    } else {
        return result.history_updater(history, result.world);
    }
}

export class WorldDriver<T extends WorldType<T>> {
    previous_histories: CommandResult<T>[][] = [];

    history: CommandResult<T>[];

    possible_history: Disablable<CommandResult<T>>[];
    current_state: CommandResult<T>;

    constructor (initial_world: T) {
        let initial_result: CommandResult<T> = {world: initial_world};
        initial_result = apply_interstitial_update(initial_result);
        this.history = [initial_result];
 
        this.apply_command('', false); //populate this.current_state
    }

    apply_command(cmd: string, commit: boolean = true) {
        let prev_state = this.history[this.history.length - 1];
        let result = apply_command(prev_state.world, cmd);
         
        this.current_state = result;
        this.possible_history = apply_history_update(this.history, this.current_state);
        if (commit) {
            this.commit();
        }
        return result;
    }

    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);

        //filter out any disabled history
        this.history = this.possible_history.filter(is_enabled).map(unwrap);

        this.apply_command('', false);
        return this.current_state;
    }
}