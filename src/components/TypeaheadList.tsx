import * as React from 'react';

import {keys} from '../typescript/keyboard_tools';
import {is_enabled, unwrap} from '../typescript/commands';

export class TypeaheadList extends React.Component<any, any> {
  constructor(props) {
    super(props);
    this.state = {selection_index: -1};
  }

  componentDidUpdate() {
    if (this.state.selection_index >= this.props.typeahead.length) {
      this.setState({selection_index: this.props.typeahead.length - 1});
    }
  }

  handleClick(option) {
    this.props.onTypeaheadSelection(option);
  }

  handleMouseOver(index) {
    this.setState({selection_index: index});
  }

  handleKeys(event) {
    if (event.keyCode === keys.tab || event.keyCode === keys.right) {
      event.preventDefault();
      if (this.state.selection_index === -1 || this.props.typeahead.length === 0) {
        return;
      }
      let selected = this.props.typeahead[this.state.selection_index];
      if (is_enabled(selected)) {
        this.props.onTypeaheadSelection(unwrap(selected));
      } else {
        return;
      }
    } else if (event.keyCode === keys.up) {
      if (this.state.selection_index === -1) {
        return;
      } else {
        this.setState({selection_index: this.state.selection_index - 1});
      }
    } else if (event.keyCode === keys.down) {
      if (this.state.selection_index === this.props.typeahead.length - 1) {
        return;
      } else {
        this.setState({selection_index: this.state.selection_index + 1});
      }
    } 
  }

  render() {
    const {typeahead, indentation} = this.props;
    const style: any = {
      position: "absolute",
      listStyleType: "none",
      padding: 0,
      margin: 0,
      whiteSpace: 'pre'
    };
    return (
      <ul style={style}>
        {typeahead.map((option, i) => (
          <li
            key={i.toString()} 
            onMouseOver={() => this.handleMouseOver(i)}
            style={{
              marginTop: '1em',
              background: i === this.state.selection_index ? 'DimGray' : 'inherit',
              opacity: is_enabled(option) ? 1.0 : 0.4
            }}
            {...(
              is_enabled(option)
                ? {onClick: () => this.handleClick(unwrap(option))}
                : {}
            )}
          >
            <span>{indentation}</span>
            <span>{unwrap(option)}</span>
          </li>
        ))}
      </ul>
    )
  }
}