// import {Map} from 'immutable';
import {Direction, EdgeOperation, EdgeDirection, Face, RelativePosition, RendOperation} from './datatypes';

import {starts_with, tokenize, untokenize, normalize_whitespace} from './text_tools';

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
    offset: number, // the number of characters offset into the full string where this match starts
    typeahead?: string[], // array of typeahead options
    name?: string // internal name of this match (probably not useful for rendering purposes)
}

export enum MatchValidity {
    valid = 0,
    partial = 1,
    invalid = 2
}

export class CommandParser {
    command: string;
    tokens: Token[];
    token_positions: number[];
    position: number = 0;
    validity: MatchValidity = MatchValidity.valid;
    match: DisplayElt[] = [];

    constructor(command: string) {
        this.command = command;
        [this.tokens, this.token_positions] = tokenize(command);
    }

    consume_exact(spec_tokens: Token[], display: DisplayEltType=DisplayEltType.keyword, name?: string): boolean {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }
        let offset = this.token_positions[this.position]
        
        let match_tokens: Token[] = [];
        let match_token_positions: number[] = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position + pos_offset === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];
            let next_tok_pos = this.token_positions[this.position + pos_offset];

            if (spec_tok === next_tok) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
                pos_offset++;
                continue;
            }

            if (starts_with(spec_tok, next_tok)) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
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
                match: untokenize(match_tokens, match_token_positions),
                offset: offset,
                name: name});
            return true;
        }

        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    match: untokenize(match_tokens, match_token_positions),
                    offset: offset,
                    typeahead: [untokenize(spec_tokens)],
                    name: name});

                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }

        match_tokens.push(...this.tokens.slice(this.position));
        match_token_positions.push(...this.token_positions.slice(this.position));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            match: untokenize(match_tokens, match_token_positions),
            offset: offset,
            name: name});
        return false;
    }

    consume_option<S extends string>(option_spec_tokens: Token[][], name?: string, display: DisplayEltType=DisplayEltType.option): S | false{
        let offset = this.token_positions[this.position];

        let partial_matches: DisplayElt[] = []; 
        for (let spec_toks of option_spec_tokens) {
            let subparser = new CommandParser(untokenize(this.tokens.slice(this.position)));
            let exact_match = subparser.consume_exact(spec_toks, display, name);

            if (exact_match) {
                this.match.push(subparser.match[0]);
                this.position += subparser.position;
                return <S>normalize_whitespace(subparser.match[0].match);
            }

            if (subparser.validity === MatchValidity.partial){
                partial_matches.push(subparser.match[0]);
            }
        }

        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map((de) => de.typeahead[0]);
            this.match.push({
                display: DisplayEltType.partial,
                match: partial_matches[0].match,
                offset: offset,
                typeahead: typeahead,
                name: name})
            return false;
        }

        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_positions = this.token_positions.slice(this.position);
        this.match.push({
            display: DisplayEltType.error,
            match: untokenize(match_tokens, match_token_positions),
            offset: offset,
            name: name});
        return false;
    }

    consume_filler(spec_tokens: Token[]){
        return this.consume_exact(spec_tokens, DisplayEltType.filler);
    }

    is_done() {
        if (this.position !== this.tokens.length) {
            return false;
        }

        return this.validity === MatchValidity.valid;
    }

    done() {
        if (this.position !== this.tokens.length) {
            this.validity = MatchValidity.invalid;
            this.match.push({
                display: DisplayEltType.error,
                match: untokenize(this.tokens.slice(this.position)),
                offset: this.token_positions[this.position]
            });
            this.position = this.tokens.length;
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

export interface WorldType {
    get_command_map(): Map<String, Command<this>>
}

export type CommandResult<T extends WorldType> = {
    world?: T;
    message?: string;
    parser?: CommandParser;
} | undefined

export interface Command<T extends WorldType> {
    command_name: Token[];
    execute: (world: T, parser: CommandParser) => CommandResult<T>;
}

export function apply_command<T extends WorldType> (world: T, cmd: string) {
    let parser = new CommandParser(cmd);

    let command_map = world.get_command_map();
    let options: Token[][] = Array.from(command_map.values()).map((v) => v.command_name);

    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword);
    let result: CommandResult<T> = {parser: parser, world: world};

    if (!cmd_name) {
        return result;
    }

    let command = command_map.get(cmd_name)
    let cmd_result = command.execute(world, parser);
    
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
    }
    return result;
}

export class WorldDriver<T extends WorldType> {
    history: CommandResult<T>[];
    
    current_state: CommandResult<T>;

    constructor (initial_world: T) {
        this.current_state = null;
        this.history = [{world: initial_world}];
    }

    apply_command(cmd: string, commit: boolean = true) {
        let prev_state = this.history[this.history.length - 1];
        let result = apply_command(prev_state.world, cmd);
        console.log(cmd);
        console.log(result.message);
        console.log(result);

        this.current_state = result;
        if (commit) {
            this.commit();
        }
        return result;
    }

    commit() {
        this.history.push(this.current_state);
        this.current_state = null;
    }
}