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
    let swallowed_enter = false;
    
    top: switch (event.keyCode) {
      case keys.enter:
        if (this.state.selection_index === -1) {
          break;
        }
        swallowed_enter = true;
      case keys.tab:
        event.preventDefault();
      case keys.right:      
        if (this.props.typeahead.length === 0) {
          break;
        }
        let selected = (this.state.selection_index === -1) ?
          this.props.typeahead[0] :
          this.props.typeahead[this.state.selection_index];

        if (is_enabled(selected)) {
          this.props.onTypeaheadSelection(unwrap(selected));
        }
        break;
      
      case keys.up:
      case keys.down:
        let new_selection_index;
        switch (event.keyCode) {
          case keys.up:
            if (this.state.selection_index === -1) {
              break top;
            }
            new_selection_index = this.state.selection_index - 1;
            break;
          case keys.down:
            if (this.state.selection_index === this.props.typeahead.length - 1) {
              break top;
            }
            new_selection_index = this.state.selection_index + 1;
            break;  
        }
        this.setState({selection_index: new_selection_index});
        break;
    }

    return swallowed_enter;
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