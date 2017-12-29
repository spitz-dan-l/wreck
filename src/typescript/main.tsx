import * as React from "react";
import * as ReactDom from "react-dom";

import {Terminal} from "../components/Terminal";

import {WorldDriver} from "../typescript/commands";

//import {BirdWorld} from '../typescript/bird_world';
import {VenienceWorld} from '../typescript/venience/venience_world';

let world_driver = new WorldDriver(new VenienceWorld({}))

ReactDom.render(<Terminal world_driver={world_driver} />, document.getElementById('terminal'));
