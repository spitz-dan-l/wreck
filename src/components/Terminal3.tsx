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

export const History: React.FunctionComponent<{world: World}> = ({world}) => (
  <div className="history">
    <HistoryElt world={world} interpretations={world.interpretations} />
  </div>
)

const HistoryElt: React.FunctionComponent<{world: World, interpretations: Interpretations}> = ({world, interpretations}) => {
  let i = interpretations[world.index];
  let className = i !== undefined ? i.join(' ') : '';
  return <>
    {world.previous !== null ? <HistoryElt world={world.previous} interpretations={interpretations} /> : '' }
    <div key={world.index} className={className}>
      { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
      <OutputText message={world.message} />
    </div>
  </>;
};

    
// (
//   <div className="terminal" tabIndex={-1} onKeyDown={this.handleKeys} ref={cc => this.contentContainer = cc}>
//     { /*<Preface on_start_game={() => this.prompt.focus()} /> */}
//     <History
//       timeout={700}
//       onAnimationFinish={this.scrollToPrompt}
//       history={this.state.world_driver.history}
//       possible_history={this.state.world_driver.possible_history}
//       ref={h => this.history = h}
//       />
//     <Prompt
//       onSubmit={this.handleSubmit}
//       onChange={this.handlePromptChange}
//       ref={p => this.prompt = p}>
//       <ParsedText2 parsing={this.currentParsing()}>
//         <TypeaheadList
//           typeahead={this.currentTypeahead()}
//           indentation={this.currentIndentation()}
//           onTypeaheadSelection={this.handleTypeaheadSelection}
//           ref={t => this.typeahead_list = t}
//         />
//       </ParsedText2>
//     </Prompt>
//   </div>
// );
 