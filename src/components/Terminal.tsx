import * as React from 'react';

// Internal
import {Prompt} from './Prompt';
import {ParsedText, OutputText} from './Text';

import {Item} from "../typescript/datatypes";
import * as Items from "../typescript/items";

import * as World from "../typescript/world";

import {WorldDriver, MatchValidity} from "../typescript/commands";



const ContentContainer = function (props) {
  const {style, children, ...rest} = props;
  const base_style = {
    height: '100%',
    width: '100%',
    overflowY: 'scroll',

    fontFamily: "'Fira Mono', 'monospace'",
    fontSize: '1em',
    fontColor: 'ivory',
    background: 'white',
    radius: 3,
    position: 'relative',
    display: 'flex'
  };
  return (
    <div style={{...base_style, ...style}} {...rest}>
      {children}
    </div>
  );
}

export class Terminal extends React.Component<any, {world_driver: WorldDriver<World.SingleBoxWorld>}> {
  contentContainer: any;
  prompt: any;

  constructor(props) {
    super(props);
    let contents: Item[] = [new Items.Codex(), new Items.Pinecone(), new Items.CityKey()];
    let world = new World.SingleBoxWorld({box: new World.Box({contents: contents})});
      
    this.state = {world_driver: new WorldDriver(world)};
  }

  componentDidMount() {
    this.focusPrompt();
  }

  handleSubmit = () => {
    //console.log(input);
    if (this.isCurrentlyValid()) {
      const output = this.state.world_driver.commit();
      this.setState({world_driver: this.state.world_driver});
      this.scrollToPrompt();
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

  currentAutocomplete = () => {
    let current_state = this.state.world_driver.current_state
    return current_state.parser.match[current_state.parser.match.length - 1].typeahead;
  }

  focusPrompt = () => {
    this.prompt.focus();
  }

  scrollToPrompt = () => {
    this.contentContainer.scrollTop = this.contentContainer.scrollHeight;
  }

  render() {
    const container_style: any = {
      height: '100%',
      width: '100%',
      overflowY: 'scroll',

      fontFamily: "'Fira Mono', 'monospace'",
      fontSize: '1em',
      fontColor: 'ivory',
      background: 'white',
      radius: 3,
      position: 'relative',
      display: 'flex'
    };
    return (
      <div style={container_style} onClick={this.focusPrompt} ref={cc => this.contentContainer = cc}>
        {this.state.world_driver.history.map(({parser, message}, i) => (
          <div key={i}>
            <ParsedText parser={parser} />
            <OutputText message={message} />
          </div>
        ))}

        <Prompt onSubmit={this.handleSubmit} onChange={this.handlePromptChange} ref={p => this.prompt = p}>
          <ParsedText parser={this.state.world_driver.current_state.parser} />
        </Prompt>
      </div>
    );
  }
}
