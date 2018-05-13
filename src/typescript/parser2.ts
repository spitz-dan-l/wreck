/*
    Code style mandates

    All types are interfaces so they can be unioned without wrapping

    No generics except to enable inference in generic functions

    Parser recognizes whitespace, punctuation and hyphenation

    Parser recognizes a "submit" token at end of valid command
        Typeahead list can include this as a special option

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

*/

export interface Token {
    token: string;
    trailing_whitespace?: string;
    start?: number;
    end?: number; // index of end of trailing whitespace
    source?: string;
};

export interface Display {
    display: 'keyword' | 'option' | 'filler' | 'partial' | 'error';
}

export interface Enabled {
    enabled: 'enabled' | 'disabled' | 'hidden';
}

export interface Typeahead extends Enabled {
    typeahead: Token[];
}

export interface Validity {
    validity: 'valid' | 'partial' | 'invalid'
}

export interface Match extends Display, Typeahead, Validity {
    match: Token[];
    match_name?: string;
}

export function tokenize(text: string): Token[] {
    return [];
}

export interface MatchOption extends Enabled {
    tokens: Token[];
    match_name?: string;
}


export class ParserError extends Error {}

export class Parser {
    readonly tokens: Token[];
    
    matches: Match[];
    unconsumed_tokens: Token[];

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

    match(option: MatchOption): boolean {
        if (this.validity().validity !== 'valid' || this.is_done()) {
            throw new ParserError('Called match() on invalid or done parser.');
        }

        // see if it is full, partial, or no match

        return false;
    }

    subparser() {
        return new Parser(this.unconsumed_tokens);
    }

    integrate(subparser: Parser) {
        // TODO: check whether validity is invalid
        // TODO: check whether subparser tokens matches this.unconsumed_tokens

        this.matches.push(...subparser.matches);
        this.unconsumed_tokens = subparser.unconsumed_tokens;
        this.validity = subparser.validity;
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

        // check parser states
        let partial_matches: Thread[] = [];

        for (let t of threads) {

        }

        return false
    }
}

export type Consumer<T> = (parser: Parser) => T;

