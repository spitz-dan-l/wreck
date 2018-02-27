import * as React from 'react';
import * as ReactTransitionGroup from 'react-transition-group';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {get_annotation, is_enabled, unwrap} from '../typescript/datatypes';


export class BookGuy extends React.Component<any, any> {
  elt: any
  // just need to set the maxHeight
  // everything else can be done with css transitions
  // but what to set max height to depends on whether the elt
  // is disappearing or not
  // answer: just check the .scrollHeight or .clientHeight
  // attr immediately after changing the class.
  update() {
    this.elt.style.maxHeight = `${this.elt.scrollHeight}px`;
    this.elt.classList.add('animating')
  }

  componentDidMount() {
    this.update();
  }

  componentDidUpdate() {
    this.update()
  }

  render() {
    return (
      <div className={this.props.className} ref={elt => this.elt = elt}>
        {this.props.children}
      </div>
    );
  }

}

const Fade = ({children, ...props}) => (
  <ReactTransitionGroup.CSSTransition
    timeout={700}
    onExit={(d) => {
      d.style.maxHeight = `${d.clientHeight}px`;
    }}
    onEntering={(d) => {
        // let d_output_text = d.querySelector('.output-text');
        // d_output_text.style.maxHeight = `${d_output_text.scrollHeight}px`
        d.style.maxHeight = `${d.scrollHeight}px`;
    }}
    classNames={"fade"}
    {...props} >
        {children}
  </ReactTransitionGroup.CSSTransition>
);

export const History = ({history, possible_history, ...fade_props}) => (
    <ReactTransitionGroup.TransitionGroup>
      {history.map((hist) => {
        let {parser, message, message_classes, index} = hist;
        if (message_classes === undefined) {
            message_classes = [];
        }

        let key = index.toString();
        if (message_classes.length > 0) {
          key += '_' + message_classes.join(':');
        }

        let possible_message_classes = possible_history[index].message_classes;
        if (possible_message_classes === undefined) {
            possible_message_classes = [];
        }

        let edit_message_classes = [];

        for (let mc of message_classes) {
            if (possible_message_classes.indexOf(mc) === -1) {
                edit_message_classes.push('removing-' + mc);
            }
        }

        for (let pmc of possible_message_classes) {
            if (message_classes.indexOf(pmc) === -1) {
                edit_message_classes.push('adding-' + pmc);
            }
        }

        let edit_message_class_name = edit_message_classes.join(' ');
        let class_name = 'history ' + edit_message_class_name + ' ' + message_classes.join(' ');

        let msg_html = '';
        if (message !== undefined) {
          msg_html = message.innerHTML;
        }

        if (index === 0) {
          return (
            <Fade key={key} {...fade_props}>
              <div className={class_name}>
                {/*<p>*/}
                  <OutputText message_html={msg_html} />
                {/*</p>*/}
              </div>
            </Fade>
          );
        }
        return (
          <Fade key={key} {...fade_props}>
            <div className={class_name}>
              <ParsedText parser={parser} />
              
              {/*<p>*/}
                <OutputText message_html={msg_html} />
              {/*</p>*/}
            </div>
          </Fade>
        )
      })}
    </ReactTransitionGroup.TransitionGroup>
);

export const History2 = ({history, possible_history, ...fade_props}) => (
    <div>
      {history.map((hist) => {
        let {parser, message, message_classes, index} = hist;
        if (message_classes === undefined) {
            message_classes = [];
        }

        let key = index.toString();
        if (message_classes.length > 0) {
          key += '_' + message_classes.join(':');
        }

        let possible_message_classes = possible_history[index].message_classes;
        if (possible_message_classes === undefined) {
            possible_message_classes = [];
        }

        let edit_message_classes = [];

        for (let mc of message_classes) {
            if (possible_message_classes.indexOf(mc) === -1) {
                edit_message_classes.push('removing-' + mc);
            }
        }

        for (let pmc of possible_message_classes) {
            if (message_classes.indexOf(pmc) === -1) {
                edit_message_classes.push('adding-' + pmc);
            }
        }

        let edit_message_class_name = edit_message_classes.join(' ');
        let class_name = 'history ' + edit_message_class_name + ' ' + message_classes.join(' ');

        let msg_html = '';
        if (message !== undefined) {
          msg_html = message.innerHTML;
        }

        if (index === 0) {
          return (
            <BookGuy key={index} className={class_name}>
              <OutputText message_html={msg_html} />
            </BookGuy>
          );
        }
        return (
          <BookGuy key={index} className={class_name}>
            <ParsedText parser={parser} />  
            <OutputText message_html={msg_html} />
          </BookGuy>
        )
      })}
    </div>
);