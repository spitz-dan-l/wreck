import * as React from 'react';

import {TokenMatch, Parsing} from '../typescript/parser2';

export const Carat = () => <span>>&nbsp;</span>;

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
                { parsing.whitespace[i] + ((typeof elt.token === 'string') ? elt.token : '') }
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
  const {message} = props;

  return (
    <div className="output-text" dangerouslySetInnerHTML={{__html: message}} />
  );
}