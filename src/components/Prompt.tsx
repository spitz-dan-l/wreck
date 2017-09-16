import * as React from 'react';
import {keys} from '../typescript/keyboard_tools';

const InputWrapper = (props) => {
  const {children, ...rest} = props;
  const style = {
    position: 'relative',
    minHeight: '8em',
    marginTop: '1em'
  };
  return (
    <div style={style} {...rest} >
      {children}
    </div>
  );
}

const InputDisplay = (props) => {
  const {children} = props;
  const style = {
    wordWrap: 'break-word',
    
  };

  return (
    <span style={style}>
      {children}
    </span>
  );
}

const Cursor = ({onClick}) => {
  let style: any = {
    position: 'fixed'
  };
  return (
    <span className="blinking-cursor" style={style} onClick={onClick}>
      {String.fromCharCode(9608)}
    </span>
  );
};

export class Prompt extends React.Component<any, any> {
  input: any;

  state = { value: '', is_focused: false };

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
    this.setState({is_focused: true});
  }

  blur = () => {
    this.setState({is_focused: false});
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
              {this.props.children}
              {  
                this.state.is_focused ?
                  ( <Cursor onClick={() => this.handleSubmit()} /> ) :
                  ''
              }
            </InputDisplay>
        </InputWrapper>
    );
  }
}

