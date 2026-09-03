# Implementation notes — the Voice of Fire demo

The running log of where the build deviates from `SPEC.md` and how its
ambiguities were resolved. Bare line numbers cite `dist/posts/puzzle_lofty.md`;
`§n` cites `SPEC.md` (v1.1). Engine paths are under `src/typescript/`.

## Phase A (judge, names, data) — resolutions adopted into SPEC v1.1

1. Placement check order L3 → L7 → L4 → L6, first failure reported;
   `violations()` (used by `apply`) reports every broken rule, L1 first.
2. No load-time L6 lint on the tables. The lint that remains checks the
   converse consistency (an event that `absorbs` a step is a candidate for
   it in some pass), plus indices, ¶ coverage, and that an authored nudge is
   not a candidate row in every pass.
3. Re-`map`ping a placed step moves it (L2 holds by construction).
4. `follows` lines attach to the last event whose ¶ precedes them
   (`data/index.ts: followed_lines`, `event_consequence`).
5. Step short names as in `data/voice_of_fire.ts`.
6. Commands are checked verbatim only where the .md gives the notation
   (campfire; house e1–e6); consequences wherever not marked `authored`.
7. The .md's `> touch the flame to the tinder.` loses its trailing period as
   a command.

## Phase A.1 (alignment with v1.1)

- **Types beyond §3**, all optional or additive: `StoryEventSpec.remainder`
  (the unconverted tail of a two-event ¶), `authored` (marks consequences
  the implementer wrote, so the verbatim test knows what must be quoted),
  `StorySpec.grafted_feeling` (the wise man's last feeling, added at l. 481),
  `apply_text` values are paragraph lists (the wise man's literal apply is
  six paragraphs), `SubSequenceSpec` for "the two lines", and the nudges
  live on the `AbstractSequence` (`nudges.step`, `.L1`, `.L3`, `.L6`, `.L7`,
  `.L7_step`) so the judge stays generic and the Pillaging has its own.
- **`Step.role` is a string**, not the `Role` union, because the Pillaging's
  roles differ; `FIRE_ROLES` lists the fire's.
- **Role names in the global collision set** are the grammar forms
  (`the tinder` … `the ash`); the Pillaging's roles (`Someone`, `their home`,
  `the Pillager`, `things taken`) are included as written.
- **Voice names vs. abstract sequences**: "the Voice of Fire" and "the
  Pillaging" are both voices and sequences; the collision check treats that
  one coincidence as intended.
- **§4's "the spark on `light a match` after nothing laid is fine at
  placement"**: it is not a candidate row (s4 → e8 only), so it is rejected
  by L4 with the authored "Lit, but not yet touched to anything" nudge. What
  is fine is that no order rule fails; the test checks that reading. The
  spark on its own row (e8) with nothing laid is admitted and `apply` then
  fails L1, as §4 intends.
- **L7 with no set-aside mapping**: `candidates_for` prunes whatever
  set-aside mappings it is given, whatever the pass label; the second-pass
  table lists the literal rows and only L7 removes them.
- **A fifth legal house mapping.** §5.2 lists four (rag with three fuel
  pairs, each with the spark on e12 or e11; thatch with frame/foundation,
  spark on e12). With e11 in s4's row, the thatch (e9) as tinder and the lit
  rag (e11) as spark also passes: L3 holds (9 ≤ 11) and e11 is not shared.
  The judge admits it; the test records it.
- **Trap data** has an optional `prose` (the forest's `speak as the Voice
  of Fire` is at any ¶) and an optional `voice`.

## Phase B1 (the playable world, headless)

Play it with `PLAY_WORLD=fire node scripts/play.js "look at the board" "listen" …`;
the full command list is `ACCEPTANCE_SCRIPT` in `tests/test_fire_walkthrough.ts`.

**Engine.** No engine changes. No lock is used: the scene (`world.scene`)
gates every puffer directly (`classroom`, `chalk`, `notation`, then
`<story>:told|ready|transcribing|lined|mapping|second|done`, then `end`).
Multi-word names are one parser chunk (`the_laying_of_the_tinder`), so the
typeahead lists whole phrases after the verb. A Locked line (`say that you
see it`) keeps its verb Available and locks only the rest, so it shows
dimmed after `say` (a fully Locked spec dies as soon as the verb is typed).
Keystroke parse time at the wise man's mapping state: ~5 ms
(`event_names` is cached; it was 300 ms without). `traverse_thread` there:
~2.5 s (tests only).

**State beyond §3.** `collapsed` and `taught` are arrays, not Sets
(`update()` treats a Set as an opaque value; arrays are plainer).
`frame_voices` records who spoke each event frame. `said` holds the
classroom lines said; `ended` marks l. 481. `sequences[id].events` are frame
indices as in §3; "the two lines" is registered there on the literal apply.

**Story-tree shape (B1 only).** Every frame is at the root and the hole
stays at the root. The board at open prints its title and ¶s as a
description; `draw a vertical line` prints the eight chalk statements; the
Fire's rendition (`> <step command> — <derived>` and the event's whole
consequence) is the apply frame's description with gist `spoken(seq, pass)`;
annotations (`— the <role>`, gist `annotation(seq, n, pass, role)`) are added
into each mapped event frame's input line and grafted into knowledge.
`set aside` removes both by gist and drops the roles entries; `resume`
re-adds the rendition into its own frame. `board.tsx` holds all of these
nodes and gists for B2 to relocate.

**Resolved ambiguities.**
- What `draw a vertical line` prints: l. 309–311 (campfire), l. 383's first
  two sentences (house), "You repeat the exercise." (forest), only the right
  column for the wise man (the .md narrates that line inside l. 451, which
  the player's next command prints).
- l. 350: `"Indeed," says Katya.` then the voice-switch speech; the .md's
  "She shows you how to indicate voice switches using visual notation." is
  not printed — the speech is that showing.
- Wise man ordering (§9): `map` is offered only after `say that … just two
  lines`; `set aside the first solution` only after `ask what she means`;
  the objections only while the second solution is applied; no mapping
  commands after `say Ok, I guess`. In the house, `say all set` needs both
  l. 385 and l. 389 said first.
- `resume` is offered only while no mapping on the board is applied
  (§13: never both lit). `set aside` on a story with no second-pass table
  opens no new mapping (L7 would empty it anyway): only `resume the mapping`
  advances, and `say all set` still needs an applied mapping. Setting aside
  the wise man's second solution opens an empty second-pass mapping that L7
  has emptied; the way on is `resume` either solution.
- Katya's forest speeches trigger on the first `speak as` of a voice of
  each *kind* (disembodied, abstract), which with §5.3's order is the seed
  and the season.
- `speak as` offers only the story's first voice until l. 350 is said, then
  every voice of the story except the current one, at any ¶ of the board.
- Objection 3's wording follows the spark's placement in the applied
  figurative mapping (e12 → "the myth, not the death"; e8 → the reverse).
- `remember <event>` reprints the knowledge passage (`> command` and the
  whole consequence, followed lines included, plus annotations) then the
  feeling, one line per role the event carries. Classroom events reprint
  their frame (command and consequence) with gists stripped, then the
  feeling; their names are authored in `data/katya.ts` and get ordinals over
  the whole lesson ("the second listening"). Frames for `map`, `erase`,
  `apply`, `set aside`, `resume`, `speak as`, `let it follow`, traps,
  `expand`/`collapse` and `remember` itself carry no name and are not
  rememberable.
- `remember today's lesson` is not offered in B1: §2 lists it as a
  sequence, but its verbatim replay would be the whole transcript. Deferred.
- `remember the Voice of Fire` from the first `listen`; the steps and the
  roles from the second (the notation); the Pillaging from `look at the
  board`; `look at the board` is offered once, anywhere in beat 0.
- `expand`/`collapse` are toggles on `collapsed` that print nothing: the
  steps, the open board's story, its events and (from the line on) its
  unmapped rows, and finished stories' chips.
- Knowledge holds every event of a story from board open (gist
  `event(seq, n)`) and the two abstract sequences (`abstract sequence`,
  `step(voice, n)`).
