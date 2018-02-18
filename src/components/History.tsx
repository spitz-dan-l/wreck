import * as React from 'react';
import * as ReactTransitionGroup from 'react-transition-group';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {get_annotation, is_enabled, unwrap} from '../typescript/datatypes';


const Fade = ({children, ...props}) => (
  <ReactTransitionGroup.CSSTransition
    timeout={700}
    onExit={(d) => {
      d.style.maxHeight = `${d.clientHeight}px`;
    }}
    onEntering={(d) => {
        d.style.maxHeight = `${d.scrollHeight}px`
    }}
    classNames={"fade"}
    {...props} >
        {children}
  </ReactTransitionGroup.CSSTransition>
);

export const History = ({history, possible_history}) => (
    <ReactTransitionGroup.TransitionGroup>
      {history.map((hist) => {
        //let hist_status = get_annotation(hist, 1);
        
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

        let msg_html = message.innerHTML;

        if (index === 0) {
          return (
            <Fade key={key} >
              <div className={class_name}>
                <p>
                  <OutputText message_html={msg_html} />
                </p>
              </div>
            </Fade>
          );
        }
        return (
          <Fade key={key} >
            <div className={class_name}>
              <ParsedText parser={parser} />
              
              <p>
                <OutputText message_html={msg_html} />
              </p>
            </div>
          </Fade>
        )
      })}
    </ReactTransitionGroup.TransitionGroup>
);