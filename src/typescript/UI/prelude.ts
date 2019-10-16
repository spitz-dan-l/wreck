import { StaticMap } from '../static_resources';
import { AppAction, AppState } from './app_state';
import {UI} from './framework';

export interface UIResources {
    dispatch: (action: AppAction) => void;
    effect: (f: () => void) => void;
}

export const ui_resources = new StaticMap<UI<AppState, AppAction>>({
    initialize: null,
    'dispatch': null,
    'effect': null,
    'effect_promise': null

});