/*
    Code style mandates

    All types are interfaces so they can be unioned without wrapping

    No generics except to enable inference in generic functions

    Parser recognizes whitespace, punctuation and hyphenation

    Parser recognizes a "submit" token at end of valid command
        Typeahead list can include this as a special option
        Secondary "complete but no submit" for recollection commands that don't add history
    Typeahead can include valid and invalid next tokens

    Matching is case-insensitive, but the returned matches preserve case and amount of whitespace

    Consumer functions are composable via combine()

    Secondary DSL compiles to combine-based consumer

    Question whether to continue manually distinguishing keyword vs option vs filler
        If it were mechanical, we would have less color variation
        Less room for inconsistency errors though
    Same question re concatenating multiple future tokens into a single typeahead option

    So we could be more advanced about auto-discovery of typeahead, if the combine-based consumers were more core.
    But we would have to become more sophisticated/expressive with *disabled* next tokens too.
    Possibly force us to write a lot of "disabled" logic ( what if that's good )


    What about:
        Keyword: triggers dispatch to a different subparser
        Option: One of many options within a subparser (*including disabled options*)
        Filler: Everything else

    Would require the parser be aware of when a subparser gets dispatched to
        doable

    Less distinction within code between disabled and hidden options

    No explicit lumping together of tokens to consume
        Rule will be to offer typeahead up to next token where there's an option
        Downside is less control over rhythm
            Let's try this though.
    INCORRECT ^^^

    You need phrases. You just do, otherwise you'd have words like 'a' and 'the' getting emphasized
*/

export class Token2 {
    constructor(
        readonly token: string,
        readonly trailing_whitespace?: string,
        readonly start?: number,
        readonly end?: number, // index of end of trailing whitespace
        readonly source?: string
    ) {}
};

export type Token = {
    token: string;
    trailing_whitespace?: string;
    start?: number;
    end?: number; // index of end of trailing whitespace
    source?: string;
};

export type Phrase = Token[];

export type Display = {
    display: 'keyword' | 'option' | 'filler' | 'partial' | 'error';
}

export type Enabled = {
    enabled: 'enabled' | 'disabled' | 'hidden';
}

export type Template = Enabled & {
    template: Phrase;
    token_idx: number;
    char_idx: number;
}

export type Validity = {
    validity: 'valid' | 'partial' | 'invalid'
}

export type Match = Validity & {
    match: Phrase;
    match_name?: string;
    template?: Template;
}

export function tokenize(text: string): Token[] {
    return [];
}

export type MatchOption = Enabled & {
    phrase: Phrase;
    match_name?: string;
}


export class ParserError extends Error {}

export class Parser {
    readonly tokens: Token[];
    
    matches: Match[] = [];
    cursor: number = 0;

    children: Parser[] = [];

    constructor(tokens: Token[]) {
        if (tokens.length === 0) {
            throw new ParserError('Zero tokens passed to Parser.');
        }
        this.tokens = tokens;
    }

    validity(): Validity['validity'] {
        if (this.children.length === 0) {
            if (this.matches.length === 0) {
                return 'valid';
            }

            return this.matches[this.matches.length - 1].validity;
        } else {
            let child_vs = this.children.map(p => p.validity());
            if (child_vs.some(p => p === 'valid')) {
                return 'valid';
            } else if (child_vs.some(p => p === 'partial')) {
                return 'partial';
            }
            return 'invalid';
        }
    }

    is_done(): boolean {
        // TODO: possibly check if final token is the "end" token
       
        if (this.children.length === 0) {
            return this.validity() === 'valid' && this.cursor === this.tokens.length && is_terminal(this.tokens[this.tokens.length - 1]);
        } else {
            return this.children.some(p => p.is_done());
        }
    }

    concrete_match() {
        let match = this.matches.slice();

        if (this)
    }

    prefix(position: number) {
        // return the match prefix(es) up to position in the original token stream

        if (position < this.cursor) { //we don't need to ask children

        }

        /*
            So e.g. for position 0, return the unique




        */

    }

    consume(option: MatchOption): boolean {
        if (this.validity() !== 'valid' || this.is_done() || this.children.length > 0) {
            throw new ParserError('Called consume() on invalid or done or parent parser.');
        }

        if (option.enabled === 'hidden') {
            return this.invalidate();
        }

        let local_validity: Validity['validity'] = 'valid'; //{ validity: 'valid' };
        let matched_tokens: Token[] = [];
        let typeahead_tokens: Token[] = [];
        let pos = 0;

        let commit = () => {
            if (local_validity === 'invalid') {
                throw new ParserError('Tried to commit for an invalid match.');
            }

            let match: Match = {
                match: matched_tokens,
                match_name: option.match_name,
                template: {
                    template: typeahead_tokens,
                    enabled: option.enabled,
                    token_idx: 0,
                    char_idx: 0
                },
                validity: option.enabled === 'enabled' ? local_validity : 'invalid'
            };

            this.matches.push(match);
            this.cursor += pos;

            return local_validity === 'valid';
        };

        while (true) {//local_validity !== 'invalid') {
            let opt_tok = option.phrase[pos];
            let cmd_tok = this.tokens[this.cursor + pos];

            if (opt_tok === undefined) {
                return commit();
            }

            if (cmd_tok === undefined) {
                local_validity = 'partial';
                // append all remaining option tokens to typeahead
                typeahead_tokens.push(...option.phrase.slice(pos));
                return commit();
            }

            if (local_validity === 'partial') {
                return this.invalidate();
            }

            if (token_match_full(cmd_tok, opt_tok)) {
                // append cmd_tok exactly to typeahead
                matched_tokens.push(cmd_tok);
                typeahead_tokens.push(cmd_tok);
                // including trailing whitespace
                pos += 1;
                continue;
            }

            if (token_match_partial(cmd_tok, opt_tok)) {
                local_validity = 'partial';
                // construct typeahead token
                // take cmd_tok prefix
                // append opt_tok suffix
                // set trailing whitespace to ' '
                let tok_str = cmd_tok.token;
                tok_str += opt_tok.token.slice(tok_str.length);
                typeahead_tokens.push({
                    token: tok_str,
                    trailing_whitespace: ' '
                });
                matched_tokens.push(cmd_tok);
                pos += 1;
                continue;
            }

            return this.invalidate();
        }
    }

    invalidate() {
        // take all unonconsumed tokens into a single match and set to invalid
        let match: Match = {
            match: this.tokens.slice(this.cursor),
            validity: 'invalid'
        };
        this.matches.push(match);
        this.cursor = this.tokens.length;
        return false;
    }

    subparser() {
        let child = new Parser(this.tokens.slice(this.cursor));
        this.children.push(child);

        return child;
    }

    combine<T>(consumers: Consumer<T>[]): T | false {
        if (consumers.length === 0) {
            throw new ParserError('Zero consumers passed to combine().');
        }

        type Thread = {
            result: T,
            subparser: Parser
        }

        let threads: Thread[] = [];

        // create a subparser for each consumer and apply them
        for (let c of consumers) {
            let sp = this.subparser();
            threads.push({
                result: c(sp),
                subparser: sp
            });
        }

        // if any exact ( and done ) matches, just use the first one

        // check parser states
        let partial_matches: Thread[] = [];

        for (let t of threads) {

        }

        return false;
    }
}

function is_terminal(token: Token): boolean {
    return true;
}

export class Parser2 {
    readonly tokens: Token[];
    
    matches: Match[];
    unconsumed_tokens: Token[];

    children: Parser[];

    constructor(tokens: Token[]) {
        if (tokens.length === 0) {
            throw new ParserError('Zero tokens passed to Parser.');
        }

        this.tokens = tokens;

        this.matches = [];
        this.unconsumed_tokens = [...this.tokens];
    }

    validity(): Validity {
        if (this.matches.length === 0) {
            return { validity: 'valid' };
        }

        return { validity: this.matches[this.matches.length - 1].validity };
    }

    is_done(): boolean {
        // TODO: possibly check if final token is the "end" token
        return this.validity().validity === 'valid' && this.unconsumed_tokens.length === 0;
    }

    prefix(tokens: Token[]) {
        // return the match prefix containing the prefix
    }

    consume(option: MatchOption): boolean {
        if (this.validity().validity !== 'valid' || this.is_done()) {
            throw new ParserError('Called match() on invalid or done parser.');
        }

        if (option.enabled === 'hidden') {
            return this.invalidate();
        }

        let local_validity: Validity['validity'] = 'valid'; //{ validity: 'valid' };
        let matched_tokens: Token[] = [];
        let typeahead_tokens: Token[] = [];
        let pos = 0;

        let commit = () => {
            if (local_validity === 'invalid') {
                throw new ParserError('Tried to commit for an invalid match.');
            }

            let match: Match = {
                match: matched_tokens,
                match_name: option.match_name,
                display: local_validity === 'valid' ? 'filler' : 'partial',
                typeahead: [{
                    typeahead: typeahead_tokens,
                    enabled: option.enabled,
                    token_idx: 0,
                    char_idx: 0//'enabled',
                }],
                validity: option.enabled === 'enabled' ? local_validity : 'invalid'
            };

            this.matches.push(match);

            return local_validity === 'valid';
        };

        while (true) {//local_validity !== 'invalid') {
            let opt_tok = option.phrase[pos];
            let cmd_tok = this.unconsumed_tokens[pos];

            if (opt_tok === undefined) {
                return commit();
            }

            if (cmd_tok === undefined) {
                local_validity = 'partial';
                // append all remaining option tokens to typeahead
                typeahead_tokens.push(...option.phrase.slice(pos));
                return commit();
            }

            if (local_validity === 'partial') {
                return this.invalidate();
            }

            if (token_match_full(cmd_tok, opt_tok)) {
                // append cmd_tok exactly to typeahead
                matched_tokens.push(cmd_tok);
                typeahead_tokens.push(cmd_tok);
                // including trailing whitespace
                pos += 1;
                continue;
            }

            if (token_match_partial(cmd_tok, opt_tok)) {
                local_validity = 'partial';
                // construct typeahead token
                // take cmd_tok prefix
                // append opt_tok suffix
                // set trailing whitespace to ' '
                let tok_str = cmd_tok.token;
                tok_str += opt_tok.token.slice(tok_str.length);
                typeahead_tokens.push({
                    token: tok_str,
                    trailing_whitespace: ' '
                });
                matched_tokens.push(cmd_tok);
                pos += 1;
                continue;
            }

            return this.invalidate();
        }
    }

    invalidate() {
        // take all unonconsumed tokens into a single match and set to invalid
        let match: Match = {
            match: this.unconsumed_tokens.splice(0),
            display: 'error',
            validity: 'invalid'
        };
        this.matches.push(match);
        return false;
    }

    subparser() {
        return new Parser(this.unconsumed_tokens.slice());
    }

    integrate(subparser: Parser) {
        // TODO: check whether validity is invalid
        // TODO: check whether subparser tokens matches this.unconsumed_tokens

        this.matches.push(...subparser.matches);
        this.unconsumed_tokens = subparser.unconsumed_tokens.slice();
    } 

    combine<T>(consumers: Consumer<T>[]): T | false {
        if (consumers.length === 0) {
            throw new ParserError('Zero consumers passed to combine().');
        }

        type Thread = {
            result: T,
            subparser: Parser
        }

        let threads: Thread[] = [];

        // create a subparser for each consumer and apply them
        for (let c of consumers) {
            let sp = this.subparser();
            threads.push({
                result: c(sp),
                subparser: sp
            });
        }

        // if any exact ( and done ) matches, just use the first one

        // check parser states
        let partial_matches: Thread[] = [];

        for (let t of threads) {

        }

        return false;
    }
}

type MatchPhrase = {
    tokens: Token[]
}

type PartialMatchPhrase = {
    tokens: Token[],
    partition_idx: [number, number]
}

type ConcreteParseResult = {
    exact_matches: MatchPhrase[];
    partial_match?: PartialMatchPhrase;
}

/*
    [look at] [me]
    [look] [at me]
    [look at me]

    look at me

    [look| at]
    [look] [|at me]
    [look| at me]

    [look] [at] [me] [!]
    [look] [at] [me] [go]
    [look] [at melvin]
    [look] [at] [mewtwo steve]
    
    > look at me
                 ! (carriage return)
                 go
           at melvin
              mewtwo

    *look *at
              *me
                  ?|!
                  ?|go

          *at ?me|lvin
              ?me|wtwo steve

    *look *at *me ?|go
    *look *at ?me|lvin
    *look *at ?me|wtwo
*/

class ParseResult {
    // Nondeterministic parse result
    // Represented as a tree

    root: ConcreteParseResult;

    children?: ParseResult[];

    //invariant: should be impossible to have non-null root.partial_match and non-empty children

    add_match(match: ConcreteParseResult) {
        // Identify invalid conditions
        // if exact matches are disjoint

        function token_eq(t1: Token, t2: Token) {
            return t1.token === t2.token;
        }

        // Find common prefix in exact matches
        let prefix_pos = array_prefix_pos(this.root.exact_matches, match.exact_matches, token_eq);

        if (prefix_pos < this.root.exact_matches.length) {
            // move the root suffix, and partial match, into a child
            // move the result suffix and partial match into a child
        } else {
            // if no children
                // if partial matches equal, do nothing
                // else
                    // add child: empty exact matches and root's current partial
                    // add child: result exact match suffix, and result partial
            // else
                // find child with matching exact suffix
                // if present
                    // child.add_result suffix + partial
                // else
                    // create child with suffix + partial
        }

    }
}

function array_prefix_pos<T>(arr1: T[], arr2: T[], eq_checker?: (e1: T, e2: T) => boolean): number {
    if (eq_checker === undefined) {
        eq_checker = (x, y) => x === y;
    }

    for (let i=0; i < arr1.length; i++) {
        if (i >= arr2.length) {
            return i;
        }

        if (!eq_checker(arr1[i], arr2[2])) {
            return i;
        }
    }

    return arr1.length;
}

export type Consumer<T> = (parser: Parser) => T;

export function token_match_full(tok_1: Token, tok_2: Token): boolean {
    return tok_1.token.toLowerCase() === tok_2.token.toLowerCase();
}

export function token_match_partial(tok_1: Token, tok_2: Token): boolean {

}