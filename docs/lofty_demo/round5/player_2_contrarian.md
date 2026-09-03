# Contrarian Playthrough Log - Player 2

## Numbered Surprises

1. **expand the steps after remember Voice of Fire (twice)** - Steps 5-9
   - Expected: expand command would continue to work
   - Happened: "!!! command not accepted" error returned
   - Confusion: 2/5 - unclear why expand stopped being valid

2. **remember the tinder before creating tinder** - Step 11
   - Expected: might fail or show memory
   - Happened: "Nothing has been the tinder yet"
   - Confusion: 1/5 - clear, elements don't exist until created

3. **remember the flame/ash/ember before creation** - Steps 11-12
   - Expected: might fail or show nothing
   - Happened: "Nothing has been the X yet" for all
   - Confusion: 1/5 - consistent with tinder behavior

4. **recall the first and second listening identically** - Steps 12, 14
   - Expected: second listening would show new content
   - Happened: both returned exact same text "It felt like nothing in particular"
   - Confusion: 3/5 - text identical despite doing things between them

5. **expand the steps after collapsing** - Step 19
   - Expected: steps would unfold
   - Happened: "The steps unfold" - worked fine
   - Confusion: 1/5 - collapse and expand are reversible

6. **second path: collapse the steps, still remember Voice of Fire** - Step 9, path 2
   - Expected: collapsing might erase memory
   - Happened: Voice of Fire remembered perfectly after collapse
   - Confusion: 1/5 - collapse only affects display, not memory

7. **"spread to the kindling" rejected** - Step 60, path 2
   - Expected: fire spreads to kindling
   - Happened: "The friends do not command the fire, my dear"
   - Confusion: 4/5 - narrator voice warns that players can't direct fire? Odd constraint

8. **"let it follow" skips narrative ahead** - Step 43, path 1
   - Expected: normal narrative progression
   - Happened: output shows "↳ The fire starts, spreading first to the kindling and then the logs"
   - Confusion: 2/5 - arrow notation suggests skipping, but unclear what was actually skipped

9. **"remember the sleeping in tents" shows "It felt like nothing yet. It has not been read"** - Step 80, path 1
   - Expected: memory of sleeping action
   - Happened: new phrase "It has not been read" appeared
   - Confusion: 3/5 - "has not been read" is new phrasing, unclear meaning

10. **collapse commands create new collapse options** - Throughout
    - Expected: collapse removes options
    - Happened: each action gets "collapse the X" option, expanding available commands
    - Confusion: 2/5 - counterintuitive that collapsing adds commands

11. **"lie in tents" vs "sleep in tents"** - Path 2 vs Path 1
    - Expected: same command in both paths
    - Happened: Path 1 shows "sleep in tents", Path 2 shows "sleep in tents" (same)
    - Confusion: 1/5 - no actual difference found

12. **Multiple "listen" commands in sequence** - Path 2
    - Expected: could listen multiple times
    - Happened: third listen was rejected with "!!! command not accepted"
    - Confusion: 3/5 - unclear rule on listen repetition

13. **Different narrative text after third listen** - Path 1, step 15
    - Expected: might repeat first listen content
    - Happened: "She rewrites this in the standard notation of the field" - new content
    - Confusion: 1/5 - third listen added dimension to lesson

14. **"remember the lighting of a match" shows action** - Path 1, step 40
    - Expected: would show memory
    - Happened: shows the match command and description
    - Confusion: 1/5 - works as expected

15. **"spread to the kindling" allowed in path 1, rejected in path 2** - Paths differ
    - Expected: same command availability
    - Happened: Path 1 doesn't show attempt (used "let it follow" first), Path 2 rejects it
    - Confusion: 2/5 - appears timing/state-dependent

## Stuck Moments

- When "expand the steps" failed, I wasn't sure if I had broken the game or if it was intentional
- Unclear why "The friends do not command the fire" - tried to understand what this rule meant
- Multiple identical "remember the listening" outputs made me wonder if time/state was tracked correctly
- Wasn't sure if collapsing things was permanent or temporary

## Things That Seemed Broken

- Repeating the same remember command twice giving identical output despite actions between them
- "expand the steps" rejection without clear error message or explanation
- "The friends do not command the fire" error with no guidance on what IS allowed
- "It has not been read" phrase appearing late in playthrough with no context

## Things That Were Good

- Clear narrative progression through the fire-building sequence
- Collapse/expand mechanics creating a branching memory system
- "let it follow" provided an interesting shortcut through narrative
- Multiple lessons (Voice of Fire vs The Pillaging) offered genuine choice
- Visual affordance with "↳" symbol made skipping clear
- Each action generating memorable text descriptions
- Contrarian play was rewarded with new content paths

