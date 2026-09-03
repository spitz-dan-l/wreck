import { new_venience_world as new_world } from 'demo_worlds/narrascope';
import { GLOBAL_DEV_TOOLS } from 'devtools';
import { raw } from 'parser';
import { forceRenderStyles } from 'typestyle';
import { initialize_app } from 'UI';
import { initialize_app_state } from 'UI/app_state';

GLOBAL_DEV_TOOLS.DEBUG = true;

function prepare_world() {
    console.time('world_build');

    let {initial_result, update, css_rules} = new_world()

    // Commands to replay on startup, to skip ahead while developing.
    const DEBUG_COMMANDS: string[] = [
        // 'consider sam',
        // 'remember something meditative',
        // 'consider sam',
        // 'begin reflection on my impression of sam',
    ];

    for (const cmd of DEBUG_COMMANDS) {
        initial_result = update(initial_result.world, raw(cmd, true));
    }

    // Ability to start from a specific point in the demo:

    // const START_SOLVED = 0;

    // import { find_world_at } from './demo_worlds/narrascope/supervenience_spec';
    // import { raw } from './parser';

    // if (START_SOLVED > 0) {
    //     const starting_world = find_world_at(initial_result.world, START_SOLVED);
    //     initial_result = update(starting_world.result!, raw('', false));
    // }
    console.timeEnd('world_build');

    return {initial_result, update, css_rules};
}

console.time('render');

// if (css_rules !== undefined) {
//     let elt = document.querySelector('#custom-css-rules')! as HTMLStyleElement;
//     let sheet = elt.sheet! as CSSStyleSheet;
//     for (let rule of css_rules) {
//         sheet.insertRule(rule);
//     }
// }

const initial_state = initialize_app_state(prepare_world);

document.getElementById('terminal')!.appendChild(initialize_app(initial_state));
forceRenderStyles();

console.timeEnd('render');
