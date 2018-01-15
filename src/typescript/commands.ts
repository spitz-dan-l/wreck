import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

import {
    Annotatable,
    annotate,
    Disablable,
    unwrap,
    get_annotation,
    with_annotatable,
    with_disablable,
} from './datatypes';

import {CommandParser, DisplayEltType, Token} from './parser';

export interface WorldType<T extends WorldType<T>> {
    handle_command(parser: CommandParser): CommandResult<T>,
    interstitial_update?(): InterstitialUpdateResult<T>,
    interpret_history?(world: T, message: HTMLElement): Annotatable<HTMLElement, number>
}

export type HistoryUpdater<T extends WorldType<T>> = (history: Annotatable<CommandResult<T>, number>[], world?: T) => Annotatable<CommandResult<T>, number>[];

export type InterstitialUpdateResult<T extends WorldType<T>> = {
    world?: T;
    message?: HTMLElement;
    // history_updater?: HistoryUpdater<T>;
} | undefined;

export type CommandResult<T extends WorldType<T>> = InterstitialUpdateResult<T> & {
    parser?: CommandParser;
} | undefined;

export type PostProcessedCommandResult<T extends WorldType<T>> = Annotatable<CommandResult<T> & {
    index?: number;
    interpretted_message?: HTMLElement;
}, number>

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
        // if (cmd_result.history_updater !== undefined) {
        //     result.history_updater = cmd_result.history_updater;
        // }

        result = apply_interstitial_update(result);
    }

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
                //assume they updated the original message in some way   
                result.message = res2.message;
            }

            // if (res2.history_updater !== undefined) {
            //     result.history_updater = res2.history_updater;
            // }
        }
    }
    return result;
}

function apply_history_update<T extends WorldType<T>>(history: PostProcessedCommandResult<T>[], world: T): PostProcessedCommandResult<T>[] {
    if (world.interpret_history === undefined) {
        return history;
    } else {
        return history.map((result) => {
            let r = unwrap(result);
            let new_result = {...r};

            let interpretted_message = world.interpret_history(r.world, r.message);
            if (interpretted_message !== undefined) {
                new_result.interpretted_message = unwrap(interpretted_message);
            } 
            return annotate(new_result, get_annotation(interpretted_message, get_annotation(result, 1)));
        });
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
        this.history = apply_history_update([initial_result], initial_world);
 
        this.apply_command('', false); //populate this.current_state
    }

    apply_command(cmd: string, commit: boolean = true) {
        let prev_state = unwrap(this.history[this.history.length - 1]);
        let result: PostProcessedCommandResult<T> = apply_command(prev_state.world, cmd);
         
        result.index = prev_state.index + 1;

        this.current_state = result;
        
        this.possible_history = apply_history_update([...this.history, this.current_state], this.current_state.world);
        if (commit) {
            this.commit();
        }
        return result;
    }

    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);

        //filter out any disabled history
        this.history = this.possible_history.filter(x => get_annotation(x, 1) !== 0);

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