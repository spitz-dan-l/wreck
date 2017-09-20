TODOs

- drop everything and make a cool demo with narrative merit
    - ignore the problem of messy history logs
    - address the need to skim text with good writing
    
    - niney remake?

- Refactor world update stuff to use `this`
    - naturally support exceptions and error signals
    - keep track of intra-update state without polluting world object

- ~~enhance generator parser functions to support forking subprocessors with resolving ambiguity (yikes)~~ Electing not to do this because a) it's a lot of hard work for a relatively small convenience payoff (at least with the current use cases I've run into), and it would likely make some parser logic harder to reason about by being too "magical".

- Clarify ideas about compound/multistep scenarios w history erasure
