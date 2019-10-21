
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
        Could cause a similar sort of brittleness as refactoring update spec format- change a grouping and this logic breaks
    
    Switch to a constraint-based method of specifying story updates. So now you don't manually arrange your updates in a sequence of stages, instead you specify constraints about which updates must run before which other updates, and the system solves the timeline for you.
        Even this would have forms of the above problems- how would you specify what the prerequisite updates are for a given update?
        A: You wouldn't? You'd specify a necessary *state of the story*, not an explicit set of updates to have run.

