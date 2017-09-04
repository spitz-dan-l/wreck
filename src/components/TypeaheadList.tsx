import * as React from 'react';


export const TypeaheadList = (props) => {
  const {typeahead, disabled_typeahead, indentation} = props;
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
          <span>{option}</span>
        </li>
      ))}
      {disabled_typeahead.map((option, i) => (
        <li key={(i + n_typeahead).toString()} style={{opacity: 0.4, marginTop: '1em'}}>
          <span>{indentation}</span>
          <span>{option}</span>
        </li>
      ))}
    </ul>
  )
}

export class TypeaheadList2 extends React.Component<any, any> {
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
            <span onClick={() => this.handleClick(option)}>{option}</span>
          </li>
        ))}
        {disabled_typeahead.map((option, i) => (
          <li key={(i + n_typeahead).toString()} style={{opacity: 0.4, marginTop: '1em'}}>
            <span>{indentation}</span>
            <span>{option}</span>
          </li>
        ))}
      </ul>
    )
  }
}