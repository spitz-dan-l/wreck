import {
    Token,
    CommandResult,
    Disablable,
    set_enabled,
    CommandParser,
    Command,
    WorldType,
    with_early_stopping,
    consume_option_stepwise_eager
} from './commands'

import {capitalize, tokenize, split_tokens, untokenize, random_choice} from './text_tools';


export class BirdWorld implements WorldType<BirdWorld>{
    readonly is_in_heaven: boolean;

    constructor(is_in_heaven: boolean = false) {
        this.is_in_heaven = is_in_heaven;
    }

    update(is_in_heaven: boolean = false) {
        return new BirdWorld(is_in_heaven);
    }

    get_commands(){
        let commands: Disablable<Command<BirdWorld>>[] = [];
        commands.push(go_cmd);
        commands.push(set_enabled(mispronounce_cmd, this.is_in_heaven));
        commands.push(be_cmd);
        return commands;
    }

    interstitial_update() {
        return {message: (this.is_in_heaven)
            ? "You're in Heaven. There's a bird up here. His name is Zarathustra. He is ugly."
            : "You're standing around on the earth."
        };
    }
}

const go_cmd: Command<BirdWorld> = {
    command_name: ['go'],
    execute: with_early_stopping(
        function*(world: BirdWorld, parser: CommandParser){
            let dir_options: Disablable<Token[]>[] = [];
            dir_options.push(set_enabled(['up'], !world.is_in_heaven));
            dir_options.push(set_enabled(['down'], world.is_in_heaven));

            let dir_word = yield parser.consume_option(dir_options);
            yield parser.done();

            let new_world = world.update(!world.is_in_heaven);
            let message = capitalize(dir_word) + ' you go.';

            return {world: new_world, message: message};
        }
    )
}

const mispronounce_cmd: Command<BirdWorld> = {
    command_name: ['mispronounce'],
    execute: with_early_stopping(
        function*(world: BirdWorld, parser: CommandParser) {
            let specifier_word = yield parser.consume_option([["zarathustra's"]]);
            
            yield parser.consume_filler(['name']);

            yield parser.done();

            let utterance_options = [
                'Zammersretter',
                'Hoosterzaro',
                'Rooster Thooster',
                'Thester Zar',
                'Zerthes Threstine'
            ]

            let message = `"${random_choice(utterance_options)}," you say.`;

            return {world, message};
        }
    )
}

let roles: string[][] = [
    split_tokens('the One Who Gazes Ahead,'),
    split_tokens('the One Who Gazes Back,'),
    split_tokens('the One Who Gazes Up,'),
    split_tokens('the One Who Gazes Down,'),
    split_tokens('the One Whose Palms Are Open,'),
    split_tokens('the One Whose Palms Are Closed,'),
    split_tokens('the One Who Is Strong,'),
    split_tokens('the One Who Is Weak,'),
    split_tokens('the One Who Seduces,'),
    split_tokens('the One Who Is Seduced,'),
];


let role = roles[0];
const be_cmd: Command<BirdWorld> = {
    command_name: ['be'],
    execute: with_early_stopping<CommandResult<BirdWorld>>(
        function*(world: BirdWorld, parser: CommandParser) {
            let role_choice = yield* consume_option_stepwise_eager(parser, roles);
            yield parser.consume_filler(['dude']);
            yield parser.done();

            return {world, message: role_choice};
        }
    )
}
