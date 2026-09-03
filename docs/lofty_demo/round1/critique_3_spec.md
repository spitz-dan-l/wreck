# Critique 3 (spec): `SPEC.md` v1 against the document, the round-1 demands, and the engine

Bare line numbers cite `dist/posts/puzzle_lofty.md`; `§n` cites `docs/lofty_demo/SPEC.md`; `C1 #n` is critique_1 §4, `C2 #n` is critique_2 §5. Engine paths are under `src/typescript/`. Legend: **S** satisfied, **p** partial, **N** not, **X** contradicted.

## 1. Audit against the round-1 demands

### 1a. Critique 1 §4, the 25 hard requirements

| # | Requirement | Status | Note |
|---|---|---|---|
| 1 | Visible history of the player's commands, notation form, voice mark | **S** | frames + retroactive `You` bar (§7) |
| 2 | Nominalised event names with ordinals | **p** | ordinals only *within* a sequence (§2); `pass` (forest e6, wise man e15) collides across sequences → `Ambiguous parse` (`parser.ts:669`); nominalisation of `be born`, `hurl it onto the roof`, `take root` unspecified |
| 3 | `remember <event>` verbatim + feeling; `<sequence>` verbatim + "It felt" | **S** | §7 |
| 4 | Sequences by transcription *and* by sub-range selection (455–463) | **p** | transcription yes; the two-line literal solution is a mapping, never a named sub-sequence |
| 5 | AbstractSequence type, two instances, Pillaging visible, off the path | **S** | §5.5, beat 0 |
| 6 | Eight steps, both forms, collapse/expand, rereadable | **S** | §3, §8, beat 0 |
| 7 | Every event player-issued in a chosen voice | **S** | §5, §13 ruling |
| 8 | Two events from one ¶; consequence-only ¶s | **S** | remainder, `let it follow` |
| 9 | Voice first-class, three kinds, distinct marks, switch is a player act | **S** | §3, §8 |
| 10 | Data permits several voices per event (504–513) | **X** | §1 claims it; §3 has `voice: VoiceId`, singular |
| 11 | Legality: one target, many-to-one, unmapped, partial order | **S** | L2, L3, L6 |
| 12 | Every wrong placement nudges; per-story table | **p** | true for `map`; transcription traps are "Locked + nudge", which the engine cannot do (D1) |
| 13 | Story voice never enters legality | **S** | L5 |
| 14 | Explicit `apply`, gating, house apply under uncertainty | **S** | §6, beat 2 |
| 15 | Apply changes something visible beyond a line | **S** | Fire's rendition, annotations, roles |
| 16 | A prior mapping constrains a later one at least once | **p** | L7 exists but the second-pass table already omits e9/e11, so L7 does no work (R1) |
| 17 | Any binding, line, or application undoable, no residue | **p** | `erase` yes; nothing un-applies a mapping in stories 1–3 or the figurative solution (D9) |
| 18 | Literal applied, set aside, figurative applied; both visible at the end | **S** | beat 5, §8 |
| 19 | Literal = two lines; figurative bindings per 471; death or myth as spark | **S** | §5.4, checked word by word in §2 below |
| 20 | Every PC line a command; Katya verbatim, in order, nothing from the scratch | **p** | commands yes; but Katya gets invented interjections at 315/318 and 383/385 (D7) |
| 21 | Side by side, colour per chunk distinct from voice mark, expand/collapse | **S** | §8 |
| 22 | Engine affordances survive; clicks round-trip through the parser | **S** | no new click handlers; `typeahead.tsx:351-360` |
| 23 | House burning lines need no bodiless voice; forest uses disembodied + abstract | **S** | `let it follow`; the season/time |
| 24 | "Ok, I guess" a command; "say that you see it" offered and dimmed | **S** | Locked, `parser.ts:464` |
| 25 | No narrascope vocabulary; classroom stands alone | **S** | §1 |

### 1b. Critique 2 §5, the 20 points

| # | Point | Status | Note |
|---|---|---|---|
| 1 | A's data model and judge L1–L5 | **S** | §3, §4 |
| 2 | L6 compound-event rule | **S** | `absorbs`; but its load-time lint is wrong (D2) |
| 3 | Explicit per-story candidate table; roles derived, never bound | **S** | `Candidate.derives` |
| 4 | Campfire as one command | **X** | overruled in §13 with a reason (498); acceptable |
| 5 | Conversion with 2–4 options per row from the house on | **p** | one option per row plus three traps; `let it follow` never competes with an imperative |
| 6 | A tempting wrong option at every decision point | **p** | mapping: all events offered; transcription: only ¶8, ¶9, ¶10 and the forest's first prompt |
| 7 | Objections as commands, Katya's closing sentence intact | **S** | §10 |
| 8 | The unsayable line as Locked | **S** | §6 |
| 9 | Apply: Fire re-speaks *and* recolours the story | **p** | rendition yes; recolouring deferred (§12) |
| 10 | `consider <role>` accumulation | **S** | `remember <role>` |
| 11 | Set aside / resume, both bands, inactive dimmed | **S** | hollow 30% |
| 12 | Drop dictated `reconsider`; keep it available | **p** | dropped; nothing equivalent is available after apply (D9) |
| 13 | Board is a story subtree, rows are gist nodes | **S** | §8; confirmed feasible (§4 below) |
| 14 | No SVG lines in v1 | **S** | §8 |
| 15 | Do not revive `would()` | **S** | §12 |
| 16 | Prompt stays in the hole; hole moves into the board | **S** | `reflect.tsx:139-144` |
| 17 | `speak as`; where the doc admits two voices, admit both | **p** | exactly one voice per ¶ everywhere |
| 18 | Pillaging only if the judge is general; `remember the picking up of the chalk` | **S** | §12, §10 |
| 19 | Guards: collision test; measure parse time; `traverse_thread` not `search_future` | **p** | (a) test is per-slot not global (D6); (b) no measurement; (c) yes |
| 20 | Cut/never-cut discipline | **S** | §12 |

## 2. Audit of §5 against the document

**Prose coverage.** Every ¶ of all four stories is present, verbatim, in order: campfire 12 (220–242), house 13 (318–342), forest 12 (395–417), wise man 14 (423–449). Campfire e1–e12 are exactly 251–306, with 253–255 a two-paragraph consequence, 288 under e8 and 306 under e12 via `let it follow`. House e1–e6 are exactly 354–378; e7–e13 are authored where 383 says "You complete the translation". Forest and wise man are wholly authored, as 419 and 451 require.

**Commands as imperatives in voice.** All plausible. Three strain — `[the boy] be born`, `[the man] die unexpectedly`, `[the season] turn` — but 495 licenses them and the spec fixes them, so implementers agree. House ¶8 (the children "happen upon" the house) is a consequence of the family's `move in`; the .md pauses at ¶9 (348), so this is consistent, if flat.

**Candidate tables, checked by hand.**

- *Campfire*: s1→e4, s2→e5, s3→e6, s4–6→e8 (absorbs), s7→e10, s8→e12. L3 holds (4,5,6 ≤ 8 ≤ 10 ≤ 12). One legal mapping; both `sing`s are candidates for nothing, so "the singing is not ash" fires on L4. Matches 311–313.
- *House*: s1→{e11,e9}, s2→{e9,e8}, s3→{e8,e7}, s4→e12, s5–8→e13. Because 1–3 are unordered, rag (e11) above thatch (e9) is legal — the reason the partial order exists (385 with 324–326). Legal mappings: rag with (thatch,frame), (thatch,foundation), (frame,foundation); thatch with (frame,foundation). Four, not three: §5.2 omits thatch/foundation. Both 385 tinders admitted, nothing absurd admitted. One plausible mapping rejected: with the rag as tinder, lighting the rag (e11) *is* the sparking, but s4 admits only e12 and the (s4,e11) nudge presumes the thatch (R5).
- *Forest*: s1,s2→e7 (absorbs); s3→{e5,e6}; s4→e8; s5→e9; s6→{e9,e10}; s7→{e10,e11}; s8→e12. Six legal mappings, all L3-consistent. Firewood (living trees) is laid before tinder (dead brush): the second place the partial order is load-bearing. But e10 is listed for s6 and s7 without absorbing both, and house e9/e8 likewise: the §4 lint rejects three of four tables (D2).
- *Wise man, literal*: s1–3→e9, s4–8→e11. Exactly 457 and 461 participate. "Wood, my dear" on e2/e4/e5 makes the figurative rows tempting-wrong in pass one — good.
- *Wise man, figurative*, against 471 clause by clause: "wisdom within his mind (tinder)" → s1→e2 (425); "initial and central followers (kindling)" → s2→e4 (429); "wider community (firewood)" → s3→e5 (431); "mythologizing of his death marks the spark" → s4→e12 (445); "ever increasing distortions" → s5→e12 (absorbs 4–5); "spread through his original community and beyond" → s6→e13 (447); "read and repeated and reprinted" → s7→e14; "his wisdom has become ash" → s8→e15 (449). Every clause lands on a row; e8 as alternative spark covers 477. L3 holds. Correct.

**L3 is unreachable.** Every row of every table is order-consistent with every other row, so with L4 in force no placement can fail L3; §4's two L3 demonstrations and §10's L3 nudge are dead. Whether an *unplaced* prerequisite fails L3 is unstated (D3).

## 3. Audit of §6 and §9: gaps, preconditions, dead ends

- **`apply` offered only "when L1 holds" (§6)** contradicts §4's L1 nudge and its demonstration "apply with a hole (L1)" (D4).
- **`speak as` offered "once voices are taught" (§5)** contradicts beat 0's `speak as the friends` and beat 2's `speak as the family`, both before 350; and since `speak as` "draws the voice bar", the notation 350 says Katya *shows you* has been on the board for a story and a half (D12).
- **Where 348/350 print.** §8: dialogue "always prints ... at the root". But frames are spliced in at the hole (`dsl.tsx:201-210`, `world.tsx:107`), which during transcription is inside `.left`; 348 and Katya's speech will sit between ¶8 and ¶9 whatever §8 says (D13).
- **The wise man's sequence never finishes.** Only `say all set` finishes and titles a sequence, and beats 4–5 never issue it; its "It felt" list and title are undefined, and `remember` before 481 would report "you don't really see it" before it happens (D10).
- **No un-apply outside the wise man**: after the house `apply` the tinder cannot be changed (D9).
- **Ambiguities**: l. 465 prints on apply or after `collapse the unmapped`? (R14). `map` on an already-placed step (R9). Objections "in any order" when three sentences at 477 begin "And ..." (R4).
- **§6 vs §9**: nothing used that is undefined; `erase`, `resume`, `expand <event>` defined but unused, which is fine. **Dead ends**: none; every scripted state has an advancing command, the forest's empty prompt offers `speak as`, and after the second apply the objections and `say Ok, I guess` are always reachable. **A stall**: the house pause is discoverable only because the Locked `light the rag` shows a glyph — under D1 it teaches nothing.

## 4. Audit of §8 against the engine

| Claim | Verdict | Where |
|---|---|---|
| Gists as node addresses; every visible change is a story op | **Confirmed** | `query.ts:301-302` (`has_gist` scans the whole tree), `update.tsx:75-76` (op by path), `op.ts:257-363` (add, insert_after, css, replace_children, remove) |
| Hole moves into `.left` / `.ledger` / root | **Confirmed** | `reflect.tsx:139-144` (remove hole, add hole to latest frame, group `init_frame`), `:188-190` (back to root); `query.ts:241-248` requires exactly one hole; `dsl.tsx:96` `insert_after` exists |
| New frames land where the hole is, so board rows are frames | **Confirmed** | `dsl.tsx:201-210` replaces the hole with `[EmptyFrame, Hole]`; `world.tsx:107` runs it first on every command, so the handler's hole-move runs after the frame exists |
| Nested frames found by `S.frame(i)` and the default latest frame | **Confirmed** | `query.ts:260-267`, `:313-322` (`find_all_nodes`, whole tree); `add_input_text` (`dsl.tsx:175-184`) therefore also works nested |
| Collapse/expand as classes, animatable | **Confirmed** | `op.ts:284-303` adds `eph_adding_/eph_removing_` markers |
| Badges into the row's input line; references into `.targets`; erase | **Confirmed** | `dsl.tsx:180-181` pattern; per-badge class + `has_class` regex (`query.ts:253-257`) + `remove` (`op.ts:322-327`) |
| Retroactive `You` bars via `S.map_worlds` | **Confirmed** | `dsl.tsx:152-155` |
| Voice-styled carat by CSS on `.left`, Carat untouched | **Confirmed** | `parsed_text.tsx:249` is a bare span; prompt lives at `#story-hole .input-prompt` (`app.tsx:161`) |
| No second renderer; DOM mutated in place | **Confirmed** | `history.tsx:79-83` re-renders from scratch only on undo |
| Sticky right column | **Feasible with a fix** | scroll container is `#terminal` (`dist/global.css:1-11`); a stretched flex item cannot stick (R2) |
| `say all set` collapses to a chip "with a barcode of the badges" | **Feasible, not classes-only** | badges live inside hidden rows; the barcode needs an `add`/`replace_children` into `.board-title` (R12) |
| Nudges during mapping print in the ledger | **Confirmed** | follows from the hole being there |
| Locked traps that print a nudge | **Refuted** | `parser.ts:462-467`: a matching Locked token is an `ErrorMatch`; `:209` "Locked specs can never be entered"; `typeahead.tsx:430` shows only the glyph. A Locked command never reaches `handle_command`, so it never prints (D1) |
| Reprinting events with gists on `remember` | **Risk** | `has_gist` is global; a reprint with gists is a second target for later ops (R3) |
| Knowledge grafting of annotations | **Confirmed** | `knowledge.ts:349-367` |
| `traverse_thread` at scripted states | **Confirmed** | `parser.ts:715-766`; verb-first keeps the ~120 `map` threads cheap at token one |

## 5. §10 prose: register and Katya's mouth

Between 473 and 479 Katya says only "Why so, my dear?" — confirmed, in §9 and §10. Elsewhere:

- **"We do not write why they speak. We do not write whether they should. We write who."** (350 speech). The middle sentence pre-empts 389–391: the player's "it seems to know nothing of the morality of the burning, either" becomes a repetition of what Katya has already said. Cut it (R6).
- **"You will notice how much such a voice sounds like the one we are looking for. Notice it. Do not write it there."** Kinship remarked during transcription; rebuttal_A (D1) conceded she may remark on it only after the mapping is applied. Move or cut (R6).
- **Player lines inside Katya's speeches**: "No one. It fell." and "And *the season is right*? *Time passes*?" are the player character speaking without a command, inside a block. §1 says "Every character line is a command" (D7).
- **The disembodied speech is about the wrong line.** It fires at the first disembodied `speak as`, which is `the seed` at ¶1, and asks "Who lays the brush?" and "Something must command the bolt" — brush and bolt are ¶7–8 (D11).
- **Invented Katya lines where the .md gives her none**: "The rag. Very well." / "The thatch. Very well." between 383 and 385; "Remember it now, my dear, as one thing." between 315 and 318; 315's sentence reused after the house and then immediately doubled by 393. §1 says the only non-.md Katya prose is "the three speeches" — there are four speech blocks, a mark, nudges, two replies, and the coda (D7).
- **Register drift in the narration**: "the way a rhyme is pleasant"; "The board is not wrong."; "You are relieved, and you notice that you are relieved."; "It locks."; "It felt a bit like being watched, because she was."; "a lie ... told politely". The .md narrates flatly ("You do."; "But you don't really see it."). The forest apply text — "The forest grew for a hundred years so that it could burn for a day" — imputes purpose exactly where 419 says there are none (R7).

## 6. Winks, flourishes, cutscenes

1. **The coda** (§9, §10): "She does not map it. Neither do you. Not yet." is a wink at 501; "You open your notebook and write: The Voice of Fire" is a curtain line. C2 said the demo should end on the mutter; the .md ends at 481. The board state and the `You`-coloured frames are wanted (req. 1, 10); the narration and `write it down` are not (R7).
2. **The shelf with the rolled boards and "One is labelled The Pillaging"** — set-dressing the .md never describes. Tolerable under D5's ruling; keep it to one sentence.
3. **The apply texts** (§5): four of five are the spec's voice, not the document's, and two of them displace text the .md actually supplies (455–463, 471) (D8).
4. **The "mark"** "His death. Very well. Hold that." — a Katya line during mapping; 540 sanctions nudges, and this is a nudge's sibling, so it passes, barely.
5. **Classroom feelings** "being watched, because she was" and "a lie, told politely" — cute where the .md is dry ("a bit weird, because the guy was weird").

## 7. DEFECTS (must fix before build), ranked

**D1. Locked traps cannot nudge.** §5's typeahead rule, ¶8 of the campfire, ¶9–10 of the house (V1, V2), the forest's V4 and the generic "The <voice> do not <imperative>" all say "Locked" and then quote a nudge. The engine cannot enter a Locked token (`parser.ts:462-467`), so nothing prints. *Change*: every trap is `Available`; issuing it makes a frame whose consequence is the nudge and which leaves cursor, voice and mapping unchanged (the frame stays in the history as a wrong attempt, which is what 540 describes). Only `say that you see it` stays Locked — there silence is the point. Test 4 becomes "every trap is enumerable and Available; issuing it prints its nudge and does not advance".

**D2. The L6 lint rejects the spec's own tables.** "An event may appear in the table for two steps only if it absorbs both" fails on house e9 (s1, s2), house e8 (s2, s3) and forest e10 (s6, s7), all deliberately shared-as-alternatives. *Change*: delete the lint; L6 at placement time already forbids two steps *holding* a non-absorbing event. Correct §5.2's count to four legal mappings (add rag/thatch/foundation). Drop `e12 absorbs [4]` in the house (a one-step absorb is a no-op).

**D3. L3 is ambiguous and unreachable.** (a) Unstated whether `P(s')` unplaced counts as failure. (b) With L4 checked, no table can fail L3, so §4's two L3 demonstrations, the §10 L3 nudge, and §4's first nudge-priority branch (a row `nudge` — no row in §5 carries one) are dead. *Change*: check in the order L2 → L3 → L6 → L4 (structure before candidacy); at placement time L3 compares only against steps already placed, at apply against all; nudge priority becomes: rule-specific text for L1/L3/L6 (§10) → authored `(story, step, event)` → step default (L4 only). Then "s6 on `pile the kindling` after s5 on `touch the flame`" fails L3 with the order nudge, as §4 promises. Delete the `Candidate.nudge` field.

**D4. `apply` gated on L1 contradicts the L1 nudge and demonstration.** *Change*: `apply the Voice of Fire` is offered throughout mapping; with a hole it fails L1 and prints "The Voice of Fire does not skip, my dear."

**D5. One voice per event in the data, plural in the claim.** §1 says the data permits several voices per event (504–513, C1 #10); §3 has `voice: VoiceId`. *Change*: `voices: VoiceId[]` on `StoryEventSpec`; transcription accepts the imperative when the current voice is in the list; the demo authors one entry everywhere.

**D6. Names collide and nominalisation is unspecified.** `pass` (forest e6, wise man e15) gives two threads accepting `remember the passing` → `Ambiguous parse` (`parser.ts:669`); the §6 test checks only step ≠ event ≠ sequence. Auto-nominalising `be born`, `hurl it onto the roof`, `take root`, `die unexpectedly`, `turn dry and hot`, `lay walls and a roof` will differ between implementers. *Change*: add `name: string` (authored) to `StoryEventSpec` and `Step`; the collision test is one global set over step names, all event names of all sequences, sequence titles, role names, voice names; cross-sequence repeats are qualified ("the passing, in the forest fire") or given ordinals across the whole history (58 allows either).

**D7. Katya and the player speak where the .md gives them nothing.** Delete "The rag. Very well." / "The thatch. Very well." (l. 387's indifference is best shown by no reply at all); delete "Remember it now, my dear, as one thing." (the typeahead offering `remember the campfire story` is the prompt); delete the reused 315 after the house (393 already prints). Recast the two forest speeches as Katya-only: "Who takes root, my dear? No one, you would say. The notation has no line for no one ..." — or make the player's halves commands (`say that no one does`). Rewrite §1's exclusion sentence to enumerate what is authored: four speech blocks, transcription and mapping nudges, one mark, the chip titles, the coda.

**D8. Invented apply texts displace the document's own words.** The literal wise-man apply should print 455–463 ("You do. Just [457] and [461] participate in the mapping."); the figurative apply should print 471 in full; the house apply should print 383's "You struggle a bit more ... Nevertheless, you find an acceptable mapping." *Change*: the .md sentence is the apply consequence; the spec's lines may follow only for the campfire and forest, shortened (R7).

**D9. Applications cannot be undone outside the wise man.** *Change*: `set aside the mapping` is available after any `apply` (status → `set aside`, badges hollow, annotations and `roles` entries and the Fire's rendition removed by the same ops reversed); `resume the mapping` re-applies. `say all set` still requires an applied mapping. For the wise man, `set aside the second solution` / `resume` likewise, so 140 holds symmetrically.

**D10. The wise man's sequence never finishes.** *Change*: the figurative `apply` finishes and titles the sequence ("the wise man's story"); the last feeling ("unconvincing, because you don't really see it") is grafted on `say Ok, I guess`, so `remember` before 481 shows only the first two.

**D11. The disembodied speech names the wrong line.** *Change*: keep the trigger (first disembodied `speak as`, at the seed) and rewrite the speech around the seed: "Who takes root, my dear? ... Something must command the seed, or the seed cannot be written." She writes THE SEED. Keep "The weather's. The fire's." as examples.

**D12. `speak as` availability and the bar's first appearance.** *Change*: at board open the typeahead offers `speak as <first voice>` (campfire: the friends; house: the family); mid-board switching and the other voices become available at 350. No bar is drawn before 350; at 350 the bars for the friends, the family and `You` all appear retroactively (`S.map_worlds` + `has_gist(voice_bar(...))`), so 350 is where the visual notation is first seen, as the .md says.

**D13. Dialogue location.** *Change* §8's sentence to: "Frames print wherever the hole is: at the root between boards; in `.left` during transcription (348–350 therefore sit between ¶8 and ¶9 of the house board); in `.ledger` during mapping."

## 8. RISKS (should fix)

- **R1. L7 does no work** — the second-pass table already omits e9/e11. List e11 under s4–s8 and e9 under s1–s3 so L7 is what removes them and the "spoken for" nudge fires on an L7 failure; the test should fail if L7 is deleted.
- **R2. Sticky column**: `.right` needs `align-self: flex-start` (a stretched flex item cannot stick); confirm `scroll_down` (`animation.ts:156-158`) still reaches the typeahead inside `.left`.
- **R3. Duplicate gists**: `remember` reprints must strip gists, or badge/annotation ops will also land in the reprint.
- **R4. Objection order**: offer the four in .md order; "any order" buys nothing and breaks the "And ..." run.
- **R5. Rag as tinder and spark**: add e11 to s4's house row, `e11 absorbs [1,4]`, reword or drop the (s4,e11) nudge.
- **R6. Katya's speeches**: cut "We do not write whether they should." (pre-empts 389–391); move the kinship remark to after the forest apply (rebuttal_A, D1).
- **R7. Flourishes**: cut the coda to the board state plus at most one flat sentence; cut `write it down`; end on 481. Shorten the campfire and forest apply texts to one flat sentence; drop "so that it could burn" (419). Replace "being watched, because she was".
- **R8. Titling**: the sketch shows the title at open; §6 has Katya title at `say all set`. Keep the sketch.
- **R9. Re-mapping a placed step** replaces the placement (140).
- **R10. `roles[blaze]`** gets two entries per mapping (steps 6, 7); dedupe per (role, sequence).
- **R11. Parse time**: acceptance should include a keystroke-parse measurement at the wise man's mapping state (C2 #19b).
- **R12. Chips**: the barcode is an added node, not a class; say so.
- **R13. Sub-range selection (C1 #4)**: on the literal apply, register "the two lines" (e9, e11) as a rememberable sub-sequence with one feeling.
- **R14. l. 465** prints as the last paragraph of the literal apply.

## 9. Verdict

With the thirteen defects fixed, the spec honours the document. Its shape is right: every act of interpretation in 160–481 is a command the player issues, every line of all four stories is present and player-transcribed in a chosen voice, the eight steps stand in both forms, the judge is a rule with visible fudge factors rather than a whitelist, the house's tinder and the wise man's spark are genuine choices, both wise-man solutions end on one board, and the board is a story subtree the engine can animate. The candidate tables reproduce 284–306, 383–385, 455–463 and 471 clause by clause and admit nothing silly. What is wrong is fixable in a day of editing: one engine fact (Locked is silent) that undoes every transcription trap; a lint and an ordering that make two of the seven rules dead letters; a handful of invented Katya lines and apply texts that talk over the document where it already speaks; and three places (un-apply, the wise man's finish, the location of dialogue) where two implementers would build different games. The risks are mostly matters of taste, and the taste the document asks for is flatter than the spec's.
