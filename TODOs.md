
TODOs
Honestly just work on a badass puzzle right now. You are getting too caught up in SoftEng/efficiency details. The intuition that if you can just clean this all up it will make thinking about mechanics easier is wrong at this point. The overhaul from story strings to trees was all you needed, and that's done.



Revealing new text logic
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

Certain static resources- GistSpecs, StoryQuerySpecs, are shared across worlds when running multiple worlds in a single VM. There are collisions.
    -Dedupe these?
        (But it's annoying. Maybe just only run one world per VM, and find ways to test this more easily.)

optimizations
- try using itiriri instead of array map/filter
- story trees
    - hold onto a map of keys to [node, Path] at the root of each story tree
        Faster to do find_node
- parser
    - Avoid repeat walks by cloning the parser at each split
        If the repeat bits are slow, or cause a lot of gc, this could help
        Might have to ban variable reassignments to outer scopes from inside parser threads... hard to enforce
            But maybe not a huge deal, or lintable