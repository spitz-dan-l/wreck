import * as React from 'react';


import {ParsedText, OutputText} from './Text2';
import { update, array_last } from '../typescript/datatypes';
import { Token, RawInput, Parsing, SUBMIT_TOKEN } from '../typescript/parser2';
import { apply_command, CommandResult, World, WorldSpec, Interpretations } from "../typescript/world";
import { keys } from '../typescript/keyboard_tools';


type AppState<W extends World=World> = {
  command_result: CommandResult<W>,
  typeahead_index: number,
  updater: (world: W, command: RawInput) => CommandResult<W>;
}

type AppAction =
  RawInput |
  { kind: 'SelectTypeahead', index: number } |
  { kind: 'SelectRelativeTypeahead', direction: 'up' | 'down' } |
  { kind: 'Submit' };


// "reducer" function which returns updated state according to the
// "kind" of the action passed to it
// TODO look up whether there are methods for factoring reducers better
function app_reducer(state: AppState, action: AppAction): AppState {
  switch (action.kind) {
    case 'RawInput':
      let new_result = state.updater(state.command_result.world, action);
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
              state.command_result.world,
              update(state.command_result.parsing.raw, {
                submit: state.command_result.parsing.view.submittable })),
          typeahead_index: -1
        });
      }
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

  return update(state, { typeahead_index: new_index });
  
}

function submit_typeahead(state: AppState) {
  let parsing = state.command_result.parsing;
  let row = parsing.view.typeahead_grid[state.typeahead_index];

  let synthesized_tokens: Token[] = [...parsing.tokens];

  row.option.forEach((m, i) => {
    if (m !== null) {
      synthesized_tokens[i] = m.token;
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

  let new_result = state.updater(state.command_result.world, synthesized_command);
  return update(state, {
    command_result: () => new_result,
    typeahead_index: new_result.parsing.view.typeahead_grid.length > 0 ? 0 : -1
  });
}

// The global context storing the state update dispatcher
const AppDispatch = React.createContext<React.Dispatch<AppAction>>(undefined);

export const App: React.FunctionComponent<AppState> = (initial_state) => {
  const [state, dispatch] = React.useReducer(app_reducer, initial_state)

  let current_world = state.command_result.world;
  let current_parsing = state.command_result.parsing;

  function handleKeyDown(event: KeyboardEvent) {
    let input_elt = document.querySelector('input');
      
    if (!event.ctrlKey && !event.metaKey) {
      input_elt.focus();
      // TODO: make scroll into view happen on a rerender, not here
      // Also make the bottom of the typeahead list the target
      // input_elt.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});
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
    let bottom = document.querySelector('.typeahead');
    bottom.scrollIntoView({behavior: "smooth", block: "start", inline: "end"});
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    }
  });

  return <AppDispatch.Provider value={dispatch}>
    <div>
      <History world={current_world} />
      <Prompt parsing={current_parsing} />
      <Typeahead parsing={current_parsing} typeahead_index={state.typeahead_index} />
    </div>
  </AppDispatch.Provider>
}

export const Prompt: React.FunctionComponent<{parsing: Parsing}> = (props) => {
  const dispatch = React.useContext(AppDispatch);
  const input_elt = React.useRef<HTMLInputElement>();
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      kind: 'RawInput',
      text: event.currentTarget.value,
      submit: false
    });
  }

  // // when key down is called by auto complete see if we should just submit
  // function handleKeys(event: React.KeyboardEvent<HTMLInputElement>) {
  //   // TODO - handle left/right presses, selecting the contents of the (invisible) input elt
  //   if (event.keyCode === keys.enter) {
  //     dispatch({
  //       kind: 'RawInput',
  //       text: event.currentTarget.value,
  //       submit: true
  //     });
  //   }

  //   function forceCursor() {
  //     let elt = input_elt.current;
  //     elt.setSelectionRange(elt.value.length, elt.value.length);
  //   }

  //   forceCursor();
  // }

  return <div className="prompt">
    <input
      ref={input_elt}
      onChange={handleChange}
      // onKeyDown={handleKeys}
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

/*
  The typeahead grid should actually consist of
  - each row has an overall kind - available, used, locked
  - then within the row there's the list of partial matches
*/

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
    return String.fromCharCode(8629); // curving down arrow indicator
  }

  function handleKeys(event: React.KeyboardEvent) {

  }

  return <ul className="typeahead">
    {parsing.view.typeahead_grid.map((option, i) => (
      <li
        key={i} 
        onMouseOver={() => handleMouseOver(i)}
        style={{
          opacity: option.type.kind === 'Available' ? 1.0 : 0.4
        }}
        onClick={() => handleClick(i)}
      >
        <span>{'  '}</span>
        { option.option.map((m, j) => {
          let style = {
            background: (i === typeahead_index && m !== null) ? 'DimGray' : 'inherit'
          };
          return <span key={j} style={style}>
          { m === null ?
            parsing.whitespace[j] + whitespace(convert_token(parsing.tokens[j])) :
            (j >= parsing.whitespace.length || j !== 0 && parsing.whitespace[j] === '' ?
              ' ' :
              parsing.whitespace[j]) + convert_token(m.token) }
          </span>
        }) }
      </li>
    ))}
  </ul>
}

export const History: React.FunctionComponent<{world: World}> = ({world}) => {
  let worlds = [];

  // unroll all the historical worlds
  let w = world;
  while (w !== null) {
    worlds.unshift(w);
    w = w.previous;
  }

  return <div className="history">
    { worlds.map(w => <HistoryElt key={w.index} world={w} interpretation_labels={world.interpretations[w.index]} />) }
  </div>
};

const HistoryElt: React.FunctionComponent<{world: World, interpretation_labels: Interpretations[number]}> = ({world, interpretation_labels}) => {
  let i = interpretation_labels;
  let className = i !== undefined ? i.join(' ') : '';
  return <div className={className}>
    { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
    <OutputText rendering={world.rendering} />
  </div>;
};

