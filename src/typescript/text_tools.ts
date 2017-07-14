import {Face} from './datatypes';

export function uncapitalize(msg: string) {
    return msg[0].toLowerCase() + msg.slice(1);
}

export function capitalize(msg: string) {
    return msg[0].toUpperCase() + msg.slice(1);
}

export function face_message(face_order: Face[], f_code_2_name?: Map<Face, string>){
    if (f_code_2_name === undefined) {
        f_code_2_name = new Map<Face, string>([
            [Face.n, 'back'],
            [Face.s, 'front'],
            [Face.e, 'right'],
            [Face.w, 'left'],
            [Face.t, 'top'],
            [Face.b, 'bottom']
        ]);
    }

    if (face_order.length == 1) {
        return f_code_2_name.get(face_order[0]) + ' face';
    } else {
        return face_order.slice(0, -1).map((x) => f_code_2_name.get(x)).join(', ') + ' and ' + f_code_2_name.get(face_order[face_order.length - 1]) + ' faces';
    }
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

export function tokenize(s: string): [string[], number[]] {
    let pat = /[\S\0]+/g;
    
    let tokens: string[] = [];
    let token_indexes: number[] = [];
    
    let match: RegExpExecArray;
    while ((match = pat.exec(s)) !== null) {
        tokens.push(match[0]);
        token_indexes.push(match.index);
    }

    return [tokens, token_indexes];

}

export function untokenize(tokens: string[], token_positions?: number[]){
    if (token_positions === undefined) {
        return tokens.join(' ');
    }
    
    let result: string = '';

    for (let i = 0; i < tokens.length; i++){
        let cur_pos = result.length;
        let target_pos = token_positions[i];
        let padding = target_pos - cur_pos;
        result += ' '.repeat(padding);
        result += tokens[i];
    }

    return result;
}

export function normalize_whitespace(s: string) {
    return s.replace(/\s+/g, ' ');
}

export function last(x: any[] | string){
    return x[x.length - 1];
}