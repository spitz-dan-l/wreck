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
    </p>

    <p>
    Venience World has been tested to work on the Chrome and Firefox browsers. It definitely doesn't work on Safari. I haven't tested it on IE/Edge, Opera, or others.
    </p>

    <p>
    This is a playable demo with a prologue and first chapter.
    Most of what you see will be subject to change for the final release.
    I'm not sure when the final release will be.
    </p>

    <p>
    Venience World is completely open source.
    The project can be found at https://github.com/spitz-dan-l/wreck/.

    If you are interested in learning how it works, or using or extending the interface, please reach out!

    If there is sufficient interest I may spend some time on refactoring the code into a proper engine.
    </p>

    <p>
    The addition of command highlighting and autocomplete to a parser game interface drastically alters the nature of play.

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