// Production entry point for the Voice of Fire demo: start from the classroom, no debug commands.
import { new_fire_world as new_world } from 'demo_worlds/fire';
import { forceRenderStyles } from 'typestyle';
import { initialize_app } from 'UI';
import { initialize_app_state } from 'UI/app_state';

const initial_state = initialize_app_state(() => new_world());

document.getElementById('terminal')!.appendChild(initialize_app(initial_state));
forceRenderStyles();
