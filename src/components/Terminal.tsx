import * as React from 'react';

import {Prompt} from './Prompt';
import {ParsedText, OutputText} from './Text';
import {TypeaheadList} from './TypeaheadList';
import {get_indenting_whitespace, ends_with_whitespace} from '../typescript/text_tools';

import {WorldType, WorldDriver} from "../typescript/commands";

import {MatchValidity} from '../typescript/parser';

import {is_enabled} from '../typescript/datatypes';

const Carat = () => (
  <span>
    >&nbsp;
  </span>
);

export class Terminal<T extends WorldType<T>> extends React.Component<any, {world_driver: WorldDriver<T>}> {
  contentContainer: any;
  prompt: any;
  typeahead_list: any;

  constructor(props) {
    super(props);
    this.state = {world_driver: this.props.world_driver};
  }

  componentDidMount() {
    this.focus();
  }

  componentDidUpdate() {
    this.focus();
    this.scrollToPrompt();
  }

  handleKeys = (event) => {
    let swallowed_enter = this.typeahead_list.handleKeys(event);
    if (!swallowed_enter) {
      this.prompt.handleKeys(event);
    }  
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
    let result = this.state.world_driver.apply_command(input, false);
    this.setState({world_driver: this.state.world_driver});
  }

  handleTypeaheadSelection = (option) => {
    let matched_tokens = this.currentParser().match.map((elt) => elt.match);
    let current_indentation = this.currentIndentation();
    if (current_indentation === '' && matched_tokens.length > 1) {
      current_indentation = ' ';
    }
    let new_last_token = current_indentation + option;
    matched_tokens[matched_tokens.length - 1] = new_last_token;

    let new_command = ''.concat(...matched_tokens) + ' ';
    this.handlePromptChange(new_command);
    this.prompt.setState({value: new_command});
  }

  currentParser = () => this.state.world_driver.current_state.parser;

  currentTypeahead = () => {
    let parser = this.currentParser();
    let last_match = parser.match[parser.match.length - 1]; 
    let typeahead = last_match.typeahead;
    if (typeahead === undefined || (parser.match.length > 1 && last_match.match === '') ) {
      return [];
    }
    return typeahead;
  }

  currentIndentation = () => {
    let parser = this.currentParser();
    return get_indenting_whitespace(parser.match[parser.match.length - 1].match)
  }

  focus = () => {
    this.prompt.focus();
  }

  blur = () => {
    this.prompt.blur();
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
      <div style={container_style} tabIndex={-1} onFocus={this.focus} onBlur={this.blur} onKeyDown={this.handleKeys} ref={cc => this.contentContainer = cc}>
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
          let hist_elt_style: any = {
            marginTop: '1em'
          };

          if (!is_enabled(this.state.world_driver.possible_history[i])) {
            hist_elt_style.opacity = '0.4';
          }
          return (
            //check if this.state.world_driver.possible_history[i] is disabled
            <div key={i.toString()} style={hist_elt_style}>
              
                <Carat />
                <ParsedText parser={parser} />
              
              <p>
                <OutputText message={message} />
              </p>
            </div>
          )
        })}

          <Prompt
            onSubmit={this.handleSubmit}
            onChange={this.handlePromptChange}
            ref={p => this.prompt = p}>
            <Carat />
            <ParsedText parser={this.state.world_driver.current_state.parser}>
              <TypeaheadList
                typeahead={this.currentTypeahead()}
                indentation={this.currentIndentation()}
                onTypeaheadSelection={this.handleTypeaheadSelection}
                ref={t => this.typeahead_list = t}
              />
            </ParsedText>
          </Prompt>
        
        
      </div>
    );
  }
}
