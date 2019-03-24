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
class ParseError extends Error {};

const SUBMIT_TOKEN = Symbol();
type Token = string | typeof SUBMIT_TOKEN;

export namespace TokenMatch {
    export type Type = 
        ['Match'] |
        ['Partial', Token] |
        ['Error'];

    export function is_match(m: Type) {
        return m[0] === 'Match'
    }

    export function is_partial(m: Type) {
        return m[0] === 'Partial'
    }

    export function is_error(m: Type) {
        return m[0] === 'Error'
    }

    export enum Fields{ kind, token, type };
    export type TokenMatch = ['TokenMatch', Token, Type];
}

export type TokenMatch = TokenMatch.TokenMatch;

import TM = TokenMatch;

/*

    Filler, Option, Error

    Ready, Not Ready (to execute)

*/
export namespace InputDisplay {
    export type Type =
        ['Filler'] |
        ['Option'] |
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


/*
ParseResult type

Initially a single list of TokenMatches
At some point in the list is a split into N branches

possible to pass a reference to a particular branch, and get out the global/flattened set of token matches for it
(including those token matches occurring before the split point)

*/

class ParseResult {
    constructor(parents: ParseResult[] = null) {
        this._parents = parents;
    }

    // TODO: make this a list???!!!!
    // This enables multiple splits in a single ParserThread.
    // Changes to do this:

    // is_valid() should check whether at least one parent is valid? (i think? the induction is a bit weird)

    // split() will create the "merged" sub-child parse results when it's called again after the
    // current parse result has already been split

    // prefix() needs to return a list of lists of TokenMatches
    // flattened() needs to take the cartesian product of prefix() and suffixes()

    // input_display() and typeahead() may need to check more thoroughly for errors
    // since validity feels less guaranteed by induction..??
    _parents: ParseResult[] = null;

    _matches: TokenMatch[] = [];

    _children: ParseResult[] = null;

    // can the currently-input string be executed as a valid command?
    is_valid() {
        if (!this._is_valid_parents()) {
            return false;
        }

        if (!this._is_valid_this()) {
            return false;
        }

        return this._is_valid_children();
    }

    _is_valid_this() {
        return this._matches.length === 0 || TM.is_match(this._matches[this._matches.length - 1][TM.Fields.type])
    }

    // Check if any of the parents are valid
    // If we are root, valid.
    _is_valid_parents() {
        if (this._parents === null) {
            return true;
        }

        return this._parents.some(p => p._is_valid_this() && p._is_valid_parents());
    }

    _is_valid_children() {
        if (this._children === null) {
            return true;
        }

        return this._children.some(c => c._is_valid_this() && c._is_valid_children());
    }

    push(...new_matches: TokenMatch[]) {
        // TODO: This will call is_valid_parents() more than is necessary. It only needs to be called once.
        if (!this._is_valid_parents() || !this._is_valid_this()) {
            return;
        }

        if (this._children === null) {
            this._matches.push(...new_matches);
        } else {
            // check if we are allowed to push.
            // if currently valid -> yes
            // if currently partial -> no
            /*  
                harder case. if it's currently partial, that could mean:
                    the next token matched "validates" the previous partial ones
                    e.g. "look at_mewtwo" -> <look at me>
                        "at" will be in there are as a partial TokenMatch (so it can participate in typeahead)
                        "me" is also a partial match since it is a prefix of "mewtwo"

                        however if <look at mewtwo> were entered,
                        then we'd potentially be trying to push a valid match (mewtwo) on after a partial one (at)

                        I think the answer here is that the author is expected not to push anything on after initially pushing X partial match tokens in one go.

                        Therefore, the only case where pushing isn't null is if everything up til now is valid.
            */
            // if currently error -> no
            this._children.forEach(c => c.push(...new_matches));
        }
    }

    split(n_splits: number): ParseResult[] {
        // TODO: must be positive integer
        if (n_splits < 1) {
            throw new ParseError('split(): n_splits must be a positive integer');
        }

        // We create n_splits child nodes,
        // each with parents as the set of current leaf nodes.
        let new_parents = this._leaves();

        let new_children = [];

        for (let i = 0; i < n_splits; i++) {
            new_children.push(new ParseResult(new_parents));
        }

        new_parents.forEach(p => {
            p._children = [...new_children];
        });

        return new_children;

    }

    _leaves(): ParseResult[] {
        if (this._children === null) {
            return [this];
        }

        let result = [];

        this._children.forEach(c => {
            result.push(...c._leaves());
        });

        return result;

    }

    suffixes(): TokenMatch[][] {
        if (this._children === null) {
            return [[...this._matches]];
        }

        let result = [];
        this._children.forEach(c => {
            result.push(...c.suffixes().map(s => s.unshift(...this._matches)));
        });

        return result;
    }

    prefixes(): TokenMatch[][] {
        if (this._parents === null) {
            return [[]];
        }

        let result = [];
        this._parents.forEach(p1 => {
            result.push(...p1.prefixes().map(p2 => [...p2, ...p1._matches]));
        })
        return result;
    }

    flattened(): TokenMatch[][] {
        let prefixes = this.prefixes();
        let suffixes = this.suffixes();

        let result = [];

        prefixes.forEach(prefix => {
            result.push(...suffixes.map(s => [...prefix, ...s]));
        })
        return result;
    }

    /*
        If all rows end in errors, every token display is Error.

        Determine if any of the valid rows ends in a Submit token.
            If so, Ready
        For each non-error column (valid or ends in partial), count number of unique token values
            If > 1, option
            Else filler
    */
    // for each of the input tokens, how should they be displayed/highighted?
    input_display(): InputDisplay[] {
        let f = this.flattened();

        // determine if submittable
        let submittable = f.some(row => {
            let last = row[row.length - 1];
            return last[1] === SUBMIT_TOKEN && TM.is_match(last[2])
        });

        let display_submit: ID.Submit = submittable ? ['Submit'] : ['NoSubmit'];

        let pos = 0;
        let result: InputDisplay[] = [];
        while (true) {
            // get the column of TokenMatches
            let column = f.filter(row => row.length > pos).map(row => row[pos]);

            if (column.length === 0) {
                break;
            }

            let display_type: ID.Type;
            // determine error
            if (column.every(tm => TM.is_error(tm[2]))) {
                display_type = ['Error'];
            } else {

                // count unique token values
                let uniq_toks = new FuckSet<Token>(column.map(tm => tm[1]));

                display_type = uniq_toks.size === 1 ? ['Filler'] : ['Option'];
            }

            result.push(['InputDisplay', display_type, display_submit]);
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
    typeahead() {

    }

}

class Parser {
    constructor(input_stream: Token[], pos: number = 0, parse_result: ParseResult = undefined) {
        this.input_stream = input_stream;
        this.pos = pos;
        if (parse_result === undefined) {
            parse_result = new ParseResult();
        }
        this.parse_result = parse_result;
    }

    input_stream: Token[];
    pos: number = 0;

    parse_result: ParseResult;

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
        if (!this.parse_result.is_valid()) {
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
                partial = true;
                break;
            }

            error = true;
            break;
        }

        if (partial) {
            // check if we should actually be in error
            if (i < tokens.length - 1) {
                error = true;
            } else {
                // push all tokens as partials
                this.parse_result.push(...tokens.map((t, j) => 
                    <TokenMatch>[
                        'TokenMatch',
                        this.input_stream[this.pos + j] || '',
                        ['Partial', t]]));
                // increment pos
                this.pos = this.input_stream.length;

                throw new NoMatch();
            }
        }

        if (error) {
            // push all tokens as errors
            this.parse_result.push(...tokens.map((t, j) =>
                <TokenMatch>[
                    'TokenMatch',
                    this.input_stream[this.pos + j] || '',
                    ['Error']]));
            this.pos = this.input_stream.length;
            // increment pos
            throw new NoMatch();
        }

        // push all tokens as valid
        this.parse_result.push(...tokens.map((t, j) =>
            <TokenMatch>[
                'TokenMatch',
                this.input_stream[this.pos + j],
                ['Match']]));

        // increment pos
        this.pos += tokens.length;

    }

    run_thread<T>(thread: ParserThread<T>): T | NoMatch {
        try {
            return thread(this);
        } catch (e) {
            if (e instanceof NoMatch) {
                // Return the NoMatch object as a special value
                return e;
            }
            throw e;
        }
    }

    split<R>(subthreads: ParserThread<R>[]): R;
    split<R, C>(subthreads: ParserThread<R>[], combiner: ((results: R[]) => C)): C;
    split<R>(subthreads: ParserThread<R>[], combiner?: ((results: R[]) => any)): any {
        if (subthreads.length <= 0) {
            throw new ParseError('Cannot split with zero or fewer subthreads');
        }

        let new_parse_results = this.parse_result.split(subthreads.length);

        let child_parsers = new_parse_results.map(pr => new Parser(this.input_stream, this.pos, pr));

        let thread_results = child_parsers.map((cp, i) => cp.run_thread(subthreads[i]));

        if (combiner === undefined) {
            // the default combiner just takes the first valid result, or undefined if there is none
            combiner = rs => rs[0];
        }

        return combiner(thread_results.filter(<(tr) => tr is R>(tr => !(tr instanceof NoMatch))));
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

type ParserThread<T> = (p: Parser) => T;
type ParserThreads<T> =  ParserThread<T>[];

function test() {
    function main_thread(p: Parser) {
        p.consume(['look']);

        let who = p.split([
            (p) => p.consume(['at', 'me'], 'me'),
            (p) => p.consume(['at', 'mewtwo'], 'mewtwo'),
            (p) => p.consume(['at', 'mewtwo', 'steve'], 'mewtwo steve'),
            (p) => p.consume(['at', 'steven'], () => '4')
        ]);

        let how = p.split([
            (p) => p.consume(['happily'], 'happily'),
            (p) => p.consume(['sadly'], 'sadly'),
            (p) => 'neutrally'
        ]);

        p.consume([SUBMIT_TOKEN]);

    }
}




