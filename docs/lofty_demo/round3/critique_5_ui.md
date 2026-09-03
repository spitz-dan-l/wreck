# Critique 5 (round 3) — the board as a UI

**Critic:** round-3 UI critic. **Standard:** the .md's own words (l. 146–152, 248, 309–311, 350, 419), SPEC §8 and §12.
**Method:** `npm run build-dev:fire`, then my own Playwright driver (scratchpad `drive_r3.js`, reusing the serve/unlock logic of `scripts/screenshot_fire.js`) played the acceptance script with insertions — a wrong `map`, an `erase`, `expand the steps`, `expand`/`collapse the campfire story`, the forest's `speak as the Voice of Fire` trap, partial typing to open the typeahead, two 700px viewports — for 80 viewport screenshots, 5 close-ups at 2× (`zoom_r3.js`) and one DOM probe (`probe_r3.js`). All 191 commands accepted; **zero console errors, warnings or page errors**; no horizontal overflow at 1400 or 700px; the last line present. Shots are in `docs/lofty_demo/round3/shots/`.

**Caveat for every screenshot, the five existing ones included:** `prompt.css` sets `font-family: 'Roboto Mono'` with no fallback and the driver answers the Google Fonts request with an empty stylesheet, so Chromium rendered everything in its default serif (DejaVu Serif). Badge widths and the mono alignment of `> command` lines will differ in the real font; nothing below depends on it, but D9 follows from it.

## 1. Screenshot table

| Path (`round3/shots/`) | State | Verdict |
|---|---|---|
| `00_opening.png` | Opening line, empty prompt, two options | OK. |
| `01_beat0_shelf.png` | After `look at the board` (the shelf, The Pillaging) | OK; Undo floats 1300px from the prompt (I11). |
| `02_beat0_statements.png` | First `listen`: the lesson board, eight coloured chalk lines | Good — first sight of the palette. |
| `03_beat0_notation.png` | Second `listen`: "She rewrites this in the standard notation…" | **D1: nothing is rewritten; board unchanged.** |
| `03b_beat0_expand_steps_attempt.png` | `expand the steps` refused | D1 (only `collapse the steps` is offered). |
| `03c_beat0_typeahead_exp.png` | Partial "exp": red error-match | Word-highlighting works (l. 148). |
| `04_beat0_after_third_listen.png` | Campfire story told; `remember the Voice of Fire` ×2 above | Both replays are chalk-only: D1 again (D7 of B3 not met). |
| `05_campfire_chalk_picked.png` | Board opened, ¶1 bright, rest dim, prompt in `.left` | Good — the prompt is physically at the cursor row. |
| `06_campfire_speak_as_friends.png` | First `speak as`: "— the friends —", no bar yet | OK (bar hidden until l. 350, by design). |
| `07_campfire_first_event.png` | First event under ¶1; prompt moved to ¶2 | Good. |
| `08_campfire_mid_transcription_typeahead.png` | Partial "touch", remainder piece underlined | Good; the underlined remainder is the best idea on the board. |
| `08b_…_typeahead_empty.png` | Empty prompt inside `.left`, typeahead static | OK; typeahead pushes the ¶s down rather than overlaying them. |
| `09_campfire_let_it_follow.png` | `↳` ¶ + `let it follow` frame | The followed sentence prints twice (I6). |
| `10_campfire_line_drawn_top.png` | `draw a vertical line`: rule + right column appear | Reads as "a vertical line, creating a second column" (l. 309). |
| `10b_campfire_line_drawn_hole.png` | Prompt now in the ledger under both columns | Good. |
| `10c_campfire_steps_expanded.png` | `expand the steps` refused, `collapse the steps` accepted | D1: notation invisible either way. |
| `11_campfire_wrong_map_nudge.png` | L4 nudge "The tinder is the first thing to catch. Nothing here catches." in the ledger | Works; nudge visually identical to a success frame (I8). |
| `12_campfire_first_map.png` | Held badge `[1]` (outlined) on `lay the tinder`, "→ …" reference under step 1 | Good: side by side, numbered both ends. |
| `13_campfire_after_erase.png` | Badge and reference gone; ledger frame has no consequence | Works; silent (I8). |
| `14_campfire_map_typeahead.png` | Typeahead of 12 event names under "map the spreading of the ember to the" | Autocomplete works; sticky right column still visible. |
| `15_campfire_applied_top.png` | Applied: solid badges, annotations, the Fire's rendition in the right column | The .md's board. |
| `15b_campfire_applied_ledger.png` | Same rendition again as the apply frame's text | Duplicate on one screen (I5). |
| `16_campfire_set_aside.png` / `16b` | Hollow badges, dim references, `.spoken` gone | Correct; hollow at α 0.3 is faint (D6). |
| `17_campfire_resumed.png` | Back to solid | OK. |
| `18_campfire_chip.png` | Chip: title + barcode 1–8, Katya's reply beneath | Legible. |
| `19_remember_sequence.png` | `remember the campfire story` | Plain replay with orange role annotations; fine. |
| `20_remember_role.png` | `remember the tinder` | One line; fine. |
| `21_remember_event.png` | `remember the touching of the flame…` | Fine. |
| `22_campfire_reopened.png` | `expand the campfire story` reopens the board | **D3: reopens 2,300px above the prompt.** |
| `22b_campfire_reopened_bottom.png` | The viewport at the prompt after that command | Nothing visible changed. |
| `22c_campfire_recollapsed.png` | `collapse the campfire story` | Silent; nothing visible. |
| `23_house_opened.png` | House board opened | OK. |
| `24_house_pause_hole.png` | l. 348–350 inside `.left`; carat "THE FAMILY >" | Good: the pause sits between ¶8 and ¶9, as the .md wants. |
| `24b_house_pause_board_top.png` | Bars appear retroactively: THE FAMILY above `pack`; YOU marks on every non-event frame | Bar: good. YOU: D4. |
| `25_house_children_bar.png` | THE CHILDREN bar, carat "THE CHILDREN >" directly beneath | Redundant label pair (I4). |
| `25b_house_children_carat_typeahead.png` | Partial "li" with the voice carat | Good. |
| `26_house_follow_frames.png` | Four `let it follow` frames each with a YOU rule | Four rows per one sentence (D4, I6). |
| `27_house_line_drawn.png` | House line drawn; YOU marks on every ledger frame | D4. |
| `28_house_first_map.png` | Held `[1]` on `lay walls and a roof` | OK. |
| `29_house_before_apply_bottom.png` | Eight ledger frames with YOU rules | D4 at its worst. |
| `30_house_applied.png` / `30b` | Applied; `scatter` carries 5 6 7 8 | Legible; "— the blaze — the blaze" (I9). |
| `31_house_set_aside.png` | Hollow | D6. |
| `32_house_second_apply.png` / `32b` | 3, 2, 1 on foundation/frame/walls | Good — the badges out of numeric order say what happened. |
| `33_house_chip.png` | Chip barcode "3 2 1 4 5 6 7 8" | Legible; order unexplained (I10). |
| `34_forest_seed_dashed.png` | Dashed bar THE SEED; carat "THE SEED >" | l. 419 distinct: yes. |
| `35_forest_season_double.png` | Double bar THE SEASON | Distinct from dashed and solid. |
| `36_forest_voices.png` | Six bars in three styles down one column | Distinct, but every bar spans 1,330px (I3). |
| `37_forest_voice_of_fire_trap.png` | Trap frame under THE FIRE with its nudge | Works. |
| `38_forest_applied.png` / `38b` | Applied forest | Good. |
| `39_wise_transcribed_top.png` / `39b` | Wise man transcribed, twelve switches | ~40% of the column is switch furniture (D4). |
| `40_wise_two_lines.png` | "Indeed. So, write it out" | OK. |
| `41_wise_first_solution.png` / `41b` | 1 2 3 on the pyre, 4–8 on lighting it | Legible. |
| `42_wise_first_set_aside_hollow.png` | Hollow 1–8, references dimmed | D6. |
| `43_wise_both_solutions_top.png` / `43b` / `43c` | Both solutions: two references per step, one dim | Legible at a glance; passes unlabelled (I7). |
| `44_wise_collapsed_unmapped.png` | `collapse the unmapped` | **D2: orphan bars and `speak as` frames stacked with nothing under them.** |
| `44n_narrow_wise_collapsed.png` | 700px, both columns kept | Usable; right column ~250px wraps hard. |
| `44n2_narrow_wise_hole.png` | 700px, prompt in ledger | Usable. |
| `45_objections.png` | Three objections + l. 479 | OK. |
| `46_locked_say_that_you_see_it.png` | Partial "say": "that you see it" dimmed & selected, "Ok, I guess" | **D5: no lock glyph visible.** |
| `46b_locked_say_that.png` | Partial "say that": red error-match, empty typeahead | Correct engine behaviour for Locked. |
| `47_the_end.png` / `47b` | l. 481, coda line, prompt still inside the ledger | Coda reads as a footnote (I12). |
| `48_remember_ok_i_guess.png` | Nested frame replay with its own YOU rule | OK. |
| `49_remember_classroom_event.png` | `remember the second listening` | OK. |
| `50_top_of_page_end.png` | Top of the transcript at the end | YOU rules on every root frame back to `look at the board` (D4); lesson chip is a bare title (I13). |
| `50b_lesson_chip_end.png` / `50c` / `50d` | The four chips in place | Chips legible; house/forest barcodes in story order. |
| `51n_narrow_top_end.png` … `51n4` | 700px: top, campfire chip, wise man board, prompt | All usable, no overflow. |
| `z1_chip_barcode_2x.png` | 2× chip | Fine. |
| `z2_forest_bars_2x.png` | 2× dashed/double bars + YOU rules | Bars fine; YOU rule looks like a fourth bar style (D4). |
| `z3_wise_right_set_aside_2x.png` | 2× right column, both passes dim | Hollow state legible at 2×, faint at 1×. |
| `z4_wise_both_2x.png` | 2× both columns, both solutions | The best single image of the demo. |
| `z5_locked_typeahead_2x.png` | 2× Locked option | D5 confirmed: `<span class="token lock"> ⃠</span>` renders blank. |

## 2. Defects, ranked

**D1 — The standard notation is never shown (l. 176, SPEC §8 `.notation`, B3 D7).** State: `03_beat0_notation`, `04`, `10c`, every right column. What you see: Katya "rewrites this in the standard notation of the field:" and the board does not change; `remember the Voice of Fire` after the second `listen` prints chalk only; no board's right column ever shows `> lay the tinder / A small patch of tinder…`. Cause (probe): `board.tsx: step_node` always emits `class="notation collapsed"` and `index.ts` initialises `collapsed: []`, so the DOM says folded while the world says expanded; `display.tsx` therefore offers only `collapse the steps` (which changes nothing visible) and `expand the steps` only after that. `sequence_passage` reuses `step_node`, so the `remember` replay is folded too. Fix: in `step_node` emit `'notation' + (notation_absent ? ' absent' : '')` (drop `collapsed`), and if the notation should start folded on boards, add `'steps'` to the initial `collapsed` in `index.ts` so `expand the steps` is offered; `sequence_passage` must never fold (it is a replay).

**D2 — `collapse the unmapped` leaves headless voice runs.** State: `44_wise_collapsed_unmapped` (also the existing `4_wise_man_both_solutions.png`). You see THE MAN / YOU `> speak as the followers` / THE FOLLOWERS / YOU `> speak as the man` / THE MAN with no line under any of them. `board.css` hides only `.frame.event:not(.mapped)` and `.prose:not(.mapped)`; bars and `speak as` frames are neither. Fix in `unmapped_ops`: mark each `.voice-bar` whose run holds no mapped event with a class `empty` (the run's frames are known when the class list is computed in `mapping.tsx`), plus its `speak as` frame; CSS `.board.unmapped-collapsed .left .voice-bar.empty, .board.unmapped-collapsed .left .frame.speak-as.empty { display: none; }`. Until then a blunt CSS fallback is `.board.unmapped-collapsed .left .frame:not(.event) { display: none; }` (keeps the bars, drops the switches).

**D3 — `expand <chip>` gives no visible result.** State: `22_campfire_reopened` vs `22b`. The board reopens at its chronological position, 2,300px above the prompt; the viewport at the prompt shows only the echoed command. The .md's whole point of chips is to "expand and collapse chunks of text you don't care about at the moment" (l. 152); an expand you cannot see fails that. Fix (world-level, uses an existing mechanism): on `expand <sequence>` move the hole into that board's ledger (`S.story_hole().remove()` + `at(ledger_gist(seq)).add(<Hole/>)`), so `scroll_down` brings the reopened board into view and the prompt sits under it, exactly as during mapping; `collapse` moves it back to the root. Cheaper: `chip_ops` toggles a class and `scroll_down` is unchanged, but then nothing is in view — not acceptable.

**D4 — The YOU mark is drawn everywhere, not on the board.** State: `24b`, `27`, `29`, `39`, `50`, `z2`. Once `voices-taught` is set, every non-event frame in the whole transcript — root dialogue back to `look at the board`, every `map` in the ledger, every `let it follow`, every `remember` — grows a rule plus "YOU". In the wise man that is 12 switch blocks of five rows each (¶, YOU, `> speak as`, `— the man —`, bar, name). The .md's notation (l. 350) is one bar with a name above a run of lines; the YOU rule is an invention, and because it is a rule it reads as a fourth bar style next to solid/dashed/double. The ledger is entirely "you" and does not need saying. Fix: scope the rule to the board's column only — replace `.story.voices-taught .frame.you > .input-text::before` with `.story.voices-taught .board .left > .frame.you > .input-text::before`, and even there drop it from `let it follow` frames (`.frame.you.follows`), leaving it only on `speak as` and the trap. Better still, fold the switch into the bar: hide the `speak as` frame's `— the man —` line once taught (`.story.voices-taught .left .frame.speak-as .output-text { display: none }`; needs a `speak-as` class on that frame).

**D5 — The Locked glyph is invisible.** State: `46`, `z5`. The Locked option is `<span class="token lock"> ⃠</span>` — U+20E0 (combining enclosing circle backslash) on a space; in the rendered page it is blank, so "that you see it" only looks dimmed, indistinguishable from `used`. SPEC §9 promises "Locked". Fix in CSS (engine untouched): `.typeahead .option.locked .token.lock { font-size: 0 } .typeahead .option.locked .token.lock::after { content: ' ⊘'; font-size: 12px; --alpha-color: 0.6 }` (U+2298 is a spacing glyph present in DejaVu and Roboto Mono). Verify with the real font before closing.

**D6 — Hollow badges and set-aside references are too faint.** State: `16`, `31`, `42`, `43b`. `.badge.hollow { --alpha-color: 0.3; border-color: rgba(var(--step-rgb), 0.3) }` and `.reference.hollow { --alpha-color: 0.3 }` on black. The ending's board (l. 479, "both levels") depends on the set-aside solution still reading; at 1× the numbers 1–3 on the pyre are barely there. Fix: α 0.55 for the number, 0.45 for the border, and dashed border to keep it distinct from `held`: `.badge.hollow { --alpha-color: 0.55; border: 1px dashed rgba(var(--step-rgb), 0.45) } .step .reference.hollow { --alpha-color: 0.5 }`.

**D7 — `erase`, `set aside`, `resume` and every `expand`/`collapse` print nothing.** State: `13`, `16b`, `22c`. With the board off-screen the player gets no confirmation. Fix: a one-line consequence each ("The steps fold." / "The mapping is set aside; the badges hollow."), or at least a `▸`/`↺` mark on the ledger frame via a CSS class.

**D8 — The static typeahead shoves the column.** State: `08b` vs `08`. Inside a board `ul.typeahead` is `position: static`, so the unconverted ¶s — the very text the player is reading — move down by up to five rows every time the option list changes. Fix: reserve the space, `.board #story-hole { min-height: 9em }`.

**D9 — No fallback font.** `#terminal { font-family: 'Roboto Mono' }` with nothing after it. Offline, or before the web font arrives, the board is set in the browser's default serif (every screenshot in this repo). Fix: `font-family: 'Roboto Mono', 'DejaVu Sans Mono', Menlo, Consolas, monospace;` in `prompt.css` (engine file, but a one-token change) or override in `board.css`.

## 3. Judgements against the .md

- **Side by side as it is built (l. 152):** yes. Each `map` puts a numbered, coloured badge on the event's row and a "→ event name" reference under the step, at once, and the sticky right column keeps both ends in view while the ledger grows (`12`, `14`, `28`). Missing is the drawn line of l. 311 — the correspondence is read by matching numbers, not followed by eye; §12's first deferred item, rightly.
- **Colours mark the chunks (l. 152):** yes — badge fill, row band, step border and chalk text all carry one of the eight step colours, and the straw→tan→bark→orange→red→crimson→grey ramp reads as fuel/spark/burn/ash without a legend. The 3px band on the row's left edge is nearly invisible for straw and tan on black; the badge does the work.
- **Expand and collapse (l. 152):** the mechanisms exist (steps, story, event, unmapped, chips) but two of them are broken or misleading (D1, D2) and one is invisible (D3). Half-marks.
- **Voice switch as visual notation (l. 350):** yes — a bar across the column with the name above the run is what Katya describes; it appears retroactively at l. 350 and the carat repeats the voice in the same style, so the board and the prompt share one notation. The YOU rule dilutes it (D4).
- **Disembodied/abstract distinct (l. 419):** yes — dashed and double are unmistakable next to solid (`36`, `z2`), and the engine never colours voices, keeping colour for the chunks.
- **A column on the left, a vertical line, a second column (l. 248, 309–311):** yes, literally: the rule and the right column appear on `draw a vertical line`, the left column reflows to 60% at that moment. Readable as the .md's board.
- **Engine affordances (l. 148):** word-highlighting, autocomplete, animated text (the driver waits on the animation lock each command) and expansion from earlier entries (`remember`, chips) all survive inside the board.
- **Prompt always in view:** whenever the prompt is the thing the player just acted on, yes (every hole-targeted shot has it in view); D3 is the exception.
- **Overlap/clip/invisible/misaligned:** nothing overlaps or clips (DOM audit: no text overflow on badges, bars, chalk, titles); the invisible things are D1, D5 and the faint D6.
- **700px:** usable — two columns kept, no horizontal scroll, prompt reachable; the right column's chalk titles wrap to two lines and `.spoken` paragraphs to five, so it is cramped rather than broken.
- **YOU bar above every `speak as` in the wise man:** clutter, not notation (D4).
- **Ledger as the mapping's log:** yes — under the columns, one frame per command, nudges inline, the apply text at the end; it reads as the record of the afternoon the coda names. It is undifferentiated, though (I8).
- **Ending's board legible at a glance:** yes for the applied solution (solid badges, bright references, rendition); the set-aside one is legible only on inspection (D6), and the two passes are not labelled (I7).

## 4. Improvements, cheapest first

1. **Short bars.** Katya says "She draws a short bar across the column"; the bars run the full 1,330px (`36`). `.story.voices-taught .voice-bar { width: max-content; min-width: 14em; padding-right: 3em; }` makes them bars, not rules, and separates them from the board's own top/bottom rules.
2. **Right column no wider than its text.** `.columns .right { flex: 0 1 34em }` so the left column keeps prose width at 1400px and the right reads as a list rather than a panel.
3. **Reserve the typeahead's height** (D8) — one declaration.
4. **Fold the speak-as furniture:** hide `— the x —` once taught (D4), drop the YOU rule outside the column. Removes ~30% of the wise man's column height.
5. **Followed lines once, not twice** (I6): the `↳ ¶` prose row and the `let it follow` frame's consequence are the same sentence. `.board .left .frame.follows .output-text { display: none }` (frame needs a `follows` class) keeps the ¶ row as the line and the frame as the log.
6. **Label the passes** (I7): under a step with two references, prefix them — `.reference.pass-first::before { content: 'first  ' } .reference.pass-second::before { content: 'second ' }` in the step's colour at α 0.6 — so "set aside the first solution" has a visible referent.
7. **Distinguish nudges from successes in the ledger** (I8): `.ledger .frame.nudge .output-text { --rgb-color: 255, 215, 0; --alpha-color: 0.85; font-style: italic }` (a class the judge already knows it is emitting).
8. **Don't print the rendition twice** (I5): the apply frame's text rendition and `.spoken` show the same eight lines side by side on one screen (`15b`). Either fold the ledger copy by default (`.ledger .rendition_text.collapsed`) or keep only the one-sentence apply prose in the ledger.
9. **De-duplicate annotations** (I9): `scatter` shows "— the blaze — the blaze" (steps 6 and 7 both derive "the blaze"); collapse equal adjacent role names or show "the blaze ×2".
10. **Chip barcode order** (I10): the house chip's "3 2 1 4 5 6 7 8" is the mapping in story order, which is informative but reads as a bug next to the campfire's 1–8. Add `title="steps in the order they fall in the story"` on `.barcode`, or a faint "→" before the barcode.
11. **Undo near the prompt** (I11): `.undo-button { float: none; display: inline-block; margin-left: 2em; --alpha-color: 0.5 }`.
12. **The coda as a board line** (I12): give `.coda` the board's rule (`border-top: 1px solid rgba(255,255,240,0.5); padding-top: 1em`) and move the hole to the root on `say Ok, I guess`; the ledger has nothing more to log.
13. **Lesson chip with a strip** (I13): the beat-0 chip is a bare title (`50b`); a barcode of eight empty step-coloured badges makes it the Voice, rolled up on the shelf.
14. **Lighter carat label** (I4): `--alpha-color: 0.5` on the carat's voice name, which repeats the bar directly above it.
15. **Narrow:** below 900px, `.step .spoken { display: none }` and `.right { font-size: 0.9em }`.
16. **Lines** (§12): an SVG overlay from `.badge.step-N` to its `.reference` via `getBoundingClientRect` is contained work; until then `.board:has(.badge.step-4:hover) .step-4 .reference { background: rgba(var(--step-rgb), .15) }` gives hover linkage with no JS and no world state.

## 5. Latency

Measured at the wise man's mapping state (after `say that the Voice of Fire is contained in just two lines`, 15 options in the list, the largest board on the page, ~11,700px of transcript above): 36 keystrokes typed at 120 ms intervals with a `MutationObserver` on `#terminal` and a double-`requestAnimationFrame` after each mutation.

- keydown → first DOM mutation of the typeahead: **min 15.9 ms, median 25.4 ms, p90 35.6 ms, max 45.2 ms**
- keydown → next paint after that mutation: **min 34.8 ms, median 43.3 ms, p90 51.0 ms, max 56.5 ms**

Two to three frames per keystroke in headless Chromium with no GPU; no keystroke was dropped or merged. Acceptable, but the whole transcript is re-diffed on each keystroke, so the number will grow with the page; if a fifth story were added it should be re-measured.

## 6. Verdict

The board is the .md's board: two columns, a rule drawn on command, the Voice's steps in their colours on the right, numbered badges on the events on the left, bars across the column for voices in three styles, and a ledger beneath that records the afternoon. Seen in `z4_wise_both_2x.png` it is legible at a glance and it is not a terminal. The engine's affordances survive inside it, nothing overlaps or clips, 700px works, and the page produces no errors across 191 commands.

It is not yet shippable as the demo of the UI claim, for three reasons that are each an hour's work: the notation Katya rewrites never appears (D1); `collapse the unmapped` — the command that produces the ending's "two lines" view — leaves a stack of empty voice bars (D2); and `expand <chip>` does something the player cannot see (D3). Behind those, the YOU rule on every frame (D4) is the one design choice that works against the .md, and the invisible Locked glyph (D5) and faint hollow badges (D6) weaken the two moments — l. 479 and the ending board — that the wise man exists for. Fix D1–D6, take the first five improvements, and this passes.
