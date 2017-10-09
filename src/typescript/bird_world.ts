import {
    CommandResult,
    Command,
    WorldType
} from './commands'

import {
    Token,
    CommandParser,
    with_early_stopping,
    consume_option_stepwise_eager
} from './parser'

import {
    FuckDict,
    Disablable,
    set_enabled,
    unwrap,
    with_disablable,
} from './datatypes';

import {capitalize, tokenize, split_tokens, untokenize, random_choice} from './text_tools';


type BirdWorldState = {
    history?: CommandResult<BirdWorld>[],
    is_in_heaven?: boolean,
    has_seen?: FuckDict<boolean, boolean>
};

export class BirdWorld implements WorldType<BirdWorld>{
    
    readonly is_in_heaven: boolean;
    readonly has_seen: FuckDict<boolean, boolean>;


    constructor({history, is_in_heaven, has_seen}: BirdWorldState) {
        if (history === undefined) {
            history = [];
        }
        if (is_in_heaven === undefined) {
            is_in_heaven = false;
        }
        if (has_seen === undefined) {
            has_seen = new FuckDict<boolean, boolean>([[false, false], [true, false]]);
        }

        this.is_in_heaven = is_in_heaven;
        this.has_seen = has_seen;
    }

    update({history, is_in_heaven, has_seen}: BirdWorldState) {
        if (is_in_heaven === undefined) {
            is_in_heaven = this.is_in_heaven;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }
        return new BirdWorld({is_in_heaven, has_seen});
    }

    get_commands(){
        let commands: Disablable<Command<BirdWorld>>[] = [];
        commands.push(go_cmd);
        if (this.has_seen.get(true)) {
            commands.push(set_enabled(mispronounce_cmd, this.is_in_heaven));
        }
        commands.push(be_cmd);
        return commands;
    }

    interstitial_update() {
        if (!this.has_seen.get(this.is_in_heaven)) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(this.is_in_heaven, true);
            
            return {
                world: this.update({has_seen: new_has_seen}),
                message: (this.is_in_heaven)
                    ? "You're in Heaven. There's a bird up here. His name is Zarathustra. He is ugly."
                    : "You're standing around on the earth."
            };
        }
    }
}

const go_cmd: Command<BirdWorld> = {
    command_name: ['go'],
    execute: with_early_stopping(
        function*(world: BirdWorld, parser: CommandParser){
            let dir_options: Disablable<Token[]>[] = [];
            dir_options.push(set_enabled(['up'], !world.is_in_heaven));
            
            if (world.has_seen.get(true)) {
                dir_options.push(set_enabled(['down'], world.is_in_heaven));
            }
            
            let dir_word = yield parser.consume_option(dir_options);
            yield parser.done();

            if (world.has_seen.get(!world.is_in_heaven)) {
                // do loop erasure on history
                function update_history(history: CommandResult<BirdWorld>[]): Disablable<CommandResult<BirdWorld>>[] {
                    let new_history = history.map((x) => set_enabled(x, true));

                    let pos;
                    for (pos = history.length - 1; pos >= 0; pos--) {
                        if (history[pos].world.is_in_heaven === !world.is_in_heaven) {
                            break;
                        } else {
                            new_history[pos] = set_enabled(new_history[pos], false);
                        }
                    }

                    new_history[pos] = with_disablable(new_history[pos], (res) => {
                        let new_res = {...res}; //copy it so we aren't updating the original history entry
                        new_res.message += '\n\nYou consider leaving, but decide not to.';
                        return new_res;
                    })

                    return new_history;
                }
                return {history_updater: update_history};
            }

            let new_world = world.update({is_in_heaven: !world.is_in_heaven});
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

let roles: string[] = [
    'the One Who Gazes Ahead',
    'the One Who Gazes Back',
    'the One Who Gazes Up',
    'the One Who Gazes Down',
    'the One Whose Palms Are Open',
    'the One Whose Palms Are Closed',
    'the One Who Is Strong',
    'the One Who Is Weak',
    'the One Who Seduces',
    'the One Who Is Seduced'
];

let qualities: string[] = [
    'outwardly curious',
    'introspective',
    'transcendent',
    'sorrowful',
    'receptive',
    'adversarial',
    'confident',
    'impressionable',
    'predatory',
    'vulnerable'
]

const be_cmd: Command<BirdWorld> = {
    command_name: ['be'],
    execute: with_early_stopping<CommandResult<BirdWorld>>(
        function*(world: BirdWorld, parser: CommandParser) {
            let role_choice = yield* consume_option_stepwise_eager(parser, roles.map(split_tokens));
            yield parser.done();

            return {world, message: `You feel ${qualities[roles.indexOf(role_choice)]}.`};
        }
    )
}
