"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const React = require("react");
const ReactDom = require("react-dom");
const Terminal_1 = require("../components/Terminal");
const commands_1 = require("../typescript/commands");
const venience_world_1 = require("../typescript/venience/venience_world");
let start = {};
// start.experiences = ['grass, asking 2'];
//start.experiences = ['alcove, entering the forest']; 
// start.experiences = ['woods, ending interpretation'];
// start.experiences = ['bed, sitting up 2'];
// start.experiences = ['woods, crossing the boundary 2'];
// start.experiences = ['woods, clearing'];
// start.has_regarded = {'tangle, 3': true};
// start.has_understood = {'tangle, 3': true};
let world_driver = new commands_1.WorldDriver(new venience_world_1.VenienceWorld(start));
ReactDom.render(React.createElement(Terminal_1.Terminal, { world_driver: world_driver }), document.getElementById('terminal'));
//# sourceMappingURL=main.js.map