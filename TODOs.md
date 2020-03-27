
TODOs
Honestly just work on a badass puzzle right now. You are getting too caught up in SoftEng/efficiency details. The intuition that if you can just clean this all up it will make thinking about mechanics easier is wrong at this point. The overhaul from story strings to trees was all you needed, and that's done.

Update to this - the thinking part has been done to a satisfactory degree. We have the ideas of Voices, Abstract Phenomenology, mapping rules, and basic characters and storyline. Time to catch up on the tech side to actually support some of this.

Knowledge base abstraction to map arbitrary gists to arbitrary fragments of story
    current limitations:
        - can't represent an *empty* fragment which gets populated via *updates*, instead have to *ingest* the initial contents of the fragment directly.
        - update() and consolidate() are really cool, but will probably not work for all replace, remove, insert_after ops, or queries that involve path() or key() (though this latter part is not surprising)
            - the same semantics that apply to the root story node apply to each entry in the knowledgebase. So it is illegal at runtime to replace, remove or insert things after them.
        - during consolidation, updates are applied in a potentially different order than the stages would dictate - all of a child's stages are applied before starting on the parent.

Ops
    When we apply an update op, we don't always change the modified node's key. Would it be useful to always change the key?

How would-effects should work
    They shouldn't just be implicit. When you specify story updates you specify the would-effects at the same time as you specify the ops. So when compiling story updates you produce 2 things- the staged real effects, and the single-staged would-effects. The would-effect queries all need to be valid against world.story with no updates. They still need to be automatically reversible.

    Reversibility
    Reversibility should happen with no animation
    The key of the node affected by the forward change must be stored in order for it to be reversed.

Queries
    Most queries should have an option to specify how deep they go. The default is "all the way deep", and you can clean this up semantically by filtering the results but ideally you just prevent searching that deep, more optimal.

Updates to the UpdateBuilder api
    - query methods that take a subquery parameter should accept an UpdateBuilder instance (and internally call .to_query_spec())

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