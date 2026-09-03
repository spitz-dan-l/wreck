# Critique 6 — playing the B3 build (round 3, fresh eyes)

Judged against `dist/posts/puzzle_lofty.md` (bare line numbers), `SPEC.md`
v1.2 (§n), `round2/critique_4_play_b1.md` (its D1–D9, I1–I10) and
`IMPLEMENTATION_NOTES.md`. Read in that order, the story twice; then played
`PLAY_WORLD=fire node scripts/play.js …` from every beat of
`round2/acceptance_script.json` (184 commands; "prefix N" below = its first
N commands) with my own deviations: every trap, every wrong voice at every
¶, every `remember` at every stage, `set aside`/`resume`/`erase`/re-`map` in
every story after `apply`, all five house mappings, all six forest mappings,
both wise-man sparks, the objections around set-aside and resume, every
`expand`/`collapse`. I also ran a mechanical diff both ways: every line of
l. 160–481 against the full transcript, and every transcript line against
the whole .md. `undo` is not available headlessly and was ignored.

The short version: all nineteen round-2 items are fixed, sixteen exactly as
asked and three differently in ways I accept. The document is on the board
whole, in order, in the right mouths; nothing unlicensed is said except one
bar label. What is left is one structural defect at the end (setting aside
the second solution opens a mapping that cannot be completed, and its
nudges then blame the wrong solution), one loss-of-work bug, one grammar
bug, and smaller things about what re-applying prints. On the spirit: the
build makes you *find* far more than it makes you *reinterpret*, and the
house — the story built for a choice — records the choice without ever
making it matter.

---

## 1. Regression: critique 4's D1–D9, I1–I10

| # | Critic's sequence, replayed | Result | Status |
|---|---|---|---|
| D1 | prefix 33, `remember the lighting of a match`; `remember the second singing`; prefix 76, `remember the lighting of the rag` | The match prints l. 282 only; the second singing l. 300 only; the rag its own line only. l. 288 is on the touching, l. 306 on the sleeping, ¶10–13 on the scattering. | **fixed** |
| D2 | prefix 76, `set aside the mapping`, then re-`map` | `map`, `erase`, `apply`, `resume the mapping` offered; placements kept. The critic's exact next command (`map the laying of the tinder to the laying of walls and a roof`) is refused by L6 because the thatch still holds the kindling — correct. Freeing the lines first and re-applying gives "the thatch, in the house in the woods". Same in the campfire (prefix 33) and forest (prefix 117). | **fixed** |
| D3 | prefix 57; prefix 91 | "She shows you how to indicate voice switches using visual notation." after the voice speech; "Katya teaches you about disembodied and abstract voices in the standard notation." after the abstract-voices speech. | **fixed** |
| D4 | prefix 172, `set aside the second solution`, `resume the first solution` | Only `set aside the first solution` (plus `remember`/`collapse`) offered. An objection set aside mid-sequence is not offered until the second solution is resumed. | **fixed** |
| D5 | any `remember <event>` / `<sequence>` | "It went like this:" heads every event and sequence replay, classroom events included; the Voice of Fire, the Pillaging and the roles keep their forms (§7). | **fixed** |
| D6 | prefix 88, `speak as the fire` | "The fire has no line here, my dear. Who acts?"; voice unchanged; the speech waits for the seed. The abstract speech fires on the season at ¶2; `speak as time` at ¶1 is refused. | **fixed** |
| D7 | `listen`, `remember the Voice of Fire` | Chalk form only; both forms after the second `listen`. | **fixed** |
| D8 | prefix 181, `remember the saying of Ok, I guess` | Ends "But you don't really see it." then "It felt a bit untrue, because it was."; the coda is its own node. | **fixed** |
| D9 | prefix 157 | l. 455–463, the rendition, then l. 465. | **fixed** |
| I1 | prefix 76; prefix 157 | House: eight step lines, four consequences (the scattering's five paragraphs once); literal wise man: two groups, ¶11 once. | **fixed** |
| I2 | prefix 33, `remember the touching of the flame to the tinder` | One line: "It felt like the ember, and the flame, and the blaze, in the Voice of Fire."; annotations stay in the passage. | **fixed** |
| I3 | prefix 33, `remember the tinder` | "a patch of tinder, in the campfire story". | **fixed** |
| I4 | prefix 86; prefix 118 | `put down the chalk` → l. 393 / l. 421; `say all set` stays the campfire's; "the putting down of the chalk" is rememberable. | **fixed** |
| I5 | prefix 61, `let it follow` ×4 | Each prints "↳ <¶>"; knowledge still attaches the ¶ to the previous event. | **fixed** |
| I6 | prefix 171, the four objections | Each sentence keeps its quotation marks. | **fixed** |
| I7 | prefix 30, `apply the Voice of Fire` | "The Voice of Fire does not skip, my dear. The consumption of all is not on the board." | **fixed** |
| I8 | prefix 88, `speak as the fire` / `speak as time` | "The fire has no line here…" / "Time has no line here…" | **fixed**, with a new grammar bug on plural voices (D-3) |
| I9 | prefix 163, `map the sparking of the tinder to the dying unexpectedly` | `→ the dying unexpectedly` then `"His death. Very well. Hold that," says Katya.` | **fixed** |
| I10 | notes | "interpretted" kept in the prose; e15's spelling recorded as an authored exemption. | **fixed** |

Fixed differently, and accepted: D2's `resume` re-applies the *edited*
placements rather than "unchanged" (better: it is judged, and `resume`
with a hole prints the L1 nudge — prefix 33, `set aside the mapping`,
`erase the ash left behind`, `resume the mapping`); I4's new command has no
feeling ("nothing in particular"); I8's nudge is reused at the house's
follow rows, where it is slightly wrong (D-8).

---

## 2. Fresh play

**Beat 0.** `remember` before things exist is handled: `remember the tinder`
after the notation → "Nothing has been the tinder yet."; the steps are not
offered before the notation; `remember the campfire story` not before `say
all set`; `remember the two lines` not before the literal apply; `remember
the wise man's story` not before the figurative one. The one listening is
"the listening" until a second exists, then "the first listening" —
retroactive ordinals, acceptable. `collapse`/`expand the steps` toggle and
print nothing.

**Campfire.** One option per row; V3 prints its nudge and leaves the
touching unchanged. Mapping: 96 `map` rows, every wrong one nudged in the
Voice's terms. After `say all set` the chip's events are no longer
collapsible — fine.

**House.** V1 is offered only at ¶9 in the family's voice; `ask what the
right thing to do is` only there; `speak as the children` not before
l. 350; after the switch, `speak as the family` at ¶9–13 nudges. Katya's
burning-lines line prints inside the `scatter` frame. All five legal
mappings applied in one sitting by set-aside and re-map (rag/thatch/frame +
e12; rag/thatch/foundation + e11; rag/frame/foundation + e12;
thatch/frame/foundation + e12 and + e11); the illegal ones (thatch as both
tinder and kindling; firewood on the rag; tinder on the hurl) give L6, the
default s3 nudge and the default s1 nudge. `remember the ember` shows "the
lit rag" or "the burning stick" as chosen; `remember the house in the
woods` ends "— like the Voice of Fire, because the tinder was the thatch".

**Forest.** Starts voiceless; every wrong voice nudges; V4 nudges at any ¶.
All six legal mappings applied in one sitting (s3 ∈ {e5, e6} × (s6, s7) ∈
{(e9, e10), (e9, e11), (e10, e11)}); s6 and s7 both on e10 is refused by L6.
The two authored nudges chain ("What here is dry?" → "What strikes?").

**Wise man.** `map` not before l. 451; `ask what she means`, `set aside the
first solution`, `remember the two lines` not before the literal apply;
wrong voices at every ¶ nudge without changing the voice. First-pass
nudges: "It burns here, my dear. Where was it built?" on e11, "Wood, my
dear…" on e2/e4/e5, defaults elsewhere. Second pass: both sparks; the mark
on e8; objection 3 reads "the death, not the myth" when e8 is kept; L3
reachable (`map the spreading of the ember to the dying unexpectedly` after
the spark on e12); L7 on e9/e11. Then the defects below.

**Ending.** The last Available command is `say Ok, I guess`; its
consequence is l. 481 whole; the coda follows as its own node; `remember`
remains; no mapping command after. `say that you see it` is absent from
the Available list (Locked cannot be seen headlessly; the walkthrough test
asserts it). No crash, no thrown error, no state without an advancing
command anywhere I went.

---

## 3. Defects (ranked)

**D-1. Setting aside the second solution opens a third mapping that cannot
be completed, and its nudges blame the first solution.**
Sequence: prefix 170, `set aside the second solution`. Typeahead: `apply`,
`resume the first solution`, `resume the second solution`, and all 120
`map` rows. Then `map the laying of the tinder to the growing up and
acquiring of wisdom` → "That line is spoken for, my dear. It belongs to the
first solution." (it belongs to the second); `map the ash left behind to
the passing of time, in the wise man's story` → "That is the first
solution's ash. It is spoken for. Where does the wisdom end up?" (it is the
second's, and the wisdom ends up exactly there); `map the sparking of the
tinder to the dying unexpectedly` → accepted, with the mark; `apply` → L1,
forever, since every other figurative row is pruned by L7 against the
set-aside second solution. Cause: `puffers/mapping.tsx: do_set_aside`
pushes a fresh empty second-pass mapping whenever the story has a
second-pass table, whatever pass is being set aside; `judge.ts` prunes
against every set-aside mapping; the L7 texts in `data/voice_of_fire.ts`
are hard-wired to "the first solution". Change: when the mapping being set
aside is `pass === 'second'`, do what D2 does for the other stories —
return it to `open` with `reopened: true` and its placements kept, badges
hollow, rendition and roles dropped — instead of opening a third pass. L7
then prunes only e9/e11, `map`/`erase`/`apply` edit the second solution,
and `resume the second solution` re-applies it. This also lets the player
move the spark from the myth to the death *after* applying, with objection
3 re-worded by `spark_is` — l. 140 applied to the one question the .md
leaves open (l. 477). If the third pass is kept, the L7 nudges must name
the solution that holds the line.

**D-2. Resuming the first solution mid-second-pass silently discards the
second-pass placements.**
Sequence: prefix 163 (three figurative placements held), `resume the first
solution`, `set aside the first solution`, `apply the Voice of Fire` → "The
laying of the tinder is not on the board."; the three badges are gone.
Cause: `do_resume` drops every `open` mapping on the board. In the
first-pass-only stories the reopen keeps placements, so the two halves of
the build disagree. Change: in `do_resume`, keep an open mapping of the
other pass, marking it `set aside` (hollow) so §13's "never both lit"
holds; `set aside the first solution` then reopens it with its placements.
Changing your mind should not cost the other reading (l. 140).

**D-3. The voice nudge does not agree with plural voices.**
Sequence: prefix 121, `speak as the books` → "The books has no line here,
my dear. Who acts?"; likewise "The followers has", "The closest followers
has". Cause: `puffers/transcription.tsx` l. 93, `${name} has no line here`.
Change: reword to avoid agreement — "No line here for the books, my dear.
Who acts?" — and update SPEC §10's I8 text.

**D-4. Every re-apply reprints the story's apply sentence.**
Sequence: prefix 33, `set aside the mapping`, `resume the mapping` → "The
evening in the woods and the hearth on the board are the same shape." a
second time. In the house every re-apply reprints l. 383's three sentences;
after my five mappings "You struggle a bit more… Nevertheless, you find an
acceptable mapping." had printed five times. The wise man's `resume the
first solution` prints the rendition alone, so the build is inconsistent
with itself. Change: in `do_apply`, print `apply_text` and `apply_after`
only on the first apply of that pass; later applies and every `resume`
print the rendition alone. The .md narrates each finding once.

**D-5. The second pass's wrong placements are corrected in the literal
fire's words.**
Sequence: prefix 160, `map the laying of the tinder to the seeking of
answers` → "The tinder is the first thing to catch. Nothing here catches.";
`map the sparking of the tinder to the attending of the funeral` → "What
was touched to the tinder? Find the touch."; `map the ash left behind to
the being read and repeated and reprinted` → "What is left behind,
afterward, when no one is tending?". Katya has just said (l. 469) the
solution is "the one without any literal mention of wood or flame"; the
nudges then ask what catches and what was touched. They are in the Voice's
terms but at the wrong level — the one beat where l. 540's nudge must
point toward a *figurative* reading, and it does not. Change: a
second-pass nudge set on `WISE_MAN.nudges` (licensed as nudges, §10;
vocabulary from l. 471), used for L4 failures in the second pass:
- s1: "Not wood this time, my dear. What was laid in him, before anyone
  else came?"
- s2: "Who caught from him first, my dear? The few, before the many."
- s3: "And who caught from them? The many."
- s4: "What set it going, once he could no longer speak for himself?"
- s5 / s6: "What spread, my dear, and through whom?"
- s7: "Where did it burn longest, and in whose hands?"
- s8: "What is left of him at the end, my dear? Not his body."

**D-6. One bar label is unlicensed.** The unmapped bar prints "▸ 6 events
not in the mapping" (after `collapse the unmapped`). It is in neither the
.md nor §10. Add it to §10, or make it "▸ 6 unmapped".

**D-7. The voice mark prints before Katya has taught it.** Prefix 9,
`speak as the friends` → "— the friends —", eleven beats before l. 350;
§7 says no mark before her speech. In the text form, print nothing for
`speak as` until `taught` includes `voice`, or record the exception. Minor.

**D-8. "Who acts?" at the follow rows.** Prefix 61, `speak as the family`
→ "The family has no line here, my dear. Who acts?" — a beat after Katya
has said "There is no one left to speak". At a ¶ in `follows`, print "No
one speaks here, my dear. Let it follow." Minor.

---

## 4. Improvements

**I-1. The campfire's derived participants for steps 4–7 are tautologies.**
`remember the ember` at the end reads "the ember, in the campfire story;
the burning stick, in the house in the woods; the lightning, in the forest
fire; his death, in the wise man's story" — the first entry is the only one
that says nothing. Proposed, from the .md's words: s4 "the match's flame"
(l. 282), s5 "the kindling, catching" (l. 288), s6 "the logs, alight"
(l. 288), s7 "the tended fire" (l. 296); the pattern of "the forest, as
ash".

**I-2. Keep the set-aside readings in `remember <role>`.** After the house
is re-read with the thatch, `remember the tinder` forgets the rag ever was
the tinder. l. 136 is about a history of readings, not the current one.
Proposed: "The tinder has been: a patch of tinder, in the campfire story;
the oil-soaked rag, in the house in the woods, set aside; the thatch, in
the house in the woods." Deduplicate per (role, sequence, derived).

**I-3. `say Ok, I guess` after l. 479 should not need the second solution
lit.** Prefix 179, `set aside the second solution`, `say Ok, I guess` → not
accepted. Katya has said "fits on both levels"; the mutter is earned
whichever is lit. Keep D4's gate for the objections only.

**I-4. The Pillaging's "No one asked you in."** is the one authored line
with an edge; the .md's Pillaging is flat. Proposed: "You enter their
home." alone.

**I-5. Let the "It felt" list carry the road not taken** once I-2 exists:
"— like the Voice of Fire, because the tinder was the thatch, and before
that the rag". Generated, no new Katya.

**I-6. The objections' gate is right but silent.** With the second solution
set aside the next objection simply vanishes. Consider showing it Locked
while the first solution is lit, so the player sees a line they cannot yet
say (§0.11 would need amending; §7 proposes a bigger use of the device).

---

## 5. Invented and missing sentences

**Missing (l. 160–481).** None. The mechanical diff flags l. 350, 383, 419,
477 and 481 only because the build splits those multi-sentence lines
across frames; each sentence is present (350's second after the voice
speech; 383's first two on `draw a vertical line`, the last three on
`apply`; 419's first on the line, second and third on `apply`, fourth after
the abstract speech; 477 as four quoted sentences; 481 as two paragraphs).
"The Family" (l. 352) becomes the voice bar. `> touch the flame to the
tinder.` loses its period as a command (declared). Nothing altered:
"interpretted" is kept in the prose and normalised only in the authored
e15.

**Invented, with its licence.** Commands and their nominalisations (§6);
board chrome — titles, chips with step barcodes ("the house in the woods 3
2 1 4 5 6 7 8"), voice bars, "↳", "→ <event>", "— the <role>", and the
"▸ 6 events not in the mapping" bar (**unlicensed**, D-6); the shelf
sentence; Katya's four speeches with their two stage directions and the
burning-lines line (§10 verbatim); the campfire apply line; the authored
consequences of the house e7–e13, the forest e1–e12, the wise man e1–e10
and e12–e15, the Pillaging's three (§5 *author*; every required fragment
present — thatch, dead trees and dead brush, "…and a sapling rises forth.",
"The trees flourish, a forest.", the lightning line, "The forest burns down
to ash.", "His death becomes mythologized."); every nudge I reached — V1–V4,
L1 (templated), L3, L6, both L7 wordings, the "no line here" nudge, the
eight authored (story, step, event) nudges, the six default step nudges;
the mark; the rendition lines; the five "It felt" lists and the generated
"because the tinder was …" lines; "It felt like nothing yet. It has not
been read."; "It felt like nothing in particular."; the three classroom
feelings; "The tinder has been: …" / "Nothing has been the tinder yet.";
the coda. Katya has no line between the .md's lines: every "my dear" in the
transcript is in §10 or in a nudge.

**Register.** No exclamation marks, no winks. "In a colour you have not
seen her use" is the one flourish and it does work. The two nudges I would
call costume are the second-pass defaults (D-5): the right vocabulary at
the wrong level.

---

## 6. The authored consequences: person and tense

Every embodied voice speaks in the second person and every thin voice is
reported in the third, consistently: the family and the children "you" /
"one of you"; "The seed takes root", "Books spread across the land", "Time
passes". §5 asks for second person for embodied voices and says nothing of
the others; the build's rule (third person for a voice without a body)
should be written into §5. I read all thirty-six authored consequences
against their imperatives:

- None mixes "you" with "he/they" for the same actor. The closest
  followers' "You construct a great funeral pyre, and lay his body on it."
  and "You continue to write the dead man's words, and in time you adjust
  his words…" keep "his" for the man throughout, correctly.
- The one person mismatch is mandated: e11 `light the pyre`, spoken by the
  closest followers, has ¶11 verbatim — "The pyre is lit. … His followers
  weep and cry out and sing." — the only embodied event reported in the
  third person. §5.4 requires it; `remember the lighting of the pyre` is
  the one place l. 495's rule ("the consequence is reported back to them")
  is visibly broken. Record it in the notes as the deliberate exception.
- Awkward as an imperative's consequence: `turn` (the season) → "The season
  is right, and the weather is right, and a sapling rises forth." reads as
  a state, not a turning; "The season turns. The weather is right, and a
  sapling rises forth." answers the command. `grow` (the tree) contains
  "and time passes" — time's line inside the tree's; harmless. `be born` →
  "You are born to parents of no consequence." is the .md's oddness, not
  the build's.
- e5 (the followers) "You grow in number. Word of the man's wisdom spreads,
  and more of you come." — the orchestrator's fix — reads right.

---

## 7. The spirit

**Where it makes me reflect.** Four places, ascending. (1) The forest's
opening: an empty prompt, seven voices, and "Who acts?" on every wrong one
— the only moment of *transcription* that asks a question, and it is the
footnote's (l. 495–498). (2) The wise man's first pass, where "Wood, my
dear. You are looking for wood. There are only two lines in which anything
burns" turns l. 451 into a thing discovered by being wrong. (3) `remember
the ember` at the end — "the burning stick, in the house in the woods; the
lightning, in the forest fire; his death, in the wise man's story" — l. 136
in one line, and the only place the four stories are seen through one
word. (4) The spark: `map the sparking of the tinder to the dying
unexpectedly` → "His death. Very well. Hold that," and, if you keep it, the
objection comes out in your words. That is the one moment where an
interpretation I performed changed what I could say. It is the document's
moment (l. 477), and the build earns it.

**Where it makes me transcribe.** Most of the time. The four conversions
are eighty-two commands of reading the typeahead aloud, twenty-one of them
`speak as`, each with exactly one right answer and at most a nudge for the
wrong one. §13 ruled for this and l. 498 is served, but now the board UI
exists the ruling deserves a second look: a transcription with no decision
is a cutscene the player types. The campfire's mapping is a lookup (one
candidate per step — "Trivially so", l. 246, so fair). The forest's is
loose — six legal mappings — and none of the six matters: same apply text,
same feeling, a different word in `remember the firewood`. The literal wise
man is a lookup guarded by one excellent nudge.

**Is the rag/thatch choice felt?** As a choice, yes: the first time the
`map` rows hold two the judge will accept, and the L6 refusal when you try
to make the thatch both things is the right sensation. As a consequence,
no. Whichever you chose: the same three sentences of l. 383, the same
objection ("Is the tinder the oil-soaked rag, or the thatch on the roof?"),
the same "Quite right", the same "unfinished, because the tinder is still
two things". The choice survives in one word of the rendition, one
annotation, one entry in `remember the tinder` (which forgets the other
the moment you set it aside, I-2) and one generated feeling line. Katya's
indifference is by design (l. 387, §13) and I would not give her a line.
But the *player* is not indifferent — l. 385 is the player saying so — and
the build lets them say it without having been both.

**Does the second solution feel like a reinterpretation I performed, or a
menu I clicked?** A hunt through a menu. The typeahead lists 120 rows; the
figurative candidates are hidden data; the wrong rows get the literal
fire's nudges (D-5); finding "his wisdom" for the tinder is silent; only
the spark has a mark. The work is real — I did have to decide that "the
growing up and acquiring of wisdom" was the tinder and not "the seeking of
answers", and the build refused the second — but the refusal said nothing
figurative, and the reason I was right printed only afterwards, in l. 471.
The .md says "you gradually work it out"; the build's version is "you
guess, are told no in the wrong vocabulary, and are told yes in silence".
The spark's two rows, the mark, and the objection that follows your
placement are the model for how the whole pass should feel; the other
seven steps do not have it.

**Does the ending land?** Yes. Four objections as four commands, each
sayable only in order and only while the thing objected to is lit, make
the player's doubt a player's act. `say that you see it` offered and dead
is the best joke the .md permits. "It felt a bit untrue, because it was."
is the best authored sentence in the build. The coda is one sentence more
than the board needs, but it talks over nothing.

**The single change.** Make the house require the change of mind the essay
says some puzzles will require (l. 140: "you must entertain two apparently
mutually exclusive interpretations in turn in order to progress").
Concretely: `object that there is no clear tinder` (l. 385) is offered only
once *both* the rag and the thatch have been the tinder of an applied
mapping — shown Locked until then, so the player can see there is a line
they cannot yet say. Everything needed exists: D2's reopen, L6's refusal,
`remember the tinder`, and the feeling "unfinished, because the tinder is
still two things", which becomes literally true of the player's history.
The .md supports it — "You struggle a bit more" (l. 383) is the struggle,
and l. 385 is a report of having tried both. It costs one gate and one
Locked line (amending §0.11), no new Katya, and it turns the one story with
a real choice into the one story where interpretation has a consequence on
"the actions they can take" (l. 134) — which nothing in the build does
outside the wise man's L7. The runner-up is I-2, which makes changing your
mind leave a mark instead of erasing one.

---

## 8. Verdict

Round 2's nineteen items are done, and done in the register: the document
is on the board without a hole, nothing unlicensed is said but a bar
label, every character line is a command, and the ending is the player's
own. The build is a faithful, playable rendering of l. 160–481 with the
mechanics of l. 5–136 present and named. What must be fixed before it is
shown: D-1 and D-2, the same bug seen from two sides — the wise man's two
solutions are the only place the essay's "two mutually exclusive
interpretations in turn" is enacted, and at present setting the second
aside strands you in an empty third pass with nudges that lie about whose
lines they are, while resuming the first throws your second-pass work
away. D-3 and D-4 are an hour; D-5 is an afternoon of writing and the one
that most changes how the last beat feels. Against the author's own test
(l. 154): it is something new, in that I performed every act of
interpretation the story describes and was judged on each in the pattern's
own words; it is not yet something *consequential*, because outside the
spark and L7 no interpretation I made changed what I could do next. The
change in §7 is the cheapest way to make one of them do so.
