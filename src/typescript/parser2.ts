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
import { starts_with } from './text_tools'

class NoMatch extends Error {};
class ParseRestart extends Error {
    constructor(n_splits: number) {
        super();
        this.n_splits = n_splits;
    }

    n_splits: number;
};
class ParseError extends Error {};

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
export type InputDisplay = {
    kind: 'InputDisplay',
    matches: TokenMatch[],
    submittable: boolean
};

export type ParseResult = TokenMatch[];

export function is_parse_result_valid(result: ParseResult) {
    return result.length === 0 || TokenMatch.is_match(array_last(result).type);
}

// for each of the input tokens, how should they be displayed/highighted?
export function input_display(parse_results: ParseResult[], input_stream: Token[]): InputDisplay {
    // find the first submittable row
    let row: ParseResult;
    let submittable = true;
    row = parse_results.find(row => {
        let last = array_last(row);
        return TokenMatch.is_partial(last.type) && last.type.token === SUBMIT_TOKEN;
    });
    // if none, find the first non-error row
    if (row === undefined) {
        submittable = false;
        row = parse_results.find(row => row.every(({ type }) => !TokenMatch.is_error(type)));
    }
    // if none, make everything error
    if (row === undefined) {
        row = input_stream.map(tok => ({
            kind: 'TokenMatch',
            token: tok,
            type: {
                kind: 'Error',
                token: null
            }
        }));
    }

    return {
        kind: 'InputDisplay',
        matches: row,
        submittable
    };
}

/*
Typeahead
    For each non-valid row (ignoring errors, partial only)
    If the row is at least the length of the input stream
    Typeahead is the Partial TokenMatches suffix (always at the end)
*/
export function typeahead(parse_results: ParseResult[], input_stream: Token[]): TokenMatch.Partial[][] {
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
}


export class Parser {
    constructor(input_stream: Token[], splits_to_take: number[]) {
        this.input_stream = input_stream;
        
        this._split_iter = splits_to_take[Symbol.iterator]();
    }

    input_stream: Token[];
    pos: number = 0;

    parse_result: ParseResult = [];
    
    _split_iter: Iterator<number>;
    
    consume(tokens: ConsumeSpec.Consumable[]): void;
    consume<T>(tokens: ConsumeSpec.Consumable[], callback: () => T): T;
    consume<T>(tokens: ConsumeSpec.Consumable[], result: T): T;
    consume(tokens: ConsumeSpec.Consumable[], result?: any): any {
        let specs: ConsumeSpec_Tainted[] = tokens.map(ConsumeSpec_Tainted.make);

        this._consume(specs);
        if (result instanceof Function) {
            return result();
        }
        return result;
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
    submit<T>(callback: () => T): T;
    submit<T>(result: T): T;
    submit<T>(result?: any) {
        return this.consume([SUBMIT_TOKEN], result);
    }

    split<T>(subthreads: ParserThread<T>[]): T {
        let {value: split_value, done} = this._split_iter.next();
        if (done) {
            throw new ParseRestart(subthreads.length);
        }
        
        let st = subthreads[split_value];
        return st(this);
    }

    static run_thread<T>(t: ParserThread<T>, tokens: Token[]): [T | NoMatch, ParseResult[]] {
        let frontier = [[]];
        let results: (T | NoMatch)[] = [];
        let parse_results: ParseResult[] = [];

        while (frontier.length > 0) {
            let path = frontier.pop();
            let splits_to_take;
            if (path.length === 0) {
                splits_to_take = path;
            } else {
                let n = array_last(path).next();
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
                    let new_splits = [];
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

        let valid_results = results.filter(r => !(r instanceof NoMatch));
        if (valid_results.length === 0) {
            return [new NoMatch(), parse_results];
        }
        if (valid_results.length > 1) {
            throw new ParseError(`Ambiguous parse: ${valid_results.length} valid results found.`);
        }
        return [valid_results[0], parse_results];
    }

    // demonstration of the overloaded
    // bloop() {
    //     let x = this.split([(p) => 4]);
    //     let x2 = this.split(
    //         <ParserThreads<string | number>>[
    //             ((p) => 4),
    //             ((p) => 'f')
    //         ],
    //         (rs) => 1);
    //     // this will be an error because the inferred type of an empty array is {}[], and number is not compatible with {}
    //     // in practice this should not matter because an empty array of subthreads is a runtime error.
    //     // let x3 = this.split([], (x: number) => 4);
    // }
}

// Question: should the parser input be mandatory?
// Doesn't seem to complain when i leave out the first arg, even with this type
export type ParserThread<T> = (p: Parser) => T;
export type ParserThreads<T> =  ParserThread<T>[];


