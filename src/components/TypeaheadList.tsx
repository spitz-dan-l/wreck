import * as React from 'react';

import {is_enabled, unwrap} from '../typescript/commands';

export class TypeaheadList extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {selection_index: -1};
  }

  handleClick(option) {
    console.log('clicked');
    console.log(option);
    this.props.onTypeaheadSelection(option);
  }

  handleSubmit(option) {
    
  }

  handleTab() {

  }

  handleDirection() {

  }

  render() {
    const {typeahead, disabled_typeahead, indentation} = this.props;
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
            <span
              {...(
                is_enabled(option)
                  ? {onClick: () => this.handleClick(unwrap(option))}
                  : {style: {opacity: '0.4'}}
              )}>
              {unwrap(option)}
            </span>
          </li>
        ))}
      </ul>
    )
  }
}