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

You need Node 20 or newer (there is an `.nvmrc`), and npm.

Clone this repo and `npm install`.

A few commands are exposed as npm package scripts:

#### `npm test`
Type-checks, compiles to JS in the `build/` directory and runs the unit tests. The supervenience tests search the whole demo for a winning path, so they take a while.

#### `npm run typecheck`
Type-checks only, without emitting anything.

#### `npm run debug`
Same as `npm test`, but runs the unit tests in debug mode, so you can insert breakpoints and step through interactively.

#### `npm run build-dev`
Bundles the game with esbuild (with source maps) and saves it in `dist/venience.js`. It will Just Work if you open `dist/venience.html` in your browser. NOTE: DOES NOT DO TYPE CHECKING. The entry point is `src/typescript/entry_points/build_dev.tsx`, which has a list of commands to replay on startup so you can skip ahead while developing.

#### `npm run build`
Builds the game in production mode- minified, no source maps. Also saves to `dist/venience.js` so `build` and `build-dev` overwrite each other. The entry point is `src/typescript/entry_points/build_prod.tsx`.

#### Playing from the command line
After `npm run compile`, `node scripts/play.js "consider sam" "remember something meditative" ...` applies a sequence of commands to a fresh game, printing each frame's text and the commands available at the end. This is the quickest way to check game logic without a browser. `node scripts/search_stats.js` times the future searches the tests run.

## Architecture

The game is mostly original code, with no framework dependency beyond [TypeStyle](https://github.com/typestyle/typestyle) for CSS. It is built with TypeScript 7 (strict) and bundled with esbuild.

#### World and puffers (`world.tsx`, `puffer.ts`, `lock.ts`, `history.ts`)

The game state is an immutable `World`: the current story, pending story updates, and a link to the previous world, so the whole history is always available. Each command produces a new world. Behavior is composed from *puffers*: bundles of `pre` / `handle_command` / `post` handlers, optionally split into numbered stages, that are knitted together into one world spec. A lock lets one part of the game (say, a reflection) own the whole command space for a while.

#### Parser (`parser/`)

The parser runs many *threads* over the input at once; a thread can split into alternatives and consume tokens with a small spec language. From the union of all threads it derives whether the input is valid, how to color each word, and the typeahead options. See `parser/parser.ts`.

#### Story (`story/`)

Text is a story tree, a small virtual DOM built with JSX (`story/create.ts`). Updates to it are plain data: a query selecting nodes plus an op to apply, grouped and staged so that they can be animated in order (`story/update/`). The same op both transforms the tree and, when animating, mutates the page.

#### Gists (`gist/`)

A gist is a plain `{tag, children, params}` value describing what a passage is *about*, e.g. `consider(subject: Sam)`. Story nodes can carry a gist, which is how the game refers to text by meaning: to reflect on it, to reveal more beneath it, or to render it as a phrase or a command. Gist *patterns* (partial gists) select gists; renderers and action handlers dispatch on them.

#### Knowledge (`story/knowledge.ts`)

Knowledge is just a story tree in the world state: the canonical passage for every gist the player can consider. When an interpretation reveals text, it is grafted beneath the passage both in the frame where it was printed (retroactively, animated) and in the knowledge tree, so that considering the topic again shows it.

#### UI (`UI/`)

A minimal renderer: components are DOM elements, re-rendered by diffing props rather than a virtual DOM, so that they can mutate the page directly for animations. A reducer loop dispatches actions and re-renders on the next tick.

#### The demo (`demo_worlds/narrascope/`)

`prelude.ts` defines the world state and the registries the other modules fill in as they load; `action.tsx` the verbs; `reflect/` the reflection mechanic and inner actions; `narrascope.tsx` the topics, the puzzle, and the world itself.

## Future plans

I would certainly like at some point to clean up all the code, add missing abstractions, perhaps release a proper "engine" independent of the game itself. However, the continued development and completion of Venience World, the game, is primary to me above other development goals.

As development of Venience World continues, I may not continue to release all the source code. This demo will always be around though. My hope is that anyone who is inspired and curious can learn something from it, create something, and give back to this medium in turn.

## Missing features

- Save/Load. The architecture of the game is such that implementation of save/load should be quite natural; the game only ever creates updated copies of its state, never modifying existing state. Additionally it already maintains a history of every past game state, as this has been useful for debugging. The missing feature here is serialization of the state and some interface for selecting save files.

- Undo. Architecture-wise, this should come naturally for the same reason as Save/Load (see above). However, Undo presents somewhat of a design/aesthetic challenge. Venience World already has "undo-like" game mechanics, triggered by in-game commands according to context. It would take power away from these mechanics to add a general-purpose "Undo" feature.

- Exporting transcripts. There's currently not a great way to copy the entire transcript of a playthrough as text and save it somewhere. Currently, selecting and copy-pasting the page yields a few formatting bugs.

- Many more, that are too intertwined with the core design principles of the game to be easily listed as "missing features".
