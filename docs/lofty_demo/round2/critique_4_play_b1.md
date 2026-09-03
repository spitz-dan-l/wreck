# Critique 4 — playing the B1 build (player and textualist)

Judged against `dist/posts/puzzle_lofty.md` (bare line numbers), `SPEC.md`
v1.1 (§n) and `IMPLEMENTATION_NOTES.md`. Read in the order given; then played
`PLAY_WORLD=fire node scripts/play.js …` from every beat of the acceptance
script with my own deviations: every trap, wrong voices, wrong maps, apply
with holes, set aside and resume at odd moments, both house tinders, both
wise-man sparks, objections out of order, every `remember` that was offered.
`t.N` cites a line of `round2/transcript_b1_headless.txt`. Command sequences
below are given as "prefix N" = the first N commands of
`acceptance_script.json` (numbered as in the 169-command version the
transcript was made from; the current file inserts `collapse the unmapped`
after the wise man's second `apply`, so add one to any N past 160), then
the commands I typed. `npm`'s fire tests
(`test_fire_judge`, `test_fire_walkthrough`) pass: 33 passing.

The short version: the document is on the board almost whole, in order, in
the right mouths, and the judge's nudges are the best-written thing in the
build. Three things must be fixed before B2 builds on them: the
consequence-only paragraphs are glued onto the wrong events (which also
turns the Fire's rendition into noise), you cannot change your mind after
`apply` in any story but the last, and a sentence of l. 419 is silently
dropped.

---

## 1. Fidelity table (l. 160–481)

| .md | Beat | Speaker / form | Transcript | Status |
|---|---|---|---|---|
| 160 | Classroom opening | narration | t.1 | verbatim |
| 162 | "It's a pattern in abstract phenomenology…" | Katya, on `listen` | t.11 | verbatim |
| 164 | "She starts by writing a series of statements…" | narration | t.12 | verbatim |
| 166–180 | The eight chalk statements | board | t.13–20 | verbatim, in order |
| 182 | "She rewrites this in the standard notation…" | Katya/narration, on `listen` | t.25 | verbatim |
| 185–215 | The eight steps in notation | board | t.26–49 | verbatim; interleaved under each chalk line (§8 collapsed view) |
| 218 | "Now," she says. "Consider this story:" | Katya, on `listen` | t.54 | verbatim |
| 220–242 | Campfire ¶1–12 | prose | t.55–66 | verbatim, in order |
| 244 | "Ah, I see that the story from the Voice of Fire…" | **player command** `say that the Voice of Fire is contained in this one` | t.71 | verbatim |
| 246 | "Indeed, my dear. Trivially so. Show it now…" | Katya | t.72 | verbatim |
| 248 | "She beckons you up. First you convert…" | narration, on `pick up the chalk` | t.77 | verbatim |
| 251–306 | Campfire notation e1–e12 | **player commands**, consequences | t.98–163 | verbatim, except: l. 284's trailing period dropped (declared); l. 288 and l. 306 attach to the wrong events too (**ALTERED**, D1) |
| 309 | "Next you draw a vertical line…" | narration, on `draw a vertical line` | t.168 | verbatim |
| 311 | "In the second column you list…" | narration | t.169 | verbatim |
| 313 | "All set," you say. "Structurally nearly identical…" | **player command** `say all set` | t.267 | verbatim |
| 315 | "Indeed," she agrees. "Close enough…" | Katya | t.268 | verbatim |
| 318–342 | House ¶1–13 | prose, on `listen` | t.336–348 | verbatim |
| 344 | "Well," you say, "That's quite a sad story." | **player command** `say that it is a sad story` | t.353 | verbatim |
| 346 | "Indeed. Can you find the Voice of Fire within it?" | Katya | t.354 | verbatim |
| 348 | "Let's see…" … "It's the children's." | **player command** `ask what the right thing to do is` | t.440 | verbatim (whole paragraph, narration included) |
| 350 | "Indeed," says Katya. She shows you how to indicate voice switches… | Katya, narration | t.441 | first sentence verbatim; second sentence **MISSING** (declared; D3) |
| 352–378 | The Family: `pack` … `dig a hole` | **player commands**, consequences | t.380–410 | verbatim |
| 383 | "You complete the translation… Nevertheless, you find an acceptable mapping." | narration | t.485 (first two sentences, on `draw a vertical line`), t.534 (rest, on `apply`) | verbatim, split as §5.2 says |
| 385 | "Quite a bit different, this time," you mutter… | **player command** `object that there is no clear tinder` | t.579 | verbatim |
| 387 | "Quite right," says Katya. "But these details…" | Katya | t.580 | verbatim |
| 389 | "And it seems to know nothing of the morality…" | **player command** | t.585 | verbatim |
| 391 | "Indeed not," she says. | Katya | t.586 | verbatim |
| 393 | "Katya continues the lesson with another story…" | narration, on `say all set` | t.591 | verbatim (but the player "says all set" and says nothing; I4) |
| 395–417 | Forest ¶1–12 | prose | t.596–607 | verbatim |
| 419 | "You repeat the exercise. There are no people… Katya teaches you about disembodied and abstract voices…" | narration | t.721 (sentence 1, on `draw a vertical line`); t.766 (sentences 2–3, on `apply`) | sentence 4 **MISSING**, undeclared (D3) |
| 421 | "And now, the final story for today's lesson," says Katya… | Katya, on `say all set` | t.787 | verbatim |
| 423–449 | Wise man ¶1–14 | prose | t.792–805 | verbatim (the .md's "interpretted" kept in the prose; normalised only in the authored consequence) |
| 451 | "That's an awful lot of extra story," you mutter… | **player command** `say that the Voice of Fire is contained in just two lines` | t.960 | verbatim |
| 453 | "Indeed. So, write it out," says Katya. | Katya | t.961 | verbatim |
| 455–463 | "You do. Just [¶9] and [¶11] participate in the mapping." | narration, on `apply` | t.998–1002 | verbatim |
| 465 | "Now, my dear, please find the second solution," says Katya. | Katya | t.1003 | verbatim; **printed before the Fire's rendition of the first solution** (D9) |
| 467 | "The second? What do you mean?" | **player command** `ask what she means` | t.1041 | verbatim |
| 469 | "The figurative solution, my dear…" | Katya | t.1042 | verbatim |
| 471 | "It takes you some time, but you gradually work it out…" | narration, on `apply` | t.1088 | verbatim |
| 473 | "Katya, I have to say, it seems this second solution hardly fits…" | **player command** `object that there is no fire` | t.1109 | verbatim |
| 475 | "Why so, my dear?" | Katya | t.1110 | verbatim |
| 477 | The four objections | **four player commands** | t.1111, 1116, 1121, 1126 | words verbatim, in order; the paragraph's quotation marks dropped on all four (**ALTERED**, I6) |
| 479 | "These are all good questions, my dear…" | Katya | t.1127 | verbatim |
| 481 | "Ok, I guess," you mutter. But you don't really see it. | **player command** `say Ok, I guess`, consequence | t.1178–1179 | verbatim; `say that you see it` is Locked (verified by the walkthrough test's typeahead assertion and absent from the Available list) |

Every player-character line at l. 244, 313, 344, 348, 385, 389, 451, 467,
473–477, 481 is a command. Katya has no line between the .md's lines: her
only non-.md speech is the four §10 blocks and the nudges. The four stories'
events, voices and mappings match §5 and the .md: the campfire is nearly
1:1 with e8 absorbing 4–6; the house switches voice at ¶9 with the pause
where l. 348 puts it, and the rag/thatch choice is real; the forest has no
embodied voice and both thin kinds; the wise man's literal solution touches
only e9 and e11 (l. 455–463) and the figurative one lands on e2, e4, e5,
e12 (or e8), e13, e14, e15 as l. 471 describes. The eight steps are on the
board in both forms from the second `listen`, and each is rememberable.
The ending lands: the last Available line is `say Ok, I guess`, its
consequence is l. 481 whole, and the "unconvincing" feeling is grafted only
then (t.1210 vs t.1160).

## 2. Invented sentences

Everything in the transcript that the .md does not say, with its license:
the shelf sentence (§10); the campfire apply line "The evening in the woods
and the hearth on the board are the same shape." (§5.1); the Pillaging's
three consequences (§5.5 *author*); the house's e7–e13, the forest's
e1–e12 and the wise man's e1–e10, e12–e15 consequences (§5 *author*; every
required fragment — thatch, dead trees and brush, "…and a sapling rises
forth.", "His death becomes mythologized." — is present); Katya's four
speeches and their two stage directions (§10 verbatim); every nudge I
triggered — V1–V4, L1, L3, L6, both L7 wordings, the eight authored
(story, step, event) nudges and the six default step nudges (§10 verbatim);
the mark "His death. Very well. Hold that." (§5.4); the Fire's rendition
lines and the `— the <role>` annotations (§7, generated); the five "It
felt" lists, the generated "like the Voice of Fire, because the tinder
was…" line, "It felt like nothing yet. It has not been read.", "It felt a
bit untrue, because it was.", "It felt like nothing in particular." (§5,
§7, §10); "The tinder has been: …" (§7); the four board titles (§6); the
coda (§10). Nothing unlicensed is said. The build says *less* than its
license at l. 350 and l. 419 (D3).

## 3. The player's experience

**Decisions.** At the board there is a genuine decision at every mapping
beat, and — this matters — the wrong choices are all utterable. During
transcription the decision is thinner: one imperative per row, so the
typeahead is the answer. That is what §13 ruled, and l. 498 is served by
the dozen utterances as the friends before the pause at ¶9; but the player
should know that the campfire's transcription is fourteen commands of
reading the typeahead aloud, with exactly one place (¶8, `spread to the
kindling`) to be wrong.

**The nudges, as I hit them.** *Own terms* = corrects in the Voice's
vocabulary and points somewhere; *costume* = a refusal wearing "my dear".

- Own terms, and the best of them: "The singing is not ash. What is left behind, afterward, when no one is tending?" (s8 → second singing); "The match is a small thing. Look for the hearth burning bright and hot, for a time." (s7 → light a match, quoting l. 211 back); "Lit, but not yet touched to anything. Find the touch." (s4 → light a match — it teaches the remainder mechanic); "Wood that is cut is not yet laid." (s1 → cut wood); "A seed is not laid to burn. What here is dry?" / "Dry is not lit. What strikes?" (the forest pair reads as a chain); "Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep." (wise man, first pass — l. 451 turned into a hint); "It burns here, my dear. Where was it built?"; "That is the first solution's ash. It is spoken for. Where does the wisdom end up?"
- Own terms, plain: the L3 order nudge ("…It does not reach the firewood before the kindling has caught.", reachable as §4 wanted); the L6 sharing nudge (its second sentence, "What was laid first, and what over it?", is the hint); "The tinder is the first thing to catch. Nothing here catches."; "Wood, my dear. You are looking for what will be fuel."; V1's "Would the family light the rag? Change the voice, then command."; V2, V3; V4's "Lend the story a fire of its own." (which the forest's "It felt" later cashes in).
- Half costume: the generic L7 "That line is spoken for, my dear. It belongs to the first solution." — the only pointer is "first solution".
- Costume: L1 at apply, "The Voice of Fire does not skip, my dear. Something is missing from the board." It does not say which step (I7).
- Slightly off: the default s4 "What was touched to the tinder? Find the touch." on `dying unexpectedly` in the first pass.

**Where it drags.** (1) The wise man's transcription: twenty-six commands,
eleven of them `speak as`, each `speak as` printing nothing. It is the
.md's exercise, but in text it is a long corridor. (2) The house's six
`let it follow`s in a row (t.428–434, 468–482), each printing an empty
frame: the player issues a command and nothing appears where they typed it
(the ¶ is appended to the previous frame, retroactively). Four blank
frames in a row after `scatter` is the deadest stretch of the demo. (3) The
Fire's rendition in the house (t.535–578): the same four burning lines
printed five times, forty-four lines for eight steps, because of D1. (4)
The `remember` outputs, which say everything twice (I2).

**Where a first-timer is lost.** (1) Campfire mapping: the typeahead offers
96 `map` rows plus 13 `collapse`s. The step slot is first, so a player who
picks a step sees twelve events; that is workable, and the traps must be
utterable, so this is a job for the board UI, not the grammar. (2) The
forest's open board: eight `speak as` and no prompt, and choosing wrong
(`speak as the fire` at ¶1) gives a board with no imperative at all and no
word from anyone; the only way on is to try another voice. (3) The
wise-man's `apply` with a hole: "Something is missing" and 120 map rows.

**Does "change your mind" happen?** Once, and it is scripted: `map the
sparking of the tinder to the dying unexpectedly` → "His death. Very well.
Hold that." → then `… to the adjusting of his words`, silently, and the
objection's wording follows whichever you kept. That moment is good and it
is the document's. The house's tinder choice is a real choice but only
*before* `apply`: after `apply the Voice of Fire` the typeahead is `object
that there is no clear tinder` and `set aside the mapping`, and after `set
aside` it is `resume the mapping` and nothing else. The campfire and forest
are the same. So in three of four stories the player cannot reinterpret
after committing, which is the sentence l. 140 is about. See D2.

**`remember`.** `remember <event>` gives the command and consequence
verbatim and then a feeling — l. 44–56's shape, minus its header line "It
went like this:" (l. 47, 73), which the build never prints (D5). `remember
<sequence>` replays and closes with "It felt:" and the list — l. 71–96's
shape, and the generated line ("like the Voice of Fire, because the tinder
was his wisdom") is the document's l. 98 promise (information about the
whole not in any part). But it is noisy: the touching of the flame prints
three annotations and then three feelings that repeat them (t.322–331), and
in the campfire the generated line is "because the tinder was the tinder"
(t.316). `remember <role>` is exactly l. 136's downstream effect and the
best single line in the build: "The tinder has been: the tinder, in the
campfire story; the oil-soaked rag, in the house in the woods; the dead
brush, in the forest fire; his wisdom, in the wise man's story." — and it
honestly shrinks when you set a mapping aside.

**The Fire's rendition on apply.** In the campfire and forest it is
meaningful: eight lines in the pattern's vocabulary with the story's own
sentence under each, and the derived participants ("the dead brush", "the
lightning", "the forest, as ash") are the summary l. 66 asks for. In the
house and the wise man's first pass it is noise, because five steps share
one event and the event's consequence (five paragraphs, in the house, after
D1) is printed five times. The literal wise man prints ¶11 five times in
full. Group by event (I1).

**"It felt" lists.** All earned. Campfire: "a bit neat, because the fire
was built to be burnt" is l. 211 in one word. House: "unfinished, because
the tinder is still two things" is the only place the rag/thatch choice is
spoken of afterwards, which is right (§13: Katya says nothing). Forest: "a
bit familiar, because the thin voices sounded like the one on the right"
pays off V4. Wise man: "a bit relieving, at first, because only two lines
burned; then not, because all of them did", and "unconvincing" grafted at
the right moment. "The two lines": "contained, because everything else
stood outside."

**Register.** Flat and dry, as the .md is. The nudges are its best prose
and they do not wink. Two lines lean literary — "The evening in the woods
and the hearth on the board are the same shape." and the coda — but both
are single sentences and neither jokes. "In a colour you have not seen her
use" is the one flourish, and it is doing work (the new voice kind).

## 4. Defects (must fix, ranked)

**D1. Consequence-only paragraphs attach to every event of the preceding ¶, not the last one.**
Sequence: prefix 22, `remember the lighting of a match` → prints "The match
head flickers into a tiny flame." *and* "The fire starts, spreading first
to the kindling and then the logs." (l. 288 belongs to e8, l. 286–288).
Also: prefix 34, `remember the campfire story` → the second `sing` carries
"The remaining embers fizzle out…" (t.245–246); prefix 73, `remember the
lighting of the rag` → the rag carries ¶10–13 (t.535–540 in the rendition:
"lay the tinder — the oil-soaked rag" followed by the whole burning); `hurl
it onto the roof` likewise. This contradicts l. 282, 300, 334 and the
implementation note itself ("attach to the last event whose ¶ precedes
them"). It is also the root of the house rendition's noise. Change: in
`data/index.ts` `followed_lines`/`event_consequence`, a follows ¶ attaches
to the single event with the greatest index whose `prose` is less than the
follows ¶ — not to every event whose `prose` equals the preceding ¶. Add a
test: `remember the lighting of a match` must not contain l. 288;
`remember the lighting of the rag` must not contain l. 336.

**D2. No change of mind after `apply` in the campfire, house and forest.**
Sequence: prefix 73 (house applied with the rag), `set aside the mapping` →
typeahead: `resume the mapping` only; `map the laying of the tinder to the
laying of walls and a roof` → not accepted. Same at prefix 31 and 107.
l. 140 ("you can *always* change your mind"), §0.6, §6 (`erase … during
mapping`; `set aside … on any applied mapping`) are not met: the only
reinterpretation possible anywhere is the wise man's, and it is scripted.
The notes declare "set aside on a story with no second-pass table opens no
new mapping"; I reject that reading. Change: when the voice has no
second-pass table for this sequence, `set aside the mapping` returns the
mapping's status to `open` with its placements kept (badges hollow), the
roles entries and rendition dropped as now, and `map`, `erase`, `apply`
offered again; `apply` re-applies. `resume the mapping` may stay as the
no-edit shortcut. No L7 is involved because there is no second pass. The
house is the story where this matters: a player who applied the rag should
be able to try the thatch after hearing l. 387.

**D3. l. 419's last sentence is never printed (undeclared).**
"Katya teaches you about disembodied and abstract voices in the standard
notation." appears nowhere (grep of the transcript). Change: print it as a
narration frame immediately after the abstract-voices speech (the first
`speak as` of an abstract voice), by which time both speeches have been
given; it is the .md's own summary of what just happened. Do the same for
l. 350's second sentence (declared dropped; see §5.2): print "She shows you
how to indicate voice switches using visual notation." after "She draws a
short bar across the column…", so l. 160–481 is on the board without a
hole.

**D4. Objections are offered while the first solution is the applied one.**
Sequence: play through `object that there is no fire`, then `set aside the
second solution`, `resume the first solution` → typeahead: `object that the
fireplace is too abstract`, `set aside the first solution`. The notes say
"the objections only while the second solution is applied"; the build does
not do that, and objecting that "this second solution" has no fire while
the literal pyre is lit is wrong. Change: `objections_open` in
`puffers/classroom.tsx` must require `applied_mapping(w, WISE_MAN)?.pass ===
'second'`.

**D5. `remember` omits the document's own header, "It went like this:" (l. 47, 73).**
Sequence: any `remember <event>` or `remember <sequence>`. The .md shows
the mechanic's exact output form twice and the build drops its first line.
Change: print "It went like this:" before the replay, for events and
sequences alike; the roles' "The tinder has been:" and the abstract
sequences keep their forms.

**D6. The disembodied-voices speech names the seed whichever voice was chosen.**
Sequence: prefix 78, `speak as the fire` → "Who takes root, my dear? … She
writes THE SEED above the line…" while the player is speaking as the fire,
and ¶1 then offers no imperative. Change: fire the speech on the first
`speak as` of a disembodied voice *that has the cursor ¶'s line* (the seed
at ¶1); a disembodied voice with no line at the cursor prints nothing and
does not consume the speech. Same guard for the abstract speech (the season
at ¶2 before time at ¶6).

**D7. `remember the Voice of Fire` shows the notation before Katya has written it.**
Sequence: `listen`, `remember the Voice of Fire` → all of l. 185–215 print,
one `listen` before l. 182. Change: before the second `listen` print only
the chalk form; after it, both.

**D8. The coda is inside the `say Ok, I guess` frame.**
Sequence: after `say Ok, I guess`, `remember the saying of Ok, I guess` replays
"Beneath the board, in your own colour, is the afternoon…" as part of what
you said. The coda is narration after the last event, not its consequence
(§9: "one flat sentence, no command follows"). Change: emit the coda as its
own root node after the frame, so the remembered event ends at "But you
don't really see it." and then "It felt a bit untrue, because it was."

**D9. l. 465 prints before the Fire's rendition of the first solution.**
Sequence: prefix 147 (t.998–1024). Katya asks for the second solution and
then the Fire speaks the first. Change: order the apply frame as apply text
(l. 455–463), the rendition, then l. 465 as its last paragraph — or make
l. 465 a separate frame after the rendition. §5.4 says l. 465 is the apply
text's *last* paragraph; the rendition is part of the apply's consequence.

## 5. Improvements (should fix)

**I1. Group the rendition by event.** When several steps land on one event,
print the step lines together and the consequence once:

```
> spark the tinder — the ember
> spread to the kindling — the flame
> spread to the firewood — the blaze
    The tinder burns quickly on contact with the flame.
    The fire starts, spreading first to the kindling and then the logs.
```

With D1 fixed, the house rendition falls from 44 lines to about 20 and the
literal wise man from 45 to 12. Nothing authored is added.

**I2. One feeling line per event in `remember <event>`.** The annotations
(`— the ember`, `— the flame`, `— the blaze`) already say what the feeling
lines repeat. Keep the annotations on the board and in the sequence replay;
in `remember <event>` print one feeling in l. 53's form: "It felt like the
ember, and the flame, and the blaze, in the Voice of Fire." For a single
role: "It felt like the tinder, in the Voice of Fire."

**I3. The campfire's derived tinder.** "because the tinder was the tinder"
(t.316) and "The tinder has been: the tinder, in the campfire story" are
tautologies. §7's own example says "a patch of tinder, in the campfire
story"; use §5.1's consequence words: s1 "a patch of tinder", s2 "the
kindling", s3 "the logs" (keep), s4 "the ember" → "a single spark"? No —
keep the ember; only the tinder is tautological. Change one table entry.

**I4. `say all set` in the house and forest says nothing.** The player
issues `say all set` and the consequence is l. 393 / l. 421 with no "All
set" — a speech command that speaks no line, which breaks the rule that
every player line is a .md line and every command is a player line. The
.md gives the player nothing to say at those two moments; give them
something to *do*: `put down the chalk` → l. 393 (house), l. 421 (forest).
Keep `say all set` for the campfire (l. 313) and for the wise man nothing
(the objections close it).

**I5. `let it follow` should show what followed.** Print the appended ¶ as
the frame's consequence with a following mark ("↳ The fire starts…"), while
still attaching it to the previous event in knowledge. Four blank frames in
the house are the worst stretch of the transcript; in B2 the hole placement
may hide this, but the text form should not be blank.

**I6. Keep the quotation marks on l. 477.** Print each objection as a
quoted sentence: `"There's no fire, no wood, no burning directly involved."`
… `"…more structured than a pile of ash."` The .md quotes them; the split is
§10's, the marks should survive it.

**I7. Let the L1 nudge name the hole.** Proposed, rule-generated: "The
Voice of Fire does not skip, my dear. The sparking of the tinder is not on
the board." (first unplaced step).

**I8. A wrong voice at a ¶ should say something.** Prefix 78, `speak as the
fire`: nothing prints, nothing is offered. Proposed transcription nudge in
V1's family: "The fire has no line here, my dear. Who acts?" (forest and
wise man; the house's voices always have lines).

**I9. Quote the mark.** `"His death. Very well. Hold that," says Katya.` —
§4 calls it a line Katya says; bare, it reads as the Fire's.

**I10. Record the spelling normalisation** of l. 449 in e15's consequence in
the notes, so the verbatim test's exemption is on record.

## 6. Spec conformance

**Undeclared deviations from v1.1** (§4–§10): follows ¶s attached to every
event of the preceding ¶ (§5, §7; D1); no way back to `map`/`erase` after
`apply` in first-pass-only stories (§0.6, §6, §7; D2 — the ruling is
declared, its consequence for l. 140 is not); l. 419's last sentence
unprinted (§9 beat 3; D3); objections offered under the first solution
(§9 beat 5; D4); the disembodied speech keyed to kind but worded for the
seed (§5.3, §10; D6); the notation rememberable before l. 182 (§9 beat 0;
D7); the coda inside the last frame (§9 coda; D8); l. 465 before the
rendition (§5.4, §7; D9). Two spec errata, not build defects: §4's
demonstration says steps 1 and 2 on `gather` yield L6, but under the
mandated order they yield L4, which is what the build does; §9 beat 0 says
the notation appears collapsed and `expand the steps` reveals it, while B1
shows it expanded with `collapse` offered (display-only; B2's).

**Declared deviations, judged.** *Accept*: the L3→L7→L4→L6 order and
`violations()`; no load-time L6 lint; silent re-`map` (the script's house
s1 e9→e11 demonstrates it); l. 284's period; the type additions,
string roles, Pillaging role names, the voice/sequence name coincidence;
the spark on `light a match` rejected by L4 with the authored nudge
(better play than a silent placement); the fifth house mapping (thatch
tinder, lit rag as spark — l. 385 is satisfied either way); no engine
changes, scene gating, the Locked verb kept Available; the B1 story-tree
shape (B2 owns §8); what `draw a vertical line` prints in each story; the
wise-man ordering (`map` after l. 451, `set aside` after l. 467, nothing
after l. 481); the house's `say all set` needing l. 385 and 389; `resume`
only while nothing is applied; objection 3's wording by placement (played
both); `remember today's lesson` deferred (§0.8 does not require it);
`expand`/`collapse` printing nothing; knowledge from board open. *Accept
the rule, fix the build*: follows attach to "the last event whose ¶
precedes them" (D1); objections only under the second solution (D4); the
forest speeches by kind (fix the text, D6); `remember the Voice of Fire`
from the first listen (gate the notation, D7); `remember <event>`'s
annotations plus feelings (reduce, I2). *Reject*: dropping l. 350's second
sentence "because the speech is that showing" — print it (D3); "set aside
on a story with no second-pass table opens no new mapping" (D2).

## 7. Verdict

As a text, the B1 build is the document: I could not find an invented
sentence outside §1/§10's list, every character line is a command, Katya
never speaks between her lines, and the ending is earned in the only way
the .md allows — the player says the thing, and the consequence is that
they don't see it. The judge's nudges are the strongest new writing in the
project and they are in the Voice's own terms almost everywhere; the traps
are genuinely utterable; `remember the tinder` at the end is the mechanic
of l. 122–136 in one line. What is wrong is structural and small in code:
the follows paragraphs are glued to the wrong events, which corrupts
`remember` for four events and makes the house's rendition unreadable;
after `apply` the player is locked out of their own board in three of four
stories, which is the one design principle the essay states in italics;
one sentence of l. 419 is silently missing; and objections leak into the
literal solution. Fix D1–D4 before B2 lays the board over this, because B2
will inherit all four; D5–D9 and I1–I6 are an afternoon and make the text
read like l. 44–98 instead of like a log. Nothing here argues against the
design; it argues that the build is two rules and two sentences short of
it.
