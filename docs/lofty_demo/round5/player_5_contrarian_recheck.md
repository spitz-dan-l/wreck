# Player 5 - Contrarian Playthrough Log

## Surprises & Confusions

1. **Steps 1-6: "Remember X" refuses to work for materials not yet created**
   - Commands: `listen`, `listen`, `collapse the steps`, `remember the laying of the tinder`, `remember the tinder`
   - Expected: After laying tinder, "remember the tinder" would recall it
   - Happened: "Nothing has been the tinder yet" even after `remember the laying of the tinder` showed tinder being placed
   - Confusion: 4/5 - This contradictory behavior suggests "tinder" (material) and "laying of the tinder" (action) are tracked separately, which is confusing

2. **Steps 7-9: "Remember the blaze" command rejected**
   - Commands: `listen`, `remember the Voice of Fire`, `remember the spreading of the flame`, `remember the blaze`
   - Expected: "blaze" appears in remember list so should work
   - Happened: Command not accepted, but "remember the Voice of Fire" worked fine
   - Confusion: 3/5 - Why is blaze in the list but rejected?

3. **Steps 18-22: Command word order matters strictly**
   - Commands: `gather tinder, kindling and firewood`, but `add more logs` doesn't work while `add logs to the fire` does
   - Expected: Similar phrasing should work
   - Happened: Minor variations cause rejection with "command not accepted"
   - Confusion: 2/5 - Not surprising for parser, but inconsistent phrasing in command list

4. **Steps 23-24: "sing an old song" rejected but "sing" works**
   - Commands: `sing an old song` (rejected), then `sing` (accepted)
   - Expected: Full command phrase from initial narrative should work
   - Happened: Had to use shortened form
   - Confusion: 2/5 - Parser is pickier than narrative suggests

5. **Step 27: "let it follow" reveals folded narrative via arrow symbol**
   - Commands: After touching flame, `let it follow`
   - Expected: Would advance fire normally
   - Happened: Shows "↳ The fire starts..." with arrow notation, suggesting branching/recursion
   - Confusion: 2/5 - Novel notation choice for auto-play

6. **Step 33: Draw vertical line unlocks massive "map" command generation**
   - Commands: `draw a vertical line` after fire narrative completes
   - Expected: Would draw something
   - Happened: Entire mapping interface appears with 100+ permutations of fire steps + story actions
   - Confusion: 3/5 - Felt like hidden complexity explosion, game suddenly demands mapping everything

7. **Step 34: Mapping reports materials "not on board" despite narrative placement**
   - Commands: `map the laying of the tinder to the traveling to the woods`, `apply the Voice of Fire`
   - Expected: Would apply narrative to board
   - Happened: "The laying of the tinder is not on the board" plus long list of Unplaced elements
   - Confusion: 4/5 - Game distinguishes between narrative sequences and board placement state in non-obvious way

8. **Step 38-39: Pillaging narrative doesn't unlock new mechanics like Fire does**
   - Commands: `look at the board`, `remember the Pillaging` (x3), `listen` (x3)
   - Expected: Multiple repeat + listening would unlock new commands like Fire narrative does
   - Happened: Fire narrative unlocks camping story, chalk picking, board drawing. Pillaging just repeats.
   - Confusion: 3/5 - Two narratives have asymmetric depth

9. **Step 40: "Remember the ash" still says nothing despite burning to completion**
   - Commands: After full fire sequence including `reduce to ash`, try `remember the ash`
   - Expected: Material would be tracked
   - Happened: "Nothing has been the ash yet"
   - Confusion: 5/5 - This is the same bug/design as surprise #1, suggests systematic inconsistency in state tracking

## Stuck Moments

- **After drawing vertical line**: Faced 100+ map commands with no clear instruction. Tried one mapping but didn't know if it was correct or had any effect beyond narrative flavor text.
- **After apply the Voice of Fire failed**: Report of "Unplaced" elements gave no clear path to place them. No new commands appeared to help.
- **Pillaging branch**: Seemed like a dead-end after repeating 2-3 times. No progression like Fire narrative showed.
- **Memory-material distinction**: Kept trying atomic material names (tinder, ember, flame, ash) expecting they'd work after fire sequences. Consistently failed, creating confusion about game state.

## Things That Seemed Broken

1. Material state vs. narrative action state - "remember the tinder" vs "remember the laying of the tinder" are tracked completely independently in confusing ways
2. "Remember the ash" fails even after explicit ash creation sequence
3. "Remember the blaze" in command list but command rejected when used
4. Mapping interface appears with no clear instructions or success feedback

## Things That Were Good

1. **Layered narrative depth**: Listening multiple times progressively reveals fuller stories and more commands - elegant pacing
2. **Collapsible/expandable steps**: The collapse/expand toggle was intuitive and felt like a real mechanic
3. **Contrarian affordances**: The game's permissiveness with multiple pathways encouraged experimental play
4. **Rich prose**: Story text was engaging and vivid throughout (camping fire, pillaging home)
5. **Mapping mechanic creativity**: Even if confusing, the idea of mapping fire-building steps to story actions was novel

## Paths & Depth Reached

### Path 1 - Fire Narrative Arc (50+ steps)
- Listened 3 times → campfire story unlocked
- Spoke as friends → travel to woods
- Physical sequence: gathered, dug pit, laid materials, lit fire, sang, added logs
- Board drawing: unlocked mapping interface with 100+ combinations
- Final: Applied Voice of Fire but hit "not on board" wall

### Path 2 - Pillaging Branch (10 steps)
- Looked at board → found Pillaging lesson
- Remembered Pillaging → narrative about breaking into home and taking things
- Tried repeating: just cycles through same sequence
- Dead end: no progression, no new mechanics unlock unlike Fire path

### Path 3 - Material Recall Experiments (15+ steps)
- Tested atomic material names (tinder, kindling, firewood, ember, flame, ash) after sequences
- All rejected with "Nothing has been X yet" despite narrative showing their creation
- Confused game state tracking for mechanical vs. narrative elements

