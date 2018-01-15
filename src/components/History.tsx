import * as React from 'react';
import * as ReactTransitionGroup from 'react-transition-group';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {get_annotation, unwrap} from '../typescript/datatypes';


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
        let hist_status = get_annotation(hist, 1);
        
        let {parser, message, interpretted_message, index} = unwrap(hist);
        let edit_status = get_annotation(possible_history[index], 1);

        let key = index.toString() + '_' + hist_status.toString();
        
        let msg_html = (interpretted_message !== undefined) ? interpretted_message.innerHTML : message.innerHTML;

        if (index === 0) {
          return (
            <Fade key={key} >
              <div className={`history edit-status-${edit_status}`}>
                <p>
                  <OutputText message_html={msg_html} />
                </p>
              </div>
            </Fade>
          );
        }
        return (
          <Fade key={key} >
            <div className={`history edit-status-${edit_status}`}>
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