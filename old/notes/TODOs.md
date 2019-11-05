TODOs

Priority

- don't drop the interp box if they did the whole thing right (?)
- Add the end to the puzzle
- Make more, single-action abstractions.
    - Noticing someone hurts
    - Doing the right thing for them
- Erase incorrect thingies during interp

- standardize order in which modules run
    - add a tag to puffers to have them locked automatically if they weeren't
    - generally figure out a logical way to do global-level setup annd structure

**********************************************

- Fixing up the initial interp puzzle
    - don't just lock all the commands but one
        - if the player tries to do one out of order, pop down an error/hint message
        - if the player repeats an already-correct one, flash it in the UI
            - Need to support flashing/animating an interp label without leaving it there
                - to be used multiple times in a row, not altering the display permanently

- Move interp classes down to apply only to output text (?)
- Investigate greensock for animations
    - Potentially remove the need for all the "adding-" "removing-" classes and the messy "animate()" function
        - Only if TweenLite can actually properly animate between display: none and display: block without hacking max-height.

Parser colors
    - ~ means darkened, not blocked (and collapsible)
    - Available, Used, Locked are the only token types (not just typeahead types)
        - Locked continues to behave as-is in the parser
        - Tokens have optional, arbitrary "labels"
            - takes the place of Keyword, Option, Filler
        - Styles use CSS classes rather than hard-coded styles
        - Typeahead is colorful, indicating the type of command
        - Color themes generally apply to whole commands, not just tokens




- "consider" is a generic command on par with "look"

- Refactor Terminal.tsx to be, uh, better

- "try to" as hinting command?
    - you can only "try to" things that you're not actually able to do yet?
    - doing so prints exposition about why it doesn't work yet

- then "judge" or "survey", or other poetic/contextual commands are *only* available during an interpretation...

- STILL MISSING: need a decision about the poetic/contextual commands that are part of a local
    -bit of exposition but not necessarily an "interpretation"
    - e.g. "sequence of numbers" is your favorite
    

- UI back up to parity
    DONE 1. Make a static world/history viewer app
      - no interactivity, just displays previous commands and the resulting messages
      - shows parser highlighting
    DONE 2. Add interpretation restyling to the static viewer
    DONE 3. Add input prompt
      - Highlights tokens as the user types
      - Submission of command triggers rerender, new history element
    DONE 4. Support view update due to new interpreatation
    DONE 5. Typeahead added to prompt
      - Autoocomplete options display with correct indentation
      - Select typeahead option with keybooard, mouse
    DONE 6. Support "locked" typeahead options
    DONE 7. animations
        - new command submission
        - new interps
        - new possible interps
        - Should be cleaned up
            - Consider whether interp labels should optionally have animation functions associated with them
                - for transitioning between interp states
                - for ambient animation while a state is active
                - would likely be cleaner than BookGuy, which tries to please everyone
- reachability test
    - Given a world, walk every possible text input via typeahead options
        - Verify that, for every option, it results in a submittable command
        - No exceptions are thrown for any inputs
    - Extend this to auto-explore a world?
- eslint, reachability test as lint rule


- Do a better job stealing focus

- THEME: OM description language
    - Use JSX to write game text
        - But in this case, probably don't actually use React:
            - https://www.typescriptlang.org/docs/handbook/jsx.html

    - "puffer" abstraction for stateful cross-om commands
        - e.g. "look", "tangle puzzle", generic begin/end interpretation
        - get bookkeeping by default - it gets its own local history index
        - OMs *are* puffers
    
    - Dynamic text when transitioning OMs is awkward
        - OMs have an enter_text, but if anything special is going on when you enter an OM then enter_text gets ignored
        - possible fix: enter_text can be a function taking current OM state? (returns string)
            - This would blur the line between enter_text and handle_command... up til now have purposefully avoided for this reason. Encourages homogeneity in how command handlers are factored.
                - is the footgun worth it?
                - maximal flexibility approach: enter_text is literally a command-handler-like function. receives the (done, guaranteed-valid) parser, and the world, and the message up to this point.
                    - feels intuitively clunky
                - intermediate flexibility approach: enter_text takes current om state as input, transitions take an optional om_state updater function which takes current om_state and returns destination om state.
                    - would encourage factoring of, (set destination and update state in current OM), (generate result text in destination OM)

- THEME: Taking the dev reins (Editing/Building/Testing experience)
    - types or lib property in tsconfig
        - to eliminate irrelevant types for the project
            - using a subproject could help with this
        - lib: controls what baked-in types are provided
        
    - Set up building for commandline (useful for tests, debugging)
        - To build for cmd, run tsc to emit as commonjs
        - Look into using subprojects
    - Set up linter
        - add a lint rule for reachability of OMs
    - The editor autocomplete/underlining can be a distracting/counterproductive
        - autocomplete for parser methods is generally good
        - for world state, not very good (shouldn't be "this", should just be explicit)
        - for per-om state, bad, requires type declarations
        - annoying to maintain separate list of OMIDs/PerceptionIDs, and error squigglies are really distracting in this case
            - the gain here is editor autocomplete for OM and Perception ID. worth it? workaround possible?
        - no transitions/handler/dest_oms should equal empty transitions, so no error.
        - Look at adding a linter with custom rules for some of these
    
    - The boilerplate for writing a command handler is too much (wrap_handler, explicit parser argument in every subhandler, explicitly passing "this" to subhandlers)
    
    - Settle on global policy for string constants vs Enums
        - Attempt to improve editor autocomplete to make this very easy
    - Run various validation/game logic tests immediately after compiling
        - Reachability/completeness of OMs
        - Puffer flows
    - Add runtime exceptions so we can test for them
        - Not calling .done() on parser but returning a command result anyway
    - Add situational test flows
        - E.g. a start game state, a sequence of player commands, assertions about where the state winds up. Runs post-compile.

    - Consider removing a level of genericness on the command-logic types and functions
        - Any game project only has one world, meaning we *could* define all the generic CommandResult<T> etc. as *non-generic* types in terms of the concrete world type for this project.
            - Would simplify our types by quite a bit
            - Would put ObserverMoments, Perceptions, etc. on the same level of fundamentality as Worlds
            - Should produce a script that prepopulates a new project with stuff if we do this

- Major parser cleanup
    - Unify consuming an option and multiple parser paths
        - python prototype of this underway in python/parser.py
        - move logic to add a space after a completed token out of react and into core parser
        - The goal of this is to expunge all the lingering parser bugs:
            - sometimes typing the first invalid keystroke gets swallowed
            - consume_declarative_dsl fails when only 1 or 2 tokens total (?)

    - consume_declarative_dsl bugs out when used to implement make_look_consumer().

    - consume_option becomes primary means of direct interaction with parser
        - consume_exact becomes private
        - consume_filler disappears
        - name just becomes "consume()"
    - consume_declarative_dsl becomes primary means of higher-level interaction with parser

    - if possible, identify a cleaner system for representing intermediate parser state and matches

    - improve the api around annotating with DisplayEltType and enabled.
        - legal to pass a single option to consume() without wrapping in list
        - ways to annotate enabled/display per-option, or same for all options
        - Change DisplayEltType form enum to string?

    - punctuation in commands


- Endorsed form of bookkeeping: each world state knows its index in history.

- Appropriate loop erasure
    - Per-om optional callback returns whether two world states on the same om are "same" or "different".
        ("Same" would imply "do perform loop erasure")

- begin/end interpretation helpers

- add "carriage return" option in typeahead?
- add "delete most recent token" option in typeahead

- repeated tabs should cycle thru current token/phrase option

- Proposal: "Disabled" has cousins "Visited", and "Want to Visit"
    Visited can to indicate "You could enter this command, but it would be unnecessary or break flow".
        After the player has already examined something, it could become Visited rather than Disabled
            Meaning they could examine it again, and get the same response, but it's a reminder that they've already done that
            and that they can trust the result won't be different this time.
        (Another feature idea: instead of reprint the same description, could flash an overlaying window of it while the visited command is entered)
        This could completely subsume loop erasure/history deletion (or complement it)
    "Want to Visit" can indicate "You want to be able to do this, but you can't yet".
        Players have expressed confusion/stress when they think they have "lost the opportunity" to do a disabled thing, when really they just can't do it *yet*.

    And an extension to "Want to Visit": "Will Visit"
        A command will float below the game screen (possibly accessible via scroll down), indicating to the player, "you *will* do this", but it remains a mystery how/when.
        Once the player reaches the point where they are entering that command, it will glide up to their prompt and merge with it.


- When all consume options are disabled, still show them in the interface (?)

- save/load
    
- fix highlighting/copy-pasting/transcripting
    - get correct line breaks
    - ability to paste 

- add The End

- make erased loops collapse/expandable


### collectively organizing/orchestrating/scheduling story updates/animations

Situation: You are doing an action which, in this order:

- Reveals the command you just typed (Frame t=0)
- expands the text of a paragraph in t=-2
- adds text to t=0

Currently.

The input text for a given command is a child of the frame for that command. So adding the input text requires adding the empty frame.

The animation ordering is determined by Stages.
By default all story update effects get added to stage 0, and then you have the option to add to stages before or after that depending.

It is easy to just add some new updates to a new stage to the left of the earliest one. It is cumbersome/finicky to move updates between stages.
    How would you specify moving an update from one stage to another.
    - find it by its position in the list of updates for that stage
        - then the logic is brittle because another change which altered the order beforehand could break this logic
    - find it by the structure of the update spec
        - then the logic is brittle because the update spec format can be adjusted/refactored to accomplish the same thing, but now the rule for finding the right update/series of updates will have broken

Proposals
    Assign names/identities to (groups of) updates. Then move the updates between stages by group key
        Could cause a similar sort of brittleness as refactoring update spec format- change a grouping and this logic breaks. However, in practice this could probably work.
    
    Switch to a constraint-based method of specifying story updates. So now you don't manually arrange your updates in a sequence of stages, instead you specify constraints about which updates must run before which other updates, and the system solves the timeline for you.
        Even this would have forms of the above problems- how would you specify what the prerequisite updates are for a given update?
        A: You wouldn't? You'd specify a necessary *state of the story*, not an explicit set of updates to have run.

