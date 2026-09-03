export function uncapitalize(msg: string): string {
    return msg[0].toLowerCase() + msg.slice(1);
}

export function capitalize(msg: string): string {
    return msg[0].toUpperCase() + msg.slice(1);
}

export function starts_with(str: string, searchString: string, position: number = 0): boolean {
    return str.substring(position, position + searchString.length) === searchString;
}

// Split input into its words and the whitespace between them.
export function tokenize(s: string): [string[], string[]] {
    const word_pat = /[\S]+/g;
    const space_pat = /[^\S]+/g;

    const tokens = s.split(space_pat);
    const gaps = s.split(word_pat);

    if (tokens.length > 0) {
        if (tokens[0] === '') {
            tokens.splice(0, 1);
        }
        if (tokens[tokens.length - 1] === '' && gaps[gaps.length - 1] === '') {
            tokens.splice(tokens.length - 1, 1);
        }
    }

    return [tokens, gaps];
}

export function split_tokens(s: string): string[] {
    return s.split(/[^\S]+/g).filter(t => t !== '');
}
