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
