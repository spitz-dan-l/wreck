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
/******/ 	return __webpack_require__(__webpack_require__.s = 13);
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
    get(k) {
        let s = k.toString();
        return this.values_map.get(s);
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
function is_annotated(x) {
    if (x === undefined) {
        return false;
    }
    return x.annotated !== undefined;
}
exports.is_annotated = is_annotated;
function annotate(x, annotation) {
    if (is_annotated(x)) {
        if (x.annotation !== annotation) {
            x.annotation = annotation; //could do check here for enabled being set properly already
        }
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
function with_annotatable(x, f, default_value) {
    return annotate(unwrap(f(unwrap(x))), get_annotation(x, default_value));
}
exports.with_annotatable = with_annotatable;
function get_annotation(x, default_value) {
    if (is_annotated(x)) {
        return x.annotation;
    } else {
        return default_value;
    }
}
exports.get_annotation = get_annotation;
function set_enabled(x, enabled = true) {
    return annotate(x, enabled);
}
exports.set_enabled = set_enabled;
function with_disablable(x, f) {
    return with_annotatable(x, f);
}
exports.with_disablable = with_disablable;
function is_enabled(x) {
    let result = get_annotation(x);
    if (result === undefined) {
        return true;
    }
    return result;
}
exports.is_enabled = is_enabled;

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
    consume_option(option_spec_tokens, name, display = DisplayEltType.option) {
        let partial_matches = [];
        let exact_match_subparser = null;
        let exact_match_spec_toks = null;
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let is_exact_match = subparser.consume_exact(datatypes_1.unwrap(spec_toks), display, name);
            if (datatypes_1.is_enabled(spec_toks)) {
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
            let typeahead = partial_matches.map(de => datatypes_1.with_disablable(de, x => x.typeahead[0]));
            this.integrate(exact_match_subparser);
            this.match[this.match.length - 1].typeahead = typeahead;
            return text_tools_1.normalize_whitespace(text_tools_1.untokenize(exact_match_spec_toks));
        }
        if (partial_matches.filter(de => datatypes_1.is_enabled(de)).length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(de => datatypes_1.with_disablable(de, x => x.typeahead[0]));
            this.match.push({
                display: DisplayEltType.partial,
                match: datatypes_1.unwrap(partial_matches[0]).match,
                typeahead: typeahead,
                name: name
            });
            return false;
        }
        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_gaps = this.token_gaps.slice(this.position, this.tokens.length);
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_gaps),
            name: name
        });
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
function with_early_stopping(gen_func) {
    function inner(...args) {
        let gen = gen_func(...args);
        return stop_early(gen);
    }
    return inner;
}
exports.with_early_stopping = with_early_stopping;
function* consume_option_stepwise_eager(parser, options) {
    // assumption: no option is a prefix of any other option
    let current_cmd = [];
    let pos = 0;
    while (true) {
        let remaining_options = options.filter(toks => toks.slice(0, pos).every((tok, i) => tok === current_cmd[i]));
        if (remaining_options.length === 0) {
            return text_tools_1.untokenize(current_cmd);
        }
        let next_tokens = [];
        for (let opt of remaining_options) {
            if (pos < opt.length) {
                let tok = opt[pos];
                if (next_tokens.indexOf(tok) === -1) {
                    next_tokens.push(tok);
                }
            } else {
                return text_tools_1.untokenize(current_cmd);
            }
        }
        let display_type;
        if (pos === 0) {
            display_type = DisplayEltType.keyword;
        } else {
            display_type = next_tokens.length === 1 ? DisplayEltType.filler : DisplayEltType.option;
        }
        let next_tok = yield parser.consume_option(next_tokens.map(text_tools_1.split_tokens), undefined, display_type);
        current_cmd.push(next_tok);
        pos++;
    }
}
exports.consume_option_stepwise_eager = consume_option_stepwise_eager;

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

/***/ }),
/* 4 */
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
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        position: 'relative'
    };
    let validity = parser.validity;
    if (validity === parser_1.MatchValidity.valid) {
        style.fontWeight = '900';
        style.fontStyle = 'italic';
    } else {
        style.fontWeight = '100';
        if (validity === parser_1.MatchValidity.invalid) {
            style.opacity = '0.6';
        }
    }
    const elt_style = {
        display: 'inline-block'
    };
    const span_style = {
        display: 'inline-block'
    };
    return React.createElement("div", { style: { display: 'inline-block' } }, React.createElement(exports.Carat, null), React.createElement("div", { style: style }, parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')), i === typeaheadIndex ? children : ''))));
};
exports.OutputText = props => {
    const { message_html } = props;
    const style = {
        display: 'inline-block',
        whiteSpace: 'pre-wrap'
    };
    return React.createElement("div", { style: style, dangerouslySetInnerHTML: { __html: message_html } });
};

/***/ }),
/* 5 */
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
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const Prompt_1 = __webpack_require__(11);
const Text_1 = __webpack_require__(4);
const TypeaheadList_1 = __webpack_require__(12);
const History_1 = __webpack_require__(10);
const text_tools_1 = __webpack_require__(3);
const parser_1 = __webpack_require__(2);
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeys = event => {
            // debugger;
            let swallowed_enter = this.typeahead_list !== null ? this.typeahead_list.handleKeys(event) : false;
            if (!swallowed_enter) {
                this.prompt.handleKeys(event);
            }
            if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
                event.preventDefault();
            }
        };
        this.handleSubmit = () => {
            if (this.isCurrentlyValid()) {
                const output = this.state.world_driver.commit();
                this.setState({ world_driver: this.state.world_driver });
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
            this.setState({ world_driver: this.state.world_driver });
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
        this.focus = () => {
            this.prompt.focus();
        };
        this.blur = () => {
            this.prompt.blur();
        };
        this.scrollToPrompt = () => {
            if (this.contentContainer.scrollHeight - this.contentContainer.scrollTop > this.contentContainer.clientHeight) {
                this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
            }
        };
        this.state = { world_driver: this.props.world_driver };
    }
    componentDidMount() {
        this.focus();
    }
    componentDidUpdate() {
        this.focus();
        let that = this;
        window.setTimeout(function () {
            that.scrollToPrompt();
        }, 700);
    }
    render() {
        const container_style = {
            height: '100%',
            width: '100%',
            overflowY: 'scroll',
            whiteSpace: 'pre-wrap',
            fontFamily: "'Roboto Mono'",
            fontSize: '1em',
            fontWeight: 'light',
            color: 'ivory',
            background: 'black',
            radius: 3,
            position: 'absolute',
            display: 'block',
            padding: '1em',
            marginRight: '3em'
        };
        return React.createElement("div", { style: container_style, tabIndex: -1, onFocus: this.focus, onBlur: this.blur, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc }, React.createElement(History_1.History, { history: this.state.world_driver.history, possible_history: this.state.world_driver.possible_history }), React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Text_1.ParsedText, { parser: this.currentParser(), typeaheadIndex: this.currentTypeaheadIndex() }, React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const text_tools_1 = __webpack_require__(3);
const datatypes_1 = __webpack_require__(1);
const parser_1 = __webpack_require__(2);
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
        // if (cmd_result.history_updater !== undefined) {
        //     result.history_updater = cmd_result.history_updater;
        // }
        result = apply_interstitial_update(result);
    }
    return result;
}
exports.apply_command = apply_command;
function apply_interstitial_update(result) {
    if (result.world.interstitial_update !== undefined) {
        //confusing, but we are running pre_command for the *next* command, not the one that just ran
        let res2 = result.world.interstitial_update();
        if (res2 !== undefined) {
            if (res2.world !== undefined) {
                result.world = res2.world;
            }
            if (res2.message !== undefined) {
                //assume they updated the original message in some way   
                result.message = res2.message;
            }
            // if (res2.history_updater !== undefined) {
            //     result.history_updater = res2.history_updater;
            // }
        }
    }
    return result;
}
function apply_history_update(history, world) {
    if (world.interpret_history === undefined) {
        return history;
    } else {
        return history.map(result => {
            let r = datatypes_1.unwrap(result);
            let new_result = Object.assign({}, r);
            let interpretted_message = world.interpret_history(r.world, r.message);
            if (interpretted_message !== undefined) {
                new_result.interpretted_message = datatypes_1.unwrap(interpretted_message);
            }
            return datatypes_1.annotate(new_result, datatypes_1.get_annotation(interpretted_message, datatypes_1.get_annotation(result, 1)));
        });
    }
}
class WorldDriver {
    constructor(initial_world) {
        this.previous_histories = [];
        let initial_result = { world: initial_world };
        initial_result = apply_interstitial_update(initial_result);
        initial_result.index = 0;
        this.history = apply_history_update([initial_result], initial_world);
        this.apply_command('', false); //populate this.current_state
    }
    apply_command(cmd, commit = true) {
        let prev_state = datatypes_1.unwrap(this.history[this.history.length - 1]);
        let result = apply_command(prev_state.world, cmd);
        result.index = prev_state.index + 1;
        this.current_state = result;
        this.possible_history = apply_history_update([...this.history, this.current_state], this.current_state.world);
        if (commit) {
            this.commit();
        }
        return result;
    }
    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);
        //filter out any disabled history
        this.history = this.possible_history.filter(x => datatypes_1.get_annotation(x, 1) !== 0);
        this.apply_command('', false);
        return this.current_state;
    }
}
exports.WorldDriver = WorldDriver;
function eager_dispatch(world, parser) {
    let commands = world.get_commands();
    let options = commands.map(cmd => datatypes_1.with_disablable(cmd, c => c.command_name));
    let cmd_name = parser.consume_option(options, 'command', parser_1.DisplayEltType.keyword);
    let result = { parser: parser, world: world };
    if (!cmd_name) {
        return result;
    }
    let command = datatypes_1.unwrap(commands[commands.findIndex(cmd => cmd_name === text_tools_1.untokenize(datatypes_1.unwrap(cmd).command_name))]);
    let cmd_result = command.execute(world, parser);
    return cmd_result;
}
exports.eager_dispatch = eager_dispatch;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const parser_1 = __webpack_require__(2);
const datatypes_1 = __webpack_require__(1);
const text_tools_1 = __webpack_require__(3);
function index_oms(oms) {
    let result = new datatypes_1.FuckDict();
    for (let om of oms) {
        result.set(om.id, om);
    }
    //second/third pass, typecheck em
    let pointed_to = new datatypes_1.FuckDict();
    for (let om of oms) {
        for (let [cmd, om_id] of om.transitions) {
            if (!result.has_key(om_id)) {
                throw `om "${om.id}" has transition to non-existant om "${om_id}"`;
            }
            pointed_to.set(om_id, undefined);
        }
    }
    for (let om of oms.slice(1)) {
        if (!pointed_to.has_key(om.id)) {
            throw `om "${om.id}" is unreachable (and not the first in the list).`;
        }
    }
    return result;
}
let tower_oms = index_oms([{
    id: 'base, from path',
    message: text_tools_1.dedent`<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>

        The viewing tower sits twenty feet inset from the footpath, towards the Mystic River. The grass leading out to it is brown with wear.`,
    transitions: [[['approach', 'the viewing tower'], 'base, regarding tower']]
}, {
    id: 'base, regarding tower',
    message: text_tools_1.dedent`The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.

            A wooden stairway set between the first two rows of columns leads upward.`,
    transitions: [[['climb', 'the stairs'], 'stairs 1, ascending']]
}, {
    id: 'stairs 1, ascending',
    message: text_tools_1.dedent`As you ascend, the ground below you recedes.

            <div class="meditation-1">
            You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:

            "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
            </div>

            The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
    transitions: [[['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'], [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
}, {
    id: 'platform 1, ascending',
    message: text_tools_1.dedent`You catch glimpses of the grass, trees, and the Mystic River as you make your way across.

            <div class="meditation-1">
            You continue reading:

            "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
            </div>

            The platform terminates, and another wooden stairway to the left leads further up the tower.`,
    transitions: [[['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'], [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
}, {
    id: 'stairs 2, ascending',
    message: text_tools_1.dedent`They feel solid under your feet, dull thuds sounding with each step.

            <div class="meditation-1">
            "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
            </div>

            The stairs terminate in another left-branching platform.`,
    transitions: [[['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'], [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
}, {
    id: 'platform 2, ascending',
    message: text_tools_1.dedent`You make your way across the weathered wood.

            <div class="meditation-1">
            "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
            </div>

            A final wooden stairway to the left leads up to the top of the tower.`,
    transitions: [[['turn', 'left', 'and climb the stairs'], 'top, arriving'], [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
}, {
    id: 'top, arriving',
    message: text_tools_1.dedent`You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
    transitions: [[['survey', 'the area'], 'top, surveying'], [['descend', 'the stairs'], 'platform 2, ascending']]
}, {
    id: 'top, surveying',
    message: text_tools_1.dedent`You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.

            You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.

            You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.

            <div class="meditation-1">
            "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
            </div>`,
    transitions: [[['descend', 'the stairs'], 'stairs 3, descending']]
}, {
    id: 'stairs 3, descending',
    message: text_tools_1.dedent`Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.

            <div class="meditation-1">
            "Do not fret, my dear. Return to the madness of life after your brief respite."
            </div>`,
    transitions: [[['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'], [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
}, {
    id: 'platform 2, descending',
    message: text_tools_1.dedent`The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.

            <div class="meditation-1">
            "Expect to forget; to be turned around; to become tangled up."
            </div>`,
    transitions: [[['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'], [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
}, {
    id: 'stairs 2, descending',
    message: text_tools_1.dedent`The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.

            <div class="meditation-1">
            "Find some joy in it; some exhilaration."
            </div>`,
    transitions: [[['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'], [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
}, {
    id: 'platform 1, descending',
    message: text_tools_1.dedent`You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.

            <div class="meditation-1">
            "And know that you have changed, dear. That your ascent has taught you something."
            </div>`,
    transitions: [[['turn', 'right', 'and descend the stairs'], 'base, regarding path'], [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
}, {
    id: 'base, regarding path',
    message: text_tools_1.dedent`What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?

            <i>(End of demo. Thanks for playing!)</i>`,
    transitions: []
}]);
function transitions_to_commands(transitions) {
    return transitions.map(([cmd, next_om_id]) => ({
        command_name: text_tools_1.split_tokens(cmd),
        execute: parser_1.with_early_stopping(function* (world, parser) {
            yield parser.done();
            return {
                world: world.update({
                    current_om: next_om_id
                })
            };
        })
    }));
}
class VenienceWorld {
    constructor({ prev_om, current_om, has_seen, remembered_meditation }) {
        if (prev_om === undefined) {
            prev_om = null;
        }
        if (current_om === undefined) {
            current_om = 'base, from path';
        }
        if (has_seen === undefined) {
            has_seen = new datatypes_1.FuckDict();
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = false;
        }
        this.prev_om = prev_om;
        this.current_om = current_om;
        this.has_seen = has_seen;
        this.remembered_meditation = remembered_meditation;
    }
    update({ prev_om, current_om, has_seen, remembered_meditation }) {
        if (prev_om === undefined) {
            prev_om = this.prev_om;
        }
        if (current_om === undefined) {
            current_om = this.current_om;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = this.remembered_meditation;
        }
        return new VenienceWorld({ prev_om, current_om, has_seen, remembered_meditation });
    }
    handle_command(parser) {
        let world = this;
        return parser_1.with_early_stopping(function* (parser) {
            let om = tower_oms.get(world.current_om);
            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd);
            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }
            let cmd_choice = yield* parser_1.consume_option_stepwise_eager(parser, cmd_options);
            yield parser.done();
            let om_id_choice = world.current_om;
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === text_tools_1.untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });
            return { world: world.update({
                    prev_om: world.current_om,
                    current_om: om_id_choice
                }) };
        })(parser);
    }
    interstitial_update() {
        let result = {};
        let world_update = {};
        let message_parts = [];
        let om_descr = tower_oms.get(this.current_om).message;
        message_parts.push(om_descr);
        if (this.prev_om !== null) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(this.prev_om, true);
            world_update.has_seen = new_has_seen;
        }
        if (this.current_om === 'top, surveying') {
            world_update.remembered_meditation = true;
        }
        if (message_parts.length > 0) {
            result.message = document.createElement('div');
            result.message.innerHTML = message_parts.join('\n\n');
            // if (this.remembered_meditation) {
            //     result.message.querySelectorAll('.meditation-1:not(.enabled)').forEach((n_div) => {
            //         n_div.classList.add('enabled');
            //     });
            // }
        }
        if (Object.keys(world_update).length > 0) {
            result.world = this.update(world_update);
        }
        return result;
    }
    interpret_history(prev_world, prev_message) {
        if (prev_world.has_seen.get(this.current_om)) {
            return datatypes_1.annotate(prev_message, 0);
        }
        if (prev_message === undefined) {
            return;
        }
        if (this.remembered_meditation) {
            let notes = prev_message.querySelectorAll('.meditation-1');
            if (notes.length > 0) {
                let new_message = prev_message.cloneNode(true);
                new_message.querySelectorAll('.meditation-1').forEach(n_div => {
                    n_div.classList.add('enabled');
                });
                let edit_status = 2;
                if (this.current_om !== 'top, surveying') {
                    edit_status = 1;
                }
                return datatypes_1.annotate(new_message, edit_status);
            }
        }
        return;
    }
}
exports.VenienceWorld = VenienceWorld;

/***/ }),
/* 9 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 10 */
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
const ReactTransitionGroup = __webpack_require__(14);
const Text_1 = __webpack_require__(4);
const datatypes_1 = __webpack_require__(1);
const Fade = _a => {
    var { children } = _a,
        props = __rest(_a, ["children"]);
    return React.createElement(ReactTransitionGroup.CSSTransition, Object.assign({ timeout: 700, onExit: d => {
            d.style.maxHeight = `${d.clientHeight}px`;
        }, onEntering: d => {
            d.style.maxHeight = `${d.scrollHeight}px`;
        }, classNames: "fade" }, props), children);
};
exports.History = ({ history, possible_history }) => React.createElement(ReactTransitionGroup.TransitionGroup, null, history.map(hist => {
    let hist_status = datatypes_1.get_annotation(hist, 1);
    let { parser, message, interpretted_message, index } = datatypes_1.unwrap(hist);
    let edit_status = datatypes_1.get_annotation(possible_history[index], 1);
    let key = index.toString() + '_' + hist_status.toString();
    let msg_html = interpretted_message !== undefined ? interpretted_message.innerHTML : message.innerHTML;
    if (index === 0) {
        return React.createElement(Fade, { key: key }, React.createElement("div", { className: `history edit-status-${edit_status}` }, React.createElement("p", null, React.createElement(Text_1.OutputText, { message_html: msg_html }))));
    }
    return React.createElement(Fade, { key: key }, React.createElement("div", { className: `history edit-status-${edit_status}` }, React.createElement(Text_1.ParsedText, { parser: parser }), React.createElement("p", null, React.createElement(Text_1.OutputText, { message_html: msg_html }))));
}));

/***/ }),
/* 11 */
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
const keyboard_tools_1 = __webpack_require__(5);
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
        return React.createElement(InputWrapper, { onClick: () => this.focus() }, React.createElement("input", { onChange: this.handleChange, value: this.state.value, style: input_style, ref: i => this.input = i }), React.createElement(InputDisplay, null, this.props.children, this.state.is_focused ? React.createElement(Cursor, { onClick: () => this.handleSubmit() }) : ''));
    }
}
exports.Prompt = Prompt;

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const keyboard_tools_1 = __webpack_require__(5);
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
                if (this.state.selection_index === -1) {
                    break;
                }
                swallowed_enter = true;
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
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(9);
const Terminal_1 = __webpack_require__(6);
const commands_1 = __webpack_require__(7);
//import {BirdWorld} from '../typescript/bird_world';
const venience_world_1 = __webpack_require__(8);
let world_driver = new commands_1.WorldDriver(new venience_world_1.VenienceWorld({}));
ReactDom.render(React.createElement(Terminal_1.Terminal, { world_driver: world_driver }), document.getElementById('terminal'));

/***/ }),
/* 14 */
/***/ (function(module, exports) {

module.exports = ReactTransitionGroup;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map