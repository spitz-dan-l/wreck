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
/* 1 */
/***/ (function(module, exports) {

module.exports = React;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
// import {Map} from 'immutable';
const datatypes_1 = __webpack_require__(0);
const text_tools_1 = __webpack_require__(4);
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
        [this.tokens, this.token_positions] = text_tools_1.tokenize(command);
    }
    consume_exact(spec_tokens, display = DisplayEltType.keyword, name) {
        if (spec_tokens.length === 0) {
            throw new Error("Can't consume an empty spec.");
        }
        let offset = this.token_positions[this.position];
        let match_tokens = [];
        let match_token_positions = [];
        let pos_offset = 0;
        for (let spec_tok of spec_tokens) {
            if (this.position + pos_offset === this.tokens.length) {
                this.validity = MatchValidity.partial;
                break; //partial validity
            }
            let next_tok = this.tokens[this.position + pos_offset];
            let next_tok_pos = this.token_positions[this.position + pos_offset];
            if (spec_tok === next_tok) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
                pos_offset++;
                continue;
            }
            if (text_tools_1.starts_with(spec_tok, next_tok)) {
                match_tokens.push(next_tok);
                match_token_positions.push(next_tok_pos);
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
                match: text_tools_1.untokenize(match_tokens, match_token_positions),
                offset: offset,
                name: name
            });
            return true;
        }
        if (this.validity === MatchValidity.partial) {
            if (this.position === this.tokens.length) {
                this.match.push({
                    display: DisplayEltType.partial,
                    match: text_tools_1.untokenize(match_tokens, match_token_positions),
                    offset: offset,
                    typeahead: [text_tools_1.untokenize(spec_tokens)],
                    name: name
                });
                return false;
            } else {
                this.validity = MatchValidity.invalid;
            }
        }
        match_tokens.push(...this.tokens.slice(this.position));
        match_token_positions.push(...this.token_positions.slice(this.position));
        this.position = this.tokens.length;
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_positions),
            offset: offset,
            name: name
        });
        return false;
    }
    subparser() {
        return new CommandParser(text_tools_1.untokenize(this.tokens.slice(this.position)));
    }
    integrate(subparser) {
        this.position += subparser.position;
        this.match.push(...subparser.match);
        this.validity = subparser.validity;
    }
    consume_option(option_spec_tokens, name, display = DisplayEltType.option) {
        let offset = this.token_positions[this.position];
        let partial_matches = [];
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let exact_match = subparser.consume_exact(spec_toks, display, name);
            if (exact_match) {
                this.integrate(subparser);
                // this.match.push(subparser.match[0]);
                // this.position += subparser.position;
                return text_tools_1.normalize_whitespace(subparser.match[0].match);
            }
            if (subparser.validity === MatchValidity.partial) {
                partial_matches.push(subparser.match[0]);
            }
        }
        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(de => de.typeahead[0]);
            this.match.push({
                display: DisplayEltType.partial,
                match: partial_matches[0].match,
                offset: offset,
                typeahead: typeahead,
                name: name
            });
            return false;
        }
        this.validity = MatchValidity.invalid;
        let match_tokens = this.tokens.slice(this.position);
        let match_token_positions = this.token_positions.slice(this.position);
        this.match.push({
            display: DisplayEltType.error,
            match: text_tools_1.untokenize(match_tokens, match_token_positions),
            offset: offset,
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
                match: text_tools_1.untokenize(this.tokens.slice(this.position)),
                offset: this.token_positions[this.position]
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
function apply_command(world, cmd) {
    let parser = new CommandParser(cmd);
    let command_map = world.get_command_map();
    let options = Array.from(command_map.values()).map(v => v.command_name);
    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword);
    let result = { parser: parser, world: world };
    if (!cmd_name) {
        return result;
    }
    let command = command_map.get(cmd_name);
    let cmd_result = command.execute(world, parser);
    if (cmd_result !== undefined) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }
    }
    return result;
}
exports.apply_command = apply_command;
class WorldDriver {
    constructor(initial_world) {
        this.history = [{ world: initial_world }];
        this.apply_command('', false); //populate this.current_state
    }
    apply_command(cmd, commit = true) {
        let prev_state = this.history[this.history.length - 1];
        let result = apply_command(prev_state.world, cmd);
        console.log(cmd);
        console.log(result.message);
        console.log(result);
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(0);
class Codex extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.medium;
    }
    name() {
        return 'codex';
    }
    pre_gestalt() {
        return 'something thick and aged';
    }
    post_gestalt() {
        return 'a thick, rotten codex with strange markings on the front';
    }
}
exports.Codex = Codex;
class CityKey extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.light;
    }
    name() {
        return 'Key to the City';
    }
    pre_gestalt() {
        return 'something glistening and golden';
    }
    post_gestalt() {
        return 'a large, heavy golden key';
    }
    article() {
        return 'the';
    }
}
exports.CityKey = CityKey;
class Pinecone extends datatypes_1.Item {
    weight() {
        return datatypes_1.Weight.very_light;
    }
    name() {
        return 'pinecone';
    }
    pre_gestalt() {
        return 'something small, brown and flaky';
    }
    post_gestalt() {
        return 'a small, brown pinecone that smells of the outdoors';
    }
}
exports.Pinecone = Pinecone;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(0);
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
    let pat = /[\S\0]+/g;
    let tokens = [];
    let token_indexes = [];
    let match;
    while ((match = pat.exec(s)) !== null) {
        tokens.push(match[0]);
        token_indexes.push(match.index);
    }
    return [tokens, token_indexes];
}
exports.tokenize = tokenize;
function untokenize(tokens, token_positions) {
    if (token_positions === undefined) {
        return tokens.join(' ');
    }
    let result = '';
    for (let i = 0; i < tokens.length; i++) {
        let cur_pos = result.length;
        let target_pos = token_positions[i];
        let padding = target_pos - cur_pos;
        result += ' '.repeat(padding);
        result += tokens[i];
    }
    return result;
}
exports.untokenize = untokenize;
function normalize_whitespace(s) {
    return s.replace(/\s+/g, ' ');
}
exports.normalize_whitespace = normalize_whitespace;
function last(x) {
    return x[x.length - 1];
}
exports.last = last;

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __rest = this && this.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(1);
// Internal
const Prompt_1 = __webpack_require__(7);
const Text_1 = __webpack_require__(8);
const Items = __webpack_require__(3);
const World = __webpack_require__(11);
const commands_1 = __webpack_require__(2);
const Carat = props => {
    const { style } = props,
          rest = __rest(props, ["style"]);
    const base_style = {
        fontFamily: "'Fira Mono', 'monospace'",
        fontSize: '1em',
        color: 'ivory'
    };
    return React.createElement("span", Object.assign({ style: Object.assign({}, base_style, style) }, rest), ">");
};
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleSubmit = () => {
            //console.log(input);
            if (this.isCurrentlyValid()) {
                const output = this.state.world_driver.commit();
                this.setState({ world_driver: this.state.world_driver });
                this.scrollToPrompt();
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
            this.scrollToPrompt();
        };
        this.currentAutocomplete = () => {
            let current_state = this.state.world_driver.current_state;
            return current_state.parser.match[current_state.parser.match.length - 1].typeahead;
        };
        this.focusPrompt = () => {
            this.prompt.focus();
        };
        this.scrollToPrompt = () => {
            this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
        };
        let contents = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
        let world = new World.SingleBoxWorld({ box: new World.Box({ contents: contents }) });
        this.state = { world_driver: new commands_1.WorldDriver(world) };
    }
    componentDidMount() {
        this.focusPrompt();
    }
    render() {
        const container_style = {
            height: '100%',
            width: '100%',
            overflowY: 'scroll',
            whiteSpace: 'pre-wrap',
            fontFamily: "'Fira Mono', 'monospace'",
            fontSize: '1em',
            color: 'ivory',
            background: 'black',
            radius: 3,
            position: 'absolute',
            display: 'block'
        };
        return React.createElement("div", { style: container_style, onClick: this.focusPrompt, ref: cc => this.contentContainer = cc }, this.state.world_driver.history.map(({ parser, message }, i) => {
            if (i === 0) {
                return false; //don't display first hist element, it empty
            }
            return React.createElement("div", { key: i }, React.createElement("p", null, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: parser })), React.createElement("p", null, React.createElement(Text_1.OutputText, { message: message })));
        }), React.createElement("p", null, React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: this.state.world_driver.current_state.parser }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 6 */
/***/ (function(module, exports) {

module.exports = ReactDOM;

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var __rest = this && this.__rest || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0) t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function") for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0) t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(1);
const InputWrapper = props => {
    const { style, children } = props,
          rest = __rest(props, ["style", "children"]);
    const base_style = {
        position: 'relative'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, base_style, style) }, rest), children);
};
// //need a class to get ref
// class Input extends React.Component<any, any> {
//   render () {
//     const {style, ...rest} = this.props;
//     const input_style = {
//       position: 'absolute',
//       left: '-16px',
//       top: 0,
//       width: 0,
//       height: 0,
//       background: 'transparent',
//       border: 'none',
//       color: 'transparent',
//       outline: 'none',
//       padding: 0,
//       resize: 'none',
//       zIndex: -1,
//       overflow: 'hidden'
//     };
//     return (
//       <input style={{...base_style, ...style}} {...rest} />
//     );
//   }
// }
const InputDisplay = props => {
    const { children, style } = props,
          rest = __rest(props, ["children", "style"]);
    const base_style = {
        worWrap: 'break-word',
        outline: 0,
        // minHeight: '2em',
        // minWidth: '10em',
        display: 'inline-block',
        // padding: '.5em 2em .5em 1em',
        color: 'ivory',
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
        this.state = { value: '' }; //meta is an object with isValid bool, and autocomplete array
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
        console.log(this.state.value);
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
const React = __webpack_require__(1);
exports.ParsedText = props => {
    const { parser, style } = props,
          rest = __rest(props, ["parser", "style"]);
    const base_style = {
        display: 'inline-block',
        fontFamily: "'Fira Mono', 'monospace'",
        fontSize: '1em',
        color: 'ivory',
        whiteSpace: 'pre-wrap'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, base_style, style) }, rest), parser !== undefined ? parser.command : '');
};
exports.OutputText = props => {
    const { message, style } = props,
          rest = __rest(props, ["message", "style"]);
    const base_style = {
        display: 'inline-block',
        fontFamily: "'Fira Mono', 'monospace'",
        fontSize: '1em',
        color: 'ivory',
        whiteSpace: 'pre-wrap'
    };
    return React.createElement("div", Object.assign({ style: Object.assign({}, base_style, style) }, rest), message !== undefined ? message : '');
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const datatypes_1 = __webpack_require__(0);
// import {is, List, Map, Set} from 'immutable';
let face_vertices = new Map([[datatypes_1.Face.t, datatypes_1.make_matrix2([[0, 1, 2], [9, 25, 15], [16, 24, 22]])], [datatypes_1.Face.b, datatypes_1.make_matrix2([[20, 19, 18], [13, 12, 11], [8, 7, 6]])], [datatypes_1.Face.n, datatypes_1.make_matrix2([[2, 1, 0], [5, 4, 3], [8, 7, 6]])], [datatypes_1.Face.e, datatypes_1.make_matrix2([[22, 15, 2], [21, 14, 5], [20, 13, 8]])], [datatypes_1.Face.s, datatypes_1.make_matrix2([[16, 24, 22], [17, 23, 21], [18, 19, 20]])], [datatypes_1.Face.w, datatypes_1.make_matrix2([[0, 9, 16], [3, 10, 17], [6, 11, 18]])]]);
let face_quadrants = new Map([[datatypes_1.Face.t, datatypes_1.make_matrix2([[0, 1], [2, 3]])], [datatypes_1.Face.b, datatypes_1.make_matrix2([[4, 5], [6, 7]])], [datatypes_1.Face.n, datatypes_1.make_matrix2([[8, 9], [10, 11]])], [datatypes_1.Face.e, datatypes_1.make_matrix2([[12, 13], [14, 15]])], [datatypes_1.Face.s, datatypes_1.make_matrix2([[16, 17], [18, 19]])], [datatypes_1.Face.w, datatypes_1.make_matrix2([[20, 21], [22, 23]])]]);
function build_edge_quadrant_mappings() {
    let quadrant_2_edges = new Map();
    let edge_2_quadrants = new datatypes_1.FuckDict();
    for (let f of datatypes_1.faces) {
        let vs = face_vertices.get(f);
        let qs = face_quadrants.get(f);
        for (let [x, y] of [[0, 0], [1, 0], [0, 1], [1, 1]]) {
            let q_edges = get_quadrant_edges(vs, x, y);
            quadrant_2_edges = quadrant_2_edges.set(qs.get(x, y), q_edges);
            q_edges.forEach(function (qe) {
                let q = qs.get(x, y);
                if (edge_2_quadrants.has_key(qe)) {
                    edge_2_quadrants.get(qe).push(q);
                } else {
                    edge_2_quadrants.set(qe, [q]);
                }
            });
        }
    }
    return [quadrant_2_edges, edge_2_quadrants];
}
function get_quadrant_edges(m, x, y) {
    let offsets = [[0, 0, 0, 1], [0, 0, 1, 0], [1, 1, 0, 1], [1, 1, 1, 0]];
    let edges = [];
    for (let [x1, y1, x2, y2] of offsets) {
        let e1 = m.get(x + x1, y + y1);
        let e2 = m.get(x + x2, y + y2);
        if (e2 < e1) {
            edges.push(new datatypes_1.Edge(e2, e1));
        } else {
            edges.push(new datatypes_1.Edge(e1, e2));
        }
    }
    return edges;
}
_a = build_edge_quadrant_mappings(), exports.quadrant_2_edges = _a[0], exports.edge_2_quadrants = _a[1];
function get_quadrant_partition(quadrant, cut_edges) {
    let current_partition = new datatypes_1.FuckDict([[quadrant, undefined]]);
    let horizon = exports.quadrant_2_edges.get(quadrant).slice();
    while (horizon.length > 0) {
        let e = horizon.shift();
        if (datatypes_1.array_fuck_contains(cut_edges, e)) {
            continue;
        }
        let next_qs = exports.edge_2_quadrants.get(e);
        let new_qs = next_qs.filter(q => !current_partition.has_key(q));
        if (new_qs.length > 0) {
            new_qs.forEach(function (q) {
                horizon.push(...exports.quadrant_2_edges.get(q));
                current_partition.set(q, undefined);
            });
        }
    }
    return current_partition;
}
function range(x) {
    let arr = [];
    for (let i = 0; i < x; i++) {
        arr.push(i);
    }
    return arr;
}
function get_partitions(cut_edges) {
    let partitions = [];
    let quadrants = range(24);
    while (quadrants.length > 0) {
        let q = quadrants.shift();
        let partition = get_quadrant_partition(q, cut_edges);
        partitions.push(partition);
        quadrants = quadrants.filter(q => !partition.has_key(q));
    }
    return partitions;
}
class FaceMesh {
    constructor(vertices, quadrants) {
        this.vertices = vertices;
        this.quadrants = quadrants;
    }
    rotate(degrees) {
        return new FaceMesh(this.vertices.rotate(degrees), this.quadrants.rotate(degrees));
    }
}
exports.FaceMesh = FaceMesh;
class BoxMesh {
    constructor({ dimensions, face_meshes, cut_edges }) {
        this.dimensions = dimensions;
        if (face_meshes === undefined) {
            face_meshes = new Map();
            for (let f of datatypes_1.faces) {
                face_meshes = face_meshes.set(f, new FaceMesh(face_vertices.get(f), face_quadrants.get(f)));
            }
        }
        this.face_meshes = face_meshes;
        if (cut_edges === undefined) {
            cut_edges = [];
        }
        this.cut_edges = cut_edges;
    }
    update({ dimensions, face_meshes, cut_edges }) {
        if (dimensions === undefined) {
            dimensions = this.dimensions;
        }
        if (face_meshes === undefined) {
            face_meshes = this.face_meshes;
        }
        if (cut_edges === undefined) {
            cut_edges = this.cut_edges;
        }
        return new BoxMesh({ dimensions, face_meshes, cut_edges });
    }
    cut(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.cut, face, start, end);
    }
    tape(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.tape, face, start, end);
    }
    cut_or_tape(operation, face, start, end) {
        let [x1, y1] = start;
        let [x2, y2] = end;
        if (Math.abs(x2 - x1) + Math.abs(y2 - y1) != 1) {
            throw `start and end points of cut/tape are not adjacent: ${start} and ${end}`;
        }
        let f = this.face_meshes.get(face).vertices;
        let fs = f.get(x1, y1);
        let fe = f.get(x2, y2);
        let new_edge = new datatypes_1.Edge(fs, fe);
        let new_cut_edges = this.cut_edges.slice();
        if (operation == datatypes_1.EdgeOperation.cut && !datatypes_1.array_fuck_contains(new_cut_edges, new_edge)) {
            new_cut_edges.push(new_edge);
        }
        if (operation == datatypes_1.EdgeOperation.tape && datatypes_1.array_fuck_contains(new_cut_edges, new_edge)) {
            new_cut_edges.splice(new_cut_edges.indexOf(new_edge), 1);
        }
        return this.update({ cut_edges: new_cut_edges });
    }
    get_rends() {
        return get_partitions(this.cut_edges);
    }
    get_free_rends() {
        return this.get_rends().filter(x => !this.is_partition_fixed(x));
    }
    is_partition_fixed(partition) {
        let face_membership = this.get_partition_face_membership(partition);
        return face_membership.get(datatypes_1.Face.b) > 0;
    }
    get_partition_face_membership(partition) {
        let face_membership = new Map();
        for (let f of datatypes_1.faces) {
            let total = 0;
            let quadrants = this.face_meshes.get(f).quadrants;
            for (let q of partition.keys_array()) {
                if (quadrants.contains(q)) {
                    total += 1;
                }
            }
            face_membership.set(f, total);
        }
        return face_membership;
    }
    get_quadrant_face(quadrant) {
        for (let f of datatypes_1.faces) {
            if (this.face_meshes.get(f).quadrants.contains(quadrant)) {
                return f;
            }
        }
    }
    get_dangles() {
        let rends = this.get_rends();
        let fixed_rends = rends.filter(x => this.is_partition_fixed(x));
        let dangles = [];
        let inner_this = this;
        this.get_box_edges().forEach(function ([e1, e2]) {
            let e_2_q_2_f = new datatypes_1.FuckDict();
            for (let e of [e1, e2]) {
                let inner_map = new datatypes_1.FuckDict();
                exports.edge_2_quadrants.get(e).forEach(function (q) {
                    inner_map.set(q, inner_this.get_quadrant_face(q));
                });
                e_2_q_2_f.set(e, inner_map);
            }
            let edge_dangles = [];
            for (let es of [[e1, e2], [e1], [e2]]) {
                let new_cut_edges = inner_this.cut_edges.slice();
                new_cut_edges.push(...es);
                let new_partitions = get_partitions(new_cut_edges);
                if (new_partitions.length != rends.length) {
                    new_partitions.forEach(function (np) {
                        if (datatypes_1.array_fuck_contains(rends, np)) {
                            return;
                        }
                        if (inner_this.is_partition_fixed(np)) {
                            return;
                        }
                        let any_intersections = false;
                        fixed_rends.forEach(function (fixed_rend) {
                            if (np.keys_intersect(fixed_rend).length > 0) {
                                any_intersections = true;
                            }
                        });
                        if (!any_intersections) {
                            return;
                        }
                        let any_dangle_matches = false;
                        edge_dangles.forEach(function (ed) {
                            if (np.keys_equal(ed.partition)) {
                                any_dangle_matches = true;
                                return;
                            }
                        });
                        if (any_dangle_matches) {
                            return;
                        }
                        let q_2_fs = [];
                        for (let e of es) {
                            q_2_fs.push(e_2_q_2_f.get(e));
                        }
                        let fixed_fs = [];
                        let dangle_fs = [];
                        q_2_fs.forEach(function (q_2_f) {
                            q_2_f.entries_array().forEach(function ([q, f]) {
                                if (np.has_key(q)) {
                                    dangle_fs.push(f);
                                } else {
                                    fixed_fs.push(f);
                                }
                            });
                        });
                        if (new Set(fixed_fs).size != 1 || new Set(dangle_fs).size != 1) {
                            return;
                        }
                        edge_dangles.push(new datatypes_1.Dangle(np, es, fixed_fs[0], dangle_fs[0]));
                    });
                }
            }
            dangles.push(...edge_dangles);
        });
        dangles = dangles.sort((x, y) => x.partition.size - y.partition.size);
        let final_dangles = [];
        for (let i = 0; i < dangles.length; i++) {
            let p = dangles[i].partition;
            let any_supersets = false;
            dangles.slice(i + 1).forEach(function (d) {
                if (p.keys_subset(d.partition)) {
                    any_supersets = true;
                }
            });
            if (!any_supersets) {
                final_dangles.push(dangles[i]);
            }
        }
        return final_dangles;
    }
    get_box_edges() {
        let edges = [];
        let t_b_edge_coords = [[[0, 0], [0, 1], [0, 2]], [[0, 0], [1, 0], [2, 0]], [[2, 0], [2, 1], [2, 2]], [[0, 2], [1, 2], [2, 2]]];
        for (let f of [datatypes_1.Face.t, datatypes_1.Face.b]) {
            let m = this.face_meshes.get(f).vertices;
            for (let [[p1x, p1y], [p2x, p2y], [p3x, p3y]] of t_b_edge_coords) {
                let v1 = m.get(p1x, p1y);
                let v2 = m.get(p2x, p2y);
                let v3 = m.get(p3x, p3y);
                let e1 = new datatypes_1.Edge(v1, v2);
                let e2 = new datatypes_1.Edge(v2, v3);
                edges.push([e1, e2]);
            }
        }
        for (let f of [datatypes_1.Face.n, datatypes_1.Face.e, datatypes_1.Face.s, datatypes_1.Face.w]) {
            let m = this.face_meshes.get(f).vertices;
            let v1 = m.get(0, 0);
            let v2 = m.get(0, 1);
            let v3 = m.get(0, 2);
            let e1 = new datatypes_1.Edge(v1, v2);
            let e2 = new datatypes_1.Edge(v2, v3);
            edges.push([e1, e2]);
        }
        return edges;
    }
    rotate_y(degrees) {
        //validate degrees somehow
        if (degrees == 0 || degrees == 360) {
            return this;
        }
        let new_faces = rotate_y_faces(this.face_meshes, degrees);
        if (degrees = 180) {
            return this.update({ face_meshes: new_faces });
        } else {
            let [x, y, z] = this.dimensions;
            return this.update({ dimensions: [z, y, x], face_meshes: new_faces });
        }
    }
    roll(direction) {
        let [x, y, z] = this.dimensions;
        let new_x, new_y, new_z;
        if (direction == datatypes_1.Direction.n || direction == datatypes_1.Direction.s) {
            [new_x, new_y, new_z] = [x, y, z];
        } else {
            [new_x, new_y, new_z] = [y, x, z];
        }
        let new_faces = roll_faces(this.face_meshes, direction);
        return this.update({ dimensions: [new_x, new_y, new_z], face_meshes: new_faces });
    }
    description() {
        let face_descr = new Map([[datatypes_1.Face.t, 'top'], [datatypes_1.Face.b, 'bottom'], [datatypes_1.Face.n, 'back'], [datatypes_1.Face.e, 'right'], [datatypes_1.Face.s, 'front'], [datatypes_1.Face.w, 'left']]);
        let [x, y, z] = this.dimensions;
        let result = `The box's dimensions measure ${x} by ${y} by ${z}`;
        let rends = this.get_free_rends();
        let inner_this = this;
        rends.forEach(function (fr) {
            let face_membership = inner_this.get_partition_face_membership(fr);
            let faces_present = [];
            for (let f of datatypes_1.faces) {
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }
            let faces_text;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length - 1])} faces`;
            }
            result += `\nA portion of the box's ${faces_text} has been rended free; it lies on the floor off to the side.`;
        });
        let dangles = this.get_dangles();
        dangles.forEach(function (d) {
            let face_membership = inner_this.get_partition_face_membership(d.partition);
            let faces_present = [];
            for (let f of datatypes_1.faces) {
                if (face_membership.get(f) > 0) {
                    faces_present.push(f);
                }
            }
            let faces_text;
            if (faces_present.length == 1) {
                faces_text = face_descr.get(faces_present[0]) + ' face';
            } else {
                faces_text = faces_present.slice(0, -1).map(f => face_descr.get(f)).join(', ');
                faces_text += ` and ${face_descr.get(faces_present[faces_present.length - 1])} faces`;
            }
            result += `\nA portion of the box's ${faces_text} sits on a free hinge; from the ${face_descr.get(d.free_face)} face it can be swung to the ${face_descr.get(d.fixed_face)}.`;
        });
        return result;
    }
}
exports.BoxMesh = BoxMesh;
function rotate_y_faces(fs, degrees) {
    if (degrees == 0 || degrees == 360) {
        return fs;
    }
    let shift = degrees / 90;
    let face_cycle = [datatypes_1.Face.n, datatypes_1.Face.w, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.n, datatypes_1.Face.w, datatypes_1.Face.s, datatypes_1.Face.e];
    let new_faces = new Map();
    for (let f of [datatypes_1.Face.n, datatypes_1.Face.e, datatypes_1.Face.s, datatypes_1.Face.w]) {
        let ind = face_cycle.indexOf(f);
        new_faces.set(f, fs.get(face_cycle[ind + shift]));
    }
    for (let f of [datatypes_1.Face.t, datatypes_1.Face.b]) {
        new_faces.set(f, fs.get(f).rotate(degrees));
    }
    return new_faces;
}
function roll_faces(fs, direction) {
    let new_faces = new Map();
    if (direction == datatypes_1.Direction.n) {
        new_faces.set(datatypes_1.Face.n, fs.get(datatypes_1.Face.t).rotate(180)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.s)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.b)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.n).rotate(180)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.e).rotate(90)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.w).rotate(270));
    } else if (direction == datatypes_1.Direction.s) {
        new_faces.set(datatypes_1.Face.s, fs.get(datatypes_1.Face.t)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.n).rotate(180)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.b)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.s).rotate(180)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.w).rotate(90));
    } else if (direction == datatypes_1.Direction.e) {
        new_faces.set(datatypes_1.Face.e, fs.get(datatypes_1.Face.t).rotate(90)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.w).rotate(90)).set(datatypes_1.Face.w, fs.get(datatypes_1.Face.b).rotate(270)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.n).rotate(270)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.s).rotate(90));
    } else if (direction == datatypes_1.Direction.w) {
        new_faces.set(datatypes_1.Face.w, fs.get(datatypes_1.Face.t).rotate(270)).set(datatypes_1.Face.t, fs.get(datatypes_1.Face.e).rotate(270)).set(datatypes_1.Face.e, fs.get(datatypes_1.Face.b).rotate(90)).set(datatypes_1.Face.b, fs.get(datatypes_1.Face.w).rotate(90)).set(datatypes_1.Face.n, fs.get(datatypes_1.Face.n).rotate(90)).set(datatypes_1.Face.s, fs.get(datatypes_1.Face.s).rotate(270));
    }
    return new_faces;
}
function test() {
    let bm = new BoxMesh({ dimensions: [2, 3, 4] });
    let bm2 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).cut(datatypes_1.Face.t, [1, 0], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [0, 0]);
    let bm3 = bm2.cut(datatypes_1.Face.t, [0, 1], [0, 2]).cut(datatypes_1.Face.s, [0, 0], [0, 1]).cut(datatypes_1.Face.s, [0, 1], [1, 1]).cut(datatypes_1.Face.s, [1, 1], [1, 0]).cut(datatypes_1.Face.t, [1, 2], [1, 1]);
    let bm4 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).roll(datatypes_1.Direction.s).cut(datatypes_1.Face.t, [0, 2], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 2]);
    let bm5 = bm.cut(datatypes_1.Face.n, [0, 0], [1, 0]).cut(datatypes_1.Face.n, [1, 0], [2, 0]).cut(datatypes_1.Face.n, [2, 0], [2, 1]).cut(datatypes_1.Face.n, [2, 1], [1, 1]).cut(datatypes_1.Face.n, [1, 1], [0, 1]).cut(datatypes_1.Face.n, [1, 1], [1, 0]).cut(datatypes_1.Face.n, [0, 1], [0, 0]);
    let bm6 = bm.cut(datatypes_1.Face.t, [0, 0], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 0]);
    let bm7 = bm2.cut(datatypes_1.Face.t, [0, 1], [0, 2]).cut(datatypes_1.Face.t, [1, 1], [1, 2]);
    let bm8 = bm.cut(datatypes_1.Face.t, [0, 0], [1, 0]).cut(datatypes_1.Face.t, [1, 0], [2, 0]).cut(datatypes_1.Face.t, [2, 0], [2, 1]).cut(datatypes_1.Face.t, [2, 1], [2, 2]).cut(datatypes_1.Face.t, [0, 2], [0, 1]).cut(datatypes_1.Face.t, [0, 1], [1, 1]).cut(datatypes_1.Face.t, [1, 1], [1, 2]).cut(datatypes_1.Face.s, [1, 0], [1, 1]).cut(datatypes_1.Face.s, [1, 1], [0, 1]).cut(datatypes_1.Face.w, [0, 0], [0, 1]).cut(datatypes_1.Face.w, [0, 1], [1, 1]).cut(datatypes_1.Face.w, [1, 1], [2, 1]);
    let bms = [bm, bm2, bm3, bm4, bm5, bm6, bm7, bm8];
    for (let i = 0; i < bms.length; i++) {
        let b = bms[i];
        console.log('Box #', i + 1);
        console.log();
        console.log(b.description());
        console.log();
        console.log();
    }
}
exports.test = test;
var _a;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(1);
const ReactDom = __webpack_require__(6);
const Terminal_1 = __webpack_require__(5);
ReactDom.render(React.createElement(Terminal_1.Terminal, null), document.getElementById('game'));
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

/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const box_geometry_1 = __webpack_require__(9);
const datatypes_1 = __webpack_require__(0);
const commands_1 = __webpack_require__(2);
const world_update_effects_1 = __webpack_require__(12);
const items_1 = __webpack_require__(3);
const text_tools_1 = __webpack_require__(4);
class Box {
    constructor({ box_mesh, rend_state, dangle_state, edge_state, contents }) {
        if (box_mesh === undefined) {
            box_mesh = new box_geometry_1.BoxMesh({ dimensions: [2, 2, 2] });
        }
        this.box_mesh = box_mesh;
        if (rend_state === undefined) {
            rend_state = this.default_rend_state(this.box_mesh);
        }
        this.rend_state = rend_state;
        if (dangle_state === undefined) {
            dangle_state = this.default_dangle_state(this.box_mesh);
        }
        this.dangle_state = dangle_state;
        if (edge_state === undefined) {
            edge_state = new datatypes_1.FuckDict();
        }
        this.edge_state = edge_state;
        if (contents === undefined) {
            contents = [];
        }
        this.contents = contents;
    }
    update({ box_mesh, rend_state, dangle_state, edge_state, contents }) {
        if (box_mesh === undefined) {
            box_mesh = this.box_mesh;
        }
        if (rend_state === undefined) {
            rend_state = this.rend_state;
        }
        if (dangle_state === undefined) {
            dangle_state = this.dangle_state;
        }
        if (edge_state === undefined) {
            edge_state = this.edge_state;
        }
        if (contents === undefined) {
            contents = this.contents;
        }
        return new Box({ box_mesh, rend_state, dangle_state, edge_state, contents });
    }
    default_rend_state(box_mesh) {
        let rends = box_mesh.get_free_rends();
        let result = new datatypes_1.FuckDict();
        rends.forEach(function (r) {
            result.set(r, datatypes_1.RendState.closed);
        });
        return result;
    }
    default_dangle_state(box_mesh) {
        let dangles = box_mesh.get_dangles();
        let result = new datatypes_1.FuckDict();
        dangles.forEach(function (d) {
            result.set(d, datatypes_1.RendState.closed);
        });
        return result;
    }
    open_or_close_rend(operation, rend) {
        let box_rends = this.box_mesh.get_rends();
        if (!datatypes_1.array_fuck_contains(box_rends, rend)) {
            throw new datatypes_1.CommandError('rend does not exist on the box');
        }
        if (this.box_mesh.is_partition_fixed(rend)) {
            throw new datatypes_1.WorldUpdateError('cannot open or close a fixed rend');
        }
        let new_rend_state = this.rend_state.copy();
        let intended_new_state = operation == datatypes_1.RendOperation.close ? datatypes_1.RendState.closed : datatypes_1.RendState.open;
        if (intended_new_state == new_rend_state.get(rend)) {
            throw new datatypes_1.WorldUpdateError(`cannot ${datatypes_1.RendOperation[operation]} a rend that is already ${datatypes_1.RendState[intended_new_state]}`);
        }
        new_rend_state.set(rend, intended_new_state);
        let new_box = this.update({ rend_state: new_rend_state });
        if (new_box.is_collapsed()) {
            let effects = world_update_effects_1.world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_box.contents);
            let new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    open_or_close_dangle(operation, dangle) {
        if (this.box_mesh.is_partition_fixed(dangle.partition)) {
            throw new datatypes_1.WorldUpdateError('cannot open or close a fixed dangle');
        }
        let box_dangles = this.box_mesh.get_dangles();
        if (box_dangles.some(d => dangle == d)) {
            throw new datatypes_1.CommandError('dangle does not exist on the box');
        }
        let intended_new_state = operation == datatypes_1.RendOperation.close ? datatypes_1.RendState.closed : datatypes_1.RendState.open;
        if (this.dangle_state.get(dangle) == intended_new_state) {
            throw new datatypes_1.WorldUpdateError(`cannot ${datatypes_1.RendOperation[operation]} a dangle that is already ${datatypes_1.RendState[intended_new_state]}`);
        }
        let new_dangle_state = this.dangle_state.copy();
        new_dangle_state.set(dangle, intended_new_state);
        let new_box = this.update({ dangle_state: new_dangle_state });
        if (new_box.is_collapsed()) {
            let effects = world_update_effects_1.world_update.effects;
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_box.contents);
            let new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    rotate_y(degrees) {
        let new_box_mesh = this.box_mesh.rotate_y(degrees);
        return this.update({ box_mesh: new_box_mesh });
    }
    roll(direction) {
        if (this.dangle_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            throw new datatypes_1.WorldUpdateError('cannot roll a box with open dangles');
        }
        let new_box_mesh = this.box_mesh.roll(direction);
        let dir_face = datatypes_1.direction_2_face.get(direction);
        let new_contents = this.contents.slice();
        let rend_state_updates = this.rend_state.copy();
        let dangle_state_updates = this.dangle_state.copy();
        let inner_this = this;
        let effects = world_update_effects_1.world_update.effects;
        if (new_contents.length > 0) {
            let dir_2_opposite = new Map([[datatypes_1.Face.n, datatypes_1.Face.s], [datatypes_1.Face.s, datatypes_1.Face.n], [datatypes_1.Face.e, datatypes_1.Face.w], [datatypes_1.Face.w, datatypes_1.Face.e]]);
            let heavy_spill_faces = [[dir_face, datatypes_1.Face.b], [datatypes_1.Face.t, dir_face], [datatypes_1.Face.b, dir_2_opposite.get(dir_face)]];
            let light_spill_faces = [datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].filter(d => d !== dir_face && d !== dir_2_opposite.get(dir_face));
            this.rend_state.entries_array().forEach(function ([r, state]) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                for (let [test_face, spill_face] of heavy_spill_faces) {
                    if (face_membership.get(test_face) > 0) {
                        effects.spill_faces.push(spill_face);
                        effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                        effects.spilled_items.push(...new_contents);
                        new_contents = [];
                        if (state == datatypes_1.RendState.closed) {
                            effects.spilled_rends == effects.spilled_rends.set(r, undefined);
                            rend_state_updates.set(r, datatypes_1.RendState.open);
                        }
                    }
                }
                for (let spill_face of light_spill_faces) {
                    if (face_membership.get(spill_face) > 0) {
                        effects.spill_faces.push(spill_face);
                        if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                            effects.spillage_level = datatypes_1.SpillageLevel.light;
                        }
                        if (new_contents.length > 0) {
                            effects.spilled_items.push(new_contents.shift());
                        }
                    }
                }
            });
            this.box_mesh.get_dangles().forEach(function (d) {
                let spillage_level = datatypes_1.SpillageLevel.none;
                let spill_face;
                if (d.free_face == datatypes_1.Face.t) {
                    spillage_level = datatypes_1.SpillageLevel.heavy;
                    spill_face = dir_face;
                } else if (d.free_face == dir_face) {
                    spillage_level = datatypes_1.SpillageLevel.heavy;
                    spill_face = datatypes_1.Face.b;
                } else if (light_spill_faces.indexOf(d.free_face) !== -1) {
                    spillage_level = datatypes_1.SpillageLevel.light;
                    spill_face = d.free_face;
                }
                if (spillage_level !== datatypes_1.SpillageLevel.none) {
                    if (spillage_level > effects.spillage_level) {
                        effects.spillage_level = spillage_level;
                    }
                    effects.spill_faces.push(spill_face);
                    if (spillage_level == datatypes_1.SpillageLevel.light) {
                        if (new_contents.length > 0) {
                            effects.spilled_items.push(new_contents.shift());
                        }
                    } else if (spillage_level == datatypes_1.SpillageLevel.heavy) {
                        effects.spilled_items.push(...new_contents);
                        new_contents = [];
                    }
                    effects.spilled_dangles.set(d, undefined);
                    dangle_state_updates.set(d, datatypes_1.RendState.open);
                }
            });
            new_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == dir_2_opposite.get(dir_face)) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(dir_2_opposite.get(dir_face));
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    effects.spilled_dangles.set(d, undefined);
                    dangle_state_updates.set(d, datatypes_1.RendState.open);
                }
            });
        }
        let new_box = this.update({
            box_mesh: new_box_mesh,
            rend_state: rend_state_updates,
            dangle_state: dangle_state_updates,
            contents: new_contents
        });
        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_contents);
            new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    lift() {
        let effects = world_update_effects_1.world_update.effects;
        let inner_this = this;
        let new_contents = this.contents.slice();
        let new_rend_state = this.rend_state.copy();
        let new_dangle_state = this.dangle_state.copy();
        if (new_contents.length > 0) {
            let test_box_mesh = this.box_mesh.roll(datatypes_1.Direction.s).roll(datatypes_1.Direction.s);
            test_box_mesh.get_free_rends().forEach(function (r) {
                let face_membership = test_box_mesh.get_partition_face_membership(r);
                let test_faces = [datatypes_1.Face.b, datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w];
                let count = test_faces.map(x => face_membership.get(x)).reduce((x, y) => x + y);
                if (face_membership.get(datatypes_1.Face.t) > count) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(datatypes_1.Face.b);
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    if (!new_rend_state.has_key(r) || new_rend_state.get(r) === datatypes_1.RendState.closed) {
                        effects.spilled_rends.set(r, undefined);
                        new_rend_state.set(r, datatypes_1.RendState.open);
                    }
                }
            });
            test_box_mesh.get_dangles().forEach(function (d) {
                if (d.free_face == datatypes_1.Face.t) {
                    effects.spillage_level = datatypes_1.SpillageLevel.heavy;
                    effects.spill_faces.push(datatypes_1.Face.b);
                    effects.spilled_items.push(...new_contents);
                    new_contents = [];
                    effects.spilled_dangles.set(d, undefined);
                    new_dangle_state.set(d, datatypes_1.RendState.open);
                }
            });
            this.rend_state.entries_array().forEach(function ([r, state]) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                let light_spill_faces = [datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].filter(f => face_membership.get(f) > 0);
                if (light_spill_faces.length > 0) {
                    if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                        effects.spillage_level = datatypes_1.SpillageLevel.light;
                    }
                    effects.spill_faces.push(...light_spill_faces);
                    if (new_contents.length > 0) {
                        effects.spilled_items.push(new_contents.shift());
                    }
                    if (state == datatypes_1.RendState.closed) {
                        effects.spilled_rends.set(r, undefined);
                        new_rend_state.set(r, datatypes_1.RendState.open);
                    }
                }
            });
            this.dangle_state.entries_array().forEach(function ([d, state]) {
                if ([datatypes_1.Face.n, datatypes_1.Face.s, datatypes_1.Face.e, datatypes_1.Face.w].indexOf(d.free_face) !== -1) {
                    if (effects.spillage_level < datatypes_1.SpillageLevel.light) {
                        effects.spillage_level = datatypes_1.SpillageLevel.light;
                    }
                    effects.spill_faces.push(d.free_face);
                    if (new_contents.length > 0) {
                        effects.spilled_items.push(new_contents.shift());
                    }
                }
            });
        }
        let new_box = this.update({ rend_state: new_rend_state, dangle_state: new_dangle_state, contents: new_contents });
        if (new_box.is_collapsed()) {
            effects.box_collapsed = true;
            effects.collapse_spilled_items.push(...new_contents);
            new_contents = [];
            new_box = new_box.update({ contents: new_contents });
        }
        return new_box;
    }
    cut(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.cut, face, start, end);
    }
    tape(face, start, end) {
        return this.cut_or_tape(datatypes_1.EdgeOperation.tape, face, start, end);
    }
    cut_or_tape(operation, face, start, end) {
        let effects = world_update_effects_1.world_update.effects;
        let inner_this = this;
        if (face !== datatypes_1.Face.s && face !== datatypes_1.Face.t) {
            throw new datatypes_1.WorldUpdateError('cannot cut or tape sides other than top or front');
        }
        let [x1, y1] = start;
        let [x2, y2] = end;
        let v1 = this.box_mesh.face_meshes.get(face).vertices.get(x1, y1);
        let v2 = this.box_mesh.face_meshes.get(face).vertices.get(x2, y2);
        let edge = new datatypes_1.Edge(v1, v2);
        let quadrants = box_geometry_1.edge_2_quadrants.get(edge);
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (state == datatypes_1.RendState.open && quadrants.every(r.has_key)) {
                throw new datatypes_1.WorldUpdateError('cannot cut or tape on an open rend');
            }
        });
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (state == datatypes_1.RendState.open && quadrants.every(d.partition.has_key)) {
                throw new datatypes_1.WorldUpdateError('cannot cut or tape on an open dangle');
            }
        });
        let new_box_mesh;
        if (operation == datatypes_1.EdgeOperation.cut) {
            new_box_mesh = this.box_mesh.cut(face, start, end);
        } else {
            new_box_mesh = this.box_mesh.tape(face, start, end);
        }
        let new_rend_state = this.default_rend_state(new_box_mesh);
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (new_rend_state.has_key(r)) {
                new_rend_state.set(r, state);
            } else {
                effects.repaired_rends.push(r);
            }
        });
        new_rend_state.entries_array().forEach(function ([new_r, state]) {
            if (!inner_this.rend_state.has_key(new_r)) {
                effects.new_rends.push(new_r);
            }
        });
        let new_dangle_state = this.default_dangle_state(new_box_mesh);
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (new_dangle_state.has_key(d)) {
                new_dangle_state.set(d, state);
            } else {
                effects.repaired_dangles.push(d);
            }
        });
        new_dangle_state.entries_array().forEach(function ([new_d, state]) {
            if (!inner_this.dangle_state.has_key(new_d)) {
                effects.new_dangles.push(new_d);
            }
        });
        let new_edge_state = this.edge_state.copy();
        let new_state;
        if (new_edge_state.has_key(edge)) {
            new_state = new_edge_state.get(edge);
        } else {
            new_state = new datatypes_1.EdgeState();
        }
        if (operation == datatypes_1.EdgeOperation.cut) {
            new_edge_state.set(edge, new_state.cut());
        } else {
            new_edge_state.set(edge, new_state.apply_tape());
        }
        return this.update({ box_mesh: new_box_mesh, rend_state: new_rend_state, dangle_state: new_dangle_state, edge_state: new_edge_state });
    }
    take_next_item() {
        let effects = world_update_effects_1.world_update.effects;
        if (this.contents.length == 0) {
            throw new datatypes_1.WorldUpdateError('cannot take an item from an empty box');
        }
        if (!this.appears_open()) {
            throw new datatypes_1.WorldUpdateError('cannot take an item from a box with no visible openings');
        }
        let new_contents = this.contents.slice();
        effects.taken_items.push(new_contents.shift());
        return this.update({ contents: new_contents });
    }
    next_item() {
        if (this.contents.length == 0) {
            return null;
        }
        return this.contents[0];
    }
    appears_open() {
        if (this.rend_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            return true;
        }
        if (this.dangle_state.values_array().some(state => state == datatypes_1.RendState.open)) {
            return true;
        }
        return false;
    }
    appears_empty() {
        return this.appears_open() && this.contents.length == 0;
    }
    is_collapsed() {
        let open_faces = new Map();
        let inner_this = this;
        this.rend_state.entries_array().forEach(function ([r, state]) {
            if (state == datatypes_1.RendState.open) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(r);
                datatypes_1.counter_update(open_faces, face_membership);
            }
        });
        this.dangle_state.entries_array().forEach(function ([d, state]) {
            if (state == datatypes_1.RendState.open) {
                let face_membership = inner_this.box_mesh.get_partition_face_membership(d.partition);
                datatypes_1.counter_update(open_faces, face_membership);
            }
        });
        let total_open_sides = 0;
        open_faces.forEach(function (count, face) {
            if (count > 0) {
                total_open_sides += 1;
            }
        });
        return total_open_sides >= 3;
    }
}
exports.Box = Box;
class SingleBoxWorld {
    constructor({ box, taken_items, spilled_items }) {
        if (box === undefined) {
            box = new Box({});
        }
        this.box = box;
        if (taken_items === undefined) {
            taken_items = [];
        }
        this.taken_items = taken_items;
        if (spilled_items === undefined) {
            spilled_items = [];
        }
        this.spilled_items = spilled_items;
    }
    update({ box, taken_items, spilled_items }) {
        if (box === undefined) {
            box = this.box;
        }
        if (taken_items === undefined) {
            taken_items = this.taken_items;
        }
        if (spilled_items === undefined) {
            spilled_items = this.spilled_items;
        }
        return new SingleBoxWorld({ box, taken_items, spilled_items });
    }
    get_command_map() {
        let commands = [];
        commands.push(rotate_y_box);
        commands.push(roll_box);
        commands.push(lift_box);
        commands.push(cut_box);
        commands.push(tape_box);
        commands.push(open_dangle);
        commands.push(close_dangle);
        commands.push(remove_rend);
        commands.push(replace_rend);
        commands.push(take_item);
        let command_map = new Map();
        let options = [];
        for (let command of commands) {
            options.push(command.command_name);
            command_map.set(text_tools_1.untokenize(command.command_name), command);
        }
        return command_map;
    }
    cut_message(new_box, cut_edge_states, effects) {
        let cut_message;
        if (cut_edge_states[0].cardboard == datatypes_1.CardboardEdge.intact) {
            cut_message = 'You slide your blade along the cardboard';
            if (cut_edge_states[0].tape == datatypes_1.TapeEdge.taped) {
                cut_message += ' and tape';
            }
            cut_message += '.';
        } else {
            if (cut_edge_states[0].tape == datatypes_1.TapeEdge.taped) {
                cut_message = 'You draw your blade easily along the line. It slits open the thin layer of tape covering the gap in the cardboard.';
            } else {
                cut_message = 'You slide your blade along the line, but nothing is there to resist it.';
            }
        }
        if (cut_edge_states.length > 1) {
            if (cut_edge_states[1].cardboard != cut_edge_states[0].cardboard) {
                if (cut_edge_states[1].cardboard == datatypes_1.CardboardEdge.intact) {
                    cut_message += ' Halfway across, it catches on solid cardboard, and you pull it along the rest of the way.';
                } else {
                    if (cut_edge_states[1].tape == datatypes_1.TapeEdge.taped) {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade slides easily along the thin layer of tape.';
                    } else {
                        cut_message += ' Halfway across, you reach a gap in the cardboard, and your blade is met with no further resistance.';
                    }
                }
            }
        }
        let message = cut_message;
        if (effects.new_rends.length > 0) {
            let total_face_membership = new Map();
            effects.new_rends.forEach(function (r) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(r);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let new_rends_message;
            if (effects.new_rends.length == 1) {
                new_rends_message = `A new section of cardboard comes free on the ${face_msg}.`;
            } else {
                new_rends_message = `${effects.new_rends.length} new sections of cardboard come free on the ${face_msg}.`;
            }
            message += '\n' + new_rends_message;
        }
        if (effects.new_dangles.length > 0) {
            let total_face_membership = new Map();
            effects.new_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let new_rends_message;
            if (effects.new_dangles.length == 1) {
                new_rends_message = `A new section of cardboard on the ${face_msg} can be swung freely on a hinge.`;
            } else {
                new_rends_message = `${effects.new_dangles.length} new sections of cardboard on the ${face_msg} can be swung freely on a hinge.`;
            }
            message += '\n' + new_rends_message;
        }
        return message;
    }
    tape_message(new_box, cut_edge_states, effects) {
        let tape_message;
        if (cut_edge_states.some(ces => ces.cardboard == datatypes_1.CardboardEdge.intact)) {
            tape_message = 'You draw out a length of tape and fasten it to the cardboard.';
        } else {
            if (cut_edge_states.some(ces => ces.tape == datatypes_1.TapeEdge.taped)) {
                tape_message = 'You lay another length of tape over the cut edge.';
            } else {
                tape_message = 'You seal the gap in the cardboard with a length of tape.';
            }
        }
        let message = tape_message;
        if (effects.repaired_dangles.length > 0) {
            let total_face_membership = new Map();
            effects.repaired_dangles.forEach(function (d) {
                let face_membership = new_box.box_mesh.get_partition_face_membership(d.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, face_membership);
            });
            let face_order = datatypes_1.counter_order(total_face_membership);
            let face_msg = text_tools_1.face_message(face_order);
            let repaired_dangles_message;
            if (effects.new_rends.length == 1) {
                repaired_dangles_message = `A formerly freely-swinging section of cardboard on the ${face_msg} can no longer swing on its hinge.`;
            } else {
                repaired_dangles_message = `${face_order.length} formerly freely-swinging sections of cardboard on the ${face_msg} can no longer swing on their hinges.`;
            }
            message += '\n' + repaired_dangles_message;
        }
        return message;
    }
    item_spill_message(spilled_items) {
        let si = spilled_items;
        let during_spill_msg;
        let after_spill_msg;
        if (si.length == 1) {
            let item_msg = si[0].pre_gestalt();
            during_spill_msg = `${text_tools_1.capitalize(item_msg)} spills out before you.`;
            after_spill_msg = `It's ${si[0].article()} ${si[0].name()} - ${si[0].post_gestalt()}.`;
        } else {
            let item_msg = si.slice(0, si.length - 1).map(i => i.pre_gestalt()).join(', ') + ' and ' + si[si.length - 1].pre_gestalt();
            during_spill_msg = text_tools_1.capitalize(`${item_msg} spill out before you.`);
            let after_msgs = si.map(i => `${i.article()} ${i.name()} - ${i.post_gestalt()}`);
            after_spill_msg = "It's " + after_msgs.slice(0, after_msgs.length - 1).join(', ') + ' and ' + after_msgs[after_msgs.length - 1] + '.';
        }
        let spill_msg = during_spill_msg + ' ' + after_spill_msg;
        return spill_msg;
    }
    spill_message(new_box) {
        let effects = world_update_effects_1.world_update.effects;
        let structural_dmg_msgs = [];
        if (effects.spilled_rends.size > 0) {
            let total_face_membership = new Map();
            effects.spilled_rends.keys_array().forEach(function (sr) {
                let sr_mem = new_box.box_mesh.get_partition_face_membership(sr);
                total_face_membership = datatypes_1.counter_update(total_face_membership, sr_mem);
            });
            let sr_faces = datatypes_1.counter_order(total_face_membership);
            let f_msg = text_tools_1.face_message(sr_faces);
            let spilled_rends_msg = `free cardboard on the ${f_msg} falls away`;
            structural_dmg_msgs.push(spilled_rends_msg);
        }
        if (effects.spilled_dangles.size > 0) {
            let total_face_membership = new Map();
            effects.spilled_dangles.keys_array().forEach(function (sd) {
                let sd_mem = new_box.box_mesh.get_partition_face_membership(sd.partition);
                total_face_membership = datatypes_1.counter_update(total_face_membership, sd_mem);
            });
            let sd_faces = datatypes_1.counter_order(total_face_membership);
            let f_msg = text_tools_1.face_message(sd_faces);
            let spilled_dangles_msg = `dangling cardboard on the ${f_msg} swings open`;
            structural_dmg_msgs.push(spilled_dangles_msg);
        }
        let spill_msg = this.item_spill_message(effects.spilled_items);
        let result;
        if (structural_dmg_msgs.length > 0) {
            let structure_dmg_msg = structural_dmg_msgs.join(' and ');
            result = `${structure_dmg_msg}. ${spill_msg}`;
        } else {
            result = spill_msg;
        }
        return result;
    }
}
exports.SingleBoxWorld = SingleBoxWorld;
let rotate_y_box = {
    command_name: ['rotate'],
    execute: function (world, parser) {
        let dir_word = parser.consume_option(commands_1.rotate_y_word_tokens);
        if (!dir_word) {
            return;
        }
        if (!parser.done()) {
            return;
        }
        let degrees = dir_word == 'right' ? 90 : 270;
        let new_box = world.box.rotate_y(degrees);
        let new_world = world.update({ box: new_box });
        let message = `You turn the box 90 degrees to the ${dir_word}`;
        return {
            world: new_world,
            message: message
        };
    }
};
let roll_box = {
    command_name: ["roll"],
    execute: function (world, parser) {
        return world_update_effects_1.with_world_update(function (effects) {
            let dir_word = parser.consume_option(commands_1.roll_dir_word_tokens);
            if (!dir_word) {
                return;
            }
            if (!parser.done()) {
                return;
            }
            let direction = commands_1.word_2_dir.get(dir_word);
            let new_box = world.box.roll(direction);
            let dir_msg = dir_word == 'left' || dir_word == 'right' ? `over to the ${dir_word}` : dir_word;
            let message;
            let new_world;
            if (effects.spillage_level == datatypes_1.SpillageLevel.none) {
                message = `You roll the box ${dir_msg}.`;
                new_world = world.update({ box: new_box });
            } else {
                let spill_msg = text_tools_1.uncapitalize(world.spill_message(new_box));
                message = `As you roll the box ${dir_msg}, ${spill_msg}`;
                new_world = world.update({ box: new_box, spilled_items: effects.spilled_items });
            }
            if (effects.box_collapsed) {
                message += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.length > 0) {
                    message += ' ';
                    message += world.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return {
                world: new_world,
                message: message
            };
        });
    }
};
let lift_box = {
    command_name: ['lift'],
    execute: function (world, parser) {
        //let inner_this = this;
        return world_update_effects_1.with_world_update(function (effects) {
            if (!parser.done()) {
                return;
            }
            let new_box = world.box.lift();
            let msg;
            let new_world;
            if (effects.spillage_level == datatypes_1.SpillageLevel.none) {
                msg = 'You lift up the box in place.';
                new_world = world.update({ box: new_box });
            } else {
                let spill_msg = text_tools_1.uncapitalize(world.spill_message(new_box));
                msg = 'As you start to lift up the box, ' + spill_msg;
                new_world = world.update({ box: new_box, spilled_items: effects.spilled_items });
            }
            if (effects.spillage_level <= datatypes_1.SpillageLevel.heavy && !effects.box_collapsed) {
                let total_weight = new_box.contents.reduce((x, i) => x + i.weight(), 0);
                total_weight = Math.floor(total_weight / 2.9); //rule of thumb for translating "normal item weights" to "normal box weights"
                if (total_weight > datatypes_1.Weight.very_heavy) {
                    total_weight = datatypes_1.Weight.very_heavy;
                }
                let weight_2_msg = new Map([[datatypes_1.Weight.empty, 'so light as to be empty'], [datatypes_1.Weight.very_light, 'quite light'], [datatypes_1.Weight.light, 'light'], [datatypes_1.Weight.medium, 'neither light nor heavy'], [datatypes_1.Weight.heavy, 'somewhat heavy'], [datatypes_1.Weight.very_heavy, 'very heavy']]);
                let weight_msg = weight_2_msg.get(total_weight);
                let subject = effects.spillage_level == datatypes_1.SpillageLevel.none ? 'It' : 'The box';
                msg += `\n${subject} feels ${weight_msg}. You set it back down.`;
            }
            if (effects.box_collapsed) {
                msg += '\nThe added stress on the box causes it to collapse in on itself.';
                if (effects.collapse_spilled_items.length > 0) {
                    msg += ' ' + world.item_spill_message(effects.collapse_spilled_items);
                }
            }
            return { world: new_world, message: msg };
        });
    }
};
let cut_box = {
    command_name: ['cut'],
    execute: cut_or_tape_box
};
let tape_box = {
    command_name: ['tape'],
    execute: cut_or_tape_box
};
const dim_2_pos = [['left', 'center', 'right'], ['top', 'middle', 'bottom']];
function parser_cut_or_tape_box(parser) {
    let operation = parser.get_match('command').match;
    let dir;
    if (parser.is_done()) {
        dir = 'horizontally';
    } else {
        dir = parser.consume_option(commands_1.edge_dir_word_tokens);
        if (!dir) {
            return;
        }
    }
    let dim_a;
    let dim_b;
    if (dir === 'vertically') {
        dim_a = 0;
        dim_b = 1;
    } else {
        dim_a = 1;
        dim_b = 0;
    }
    let start_pos_a;
    if (parser.is_done()) {
        if (dim_a === 0) {
            start_pos_a = 'center';
        } else {
            start_pos_a = 'middle';
        }
    } else {
        if (!parser.consume_filler(['along'])) {
            return;
        }
        start_pos_a = parser.consume_option(commands_1.position_word_tokens, 'start_pos_a');
        if (!start_pos_a) {
            return;
        }
        if (dim_2_pos[dim_a].indexOf(start_pos_a) === -1) {
            parser.get_match('start_pos_a').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid start_pos_a for ${dir} ${operation}: ${start_pos_a}` };
        }
    }
    let start_pos_b;
    let end_pos_b;
    if (parser.is_done()) {
        if (dim_a === 0) {
            start_pos_b = 'top';
            end_pos_b = 'bottom';
        } else {
            start_pos_b = 'left';
            end_pos_b = 'right';
        }
    } else {
        if (!parser.consume_filler(['from'])) {
            return;
        }
        start_pos_b = parser.consume_option(commands_1.position_word_tokens, 'start_pos_b');
        if (!start_pos_b) {
            return;
        }
        if (dim_2_pos[dim_b].indexOf(start_pos_b) === -1) {
            parser.get_match('start_pos_b').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid start_pos_b for ${dir} ${operation}: ${start_pos_b}` };
        }
        if (!parser.consume_filler(['to'])) {
            return;
        }
        end_pos_b = parser.consume_option(commands_1.position_word_tokens, 'end_pos_b');
        if (!end_pos_b) {
            return;
        }
        if (dim_2_pos[dim_b].indexOf(end_pos_b) === -1) {
            parser.get_match('end_pos_b').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `invalid end_pos_b for ${dir} ${operation}: ${end_pos_b}` };
        }
    }
    let pt1 = [null, null];
    let pt2 = [null, null];
    pt1[dim_a] = pt2[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);
    pt1[dim_b] = dim_2_pos[dim_b].indexOf(start_pos_b);
    pt2[dim_b] = dim_2_pos[dim_b].indexOf(end_pos_b);
    if (Math.abs(pt1[dim_b] - pt2[dim_b]) == 0) {
        parser.get_match('end_pos_b').display = commands_1.DisplayEltType.error;
        return { message: 'no change between start_pos_b and end_pos_b.' };
    }
    if (!parser.done()) {
        return;
    }
    let cut_points;
    if (Math.abs(pt1[dim_b] - pt2[dim_b]) === 2) {
        let pt3 = [null, null];
        pt3[dim_a] = dim_2_pos[dim_a].indexOf(start_pos_a);
        pt3[dim_b] = 1;
        cut_points = [[pt1, pt3], [pt3, pt2]];
    } else {
        cut_points = [[pt1, pt2]];
    }
    return { cut_points };
}
function cut_or_tape_box(world, parser) {
    //operation: EdgeOpWord, face_w: FaceWord, dir: EdgeDirWord, start_pos_a: PositionWord, start_pos_b: PositionWord, end_pos_b: PositionWord): CommandResult {
    //let inner_this = this;
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        let parse_result = parser_cut_or_tape_box(parser);
        if (parse_result === undefined || parse_result.message !== undefined) {
            return parse_result;
        }
        let { cut_points } = parse_result;
        let cut_edge_states = [];
        let new_box = world.box;
        let face = datatypes_1.Face.t;
        cut_points.forEach(function ([p1, p2]) {
            let vertices = new_box.box_mesh.face_meshes.get(face).vertices;
            let v1 = vertices.get(p1[0], p1[1]);
            let v2 = vertices.get(p2[0], p2[1]);
            let edge = new datatypes_1.Edge(v1, v2);
            let new_state;
            if (new_box.edge_state.has_key(edge)) {
                new_state = new_box.edge_state.get(edge);
            } else {
                new_state = new datatypes_1.EdgeState();
            }
            cut_edge_states.push(new_state);
            new_box = new_box.cut_or_tape(commands_1.word_2_edge_op.get(operation), face, p1, p2);
        });
        effects.new_dangles.forEach(function (nd) {
            if (datatypes_1.array_fuck_contains(effects.new_rends, nd.partition)) {
                effects.new_dangles.splice(effects.new_dangles.indexOf(nd), 1);
            }
        });
        effects.repaired_dangles.forEach(function (rd) {
            if (datatypes_1.array_fuck_contains(effects.new_rends, rd.partition)) {
                effects.repaired_dangles.splice(effects.repaired_dangles.indexOf(rd), 1);
            }
        });
        let message;
        if (operation == 'cut') {
            message = world.cut_message(new_box, cut_edge_states, effects);
        } else {
            message = world.tape_message(new_box, cut_edge_states, effects);
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let open_dangle = {
    command_name: ['open'],
    execute: open_or_close_dangle
};
let close_dangle = {
    command_name: ['close'],
    execute: open_or_close_dangle
};
function open_or_close_dangle(world, parser) {
    // operation: DangleOpWord, face_w: FaceWord)
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        let face_w = parser.consume_option(commands_1.face_word_tokens, 'face');
        if (!face_w || !parser.done()) {
            return;
        }
        let face = commands_1.word_2_face.get(face_w);
        let applicable_dangles = world.box.dangle_state.keys_array().filter(d => d.free_face == face);
        let new_box = world.box;
        let updated = [];
        applicable_dangles.forEach(function (d) {
            let err = false;
            try {
                new_box = new_box.open_or_close_dangle(commands_1.word_2_dangle_op.get(operation), d);
            } catch (e) {
                err = true;
                if (!(e instanceof datatypes_1.WorldUpdateError)) {
                    throw e;
                }
            }
            if (!err) {
                updated.push(d);
            }
        });
        if (updated.length === 0) {
            parser.get_match('face').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `No dangles to ${operation} on ${face_w} face` };
        }
        let swing_dir_msg = operation === 'close' ? 'in' : 'out';
        let num_hinges = new Set(updated.map(d => d.fixed_face)).size;
        let hinge_msg;
        if (num_hinges == 1) {
            hinge_msg = 'hinge';
        } else {
            hinge_msg = 'hinges';
        }
        let message = `You swing the cardboard on the ${face_w} of the box ${swing_dir_msg} on its ${hinge_msg}`;
        if (!world.box.appears_open() && new_box.appears_open()) {
            message += '\nYou get a glimpse inside the box through the opening.';
            if (new_box.appears_empty()) {
                message += " It's empty.";
            } else {
                message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
            }
        }
        if (effects.box_collapsed) {
            message += '\nThe added stress on the box causes it to collapse in on itself.';
            if (effects.collapse_spilled_items.length > 0) {
                message += ' ' + world.item_spill_message(effects.collapse_spilled_items);
            }
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let remove_rend = {
    command_name: ['remove'],
    execute: remove_or_replace_rend
};
let replace_rend = {
    command_name: ['replace'],
    execute: remove_or_replace_rend
};
function remove_or_replace_rend(world, parser) {
    //operation: RendOpWord, face_w: FaceWord): CommandResult {
    return world_update_effects_1.with_world_update(function (effects) {
        let operation = parser.get_match('command').match;
        let face_w = parser.consume_option(commands_1.face_word_tokens, 'face');
        if (!face_w || !parser.done()) {
            return;
        }
        let face = commands_1.word_2_face.get(face_w);
        let applicable_rends = [];
        world.box.rend_state.entries_array().forEach(function ([r, s]) {
            let face_membership = world.box.box_mesh.get_partition_face_membership(r);
            if (face_membership.get(face) > 0) {
                applicable_rends.push(r);
            }
        });
        let new_box = world.box;
        let updated = [];
        applicable_rends.forEach(function (r) {
            let err = false;
            try {
                new_box = new_box.open_or_close_rend(commands_1.word_2_rend_op.get(operation), r);
            } catch (e) {
                err = true;
                if (!(e instanceof datatypes_1.WorldUpdateError)) {
                    throw e;
                }
            }
            if (!err) {
                updated.push(r);
            }
        });
        if (updated.length == 0) {
            parser.get_match('face').display = commands_1.DisplayEltType.error;
            parser.validity = commands_1.MatchValidity.invalid;
            return { message: `No rends to ${operation} on ${face_w} face` };
        }
        let total_face_membership = new Map();
        total_face_membership = updated.reduce((total, r) => datatypes_1.counter_update(total, world.box.box_mesh.get_partition_face_membership(r)), total_face_membership);
        let face_msg = text_tools_1.face_message(datatypes_1.counter_order(total_face_membership));
        let message;
        if (operation === 'remove') {
            message = `You remove the free cardboard from the ${face_msg} and place it to the side.`;
        } else {
            `You replace the missing cardboard from the ${face_msg}.`;
        }
        if (!world.box.appears_open() && new_box.appears_open()) {
            message += '\nYou get a glimpse inside the box through the opening.';
            if (new_box.appears_empty()) {
                message += " It's empty.";
            } else {
                message += ` You can see ${new_box.next_item().pre_gestalt()} inside.`;
            }
        }
        if (effects.box_collapsed) {
            message += '\nThe added stress on the box causes it to collapse in on itself.';
            if (effects.collapse_spilled_items.length > 0) {
                message += ' ' + world.item_spill_message(effects.collapse_spilled_items);
            }
        }
        return { world: world.update({ box: new_box }), message: message };
    });
}
let take_item = {
    command_name: ['take', 'item'],
    execute: function (world, parser) {
        return world_update_effects_1.with_world_update(function (effects) {
            if (!parser.done()) {
                return;
            }
            let new_box = world.box.take_next_item();
            let new_taken_items = world.taken_items;
            new_taken_items.push(...effects.taken_items);
            let item = effects.taken_items[0];
            let message = `You reach in and take ${item.pre_gestalt()}. It's ${item.post_gestalt()}; ${item.article()} ${item.name()}.`;
            if (new_box.appears_empty()) {
                message += '\nThe box is empty now.';
            } else {
                message += `\nYou can now see ${new_box.next_item().pre_gestalt()} inside the box.`;
            }
            return { world: world.update({ box: new_box, taken_items: new_taken_items }), message: message };
        });
    }
};
function test() {
    let contents = [new items_1.Codex(), new items_1.Pinecone(), new items_1.CityKey()];
    let world = new SingleBoxWorld({ box: new Box({ contents: contents }) });
    console.log('NEW WORLD: test heavy spillage when rolling\n\n\n');
    let d = new commands_1.WorldDriver(world);
    d.apply_command('lift');
    d.apply_command('roll forward');
    d.apply_command('rotate left');
    d.apply_command('rotate le', false);
    // cut the top face vertically along the center from top to bottom
    d.apply_command('cut on top vertically along center from top to bottom');
    // cut the top face vertically along the right edge from top to bottom
    d.apply_command('cut on top vertically along right from top to bottom');
    // should result in a dangle
    // cut the top face horizontally along the top edge from center to right
    d.apply_command('cut on top horizontally along top from center to right');
    // should result in a rend
    // cut the top face horizontally along the bottom edge from center to right
    d.apply_command('cut on top horizontally along bottom from center to right');
    d.apply_command('roll forward');
    // should result in the rend facing straight down, maybe spilling
    d.apply_command('roll forward');
    d.apply_command('lift');
    console.log('\n\n\nNEW WORLD: test heavy spillage and collapse from bottom when lifting\n\n\n');
    let d2 = new commands_1.WorldDriver(world);
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('rotate left');
    d2.apply_command('cut on front horizontally along bottom from left to right');
    d2.apply_command('lift');
    console.log('\n\n\nNEW WORLD: test taping\n\n\n');
    let d3 = new commands_1.WorldDriver(world);
    d3.apply_command('cut on top horizontally along top from left to right');
    d3.apply_command('cut on top horizontally along bottom from left to right');
    d3.apply_command('cut on top vertically along left from top to bottom');
    d3.apply_command('open top');
    d3.apply_command('take item');
    d3.apply_command('close top');
    d3.apply_command('cut on top vertically along right from top to bottom');
    d3.apply_command('remove top');
    d3.apply_command('take item');
    d3.apply_command('take item');
    d3.apply_command('replace top');
    d3.apply_command('tape on top vertically along right from top to bottom');
    d3.apply_command('tape on top vertically along left from top to middle');
    console.log('\n\n\nNEW WORLD: test light spillage when rolling and lifting\n\n\n');
    let d4 = new commands_1.WorldDriver(world);
    d4.apply_command('cut on front horizontally along top from left to right');
    d4.apply_command('cut on front horizontally along bottom from left to right');
    d4.apply_command('cut on front vertically along left from top to bottom');
    d4.apply_command('lift');
    d4.apply_command('cut on front vertically along right from top to bottom');
    d4.apply_command('roll right');
}
exports.test = test;
//test();

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const Datatypes = __webpack_require__(0);
// import {Map, List, Set, OrderedSet, is} from 'immutable';
class WorldUpdateEffects {
    constructor() {
        this.spill_faces = [];
        this.spilled_items = [];
        this.spilled_rends = new Datatypes.FuckDict();
        this.spilled_dangles = new Datatypes.FuckDict();
        this.spillage_level = Datatypes.SpillageLevel.none;
        this.taken_items = [];
        this.new_rends = [];
        this.new_dangles = [];
        this.repaired_rends = [];
        this.repaired_dangles = [];
        this.box_collapsed = false;
        this.collapse_spilled_items = [];
    }
}
exports.WorldUpdateEffects = WorldUpdateEffects;
exports.world_update = {};
function with_world_update(f) {
    //TODO validate: error if world_update.effects isn't null/undefined
    exports.world_update.effects = new WorldUpdateEffects();
    let result = f(exports.world_update.effects);
    exports.world_update.effects = undefined;
    return result;
}
exports.with_world_update = with_world_update;
//TODO define world update exceptions

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map