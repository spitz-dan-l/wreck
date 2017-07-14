import * as React from 'react';
import './Terminal.css';

export interface TermProps {
    msg: string,
    color: string,
    prompt: string,
    barColor: string,
    backgroundColor: string,
    commands: any,
    description: string
}

export interface TermProps {
    onEnter: (e: string) => any;
    onAutoComplete: (e: string) => any;
  }

export interface TermState {
    value: string
}

export class Terminal extends React.Component<TermProps, TermState> {
    state = { value: '' }

    componentDidMount() {
    //... set up keydown listener ...
    }

    componentWillUnmount() {
    //... remove keydown listener ...
    }

    handleChange = (e: any) => {
        this.setState({value: e.target.value});

        // handle auto complete stuff here
        this.props.onAutoComplete(e.target.value)

        if (is_enter(e)) {
            // call the onEnter callback with the current value
            this.props.onEnter(this.state.value)
        } else if (is_tab(e)) {
            // use this.props.toAutocomplete autocomplete the value
        }
    }

    render() {
    return (
      <div>
        <input 
          value={this.state.value} 
        />
      </div>
    );
    }
}

function is_enter(value: string){

}

function is_tab(value: string){

}

