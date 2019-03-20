"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const Prompt_1 = require("./Prompt");
const Text_1 = require("./Text");
const TypeaheadList_1 = require("./TypeaheadList");
const History_1 = require("./History");
const text_tools_1 = require("../typescript/text_tools");
const parser_1 = require("../typescript/parser");
class Terminal extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeys = (event) => {
            let swallowed_enter = (this.typeahead_list !== null) ? this.typeahead_list.handleKeys(event) : false;
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
        this.handlePromptChange = (input) => {
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
        this.handleTypeaheadSelection = (option) => {
            let matched_tokens = this.currentParser().match.slice(0, this.currentTypeaheadIndex() + 1).map((elt) => elt.match);
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
    componentDidUpdate() {
    }
    render() {
        return (React.createElement("div", { className: "terminal", tabIndex: -1, onKeyDown: this.handleKeys, ref: cc => this.contentContainer = cc },
            React.createElement(History_1.History, { timeout: 700, onAnimationFinish: this.scrollToPrompt, history: this.state.world_driver.history, possible_history: this.state.world_driver.possible_history, ref: h => this.history = h }),
            React.createElement(Prompt_1.Prompt, { onSubmit: this.handleSubmit, onChange: this.handlePromptChange, ref: p => this.prompt = p },
                React.createElement(Text_1.ParsedText, { parser: this.currentParser(), typeaheadIndex: this.currentTypeaheadIndex() },
                    React.createElement(TypeaheadList_1.TypeaheadList, { typeahead: this.currentTypeahead(), indentation: this.currentIndentation(), onTypeaheadSelection: this.handleTypeaheadSelection, ref: t => this.typeahead_list = t })))));
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=Terminal.js.map