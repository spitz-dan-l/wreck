import { keys } from '../../lib/keyboard_utils';
import { AppState, app_reducer } from "../app_state";
import { scroll_down } from "../animation";
import { child_declarator_for, Component, createElement, make_ui, Renderer } from "../framework";
import { ui_resources } from "../prelude";
import { UndoButton } from "./undo_button";
import { InputPrompt } from './input_prompt';
import { Typeahead } from './typeahead';
import { History } from './history';

export const ui = make_ui((state, old?) => App(state, old), app_reducer);
export const initialize_app = ui.initialize

ui_resources.initialize('initialize', ui.initialize)
ui_resources.initialize('dispatch', ui.dispatch);
ui_resources.initialize('effect', ui.effect);
ui_resources.initialize('effect_promise', ui.effect_promise);
ui_resources.seal();

const dispatch = ui.dispatch;

// VIEW LOGIC
export type App = Component<AppState>;

const app_child = child_declarator_for<App>();

const app_history = app_child(
    root => root.querySelector('.story')! as History,
    (props) => ({
        world: props.command_result.world,
        possible_world: props.command_result.possible_world,
        animation_state: props.animation_state,
        undo_selected: props.undo_selected
    }),
    History
)

const app_prompt = app_child(
    root => root.querySelector('#story-hole .input-prompt')! as InputPrompt,
    (props) => ({
        parsing: props.command_result.parsing,
        locked: props.animation_state.lock_input
    }),
    InputPrompt
)

const app_typeahead = app_child(
    root => root.querySelector('#story-hole .typeahead')! as Typeahead,
    (props) => ({
        parsing: props.command_result.parsing,
        typeahead_index: props.typeahead_index,
        undo_selected: props.undo_selected
    }),
    Typeahead
)

const app_undo_button = app_child(
    (root) => root.querySelector('#story-hole .undo-button')! as UndoButton,
    (props) => ({
        world: props.command_result.world!,
        undo_selected: props.undo_selected
    }),
    UndoButton
);

export const App: Renderer<AppState> = (state, old?) => {
    if (old === undefined) {
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

        ui.effect(() => {
            document.addEventListener('keydown', handleKeyDown);
            scroll_down();
        });

        const root = <div className="app">
            <app_history.render {...state} />
        </div> as App;

        const hole = root.querySelector('#story-hole');
        if (hole === null) {
            throw new Error('History element did not create its story hole');
        }

        hole.appendChild(<app_prompt.render {...state} />);
        hole.appendChild(<app_typeahead.render {...state} />);
        hole.appendChild(<app_undo_button.render {...state} />);
        return root;
    } 
    
    app_history.render(state, old);
    app_prompt.render(state, old);
    app_typeahead.render(state, old);
    app_undo_button.render(state, old);
    
    return old.old_root;
}