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

    get(k: K, default_value?: V): V {
        if (!this.has_key(k) && default_value !== undefined) {
            this.set(k, default_value);
            return default_value;
        }
        let s = k.toString();
        return this.values_map.get(s);
    }

    update(a: [K, V][]): FuckDict<K, V> {
        let updated = this.copy();
        for (let [k, v] of a) {
            updated.set(k, v);
        }
        return updated;
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

export function chain_object<T extends object>(src: T) {
    return new Proxy<T>(src, {
        get: function (target, key) {
            if (target[key] === undefined) {
                target[key] = {};
            }
            let v = target[key];
            if (typeof v === 'object' && !(v instanceof Array)) {
                return chain_object(v);
            } else {
                return v;    
            }  
        }    
    });
} 

export function chain_update(target: Object, source: Object, inplace=false) {
    let updated: Object;
    if (inplace) {
        updated = target || {};
    } else {
        updated = {...target};
    }

    for (let [n, v] of Object.entries(source)) {
        if (typeof v === 'object' && !(v instanceof Array)) {
            updated[n] = chain_update(updated[n], v, inplace);
        } else {
            updated[n] = v;
        }
    }
    return updated;
}

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

export function zeros(dim_x: number, dim_y: number) {
    return new Matrix2(new Int16Array(dim_x * dim_y), dim_x, dim_y);
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

    copy(): Matrix2 {
        return new Matrix2(this.data.slice(), this.dim_x, this.dim_y);
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

// export type Disablable<T> = T | DWrapped<T>;
// export type DWrapped<T> = {value: T, disablable: true, enabled: boolean}

// export function is_dwrapped<T>(x: Disablable<T>): x is DWrapped<T>{
//     return (<DWrapped<T>>x).disablable !== undefined;
// }

// export function set_enabled<T>(x: Disablable<T>, enabled: boolean=true): Disablable<T>{
//     if (is_dwrapped(x)) {
//         if (x.enabled !== enabled) {
//             x.enabled = enabled; //could do check here for enabled being set properly already
//         }
//         return x;
//     } else {
//         let result: DWrapped<T> = {value: x, disablable: true, enabled};
        
//         return result;
//     }
// }

// export function unwrap<T>(x: Disablable<T>): T {
//     if (is_dwrapped(x)) {
//         return x.value;
//     } else {
//         return x;
//     }
// }

// export function with_disablable<T1, T2>(x: Disablable<T1>, f: (t1: T1) => Disablable<T2>): Disablable<T2> {
//     return set_enabled(unwrap(f(unwrap(x))), is_enabled(x));
// }

// export function is_enabled<T>(x: Disablable<T>): boolean {
//     if (is_dwrapped(x)){
//         return x.enabled;
//     } else {
//         return true;
//     }
// }

export type Annotatable<T, AT> = T | Annotated<T, AT>;
export type Annotated<T, AT> = {value: T, annotated: true, annotation: Partial<AT>};

//export type _MergeAnnotations<T, A1 extends Annotatable<T, AT1>,  AT1, AT2> = Annotatable<T, AT1 & AT2>
//export type MergeAnnotations<T, > = 

export function is_annotated<T, AT>(x: Annotatable<T, AT>): x is Annotated<T, AT>{
    if (x === undefined) {
        return false;
    }
    return (<Annotated<T, AT>>x).annotated !== undefined;
}

export function annotate<T, AT>(x: Annotatable<T, AT>, annotation?: Partial<AT>): Annotated<T, AT>{
    if (annotation === undefined) {
        annotation = {};
    }
    if (is_annotated(x)) {
        Object.assign(x.annotation, annotation);
        return x;
    } else {
        let result: Annotated<T, AT> = {value: x, annotated: true, annotation};
        
        return result;
    }
}

export function unwrap<T, AT>(x: Annotatable<T, AT>): T {
    if (is_annotated(x)) {
        return x.value;
    } else {
        return x;
    }
}

export function with_annotatable<T1, T2, TA>(f: (t1: T1) => T2, default_value?: TA): (x: Annotatable<T1, TA>) => Annotatable<T2, TA> {
    return (x: Annotatable<T1, TA>) => annotate(unwrap(f(unwrap(x))), get_annotation(x, default_value));
}

export function get_annotation<T, TA>(x: Annotatable<T, TA>, default_value?: TA): Partial<TA> {
    if (is_annotated(x)){
        if (default_value !== undefined) {
            return {...<any>default_value, ...<any>x.annotation};
        } else {
            return x.annotation;
        }
        
    } else {
        return default_value;
    }
}

export type ADisablable = {enabled: boolean};
export type Disablable<T> = Annotatable<T, ADisablable>;

export function set_enabled<T>(x: Disablable<T>, enabled: boolean=true){
    return annotate(x, {enabled});
}

export function with_disablable<T1, T2>(f: (t1: T1) => T2): (x: Disablable<T1>) => Disablable<T2> {
    return with_annotatable(f, {enabled: true});
}

export function is_enabled<T>(x: Disablable<T>): boolean {
    let result = get_annotation(x);
    if (result === undefined) {
        return true;
    }

    return result.enabled;
}


export type Numbered<T> = Annotatable<T, number>


enum _StringValidity {
    valid
}

export type StringValidity = _StringValidity | string;

export class StringValidator {
    static validate<V extends StringValidator>(s: string): s is ValidString<V> {
        return new this().is_valid(s);
    }

    is_valid(s: ValidatedString<this>): s is ValidString<this> {
        return false;
    }
}

export type ValidatedString<V extends StringValidator> = string & StringValidity;
export type ValidString<V extends StringValidator> = string & _StringValidity.valid;

