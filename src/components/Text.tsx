import * as React from 'react';
import { MatchStatus, Parsing, Token, TokenAvailability, TokenMatch } from '../typescript/parser';


export const Carat = () => <span>>&nbsp;</span>;

function cssify_status(status: MatchStatus): string {
  switch (status) {
    case 'Match':
      return 'match';
    case 'PartialMatch':
      return 'partial-match';
    case 'ErrorMatch':
      return 'error-match';
  }
}

function cssify_availability(availability: TokenAvailability) {
  switch (availability) {
    case 'Available':
      return 'available';
    case 'Used':
      return 'used';
    case 'Locked':
      return 'locked';
  }
}

function get_class_name(tm: TokenMatch) {
  let classes: string[] = [
    'token',
    cssify_status(tm.status),
    cssify_availability(tm.expected.availability)
  ];

  if (tm.status === 'Match') {
    for (let [label, on] of Object.entries(tm.expected.labels)) {
      if (on) {
        classes.push(label);
      }
    }
  }
  return classes.join(' ');
}

export const ParsedText = (props: { parsing: Parsing, children?: any }) => {
  let parsing: Parsing = props.parsing;
  let children = props.children;
  
  let command_classes = ['command'];

  let view = parsing.view;
  command_classes.push(cssify_status(view.match_status));

  if (view.submittable || view.submission) {
    command_classes.push('submittable');
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
      <div className={command_classes.join(' ')}>
        {
          view.matches.map((elt, i) => (
            <div key={i.toString()} className={get_class_name(elt)}>
              <span>
                { parsing.whitespace[i] + convert_token(elt.actual) }
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