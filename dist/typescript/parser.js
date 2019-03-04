"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const text_tools_1 = require("./text_tools");
const datatypes_1 = require("./datatypes");
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
            }
            else {
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
            }
            else {
                if (is_exact_match || subparser.validity === MatchValidity.partial) {
                    let disabled_match = datatypes_1.set_enabled(subparser.match[0], false);
                    partial_matches.push(disabled_match);
                }
            }
        }
        if (exact_match_subparser !== null) {
            let typeahead = partial_matches.map(datatypes_1.with_disablable((x) => datatypes_1.unwrap(x.typeahead[0])));
            // let typeahead = partial_matches.map( (de) => with_disablable(de, (x) => x.typeahead[0]));
            this.integrate(exact_match_subparser);
            this.match[this.match.length - 1].typeahead = typeahead;
            return text_tools_1.normalize_whitespace(text_tools_1.untokenize(exact_match_spec_toks));
        }
        if (partial_matches.length > 0) {
            this.validity = MatchValidity.partial;
            this.position = this.tokens.length - 1;
            let typeahead = partial_matches.map(datatypes_1.with_disablable((x) => datatypes_1.unwrap(x.typeahead[0])));
            this.match.push({
                display: DisplayEltType.partial,
                match: datatypes_1.unwrap(partial_matches[0]).match,
                typeahead: typeahead,
                name: name,
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
        }
        else {
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
exports.with_early_stopping = (gen_func) => {
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
            subparser: sp,
        });
    }
    let partial_matches = [];
    for (let t of threads) {
        if (t.subparser.is_done()) {
            parser.integrate(t.subparser);
            return t.result;
        }
        else {
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
    }
    else {
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
                }
                else if (o.startsWith('&')) {
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
//# sourceMappingURL=parser.js.map