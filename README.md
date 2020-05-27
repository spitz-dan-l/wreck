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

You need npm and a node version >= 12.17.0. (I did `sudo npm install -g n` and then did `sudo n lts`.)

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

The game is mostly original code. The only "framework-like" dependency is [TypeStyle](https://github.com/typestyle/typestyle), for programattically managing CSS. Earlier in its development I used React for UI, but that has been replaced by a hand-rolled library, which is similar in some ways to React but more minimal and targetted. Everything else is a collection of original, focused modules which together make the game.


The code organization quality, broken down by topic:

#### Story Structure

This is a text-based, narrative-focused game, and as such an important structure within the code is the story itself. The game has its own Story tree structure, which is designed with three purposes in mind:

 - **Easy translation to HTML.**
 The Story structure is a particular flavor of a Virtual Dom, and is used by the UI side to render what the player sees. Because the Story structure is a near-direct layer over an HTML DOM, it supports arbitrary formatting, styling and layout. It uses TSX to mimic HTML syntax almost exactly.
 
 Currently it does not seem worthwhile at all to design an alternative tree structure for Stories over "plain HTML + CSS", though that day may come, if a truly clean abstraction barrier can be found. For now, I don't know well enough what sorts of style rules and html structures I'll be using across the whole game, so it seems least cumbersome to just express what I want directly as (virtual) HTML+CSS.

 - **Easy to specify animated changes, and ordered sequences of changes.**
 This is a text game, and the text changes smoothly and dynamically as the player types and enters commands. The text can be changed, colored, highlighted, outlined, and otherwise styled to emphasize things or convey meanings.
 
 It is important that when these styling effects are applied, it happens in an orderly fashion, so that the player is not overwhelmed or confused by the changes on screen. If a passage of text would be editted, this change must be *visually telegraphed* for the player, so that their attention is drawn to the text before the edit happens, and it happens smoothly. Specifying these updates, and sequencing and timing them, needs to be easy to do for the game author.

 To address this, the game has a data structure and set of composition operators for specifying, combining and sequencing updates to the story tree.

 - **Easy to index, query and transform according to *narrative-level* properties.**
 Nodes in the Story tree can have a special kind of attribute, a `gist`. The `gist` is its own data structure which represents, in brief, what that node of story is "about", with respect to the game's narrative. Gists are themselves composable data structures, so they can represent arbitrarily specific and complex ideas. For instance, if a node of story contains a text passage describing *the player character's doubt about their previously-held beliefs about another character's motivations*, this can be represented with a `gist`. Roughly, it might look like:

```typescript
['my doubts', {subject:
    ['my beliefs', {subject:
        ['motivations', {subject:
            ['Sam']
        }]
    }]
}]
```

The above gist structure, set to the relevant story node, allows for a variety of affordances to the game author:
 - Easy translation from gists to plain-english summaries of the story.
 - Indexing the story structure by narrative-level concepts, and querying and updating of pieces of story that match a given set of constraints.

 This creates possibilities for the game to refer to very specific aspects of its own narrative. In traditional written fiction, this happens ubiquitously, often without the reader even noticing. In an interactive story, it is difficult to really open up the story in this way to interrogation without the right data structures to represent the story with an eye towards its *meaning*.

 **Limitations**
 Right now each Story node can only have one Gist assigned to it. In reality, we may look back on the same passage of text and consider it from a variety of different contexts, not just one. It may be useful to add the capacity for story nodes to carry multiple gists, and potentially have some additional representation of the particular context/perspective from which a given gist applies to the story node. However, I haven't reached a point in the game's development where this wasn't solved by "wrapping" the same story node in two or more different "perspective-shifting" nodes, with different gists on the wrappers to represent the different perspectives.

 I *think* the most-general form of this construct would involve multiple "parsers" of whole story trees, one parser for each "context/perspective". A given "perspective" would parse a whole story tree, and restructure or reassign gists to its nodes. The perspectives would be isomorphic, providing the ability to translate between perspectives losslessly. Some "hidden variables" would likely have to be included in order to recover all the information.


#### UI

A minimal UI engine is supplied for translating Story trees into DOM nodes. It is inspired by React and other reactive-type UI frameworks, with some important differences.

1. Components mutate their part of the DOM directly according to updates in the props they are passed. They are not required to use a virtual DOM representation at all, although many *do*, by receiving Story trees in their props and calling the provided library function to convert them to DOM trees when they run.

2. 

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
