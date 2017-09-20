import {
    Token,
    CommandResult,
    Disablable,
    Coroutine,
    coroutine,
    parse_with,
    set_enabled,
    CommandParser,
    Command,
    WorldType,
    consume_option_stepwise_eager,
    consume_option_stepwise_eager2
} from './commands'

import {
    FuckDict
} from './datatypes';

import {capitalize, tokenize, split_tokens, untokenize, random_choice} from './text_tools';


type BirdWorldState = {
    is_in_heaven?: boolean,
    has_seen?: FuckDict<boolean, boolean>
};

export class BirdWorld implements WorldType<BirdWorld>{
    readonly is_in_heaven: boolean;
    readonly has_seen: FuckDict<boolean, boolean>;


    constructor({is_in_heaven, has_seen}: BirdWorldState) {
        if (is_in_heaven === undefined) {
            is_in_heaven = false;
        }
        if (has_seen === undefined) {
            has_seen = new FuckDict<boolean, boolean>([[false, false], [true, false]]);
        }

        this.is_in_heaven = is_in_heaven;
        this.has_seen = has_seen;
    }

    update({is_in_heaven, has_seen}: BirdWorldState) {
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

function bird_world_coroutine(f) {
    return coroutine<string | boolean, string, CommandResult<BirdWorld>>(f);
}

const go_cmd: Command<BirdWorld> = {
    command_name: ['go'],
    execute: parse_with((world: BirdWorld, parser: CommandParser) =>
        bird_world_coroutine(function* () {
            let dir_options: Disablable<Token[]>[] = [];
            dir_options.push(set_enabled(['up'], !world.is_in_heaven));
            
            if (world.has_seen.get(true)) {
                dir_options.push(set_enabled(['down'], world.is_in_heaven));
            }

            let dir_word = yield parser.consume_option(dir_options);
            yield parser.done();

            let new_world = world.update({is_in_heaven: !world.is_in_heaven});
            let message = capitalize(dir_word) + ' you go.';

            return {world: new_world, message: message};
        })()
    )
}

const mispronounce_cmd: Command<BirdWorld> = {
    command_name: ['mispronounce'],
    execute: parse_with((world: BirdWorld, parser: CommandParser) =>
        bird_world_coroutine(function* () {
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
        })()
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
    'the One Who Is Seduced',
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
    execute: parse_with((world: BirdWorld, parser: CommandParser) =>
        bird_world_coroutine(function*() {
            let role_choice = yield* consume_option_stepwise_eager2(parser, roles.map(split_tokens));
            yield parser.done();
            debugger;
            return {world, message: `You feel ${qualities[roles.indexOf(role_choice)]}.`};
        })()
    )
}
