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

import { filter, map } from 'iterative';
import { starts_with, tokenize, split_tokens, uncapitalize } from 'lib/text_utils';
import { array_last, drop_keys } from 'lib/utils';
import { type_or_kind_is } from 'lib/type_predicate_utils';
import { RawConsumeSpec, Token, TokenAvailability, SUBMIT, AVAILABILITY_ORDER, TokenLabels, ConsumeSpec, process_consume_spec, TaintedRawConsumeSpec, NEVER_TOKEN } from './consume_spec';

// class NoMatch {
//     kind: 'NoMatch' = 'NoMatch';
// };

const NO_MATCH_BRAND: unique symbol = Symbol('NO_MATCH_BRAND');
type NoMatch = {
    kind: 'NoMatch';
    __brand: typeof NO_MATCH_BRAND
}

const NO_MATCH: NoMatch = {kind: 'NoMatch'} as NoMatch;

function is_no_match<T extends {}>(x: T | NoMatch): x is NoMatch {
    return x === NO_MATCH; //('kind' in x) && x.kind === 'NoMatch';
}

type ParseRestart = {
    kind: 'ParseRestart',
    n_splits: number
}

function parse_restart(n_splits: number): ParseRestart {
    return { kind: 'ParseRestart', n_splits };
}

function is_parse_restart<T>(x: T | ParseRestart): x is ParseRestart {
    return (typeof(x) === 'object') && ('kind' in x) && x.kind === 'ParseRestart';
}

// class ParseRestart {
//     kind: 'ParseRestart' = 'ParseRestart';
//     constructor(public n_splits: number) {}
// };
export class ParseError extends Error {};



export type MatchStatus = 'Match' | 'PartialMatch' | 'ErrorMatch';

export type TokenMatch = {
    kind: 'TokenMatch',
    status: MatchStatus,
    expected: RawConsumeSpec,
    actual: Token
}

export type TypeaheadOption = {
    kind: 'TypeaheadOption',
    availability: TokenAvailability,
    option: ((TokenMatch & { status: 'PartialMatch' }) | undefined)[] // undefined left-padded to match length of token match
};

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
    if (result.length === 0) {
        return true;
    }
    const last = array_last(result)!;
    return last.status === 'Match' && last.expected.token !== SUBMIT;
    // return result.length === 0 || array_last(result)!.status === 'Match';
}

type GroupableRow = (TokenMatch | undefined)[]
// export function group_rows(options: GroupableRow[], consider_labels=true) {
export function group_rows(options: Iterable<GroupableRow>, consider_labels=true) {
    let grouped_options: {
        [k: string]: GroupableRow[]
    } = {};

    function stringify_option(x: GroupableRow): string {
        let result = '';
        result += x.length+';';
        let n_nulls = x.findIndex(l => l !== undefined);
        result += n_nulls + ';';

        function stringify_elt(elt: TokenMatch): string {
            let result = '';
            if (typeof elt.expected.token === 'string') {
                result += elt.expected.token;
            }
            if (consider_labels) {
                result += '|';
                result += Object.keys(elt.expected.labels).join(',');
            }
            return result;
        }
        for (let l of x.slice(n_nulls)) {
            result += stringify_elt(<TokenMatch>l) + ';';
        }
        return result;
    }

    for (let option of options) {
        let key = stringify_option(option);

        if (grouped_options[key] === undefined) {
            grouped_options[key] = [option];
        } else {
            grouped_options[key].push(option);
        }
    }
    return grouped_options;
}

// for each of the input tokens, how should they be displayed/highighted?
export function compute_view(parse_results: TokenMatch[][], input_stream: Token[]): ParsingView {
    let match_status: MatchStatus;
    let submission = false;
    let row: TokenMatch[];

    if ((row = parse_results.find(row => array_last(row)!.status === 'Match')!) !== undefined) {
        match_status = 'Match';
        submission = array_last(row)!.actual === SUBMIT;

        if (!submission) {
            throw new ParseError('Matching parse did not end in SUBMIT_TOKEN');
        }
    } else if (parse_results.some(row => array_last(row)!.status === 'PartialMatch')) {
        //    (TODO: flip availability scale s.t. Available is 2, not 0.)
        if (input_stream.length === 0) {
            row = [];
        } else {
            
            let all_partial_rows = filter(parse_results, row => array_last(row)!.status === 'PartialMatch');
            let truncated = map(all_partial_rows, row => row.slice(0, input_stream.length));
            // let all_partial_rows = parse_results.filter(row => array_last(row)!.status === 'PartialMatch');
            // let truncated = all_partial_rows.map(row => row.slice(0, input_stream.length));

            let grouped = <{[k:string]: TokenMatch[][]}> group_rows(truncated);

            let first_group = grouped[Object.keys(grouped)[0]];

            // NOTE: It should always get switched from Locked since Locked specs can never be entered
            let current_a: TokenAvailability = 'Locked';
            let current_index = 0;
            
            for (let i = 0; i < first_group.length; i++) {
                let opt = first_group[i];
                let a = array_last(opt)!.expected.availability;
                if (AVAILABILITY_ORDER[a] < AVAILABILITY_ORDER[current_a]) {
                    current_a = a;
                    current_index = i;
                }
            }
            row = first_group[current_index]
        }
        match_status = 'PartialMatch';
    } else {
        row = input_stream.map(tok => {
            let expected: RawConsumeSpec = {
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
    let submittable = typeahead_grid.some(row => array_last(row.option)!.expected.token === SUBMIT)

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

    let rows_with_typeahead = filter(parse_results, pr => 
        !(array_last(pr)!.status === 'ErrorMatch')
        && pr.slice(input_stream.length - 1).some(is_partial)
    );
    // let rows_with_typeahead = parse_results.filter(pr => 
    //     !(array_last(pr)!.status === 'ErrorMatch')
    //     && pr.slice(input_stream.length - 1).some(is_partial)
    // );

    type groups_of_partials = { [k: string]: (PartialMatch | undefined)[][] };
    let grouped_options: groups_of_partials = <groups_of_partials> group_rows(
        map(rows_with_typeahead, pr => {
            let start_idx = pr.findIndex(is_partial);
            let option: (PartialMatch | undefined)[] = Array(start_idx).fill(undefined);
            let elts = <PartialMatch[]>pr.slice(start_idx);
            option.push(...elts);
            return option
        }
    ));
    // let grouped_options: groups_of_partials = <groups_of_partials> group_rows(
    //     rows_with_typeahead.map(pr => {
    //         let start_idx = pr.findIndex(is_partial);
    //         let option: (PartialMatch | null)[] = Array(start_idx).fill(null);
    //         let elts = <PartialMatch[]>pr.slice(start_idx);
    //         option.push(...elts);
    //         return option
    //     }
    // ));

    return Object.entries(grouped_options).map(([key, options]) => {
        let current_a: TokenAvailability = 'Locked';
        let current_index = 0;

        for (let i = 0; i < options.length; i++) {
            let opt = options[i];
            let a = array_last(opt)!.expected.availability;
            if (AVAILABILITY_ORDER[a] < AVAILABILITY_ORDER[current_a]) {
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
}


/*
    Helper function for parser methods that take an optional callback or return value on success
    The pattern is to use function overloading to get the types right, and call this
    function to get the behavior right.
*/
function call_or_return(parser: Parser, result?: any): any {
    if (result instanceof Function) {
        return result(parser);
    }
    return result;
}

export type ParseValue<T> = T | NoMatch | ParseRestart;

export function failed<T>(result: ParseValue<T>): result is NoMatch | ParseRestart {
    if (result === undefined) {
        return false;
    }
    return result === NO_MATCH || type_or_kind_is(result, 'ParseRestart');
}

type Path = (number | Iterator<number>)[];

export class Parser {
    constructor(input_stream: Token[], splits_to_take: number[]) {
        this.input_stream = input_stream;
        
        this.split_iter = splits_to_take[Symbol.iterator]();
        // this.splits_to_take = splits_to_take;
    }

    private split_iter: Iterator<number, void>;
    private splits_to_take: number[];
    private current_split: number = 0;

    input_stream: Token[];
    pos: number = 0;

    parse_result: TokenMatch[] = [];

    label_context: TokenLabels = {};

    failure: NoMatch | ParseRestart | undefined = undefined;

    private _current_availability: TokenAvailability = 'Available'
    get current_availability(): TokenAvailability { return this._current_availability; }
    set current_availability(val) {
        if (AVAILABILITY_ORDER[val] < AVAILABILITY_ORDER[this._current_availability]) {
            return;
        }
        this._current_availability = val;
    }

    with_label_context<R>(labels: TokenLabels, cb: () => R) {
        const old_label_context = {...this.label_context};

        this.label_context = {...this.label_context, ...labels};

        // pretty sure we can just do this since we no longer rely on
        // exceptions for flow control in parser threads
        const result = cb();
        this.label_context = old_label_context;
        return result;

        // try {
        //     return cb();
        // } finally {
        //     this.label_context = old_label_context;
        // }
    }

    consume(spec: ConsumeSpec): ParseValue<void>;
    consume<T>(spec: ConsumeSpec, callback: ParserThread<T>): ParseValue<T>;
    consume<T>(spec: ConsumeSpec, result: T): ParseValue<T>;
    consume(spec: ConsumeSpec, result?: any): any {
        const status = this._consume_spec(spec);
        if (failed(status)) {
            return status;
        }

        return call_or_return(this, result);
    }

    private _consume_spec(spec: ConsumeSpec): ParseValue<void> {
        const chunks = process_consume_spec(spec);

        return this._consume_chunks(chunks);
    }

    private _consume_chunks(token_chunks: TaintedRawConsumeSpec[][]): ParseValue<void> {
        for (let chunk of token_chunks) {
            const status = this._consume(chunk.map(rcs => ({
                ...rcs,
                labels: {...this.label_context, ...rcs.labels}
            })));
            
            if (failed(status)) {
                return status;
            }
        }
    }

    private clamp_availability_MUTATE(spec: TaintedRawConsumeSpec): void {
        if (AVAILABILITY_ORDER[spec.availability] < AVAILABILITY_ORDER[this.current_availability]) {
            spec.availability = this.current_availability;
            // return {...spec, availability: this.current_availability};
        } else if (AVAILABILITY_ORDER[spec.availability] > AVAILABILITY_ORDER[this.current_availability]) {
            this.current_availability = spec.availability;
        }
        // return spec;
    }
    
    private _consume(tokens: TaintedRawConsumeSpec[]): ParseValue<void> {
        if (!is_parse_result_valid(this.parse_result)) {
            throw new ParseError('Tried to consume() on a done parser.');
        }

        for (let t of tokens) {
            this.clamp_availability_MUTATE(t);
        }
        // tokens = tokens.map(t => this.clamp_availability(t));

        let partial = false;
        let error = false;
        let i = 0
        // check if exact match
        for (i = 0; i < tokens.length; i++) {
            const spec = tokens[i];

            const spec_value = spec.token;

            if (spec_value === NEVER_TOKEN) {
                error = true;
                break;
            }

            if (this.pos + i >= this.input_stream.length) {
                partial = true;
                break;
            }
            const input = this.input_stream[this.pos + i];
            
            function is_match(tok1: Token, tok2: Token) {
                if (typeof(tok1) === 'string' && typeof(tok2) === 'string') {
                    return tok1.toLocaleLowerCase() === tok2.toLocaleLowerCase();
                }
                return tok1 === tok2;
            }

            if (is_match(spec_value, input)) {
            // if (spec_value === input) {
                if (spec.availability === 'Locked') {
                    error = true;
                    break;
                }
                continue;
            }

            if (spec_value === SUBMIT || input === SUBMIT) {
                // eliminate case where either token is SUBMIT_TOKEN (can't pass into starts_with())
                error = true;
                break;
            }
            if (starts_with(spec_value.toLocaleLowerCase(), input.toLocaleLowerCase())) {
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

        function sanitize_MUTATE(spec: TaintedRawConsumeSpec): RawConsumeSpec {
            if (spec.token !== NEVER_TOKEN) {
                return <RawConsumeSpec>spec;
            }
            spec.token = '';
            return <RawConsumeSpec>spec;
        }

        if (partial) {
            // push all tokens as partials
            this.parse_result.push(...tokens.map((t, j) => 
                ({
                    kind: 'TokenMatch',
                    status: 'PartialMatch',
                    actual: this.input_stream[this.pos + j] || '',
                    expected: sanitize_MUTATE(t)
                } as const)));
            // increment pos
            this.pos = this.input_stream.length;
            this.failure = NO_MATCH; //new NoMatch();
            return this.failure;
        }

        if (error) {
            this.parse_result.push(...tokens.map((t, j) => ({
                    kind: 'TokenMatch',
                    status: 'ErrorMatch',
                    actual: this.input_stream[this.pos + j] || '',
                    expected: sanitize_MUTATE(t)
                } as const)));
            // increment pos
            this.pos = this.input_stream.length;
            this.failure = NO_MATCH //new NoMatch();
            return this.failure;
        }

        // push all tokens as valid
        this.parse_result.push(...tokens.map((t, j) =>
            ({
                kind: 'TokenMatch',
                status: 'Match',
                actual: this.input_stream[this.pos + j],
                expected: sanitize_MUTATE(t)
            } as const)));
        // increment pos
        this.pos += tokens.length;
        return undefined;
    }

    eliminate(): NoMatch {
        /*
            It is important that we not just throw NoMatch, and instead actully attempt to consume a never token.
        */
        return <NoMatch>this._consume([{
            kind: 'RawConsumeSpec',
            token: NEVER_TOKEN,
            labels: {},
            availability: 'Available'
        } as const]);
    }

    submit(): ParseValue<void>;
    submit<T>(callback: ParserThread<T>): ParseValue<T>;
    submit<T>(result: T): ParseValue<T>;
    submit(result?: any) {
        const status = this.consume(SUBMIT);

        if (failed(status)) {
            return status;
        }
        return call_or_return(this, result);
    }

    split<T>(subthreads: ParserThread<T>[]): ParseValue<T>;
    split<T, R>(subthreads: ParserThread<T>[], callback: (result: T, parser?: Parser) => ParseValue<R>): ParseValue<R>;
    split<T, R>(subthreads: ParserThread<T>[], callback?: (result: T, parser?: Parser) => ParseValue<R>):  ParseValue<R> {
        if (subthreads.length === 0) {
            return this.eliminate();
        }

        const next_result = this.split_iter.next();

        if (next_result.done) {
            this.failure = parse_restart(subthreads.length); //new ParseRestart(subthreads.length);
            return this.failure;
        }
        
        const st = subthreads[next_result.value];
        const result = st(this);

        if (failed(result)) {
            return result;
        }

        if (callback === undefined) {
            return <any>result;
        }

        return callback(result, this);
    }

    static run_thread<T>(raw: RawInput, t: ParserThread<T>): ParseResult<T> {
        const [tokens, whitespace]: [Token[], string[]] = tokenize(raw.text);
        if (raw.submit) {
            tokens.push(SUBMIT);
        }

        // The core parsing algorithm
        function match_input() {
            let n_iterations = 0;
            let n_splits = 0;

            const frontier: Path[] = [[]];
            const results: (T | NoMatch)[] = [];
            const parse_results: TokenMatch[][] = [];

            while (frontier.length > 0) {
                const path = <Path>frontier.pop();
                let splits_to_take: number[];
                if (path.length === 0) {
                    splits_to_take = path as number[];
                } else {
                    let n = (array_last(path) as Iterator<number>).next();
                    if (n.done) {
                        continue;
                    } else {
                        frontier.push(path);
                    }
                    splits_to_take = [...path.slice(0, -1), n.value] as number[];
                }

                const p = new Parser(tokens, splits_to_take);

                let result: ParseValue<T> = NO_MATCH;
                n_iterations++;

                result = t(p);

                if (is_parse_restart(result)) {
                    n_splits++;
                    frontier.push([...splits_to_take, new Array(result.n_splits).keys()]); //new_splits[Symbol.iterator]()]);
                    continue;
                }

                if (!is_no_match(result) && (p.parse_result.length === 0 || array_last(p.parse_result)!.expected.token !== SUBMIT)) {
                    const expected_command: string = p.parse_result.map(r => r.expected.token).join(' ');

                    throw new ParseError("Command did not end in SUBMIT: " + expected_command);
                }

                results.push(result);
                parse_results.push(p.parse_result);
            }

            return [results, parse_results] as const;
        }

        const [results, parses] = match_input();        

        // Assembling the view object, data structures for building views of the parsed text
        const view = compute_view(parses, tokens);

        const parsing: Parsing = {
            kind: 'Parsing',
            view,
            parses,
            tokens,
            whitespace,
            raw
        };

        // Filter and find the single valid result to return
        const valid_results = <T[]>results.filter(r => !is_no_match(r)); //(r instanceof NoMatch));

        if (valid_results.length === 0) {
            return {
                kind: 'NotParsed',
                parsing
            }
        } else if (valid_results.length > 1) {
            throw new ParseError(`Ambiguous parse: ${valid_results.length} valid results found.`);
        } else {
            const result = valid_results[0];
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

export type ParserThread<T> = (p: Parser) => ParseValue<T>;

// Helper to create a gated ParserThread. cond() is called, and if its condition is 
// not met, the thread is eliminated, else it runs the parser thread, t.
export function gate<Ret>(cond: boolean, t: ParserThread<Ret>): ParserThread<Ret> {
    return p => !cond
        ? p.eliminate()
        : t(p);
}

// Helper to extract all possible valid inputs from a parser thread
/*
Can take up to 20-30ms to walk a reasonably deep thread. That is too slow.

Options
    - Use option labels to prune the walk,
      and only ever do walks with filters
    - Find a way to drastically speed up parsing
        - wasm
        - no exceptions (Done)
        - something else clever

*/
export function traverse_thread<T>(thread: ParserThread<T>, command_filter?: (consume_spec: RawConsumeSpec[]) => boolean): { [cmd: string]: Parsed<T> } {
    let n_partials = 0;
    let n_matches = 0;

    const result: { [cmd: string]: Parsed<T> } = {};

    const frontier: RawInput[] = [{kind: 'RawInput', text: '', submit: false}];

    while (frontier.length > 0) {
        const cmd = frontier.shift()!;
        const res = Parser.run_thread(cmd, thread);
        if (res.kind === 'Parsed') {
            result[cmd.text] = res;
            n_matches++;
        } else {
            n_partials++;
        }

        const partial_parses = filter(res.parsing.parses, ms => array_last(ms)!.status === 'PartialMatch')
        // let partial_parses = res.parsing.parses.filter(ms => array_last(ms)!.status === 'PartialMatch')
        const grps = group_rows(partial_parses, false);

        for (let k of Object.keys(grps)) {
            const grp = grps[k];

            if (command_filter !== undefined) {
                const expected = grp[0].map(m => m!.expected);
                if (!command_filter(expected)) {
                    continue;
                }
            }

            const new_cmd: RawInput = <RawInput>{
                kind: 'RawInput',
                submit: false
            };
            const toks: string[] = [];
            for (let m of grp[0]) {
                const tok = m!.expected.token;
                if (typeof(tok) === 'string') {
                    toks.push(tok);
                } else {
                    // it must be SUBMIT.
                    new_cmd.submit = true;
                    break;
                }
            }
            new_cmd.text = toks.join(' ');
            frontier.push(new_cmd);
        }
    }
    return result;
}


