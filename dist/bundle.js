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
/******/ 	return __webpack_require__(__webpack_require__.s = 12);
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
const text_tools_1 = __webpack_require__(2);
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
function is_dwrapped(x) {
    return x.disablable !== undefined;
}
exports.is_dwrapped = is_dwrapped;
function set_enabled(x, enabled = true) {
    if (is_dwrapped(x)) {
        return x; //could do check here for enabled being set properly already
    } else {
        let result = { value: x, disablable: true, enabled };
        return result;
    }
}
exports.set_enabled = set_enabled;
function unwrap(x) {
    if (is_dwrapped(x)) {
        return x.value;
    } else {
        return x;
    }
}
exports.unwrap = unwrap;
function with_disablable(x, f) {
    return set_enabled(unwrap(f(unwrap(x))), is_enabled(x));
}
exports.with_disablable = with_disablable;
function is_enabled(x) {
    if (is_dwrapped(x)) {
        return x.enabled;
    } else {
        return true;
    }
}
exports.is_enabled = is_enabled;
// let x: Disablable<number> = [123];
// let y = {...x, enabled: true}
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
        for (let spec_toks of option_spec_tokens) {
            let subparser = this.subparser();
            let exact_match = subparser.consume_exact(unwrap(spec_toks), display, name);
            if (is_enabled(spec_toks)) {
                if (exact_match) {
                    this.integrate(subparser);
                    return text_tools_1.normalize_whitespace(text_tools_1.untokenize(unwrap(spec_toks)));
                }
                if (subparser.validity === MatchValidity.partial) {
                    partial_matches.push(subparser.match[0]);
                }
            } else {
                if (exact_match || subparser.validity === MatchValidity.partial) {
                    let disabled_match = set_enabled(subparser.match[0], false);
                    partial_matches.push(disabled_match);
                }
            }
        }
        if (partial_matches.filter(de => is_enabled(de)).length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(de => with_disablable(de, x => x.typeahead[0]));
            this.match.push({
                display: DisplayEltType.partial,
                match: unwrap(partial_matches[0]).match,
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
// casts a generator function to a coroutine function
function coroutine(f) {
    return f;
}
exports.coroutine = coroutine;
class CoroutinePartialResult extends Error {
    constructor(value) {
        super();
        this.value = value;
    }
}
exports.CoroutinePartialResult = CoroutinePartialResult;
function instrument_coroutine(gen_func, lift) {
    if (lift === undefined) {
        lift = y => {
            if (y instanceof Array) {
                return y;
            } else {
                return [y];
            }
        };
    }
    function* inner() {
        let partial_results = [];
        let frontier = [{ values: [undefined], iter: undefined }];
        while (frontier.length > 0) {
            let path = frontier.pop();
            let p;
            if (path.iter === undefined) {
                p = path.values;
            } else {
                let n = path.iter.next();
                if (n.done === false) {
                    p = [...path.values, n.value];
                    frontier.push(path);
                } else {
                    continue;
                }
            }
            let gen = gen_func();
            for (let inp of p.slice(0, -1)) {
                gen.next(inp);
            }
            let branches_result;
            try {
                branches_result = gen.next(p[p.length - 1]);
            } catch (e) {
                if (e instanceof CoroutinePartialResult) {
                    partial_results.push(e.value);
                    continue;
                } else {
                    throw e;
                }
            }
            if (branches_result.done === true) {
                yield branches_result.value;
            } else {
                let branches = lift(branches_result.value);
                let branch_iter = branches.values();
                frontier.push({ values: p, iter: branch_iter });
            }
        }
        return partial_results;
    }
    return inner;
}
exports.instrument_coroutine = instrument_coroutine;
function parse_with(f) {
    function inner(world, parser) {
        let new_p;
        let new_f = () => {
            new_p = parser.subparser();
            return f(world, new_p);
        };
        let lift = y => {
            if (y === false) {
                return [];
            } else if (y instanceof Array) {
                return y;
            } else {
                return [y];
            }
        };
        let wrapped = instrument_coroutine(new_f, lift);
        let iter = wrapped();
        let result = iter.next();
        if (result.done === false) {
            parser.integrate(new_p);
            //update the display elt types according to any partial results received at the end
            return result.value;
        } else {
            debugger;
            let partial_results = result.value;
            let pos = 0;
            while (true) {
                let unique_next_options = [];
                for (let sub_p of partial_results) {
                    if (pos < sub_p.match.length) {
                        let opt = text_tools_1.normalize_whitespace(sub_p.match[pos].match);
                        if (unique_next_options.indexOf(opt) === -1) {
                            unique_next_options.push(opt);
                        }
                    }
                }
                if (unique_next_options.length === 0) {
                    break;
                } else if (unique_next_options.length === 1) {
                    parser.consume_filler(unique_next_options);
                } else {
                    parser.consume_option(unique_next_options.map(opt => [opt]));
                }
                pos++;
            }
            return;
        }
    }
    return inner;
}
exports.parse_with = parse_with;
function* consume_option_stepwise_eager(parser, options) {
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
        let display_type = next_tokens.length === 1 ? DisplayEltType.filler : DisplayEltType.option;
        let next_tok = yield parser.consume_option(next_tokens.map(text_tools_1.split_tokens), undefined, display_type);
        current_cmd.push(next_tok);
        pos++;
    }
}
exports.consume_option_stepwise_eager = consume_option_stepwise_eager;
function* consume_option_stepwise_eager2(parser, options) {
    let option_in_this_quantum_branch = yield options;
    for (let tok of option_in_this_quantum_branch) {
        parser.consume_filler([tok]);
        if (parser.validity === MatchValidity.invalid) {
            yield false;
        } else if (parser.validity === MatchValidity.partial) {
            throw new CoroutinePartialResult(parser);
        }
    }
    return text_tools_1.untokenize(option_in_this_quantum_branch);
}
exports.consume_option_stepwise_eager2 = consume_option_stepwise_eager2;
function apply_command(world, cmd) {
    let parser = new CommandParser(cmd);
    let commands = world.get_commands();
    let options = commands.map(cmd => with_disablable(cmd, c => c.command_name));
    let cmd_name = parser.consume_option(options, 'command', DisplayEltType.keyword);
    let result = { parser: parser, world: world };
    if (!cmd_name) {
        return result;
    }
    let command = unwrap(commands[commands.findIndex(cmd => cmd_name === text_tools_1.untokenize(unwrap(cmd).command_name))]);
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
        if (res2 !== undefined) {
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

/***/ }),
/* 3 */
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
const bird_world_1 = __webpack_require__(10);
class Game extends React.Component {
    componentWillMount() {
        // let contents: Item[] = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
        // let world = new World.SingleBoxWorld({box: new World.Box({contents: contents})});
        this.world_driver = new commands_1.WorldDriver(new bird_world_1.BirdWorld({}));
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
const keyboard_tools_1 = __webpack_require__(3);
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
        position: 'fixed'
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
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const Prompt_1 = __webpack_require__(6);
const Text_1 = __webpack_require__(8);
const TypeaheadList_1 = __webpack_require__(9);
const text_tools_1 = __webpack_require__(2);
const commands_1 = __webpack_require__(1);
const Carat = () => React.createElement("span", null, ">\u00A0");
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeys = event => {
            let swallowed_enter = this.typeahead_list.handleKeys(event);
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
            return this.state.world_driver.current_state.parser.validity === commands_1.MatchValidity.valid;
        };
        this.handlePromptChange = input => {
            let result = this.state.world_driver.apply_command(input, false);
            this.setState({ world_driver: this.state.world_driver });
        };
        this.handleTypeaheadSelection = option => {
            let matched_tokens = this.currentParser().match.map(elt => elt.match);
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
        this.currentTypeahead = () => {
            let parser = this.currentParser();
            let last_match = parser.match[parser.match.length - 1];
            let typeahead = last_match.typeahead;
            if (typeahead === undefined || parser.match.length > 1 && last_match.match === '') {
                return [];
            }
            return typeahead;
        };
        this.currentIndentation = () => {
            let parser = this.currentParser();
            return text_tools_1.get_indenting_whitespace(parser.match[parser.match.length - 1].match);
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
        return React.createElement("div", { style: container_style, tabIndex: -1, onFocus: this.focus, onBlur: this.blur, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc }, this.state.world_driver.history.map(({ parser, message }, i) => {
            if (i === 0) {
                return React.createElement("div", { key: i.toString() }, React.createElement("p", null, React.createElement(Text_1.OutputText, { message: message })));
            }
            return React.createElement("div", { key: i.toString(), style: { marginTop: '1em' } }, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: parser }), React.createElement("p", null, React.createElement(Text_1.OutputText, { message: message })));
        }), React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p }, React.createElement(Carat, null), React.createElement(Text_1.ParsedText, { parser: this.state.world_driver.current_state.parser }, React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t }))));
    }
}
exports.Terminal = Terminal;

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const commands_1 = __webpack_require__(1);
function get_display_color(det) {
    switch (det) {
        case commands_1.DisplayEltType.keyword:
            return 'aqua';
        case commands_1.DisplayEltType.option:
            return 'orange';
        case commands_1.DisplayEltType.filler:
            return 'ivory';
        case commands_1.DisplayEltType.partial:
            return 'silver';
        case commands_1.DisplayEltType.error:
            return 'red';
    }
}
exports.ParsedText = props => {
    let { parser, children } = props;
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
    const elt_style = {
        display: 'inline-block'
    };
    const span_style = {
        display: 'inline-block'
    };
    return React.createElement("div", { style: style }, parser === undefined ? '' : parser.match.map((elt, i) => React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) }, React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')), i === parser.match.length - 1 ? children : '')));
};
exports.OutputText = props => {
    const { message } = props;
    const style = {
        display: 'inline-block',
        whiteSpace: 'pre-wrap'
    };
    return React.createElement("div", { style: style }, message !== undefined ? message : '');
};

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const keyboard_tools_1 = __webpack_require__(3);
const commands_1 = __webpack_require__(1);
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
                if (commands_1.is_enabled(selected)) {
                    this.props.onTypeaheadSelection(commands_1.unwrap(selected));
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
            whiteSpace: 'pre'
        };
        return React.createElement("ul", { style: style }, typeahead.map((option, i) => React.createElement("li", Object.assign({ key: i.toString(), onMouseOver: () => this.handleMouseOver(i), style: {
                marginTop: '1em',
                background: i === this.state.selection_index ? 'DimGray' : 'inherit',
                opacity: commands_1.is_enabled(option) ? 1.0 : 0.4
            } }, commands_1.is_enabled(option) ? { onClick: () => this.handleClick(commands_1.unwrap(option)) } : {}), React.createElement("span", null, indentation), React.createElement("span", null, commands_1.unwrap(option)))));
    }
}
exports.TypeaheadList = TypeaheadList;

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = __webpack_require__(1);
const datatypes_1 = __webpack_require__(11);
const text_tools_1 = __webpack_require__(2);
class BirdWorld {
    constructor({ is_in_heaven, has_seen }) {
        if (is_in_heaven === undefined) {
            is_in_heaven = false;
        }
        if (has_seen === undefined) {
            has_seen = new datatypes_1.FuckDict([[false, false], [true, false]]);
        }
        this.is_in_heaven = is_in_heaven;
        this.has_seen = has_seen;
    }
    update({ is_in_heaven, has_seen }) {
        if (is_in_heaven === undefined) {
            is_in_heaven = this.is_in_heaven;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }
        return new BirdWorld({ is_in_heaven, has_seen });
    }
    get_commands() {
        let commands = [];
        commands.push(go_cmd);
        if (this.has_seen.get(true)) {
            commands.push(commands_1.set_enabled(mispronounce_cmd, this.is_in_heaven));
        }
        commands.push(be_cmd);
        return commands;
    }
    interstitial_update() {
        if (!this.has_seen.get(this.is_in_heaven)) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(this.is_in_heaven, true);
            return {
                world: this.update({ has_seen: new_has_seen }),
                message: this.is_in_heaven ? "You're in Heaven. There's a bird up here. His name is Zarathustra. He is ugly." : "You're standing around on the earth."
            };
        }
    }
}
exports.BirdWorld = BirdWorld;
function bird_world_coroutine(f) {
    return commands_1.coroutine(f);
}
const go_cmd = {
    command_name: ['go'],
    execute: commands_1.parse_with((world, parser) => bird_world_coroutine(function* () {
        let dir_options = [];
        dir_options.push(commands_1.set_enabled(['up'], !world.is_in_heaven));
        if (world.has_seen.get(true)) {
            dir_options.push(commands_1.set_enabled(['down'], world.is_in_heaven));
        }
        let dir_word = yield parser.consume_option(dir_options);
        yield parser.done();
        let new_world = world.update({ is_in_heaven: !world.is_in_heaven });
        let message = text_tools_1.capitalize(dir_word) + ' you go.';
        return { world: new_world, message: message };
    })())
};
const mispronounce_cmd = {
    command_name: ['mispronounce'],
    execute: commands_1.parse_with((world, parser) => bird_world_coroutine(function* () {
        let specifier_word = yield parser.consume_option([["zarathustra's"]]);
        yield parser.consume_filler(['name']);
        yield parser.done();
        let utterance_options = ['Zammersretter', 'Hoosterzaro', 'Rooster Thooster', 'Thester Zar', 'Zerthes Threstine'];
        let message = `"${text_tools_1.random_choice(utterance_options)}," you say.`;
        return { world, message };
    })())
};
let roles = ['the One Who Gazes Ahead', 'the One Who Gazes Back', 'the One Who Gazes Up', 'the One Who Gazes Down', 'the One Whose Palms Are Open', 'the One Whose Palms Are Closed', 'the One Who Is Strong', 'the One Who Is Weak', 'the One Who Seduces', 'the One Who Is Seduced'];
let qualities = ['outwardly curious', 'introspective', 'transcendent', 'sorrowful', 'receptive', 'adversarial', 'confident', 'impressionable', 'predatory', 'vulnerable'];
const be_cmd = {
    command_name: ['be'],
    execute: commands_1.parse_with((world, parser) => bird_world_coroutine(function* () {
        let role_choice = yield* commands_1.consume_option_stepwise_eager2(parser, roles.map(text_tools_1.split_tokens));
        yield parser.done();
        debugger;
        return { world, message: `You feel ${qualities[roles.indexOf(role_choice)]}.` };
    })())
};

/***/ }),
/* 11 */
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

/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", { value: true });
const React = __webpack_require__(0);
const ReactDom = __webpack_require__(5);
const Game_1 = __webpack_require__(4);
ReactDom.render(React.createElement(Game_1.Game, null), document.getElementById('game'));

/***/ })
/******/ ]);
//# sourceMappingURL=bundle.js.map