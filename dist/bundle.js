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
        //display: 'inline-block',
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
    const elt_style = {};
    const span_style = {};
    return React.createElement("div", { className: "parsed-text", style: {} }, React.createElement(exports.Carat, null), React.createElement("div", { style: style }, parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')), i === typeaheadIndex ? children : ''))));
};
exports.OutputText = props => {
    const { message_html } = props;
    return React.createElement("div", { className: "output-text", dangerouslySetInnerHTML: { __html: message_html } });
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
            let swallowed_enter = this.typeahead_list !== null ? this.typeahead_list.handleKeys(event) : false;
            if (!swallowed_enter) {
                this.prompt.handleKeys(event);
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
            this.prompt.focus();
            this.scrollToPrompt();
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
            this.prompt.input.scrollIntoView({ behavior: "smooth", block: "start", inline: "end" });
        };
        this.state = { world_driver: this.props.world_driver };
    }
    componentDidMount() {
        this.prompt.focus();
    }
    render() {
        return React.createElement("div", { className: "terminal", tabIndex: -1, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc }, React.createElement(History_1.History, { history: this.state.world_driver.history, possible_history: this.state.world_driver.possible_history, onEntered: this.scrollToPrompt }), React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Text_1.ParsedText, { parser: this.currentParser(), typeaheadIndex: this.currentTypeaheadIndex() }, React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t }))));
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
const observer_moments_1 = __webpack_require__(14);
class VenienceWorld {
    constructor({ experiences, history_index, remembered_meditation }) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = false;
        }
        this.experiences = experiences;
        this.history_index = history_index;
        this.remembered_meditation = remembered_meditation;
    }
    update({ experiences, history_index, remembered_meditation }) {
        if (experiences === undefined) {
            experiences = this.experiences;
        }
        if (history_index === undefined) {
            history_index = this.history_index;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = this.remembered_meditation;
        }
        return new VenienceWorld({ experiences, history_index, remembered_meditation });
    }
    current_om() {
        for (let i = this.experiences.length - 1; i >= 0; i--) {
            let exp = this.experiences[i];
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null history.";
    }
    handle_command(parser) {
        let world = this;
        return parser_1.with_early_stopping(function* (parser) {
            let om = observer_moments_1.alcove_oms.get(world.current_om());
            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd);
            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }
            let cmd_choice = yield* parser_1.consume_option_stepwise_eager(parser, cmd_options);
            yield parser.done();
            let om_id_choice = world.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === text_tools_1.untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });
            return { world: world.update({
                    experiences: [...world.experiences, om_id_choice],
                    history_index: world.history_index + 1
                }) };
        })(parser);
    }
    interstitial_update() {
        let result = {};
        let world_update = {};
        let message_parts = [];
        let om_descr = observer_moments_1.alcove_oms.get(this.current_om()).message;
        message_parts.push(om_descr);
        if (this.experiences.length > 0) {
            let loop_idx = this.experiences.indexOf(this.current_om());
            if (loop_idx !== this.experiences.length - 1) {
                let new_experiences = this.experiences.slice().fill(null, loop_idx + 1);
                world_update.experiences = new_experiences;
            }
        }
        if (this.current_om() === 'top, surveying') {
            world_update.remembered_meditation = true;
        }
        if (message_parts.length > 0) {
            result.message = document.createElement('div');
            result.message.innerHTML = message_parts.join('\n\n');
        }
        if (Object.keys(world_update).length > 0) {
            result.world = this.update(world_update);
        }
        return result;
    }
    interpret_history(history_elt) {
        let interp_op = [];
        let current_om = this.current_om();
        let hist_om = history_elt.world.current_om();
        if (current_om === 'bed, awakening 2') {
            let to_forget = ['bed, sleeping 1', 'bed, awakening 1', 'bed, sitting up 1', 'bed, lying down 1', 'bed, sleeping 2'];
            if (datatypes_1.array_fuck_contains(to_forget, hist_om)) {
                interp_op.push({ 'add': 'forgotten' });
            }
        }
        if (current_om === 'alcove, interpreting 1') {
            if (hist_om === 'alcove, beginning interpretation') {
                interp_op.push({ 'add': 'interp-alcove-1-enabled' });
            }
        }
        if (current_om === 'alcove, interpreting 2') {
            if (hist_om === 'alcove, beginning interpretation') {
                interp_op.push({ 'add': 'interp-alcove-2-enabled' });
            }
        }
        if (current_om === 'alcove, interpreting 3') {
            if (hist_om === 'alcove, beginning interpretation') {
                interp_op.push({ 'add': 'interp-alcove-3-enabled' });
            }
        }
        if (this.experiences[history_elt.world.history_index] === null) {
            interp_op.push({ 'add': 'forgotten' });
        }
        if (this.remembered_meditation && history_elt.message !== undefined) {
            let notes = history_elt.message.querySelectorAll('.meditation-1');
            if (notes.length > 0) {
                console.log('enabling meditation on an elt');
                interp_op.push({ 'add': 'meditation-1-enabled' });
            }
        }
        return interp_op;
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
const ReactTransitionGroup = __webpack_require__(15);
const Text_1 = __webpack_require__(4);
const Fade = _a => {
    var { children } = _a,
        props = __rest(_a, ["children"]);
    return React.createElement(ReactTransitionGroup.CSSTransition, Object.assign({ timeout: 700, onExit: d => {
            d.style.maxHeight = `${d.clientHeight}px`;
        }, onEntering: d => {
            // let d_output_text = d.querySelector('.output-text');
            // d_output_text.style.maxHeight = `${d_output_text.scrollHeight}px`
            d.style.maxHeight = `${d.scrollHeight}px`;
        }, classNames: "fade" }, props), children);
};
exports.History = _a => {
    var { history, possible_history } = _a,
        fade_props = __rest(_a, ["history", "possible_history"]);
    return React.createElement(ReactTransitionGroup.TransitionGroup, null, history.map(hist => {
        let { parser, message, message_classes, index } = hist;
        if (message_classes === undefined) {
            message_classes = [];
        }
        let key = index.toString();
        if (message_classes.length > 0) {
            key += '_' + message_classes.join(':');
        }
        let possible_message_classes = possible_history[index].message_classes;
        if (possible_message_classes === undefined) {
            possible_message_classes = [];
        }
        let edit_message_classes = [];
        for (let mc of message_classes) {
            if (possible_message_classes.indexOf(mc) === -1) {
                edit_message_classes.push('removing-' + mc);
            }
        }
        for (let pmc of possible_message_classes) {
            if (message_classes.indexOf(pmc) === -1) {
                edit_message_classes.push('adding-' + pmc);
            }
        }
        let edit_message_class_name = edit_message_classes.join(' ');
        let class_name = 'history ' + edit_message_class_name + ' ' + message_classes.join(' ');
        let msg_html = '';
        if (message !== undefined) {
            msg_html = message.innerHTML;
        }
        if (index === 0) {
            return React.createElement(Fade, Object.assign({ key: key }, fade_props), React.createElement("div", { className: class_name }, React.createElement(Text_1.OutputText, { message_html: msg_html })));
        }
        return React.createElement(Fade, Object.assign({ key: key }, fade_props), React.createElement("div", { className: class_name }, React.createElement(Text_1.ParsedText, { parser: parser }), React.createElement(Text_1.OutputText, { message_html: msg_html })));
    }));
};

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
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(1);
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
// // Alcove
//     'bed, sleeping 1' |
//     'bed, awakening 1' |
//     'bed, sitting up 1' |
//     'bed, lying down 1' |
//     'bed, sleeping 2' |
//     'bed, awakening 2' |
//     'bed, sitting up 2' |
//     'bed, looking around' |
//     'desk, sitting down' |
//     'desk, opening the envelope' |
//     'desk, trying to understand' |
//     'desk, considering the sense of panic' |
//     'desk, searching for the notes' |
//     'grass, slipping further' |
//     'grass, considering the sense of dread' |
//     'grass, asking 1' |
//     'grass, asking 2' |
//     'grass, beginning interpretation' |
//     'grass, interpreting 1' |
//     'grass, interpreting 2' |
//     'grass, interpreting 3' |
//     'grass, ending interpretation' |
//     'alcove, entering the forest' |
exports.alcove_oms = index_oms([{
    id: 'bed, sleeping 1',
    message: '',
    transitions: [[['awaken'], 'bed, awakening 1']]
}, {
    id: 'bed, awakening 1',
    message: 'You awaken in your bed.',
    transitions: [[['sit up'], 'bed, sitting up 1']]
}, {
    id: 'bed, sitting up 1',
    message: `You push yourself upright, blankets falling to your waist. You squint and see only the palest light of dawn. Crickets chirp in the forest bordering your alcove.
        <br /><br />
        Your body still feels heavy with sleep.
        <br /><br />
        Perhaps you’ll doze until the sun rises properly.`,
    transitions: [[['lie down'], 'bed, lying down 1']]
}, {
    id: 'bed, lying down 1',
    message: `Yes, no reason to be up now.
        <br /><br />
        You slide back under the blankets. The autumn breeze cools your face.`,
    transitions: [[['sleep', 'until', 'sunrise'], 'bed, sleeping 2']]
}, {
    id: 'bed, sleeping 2',
    message: `You dream of<br /><br />
        <i>calamity,</i><br /><br />
        a <i>shattered mirror,</i><br /><br />
        an <i>ice-covered mountain,</i><br /><br />
        <div class="interp">and <i>her voice.</i></div>`,
    transitions: [[['awaken'], 'bed, awakening 2']]
}, {
    id: 'bed, awakening 2',
    message: `You awaken in your bed.`,
    transitions: [[['sit up'], 'bed, sitting up 2']]
}, {
    id: 'bed, sitting up 2',
    message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
    transitions: [[['look', 'around'], 'bed, looking around']]
}, {
    id: 'bed, looking around',
    message: `You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
        <br /><br />
        You see your desk and chair a few paces away, in the center of the alcove.
        <br /><br />
        On all sides you are surrounded by trees.`,
    transitions: [[['sit', 'at', 'the desk'], 'desk, sitting down']]
}, {
    id: 'desk, sitting down',
    message: `You pace across the grass and take your seat at the leather-bound study chair.
        <br /><br />
        On the desk is a large parchment envelope, bound in twine.`,
    transitions: [[['open', 'the envelope'], 'desk, opening the envelope']]
}, {
    id: 'desk, opening the envelope',
    message: `You undo the twine, leaving it in a loop on the desk.
        <br /><br />
        You unfold the envelope’s flap.
        <br /><br />
        It’s empty. But it shouldn’t be.`,
    transitions: [[['try', 'to', 'understand'], 'desk, trying to understand']]
}, {
    id: 'desk, trying to understand',
    message: `A panic comes over you. Without your notes, how will you continue your work?
        <br /><br />
        How will you understand? How will you honor Katya’s memory?`,
    transitions: [[['consider', 'the sense of', 'panic'], 'desk, considering the sense of panic']]
}, {
    id: 'desk, considering the sense of panic',
    message: `<div class="interp">
        Katya used to say that panic was like slipping down an ice-covered mountain face.
        <br /><br />
        It throws one particular path into relief: the path to the bottom.
        </div>`,
    transitions: [[['search', 'for', 'the notes'], 'desk, searching for the notes']]
}, {
    id: 'desk, searching for the notes',
    message: `You look in the envelope again.
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
    message: `Thoughts of dread, of a terrible, empty future, fill your mind.
        <br /><br />
        You curl up on the grass beneath you, holding yourself.`,
    transitions: [[['consider', 'the sense of', 'dread'], 'grass, considering the sense of dread']]
}, {
    id: 'grass, considering the sense of dread',
    message: `<div class="interp">
        <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
        </div>`,
    transitions: [[['tell', 'me', 'what?'], 'grass, asking 1']]
}, {
    id: 'grass, asking 1',
    message: `<div class="interp">
        <i>"That you are capable of a great deal of care, my dear.
        <br /><br />
        That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
        </div>`,
    transitions: [[['what', 'should', 'I', 'do?'], 'grass, asking 2']]
}, {
    id: 'grass, asking 2',
    message: `<div class="interp"><i>
        "Judge the direction of gravity. Judge the slickness of the ice.
        <br /><br />
        "Survey the horizon.
        <br /><br />
        "And then, choose where to go."
        </i></div>`,
    transitions: [[['begin', 'interpretation'], 'alcove, beginning interpretation']]
}, {
    id: 'alcove, beginning interpretation',
    message: `A nervous energy buzzes within your mind.
        <div class="interp-alcove-1"
        <br /><br />
        Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to sense of meaning within the world. You have a <i>compass</i>.
        </div>
        <br /><br />
        Your notes are gone.
        <div class="interp-alcove-2">
        <br /><br />
        Your effort to organize and understand everything Katya taught you, over the years. If they are truly gone, it is a great setback.
        <br /><br />
        But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
        </div>
        <br /><br />
        You are alone in a grassy alcove in the forest.
        <div class="interp-alcove-3">
        <br /><br />
        Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
        <br /><br />
        Your view of the horizon is occluded by the trees, from in here. Set out, seeking <i>new vantages.</i>
        </div>`,
    transitions: [[['judge', 'the direction of gravity'], 'alcove, interpreting 1']]
}, {
    id: 'alcove, interpreting 1',
    message: ``,
    transitions: [[['judge', 'the slickness of the ice'], 'alcove, interpreting 2']]
}, {
    id: 'alcove, interpreting 2',
    message: ``,
    transitions: [[['survey', 'the horizon'], 'alcove, interpreting 3']]
}, {
    id: 'alcove, interpreting 3',
    message: ``,
    transitions: [[['end', 'interpretation'], 'alcove, ending interpretation']]
}, {
    id: 'alcove, ending interpretation',
    message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
        <br /><br />
        You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
        <br /><br />
        But your sense of purpose compels you. To go. To seek. To try to understand.`,
    transitions: [[['enter', 'the', 'forest'], 'alcove, entering the forest']]
}, {
    id: 'alcove, entering the forest',
    message: `What lies within the forest, and beyond? What will it be like, out there?
        <br /><br />
        <i>(End of demo. Thanks for playing!)</i>`,
    transitions: []
}]);
exports.tower_oms = index_oms([{
    id: 'base, from path',
    message: `<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>
        <br /><br />
        The viewing tower sits twenty feet inset from the footpath, towards the Mystic River.
        The grass leading out to it is brown with wear.`,
    transitions: [[['approach', 'the viewing tower'], 'base, regarding tower']]
}, {
    id: 'base, regarding tower',
    message: `The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.
            <br /><br />
            A wooden stairway set between the first two rows of columns leads upward.`,
    transitions: [[['climb', 'the stairs'], 'stairs 1, ascending']]
}, {
    id: 'stairs 1, ascending',
    message: `As you ascend, the ground below you recedes.
            <br /><br />
            <div class="meditation-1">
                You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:
                <br /><br />
                "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
                <br /> <br />
            </div>
            The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
    transitions: [[['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'], [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
}, {
    id: 'platform 1, ascending',
    message: `You catch glimpses of the grass, trees, and the Mystic River as you make your way across.
            <br /><br />
            <div class="meditation-1">
            You continue reading:
            <br /><br />
            "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
            <br /><br />
            </div>
            The platform terminates, and another wooden stairway to the left leads further up the tower.`,
    transitions: [[['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'], [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
}, {
    id: 'stairs 2, ascending',
    message: `They feel solid under your feet, dull thuds sounding with each step.
            <br /><br />
            <div class="meditation-1">
            "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
            <br /><br />
            </div>
            The stairs terminate in another left-branching platform.`,
    transitions: [[['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'], [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
}, {
    id: 'platform 2, ascending',
    message: `You make your way across the weathered wood.
            <br /><br />
            <div class="meditation-1">
            "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
            <br /><br />
            </div>
            A final wooden stairway to the left leads up to the top of the tower.`,
    transitions: [[['turn', 'left', 'and climb the stairs'], 'top, arriving'], [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
}, {
    id: 'top, arriving',
    message: `You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
    transitions: [[['survey', 'the area'], 'top, surveying'], [['descend', 'the stairs'], 'platform 2, ascending']]
}, {
    id: 'top, surveying',
    message: `You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
            <br /><br />
            You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
            <br /><br />
            You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
            <br /><br />
            <div class="meditation-1">
            "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
            </div>`,
    transitions: [[['descend', 'the stairs'], 'stairs 3, descending']]
}, {
    id: 'stairs 3, descending',
    message: `Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.
            <br /><br />
            <div class="meditation-1">
            "Do not fret, my dear. Return to the madness of life after your brief respite."
            </div>`,
    transitions: [[['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'], [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
}, {
    id: 'platform 2, descending',
    message: `The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.
            <div class="meditation-1">
            <br /><br />
            "Expect to forget; to be turned around; to become tangled up."
            </div>`,
    transitions: [[['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'], [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
}, {
    id: 'stairs 2, descending',
    message: `The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.
            <div class="meditation-1">
            <br /><br />
            "Find some joy in it; some exhilaration."
            </div>`,
    transitions: [[['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'], [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
}, {
    id: 'platform 1, descending',
    message: `You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.
            <div class="meditation-1">
            <br /><br />
            "And know that you have changed, dear. That your ascent has taught you something."
            </div>`,
    transitions: [[['turn', 'right', 'and descend the stairs'], 'base, regarding path'], [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
}, {
    id: 'base, regarding path',
    message: `What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?
            <br /><br />
            <i>(End of demo. Thanks for playing!)</i>`,
    transitions: []
}]);

/***/ }),
/* 15 */
/***/ (function(module, exports) {

module.exports = ReactTransitionGroup;

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map