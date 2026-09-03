# Rebuttal C: conceding the mechanics, keeping the refusal

*Bare line numbers cite `dist/posts/puzzle_lofty.md`; `s0`–`s3` are the scratch files; `C1`/`C2` are the two critiques. The short version: I concede nearly every mechanical objection and adopt A's data model and judge wholesale; I defend the thesis, the ending, and three narrow points about voices and pacing.*

## 1. Objections against C

**C1-1 (steps 2–3 absent). CONCEDE, fully.** `remember <event>` prints the event verbatim plus a feeling (47–56); `remember <sequence>` replays every event with an "It felt:" list of reasons found in no single event (71–98). Events are named by nominalising the command (45, 166), with B's ordinal disambiguation (58). I adopt B's classroom transposition (`pick up the chalk`, `look at the board`) so the first thing the player remembers is their own act. Lists in §4. A mapping cell is a relation, not a replay; my §9 was wrong.

**C1-2 / C2 (the campfire as one command).** Both critics are right about different things. C1 on the letter: "Trivially so" (246) answers containment (244), not conversion; converting *is* "issu[ing] the right imperative commands" (498); a player who has never issued one cannot "pause" at 348. C2 on attention: the campfire's belongs to the mapping. **Resolution: every campfire event is player-issued, but each line's typeahead offers exactly one imperative (or `follows` for the consequence-only lines, 234, 242), so twelve Enters take under two minutes.** Conversion's decisions begin at the house, where the document begins them (348), and the twelve Enters are what make 348 land: the player has typed as `the friends ›` a dozen times before the carat refuses the family the rag. `convert the story` is withdrawn.

**C1-3 (targets are prose lines). CONCEDE, fully.** Targets are events by nominalised name (122, 45); prose is B's `¶` layer, a view of the event and never the object. Sub-event targets (gist-tagged phrases inside a consequence) are needed once, for 461, where steps 4–8 live in one event; the engine's facets are exactly that (`reflect/facet.tsx`), so I adopt B's phrase targets as an *optional* anchoring and A's L2 as the rule (a step lands on one target).

**C1-4 / D10 (the scratch line and the hearth line). CONCEDE.** "Is a hearth less a hearth for being made of people?" is an argument, and I wrote in the same proposal that Katya "never argues" (C §2). Cut. `s3` l. 193 is revised out by 479 and the .md wins. The revised beat (§4) keeps 465–481 verbatim in order: objections as four commands, "Why so, my dear?" (475) after the first, 479 after the last, nothing else from Katya in between. What I keep from the scratch is the *mechanic*, not the line: the spark may be `the dying` or `the mythologizing` (477, 537), accepted either way, and the player's own objection about the timing is composed from whichever cell they placed.

**C1-5 (unmap residue). CONCEDE.** Display only. The residue is a css class on the row; the judge never reads it. 140 is absolute.

**C1-6 (the vertical line). CONCEDE.** Per story: left column, then `draw a vertical line` (309), then `list the steps of the Voice of Fire` (311). Relisting the same eight steps four times is the lesson's own repetition: the pattern unchanged while the stories change.

**C1-7 (the chalkboard form overwritten). CONCEDE.** B's collapse/expand: the statement (166–180) is the collapsed row, the notation (185–215) the expanded one; both forms coexist and each step is a rereadable object.

**C1-8 / D1 (nudge 5 forbids what 419 may require). CONCEDE the data, DEFEND the trap.** The forest's voice list will name `the weather` and `the fire` as `disembodied` and `the season` and `time` as `abstract`; "the season is right … and time passes" (397–405) are their commands, and nothing refuses them. What the nudge refuses is one thing only: speaking a *story* line as **the Voice of Fire**, the object in the right column. C1's own ruling (D1) says "keep them distinct objects; Katya may remark on the kinship; no rule identifies them." A nudge that keeps them distinct is that ruling enforced. The wording is revised (§4) so that it *offers* the abstract voice instead of merely refusing: "Lend the story a fire of its own." C2 called this the best trap in the set; a trap that teaches the left/right distinction (309–311) is worth keeping.

**C1-9 (UI under-specified). CONCEDE.** Adopt B §1, corrected by C2's fact 4: the board is a persistent subtree of the story tree, rows as gist-bearing nodes, prompt in the story hole moved into the board's left column during transcription (the `reflect.tsx` trick). No SVG lines in the first build; numbered colour badges and bands.

**C1-10 (citation). CONCEDE.** `src/typescript/demo_worlds/narrascope/reflect/base_handlers.tsx:69`; my listing concatenated files.

**C2 (nudge closures are not a judge; the figurative solution "locks after any eight maps"). CONCEDE, completely.** This was the real hole. I adopt A's L1–L5, C2's L6 (no two of steps 1–3, or of 4–8, share an event unless author-flagged `compound`), and C2's role-candidate table with a `pass` column. Then "the burning is the singing" dies at L4, "all eight to travel" at L4, "all eight on `light the pyre`" at L6, and the figurative solution is admitted only by rows flagged `figurative`: 537 stated as data. My nudges survive as the authored text attached to each violation (§4). The Pillaging can then fail legally, which I now want (§2, D5).

**C2 (wise-man conversion is a slog).** Partly concede. Adopt B's `collapse the unmapped` and `follows` so that the fifteen lines are mostly Enters; keep the voice switches as the only decisions. The document gives no way to shorten the story ("never less"), so the fix is pace, not cuts.

**C2 (`Used` dims but is still enterable).** Concede the implementation detail: `say that you see it` is `Locked`, not `Used`.

**C2 (extensibility weakest).** Concede by adoption: with A's `Event`/`Sequence`/`AbstractSequence`/`Mapping` under it, C's `Line`/`Story`/`Nudge.when` are gone; what C contributes is the pacing, the traps, the apply texts, the objection commands and the ending.

## 2. The interpretive rulings, and the thesis

I accept D1–D11 with the one residual argument above (D1). Specifically: D2 (every event player-issued; conversion's puzzle is the voice); D3 (both wise-man solutions visible at the end, one lit, one dimmed; my coda erased the board and must not); D4 (story voice never enters legality; my pass-relative nudges key on the applied solution, not the speaker); D6; D7; D8 (partial order on 1–3, which my house mapping needed and I had not noticed); D9 (the house's burning lines are consequences; I drop my family-voice branch, which was cut-first anyway, and take B's "no voice yet" pedagogy with a rewritten Katya line); D11.

**D5 (green room, Pillaging).** I move. Green-room *function* yes, via B's classroom actions; content no. The Pillaging as data and as a visible object on Katya's shelf, and A's failing mapping as the optional extension **after** "Ok, I guess," never before. The placement is the narrative condition: if the player learns *before* the wise man that a voice can fail to fit, the figurative fit reads as one more success; if they learn it *after*, they learn that the instrument can say no, and that it did not say no to the thing they wanted it to refuse. That sharpens the refusal rather than dulling it.

**C2 §5.** Accept 1–3, 5–10, 12–20. On 4, see the resolution above. On 11 (skip the second physical column), accept, with D3's condition: both solutions legible on one board at the end, lit badges and dimmed badges.

**The thesis, argued again.** The lesson is a seduction and the ending a refusal. Neither critique touches this, and A's judge *strengthens* it: it colours the figurative solution the same green it gave the campfire. Green is green. That is 387 ("It knows nothing of the purposes … It simply proceeds") made mechanical, and 481 is the character looking at the green and not seeing it. `consider the ash` listing "a pile of black ash; a field of ash; the forest; a man's body; a distorted doctrine" (A §4) is the seduction as a game object: the player built that list one apply at a time, and its last entry is a wisdom.

What in the synthesis would betray it:

1. **Katya explaining or arguing.** Every invented Katya line between 473 and 479 is a betrayal, mine included. She asks "Why so, my dear?" and then says 479. The judge argues for her.
2. **A's coda** ("ash = you don't really see it"). A wink after the mutter dissolves the mutter. Cut, as C2 also says.
3. **A's dictated `reconsider the tinder`.** A change of mind ordered by the teacher is not a change of mind (C2), and Katya saying "now change your mind" after "these details are not relevant" (387) is out of character (C1-A7).
4. **B's flicker ending.** "Solution II flickers" is prose-by-animation (C1-B8). The refusal must be the player's command, recorded in their history, remembered with a feeling.
5. **Objections as a block or as four identical clicks.** Each objection is composed from a cell (`object that the spark is the dying`), so that it is a reading of the mapping the player made, and each prints only its own sentence from 473–477.
6. **Any text that says the character understands.** The wise man's "It felt" list must record *unconvinced*; the classroom's last remembered event must feel like a lie told politely.
7. **The Pillaging fail-map before story 4** (above).
8. **Ending anywhere but the board**, with both solutions on it and the `[You]` band under them.

## 3. Stolen, and refused

**From A, must be in the synthesis:** the judge (L1–L5 + L6) with rule-generated nudges; the partial order on 1–3; event-level many-to-one with unmapped events; `apply` as state (the Fire re-speaks the story on the right; annotations grafted; `consider <role>` accumulating); `set aside`/`resume`; `AbstractSequence` as a type with the Pillaging as a second instance. **Wrong for the document:** `speak as the fire` in the house (419 is the first bodiless voice); the dictated `reconsider`; the objections as a block (142); `reread` (the doc's verb is `remember`, 45, 71); the coda.

**From B, must be in the synthesis:** the board as (a subtree of) the history, clicking-is-typing (501); the `¶` layer, the cursor row and `follows` (232→280–286, 234→288); `draw a vertical line`; both forms of the Voice as collapse/expand (182); `remember` with "It felt" and the sequence chips; `collapse the unmapped` (451); the classroom actions; the "no voice yet" debt paid by the forest. **Wrong for the document:** one step to many targets (311 is singular); no judge (540); skipping 344–346 and the "so abstract" objection (477); reviving `would()`; "chalky"; the flicker.

## 4. Authored prose, revised

All in the document's register: short declaratives, "my dear," no exclamation marks, no explanations from Katya beyond what the .md gives her.

### Katya on voice switches (350)

> "Every line is spoken by someone, my dear. The one who says *pack* is the one who packs; the consequence is reported back to them and no one else. When the one who speaks changes, we say so above the line, and we change the ink." She draws a short bar across the column and writes THE CHILDREN beneath it, in a second colour. "We do not write why they speak. We do not write whether they should. We write who. Now issue their command."

### Katya on the house's burning lines (336–342; B's debt, reworded)

> "There is no one left to speak, my dear. The children have run. Let these lines follow from what they did. We will find a voice for such things another day."

### Katya on disembodied and abstract voices (419)

> "Who lays the brush, my dear?"
> "No one. It fell."
> "The notation has no line for no one. Something must command the bolt, or the bolt cannot be written." She writes THE WEATHER above the line, in a colour you have not seen her use, with a broken bar. "When nothing wants a thing, we lend it a voice anyway. The weather's. The fire's. A voice without a body and without a wish."
> "And *the season is right*? *Time passes*?"
> "Those are voices too, my dear, of a thinner kind. The season commands; time commands. They have no body and no place. Write them with a double bar." She glances at the right-hand column. "You will notice how much such a voice sounds like the one we are looking for. Notice it. Do not write it there."

### Nudges, keyed to the rules

Each is the authored text for one violation; the judge decides, the text nudges (540).

| Rule | Situation | Text |
|---|---|---|
| Voice (transcription) | a family imperative at 334 | *"You are still speaking as the family, my dear. Would the family light the rag? Change the voice, then command."* |
| Voice | the voice left empty in the forest | *"The notation has no line for no one. Lend it a voice."* |
| Voice | `speak as the Voice of Fire` on a story line | *"Not the one on the board, my dear. That one we are looking for. Lend the story a fire of its own; it will have no body either, and you will hear how alike they sound."* |
| L3, order | spark placed before any fuel is laid | *"A spark before the fuel is laid? Fire is patient. It waits for the preparation. It will wait for you."* |
| L3, order | `spread to the firewood` placed above `spread to the kindling` | *"The Voice of Fire proceeds in order. It does not reach the frame before the thatch has caught."* |
| L2, one step, two targets | | *"One utterance, one place, my dear. Choose."* |
| L6, two fuel steps on one plain event | `the laying of the tinder` and `the laying of the kindling` both on `gather` | *"Gathered is not laid. What is laid first, and what over it?"* |
| L4, `tinder` | on an event with nothing that catches (e.g. `light a match`, `travel`) | *"The tinder is the first thing to catch. Nothing here catches."* |
| L4, `kindling` / `firewood` | on `sing`, `dig`, `pack` | *"Wood, my dear. You are looking for what will be fuel."* |
| L4, `ember` | the spark on an event with no touching of flame | *"What was touched to the tinder? Find the touch."* |
| L4, `blaze` (burn) | on `light a match` | *"The match is a small thing. Look for the hearth burning bright and hot, for a time."* |
| L4, `ash` | on `sing` | *"The singing is not ash. What is left behind, afterward, when no one is tending?"* (A's, kept verbatim) |
| Pass, literal | a figurative row placed while the literal solution is open (`the laying of the kindling` on `gain a small circle`) | *"Wood, my dear. There are only two lines in which anything burns. Find them; the rest will keep."* |
| Pass, figurative | `the ash left behind` on `reduce to ash` while the literal solution is set aside | *"That is the first solution's ash. It is spoken for. Where does the wisdom end up?"* |
| Pass, figurative, accepted with mark | `the sparking of the tinder` on `die unexpectedly` | *"His death. Very well. Hold that."* (accepted; the objection below is built from it) |
| Apply, L1 hole | `apply` with a step unplaced | *"The Voice of Fire does not skip, my dear. Something is missing from the board."* |

### The five apply texts

- Campfire: *You step back. The evening in the woods and the hearth on the board are the same shape. It is pleasant, the way a rhyme is pleasant.*
- House: *You read the story again from the top. The house is fuel now; you cannot read it any other way. The family are within the blaze. The story has gone cool in your hands, and the pattern is warm.*
- Forest: *The forest grew for a hundred years so that it could burn for a day. That is what the board says. The board is not wrong.*
- Wise man, literal: *Two lines, boxed. The rest of the man's life stands outside the box, unburnt. You are relieved, and you notice that you are relieved.*
- Wise man, figurative: *It locks. Wisdom, circle, community, myth, distortion, echo, ash. The whole man's life is in the box now, and nothing is outside it.*

### The house exchange as commands (385–391)

```
> object that there is no clear tinder

"Quite a bit different, this time," you mutter. "There's not a clear
answer for what's tinder, or kindling, or firewood. Is the tinder the
oil-soaked rag, or the thatch on the roof? And in this case, the
so-called 'fireplace' wasn't purposefully built up to be burnt; it was
a family's home. The burning was done by someone else."

"Quite right," says Katya. "But these details are not relevant from
the perspective of the Voice of Fire, my dear. It knows only of the
preparation of the fuel, and the burning of the fuel. It knows nothing
of the purposes or intentions behind these actions. It simply
proceeds. A pattern."

> say that it knows nothing of the morality of the burning either

"And it seems to know nothing of the morality of the burning, either,"
you say.

"Indeed not," she says.
```

### The objections as commands (465–481, Katya verbatim)

```
"Now, my dear, please find the second solution," says Katya.

> ask what she means

"The second? What do you mean?"

"The figurative solution, my dear. The one without any literal mention
of wood or flame," she says.

> set aside the first solution
> the laying of the tinder is the acquiring of wisdom
> the laying of the kindling is the gaining of a small circle
> the stacking of the firewood is the growing of the followers
> the sparking of the tinder is the mythologizing of his death
> the spreading to the kindling is the adjusting of his words
> the spreading to the firewood is the spreading of the books
> the burning is the reading and repeating and reprinting
> the ash left behind is the interpreting until they hardly resemble
> apply the Voice of Fire

It locks. Wisdom, circle, community, myth, distortion, echo, ash. The
whole man's life is in the box now, and nothing is outside it.

> object that there is no fire

"Katya, I have to say, it seems this second solution hardly fits the
spirit of the Voice of Fire."

"Why so, my dear?"

"There's no fire, no wood, no burning directly involved."

> object that the fireplace is too abstract

"The structure of the fireplace is so abstract- the man's wisdom? His
'legitimate following'?"

> object that the spark is the myth, not the death

"And the timing doesn't seem to add up; the man dies, but then they
turn him into a myth. So which event is the spark? His actual death?
Or the mythological version of his death?"

> object that the ash is still structured

"And the so-called 'ash' at the end; while it may no longer resemble
the original knowledge of the man, it is still highly structured; more
structured than a pile of ash."

"These are all good questions, my dear. In time, we will answer them
all. For now, recognize that the Voice of Fire fits on both levels."

> say that you see it                              [locked]
> say "Ok, I guess"

"Ok, I guess," you mutter. But you don't really see it.
```

The four objections may be issued in any order; the first one issued receives "Why so, my dear?" and the last one issued is followed by 479. If the player placed the spark on `die unexpectedly`, the third command reads `object that the spark is the death, not the myth` and prints the same sentence from 477, since the sentence already contains both.

### "It felt" lists

*Four sequences (92–96 form: a reason found in no single event):*

- the campfire story: *It felt: — a bit warm, because they sang; — a bit neat, because the fire was built to be burnt.*
- the house in the woods: *It felt: — sad, because it was a home; — a bit cold, because the pattern did not mind; — unfinished, because the tinder is still two things.*
- the forest fire: *It felt: — like nothing, because no one wanted it; — inevitable, because the board said so; — a bit familiar, because the thin voices sounded like the one on the right.*
- the wise man: *It felt: — a bit relieving, at first, because only two lines burned; — then not, because all of them did; — unconvincing, because you don't really see it.*

*Three of the player's own classroom events (47–56 form):*

- `remember the picking up of the chalk` — verbatim, then: *It felt a bit ordinary, because it was chalk. It felt a bit like being watched, because she was.*
- `remember the drawing of the vertical line` — verbatim, then: *It felt a bit decisive, because there was no line, and then there was.*
- `remember the saying of "Ok, I guess"` — verbatim, then: *It felt a bit like a lie, because it was one, told politely.*

### The coda (revised for D3)

```
Katya rolls the first three boards into the corner, one at a time.
The wise man's board she leaves as it is: the two lines of the first
solution, dimmed; the whole of his life in the second, lit.

Beneath it, in the notation, in your own colour, is the afternoon:
everything you said, and everything that followed.

She does not map it. Neither do you. Not yet.

> write it down

You open your notebook and write: The Voice of Fire.
```
