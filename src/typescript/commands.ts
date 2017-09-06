// import {Map} from 'immutable';
import {Direction, EdgeOperation, EdgeDirection, Face, RelativePosition, RendOperation} from './datatypes';

import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

export type Token = string;

export type HorizPositionWord = 'left' | 'center' | 'right';
export let horiz_position_word_tokens: [HorizPositionWord][] = [['left'], ['center'], ['right']];

export type VertPositionWord = 'top' | 'middle' | 'bottom';
export let vert_position_word_tokens: [VertPositionWord][] = [['top'], ['middle'], ['bottom']];

export type PositionWord = HorizPositionWord | VertPositionWord;
export let word_2_relative_position = new Map<PositionWord, RelativePosition>([
    ['left', RelativePosition.left],
    ['center', RelativePosition.center],
    ['right', RelativePosition.right],
    ['top', RelativePosition.top],
    ['middle', RelativePosition.middle],
    ['bottom', RelativePosition.bottom]
]);
export let position_word_tokens: [PositionWord][] = (<[PositionWord][]>horiz_position_word_tokens).concat(vert_position_word_tokens);

export type FaceWord = 'back' | 'front' | 'right' | 'left' | 'top' | 'bottom';
export let word_2_face = new Map<FaceWord, Face>([
    ['back', Face.n],
    ['front', Face.s],
    ['right', Face.e],
    ['left', Face.w],
    ['top', Face.t],
    ['bottom', Face.b]
]);
export let face_word_tokens: [FaceWord][] = [['back'], ['front'], ['right'], ['left'], ['top'], ['bottom']];

export type RendOpWord = 'remove' | 'replace';
export let word_2_rend_op = new Map<RendOpWord, RendOperation>([
    ['remove', RendOperation.open],
    ['replace', RendOperation.close]
]);
export let rend_op_word_tokens: [RendOpWord][] = [['remove'], ['replace']];

export type DangleOpWord = 'open' | 'close';
export let word_2_dangle_op = new Map<DangleOpWord, RendOperation>([
    ['open', RendOperation.open],
    ['close', RendOperation.close]
]);
export let dangle_op_word_tokens: [DangleOpWord][] = [['open'], ['close']];


export type EdgeOpWord = 'cut' | 'tape';
export let word_2_edge_op = new Map<EdgeOpWord, EdgeOperation>([
    ['cut', EdgeOperation.cut],
    ['tape', EdgeOperation.tape]
]);
export let edge_op_word_tokens: [EdgeOpWord][] = [['cut'], ['tape']];

export type EdgeDirWord = 'horizontally' | 'vertically';
export let word_2_edge_dir = new Map<EdgeDirWord, EdgeDirection>([
    ['horizontally', EdgeDirection.horizontal],
    ['vertically', EdgeDirection.vertical]
]);
export let edge_dir_word_tokens: [EdgeDirWord][] = [['horizontally'], ['vertically']];

export type RotateYDirWord = "left" | "right";
export let word_2_degrees = new Map<RotateYDirWord, number>([
    ['left', 270],
    ['right', 90]
]);
export let rotate_y_word_tokens: [RotateYDirWord][] = [['left'], ['right']];

export type RollDirWord = "forward" | "backward" | "left" | "right";
export let word_2_dir = new Map<RollDirWord, Direction>([
    ['forward', Direction.n],
    ['backward', Direction.s],
    ['left', Direction.w],
    ['right', Direction.e]
]);
export let roll_dir_word_tokens: [RollDirWord][] = [['forward'], ['backward'], ['left'], ['right']];

export enum DisplayEltType {
    keyword = 0,
    option = 1,
    filler = 2,
    partial = 3,
    error = 4
}

export interface DisplayElt {
    display: DisplayEltType, // the intended display style for this element
    match: string, // the string that the parser matched for this element
    typeahead?: Disablable<string>[], // array of typeahead options
    name?: string, // internal name of this match (probably not useful for rendering purposes)
}

export enum MatchValidity {
    valid = 0,
    partial = 1,
    invalid = 2
}

export type Disablable<T> = T | DWrapped<T>;
export type DWrapped<T> = {value: T, disablable: true, enabled: boolean}


export function is_dwrapped<T>(x: Disablable<T>): x is DWrapped<T>{
    return (<DWrapped<T>>x).disablable !== undefined;
}

export function set_enabled<T>(x: Disablable<T>, enabled: boolean=true): Disablable<T>{
    if (is_dwrapped(x)) {
        return x; //could do check here for enabled being set properly already
    } else {
        let result: DWrapped<T> = {value: x, disablable: true, enabled};
        
        return result;
    }
}

export function unwrap<T>(x: Disablable<T>): T {
    if (is_dwrapped(x)) {
        return x.value;
    } else {
        return x;
    }
}

export function with_disablable<T1, T2>(x: Disablable<T1>, f: (t1: T1) => Disablable<T2>): Disablable<T2> {
    return set_enabled(unwrap(f(unwrap(x))), is_enabled(x));
}

export function is_enabled<T>(x: Disablable<T>): boolean {
    if (is_dwrapped(x)){
        return x.enabled;
    } else {
        return true;
    }
}
// let x: Disablable<number> = [123];
// let y = {...x, enabled: true}

export class CommandParser {
    command: string;
    tokens: Token[];
    token_gaps: string[];
    position: number = 0;
    validity: MatchValidity = MatchValidity.valid;
    match: DisplayElt[] = [];
    tail_padding: string = '';

    constructor(command: string) {
        this.command = command;
        [this.tokens, this.token_gaps] = tokenize(command);
    }

    consume_exact(spec_tokens: Token[], display: DisplayEltType=DisplayEltType.keyword, name?: string): boolean {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }
        
        let match_tokens: Token[] = [];
        let match_gaps: string[] = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position + pos_offset === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];
            let next_gap = this.token_gaps[this.position + pos_offset];

            if (spec_tok.toLowerCase() === next_tok.toLowerCase()) {
                match_tokens.push(next_tok);
                match_gaps.push(next_gap);
                pos_offset++;
                continue;
            }

            if (starts_with(spec_tok.toLowerCase(), next_tok.toLowerCase())) {
                match_tokens.push(next_tok);
                match_gaps.push(next_gap);
                this.validity = MatchValidity.partial;
                pos_offset++;
                break;
            }
            this.validity = MatchValidity.invalid;
            break;   
        }

        this.position += pos_offset;


        if (this.validity === MatchValidity.valid) {
            this.match.push({
                display: display,
                match: untokenize(match_tokens, match_gaps),
                name: name});
            return true;
        }

        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    match: untokenize(match_tokens, match_gaps),
                    typeahead: [untokenize(spec_tokens)],
                    name: name});
                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }

        match_tokens.push(...this.tokens.slice(this.position));
        match_gaps.push(...this.token_gaps.slice(this.position, this.tokens.length));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            match: untokenize(match_tokens, match_gaps),
            name: name});
        return false;
    }

    subparser() {
        return new CommandParser(untokenize(this.tokens.slice(this.position), this.token_gaps.slice(this.position)));
    }

    integrate(subparser: CommandParser) {
        this.position += subparser.position;
        this.match.push(...subparser.match);
        this.validity = subparser.validity;
    }

    consume_option<S extends string>(option_spec_tokens: Disablable<Token[]>[], name?: string, display: DisplayEltType=DisplayEltType.option): S | false{
        let partial_matches: Disablable<DisplayElt>[] = [];
        
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let exact_match = subparser.consume_exact(unwrap(spec_toks), display, name);

            if (is_enabled(spec_toks)){
                if (exact_match) {
                    this.integrate(subparser);
                    return <S>normalize_whitespace(untokenize(unwrap(spec_toks)));
                }

                if (subparser.validity === MatchValidity.partial){
                    partial_matches.push(subparser.match[0]);
                }
            } else {
                if (exact_match || subparser.validity === MatchValidity.partial){
                    let disabled_match = set_enabled(subparser.match[0], false);
                    partial_matches.push(disabled_match);
                }
            }
        }
        
        if (partial_matches.filter((de) => is_enabled(de)).length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map((de) => with_disablable(de, (x) => x.typeahead[0]));
            this.match.push({
                display: DisplayEltType.partial,
                match: unwrap(partial_matches[0]).match,
                typeahead: typeahead,
                name: name,
            });
            return false;
        }

        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_gaps = this.token_gaps.slice(this.position, this.tokens.length);
        this.match.push({
            display: DisplayEltType.error,
            match: untokenize(match_tokens, match_token_gaps),
            name: name});
        return false;
    }

    consume_filler(spec_tokens: Token[]){
        return this.consume_exact(spec_tokens, DisplayEltType.filler);
    }

    is_done() {
        if (this.position === this.tokens.length - 1 && this.tokens[this.tokens.length - 1] === ''){
            return this.validity === MatchValidity.valid;
        }

        if (this.position !== this.tokens.length) {
            return false;
        }

        return this.validity === MatchValidity.valid;
    }

    done() {
        if (!this.is_done() /*this.position !== this.tokens.length */) {
            this.validity = MatchValidity.invalid;
            this.match.push({
                display: DisplayEltType.error,
                match: untokenize(this.tokens.slice(this.position), this.token_gaps.slice(this.position, this.tokens.length))
            });
            this.position = this.tokens.length;
        } else {
            if (this.position === this.tokens.length - 1) {
                this.tail_padding = this.token_gaps[this.token_gaps.length - 1];
            }
        }

        return this.validity === MatchValidity.valid;
    }

    get_match(name: string){
        for (let m of this.match) {
            if (m.name === name) {
                return m;
            }
        }
        return null;
    }
}

export function stop_early<R>(gen: IterableIterator<string | boolean>): R | undefined{
    let value: any | boolean = undefined;
    let done: boolean = false;

    while (!done) {
        let result = gen.next(value);
        value = result.value;
        done = result.done;
        if (value === false) {
            return;
        }
    }

    return <R>value;
}

export function with_early_stopping<R>(gen_func: (...any) => IterableIterator<any>): (...any) => R {
    function inner(...args) {
        let gen = gen_func(...args);
        return <R>stop_early(gen);
    }
    return <(...any) => R>inner;
}

export function* consume_option_stepwise_eager(parser: CommandParser, options: string[][]) {
    let current_cmd = [];
    let pos = 0;
    while (true) {
        let remaining_options = options.filter((toks) => 
            toks.slice(0, pos).every((tok, i) => tok === current_cmd[i])
        );

        if (remaining_options.length === 0) {
            return untokenize(current_cmd);
        }

        let next_tokens: Token[] = [];
        for (let opt of remaining_options) {
            if (pos < opt.length) {
                let tok = opt[pos];
                if (next_tokens.indexOf(tok) === -1) {
                    next_tokens.push(tok);
                }
            } else {
                return untokenize(current_cmd);
            }
        }
        let display_type = next_tokens.length === 1 ? DisplayEltType.keyword : DisplayEltType.option;
        let next_tok = yield parser.consume_option(next_tokens.map(split_tokens), undefined, display_type);
        current_cmd.push(next_tok);
        pos++;
    }
}

export interface WorldType<T extends WorldType<T>> {
    get_commands(): Disablable<Command<T>>[],
    interstitial_update?(): InterstitialUpdateResult<T>,
}

export type InterstitialUpdateResult<T extends WorldType<T>> = {
    world?: T;
    message?: string;
} | undefined;

export type CommandResult<T extends WorldType<T>> = {
    world?: T;
    message?: string;
    parser?: CommandParser;
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
    }

    result = apply_interstitial_update(result);
    
    return result;
}

function apply_interstitial_update<T extends WorldType<T>>(result: CommandResult<T>): CommandResult<T> {
    if (result.world.interstitial_update !== undefined) {
        //confusing, but we are running pre_command for the *next* command, not the one that just ran
        let res2 = result.world.interstitial_update();
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
    }
    return result;
}

export class WorldDriver<T extends WorldType<T>> {
    history: CommandResult<T>[];
    
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
        if (commit) {
            this.commit();
        }
        return result;
    }

    commit() {
        let result = this.current_state;
        this.history.push(this.current_state);
        this.apply_command('', false);
        return result;
    }
}