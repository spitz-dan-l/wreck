import * as React from 'react';
import * as ReactDom from 'react-dom';
import { array_last, update, deep_equal } from '../typescript/utils';
import { keys } from '../typescript/keyboard_tools';
import { Parsing, RawInput, SUBMIT_TOKEN, Token, TypeaheadOption, TokenMatch, TokenAvailability } from '../typescript/parser';
import { CommandResult, Interpretations, Renderer, World } from "../typescript/world";
import { OutputText, ParsedText } from './Text';


type AppState = {
  command_result: CommandResult<World>,
  typeahead_index: number,
  updater: (world: World, command: RawInput) => CommandResult<World>,
  renderer: Renderer
}

type AppAction =
  RawInput |
  { kind: 'SelectTypeahead', index: number } |
  { kind: 'SelectRelativeTypeahead', direction: 'up' | 'down' } |
  { kind: 'Submit' } |
  { kind: 'Undo' };

// "reducer" function which returns updated state according to the
// "kind" of the action passed to it
// TODO look up whether there are methods for factoring reducers better
function app_reducer(state: AppState, action: AppAction): AppState {
  switch (action.kind) {
    case 'RawInput':
      let new_result = state.updater(state.command_result.world!, action);
      return update(state, {
        command_result: () => new_result,
        typeahead_index: new_result.parsing.view.typeahead_grid.length > 0 ? 0 : -1
      });
    case 'SelectTypeahead':
      return update(state, { typeahead_index: () => action.index });
    case 'SelectRelativeTypeahead':
      return select_relative_typeahead(state, action.direction);
    case 'Submit': {
      if (state.typeahead_index !== -1) {
        return submit_typeahead(state);
      } else {
        return update(state, {
          command_result: () =>
            state.updater(
              state.command_result.world!,
              update(state.command_result.parsing.raw, {
                submit: state.command_result.parsing.view.submittable })),
          typeahead_index: -1
        });
      }
    }
    case 'Undo': {
      let prev_command_result = state.updater(
        state.command_result.world.previous!,
        update(state.command_result.world.parsing!.raw, { submit: false })
      );
      return update(state, {
        command_result: () => prev_command_result,
        typeahead_index: -1
      });
    }
  }
  throw new Error('should no get here');
}

function select_relative_typeahead(state: AppState, direction: 'up' | 'down') {
  let n_options = state.command_result.parsing.view.typeahead_grid.length;

  let new_index: number;
  if (direction === 'up') {
    new_index = state.typeahead_index - 1;
    if (new_index < -1) {
      new_index = n_options - 1;
    }
  } else if (direction === 'down') {
    new_index = state.typeahead_index + 1;
    if (new_index >= n_options) {
      new_index = -1;
    }
  }

  return update(state, { typeahead_index: new_index! });
  
}

function submit_typeahead(state: AppState) {
  let parsing = state.command_result.parsing;
  let row = parsing.view.typeahead_grid[state.typeahead_index];

  let synthesized_tokens: Token[] = [...parsing.tokens];

  row.option.forEach((m, i) => {
    if (m !== null) {
      synthesized_tokens[i] = m.expected.token;
    }
  });

  let synthesized_text = '';
  for (let i = 0; i < synthesized_tokens.length; i++) {
    let t = synthesized_tokens[i];
    if (t === SUBMIT_TOKEN) {
      break;
    } else {
      if (i === 0) {
        synthesized_text += parsing.whitespace[i];
      } else {
        synthesized_text += parsing.whitespace[i] || ' ';
      }
      synthesized_text += t;
    }
  }
  let synthesized_command = {
    kind: 'RawInput',
    submit: array_last(synthesized_tokens) === SUBMIT_TOKEN,
    text: synthesized_text
  } as const;

  let new_result = state.updater(state.command_result.world!, synthesized_command);
  return update(state, {
    command_result: () => new_result,
    typeahead_index: new_result.parsing.view.typeahead_grid.length > 0 ? 0 : -1
  });
}

function scroll_down() {
  let bottom = document.querySelector('.typeahead')!;
  bottom.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});
}

// The global context storing the state update dispatcher
const AppDispatch = React.createContext<React.Dispatch<AppAction>>(null!);

export const App: React.FunctionComponent<AppState> = (initial_state) => {
  const [state, dispatch] = React.useReducer(app_reducer, initial_state)

  let current_world = state.command_result.world!;
  let current_parsing = state.command_result.parsing;
  let possible_world = state.command_result.possible_world;

  function handleKeyDown(event: KeyboardEvent) {
    let input_elt = document.querySelector('input')!;
      
    if (!event.ctrlKey && !event.metaKey) {
      input_elt.focus();
    }

    if (event.keyCode === keys.up) {
      dispatch({ kind: 'SelectRelativeTypeahead', direction: 'up' });
    } else if (event.keyCode === keys.down) {
      dispatch({ kind: 'SelectRelativeTypeahead', direction: 'down' });
    }

    if (event.keyCode === keys.enter) {
      // either enter a typeahead entry or the current text
      dispatch({ kind: 'Submit' });
    }

    function forceCursor() {
      input_elt.setSelectionRange(input_elt.value.length, input_elt.value.length);
    }

    forceCursor();
  }

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    scroll_down();
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return <AppDispatch.Provider value={dispatch}>
    <div>
      <History world={current_world} possible_world={possible_world} renderer={initial_state.renderer} />
      <Prompt parsing={current_parsing} />
      <Typeahead parsing={current_parsing} typeahead_index={state.typeahead_index} />
      <UndoButton world={current_world} />
    </div>
  </AppDispatch.Provider>
}

type UndoProps = {
  world: World
};
export const UndoButton: React.FunctionComponent<UndoProps> = ({world}) => {
  const dispatch = React.useContext(AppDispatch);
  return (
    <div className="undo-button"
         onClick={() => dispatch({kind: 'Undo'})}
         style={{
            float: 'right',
            cursor: 'pointer',
            display: world.previous === null ? 'none' : 'inherit'
          }}
    >
      {String.fromCharCode(10226)} Undo
    </div>);
}

export const Prompt: React.FunctionComponent<{parsing: Parsing}> = (props) => {
  const dispatch = React.useContext(AppDispatch);
  const input_elt = React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      kind: 'RawInput',
      text: event.currentTarget.value,
      submit: false
    });
  }

  return <div className="prompt">
    <input
      ref={input_elt}
      onChange={handleChange}
      value={props.parsing.raw.text}
    />
    <span>
      <ParsedText parsing={props.parsing} />
      <Cursor />
      {props.children}
    </span>
  </div>
}

const Cursor = (props) => {
  return (
    <span className="blinking-cursor">
      {String.fromCharCode(9608)}
    </span>
  );
};

export const Typeahead: React.FunctionComponent<{parsing: Parsing, typeahead_index: number}> = ({parsing, typeahead_index}) => {
  let dispatch = React.useContext(AppDispatch);

  function handleMouseOver(i: number) {
    dispatch({
      kind: 'SelectTypeahead',
      index: i
    });
  }
  function handleClick(i: number) {
    dispatch({
      kind: 'SelectTypeahead',
      index: i
    });

    dispatch({
      kind: 'Submit'
    });
    // unclear if we need to call dispatch twice or just once
  }
  function whitespace(s: string) {
    return s.replace(/./g, ' ');//'&nbsp;');
  }
  function convert_token(s: Token) {
    if (typeof s === 'string') {
      return s;
    }
    // If we're here, s is SUBMIT_TOKEN.
    return String.fromCharCode(8629); // curving down arrow indicator
  }

  function cssify_availability(availability: TokenAvailability): string {
    switch (availability.kind) {
      case 'Available':
        return 'available';
      case 'Used':
        return 'used';
      case 'Locked':
        return 'locked';
    }
  }

  function get_option_class(option: TypeaheadOption, index: number, selected_index: number): string {
    let classes = ['option', cssify_availability(option.availability)];
    if (index === selected_index) {
      classes.push('selected');
    }
    return classes.join(' ');
  }

  function get_option_token_class(match: TokenMatch | null): string {
    if (match === null) {
      return '';
    }

    let classes = ['token', cssify_availability(match.expected.availability)];
    for (let [label, on] of Object.entries(match.expected.labels)) {
      if (on) {
        classes.push(label);
      }
    }
    return classes.join(' ');

  }

  return <ul className="typeahead">
    {parsing.view.typeahead_grid.map((option, i) => (
      <li
        key={i} 
        onMouseOver={() => handleMouseOver(i)}
        className={get_option_class(option, i, typeahead_index)}
        onClick={() => handleClick(i)}
      >
        <span>{'  '}</span>
        { option.option.map((m, j) => {
          let classes = get_option_token_class(m);
          return <span key={j} className={get_option_token_class(m)}>
          { m === null ?
            parsing.whitespace[j] + whitespace(convert_token(parsing.tokens[j])) :
            (j >= parsing.whitespace.length || j !== 0 && parsing.whitespace[j] === '' ?
              ' ' :
              parsing.whitespace[j]) + convert_token(m.expected.token) }
          </span>
        }) }
        { option.availability.kind === 'Locked' ? <Lock /> : '' }
      </li>
    ))}
    <li className='footer' />
  </ul>
}

const Lock: React.FunctionComponent = (props) => {
  return (
    <span className="token lock">
      {' ' + String.fromCharCode(8416)}
    </span>
  );
};

type HistoryProps = {
  world: World,
  possible_world: World | null,
  renderer: Renderer
}

export const History: React.FunctionComponent<HistoryProps> = ({world, possible_world, renderer}) => {
  let worlds: World[] = [];

  // unroll all the historical worlds
  let w: World | null = world;
  while (w !== null) {
    worlds.unshift(w);
    w = w.previous;
  }

  return <div className="history">
    { worlds.map(w => {
      let labels = world.interpretations[w.index] || {};
      
      let possible_labels: Interpretations[number] | undefined = undefined;
      if (possible_world !== null) {
        possible_labels = possible_world.interpretations[w.index];
      }
      return <HistoryElt
               key={w.index}
               world={w}
               labels={labels}
               possible_labels={possible_labels}
               renderer={renderer}
             />;
    }) }
  </div>
};

type HistoryEltProps = {
  world: World,
  labels: Interpretations[number],
  possible_labels: Interpretations[number] | undefined,
  renderer: Renderer
}
const HistoryElt: React.FunctionComponent<HistoryEltProps> = React.memo(
  ({world, labels, possible_labels, renderer}) => {
    function key_union(a: {}, b: {}) {
      return new Set([...Object.keys(a), ...Object.keys(b)]).values();
    }

    let ref = React.useRef<HTMLDivElement>() as React.MutableRefObject<HTMLDivElement>;
    
    let [previous_labels, set_previous_labels] = React.useState(labels);

    let adding_labels: string[] = [];
    let removing_labels: string[] = [];

    for (let l of key_union(labels, previous_labels || {})) {
      if (previous_labels !== undefined) {
        if (labels[l] && !previous_labels[l]) {
          adding_labels.push(l);
        } else if (!labels[l] && previous_labels[l]) {
          removing_labels.push(l);
        }
      } else if (labels[l]) {
        adding_labels.push(l);
      }
    }

    let [creating, set_creating] = React.useState(true); 

    React.useLayoutEffect(
      () => {
        console.log('animating world '+world.index);

        animate(ref, creating, adding_labels, removing_labels);
        if (creating) {
          set_creating(false);
        }
        if (!deep_equal(labels, previous_labels)) {
          set_previous_labels(labels);
        }
      },
      Object.keys(world.local_interpretations).map(l => adding_labels.includes(l) ? 1 : removing_labels.includes(l) ? -1 : 0)
    );

    let i = {...labels};
    if (possible_labels !== undefined) {
      for (let l of key_union(labels, possible_labels)) {
        if (possible_labels[l] && !labels[l]) {
          i[`would-add-${l}`] = true;
        } else if (!possible_labels[l] && labels[l]) {
          i[`would-remove-${l}`] = true;
        }
      }
    }
    let className = Object.entries(i).filter(([k, v]) => v).map(([k, v]) => k).join(' ');
    let rendering= renderer(world, labels, possible_labels)

    return <div ref={ref} className={className}>
      { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
      <OutputText rendering={rendering} />
    </div>;
  },
);

function animate(ref: React.MutableRefObject<HTMLDivElement>, creating: boolean, adding_classes: string[], removing_classes: string[]) {
  if (!creating && adding_classes.length === 0 && removing_classes.length === 0) {
    return;
  }

  function walkElt(elt, f: (e: HTMLElement) => void){
    let children = elt.children;
    for (let i = 0; i < children.length; i++) {
      let child = children.item(i);
      walkElt(child, f)
    }
    f(elt)
  }

  let comp_elt = ref.current;

  if (creating) {
    comp_elt.classList.add('animation-new')
  }

  // Momentarily apply the animation-pre-compute class
  // to accurately measure the target maxHeight
  // and check for the custom --is-collapsing property
  // (This is basically an abomination and I am sorry.)
  comp_elt.classList.add('animation-pre-compute');
  
  walkElt(comp_elt, (e) => e.dataset.maxHeight = `${e.scrollHeight}px`);
  
  comp_elt.dataset.isCollapsing = parseInt(getComputedStyle(comp_elt).getPropertyValue('--is-collapsing')) || 0 as any;

  comp_elt.classList.remove('animation-pre-compute');

  
  let edit_classes = [
    ...adding_classes.map(c => 'adding-' + c),
    ...removing_classes.map(c => 'removing-' + c)
  ]
  comp_elt.classList.add('animation-start', ...edit_classes);

  
  // If --is-collapsing was set by the animation-pre-compute class,
  // then apply the maxHeight update at the end of this animation frame
  // rather than the beginning of the next one.
  // I have no idea why this works/is necessary, but it does/is.
  if (comp_elt.dataset.isCollapsing == 1 as any) {
    walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight as any);
  }
    
  requestAnimationFrame(() => {
    // If --is-collapsing wasn't set in the animation-pre-compute class,
    // then apply the maxHeight update now.
    // Websites technology keyboard mouse.
    if (comp_elt.dataset.isCollapsing != 1 as any) {
      walkElt(comp_elt, (e) => e.style.maxHeight = e.dataset.maxHeight as any);
    }
    
    comp_elt.classList.add('animation-active');

    setTimeout(() => {
      comp_elt.classList.remove(
        'animation-new',
        'animation-start',
        'animation-active',
        ...edit_classes);

      walkElt(comp_elt, (e) => e.style.maxHeight = ''); //null);

      scroll_down();
    }, 700)
    
  });
}
