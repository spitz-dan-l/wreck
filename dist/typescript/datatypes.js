"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class FuckDict {
    constructor(a) {
        this.size = 0;
        this.keys_map = new Map();
        this.values_map = new Map();
        if (a !== undefined) {
            for (let [k, v] of a) {
                this.set(k, v);
            }
        }
    }
    set(k, v) {
        let s = k.toString();
        this.keys_map.set(s, k);
        this.values_map.set(s, v);
        this.size = this.keys_map.size;
        return this;
    }
    get(k, default_value) {
        if (!this.has_key(k) && default_value !== undefined) {
            this.set(k, default_value);
            return default_value;
        }
        let s = k.toString();
        return this.values_map.get(s);
    }
    update(a) {
        let updated = this.copy();
        for (let [k, v] of a) {
            updated.set(k, v);
        }
        return updated;
    }
    has_key(k) {
        return this.keys_map.has(k.toString());
    }
    keys_array() {
        return Array.from(this.keys_map.values());
    }
    values_array() {
        return Array.from(this.values_map.values());
    }
    entries_array() {
        let result = [];
        for (let [s, k] of this.keys_map.entries()) {
            result.push([k, this.values_map.get(s)]);
        }
        return result;
    }
    keys_equal(other) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)) {
                return false;
            }
        }
        for (let elem of other.keys_array()) {
            if (!this.has_key(elem)) {
                return false;
            }
        }
        return true;
    }
    keys_intersect(other) {
        let result = [];
        for (let k of this.keys_array()) {
            if (other.has_key(k)) {
                result.push(k);
            }
        }
        return result;
    }
    keys_subset(other) {
        for (let elem of this.keys_array()) {
            if (!other.has_key(elem)) {
                return false;
            }
        }
        return true;
    }
    toString() {
        let entry_strings = this.entries_array().map((x) => x.toString()).sort();
        return `FuckDict<${entry_strings.join(',')}>`;
    }
    copy() {
        return new FuckDict(this.entries_array());
    }
}
exports.FuckDict = FuckDict;
function chain_object(src) {
    return new Proxy(src, {
        get: function (target, key) {
            if (target[key] === undefined) {
                target[key] = {};
            }
            let v = target[key];
            if (typeof v === 'object' && !(v instanceof Array)) {
                return chain_object(v);
            }
            else {
                return v;
            }
        }
    });
}
exports.chain_object = chain_object;
function chain_update(target, source, replace_keys = [], inplace = false) {
    let updated;
    if (inplace) {
        updated = target || {};
    }
    else {
        updated = Object.assign({}, target);
    }
    for (let [n, v] of Object.entries(source)) {
        if (!replace_keys.includes(n) && typeof v === 'object' && !(v instanceof Array)) {
            updated[n] = chain_update(updated[n], v, replace_keys, inplace);
        }
        else {
            updated[n] = v;
        }
    }
    return updated;
}
exports.chain_update = chain_update;
function update(source, updater) {
    if (updater.constructor === Object) {
        let result;
        if (source.constructor === Object) {
            result = Object.assign({}, source);
        }
        else {
            result = {};
        }
        for (let [n, v] of Object.entries(updater)) {
            if (v === undefined) {
                delete result[n];
            }
            else {
                result[n] = update(result[n], v);
            }
        }
        return result;
    }
    else if (updater.constructor === Function) {
        let updater;
        return updater(source);
    }
    else {
        //just "replacing" source with updater
        let updater;
        return updater;
    }
}
exports.update = update;
// let obj = { a: 1, b: { c: [2,3], d: 5 } };
// let updated: typeof obj = update(obj, { b: { c: _ => [..._, 4] } } );
// update(obj, { e: { f: _ => 6 }});
// let x = 5;
function arrays_fuck_equal(ar1, ar2) {
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
exports.arrays_fuck_equal = arrays_fuck_equal;
function array_fuck_contains(ar, elt) {
    return ar.some((x) => x.toString() === elt.toString());
}
exports.array_fuck_contains = array_fuck_contains;
function make_matrix2(data_obj) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;
    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}
exports.make_matrix2 = make_matrix2;
function zeros(dim_x, dim_y) {
    return new Matrix2(new Int16Array(dim_x * dim_y), dim_x, dim_y);
}
exports.zeros = zeros;
class Matrix2 {
    constructor(data, dim_x, dim_y) {
        this.data = data;
        this.dim_x = dim_x;
        this.dim_y = dim_y;
    }
    get(x, y) {
        return this.data[y * this.dim_x + x];
    }
    set(x, y, value) {
        this.data[y * this.dim_x + x] = value;
    }
    rotate(degrees) {
        //validate input better
        if (degrees == 360 || degrees == 0) {
            return this;
        }
        const n_rotations = degrees / 90;
        let m = this;
        const dim_x = this.dim_x;
        const dim_y = this.dim_y;
        for (let i = 0; i < n_rotations; i++) {
            let new_data = new Int16Array(dim_x * dim_y);
            let new_mat2 = new Matrix2(new_data, dim_y, dim_x);
            for (let y = 0; y < dim_y; y++) {
                for (let x = 0; x < dim_x; x++) {
                    new_mat2.set(dim_y - 1 - y, x, m.get(x, y));
                }
            }
            m = new_mat2;
        }
        return m;
    }
    contains(value) {
        return this.data.indexOf(value) !== -1;
    }
    copy() {
        return new Matrix2(this.data.slice(), this.dim_x, this.dim_y);
    }
}
exports.Matrix2 = Matrix2;
function counter_add(counter, key, inc) {
    let cur_val = 0;
    if (counter.has(key)) {
        cur_val = counter.get(key);
    }
    return counter.set(key, cur_val + inc);
}
exports.counter_add = counter_add;
function counter_get(counter, key) {
    let cur_val = 0;
    if (counter.has(key)) {
        cur_val = counter.get(key);
    }
    return cur_val;
}
exports.counter_get = counter_get;
function counter_update(counter1, counter2) {
    counter2.forEach(function (v, k) {
        counter_add(counter1, k, v);
    });
    return counter1;
}
exports.counter_update = counter_update;
function counter_order(counter, include_zero = false) {
    let result = Array.from(counter.entries()).sort((a, b) => a[1] - b[1]);
    if (!include_zero) {
        result = result.filter(([t, i]) => i > 0);
    }
    return result.map(([t, i]) => t);
}
exports.counter_order = counter_order;
//export type _MergeAnnotations<T, A1 extends Annotatable<T, AT1>,  AT1, AT2> = Annotatable<T, AT1 & AT2>
//export type MergeAnnotations<T, > = 
function is_annotated(x) {
    if (x === undefined) {
        return false;
    }
    return x.annotated !== undefined;
}
exports.is_annotated = is_annotated;
function annotate(x, annotation) {
    if (annotation === undefined) {
        annotation = {};
    }
    if (is_annotated(x)) {
        Object.assign(x.annotation, annotation);
        return x;
    }
    else {
        let result = { value: x, annotated: true, annotation };
        return result;
    }
}
exports.annotate = annotate;
function unwrap(x) {
    if (is_annotated(x)) {
        return x.value;
    }
    else {
        return x;
    }
}
exports.unwrap = unwrap;
function with_annotatable(f, default_value) {
    return (x) => annotate(unwrap(f(unwrap(x))), get_annotation(x, default_value));
}
exports.with_annotatable = with_annotatable;
function get_annotation(x, default_value) {
    if (is_annotated(x)) {
        if (default_value !== undefined) {
            return Object.assign({}, default_value, x.annotation);
        }
        else {
            return x.annotation;
        }
    }
    else {
        return default_value;
    }
}
exports.get_annotation = get_annotation;
function set_enabled(x, enabled = true) {
    return annotate(x, { enabled });
}
exports.set_enabled = set_enabled;
function with_disablable(f) {
    return with_annotatable(f, { enabled: true });
}
exports.with_disablable = with_disablable;
function is_enabled(x) {
    let result = get_annotation(x);
    if (result === undefined) {
        return true;
    }
    return result.enabled;
}
exports.is_enabled = is_enabled;
class StringValidator {
    static validate(s) {
        return new this().is_valid(s);
    }
    is_valid(s) {
        return false;
    }
}
exports.StringValidator = StringValidator;
// Holy dang this is cool:
// https://stackoverflow.com/questions/46445115/derive-a-type-a-from-a-list-of-strings-a
//
// Point here is to define the list of ObserverMomentIDs and PerceptionIDs
// as a constant, and get string literal typechecking elsewhere in the code.
function infer_literal_array(...arr) {
    return arr;
}
exports.infer_literal_array = infer_literal_array;
//# sourceMappingURL=datatypes.js.map