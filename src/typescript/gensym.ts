
let state = 100000;
const prefix = 'gensym-';

export type Gensym = string & { __brand: 'Gensym' }

export function gensym(): Gensym {
    return <Gensym> (prefix + state++);
}

export function set_state(s: number) {
    state = s;
}

/*
    Only guarantees that no future calls to gensym will duplicate this symbol,
    it is still possible that the symbol being parsed was generated earlier
*/
export function parse_gensym(s: string): Gensym {
    let new_state = gensym_value(<Gensym>s);

    if (new_state >= state) {
        set_state(new_state + 1);
    }

    return <Gensym> s;
}

export function gensym_value(s: Gensym): number {
    let new_state = parseInt(s.replace(prefix, ''));
    if (new_state == NaN) {
        throw new Error(`Tried to parse invalid gensym: ${s}`);
    }
    return new_state;
}