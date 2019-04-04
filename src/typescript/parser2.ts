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

import { FuckSet } from './datatypes'
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

const SUBMIT_TOKEN = Symbol('SUBMIT');
type Token = string | typeof SUBMIT_TOKEN;


export namespace ConsumeSpec {
    export type TokenType = 
        ['Filler'] |
        ['Option'] |
        ['Keyword'];

    export type TypeaheadType =
        ['Available'] |
        ['Used'] |
        ['Locked'];

    export enum Fields { kind, token, token_type, typeahead_type };
    export type ConsumeSpec =
        ['ConsumeSpec', Token, TokenType, TypeaheadType];
    
    export type Consumable =
        Token |
        ConsumeSpec;

    export function is_spec(x: Consumable): x is ConsumeSpec {
        return x instanceof Array;
    }
    export function is_token(x: Consumable): x is Token {
        return typeof x === 'string' || x === SUBMIT_TOKEN;
    }
}
export type ConsumeSpec = ConsumeSpec.ConsumeSpec;

export namespace TokenMatch {
    export type Match = { kind: 'Match' };
    export type Partial = { kind: 'Partial', token: Token };
    export type Error = { kind: 'Error', token: Token };
    
    export type Type = 
        Match |
        Partial |
        Error;
    // export type Type = 
    //     ['Match'] |
    //     ['Partial', Token] |
    //     ['Error', Token];

    export function is_match(m: Type): m is Match {
        return m.kind === 'Match'
    }

    export function is_partial(m: Type): m is Partial {
        return m.kind === 'Partial'
    }

    export function is_error(m: Type): m is Error {
        return m.kind === 'Error'
    }

    // export enum Fields{ kind, token, type };
    // export type TokenMatch = ['TokenMatch', Token, Type];

    export type TokenMatch = { kind: 'TokenMatch', token: Token, type: Type };
}
export type TokenMatch = TokenMatch.TokenMatch;

/*

    Filler, Option, Error

    Ready, Not Ready (to execute)

*/
export namespace InputDisplay {
    export type Type =
        ConsumeSpec.TokenType |
        ['Error'];

    export type Submit =
        ['Submit'] |
        ['NoSubmit'];

    export type InputDisplay = ['InputDisplay', Type, Submit];
}

export type InputDisplay = InputDisplay.InputDisplay;
import ID = InputDisplay;

type TypeaheadDisplay =
    ['Available'] |
    ['Used'] |
    ['Locked']


type ParseResult = TokenMatch[];

function is_parse_result_valid(result: ParseResult) {
    return result.length === 0 || TokenMatch.is_match(array_last(result).type);
}

// for each of the input tokens, how should they be displayed/highighted?
function input_display(parse_results: ParseResult[]): InputDisplay[] {
    
    // determine if submittable
    let submittable = parse_results.some(row => {
        let last = row[row.length - 1];
        return last[1] === SUBMIT_TOKEN && TokenMatch.is_match(last[2])
    });

    let display_submit: ID.Submit = submittable ? ['Submit'] : ['NoSubmit'];

    let pos = 0;
    let result: InputDisplay[] = [];
    
    while (true) {
        // get the column of TokenMatches
        let column = parse_results.filter(row => row.length > pos).map(row => row[pos]);

        if (column.length === 0) {
            break;
        }

        let display_type: ID.Type;
        // determine error
        if (column.every(({ type }) => TokenMatch.is_error(type))) {
            display_type = ['Error'];
        } else {
            // count unique token values
            let uniq_toks = new FuckSet<Token>(column.map(({ token, type }) => {
                switch (type.kind) {
                    case 'Match':
                        return token;
                    default:
                        return type.token;
                }
            }));

            display_type = uniq_toks.size === 1 ? ['Filler'] : ['Option'];
        }

        result.push(['InputDisplay', display_type, display_submit]);

        pos++;
    }
    return result;
}

/*
Typeahead

    For each non-valid row (ignoring errors, partial only)
    If the row is at least the length of the input stream
    Typeahead is the Partial TokenMatches suffix (always at the end)
*/
// for each row of typeahead to display, what are the tokens?
// will be positioned relative to the first input token.
function typeahead(parse_results: ParseResult[], input_stream: Token[]): Token[][] {
    let rows_with_typeahead = parse_results.filter(pr => 
        !(TokenMatch.is_error(array_last(pr).type))
        && pr.slice(input_stream.length - 1).some(({ type }) => 
            TokenMatch.is_partial(type)
        )
    );
    debugger;
    return rows_with_typeahead.map(pr => {
        let start_idx = pr.findIndex(({ type }) => TokenMatch.is_partial(type));
        let result: Token[] = Array(start_idx).fill(null);
        let elts = <{ type: Exclude<TokenMatch.Type, TokenMatch.Match> }[]>pr.slice(start_idx);
        result.push(...elts.map(({ type }) => type.token));
        return result;
    });
}


class Parser {
    constructor(input_stream: Token[], splits_to_take: number[]) {
        this.input_stream = input_stream;
        
        this._split_iter = splits_to_take[Symbol.iterator]();
    }

    input_stream: Token[];
    pos: number = 0;

    parse_result: ParseResult = [];
    
    _split_iter: Iterator<number>;
    
    consume(tokens: Token[]): void;
    consume<T>(tokens: Token[], callback: () => T): T;
    consume<T>(tokens: Token[], result: T): T;
    consume(tokens: Token[], result?: any): any {
        this._consume(tokens);
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
    _consume<T>(tokens: Token[]) {
        if (!is_parse_result_valid(this.parse_result)) {
            throw new ParseError('Tried to consume() on a done parser.');
        }

        let partial = false;
        let error = false;
        let i = 0
        // check if exact match
        for (i = 0; i < tokens.length; i++) {
            if (this.pos + i >= this.input_stream.length) {
                partial = true;
                break;
            }

            let spec = tokens[i];
            let input = this.input_stream[this.pos + i];

            if (spec === input) {
                continue;
            }
            if (spec === SUBMIT_TOKEN || input === SUBMIT_TOKEN) {
                // eliminate case where either token is SUBMIT_TOKEN (can't pass into starts_with())
                error = true;
                break;
            }
            if (starts_with(<string>spec, <string>input)) {
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
                    type: { kind: 'Partial', token: t }
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
                    type: { kind: 'Error', token: t }
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
                type: { kind: 'Match' }
            } as const)));
       // increment pos
        this.pos += tokens.length;

    }

    eliminate() {
        /*
            TODO: Do we need to also consume the rest of the token stream here?

            Not doing so could lead to odd behavior if the author is not careful,
            like a bunch of correctly entered tokens and then suddenly an error without warning
        */
        throw new NoMatch();
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
                    //frontier.push([...splits_to_take, new_splits[Symbol.iterator]()]);
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
type ParserThread<T> = (p: Parser) => T;
type ParserThreads<T> =  ParserThread<T>[];


function array_last<T>(arr: T[]): T {
    return arr[arr.length - 1];
}


export function test() {
    function main_thread(p: Parser) {
        p.consume(['look']);

        let who = p.split([
            () => p.consume(['at', 'me'], 'me'),
            () => p.consume(['at', 'mewtwo'], 'mewtwo'),
            () => p.consume(['at', 'mewtwo', 'steve'], 'mewtwo steve'),
            () => p.consume(['at', 'steven'], () => 'steven'),
            () => p.consume(['at', 'martha'], 'martha'),
            () => { p.eliminate() }
        ]);

        let how = p.split([
            () => p.consume(['happily'], 'happily'),
            () => p.consume(['sadly'], 'sadly'),
            () => 'neutrally'
        ]);

        p.consume([SUBMIT_TOKEN]);

        return `Looked at ${who} ${how}`;
    }

    let input: Token[] = ['look', 'at', 'martha'];

    let [result, parses] = Parser.run_thread(main_thread, input);
    
    console.log(result);
    
    console.log(input_display(parses));

    console.log(typeahead(parses, input));

    /*
        TODO
        Get rid of auto-option, it needs to be explicit
        Change types of typeahead to support different typeahead styles
            (new, old, locked)
       
        (Way Later) Write a tester that runs through every possible input for a given main_thread,
        to find runtime error states
            - ambiguous parses
            - any other exceptions thrown
    */

}

test()


