
TODOs

Finish porting narrascope demo to new story tree repr
    Counts as done when it works without would-animation stuff
        At that point we have design decisions to make

    Eliminate nested class rule approach to revealing text. Instead actually add new nodes to story tree dynamically

Animations
    -Don't prevent the ability to enter text/otherwise interact
    -Animation state gains a "started" property (so each stage only gets started once), and somehow gets the ability to be "cancelled", skipping through to the end of the last stage
    - *all* story ops become reversible
        - (And therefore, usable in would-effects)
        - not necessarily animated in reverse, but this would allow more flexible "would-X" displays

Style/display
    - Use TypedStyle everywhere (unless it doesn't work)
    - Abstract over the --alpha-color, --rgb-color, color: rules things

optimizations
- try using itiriri instead of array map/filter
- story trees
    - find a way to avoid even building the full tree each frame
        - would only really help in future search
        - This probably isn't doable for any game that actually uses the contents of the story tree for game mechanics
    - hold onto a map of keys to [node, Path] at the root of each story tree
        Faster to do find_node
- parser
    - Avoid repeat walks by cloning the parser at each split
        If the repeat bits are slow, or cause a lot of gc, this could help
        Might have to ban variable reassignments to outer scopes from inside parser threads... hard to enforce
            But maybe not a huge deal, or lintable