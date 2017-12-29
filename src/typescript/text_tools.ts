import * as React from 'react';

export function uncapitalize(msg: string) {
    return msg[0].toLowerCase() + msg.slice(1);
}

export function capitalize(msg: string) {
    return msg[0].toUpperCase() + msg.slice(1);
}


export function starts_with(str: string, searchString: string, position?: number){
    position = position || 0;
    return str.substr(position, searchString.length) === searchString;
}

export function tokens_equal(tks1: string[], tks2: string[]) {
    if (tks1.length !== tks2.length) {
        return false;
    }

    for (let i = 0; i < tks1.length; i++) {
        if (tks1[i] !== tks2[i]) {
            return false;
        }
    }

    return true;
}

export function tokenize(s: string): [string[], string[]] {
    let word_pat = /[\S]+/g;
    let space_pat = /[^\S]+/g;

    let tokens = s.split(space_pat);
    let gaps = s.split(word_pat);

    if (tokens.length > 0){
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
    let space_pat = /[^\S]+/g;
    let tokens = s.split(space_pat);
    if (tokens.length > 0){
        if (tokens[0] === '') {
            tokens.splice(0, 1);
        }
        if (tokens[tokens.length - 1] === '') {
            tokens.splice(tokens.length - 1, 1);
        }
    }
    return tokens;
}

function tokenize_tests() {
    console.log('tokenize tests');
    console.log(tokenize(' l'));
}

export function untokenize(tokens: string[], gaps?: string[]){
    if (gaps === undefined) {
        return tokens.join(' ');
    }
    
    let result: string = '';
    let i = 0;
    for (i = 0; i < gaps.length; i++){
        result += gaps[i];
        if (i < tokens.length) {
            result += tokens[i];
        }
    }

    return result;
}

export function get_indenting_whitespace(s: string) {
    let space_pat = /^[^\S]+/;
    let result = space_pat.exec(s);
    if (result === null){
        return '';
    }
    return result[0];
}

export function ends_with_whitespace(s: string) {
    let last_space_pat = /\s$/;
    return last_space_pat.exec(s) !== null;
}

export function normalize_whitespace(s: string) {
    return s.trim().replace(/\s+/g, ' ');
}

export function last(x: any[] | string){
    return x[x.length - 1];
}

export function random_choice(choices: any[]) {
  var index = Math.floor(Math.random() * choices.length);
  return choices[index];
}

export function dedent(strs: TemplateStringsArray, ...args) {
    // do interpolation
    let result: string = strs[0];
    for (let i = 0; i < args.length; i++) {
        result += args[i] + strs[i + 1];
    }

    //find the first newline with whitespace after it
    let pat = /\n +/;
    let m = pat.exec(result);

    if (m === null) {
        return result
    }

    let replace_pat = new RegExp(m[0], 'g');
    let result2 = result.replace(replace_pat, '\n');
    
   return result2;
}