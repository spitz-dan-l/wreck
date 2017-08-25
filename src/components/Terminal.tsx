import * as React from 'react';

// Internal
import {Prompt} from './Prompt';
import {ParsedText, OutputText} from './Text';

import {Item} from "../typescript/datatypes";
import * as Items from "../typescript/items";

import * as World from "../typescript/world";

import {WorldDriver, MatchValidity} from "../typescript/commands";

const Carat = (props) => {
  const {style, ...rest} = props;
  const base_style = {
    fontFamily: "'Fira Mono', 'monospace'",
    fontSize: '1em',
    color: 'ivory'
  }

  return (
    <span style={{...base_style, ...style}} {...rest}>
      >
    </span>
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
    this.scrollToPrompt();
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
      whiteSpace: 'pre-wrap',
      fontFamily: "'Fira Mono', 'monospace'",
      fontSize: '1em',
      color: 'ivory',
      background: 'black',
      radius: 3,
      position: 'absolute',
      display: 'block'
    };
    return (
      <div style={container_style} onClick={this.focusPrompt} ref={cc => this.contentContainer = cc}>
        {this.state.world_driver.history.map(({parser, message}, i) => {
          if (i === 0) {
            return false; //don't display first hist element, it empty
          }
          return (
            <div key={i}>
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
            <ParsedText parser={this.state.world_driver.current_state.parser} />
          </Prompt>
        </p>
      </div>
    );
  }
}
