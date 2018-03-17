import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

import {
    Annotatable,
    Annotated,
    annotate,
    is_annotated,
    with_annotatable,
    get_annotation,
    ADisablable,
    Disablable,
    unwrap,
    is_enabled,
    set_enabled,
    with_disablable,
    array_fuck_contains,
    StringValidator,
    ValidatedString,
    ValidString
} from './datatypes';


export type Token = string;

export enum DisplayEltType {
    keyword = 0,
    option = 1,
    filler = 2,
    partial = 3,
    error = 4
}

export type ADisplayable = {display: DisplayEltType};
export type Displayable<T> = Annotatable<T, ADisplayable>;
export function set_display<T>(x: Displayable<T>, display: DisplayEltType){
    return annotate(x, {display});
}
export type AMatch = (ADisplayable & ADisablable);

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

    consume_option<S extends string>(option_spec_tokens: (Annotatable<Token[], AMatch>)[], name?: string): S | false{
        let partial_matches: Disablable<DisplayElt>[] = [];
        let exact_match_subparser: CommandParser = null;
        let exact_match_spec_toks: Token[] = null;
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let annotation = get_annotation(spec_toks, {display: DisplayEltType.option, enabled: true})
            let display = annotation.display;
            let is_exact_match = subparser.consume_exact(unwrap(spec_toks), annotation.display, name);

            if (annotation.enabled){
                if (is_exact_match) {
                    exact_match_subparser = subparser;
                    exact_match_spec_toks = unwrap(spec_toks);
                    continue;
                }

                if (subparser.validity === MatchValidity.partial){
                    partial_matches.push(subparser.match[0]);
                }
            } else {
                if (is_exact_match || subparser.validity === MatchValidity.partial){
                    let disabled_match = set_enabled(subparser.match[0], false);
                    partial_matches.push(disabled_match);
                }
            }
        }
        
        if (exact_match_subparser !== null) {
            let typeahead = partial_matches.map(with_disablable((x) => unwrap(x.typeahead[0])));
            // let typeahead = partial_matches.map( (de) => with_disablable(de, (x) => x.typeahead[0]));
            this.integrate(exact_match_subparser);
            this.match[this.match.length-1].typeahead = typeahead;

            return <S>normalize_whitespace(untokenize(exact_match_spec_toks));
        }

        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(with_disablable((x) => unwrap(x.typeahead[0])));
            this.match.push({
                display: DisplayEltType.partial,
                match: unwrap(partial_matches[0]).match,
                typeahead: typeahead,
                name: name,
            });
            return false;
        }

        return this.invalidate();
    }

    invalidate(): false {
        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_gaps = this.token_gaps.slice(this.position, this.tokens.length);
        this.match.push({
            display: DisplayEltType.error,
            match: untokenize(match_tokens, match_token_gaps),
            name: name});
        this.position = this.tokens.length;
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

export let with_early_stopping = <R>(gen_func: (...args: any[]) => IterableIterator<any>): (...args: any[]) => R => {
    let inner = (...args) => {
        let gen = gen_func(...args);
        return <R>stop_early(gen);
    }
    return <(...args: any[]) => R>inner;
}

export function with_early_stopping2<R, T>(gen_func: (this: T, ...args: any[]) => IterableIterator<any>): (...args: any[]) => R {
    let inner = (...args) => {
        let gen = gen_func.call(this, ...args);
        return <R>stop_early(gen);
    }
    return <(...args: any[]) => R>inner;
}

export function combine<R>(parser: CommandParser, consumers: ((parser: CommandParser) => (R | false))[]) {
    type Thread = {
        result: R | false,
        subparser: CommandParser
    }
    let threads: Thread[] = [];

    for (let c of consumers) {
        let sp = parser.subparser();
        threads.push({
            result: c.call(this, sp),
            subparser: sp,
        });
    }

    let partial_matches: Thread[] = [];

    for (let t of threads) {
        if (t.subparser.is_done()) {
            parser.integrate(t.subparser);
            return t.result;
        } else {
            if (t.subparser.validity === MatchValidity.partial) {
                partial_matches.push(t);
            }
        }
    }

    if (partial_matches.length > 0) {
        //integrate the first one
        parser.integrate(partial_matches[0].subparser);

        for (let t of partial_matches.slice(1)) {
            //extend the typeahead with the rest
            let typeahead = t.subparser.match[t.subparser.match.length - 1].typeahead;
            parser.match[parser.match.length - 1].typeahead.push(...typeahead);
        }
    } else {
        // set to invalid
        parser.invalidate();
    }
    return false;
}

// Validator for the mini-language applying to transitions for syntax highlighting
export class PhraseDSLValidator extends StringValidator {
    is_valid(s: ValidatedString<this>): s is ValidString<this> {
        let toks = tokenize(s)[0];
        if (toks.slice(1).some(t => 
            t.startsWith('~') || t.startsWith('*') || t.startsWith('&'))) {
            return false;
        }
        return true;
    }
}

export function consume_option_stepwise_eager(parser: CommandParser, options: ValidatedString<PhraseDSLValidator>[][]) {
    // assumption: no option is a prefix of any other option
    let consumers = [];

    for (let option of options) {
        let opt_consumer = with_early_stopping(function *(parser) {
            for (let o of option) {
                let enabled = true;
                if (o.startsWith('~')) {
                    enabled = false;
                    o = o.slice(1);
                }

                let display: DisplayEltType = DisplayEltType.filler;
                if (o.startsWith('*')) {
                    display = DisplayEltType.keyword;
                    o = o.slice(1);
                } else if (o.startsWith('&')) {
                    display = DisplayEltType.option;
                    o = o.slice(1);
                }

                let toks = tokenize(o)[0];
                yield parser.consume_option([annotate(toks, {enabled, display})]);
            }

            return untokenize(option);
        });

        consumers.push(opt_consumer);
    }

    let result = combine.call(this, parser, consumers);
    // debugger;

    return result;
}



// export function* consume_option_stepwise_eager(parser: CommandParser, options: Disablable<Displayable<string>[]>[]) {
//     // assumption: no option is a prefix of any other option

//     let current_cmd = [];
//     let pos = 0;
//     while (true) {
//         let remaining_options = options.filter(with_disablable((toks) =>
//             toks.slice(0, pos).every((tok, i) => tok === current_cmd[i])
//         ));

//         if (remaining_options.length === 0) {
//             return untokenize(current_cmd);
//         }

//         let next_tokens: Disablable<Token>[] = [];
//         for (let opt of remaining_options) {
//             let {value, annotation:{enabled}} = annotate(opt);

//             if (pos < value.length) {
//                 let tok = value[pos];
//                 let found = false;
//                 for (let i = 0; i < next_tokens.length; i++) {
//                     let nt = next_tokens[i];
//                     if (unwrap(nt) === tok) {
//                         if (enabled) {
//                             next_tokens[i] = set_enabled(nt, true);
//                         }
//                         found = true;
//                         break;
//                     }
//                 }
//                 if (!found) {
//                     next_tokens.push(set_enabled(tok, enabled));
//                 }
//             } else {
//                 return untokenize(current_cmd);
//             }
//         }
//         let display_type: DisplayEltType;
//         if (pos === 0) {
//             display_type = DisplayEltType.keyword;
//         } else {
//             display_type = next_tokens.length === 1 ? DisplayEltType.filler : DisplayEltType.option;
//         }
//         let next_options: Annotatable<string[], AMatch>[] = next_tokens.map(with_disablable(split_tokens)).map((o: Annotatable<string[], AMatch>) => annotate(o, {display: display_type}));
        
//         let next_tok = yield parser.consume_option(next_options);
//         current_cmd.push(next_tok);
//         pos++;
//     }
// }