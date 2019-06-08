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

    TODO:
        - Availability constrains future availability
            - If a token is consumed with Used, then all subsequent tokens will have Available swapped to Used
            - Likewise for Locked, though in practice this doesn't matter because you can't consume pased a locked token.
        - When deduping typeahead options,
            - Availability:
                - Available is used if any options are available,
                - Used is used if any options are Used
                - Locked otherwise
            - The same tokens with different labels count as different options

*/

import { array_last, deep_equal, drop_keys } from './utils';
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
    'Available' | 'Used' | 'Locked';

const availability_order = {
    'Available': 0,
    'Used': 1,
    'Locked': 2
} as const

export type TokenLabels = {
    [label: string]: boolean
};

export type RawConsumeSpec = {
    kind: 'RawConsumeSpec';
    token: TaintedToken;
    availability: TokenAvailability;
    labels: TokenLabels;
}


export type MatchStatus = 'Match' | 'PartialMatch' | 'ErrorMatch';

export type TokenMatch = {
    kind: 'TokenMatch',
    status: MatchStatus,
    expected: RawConsumeSpec & { token: Token },
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
            let expected: RawConsumeSpec & { token: Token } = {
                kind: 'RawConsumeSpec',
                token: tok,
                availability: 'Available',
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

    function options_match(x: (PartialMatch | null)[], y: (PartialMatch | null)[]): boolean {
        return x.length === y.length && x.every((m, i) => {
            let n = y[i];
            if (m === null || n === null) {
                return m === n;
            }

            return (m.expected.token === n.expected.token &&
                    deep_equal(m.expected.labels, n.expected.labels));
        })
    }

    let grouped_options: {
        [k: string]: (PartialMatch | null)[][]
    } = {};

    function stringify_option(x: (PartialMatch | null)[]): string {
        let result = '';
        result += x.length+';';
        let n_nulls = x.findIndex(l => l !== null);
        result += n_nulls + ';';

        function stringify_elt(elt: PartialMatch): string {
            let result = '';
            if (typeof elt.expected.token === 'string') {
                result += elt.expected.token;
            }
            result += '|';
            result += Object.keys(elt.expected.labels);
            return result;
        }
        for (let l of x.slice(n_nulls)) {
            result += stringify_elt(<PartialMatch>l) + ';';
        }
        return result;
    }

    rows_with_typeahead.forEach(pr => {
        let start_idx = pr.findIndex(is_partial);
        let option: (PartialMatch | null)[] = Array(start_idx).fill(null);
        let elts = <PartialMatch[]>pr.slice(start_idx);
        option.push(...elts);

        let key = stringify_option(option);

        if (grouped_options[key] === undefined) {
            grouped_options[key] = [option];
        } else {
            grouped_options[key].push(option);
        }

        // // TODO: don't just check for simple equality.
        // // You can have same token + labels, but different availabilities.
        // // Availability should work like this:
        // //     Any options are Available -> Available
        // //     Else, any options Used -> Used
        // //     Else, Locked.
        // if (!unique_options.some((u_opt) => options_equal(u_opt, option))) {
        //     unique_options.push(option);
        // }
    });

    return Object.entries(grouped_options).map(([key, options]) => {
        let current_a: TokenAvailability = 'Locked';
        let current_index = 0;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let a = array_last(opt)!.expected.availability;
            if (availability_order[a] < availability_order[current_a]) {
                current_a = a;
                current_index = i;
            }
        }

        return {
            kind: 'TypeaheadOption',
            availability: current_a,
            option: options[current_index]
        };
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

export type ConsumeSpec =
    string |
    ConsumeSpecObj |
    ConsumeSpecArray;

type ConsumeSpecObj = {
    tokens: ConsumeSpec,
    labels?: TokenLabels,
    used?: boolean,
    locked?: boolean
    
};
export type ConsumeSpecOverrides = Omit<ConsumeSpecObj, 'tokens'>;

interface ConsumeSpecArray extends Array<ConsumeSpec> {};

export class Parser {
    constructor(input_stream: Token[], splits_to_take: number[]) {
        this.input_stream = input_stream;
        
        this._split_iter = splits_to_take[Symbol.iterator]();
    }

    input_stream: Token[];
    pos: number = 0;

    parse_result: TokenMatch[] = [];

    label_context: TokenLabels = {};

    _current_availability: TokenAvailability = 'Available'
    get current_availability(): TokenAvailability { return this._current_availability; }
    set current_availability(val) {
        if (availability_order[val] < availability_order[this._current_availability]) {
            return;
        }
        this._current_availability = val;
    }

    with_label_context<R>(labels: TokenLabels, cb: () => R) {
        let old_label_context = {...this.label_context};

        this.label_context = {...this.label_context, ...labels};

        try {
            return cb();
        } finally {
            this.label_context = old_label_context;
        }
    }

    _split_iter: Iterator<number>;

    consume(spec: ConsumeSpec): void;
    consume<T>(spec: ConsumeSpec, callback: ParserThread<T>): T;
    consume<T>(spec: ConsumeSpec, result: T): T;
    consume(spec: ConsumeSpec, result?: any): any {
        this._consume_spec(spec);
        return call_or_return(this, result);
    }

    _consume_spec(spec: ConsumeSpec, overrides?: ConsumeSpecOverrides): void {
        if (spec instanceof Array) {
            for (let s of spec) {
                this._consume_spec(s, overrides);
            }
        } else if (typeof spec === 'string') {
            return this._consume_string(spec, overrides);
        } else {
            return this._consume_object(spec, overrides);
        }
    }

    _consume_string(spec: string, overrides?: ConsumeSpecOverrides): void {
        let toks = tokenize(spec)[0];
            
        let labels: TokenLabels = { filler: true };
        let availability: TokenAvailability = 'Available';
        
        if (overrides) {
            if (overrides.labels) {
                labels = overrides.labels;
            }
            
            if (overrides.used) {
                availability = 'Used';
            }

            if (overrides.locked) {
                availability = 'Locked'
            }
        }
        
        for (let t of toks) {
            this._consume(t.split('_').map(t => ({
                kind: 'RawConsumeSpec',
                token: t,
                availability,
                labels
            })));
        }
    }

    _consume_object(spec: ConsumeSpecObj, overrides?: ConsumeSpecOverrides): void {
        let spec_: ConsumeSpecObj = {...spec};

        if (overrides) {
            if (overrides.used !== undefined) {
                spec_.used = overrides.used;
            }
            if (overrides.locked !== undefined) {
                spec_.locked = overrides.locked
            }

            if (overrides.labels) {
                spec_.labels = {...spec.labels, ...overrides.labels};
            }
        }

        return this._consume_spec(spec.tokens, drop_keys(spec_, 'tokens'))
    }

    _consume_dsl(dsl: string): void {
        let toks = tokenize(dsl)[0];

        for (let t of toks) {
            let labels: TokenLabels = { filler: true };
            let availability: TokenAvailability  = 'Available';

            if (t.startsWith('^')) {
                availability = 'Locked';
                t = t.slice(1);
            } else if (t.startsWith('~')) {
                availability = 'Used';
                t = t.slice(1);
            } else if (t.startsWith('+')) {
                availability = 'Available';
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
                kind: 'RawConsumeSpec',
                token: t,
                availability,
                labels
            })));
        }
    }

    clamp_availability(spec: RawConsumeSpec) {
        if (availability_order[spec.availability] < availability_order[this.current_availability]) {
            return {...spec, availability: this.current_availability};
        } else if (availability_order[spec.availability] > availability_order[this.current_availability]) {
            this.current_availability = spec.availability;
        }
        return spec;
    }
    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    _consume(tokens: RawConsumeSpec[]) {
        if (!is_parse_result_valid(this.parse_result)) {
            throw new ParseError('Tried to consume() on a done parser.');
        }

        tokens = tokens.map(t => this.clamp_availability(t));

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
                if (spec.availability === 'Locked') {
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

        function sanitize(spec: RawConsumeSpec): RawConsumeSpec & { token: Token } {
            if (spec.token !== NEVER_TOKEN) {
                return <RawConsumeSpec & { token: Token }>spec;
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
            kind: 'RawConsumeSpec',
            token: NEVER_TOKEN,
            labels: { filler: true },
            availability: 'Available'
        } as const]);
    }

    submit(): void;
    submit<T>(callback: ParserThread<T>): T;
    submit<T>(result: T): T;
    submit<T>(result?: any) {
        this._consume([{
            kind: 'RawConsumeSpec',
            token: SUBMIT_TOKEN,
            labels: { filler: true },
            availability: 'Available'
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

// Helper to create a gated ParserThread. cond() is called, and if its condition is 
// not met, the thread is eliminated, else it runs the parser thread, t.
export function gate<Ret>(cond: () => boolean, t: ParserThread<Ret>): ParserThread<Ret> {
    return p => {
        if (!cond()) {
            p.eliminate();
        }
        return t(p);
    }
}

