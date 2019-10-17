import { update, array_last } from "../utils";
import { advance_animation, new_animation_state, empty_animation_state, AnimationState } from "./animation";
import { Token, SUBMIT_TOKEN, RawInput } from "../parser";
import { CommandResult, World } from "../world";
import { Story } from "../story";

export type AppState = {
    command_result: CommandResult<World>,
    typeahead_index: number,
    undo_selected: boolean,
    animation_state: AnimationState,
    updater: (world: World, command: RawInput) => CommandResult<World>
}

export type AppAction =
    { kind: 'ChangeText', text: string } |
    { kind: 'SelectTypeahead', index: number } |
    { kind: 'SelectRelativeTypeahead', direction: 'up' | 'down' } |
    { kind: 'SelectUndo' } |
    { kind: 'ToggleUndoSelected' } |
    { kind: 'Submit' } |
    { kind: 'AdvanceAnimation', next_story: Story };

// "reducer" function which returns updated state according to the
// "kind" of the action passed to it
export function app_reducer(state: AppState, action: AppAction): AppState {
    if (state.animation_state.lock_input && action.kind !== 'AdvanceAnimation') {
        return state;
    }

    switch (action.kind) {
        case 'AdvanceAnimation':
            return update(state, { animation_state: _ => advance_animation(_, action.next_story) });
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
                                    submit: state.command_result.parsing.view.submittable
                                })
                            ),
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
            animation_state: _ => new_animation_state(new_state.command_result.world, old_state.command_result.world)
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
