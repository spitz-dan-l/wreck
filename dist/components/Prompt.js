"use strict";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) if (e.indexOf(p[i]) < 0)
            t[p[i]] = s[p[i]];
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const keyboard_tools_1 = require("../typescript/keyboard_tools");
const InputWrapper = (props) => {
    const { children } = props, rest = __rest(props, ["children"]);
    const style = {
        position: 'relative',
        minHeight: '8em',
        marginTop: '1em'
    };
    return (React.createElement("div", Object.assign({ style: style }, rest), children));
};
const InputDisplay = (props) => {
    const { children } = props;
    const style = {
        wordWrap: 'break-word',
    };
    return (React.createElement("span", { style: style }, children));
};
const Cursor = ({ onClick }) => {
    let style = {
        position: 'absolute'
    };
    return (React.createElement("span", { className: "blinking-cursor", style: style, onClick: onClick }, String.fromCharCode(9608)));
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
            node = (typeof node === "string") ? document.getElementById(node) : node;
            if (!node) {
                return false;
            }
            else if (node.createTextRange) {
                var textRange = node.createTextRange();
                textRange.collapse(true);
                textRange.moveEnd(pos);
                textRange.moveStart(pos);
                textRange.select();
                return true;
            }
            else if (node.setSelectionRange) {
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
        return (React.createElement(InputWrapper, { onClick: () => this.focus(), onBlur: () => this.blur() },
            React.createElement("input", { onChange: this.handleChange, value: this.state.value, style: input_style, ref: i => this.input = i }),
            React.createElement(InputDisplay, null,
                this.props.children,
                this.state.is_focused ?
                    (React.createElement(Cursor, { onClick: () => this.handleSubmit() })) :
                    '')));
    }
}
exports.Prompt = Prompt;
//# sourceMappingURL=Prompt.js.map