import * as React from 'react';
import * as ReactTransitionGroup from 'react-transition-group';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {is_enabled} from '../typescript/datatypes';


const fade_duration = 300, height_duration = 400;

const defaultStyle = {
  transition: `opacity ${fade_duration}ms ease-in, max-height ${height_duration}ms linear`,
  transitionDelay: `0ms, ${fade_duration}ms`
}

const transitionStyles = {
  exiting: { opacity: 0, maxHeight: 0 },
};

const Fade = ({children, ...props}) => (
  <ReactTransitionGroup.Transition
    timeout={fade_duration + height_duration}
    onExit={(d) => (
      d.style.maxHeight = `${d.clientHeight}px`
    )}
    {...props}>
    {(state) => (
      <div style={{
        ...defaultStyle,
        ...transitionStyles[state]
      }}>
        {children}
      </div>
    )}
  </ReactTransitionGroup.Transition>
);


export const History = ({history, possible_history}) => (
    <ReactTransitionGroup.TransitionGroup>
      {history.map(({parser, message, index}) => {
        if (index === 0) {
          return (
            <Fade key={index.toString()} >
              <div>
                <p>
                  <OutputText message={message} />
                </p>
              </div>
            </Fade>
          );
        }
        let hist_elt_style: any = {
          marginTop: '1em'
        };

        if (!is_enabled(possible_history[index])) {
          hist_elt_style.opacity = '0.4';
        }
        return (
          <Fade key={index.toString()} >
            <div style={hist_elt_style}>
              <ParsedText parser={parser} />
              
              <p>
                <OutputText message={message} />
              </p>
            </div>
          </Fade>
        )
      })}
    </ReactTransitionGroup.TransitionGroup>
);