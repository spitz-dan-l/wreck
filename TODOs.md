TODOs
- Taking the dev reins
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

- When all consume options are disabled, still show them in the interface (?)

- punctuation in commands

- save/load
    
- fix highlighting/copy-pasting/transcripting
    - get correct line breaks
    - ability to paste 

- add The End

- make erased loops collapse/expandable

