import * as React from 'react';


import {ParsedText, OutputText} from './Text2';

import { WorldDriver, World, Interpretations } from "../typescript/world";

/*
TODO steps to get this all working

DONE 1. Make a static world/history viewer app
  - no interactivity, just displays previous commands and the resulting messages
  - shows parser highlighting
DONE 2. Add interpretation restyling to the static viewer
3. Add input prompt
  - Highlights tokens as the user types
  - Submission of command triggers rerender, new history element
4. Support view update due to new interpreatation
5. Typeahead added to prompt
  - Autoocomplete options display with correct indentation
  - Select typeahead option with keybooard, mouse
6. Support "locked" typeahead options

*/

export const History: React.FunctionComponent<{world: World}> = ({world}) => {
  let worlds = [];

  // unroll all the historical worlds
  let w = world;
  while (w !== null) {
    worlds.unshift(w);
    w = w.previous;
  }

  return <div className="history">
    { worlds.map(w => <HistoryElt key={w.index} world={w} interpretation_labels={world.interpretations[w.index]} />) }
  </div>
};

const HistoryElt: React.FunctionComponent<{world: World, interpretation_labels: Interpretations[number]}> = ({world, interpretation_labels}) => {
  let i = interpretation_labels;
  let className = i !== undefined ? i.join(' ') : '';
  return <div className={className}>
    { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
    <OutputText message={world.message} />
  </div>;
};

