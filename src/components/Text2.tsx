import * as React from 'react';

import {TokenMatch, Parsing} from '../typescript/parser2';

import { MatchValidity } from '../typescript/parser';

export const Carat = () => (
  <span>
    >&nbsp;
  </span>
);

function get_display_color(tm: TokenMatch) {
  if (tm.type.kind === 'Match') {
    switch (tm.type.type.kind) {
      case 'Keyword':
        return 'aqua';
      case 'Option':
        return 'orange';
      case 'Filler':
        return 'ivory';
    }
  }

  if (tm.type.kind === 'Partial') {
    return 'silver';
  }

  if (tm.type.kind === 'Error') {
    return 'red';
  }
}

export const ParsedText2 = (props: { parsing: Parsing, children: any }) => {
  let parsing: Parsing = props.parsing;
  let children = props.children;

  let style: any = {
    whiteSpace: 'pre-wrap',
    position: 'relative'
  }
  
  let view = parsing.view;

  if (view.submittable || view.submission) {
    style.fontWeight = '900';
  } else {
    style.fontWeight = '100';
    if (view.match_status === 'Error') {
      style.opacity = '0.6';
    }
  }

  return (
    <div className="parsed-text">
      <Carat />
      <div style={style}>
        {
          view.matches.map((elt, i) => (
            <div key={i.toString()} style={{color: get_display_color(elt)}}>
              <span>
                { parsing.whitespace[i] + (elt.token as string) }
              </span>
              { ( i === 0 ) ? children : '' }
            </div>
          ))
        }
      </div>
    </div>
  );
}


export const ParsedText = (props) => {
  let {parser, typeaheadIndex, children} = props;

  let style: any = {
    //display: 'inline-block',
    whiteSpace: 'pre-wrap',
    position: 'relative'
  }
  let validity = parser.validity;
  if (validity === MatchValidity.valid) {
    style.fontWeight = '900';
    //style.fontStyle = 'italic'
  } else {
    style.fontWeight = '100';
    if (validity === MatchValidity.invalid) {
      style.opacity = '0.6';
    }
  }

  const elt_style: any = {
    //display: 'inline-block'
  }

  const span_style: any = {
    //display: 'inline-block'
  }

  return (
    <div className="parsed-text" style={{/*display: 'inline-block'*/}}>
      <Carat />
      <div style={style}>
        {(parser === undefined) ? '' : 
          parser.match.map((elt, i) => (
            <div key={i.toString()} style={{...elt_style, ...{color: get_display_color(elt.display)}}}>
              <span style={span_style}>
                {elt.match + ( i === parser.match.length - 1  ? parser.tail_padding : '' ) }
              </span>
              { ( i === typeaheadIndex ) ? children : '' }
            </div>
          ))
        }
      </div>
    </div>
  );
}

export const OutputText = (props) => {
  const {message_html} = props;

  return (
    <div className="output-text" dangerouslySetInnerHTML={{__html: message_html}} />
  );
}