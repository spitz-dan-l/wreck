import * as React from 'react';

import {Prompt} from './Prompt';
import {ParsedText} from './Text';
import {TypeaheadList} from './TypeaheadList';
import {History, History2, History3} from './History';

import {get_indenting_whitespace, ends_with_whitespace} from '../typescript/text_tools';

import {WorldType, WorldDriver} from "../typescript/commands";

import {MatchValidity} from '../typescript/parser';

import {is_enabled} from '../typescript/datatypes';

import * as ReactTransitionGroup from 'react-transition-group';

export class Terminal<T extends WorldType<T>> extends React.Component<any, {world_driver: WorldDriver<T>}> {
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
      this.setState({world_driver: this.state.world_driver});
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
    this.setState({world_driver: this.state.world_driver});
    this.history.edit_after_update = true;
    //this.history.edit();
    this.prompt.focus();
    this.scrollToPrompt();
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

  scrollToPrompt = () => {
    this.prompt.input.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});
  }

  render() {
    return (
      <div className="terminal" tabIndex={-1} onKeyDown={this.handleKeys} ref={cc => this.contentContainer = cc}>
        <History3
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
