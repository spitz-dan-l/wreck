import { App } from '../components/Terminal';
import { new_bird_world } from './demo_worlds/bird_world';
// import { new_bird_world } from './demo_worlds/puffer_bird_world';
// import { new_hex_world } from './demo_worlds/hex_port';
// import { new_venience_world } from './demo_worlds/spring_thing_port/00_prologue';
// import { new_venience_world } from './demo_worlds/narrascope/narrascope';
import { empty_animation_state } from '../components/animation';


console.time('world_build');
let {initial_result, update, css_rules} = new_bird_world();//new_venience_world();//new_hex_world();

// Ability to start from a specific point in the demo:

// const START_SOLVED = 0;

// import { find_world_at } from './demo_worlds/narrascope/supervenience_spec';
// import { raw } from './parser';

// const starting_world = find_world_at(initial_result.world, START_SOLVED);
// initial_result = update(starting_world.result!, raw('', false));


console.timeEnd('world_build');


console.time('render');

if (css_rules !== undefined) {
    let elt = document.querySelector('#custom-css-rules')! as HTMLStyleElement;
    let sheet = elt.sheet! as CSSStyleSheet;
    for (let rule of css_rules) {
        sheet.insertRule(rule);
    }
}

ReactDom.render(<App
    typeahead_index={0}
    undo_selected={false}
    command_result={initial_result}
    updater={update}
    animation_state={empty_animation_state}
/>, document.getElementById('terminal'));
// ReactDom.render(<History world={result.world} />, document.getElementById('terminal'));
console.timeEnd('render');
