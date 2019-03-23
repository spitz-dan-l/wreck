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
function is_match(m) {
    return m[0] === 'Match';
}
function is_partial(m) {
    return m[0] === 'Partial';
}
function is_error(m) {
    return m[0] === 'Error';
}
/*
ParseResult type

Initially a single list of TokenMatches
At some point in the list is a split into N branches

possible to pass a reference to a particular branch, and get out the global/flattened set of token matches for it
(including those token matches occurring before the split point)

*/
class ParseResult {
    constructor(parent = null) {
        this._parent = null;
        this._matches = [];
        this._children = null;
        this._parent = parent;
    }
    is_valid() {
        if (this._children === null) {
            return this._matches.length === 0 || is_match(this._matches[this._matches.length - 1]);
        }
        return this._children.some(c => c.is_valid());
    }
    push(...new_matches) {
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
        }
        else {
            this._children.forEach(c => c.push(...new_matches));
        }
    }
    split(n_splits) {
        // TODO: figure out what to return in the case where the current ParseResult is not valid
        // just raise?
        if (this._children !== null) {
            throw new ParseError('cannot split an already-split parse result');
        }
        if (!this.is_valid()) {
            return null;
        }
        this._children = [];
        for (let i = 0; i < n_splits; i++) {
            this._children.push(new ParseResult(this));
        }
        return this._children;
    }
    suffixes() {
        if (this._children === null) {
            return [[...this._matches]];
        }
        let result = [];
        this._children.forEach(c => {
            result.push(...c.suffixes().map(s => s.unshift(...this._matches)));
        });
        return result;
    }
    prefix() {
        let result = [];
        let p = this._parent;
        while (p !== null) {
            result.unshift(...p._matches);
            p = p._parent;
        }
        return result;
    }
    flattened() {
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
    input_display() {
    }
}
class Parser {
    constructor() {
        this.pos = 0;
    }
    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    consume(tokens /* TODO: make this a list of annotated tokens */) {
    }
    split(subthreads, combiner) {
    }
    /*
        helpers which don't update state, but are queries on the parser state
    */
    // can the currently-input string be executed as a valid command?
    valid() { return true; }
    // for each of the input tokens, how should they be displayed/highighted?
    input_token_display() { }
    // for each row of typeahead to display, what are the tokens?
    // will be positioned relative to the first input token.
    typeahead() { }
}
class NoMatch extends Error {
}
;
class ParseError extends Error {
}
;
//# sourceMappingURL=parser2.js.map