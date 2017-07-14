import * as React from 'react';
import {CommandParser, DisplayElt} from '../typescript/commands';

import './Text.css';

export function Token (props: {elt: DisplayElt, is_complete?: boolean}) {
    let cls = `token_${props.elt.display}`;
    if (props.is_complete) {
        cls += ' complete';
    }
    return (
      <span class={cls}>
        {props.elt.match}
      </span>
    );
}


export function Text (props: { parser: CommandParser }) {
    let x  = <span> HORSE </span>;
}