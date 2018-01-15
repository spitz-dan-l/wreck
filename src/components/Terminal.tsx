import * as React from 'react';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {TypeaheadList} from './TypeaheadList';
import {History} from './History';

import {get_indenting_whitespace, ends_with_whitespace} from '../typescript/text_tools';

import {WorldType, WorldDriver} from "../typescript/commands";

import {MatchValidity} from '../typescript/parser';

import {is_enabled} from '../typescript/datatypes';

import * as ReactTransitionGroup from 'react-transition-group';

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
    let that = this;
    window.setTimeout(function() {
      that.scrollToPrompt();  
    }, 700)
    
  }

  handleKeys = (event) => {
    // debugger;
    let swallowed_enter = (this.typeahead_list !== null) ? this.typeahead_list.handleKeys(event) : false;
    if (!swallowed_enter) {
      this.prompt.handleKeys(event);
    }
    if ([37, 38, 39, 40].indexOf(event.keyCode) > -1) {
      event.preventDefault();
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
    let parser = this.currentParser();
    return parser.validity === MatchValidity.valid && parser.is_done();
  }

  handlePromptChange = (input) => {
    let result = this.state.world_driver.apply_command(input, false);
    this.setState({world_driver: this.state.world_driver});
  }

  handleTypeaheadSelection = (option) => {
    let matched_tokens = this.currentParser().match.slice(0, this.currentTypeaheadIndex() + 1).map((elt) => elt.match);
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

  currentTypeaheadIndex = () => {
    let parser = this.currentParser();
    let typeahead_ind = parser.match.length - 1;
    let last_match = parser.match[typeahead_ind];
    if (parser.match.length > 1 && last_match.match === '') {
      typeahead_ind--;
    }

    return typeahead_ind;
  }

  currentTypeahead = () => {
    let parser = this.currentParser();
    let typeahead_ind = this.currentTypeaheadIndex();

    if (typeahead_ind === -1) {
      return [];
    }

    let typeahead = parser.match[typeahead_ind].typeahead;
    if (typeahead === undefined) {
      return [];
    }
    return typeahead;
  }

  currentIndentation = () => {
    let parser = this.currentParser();
    let typeahead_ind = this.currentTypeaheadIndex();

    if (typeahead_ind === -1) {
      return '';
    }

    return get_indenting_whitespace(parser.match[typeahead_ind].match)
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
      fontFamily: "'Roboto Mono'", //"'Fira Mono'",
      fontSize: '1em',
      fontWeight: 'light',
      color: 'ivory',
      background: 'black',
      radius: 3,
      position: 'absolute',
      display: 'block',
      padding: '1em',
      marginRight: '3em'
    };
    return (
      <div style={container_style} tabIndex={-1} onFocus={this.focus} onBlur={this.blur} onKeyDown={this.handleKeys} ref={cc => this.contentContainer = cc}>
        <History
          history={this.state.world_driver.history}
          possible_history={this.state.world_driver.possible_history}
          />
        <Prompt
          onSubmit={this.handleSubmit}
          onChange={this.handlePromptChange}
          ref={p => this.prompt = p}>
          <ParsedText
            parser={this.currentParser()}
            typeaheadIndex={this.currentTypeaheadIndex()}
          >
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
