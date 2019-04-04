/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 14);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

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
        let entry_strings = this.entries_array().map(x => x.toString()).sort();
        return `FuckDict<${entry_strings.join(',')}>`;
    }
    copy() {
        return new FuckDict(this.entries_array());
    }
}
exports.FuckDict = FuckDict;
// export type FuckSet<T> = FuckDict<T, undefined>;
class FuckSet extends FuckDict {
    constructor(a) {
        if (a !== undefined) {
            super(a.map(t => [t, undefined]));
        } else {
            super();
        }
    }
}
exports.FuckSet = FuckSet;
function chain_object(src) {
    return new Proxy(src, {
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
exports.chain_object = chain_object;
function chain_update(target, source, replace_keys = [], inplace = false) {
    let updated;
    if (inplace) {
        updated = target || {};
    } else {
        updated = Object.assign({}, target);
    }
    for (let [n, v] of Object.entries(source)) {
        if (!replace_keys.includes(n) && typeof v === 'object' && !(v instanceof Array)) {
            updated[n] = chain_update(updated[n], v, replace_keys, inplace);
        } else {
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
        } else {
            result = {};
        }
        for (let [n, v] of Object.entries(updater)) {
            if (v === undefined) {
                delete result[n];
            } else {
                result[n] = update(result[n], v);
            }
        }
        return result;
    } else if (updater.constructor === Function) {
        let updater;
        return updater(source);
    } else {
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
    return ar.some(x => x.toString() === elt.toString());
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
    } else {
        let result = { value: x, annotated: true, annotation };
        return result;
    }
}
exports.annotate = annotate;
function unwrap(x) {
    if (is_annotated(x)) {
        return x.value;
    } else {
        return x;
    }
}
exports.unwrap = unwrap;
function with_annotatable(f, default_value) {
    return x => annotate(unwrap(f(unwrap(x))), get_annotation(x, default_value));
}
exports.with_annotatable = with_annotatable;
function get_annotation(x, default_value) {
    if (is_annotated(x)) {
        if (default_value !== undefined) {
            return Object.assign({}, default_value, x.annotation);
        } else {
            return x.annotation;
        }
    } else {
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
function field_getter(x) {
    let result = {};
    for (let key in x[0]) {
        Object.defineProperty(result, key, {
            get: () => x[x[0][key]]
        });
    }
    return result;
}
exports.field_getter = field_getter;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const text_tools_1 = __webpack_require__(3);
const datatypes_1 = __webpack_require__(1);
var DisplayEltType;
(function (DisplayEltType) {
    DisplayEltType[DisplayEltType["keyword"] = 0] = "keyword";
    DisplayEltType[DisplayEltType["option"] = 1] = "option";
    DisplayEltType[DisplayEltType["filler"] = 2] = "filler";
    DisplayEltType[DisplayEltType["partial"] = 3] = "partial";
    DisplayEltType[DisplayEltType["error"] = 4] = "error";
})(DisplayEltType = exports.DisplayEltType || (exports.DisplayEltType = {}));
function set_display(x, display) {
    return datatypes_1.annotate(x, { display });
}
exports.set_display = set_display;
var MatchValidity;
(function (MatchValidity) {
    MatchValidity[MatchValidity["valid"] = 0] = "valid";
    MatchValidity[MatchValidity["partial"] = 1] = "partial";
    MatchValidity[MatchValidity["invalid"] = 2] = "invalid";
})(MatchValidity = exports.MatchValidity || (exports.MatchValidity = {}));
class CommandParser {
    constructor(command) {
        this.position = 0;
        this.validity = MatchValidity.valid;
        this.match = [];
        this.tail_padding = '';
        this.command = command;
        [this.tokens, this.token_gaps] = text_tools_1.tokenize(command);
    }
    consume_exact(spec_tokens, display = DisplayEltType.keyword, name) {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }
        let match_tokens = [];
        let match_gaps = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position + pos_offset === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];
            let next_gap = this.token_gaps[this.position + pos_offset];
            if (spec_tok.toLowerCase() === next_tok.toLowerCase()) {
                match_tokens.push(next_tok);
                match_gaps.push(next_gap);
                pos_offset++;
                continue;
            }
            if (text_tools_1.starts_with(spec_tok.toLowerCase(), next_tok.toLowerCase())) {
                match_tokens.push(next_tok);
                match_gaps.push(next_gap);
                this.validity = MatchValidity.partial;
                pos_offset++;
                break;
            }
            this.validity = MatchValidity.invalid;
            break;
        }
        this.position += pos_offset;
        if (this.validity === MatchValidity.valid) {
            this.match.push({
                display: display,
                match: text_tools_1.untokenize(match_tokens, match_gaps),
                name: name
            });
            return true;
        }
        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    match: text_tools_1.untokenize(match_tokens, match_gaps),
                    typeahead: [text_tools_1.untokenize(spec_tokens)],
                    name: name
                });
                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }
        match_tokens.push(...this.tokens.slice(this.position));
        match_gaps.push(...this.token_gaps.slice(this.position, this.tokens.length));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_gaps),
            name: name
        });
        return false;
    }
    subparser() {
        return new CommandParser(text_tools_1.untokenize(this.tokens.slice(this.position), this.token_gaps.slice(this.position)));
    }
    integrate(subparser) {
        this.position += subparser.position;
        this.match.push(...subparser.match);
        this.validity = subparser.validity;
    }
    consume_option(option_spec_tokens, name) {
        let partial_matches = [];
        let exact_match_subparser = null;
        let exact_match_spec_toks = null;
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let annotation = datatypes_1.get_annotation(spec_toks, { display: DisplayEltType.option, enabled: true });
            let display = annotation.display;
            let is_exact_match = subparser.consume_exact(datatypes_1.unwrap(spec_toks), annotation.display, name);
            if (annotation.enabled) {
                if (is_exact_match) {
                    exact_match_subparser = subparser;
                    exact_match_spec_toks = datatypes_1.unwrap(spec_toks);
                    continue;
                }
                if (subparser.validity === MatchValidity.partial) {
                    partial_matches.push(subparser.match[0]);
                }
            } else {
                if (is_exact_match || subparser.validity === MatchValidity.partial) {
                    let disabled_match = datatypes_1.set_enabled(subparser.match[0], false);
                    partial_matches.push(disabled_match);
                }
            }
        }
        if (exact_match_subparser !== null) {
            let typeahead = partial_matches.map(datatypes_1.with_disablable(x => datatypes_1.unwrap(x.typeahead[0])));
            // let typeahead = partial_matches.map( (de) => with_disablable(de, (x) => x.typeahead[0]));
            this.integrate(exact_match_subparser);
            this.match[this.match.length - 1].typeahead = typeahead;
            return text_tools_1.normalize_whitespace(text_tools_1.untokenize(exact_match_spec_toks));
        }
        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(datatypes_1.with_disablable(x => datatypes_1.unwrap(x.typeahead[0])));
            this.match.push({
                display: DisplayEltType.partial,
                match: datatypes_1.unwrap(partial_matches[0]).match,
                typeahead: typeahead,
                name: name
            });
            return false;
        }
        return this.invalidate();
    }
    invalidate() {
        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_gaps = this.token_gaps.slice(this.position, this.tokens.length);
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_gaps),
            name: name
        });
        this.position = this.tokens.length;
        return false;
    }
    consume_filler(spec_tokens) {
        return this.consume_exact(spec_tokens, DisplayEltType.filler);
    }
    is_done() {
        if (this.position === this.tokens.length - 1 && this.tokens[this.tokens.length - 1] === '') {
            return this.validity === MatchValidity.valid;
        }
        if (this.position !== this.tokens.length) {
            return false;
        }
        return this.validity === MatchValidity.valid;
    }
    done() {
        if (!this.is_done() /*this.position !== this.tokens.length */) {
                this.validity = MatchValidity.invalid;
                this.match.push({
                    display: DisplayEltType.error,
                    match: text_tools_1.untokenize(this.tokens.slice(this.position), this.token_gaps.slice(this.position, this.tokens.length))
                });
                this.position = this.tokens.length;
            } else {
            if (this.position === this.tokens.length - 1) {
                this.tail_padding = this.token_gaps[this.token_gaps.length - 1];
            }
        }
        return this.validity === MatchValidity.valid;
    }
    get_match(name) {
        for (let m of this.match) {
            if (m.name === name) {
                return m;
            }
        }
        return null;
    }
}
exports.CommandParser = CommandParser;
function stop_early(gen) {
    let value = undefined;
    let done = false;
    while (!done) {
        let result = gen.next(value);
        value = result.value;
        done = result.done;
        if (value === false) {
            return;
        }
    }
    return value;
}
exports.stop_early = stop_early;
exports.with_early_stopping = gen_func => {
    let inner = (...args) => {
        let gen = gen_func(...args);
        return stop_early(gen);
    };
    return inner;
};
function with_early_stopping2(gen_func) {
    let inner = (...args) => {
        let gen = gen_func.call(this, ...args);
        return stop_early(gen);
    };
    return inner;
}
exports.with_early_stopping2 = with_early_stopping2;
function combine(parser, consumers) {
    let threads = [];
    for (let c of consumers) {
        let sp = parser.subparser();
        threads.push({
            result: c.call(this, sp),
            subparser: sp
        });
    }
    let partial_matches = [];
    for (let t of threads) {
        if (t.subparser.is_done()) {
            parser.integrate(t.subparser);
            return t.result;
        } else {
            if (t.subparser.validity === MatchValidity.partial) {
                partial_matches.push(t);
            }
        }
    }
    if (partial_matches.length > 0) {
        //integrate the first one
        parser.integrate(partial_matches[0].subparser);
        let final_typeahead = parser.match[parser.match.length - 1].typeahead;
        let final_t_strings = final_typeahead.map(datatypes_1.unwrap);
        for (let p of partial_matches.slice(1)) {
            //extend the typeahead with the rest
            let typeahead = p.subparser.match[p.subparser.match.length - 1].typeahead;
            for (let t of typeahead) {
                let t_string = datatypes_1.unwrap(t);
                if (!final_t_strings.includes(t_string)) {
                    final_typeahead.push(t);
                    final_t_strings.push(t_string);
                }
            }
        }
    } else {
        // set to invalid
        parser.invalidate();
    }
    return false;
}
exports.combine = combine;
// Validator for the mini-language applying to transitions for syntax highlighting
class PhraseDSLValidator extends datatypes_1.StringValidator {
    is_valid(s) {
        let toks = text_tools_1.tokenize(s)[0];
        if (toks.slice(1).some(t => t.startsWith('~') || t.startsWith('*') || t.startsWith('&'))) {
            return false;
        }
        return true;
    }
}
exports.PhraseDSLValidator = PhraseDSLValidator;
function consume_declarative_dsl(parser, options) {
    // assumption: no option is a prefix of any other option
    let consumers = [];
    for (let option of options) {
        let opt_consumer = exports.with_early_stopping(function* (parser) {
            for (let o of option) {
                let enabled = true;
                if (o.startsWith('~')) {
                    enabled = false;
                    o = o.slice(1);
                }
                let display = DisplayEltType.filler;
                if (o.startsWith('*')) {
                    display = DisplayEltType.keyword;
                    o = o.slice(1);
                } else if (o.startsWith('&')) {
                    display = DisplayEltType.option;
                    o = o.slice(1);
                }
                let toks = text_tools_1.tokenize(o)[0];
                yield parser.consume_option([datatypes_1.annotate(toks, { enabled, display })]);
            }
            return text_tools_1.untokenize(option);
        });
        consumers.push(opt_consumer);
    }
    let result = combine.call(this, parser, consumers);
    return result;
}
exports.consume_declarative_dsl = consume_declarative_dsl;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
function uncapitalize(msg) {
    return msg[0].toLowerCase() + msg.slice(1);
}
exports.uncapitalize = uncapitalize;
function capitalize(msg) {
    return msg[0].toUpperCase() + msg.slice(1);
}
exports.capitalize = capitalize;
function starts_with(str, searchString, position) {
    position = position || 0;
    return str.substr(position, searchString.length) === searchString;
}
exports.starts_with = starts_with;
function tokens_equal(tks1, tks2) {
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
exports.tokens_equal = tokens_equal;
function tokenize(s) {
    let word_pat = /[\S]+/g;
    let space_pat = /[^\S]+/g;
    let tokens = s.split(space_pat);
    let gaps = s.split(word_pat);
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
exports.tokenize = tokenize;
function split_tokens(s) {
    let space_pat = /[^\S]+/g;
    let tokens = s.split(space_pat);
    if (tokens.length > 0) {
        if (tokens[0] === '') {
            tokens.splice(0, 1);
        }
        if (tokens[tokens.length - 1] === '') {
            tokens.splice(tokens.length - 1, 1);
        }
    }
    return tokens;
}
exports.split_tokens = split_tokens;
function tokenize_tests() {
    console.log('tokenize tests');
    console.log(tokenize(' l'));
}
function untokenize(tokens, gaps) {
    if (gaps === undefined) {
        return tokens.join(' ');
    }
    let result = '';
    let i = 0;
    for (i = 0; i < gaps.length; i++) {
        result += gaps[i];
        if (i < tokens.length) {
            result += tokens[i];
        }
    }
    return result;
}
exports.untokenize = untokenize;
function get_indenting_whitespace(s) {
    let space_pat = /^[^\S]+/;
    let result = space_pat.exec(s);
    if (result === null) {
        return '';
    }
    return result[0];
}
exports.get_indenting_whitespace = get_indenting_whitespace;
function ends_with_whitespace(s) {
    let last_space_pat = /\s$/;
    return last_space_pat.exec(s) !== null;
}
exports.ends_with_whitespace = ends_with_whitespace;
function normalize_whitespace(s) {
    return s.trim().replace(/\s+/g, ' ');
}
exports.normalize_whitespace = normalize_whitespace;
function last(x) {
    return x[x.length - 1];
}
exports.last = last;
function random_choice(choices) {
    var index = Math.floor(Math.random() * choices.length);
    return choices[index];
}
exports.random_choice = random_choice;
function dedent(strs, ...args) {
    // do interpolation
    let result = strs[0];
    for (let i = 0; i < args.length; i++) {
        result += args[i] + strs[i + 1];
    }
    //find the first newline with whitespace after it
    let pat = /\n +/;
    let m = pat.exec(result);
    if (m === null) {
        return result;
    }
    let replace_pat = new RegExp(m[0], 'g');
    let result2 = result.replace(replace_pat, '\n');
    return result2;
}
exports.dedent = dedent;
function wrap_in_div(message) {
    let elt = document.createElement('div');
    elt.innerHTML = message;
    return elt;
}
exports.wrap_in_div = wrap_in_div;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
const parser_1 = __webpack_require__(2);
class World {
    constructor(state) {
        this.state = state;
    }
    update(state_updates, replace_keys) {
        let new_state = datatypes_1.chain_update(this.state, state_updates, replace_keys);
        return new this.constructor(new_state);
    }
}
exports.World = World;
function apply_command(world, cmd) {
    let parser = new parser_1.CommandParser(cmd);
    let result = { parser: parser, world: world };
    let cmd_result = world.handle_command(parser);
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
        result = apply_interstitial_update(result);
    }
    return result;
}
exports.apply_command = apply_command;
function apply_interstitial_update(result) {
    if (result.world.interstitial_update !== undefined) {
        let res2 = result.world.interstitial_update();
        if (res2 !== undefined) {
            if (res2.world !== undefined) {
                result.world = res2.world;
            }
            if (res2.message !== undefined) {
                //assume they updated the original message in some way   
                result.message = res2.message;
            }
        }
    }
    return result;
}
class HistoryInterpretationError extends Error {}
;
function apply_history_interpretation_op(interp, op) {
    if (op === undefined || op.length === 0) {
        return interp;
    }
    let new_interp;
    if (interp === undefined) {
        new_interp = [];
    } else {
        new_interp = [...interp];
    }
    for (let o of op) {
        if (o['add'] !== undefined) {
            let message_class = o['add'];
            if (new_interp.indexOf(message_class) === -1) {
                new_interp.push(message_class);
            }
        }
        if (o['remove'] !== undefined) {
            let message_class = o['remove'];
            let idx = new_interp.indexOf(message_class);
            if (idx !== -1) {
                new_interp.splice(idx, 1);
            }
        }
    }
    return new_interp;
}
function apply_history_interpretation(history, world) {
    if (world.interpret_history === undefined) {
        return history;
    } else {
        let history_input = history.map(({ world, message }) => ({ world, message }));
        let interp_ops = history_input.map(world.interpret_history, world);
        let new_history = [];
        for (let i = 0; i < interp_ops.length; i++) {
            let new_elt = Object.assign({}, history[i]);
            let msg_clss = new_elt.message_classes;
            let op = interp_ops[i];
            new_elt.message_classes = apply_history_interpretation_op(msg_clss, op);
            new_history.push(new_elt);
        }
        return new_history;
    }
}
class WorldDriver {
    constructor(initial_world) {
        this.previous_histories = [];
        let initial_result = { world: initial_world };
        initial_result = apply_interstitial_update(initial_result);
        initial_result.index = 0;
        this.history = apply_history_interpretation([initial_result], initial_world);
        this.apply_command('', false); //populate this.current_state
    }
    apply_command(cmd, commit = true) {
        let prev_state = datatypes_1.unwrap(this.history[this.history.length - 1]);
        let result = apply_command(prev_state.world, cmd);
        result.index = prev_state.index + 1;
        this.current_state = result;
        if (this.current_state.parser.validity === parser_1.MatchValidity.valid) {
            this.possible_history = apply_history_interpretation([...this.history, this.current_state], this.current_state.world);
            if (commit) {
                this.commit();
            }
        } else {
            this.possible_history = this.history;
        }
        return result;
    }
    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);
        //filter out any disabled history
        this.history = this.possible_history.filter(datatypes_1.is_enabled); //.map(x => annotate(x, 1));
        this.apply_command('', false);
        return this.current_state;
    }
}
exports.WorldDriver = WorldDriver;
// eager dispatch
// type WorldWithEagerDispatch<T> = World<T> & {
//     get_commands(): Disablable<Command<T>>[],
// }
// export function eager_dispatch<T>(world: WorldWithEagerDispatch<T>, parser: CommandParser) {
//     let commands = world.get_commands();
//     let options = commands.map((cmd) => with_disablable(cmd, (c) => c.command_name));
//     let cmd_name = parser.consume_option(options, 'command');
//     let result: CommandResult<T> = {parser: parser, world: world};
//     if (!cmd_name) {
//         return result;
//     }
//     let command = unwrap(commands[commands.findIndex((cmd) => (
//         cmd_name === untokenize(unwrap(cmd).command_name)))]);
//     let cmd_result = command.execute(world, parser);
//     return cmd_result
// }

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __webpack_require__(4);
const parser_1 = __webpack_require__(2);
const datatypes_1 = __webpack_require__(1);
const text_tools_1 = __webpack_require__(3);
const observer_moments_1 = __webpack_require__(16);
const hex_1 = __webpack_require__(15);
exports.wrap_handler = handler => function (parser) {
    return parser_1.with_early_stopping(handler.bind(this))(parser);
};
class VenienceWorld extends commands_1.World {
    constructor({ experiences, history_index, om_state, has_regarded, has_understood, has_visited }) {
        if (experiences === undefined) {
            experiences = ['imagining 0'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (om_state === undefined) {
            om_state = {};
        }
        if (has_regarded === undefined) {
            has_regarded = {};
        }
        if (has_understood === undefined) {
            has_understood = {};
        }
        if (has_visited === undefined) {
            has_visited = {};
        }
        super({ experiences, history_index, om_state, has_regarded, has_understood, has_visited });
    }
    current_om() {
        for (let i = this.state.experiences.length - 1; i >= 0; i--) {
            let exp = this.state.experiences[i];
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null or empty history.";
    }
    get_om_state(om_id) {
        return this.state.om_state[om_id] || {};
    }
    get_current_om_state() {
        return this.get_om_state(this.current_om());
    }
    transition_to(dest, dest_om_state, message) {
        let update = {
            experiences: [...this.state.experiences, dest],
            history_index: this.state.history_index + 1,
            has_visited: { [dest]: true }
        };
        if (dest_om_state !== undefined) {
            update.om_state = {
                [dest]: dest_om_state
            };
        }
        let result = {
            world: this.update(update)
        };
        if (message !== false) {
            if (message === undefined) {
                let msg;
                let dest_om = VenienceWorld.observer_moments[dest];
                if (this.state.has_visited[dest] && dest_om.short_enter_message !== undefined) {
                    msg = dest_om.short_enter_message;
                } else {
                    msg = dest_om.enter_message;
                }
                if (msg !== undefined) {
                    result.message = text_tools_1.wrap_in_div(msg);
                }
            } else {
                result.message = message;
            }
        }
        return result;
    }
    get handle_command() {
        return exports.wrap_handler(function* (parser) {
            let om = VenienceWorld.observer_moments[this.current_om()];
            if (!observer_moments_1.are_transitions_declarative(om)) {
                //dispatch to a more specific handler
                return om.handle_command.call(this, parser);
            }
            // we know these are valid because we indexed them
            // too lazy/busy to thread the validity tag up thru the types :(
            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd);
            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }
            let cmd_choice = parser_1.consume_declarative_dsl(parser, cmd_options);
            if (cmd_choice !== false) {
                yield parser.done();
            }
            let om_id_choice = this.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === text_tools_1.untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });
            return this.transition_to(om_id_choice);
        });
    }
    make_look_consumer(look_options, enabled = true) {
        return exports.wrap_handler(function* (parser) {
            let cmd_enabled = enabled && !look_options.every(([cmd, t]) => this.state.has_regarded[t]);
            yield parser.consume_option([datatypes_1.annotate(['look'], {
                enabled: cmd_enabled,
                display: parser_1.DisplayEltType.keyword
            })]);
            // let options = look_options.map(([opt_toks, t]) => {
            //     if (this.state.has_regarded[t]) {
            //         return ['~' + opt_toks[0], ...opt_toks.slice(1)];
            //     } else {
            //         return opt_toks;
            //     }
            // });
            // let opt = yield consume_option_stepwise_eager(parser, options);
            // yield parser.done();
            let options = look_options.map(([opt_toks, t]) => datatypes_1.annotate(opt_toks, {
                enabled: !(this.state.has_regarded[t] || false),
                display: parser_1.DisplayEltType.filler
            }));
            let opt = yield parser.consume_option(options);
            yield parser.done();
            let target = null;
            for (let [opt_toks, t] of look_options) {
                if (text_tools_1.untokenize(opt_toks) === opt) {
                    target = t;
                    break;
                }
            }
            return this.regard(target);
        });
    }
    regard(perception_id, formatter) {
        if (formatter === undefined) {
            formatter = text_tools_1.wrap_in_div;
        }
        let result = {
            world: this.update({
                has_regarded: {
                    [perception_id]: true
                }
            }),
            message: formatter(VenienceWorld.perceptions[perception_id].content)
        };
        return result;
    }
    // make_understand_consumer(understand_options: [string[], ContentionID][], enabled=true) {
    //     return wrap_handler(function*(parser: CommandParser){
    //         let cmd_enabled = enabled && !understand_options.every(([cmd, t]) => this.state.has_regarded[t])
    //         yield parser.consume_option([annotate(['try'], {
    //             enabled: cmd_enabled,
    //             display: DisplayEltType.filler
    //         })]);
    //         yield parser.consume_filler(['to']);
    //         // let options = look_options.map(([opt_toks, t]) => {
    //         //     if (this.state.has_regarded[t]) {
    //         //         return ['~' + opt_toks[0], ...opt_toks.slice(1)];
    //         //     } else {
    //         //         return opt_toks;
    //         //     }
    //         // });
    //         // let opt = yield consume_option_stepwise_eager(parser, options);
    //         // yield parser.done();
    //         let options = understand_options.map(([opt_toks, t]) =>
    //             set_enabled(opt_toks, !(this.state.has_contended_with[t] || false))
    //         );
    //         let opt = yield parser.consume_option(options);
    //         yield parser.done();
    //         let target: ContentionID = null;
    //         for (let [opt_toks, t] of understand_options) {
    //             if (untokenize(opt_toks) === opt) {
    //                 target = t;
    //                 break;
    //             }
    //         } 
    //         let result: VenienceWorldCommandResult = {
    //             world: this.update({
    //                 has_contended_with: {
    //                     [target]: true
    //                 }
    //             }),
    //             message: wrap_in_div(VenienceWorld.perceptions[target].content)
    //         };
    //         return result;
    //     });
    // }
    interstitial_update(message) {
        let result = {};
        let world_update = {};
        // apply loop erasure
        // if (this.state.experiences.length > 0) {
        //     let loop_idx = this.state.experiences.indexOf(this.current_om());
        //     if (loop_idx !== this.state.experiences.length - 1) {
        //         let new_experiences = this.state.experiences.slice().fill(null, loop_idx + 1, this.state.experiences.length - 1);
        //         world_update.experiences = new_experiences;
        //     }
        // }
        if (Object.keys(world_update).length > 0) {
            result.world = this.update(world_update);
        }
        return result;
    }
    interpret_history(history_elt) {
        // apply loop erasure mechanic
        // if (this.state.experiences[history_elt.world.state.history_index] === null) {
        //     return [{'add': 'forgotten'}];
        // }
        // apply the OM-specific interpretation
        let om = VenienceWorld.observer_moments[this.current_om()];
        if (observer_moments_1.has_interpretations(om)) {
            if (observer_moments_1.are_interpretations_declarative(om)) {
                return om.interpretations[history_elt.world.current_om()];
            } else {
                return om.interpret_history.call(this, history_elt);
            }
        }
    }
}
VenienceWorld.observer_moments = observer_moments_1.index_oms([...hex_1.default.observer_moments()]);
VenienceWorld.perceptions = observer_moments_1.index_perceptions([...hex_1.default.perceptions()]);
exports.VenienceWorld = VenienceWorld;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const parser_1 = __webpack_require__(2);
exports.Carat = () => React.createElement("span", null, ">\u00A0");
function get_display_color(det) {
    switch (det) {
        case parser_1.DisplayEltType.keyword:
            return 'aqua';
        case parser_1.DisplayEltType.option:
            return 'orange';
        case parser_1.DisplayEltType.filler:
            return 'ivory';
        case parser_1.DisplayEltType.partial:
            return 'silver';
        case parser_1.DisplayEltType.error:
            return 'red';
    }
}
exports.ParsedText = props => {
    let { parser, typeaheadIndex, children } = props;
    let style = {
        //display: 'inline-block',
        whiteSpace: 'pre-wrap',
        position: 'relative'
    };
    let validity = parser.validity;
    if (validity === parser_1.MatchValidity.valid) {
        style.fontWeight = '900';
        //style.fontStyle = 'italic'
    } else {
        style.fontWeight = '100';
        if (validity === parser_1.MatchValidity.invalid) {
            style.opacity = '0.6';
        }
    }
    const elt_style = {
        //display: 'inline-block'
    };
    const span_style = {
        //display: 'inline-block'
    };
    return React.createElement("div", { className: "parsed-text", style: {/*display: 'inline-block'*/} }, React.createElement(exports.Carat, null), React.createElement("div", { style: style }, parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')), i === typeaheadIndex ? children : ''))));
};
exports.OutputText = props => {
    const { message_html } = props;
    return React.createElement("div", { className: "output-text", dangerouslySetInnerHTML: { __html: message_html } });
};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
exports.keys = {
    tab: 9,
    enter: 13,
    left: 37,
    up: 38,
    right: 39,
    down: 40
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const Prompt_1 = __webpack_require__(12);
const Text_1 = __webpack_require__(7);
const TypeaheadList_1 = __webpack_require__(13);
const History_1 = __webpack_require__(11);
const text_tools_1 = __webpack_require__(3);
const parser_1 = __webpack_require__(2);
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeys = event => {
            let swallowed_enter = this.typeahead_list !== null ? this.typeahead_list.handleKeys(event) : false;
            if (!swallowed_enter) {
                this.prompt.handleKeys(event);
            }
        };
        this.handleSubmit = () => {
            if (this.isCurrentlyValid()) {
                const output = this.state.world_driver.commit();
                this.setState({ world_driver: this.state.world_driver });
                this.history.commit_after_update = true;
                //this.history.commit();
                return true;
            }
            return false;
        };
        this.isCurrentlyValid = () => {
            let parser = this.currentParser();
            return parser.validity === parser_1.MatchValidity.valid && parser.is_done();
        };
        this.handlePromptChange = input => {
            let result = this.state.world_driver.apply_command(input, false);
            this.setState({
                world_driver: this.state.world_driver
            });
            this.history.edit_after_update = true;
            this.prompt.focus();
            let that = this;
            window.setTimeout(function () {
                that.scrollToPrompt();
            }, 0);
        };
        this.handleTypeaheadSelection = option => {
            let matched_tokens = this.currentParser().match.slice(0, this.currentTypeaheadIndex() + 1).map(elt => elt.match);
            let current_indentation = this.currentIndentation();
            if (current_indentation === '' && matched_tokens.length > 1) {
                current_indentation = ' ';
            }
            if (option !== false) {
                let new_last_token = current_indentation + option;
                matched_tokens[matched_tokens.length - 1] = new_last_token;
            }
            let new_command = ''.concat(...matched_tokens) + ' ';
            this.handlePromptChange(new_command);
            this.prompt.setState({ value: new_command });
        };
        this.currentParser = () => this.state.world_driver.current_state.parser;
        this.currentTypeaheadIndex = () => {
            let parser = this.currentParser();
            let typeahead_ind = parser.match.length - 1;
            let last_match = parser.match[typeahead_ind];
            if (parser.match.length > 1 && last_match.match === '') {
                typeahead_ind--;
            }
            return typeahead_ind;
        };
        this.currentTypeahead = () => {
            let parser = this.currentParser();
            let typeahead_ind = this.currentTypeaheadIndex();
            if (typeahead_ind === -1) {
                return [];
            }
            let typeahead = parser.match[typeahead_ind].typeahead;
            if (typeahead === undefined) {
                return [];
            }
            return typeahead;
        };
        this.currentIndentation = () => {
            let parser = this.currentParser();
            let typeahead_ind = this.currentTypeaheadIndex();
            if (typeahead_ind === -1) {
                return '';
            }
            return text_tools_1.get_indenting_whitespace(parser.match[typeahead_ind].match);
        };
        this.scrollToPrompt = () => {
            if (this.state.world_driver.history.length > 1) {
                this.prompt.input.scrollIntoView({ behavior: "smooth", block: "start", inline: "end" });
            }
        };
        this.state = { world_driver: this.props.world_driver };
    }
    componentDidMount() {
        this.prompt.focus();
    }
    componentDidUpdate() {}
    render() {
        return React.createElement("div", { className: "terminal", tabIndex: -1, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc }, React.createElement(History_1.History, { timeout: 700, onAnimationFinish: this.scrollToPrompt, history: this.state.world_driver.history, possible_history: this.state.world_driver.possible_history, ref: h => this.history = h }), React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Text_1.ParsedText, { parser: this.currentParser(), typeaheadIndex: this.currentTypeaheadIndex() }, React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

/*
    a parser thread takes a parser and uses it to consume some of a token stream,
    and returns some result

    a thread can *split* the current parser state into N branches,
    each of which consume their own things separately and return their own results
    the thread which initiated the split is also responsible for combining the various results
    before returning control to the thread.
        the most common scenario is that only one of N branches is still valid
    
    internally, the parser receives instructions from the parser thread and consumes
    pieces of the input token stream. it builds up a list of token match objects,
    where each token in the stream consumed so far gets a status of "matched", "partial", "error"

    by combining these token labellings from all the different parser threads that ran,
    we determine:
        - whether the currently-input string is valid and can be executed
        - what colors to highlight the various input words with
        - what to display beneath the input prompt as typeahead options




*/

Object.defineProperty(exports, "__esModule", { value: true });
const text_tools_1 = __webpack_require__(3);
class NoMatch extends Error {}
;
class ParseRestart extends Error {
    constructor(n_splits) {
        super();
        this.n_splits = n_splits;
    }
}
;
class ParseError extends Error {}
;
const SUBMIT_TOKEN = Symbol('SUBMIT');
class ConsumeSpec {
    constructor(token, token_type = { kind: 'Filler' }, typeahead_type = { kind: 'Available' }) {
        this.token = token;
        this.token_type = token_type;
        this.typeahead_type = typeahead_type;
        this.kind = 'ConsumeSpec';
    }
    static make(obj) {
        if (ConsumeSpec.is_token(obj)) {
            return new ConsumeSpec(obj);
        }
        return new ConsumeSpec(obj.token, obj.token_type, obj.typeahead_type);
    }
}
exports.ConsumeSpec = ConsumeSpec;
(function (ConsumeSpec) {
    ConsumeSpec.NEVER_TOKEN = Symbol('NEVER');
    function is_token(x) {
        return typeof x === 'string' || x === SUBMIT_TOKEN || x === ConsumeSpec.NEVER_TOKEN;
    }
    ConsumeSpec.is_token = is_token;
    function is_spec(x) {
        return !is_token(x);
    }
    ConsumeSpec.is_spec = is_spec;
})(ConsumeSpec = exports.ConsumeSpec || (exports.ConsumeSpec = {}));
var TokenMatch;
(function (TokenMatch) {
    function is_match(m) {
        return m.kind === 'Match';
    }
    TokenMatch.is_match = is_match;
    function is_partial(m) {
        return m.kind === 'Partial';
    }
    TokenMatch.is_partial = is_partial;
    function is_error(m) {
        return m.kind === 'Error';
    }
    TokenMatch.is_error = is_error;
})(TokenMatch = exports.TokenMatch || (exports.TokenMatch = {}));
function is_parse_result_valid(result) {
    return result.length === 0 || TokenMatch.is_match(array_last(result).type);
}
// for each of the input tokens, how should they be displayed/highighted?
function input_display(parse_results, input_stream) {
    // find the first submittable row
    // if none, find the first non-error row
    // if none, make everything error
    let row;
    let submittable = true;
    row = parse_results.find(row => {
        let last = array_last(row);
        return TokenMatch.is_partial(last.type) && last.type.token === SUBMIT_TOKEN;
    });
    if (row === undefined) {
        submittable = false;
        row = parse_results.find(row => row.every(({ type }) => !TokenMatch.is_error(type)));
    }
    if (row === undefined) {
        row = input_stream.map(tok => ({
            kind: 'TokenMatch',
            token: tok,
            type: {
                kind: 'Error',
                token: null
            }
        }));
    }
    return {
        kind: 'InputDisplay',
        matches: row,
        submittable
    };
}
/*
Typeahead

    For each non-valid row (ignoring errors, partial only)
    If the row is at least the length of the input stream
    Typeahead is the Partial TokenMatches suffix (always at the end)
*/
// for each row of typeahead to display, what are the tokens?
// will be positioned relative to the first input token.
function typeahead(parse_results, input_stream) {
    let rows_with_typeahead = parse_results.filter(pr => !TokenMatch.is_error(array_last(pr).type) && pr.slice(input_stream.length - 1).some(({ type }) => TokenMatch.is_partial(type)));
    return rows_with_typeahead.map(pr => {
        let start_idx = pr.findIndex(({ type }) => TokenMatch.is_partial(type));
        let result = Array(start_idx).fill(null);
        let elts = pr.slice(start_idx);
        result.push(...elts.map(tm => tm.type));
        return result;
    });
}
class Parser {
    constructor(input_stream, splits_to_take) {
        this.pos = 0;
        this.parse_result = [];
        this.input_stream = input_stream;
        this._split_iter = splits_to_take[Symbol.iterator]();
    }
    consume(tokens, result) {
        let specs = tokens.map(ConsumeSpec.make);
        this._consume(specs);
        if (result instanceof Function) {
            return result();
        }
        return result;
    }
    /*
        This will throw a parse exception if the desired tokens can't be consumed.
        It is expected that every ParserThread is wrapped in an exception handler for
        this case.
    */
    _consume(tokens) {
        if (!is_parse_result_valid(this.parse_result)) {
            throw new ParseError('Tried to consume() on a done parser.');
        }
        let partial = false;
        let error = false;
        let i = 0;
        // check if exact match
        for (i = 0; i < tokens.length; i++) {
            if (this.pos + i >= this.input_stream.length) {
                partial = true;
                break;
            }
            let spec = tokens[i];
            let spec_value = spec.token;
            let input = this.input_stream[this.pos + i];
            if (spec_value === input) {
                continue;
            }
            if (spec_value === ConsumeSpec.NEVER_TOKEN || spec_value === SUBMIT_TOKEN || input === SUBMIT_TOKEN) {
                // eliminate case where either token is SUBMIT_TOKEN (can't pass into starts_with() or spec is NEVER_TOKEN)
                error = true;
                break;
            }
            if (text_tools_1.starts_with(spec_value, input)) {
                if (this.pos + i < this.input_stream.length - 1) {
                    error = true;
                } else {
                    partial = true;
                }
                break;
            }
            error = true;
            break;
        }
        if (partial) {
            // push all tokens as partials
            this.parse_result.push(...tokens.map((t, j) => ({
                kind: 'TokenMatch',
                token: this.input_stream[this.pos + j] || '',
                type: {
                    kind: 'Partial',
                    token: t.token === ConsumeSpec.NEVER_TOKEN ? '' : t.token,
                    type: t.typeahead_type
                }
            })));
            // increment pos
            this.pos = this.input_stream.length;
            throw new NoMatch();
        }
        if (error) {
            // push all tokens as errors
            this.parse_result.push(...tokens.map((t, j) => ({
                kind: 'TokenMatch',
                token: this.input_stream[this.pos + j] || '',
                type: {
                    kind: 'Error',
                    token: t.token === ConsumeSpec.NEVER_TOKEN ? '' : t.token
                }
            })));
            // increment pos
            this.pos = this.input_stream.length;
            throw new NoMatch();
        }
        // push all tokens as valid
        this.parse_result.push(...tokens.map((t, j) => ({
            kind: 'TokenMatch',
            token: this.input_stream[this.pos + j],
            type: { kind: 'Match', type: t.token_type }
        })));
        // increment pos
        this.pos += tokens.length;
    }
    eliminate() {
        /*
            It is important that we not just throw NoMatch, and instead actully attempt to consume a never token.
        */
        this.consume([ConsumeSpec.NEVER_TOKEN]);
    }
    split(subthreads) {
        let { value: split_value, done } = this._split_iter.next();
        if (done) {
            throw new ParseRestart(subthreads.length);
        }
        let st = subthreads[split_value];
        return st(this);
    }
    static run_thread(t, tokens) {
        let frontier = [[]];
        let results = [];
        let parse_results = [];
        while (frontier.length > 0) {
            let path = frontier.pop();
            let splits_to_take;
            if (path.length === 0) {
                splits_to_take = path;
            } else {
                let n = array_last(path).next();
                if (n.done) {
                    continue;
                } else {
                    frontier.push(path);
                }
                splits_to_take = [...path.slice(0, -1), n.value];
            }
            let p = new Parser(tokens, splits_to_take);
            let result;
            try {
                result = t(p);
            } catch (e) {
                if (e instanceof NoMatch) {
                    result = e;
                } else if (e instanceof ParseRestart) {
                    let new_splits = [];
                    for (let i = 0; i < e.n_splits; i++) {
                        new_splits.push(i);
                    }
                    // TODO: decide whether to unshift() or push() here. Affects typeahead display order.
                    frontier.unshift([...splits_to_take, new_splits[Symbol.iterator]()]);
                    // frontier.push([...splits_to_take, new_splits[Symbol.iterator]()]);
                    continue;
                } else {
                    throw e;
                }
            }
            results.push(result);
            parse_results.push(p.parse_result);
        }
        let valid_results = results.filter(r => !(r instanceof NoMatch));
        if (valid_results.length === 0) {
            return [new NoMatch(), parse_results];
        }
        if (valid_results.length > 1) {
            throw new ParseError(`Ambiguous parse: ${valid_results.length} valid results found.`);
        }
        return [valid_results[0], parse_results];
    }
}
function array_last(arr) {
    return arr[arr.length - 1];
}
function test() {
    function main_thread(p) {
        p.consume([{ token: 'look', token_type: { kind: 'Keyword' } }]);
        let who = p.split([() => p.consume(['at', 'me'], 'me'), () => p.consume(['at', 'mewtwo'], 'mewtwo'), () => p.consume(['at', 'mewtwo', 'steve'], 'mewtwo steve'), () => p.consume(['at', 'steven'], () => 'steven'), () => p.consume(['at', 'martha'], 'martha'), () => {
            p.eliminate();
        }]);
        let how = p.split([() => p.consume([{ token: 'happily', typeahead_type: { kind: 'Locked' } }], 'happily'), () => p.consume(['sadly'], 'sadly'), () => 'neutrally']);
        p.consume([SUBMIT_TOKEN]);
        return `Looked at ${who} ${how}`;
    }
    let input = ['look', 'at', 'martha', SUBMIT_TOKEN];
    let [result, parses] = Parser.run_thread(main_thread, input);
    console.log(result);
    let id = input_display(parses, input);
    console.log(id);
    console.log(id.matches[0].type);
    let ta = typeahead(parses, input);
    console.log(ta);
    if (ta.length > 0) {
        console.log(array_last(ta[0]).type);
    }
    /*
        TODO
        Get rid of auto-option, it needs to be explicit
        Change types of typeahead to support different typeahead styles
            (new, old, locked)
       
        (Way Later) Write a tester that runs through every possible input for a given main_thread,
        to find runtime error states
            - ambiguous parses
            - any other exceptions thrown
    */
}
exports.test = test;
test();

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(6);
const Text_1 = __webpack_require__(7);
class BookGuy extends React.Component {
    /*
      BookGuy is a bad component that get's the danged job done.
         It encapsulates a single element of history in the game.
         When a css change to the history element is "committed" (via this.commit()),
      It triggers an idiosyncratic little animation progression that
      adds CSS classes in a certain order and dynamically sets
      the max-height on all elements contained by the history element
      so that they can grow or shrink smoothly by added css transitions on
      the max-height property.
         The particulars of the animation progress are currently undocumented because
      they are pretty bad and might change.
    */
    constructor(props) {
        super(props);
        this.state = {
            message_classes: [],
            adding_message_classes: [],
            removing_message_classes: [],
            entering: true
        };
    }
    edit(possible_message_classes, callback) {
        if (possible_message_classes === undefined) {
            possible_message_classes = [];
        }
        let edit_message_classes = [];
        let message_classes = this.state.message_classes;
        let removing_message_classes = [];
        for (let mc of message_classes) {
            if (possible_message_classes.indexOf(mc) === -1) {
                removing_message_classes.push(mc);
            }
        }
        let adding_message_classes = [];
        for (let pmc of possible_message_classes) {
            if (message_classes.indexOf(pmc) === -1) {
                adding_message_classes.push(pmc);
            }
        }
        this.setState({ removing_message_classes, adding_message_classes }, callback);
    }
    commit() {
        let adding_classes = this.state.adding_message_classes;
        let removing_classes = this.state.removing_message_classes;
        if (this.state.entering || adding_classes.length > 0 || removing_classes.length > 0) {
            let new_message_classes = [...this.state.message_classes];
            new_message_classes.push(...adding_classes);
            for (let rmc of removing_classes) {
                new_message_classes.splice(new_message_classes.indexOf(rmc), 1);
            }
            this.setState({
                message_classes: new_message_classes,
                adding_message_classes: [],
                removing_message_classes: []
            }, () => this.animate(adding_classes, removing_classes));
        }
    }
    animate(adding_classes = [], removing_classes = []) {
        function walkElt(elt, f) {
            let children = elt.children;
            for (let i = 0; i < children.length; i++) {
                let child = children.item(i);
                walkElt(child, f);
            }
            f(elt);
        }
        let comp_elt = ReactDom.findDOMNode(this);
        if (this.state.entering) {
            comp_elt.classList.add('animation-new');
            this.setState({ entering: false });
        }
        // Momentarily apply the animation-pre-compute class
        // to accurately measure the target maxHeight
        // and check for the custom --is-collapsing property
        // (This is basically an abomination and I am sorry.)
        comp_elt.classList.add('animation-pre-compute');
        walkElt(comp_elt, e => e.dataset.maxHeight = `${e.scrollHeight}px`);
        comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0;
        comp_elt.classList.remove('animation-pre-compute');
        let edit_classes = [...adding_classes.map(c => 'adding-' + c), ...removing_classes.map(c => 'removing-' + c)];
        comp_elt.classList.add('animation-start', ...edit_classes);
        // If --is-collapsing was set by the animation-pre-compute class,
        // then apply the maxHeight update at the end of this animation frame
        // rather than the beginning of the next one.
        // I have no idea why this works/is necessary, but it does/is.
        if (comp_elt.dataset.isCollapsing == 1) {
            walkElt(comp_elt, e => e.style.maxHeight = e.dataset.maxHeight);
        }
        requestAnimationFrame(() => {
            // If --is-collapsing wasn't set in the animation-pre-compute class,
            // then apply the maxHeight update now.
            // Websites technology keyboard mouse.
            if (comp_elt.dataset.isCollapsing != 1) {
                walkElt(comp_elt, e => e.style.maxHeight = e.dataset.maxHeight);
            }
            comp_elt.classList.add('animation-active');
            setTimeout(() => {
                comp_elt.classList.remove('animation-new', 'animation-start', 'animation-active', ...edit_classes);
                walkElt(comp_elt, e => e.style.maxHeight = '');
                if (this.props.onAnimationFinish) {
                    this.props.onAnimationFinish();
                }
            }, this.props.timeout);
        });
    }
    render() {
        let classList = ['history', ...this.state.message_classes];
        classList.push(...this.state.adding_message_classes.map(s => 'would-add-' + s));
        classList.push(...this.state.removing_message_classes.map(s => 'would-remove-' + s));
        let className = classList.join(' ');
        return React.createElement("div", { className: className }, this.props.children);
    }
}
exports.BookGuy = BookGuy;
class History extends React.Component {
    constructor(props) {
        super(props);
        this.book_guys = [];
        this.edit_after_update = false;
        this.commit_after_update = false;
    }
    edit() {
        this.props.history.forEach(hist => {
            let { parser, message, message_classes, index } = hist;
            let the_book_guy = this.book_guys[index];
            the_book_guy.edit(this.props.possible_history[index].message_classes);
        });
    }
    commit() {
        // edit the most recent element since that is how we pass in the new classes
        // and it hasn't had them passed in thru the most recent edit() call yet.
        let last_index = this.props.history.length - 1;
        let { message_classes } = this.props.history[last_index];
        let the_book_guy = this.book_guys[last_index];
        the_book_guy.edit(message_classes,
        // Once the edit has been accepted, call commit on all book guys.
        () => this.book_guys.forEach(bg => bg.commit()));
    }
    render() {
        return React.createElement("div", null, this.props.history.map(hist => {
            let msg_html = '';
            if (hist.message !== undefined) {
                msg_html = hist.message.innerHTML;
            }
            return React.createElement(BookGuy, { timeout: this.props.timeout, onAnimationFinish: this.props.onAnimationFinish, key: hist.index, ref: bg => this.book_guys[hist.index] = bg }, hist.index > 0 ? React.createElement(Text_1.ParsedText, { parser: hist.parser }) : '', React.createElement(Text_1.OutputText, { message_html: msg_html }));
        }));
    }
    componentDidUpdate() {
        if (this.edit_after_update) {
            this.edit();
            this.edit_after_update = false;
        }
        if (this.commit_after_update) {
            this.commit();
            this.commit_after_update = false;
        }
    }
}
exports.History = History;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __rest = this && this.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const keyboard_tools_1 = __webpack_require__(8);
const InputWrapper = props => {
    const { children } = props,
          rest = __rest(props, ["children"]);
    const style = {
        position: 'relative',
        minHeight: '8em',
        marginTop: '1em'
    };
    return React.createElement("div", Object.assign({ style: style }, rest), children);
};
const InputDisplay = props => {
    const { children } = props;
    const style = {
        wordWrap: 'break-word'
    };
    return React.createElement("span", { style: style }, children);
};
const Cursor = ({ onClick }) => {
    let style = {
        position: 'absolute'
    };
    return React.createElement("span", { className: "blinking-cursor", style: style, onClick: onClick }, String.fromCharCode(9608));
};
class Prompt extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { value: '', is_focused: false };
        this.handleSubmit = () => {
            let success = this.props.onSubmit();
            if (success) {
                this.setState({ value: '' });
            }
        };
        // when key down is called by auto complete see if we should just submit
        this.handleKeys = ({ keyCode }) => {
            if (keyCode === keyboard_tools_1.keys.enter) {
                this.handleSubmit();
            }
            this.setCursor(this.input, this.input.value.length);
        };
        this.handleChange = () => {
            const value = this.input.value;
            this.props.onChange(value);
            this.setState({ value: value });
        };
        this.focus = () => {
            this.input.focus();
            this.setState({ is_focused: true });
        };
        this.blur = () => {
            this.setState({ is_focused: false });
        };
        this.setCursor = (node, pos) => {
            node = typeof node === "string" ? document.getElementById(node) : node;
            if (!node) {
                return false;
            } else if (node.createTextRange) {
                var textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            } else if (node.setSelectionRange) {
                node.setSelectionRange(pos, pos);
                return true;
            }
            return false;
        };
    }
    render() {
        const input_style = {
            position: 'absolute',
            left: '-16px',
            top: 0,
            width: 0,
            height: 0,
            background: 'transparent',
            border: 'none',
            color: 'transparent',
            outline: 'none',
            padding: 0,
            resize: 'none',
            zIndex: -1,
            overflow: 'hidden'
        };
        return React.createElement(InputWrapper, { onClick: () => this.focus(), onBlur: () => this.blur() }, React.createElement("input", { onChange: this.handleChange, value: this.state.value, style: input_style, ref: i => this.input = i }), React.createElement(InputDisplay, null, this.props.children, this.state.is_focused ? React.createElement(Cursor, { onClick: () => this.handleSubmit() }) : ''));
    }
}
exports.Prompt = Prompt;

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const keyboard_tools_1 = __webpack_require__(8);
const datatypes_1 = __webpack_require__(1);
class TypeaheadList extends React.Component {
    constructor(props) {
        super(props);
        this.state = { selection_index: -1 };
    }
    componentDidUpdate() {
        if (this.state.selection_index >= this.props.typeahead.length) {
            this.setState({ selection_index: this.props.typeahead.length - 1 });
        }
    }
    handleClick(option) {
        this.props.onTypeaheadSelection(option);
    }
    handleMouseOver(index) {
        this.setState({ selection_index: index });
    }
    handleKeys(event) {
        let swallowed_enter = false;
        top: switch (event.keyCode) {
            case keyboard_tools_1.keys.enter:
                if (this.props.typeahead.length > 0) {
                    swallowed_enter = true;
                }
            case keyboard_tools_1.keys.tab:
                event.preventDefault();
            case keyboard_tools_1.keys.right:
                if (this.props.typeahead.length === 0) {
                    this.props.onTypeaheadSelection(false);
                    break;
                }
                let selected = this.state.selection_index === -1 ? this.props.typeahead[0] : this.props.typeahead[this.state.selection_index];
                if (datatypes_1.is_enabled(selected)) {
                    this.props.onTypeaheadSelection(datatypes_1.unwrap(selected));
                }
                break;
            case keyboard_tools_1.keys.up:
            case keyboard_tools_1.keys.down:
                let new_selection_index;
                switch (event.keyCode) {
                    case keyboard_tools_1.keys.up:
                        if (this.state.selection_index === -1) {
                            break top;
                        }
                        new_selection_index = this.state.selection_index - 1;
                        break;
                    case keyboard_tools_1.keys.down:
                        if (this.state.selection_index === this.props.typeahead.length - 1) {
                            break top;
                        }
                        new_selection_index = this.state.selection_index + 1;
                        break;
                }
                this.setState({ selection_index: new_selection_index });
                break;
        }
        return swallowed_enter;
    }
    render() {
        const { typeahead, indentation } = this.props;
        const style = {
            position: "absolute",
            listStyleType: "none",
            padding: 0,
            margin: 0,
            whiteSpace: 'pre',
            color: 'silver'
        };
        return React.createElement("ul", { style: style }, typeahead.map((option, i) => React.createElement("li", Object.assign({ key: i.toString(), onMouseOver: () => this.handleMouseOver(i), style: {
                marginTop: '1em',
                background: i === this.state.selection_index ? 'DimGray' : 'inherit',
                opacity: datatypes_1.is_enabled(option) ? 1.0 : 0.4
            } }, datatypes_1.is_enabled(option) ? { onClick: () => this.handleClick(datatypes_1.unwrap(option)) } : {}), React.createElement("span", null, indentation), React.createElement("span", null, datatypes_1.unwrap(option)))));
    }
}
exports.TypeaheadList = TypeaheadList;

/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const parser2_1 = __webpack_require__(10);
parser2_1.test;
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(6);
const Terminal_1 = __webpack_require__(9);
const commands_1 = __webpack_require__(4);
const venience_world_1 = __webpack_require__(5);
let start = {};
// start.experiences = ['grass, asking 2'];
//start.experiences = ['alcove, entering the forest']; 
// start.experiences = ['woods, ending interpretation'];
// start.experiences = ['bed, sitting up 2'];
// start.experiences = ['woods, crossing the boundary 2'];
// start.experiences = ['woods, clearing'];
// start.has_regarded = {'tangle, 3': true};
// start.has_understood = {'tangle, 3': true};
let world_driver = new commands_1.WorldDriver(new venience_world_1.VenienceWorld(start));
ReactDom.render(React.createElement(Terminal_1.Terminal, { world_driver: world_driver }), document.getElementById('terminal'));

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const venience_world_1 = __webpack_require__(5);
const text_tools_1 = __webpack_require__(3);
const datatypes_1 = __webpack_require__(1);
const parser_1 = __webpack_require__(2);
let hex_oms = () => [{
    id: "imagining 0",
    enter_message: '',
    transitions: [[['who', 'am', 'I?'], 'imagining 1']]
}, {
    id: "imagining 1",
    enter_message: `
        <div class="interp">
            That doesn't matter right now.
            <br/><br/>
            Imagine you're Chitin Wastrel.
        </div>`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        let make_regard_handler = perceptions => {
            return venience_world_1.wrap_handler(function* (parser) {
                let option = yield parser.consume_option(perceptions.map(p => datatypes_1.annotate(text_tools_1.tokenize(p)[0], {
                    enabled: !this.state.has_regarded[p],
                    display: parser_1.DisplayEltType.filler
                })));
                console.log(option);
                return this.regard(option);
            });
        };
        let intro_perceptions = ['myself', 'merfolk', 'family', 'researcher'];
        let intro_consumer = make_regard_handler(intro_perceptions);
        let research_perceptions = ['dark pool', 'failed experiments', 'experiment'];
        let research_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (!this.state.has_regarded['researcher']) {
                return parser.invalidate();
            }
            return make_regard_handler(research_perceptions).call(this, parser);
        });
        let broadcaster_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (!this.state.has_regarded['experiment']) {
                return parser.invalidate();
            }
            let broadcaster_regarder = make_regard_handler(['broadcaster']);
            let do_broadcast = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_filler(['operate', 'broadcaster']);
                return this.transition_to('imagining 2');
            });
            return parser_1.combine.call(this, parser, [broadcaster_regarder, do_broadcast]);
        });
        return parser_1.combine.call(this, parser, [intro_consumer, research_consumer, broadcaster_consumer]);
    }),
    dest_oms: ["imagining 2"]
}, {
    id: 'imagining 2',
    enter_message: `
        You mentally aim your cetacean broadcaster at the center of the Dark Pool, and fire a ping.
        <br/><br/>
        You hear the dolphin's click, first through its eardrums, and then, a split second later, through yours.`,
    transitions: [[['listen for echoes'], 'imagining 3']]
}, {
    id: 'imagining 3',
    enter_message: `
        You wait one second, three seconds, ten, twenty...
        <br/><br/>
        ...nothing.
        <br/><br/>
        Does the Dark Pool absorb sound too? Or is it just enormous within its depths?`,
    transitions: [[['focus'], 'imagining 4']]
}, {
    id: 'imagining 4',
    enter_message: `
        You close your eyes and inhabit the mind of your broadcaster.
        <br/><br/>
        You hear something.
        <br/><br/>
        It's impossible, though. A <i>voice</i> is speaking to you.
        <br/><br/>
        <div class="interp">
            "Ah, I see you're playing Mad Scientist again, eh?
            <br/><br/>
            That's a fun one."
        </div>
        `,
    transitions: [[['what?'], 'imagining 5']]
}, {
    id: 'imagining 5',
    enter_message: `
        <div class="interp">
            "Oh, I'm sorry. Did I surprise you?
            <br/><br/>
            Listen, <i>Professor Wastrel</i>. Let me give you some advice.
            <br/><br/>
            Go home. Now.
            <br/><br/>
            And leave me your little lobotomized toy to play with."
        </div>
        <br/>
        You feel yourself suddenly forced out of the mind of your broadcaster.
        <br/><br/>
        The dolphin drifts slowly downward, into the Dark Pool, until its body is enveloped.`,
    transitions: [[['go', 'home'], 'home 1']]
}, {
    id: 'home 1',
    enter_message: `
        The fear pushes you to swim faster than Poseides herself.
        <br/><br/>
        ***
        <br/><br/>
        You sit in your island hut, ruminating. Afraid of what you've just witnessed.
        <br/><br/>
        Dasani and Aechtuo enter, shouting at each other like always.
        <br/><br/>
        Such rage seethes within them. Such spirit.`,
    transitions: [[['&silence', '&them'], 'home silenced'], [['&listen', '&to', '&them'], 'home listened']]
}, {
    id: 'home silenced',
    enter_message: `
        They are suddenly silent.
        <br/><br/>
        Their faces go blank.
        <br/><br/>
        They turn to look at you.
        <br/><br/>
        You can hear the faint sound of laughter somewhere outside.`,
    transitions: [[['follow', 'the', 'laughter'], 'outside 1']]
}, {
    id: 'home listened',
    enter_message: `
        The girls are arguing about Officer Marley.
        <br/><br/>
        Apparently she's not acting like herself.
        <br/><br/>
        You can hear the faint sound of laughter somewhere outside.`,
    transitions: [[['follow', 'the', 'laughter'], 'outside 1']]
}, {
    id: 'outside 1',
    enter_message: `Dasani and Aechtuo begin to follow you as you wander out the door toward the laughter.`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        let option = yield parser.consume_option([['they', 'can', 'come'], ['they', 'must', 'stay']]);
        let with_daughters;
        let message;
        if (option === 'they can come') {
            with_daughters = true;
            message = 'They fall into step behind you.';
        } else {
            with_daughters = false;
            message = 'They remain in the hut, gazing after you in silence.';
        }
        message += `
            <br/><br/>
            The laughter grows more raucous as you approach.
            <br/><br/>
            You can make out a figure in the distance.`;
        return this.transition_to('outside 2', { with_daughters }, text_tools_1.wrap_in_div(message));
    }),
    dest_oms: ['outside 2']
}, {
    id: 'outside 2',
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        yield parser.consume_filler(['continue']);
        let with_daughters = this.get_current_om_state().with_daughters;
        let message = `
            It's Officer Marley. She howls in apparent maniacal joy.`;
        if (with_daughters) {
            message += `
                <br/><br/>
                "Ah, the three Wastrels!" she cries.
                <br/><br/>
                "Two hateful girls and their poor, obsessive, withdrawn father!"`;
        } else {
            message += `
                <br/><br/>
                "Ah, the distinguished Professor Wastrel!" she cries.
                <br/><br/>
                "Has the fool finally decided to come and see where his studies have gotten him?"`;
        }
        message += `
            <br/><br/>
            You notice an open wound on Officer Marley's neck.
            <br/><br/>
            Trickling forth is a pitch dark fluid, nothing like Mer blood.
            <br/><br/>
            You notice a trail of the black liquid along the ground, leading from Officer Marley back to the sea,
            <br/><br/>
            and towards the Dark Pool.`;
        return this.transition_to('outside 3', { with_daughters }, text_tools_1.wrap_in_div(message));
    }),
    dest_oms: ['outside 3']
}, {
    id: 'outside 3',
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        yield parser.consume_filler(['follow', 'the', 'trail']);
        let with_daughters = this.get_current_om_state().with_daughters;
        if (with_daughters) {
            return this.transition_to('outside 4');
        } else {
            return this.transition_to('outside 4, death');
        }
    }),
    dest_oms: ['outside 4', 'outside 4, death']
}, {
    id: 'outside 4, death',
    enter_message: `
        As you begin to wander towards the sea, Officer Marley steps in your way.
        <br/><br/>
        "Going back? To figure all this out once and for all?
        <br/><br/>
        I think not!"
        <br/><br/>
        She draws her sword and cuts your throat, laughing all the while.
        <br/><br/>
        Pitch black not-blood streams from neck, mouth, nose, eyes.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
    transitions: []
}, {
    id: 'outside 4',
    enter_message: `
        As you begin to wander towards the sea, Officer Marley steps in your way.
        <br/><br/>
        "Going back? To figure all this out once and for all?
        <br/><br/>
        I think not!"
        <br/><br/>
        She draws her sword, and Dasani lunges in front of you, drawing a knife.
        <br/><br/>
        "I'll protect you, father!" Dasani screams.`,
    transitions: [[['&stop', '&her'], 'outside 5, death'], [['&let', '&her'], 'outside 5']]
}, {
    id: 'outside 5',
    enter_message: `
        Your daughter and Officer Marley meet in a blur of green flesh and steel.
        <br/><br/>
        An instant later, they both lie in a heap on the ground. Dead.
        <br/><br/>
        "Father," mutters Aechtuo. "We have to go. We have to understand.
        <br/><br/>
        She saved you so that you could understand."`,
    transitions: [[['proceed'], 'dark pool 1']]
}, {
    id: 'outside 5, death',
    enter_message: `
        Your daughter's body is suddenly calm, the rage suddenly extinguished.
        <br/><br/>
        She drops her knife and turns away from Officer Marley.
        <br/><br/>
        She gazes at you. Her eyes appear vacant.
        <br/><br/>
        Officer Marley loses no time.
        <br/><br/>
        She swiftly beheads Dasani before your eyes.
        <br/><br/>
        She proceeds to execute Aechtuo and you in turn.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
    transitions: []
}, {
    id: 'dark pool 1',
    enter_message: `
        You and Aechtuo swim to the cave, arriving at the Dark Pool.
        <br/><br/>
        There it lies. Impassable, impossible, all-consuming.
        <br/><br/>
        <div class="interp">
            "Back again, eh?
            <br/><br/>
            And with your beloved daughter in tow?
            <br/><br/>
            What happened to the other one?
            <br/><br/>
            I always liked her better."
        </div>
        <br/>
        That voice again? It's time. Time to understand.
        <br/><br/>
        What lies within the depths?`,
    transitions: [[['enter', 'the', 'Dark', 'Pool'], 'dark pool 2']]
}, {
    id: 'dark pool 2',
    enter_message: `
        As you swim towards the pool's black surface, a form emerges from its depths, shrouded in black clouds.
        <br/><br/>
        <div class="interp">
            "Remember your little toy?
            <br/><br/>
            Your little broadcaster?
            <br/><br/>
            I couldn't resist having some fun with it.
            <br/><br/>
            I think you'll like my improvements."
        </div>`,
    transitions: [[['look', 'at', 'it'], 'dark pool 3']]
}, {
    id: 'dark pool 3',
    enter_message: `  
        It's your dolphin. Or, it was.
        <br/><br/>
        Its body is contorted into a spiral shape,
        <br/><br/>
        its fins bulge and bend unnaturally, like powerful arms,
        <br/><br/>
        its blowhole has been widened out,
        <br/><br/>
        allowing the brain to float gently outside the skull,
        <br/><br/>
        tethered by the pulsating brainstem,
        <br/><br/>
        like a fishing buoy.`,
    transitions: [[['listen', 'through', 'it'], 'dark pool 4']]
}, {
    id: 'dark pool 4',
    enter_message: ` 
        And suddenly, you are in its mind again
        <br/><br/>
        and you are consumed by the sound of every
        <br/><br/>
        eddy and every grain of sand and every
        <br/><br/>
        beating animal heart in this cave
        <br/><br/>
        and your daughter aechtuo is
        <br/><br/>
        swimming towards you
        <br/><br/>
        r dolphin and she is strangling
        <br/><br/>
        it by the brain
        <br/><br/>
        stem and you really want to`,
    transitions: [[['&stop', '&her'], 'dark pool 5, death'], [['&let', '&her'], 'dark pool 5']]
}, {
    id: 'dark pool 5, death',
    enter_message: `
        so of course she stops
        <br/><br/>
        and the dolphin gathers her up in
        <br/><br/>
        your arms and bites her in
        <br/><br/>
        half
        <br/><br/>
        and the sound rings out more clearly
        <br/><br/>
        in your mind than anything you have ever known
        <br/><br/>
        and you are nothing after that.
        <br/><br/>
        YOU HAVE DIED. (Refresh to try again.)`,
    transitions: []
}, {
    id: 'dark pool 5',
    enter_message: `
        so of course she continues
        <br/><br/>
        and the sound begins to dissipate
        <br/><br/>
        and your thoughts are a bit more coherent than before
        <br/><br/>
        and you find you can return to your own mind.
        <br/><br/>
        But as you look through your own eyes again,
        <br/><br/>
        you see that Aechtuo and the dolphin have drifted into the Dark Pool.
        <br/><br/>
        And now she is gone.`,
    transitions: [[['follow', 'her'], 'dark pool 6']]
}, {
    id: 'dark pool 6',
    enter_message: `
        You drift into the thick, black liquid,
        <br/><br/>
        becoming nothing.
        <br/><br/>
        <div class="interp">
            I knew I couldn't keep you here forever.
            <br/><br/>
            I'm glad we got to play together, for awhile.
            <br/><br/>
            If you see the real Chitin Wastrel,
            <br/><br/>
            tell him I said Hi,
            <br/><br/>
            and that I'll be right here
            <br/><br/>
            waiting.
        </div>
        <br/>
        YOU WIN.`,
    transitions: []
}];
let hex_perceptions = () => [{
    id: 'myself',
    content: `
        Merfolk. Father. Researcher.`
}, {
    id: 'merfolk',
    content: `
        Dark semi-firm scales coat your green flesh.
        <br/><br/>
        Your people are born of the sea. Vast, fluid, salty life.`
}, {
    id: 'family',
    content: `
        Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit.
        <br/><br/>
        And always at odds with each other, always fighting each other.
        <br/><br/>
        You wish they would work together, help each other.`
}, {
    id: 'researcher',
    content: `
        You are finishing up your experiment for the day at the Dark Pool.`
}, {
    id: 'dark pool',
    content: `
        A very strange phenomenon indeed. The Dark Pool is an underwater pool of dark- something.
        <br/><br/>
        Discovered within an underwater cave near your island home, it is a layer of thick, black fluid resting beneath the clear seawater.
        <br/><br/>
        The constitution of the dark substance is unknown, but by now it is recognized by your village to be dangerous.`
}, {
    id: 'failed experiments',
    content: `
        You have been trying to measure the Dark Pool's true depth.
        <br/><br/>
        All previous attempts to insert measuring devices into it have been unsuccessful.
        <br/><br/>
        In every case, the object submerged in the pool could not be retrieved.
        <br/><br/>
        Trained animals, and even some brave merfolk sent in after your instruments have never returned.`
}, {
    id: 'experiment',
    content: `
        Today's experiment is different. Today you are attempting to induce the pool to <i>tell</i> you its depth.
        <br/><br/>
        By asking it the right question, and listening carefully.
        <br/><br/>
        You have developed a broadcaster for just this purpose.`
}, {
    id: 'broadcaster',
    content: `
        A surprisingly simple application of mind control, of your own design.
        <br/><br/>
        First, find and trap a young dolphin. Make it your mindslave.
        <br/><br/>
        With some practice, you can psychically manipulate the dolphin's vocal chords to emit sonar pings.
        <br/><br/>
        Interpretting the resulting echoes is easier if you let the dolphin's inner ear and brain do the work.
        <br/><br/>
        You found that surgical removal of extraneous brain matter helps clean up the signal coming through the mindlink.
        <br/><br/>
        Ingenious, really.`
}];
/*

Imagine you're Chitin Wastrel

> myself
Merfolk. Father. Researcher. And something else.

> merfolk
Dark semi-firm scales coat your green flesh.

Your people are born of the sea. Vast, fluid, salty life.

> father
Two brilliant daughters. Dasani and Aechtuo. Sharing their mother's spirit. And always at odds with each other.

> researcher
You are finishing up your experiment for the day on the Dark Pool.

[It is a pool of pitch black fluid within a submerged cave. Like a brine pool. Those who have entered did not return.]
[A voice emits from the pool. It tells you that you are not really Chitin Wastrel anymore.]

[Returning home, Dasani and Aechtuo are bickering about Officer Marley acting strange.]
[If you tell them to stop fighting, they do so immediately, uncharacteristically.]

[Laughter (Officer Marley) is heard in the distance.]

[You leave the house to find her.]
[Daughters make to follow you, you can prevent them or not.]

[The island birds seem to suddenly startle and take flight.]
[You can make them calm and land again.]

[Marley has an open wound, continues to laugh. Instead of blood, pure black fluid flows from it.]
[A trail of black fluid leads from Marley out to the sea, towards the Dark Pool.]

[Marley vomits up black muck, which begins to take shape and move.]
[If you allowed daughters to come, Dasani stays to hold back Marley.]

[You (and Aechtuo) follow the black trail to the Dark Pool.]

[The booming voice speaks again: "You cannot save them. It is too late. This dream is already mine."]

[If Aechtuo is here: "Father, what should I do?"]

[If "Stay back": You attempt to approach the Dark Pool. A giant fish emerges from it first, and eats you.]
[If "Kill it": Aechtuo's eyes go dark and vacant. "Yes, lord." A giant fish emerges from the pool, and eats Aechtuo. She cuts her way out of its belly with a knife.]
    [You swim towards the pool.]
    ["Look at what you did to them. Look at what you made them do."]
    [You enter the pool, and it envelopes you, and the dream fades, and you are nowhere.]

*/
exports.default = {
    observer_moments: hex_oms,
    perceptions: hex_perceptions
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
const parser_1 = __webpack_require__(2);
const ObserverMomentIDs = datatypes_1.infer_literal_array('imagining 0', 'imagining 1', 'imagining 2', 'imagining 3', 'imagining 4', 'imagining 5', 'home 1', 'home silenced', 'home listened', 'outside 1', 'outside 2', 'outside 3', 'outside 4', 'outside 4, death', 'outside 5', 'outside 5, death', 'dark pool 1', 'dark pool 2', 'dark pool 3', 'dark pool 4', 'dark pool 5', 'dark pool 5, death', 'dark pool 6');
const PerceptionIDs = datatypes_1.infer_literal_array('myself', 'merfolk', 'family', 'researcher', 'dark pool', 'failed experiments', 'experiment', 'broadcaster');
const ContentionIDs = datatypes_1.infer_literal_array(
// ch1
'tangle, 1', 'tangle, 2', 'tangle, 3', 'tangle, failure');
function are_transitions_declarative(t) {
    return t.transitions !== undefined;
}
exports.are_transitions_declarative = are_transitions_declarative;
function has_interpretations(i) {
    return i.interpretations !== undefined || i.interpret_history !== undefined;
}
exports.has_interpretations = has_interpretations;
function are_interpretations_declarative(i) {
    return i.interpretations !== undefined;
}
exports.are_interpretations_declarative = are_interpretations_declarative;
// export type Recitation = {
//     id: RecitationID,
//     contents: string[]
// }
function index_oms(oms) {
    // let result = new FuckDict<ObserverMomentID, ObserverMoment>();
    let result = {};
    for (let om of oms) {
        if (are_transitions_declarative(om)) {
            for (let [cmd, dest] of om.transitions) {
                for (let phrase of cmd) {
                    if (!parser_1.PhraseDSLValidator.validate(phrase)) {
                        throw `Transition phrase "${phrase}" in ObserverMoment ${om.id} has ~ or * or & somewhere other than the start.`;
                    }
                }
            }
        }
        if (om.id in result) {
            throw `Duplicate ObserverMoment provided for ${om.id}`;
        }
        if (typeof om.id === 'string') {
            result[om.id] = om;
        } else {
            for (let om_id of om.id) {
                result[om_id] = om;
            }
        }
    }
    for (let om_id of ObserverMomentIDs) {
        if (!(om_id in result)) {
            throw `Missing ObserverMoment: ${om_id}`;
        }
    }
    //second/third pass, typecheck em
    let pointed_to = new Set();
    for (let om of oms) {
        let dest_oms;
        if (are_transitions_declarative(om)) {
            dest_oms = om.transitions.map(([cmd, om_id]) => om_id);
        } else {
            dest_oms = om.dest_oms;
        }
        for (let om_id of dest_oms) {
            if (om_id !== null) {
                if (!(om_id in result)) {
                    throw `om "${om.id}" has transition to non-existant om "${om_id}"`;
                }
                pointed_to.add(om_id);
            }
        }
    }
    for (let om of oms.slice(1)) {
        let om_ids;
        if (typeof om.id === 'string') {
            om_ids = [om.id];
        } else {
            om_ids = om.id;
        }
        for (let om_id of om_ids) {
            if (!pointed_to.has(om_id)) {
                throw `om "${om.id}" is unreachable (and not the first in the list).`;
            }
        }
    }
    return result;
}
exports.index_oms = index_oms;
function index_perceptions(perceptions) {
    let result = {};
    for (let p of perceptions) {
        if (!(p.id in result)) {
            result[p.id] = p;
        } else {
            throw `Duplicate perception definition for ${p.id}`;
        }
    }
    for (let p of PerceptionIDs) {
        if (!(p in result)) {
            throw `Missing PerceptionID: ${p}`;
        }
    }
    return result;
}
exports.index_perceptions = index_perceptions;
// Syntax shortcuts:
// * = keyword
// & = option
// export let tower_oms = index_oms([
//     {
//         id: 'base, from path',
//         enter_message: `<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>
//         <br /><br />
//         The viewing tower sits twenty feet inset from the footpath, towards the Mystic River.
//         The grass leading out to it is brown with wear.`,
//         transitions: [
//             [['approach', 'the viewing tower'], 'base, regarding tower']]
//     },
//     {
//         id: 'base, regarding tower',
//         enter_message: `The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.
//             <br /><br />
//             A wooden stairway set between the first two rows of columns leads upward.`,
//         transitions: [
//             [['climb', 'the stairs'], 'stairs 1, ascending']]
//     },
//     {
//         id: 'stairs 1, ascending',
//         enter_message: `As you ascend, the ground below you recedes.
//             <br /><br />
//             <div class="meditation-1">
//                 You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:
//                 <br /><br />
//                 "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
//                 <br /> <br />
//             </div>
//             The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
//         transitions: [
//             [['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'],
//             [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
//     },
//     {
//         id: 'platform 1, ascending',
//         enter_message: `You catch glimpses of the grass, trees, and the Mystic River as you make your way across.
//             <br /><br />
//             <div class="meditation-1">
//             You continue reading:
//             <br /><br />
//             "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
//             <br /><br />
//             </div>
//             The platform terminates, and another wooden stairway to the left leads further up the tower.`,
//         transitions: [
//             [['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
//     },
//     {
//         id: 'stairs 2, ascending',
//         enter_message: `They feel solid under your feet, dull thuds sounding with each step.
//             <br /><br />
//             <div class="meditation-1">
//             "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
//             <br /><br />
//             </div>
//             The stairs terminate in another left-branching platform.`,
//         transitions: [
//             [['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'],
//             [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
//     },
//     {
//         id: 'platform 2, ascending',
//         enter_message: `You make your way across the weathered wood.
//             <br /><br />
//             <div class="meditation-1">
//             "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
//             <br /><br />
//             </div>
//             A final wooden stairway to the left leads up to the top of the tower.`,
//         transitions: [
//             [['turn', 'left', 'and climb the stairs'], 'top, arriving'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
//     },
//     {
//         id: 'top, arriving',
//         enter_message: `You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
//         transitions: [
//             [['survey', 'the area'], 'top, surveying'],
//             [['descend', 'the stairs'], 'platform 2, ascending']]
//     },
//     {
//         id: 'top, surveying',
//         enter_message: `You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
//             <br /><br />
//             You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
//             <br /><br />
//             You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
//             <br /><br />
//             <div class="meditation-1">
//             "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
//             </div>`,
//         transitions: [
//             [['descend', 'the stairs'], 'stairs 3, descending']]
//     },
//     {
//         id: 'stairs 3, descending',
//         enter_message: `Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.
//             <br /><br />
//             <div class="meditation-1">
//             "Do not fret, my dear. Return to the madness of life after your brief respite."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'],
//             [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
//     },
//     {
//         id: 'platform 2, descending',
//         enter_message: `The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.
//             <div class="meditation-1">
//             <br /><br />
//             "Expect to forget; to be turned around; to become tangled up."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
//     },
//     {
//         id: 'stairs 2, descending',
//         enter_message: `The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.
//             <div class="meditation-1">
//             <br /><br />
//             "Find some joy in it; some exhilaration."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'],
//             [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
//     },
//     {
//         id: 'platform 1, descending',
//         enter_message: `You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.
//             <div class="meditation-1">
//             <br /><br />
//             "And know that you have changed, dear. That your ascent has taught you something."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and descend the stairs'], 'base, regarding path'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
//     },
//     {
//         id: 'base, regarding path',
//         enter_message: `What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?
//             <br /><br />
//             <i>(End of demo. Thanks for playing!)</i>`,
//         transitions: []
//     }
// ]);

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map