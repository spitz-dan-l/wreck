import {Face} from './datatypes';

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
