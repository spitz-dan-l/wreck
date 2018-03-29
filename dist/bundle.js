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
const text_tools_1 = __webpack_require__(3);
const datatypes_1 = __webpack_require__(2);
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
/* 2 */
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
const commands_1 = __webpack_require__(5);
const parser_1 = __webpack_require__(1);
const datatypes_1 = __webpack_require__(2);
const text_tools_1 = __webpack_require__(3);
const observer_moments_1 = __webpack_require__(17);
const _00_prologue_1 = __webpack_require__(15);
const _01_chapter_1_1 = __webpack_require__(16);
exports.wrap_handler = handler => function (parser) {
    return parser_1.with_early_stopping(handler.bind(this))(parser);
};
class VenienceWorld extends commands_1.World {
    constructor({ experiences, history_index, om_state, has_regarded, has_understood }) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1'];
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
        super({ experiences, history_index, om_state, has_regarded, has_understood });
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
            history_index: this.state.history_index + 1
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
                let msg = VenienceWorld.observer_moments[dest].enter_message;
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
        if (this.state.experiences.length > 0) {
            let loop_idx = this.state.experiences.indexOf(this.current_om());
            if (loop_idx !== this.state.experiences.length - 1) {
                let new_experiences = this.state.experiences.slice().fill(null, loop_idx + 1);
                world_update.experiences = new_experiences;
            }
        }
        if (Object.keys(world_update).length > 0) {
            result.world = this.update(world_update);
        }
        return result;
    }
    interpret_history(history_elt) {
        // apply loop erasure mechanic
        if (this.state.experiences[history_elt.world.state.history_index] === null) {
            return [{ 'add': 'forgotten' }];
        }
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
VenienceWorld.observer_moments = observer_moments_1.index_oms([..._00_prologue_1.default.observer_moments(), ..._01_chapter_1_1.default.observer_moments()]);
VenienceWorld.perceptions = observer_moments_1.index_perceptions([..._00_prologue_1.default.perceptions(), ..._01_chapter_1_1.default.perceptions()]);
exports.VenienceWorld = VenienceWorld;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(2);
const parser_1 = __webpack_require__(1);
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
/* 6 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const parser_1 = __webpack_require__(1);
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
    const elt_style = {};
    const span_style = {};
    return React.createElement("div", { className: "parsed-text", style: {} }, React.createElement(exports.Carat, null), React.createElement("div", { style: style }, parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')), i === typeaheadIndex ? children : ''))));
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
const Preface_1 = __webpack_require__(11);
const Prompt_1 = __webpack_require__(12);
const Text_1 = __webpack_require__(7);
const TypeaheadList_1 = __webpack_require__(13);
const History_1 = __webpack_require__(10);
const text_tools_1 = __webpack_require__(3);
const parser_1 = __webpack_require__(1);
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
            //this.history.edit();
            this.prompt.focus();
            //this.scrollToPrompt();
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
            let new_last_token = current_indentation + option;
            matched_tokens[matched_tokens.length - 1] = new_last_token;
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
        return React.createElement("div", { className: "terminal", tabIndex: -1, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc }, React.createElement(Preface_1.Preface, { on_start_game: () => this.prompt.focus() }), React.createElement(History_1.History, { timeout: 700, onAnimationFinish: this.scrollToPrompt, history: this.state.world_driver.history, possible_history: this.state.world_driver.possible_history, ref: h => this.history = h }), React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Text_1.ParsedText, { parser: this.currentParser(), typeaheadIndex: this.currentTypeaheadIndex() }, React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 10 */
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
    edit(possible_message_classes) {
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
        this.setState({ removing_message_classes, adding_message_classes });
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
        this.book_guys.forEach(bg => bg.commit());
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
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
class Preface extends React.Component {
    constructor() {
        super(...arguments);
        this.start_game = () => {
            this.div.style.display = 'none';
            this.props.on_start_game();
        };
    }
    render() {
        return React.createElement("div", { className: "preface", ref: d => this.div = d }, React.createElement("h1", { onClick: this.start_game }, React.createElement("a", { href: '#' }, "Start Venience World")), React.createElement("h3", null, "Welcome to Venience World!"), React.createElement("br", null), React.createElement("br", null), React.createElement("section", null, React.createElement("h3", null, "How to play"), "Venience World is an incomplete game that uses a new kind of parser interface.", React.createElement("br", null), React.createElement("br", null), "Use tab, enter, the arrow keys or the mouse to select autocompletions of your commands as you play.", React.createElement("br", null), React.createElement("br", null), "Play time is about 10 to 20 minutes. I hope you enjoy playing!", React.createElement("br", null), React.createElement("br", null), React.createElement("strong", null, "Warning:"), " Currently there is ", React.createElement("i", null, "no way to save or load"), " your game. If you need to take a break, leave Venience World open in a tab. Save/Load will be added in a future release.", React.createElement("br", null), React.createElement("br", null), "To get started now, click the Start Venience World button up top.", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "Replaying"), "Venience World is designed to make all content accessible in a single playthrough.", React.createElement("br", null), React.createElement("br", null), "This means you will ", React.createElement("i", null, "never be expected"), " to reset the game and repeat yourself in order to explore a missed branch.", React.createElement("br", null), React.createElement("br", null), "Have faith in this as you play through the game. Replaying a game is often worthwhile; in this case, just know it is ", React.createElement("i", null, "not required"), " to get the full experience.", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "Browser compatibility"), "Venience World has been tested to work on the Chrome and Firefox browsers.", React.createElement("br", null), React.createElement("br", null), "It definitely doesn't work on Safari.", React.createElement("br", null), React.createElement("br", null), "I haven't tested it on IE/Edge, Opera, or others.", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "Development progress"), "This is a playable demo with a prologue and partial first chapter with no puzzle elements.", React.createElement("br", null), React.createElement("br", null), "The final release will complete the story and contain mild puzzle elements surrounding the interpretation of aphorisms.", React.createElement("br", null), React.createElement("br", null), "Most of what you see will be subject to change for the final release.", React.createElement("br", null), React.createElement("br", null), "I'm not sure when it will be finished.", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "Contact"), "If you are interested in updates on the game, follow the ", React.createElement("a", { href: "https://twitter.com/VenienceWorld" }, "@VenienceWorld"), " twitter account, or ", React.createElement("a", { href: "mailto:spitz.dan.L+venience@gmail.com" }, "email me"), ".", React.createElement("br", null), React.createElement("br", null), "I would love to hear about your experience playing Venience World!", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "Open source"), "Venience World is open source.", React.createElement("br", null), React.createElement("br", null), "The project can be found at ", React.createElement("a", { href: "https://github.com/spitz-dan-l/wreck/" }, "https://github.com/spitz-dan-l/wreck/"), ".", React.createElement("br", null), React.createElement("br", null)), React.createElement("section", null, React.createElement("h3", null, "The name"), "The name \"Venience World\" is a play on \"", React.createElement("a", { href: "https://plato.stanford.edu/entries/supervenience/" }, "Supervenience"), "\", and the trope wherein games have names of the form \"Super ", React.createElement("i", null, "X"), " World\".", React.createElement("br", null), React.createElement("br", null), "The game is thematically about seeking an understanding about what is going on. Supervenience as a concept is one of the philosophical tools that has been developed for doing that."));
    }
}
exports.Preface = Preface;

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
const datatypes_1 = __webpack_require__(2);
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
                // if (this.state.selection_index === -1) {
                //   break;
                // }
                if (this.props.typeahead.length > 0) {
                    swallowed_enter = true;
                }
            // swallowed_enter = true;
            case keyboard_tools_1.keys.tab:
                event.preventDefault();
            case keyboard_tools_1.keys.right:
                if (this.props.typeahead.length === 0) {
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
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(6);
const Terminal_1 = __webpack_require__(9);
const commands_1 = __webpack_require__(5);
const venience_world_1 = __webpack_require__(4);
let start = {};
//start.experiences = ['grass, asking 2'];
//start.experiences = ['alcove, entering the forest']; 
// start.experiences = ['woods, ending interpretation'];
// start.experiences = ['bed, sitting up 2'];
// start.experiences = ['woods, crossing the boundary 2'];
start.experiences = ['woods, clearing'];
let world_driver = new commands_1.WorldDriver(new venience_world_1.VenienceWorld(start));
ReactDom.render(React.createElement(Terminal_1.Terminal, { world_driver: world_driver }), document.getElementById('terminal'));

/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const venience_world_1 = __webpack_require__(4);
const datatypes_1 = __webpack_require__(2);
const parser_1 = __webpack_require__(1);
let prologue_oms = () => [{
    id: 'bed, sleeping 1',
    enter_message: '',
    transitions: [[['awaken'], 'bed, awakening 1']]
}, {
    id: 'bed, awakening 1',
    enter_message: 'You awaken in your bed.',
    transitions: [[['sit', 'up'], 'bed, sitting up 1']]
}, {
    id: 'bed, sitting up 1',
    enter_message: `You push yourself upright, blankets falling to your waist.
        You squint and see only the palest light of dawn.
        Crickets chirp in the forest bordering your alcove.
        <br /><br />
        Your body still feels heavy with sleep.
        <br /><br />
        Something important nags quietly at you from the back of your mind...`,
    transitions: [[['try', 'to', '*remember'], 'bed, trying to remember 1']]
}, {
    id: 'bed, trying to remember 1',
    enter_message: `
        Something to do with Katya's twelfth sequence.`,
    transitions: [[['remember', 'the', 'twelfth', 'sequence'], 'bed, trying to remember 2']]
}, {
    id: 'bed, trying to remember 2',
    enter_message: `
        The twelfth sequence was the first purely numeric one in Katya's notes.
        <br/><br/>
        None of the greek symbols, none of the allusions to physical constants.
        <br/><br/>
        Just numbers. Eighty-seven of them.`,
    transitions: [[['remember', 'the', 'numbers'], 'bed, trying to remember 3']]
}, {
    id: 'bed, trying to remember 3',
    enter_message: `
        For years, the meaning of this sequence has eluded you.
        <br/><br/>
        It begins:
        <br/><br/>
        57 44 35
        <br/><br/>
        and continues:`,
    transitions: [[['20', '699', '319'], 'bed, trying to remember 4']]
}, {
    id: 'bed, trying to remember 4',
    enter_message: `
        Your favorite bit is positions fifty-one through fifty-three:`,
    transitions: [[['936', '5223', '2717'], 'bed, trying to remember 5']]
}, {
    id: 'bed, trying to remember 5',
    enter_message: `
        Such strange poetry in these numbers.
        <br/><br/>
        You know they must mean <i>something.</i>
        <br/><br/>
        Katya was brilliant, after all.
        <br/><br/>
        Sometimes frighteningly so.`,
    transitions: [[['remember', 'Katya'], 'bed, trying to remember 6']]
}, {
    id: 'bed, trying to remember 6',
    enter_message: `
        She was your advisor.
        <br/><br/>
        But she treated you like family.
        <br/><br/>
        You miss her.
        <br/><br/>
        <div class="interp">
        <i>"Go back to sleep, my dear.
        <br/><br/>
        Number Twelve can wait til morning,"</i> you imagine she'd say.
        </div>`,
    transitions: [[['lie', 'down'], 'bed, lying down 1']]
}, {
    id: 'bed, lying down 1',
    enter_message: `
        Yes, no reason to be up now.
        <br/><br/>
        You can update your notes first thing tomorrow.
        <br/><br/>
        You slide back under the blankets. The autumn breeze cools your face.`,
    transitions: [[['sleep', 'until', 'sunrise'], 'bed, sleeping 2']],
    interpretations: {
        'bed, trying to remember 1': [{ 'add': 'forgotten' }],
        'bed, trying to remember 2': [{ 'add': 'forgotten' }],
        'bed, trying to remember 3': [{ 'add': 'forgotten' }],
        'bed, trying to remember 4': [{ 'add': 'forgotten' }],
        'bed, trying to remember 5': [{ 'add': 'forgotten' }]
    }
}, {
    id: 'bed, sleeping 2',
    enter_message: `You dream of<br /><br />
        <div class="alien-interp"><i>calamity</i><br /><br /></div>
        a <i>shattered mirror</i><br /><br />
        an <i>ice-covered mountain</i><br /><br />
        <div class="interp">and <i>her voice.</i></div>`,
    transitions: [[['awaken'], 'bed, awakening 2']]
}, {
    id: 'bed, awakening 2',
    enter_message: `You awaken in your bed again.`,
    transitions: [[['sit', 'up'], 'bed, sitting up 2']],
    interpretations: {
        'bed, sleeping 1': [{ 'add': 'forgotten' }],
        'bed, awakening 1': [{ 'add': 'forgotten' }],
        'bed, sitting up 1': [{ 'add': 'forgotten' }],
        'bed, trying to remember 1': [{ 'add': 'forgotten' }],
        'bed, trying to remember 2': [{ 'add': 'forgotten' }],
        'bed, trying to remember 3': [{ 'add': 'forgotten' }],
        'bed, trying to remember 4': [{ 'add': 'forgotten' }],
        'bed, trying to remember 5': [{ 'add': 'forgotten' }],
        'bed, trying to remember 6': [{ 'add': 'forgotten' }],
        'bed, lying down 1': [{ 'add': 'forgotten' }],
        'bed, sleeping 2': [{ 'add': 'forgotten' }]
    }
}, {
    id: 'bed, sitting up 2',
    enter_message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        let look_consumer = this.make_look_consumer([[['around'], 'alcove, general'], [['at', 'myself'], 'self, 1']]);
        let other_consumer = venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_option([datatypes_1.annotate(['approach'], {
                enabled: ['alcove, general', 'self, 1'].every(p => this.state.has_regarded[p]),
                display: parser_1.DisplayEltType.keyword
            })]);
            yield parser.consume_filler(['the', 'desk']);
            yield parser.done();
            return this.transition_to('desk, sitting down');
        });
        return parser_1.combine.call(this, parser, [look_consumer, other_consumer]);
    }),
    dest_oms: ['desk, sitting down']
}, {
    id: 'desk, sitting down',
    enter_message: `You pace across the grass and take your seat at the leather-backed study chair.
        <br /><br />
        On the desk is a large parchment envelope, bound in twine.`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        let look_consumer = this.make_look_consumer([[['at', 'the', 'envelope'], 'alcove, envelope'], [['around'], 'alcove, general'], [['at', 'myself'], 'self, 1']]);
        let open_consumer = venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_option([datatypes_1.annotate(['open'], {
                enabled: this.state.has_regarded['alcove, envelope'] || false,
                display: parser_1.DisplayEltType.keyword
            })]);
            yield parser.consume_filler(['the']);
            yield parser.consume_filler(['envelope']);
            yield parser.done();
            return this.transition_to('desk, opening the envelope');
        });
        return parser_1.combine.call(this, parser, [look_consumer, open_consumer]);
    }),
    dest_oms: ['desk, sitting down', 'desk, opening the envelope']
    // transitions: [
    //     [['open', 'the', 'envelope'], 'desk, opening the envelope']]
}, {
    id: 'desk, opening the envelope',
    enter_message: `You undo the twine, leaving it in a loop on the desk.
        <br /><br />
        You unfold the envelope’s flap.
        <br /><br />
        It’s empty.`,
    transitions: [[['what?'], 'desk, reacting']]
}, {
    id: 'desk, reacting',
    enter_message: `
        Empty?
        <br/><br/>
        No, it can't be empty.
        <br/><br/>
        You closed it up last night, bound it in twine and went to sleep.
        <br/><br/>
        <i>Empty?</i>`,
    transitions: [[['try', 'to', '~*remember'], null], [['try', 'to', '*understand'], 'desk, trying to understand 1']]
}, {
    id: 'desk, trying to understand 1',
    enter_message: `
        Years of work.
        <br/><br/>
        Sequence Number Twelve.
        </br><br/>
        How does it go?`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        const r = [[9735, 4130, 3261], [3538, 8177, 3424], [6930, 3134, 2822]];
        for (let i = 0; i < 3; i++) {
            let options = [];
            for (let j = 0; j < 3; j++) {
                let n = r[i][j];
                let opt = datatypes_1.annotate([n.toString() + '?'], {
                    display: parser_1.DisplayEltType.filler
                });
                options.push(opt);
            }
            yield parser.consume_option(options);
        }
        yield parser.done();
        return this.transition_to('desk, trying to understand 2');
    }),
    dest_oms: ['desk, trying to understand 2']
}, {
    id: 'desk, trying to understand 2',
    enter_message: `        
        A panic comes over you. Without your notes, how will you continue your work?
        <br /><br />
        How will you possibly understand? How will you honor Katya’s memory?`,
    transitions: [[['*consider', 'the', 'sense of', '&panic'], 'desk, considering the sense of panic']]
}, {
    id: 'desk, considering the sense of panic',
    enter_message: `<div class="interp">
        Katya used to say that panic was like slipping down an ice-covered mountain face.
        <br /><br />
        It throws one particular path into relief: the path to the bottom.
        </div>`,
    transitions: [[['search', 'for', 'the', 'notes'], 'desk, searching for the notes']]
}, {
    id: 'desk, searching for the notes',
    enter_message: `You look in the envelope again.
        <br /><br />
        You look in the grass under the desk, under the chair.
        <br /><br />
        You strip your bed, finding nothing within the folds.
        <br /><br />
        <div class="interp">
        You can feel yourself slipping down an icy hill.
        </div>`,
    transitions: [[['slip', 'further'], 'grass, slipping further']]
}, {
    id: 'grass, slipping further',
    enter_message: `Thoughts of dread, of a terrible, empty future, fill your mind.
        <br /><br />
        You curl up on the grass beneath you, holding yourself.`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        yield parser.consume_exact(['consider']);
        yield parser.consume_filler(['the']);
        yield parser.consume_filler(['sense', 'of']);
        yield parser.consume_option([datatypes_1.set_enabled(['panic'], false), datatypes_1.set_enabled(['dread'], true)]);
        yield parser.done();
        return this.transition_to('grass, considering the sense of dread');
    }),
    dest_oms: ['grass, considering the sense of dread']
}, {
    id: 'grass, considering the sense of dread',
    enter_message: `<div class="interp">
        <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
        </div>`,
    transitions: [[['tell', 'me', 'what?'], 'grass, asking 1']]
}, {
    id: 'grass, asking 1',
    enter_message: `<div class="interp">
        <i>"That you are capable of a great deal of care, my dear.
        <br /><br />
        That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
        </div>`,
    transitions: [[['what', 'should', 'I', 'do?'], 'grass, asking 2']]
}, {
    id: 'grass, asking 2',
    enter_message: `<div class="interp"><i>
        "Judge the direction of gravity. Judge the slickness of the ice.
        <br /><br />
        Survey the horizon.
        <br /><br />
        And then, choose where to go."
        </i></div>`,
    transitions: [[['begin', '*interpretation'], 'alcove, beginning interpretation']]
}, {
    id: 'alcove, beginning interpretation',
    enter_message: `
        <div class="face-of-it">
        A nervous energy buzzes within your mind.
        <br/><br/>
        </div>
        <div class="interp-alcove-1">
        Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
        <br/><br/>
        </div>
        <div class="face-of-it">
        Your notes are gone.
        <br/><br/>
        </div>
        <div class="interp-alcove-2">
        Your effort to organize and understand everything Katya taught you over the years. If your notes are truly gone, it is a great setback.
        <br/><br/>
        But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
        <br/><br/>
        </div>
        <div class="face-of-it">
        You are alone in a grassy alcove in the forest.
        </div>
        <div class="interp-alcove-3">
        <br/>
        Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
        <br/><br/>
        Your view of the horizon is occluded by the trees from in here. Set out, seeking <i>new vantages.</i>
        </div>`,
    handle_command: venience_world_1.wrap_handler(function* (parser) {
        let { interp_step = 0 } = this.get_om_state('alcove, beginning interpretation');
        let next_interp = () => ({
            world: this.update({
                om_state: {
                    ['alcove, beginning interpretation']: {
                        interp_step: interp_step + 1
                    }
                }
            })
        });
        let judge_consumer = venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_option([datatypes_1.annotate(['judge'], {
                display: parser_1.DisplayEltType.keyword,
                enabled: interp_step < 2
            })]);
            yield parser.consume_option([datatypes_1.annotate(['the', 'direction', 'of', 'gravity'], { enabled: interp_step === 0 }), datatypes_1.annotate(['the', 'slickness', 'of', 'the', 'ice'], { enabled: interp_step === 1 })]);
            yield parser.done();
            return next_interp();
        });
        let survey_consumer = venience_world_1.wrap_handler(function* (parser) {
            yield parser.consume_option([datatypes_1.annotate(['survey'], {
                display: parser_1.DisplayEltType.keyword,
                enabled: interp_step === 2
            })]);
            yield parser.consume_filler(['the', 'horizon']);
            yield parser.done();
            return next_interp();
        });
        let end_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (interp_step < 3) {
                yield parser.invalidate();
            }
            yield parser.consume_filler(['end']);
            yield parser.consume_exact(['interpretation']);
            yield parser.done();
            return this.transition_to('alcove, ending interpretation');
        });
        return parser_1.combine.call(this, parser, [judge_consumer, survey_consumer, end_consumer]);
    }),
    dest_oms: ['alcove, ending interpretation'],
    interpret_history(history_elt) {
        let hist_om = history_elt.world.current_om();
        if (hist_om === 'alcove, beginning interpretation') {
            let { interp_step: hist_interp_step = 0 } = history_elt.world.get_om_state('alcove, beginning interpretation');
            if (hist_interp_step === 0) {
                let { interp_step = 0 } = this.get_om_state('alcove, beginning interpretation');
                if (interp_step > 0) {
                    return [{ 'add': `interp-alcove-${interp_step}-enabled` }];
                }
            }
        }
    }
}, {
    id: 'alcove, ending interpretation',
    enter_message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
        <br /><br />
        You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
        <br /><br />
        But your sense of purpose compels you. To go. To seek. To try to understand.`,
    transitions: [[['enter', 'the', 'forest'], 'alcove, entering the forest']]
}, {
    id: 'alcove, entering the forest',
    enter_message: `What lies within the forest, and beyond? What will it be like, out there?`,
    transitions: [[['continue'], 'title']]
}, {
    id: 'title',
    enter_message: `VENIENCE WORLD
        <br />
        <br />
        An Interactive Fiction by Daniel Spitz`,
    transitions: [[['continue'], 'alone in the woods']]
}];
let prologue_perceptions = () => [{
    id: 'alcove, general',
    content: `
        You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
        <br /><br />
        You see your desk and chair a few paces away, in the center of the alcove.
        <br /><br />
        On all sides you are surrounded by trees.`
}, {
    id: 'self, 1',
    content: `
        You are wearing a perfectly dignified pair of silk pajamas.`
}, {
    id: 'alcove, envelope',
    content: `
        You keep your research in this thick envelope.
        <br/><br/>
        You've been analyzing Katya's work for years now.
        <br/><br/>
        Your career is built in reverence of hers.`
}];
exports.default = {
    observer_moments: prologue_oms,
    perceptions: prologue_perceptions
};

/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const venience_world_1 = __webpack_require__(4);
const text_tools_1 = __webpack_require__(3);
const datatypes_1 = __webpack_require__(2);
const parser_1 = __webpack_require__(1);
let ch1_oms = () => {
    function is_considering(a) {
        return typeof a === 'object' && a['considering a fragment'] !== undefined;
    }
    function is_reifying(a) {
        return typeof a === 'object' && a['reifying a fragment'] !== undefined;
    }
    const om_id_2_contention = {
        'tower, peak': 'tangle, 2',
        'woods, tangle': 'tangle, 1',
        'woods, clearing 3': 'tangle, 3'
    };
    let tangle_consumer = venience_world_1.wrap_handler(function* (parser) {
        if (this.state.has_understood[om_id_2_contention[this.current_om()]]) {
            yield parser.invalidate();
        }
        let { prev_interp_action = 'ending interpretation', index = 0, begin_tag = -1 } = this.get_current_om_state();
        let begin_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (prev_interp_action !== 'ending interpretation') {
                yield parser.invalidate();
            }
            yield parser.consume_filler(['begin']);
            yield parser.consume_exact(['reification']);
            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: 'beginning interpretation',
                            index: index + 1,
                            begin_tag: index
                        }
                    }
                }, ['prev_interp_action']),
                message: text_tools_1.wrap_in_div(`
                You're upstairs, alright.`)
            };
        });
        let end_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (prev_interp_action === 'ending interpretation') {
                yield parser.invalidate();
            }
            yield parser.consume_filler(['end']);
            yield parser.consume_exact(['reification']);
            yield parser.done();
            let world_update = {
                om_state: {
                    [this.current_om()]: {
                        prev_interp_action: 'ending interpretation',
                        index: index + 1
                    }
                }
            };
            let message;
            // check if they successfully reified the correct contention
            if (is_reifying(prev_interp_action) && prev_interp_action.correctly) {
                world_update.has_understood = {
                    [om_id_2_contention[this.current_om()]]: true
                };
                message = `
                You are beginning to understand, my dear.`;
            } else {
                message = `
                There must be more to understand.`;
            }
            return {
                world: this.update(world_update, ['prev_interp_action']),
                message: text_tools_1.wrap_in_div(message)
            };
        });
        let consider_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (prev_interp_action === 'ending interpretation') {
                yield parser.invalidate();
            }
            yield parser.consume_option([datatypes_1.annotate(['consider'], {
                display: parser_1.DisplayEltType.keyword,
                enabled: !is_reifying(prev_interp_action) || !prev_interp_action.correctly
            })]);
            yield parser.consume_filler(['the']);
            let prev_contention = null;
            if (is_considering(prev_interp_action)) {
                prev_contention = prev_interp_action['considering a fragment'];
            } else if (is_reifying(prev_interp_action)) {
                prev_contention = prev_interp_action['reifying a fragment'];
            }
            let choice = yield parser.consume_option([datatypes_1.set_enabled(['first'], !this.state.has_understood['tangle, 1'] && prev_contention !== 'tangle, 1'), datatypes_1.set_enabled(['second'], !this.state.has_understood['tangle, 2'] && prev_contention !== 'tangle, 2'), datatypes_1.set_enabled(['third'], !this.state.has_understood['tangle, 3'] && prev_contention !== 'tangle, 3')]);
            yield parser.consume_filler(['fragment']);
            yield parser.done();
            let choice_2_contention = {
                'first': 'tangle, 1',
                'second': 'tangle, 2',
                'third': 'tangle, 3'
            };
            let x = venience_world_1.VenienceWorld.perceptions[choice_2_contention[choice]];
            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: {
                                'considering a fragment': choice_2_contention[choice]
                            },
                            index: index + 1
                        }
                    }
                }, ['prev_interp_action']),
                message: text_tools_1.wrap_in_div(`
                The ${choice} fragment reads:
                <br/><br/>
                ${venience_world_1.VenienceWorld.perceptions[choice_2_contention[choice]].content}`)
            };
        });
        let reify_consumer = venience_world_1.wrap_handler(function* (parser) {
            if (!is_considering(prev_interp_action)) {
                yield parser.invalidate();
                return;
            }
            yield parser.consume_exact(['reify']);
            yield parser.consume_filler(['the']);
            let contention_2_option = {
                'tangle, 1': ['tangle'],
                'tangle, 2': ['outside', 'vantage'],
                'tangle, 3': ['dance']
            };
            yield parser.consume_option(['tangle, 1', 'tangle, 2', 'tangle, 3'].map(c => datatypes_1.set_enabled(contention_2_option[c], c === prev_interp_action['considering a fragment'])));
            yield parser.done();
            let message;
            let correctly = prev_interp_action['considering a fragment'] === om_id_2_contention[this.current_om()];
            if (prev_interp_action['considering a fragment'] === 'tangle, 2') {
                correctly = correctly && this.state.has_understood['tangle, 1'];
            } else if (prev_interp_action['considering a fragment'] === 'tangle, 3') {
                correctly = correctly && this.state.has_understood['tangle, 2'];
            }
            if (correctly) {
                // all the work gets done in the interpret history bit
            } else {
                message = text_tools_1.wrap_in_div(`
                Wrong answer.`);
            }
            return {
                world: this.update({
                    om_state: {
                        [this.current_om()]: {
                            prev_interp_action: {
                                'reifying a fragment': prev_interp_action['considering a fragment'],
                                correctly
                            },
                            index: index + 1
                        }
                    }
                }, ['prev_interp_action']),
                message
            };
        });
        return parser_1.combine.call(this, parser, [begin_consumer, reify_consumer, consider_consumer, end_consumer]);
    });
    function tangle_interpreter(history_elt) {
        let h_world = history_elt.world;
        if (h_world.current_om() === this.current_om() && history_elt.world.current_om() in om_id_2_contention) {
            let { prev_interp_action = 'ending interpretation', index = 0, begin_tag = -1 } = this.get_current_om_state();
            let { prev_interp_action: h_prev_inter_action = 'ending interpretation', index: h_index = 0, begin_tag: h_begin_tag = -1 } = h_world.get_current_om_state();
            if (prev_interp_action === 'ending interpretation') {
                if (!this.state.has_understood[om_id_2_contention[this.current_om()]]) {
                    if (h_index > begin_tag + 1 && h_index < index) {
                        return [{ 'add': 'forgotten' }];
                    }
                }
            } else if (is_considering(prev_interp_action)) {
                // forget back to last 'beginning interpretation'
                if (h_index > begin_tag + 1 && h_index < index) {
                    return [{ 'add': 'forgotten' }];
                }
            } else if (is_reifying(prev_interp_action)) {
                if (prev_interp_action.correctly) {
                    // find most recent considering (it will be index - 1)
                    // add reify-tangle-N class
                    if (h_index === index - 1) {
                        let n;
                        if (prev_interp_action['reifying a fragment'] === 'tangle, 1') {
                            n = 1;
                        } else if (prev_interp_action['reifying a fragment'] === 'tangle, 2') {
                            n = 2;
                        } else {
                            n = 3;
                        }
                        return [{ 'add': `reif-tangle-${n}-enabled` }];
                    }
                }
            }
        }
    }
    return [{
        id: 'alone in the woods',
        enter_message: `Chapter 1 - A Sense Of Direction
            <br />
            <br />
            You are alone in the woods in midmorning.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let { has_travelled = [] } = this.get_om_state('alone in the woods');
            let look_consumer = this.make_look_consumer([[['around'], 'forest, general'], [['at', 'myself'], 'self, 2']]);
            let go_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['go'], {
                    enabled: has_travelled.length < 4 && this.state.has_regarded['self, 2'] && this.state.has_regarded['forest, general'],
                    display: parser_1.DisplayEltType.keyword
                })]);
                let dir = yield parser.consume_option([['north?'], ['east?'], ['south?'], ['west?']].map(d => datatypes_1.set_enabled(d, has_travelled.indexOf(d[0]) === -1)));
                yield parser.done();
                let message;
                if (has_travelled.length === 0) {
                    message = text_tools_1.wrap_in_div(`
                        You take a few steps ${dir.slice(0, -1)}.
                        <br/><br/>
                        Your surroundings appear similar.
                        <br/><br/>
                        Perhaps this isn't the right way.`);
                } else if (has_travelled.length === 1) {
                    message = text_tools_1.wrap_in_div(`
                        You feel no different after the second attempt to advance.
                        <br/><br/>
                        You have moved, but not meaningfully.
                        `);
                } else if (has_travelled.length === 2) {
                    message = text_tools_1.wrap_in_div(`
                        A swirling cocktail of
                        <br/><br/>
                        doubt,
                        <br/><br/>
                        confusion
                        <br/><br/>
                        and disorientation
                        <br/><br/>
                        begins to set in.
                        `);
                } else if (has_travelled.length === 3) {
                    message = text_tools_1.wrap_in_div(`
                        You are lost in the woods in midmorning.
                        <br/><br/>
                        You miss the security of your alcove.
                        <br/><br/>
                        <div class="alien-interp">
                        <i>"You were a fool to leave
                        <br/><br/>
                        too fragile
                        <br/><br/>
                        too sensitive
                        <br/><br/>
                        to find your own way."</i>
                        </div>`);
                }
                return {
                    world: this.update({
                        om_state: {
                            ['alone in the woods']: {
                                has_travelled: [...has_travelled, dir]
                            }
                        }
                    }),
                    message
                };
            });
            let understand_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (!(has_travelled.length >= 4)) {
                    yield parser.invalidate();
                }
                yield parser.consume_filler(['try']);
                yield parser.consume_filler(['to']);
                yield parser.consume_exact(['understand']);
                yield parser.done();
                return this.transition_to('woods, trying to understand');
            });
            return parser_1.combine.call(this, parser, [look_consumer, go_consumer, understand_consumer]);
        }),
        dest_oms: ['alone in the woods', 'woods, trying to understand']
    }, {
        id: 'woods, trying to understand',
        enter_message: `
            You are overwhelmed by the number of indistinct options.
            <br/><br/>
            The trees surrounding you are like a wall, made of irrelevance and uncertainty rather than impermeability.
            <br/><br/>
            You are unsure of what your heading should be.`,
        transitions: [[['*consider', 'the', 'sense of', '&uncertainty'], 'woods, considering the sense of uncertainty']]
    }, {
        id: 'woods, considering the sense of uncertainty',
        enter_message: `
            <div class="interp">
            Katya used to say that a circle, when considered in relation to nothing,
            is about as useful as a point, a dot, considered in the same context.
            <br/><br/>
            <i>“It is only important that a circle is circular when something other than the circle exists in terms of it,”</i>
            she’d say, chuckling as you wracked your brain to understand.
            </div>`,
        transitions: [[['where', 'should', 'I', 'go?'], 'woods, asking 1']]
    }, {
        id: 'woods, asking 1',
        enter_message: `
            <div class="interp">
            <i>"I certainly can’t answer that, my dear.
            <br/><br/>
            But I assure you, you can do this."</i>
            </div>`,
        transitions: [[['what', 'should', 'I', 'do?'], 'woods, asking 2']]
    }, {
        id: 'woods, asking 2',
        enter_message: `
            <div class="interp">
            <i>"Judge the circle in terms of the world.
            <br/><br/>
            Question its circlehood.
            <br/><br/>
            Take the only path forward."</i>
            </div>`,
        transitions: [[['begin', '*interpretation'], 'woods, beginning interpretation']]
    }, {
        id: 'woods, beginning interpretation',
        enter_message: `
            You are surrounded in all directions by the forest.
            <br/><br/>
            <div class="interp-woods-1">
            The circle that is the forest encloses you.
            <br/><br/>
            It separates you from the world.
            <br/><br/>
            </div> 
            You are unsure of which direction to go.
            <br/><br/>
            <div class="interp-woods-2">
            It is primarily important that the occluding wood is a boundary, not that it is circular in shape.
            <br/><br/>
            <i>"The circularity is a mere artifact of our Euclidean heritage, my dear."</i>
            <br/><br/>
            A boundary separates you from the answers you seek.
            <br/><br/>
            </div>
            You feel lost.
            <div class="interp-woods-3">
            <br/>
            A circle may offer a continuum of freedom, and with it, an infinity of wrong ways.
            <br/><br/>
            But what of an enclosing boundary?
            <br/><br/>
            You’re either within it, or you’re free of it.
            <br/><br/>
            In or Out.
            <br/><br/>
            Perhaps there is only a single way forward after all.
            </div>
            `,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let { interp_step = 0 } = this.get_om_state('woods, beginning interpretation');
            let next_interp = () => ({
                world: this.update({
                    om_state: {
                        ['woods, beginning interpretation']: {
                            interp_step: interp_step + 1
                        }
                    }
                })
            });
            let judge_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['judge'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: interp_step === 0
                })]);
                yield parser.consume_filler(['the', 'circle']);
                yield parser.consume_filler(['in', 'terms', 'of', 'the', 'world']);
                yield parser.done();
                return next_interp();
            });
            let question_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['question'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: interp_step === 1
                })]);
                yield parser.consume_filler(['its', 'circlehood']);
                yield parser.done();
                return next_interp();
            });
            let take_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['take'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: interp_step === 2
                })]);
                yield parser.consume_filler(['the', 'only', 'path', 'forward']);
                yield parser.done();
                return next_interp();
            });
            let end_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (interp_step < 3) {
                    yield parser.invalidate();
                }
                yield parser.consume_filler(['end']);
                yield parser.consume_exact(['interpretation']);
                yield parser.done();
                return this.transition_to('woods, ending interpretation');
            });
            return parser_1.combine.call(this, parser, [judge_consumer, question_consumer, take_consumer, end_consumer]);
        }),
        dest_oms: ['woods, beginning interpretation', 'woods, ending interpretation'],
        interpret_history(history_elt) {
            if (history_elt.world.current_om() === 'woods, beginning interpretation') {
                let { interp_step: hist_interp_step = 0 } = history_elt.world.get_om_state('woods, beginning interpretation');
                if (hist_interp_step === 0) {
                    let { interp_step = 0 } = this.get_om_state('woods, beginning interpretation');
                    if (interp_step > 0) {
                        return [{ 'add': `interp-woods-${interp_step}-enabled` }];
                    }
                }
            }
        }
    }, {
        id: 'woods, ending interpretation',
        enter_message: `
            You haven’t moved an inch.
            <br/><br/>
            And yet, the world around you seems to have been reshaped.
            <br/><br/>
            The proliferation of possibly-wrong paths forward has collapsed to a single binary choice:`,
        transitions: [[['*remain', 'within the boundary'], 'woods, considering remaining'], [['~*cross', 'the boundary'], 'woods, crossing the boundary 1']]
    }, {
        id: 'woods, considering remaining',
        enter_message: `or...`,
        transitions: [[['~*remain', 'within the boundary'], 'woods, considering remaining'], [['*cross', 'the boundary'], 'woods, crossing the boundary 1']]
    }, {
        id: 'woods, crossing the boundary 1',
        enter_message: `
            The particular direction of travel is unimportant.
            <br/><br/>
            <div class="interp">
            <i>"Our world is one in which most degrees of freedom are accompanied by entropy production;
            <br/><br/>
            that is to say, arbitrariness is rarely scarce, my dear."</i>
            <br/><br/>
            </div>
            You choose a direction <span class="interp-inline">(Arbitrarily! <i>"Thanks, <a target="_blank" href="https://arxiv.org/abs/cond-mat/0005382">Dewar</a>!"</i>)</span> and take it.
            <br/><br/>
            The forest around you remains an undifferentiated boundary of New England brush and flora...`,
        transitions: [[['continue'], 'woods, crossing the boundary 2']],
        interpretations: {
            'woods, considering remaining': [{ 'add': 'forgotten' }]
        }
    }, {
        id: 'woods, crossing the boundary 2',
        enter_message: `
            ...until it begins to change.
            <br/><br/>
            You notice that the brown trunks of oak are peppered with the white of birch here and there.
            <br/><br/>
            And on the ground, partially covered in leaves, is a slip of parchment paper.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let { has_taken_note = false } = this.get_current_om_state();
            let fragment_thread = venience_world_1.wrap_handler(function* (parser) {
                let look_consumer = venience_world_1.wrap_handler(function* (parser) {
                    if (this.state.has_regarded['note fragment']) {
                        yield parser.invalidate();
                    }
                    return this.make_look_consumer([[['at', 'the', 'parchment'], 'note fragment']]).call(this, parser);
                });
                let take_consumer = venience_world_1.wrap_handler(function* (parser) {
                    if (!this.state.has_regarded['note fragment'] || has_taken_note) {
                        yield parser.invalidate();
                    }
                    yield parser.consume_option([datatypes_1.annotate(['take'], {
                        display: parser_1.DisplayEltType.keyword,
                        enabled: !has_taken_note
                    })]);
                    yield parser.consume_filler(['the', 'fragment']);
                    yield parser.done();
                    return {
                        message: text_tools_1.wrap_in_div(`
                            You pick it up.
                            <br/><br/>
                            It's been torn from a full page.
                            <br/><br/>
                            You recognize your own loopy scrawl on the parchment paper.
                            <br/><br/>
                            What is it doing out here? And where are the rest of your notes?`),
                        world: this.update({
                            om_state: {
                                [this.current_om()]: {
                                    has_taken_note: true
                                }
                            }
                        })
                    };
                });
                let read_consumer = venience_world_1.wrap_handler(function* (parser) {
                    if (!has_taken_note || this.state.has_regarded['tangle, 1']) {
                        yield parser.invalidate();
                    }
                    yield parser.consume_option([datatypes_1.annotate(['read'], {
                        display: parser_1.DisplayEltType.keyword,
                        enabled: !this.state.has_regarded['tangle, 1']
                    })]);
                    yield parser.consume_filler(['it']);
                    yield parser.done();
                    return this.regard('tangle, 1', msg => text_tools_1.wrap_in_div(`
                        It's the beginning of a transcript you took.
                        <br/><br/>
                        Something Katya said, that you wanted to remember:
                        <br/><br/>
                        ${msg}`));
                });
                return parser_1.combine.call(this, parser, [look_consumer, take_consumer, read_consumer]);
            });
            let consumer = venience_world_1.wrap_handler(function* (parser) {
                if (!this.state.has_regarded['tangle, 1']) {
                    yield parser.invalidate();
                }
                yield parser.consume_filler(['continue']);
                yield parser.done();
                return this.transition_to('woods, crossing the boundary 3');
            });
            return parser_1.combine.call(this, parser, [fragment_thread, consumer]);
        }),
        dest_oms: ['woods, crossing the boundary 2', 'woods, crossing the boundary 3']
    }, {
        id: 'woods, crossing the boundary 3',
        enter_message: `
            The birch representation continues to grow relative to the oak.
            <br/><br/>
            Another slip of parchment paper catches your eye on the ground.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            // let {
            //     has_taken_note = false
            // } = this.get_om_state('woods, crossing the boundary 3');
            let take_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (this.state.has_regarded['tangle, 2']) {
                    yield parser.invalidate();
                }
                yield parser.consume_option([datatypes_1.annotate(['take'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: !this.state.has_regarded['tangle, 2']
                })]);
                yield parser.consume_filler(['the', 'fragment']);
                yield parser.done();
                return this.regard('tangle, 2', msg => text_tools_1.wrap_in_div(`
                    ${msg}`));
            });
            let continue_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['continue'], {
                    enabled: !this.state.has_regarded['tangle, 2'],
                    display: parser_1.DisplayEltType.keyword
                })]);
                yield parser.consume_filler(['up', 'the', 'birch', 'gradient']);
                yield parser.done();
                return this.transition_to('woods, clearing');
            });
            return parser_1.combine.call(this, parser, [take_consumer, continue_consumer]);
        }),
        dest_oms: ['woods, crossing the boundary 3', 'woods, clearing']
    }, {
        id: ['woods, clearing', 'woods, clearing 2', 'woods, clearing 3'],
        enter_message: `
            You arrive at a small clearing, surrounded by the parchment-white of birch.
            <br/><br/>
            The path forward branches in two.
            <br/><br/>
            In one direction, the path narrows and bends sharply behind a roiling wall of birch.
            <br/><br/>
            In another, a looming structure of some kind stands beyond the trees.
            <br/><br/>
            A third note fragment lies on the ground.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let { has_taken_note = false } = this.get_current_om_state();
            let take_consumer = venience_world_1.wrap_handler(function* (parser) {
                if (this.state.has_regarded['tangle, 3']) {
                    yield parser.invalidate();
                }
                yield parser.consume_option([datatypes_1.annotate(['take'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: !has_taken_note
                })]);
                yield parser.consume_filler(['the', 'fragment']);
                yield parser.done();
                return this.regard('tangle, 3', msg => text_tools_1.wrap_in_div(`
                    ${msg}`));
            });
            let go_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['go'], {
                    enabled: this.state.has_regarded['tangle, 3'],
                    display: parser_1.DisplayEltType.keyword
                })]);
                yield parser.consume_filler(['to']);
                let opt = yield parser.consume_option([['tangle'], ['tower']]);
                yield parser.done();
                if (opt === 'tangle') {
                    if (this.state.has_understood['tangle, 3']) {
                        return this.transition_to('woods, tangle 2');
                    } else {
                        return this.transition_to('woods, tangle');
                    }
                } else {
                    if (this.state.has_understood['tangle, 2']) {
                        return this.transition_to('tower, base 2');
                    } else {
                        return this.transition_to('tower, base');
                    }
                }
            });
            // TODO: add tangle consumer
            // need gentler way of introducing it
            return parser_1.combine.call(this, parser, [take_consumer, go_consumer]);
        }),
        dest_oms: ['woods, clearing', 'woods, tangle', 'tower, base', 'tower, base 2', 'woods, tangle 2'],
        interpret_history: tangle_interpreter
    }, {
        id: ['woods, tangle'],
        enter_message: `
            Gee dang is it hard to stay oriented in here.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let return_consumer = venience_world_1.wrap_handler(function* (parser) {
                let { prev_interp_action = 'ending interpretation' } = this.get_current_om_state();
                if (prev_interp_action !== 'ending interpretation') {
                    yield parser.invalidate();
                }
                yield parser.consume_exact(['return']);
                yield parser.consume_filler(['to', 'the']);
                yield parser.consume_filler(['clearing']);
                yield parser.done();
                let dest;
                if (this.state.has_understood['tangle, 1']) {
                    dest = 'woods, clearing 2';
                } else {
                    dest = 'woods, clearing';
                }
                return this.transition_to(dest);
            });
            return parser_1.combine.call(this, parser, [tangle_consumer, return_consumer]);
        }),
        dest_oms: ['woods, tangle', 'woods, clearing', 'woods, birch parchment 1'],
        interpret_history: tangle_interpreter
    }, {
        id: ['tower, base', 'tower, base 2'],
        enter_message: `
            Big old tower stick up in the middle of the earth.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let ascend_consumer = venience_world_1.wrap_handler(function* (parser) {
                // Climbs the tower
                yield parser.consume_exact(['ascend']);
                yield parser.done();
                return this.transition_to('tower, peak');
            });
            let return_consumer = venience_world_1.wrap_handler(function* (parser) {
                // Returns to the clearing
                yield parser.consume_exact(['return']);
                yield parser.consume_filler(['to', 'the']);
                yield parser.consume_filler(['clearing']);
                yield parser.done();
                let dest;
                if (this.state.has_understood['tangle, 2']) {
                    dest = 'woods, clearing 3';
                } else if (this.state.has_understood['tangle, 1']) {
                    dest = 'woods, clearing 2';
                } else {
                    dest = 'woods, clearing';
                }
                return this.transition_to(dest);
            });
            return parser_1.combine.call(this, parser, [ascend_consumer, return_consumer]);
        }),
        dest_oms: ['tower, peak', 'woods, clearing', 'woods, clearing 2', 'woods, clearing 3']
    }, {
        id: 'tower, peak',
        enter_message: `
            Top o' the tower.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let descend_consumer = venience_world_1.wrap_handler(function* (parser) {
                let { prev_interp_action = 'ending interpretation' } = this.get_current_om_state();
                if (prev_interp_action !== 'ending interpretation') {
                    yield parser.invalidate();
                }
                yield parser.consume_exact(['descend']);
                yield parser.done();
                if (this.state.has_understood['tangle, 2']) {
                    return this.transition_to('tower, base 2');
                } else {
                    return this.transition_to('tower, base');
                }
            });
            return parser_1.combine.call(this, parser, [tangle_consumer, descend_consumer]);
        }),
        interpret_history: tangle_interpreter,
        dest_oms: ['tower, base', 'tower, base 2', 'tower, peak']
    }, {
        id: 'woods, tangle 2',
        enter_message: `
            You did it. Yayy`,
        transitions: [[['continue'], 'woods, birch parchment 1']]
    }, {
        id: 'woods, birch parchment 1',
        enter_message: `
            ...and now it is mostly birch...`,
        transitions: [[['continue'], 'woods, birch parchment 2']]
    }, {
        id: 'woods, birch parchment 2',
        enter_message: `
            ...and now the white bark of the birch trees blurs into a continuum of etched parchment.`,
        handle_command: venience_world_1.wrap_handler(function* (parser) {
            let look_consumer = this.make_look_consumer([[['at', 'the', 'parchment'], 'forest, parchment trees']]);
            let { read_state = 0 } = this.get_om_state('woods, birch parchment 2');
            let apply_read_update = (world = this) => world.update({
                om_state: {
                    ['woods, birch parchment 2']: {
                        read_state: read_state + 1
                    }
                }
            });
            let read_consumer = venience_world_1.wrap_handler(function* (parser) {
                yield parser.consume_option([datatypes_1.annotate(['read'], {
                    display: parser_1.DisplayEltType.keyword,
                    enabled: this.state.has_regarded['forest, parchment trees']
                })]);
                let read_0_consumer = venience_world_1.wrap_handler(function* (parser) {
                    yield parser.consume_option([datatypes_1.annotate(['the', 'parchment'], {
                        display: parser_1.DisplayEltType.filler,
                        enabled: read_state === 0
                    })]);
                    yield parser.done();
                    return {
                        world: apply_read_update(),
                        message: text_tools_1.wrap_in_div(`
                            Your eyes skim over the vast text laid out before you for a moment,
                            <br/><br/>
                            searching.
                            <br/><br/>
                            Then, you come to rest on one particular story.`)
                    };
                });
                let read_1_consumer = venience_world_1.wrap_handler(function* (parser) {
                    if (read_state < 1) {
                        yield parser.invalidate();
                    }
                    yield parser.consume_filler(['the', 'story', 'of']);
                    yield parser.consume_exact(['Charlotte'], parser_1.DisplayEltType.option);
                    yield parser.done();
                    let result = this.transition_to('reading the story of charlotte');
                    result.world = apply_read_update(result.world);
                    return result;
                });
                return parser_1.combine.call(this, parser, [read_0_consumer, read_1_consumer]);
            });
            return parser_1.combine.call(this, parser, [look_consumer, read_consumer]);
        }),
        dest_oms: ['woods, birch parchment 2', 'reading the story of charlotte']
    }, {
        id: 'reading the story of charlotte',
        enter_message: `
            <i>You have reached the end of the demo.
            <br/><br/>
            Charlotte's story will be told in Chapter 2.
            <br/><br/>
            Thanks for playing Venience World!</i>`,
        transitions: []
    }];
};
// "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
// "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
// "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
// "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
// "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
// "Do not fret, my dear. Return to the madness of life after your brief respite."
// You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
// "Expect to forget; to be turned around; to become tangled up."
// "Find some joy in it; some exhilaration."
// "And know that you have changed, dear. That your ascent has taught you something."
//             <br /><br />
//             You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
//             <br /><br />
//             You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
//             <br /><br />
//             <div class="meditation-1">
//             "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
//             </div>`,
let ch1_perceptions = () => [{
    id: 'forest, general',
    content: `
        The sun trickles through the thick brush.
        <br />
        <br />
        The growth of the forest surrounds you in every direction.`
}, {
    id: 'self, 2',
    content: `
        Your silk pajamas glisten in the midmorning sun.
        <br/><br/>
        You are determined to continue your life's work.
        <br/><br/>
        To find or rewrite your missing notes.`
}, {
    id: 'forest, parchment trees',
    content: `
        The parchment teems with scrawlings of
        <br/><br/>
        stories,
        <br/><br/>
        transcripts,
        <br/><br/>
        annotations,
        <br/><br/>
        <div class="interp">
        and interpretations.
        </div>`
}, {
    id: 'note fragment',
    content: `
        You brush aside the leaves.
        <br/><br/>
        It appears to be a fragment from your missing notes!`
}, {
    id: 'tangle, 1',
    content: `
        <div class="interp"><i>
        "We wander, for the most part, within a tangled, looping mess of thought;
        <br/><br/>
        a haphazard ligature of unrelated perceptions.
        <br/><br/>
        We lack the perspective to find meaning in it.”
        </i></div>
        <div class="reif-tangle-1">
        <br/>
        This winding maze of birch <i>is</i> the tangle.
        <br/><br/>
        It disorients you, subsumes you in its curves.
        </div>
        `
}, {
    id: 'tangle, 2',
    content: `
        <div class="interp"><i>
        “It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds.
        <br/><br/>
        The twisting fibres of our journey are put into perspective.
        <br/><br/>
        It is peaceful from up there."
        </i></div>
        <div class="reif-tangle-2">
        <br/>
        This tower <i>is</i> the outside vantage.
        <br/><br/>
        It gives you the perspective to see how far you've come, and what waits for you ahead.
        </div>`
}, {
    id: 'tangle, 3',
    content: `
        <div class="interp"><i>
        "But do not grow too comfortable in that peace’s embrace.
        <br/><br/>
        It is a respite. And it must end.
        <br/><br/>
        All there is to do, once one has stood above the tangle for a while and surveyed it,
        <br/><br/>
        is to return to it.
        <br/><br/>
        To dance."
        </i></div>
        <div class="reif-tangle-3">
        <br/>
        Your own motion through the birch tangle and back out
        <br/><br/>
        your climb up the tower and back down
        <br/><br/>
        your exodus from the world into your alcove
        <br/><br/>
        your years spent in solitude
        <br/><br/>
        your setting forth this morning, and arriving here
        <br/><br/>
        this <i>is</i> the dance.
        </div>`
}];
exports.default = {
    observer_moments: ch1_oms,
    perceptions: ch1_perceptions
};

/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __webpack_require__(1);
// Holy dang this is cool:
// https://stackoverflow.com/questions/46445115/derive-a-type-a-from-a-list-of-strings-a
//
// Point here is to define the list of ObserverMomentIDs and PerceptionIDs
// as a constant, and get string literal typechecking elsewhere in the code.
function infer_literal_array(...arr) {
    return arr;
}
const ObserverMomentIDs = infer_literal_array('bed, sleeping 1', 'bed, awakening 1', 'bed, sitting up 1', 'bed, trying to remember 1', 'bed, trying to remember 2', 'bed, trying to remember 3', 'bed, trying to remember 4', 'bed, trying to remember 5', 'bed, trying to remember 6', 'bed, lying down 1', 'bed, sleeping 2', 'bed, awakening 2', 'bed, sitting up 2', 'desk, sitting down', 'desk, opening the envelope', 'desk, reacting', 'desk, trying to understand 1', 'desk, trying to understand 2', 'desk, considering the sense of panic', 'desk, searching for the notes', 'grass, slipping further', 'grass, considering the sense of dread', 'grass, asking 1', 'grass, asking 2', 'alcove, beginning interpretation', 'alcove, ending interpretation', 'alcove, entering the forest', 'title',
//ch1
'alone in the woods', 'woods, trying to understand', 'woods, considering the sense of uncertainty', 'woods, asking 1', 'woods, asking 2', 'woods, beginning interpretation', 'woods, ending interpretation', 'woods, considering remaining', 'woods, crossing the boundary 1', 'woods, crossing the boundary 2', 'woods, crossing the boundary 3', 'woods, clearing', 'woods, clearing 2', // pseudo copies to avoid loop erasure
'woods, clearing 3', // because the impl is currently a bit of a hack :(
'woods, tangle', 'woods, tangle 2', 'tower, base', 'tower, base 2', 'tower, peak', 'woods, birch parchment 1', 'woods, birch parchment 2', 'reading the story of charlotte');
const PerceptionIDs = infer_literal_array(
// Prologue
'alcove, general', 'self, 1', 'alcove, envelope',
// ch1
'forest, general', 'self, 2', 'note fragment', 'tangle, 1', 'tangle, 2', 'tangle, 3', 'forest, parchment trees');
const ContentionIDs = infer_literal_array(
// ch1
'tangle, 1', 'tangle, 2', 'tangle, 3');
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