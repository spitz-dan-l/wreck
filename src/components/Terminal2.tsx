import * as React from 'react';

import {Preface} from './Preface';
import {Prompt} from './Prompt';
import {ParsedText2} from './Text2';
import {TypeaheadList} from './TypeaheadList2';
import {History} from './History';

import {get_indenting_whitespace, ends_with_whitespace} from '../typescript/text_tools';

import {WorldDriver, World} from "../typescript/world";

import {MatchValidity} from '../typescript/parser';

import {is_enabled} from '../typescript/datatypes';

import * as ReactTransitionGroup from 'react-transition-group';

export class Terminal<T extends World> extends React.Component<any, {world_driver: WorldDriver<T>}> {
  contentContainer: any;
  prompt: any;
  typeahead_list: any;
  history: any;


  constructor(props) {
    super(props);
    this.state = {world_driver: this.props.world_driver};
  }

  componentDidMount() {
    this.prompt.focus();
  }

  handleKeys = (event) => {
    let swallowed_enter = (this.typeahead_list !== null) ? this.typeahead_list.handleKeys(event) : false;
    if (!swallowed_enter) {
      this.prompt.handleKeys(event);
    }
  }
  
  handleSubmit = () => {
    if (this.isCurrentlyValid()) {
      const output = this.state.world_driver.commit();
      this.setState(
        {world_driver: this.state.world_driver});
      this.history.commit_after_update = true;
      //this.history.commit();
      return true;
    }
    return false;
  }

  componentDidUpdate() {

  }

  isCurrentlyValid = () => {
    let parser = this.currentParser();
    return parser.validity === MatchValidity.valid && parser.is_done();
  }

  handlePromptChange = (input) => {
    let result = this.state.world_driver.apply_command(input, false);
    this.setState({
      world_driver: this.state.world_driver
    });
   this.history.edit_after_update = true;
    this.prompt.focus();
    let that = this;
    window.setTimeout(function() {
      that.scrollToPrompt();
    }, 0)
  }

  handleTypeaheadSelection = (option) => {
    let matched_tokens = this.currentParser().match.slice(0, this.currentTypeaheadIndex() + 1).map((elt) => elt.match);
    let current_indentation = this.currentIndentation();
    if (current_indentation === '' && matched_tokens.length > 1) {
      current_indentation = ' ';
    }

    if (option !== false){ 
      let new_last_token = current_indentation + option;
      matched_tokens[matched_tokens.length - 1] = new_last_token;
    }
    let new_command = ''.concat(...matched_tokens) + ' ';
    this.handlePromptChange(new_command);
    this.prompt.setState({value: new_command});
  }

  currentParsing = () => this.state.world_driver.current_parsing;
  // currentParser = () => this.state.world_driver.current_state.parser;

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

  scrollToPrompt = () => {
    if (this.state.world_driver.history.length > 1) {
      this.prompt.input.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});
    }
  }

  render() {
    return (
      <div className="terminal" tabIndex={-1} onKeyDown={this.handleKeys} ref={cc => this.contentContainer = cc}>
        { /*<Preface on_start_game={() => this.prompt.focus()} /> */}
        <History
          timeout={700}
          onAnimationFinish={this.scrollToPrompt}
          history={this.state.world_driver.history}
          possible_history={this.state.world_driver.possible_history}
          ref={h => this.history = h}
          />
        <Prompt
          onSubmit={this.handleSubmit}
          onChange={this.handlePromptChange}
          ref={p => this.prompt = p}>
          <ParsedText2 parsing={this.currentParsing()}>
            <TypeaheadList
              typeahead={this.currentTypeahead()}
              indentation={this.currentIndentation()}
              onTypeaheadSelection={this.handleTypeaheadSelection}
              ref={t => this.typeahead_list = t}
            />
          </ParsedText2>
        </Prompt>
      </div>
    );
  }
}

