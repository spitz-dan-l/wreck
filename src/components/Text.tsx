import * as React from 'react';

import {DisplayEltType, MatchValidity} from '../typescript/commands';

import {get_indenting_whitespace} from '../typescript/text_tools';

function get_display_color(det: DisplayEltType) {
  switch (det) {
    case DisplayEltType.keyword:
      return 'aqua';
    case DisplayEltType.option:
      return 'orange';
    case DisplayEltType.filler:
      return 'ivory';
    case DisplayEltType.partial:
      return 'gray';
    case DisplayEltType.error:
      return 'red';
  }
}

export const ParsedText = (props) => {
  let {parser, showTypeahead, ...rest} = props;
  if (showTypeahead === undefined) {
    showTypeahead = false;
  }

  let style: any = {
    display: 'inline-block',
    whiteSpace: 'pre-wrap',
    position: 'relative'
  }
  let validity = parser.validity;
  if (validity === MatchValidity.valid) {
    style.fontWeight = '900';
    style.fontStyle = 'italic'
  } else {
    style.fontWeight = '100';
    if (validity === MatchValidity.invalid) {
      style.opacity = '0.6';
    }
  }

  let typeahead = [];
  let disabled_typeahead = [];
  if (showTypeahead && parser.match.length > 0) {
    let last_match = parser.match[parser.match.length - 1];
    if ((last_match.match !== '' || parser.match.length === 1) && last_match.typeahead !== undefined) {
      typeahead = last_match.typeahead;
      if (last_match.disabled_typeahead !== undefined){
        disabled_typeahead = last_match.disabled_typeahead;
      }
    }
  }

  let elt_style: any = {
    display: 'inline-block'
  }
  return (
    <div style={{...style}} {...rest}>
      {(parser === undefined) ? '' : 
        parser.match.map((elt, i) => (
          <div key={i.toString()} style={{...elt_style, ...{color: get_display_color(elt.display)}}}>
            <span style={{display: 'inline-block'}}>{elt.match}</span>
            { ( showTypeahead && i == parser.match.length - 1 && typeahead.length > 0) ? (
              <TypeaheadList
                typeahead={typeahead}
                disabled_typeahead={disabled_typeahead}
                indentation={get_indenting_whitespace(elt.match)}/> )
            : '' }
          </div>
        ))
      }
      {/* parser.token_gaps[parser.token_gaps.length - 1] */}
    </div>
  );
}

export const TypeaheadList = (props) => {
  const {typeahead, disabled_typeahead, indentation} = props;
  const style: any = {
    position: "absolute",
    listStyleType: "none",
    padding: 0,
    margin: 0,
    whiteSpace: 'pre'
  };
  const n_typeahead = typeahead.length;
  return (
    <ul style={style}>
      {typeahead.map((option, i) => (
        <li key={i.toString()} style={{marginTop: '1em'}}>
          <span>{indentation}</span>
          <span>{option}</span>
        </li>
      ))}
      {disabled_typeahead.map((option, i) => (
        <li key={(i + n_typeahead).toString()} style={{opacity: 0.4, marginTop: '1em'}}>
          <span>{indentation}</span>
          <span>{option}</span>
        </li>
      ))}
    </ul>
  )
}

export const OutputText = (props) => {
  const {message, style, ...rest} = props;
  const base_style = {
    display: 'inline-block',
    whiteSpace: 'pre-wrap'
  }

  return (
    <div style={{...base_style, ...style}} {...rest}>
      {message !== undefined ? message : ''}
    </div>
  );
}