import * as React from 'react';
import {keys} from '../typescript/keyboard_tools';

const InputWrapper = (props) => {
  const {style, children, ...rest} = props;
  const base_style = {
    position: 'relative',
    minHeight: '5em'
  };
  return (
    <div style={{...base_style, ...style}} {...rest} >
      {children}
    </div>
  );
}

const InputDisplay = (props) => {
  const {children, style, ...rest} = props;
  const base_style = {
    worWrap: 'break-word',
    outline: 0,
    display: 'inline-block',
    boxShadow: 'none',
  };

  return (
    <span style={{...base_style, ...style}} {...rest}>
      {children}
    </span>
  );
}

export class Prompt extends React.Component<any, any> {
  input: any;

  state = { value: '' };

  handleSubmit = () => {
    let success = this.props.onSubmit();
    if (success) {
      this.setState({value: ''});
    } 
  }

  // when key down is called by auto complete see if we should just submit
  handleKeys = ({keyCode}) => {
    if (keyCode === keys.enter) {
      this.handleSubmit();
    }
    this.setCursor(this.input, this.input.value.length);
  }

  handleChange = () => {
    const value = this.input.value;
    this.props.onChange(value)
    this.setState({value: value});
  }

  focus = () => {
    this.input.focus();
  }

  setCursor = (node,pos) => {
      node = (typeof node === "string") ? document.getElementById(node) : node;

      if(!node){
          return false;
      }else if(node.createTextRange){
          var textRange = node.createTextRange();
          textRange.collapse(true);
          textRange.moveEnd(pos);
          textRange.moveStart(pos);
          textRange.select();
          return true;
      }else if(node.setSelectionRange){
          node.setSelectionRange(pos,pos);
          return true;
      }

      return false;
  }

  render() {
    const input_style: any = {
      position: 'absolute',
      left: '-16px',
      top: 0,
      width: 0,
      height: 0,
      background: 'transparent',
      border: 'none',
      color: 'transparent',
      outline: 'none',
      padding: 0,
      resize: 'none',
      zIndex: -1,
      overflow: 'hidden'
    };
    return (
        <InputWrapper onClick={() => this.focus()}>
          <input onChange={this.handleChange} value={this.state.value} style={input_style} ref={i => this.input = i} />
          <InputDisplay>
            {this.props.children}[]
          </InputDisplay>
        </InputWrapper>
    );
  }
}

