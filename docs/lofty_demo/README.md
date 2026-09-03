# The Voice of Fire — a demo honed by a design loop

This directory is the record of turning `dist/posts/puzzle_lofty.md` ("Core
puzzle mechanics in Venience World", 2020) into a playable demo, and the
demo's specification. The demo itself lives in
`src/typescript/demo_worlds/fire/` and is served from `dist/fire.html`.

## What was built

A stand-alone, playable version of Katya's lesson on the Voice of Fire
(l. 160–481 of the document), in which every act of interpretation the story
describes is a command the player issues on a two-column chalkboard:

- The eight steps of the Voice of Fire, in the chalk form and in the
  "standard notation of the field", side by side and collapsible.
- All four stories (the campfire, the house in the woods, the forest fire,
  the wise man), every line verbatim, converted by the player into notation
  by issuing each imperative in a chosen voice (`speak as the children`),
  with the voice switch drawn as visual notation and disembodied and
  abstract voices distinguished (dashed and double bars).
- Mapping as a judged act: `map <step> to <event>` is checked by a general
  rule (order, one target per step, sharing only on events that absorb
  several steps, per-story candidate tables as the author's "manual fudge
  factors", and "spoken for" across the two wise-man solutions), and every
  wrong attempt prints a nudge in the Voice's own terms, never a refusal.
- Consequences of applying a mapping: the Fire re-speaks the story under
  each step, the mapped events carry their roles, `remember the tinder`
  lists everything that has been the tinder, and the next story is gated.
- Changing your mind: `set aside`, re-`map`, `resume`; the house cannot be
  left until both the rag and the thatch have been the tinder in turn; the
  wise man's literal and figurative solutions stand on one board, one lit
  and one dimmed.
- The document's own mechanics from its first half: events are objects
  (`remember the touching of the flame to the tinder` prints it verbatim
  with how it felt), sequences are objects (`remember the campfire story`
  replays it with an "It felt:" list), abstract sequences are a type (the
  Pillaging is on the shelf), the player's own commands are in the same
  notation with a `YOU` bar.
- The ending: the four objections as commands, Katya's "fits on both
  levels", `say that you see it` offered and locked, and "But you don't
  really see it" as the consequence of the player's own `say Ok, I guess`.

Every sentence of l. 160–481 is present, in order, in the right mouth, and
the only prose not in the document is listed in `SPEC.md` §1 and §10.

## How to run it

```
npm install
npm test                  # judge, names, verbatim, walkthrough and board tests
npm run build:fire        # dist/fire.js
open dist/fire.html       # or serve dist/
PLAY_WORLD=fire node scripts/play.js "look at the board" "listen"   # headless
node scripts/screenshot_fire.js                                     # browser run + screenshots
```

The full acceptance script (every command of a complete play-through) is
`round2/acceptance_script.json`; `round2/transcript_b5b_headless.txt` is
its transcript.

## The loop

The author asked for agents to read the document, propose demos, and then
for other agents to "look for ways to make that output more in the spirit
of the document, closer and closer to my actual wishes", debating the right
interpretation, over many rounds of feedback, review, debate and
implementation. This is what ran:

**Round 1 — interpretation.** Three designers read the document and the
author's scratch notes through different lenses and proposed competing
demos: A, mechanics-first (`round1/design_A.md`: the Voice of Fire as an
abstract voice, the judge as rules, roles derived from placements); B,
UI-first (`design_B.md`: the board as a projection of the history, the ¶
layer, `let it follow`, clicking-is-typing); C, narrative-first
(`design_C.md`: the lesson as a seduction, the ending as a refusal, the
locked "say that you see it"). Two critics attacked all three: a textualist
(`critique_1_textual.md`, a 48-row content audit, eleven rulings on the
interpretive disputes, 25 hard requirements) and a player-and-builder
(`critique_2_play_build.md`, playability, engine feasibility, the missing
judge). Each designer answered both critiques (`rebuttal_{A,B,C}.md`),
conceding most and defending some; the rebuttals converged on one design.
The orchestrator synthesized `SPEC.md`; a third critic audited the spec
against the document and the engine (`critique_3_spec.md`, thirteen
defects, all applied).

**Round 2 — the headless build.** One implementer built the data, the
judge and the names with tests (Phase A), then the playable world (B1). A
critic played it headlessly against the document (`round2/critique_4_play_b1.md`,
nine defects and ten improvements, all applied as B3) while the board UI
was built (B2).

**Round 3 — the board, the play, the code.** Three critics in parallel: a
browser critic drove the page and took 85 screenshots
(`round3/critique_5_ui.md`), a fresh-eyes player re-played everything and
judged the spirit (`critique_6_play_b3.md`: "the build makes you find, not
reinterpret"; its proposed change, the house's required change of mind, was
adopted), and a code reviewer judged it against the author's taste for
simple types and extensibility (`critique_7_code.md`). All three were
applied (B4, B5a, B5b).

**Round 4 — verification.** A verification critic re-checked every earlier
finding and played adversarially in both the browser and headlessly; a final
code review judged whether the result is "pristine" (`round4/`). Their
remaining findings were applied in the final phase.

`SPEC.md` carries the rulings from every round, marked by critique
(`[C3]` … `[C7]`), and §13 records what was disputed and why it was decided
as it was. `IMPLEMENTATION_NOTES.md` is the implementer's log of every
deviation from the spec and every ambiguity it resolved, plus engine
recommendations for the full game.

## What was decided, and why

The disputes that mattered most, and their rulings (details in `SPEC.md` §13):

- **Conversion is player-issued, not a cutscene.** Footnote 1 says converting
  a story *is* issuing its imperatives from the right perspective, so every
  event of every story is typed, even where the typeahead offers one
  option. The puzzle content of conversion is the voice.
- **Mapping targets are events, not prose lines**, because the player's own
  history has no prose and must be mappable later.
- **The judge is a rule with visible fudge factors**, not a whitelist. The
  candidate tables are data; the rules are seven; the nudges are authored
  per rule and per step so that wrong attempts "nudge them in the right
  direction".
- **Both wise-man solutions are never lit at once** ("in turn"), but both
  stay on the board at the end ("fits on both levels").
- **Katya says nothing the document does not give her**, apart from four
  short speeches the document summarises rather than quotes. Her indifference
  to which tinder the player chose is shown by having no line for it.
- **The house requires the change of mind.** The essay says changing your
  mind will be *required* for some puzzles; l. 385 reports having tried both
  tinders; so the line cannot be said until both have been.
- **The green room is not in the demo; its function is.** The Pillaging is
  on the shelf as data; "which voice fits" is the full game's puzzle.
- **One implementation, not two.** The loop converged on one design; a
  second, engine-free build would have been worth doing only if the engine
  had fought the design, and it did not.

## Extending it into the full game

The code review's assessment (`round3/critique_7_code.md` §3, updated in
`round4/`): a fifth story is a data file and four script lines; a second
voice with a candidate table is data plus a handful of sites that still
read the Voice of Fire; the player's own history as a mappable sequence is
a data change because the judge takes a `Sequence`; "which voice fits" is
a missing candidate table plus one line. The engine gaps the demo papers
over are listed at the end of `IMPLEMENTATION_NOTES.md`.
