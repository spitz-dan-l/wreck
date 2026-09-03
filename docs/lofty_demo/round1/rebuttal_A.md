# Rebuttal A (round 1)

Line numbers cite `dist/posts/puzzle_lofty.md`. C1 = critique_1_textual, C2 = critique_2_play_build.

## 1. Verdicts on every objection to Design A

**C1-1, C2 "the objections are a cutscene." CONCEDE.** Each of the four objections at l. 473–477 becomes a command built from the applied mapping (`object that there is no fire`, `object that the fireplace is too abstract`, `object that the spark is <the death | the myth>`, `object that the ash is still structured`); the house mutter (l. 385), "What do you mean?" (l. 467) and "Ok, I guess" (l. 481) likewise. Katya's only interjection between objections is "Why so, my dear?" (l. 475); l. 479 closes, verbatim. The objection about the spark is composed from the cell the player actually placed, so it is reflection on the player's own work, which is what l. 142 asks for.

**C1-2, C1-9 "It felt" dropped; `reread` renames the verb. CONCEDE both.** One verb, `remember`. `remember <event>` prints command + consequence verbatim + one authored feeling line (l. 47–56). `remember <sequence>` replays every event and prints "It felt:" — authored reasons per story, plus one generated line per applied mapping ("— like the Voice of Fire, because the tinder was the rag"). The Fire's re-speaking on apply is kept and *appended*, never substituted.

**C1-3 the player's history is invisible. CONCEDE, with C2's constraint.** There is one story tree (C2 fact 4). Dialogue frames are ordinary frames; the board is a persistent `.board` subtree; during board work the story hole moves into the board's left column (the `reflect.tsx` trick), so board rows *are* the player's frames, styled as a ledger. Beat 0 gains B's `remember the picking up of the chalk` so naming is taught on the player's own act; C's `[You]` voice band is applied to the player's frames when voice notation is introduced (l. 350).

**C1-4, C1-6, D1, D9 disembodied voice taught early; story-fire conflated with the pattern. CONCEDE.** The house's burning lines (l. 336–342) are transcribed as consequences (`follows`, B) or, optionally, as the family's last commands (`sleep` / `wake` / `try the door`, C). The forest's `the fire` is a *disembodied* voice distinct from the abstract Voice of Fire; the forest's *abstract* voice is `time` ("Much time passes", l. 405), so l. 419's "disembodied and abstract" are both spoken on the left. C's trap stays: `speak as the Voice of Fire` is offered and nudged ("Not yet, my dear…"). I withdraw Katya's invented "was it not the one on the right of the board"; she may remark on kinship only after the mapping is applied.

**C1-5 colours per voice, not per chunk. CONCEDE.** Every mapped row carries a left band in its step's colour (B's palette); voice is a gutter bracket and carat, never a fill colour.

**C1-7, C2 "dictated reconsider." CONCEDE.** The forest is not gated on `reconsider`. Rag and thatch remain both legal with differing Katya replies; `reconsider` exists, is mentioned once ("You may change the tinder later, my dear; the Fire will not mind"), and gates nothing. The required change of mind is the wise man's set-aside — the document's own (l. 465).

**C1-8, D5 Pillaging edges into the deferred puzzle. DEFEND, within C1's constraint.** Off the critical path, after story 4, never gating. It is the only place l. 124 ("They might find that they cannot") is ever true, and with the rules in §4 it costs one voice definition and one empty candidate row.

**C1-10 figurative bindings elided. CONCEDE.** Full table in §4.

**C2 counterexamples 1–2 against L1–L4, and L6. CONCEDE, and go further.** Free-form `participants` is replaced by an explicit per-story, per-pass **candidate table** (C2 §5.3); L6 is adopted as a runtime rule *and* as a load-time lint on the table. "The laying is the gathering" and "all eight on `light the pyre`" both die; demonstration in §4.

**C2 ember/flame/blaze/ash binding burden. CONCEDE beyond what was asked.** The player types **no bindings at all**. The mapping is a placement of steps onto events; every candidate row names the participant that placement *derives* ("step 1 → `light the rag` derives tinder = the rag"). Rag-vs-thatch is therefore a *placement* choice (step 1 on `light the rag` or on `lay walls and a roof`), not a separate command. `consider the tinder` reads derived bindings from applied mappings, unchanged.

**C2 fact 4 (board must be a story subtree), supervenience as oracle, ambiguous parse. CONCEDE all three.** Board = `.board` subtree with gist-bearing rows (C2 §5.13). Reachability of both wise-man solutions is tested with `traverse_thread` at scripted states, not `search_future`. Mapping commands are verb-first (`map <step> to <event>`), so steps and events never share a slot; a load-time test asserts no event nominalisation equals a step name, and if one does, the event is qualified ("…, in the campfire story").

**C2 forest is the most boring stretch. PARTLY CONCEDE.** Adopt C's empty prompt and trap, B's two-to-four imperatives per row with wrong-voice options `Locked`, and cut the forest's voices to four (`the seed`, `the weather`, `the fire`, `time`). Transcription stays player-issued (D2), but the campfire narrows to one option per row except the match line and the `follows` line, so it is a minute, not three.

**C2 coda. CONCEDE.** Cut. The demo ends on "But you don't really see it."

## 2. Interpretive disputes ruled for B or C

D1, D9: accepted above. D2: C1 rules with A (player-issued, typeahead may narrow to one); against C's single `convert the story`, l. 498 is decisive — converting *is* issuing imperatives. D3, D4, D7, D8, D10: agree; D8 was mine. D6: accept — the coda goes; `[You]` band and remember-the-chalk stay. D11: accept; I keep `apply` explicit on the campfire too, because a single verb the player has already used once is cheaper to teach than an exception, and Katya's reply there is l. 313–315.

One counter-argument, on D5(i): C1 says green-room *function* is demanded and B's classroom transposition is the cheapest way. Agreed — but the transposition must land on the *player's* frames in the board subtree, not on a separate transcript widget, or fact 4 bites B's own selling point.

## 3. Stolen, and rejected

**From B, into the synthesis:** the `¶` layer and cursor row; `follows`; wrong-voice imperatives shown `Locked` with a nudge; `draw a vertical line` (l. 309) as the act that creates the right column; both forms of the Voice of Fire as collapse/expand of one column; the voice carat; clicking-is-typing; `collapse the unmapped` (the visual form of l. 451); `remember the picking up of the chalk`; the burning lines as `follows` in the house so the forest is a need. **Wrong for the document:** no judge and no mapping nudges (l. 540 promises them *for mapping*); one step → many targets (l. 311 is singular); phrase-level targets as a requirement (the wise man's literal solution is two *events* absorbing eight steps, §4); the second physical column; SVG lines and `would()` glow in a first build; "Pillaging: no" (l. 102 is plural).

**From C, into the synthesis:** pacing; nudges 1–8 including the `the Voice of Fire` trap; the `Locked` `say that you see it`; consequence texts on apply; recolouring of the story on apply with a *display-only* residue on unmap; the `[You]` band; objections as commands; Katya's two speeches for l. 350 and l. 419 (with the "Is such a voice" exchange moved to *after* the forest mapping is applied, per D1). **Wrong for the document:** `convert the story` as one command (l. 498); prose lines as mapping targets (l. 122 maps *events*); reinstating `s3` l. 193 and inventing "Is a hearth less a hearth…" (l. 479 is the revision); `unmap` residue if it constrains anything (l. 140); no event or sequence objects at all (l. 38–98 are half the document).

## 4. Revised rules, complete data, demonstration

**Objects.** A story is a sequence of events `e_1..e_n` (index = history order). Each event may carry `absorbs: StepIndex[]` (author-flagged compound). A voice has steps with a partial order `after`. A *pass* is the set of mappings on this story already applied-and-set-aside (empty on first pass). A mapping is a placement `P: Step → Event ∪ {⊥}`. Each (voice, story) has a candidate table `RC[pass][step] = { (event, derived participant)… }`.

**Rules** (checked on every placement; an apply requires all to hold):

- **L1 Totality (apply only).** `P(s) ≠ ⊥` for every step.
- **L2 One target.** A step lands on one event. Events may be unmapped. Several steps may share an event subject to L6.
- **L3 Order.** For every `s' ∈ after(s)`, `index(P(s')) ≤ index(P(s))`. `after` = {4:[1], 5:[2,4], 6:[3,5], 7:[6], 8:[7]}; 1–3 unordered among themselves.
- **L4 Candidacy.** `(P(s), _) ∈ RC[pass][s]`. The table is the "manual fudge factor" (l. 537), visible as data.
- **L5 Voice-indifference.** No rule reads `voice(P(s))`.
- **L6 Sharing.** If `P(s) = P(s') = e` for `s ≠ s'`, then `s, s' ∈ absorbs(e)`. Lint: an event may appear in `RC` for two steps only if it absorbs both.
- **L7 Spoken for.** In a non-empty pass, an event that is the target of any set-aside mapping is removed from `RC` (l. 134; C's nudge 7 becomes a rule).
- **Nudges.** A rejected placement prints, in priority: an authored nudge for `(step, event)` if one exists; else the step's default nudge in the Fire's terms; never a bare refusal. Amber (consistent, holes remain) is silent.

**Events and candidate tables.** Voices in brackets; `[abs …]` = absorbs; `→ participant` = derived role. Steps 5–8 derive ember/flame/blaze/ash from the event they land on.

*Campfire* [the friends]: 1 travel to the woods · 2 gather tinder, kindling and firewood · 3 dig a pit · 4 lay the tinder in the pit · 5 pile the kindling · 6 stack the logs · 7 light a match · 8 touch the flame to the tinder `[abs 4,5,6]` · 9 sing · 10 add logs to the fire · 11 sing · 12 sleep in tents (ash `follows`).
RC: s1→{4→the tinder}; s2→{5→the kindling}; s3→{6→the logs}; s4→{7→the match, 8→the ember}; s5→{8}; s6→{8}; s7→{10, 11}; s8→{12→the ash}. Authored nudge (s8, 11): "The singing is not ash. What is left behind, afterward, when no one is tending?"

*House* [the family]: 1 pack · 2–4 travel ×3 · 5 cut wood · 6 dig a hole · 7 build the foundation · 8 raise the frame · 9 lay walls and a roof · 10 move in ("Time passes" `follows`) · [the children] 11 happen upon the house · 12 light the rag · 13 hurl it onto the roof `[abs 4]` · 14 scatter, with l. 336–342 as four `follows` paragraphs `[abs 5,6,7,8]` (optional-more: the family returns for 15 sleep · 16 wake · 17 try the door, which then carry 5/6/7–8 instead).
RC: s1→{12→the rag, 9→the thatch}; s2→{9→the thatch, 8→the frame}; s3→{8→the frame, 7→the foundation}; s4→{13→the burning stick}; s5→{14}; s6→{14}; s7→{14}; s8→{14→a field of ash}. L6 keeps 7, 8, 9 distinct across steps 1–3, so tinder = thatch forces kindling = frame, firewood = foundation, and tinder = rag admits thatch/frame or frame/foundation. Nudges: (s1, 5) "Wood that is cut is not yet laid."; (s4, 12) "Lit, but not yet touched to anything. What does it fall upon?"

*Forest*: [the seed] 1 take root · 2 rise · [the tree] 3 grow · 4 sprout leaves and seeds · [the forest] 5 spread · [time, abstract] 6 pass (the trees flourish) · [the weather] 7 turn dry and hot `[abs 1,2]` · 8 bring a thunderstorm; [the lightning] strike the dead tree · [the fire, disembodied] 9 spread to the dead brush · 10 spread to more trees · 11 burn in a growing circle · 12 consume the forest · 13 stop at the rivers (ash `follows`).
RC: s1→{7→the dead trees}; s2→{7→the dead brush}; s3→{5→the trees, 6→the forest}; s4→{8→the lightning}; s5→{9}; s6→{10}; s7→{11, 12}; s8→{13→ash}. Nudge (s1, 1): "A seed is not laid to burn. What here is dry?"

*Wise man*: [the boy] 1 be born · 2 grow up and acquire wisdom · [the man] 3 seek answers · 4 gain a small circle · [the followers] 5 grow in number · [the man] 6 give speeches · [the followers] 7 write down his teachings · [the man] 8 die unexpectedly · [the closest followers] 9 construct the pyre and lay his body `[abs 1,2,3]` · [the multitudes] 10 attend · [the closest followers] 11 light the pyre `[abs 4,5,6,7,8]` · [the central followers] 12 adjust and embellish his words; his death becomes mythologized `[abs 4,5]` · [the books] 13 spread across the land · 14 be read, repeated, reprinted · [time, abstract] 15 pass; interpret and reinterpret.
RC literal (pass ∅), on the selection [9, 11] (l. 455–463): s1,s2,s3→{9→the pyre's tinder/kindling/wood}; s4→{11→the flame}; s5,s6,s7→{11}; s8→{11→his body, as ash}. Nudge (s2, 4): "Wood, my dear. You are looking for wood."
RC figurative (pass = {literal}): s1→{2→his wisdom}; s2→{4→his central followers}; s3→{5→the wider community}; s4→{12→the myth, 8→his death}; s5→{12→the distortions}; s6→{13→the books}; s7→{14→the echoes}; s8→{15→the distorted doctrine}. L7 removes 9 and 11. Nudge (s8, 11): "That is the first solution's ash. It is spoken for. Where does the wisdom end up?" Note the figurative table is unlocked by the pass, not by a separate flag — I withdraw my earlier "forest unlocks the stand-ins" gate.

*Pillaging* (optional, after story 4), on the house: s1 "lives in their home" → {10}; s2 "enters" → {} ; s3 "takes" → {}. Nudge (s2, 11): "They came upon it. Did they go in?"; (s3, any): "What did they take?"

**Demonstration.** (a) Every mapping the document draws is admitted: campfire steps 1–3 on 4/5/6, 4–6 on 8 (absorbs 4,5,6; L6 ✓; L3: 4 ≥ 4, 8 ≥ 5, 8 ≥ 6 ✓), 7 on 10, 8 on 12 (l. 284–306). House with either tinder (L3: step 4 on 13 ≥ 12 or ≥ 9 ✓; 1–3 unordered, so foundation/frame/roof in build order is legal, l. 324–326, 383). Forest as listed. Wise man literal: eight steps on two events, all in `absorbs` (L6 ✓), L3 trivially ✓ (l. 455–463). Figurative with spark = death: s5 on 12 ≥ 8 ✓; with spark = myth: s4, s5 both on 12, which absorbs 4,5 ✓ (l. 471, 477). (b) "All eight on `light the pyre`": steps 1–3 fail L4 (only 9 is a candidate) and L6 (11 absorbs 4–8 only) → nudge "Wood, my dear…". "The laying is the gathering": (s1, 2) ∉ RC → default tinder nudge "The tinder is the first thing to catch. Nothing here catches." "Everything on `sing`": 9 and 11 appear in no RC row except s7→11, so seven of eight fail L4, and two steps on 11 fail L6. (c) Rag and thatch: both rows of s1 ✓. Death and myth: both rows of s4 ✓, and the objection command at l. 477 is composed from whichever was placed.

Two implementers building L1–L7 over these tables produce the same accept/reject set; what they may author differently is nudge prose and feelings, which is where the document expects the fudge to live.
