import * as React from 'react';

export const ParsedText = (props) => {
  const {parser, style, ...rest} = props;
  const base_style = {
    fontFamily: "'Fira Mono', 'monospace'",
    fontSize: '1em',
    fontColor: 'ivory'
  }

  return (
    <div style={{...base_style, ...style}} {...rest}>
      {parser !== undefined ? parser.command : ''}
    </div>
  );
}

export const OutputText = (props) => {
  const {message, style, ...rest} = props;
  const base_style = {
    fontFamily: "'Fira Mono', 'monospace'",
    fontSize: '1em',
    fontColor: 'ivory'
  }

  return (
    <div style={{...base_style, ...style}} {...rest}>
      {message !== undefined ? message : ''}
    </div>
  );
}