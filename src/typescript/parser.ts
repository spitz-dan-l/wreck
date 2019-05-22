/*
    a parser thread takes a parser and uses it to consume some of a token stream,
    and returns some result

    a thread can *split* the current parser state into N branches,
    each of which consume their own things separately and return their own results
    the thread which initiated the split is also responsible for combining the various results
    before returning control to the thread.
        the most common scenario is that only one of N branches is still valid
    
    internally, the parser receives instructions from the parser thread and consumes
    pieces of the input token stream. it builds up a list of token match objects,
    where each token in the stream consumed so far gets a status of "matched", "partial", "error"

    by combining these token labellings from all the different parser threads that ran,
    we determine:
        - whether the currently-input string is valid and can be executed
        - what colors to highlight the various input words with
        - what to display beneath the input prompt as typeahead options




*/

import { array_last, deep_equal } from './utils';
import { starts_with, tokenize } from './text_tools';

class NoMatch {};

// Used to both fail a parse and post process the result if there is one in another split path
class NoMatchProcess<T> extends NoMatch {
    constructor(public processor?: (t: T) => T) { super(); }
};

class ParseRestart {
    constructor(public n_splits: number) {}
};
export class ParseError extends Error {};

export const SUBMIT_TOKEN = Symbol('SUBMIT');
export type Token = string | typeof SUBMIT_TOKEN;

export const NEVER_TOKEN = Symbol('NEVER');
export type TaintedToken = Token | typeof NEVER_TOKEN;

export type TokenType = 
    { kind: 'Filler' } |
    { kind: 'Option' } |
    { kind: 'Keyword' };

export type TypeaheadType =
    { kind: 'Available' } |
    { kind: 'Used' } |
    { kind: 'Locked' }; // TODO: Need to actually make this invalid when parsed.

export interface ConsumeSpec {
    kind: 'ConsumeSpec';
    token: TaintedToken;
    token_type: TokenType;
    typeahead_type: TypeaheadType;
}


export type MatchStatus = 'Match' | 'PartialMatch' | 'ErrorMatch';

export type Match = { kind: 'Match', type: TokenType };
export type PartialMatch = { kind: 'PartialMatch', token: Token, type: TypeaheadType };
export type ErrorMatch = { kind: 'ErrorMatch', token: Token };

export type MatchType = 
    Match |
    PartialMatch |
    ErrorMatch;

export function is_match(m: TokenMatch): m is TokenMatch & {type: Match} {
    return m.type.kind === 'Match'
}

export function is_partial(m: TokenMatch): m is TokenMatch & {type: PartialMatch} {
    return m.type.kind === 'PartialMatch'
}

export function is_error(m: TokenMatch): m is TokenMatch & {type: ErrorMatch} {
    return m.type.kind === 'ErrorMatch'
}

export type TokenMatch = { kind: 'TokenMatch', token: Token, type: MatchType };

export type TypeaheadOption = {
    kind: 'TypeaheadOption',
    type: TypeaheadType,
    option: (PartialMatch | null)[] // null left-padded to match length of token match
};

/*

    Filler, Option, Error

    Ready, Not Ready (to execute)

*/
export type ParsingView = {
    kind: 'ParsingView',
    
    // How to display each token in the input
    matches: TokenMatch[],
    
    // If submittable, display a carriage return typeahead, and brighten text
    /*
        Two possible schemes:
        1. It is possible to pass inputs to Parser.run_thread that don't end in a submit token.
        In this case, the UI would insert the submit token on enter press, and the commit= option would
        go away on WorldDriver.apply_command.

        2. A submit token is always added to the input stream in Parser.run_thread.
        Then, the concept of "submitability" does not matter directly to the Parser, it is a world
        concept.

        We are going with 1. 2 Doesn't actually work because it breaks autocomplete.
    */
    submittable: boolean,

    submission: boolean,
    
    // Whether the whole command is Match, Partial, Error. Used to highlight and color.
    match_status: MatchStatus,

    // Used to display typeahead during typing
    // TODO: make decisions about how to indicate a typeahead row is locked
    //    Currently it's a bit ugly as each token in the row could be locked on not
    //    Also a view of the typeahead with correct whitespace inserted
    typeahead_grid: TypeaheadOption[]
};

/*
    TODO:
    Should we include the input display and typeahead results in the Parsing?
    Should we add a top-level attribute saying whether the whole thing is Valid, Partial or Error?
        This would guaranteed cause duplication of data.
*/
export type Parsing = {
    kind: 'Parsing',
    view: ParsingView,
    parses: TokenMatch[][],
    tokens: Token[],
    whitespace: string[],
    raw: RawInput
}

export type Parsed<T> = { kind: 'Parsed', result: T, parsing: Parsing };
export type NotParsed = { kind: 'NotParsed', parsing: Parsing };

export type ParseResult<T> = Parsed<T> | NotParsed;

export function is_parse_result_valid(result: TokenMatch[]) {
    return result.length === 0 || is_match(array_last(result));
}

// for each of the input tokens, how should they be displayed/highighted?
export function compute_view(parse_results: TokenMatch[][], input_stream: Token[]): ParsingView {
    // let parse_results: TokenMatch[][] = parsing.parses;
    // let input_stream: Token[] = parsing.tokens;

    let match_status: MatchStatus;
    let submission = false;
    let row: TokenMatch[];

    if ((row = parse_results.find(row => array_last(row).type.kind === 'Match')!) !== undefined) {
        match_status = 'Match';
        // TODO: throw a runtime exc here if we have a Match at the end but it's not SUBMIT_TOKEN ?
        // Would imply a commmand thread that doesn't end in submit.
        submission = array_last(row).token === SUBMIT_TOKEN;

        if (!submission) {
            throw new ParseError('Matching parse did not end in SUBMIT_TOKEN');
        }
    } else if ((row = parse_results.find(row => is_partial(array_last(row)))!) !== undefined) {
        // chop off the partial bits that haven't been started yet
        row = row.slice(0, input_stream.length);
        match_status = 'PartialMatch';
    } else {
        row = input_stream.map(tok => ({
            kind: 'TokenMatch',
            token: tok,
            type: {
                kind: 'ErrorMatch',
                token: tok
            }
        }));
        match_status = 'ErrorMatch';
    }

    let typeahead_grid = compute_typeahead(parse_results, input_stream);
    let submittable = typeahead_grid.some(row => array_last(row.option)!.token === SUBMIT_TOKEN)

    return {
        kind: 'ParsingView',
        matches: row,
        submittable,
        submission,
        match_status,
        typeahead_grid
    };
}

/*
Typeahead
    For each non-valid row (ignoring errors, partial only)
    If the row is at least the length of the input stream
    Typeahead is the Partial TokenMatches suffix (always at the end)
*/
export function compute_typeahead(parse_results: TokenMatch[][], input_stream: Token[]): TypeaheadOption[] {
    // let parse_results: TokenMatch[][] = parsing.parses;
    // let input_stream: Token[] = parsing.tokens;
    let rows_with_typeahead = parse_results.filter(pr => 
        !(is_error(array_last(pr)))
        && pr.slice(input_stream.length - 1).some(is_partial)
    );

    let unique_options: (PartialMatch | null)[][] = [];

    function options_equal(x: (PartialMatch | null)[], y: (PartialMatch | null)[]): boolean {
        return x.length === y.length && x.every((m, i) => deep_equal(m, y[i]))
    }

    rows_with_typeahead.forEach(pr => {
        let start_idx = pr.findIndex(is_partial);
        let option: (PartialMatch | null)[] = Array(start_idx).fill(null);
        let elts = <{ type: PartialMatch }[]>pr.slice(start_idx);
        option.push(...elts.map(tm => tm.type));

        if (!unique_options.some((u_opt) => options_equal(u_opt, option))) {
            unique_options.push(option);
        }
    });

    return unique_options.map(option => ({
        kind: 'TypeaheadOption',
        type: array_last(option)!.type,
        option
    }));

    // TODO: add dedupe step here
}


/*
    Helper function for parser methods that take an optional callback or return value on success
    The pattern is to use function overloading to get the types right, and call this
    function to get the behavior right.

    TODO: Can we get what we want using promises?
*/
function call_or_return(parser: Parser, result?: any): any {
    if (result instanceof Function) {
        return result(parser);
    }
    return result;
}


export class Parser {
    constructor(input_stream: Token[], splits_to_take: number[]) {
        this.input_stream = input_stream;
        
        this._split_iter = splits_to_take[Symbol.iterator]();
    }

    input_stream: Token[];
    pos: number = 0;

    parse_result: TokenMatch[] = [];
    
    _split_iter: Iterator<number>;


    consume(spec: string | ConsumeSpec[]): void;
    consume<T>(spec: string | ConsumeSpec[], callback: ParserThread<T>): T;
    consume<T>(spec: string | ConsumeSpec[], result: T): T;
    consume(spec: string | ConsumeSpec[], result?: any): any {
        if (typeof spec === 'string') {
            this._consume_dsl(spec);
        } else {
            this._consume(spec);
        }
        return call_or_return(this, result);
    }

    _consume_dsl(dsl: string): void {
        let toks = tokenize(dsl)[0];

        for (let t of toks) {
            let token_type: TokenType = { kind: 'Filler' };
            let typeahead_type: TypeaheadType  = { kind: 'Available' };;

            if (t.startsWith('~')) {
                typeahead_type = { kind: 'Locked' };
                t = t.slice(1);
            } else if (t.startsWith('+')) {
                typeahead_type = { kind: 'Available' };
                t = t.slice(1);
            }

            if (t.startsWith('*')) {
                token_type = { kind: 'Keyword' };
                t = t.slice(1);
            } else if (t.startsWith('&')) {
                token_type = { kind: 'Option' };
                t = t.slice(1);
            } else if (t.startsWith('=')) {
                token_type = { kind: 'Filler' };
                t = t.slice(1);
            }

            this._consume(t.split('_').map(t => ({
                kind: 'ConsumeSpec',
                token: t,
                token_type,
                typeahead_type
            })));
        }
    }

    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    _consume(tokens: ConsumeSpec[]) {
        if (!is_parse_result_valid(this.parse_result)) {
            throw new ParseError('Tried to consume() on a done parser.');
        }

        let partial = false;
        let error = false;
        let i = 0
        // check if exact match
        for (i = 0; i < tokens.length; i++) {
            let spec = tokens[i];
            let spec_value = spec.token;

            if (spec_value === NEVER_TOKEN) {
                error = true;
                break;
            }

            if (this.pos + i >= this.input_stream.length) {
                partial = true;
                break;
            }
            let input = this.input_stream[this.pos + i];
            if (spec_value === input) {
                if (spec.typeahead_type.kind === 'Locked') {
                    // TODO: special case for typeahead = Locked
                    error = true;
                    break;
                }
                continue;
            }

            if (spec_value === SUBMIT_TOKEN || input === SUBMIT_TOKEN) {
                // eliminate case where either token is SUBMIT_TOKEN (can't pass into starts_with())
                error = true;
                break;
            }
            if (starts_with(<string>spec_value, <string>input)) {
                if (this.pos + i < this.input_stream.length - 1) {
                    error = true;
                } else {
                    partial = true;
                }
                break;
            }

            error = true;
            break;
        }

        if (partial) {
            // push all tokens as partials
            this.parse_result.push(...tokens.map((t, j) => 
                ({
                    kind: 'TokenMatch',
                    token: this.input_stream[this.pos + j] || '',
                    type: {
                        kind: 'PartialMatch',
                        token: t.token === NEVER_TOKEN ? '' : t.token,
                        type: t.typeahead_type
                    }
                } as const)));
            // increment pos
            this.pos = this.input_stream.length;
            throw new NoMatch();
        }

        if (error) {
            // push all tokens as errors
            this.parse_result.push(...tokens.map((t, j) =>
                ({
                    kind: 'TokenMatch',
                    token: this.input_stream[this.pos + j] || '',
                    type: {
                        kind: 'ErrorMatch',
                        token: t.token === NEVER_TOKEN ? '' : t.token
                    }
                } as const)));
            // increment pos
            this.pos = this.input_stream.length;
            throw new NoMatch();
        }

        // push all tokens as valid
        this.parse_result.push(...tokens.map((t, j) =>
            ({
                kind: 'TokenMatch',
                token: this.input_stream[this.pos + j],
                type: { kind: 'Match', type: t.token_type }
            } as const)));
        // increment pos
        this.pos += tokens.length;

    }

    eliminate(): never {
        /*
            It is important that we not just throw NoMatch, and instead actully attempt to consume a never token.
        */
        return <never>this._consume([{
            kind: 'ConsumeSpec',
            token: NEVER_TOKEN,
            token_type: { kind: 'Filler' },
            typeahead_type: { kind: 'Available' }
        }]);
    }

    submit(): void;
    submit<T>(callback: ParserThread<T>): T;
    submit<T>(result: T): T;
    submit<T>(result?: any) {
        this._consume([{
            kind: 'ConsumeSpec',
            token: SUBMIT_TOKEN,
            token_type: { kind: 'Filler' },
            typeahead_type: { kind: 'Available' }
        }]);

        return call_or_return(this, result);
    }

    /*
        TODO: support a callback for split() which takes both the result value, and the parser.
    */
    split<T>(subthreads: ParserThread<T>[]): T;
    split<T, R>(subthreads: ParserThread<T>[], callback: (result: T, parser?: Parser) => R): R;
    split(subthreads: ParserThread<any>[], callback?: any): any {
        let {value: split_value, done} = this._split_iter.next();
        if (done) {
            throw new ParseRestart(subthreads.length);
        }
        
        let st = subthreads[split_value];
        let result = st(this);

        if (callback === undefined) {
            return result;
        }

        return callback(result, this);
    }

    static run_thread<T>(raw: RawInput, t: ParserThread<T>): ParseResult<T> {
        
        let [tokens, whitespace]: [Token[], string[]] = tokenize(raw.text);
        
        if (raw.submit) {
            tokens.push(SUBMIT_TOKEN);
        }

        type Path = (number | Iterator<number>)[];
        let frontier: Path[] = [[]];
        let results: (T | NoMatch)[] = [];
        let parse_results: TokenMatch[][] = [];
        // let processors: ((t: T) => T)[] = [];

        while (frontier.length > 0) {
            let path = <Path>frontier.pop();
            let splits_to_take;
            if (path.length === 0) {
                splits_to_take = path;
            } else {
                let n = (array_last(path) as Iterator<number>).next();
                if (n.done) {
                    continue;
                } else {
                    frontier.push(path);
                }
                splits_to_take = [...path.slice(0, -1), n.value];
            }

            let p = new Parser(tokens, splits_to_take);
            // function add_processor(processor: (result: T) => T): void {
            //     processors.push(processor);
            // }

            // function eliminate(process?: (result: T) => T): never {
            //     try {
            //         return p.eliminate();
            //     }
            //     catch (e) {
            //         if (e instanceof NoMatch) {
            //             throw new NoMatchProcess(process);
            //         } else {
            //             throw e;
            //         }
            //     }
            // }
            let result: T | NoMatch;
            try {
                result = t(p); //, add_processor);
            } catch (e) {
                if (e instanceof NoMatch) {
                    result = e;
                } else if (e instanceof ParseRestart) {
                    let new_splits: number[] = [];
                    for (let i = 0; i < e.n_splits; i++) {
                        new_splits.push(i);
                    } 
                    // TODO: decide whether to unshift() or push() here. Affects typeahead display order.
                    // frontier.unshift([...splits_to_take, new_splits[Symbol.iterator]()]);
                    frontier.push([...splits_to_take, new_splits[Symbol.iterator]()]);
                    continue;
                } else {
                    throw e;
                }
            }

            results.push(result);
            parse_results.push(p.parse_result);
        }

        let view = compute_view(parse_results, tokens);

        let parsing: Parsing = {
            kind: 'Parsing',
            view,
            parses: parse_results,
            tokens,
            whitespace,
            raw
        };

        let valid_results = <T[]>results.filter(r => !(r instanceof NoMatch));
        if (valid_results.length === 0) {
            return {
                kind: 'NotParsed',
                parsing
            }
        } else if (valid_results.length > 1) {
            throw new ParseError(`Ambiguous parse: ${valid_results.length} valid results found.`);
        } else {
            // let processors: NoMatchProcess<T>[] = results.filter(r => r instanceof NoMatchProcess);
            let result = valid_results[0] //processors.reduce((r, p) => p(r), valid_results[0]);
            return {
                kind: 'Parsed',
                result: result,
                parsing
            }
            
        }
    }
}

export type RawInput = {
    kind: 'RawInput',
    text: string,
    submit: boolean
};

export function raw(text: string, submit: boolean = true): RawInput {
    return { kind: 'RawInput', text, submit };
}

// export type ProcessHook<T> = ((process?: ((result: T) => T)) => void);

export type ParserThread<T> = (p: Parser) => T; //, process_hook?: ProcessHook<T>) => T;


