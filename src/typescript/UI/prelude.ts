import {StaticMap} from '../static_resources';
import { AppAction } from './actions';

export interface UIResources {
    dispatch: (action: AppAction) => void;
    effect: (f: () => void) => void;
}

export const ui_resources = new StaticMap<UIResources>([
    'dispatch',
    'effect'
]);