# Critique 10: what a person sees (Phase B10, judged in the browser)

Round 6, browser critic. The author said: "animations and scrolling are confusing (scrolls to weird position); can't visually discern the effect of expanding and collapsing steps and story while in the middle of mapping." Phase B10 pinned the prompt, wrote one scroll rule and animated the folds; its scan (`round6/after/visibility_scan.md`) reports 14 / 25 failures out of 286, all the mild check (e). I played the whole acceptance script on both devices with the harness and looked at the screenshots, not at the scan's numbers.

How: `node scripts/browse_fire.js --acceptance` and `--phone --acceptance` (213 commands each); three deviation scripts started with `--skip` at the campfire (three steps placed, `--skip 30`), the house (`--skip 76`) and the wise man after apply (`--skip 172`), each running collapse/expand of the steps, the story, the unmapped and the chips, `remember the campfire story`, `set aside`/`resume`; two probes of my own that sampled the pinned panel's height every 50 ms during a command and typed partial `map` commands to look at the typeahead. Screenshots cited are under `round6/critic_shots/` (20 files; `EXPERIMENT_*` are from a patched scratch build, defect 1).

The short version: the prompt stays in view, the whooshes to nowhere are gone, the chip folds read well. But what a mapping player most needs to see, the badge landing on a story row and the rows unfolding, is still out of view in most of the moments the author complained about, on both devices; and on the phone every mid-mapping command makes the pinned steps panel balloon to twice its size and snap back. The rule is learnable ("the prompt stays at the bottom; the change appears above it if it fits"), but the cases where it does not fit are the cases the author was playing.

## Moment by moment

| moment | device | what a person sees | verdict |
|---|---|---|---|
| first `listen`s, `remember` | both | The lesson board and the reprints appear above the prompt; the view slides down a frame at a time. The chip barcode wraps to two lines on the phone. | good |
| `pick up the chalk` | both | The lesson board folds to a chip 1,000 px above (not seen); the campfire board opens with its first ¶ and the prompt beneath. | good |
| `speak as`, transcription | both | The cursor ¶ underlined, the prompt at it, the converted rows above. Every step lands where the eye is. | good |
| `draw a vertical line` | desktop | The column appears at the right, sticky; the prompt shows only `map`, the other options below the fold. Typing `map ` shows 2 of 8 steps; `map the laying of the tinder to ` 2 of 12 events (`desk_typeahead_map_cut.png`). | defect 4 |
| `draw a vertical line` | phone | The column grows below the story (5 of 8 steps in its 36vh band, scrollable), the prompt below; `map ` lists 8 steps, the event list 9 of 12 with the rest a scroll away. | good |
| `map` #1, #2 (every board) | desktop | The reference `→ the laying of the tinder in the pit` appears under step 1 in the column; the badge on the story row is 77–500 px above the top edge; the echo line is under the pinned prompt. "Where did it go?" (`desk_27_map_first_badge_above.png`) | defects 1, 2 |
| `map` #1–#5 | phone | The steps panel pinned at the top with the new reference, the ledger echo below; the badge is ~1,000 px above and never seen (`phone_27_map_no_badge.png`). | defects 1, 6 |
| `map` #3–#7 | desktop | The badge is in view (the rows are lower); the echo is 150–350 px below the pinned prompt. Fine once you know the echo hides there. | acceptable |
| every mid-mapping command | phone | For 700 ms the pinned panel grows from 320 to ~580 px, covering the ledger, then snaps back (`phone_campfire_32a_panel_balloons.png`). | defect 3 |
| wrong `map` + `erase`; `map` #8 | both | The reference vanishes / the last badge is scrolled to with the column pushed up so only its last steps show. Legible. | acceptable |
| `apply` | desktop | The view scrolls up 500 px: annotations on the rows, renditions in the column; rows 1–2 just above the top; the apply text under the prompt. The best moment of the mapping. | good |
| `apply`, `set aside`, `resume` | phone | Only the ledger text. No badge, no panel, nothing on screen changes (`phone_37_apply_text_only.png`). | defect 6 |
| `set aside` / `resume` | desktop | No scroll; the badges in view go dashed and back. | acceptable |
| `say all set`, `put down the chalk` (house, forest) | both | A whoosh up 1,000–3,300 px; the mid frame shows the board mid-fold; the chip, barcode and closing frame at the top, the prompt below. Big but legible. | good |
| `remember the campfire story` | both | The reprint slides in above the prompt; a long one moves the view by a screen. | good |
| `expand the campfire story` (root, cmd 46) | both | The mid frame shows the board's top opening — then a second motion slides 380–1,000 px further to the reopened board's *ledger tail* (old map commands, "say all set"); the response line is 1,500–1,800 px below (`desk_46_expand_campfire_story_lands_on_ledger.png`, `phone_46a_expand_campfire_story_mid.png`). | defect 5 |
| `expand the campfire story` mid-house / mid-wise-man | both | The prompt stays in the current ledger; "The campfire story unfolds." prints; nothing else changes; the board opened 6,600–13,500 px above (`desk_house_84_expand_campfire_story_mid_mapping.png`). | defect 5 |
| `collapse the steps` | desktop | The column shrinks to eight titles in place; the page also scrolls 360 px down for no reason the eye can find. | improvement |
| `collapse` / `expand the steps` | phone | The pinned panel visibly shrinks to eight titles and grows back to 36vh with five steps showing (`phone_campfire_32_expand_steps_settled.png`). The confirmation is under the prompt. | good |
| `expand the steps` | desktop | The page jumps up 360 px (1,580 px mid-house after `collapse the story`), the column unfolds, the typeahead is cut to two options, "The steps unfold." is 180–1,400 px below (`desk_campfire_32_expand_steps_options_cut.png`). | defect 7 |
| `collapse the story` | both | The ¶s vanish, the view moves 30–400 px, the response visible. The mid frame still shows the rows at full height. | good |
| `expand the story` | both | The view lands on the ledger with "The story unfolds."; every ¶ is 30–4,200 px above; the desktop mid frame shows the rows sliding away (`desk_campfire_34_expand_story_nothing_unfolds.png`, `_34a_`). Nothing unfolds on screen. | defect 1 |
| `collapse the unmapped` | desktop | The bar "▸ 10 events not in the mapping" at the top, the surviving rows *above* the top edge, the ledger below (`desk_88_collapse_unmapped_rows_above.png`). Mid-house with a short ledger it lands well. | defect 1 |
| `collapse the unmapped` | phone | JUMP −1,400 px; the bar, then the pinned panel, then the ledger; the two mapped rows are under the panel (`phone_campfire_35_collapse_unmapped_rows_hidden.png`). | defects 1, 6 |
| `expand the unmapped` | both | JUMP +1,200–3,600 px back to the ledger; "The unmapped rows unfold."; rows 1,900–4,400 px above (`phone_campfire_36_expand_unmapped_nothing.png`). | defect 1 |
| objections, `ask what she means`, `say Ok, I guess` | both | Dialogue prints above the prompt; readable. | good |
| `try the Pillaging` | both | Desktop: whoosh up 4,900 px, the Pillaging's steps as a narrow third column beside the Fire's, the house ledger below. Phone: whoosh up 9,600 px to the house ledger with the three steps pinned at the top. Abrupt, legible. | acceptable |
| `map the living in their home to the moving in` | both | Desktop: the badge 1,050 px above, the echo 1,020 px below, only `→ the moving in` in the second column. Phone: echo only. | defect 1 |
| `put down the chalk` after the Pillaging | both | A whoosh 4,600–7,200 px *down* to the end; the last visible line is the previous command's; the echo and response are nowhere (`phone_212_put_down_chalk_response_hidden.png`). "Did that take?" | defect 8 |
| the end | both | The three Pillaging steps print above the prompt. | good |

## Defects (ranked; must fix)

### 1. The prompt pins only inside the ledger, so nothing in the rows above can be shown with it

The pinned prompt is `position: sticky; bottom: 0` inside `.ledger`; a sticky box cannot leave its containing block, so the prompt pins only while the ledger's top is in view. `scroll_target_after` knows it (`s_min_for_prompt` is measured against `hole.parentElement`) and, whenever the change is more than a screen above the ledger, gives up and scrolls to the prompt. That is every ¶ in `expand the story`, every row in `expand the unmapped`, the rows that survive `collapse the unmapped`, the first two badges of every board, rows 1–2 of `apply`, and on the phone every badge and annotation (its ledger is taller). The scan passes these because "a node taller than half the view is in view when any of it is": the *board* is in view while the person sees nothing.

Reproduce: a JSON list of the acceptance script's first 30 commands followed by `collapse the story`, `expand the story`, `collapse the unmapped`, `expand the unmapped`, played with `node scripts/browse_fire.js [--phone] --skip 30 --script FILE --out DIR`; or in the browser, play to the third `map`, then `collapse the story`, `expand the story`. Shots: `desk_campfire_34_expand_story_nothing_unfolds.png`, `desk_27_map_first_badge_above.png`, `phone_campfire_36_expand_unmapped_nothing.png`, `desk_88_collapse_unmapped_rows_above.png`.

Change: let the prompt pin over the whole board. `dist/board.css`: `.board .ledger { display: contents; }` (the frames keep their styles; the ledger's 0.5em margin goes), so the hole's sticky containing block is `.board`; and in `scroll_target_after`: `const container = (hole.closest('.board') as HTMLElement | null) || hole.parentElement || hole;`. The notes' worry about floating over unconverted rows concerns transcription, where the hole is in `.left` after the cursor ¶ — unchanged; during mapping nothing is below the prompt but the ledger. I built this in a scratch copy and ran the campfire deviations: `expand the story` now scrolls to the first ¶ with the prompt pinned below and eleven ¶s unfolding in view on both devices (`EXPERIMENT_desk_expand_story_prompt_pins_over_board.png`); on the phone the first `map` shows the badge on `lay the tinder in the pit` at the top with the prompt pinned (`EXPERIMENT_phone_map_badge_visible.png`). `s_min_for_prompt` drops from 2558 to 1311 in the campfire, which is what frees the rule.

### 2. A change inside the pinned column steers the page instead of the column

With defect 1 fixed, the desktop `map` still left badge 1 171 px above the view. The engine's decision (`devtools.DEBUG`): `far = [reference @2136, badge @2432]` — the reference's *natural* top is the column's, the top of the board, so it is always the topmost change; `scroll_to_top_of(reference)` takes the "column fully in view" branch, puts the columns' bottom at the view's bottom, and the badge falls above. The column is sticky and visible at every scroll inside the columns; its own `overflow-y: auto` can bring the reference into it. It should never be why the page moves when another change is outside it.

Change (`scroll_target_after`): pick the lead among far changes outside pinned panels (`far.filter(e => sticky_panel_of(e) === null)`), falling back to `far[0]` only when all are inside one; and after the target is chosen, `reveal_in_panel` every changed element inside a sticky panel, not only `panel_reveal`. Verified in the same scratch build: the first campfire `map` on the desktop lands with `lay the tinder in the pit 1` at the top, the reference visible in the column, the prompt pinned (`EXPERIMENT_desk_map_badge_visible.png`).

### 3. Phone: the pinned steps panel balloons during every animation, then snaps back

`animate()` writes `style.maxHeight = scrollHeight` on *every* element of the story a frame after the animation starts, overriding `.columns .right { max-height: 36vh }`. Probe on the phone during `map the laying of the tinder…` (three steps placed): panel height 320 → 571 px from t≈450 ms, held until the 700 ms cleanup, then 320 px, its top jumping 178 → 187 px. The person sees the pinned panel swell to two-thirds of the screen over the ledger and drop back, on every command once the notation is expanded (the desktop gets it when the column exceeds 100vh, the wise man's). Shots: `phone_campfire_32a_panel_balloons.png` (560 px at 150 ms) against `phone_campfire_32_expand_steps_settled.png` (320 px).

Change (`animate`, both `walkElt` passes): never write an inline `max-height` on a node that scrolls on its own — skip `e` when `getComputedStyle(e).position === 'sticky'` or `e.matches('.columns .right')`, or cap the value at the computed `max-height` when it is not `none`. Skip `#story-hole` and the typeahead for the same reason.

### 4. Desktop: the `map` typeahead is below the fold while the ledger is short

After `draw a vertical line` the prompt is at y=756 of 800 with one option. Type `map ` and the list is 8 options in a 220 px box at 732–952 px: two visible; `map the laying of the tinder to ` gives 12 events, two visible (`desk_typeahead_map_cut.png`). The hole is sticky bottom:0 but its containing block, the ledger, is exactly one hole tall, so it cannot shift up as it grows. The phone (13em minimum, 24vh cap) is fine: 9 of 12 in view and scrollable (`phone_typeahead_map_events.png`). The 40vh desktop cap is never reached here.

Change: defect 1's change lets the hole pin up into the board, which should cure it; failing that, call `scroll_down()` when the typeahead grows past the view (`typeahead.tsx`), or reserve the space with `.board #story-hole { min-height: calc(40vh + 4em) }` on the desktop.

### 5. `expand the campfire story` shows the wrong thing, or nothing

At the root (cmd 46) the mid frame is right — the board's top opening — then a second motion slides the view to the reopened board's ledger tail, with "The campfire story unfolds." 1,500–1,800 px below. Mid-mapping the hole stays in the current ledger, the campfire opens 6,600–13,500 px above, and the only visible effect is one line of text; `collapse the campfire story` likewise. SPEC §8 says expand "moves the hole into that board's ledger so the reopened board is in view"; the second half does not hold even at the root. Shots: `desk_46_expand_campfire_story_lands_on_ledger.png`, `phone_46a_expand_campfire_story_mid.png`, `desk_house_84_expand_campfire_story_mid_mapping.png`.

Change: treat a board that reopens as the long response it is, read from its top with the prompt pinned below (possible after defect 1). In `scroll_target_after`, when a changed node is a `.board` losing `chip`, make it `near[0]` and take the `s_top` branch regardless of `fits`. Mid-mapping, either move the hole as SPEC says (and back on collapse) or have the consequence line say where the board is — not a bare "unfolds" with nothing on screen.

### 6. Phone: the story rows and the pinned steps are never on screen together, and the panel leaves once the ledger is long

On the phone `.right` follows `.left` in the flow, so the panel sticks to the top only once the story has scrolled *past* it: every row is above the view whenever the panel is pinned. And the panel's sticky range ends with `.columns`, so once the ledger is taller than the view minus the panel (five or six `map`s) the panel is pushed off: `apply`, `set aside`, `resume`, the late `map`s and the wise man's second solution show a bare ledger (`phone_37_apply_text_only.png`); `collapse the unmapped` puts the surviving rows under the panel (`phone_campfire_35_collapse_unmapped_rows_hidden.png`). The CSS comment "the steps pinned above the story while it scrolls" describes a layout the page does not have.

Change (board.css, the 700px block): `.columns .right { order: -1 }` so the steps come first and stick above the rows as they scroll; with defect 1's change the view can stop on a row with the prompt pinned and the panel above. The panel still leaves when the ledger alone fills the view; a 28vh panel once the prompt is pinned would leave more than the present band of under 300 px for the story.

### 7. Desktop `expand the steps` jumps the page, cuts the options and hides its own line

"A change inside the pinned column has the column fully in view" moves the page so the columns' bottom meets the view's: 360 px up in the campfire, 1,580 px mid-house after `collapse the story`; the typeahead is cut to two options and "The steps unfold." is 180–1,400 px below (`desk_campfire_32_expand_steps_options_cut.png`). The column was already in view. Change: when every far change is inside a pinned panel that is partly in view at `s_down`, keep `s_down` and reveal inside the panel (defect 2's rule without the fallback); move the page only when the panel is not in view at all.

### 8. `put down the chalk` after the Pillaging swallows its own response

The frame prints into the house's ledger; the chip then hides it (`.board.chip .ledger > .frame:not(.closing) { display: none }`) — the harness reports it `HIDDEN`. The page whooshes 4,600–7,200 px down and the last visible line is the previous command's (`phone_212_put_down_chalk_response_hidden.png`). Change: give that frame the `closing` class as `say all set`'s has (`story_ops`, the put-down-after-try path), or print it at the root.

## Improvements

- The mid-animation frame is rarely informative: at 150 ms a 300 ms `ease-in` fold has moved a few pixels (`desk_campfire_34a_expand_story_mid.png`). An `ease-out` of 350–400 ms would let a fold read as a fold; the badge fade-in is fine.
- `collapse the steps` on the desktop scrolls the page 360 px while the column shrinks in place: two motions for one change (same cause as defect 7).
- The command's own echo lands under the pinned prompt on most mapping commands. A person reads the prompt's shadow as "more below" and scrolls down, undoing the rule's work. Print the short mapping response as the prompt's own placeholder line, or leave 1.5 lines of ledger visible above the pinned prompt and have the rule account for it.
- The desktop column is pushed up by the columns' end whenever the ledger is in view, so its top steps are cut (`desk_46_…`). If the sticky range covered the board, the column would stay whole while the ledger is read.
- The chip barcode wraps on the phone (`3 2 1 4 5 / 6 7 8`): `white-space: nowrap` with smaller badges, or the barcode on its own line.
- Phone tap targets: options are 31 px tall (the platform floor is 44), `⟲ Undo` is a 14 px text link. `min-height: 3.4em` on options, padding on Undo.
- Two scroll motions on the phone after most commands (the tap moves the page, then the engine does): a visible hitch, harmless.
- No flash of unstyled content on either device.

## Verdict on the two complaints

"Scrolls to a weird position": mostly resolved. The prompt is on screen after every command on both devices; the whooshes to a chip 2,000 px away and the keystroke jumps are gone; `say all set`, `put down the chalk`, the reprints and the objections land where a person expects. Two weird positions remain — `expand the campfire story` settling on the reopened board's ledger tail (defect 5) and the desktop `expand the steps` jumping up and cutting the options (defect 7) — and one command goes nowhere visible (defect 8).

"Can't visually discern the effect of expanding and collapsing steps and story while in the middle of mapping": not resolved. The steps fold is now visible on both devices (a real gain, especially the phone panel shrinking and growing in place), and `collapse the story` / `collapse the unmapped` read. But `expand the story` and `expand the unmapped` show a line of text and nothing unfolding, on both devices, in every state I tried; the first two `map`s of every board put their badge just above the top edge on the desktop and 1,000 px above on the phone; and on the phone the mapping is a bare ledger by the sixth `map`. One structural change (defect 1, the prompt pinning over the board) with the lead rule (defect 2), both verified in a scratch build, turns most of this around; the phone also needs its column order changed (defect 6) and the panel ballooning stopped (defect 3) before a phone player will believe the board is a board.
