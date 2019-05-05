import * as React from "react";
import * as ReactDom from "react-dom";
import { App } from '../components/Terminal';
import { new_bird_world } from './demo_worlds/puffer_bird_world';


console.time('world_build');
let [result, updater, renderer] = new_bird_world();

// for (let i = 0; i < 3; i++) {
//     result = updater(result.world, raw('go up stairs'));
//     result = updater(result.world, raw('go down stairs'));
// }
console.timeEnd('world_build');


console.time('render');

ReactDom.render(<App typeahead_index={0} command_result={result} updater={updater} renderer={renderer} />, document.getElementById('terminal'));
// ReactDom.render(<History world={result.world} />, document.getElementById('terminal'));
console.timeEnd('render');

// import {Terminal} from "../components/Terminal";

// import {WorldDriver} from "../typescript/commands";

// import {VenienceWorld, VenienceWorldState} from '../typescript/venience/venience_world';

// let start: VenienceWorldState = {};

// // start.experiences = ['grass, asking 2'];
// //start.experiences = ['alcove, entering the forest']; 
// // start.experiences = ['woods, ending interpretation'];
// // start.experiences = ['bed, sitting up 2'];
// // start.experiences = ['woods, crossing the boundary 2'];
// // start.experiences = ['woods, clearing'];
// // start.has_regarded = {'tangle, 3': true};
// // start.has_understood = {'tangle, 3': true};

// let world_driver = new WorldDriver(new VenienceWorld(start))

// ReactDom.render(<Terminal world_driver={world_driver} />, document.getElementById('terminal'));
