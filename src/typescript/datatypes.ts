export class FuckDict<K, V> {
    readonly keys_map: Map<string, K>;
    readonly values_map: Map<string, V>;

    size: number = 0

    constructor(a?: [K, V][]) {
        this.keys_map = new Map<string, K>();
        this.values_map = new Map<string, V>();

        if (a !== undefined) {
            for (let [k, v] of a) {
                this.set(k, v);
            }
        }
    }

    set(k: K, v: V) {
        let s = k.toString();
        this.keys_map.set(s, k);
        this.values_map.set(s, v);
        this.size = this.keys_map.size;
        return this;
    }

    get(k: K) {
        let s = k.toString();
        return this.values_map.get(s);
    }

    has_key(k: K) {
        return this.keys_map.has(k.toString());
    }

    keys_array() {
        return Array.from(this.keys_map.values());
    }

    values_array() {
        return Array.from(this.values_map.values());
    }

    entries_array(): [K, V][] {
        let result: [K, V][] = [];
        for (let [s, k] of this.keys_map.entries()) {
            result.push([k, this.values_map.get(s)]);
        }
        return result;
    }

    keys_equal(other: FuckDict<K, V>) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)){
                return false;
            }
        }

        for (let elem of other.keys_array()) {
            if (!this.has_key(elem)){
                return false;
            }
        }

        return true;
    }

    keys_intersect(other: FuckDict<K, V>) {
        let result: K[] = [];
        for (let k of this.keys_array()) {
            if (other.has_key(k)) {
                result.push(k)
            }
        }
        return result;
    }

    keys_subset(other: FuckDict<K, V>) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)){
                return false;
            }
        }
        return true;
    }

    toString() {
        let entry_strings: string[] = this.entries_array().map((x) => x.toString()).sort();

        return `FuckDict<${entry_strings.join(',')}>`;
    }

    copy() {
        return new FuckDict(this.entries_array());
    }
}

export type FuckSet<T> = FuckDict<T, undefined>;

export function arrays_fuck_equal<T>(ar1: T[], ar2: T[]) {
    if (ar1.length !== ar2.length) {
        return false;
    }

    for (let i = 0; i < ar1.length; i++) {
        if (ar1[i].toString() !== ar2[i].toString()) {
            return false;
        }
    }
    return true;
}

export function array_fuck_contains<T>(ar: T[], elt: T){
    return ar.some((x) => x.toString() === elt.toString())
}



export type Point2 = [number, number];

export function make_matrix2(data_obj: number[][]) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;

    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}

export class Matrix2 {
    readonly dim_x: number;
    readonly dim_y: number;
    readonly data: Int16Array;
    
    constructor (data: Int16Array, dim_x: number, dim_y: number) {
        this.data = data;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
    }

    get(x: number, y: number): number {
        return this.data[y * this.dim_x + x];
    }

    set(x: number, y: number, value: number) {
        this.data[y * this.dim_x + x] = value;
    }

    rotate(degrees: number): Matrix2 {
        //validate input better

        if (degrees == 360 || degrees == 0) {
            return this;
        }

        const n_rotations = degrees / 90;
        let m: Matrix2 = this;
        const dim_x = this.dim_x;
        const dim_y = this.dim_y;
        for (let i = 0; i < n_rotations; i++){
            let new_data = new Int16Array(dim_x * dim_y);
            let new_mat2 = new Matrix2(new_data, dim_y, dim_x);
            for (let y = 0; y < dim_y; y++){
                for (let x = 0; x < dim_x; x++){
                    new_mat2.set(dim_y - 1 - y, x, m.get(x, y));
                }
            }
            m = new_mat2;
        }
        return m
    }

    contains(value: number): boolean{
        return this.data.indexOf(value) !== -1;
    }
}


export type Counter<T> = Map<T, number>;

export function counter_add<T>(counter: Counter<T>, key: T, inc: number){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = counter.get(key);
    }
    return counter.set(key, cur_val + inc);
}

export function counter_get<T>(counter: Counter<T>, key: T){
    let cur_val = 0;
    if (counter.has(key)){
        cur_val = counter.get(key);
    }
    return cur_val;
}

export function counter_update<T>(counter1: Counter<T>, counter2: Counter<T>){
    counter2.forEach(function (v, k){
        counter_add(counter1, k, v);
    });

    return counter1;
}

export function counter_order<T>(counter: Counter<T>, include_zero=false){
    let result = Array.from(counter.entries()).sort((a, b) => a[1] - b[1]);
    if (!include_zero) {
        result = result.filter(([t, i]) => i > 0);
    }
    return result.map(([t, i]) => t);
}

export type Disablable<T> = T | DWrapped<T>;
export type DWrapped<T> = {value: T, disablable: true, enabled: boolean}


export function is_dwrapped<T>(x: Disablable<T>): x is DWrapped<T>{
    return (<DWrapped<T>>x).disablable !== undefined;
}

export function set_enabled<T>(x: Disablable<T>, enabled: boolean=true): Disablable<T>{
    if (is_dwrapped(x)) {
        if (x.enabled !== enabled) {
            x.enabled = enabled; //could do check here for enabled being set properly already
        }
        return x;
    } else {
        let result: DWrapped<T> = {value: x, disablable: true, enabled};
        
        return result;
    }
}

export function unwrap<T>(x: Disablable<T>): T {
    if (is_dwrapped(x)) {
        return x.value;
    } else {
        return x;
    }
}

export function with_disablable<T1, T2>(x: Disablable<T1>, f: (t1: T1) => Disablable<T2>): Disablable<T2> {
    return set_enabled(unwrap(f(unwrap(x))), is_enabled(x));
}

export function is_enabled<T>(x: Disablable<T>): boolean {
    if (is_dwrapped(x)){
        return x.enabled;
    } else {
        return true;
    }
}