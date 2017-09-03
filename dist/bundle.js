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
/******/ 	return __webpack_require__(__webpack_require__.s = 10);
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
// import {Map} from 'immutable';
const datatypes_1 = __webpack_require__(3);
const text_tools_1 = __webpack_require__(2);
exports.horiz_position_word_tokens = [['left'], ['center'], ['right']];
exports.vert_position_word_tokens = [['top'], ['middle'], ['bottom']];
exports.word_2_relative_position = new Map([['left', datatypes_1.RelativePosition.left], ['center', datatypes_1.RelativePosition.center], ['right', datatypes_1.RelativePosition.right], ['top', datatypes_1.RelativePosition.top], ['middle', datatypes_1.RelativePosition.middle], ['bottom', datatypes_1.RelativePosition.bottom]]);
exports.position_word_tokens = exports.horiz_position_word_tokens.concat(exports.vert_position_word_tokens);
exports.word_2_face = new Map([['back', datatypes_1.Face.n], ['front', datatypes_1.Face.s], ['right', datatypes_1.Face.e], ['left', datatypes_1.Face.w], ['top', datatypes_1.Face.t], ['bottom', datatypes_1.Face.b]]);
exports.face_word_tokens = [['back'], ['front'], ['right'], ['left'], ['top'], ['bottom']];
exports.word_2_rend_op = new Map([['remove', datatypes_1.RendOperation.open], ['replace', datatypes_1.RendOperation.close]]);
exports.rend_op_word_tokens = [['remove'], ['replace']];
exports.word_2_dangle_op = new Map([['open', datatypes_1.RendOperation.open], ['close', datatypes_1.RendOperation.close]]);
exports.dangle_op_word_tokens = [['open'], ['close']];
exports.word_2_edge_op = new Map([['cut', datatypes_1.EdgeOperation.cut], ['tape', datatypes_1.EdgeOperation.tape]]);
exports.edge_op_word_tokens = [['cut'], ['tape']];
exports.word_2_edge_dir = new Map([['horizontally', datatypes_1.EdgeDirection.horizontal], ['vertically', datatypes_1.EdgeDirection.vertical]]);
exports.edge_dir_word_tokens = [['horizontally'], ['vertically']];
exports.word_2_degrees = new Map([['left', 270], ['right', 90]]);
exports.rotate_y_word_tokens = [['left'], ['right']];
exports.word_2_dir = new Map([['forward', datatypes_1.Direction.n], ['backward', datatypes_1.Direction.s], ['left', datatypes_1.Direction.w], ['right', datatypes_1.Direction.e]]);
exports.roll_dir_word_tokens = [['forward'], ['backward'], ['left'], ['right']];
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
            if (spec_tok === next_tok.toLowerCase()) {
                match_tokens.push(next_tok);
                match_gaps.push(next_gap);
                pos_offset++;
                continue;
            }
            if (text_tools_1.starts_with(spec_tok, next_tok.toLowerCase())) {
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
    consume_option(option_spec_tokens, name, display = DisplayEltType.option, disabled_option_spec_tokens = []) {
        let partial_matches = [];
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let exact_match = subparser.consume_exact(spec_toks, display, name);
            if (exact_match) {
                this.integrate(subparser);
                return text_tools_1.normalize_whitespace(text_tools_1.untokenize(spec_toks));
            }
            if (subparser.validity === MatchValidity.partial) {
                partial_matches.push(subparser.match[0]);
            }
        }
        let disabled_partial_matches = [];
        for (let disabled_spec_toks of disabled_option_spec_tokens) {
            let subparser = this.subparser();
            let exact_match = subparser.consume_exact(disabled_spec_toks, display, name);
            if (exact_match || subparser.validity === MatchValidity.partial) {
                disabled_partial_matches.push(subparser.match[0]);
            }
        }
        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(de => de.typeahead[0]);
            let disabled_typeahead = disabled_partial_matches.map(de => de.typeahead[0]);
            this.match.push({
                display: DisplayEltType.partial,
                match: partial_matches[0].match,
                typeahead: typeahead,
                name: name,
                disabled_typeahead: disabled_typeahead
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
        if (this.position !== this.tokens.length) {
            return false;
        }
        return this.validity === MatchValidity.valid;
    }
    done() {
        if (this.position !== this.tokens.length) {
            this.validity = MatchValidity.invalid;
            this.match.push({
                display: DisplayEltType.error,
                match: text_tools_1.untokenize(this.tokens.slice(this.position), this.token_gaps.slice(this.position, this.tokens.length))
            });
            this.position = this.tokens.length;
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
function with_early_stopping(gen) {
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
exports.with_early_stopping = with_early_stopping;
function call_with_early_stopping(gen_func) {
    function inner(...args) {
        let gen = gen_func(...args);
        return with_early_stopping(gen);
    }
    return inner;
}
exports.call_with_early_stopping = call_with_early_stopping;
function apply_command(world, cmd) {
    let parser = new CommandParser(cmd);
    let { commands, disabled_commands } = world.get_commands();
    let options = commands.map(cmd => cmd.command_name);
    let disabled_options = disabled_commands.map(cmd => cmd.command_name);
    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword, disabled_options);
    let result = { parser: parser, world: world };
    if (!cmd_name) {
        return result;
    }
    let command = commands[commands.findIndex(cmd => cmd_name === text_tools_1.untokenize(cmd.command_name))];
    let cmd_result = command.execute(world, parser);
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
    }
    result = apply_interstitial_update(result);
    return result;
}
exports.apply_command = apply_command;
function apply_interstitial_update(result) {
    if (result.world.interstitial_update !== undefined) {
        //confusing, but we are running pre_command for the *next* command, not the one that just ran
        let res2 = result.world.interstitial_update();
        if (res2.world !== undefined) {
            result.world = res2.world;
        }
        if (res2.message !== undefined) {
            if (result.message !== undefined) {
                result.message += '\n\n' + res2.message;
            } else {
                result.message = res2.message;
            }
        }
    }
    return result;
}
class WorldDriver {
    constructor(initial_world) {
        let initial_result = { world: initial_world };
        initial_result = apply_interstitial_update(initial_result);
        this.history = [initial_result];
        this.apply_command('', false); //populate this.current_state
    }
    apply_command(cmd, commit = true) {
        let prev_state = this.history[this.history.length - 1];
        let result = apply_command(prev_state.world, cmd);
        this.current_state = result;
        if (commit) {
            this.commit();
        }
        return result;
    }
    commit() {
        let result = this.current_state;
        this.history.push(this.current_state);
        this.apply_command('', false);
        return result;
    }
}
exports.WorldDriver = WorldDriver;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(3);
function uncapitalize(msg) {
    return msg[0].toLowerCase() + msg.slice(1);
}
exports.uncapitalize = uncapitalize;
function capitalize(msg) {
    return msg[0].toUpperCase() + msg.slice(1);
}
exports.capitalize = capitalize;
function face_message(face_order, f_code_2_name) {
    if (f_code_2_name === undefined) {
        f_code_2_name = new Map([[datatypes_1.Face.n, 'back'], [datatypes_1.Face.s, 'front'], [datatypes_1.Face.e, 'right'], [datatypes_1.Face.w, 'left'], [datatypes_1.Face.t, 'top'], [datatypes_1.Face.b, 'bottom']]);
    }
    if (face_order.length == 1) {
        return f_code_2_name.get(face_order[0]) + ' face';
    } else {
        return face_order.slice(0, -1).map(x => f_code_2_name.get(x)).join(', ') + ' and ' + f_code_2_name.get(face_order[face_order.length - 1]) + ' faces';
    }
}
exports.face_message = face_message;
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

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// import {
//     Collection,
//     hash,
//     isImmutable,
//     List,
//     Map,
//     Set
// } from 'immutable';

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
class Edge {
    constructor(start, end) {
        if (end < start) {
            this.start = end;
            this.end = start;
        } else {
            this.start = start;
            this.end = end;
        }
    }
    equals(other) {
        return this.start === other.start && this.end === other.end;
    }
    toString() {
        return `Edge<${this.start},${this.end}>`;
    }
}
exports.Edge = Edge;
var Face;
(function (Face) {
    Face[Face["n"] = 0] = "n";
    Face[Face["s"] = 1] = "s";
    Face[Face["e"] = 2] = "e";
    Face[Face["w"] = 3] = "w";
    Face[Face["t"] = 4] = "t";
    Face[Face["b"] = 5] = "b";
})(Face = exports.Face || (exports.Face = {}));
exports.faces = [Face.n, Face.s, Face.e, Face.w, Face.t, Face.b];
var Direction;
(function (Direction) {
    Direction[Direction["n"] = 0] = "n";
    Direction[Direction["s"] = 1] = "s";
    Direction[Direction["e"] = 2] = "e";
    Direction[Direction["w"] = 3] = "w";
})(Direction = exports.Direction || (exports.Direction = {}));
exports.directions = [Direction.n, Direction.s, Direction.e, Direction.w];
exports.direction_2_face = new Map([[Direction.n, Face.n], [Direction.s, Face.s], [Direction.e, Face.e], [Direction.w, Face.w]]);
class Dangle {
    constructor(partition, edges, fixed_face, free_face) {
        this.partition = partition;
        this.edges = edges;
        this.fixed_face = fixed_face;
        this.free_face = free_face;
    }
    equals(other) {
        return this.partition.keys_equal(other.partition) && arrays_fuck_equal(this.edges, other.edges) && this.fixed_face === other.fixed_face && this.free_face === other.free_face;
    }
    toString() {
        return `Dangle<${this.partition},${this.edges},${this.fixed_face},${this.free_face}>`;
        //let faces_hash = (this.fixed_face << 16) ^ this.free_face; //fuck!
        //return this.partition.hashCode() + this.edges.hashCode() + faces_hash;
    }
}
exports.Dangle = Dangle;
function make_matrix2(data_obj) {
    let dim_y = data_obj.length;
    let dim_x = data_obj[0].length;
    let data = new Int16Array(data_obj.reduce((x, y) => x.concat(y)));
    // TODO complain if the total length is wrong
    return new Matrix2(data, dim_x, dim_y);
}
exports.make_matrix2 = make_matrix2;
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
}
exports.Matrix2 = Matrix2;
var CardboardEdge;
(function (CardboardEdge) {
    CardboardEdge[CardboardEdge["intact"] = 0] = "intact";
    CardboardEdge[CardboardEdge["cut"] = 1] = "cut";
})(CardboardEdge = exports.CardboardEdge || (exports.CardboardEdge = {}));
var TapeEdge;
(function (TapeEdge) {
    TapeEdge[TapeEdge["untaped"] = 0] = "untaped";
    TapeEdge[TapeEdge["taped"] = 1] = "taped";
    TapeEdge[TapeEdge["cut"] = 2] = "cut";
})(TapeEdge = exports.TapeEdge || (exports.TapeEdge = {}));
class EdgeState {
    constructor(cardboard, tape) {
        if (cardboard === undefined) {
            cardboard = CardboardEdge.intact;
        }
        this.cardboard = cardboard;
        if (tape === undefined) {
            tape = TapeEdge.untaped;
        }
        this.tape = tape;
    }
    cut() {
        let new_tape;
        if (this.tape == TapeEdge.taped) {
            new_tape = TapeEdge.cut;
        } else {
            new_tape = this.tape;
        }
        return new EdgeState(CardboardEdge.cut, new_tape);
    }
    apply_tape() {
        return new EdgeState(this.cardboard, TapeEdge.taped);
    }
}
exports.EdgeState = EdgeState;
var EdgeOperation;
(function (EdgeOperation) {
    EdgeOperation[EdgeOperation["cut"] = 0] = "cut";
    EdgeOperation[EdgeOperation["tape"] = 1] = "tape";
})(EdgeOperation = exports.EdgeOperation || (exports.EdgeOperation = {}));
var EdgeDirection;
(function (EdgeDirection) {
    EdgeDirection[EdgeDirection["horizontal"] = 0] = "horizontal";
    EdgeDirection[EdgeDirection["vertical"] = 1] = "vertical";
})(EdgeDirection = exports.EdgeDirection || (exports.EdgeDirection = {}));
var RendState;
(function (RendState) {
    RendState[RendState["closed"] = 0] = "closed";
    RendState[RendState["open"] = 1] = "open";
})(RendState = exports.RendState || (exports.RendState = {}));
var RendOperation;
(function (RendOperation) {
    RendOperation[RendOperation["close"] = 0] = "close";
    RendOperation[RendOperation["open"] = 1] = "open";
})(RendOperation = exports.RendOperation || (exports.RendOperation = {}));
var SpillageLevel;
(function (SpillageLevel) {
    SpillageLevel[SpillageLevel["none"] = 0] = "none";
    SpillageLevel[SpillageLevel["light"] = 1] = "light";
    SpillageLevel[SpillageLevel["heavy"] = 2] = "heavy";
})(SpillageLevel = exports.SpillageLevel || (exports.SpillageLevel = {}));
var Weight;
(function (Weight) {
    Weight[Weight["empty"] = 0] = "empty";
    Weight[Weight["very_light"] = 1] = "very_light";
    Weight[Weight["light"] = 2] = "light";
    Weight[Weight["medium"] = 3] = "medium";
    Weight[Weight["heavy"] = 4] = "heavy";
    Weight[Weight["very_heavy"] = 5] = "very_heavy";
})(Weight = exports.Weight || (exports.Weight = {}));
class Item {
    article() {
        return 'a';
    }
}
exports.Item = Item;
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
var RelativePosition;
(function (RelativePosition) {
    RelativePosition[RelativePosition["left"] = 0] = "left";
    RelativePosition[RelativePosition["center"] = 1] = "center";
    RelativePosition[RelativePosition["right"] = 2] = "right";
    RelativePosition[RelativePosition["top"] = 3] = "top";
    RelativePosition[RelativePosition["middle"] = 4] = "middle";
    RelativePosition[RelativePosition["bottom"] = 5] = "bottom";
})(RelativePosition = exports.RelativePosition || (exports.RelativePosition = {}));
class WreckError extends Error {}
exports.WreckError = WreckError;
// used to signal errors caused by trying to update world state in a way that breaks the reality of the world
// so assumes that commands are already valid, the attempted update *could work* if the state were different
class WorldUpdateError extends WreckError {}
exports.WorldUpdateError = WorldUpdateError;
// used to signal that a command/pseudo command is not specified legally
// the command cannot be executed because it *cannot be interpreted*
class CommandError extends WreckError {}
exports.CommandError = CommandError;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const Terminal_1 = __webpack_require__(7);
// import {Item} from "../typescript/datatypes";
// import * as Items from "../typescript/items";
// import * as World from "../typescript/world";
const commands_1 = __webpack_require__(1);
const bird_world_1 = __webpack_require__(9);
class Game extends React.Component {
    componentWillMount() {
        // let contents: Item[] = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
        // let world = new World.SingleBoxWorld({box: new World.Box({contents: contents})});
        this.world_driver = new commands_1.WorldDriver(new bird_world_1.BirdWorld());
    }
    render() {
        return React.createElement(Terminal_1.Terminal, { world_driver: this.world_driver });
    }
}
exports.Game = Game;

/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 6 */
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
const InputWrapper = props => {
    const { style, children } = props,
          rest = __rest(props, ["style", "children"]);
    const base_style = {
        position: 'relative',
        minHeight: '5em'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, base_style, style) }, rest), children);
};
const InputDisplay = props => {
    const { children, style } = props,
          rest = __rest(props, ["children", "style"]);
    const base_style = {
        worWrap: 'break-word',
        outline: 0,
        display: 'inline-block',
        boxShadow: 'none'
    };
    return React.createElement("span", Object.assign({ style: Object.assign({}, base_style, style) }, rest), children);
};
let keys = {
    enter: 13
};
class Prompt extends React.Component {
    constructor() {
        super(...arguments);
        this.state = { value: '' };
        this.handleSubmit = () => {
            let success = this.props.onSubmit();
            if (success) {
                this.setState({ value: '' });
            }
        };
        // when key down is called by auto complete see if we should just submit
        this.handleKeys = ({ keyCode }) => {
            if (keyCode === keys.enter) {
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
        return React.createElement(InputWrapper, { onClick: () => this.focus() }, React.createElement("input", { onChange: this.handleChange, onKeyDown: this.handleKeys, value: this.state.value, style: input_style, ref: i => this.input = i }), React.createElement(InputDisplay, null, this.props.children, "[]"));
    }
}
exports.Prompt = Prompt;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const Prompt_1 = __webpack_require__(6);
const Text_1 = __webpack_require__(8);
const commands_1 = __webpack_require__(1);
const Carat = () => React.createElement("span", null, ">");
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = () => {
            if (this.isCurrentlyValid()) {
                const output = this.state.world_driver.commit();
                this.setState({ world_driver: this.state.world_driver });
                return true;
            }
            return false;
        };
        this.isCurrentlyValid = () => {
            return this.state.world_driver.current_state.parser.validity === commands_1.MatchValidity.valid;
        };
        this.handlePromptChange = input => {
            console.log(input);
            let result = this.state.world_driver.apply_command(input, false);
            this.setState({ world_driver: this.state.world_driver });
        };
        this.currentTypeahead = () => {
            let current_state = this.state.world_driver.current_state;
            let typeahead = current_state.parser.match[current_state.parser.match.length - 1].typeahead;
            if (typeahead === undefined) {
                return [];
            }
            return typeahead;
        };
        this.focusPrompt = () => {
            this.prompt.focus();
        };
        this.scrollToPrompt = () => {
            if (this.contentContainer.scrollHeight - this.contentContainer.scrollTop > this.contentContainer.clientHeight) {
                this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
            }
        };
        this.state = { world_driver: this.props.world_driver };
    }
    componentDidMount() {
        this.focusPrompt();
    }
    componentDidUpdate() {
        this.focusPrompt();
        this.scrollToPrompt();
    }
    render() {
        const container_style = {
            height: '100%',
            width: '100%',
            overflowY: 'scroll',
            whiteSpace: 'pre-wrap',
            fontFamily: "'Fira Mono'",
            fontSize: '1.5em',
            color: 'ivory',
            background: 'black',
            radius: 3,
            position: 'absolute',
            display: 'block',
            padding: '1em'
        };
        return React.createElement("div", { style: container_style, onClick: this.focusPrompt, ref: cc => this.contentContainer = cc }, this.state.world_driver.history.map(({ parser, message }, i) => {
            if (i === 0) {
                return React.createElement("div", { key: i.toString() }, React.createElement("p", null, React.createElement(Text_1.OutputText, { message: message })));
            }
            return React.createElement("div", { key: i.toString() }, React.createElement("p", null, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: parser })), React.createElement("p", null, React.createElement(Text_1.OutputText, { message: message })));
        }), React.createElement("p", null, React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: this.state.world_driver.current_state.parser, showTypeahead: true }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 8 */
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
const commands_1 = __webpack_require__(1);
const text_tools_1 = __webpack_require__(2);
function get_display_color(det) {
    switch (det) {
        case commands_1.DisplayEltType.keyword:
            return 'aqua';
        case commands_1.DisplayEltType.option:
            return 'orange';
        case commands_1.DisplayEltType.filler:
            return 'ivory';
        case commands_1.DisplayEltType.partial:
            return 'gray';
        case commands_1.DisplayEltType.error:
            return 'red';
    }
}
exports.ParsedText = props => {
    let { parser, showTypeahead } = props,
        rest = __rest(props, ["parser", "showTypeahead"]);
    if (showTypeahead === undefined) {
        showTypeahead = false;
    }
    let style = {
        display: 'inline-block',
        whiteSpace: 'pre-wrap',
        position: 'relative'
    };
    let validity = parser.validity;
    if (validity === commands_1.MatchValidity.valid) {
        style.fontWeight = '900';
        style.fontStyle = 'italic';
    } else {
        style.fontWeight = '100';
        if (validity === commands_1.MatchValidity.invalid) {
            style.opacity = '0.6';
        }
    }
    let typeahead = [];
    let disabled_typeahead = [];
    if (showTypeahead && parser.match.length > 0) {
        let last_match = parser.match[parser.match.length - 1];
        if ((last_match.match !== '' || parser.match.length === 1) && last_match.typeahead !== undefined) {
            typeahead = last_match.typeahead;
            if (last_match.disabled_typeahead !== undefined) {
                disabled_typeahead = last_match.disabled_typeahead;
            }
        }
    }
    let elt_style = {
        display: 'inline-block'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, style) }, rest), parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: { display: 'inline-block' } }, elt.match), showTypeahead && i == parser.match.length - 1 && typeahead.length > 0 ? React.createElement(exports.TypeaheadList, { typeahead: typeahead, disabled_typeahead: disabled_typeahead, indentation: text_tools_1.get_indenting_whitespace(elt.match) }) : '')));
};
exports.TypeaheadList = props => {
    const { typeahead, disabled_typeahead, indentation } = props;
    const style = {
        position: "absolute",
        listStyleType: "none",
        padding: 0,
        margin: 0,
        whiteSpace: 'pre'
    };
    const n_typeahead = typeahead.length;
    return React.createElement("ul", { style: style }, typeahead.map((option, i) => React.createElement("li", { key: i.toString(), style: { marginTop: '1em' } }, React.createElement("span", null, indentation), React.createElement("span", null, option))), disabled_typeahead.map((option, i) => React.createElement("li", { key: (i + n_typeahead).toString(), style: { opacity: 0.4, marginTop: '1em' } }, React.createElement("span", null, indentation), React.createElement("span", null, option))));
};
exports.OutputText = props => {
    const { message, style } = props,
          rest = __rest(props, ["message", "style"]);
    const base_style = {
        display: 'inline-block',
        whiteSpace: 'pre-wrap'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, base_style, style) }, rest), message !== undefined ? message : '');
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __webpack_require__(1);
const text_tools_1 = __webpack_require__(2);
class BirdWorld {
    constructor(is_in_heaven = false) {
        this.is_in_heaven = is_in_heaven;
    }
    update(is_in_heaven = false) {
        return new BirdWorld(is_in_heaven);
    }
    get_commands() {
        let commands = [];
        let disabled_commands = [];
        commands.push(go_cmd);
        if (this.is_in_heaven) {
            commands.push(mispronounce_cmd);
        } else {
            disabled_commands.push(mispronounce_cmd);
        }
        return { commands, disabled_commands };
    }
    interstitial_update() {
        return { message: this.is_in_heaven ? "You're in Heaven. There's a bird up here. His name is Zarathustra. He is ugly." : "You're standing around on the earth."
        };
    }
}
exports.BirdWorld = BirdWorld;
const go_cmd = {
    command_name: ['go'],
    execute: commands_1.call_with_early_stopping(function* (world, parser) {
        let dir_options = [];
        let disabled_options = [];
        if (world.is_in_heaven) {
            dir_options.push(['down']);
            disabled_options.push(['up']);
        } else {
            dir_options.push(['up']);
            disabled_options.push(['down']);
        }
        let dir_word = yield parser.consume_option(dir_options, undefined, undefined, disabled_options);
        yield parser.done();
        let new_world = world.update(!world.is_in_heaven);
        let message = text_tools_1.capitalize(dir_word) + ' you go.';
        return { world: new_world, message: message };
    })
};
const mispronounce_cmd = {
    command_name: ['mispronounce'],
    execute: commands_1.call_with_early_stopping(function* (world, parser) {
        let specifier_word = yield parser.consume_option([["zarathustra's"]]);
        yield parser.consume_filler(['name']);
        let utterance_options = ['Zammersretter', 'Hoosterzaro', 'Rooster Thooster', 'Thester Zar', 'Zerthes Threstine'];
        let message = `"${text_tools_1.random_choice(utterance_options)}," you say.`;
        return { world, message };
    })
};

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(5);
const Game_1 = __webpack_require__(4);
ReactDom.render(React.createElement(Game_1.Game, null), document.getElementById('game'));
// import {List, Map} from 'immutable';
// import {CityKey, Codex, Pinecone} from './items';
// import {Item} from './datatypes';
// import {Box, SingleBoxWorld} from './world';
// import {MatchValidity, DisplayElt, DisplayEltType, WorldDriver, CommandParser, CommandResult} from './commands';
// import {last, tokenize} from './text_tools';
// declare var jQuery: any;
// // previous command handler func (first arg to .terminal() )
// // function(command: string) {
// //         if (command !== '') {
// //             try {
// //                 //hold on to parser object
// //                 //highlight matched bits of command
// //                 //offer autocomplete solutions
// //                 let result = world_driver.run(command);
// //                 if (result !== undefined) {
// //                     this.echo(new String(result));
// //                 }
// //             } catch(e) {
// //                 this.error(new String(e));
// //             }
// //         } else {
// //            this.echo('');
// //         }
// //     }
// export let elt_color = Map<DisplayEltType, string>().asMutable();
// elt_color.set(DisplayEltType.keyword, 'white');
// elt_color.set(DisplayEltType.option, 'blue');
// elt_color.set(DisplayEltType.filler, 'gray');
// elt_color.set(DisplayEltType.partial, 'gray');
// elt_color.set(DisplayEltType.error, 'red');
// setTimeout(function () {
//     jQuery(function($: any) {
//         let contents = List<Item>([new Codex(), new Pinecone(), new CityKey()]);
//         let world = new SingleBoxWorld({box: new Box({contents: contents})});
//         let world_driver = new WorldDriver(world);
//         let current_result = world_driver.current_state;
//         var ul: any;
//         function format_command(command: string) {
//             // TODO: don't apply to non-command strings
//             if ($.terminal.have_formatting(command)){
//                 return command;
//             }
//             command = command.replace(/(\s|&nbsp;)/g, ' ');
//             let result = world_driver.run(command, false);
//             let pos = 0;
//             let parser = result.parser;
//             let valid_fmt = '';
//             if (parser.validity === MatchValidity.valid){
//                 valid_fmt = 'b';
//             }
//             let formatted = '';
//             for (let elt of parser.match) {
//                 if (elt.match.length > 0){
//                     formatted += `[[${valid_fmt};${elt_color.get(elt.display)};]${elt.match}]`;
//                     pos += elt.match.length;
//                 }
//                 while (true){
//                     //eat the spaces
//                     let c = command.charAt(pos);
//                     if (c.match(' ') !== null){
//                         formatted += c;
//                         pos += 1;
//                     } else {
//                         break;
//                     }
//                 }
//             }
//             return formatted;
//         }
//         // $.terminal.defaults.formatters.push(format_command)
//         function format_command_with_prompt(command:string){
//             let naked_command = command.slice(2);
//             return '> ' + format_command(naked_command);
//         }
//         function update_typeahead(terminal: any) {
//             // TODO: distinguish enabled & disabled typeahead
//             let command = terminal.get_command();
//             ul.empty();
//             let result = world_driver.run(command, false);
//             let parser = result.parser;
//             if (parser.validity === MatchValidity.partial){
//                 let m = last(parser.match);
//                 ul.hide();
//                 let com_end = last(command);
//                 if (m.match.length === 0 && com_end !== undefined && com_end.match(/(\s|&nbsp;)/) === null){
//                     return;
//                 }
//                 for (let t of m.typeahead){
//                     $('<li>' + t + '</li>').appendTo(ul);
//                 }
//                 ul.show();
//             }
//         }
//         function exec_command(command: string, terminal: any) {
//             let result = world_driver.run(command, true);
//             let parser = result.parser;
//             $.terminal.defaults.formatters.pop()
//             $.terminal.defaults.formatters.push(format_command_with_prompt);
//             terminal.echo('> ' + command);
//             $.terminal.defaults.formatters.pop();
//             if (result.message !== undefined){
//                 terminal.echo(result.message);
//                 terminal.echo(' ');
//             }
//             $.terminal.defaults.formatters.push(format_command);
//         }
//         function handle_keydown(e: any, terminal: any) {
//             setTimeout(function () {
//                 let command = terminal.get_command();
//             })
//         }
//         $('#term').terminal(exec_command, {
//             greetings: '[[;white;]Demo Parser Interface for The Wreck]',
//             name: 'wreck_demo',
//             height: 500,
//             //prompt: '> ',
//             onInit: function(term: any) {
//                 var wrapper = term.cmd().find('.cursor').wrap('<span/>').parent()
//                     .addClass('cmd-wrapper');
//                 ul = $('<ul></ul>').appendTo(wrapper);
//                 ul.on('click', 'li', function() {
//                     let txt = $(this).text();
//                     let cur_word = term.before_cursor(true);
//                     term.insert(txt.replace(cur_word, '') + ' ');
//                     ul.empty();
//                     setTimeout(function () {update_typeahead(term);}, 0);
//                 });
//                 setTimeout(function () {update_typeahead(term);}, 0);
//             },
//             keydown: function(e: any, terminal: any) {
//                 // setTimeout because terminal is adding characters in keypress
//                 // we use keydown because we need to prevent default action for
//                 // tab and still execute custom code
//                 setTimeout(function() {
//                     update_typeahead(terminal);
//                 }, 0);
//             },
//             onBlur: function() {
//                 return false;
//             },
//             memory: true,
//             echoCommand: false,
//             wordAutocomplete: true
//         });
//     });
// }, 0);

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map