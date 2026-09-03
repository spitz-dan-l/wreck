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

## Phase B2 (the board UI)

Build with `npm run build-dev:fire` (or `build:fire`), open `dist/fire.html`;
`node scripts/screenshot_fire.js` plays the acceptance script in headless
Chromium (Playwright from the global install at
`/opt/node22/lib/node_modules/playwright`, browsers at
`PLAYWRIGHT_BROWSERS_PATH=/opt/pw-browsers`), fails on any page or console
error or if the last line is missing, and writes the five screenshots to
`docs/lofty_demo/screenshots/`.

**Engine change (general bug).** `UI/components/input_prompt.tsx`: the
prompt cleared its DOM `<input>` only when the *rendered* text changed
between renders. When keystrokes and Enter arrive within one render tick
(a scripted driver, a paste), every `ChangeText` and the `Submit` are
reduced in one pass, the text before and after the pass are both empty,
and the input keeps the submitted command; the next command is appended to
it. Reproduced on the narrascope page too. Fix: compare against the input's
actual value. No other engine change; no change to `parsed_text.tsx`.

**§8 claims verified in code before use.** New frames land where the hole
is (`dsl.tsx: init_story_updates` replaces the hole by `[EmptyFrame, Hole]`,
applied first on every command); the hole is moved with
`S.story_hole().remove()` + `insert_after(<Hole/>, true)` / `add(<Hole/>,
true)` and in the DOM the single `#story-hole` element is re-appended;
`S.frame(i)`, `S.frame()` and `has_gist` search the whole tree, so nested
frames are addressable; `dom_lookup_path` walks `childNodes`, which matches
the story tree one node per child (strings are text nodes); css ops carry
`eph_adding_/eph_removing_` markers and `animate()` measures every element,
so added nodes and toggled classes animate for free; `scroll_down` scrolls
`.typeahead .footer` into view wherever the hole is (verified in `.left`
and in `.ledger`: the prompt is in view in the screenshots).

**Story-tree shape.** As §8, with gists `lesson_board`, `board(seq)`,
`left(seq)`, `rule(seq)`, `right(seq)`, `ledger(seq)`, `prose(seq, n)`,
`voice_bar(seq, frame)`, `step(seq, n)`, `targets(seq, n)`, `spoken(seq, n)`,
`badge(seq, event, step, pass)`, `reference(seq, step, pass)`,
`rendition(seq, step, pass)`, `annotation(seq, n, pass, role)`,
`unmapped(seq)`. The lesson board's steps use `seq = 'lesson'`; the
knowledge passages of the abstract sequences use the voice id. Boards are
inserted after the frame of the command that opens them
(`S.frame().insert_after`), so they sit at their chronological position.

**Resolved ambiguities / deviations.**
- The board's ¶s are split into pieces where a ¶ yields two events, from
  the events' `remainder` (a suffix of the ¶); the piece still to convert is
  underlined once the first event is issued. The cursor ¶ is bright, the
  others dim, a followed ¶ gets "↳".
- `say all set` folds the board to a chip, but its own frame (Katya's reply,
  l. 313–315) was created in the ledger before the fold; the chip therefore
  hides the ledger except its last frame (CSS), so the reply stays visible
  under the chip. A frame cannot be moved after the fact by value.
- Voice bars are inserted on every `speak as` (after its frame, with the
  hole moved after the bar) and hidden by CSS until l. 350, when one class
  on the story root (`voices-taught`) reveals every bar and every `You`
  mark at once. The `You` mark is a class on every non-event frame, drawn
  by CSS; frame 0 (the opening, no command) has none. The carat's voice is
  a per-voice CSS rule on `.left`'s `voice-<slug>` class, one rule per
  voice in `dist/board.css`; `parsed_text.tsx` is untouched.
- Bands: `band-<step>` classes on the row; the CSS colours the row's left
  border by the highest step it holds (the badges show all of them).
- The unmapped bar is appended at the end of `.left`; the count is the
  board's events minus the rows holding a badge of any mapping (both
  wise-man solutions count), so the wise man's is "6 events".
- `expand/collapse the steps` toggles every `.notation` node at once (the
  lesson board's and every board's); `<event>` folds its frame's output;
  `the story` hides the board's ¶s.
- The typeahead is `position: static` inside a board (the engine's
  absolute typeahead is right at the root, where nothing follows it, but in
  `.left` it overlaid the ¶s still to convert).
- The right column is `position: sticky; top: 0; align-self: flex-start`
  with its own `max-height: 100vh; overflow-y: auto` (R2); the scroll
  container is `#terminal`.
- Colours per step as §8, as `--step-rgb` custom properties; voices never
  use fill colour (bars are rules: solid, dashed, double).
- `dist/fire.html` loads `global.css`, `cursor.css`, `history.css`,
  `prompt.css`, `board.css` and `fire.js`; `interpretations.css` is
  narrascope's and is not loaded.
- The screenshot driver types each command with real key events and waits
  for the world index to advance and the animation lock to clear; the
  Google font request is answered with an empty stylesheet so the run does
  not touch the network. The acceptance script JSON is regenerated from
  `ACCEPTANCE_SCRIPT` (it now includes `collapse the unmapped`).

## Phase B3 (the round-2 play critique, SPEC v1.2)

All of D1–D9 and I1–I10 and the orchestrator's notes are in, with these
particulars:

- **D1.** `followed_lines` attaches a consequence-only ¶ to the single
  event with the greatest index whose ¶ precedes it. Regressions in the
  judge test (`event_consequence`) and in the walkthrough (`remember the
  lighting of a match` has no l. 288; `remember the lighting of the rag` has
  no l. 336).
- **D2.** In a story with no second-pass table, `set aside the mapping`
  returns the mapping to `open` with its placements kept (`Mapping.reopened`
  marks it; badges hollow, roles, rendition and annotations dropped);
  `map`, `erase`, `apply` are offered again and `resume the mapping`
  re-applies it unchanged. The critic's test sequence ("map tinder to the
  laying of walls and a roof" straight after set aside) is refused by L6,
  correctly: the thatch line still holds the kindling. The walkthrough
  frees each line first (firewood → foundation, kindling → frame, then
  tinder → thatch) and ends with "the thatch, in the house in the woods".
- **D3.** l. 350's second sentence prints after the voice speech; l. 419's
  last sentence after the abstract-voices speech. Both are in `QUOTED` and
  covered by the verbatim test.
- **D4.** Every objection, the Locked line and l. 481 require the second
  solution to be the applied one; the walkthrough probes it (set aside the
  second, resume the first: nothing is offered).
- **D5.** "It went like this:" heads every event and sequence replay,
  classroom events included.
- **D6 / I8.** `speak as` is accepted only for a voice that has the cursor
  ¶'s line; otherwise "The <voice> has no line here, my dear. Who acts?"
  prints and nothing changes (the voice, the speeches). The forest's
  speeches therefore fire at the seed and the season.
- **D7.** `remember the Voice of Fire` is built from the data with the
  chalk form alone until the second `listen` (the notation is not merely
  hidden: `to_basic_text` would still print it).
- **D8.** The coda is its own node (`.coda`) inserted after the last frame
  in the ledger; `remember the saying of Ok, I guess` ends with "But you
  don't really see it." then its feeling.
- **D9.** `StorySpec.apply_after` holds l. 465; it prints in the frame's
  prompt category, which the engine lays out last, after the rendition in
  the description category.
- **I1.** The text rendition (the apply frame's description, gist
  `rendition_text(seq, pass)`) groups the steps that share an event, its
  consequence once; on the board each step's `.spoken` gets its line and
  only the first of the sharing steps carries the consequence.
- **I2.** `remember <event>` prints one feeling line ("It felt like the
  ember, and the flame, and the blaze, in the Voice of Fire."); the
  annotations stay in the passage and on the board.
- **I3.** s1 derives "a patch of tinder" in the campfire.
- **I4.** `put down the chalk` closes the house (after l. 389) and the
  forest (after apply); `say all set` remains the campfire's; the wise man
  is closed by the objections. Named "the putting down of the chalk" for
  `remember`.
- **I5.** The `let it follow` frame prints "↳ ¶" as its consequence; the
  appended paragraph is no longer duplicated into the previous frame on the
  board (knowledge still attaches it to the previous event, so `remember`
  and the rendition show it there). On the board every ¶ row now has one
  frame beneath it, followed ¶s included.
- **I6 / I9.** The four objection sentences keep the .md's quotation
  marks; the verbatim test strips a quotation mark at either edge of a
  passage before matching. The mark prints as `"His death. Very well. Hold
  that," says Katya.`
- **I7.** `nudges.L1` is a template; the judge fills `{step}` with the first
  unplaced step's name, capitalised ("The laying of the tinder is not on
  the board.").
- **I10.** l. 449 spells "interpretted and reinterpretted"; the prose keeps
  the .md's spelling, and e15's authored consequence uses "interpreted and
  reinterpreted" as SPEC §5.4 gives it. The verbatim test exempts e15
  because it is `authored`.
- **Orchestrator 5.** e5 (the followers) now reads "Word of the man's
  wisdom spreads"; every other authored line was checked for a consistent
  person within its voice.
- **Orchestrator 6–7.** `speak as` prints "— the children —" and a
  successful `map` prints "→ <event name>" as the frame's consequence. On
  the board these sit in the ledger/left-column frame as the log of the act
  while the bar and the badge/reference are the board's state; a node
  cannot be in two places, so the text is a second, gist-less node.
- Badges are "held" (outlined) when placed, solid once applied, hollow once
  set aside; the barcode follows the mapping's status.
- The house's `say all set` frame in the chip: the chip CSS shows the
  ledger's last frame, which is now `put down the chalk` (l. 393).
