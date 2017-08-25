import * as React from 'react';

const InputWrapper = (props) => {
  const {style, children, ...rest} = props;
  const base_style = {
    position: 'relative'
  };
  return (
    <div style={{...base_style, ...style}} {...rest} >
      {children}
    </div>
  );
}

// //need a class to get ref
// class Input extends React.Component<any, any> {
//   render () {
//     const {style, ...rest} = this.props;
//     const input_style = {
//       position: 'absolute',
//       left: '-16px',
//       top: 0,
//       width: 0,
//       height: 0,
//       background: 'transparent',
//       border: 'none',
//       color: 'transparent',
//       outline: 'none',
//       padding: 0,
//       resize: 'none',
//       zIndex: -1,
//       overflow: 'hidden'
//     };

//     return (
//       <input style={{...base_style, ...style}} {...rest} />
//     );
//   }
// }

const InputDisplay = (props) => {
  const {children, style, ...rest} = props;
  const base_style = {
    worWrap: 'break-word',
    outline: 0,
    // minHeight: '2em',
    // minWidth: '10em',
    display: 'inline-block',
    // padding: '.5em 2em .5em 1em',
    color: 'ivory',
    boxShadow: 'none',
    // border: '1px solid rgba(34,36,38,.15)',
    // transition: 'box-shadow .1s ease,width .1s ease',
    // margin: 0,
    // marginBottom: '-2px'
  };

  return (
    <span style={{...base_style, ...style}} {...rest}>
      {children}
    </span>
  );
}

let keys = {
  enter: 13,
};

export class Prompt extends React.Component<any, any> {
  input: any;



  state = { value: '' }; //meta is an object with isValid bool, and autocomplete array

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
    console.log(this.state.value);
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
          <input onChange={this.handleChange} onKeyDown={this.handleKeys} value={this.state.value} style={input_style} ref={i => this.input = i} />
          <InputDisplay>
            {this.props.children}[]
          </InputDisplay>
        </InputWrapper>
    );
  }
}

