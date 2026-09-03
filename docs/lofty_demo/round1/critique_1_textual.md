# Critique 1 (textualist): the three round-1 proposals against `puzzle_lofty.md`

All bare line numbers are `dist/posts/puzzle_lofty.md`. Scratch notes are cited as `s0`–`s3` with their own line numbers. Proposals are cited as `A §n`, `B §n`, `C §n` (or `A l. n` for a line in the proposal file). "Present" means a player can do or see it in the proposed walkthrough, not that the proposal mentions it.

## 1. Content audit

Legend: **P** present, **p** partial, **M** missing, **X** contradicted.

| # | Required element (cite) | A | B | C |
|---|---|---|---|---|
| M1 | A parser game builds a visible history of the player's own action–consequence pairs (5, 28–34) | **p** — commands are stored as `Event`s (A §5) but "the board is the only display" (A §6); no visible player transcript | **P** — transcript column, ledger, beat-0 classroom actions | **p** — `[You]` band and coda make it visible, but no UI location for it is given |
| M2 | Events are nameable; `remember <event>` prints it verbatim plus how it felt (38–56) | **p** — `reread` prints verbatim + annotations; the feeling (53–56) is dropped; verb renamed | **P** — `remember the touching of the flame…` verbatim + "It felt" (B §4) | **M** — no event naming, no remember |
| M3 | Sequences assembled, named, replayed verbatim with an "It felt" summary not in any event (64–98) | **p** — assembly by transcription/selection; summary is the Fire re-speaking; no "It felt" replay | **P** — `all set` names, `remember the campfire story` replays + feelings, chip | **M** — asserted to be "the mapping cells" (C §9); nothing replays or summarises |
| M4 | Abstract sequences are a *type* with more than one instance (102–120) | **P** — `AbstractSequence`, two instances, steps rereadable | **p** — one Voice; Pillaging named once | **p** — one Voice; Pillaging in `notes` |
| M5 | Applying a mapping changes disposition, belief, knowledge, available actions, future mappings (128–136) | **P** — summary spoken, annotations grafted, `consider <role>`, gating, stand-in unlock | **p** — feelings grafted; toggle gates objections in story 4 only; no knowledge or action change; no forced apply | **P** — recolouring (128), consequence text (130), forced apply (132), nudge 7 constrains future mapping (134) |
| P1 | You can always change your mind (140) | **P** — `reconsider`, `set aside`, `resume` | **P** — `erase the line`, toggle | **P** — `unmap` (residue must not block; see C-5) |
| P2 | Some puzzles require two mutually exclusive interpretations in turn (140) | **P** — literal/figurative plus house reconsider | **P** — apply toggle required before drawing II | **P** — set aside, second column, pass-relative nudges |
| P3 | Reflection is the core puzzle, not cutscene or prose (142) | **p** — objections (473–477) print as a block on `apply`; house mutter auto-prints | **P** — objections are commands | **P** — objections composed from cells; dimmed command |
| U1 | Mapping visible side by side as it is built (152) | **P** | **P** — SVG lines, both widths | **P** — thin: lines are numeric references ("line 9") |
| U2 | Colours for the chunks of abstraction each event maps to (152) | **p** — left column coloured by *voice*, steps as numeric badges | **P** — per-step palette, bands | **P** — step colour as left border |
| U3 | Expand/collapse text (152) | **P** — `[+]` per event | **P** — ¶, events, unmapped bar, steps | **P** — `[v]`/`[>]` on consequences |
| U4 | Word-highlighting, autocomplete, animated text, expanding previous entries survive (148) | **p** — typeahead only | **P** — all four addressed | **p** — typeahead, dimming, one animation |
| V1 | The eight chalkboard statements (166–180) | **P** | **P** | **P** |
| V2 | The eight statements *also* in notation, both forms visible, steps as objects (182–216) | **P** — two views of one column; `reread` a step | **P** — collapsed statement, expand to notation | **p** — rewritten "in place" (C §8 beat 0): the chalkboard form is overwritten |
| S1a | Campfire story told in full (220–242) | **P** | **P** | **P** |
| S1b | "I see the Voice of Fire is contained…" as a player act (244–246) | **P** | **P** | **P** |
| S1c | Player converts the campfire to notation, twelve events (248–307) | **P** — command by command | **P** | **X** — one command, `convert the story` (C §3) |
| S1d | Player draws the vertical line and the right column (309–311) | **P** — `draw the line` | **P** — `draw a vertical line` | **p** — the column pre-exists from beat 0 |
| S1e | Not quite one-to-one: unmapped events and many steps on one event (284–288, 313) | **P** — L2 | **P** | **P** |
| S2a | House story told in full (318–342) | **P** | **P** | **P** |
| S2b | "Quite a sad story" / "Can you find the Voice of Fire within it?" (344–346) | **P** | **M** — beat 5 skips 344–346 | **P** |
| S2c | Conversion pauses at the children; "the source of the intentional voice has changed" (348) | **P** | **P** | **P** |
| S2d | Katya's visual notation for a voice switch (350–352) | **P** — bar + coloured glyph | **P** — bracket, ⟂ tick, carat | **P** — header, band, speech |
| S2e | Translation completed; a struggle; an acceptable mapping (383) | **p** — burning lines spoken as `the fire`, pre-empting 419 | **P** — `follows` | **P** — consequences or a family return |
| S2f | Rag or thatch is a real choice, both acceptable (385) | **P** | **P** | **P** |
| S2g | Katya: not relevant to the Voice of Fire; it simply proceeds (387) | **P** | **P** | **P** |
| S2h | Morality exchange, "Indeed not" (389–391) | **P** | **P** | **P** |
| S3a | Forest story told in full, lightning in a thunderstorm kept (395–417, 515–523) | **P** | **P** | **P** |
| S3b | No people, no intentions, nature conspired (419) | **P** | **P** | **P** |
| S3c | Disembodied *and* abstract voices taught *in the notation* (419) | **p** — story-fire and the pattern conflated (A §4 last para, §6 beat 3) | **p** — disembodied only in the transcription; "abstract" lives on the right column | **p** — three kinds in data; nudge 5 forbids the abstract voice in transcription; no abstract voice named for the forest |
| S4a | Wise man story told in full (423–449) | **P** | **P** | **P** |
| S4b | "An awful lot of extra story… just two lines" / "write it out" (451–453) | **P** | **P** | **P** |
| S4c | Literal solution confined to the two lines (455–463) | **P** — `select` | **P** | **P** — nudge 6 |
| S4d | "Find the second solution" / "What do you mean?" / "The figurative solution" (465–469) | **p** — prints as a block | **p** — 467–469 not shown | **P** — `ask what she means` |
| S4e | Figurative bindings: wisdom, central followers, wider community, mythologising, distorted doctrine (471) | **p** — stand-in table shows tinder and ember, then "…" | **P** — all eight listed | **P** |
| S4f | The player's four objections (473–477) | **p** — prose block, not player acts | **p** — three of four as commands; "so abstract" missing | **P** — four commands |
| S4g | "These are all good questions… fits on both levels" (479) | **P** | **P** | **p/X** — 479 kept, but two invented Katya replies and a scratch line the .md revised out are interleaved |
| S4h | "Ok, I guess" / "But you don't really see it" (481) | **P** | **P** | **P** — plus the dimmed command |
| F1a | Notation is imperative/declarative because perspectives command phenomena (495) | **P** — §0, voice on every event | **P** — carat and brackets | **P** — Katya's speech |
| F1b | Converting requires switching perspective to issue the right imperatives (498) | **P** | **P** | **p** — story 1 on rails |
| F1c | The player's own commands are in the same notation and mappable later (501) | **p** — store only; coda optional | **P** — frames are events; `remember the picking up of the chalk` | **P** — `[You]` band; coda |
| F1d | An event with several witnesses may be named by any of them (504–513) | **M** | **M** | **M** |
| F3a | Manual fudge factors (537) | **P** — stand-in table | **P** — both tinders accepted | **P** — nudge 8 |
| F3b | Wrong mapping attempts nudge (540) | **P** — rule-generated + authored | **M** — nudges exist for *conversion* only | **P** — eight authored |
| F3c | "Which voice fits this story" is a future puzzle, not this one (543) | **p** — Pillaging fail-map is a miniature of it, though cut-first | **P** | **P** |
| F3d | No player-authored voices (546) | **P** | **P** | **P** |

Counts of **M**/**X**: A 1 / B 3 / C 4. Counts of **p**: A 13 / B 7 / C 9. No proposal is complete. B is closest on the first half; C on the second; A on the mechanic's *rules*.

## 2. Per-proposal critique

### Design A (mechanics-first)

Objections, ranked.

1. **The objections are a cutscene.** A §6 beat 5: after `apply the Voice of Fire`, "Katya, I have to say…" prints as a block "(l. 473–477, all four objections, the ash objection last)". The document's principle is that reflection should not "happen 'statically' or in cutscenes or chunks of prewritten prose" (142), and 473–477 are the player character's most important act of reflection in the story. Demand: each of the four objections is a player command (B §6 beat 7 and C §6 do this), built from the mapping the player made; the same for the house mutter (385) and "What do you mean?" (467).
2. **The affective summary is dropped.** The document's `remember` prints the event verbatim "and also we get a description of how the player character remembers it feeling" (53–56), and a sequence's summary is "It felt: – a bit educational, because…" (92–96). A §2 replaces this with the Fire re-speaking the steps and says a sequence "has no summary" before mapping. The Fire's rendition is a good *addition* (it is genuinely "information about the sequence as a whole", 98) but it is not what the document shows. Demand: `remember <event>` and `remember <sequence>` exist under those names and print verbatim + a feeling / an "It felt" list; the Fire's rendition is appended, not substituted.
3. **The player's own history is invisible.** "The parser is the only input; the board is the only display" (A §6). Step one of the mechanic is that "a history of action-consequence pairs be built up sequentially" (30), and footnote 1 says the player's own commands are in the notation (501). Where does the player see their own transcript? Demand: a visible history of the player's commands, in the same notation and voice styling as the board, from which `remember` works.
4. **The disembodied voice is taught one story early.** A §6 beat 2 has Katya say "And now no one. Speak as the fire" in the *house* story. The document places "disembodied and abstract voices" in the forest lesson (419), and the house's burning lines can be consequences, as the campfire's own ash is a consequence of `sleep in tents` (302–306). Demand: in the house story the burning lines are transcribed as consequences (or the family's voice); the forest is the first story that *needs* a bodiless voice.
5. **Colours are per voice, not per chunk of abstraction.** A §6: "colored by voice, step badges appear as placed". The document's colours are "to indicate the distinct chunks of narrative abstraction you're mapping each event to" (152). Voice colour is also demanded (350), so both are needed. Demand: step colour on every mapped event, distinct from the voice marking.
6. **`speak as Fire` conflates the story's fire with the pattern.** A §4: the forest "is where the player first issues commands *as Fire*", and Katya's invented line says the voice you spoke in "was … the one on the right of the board". The document distinguishes the pattern (the right column) from the story (the left, 309–311) and calls 419's lesson "disembodied *and* abstract voices" — two things. Demand: keep an in-story fire voice and the abstract Voice of Fire as distinct data; Katya may *remark* on their kinship; the mechanic must not identify them.
7. **The house gate rewrites Katya.** A §4: after Katya says the details "are not relevant" (387), A's Katya says "Now change your mind about the tinder", and the forest unlocks only after `reconsider`. It is a defensible way to "introduce this concept … gently" (140), but it contradicts her stated indifference unless the line says *why* (because it makes no difference). Demand: keep the gate optional (cut-first tier) or give Katya a line consistent with 387.
8. **The Pillaging fail-map edges into the deferred puzzle type.** A §9 is the best argument in any proposal for 124 ("They might find that they cannot"), but "which voice works for this story" is one the author says "isn't alluded to here" (543). Demand: keep it, keep it optional and *after* the four lessons, never gating.
9. **`reread` renames the document's verb.** 45, 71: `remember`. A §1 keeps `remember` "free for the player's own history" — but the document uses the same verb for both (the green room *is* the player's history). Demand: one verb, `remember`.
10. **Figurative bindings are elided.** A §4's stand-in table shows tinder and ember, then "…"; 471 names five. Demand: all five bindings in data, all eight steps placed in the walkthrough.

Must survive synthesis from A:

- **The legality rules and the incremental judge** (A §4, L1–L4) with rule-generated nudges. This is the only proposal that makes 540 ("wrong attempts … nudge them in the right direction") a *system* rather than a list, and the only one where "They might find that they cannot" (124) can be true.
- **The partial order on steps 1–3** (`s0` l. 4; A §3). Both tinder candidates in the house (385) come *after* the walls and roof are built (324–326); a strict 1<2<3 would make the document's own "acceptable mapping" (383) illegal.
- **Many-to-one, event-level targets with unmapped events** (L2). This is exactly 284–288, 313, 455–463.
- **Apply as a state change with knowledge consequences** (`consider <role>` accumulating "everything that has been tinder", A §4.3). This is the most concrete realisation of 134 anywhere.

### Design B (UI-first)

1. **Mapping has no rules and no nudges.** B §2b/§6: lines are drawn; both tinders "accepted"; nothing is ever refused. Footnote 3 is explicit: "I intend for the player's wrong attempts at mapping to produce messages that nudge them in the right direction" (540). B extends nudges to *conversion* (B §2a, marked "added") and forgets the thing they were promised for. Demand: a legality check on every `draw` (order, participation, one-step-one-target) and authored nudges per role; A §4 or C §6 nudges 1–8 will do.
2. **Mapping has almost no consequences.** 128–136 promise changed conception, "many things seem to fall into place", forced application, and downstream effects on actions and future mappings. B delivers grafted "feelings" and, in story 4 only, which objections are available. There is no `apply` in stories 1–3 and no moment where "a mapping *must be applied*, even if you aren't positive" (132). Demand: explicit `apply` from story 2 on, gated progress (132), and at least one visible change to the story or knowledge on apply (A §4.1–3 or C §4).
3. **"Quite a sad story" is skipped.** Beat 5 goes from "318–342 ghost in" to conversion. 344–346 is the player's first moral reaction and Katya's "Can you find the Voice of Fire within it?" — the question the whole lesson turns on. Demand: 344 as a player command, 346 as Katya's reply.
4. **Three objections, not four.** B §6 beat 7 lists "no fire", "which event is the spark", "ash". 477 also has "The structure of the fireplace is so abstract— the man's wisdom? His 'legitimate following'?" Demand: all four.
5. **467–469 is elided.** "The second? What do you mean?" / "The figurative solution, my dear…" is the reveal that there *is* a second level. Demand: `ask what she means` (C §6) or equivalent.
6. **One step to many targets is permitted.** B §2b: "One step → many targets … legal". The document says "For each step, you draw a line between the step on the right, and *the part* of the story on the left" (311) — singular. Everything not-one-to-one in the text is many-steps-to-one-event plus unmapped events. Demand: a step lands on one target; if phrase-level anchoring is kept, it is optional.
7. **Abstract voices never enter the notation.** B §1: the abstract style (double rule) is reserved for the Voice of Fire on the right. 419 says Katya teaches "disembodied and abstract voices *in the standard notation*", i.e. on the left. Demand: at least one voice used in the forest transcription is of kind `abstract`.
8. **The lesson's *end* is a UI flourish.** "Both columns stay lit for a moment, then solution II flickers — 'But you don't really see it.'" That is prose-by-animation, and the player has done nothing. Demand: "Ok, I guess" is a player command (all proposals agree), and the refusal is recorded in the player's history, not shown as a fade.

Must survive synthesis from B:

- **The board as a projection of the history, and clicking-is-typing** (B §0, §3). This is the only design that makes 501 ("everything that the player does is enacted through issuing commands") *structurally* true: no board state that was not typed; every click round-trips through the parser.
- **The ¶ layer, the cursor row, and `follows`** (B §2a). The campfire's own transcription needs two events from one line (232 → 280–286) and a consequence-only line (234 → 288); B is the only proposal that shows the player *doing* that.
- **The green-room function transposed into the classroom** (B §8): `remember the picking up of the chalk` teaches steps 2–3 on the player's own history before the lesson piles on conversion and mapping.
- **Both forms of the Voice of Fire as collapse/expand of one column** (B §6 beat 1): the statement is the collapsed view, the notation the expanded one. This is the cleanest reading of 182 ("She rewrites this…").

### Design C (narrative-first)

1. **Steps 2 and 3 of the mechanic are absent.** C §9: "events and sequences as objects with a summary not in any event (46–98) are the mapping cells and the coda's transcript". They are not. Nowhere in C can a player `remember the getting of the guy` (45) and see it verbatim, and nowhere is a sequence replayed with "It felt:" (92–96). The author called both halves of the document mandatory. Demand: named events, `remember <event>`, `remember <sequence>` with a feeling and an "It felt" list.
2. **The campfire conversion is a single command.** C §3: "on rails, one command, `convert the story`", justified by "Trivially so" (246). But "Trivially so" answers the *containment* claim (244), not the conversion. Footnote 1 says converting *is* issuing imperatives from the right perspective (498), and 142 forbids doing the core act in "prewritten prose". A player who has never issued a conversion command cannot be expected to "pause" at 348. Demand: every event of every story is issued by the player, even if typeahead offers exactly one option per line.
3. **Mapping targets are prose lines, not events.** C §10: `Mapping = { step: number; line: number }[]`; C §6 maps `to "he grows up and acquires wisdom"`. The document maps *events* (122: "mapping sequences of events to abstract narrative sequences"), and the player's own history — which C's coda puts on the board — has no prose lines at all. Demand: targets are notation events (by nominalised name, 45); prose is a view of them, not the object.
4. **The .md's dialogue is rewritten with lines the author revised out.** C §6 interleaves "Is a hearth less a hearth for being made of people?" (invented) and "It depends how you look at it, my dear" (`s3` l. 193). The final text replaced the scratch line with "These are all good questions, my dear. In time, we will answer them all" (479), and the brief says the .md is authoritative where they disagree. C's own §2 says Katya "never argues"; the invented line is an argument. Demand: 465–481 verbatim in that order; objections may be split into four commands, but Katya's only interjection between them is "Why so, my dear?" (475).
5. **`unmap` leaves a permanent residue.** C §4: "you cannot un-see". As a visual it is fine; if the residue constrains anything, it contradicts "you can *always* change your mind" (140). Demand: the residue is display-only.
6. **The vertical line is never drawn.** C §8's board has the Voice column from beat 0. 309–311: "Next you draw a vertical line, creating a second column. In the second column you list the successive steps". Demand: the player draws the line and the column appears.
7. **The chalkboard form is overwritten.** C §8 beat 0: "each statement becomes its imperative and consequence in place". The brief requires both forms; the document keeps both on the board (166–180 and 185–215 coexist). Demand: both remain visible (B's collapse/expand).
8. **Nudge 5 forbids what 419 may require.** "Not yet, my dear. The Voice of Fire is what we are looking for, not what we are writing" is a fine line, but 419 says abstract voices are taught *in the notation* of the forest, and C names no abstract voice for the forest at all. Demand: name the forest's abstract voice(s) in the data (`the fire`, `the season`, or `time` as kind `abstract`), and do not refuse them.
9. **The UI is under-specified.** C §8's board is one sketch; there is no account of where Katya's dialogue, the player's history, autocomplete, or animation (148) live. Demand: adopt B §1.
10. **A file citation is wrong.** C §2 cites `base_handlers.tsx`, 399; the line is at `src/typescript/demo_worlds/narrascope/reflect/base_handlers.tsx:69`. Minor, but the synthesis should not inherit it.

Must survive synthesis from C:

- **Consequence text on apply and the recolouring of the story** (C §4, §6). "The house is fuel now; you cannot read it any other way" is 128 ("alter how they're able to conceive of … the thing they've mapped") made literal, and cheap.
- **The dimmed `say that you see it`** (C §6). The refusal in 481 becomes something the player *cannot do*, using an existing engine affordance. It is the best single line of UI in the three proposals.
- **Pass-relative nudges** (nudges 6–7): the literal pass refuses "a small circle of seekers" as kindling; the figurative pass refuses "reduced to ash" as ash because "It is spoken for." This is the only place a *prior* mapping constrains a *future* one (134).
- **Katya's two speeches** (C §6) for 350 and 419, in register, with the `s1` l. 33 motto held in reserve.

## 3. Interpretive disputes

**D1. Is the Voice of Fire itself a voice?** All three say yes (A §0, B §1 "double-ruled", C §6 "Is such a voice"). Ruling: yes. It is named a Voice; it has a "perspective" (387: "from the perspective of the Voice of Fire… It knows only… It simply proceeds"); its steps are written in the imperative (185–215); and footnote 1 says every phenomenon has perspectives that "imperatively command them into being" (495). The data type must therefore have `kind: 'abstract'`. What is *not* settled is whether the story-level `the fire` in the forest is the same voice (A says yes, C forbids it). 419 names "disembodied and abstract voices" as two things taught in the notation, and 309–311 keep the pattern on the right and the story on the left. Safest: keep them distinct objects; Katya may remark on the kinship; no rule identifies them and no nudge forbids the player from lending the forest an abstract voice.

**D2. Is conversion a puzzle or transcription?** A: enact it command by command with typeahead. B: a segmentation-and-voice puzzle with `follows`. C: rails on story 1, voice choice only thereafter. Ruling: the document demands that the player *issue the imperatives from the right perspective* (498) and that the core work not be prose (142); it never demands freedom of segmentation. So: every event is player-issued (C's rails contradict 498); the *puzzle* content of conversion is the voice (348, 498); B's segmentation is a permitted addition, and its representational needs (two events from 232; consequence-only 234, 242) are demanded regardless.

**D3. Can both wise-man solutions be applied at once?** All three: no, one applied, one held/set aside, both visible. Ruling: correct, on two grounds. "Entertain two apparently mutually exclusive interpretations *in turn*" (140) is sequential; and a mapping's bindings are functional (the ash cannot be a body and a doctrine at once, 461 vs 471). But 479 ("fits on both levels") and 152 ("see the whole mapping") require that the *end state* shows both, side by side, one lit and one dimmed. B's "solution II flickers" and C's erasing coda both risk losing that end state; the synthesis must not.

**D4. Does voice-switching matter for mapping?** A: never (L5). B: silent. C: story voices do not matter; the *lent* voice (literal vs figurative pass) does. Ruling: for the Voice of Fire in this demo, story voice must not enter legality: it "knows nothing of the purposes or intentions" (387), and Katya's "Indeed not" (391) is the lesson. Voice matters for *transcription* (498) and must be *recorded* on every event (495: "important later, both game-mechanically, and narratively"; 510–513: several valid names for one event). C's pass-relative nudges are consistent with this: they key on which solution is applied, not on who spoke.

**D5. Must the green room / The Pillaging ship?** A: green-room content no, Pillaging as a failing mapping yes. B: green-room *function* yes (classroom actions), Pillaging no. C: neither, Pillaging in `notes`. Ruling, in two parts. (i) Green-room *content* is not demanded: the author calls it "purposefully simple, contrived" (28) and "ham-fisted" (136). Green-room *function* is demanded, because steps 2–3 are half of "the full contents described by the doc": somewhere the player must `remember` one of their own events verbatim with a feeling (45–56) and a sequence with an "It felt" list (71–98). B's classroom transposition is the cheapest way. (ii) The Pillaging: 102 says abstract sequences (plural) are objects, and 108–120 defines this one in full; a demo with one voice shows a singleton, not a type. Demand it *as data and as a visible object* (on the shelf, in `notes`); A's failing mapping is the recommended optional extension because it is the only way 124 ("They might find that they cannot") is ever true — but it stays off the critical path, after story 4, since "which voice works" is deferred (543).

**D6. Are the player's own actions mapped in the demo?** A: optional coda. B: remembered, not mapped. C: shown in the notation, "Not yet". Ruling: not demanded — "later in the game" (501). Demanded: the player's commands visibly *are* events in the same notation, with a voice marking (`You`), so that the claim at 501 is checkable on screen. C's retroactive `[You]` band and B's `remember the picking up of the chalk` both satisfy this; A's coda is optional-more.

**D7. Reuse the narrascope world?** All three: reuse the engine, replace the world. Ruling: agreed, and the document supports it: 148 lists engine features ("my engine has word-highlighting, autocomplete, animated text, expanding text…") that must survive, and 158 calls the lesson "a segment of the game", so a stand-alone classroom (C §7) is faithful. Consider/scrutinize/hammer must not appear as vocabulary.

**D8. Strict or partial order on steps 1–3?** A: partial (`s0` l. 4). B, C: not stated (implicitly strict). Ruling: partial, and the .md *requires* it despite listing the steps strictly: both tinder candidates in the house (385) are laid after the frame and roof (324–326), and the player still "find[s] an acceptable mapping" (383). 4–8 stay strictly ordered (`s0` l. 12–18: "happen in succession").

**D9. Who speaks the house's burning lines?** A: `the fire`, taught early. B: `follows` under the children's `hurl`. C: consequences, or the family. Ruling: consequences (the document's own device at 286–288 and 302–306), so that 419 remains the first story that *needs* a bodiless voice.

**D10. Scratch dialogue versus the .md.** C reinstates `s3` l. 193. Ruling: the .md wins (brief), and 479 is the author's deliberate revision.

**D11. Is `apply` an explicit act?** A: always. B: story 4 only. C: from story 2. Ruling: 132 ("a mapping *must be applied*, even if you aren't positive") requires a moment where the player applies under uncertainty and cannot proceed otherwise; the house story (383–385) is that moment. Auto-apply on the campfire is acceptable.

## 4. Demanded synthesis

1. A visible history of the player's own commands, in imperative/declarative form, with a voice marking (5, 28–30, 495, 501).
2. Every event has a nominalised name derived from its command ("the getting of the guy", 45; "the laying of the tinder", 166), with ordinal disambiguation for repeats (58; the two `sing`s at 290, 298).
3. `remember <event>` prints the event verbatim plus how it felt (47–56). `remember <sequence>` replays every event verbatim plus an "It felt:" list of reasons not present in any event (71–98).
4. Sequences are created by the player: by transcription (248) and by selection of a sub-range (455–463); each has a name.
5. `AbstractSequence` is a type; the Voice of Fire and The Pillaging (108–114) both exist as instances; The Pillaging is at least visible, never on the critical path (102, 116, 543).
6. The eight Voice of Fire steps are stored once and shown in both forms, the statement (166–180) and the notation (185–215), simultaneously visible via collapse/expand; each step is a rereadable object (V2).
7. Every event of every story is issued by the player as an imperative in a chosen voice; the consequence is authored (248, 348, 495, 498). Typeahead may narrow to one option.
8. Transcription supports two events from one prose line (232 → 280–286) and consequence-only lines (234 → 288; 242 → 306).
9. Voice is a first-class property of every event; embodied, disembodied and abstract kinds exist and are visually distinct in the notation and in the prompt (350, 419, 495); voice switches are a player act with a visible mark (348–352).
10. An event may carry more than one voice, and the data type permits it even if the demo never exercises it (504–513).
11. Mapping legality: a step lands on one target (311); many steps may share a target (284–288, 455–463); events may remain unmapped (313); 4→5→6→7→8 strictly ordered, 1–3 unordered among themselves but before 4 (`s0` l. 4–18; 385 with 324–326).
12. Every wrong placement produces an authored nudge, never a bare refusal (540); a per-story stand-in table is the "manual fudge factor" (537).
13. Story voice never enters mapping legality for the Voice of Fire (387, 391).
14. `apply` is an explicit act from the house story on; the next story is gated on it; the house apply must be possible while the tinder is genuinely undecided (132, 383–385).
15. Applying changes something visible beyond a line: the story is re-read in the pattern's terms and/or a knowledge topic accumulates (128, 130, 134, 136).
16. A prior applied mapping constrains a later one at least once (134): the literal solution's ash is "spoken for" in the figurative pass (C nudge 7).
17. Any binding, line, or application can be undone by a player command with no permanent mechanical residue (140).
18. The wise man requires the literal solution applied, then set aside, then the figurative one applied; both remain on the board side by side at the end, one lit, one dimmed (140, 152, 465–481).
19. The literal solution admits only the two lines at 457 and 461; the figurative solution binds wisdom, central followers, wider community, mythologising, distorted doctrine (471), and accepts either death or myth as the spark (477, 537).
20. Every line the player character speaks in 160–481 is a player command: 244, 313, 344, 348, 385, 389, 451, 467, 473–477 (four separate objections), 481 (142). Katya's lines are verbatim from the .md, in order; the scratch's revised-out lines do not return (479 over `s3` l. 193).
21. Both boards are visible side by side as the mapping is built; each mapped event carries the colour of the abstract chunk it maps to, distinct from its voice marking; text expands and collapses (152).
22. The engine's existing affordances survive: word highlighting, autocomplete, animated text, expanding previous entries (148); every click round-trips through the parser (B §3; 501).
23. In the house story the burning lines are transcribable without a bodiless voice; the forest transcription uses at least one disembodied and one abstract voice (419; D9).
24. "Ok, I guess" is a command; "say that you see it" is offered and dimmed (481, 142).
25. The narrascope world's vocabulary does not appear; the engine does; the classroom stands alone as "a segment of the game" (148, 158).
