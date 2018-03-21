import * as React from 'react';

const preface = (props) => (
  <div>
    Welcome to Venience World!

    <p>
    Venience World uses a new parser interface with command highlighting, animated text and autocomplete.

    Use tab, the arrow keys or the mouse to select autocompletions of your commands as you play.

    I hope you enjoy using it!
    </p>
    <p>
    Venience World is designed to make all content accessible in a single playthrough.

    This means you will <i>never be expected</i> to reset the game and repeat yourself in order to explore a missed branch.

    Have faith in this as you play through the game.
    </p>

    <p>
    Venience World has been tested to work on the Chrome and Firefox browsers.

    It definitely doesn't work on Safari.

    I haven't tested it on IE/Edge, Opera, or others.
    </p>

    <p>
    This is a playable demo with a prologue and first chapter.
    Most of what you see will be subject to change for the final release.
    I'm not sure when the final release will be.
    </p>

    <p>
    Venience World is open source.

    The project can be found at https://github.com/spitz-dan-l/wreck/.

    It is written in Typescript.

    If you are interested in learning how it works, or using or extending the interface, please reach out!

    If there is sufficient interest I may spend some time on refactoring the code into a proper engine.
    </p>

    <p>
    The name "Venience World" is a play on "<a href="https://plato.stanford.edu/entries/supervenience/">Supervenience</a>", and the trope for games to have names of the form "Super <i>X</i> World".
    
    The game is thematically about seeking an understanding about what is going on. Supervenience as a concept describes one of the philosophical tools that has been developed for doing that.
    </p>

    <p>
    Thoughts on parser game design.

    There are a few different ways I can imagine autocomplete might be added to a parser game.

    Which autocompletion options do you choose to show the player? How do you prioritize them?

    Ideally you only show options which would produce valid commands if entered. However, the notion of a "valid" command in a parser game is actually fluid. There are many types of "error" that can happen in response to a command. Roughly, one can break down error categories like this:

    1. The command is pure noise to the parser; no leads on what the player may have been intending.
    2. Form of the command is apparent, but one or more words within render it invalid. Inference cannot bridge the gap. E.g. "go" without a direction.
    3. We successfully parse the command, but the particular (possibly inferred) nouns or keywords used are illegal in the current context. For instance, the player is attempting to drink a glass of water with "drink water", but the glass of water is in a different room.
    4. The command is successfully parsed, and it is valid in the world model, but it does not produce the desired outcome in the context of the game and its goals. For instance, "open door" might be met with, "It's locked."

    Importantly, some of these "errors" can be expositive.


    

    The addition of command highlighting and autocomplete to a parser game interface drastically alters the nature of play.

    In the case of Venience World

    The experience of not knowing how to construct the correct command for a given situation is basically eliminated.

    This is not necessarily a strictly good or bad thing.
    There is a whimsy in the process of trying out different words and phrases as one learns the norms and limits of a particular parser game.
    In Venience World there is no opportunity for that particular kind of whimsy.
    However, on the other side of the coin, there is no opportunity for getting stuck and frustrated, not knowing what to say or do next.
    And historically this issue has contributed to parser games being relegated to niche circles of "expert" players.

    Another effect of the new interface on play is a less-cluttered scrollback history, due to so many fewer error messages.
    This creates opportunities for tighter control on the part of the author over the flow, rhythm and mood of the game narrative as it progresses.

    (Suddenly, it is safe to use pronouns like "it" at the starts of descriptions, and within commands!)

    A cleaner scrollback history also has implications on the role of scrollback history in the game mechanics.

    In the same way that we can have confidence that the pronoun "it" will refer to a particular noun in a recent history paragraph,
    we can use animations to apply "markups", or "interpretations" to recent history elements.

    The possibilities here are quite large. In Venience World, a core game mechanic is the interpretation of aphorisms, and it would
    have been impossible to achieve without these interface changes.
    </p>

  </div>
)