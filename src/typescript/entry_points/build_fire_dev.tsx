// Development entry point for the Voice of Fire demo: debug tools on, and a
// list of commands to replay on startup so you can skip ahead while developing.
import { new_fire_world as new_world } from 'demo_worlds/fire';
import { GLOBAL_DEV_TOOLS } from 'devtools';
import { raw } from 'parser';
import { forceRenderStyles } from 'typestyle';
import { initialize_app } from 'UI';
import { initialize_app_state } from 'UI/app_state';

GLOBAL_DEV_TOOLS.DEBUG = true;

function prepare_world() {
    let { initial_result, update, css_rules } = new_world();

    const DEBUG_COMMANDS: string[] = [
        // 'look at the board',
        // 'listen',
    ];

    for (const cmd of DEBUG_COMMANDS) {
        initial_result = update(initial_result.world, raw(cmd, true));
    }

    return { initial_result, update, css_rules };
}

const initial_state = initialize_app_state(prepare_world);

document.getElementById('terminal')!.appendChild(initialize_app(initial_state));
forceRenderStyles();
