import * as React from 'react';
import * as ReactDom from "react-dom";
import * as ReactTransitionGroup from 'react-transition-group';

import {Prompt} from './Prompt';
import {ParsedText, OutputText, Carat} from './Text';
import {get_annotation, is_enabled, unwrap} from '../typescript/datatypes';


export class BookGuy extends React.Component<any, any> {
  do_animate: boolean = true;
  // just need to set the maxHeight
  // everything else can be done with css transitions
  // but what to set max height to depends on whether the elt
  // is disappearing or not
  // answer: just check the .scrollHeight or .clientHeight
  // attr immediately after changing the class.
  constructor(props) {
    super(props);

    this.state = {
      message_classes: [],
      adding_message_classes: [],
      removing_message_classes: []
    };
  }

  edit(possible_message_classes) {
    if (possible_message_classes === undefined) {
      possible_message_classes = [];
    }
    let edit_message_classes = [];
    let message_classes = this.state.message_classes;

    let removing_message_classes = []
    for (let mc of message_classes) {
        if (possible_message_classes.indexOf(mc) === -1) {
            removing_message_classes.push(mc);
        }
    }

    let adding_message_classes = []
    for (let pmc of possible_message_classes) {
        if (message_classes.indexOf(pmc) === -1) {
            adding_message_classes.push(pmc);
        }
    }

    this.setState({removing_message_classes, adding_message_classes});

  }

  commit() {
    if (this.do_animate
        || this.state.adding_message_classes.length > 0
        || this.state.removing_message_classes.length > 0){
      let new_message_classes = [...this.state.message_classes];

      new_message_classes.push(...this.state.adding_message_classes);

      for (let rmc of this.state.removing_message_classes) {
        new_message_classes.splice(new_message_classes.indexOf(rmc), 1);
      }

      this.setState({
        message_classes: new_message_classes,
        adding_message_classes: [],
        removing_message_classes: [],
      });
      this.do_animate = true;
    }
  }

  componentDidUpdate() {
    if (this.do_animate) {
      this.animate();
      this.do_animate = false;
    }
  }

  animate() {
    console.log('animatin');
    function setMaxHeight(elt) {
      elt.style.maxHeight = `${elt.scrollHeight}px`;
    }

    let comp_elt = ReactDom.findDOMNode(this);
    let elts = []

    let frontier = [comp_elt];

    while (frontier.length > 0) {
      let elt = frontier.shift();
      elts.push(elt);

      let children = elt.children;
      for (let i = 0; i < children.length; i++) {
        frontier.push(children.item(i));  
      }
    }

    comp_elt.classList.add('animation-start');

    setTimeout(() => {
      comp_elt.classList.add('animation-active');
      elts.map(setMaxHeight);
      setTimeout(() => {
        comp_elt.classList.remove('animation-start', 'animation-active');
      }, this.props.timeout)
    }, 0);
  }

  render() {
    let classList = ['history', ...this.state.message_classes];
    classList.push(...this.state.adding_message_classes.map(s => 'adding_'+s));
    classList.push(...this.state.removing_message_classes.map(s => 'removing_'+s));
    
    let className = classList.join(' ');
    
    return (
      <div className={className}>
        {this.props.children}
      </div>
    );
  }

}

export class History3 extends React.Component<any, any> {
  book_guys: BookGuy[] = [];

  edit_after_update = false;
  commit_after_update = false;

  constructor(props) {
    super(props);
  }

  edit() {
    this.props.history.forEach((hist) => {
      let {parser, message, message_classes, index} = hist;
      let the_book_guy = this.book_guys[index];
      the_book_guy.edit(this.props.possible_history[index].message_classes);
    });
  }

  commit() {
    this.book_guys.forEach((bg) => bg.commit());
  }


  render() {
    return (
      <div>
        {this.props.history.map(hist => {
          let msg_html = '';
          if (hist.message !== undefined) {
            msg_html = hist.message.innerHTML;
          }
          
          return (
            <BookGuy
              timeout={this.props.timeout}
              key={hist.index}
              ref={bg => this.book_guys[hist.index] = bg}>
              {hist.index > 0 ? (
                <ParsedText parser={hist.parser} />
              ) : ''} 
              <OutputText message_html={msg_html} />
            </BookGuy>
          );
        })}
      </div>
    )
  }

  componentDidUpdate() {
    if (this.edit_after_update) {
      this.edit()
      this.edit_after_update = false;
    }
    if (this.commit_after_update) {
      this.commit()
      this.commit_after_update = false;
    }
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