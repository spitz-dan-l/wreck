/** @jsx createElement */
import { createElement } from '../UIBuilder/UIBuilder';
import { CompoundWorld, group_compound_worlds, is_compound_world, MaybeCompoundWorld } from '../history';
import { keys } from '../keyboard_tools';
import { Parsing, RawInput, SUBMIT_TOKEN, Token, TokenAvailability, TokenMatch, TypeaheadOption } from '../parser';
import { array_last, filter_values, key_union, map_values, update } from '../utils';
import { CommandResult, World } from "../world";
import { advance_animation, animate, AnimationState, empty_animation_state, new_animation_state, scroll_down } from './animation2';
import { OutputText, ParsedText } from '../../components/Text';

// STATE, ACTIONS, REDUCERS

type AppState = {
  command_result: CommandResult<World>,
  typeahead_index: number,
  undo_selected: boolean,
  animation_state: AnimationState,
  updater: (world: World, command: RawInput) => CommandResult<World>
}


type AppAction =
  { kind: 'ChangeText', text: string } |
  { kind: 'SelectTypeahead', index: number } |
  { kind: 'SelectRelativeTypeahead', direction: 'up' | 'down' } |
  { kind: 'SelectUndo' } |
  { kind: 'ToggleUndoSelected' } |
  { kind: 'Submit' } |
  { kind: 'AdvanceAnimation' };

// "reducer" function which returns updated state according to the
// "kind" of the action passed to it
function app_reducer(state: AppState, action: AppAction): AppState {
  if (state.animation_state.lock_input && action.kind !== 'AdvanceAnimation') {
    return state;
  }

  switch (action.kind) {
    case 'AdvanceAnimation':
      return update(state, { animation_state: advance_animation });
    case 'ChangeText': {
      let new_result = state.updater(state.command_result.world!, {
        kind: 'RawInput',
        text: action.text,
        submit: false
      });
      return update(state, {
        command_result: () => new_result,
        typeahead_index: new_result.parsing.view.typeahead_grid.length > 0 ? 0 : -1
      });
    }
    case 'SelectTypeahead':
      return update(state, {
        typeahead_index: () => action.index,
        undo_selected: false
      });
    case 'SelectRelativeTypeahead':
      return select_relative_typeahead(state, action.direction);
    case 'SelectUndo':
      return update(state, { undo_selected: true });
    case 'ToggleUndoSelected': {
      // Question here of whether this elimination logic should actually be in the view
      if (state.command_result.world.previous === null) {
        return state;
      }
      return update(state, { undo_selected: _ => !_});
    }
    case 'Submit': {
      if (state.undo_selected) {
        return undo(state);
      } else {
        let result: AppState;
        if (state.typeahead_index !== -1) {
          result = submit_typeahead(state);
        } else {
          result = update(state, {
            command_result: () =>
              state.updater(
                state.command_result.world!,
                update(state.command_result.parsing.raw, {
                  submit: state.command_result.parsing.view.submittable })),
            typeahead_index: -1,
            undo_selected: false
          });
        }

        return update_animation_state(result, state);
      }
    }
  }
  debugger;
  throw new Error('should no get here');
}

function update_animation_state(new_state: AppState, old_state: AppState): AppState {
  if (new_state.command_result.world.index > old_state.command_result.world.index) {
    return update(new_state, {
      animation_state: _ => new_animation_state(new_state.command_result.world)
    });
  }
  return new_state;
}

function undo(state: AppState) {
  // find the beginning of the current (possibly-compound) world
  let w = state.command_result.world;
  while (w.parent !== null) {
    w = w.parent;
  }
  
  let prev_command_result = state.updater(
      w.previous!,
      update(w.parsing!.raw, { submit: false })
      // state.command_result.world.previous!,
      // update(state.command_result.world.parsing!.raw, { submit: false })
    );
    return update(state, {
      command_result: () => prev_command_result,
      typeahead_index: 0,
      undo_selected: false,
      animation_state: _ => empty_animation_state
    });
}

function select_relative_typeahead(state: AppState, direction: 'up' | 'down') {
  if (state.undo_selected) {
    return state;
  }

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

// VIEW LOGIC
// The global context storing the state update dispatcher
const AppDispatch = React.createContext<React.Dispatch<AppAction>>(null!);

export const App: React.FunctionComponent<AppState> = (initial_state) => {
  const [state, dispatch] = React.useReducer(app_reducer, initial_state)

  let current_world = state.command_result.world!;
  let current_parsing = state.command_result.parsing;
  let possible_world = state.command_result.possible_world;
  let animation_state = state.animation_state;

  function handleKeyDown(event: KeyboardEvent) {
    let input_elt = document.querySelector('input')!;
      
    if (!event.ctrlKey && !event.metaKey) {
      input_elt.focus();
    }

    if (event.keyCode === keys.left || event.keyCode === keys.right) {
      dispatch({kind: 'ToggleUndoSelected' });
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
      <History world={current_world} possible_world={possible_world} animation_state={animation_state} undo_selected={state.undo_selected} />
      <Prompt parsing={current_parsing} locked={animation_state.lock_input} />
      <Typeahead parsing={current_parsing} typeahead_index={state.typeahead_index} undo_selected={state.undo_selected} />
      <UndoButton world={current_world} undo_selected={state.undo_selected} />
    </div>
  </AppDispatch.Provider>
}

type UndoProps = {
  world: World,
  undo_selected: boolean
};
export const UndoButton: React.FunctionComponent<UndoProps> = ({world, undo_selected}) => {
  const dispatch = React.useContext(AppDispatch);
  function get_undo_class() {
    let classes = ['undo-button'];
    if (undo_selected) {
      classes.push('selected');
    }
    if (world.previous === null) {
      classes.push('disabled');
    }

    return classes.join(' ');
  }
  return (
    <div className={get_undo_class()}
         onMouseOver={() => dispatch({kind: 'SelectUndo'})}
         onClick={() => { dispatch({kind: 'SelectUndo'}); dispatch({kind: 'Submit'}); }}
         style={{}}
    >
      {String.fromCharCode(10226)} Undo
    </div>);
}

export const Prompt: React.FunctionComponent<{parsing: Parsing, locked: boolean}> = (props) => {
  const dispatch = React.useContext(AppDispatch);
  const input_elt = React.useRef<HTMLInputElement>() as React.MutableRefObject<HTMLInputElement>;
  
  function handleChange(event: React.ChangeEvent<HTMLInputElement>) {
    dispatch({
      kind: 'ChangeText',
      text: event.currentTarget.value
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
      <Cursor locked={props.locked} /> 
    </span>
  </div>
}

const Cursor: React.FunctionComponent<{locked: boolean}> = ({locked}) =>
    <span className={locked ? '' : "blinking-cursor"}>
      {String.fromCharCode(locked ? 8943 : 9608)}
    </span>;

type TypeaheadProps = {
  parsing: Parsing,
  typeahead_index: number,
  undo_selected: boolean
}
export const Typeahead: React.FunctionComponent<TypeaheadProps> = ({parsing, typeahead_index, undo_selected}) => {
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
    switch (availability) {
      case 'Available':
        return 'available';
      case 'Used':
        return 'used';
      case 'Locked':
        return 'locked';
    }
  }

  function get_option_class(option: TypeaheadOption, index: number, selected_index: number, undo_selected: boolean): string {
    let classes = ['option', cssify_availability(option.availability)];
    if (index === selected_index && !undo_selected) {
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
        className={get_option_class(option, i, typeahead_index, undo_selected)}
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
        { option.availability === 'Locked' ? <Lock /> : '' }
      </li>
    ))}
    <li className='footer'>&nbsp;</li>
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
  animation_state: AnimationState,
  undo_selected: boolean
}

type AnimationMap = {
  [index: number]: HTMLDivElement
}

export const History: React.FunctionComponent<HistoryProps> = ({world, possible_world, animation_state, undo_selected}) => {
  let dispatch = React.useContext(AppDispatch);

  let elt_index: React.MutableRefObject<AnimationMap> = React.useRef({});

  const animation_stage = animation_state.current_stage;
  
  React.useLayoutEffect(() => {
    if (animation_stage === undefined) {
      return;
    }
    
    let current_changes = animation_state.changes.label_changes.get(animation_stage)!;

    let ps = Promise.all(Object.entries(current_changes).map(([i, changes]) =>
      animate(elt_index.current[i as unknown as number], changes)
    ))
    
    ps.then(() => {
      dispatch({ kind: 'AdvanceAnimation' });
    });
  });

  let worlds: MaybeCompoundWorld<World>[] = group_compound_worlds(world); //history_array(world).reverse();

  let result = worlds.map((w, i) => {
    
    return <HistoryElt
            key={is_compound_world(w) ? w.root.index : w.index}
            world={w}
            current_interpretations={world.interpretations}
            possible_interpretations={possible_world === null ? {} : possible_world.interpretations}
            animation_state={animation_state}
            elt_index={elt_index}
            undo_selected={undo_selected}
            would_undo={i === worlds.length - 1}
          />;
  });

  return <div className="history">
    { result }
  </div>
};

type HistoryEltProps = {
  world: MaybeCompoundWorld<World>,
  current_interpretations: Interpretations,
  possible_interpretations: Interpretations,
  animation_state: AnimationState,
  elt_index: React.MutableRefObject<{ [index: number]: HTMLDivElement }>,
  undo_selected: boolean,
  would_undo: boolean
}
const HistoryElt: React.FunctionComponent<HistoryEltProps> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
  if (is_compound_world(world)) {
    return <CompoundHistoryElt
      world={world}
      current_interpretations={current_interpretations}
      possible_interpretations={possible_interpretations}
      animation_state={animation_state}
      elt_index={elt_index}
      undo_selected={undo_selected}
      would_undo={would_undo}
    />
  } else {
    return <AtomicHistoryElt
      world={world}
      current_interpretations={current_interpretations}
      possible_interpretations={possible_interpretations}
      animation_state={animation_state}
      elt_index={elt_index}
      undo_selected={undo_selected}
      would_undo={would_undo}

    />
  }
};

const CompoundHistoryElt: React.FunctionComponent<HistoryEltProps & {world: CompoundWorld<World>}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
  return <div className="compound">
    { world.root.parsing !== undefined ? <ParsedText parsing={world.root.parsing} /> : '' }
    <div className="children">
      { world.children.map(w => <HistoryElt
          key={is_compound_world(w) ? w.root.index : w.index}
          world={w}
          current_interpretations={current_interpretations}
          possible_interpretations={possible_interpretations}
          animation_state={animation_state}
          elt_index={elt_index}
          undo_selected={undo_selected}
          would_undo={would_undo}    
        />) }
    </div>
  </div>;
}

const AtomicHistoryElt: React.FunctionComponent<HistoryEltProps & {world: World}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
  const labels = current_interpretations[world.index] || {};
  const possible_labels = possible_interpretations[world.index] || {};

  let ref = React.useCallback((node: HTMLDivElement) => {
    elt_index.current[world.index] = node;
  }, []);

  let animation_stage = animation_state.current_stage;
  
  let class_labels: { [label: string]: boolean };
  if (animation_stage === undefined) {
    class_labels = map_values(filter_values(labels, v => typeof(v.value) !== 'symbol'), v => v.value as boolean);
  } else {
    if (
      animation_state.changes.base_state[world.index] &&
      animation_state.changes.base_state[world.index].get(animation_stage)
    ) {
      class_labels = animation_state.changes.base_state[world.index].get(animation_stage)!;
    } else {
      class_labels = {};
    }
  }

  if (possible_labels !== undefined) {
    for (let l of key_union(labels, possible_labels)) {
      if (label_value(possible_labels, l) &&
            (!label_value(labels, l) ||
             label_value(possible_labels, l) !== label_value(labels, l))) {
        class_labels[`would-add-${l}`] = true;
      } else if (!label_value(possible_labels, l) && label_value(labels, l) === true) {
        class_labels[`would-remove-${l}`] = true;
      }
    }
  }

  if (undo_selected && would_undo) {
    class_labels['would-add-forgotten'] = true;
  }

  let className = Object.entries(class_labels).filter(([k, v]) => v === true).map(([k, v]) => k).join(' ');
  
  let rendering= render_message(
    world,
    map_values(class_labels, v => ({ kind: 'Interpretation', value: v })),
    possible_labels
  );

  return <div ref={ref} className={className}>
    { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
    <OutputText rendering={rendering} />
  </div>;
}