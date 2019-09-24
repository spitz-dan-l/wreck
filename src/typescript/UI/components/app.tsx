import { keys } from '../../keyboard_tools';
import { AppState, app_reducer } from "../actions";
import { scroll_down } from "../animation";
import { child_declarator_for, Component, createElement, make_ui, Renderer } from "../framework";
import { ui_resources } from "../prelude";
import { UndoButton } from "./undo_button";
import { Prompt } from './prompt';
import { Typeahead } from './typeahead';
import { StaticResource } from '../../static_resources';

export const ui = make_ui((state, old?) => App(state, old), app_reducer);
export const initialize_app = ui.initialize

const dispatch = ui.dispatch;
ui_resources.initialize('dispatch', dispatch);
ui_resources.initialize('effect', ui.effect);

// VIEW LOGIC
export type App = Component<AppState>;

const app_child = child_declarator_for<App>();

const app_prompt = app_child(
    root => root.querySelector('.prompt')! as Prompt,
    (props) => ({
        parsing: props.command_result.parsing,
        locked: props.animation_state.lock_input
    }),
    Prompt
)

const app_typeahead = app_child(
    root => root.querySelector('.typeahead')! as Typeahead,
    (props) => ({
        parsing: props.command_result.parsing,
        typeahead_index: props.typeahead_index,
        undo_selected: props.undo_selected
    }),
    Typeahead
)

const app_undo_button = app_child(
    (root) => root.querySelector('.undo-button')! as UndoButton,
    (props) => ({
        world: props.command_result.world!,
        undo_selected: props.undo_selected
    }),
    UndoButton
);

export const App: Renderer<AppState> = (state, old?) => {
    let current_world = state.command_result.world!;
    let current_parsing = state.command_result.parsing;
    let possible_world = state.command_result.possible_world;
    let animation_state = state.animation_state;

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

        return <div>
            <History world={current_world} possible_world={possible_world} animation_state={animation_state} undo_selected={state.undo_selected} />
            <app_prompt.render {...state} />
            <app_typeahead.render {...state} />
            <app_undo_button.render {...state} />
        </div> as App;
    }

    app_prompt.render(state, old);
    app_typeahead.render(state, old);
    app_undo_button.render(state, old);
    
    return old.old_root;
}