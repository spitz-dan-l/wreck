"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const parser_1 = require("../typescript/parser");
exports.Carat = () => (React.createElement("span", null, ">\u00A0"));
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
exports.ParsedText = (props) => {
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
    }
    else {
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
    return (React.createElement("div", { className: "parsed-text", style: { /*display: 'inline-block'*/} },
        React.createElement(exports.Carat, null),
        React.createElement("div", { style: style }, (parser === undefined) ? '' :
            parser.match.map((elt, i) => (React.createElement("div", { key: i.toString(), style: Object.assign({}, elt_style, { color: get_display_color(elt.display) }) },
                React.createElement("span", { style: span_style }, elt.match + (i === parser.match.length - 1 ? parser.tail_padding : '')),
                (i === typeaheadIndex) ? children : ''))))));
};
exports.OutputText = (props) => {
    const { message_html } = props;
    return (React.createElement("div", { className: "output-text", dangerouslySetInnerHTML: { __html: message_html } }));
};
//# sourceMappingURL=Text.js.map