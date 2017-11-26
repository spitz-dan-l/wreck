import {
    CommandResult,
    Command,
    WorldType
} from './commands';

import {split_tokens} from './text_tools';

import {CommandParser, with_early_stopping} from './parser';

type CutsceneState<T extends WorldType<T>> = {
    cutscene?: Cutscene<WorldType<T>>
};

type WorldWithCutscenes<T extends WorldType<T>> = WorldType<T> & {
    update(s: CutsceneState<T>): T,
    cutscene: Cutscene<T>
}

export type CutsceneData = [string, string][];
export type Cutscene<T extends WorldType<T>> = Command<T>[];

export function build_cutscene<T extends WorldWithCutscenes<T>>(data: CutsceneData): Cutscene<T> {
    return data.map(([cmd, message]) => ({
        command_name: split_tokens(cmd),
        execute: with_early_stopping(
            function*(world: T, parser: CommandParser){
                yield parser.done();

                return {
                    world: world.update({
                        cutscene: world.cutscene.slice(1)
                    }),
                    message: message
                }   
            }
        )}
    ))
}