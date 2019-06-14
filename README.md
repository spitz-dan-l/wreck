# Venience World

Venience World is a parser game (i.e. text adventure) with a novel interface.

A playable demo is available as part of the [Spring Thing 2018](http://springthing.net/2018/play.html#VenienceWorld) festival.

It is written in Typescript and runs in the browser.

If you're interested in adapting it for your purposes, or learning about how it works, please drop me a line at spitz.dan.L+venienceworld@gmail.com or DM [@VenienceWorld](https://twitter.com/venienceworld) on twitter.

This code is released under the MIT license.

## Browser compatibility

Works in Chrome and Firefox.

Does not work in Safari (I can't steal focus/keyboard events)

Does not work on the iphone. (The text doesn't render at the right size, and I can't get the keyboard to show. I think game's interface would lend itself quite well to a telephone-friendly version some day.)

I have not tested for IE/Edge/Opera/Android.

## Development

Clone this repo and `npm install`.

A few commands are exposed as npm package scripts:

#### `npm test`
Performs type-checking, compiles to JS in the build/ directory and runs unit tests.

#### `npm run debug`
Same as above, but runs the unit tests in debug mode, so you can insert breakpoints and step through interactively.

#### `npm run build-dev`
Bundles the game and saves it in `dist/venience.js`. It will Just Work if you open `dist/venience.html` in your browser. NOTE: DOES NOT DO TYPE CHECKING.

#### `npm run build`
Builds the game in production mode- no source maps, smaller bundle, faster renders. Also saves to `dist/venience.js` so `build` and `build-dev` overwrite each other.

## Architecture

The game uses React for UI, and a segregated original typescript framework for all game logic.

It's all currently in quite a messy state, as I've been scrambling to release for Spring Thing.

The code organization quality, broken down by topic:

#### React/UI

Quite disorganized/spaghetti-like. I'm not a very experienced (or enthusiastic) UI developer, and there's been a fair amount of "tweak til it works".

See `src/components/` for the react component code. See `src/typescript/main.tsx` for the entrypoint. See `dist/index.html` for the stub html file.

#### Parser

Quite disorganized but powerful. The parser itself is arguably the cornerstone of Venience World, and the style of parsing implemented is quite powerful; it supports arbitrary look ahead with multiple possible independent "consumer threads". The act of instructing the parser how to consume things also automatically produces the typeahead/autocomplete that is used in the UI.

See `src/typescript/parser.ts`.

#### Command resolution

Decent. The update model for the game is simple, and as such it fits in your head easily.

See `src/typescript/commands.ts`.

#### World content/logic management

Decent but underdeveloped. Given the novelty of the mechanics in Venience World, it has been necessary to invent new ways of organizing and abstracting over game logic. That is an ongoing process, but a fun and gratifying one.

See `src/typescript/venience`.

## Future plans

I would certainly like at some point to clean up all the code, add missing abstractions, perhaps release a proper "engine" independent of the game itself. However, the continued development and completion of Venience World, the game, is primary to me above other development goals.

As development of Venience World continues, I may not continue to release all the source code. This demo will always be around though. My hope is that anyone who is inspired and curious can learn something from it, create something, and give back to this medium in turn.

## Missing features

- Save/Load. The architecture of the game is such that implementation of save/load should be quite natural; the game only ever creates updated copies of its state, never modifying existing state. Additionally it already maintains a history of every past game state, as this has been useful for debugging. The missing feature here is serialization of the state and some interface for selecting save files.

- Undo. Architecture-wise, this should come naturally for the same reason as Save/Load (see above). However, Undo presents somewhat of a design/aesthetic challenge. Venience World already has "undo-like" game mechanics, triggered by in-game commands according to context. It would take power away from these mechanics to add a general-purpose "Undo" feature.

- Exporting transcripts. There's currently not a great way to copy the entire transcript of a playthrough as text and save it somewhere. Currently, selecting and copy-pasting the page yields a few formatting bugs.

- Many more, that are too intertwined with the core design principles of the game to be easily listed as "missing features".
