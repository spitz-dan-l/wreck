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

import { FuckSet, array_last } from './datatypes'
import { starts_with, tokenize } from './text_tools'

export class NoMatch {};
class ParseRestart {
    constructor(public n_splits: number) {}
};
export class ParseError extends Error {};

export const SUBMIT_TOKEN = Symbol('SUBMIT');
export type Token = string | typeof SUBMIT_TOKEN;


class ConsumeSpec_Tainted {
    kind: 'ConsumeSpec' = 'ConsumeSpec';

    constructor(
        public token: ConsumeSpec.TaintedToken,
        public token_type: ConsumeSpec.TokenType = { kind: 'Filler' },
        public typeahead_type: ConsumeSpec.TypeaheadType = { kind: 'Available' }
    ) {}

    static make(obj: ConsumeSpec.Consumable_Tainted): ConsumeSpec_Tainted {
        if (ConsumeSpec.is_token(obj)) {
            return new ConsumeSpec_Tainted(obj);
        }
        return new ConsumeSpec_Tainted(obj.token, obj.token_type, obj.typeahead_type);
    }
}

export interface ConsumeSpec extends ConsumeSpec_Tainted {
    token: Token;
}


export namespace ConsumeSpec {
    export type TokenType = 
        { kind: 'Filler' } |
        { kind: 'Option' } |
        { kind: 'Keyword' };

    export type TypeaheadType =
        { kind: 'Available' } |
        { kind: 'Used' } |
        { kind: 'Locked' }; // TODO: Need to actually make this invalid when parsed.

    export const NEVER_TOKEN = Symbol('NEVER');
    export type TaintedToken = Token | typeof NEVER_TOKEN;

    export type Consumable =
        Token |
        (Partial<ConsumeSpec> & { token: Token });

    export type Consumable_Tainted =
        TaintedToken |
        (Partial<ConsumeSpec_Tainted> & { token: TaintedToken });

    export function is_token(x: Consumable_Tainted): x is TaintedToken {
        return typeof x === 'string' || x === SUBMIT_TOKEN || x === NEVER_TOKEN;
    }

    export function is_spec(x: Consumable_Tainted): x is ConsumeSpec {
        return !is_token(x);
    }
}

export namespace TokenMatch {
    export type MatchStatus = 'Match' | 'Partial' | 'Error';

    export type Match = { kind: 'Match', type: ConsumeSpec.TokenType };
    export type Partial = { kind: 'Partial', token: Token, type: ConsumeSpec.TypeaheadType };
    export type Error = { kind: 'Error', token: Token };
    
    export type Type = 
        Match |
        Partial |
        Error;
 
    export function is_match(m: Type): m is Match {
        return m.kind === 'Match'
    }

    export function is_partial(m: Type): m is Partial {
        return m.kind === 'Partial'
    }

    export function is_error(m: Type): m is Error {
        return m.kind === 'Error'
    }

    export type TokenMatch = { kind: 'TokenMatch', token: Token, type: Type };
}
export type TokenMatch = TokenMatch.TokenMatch;

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
    match_status: TokenMatch.MatchStatus,

    // Used to display typeahead during typing
    // TODO: make decisions about how to indicate a typeahead row is locked
    //    Currently it's a bit ugly as each token in the row could be locked on not
    //    Also a view of the typeahead with correct whitespace inserted
    typeahead_grid: TokenMatch.Partial[][]
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
    return result.length === 0 || TokenMatch.is_match(array_last(result).type);
}

// for each of the input tokens, how should they be displayed/highighted?
export function compute_view(parse_results: TokenMatch[][], input_stream: Token[]): ParsingView {
    // let parse_results: TokenMatch[][] = parsing.parses;
    // let input_stream: Token[] = parsing.tokens;

    let match_status: TokenMatch.MatchStatus;
    let submission = false;
    let row: TokenMatch[];

    if ((row = parse_results.find(row => array_last(row).type.kind === 'Match')) !== undefined) {
        match_status = 'Match';
        // TODO: throw a runtime exc here if we have a Match at the end but it's not SUBMIT_TOKEN ?
        // Would imply a commmand thread that doesn't end in submit.
        submission = array_last(row).token === SUBMIT_TOKEN;

        if (!submission) {
            throw new ParseError('Matching parse did not end in SUBMIT_TOKEN');
        }
    } else if ((row = parse_results.find(row => array_last(row).type.kind === 'Partial')) !== undefined) {
        match_status = 'Partial';
    } else {
        row = input_stream.map(tok => ({
            kind: 'TokenMatch',
            token: tok,
            type: {
                kind: 'Error',
                token: null
            }
        }));
        match_status = 'Error';
    }

    let typeahead_grid = compute_typeahead(parse_results, input_stream);
    let submittable = typeahead_grid.some(row => array_last(row).token === SUBMIT_TOKEN)

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
export function compute_typeahead(parse_results: TokenMatch[][], input_stream: Token[]): TokenMatch.Partial[][] {
    // let parse_results: TokenMatch[][] = parsing.parses;
    // let input_stream: Token[] = parsing.tokens;
    let rows_with_typeahead = parse_results.filter(pr => 
        !(TokenMatch.is_error(array_last(pr).type))
        && pr.slice(input_stream.length - 1).some(({ type }) => 
            TokenMatch.is_partial(type)
        )
    );

    return rows_with_typeahead.map(pr => {
        let start_idx = pr.findIndex(({ type }) => TokenMatch.is_partial(type));
        let result: TokenMatch.Partial[] = Array(start_idx).fill(null);
        let elts = <{ type: TokenMatch.Partial }[]>pr.slice(start_idx);
        result.push(...elts.map(tm => tm.type));
        return result;
    });

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
    
    consume(tokens: ConsumeSpec.Consumable[]): void;
    consume<T>(tokens: ConsumeSpec.Consumable[], callback: ParserThread<T>): T;
    consume<T>(tokens: ConsumeSpec.Consumable[], result: T): T;
    consume(tokens: ConsumeSpec.Consumable[], result?: any): any {
        let specs: ConsumeSpec_Tainted[] = tokens.map(ConsumeSpec_Tainted.make);

        this._consume(specs);
        
        return call_or_return(this, result);
    }

    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    _consume<T>(tokens: ConsumeSpec_Tainted[]) {
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

            if (spec_value === ConsumeSpec.NEVER_TOKEN) {
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
                        kind: 'Partial',
                        token: t.token === ConsumeSpec.NEVER_TOKEN ? '' : t.token,
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
                        kind: 'Error',
                        token: t.token === ConsumeSpec.NEVER_TOKEN ? '' : t.token
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
        return <never>this._consume([ConsumeSpec_Tainted.make(ConsumeSpec.NEVER_TOKEN)]);

    }

    submit(): void;
    submit<T>(callback: ParserThread<T>): T;
    submit<T>(result: T): T;
    submit<T>(result?: any) {
        this._consume([ConsumeSpec_Tainted.make(SUBMIT_TOKEN)]);

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
                    // TODO: decide whether to unshift() or push() here. Affects typeahead display order.
                    frontier.unshift([...splits_to_take, new_splits[Symbol.iterator]()]);
                    // frontier.push([...splits_to_take, new_splits[Symbol.iterator]()]);
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
            return {
                kind: 'Parsed',
                result: valid_results[0],
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

// Question: should the parser input be mandatory?
// Doesn't seem to complain when i leave out the first arg, even with this type
export type ParserThread<T> = (p: Parser) => T;
export type ParserThreads<T> =  ParserThread<T>[];

/*
    Little DSL to more concisely express sequences of tokens to consume

    TODO: support Used typeahead type
*/
export function make_consumer(spec: string): (parser: Parser) => void;
export function make_consumer<R>(spec: string, callback: ParserThread<R>): ParserThread<R>;
export function make_consumer<T>(spec: string, result: T): ParserThread<T>
export function make_consumer(spec: string, result?: any): ParserThread<any> {
    let toks = tokenize(spec)[0];

    return (parser) => {
        for (let t of toks) {
            let token_type: ConsumeSpec.TokenType;
            let typeahead_type: ConsumeSpec.TypeaheadType;

            if (t.startsWith('~')) {
                typeahead_type = { kind: 'Locked' };
                t = t.slice(1);
            }

            if (t.startsWith('*')) {
                token_type = { kind: 'Keyword' };
                t = t.slice(1);
            } else if (t.startsWith('&')) {
                token_type = { kind: 'Option' };
                t = t.slice(1);
            }

            parser.consume(t.split('_').map(t => ({ token: t, token_type, typeahead_type })));
        }

        return call_or_return(parser, result);
    }
}

export function consume(parser: Parser, spec: string): void;
export function consume<R>(parser: Parser, spec: string, callback: ParserThread<R>): R;
export function consume<T>(parser: Parser, spec: string, result: T): T
export function consume(parser: Parser, spec: string, result?: any): any {
    return make_consumer(spec, result)(parser);
}
