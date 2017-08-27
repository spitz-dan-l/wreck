import * as React from 'react';

import {DisplayEltType, MatchValidity} from '../typescript/commands';

function get_display_color(det: DisplayEltType) {
  switch (det) {
    case DisplayEltType.keyword:
      return 'blue';
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
  const {parser, ...rest} = props;
  let style: any = {
    display: 'inline-block',
    whiteSpace: 'pre-wrap'
  }
  let validity = parser.validity;
  if (validity === MatchValidity.valid) {
    style.fontWeight = '900';
  } else {
    style.fontWeight = '300';
    if (validity === MatchValidity.invalid) {
      style.fontStyle = 'italic'
    }
  }

  return (
    <div style={{...style}} {...rest}>
      {(parser === undefined) ? '' : 
        parser.match.map((elt, i) => (
          <span key={i.toString()} style={{color: get_display_color(elt.display)}}>
            {elt.match}
          </span>
        ))
      }
      {parser.token_gaps[parser.token_gaps.length - 1]}
    </div>
  );
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