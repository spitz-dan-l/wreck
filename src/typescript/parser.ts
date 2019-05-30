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

class ParseRestart {
    constructor(public n_splits: number) {}
};
export class ParseError extends Error {};

export const SUBMIT_TOKEN = Symbol('SUBMIT');
export type Token = string | typeof SUBMIT_TOKEN;

export const NEVER_TOKEN = Symbol('NEVER');
export type TaintedToken = Token | typeof NEVER_TOKEN;

export type TokenAvailability =
    { kind: 'Available' } |
    { kind: 'Used' } |
    { kind: 'Locked' };

export type TokenLabels = {
    [label: string]: boolean
};

export type ConsumeSpec = {
    kind: 'ConsumeSpec';
    token: TaintedToken;
    availability: TokenAvailability;
    labels: TokenLabels;
}


export type MatchStatus = 'Match' | 'PartialMatch' | 'ErrorMatch';

export type TokenMatch = {
    kind: 'TokenMatch',
    status: MatchStatus,
    expected: ConsumeSpec & { token: Token },
    actual: Token
}

export type TypeaheadOption = {
    kind: 'TypeaheadOption',
    availability: TokenAvailability,
    option: ((TokenMatch & { status: 'PartialMatch' }) | null)[] // null left-padded to match length of token match
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
    return result.length === 0 || array_last(result).status === 'Match';
}

// for each of the input tokens, how should they be displayed/highighted?
export function compute_view(parse_results: TokenMatch[][], input_stream: Token[]): ParsingView {
    let match_status: MatchStatus;
    let submission = false;
    let row: TokenMatch[];

    if ((row = parse_results.find(row => array_last(row).status === 'Match')!) !== undefined) {
        match_status = 'Match';
        submission = array_last(row).actual === SUBMIT_TOKEN;

        if (!submission) {
            throw new ParseError('Matching parse did not end in SUBMIT_TOKEN');
        }
    } else if ((row = parse_results.find(row => array_last(row).status === 'PartialMatch')!) !== undefined) {
        // chop off the partial bits that haven't been started yet
        row = row.slice(0, input_stream.length);
        match_status = 'PartialMatch';
    } else {
        row = input_stream.map(tok => {
            let expected: ConsumeSpec & { token: Token } = {
                kind: 'ConsumeSpec',
                token: tok,
                availability: { kind: 'Available' },
                labels: {}
            }
            return {
                kind: 'TokenMatch',
                status: 'ErrorMatch',
                actual: tok,
                expected
            };
        });
        match_status = 'ErrorMatch';
    }

    let typeahead_grid = compute_typeahead(parse_results, input_stream);
    let submittable = typeahead_grid.some(row => array_last(row.option)!.expected.token === SUBMIT_TOKEN)

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
    type PartialMatch = TokenMatch & { status: 'PartialMatch' };
    
    function is_partial(tm: TokenMatch): tm is PartialMatch {
        return tm.status === 'PartialMatch';
    }

    let rows_with_typeahead = parse_results.filter(pr => 
        !(array_last(pr).status === 'ErrorMatch')
        && pr.slice(input_stream.length - 1).some(is_partial)
    );

    let unique_options: (PartialMatch | null)[][] = [];

    function options_equal(x: (PartialMatch | null)[], y: (PartialMatch | null)[]): boolean {
        return x.length === y.length && x.every((m, i) => deep_equal(m, y[i]))
    }

    rows_with_typeahead.forEach(pr => {
        let start_idx = pr.findIndex(is_partial);
        let option: (PartialMatch | null)[] = Array(start_idx).fill(null);
        let elts = <PartialMatch[]>pr.slice(start_idx);
        option.push(...elts);

        if (!unique_options.some((u_opt) => options_equal(u_opt, option))) {
            unique_options.push(option);
        }
    });

    return unique_options.map(option => ({
        kind: 'TypeaheadOption',
        availability: array_last(option)!.expected.availability,
        option
    }));
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
            let labels: TokenLabels = { filler: true };
            let availability: TokenAvailability  = { kind: 'Available' };;

            if (t.startsWith('^')) {
                availability = { kind: 'Locked' };
                t = t.slice(1);
            } else if (t.startsWith('~')) {
                availability = { kind: 'Used' };
                t = t.slice(1);
            } else if (t.startsWith('+')) {
                availability = { kind: 'Available' };
                t = t.slice(1);
            }

            if (t.startsWith('*')) {
                labels = { keyword: true };
                t = t.slice(1);
            } else if (t.startsWith('&')) {
                labels = { option: true };
                t = t.slice(1);
            } else if (t.startsWith('=')) {
                labels = { filler: true };
                t = t.slice(1);
            }

            this._consume(t.split('_').map(t => ({
                kind: 'ConsumeSpec',
                token: t,
                availability,
                labels
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
                if (spec.availability.kind === 'Locked') {
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

        function sanitize(spec: ConsumeSpec): ConsumeSpec & { token: Token } {
            if (spec.token !== NEVER_TOKEN) {
                return <ConsumeSpec & { token: Token }>spec;
            }
            return {...spec, token: ''};
        }

        if (partial) {
            // push all tokens as partials
            this.parse_result.push(...tokens.map((t, j) => 
                ({
                    kind: 'TokenMatch',
                    status: 'PartialMatch',
                    actual: this.input_stream[this.pos + j] || '',
                    expected: sanitize(t)
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
                    status: 'ErrorMatch',
                    actual: this.input_stream[this.pos + j] || '',
                    expected: sanitize(t)
                } as const)));
            // increment pos
            this.pos = this.input_stream.length;
            throw new NoMatch();
        }

        // push all tokens as valid
        this.parse_result.push(...tokens.map((t, j) =>
            ({
                kind: 'TokenMatch',
                status: 'Match',
                actual: this.input_stream[this.pos + j],
                expected: sanitize(t)
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
            labels: { filler: true },
            availability: { kind: 'Available' }
        } as const]);
    }

    submit(): void;
    submit<T>(callback: ParserThread<T>): T;
    submit<T>(result: T): T;
    submit<T>(result?: any) {
        this._consume([{
            kind: 'ConsumeSpec',
            token: SUBMIT_TOKEN,
            labels: { filler: true },
            availability: { kind: 'Available' }
        } as const]);

        return call_or_return(this, result);
    }

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

            let result: T | NoMatch;
            try {
                result = t(p);
            } catch (e) {
                if (e instanceof NoMatch) {
                    result = e;
                } else if (e instanceof ParseRestart) {
                    let new_splits: number[] = [];
                    for (let i = 0; i < e.n_splits; i++) {
                        new_splits.push(i);
                    } 
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
            let result = valid_results[0];
            return {
                kind: 'Parsed',
                result: result,
                parsing
            };
            
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

export type ParserThread<T> = (p: Parser) => T;


