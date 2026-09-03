import { new_venience_world as new_world } from 'demo_worlds/narrascope';
import { forceRenderStyles } from 'typestyle';
import { initialize_app } from 'UI';
import { initialize_app_state } from 'UI/app_state';

// Production entry point: start the game from its initial state, no debug commands.
const initial_state = initialize_app_state(() => new_world());

document.getElementById('terminal')!.appendChild(initialize_app(initial_state));
forceRenderStyles();
