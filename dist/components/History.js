"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDom = require("react-dom");
const Text_1 = require("./Text");
class BookGuy extends React.Component {
    /*
      BookGuy is a bad component that get's the danged job done.
  
      It encapsulates a single element of history in the game.
  
      When a css change to the history element is "committed" (via this.commit()),
      It triggers an idiosyncratic little animation progression that
      adds CSS classes in a certain order and dynamically sets
      the max-height on all elements contained by the history element
      so that they can grow or shrink smoothly by added css transitions on
      the max-height property.
  
      The particulars of the animation progress are currently undocumented because
      they are pretty bad and might change.
    */
    constructor(props) {
        super(props);
        this.state = {
            message_classes: [],
            adding_message_classes: [],
            removing_message_classes: [],
            entering: true
        };
    }
    edit(possible_message_classes, callback) {
        if (possible_message_classes === undefined) {
            possible_message_classes = [];
        }
        let edit_message_classes = [];
        let message_classes = this.state.message_classes;
        let removing_message_classes = [];
        for (let mc of message_classes) {
            if (possible_message_classes.indexOf(mc) === -1) {
                removing_message_classes.push(mc);
            }
        }
        let adding_message_classes = [];
        for (let pmc of possible_message_classes) {
            if (message_classes.indexOf(pmc) === -1) {
                adding_message_classes.push(pmc);
            }
        }
        this.setState({ removing_message_classes, adding_message_classes }, callback);
    }
    commit() {
        let adding_classes = this.state.adding_message_classes;
        let removing_classes = this.state.removing_message_classes;
        if (this.state.entering
            || adding_classes.length > 0
            || removing_classes.length > 0) {
            let new_message_classes = [...this.state.message_classes];
            new_message_classes.push(...adding_classes);
            for (let rmc of removing_classes) {
                new_message_classes.splice(new_message_classes.indexOf(rmc), 1);
            }
            this.setState({
                message_classes: new_message_classes,
                adding_message_classes: [],
                removing_message_classes: [],
            }, () => this.animate(adding_classes, removing_classes));
        }
    }
    animate(adding_classes = [], removing_classes = []) {
        function walkElt(elt, f) {
            let children = elt.children;
            for (let i = 0; i < children.length; i++) {
                let child = children.item(i);
                walkElt(child, f);
            }
            f(elt);
        }
        let comp_elt = ReactDom.findDOMNode(this);
        if (this.state.entering) {
            comp_elt.classList.add('animation-new');
            this.setState({ entering: false });
        }
        // Momentarily apply the animation-pre-compute class
        // to accurately measure the target maxHeight
        // and check for the custom --is-collapsing property
        // (This is basically an abomination and I am sorry.)
        comp_elt.classList.add('animation-pre-compute');
        walkElt(comp_elt, (e) => e.dataset.maxHeight = `${e.scrollHeight}px`);
        comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0;
        comp_elt.classList.remove('animation-pre-compute');
        let edit_classes = [
            ...adding_classes.map(c => 'adding-' + c),
            ...removing_classes.map(c => 'removing-' + c)
        ];
        comp_elt.classList.add('animation-start', ...edit_classes);
        // If --is-collapsing was set by the animation-pre-compute class,
        // then apply the maxHeight update at the end of this animation frame
        // rather than the beginning of the next one.
        // I have no idea why this works/is necessary, but it does/is.
        if (comp_elt.dataset.isCollapsing == 1) {
            walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight);
        }
        requestAnimationFrame(() => {
            // If --is-collapsing wasn't set in the animation-pre-compute class,
            // then apply the maxHeight update now.
            // Websites technology keyboard mouse.
            if (comp_elt.dataset.isCollapsing != 1) {
                walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight);
            }
            comp_elt.classList.add('animation-active');
            setTimeout(() => {
                comp_elt.classList.remove('animation-new', 'animation-start', 'animation-active', ...edit_classes);
                walkElt(comp_elt, (e) => e.style.maxHeight = '');
                if (this.props.onAnimationFinish) {
                    this.props.onAnimationFinish();
                }
            }, this.props.timeout);
        });
    }
    render() {
        let classList = ['history', ...this.state.message_classes];
        classList.push(...this.state.adding_message_classes.map(s => 'would-add-' + s));
        classList.push(...this.state.removing_message_classes.map(s => 'would-remove-' + s));
        let className = classList.join(' ');
        return (React.createElement("div", { className: className }, this.props.children));
    }
}
exports.BookGuy = BookGuy;
class History extends React.Component {
    constructor(props) {
        super(props);
        this.book_guys = [];
        this.edit_after_update = false;
        this.commit_after_update = false;
    }
    edit() {
        this.props.history.forEach((hist) => {
            let { parser, message, message_classes, index } = hist;
            let the_book_guy = this.book_guys[index];
            the_book_guy.edit(this.props.possible_history[index].message_classes);
        });
    }
    commit() {
        // edit the most recent element since that is how we pass in the new classes
        // and it hasn't had them passed in thru the most recent edit() call yet.
        let last_index = this.props.history.length - 1;
        let { message_classes } = this.props.history[last_index];
        let the_book_guy = this.book_guys[last_index];
        the_book_guy.edit(message_classes, 
        // Once the edit has been accepted, call commit on all book guys.
        () => this.book_guys.forEach((bg) => bg.commit()));
    }
    render() {
        return (React.createElement("div", null, this.props.history.map(hist => {
            let msg_html = '';
            if (hist.message !== undefined) {
                msg_html = hist.message.innerHTML;
            }
            return (React.createElement(BookGuy, { timeout: this.props.timeout, onAnimationFinish: this.props.onAnimationFinish, key: hist.index, ref: bg => this.book_guys[hist.index] = bg },
                hist.index > 0 ? (React.createElement(Text_1.ParsedText, { parser: hist.parser })) : '',
                React.createElement(Text_1.OutputText, { message_html: msg_html })));
        })));
    }
    componentDidUpdate() {
        if (this.edit_after_update) {
            this.edit();
            this.edit_after_update = false;
        }
        if (this.commit_after_update) {
            this.commit();
            this.commit_after_update = false;
        }
    }
}
exports.History = History;
//# sourceMappingURL=History.js.map