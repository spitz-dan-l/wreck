import {Map} from 'immutable';
import {Direction, EdgeOperation, EdgeDirection, Face, RelativePosition, RendOperation} from './datatypes';

import {starts_with, untokenize} from './text_tools';

export type Token = string;

export type HorizPositionWord = 'left' | 'center' | 'right';
export let horiz_position_word_tokens: [HorizPositionWord][] = [['left'], ['center'], ['right']];

export type VertPositionWord = 'top' | 'middle' | 'bottom';
export let vert_position_word_tokens: [VertPositionWord][] = [['top'], ['middle'], ['bottom']];

export type PositionWord = HorizPositionWord | VertPositionWord;
export let word_2_relative_position = Map<PositionWord, RelativePosition>([
    ['left', RelativePosition.left],
    ['center', RelativePosition.center],
    ['right', RelativePosition.right],
    ['top', RelativePosition.top],
    ['middle', RelativePosition.middle],
    ['bottom', RelativePosition.bottom]
]);
export let position_word_tokens: [PositionWord][] = (<[PositionWord][]>horiz_position_word_tokens).concat(vert_position_word_tokens);

export type FaceWord = 'back' | 'front' | 'right' | 'left' | 'top' | 'bottom';
export let word_2_face = Map<FaceWord, Face>([
    ['back', Face.n],
    ['front', Face.s],
    ['right', Face.e],
    ['left', Face.w],
    ['top', Face.t],
    ['bottom', Face.b]
]);
export let face_word_tokens: [FaceWord][] = [['back'], ['front'], ['right'], ['left'], ['top'], ['bottom']];

export type RendOpWord = 'remove' | 'replace';
export let word_2_rend_op = Map<RendOpWord, RendOperation>([
    ['remove', RendOperation.open],
    ['replace', RendOperation.close]
]);
export let rend_op_word_tokens: [RendOpWord][] = [['remove'], ['replace']];

export type DangleOpWord = 'open' | 'close';
export let word_2_dangle_op = Map<DangleOpWord, RendOperation>([
    ['open', RendOperation.open],
    ['close', RendOperation.close]
]);
export let dangle_op_word_tokens: [DangleOpWord][] = [['open'], ['close']];


export type EdgeOpWord = 'cut' | 'tape';
export let word_2_edge_op = Map<EdgeOpWord, EdgeOperation>([
    ['cut', EdgeOperation.cut],
    ['tape', EdgeOperation.tape]
]);
export let edge_op_word_tokens: [EdgeOpWord][] = [['cut'], ['tape']];

export type EdgeDirWord = 'horizontally' | 'vertically';
export let word_2_edge_dir = Map<EdgeDirWord, EdgeDirection>([
    ['horizontally', EdgeDirection.horizontal],
    ['vertically', EdgeDirection.vertical]
]);
export let edge_dir_word_tokens: [EdgeDirWord][] = [['horizontally'], ['vertically']];

export type RotateYDirWord = "left" | "right";
export let word_2_degrees = Map<RotateYDirWord, number>([
    ['left', 270],
    ['right', 90]
]);
export let rotate_y_word_tokens: [RotateYDirWord][] = [['left'], ['right']];

export type RollDirWord = "forward" | "backward" | "left" | "right";
export let word_2_dir = Map<RollDirWord, Direction>([
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

interface DisplayElt {
    display: DisplayEltType,
    tokens: Token[],
    typeahead?: Token[][],
    name?: string
}

export enum MatchValidity {
    valid = 0,
    partial = 1,
    invalid = 2
}

//export type MaybeMatch<str_type extends string> = str_type | false;

export class CommandParser {
    tokens: Token[];
    position: number = 0;
    validity: MatchValidity = MatchValidity.valid;
    match: DisplayElt[] = [];

    constructor(tokens: Token[]) {
        this.tokens = tokens;
    }

    consume_exact(spec_tokens: Token[], display: DisplayEltType=DisplayEltType.keyword, name?: string): boolean {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }

        let match_tokens: Token[] = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];

            if (spec_tok === next_tok) {
                match_tokens.push(next_tok);
                pos_offset++;
                continue;
            }

            if (starts_with(spec_tok, next_tok)) {
                match_tokens.push(next_tok);
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
                tokens: match_tokens,
                name: name});
            this.position;
            return true;
        }

        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    tokens: match_tokens,
                    typeahead: [spec_tokens],
                    name: name});

                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }

        match_tokens.push(...this.tokens.slice(this.position));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            tokens: match_tokens,
            name: name});
        return false;
    }

    consume_option<S extends string>(option_spec_tokens: Token[][], name?: string, display: DisplayEltType=DisplayEltType.option): S | false{
        let partial_matches: DisplayElt[] = []; 
        for (let spec_toks of option_spec_tokens) {
            let subparser = new CommandParser(this.tokens.slice(this.position));
            let exact_match = subparser.consume_exact(spec_toks, display, name);

            if (exact_match) {
                this.match.push(subparser.match[0]);
                this.position += subparser.position;
                return <S>untokenize(subparser.match[0].tokens);
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
                tokens: partial_matches[0].tokens,
                typeahead: typeahead,
                name: name})
            return false;
        }

        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        this.match.push({
            display: DisplayEltType.error,
            tokens: match_tokens,
            name: name});
        return false;
    }

    consume_filler(spec_tokens: Token[]){
        return this.consume_exact(spec_tokens, DisplayEltType.filler);
    }

    done() {
        if (this.position !== this.tokens.length) {
            this.validity = MatchValidity.invalid;
            this.match.push({
                display: DisplayEltType.error,
                tokens: this.tokens.slice(this.position)
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

export type CommandResult<WorldType> = {
    world?: WorldType;
    message?: string;
} | undefined

export interface Command<WorldType> {
    command_name: Token[];
    execute: (world: WorldType, parser: CommandParser) => CommandResult<WorldType>;
}

