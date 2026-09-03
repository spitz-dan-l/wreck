import { AppAction, AppState } from './app_state';
import { UI } from './framework';

// The running UI, set once when the app is initialized, so that components can dispatch actions.
let running_ui: UI<AppState, AppAction> | undefined = undefined;

export function set_ui(ui: UI<AppState, AppAction>) {
    if (running_ui !== undefined) {
        throw new Error('The UI was initialized twice.');
    }
    running_ui = ui;
}

export function ui(): UI<AppState, AppAction> {
    if (running_ui === undefined) {
        throw new Error('The UI has not been initialized.');
    }
    return running_ui;
}
