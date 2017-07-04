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

export function tokenize(s: string) {
    let tokens = s.split(/(?:\s|&nbsp;)+/g);
    if (last(tokens) === ''){
        tokens.pop();
    }
    return tokens;
}

export function untokenize(tokens: string[]){
    return tokens.join(' ');
}

export function last(x: any[] | string){
    return x[x.length - 1];
}