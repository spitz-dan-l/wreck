// import * as React from 'react';
var React = require('react');
import {Token, TokenMatch, is_match, is_partial, is_error, Parsing} from '../typescript/parser';

export const Carat = () => <span>>&nbsp;</span>;

function get_display_color(tm: TokenMatch) {
  if (is_match(tm)) {
    switch (tm.type.type.kind) {
      case 'Keyword':
        return 'aqua';
      case 'Option':
        return 'orange';
      case 'Filler':
        return 'ivory';
    }
  }
  if (is_partial(tm)) {
    return 'silver';
  }

  if (is_error(tm)) {
    return 'red';
  }
}

export const ParsedText = (props: { parsing: Parsing, children?: any }) => {
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
    if (view.match_status === 'ErrorMatch') {
      style.opacity = '0.6';
    }
  }

  function convert_token(s: Token) {
     if (typeof s === 'string') {
      return s;
    }
    return '';
  }
  return (
    <div className="parsed-text">
      <Carat />
      <div style={style}>
        {
          view.matches.map((elt, i) => (
            <div key={i.toString()} style={{color: get_display_color(elt)}}>
              <span>
                { parsing.whitespace[i] + convert_token(elt.token) }
              </span>
              { ( i === 0 ) ? children : '' }
            </div>
          ))
        }
      </div>
    </div>
  );
}

export const OutputText = (props) => {
  const {rendering} = props;

  return (
    <div className="output-text" dangerouslySetInnerHTML={{__html: rendering}} />
  );
}