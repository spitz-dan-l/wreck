import * as React from 'react';

import {Prompt} from './Prompt';
import {ParsedText, OutputText} from './Text';

import {Item} from "../typescript/datatypes";
import * as Items from "../typescript/items";

import * as World from "../typescript/world";
import {BirdWorld} from '../typescript/bird_world';

import {WorldDriver, MatchValidity} from "../typescript/commands";

const Carat = () => (
  <span>
    >
  </span>
);

export class Terminal extends React.Component<any, {world_driver: WorldDriver<BirdWorld>}> {
  contentContainer: any;
  prompt: any;

  constructor(props) {
    super(props);
    this.state = {world_driver: this.props.world_driver};
  }

  componentDidMount() {
    this.focusPrompt();
  }

  componentDidUpdate() {
    this.focusPrompt();
    this.scrollToPrompt();
  }

  handleSubmit = () => {
    if (this.isCurrentlyValid()) {
      const output = this.state.world_driver.commit();
      this.setState({world_driver: this.state.world_driver});
      return true;
    }
    return false;
  }

  isCurrentlyValid = () => {
    return this.state.world_driver.current_state.parser.validity === MatchValidity.valid;
  }

  handlePromptChange = (input) => {
    console.log(input);
    let result = this.state.world_driver.apply_command(input, false);
    this.setState({world_driver: this.state.world_driver});
  }

  currentTypeahead = () => {
    let current_state = this.state.world_driver.current_state
    let typeahead = current_state.parser.match[current_state.parser.match.length - 1].typeahead;
    if (typeahead === undefined) {
      return [];
    }
    return typeahead;
  }

  focusPrompt = () => {
    this.prompt.focus();
  }

  scrollToPrompt = () => {
    if ((this.contentContainer.scrollHeight - this.contentContainer.scrollTop) > this.contentContainer.clientHeight) {
      this.contentContainer.scrollTop = this.contentContainer.scrollHeight;

    }
  }

  render() {
    const container_style: any = {
      height: '100%',
      width: '100%',
      overflowY: 'scroll',
      whiteSpace: 'pre-wrap',
      fontFamily: "'Fira Mono'",
      fontSize: '1.5em',
      color: 'ivory',
      background: 'black',
      radius: 3,
      position: 'absolute',
      display: 'block',
      padding: '1em'
    };
    return (
      <div style={container_style} onClick={this.focusPrompt} ref={cc => this.contentContainer = cc}>
        {this.state.world_driver.history.map(({parser, message}, i) => {
          if (i === 0) {
            return (
              <div key={i.toString()}>
                <p>
                  <OutputText message={message} />
                </p>
              </div>
            );
          }
          return (
            <div key={i.toString()}>
              <p>
                <Carat />
                <ParsedText parser={parser} />
              </p>
              <p>
                <OutputText message={message} />
              </p>
            </div>
          )
        })}

        <p>
          <Prompt onSubmit={this.handleSubmit} onChange={this.handlePromptChange} ref={p => this.prompt = p}>
            <Carat />
            <ParsedText parser={this.state.world_driver.current_state.parser} showTypeahead={true} />
          </Prompt>
        </p>
        
      </div>
    );
  }
}
