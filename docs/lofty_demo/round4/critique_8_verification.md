# Critique 8 (round 4) — verification of the B5b build

**Critic:** round-4 verification. **Build verified:** `4a5d180` (B5b), with `f50c6cb` (B5a) beneath it. Because another session was editing `src/typescript/demo_worlds/fire/` while this review ran, every result below comes from a pristine extraction of `4a5d180` (`git archive`) compiled and bundled in the scratchpad, not from the working tree; `npm test` in the tree at the start: **59 passing, 1 pending**. HEAD advanced to `3be4302` (B6a, the round-4 code review) while this review ran; those commits are outside it, and `dist/fire.js` was left as the production build of HEAD (`npm run build:fire`, tree clean).

**Method.** Read `puzzle_lofty.md` twice, SPEC v1.3, the notes, and the defect/improvement sections of C4–C7. Headless: a probe harness over the compiled build that replays any prefix of `round2/acceptance_script.json` ("prefix N" = its first N commands), applies my own commands, prints the typeahead with availability (so Locked lines are visible headlessly), and after any command checks the board against the world: one badge and one reference per placement of every mapping, keyed by mapping id, `solid`/`hollow` matching `applied`/`set aside`; annotations, renditions and knowledge annotations present iff applied; `mapped` and `band-n` classes equal to the placements; chip, `unmapped-collapsed` and notation classes equal to `collapsed`; the unmapped bar's count; exactly one hole, in the ledger while mapping, in the column while transcribing, at the root between boards. The acceptance script replays byte-identical to `round2/transcript_b5b_headless.txt` (202 commands, none refused). Two scripts did the textual audits: one classifies every transcript line by its licence, one walks l. 160–481 sentence by sentence against the page. Browser: `npm run build-dev:fire` on the pristine tree and a Playwright driver that plays the script with insertions, snapshots the DOM after every command (a class census, the hole's enclosing gist, the history's text), clicks the **Undo** button at fourteen points requiring the page after undo to equal the pre-command snapshot and after redo the original, and takes the ten screenshots under `round4/shots/`. Console errors and warnings: **none**. No horizontal overflow at 1400px; the font stack falls back to DejaVu Sans Mono; the last line is present.

The short version: every item from the three earlier rounds is fixed, three of them differently in ways I accept. Fresh play found no crash, no dead end, no console error, no unlicensed sentence, no missing sentence, no Katya line between her lines, and no page inconsistency after undo. It found three defects, one of which matters: in the figurative pass the six near-miss fuel placements still get the literal "Wood, my dear... only two lines burn" nudge, which is the one beat where the nudge must point the other way.

---

## 1. Regression table

Status: **fixed** / **fixed differently (accepted)** / **not fixed**. Proof is a command sequence on the probe, a screenshot under `round4/shots/`, a transcript line (`t.N` = `transcript_b5b_headless.txt`), or a code location in `4a5d180`.

### Critique 4 (round 2 play, B1)

| # | Status | Proof |
|---|---|---|
| D1 follows-¶ attachment | fixed | prefix 25: the match → l. 282 only, the second singing → l. 300 only, the touching carries l. 288; prefix 73: the rag its own line, the scattering ¶10–13. |
| D2 change of mind after apply | fixed | prefix 83, `set aside the mapping` → eight `erase`, `apply`, `resume`, 104 `map`; re-map and `apply` re-lights; same in the campfire (38) and forest (131). |
| D3 l. 350b, l. 419b | fixed | both sentences after their speeches (`08_forest_bars.png`). |
| D4 objections only under the second solution | fixed | prefix 189, set aside the second, move the spark, `resume the first solution`: `object` → `[Locked] that the fireplace is too abstract`. |
| D5 "It went like this:" | fixed | every `remember` in the probe output. |
| D6 forest speech keyed to the seed | fixed | prefix 101: `speak as the fire` → "No line here for the fire, my dear. Who acts?"; the seed brings the speech; the season at ¶1 refused. |
| D7 notation before l. 182 | fixed | `listen`, `remember the Voice of Fire` → chalk only (t.4–12; test). |
| D8 coda outside the last frame | fixed | `remember the saying of Ok, I guess` ends with l. 481 then the feeling; `.coda` its own node (`09`). |
| D9 l. 465 after the rendition | fixed | `06_second_pass_wood_nudge.png`, top. |
| I1 grouped rendition | fixed | forest apply: s1/s2 under e7 once; s5/s6 under e9 once (probe). |
| I2 one feeling line | fixed | `remember the adjusting of his words` → "It felt like the ember, and the flame, in the Voice of Fire." |
| I3 "a patch of tinder" | fixed | `remember the tinder` → "a patch of tinder, in the campfire story". |
| I4 `put down the chalk` | fixed | prefix 98/133; "the second putting down of the chalk" rememberable. |
| I5 `↳` on follow | fixed | prefix 19, `let it follow` → "↳ The fire starts…" (`03_house_gate_locked.png`). |
| I6 quotation marks | fixed | `02_locked_say_that_you_see_it.png`. |
| I7 L1 names the hole | fixed | "The Voice of Fire does not skip, my dear. The laying of the kindling is not on the board." |
| I8 wrong-voice nudge | fixed | above (D6). |
| I9 mark quoted | fixed | `"His death. Very well. Hold that," says Katya.` |
| I10 spelling recorded | fixed | notes, B3 I10. |

### Critique 5 (round 3 UI)

| # | Status | Proof |
|---|---|---|
| D1 notation never shown | fixed | `listen` → typeahead `expand the steps` (not `collapse`); `expand the steps` → "The steps unfold."; consistency check: notation class agrees with `collapsed` on every board; `remember` reprint never folded (board test). |
| D2 headless voice runs under `collapse the unmapped` | fixed | `rows_ops` marks bars and `speak as` frames `empty` from `voice_runs`; `01_end_both_solutions.png` shows runs only where a mapped row is. |
| D3 `expand <chip>` invisible | fixed differently, accepted with a caveat | `04_expand_campfire_after_chip.png`: the prompt sits under the reopened board. The fix is conditional on no board being open, and the wise man's board never closes, so at the end it does not apply — my D3 below. |
| D4 YOU rule everywhere | fixed | one YOU bar at the head (`teach_voices_ops`), YOU marks only on `speak as` and trap frames in a column (`08_forest_bars.png`, `03`); nothing on the ledger, follows or root frames. |
| D5 Locked glyph | fixed | `02_locked_say_that_you_see_it.png`, `03_house_gate_locked.png`: "⊘" after the dimmed option. |
| D6 hollow too faint | fixed | `01_end_both_solutions.png`: the dashed 1 2 3 on the pyre and 4–8 on the lighting are legible at 1×. |
| D7 silent display commands | fixed | "The steps unfold.", "The campfire story folds.", "The laying of the tinder is erased.", "The mapping is set aside; the badges hollow.", "The first solution is resumed; the badges solid." |
| D8 typeahead shoves the column | fixed | `board.css:118`; `07_campfire_remainder_typeahead.png`. |
| D9 no fallback font | fixed | `dist/global.css:6`; computed `fontFamily` in the browser run. |
| 1–10, 13–16 | fixed | 1 short bars (`08`); 2 right column `flex: 0 1 34em` (`board.css:49`, `01`); 3 = D8; 4 `.voice-mark` hidden once taught, no "— the seed —" in `08`; 5 the "↳" row is the line, the `let it follow` frame has no text (`03`); 6 FIRST/SECOND (`01`, `05`); 7 nudges gold italic (`06`); 8 `.ledger .spoken-text` hidden, the apply frame shows the sentence only (`04`); 9 done in B4 (`03`: "— the flame — the blaze — the ash"); 10 `board.css:73`; 13 `lesson_strip_node`; 14 `board.css:307`; 15 `board.css:339` (700px not exercised this round); 16 in CSS (`235–245`), not exercised. |
| 11, 12 | not done, by instruction | |

### Critique 6 (round 3 play, B3)

| # | Status | Proof |
|---|---|---|
| D-1 third pass on setting aside the second | fixed | prefix 189, `set aside the second solution` → the second reopens with its eight placements; `map`/`erase`/`apply`/both `resume`s offered; L7 prunes e9/e11 only; the spark moves to the death with the mark; `apply` re-lights it and objection 3 reads "the death, not the myth". |
| D-2 resuming the first discards the second's work | fixed, with a display defect | prefix 181 (three held), `resume the first solution` → the second is `set aside` with its three placements; `set aside the first solution` → `open` again with them; five more `map`s and `apply` print l. 471. The badges of the interval are wrong (my D2). |
| D-3 plural voices | fixed | "No line here for the family, my dear. Who acts?" |
| D-4 re-apply reprints the apply text | fixed | house second apply (prefix 94) prints the rendition alone; `resume` prints one line and the rendition. |
| D-5 second-pass nudges at the wrong level | fixed differently — **incompletely** | The eight figurative nudges are in (`WISE_MAN.step_nudges.second`) and fire: tinder→e3 "Not wood this time…", spark→e10 "What set it going…", burn→e6 "Where did it burn longest…". But the authored `fuel_nudges` are consulted first and still fire in the second pass on six rows — my D1. |
| D-6 unlicensed bar label | fixed by licence | SPEC §10 now lists it. |
| D-7 mark before l. 350 | fixed | prefix 10, `speak as the friends` prints nothing. |
| D-8 "Who acts?" at follow rows | fixed | prefix 68, `speak as the family` → "No one speaks here, my dear. Let it follow." |
| I-1 campfire participants | fixed | "the match's flame, in the campfire story". |
| I-2 set-aside readings kept | fixed | `remember the firewood` after the forest re-map → "…the trees, in the forest fire, set aside; the forest, in the forest fire." |
| I-3 `say Ok, I guess` whichever is lit | fixed | walkthrough test "lets Ok, I guess be said whichever solution is lit". |
| I-4 flat Pillaging | fixed | "You enter their home." |
| I-5 road not taken | fixed | t.721: "because the tinder was the thatch, and before that the oil-soaked rag". |
| I-6 objections shown Locked | fixed | above (C4 D4). |
| §7 the house requires the change of mind | fixed | prefix 83: `object` → `[Locked] that there is no clear tinder` (`03_house_gate_locked.png`); prefix 94 (thatch applied): `[Available]`; played with the rag/frame/foundation + lit-rag spark first, then thatch/frame/foundation + e12, then rag/thatch/frame + e12: the gate opens only after the second tinder. |

### Critique 7 (round 3 code)

| # | Status | Proof |
|---|---|---|
| D1 gists keyed by pass | fixed | `badge_gist(seq, event, step, id)` etc.; the D-1 sequence leaves every reference in place (consistency clean). |
| D2 duplicate annotations | fixed | `03`, and `remember the scattering` agrees with the row. |
| D3 bands never removed | fixed | prefix 27, `erase the laying of the tinder` → no `band-1` on e4; bands derived in `rows_ops`. |
| D4 remainder underline persists | fixed | CSS scoped to `.prose.cursor`, class cleared in `advance_cursor_ops`; `07` vs `04`. |
| D5 `expand the steps` unsayable first | fixed | above (C5 D1). |
| D6 stale unmapped count | fixed | the consistency check compares the bar to the mappings after every map; clean. |
| D7 "has no line" | fixed | rewording. |
| D8 `role_name('their home')` | fixed | `names.ts: role_name` regex. |
| D9 latent traps | fixed | `with_ordinal` falls back to "11th"; `l1_nudge`; `participants` reads its own rows; `reopened` gone. |
| S1–S9 | done | grep: no `frame_voices`, `remainder` field, `said`, `ended` field, `reopened`, `scene`, `STEP_INDICES`, `PASSES`, `finished_stories`, `exact_gist`, `band-x`; `phase()` derived; `SCRIPT` an ordered list over `BEAT`; one `group_by_event`; `EVENT_NAMES` at load; `lint_events`/`lint_prose`/`lint_tables`. S10 left, declared. |
| Extensibility | done | the judge takes `Sequence` (13 signatures); `Mapping.voice` read everywhere; `map_after`/`set_aside_after` are story data; `LESSON_VOICE` the one named constant. |
| Tests | done | 963 → 1217 lines; `expect` frame-scoped, `expect_tree` board-scoped; one `it` per beat; the vacuous asserts gone; the new cases the notes list are present. |

---

## 2. Fresh adversarial play

**Dead ends and crashes.** None. Every state I reached had an advancing command; no exception headlessly or in the page; no console error or warning across 202 script commands, 10 insertions and 28 undo/redo steps.

**Board vs world.** The consistency check passed at every probed state — the script's end, every campfire/house/forest set-aside and re-map, the wise man's every set-aside/resume order — except one: after `resume the first solution` while the second pass is open with held placements, the world marks the second `set aside` but its badges keep `held` (D2, `05_held_among_hollow.png`).

**Locked vs Available.** `object that there is no clear tinder`: Locked after the rag apply and while the thatch mapping is open, Available once the thatch has been applied, and still Available after re-applying the rag (the history counts). The objections: Locked while the first is lit, Available under the second, gone once said. `say that you see it`: Locked after l. 479 whichever solution is lit; it vanishes after `say Ok, I guess` (I2). `resume` is offered only when nothing is lit, and on an open mapping only when it has no violations.

**The house, all five mappings and the change of mind.** rag/thatch/frame + e12, thatch/frame/foundation + e12, rag/frame/foundation + the lit rag (e11), rag/thatch/frame again, and thatch first then rag. L6 refuses the thatch as both tinder and kindling and the frame as both kindling and firewood, so each fuel line must be freed before another step takes it — the right sensation. `remember the tinder` after the round trip: "the oil-soaked rag, in the house in the woods; the thatch, in the house in the woods, set aside." Katya says nothing about which; the gate says it for her.

**The wise man, both sparks, every order.** Set aside the second, move the spark to the death, resume the first, set aside the first, resume the second: objection 3 becomes "the death, not the myth". Resume the first with three figurative placements held, set aside the first: the three are back, `apply` fails L1 naming the ember, five more `map`s and `apply` print l. 471. L7 fires on e9 and e11 with the ash wording for step 8; L3 is checked first, so the ash on the lighting with the spark on the death gets the order nudge rather than "spoken for" — acceptable, the truer refusal.

**Undo (the browser button)** at fourteen points (script indices 18, 37, 38, 40, 46, 64, 65, 73, 83, 174, 188, 190, 191, 198): mid-transcription with the remainder lit, after `apply`, `set aside`, `say all set` (a chip), `expand` of a chip, l. 350 (the retroactive bars and the YOU bar must vanish — `10_after_undo_of_ask.png`), `speak as`, the line, the house apply, both `collapse the unmapped`s, the wise man's set-aside and resume, and the coda. In every case the page after undo equalled the page before the command — class census, hole position, the history's whole text — and the page after redo equalled the original. Two engine observations, not demo defects: Undo puts the undone command back in the prompt (Enter alone re-submits it; typing appends, so a player must clear it), and a mouse left resting on the Undo button keeps it selected, so the next Enter does nothing until the mouse moves.

**Remember everything, expand and collapse everything.** At the end: every role (six readings of the ember, two set aside), both abstract sequences, the four stories and the two lines, every story event, every classroom event with ordinals ("the second putting down of the chalk"); the steps, the story, the unmapped rows, every event, every chip, both directions, each printing its line, the consistency check clean after each. One inconsistency of substance: `remember the lighting of the pyre` at the end says "It felt like nothing yet. It has not been read." — it was read, in the first solution, now set aside (I1).

**Licence.** Every line of the transcript is the .md, `QUOTED`, `AUTHORED`, an authored consequence, a nudge in the data, or a generated form (`→`, `— the <role>`, the rendition lines, "It felt…", "…has been:", the fold/erase/set-aside/resume lines, the bar label, "↳"). Nothing else. Katya has no line between her lines.

---

## 3. Defects (must fix, ranked)

**D1. The figurative pass corrects its near misses in the literal fire's words.** Reproduce: prefix 177 (`set aside the first solution`), `map the laying of the kindling to the growing in number` → "Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep." Likewise tinder→e4, tinder→e5, kindling→e2, firewood→e2, firewood→e4: the six off-diagonal placements among the three fuel lines, exactly the rows a player who has half worked it out will try, a beat after Katya has asked for "the one without any literal mention of wood or flame" (`06_second_pass_wood_nudge.png`). Cause: `judge.ts: nudge_for` consults the authored `(step, event)` nudges (`wise_man.ts: fuel_nudges`, written for the first pass) before `seq.step_nudges[pass]`. Change: give `Nudge` an optional `pass`, put `pass: 'first'` on `fuel_nudges`, and filter in `nudge_for` (`n.pass === undefined || n.pass === pass`); add a walkthrough trap at prefix 177 expecting "Who caught from him first, my dear? The few, before the many." One line of code, one of data, one of test.

**D2. Badges of a pass set aside by resuming the other keep `held`.** Reproduce: prefix 189, `set aside the second solution`, `map the sparking of the tinder to the dying unexpectedly`, `resume the first solution` → `?m`: the second is `set aside`; the board: the `4` on `die unexpectedly` and "SECOND → the dying unexpectedly" are outlined and bright while the second's other badges are hollow (`05_held_among_hollow.png`). The world and the board disagree for as long as the first stays lit. Cause: `mapping.tsx: do_resume` changes the open mapping's status without an op on its nodes. Change: export `solid_ops` from `board.tsx` and add `story_updates: story_updater(solid_ops(story, open, false))` to that update. A board test: after the sequence above, every badge of the second mapping has `hollow`.

**D3. `expand <chip>` at the end reopens a board out of view.** Reproduce: prefix 198, `expand the campfire story` → "The campfire story unfolds." and nothing changes in the viewport (`09_expand_chip_at_end.png`); the board is ~10,000px above. Cause: `display.tsx: things()` passes `w.board === undefined` to `chip_ops`, and the wise man's board is never closed, so at the end — the state in which a player browses — the C5 D3 fix never applies (the notes declare the open-board exception; SPEC §8 does not). Change: pass `w.board === undefined || ended(w)`, and in `chip_ops` on collapse return the hole to the wise man's ledger when `ended` (so the coda keeps its place under the board): `move_hole_into(at(ledger_gist(w.board)))` instead of the root. Three lines; a board test for the hole's path after `expand`/`collapse` at the end.

---

## 4. Improvements (should fix)

**I1. `remember <event>` forgets a set-aside reading.** At the end `remember the lighting of the pyre` → "It felt like nothing yet. It has not been read." while `remember the ember` says "the flame, in the wise man's story, set aside". I-2's principle (a history of readings) should reach the event: "It felt like the ember, and the flame, and the blaze, and the ash, in the Voice of Fire; set aside." — read from `readings(w)` as `role_history` already does.

**I2. Keep `say that you see it` Locked after the end.** It is the best joke the .md permits (C6) and it disappears the moment `say Ok, I guess` is said (`?t:say` at prefix 198 is empty), because its `beat` is `BEAT.wise_man`. `beat: [BEAT.wise_man, BEAT.end]` keeps the line you cannot say on the board where the coda says the afternoon is yours.

**I3. The first pass's default spark nudge on the death.** prefix 163, `map the sparking of the tinder to the dying unexpectedly` → "What was touched to the tinder? Find the touch." (C4 called it slightly off; it is the literal pass, so it is defensible). A first-pass `step_nudges.first[4]` in the "two lines" spirit — "Nothing burns here yet, my dear. Find the lighting." — would match the fuel nudges' register. Licensed as a nudge (§10).

**I4. The unmapped bar's wording.** With the second solution lit the bar reads "▸ 5 events not in the mapping", counting the set-aside solution's two lines as mapped. Right by the notes, but "the mapping" is singular on a board with two. "▸ 5 events in neither solution" on the wise man, or "not in any mapping".

**I5. Engine, not demo (for the notes' engine list).** After Undo the prompt holds the undone command; selecting that text, so typing replaces it, would make Undo-then-retype work the way players expect. And the Undo button stays selected while the mouse rests on it, so Enter is swallowed.

**I6. Tests for D1–D3** as described above; the traps table already has the shape.

---

## 5. The document, one last time

**l. 160–481, sentence by sentence.** The walk found every sentence present. The only strings not found whole are the footnote markers `[1]`, `[2]`, `[3]` and the period of `> touch the flame to the tinder.` (declared). Multi-sentence lines are split as the earlier rounds accepted: l. 350 ("Indeed," + the speech + "She shows you…"), l. 383 (two sentences on `draw a vertical line`, three on `apply`), l. 419 (one on the line, two on `apply`, the last after the abstract speech), l. 477 (four quoted objections), l. 481 (two paragraphs). Order, beat by beat, on the page as played:

- **l. 160–218**: narration, then `listen` ×3; l. 166–180 as the lesson board; l. 182 with the notation folded; l. 185–215 on `expand the steps` and in every right column.
- **l. 220–315**: the campfire told; l. 244 the player's `say that…` with l. 246 Katya's reply; l. 248 on `pick up the chalk`; l. 251–306 as the friends' fourteen commands, verbatim, l. 288 and l. 306 on `let it follow` (`07`, `04`); l. 309–311 on the line; l. 313/315 on `say all set`.
- **l. 318–393**: the house told; l. 344/346; l. 348 inside the column between ¶8 and ¶9, then "Indeed," the voice speech and l. 350b; "The Family" is the bar and l. 354–378 the family's six commands, issued before the pause (the story's order, not the listing's); l. 383 split two/three between the line and `apply`; l. 385/387 and l. 389/391 as two commands with replies; l. 393 on `put down the chalk`.
- **l. 395–421**: the forest told; l. 419's four sentences as above; l. 421 on `put down the chalk`.
- **l. 423–481**: the wise man told; l. 451/453 on `say that … just two lines`; the literal `apply`: "You do. Just", ¶9, "and", ¶11, "participate in the mapping.", then l. 465 after the rendition (`06`, top); l. 467/469 on `ask what she means`; l. 471 on the figurative `apply`; four objections as four commands, "Why so, my dear?" after the first, l. 479 after the last; `say that you see it` Locked; l. 481 in two paragraphs on `say Ok, I guess` (`02`, `09`).

Once each, in play order, except the story ¶s (told, then on the board; the wise man's ¶9 and ¶11 also in the apply text, as the .md quotes them) and the Voice's two forms (the lesson board and every right column — "always both visible", §0.2).

**The first half's five mechanics (l. 5–136).**
1. *A history of action–consequence pairs* (l. 5–30): the transcript is one; every command is a frame; `remember the second listening` reprints one. True.
2. *Events are game objects* (l. 38–56): every story and classroom event is nameable, with ordinals and qualification; `remember` prints "It went like this:", the frame verbatim, a feeling in l. 53's form. True.
3. *Sequences are game objects* (l. 64–98): each finished board and "the two lines" replay verbatim and close with "It felt:" and a list not present in any part, including "because the tinder was the thatch, and before that the oil-soaked rag" (t.721) — l. 98's promise. True.
4. *Abstract narrative sequences are game objects* (l. 102–120): the Voice of Fire in two forms and the Pillaging on the shelf, both rememberable; the Pillaging is never mapped, so l. 124's "they might find that they cannot" is never true (§12). True as data, half true as play.
5. *Mapping with consequences* (l. 122–136): `apply` is an explicit act that gates every story (l. 132), prints the Fire's reading, annotates the rows, feeds `remember <role>`; downstream on "the actions they can take" (l. 134) in three places — L7, the spark's objection, the house gate. True.

**The design principles (l. 140–142).** *Always change your mind*: `erase`, re-`map`, `set aside`, `resume` in every story after `apply`, and Undo anywhere, all consistent. *Required for some puzzles*: literally so in the house — l. 385 is Locked until both the rag and the thatch have been the tinder of an applied mapping (`03`), and l. 389 and `put down the chalk` follow it. *Reflection as the core puzzle, not cutscenes*: every character line is a command; the transcription is still a cutscene the player types (§6).

**The UI demands (l. 146–152).** Not a terminal: inline boards, two columns, the right one sticky, the prompt at the cursor row and then in the ledger (`07`, `03`). Word-highlighting, autocomplete, animated text, expansion from earlier entries all survive inside the board (`02`, `07`). Side by side as you build: each `map` puts the badge on the row and the reference under the step at once (`05`); colours per chunk on badges, bands, chalk and references (`01`); expand and collapse, five kinds, all confirmed in one line. Still missing from l. 311: the drawn line; the correspondence is read by number, with a CSS hover linkage in its place.

**Footnote 1 (l. 495–513).** No event is issued without `speak as`; the wrong voice is refused in the .md's terms; the bars appear at l. 350 and the carat repeats the voice (`08`). "Their own actions will become subject to mapping later" (l. 501): the YOU bar and the rememberable classroom frames make the afternoon a sequence, but it is not mappable here (the judge's narrowing is done, the table is not). "Either name must be valid" (l. 510): the data allows several voices per event; the demo authors one, so the case is not exercised.

**Footnote 3 (l. 537–546).** The fudge factors are the candidate tables, visible as data; wrong attempts nudge in the right direction everywhere except D1's six rows; "which voice works" is not built (§12); no authoring of voices.

---

## 6. The spirit

**Is it actually something new (l. 154)?** Yes, in the sense the essay means: the player performs every act of interpretation the story describes — chooses the voice, issues the line, places the step, applies the reading, sets it aside, objects — and is judged on each in the pattern's own words, on a board that shows the mapping as it is built. That was true in round 3; what round 4 adds is that interpretation is now *consequential* in four places instead of one:

1. **The house gate.** l. 385 can only be said by a player who has been both readings; one Locked line, no Katya, and the story built for a choice becomes the story where the choice matters to "the actions they can take" (l. 134). The moment is not the gate but the L6 refusal on the way — "One line cannot be two things at once" — l. 140's "two apparently mutually exclusive interpretations in turn", enacted by the judge rather than announced.
2. **L7.** A set-aside solution keeps its lines: "That is the first solution's ash. It is spoken for. Where does the wisdom end up?" is the one nudge that points at the other reading, and what makes the second pass a second pass.
3. **The spark.** The mark, the objection in your words, and now — after D-1 — the freedom to change it after applying, with objection 3 following. The document's open question (l. 477) handed to the player.
4. **The role history.** `remember the ember` lists six readings, two set aside; the house's feeling says "before that the oil-soaked rag". Changing your mind leaves a mark instead of erasing one — l. 136 made visible.

**Where it is still transcription.** The four conversions: eighty-two commands with one right answer each, twenty-one of them `speak as`. §13 ruled for it and l. 498 is served; the forest's opening ("Who acts?") and the pause at ¶9 are where the corridor pays off, and they depend on it. The campfire mapping is a lookup ("Trivially so"). The forest's six legal mappings are still indifferent to one another. The figurative pass is now a hunt with the right nudges on most rows — "Who caught from him first, my dear? The few, before the many." is exactly l. 540 — but D1 gives the wrong ones on the six rows most likely to be tried, and a correct placement is still silent; only the spark speaks.

**The one change I would still make.** Beyond the defects: build §12's optional-more, `try the Pillaging on the house in the woods` after l. 481. It is the only place l. 124 ("they might find that they cannot") and l. 543 ("which voice works for this story") would ever be true; the judge and the Pillaging's L4 defaults ("They came upon it. Did they go in?") already do the work; the shelf has been set-dressing for three rounds; and it closes the demo on the essay's claim rather than the player's shrug. It never gates, so it costs the ending nothing.

**What I would leave alone.** The transcription's monotony (the pause needs it); Katya's silence on rag versus thatch (l. 387 is the point, and the gate says what she will not); the four objections in order; the coda's one sentence; the 96-row `map` typeahead (the full game's UI problem, not this grammar's); the "It felt" lists, every one earned; and the second pass's silence on a correct placement — "you gradually work it out", and silence is what that feels like.

---

## 7. Verdict

Every defect and accepted improvement from critiques 4–7 is fixed; three differently in ways I accept (C5 D3's open-board exception, C6 D-2's resume semantics, C6 D-6's licensing), and one (C6 D-5) incompletely, which becomes D1 here. Fresh play, headless and in the browser, found no crash, no dead end, no console error, no unlicensed or missing sentence, no Katya line between her lines, and a page that survives fourteen undos and redos without a class or a character out of place. The document is on the board whole, in order, in the right mouths, once.

**Ready to hand to the author after D1 and D2** — together an hour, each with a one-line test — with D3 recommended because the end is where the author will browse. D1 is the one that would embarrass the demo: it is the beat the whole lesson builds to, and the nudge says the opposite of what Katya has just asked for.
