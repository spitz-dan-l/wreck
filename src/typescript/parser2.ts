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

// TODO: make "enter"/"submit" a valid token that the parser can expect.
//    Having "submit" as typeahead means the user can press "enter" to run the command


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
    constructor(parent: ParseResult = null) {
        this._parent = parent
    }

    _parent: ParseResult = null;

    _matches: TokenMatch[] = [];

    _children: ParseResult[] = null;

    is_valid() {
        if (this._children === null) {
            return this._matches.length === 0 || TM.is_match(this._matches[this._matches.length - 1][TM.Fields.type])
        }

        return this._children.some(c => c.is_valid());
    }

    push(...new_matches: TokenMatch[]) {
        if (this._children === null) {
            // check if we are allowed to push.
            // if currently valid -> yes
            // if currently partial -> maybe
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
            if (this.is_valid()) {
                this._matches.push(...new_matches);
            }
        } else {
            this._children.forEach(c => c.push(...new_matches));
        }
    }

    split(n_splits: number): ParseResult[] {
        // TODO: figure out what to return in the case where the current ParseResult is not valid
        // just raise?
        if (this._children !== null) {
            throw new ParseError('cannot split an already-split parse result');
        }

        if (!this.is_valid()) {
            return null;
        }

        this._children = []

        for (let i = 0; i < n_splits; i++) {
            this._children.push(new ParseResult(this));
        }

        return this._children;
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

    prefix(): TokenMatch[] {
        let result = [];

        let p = this._parent;

        while (p !== null) {
            result.unshift(...p._matches);
            p = p._parent;
        }

        return result;
    }

    flattened(): TokenMatch[][] {
        let prefix = this.prefix();

        return this.suffixes().map(s => [...prefix, ...s]);
    }

    /*
        If all rows end in errors, every token display is Error.

        Determine if any of the valid rows ends in a Submit token.
            If so, Ready
        For each non-error column (valid or ends in partial), count number of unique token values
            If > 1, option
            Else filler


        Typeahead

        For each non-valid row (ignoring errors, partial only)
        If the row is at least the length of the input stream
        Typeahead is the Partial TokenMatches suffix (always at the end)
    */
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

}

class Parser {
    input_stream: Token[];
    pos: number = 0;

    parse_result: ParseResult;


    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    consume(tokens: Token[]) {
        if (!this.parse_result.is_valid()) {
            throw new ParseError('Tried to consume() on a done parser.');
        }



        if (this.pos === this.input_stream.length) {
            // if the last token match is valid, add tokens as partial and throw NoMatch
            this.parse_result.push(...tokens.map(t => <TokenMatch>['TokenMatch', '', ['Partial', t]]));
            throw new NoMatch();
        }

        let partial = false;
        let error = false;
        // check if exact match
        for (let i = 0; i < tokens.length; i++) {
            if (this.pos + i >= this.input_stream.length) {
                partial = true;
                break;
            }

            let spec = tokens[i];
            let input = this.input_stream[this.pos + i];

            if (spec === input) {
                continue
            }
            if (spec === SUBMIT_TOKEN || input === SUBMIT_TOKEN) {
                error = true;
                break;
            }
            if (starts_with(<string>spec, <string>input)) {
                // if there are still more input tokens, error.
                if (this.pos + i < this.input_stream.length) {
                    error = true;
                }

                partial = true;
                continue;
            }
            error = true;

        }
    }

     /* TODO: make a subthread have a "style" e.g. locked, used, newly-available. not tokens. */
    split(subthreads: ParserThread[], combiner: (results: any[]) => any): any {

    }


    /*
        helpers which don't update state, but are queries on the parser state
    */
    // can the currently-input string be executed as a valid command?
    valid(): boolean {return true}

    // for each of the input tokens, how should they be displayed/highighted?
    input_token_display() {}

    // for each row of typeahead to display, what are the tokens?
    // will be positioned relative to the first input token.
    typeahead() {}
}

class NoMatch extends Error {};
class ParseError extends Error {};

type ParserThread = (p: Parser) => any;



