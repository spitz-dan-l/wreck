TODOs

Use exceptions instead of generators for parser -> no need for "function\*"
Don't rely on "this" at all
Allow no-arg closures to get used as sub-handlers (rather than explicitly requiring parser arg. it's a closure, it has it already)

- Do a better job stealing focus


- Taking the dev reins
    - The editor autocomplete/underlining can be a distracting/counterproductive
        - autocomplete for parser methods is generally good
        - for world state, not very good (shouldn't be "this", should just be explicit)
        - for per-om state, bad, requires type declarations
        - annoying to maintain separate list of OMIDs/PerceptionIDs, and error squigglies are really distracting in this case
            - the gain here is editor autocomplete for OM and Perception ID. worth it? workaround possible?
        - no transitions/handler/dest_oms should equal empty transitions, so no error.
    
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

- Dynamic text when transitioning OMs is awkward
    - OMs have an enter_text, but if anything special is going on when you enter an OM then enter_text gets ignored
    - possible fix: enter_text can be a function taking current OM state? (returns string)
        - This would blur the line between enter_text and handle_command... up til now have purposefully avoided for this reason. Encourages homogeneity in how command handlers are factored.
            - is the footgun worth it?
            - maximal flexibility approach: enter_text is literally a command-handler-like function. receives the (done, guaranteed-valid) parser, and the world, and the message up to this point.
                - feels intuitively clunky
            - intermediate flexibility approach: enter_text takes current om state as input, transitions take an optional om_state updater function which takes current om_state and returns destination om state.
                - would encourage factoring of, (set destination and update state in current OM), (generate result text in destination OM)

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

- "puffer" abstraction for stateful cross-om commands
    - e.g. "look", "tangle puzzle", generic begin/end interpretation
    - get bookkeeping by default - it gets its own local history index
    - OMs *are* puffers

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
    "Want to Visit" can indicate "You want to be able to do this, but you can't yet".
        Players have expressed confusion/stress when they think they have "lost the opportunity" to do a disabled thing, when really they just can't do it *yet*.


- When all consume options are disabled, still show them in the interface (?)

- save/load
    
- fix highlighting/copy-pasting/transcripting
    - get correct line breaks
    - ability to paste 

- add The End

- make erased loops collapse/expandable

