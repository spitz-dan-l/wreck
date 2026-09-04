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

## Phase B4 (the round-3 code review, SPEC v1.3)

`docs/lofty_demo/round3/critique_7_code.md` implemented. World code
3174 → 3230 lines (`demo_worlds/fire/**`), tests 963 → 1137
(`tests/test_fire_*.ts`); `npm test` 58 passing in ~55 s (the fire tests
alone ~45 s, one cached replay of the 216-step walkthrough).

**Defects.**
- **D1.** Every badge, reference, rendition and annotation gist carries the
  mapping's `id` (the frame index at which the mapping was created); `set
  aside`/`resume` address one mapping's nodes and never touch another's.
  There is no third mapping any more: setting aside the last (or only)
  pass reopens that mapping with its placements kept; an earlier pass is
  set aside and the next pass opens, reusing a held mapping of that pass
  if there is one. (This is the [C6] rule of SPEC v1.3, folded in ahead of
  B5a.) `resume` of a set-aside mapping puts the mapping open meanwhile
  into `set aside`, placements kept; two mappings are never lit.
- **D2.** One annotation per (event, role): `apply_ops` groups the
  participants by event and annotates each role once (`role_entries`).
- **D3.** Bands are no longer placed per map: `rows_ops` derives `mapped`
  and `band-n` for every row from the story's mappings after each map,
  erase, apply, set aside and resume, and re-adds the folded bar with the
  derived count (**D6**).
- **D4.** The remainder underline is scoped to `.prose.cursor .piece` and
  `advance_cursor_ops` clears the class from the pieces it leaves.
- **D5.** The initial world has `collapsed: ['steps']`, so `expand the
  steps` is what is offered first; every display op is addressed through
  the board's `right` gist (`in_right_columns()`), so a `remember` reprint
  (gists stripped) is never expanded or collapsed.
- **D7.** "The family have no line here, my dear. Who acts?": `Voice.plural`
  on the friends, the family, the children, the followers, the closest
  followers, you, the books.
- **D8.** `role_name` no longer prefixes phrases that are not single
  words; `with_ordinal` falls back to a numeric ordinal ("11th") instead
  of `undefined`; the L1 nudge is built by `l1_nudge`, and `lint_sequence`
  checks that the template contains `{step}`.
- **D9.** `participants` reads the mapping's own rows only.

**Simplifications.** `frame_voices`, `remainder`, `said`, `ended`,
`reopened` and `scene` are gone from the world: `phase(w, story)` ∈
{closed, transcribing, converted, lined, mapping} is derived from the
board, cursor, mappings and history; `remainder(w, story)` from the
sequence; `has_said` and `classroom_commands` from the `classroom` gists
in the history (the gist now records the beat, so `listen` is once per
beat); `ended` is `lesson === BEAT.end`. `lesson` is one integer beat
(`BEAT`), and the classroom script is an ordered list of `Line`s over the
beats (first unsaid line offered, optional lines whenever unsaid).
`Mapping.id` replaces every positional lookup. `EVENT_NAMES` is computed
once at load. One `group_by_event`. `lint_story` is `lint_events` +
`lint_prose` + `lint_tables`. Dead code (`STEP_INDICES`, `PASSES`, the
name cache, the per-map band ops, the third-mapping path) deleted.
**S10** (the carat span) is left as it is: the hole moves at every
conversion, so a sibling carat node would need two extra ops per move
(remove and re-add) for no fewer CSS rules.

**Extensibility.** The judge takes a `Sequence` (`id`, `title`, `events`,
`candidates`, `nudges`) rather than a `StorySpec`; a mapping carries its
`voice`, and the puffers read `Mapping.voice` / `voice_for(story)` instead
of the `VOICE_OF_FIRE` constant (`LESSON_VOICE` is the one place the
lesson's voice is named). The wise man's two-solution behaviour is data:
`map_after` (l. 451 must be said before `map` is offered — phase `lined`)
and `set_aside_after` (l. 467 before the first solution can be set aside),
so a second two-solution story needs no code.

**Tests.** Walkthrough expectations are scoped to the frame's text
(`expect`) or to the board (`expect_tree`); one cached replay, per-beat
`it`s; the two vacuous asserts removed. New: erase then remap
(campfire and house), set aside → map → resume on the wise man (both
directions, placements kept, never both lit), annotations for two steps
of one role (the scattering: flame/blaze/ash once each), initial folded
notation and reprint isolation, the unmapped count after a later map
(9 → 8), `expand the campfire story` on a chip, `remember the tinder`
before anything, `remember the Pillaging`, the forest set aside and
re-applied (ash gets its third entry), the fifth house mapping played
(the thatch as tinder), the wise man's `apply` twice, the board after
`put down the chalk`. Test helpers cache the applied story and the
command enumeration per world (`story_of`, `commands`); `traverse_thread`
reruns the parser once per prefix, which is where the remaining time goes.

**Engine change.** `story/knowledge.ts`: `remove_gists(root, pattern)`,
the inverse of `graft`, moved next to it from `board.tsx`. Nothing else
outside `demo_worlds/fire` and the tests.

**Left undone / disagreements.**
- The critic's D2 example sequence (free lines in order s3→e7, s2→e8,
  s1→e9 without erasing) is blocked by L6 as specified: each fuel line must
  be freed before another step takes it; the walkthrough asserts the nudge.
- S10 as above.
- The world did not shrink: the [C6] mapping rule, the data-driven wise
  man, the plural voices and the derived rows cost about what the dead
  code and the removed fields saved.

### Engine recommendations (not done; noted for the engine)

- `lib/utils.update` treats `Set` as opaque: a Set-aware updater (or
  documenting that sets must be arrays) would remove the array-of-strings
  workarounds (`collapsed`, `taught`).
- A `set_attr` / `data` story op: the board keys state in class names
  (`band-3`, `voices-taught`) for want of a way to set a data attribute.
- A "move frame" op: moving the hole is `remove` + `insert_after(<Hole/>)`;
  moving any node is the same two ops with a query in between.
- `ingest_if_absent` / `lookup` returning undefined without throwing:
  `lookup_or_throw` forces a `find_gists` before every conditional ingest.
- A reprint marker: `strip_gists` copies a node without gists or frame
  index so later ops miss it; a `reprint` flag honoured by the queries
  would be cheaper and clearer.
- Typeahead slot grouping: with 200+ `map X to Y` threads the typeahead
  lists every event under every step; grouping options by their spec's
  chunk would let the UI show "map <step> to <event>" once.
- `traverse_thread` reruns the whole thread per prefix (O(commands ×
  chunks) parses); an enumerator that keeps the parser's partial state
  would make command enumeration cheap enough to use in the UI.

## Phase B5a (the round-3 play critique, SPEC v1.3)

`docs/lofty_demo/round3/critique_6_play_b3.md` §3–§7 implemented. World
3230 → 3299 lines, tests 1137 → 1175; `npm test` 59 passing in ~1 m 06 s.
Headless transcript: `round2/transcript_b5_headless.txt` (202 commands);
screenshots re-taken.

**Defects.**
- **D-1 / D-2** were folded into B4 (the [C6] rule): setting aside the
  second solution reopens it with its placements, never a third pass;
  resuming the first while the second is open keeps the second's
  placements as set aside; both are never lit. The walkthrough plays both
  directions.
- **D-3 / D-8.** "No line here for the fire, my dear. Who acts?"; at a
  consequence-only ¶ (the house's burning lines) any `speak as` prints "No
  one speaks here, my dear. Let it follow." No agreement to get wrong;
  `Voice.plural` stays as data.
- **D-4.** The apply text and `apply_after` print on the first apply of a
  pass only; later applies and every `resume` print the rendition alone
  (`has_said_applied`, read from the history's `applied` gists). The
  transcript now has l. 383 and the campfire's sentence once each.
- **D-5.** `Sequence.step_nudges` — a sequence's own L4 defaults per pass,
  consulted after the authored (step, event) nudges and before the voice's
  defaults. The wise man's second pass carries the critique's eight
  figurative nudges verbatim (they are not in SPEC §5.4/§10; recorded here
  as licensed nudges, §10's category). Two of them are traps in the
  walkthrough.
- **D-6.** SPEC v1.3 §10 licenses "▸ <N> events not in the mapping"; unchanged.
- **D-7.** The text form prints "— the x —" only once `taught` includes
  `voice` (l. 350); the board's bars were already gated by `voices-taught`.

**Improvements.**
- **I-1.** The campfire derives s4 "the match's flame", s5 "the kindling,
  catching", s6 "the logs, alight", s7 "the tended fire".
- **I-2 / I-5.** The roles are no longer world state: `readings(w)` is
  every apply in the history (the `applied` frames, each with the
  participants of the mapping lit there), and `role_history(w, role)`
  dedupes them per (sequence, participant), marking a reading `current`
  when the sequence's lit mapping still derives it. `remember <role>` keeps
  the set-aside readings, ", set aside"; the generated feeling reads "because
  the tinder was the thatch, and before that the oil-soaked rag" — the
  participant as derived, where SPEC §7's example abbreviates to "the rag".
  `remember the ember` at the end lists six readings, two set aside.
- **I-3.** `say Ok, I guess` (and the Locked `say that you see it`) follow
  l. 479 whichever solution is lit; a test sets the second aside first.
- **I-4.** The Pillaging's second consequence is "You enter their home."
- **I-6 / §7.** `Line.locked` may depend on the world. The four objections
  are offered once the second solution has been applied and are Locked
  while it is not the lit one (the verb Available, the rest dimmed); the
  spark's wording follows the second solution's placement whatever its
  status. `object that there is no clear tinder` is offered from the
  house's first apply and Locked until both the rag and the thatch have
  been the tinder of an applied house mapping; since l. 389 and `put down
  the chalk` follow it in the script, the house cannot be left without the
  change of mind (l. 140). The walkthrough objects after the thatch apply
  and asserts Locked before, Available after.
- **§6.** The forest's e2 reads "The season turns. The weather is right,
  and a sapling rises forth."
- **Person and tense (the rule).** Embodied voices are addressed in the
  second person; voices without a body (disembodied, abstract) are reported
  in the third. The one exception is mandated: e11 `light the pyre`, spoken
  by the closest followers, has ¶11 verbatim (SPEC §5.4) and so is the one
  embodied event reported in the third person.

**Engine.** No change. `classroom_commands` and `readings` walk the history
from the world itself (the frames puffer clears the gist before each
command, so the current frame is never double-counted).

## Phase B5b (the round-3 browser critique, SPEC v1.3)

`docs/lofty_demo/round3/critique_5_ui.md` §2–§4 implemented (improvements
1, 2, 5–10, 13–16; 11 and 12 skipped as instructed). World 3299 → 3379
lines, tests 1175 → 1217, `board.css` 276 → 342; `npm test` 59 passing in
~1 m 07 s. Headless transcript: `round2/transcript_b5b_headless.txt`;
screenshots re-taken with the production build's CSS.

**Defects.**
- **D1.** `step_node` takes a `Notation` (`none` / `absent` / `folded`) and
  emits `collapsed` only when folded; the boards are built from the world's
  `collapsed` (so a board opened after `expand the steps` shows its
  notation), and `sequence_passage` (the `remember` reprint) is never
  folded and never touched by `expand`/`collapse`. Test: folded at start,
  `expand the steps` unfolds the lesson board and a board opened later,
  `collapse` refolds them, the reprints stay as they are.
- **D2.** `speak as` frames carry a gist `speak_as(seq, voice)`;
  `voice_runs(w, story)` reads their frames from the history, and
  `rows_ops` marks each bar and its `speak as` frame `empty` when no mapped
  event (of any mapping on the board, the set-aside solution included)
  falls in its run. `collapse the unmapped` hides the empty runs, the
  followed-line frames and the wrong attempts with the unmapped rows.
  Test: 11 runs on the wise man, five empty.
- **D3.** `expand <sequence>` while no board is open moves the hole into
  the reopened board's ledger (`chip_ops`), so `scroll_down` brings it into
  view and the prompt sits under it; `collapse` moves the hole back to the
  root. While a board is open, a chip expands where it is and the hole
  stays with the board. Test: the hole's path after both.
- **D4.** The YOU rule is gone from the transcript. Once taught: one YOU
  bar at the head of the transcript (a `you_bar` node inserted after
  frame 0, the opening), and a YOU mark on the `speak as` frames
  (`speak-as` class) and the traps (`nudge` class) inside a board's left
  column only — nothing on the ledger, on `let it follow` frames
  (`follows` class) or on the root dialogue. The "— the x —" line of a
  `speak as` frame is a `voice-mark` node hidden once taught (the bar says
  it); it stays in the text form. Test: the bar is at path [1] after
  l. 350 and absent before; the classes are on the frames.
- **D5.** The Locked glyph: `.token.lock` at font-size 0 with `::after`
  U+2298; checked in the screenshots' font.
- **D6.** Hollow badges α 0.55 with a dashed border at 0.45; hollow
  references α 0.5.
- **D7.** One-line consequences: "The steps fold." / "The steps unfold.",
  "The story folds.", "The unmapped rows fold.", "<Event name> folds.",
  "<Title> unfolds.", "<Step name> is erased.", "The mapping is set aside;
  the badges hollow." (wise man: "The first solution …"), "The mapping is
  resumed; the badges solid." — board chrome licensed by SPEC §8 [C5 D7];
  the register of §10, no Katya.
- **D8.** `.board #story-hole { min-height: 9em }` reserves the typeahead's height.
- **D9.** `dist/global.css` (the engine's stylesheet, where the font is
  set — not `prompt.css`): `font-family: 'Roboto Mono', 'DejaVu Sans
  Mono', Menlo, Consolas, monospace;` — the one-token change, logged here.

**Improvements.** 1 short bars (`width: max-content; min-width: 14em`);
2 the right column `flex: 0 1 34em`; 5 the `let it follow` frame's text
hidden on the board (the ¶ row is the line); 6 references labelled FIRST /
SECOND under a step that has two (`pass-*` classes, `:has()`); 7 nudge
frames italic and gold (`nudge` class, column and ledger); 8 the ledger's
copy of the rendition hidden by CSS (the right column's `.spoken` is the
rendition; the text form keeps it for headless play and the tests);
9 was done in B4 (one annotation per role per row); 10 a faint "→" before
a chip's barcode (the mapping in story order); 13 the lesson chip carries a
strip of eight hollow badges (shown only as a chip); 14 the carat's voice
label at α 0.5; 15 below 900px the Fire's rendition is hidden and the
right column set smaller; 16 hovering a badge lights its reference and a
reference its badges (`:has()`, no JS, no state).

**Engine.** No code change; one stylesheet token in `dist/global.css` (D9).

## Phase B6a (the round-4 code review)

`docs/lofty_demo/round4/critique_9_code_final.md` §2–§9 implemented.
World 3379 → 3400 lines (`demo_worlds/fire/**`), tests 1217 → 1310,
`board.css` 342 → 340; `npm test` 63 passing, 1 m 07 s → 34 s (the fire
suite alone 66 s → 18 s). Headless transcript:
`round2/transcript_b6_headless.txt` (202 commands, unchanged script);
screenshots re-taken (no visible change).

**D1 + D3 (chips as a mode).** "A chip is expanded while no board is open"
is a world fact, `expanded_chip(w)` (a finished story not in `collapsed`
with `board` undefined), and a mode: expanding a chip with no board open
folds the chip expanded before it (`display.tsx: toggle`), so at most one
is ever expanded; `close_board` folds every chip, so the invariant holds
from the moment a board closes; while a chip is expanded the classroom
puffer offers nothing (`listen`, `pick up the chalk`, `say …` gone), so no
frame or board can be created inside a chip's ledger; `collapse` returns
the hole to the root. The hole move stands ([C5 D3]). What the player does
while a chip is expanded (`remember`, `expand`/`collapse`) is logged in
that chip's ledger; a chip shows its `closing` frame (Katya's reply) rather
than its last ledger frame, so the log never replaces l. 313–315. Tests:
the critic's D1 sequence, two chips, a chip expanded during a board and
folded by its close, and an invariant over every walkthrough world that no
`.board` is nested in another (the structure `.board.chip .columns {
display: none }` folds).

**D2 + S3.** `Line.name` and `Line.feeling?`; the `classroom` gist carries
them, and `classroom_events` reads gists only. `draw a vertical line`
(the one player event outside the script) is `DRAW_LINE` in
`transcription.tsx`. `StorySpec.line_text` and `StorySpec.reached` replace
`LINE_TEXT` and `REACHED`; `CLASSROOM_EVENTS` is gone. A test checks every
script line's name; the collision test takes the script's names. A fifth
story is one data file plus its script lines.

**S1.** `frames_with(w, tag)`: one WeakMap-cached walk of the history,
grouped by gist tag; `classroom_commands`, `event_frames`, `voice_runs`
and `readings` (itself cached) read it. **S2.** `sequences` is gone from
the world: `event_frames(w, story)` is the `event` gists; `finished:
string[]` holds the closed stories and the registered sub-sequences.
**S4.** `rows_ops` takes the pattern and bands over its steps; `StepIndex`
is `number` and the tables `{ [step: number]: … }`; the index lint stays.
**S5.** Deleted: `Voice.plural`, `sequence_of`, `pass_for`,
`Accepted.step/event/role`, the frame `voice-*` class, the third mapping
literal (`new_mapping` in `do_set_aside`), `unmapped_count` (the display
puffer calls `rows_of`), the second `has_line_here`, the two extra
capitalisations, the second `steps_on`; `story(id)` is the one story
lookup; `Notation` is a four-word union; `Line.beat` is one number with
`through?` for `look at the board`. **S6.** `both_tinders` reads the
house's first-pass candidates of the pattern's first step. **S7.**
`Mapping.sequence → story`; the judge's and the board's `voice:
AbstractSequence → pattern` (`pattern_of`, `pattern_for` in the world).
**S8.** `light_ops`/`unlight_ops` return updates.

**Tests.** `accepts(w, cmd)` (one non-submitting parse) replaces
`commands(w).includes(x)` everywhere but the early whole-list
`deepEqual`s; `verbs(w)` (one empty parse) replaces the "no command starts
with" checks; `world_at(label)` with labels on the walkthrough's steps
replaces n-th occurrence addressing in the board tests. New: the D1
sequence and two chips, every line named, `remember <event>` on the wise
man with both solutions held (the pyre, read by the set-aside first
solution alone, feels like nothing yet; the wisdom feels like the tinder —
the lit mapping's reading, as SPEC §7 has it).

**§7, §8.** The two dead `board.css` rules removed (`.prose.done`, the
repeated remainder rule); the chip rule now selects `.closing`. The
critic's paragraph heads `index.ts`, with "pattern" for the abstract
sequence and the script named as the one place a story is named.

**Left undone.** The world grew by 21 lines rather than shrinking by 90:
the chip mode, the closing frame and the fold-on-close cost about what S1–S5
saved. `voice` and `taught` are still stored (derivable, not asked for).
The `held` class is still emitted (a name for "neither solid nor hollow").

## Phase B6b (the round-4 verification critique)

`docs/lofty_demo/round4/critique_8_verification.md` §3–§4, re-checked
against B6a's code. World 3400 → 3424 lines, tests 1310 → 1339,
`board.css` 340; `npm test` 63 passing in ~32 s. Headless transcript:
`round2/transcript_final_headless.txt` (205 commands: three steps added
to the walkthrough); screenshots re-taken and checked.

- **D1.** `Nudge.pass?`: the wise man's fuel nudges are `pass: 'first'`
  and `nudge_for` skips a nudge of another pass, so the second pass's
  near misses get its own figurative defaults ("Who caught from him
  first, my dear? The few, before the many." is a walkthrough trap). The
  table lint checks a nudge against the passes it is said in.
- **D2.** `solid_ops` is exported; `do_resume` hollows the badges and
  references of the mapping it holds aside. The walkthrough now moves the
  spark to the death while the second solution is open, resumes the first
  (board test: every badge and reference of the second is hollow), then
  moves it back before resuming the second.
- **D3.** At the end (the wise man's board never closes) a chip expands
  as if no board were open: `expanded_chip` and the display puffer treat
  `ended(w)` like "no board open", the hole goes into the reopened chip's
  ledger, and `collapse` returns it to the wise man's ledger, after the
  coda (`chip_ops` takes the home ledger). Board test for both paths.
- **I1.** `remember <event>` reads the history of readings: the lit
  mapping's roles if it has the event, else the latest set-aside reading's
  roles with "; set aside." ("It felt like the ember, and the flame, and
  the blaze, and the ash, in the Voice of Fire; set aside.").
- **I2.** `say that you see it` is offered through the end (`through:
  BEAT.end`), Locked; the end-state test asserts it.
- **I3.** The wise man's first pass has a default spark nudge, "Nothing
  burns here yet, my dear. Find the lighting." (`step_nudges.first[4]`,
  licensed as a nudge, §10); a walkthrough trap.
- **I4.** The unmapped bar reads "▸ N events in neither solution" once a
  board has two mappings; "not in the mapping" otherwise.
- **I5.** Two engine observations added to the engine recommendations below.

### Engine recommendations (continued)

- After Undo the prompt holds the undone command as plain text; selecting
  it, so that typing replaces it, would make undo-then-retype work the way
  players expect.
- The Undo button stays selected while the mouse rests on it, so Enter is
  swallowed; it should lose selection on mouse-out, or Enter should go to
  the prompt regardless.

## Phase B7 (the Pillaging on the house, SPEC v1.4 §12)

World 3424 → 3512 lines, tests 1339 → 1405, `board.css` 340 → 348; `npm
test` 65 passing in ~32 s. Headless transcript:
`round2/transcript_final_headless.txt` (213 commands, the attempt with its
refusals included); a sixth screenshot, `6_pillaging_attempt.png` (the
house board with both pattern columns and the two nudges in the ledger,
taken in a taller viewport).

- **The attempt.** After l. 481 the classroom offers `try the Pillaging on
  the house in the woods` (optional, never gating; said once). It reopens
  the house chip in the chip mode — the hole in the house's ledger — with
  the Pillaging's three steps as a second pattern column beside the Fire's
  (`attempt_ops`; class `second`, narrower, in cool colours that are no
  chunk of the Fire's), and opens a mapping of the Pillaging on the house.
  `put down the chalk` (a script line of the end beat, offered while the
  house is the board) folds the board again and returns the hole to the
  wise man's ledger, the board the lesson ended on (`fold_attempt`).
- **Two patterns on one board.** The `right`, `step`, `targets` and
  `spoken` gists carry the pattern id; `mappings_on(w, story, pattern?)`,
  `open_mapping(w, story, pattern?)`; `board_pattern(w, story)` is the
  pattern of the board's latest mapping (the Pillaging during the attempt),
  `pattern_for(story)` the story's own. Badges and references carry a
  `pattern-<id>` class; `rows_of` bands the rows from the story's own
  pattern's mappings only, so the Pillaging's placement puts a badge on
  `move in` and no band, and the Fire's badges are untouched (board test).
- **Data.** The Pillaging's table on the house lives in `house.ts` under
  its voice id: step 1 → {e10 `move in` · the family}; steps 2 and 3 have
  empty rows (the lint now allows an empty row: the step fits nothing; the
  story's `absorbs` are checked against its own pattern only). Its default
  nudges are on the Pillaging's `AbstractSequence` as before ("They came
  upon it. Did they go in?", "What did they take?").
- **Katya's line.** Once the pattern has been refused on every step that
  has no candidates in this story (`refused` gists on refused maps;
  `mapping.tsx: refuse`), Katya says, once: "Not every voice fits every
  story, my dear. That is a lesson for another day." (`AUTHORED.no_fit`).
  The walkthrough plays two refusals (the line printed exactly once), a
  third (the nudge alone), `apply the Pillaging` failing L1 before and
  after, `remember the tinder` untouched, and the fold restoring the hole.
- **Licence.** The one new Katya line is licensed by SPEC §12 (l. 124,
  l. 543). Also new in the grammar: the command `try the Pillaging on the
  house in the woods` and its event name "the trying of the Pillaging on
  the house in the woods" (in the collision set); the Pillaging's step
  short names are §12's. `say that you see it` stays Locked throughout;
  `remember the Pillaging` is unchanged; nothing of the Pillaging reaches
  `remember <role>` since nothing is ever applied.
- **`finished`** now means boards closed and sub-sequences registered; the
  wise man's sequence being finished by its last solution is derived
  (`sequence_finished`), so the open board at the end is never offered as
  a chip.

## Phase B8 (the author's phone: iPhone 16 Pro, Safari)

Reported: "nothing seems to happen when I expand the steps"; the second
`listen` "narrates Katya rewriting the steps but doesn't show them again";
"maybe a second column isn't rendering"; and no way to backspace a
partially entered token without a keyboard (Safari does not pop one for
this page).

**Root causes**, reproduced in headless Chromium with iPhone emulation
(`node scripts/screenshot_phone.js`, which also probes the layout):

1. `dist/fire.html` (copied from `venience.html`) had **no viewport meta
   tag**, so Safari laid the page out at 980 px and zoomed out: the board
   was a few pixels tall, the prompt and typeahead tiny, and any change on
   the board invisible. Fixed in both pages
   (`<meta name="viewport" content="width=device-width, initial-scale=1">`).
2. At phone width the story board's two columns were a flex **row**: the
   steps column (34em) took nearly the whole width and the story column
   wrapped one word per line under a sticky overlay, which is what "the
   second column isn't rendering" looked like. `board.css` now stacks the
   columns under 700 px: the steps column full width, pinned (`sticky`) at
   the top of the board with `max-height: 45vh`, so the eight steps and
   their `→ event` references stay in view while the story scrolls under
   them; the lesson board's column is static and unclipped (it needed
   `flex: none`, since in a column flex the old `flex: 1 1 0` made its
   height zero).
3. The second `listen` ("She rewrites this in the standard notation")
   revealed the notation **folded**, so nothing visible changed, and
   `expand the steps` changed a board above the prompt while the app
   scrolled to the prompt. Two fixes: the second `listen` now shows the
   notation unfolded (Katya rewrites it and you see it; `collapse the
   steps` folds it; `index.ts` starts with `collapsed: ['steps']` only so
   that `expand` is never offered before there is notation), and the
   engine's `animate()` now ends by scrolling to the **topmost retroactive
   change** (a node with an `eph_adding_*`/`eph_removing_*` marker or
   `eph_new` outside the newest frame) when the change and the prompt do
   not both fit in the view; otherwise to the prompt as before
   (`UI/animation.ts: scroll_to_change`). This is an engine change and is
   general: the wise man's `collapse the unmapped`, a badge on a row far
   above, or `expand the campfire story` behave the same on desktop.
4. **Tap controls** (`UI/components/prompt_controls.tsx`, wired in
   `app.tsx` beside the Undo button): three 2.8em buttons after the
   typeahead, backspace (drops the last token of the prompt:
   `without_last_token`, tested), clear, and enter (submits when the
   command is complete); each dispatches the same actions the keyboard
   does (`ChangeText`, `Submit`). Shown only on coarse pointers or under
   700 px (`prompt.css`), so desktop is unchanged. Typeahead rows get a
   2.6em minimum height on touch screens.
5. `scripts/screenshot_fire.js --phone` plays the whole acceptance script
   with iPhone emulation and writes `screenshots/phone/`; the narrascope
   page gets the viewport tag and the controls for free.

Tests: `test_prompt_controls.ts`; the board test for the notation now
expects it shown after the second `listen`, folded by `collapse the steps`;
the walkthrough's end-state check uses `collapse the steps`. Transcript
unchanged.

## Phase B9: the confusion scan

The author found that `listen` then `expand the steps` printed "The steps
unfold." and unfolded nothing (the notation does not exist until the second
`listen`), and suspected many more of the same: behaviour that is right in
the expected order and a no-op, a contradiction or a dead end on any
deviation. So the deviations are now enumerated by machine.

**The scanner** (`demo_worlds/fire/scan.ts`, run by `node
scripts/confusion_scan.js`; report in `round5/confusion_scan.md`). From the
initial world and from every state along the acceptance script, it
enumerates every command the parser accepts — the typeahead's option list is
the ground truth of what a player can tap — applies each one, and classifies
what happened. Scanning every state of the script is therefore also scanning
every **one-command deviation** from it.

What a command did is read three ways: the world's own fields (`collapsed`
apart: what is folded is bookkeeping, whether anything folded is a question
for the tree); the **whole story tree as a tag-and-class signature**, so a
fold that folds nothing shows up as no change at all; and the text the new
frame printed. The signature is the one costly thing (thousands of nodes by
the end) and is taken lazily, only where the verdict turns on it.

The classes: **NO-OP** (accepted, prints nothing and changes nothing; or a
display command whose one-line consequence claims a fold that the tree does
not show); **EMPTY** (the frame prints nothing at all); **THROW**;
**REPEAT** (the same command twice running, advancing twice and printing the
same thing); **NOISE** (more than a dozen options with the advancing ones
buried, or more than six per-event folds); and **DEAD END**.

**DEAD END is a reachability proof, not a look-ahead.** From the state each
command leaves behind, `can_reach` runs a best-first search over *advancing*
commands only (`remember`, `expand`, `collapse` are pruned) and must
actually play its way to the next scene boundary — the next `apply`, the
next board closed, the next beat (`stage(w)` = the beat, the boards closed,
the applies made). `reaches_end` chains those hops to l. 481, so a `true`
there is the whole lesson played out. Two things make it fast enough:

- the moves are **generated from the world**, not enumerated by the parser
  (`advancing_moves`): the beat's classroom lines, and, at a board, the next
  event's command, `let it follow`, the story's voices, or — at a mapping —
  the candidate rows of the pass (`candidates_for`), the erases and the
  apply. Enumerating a mapping state with `traverse_thread` costs seconds
  and lists a hundred `map`s of which two or three are candidates;
- states are **keyed** (`search_key`: the beat, the board, the cursor, the
  voice, what is finished and taught, every mapping's placements and status,
  the classroom lines said, and the events converted — the cursor alone is
  not enough, since two events of one ¶ leave it where it was), a proof is
  cached by that key across the whole scan, and at one state only the first
  few commands of each verb are proved (a hundred `map`s leave a hundred
  states to prove, and a few of each verb is the sample).

`supervenience.ts`'s `search_future` was not used: its dimensions are
declared for a world of gists and interpretations, and a plain keyed
best-first over the six fields above (scene, board, cursor, voice, the
placed steps, the mapping statuses) is a dozen lines and needs no spec.

**What it found, and what was done** (`round5/confusion_scan.md` has each
finding with the sequence that reaches it, the text it printed and the
class; it ends with what remains, by design):

1. `expand the steps` / `collapse the steps` were offered from the first
   `listen` (`BEAT.chalk`), one beat before Katya writes the notation: the
   toggle set a class on a node that was `absent`, so it printed "The steps
   unfold." and unfolded nothing. Now offered from `BEAT.notation`.
2. The per-event `expand <event>` / `collapse <event>` of SPEC §6 are **no
   longer offered at all**: one entry per transcribed event (sixteen by the
   wise man) flooded the list and buried the way on. `the story`, `the
   steps`, `the unmapped` and the chips remain. (`event_ops` deleted.)
3. `collapse the unmapped` was offered whenever a mapping was open, so it
   folded nothing when every row was mapped and folded the whole column when
   none was. Offered only where some row is mapped and some is not
   (`unmapped_rows`).
4. `speak as <voice>` printed nothing before l. 350 and, after it, only the
   notation mark — which the board hides, the bar saying it. It now always
   prints one plain line, "You speak as the children." (`speak_as_line`),
   whatever the notation has taught; the mark is unchanged, so SPEC §7's
   "no mark before the speech" and the transcript's marks both stand.
5. `pick up the chalk` printed nothing for the house, the forest and the
   wise man (only the campfire has l. 248 for it), and neither did `try the
   Pillaging on the house in the woods` or the `put down the chalk` that
   folds it again. Each says plainly what happened ("The house in the woods
   goes up on the board.") — board chrome in the register of §8 [C5 D7], no
   Katya.
6. `remember <classroom event>` offered one entry per line said — "the
   listening", "the looking at the board", "the objecting …" — all of which
   printed the same "It felt like nothing in particular." (round 5, player
   2: "recall the first and second listening identically"). Only the three
   with a feeling of their own are offered now: the picking up of the chalk,
   the drawing of the vertical line, the saying of Ok, I guess. This is
   SPEC §12's first cut, taken. (`AUTHORED.nothing_in_particular` deleted.)
7. "It felt like nothing yet. It has not been read." said nothing to a
   player who had not yet met a reading (round 5, player 2). Now plain:
   "It has not been read in any voice yet."
8. The campfire trap ends with the way on: "The friends do not command the
   fire, my dear. Let it follow." (a nudge, §10). Round 5, players 1, 2
   and 3 all stopped there.
9. **Several steps on one line.** Player 1 placed steps 1–4 and 8 of the
   campfire and gave up after twenty attempts at 5, 6 and 7, because
   nothing says that one line of a story may hold several steps. The
   sequences now carry their own L4 defaults for the passes where the
   acceptance mapping shares a line (`StorySpec.step_nudges`, the mechanism
   the wise man's figurative pass already used): the campfire's s5 and s6
   ("It caught and it spread in one breath, my dear. One line of the story
   holds the spark and the spreading both."), the house's s5–s8 (all the
   scattering), the forest's s1 and s2 (all the dead brush). The wise man's
   literal pass already says it in `WOOD_MY_DEAR` ("There are only two lines
   in which anything burns").
10. The L1 nudge named one missing step at a time. It keeps its sentence
    and gains a plain list: "The Voice of Fire does not skip, my dear. The
    spreading of the ember is not on the board. Unplaced: the spreading of
    the ember, the spreading of the flame, the consumption of all."
    (`Rejected.unplaced`, filled by `violations`, printed by `nudge_frame`'s
    extra paragraphs. The Pillaging's L1 gets it too.)

**The author's unwinnable-state hypothesis** ("initial spread of ember if
the player chose sing before let it follow") does not hold, and the proof is
now standing: at the campfire's ¶8, the only commands offered are `let it
follow` and the trap — `sing` belongs to ¶9 and the transcription puffer
offers a ¶'s command only at that ¶ (`test_fire_scan.ts` asserts the exact
option list there). No consequence-only ¶ in any story can be skipped or
attached elsewhere, so no mapping is ever made unsolvable by the
transcription. The scan found no state at all from which the next scene is
out of reach.

**The test** (`tests/test_fire_scan.ts`, ~45 s): the scan over a sample of
the acceptance states (the first six, then one in twenty-five, then the
last), failing on any NO-OP, EMPTY, DEAD END, THROW or REPEAT not in an
allowlist that carries its reason; the deviation classes (a trap, a fold
mid-board, a wrong map and an erase, the wrong voice at the house's pause,
a set aside after apply, the Voice of Fire lent to a story line, the wise
man's first solution resumed) each proved to leave the next scene reachable,
and the first of them played all the way to l. 481; and
`round2/acceptance_script.json` (which the screenshot and scan drivers read)
kept equal to `ACCEPTANCE_SCRIPT`.

**Deviations from SPEC recorded here**: §6's `expand <event>` is not offered
(2); §10's "any other classroom event: It felt like nothing in particular."
is cut, as §12's cut order allows (6); §7's "It felt like nothing yet. It
has not been read." is reworded (7); `speak as` prints a line of its own
alongside the mark (4).

## Phase B10: what a person sees

Reported (iPhone Safari and desktop): "animations and scrolling are
confusing (scrolls to weird position); can't visually discern the effect of
expanding and collapsing steps and story while in the middle of mapping."
Every earlier tester drove the headless world; nothing measured the page.

**The browser harness** (`scripts/browse_fire.js`; `node
scripts/browse_fire.js [--phone] [--out DIR] [--skip N] [--acceptance |
--script FILE] "cmd" ...`). Headless Chromium, desktop 1280×800 or an
iPhone 16 Pro (402×874, DPR 3, touch). It enters each command as a person
does — on the phone by tapping the typeahead options and the Enter control,
else typing — waits until the animation lock is released and the page has
been still for 300 ms, and records the viewport (`NN.png`), a frame ~150 ms
after submit (`NNa.png`), and to `report.md`: the scroll before and after
and over time, the page height, the text visible in the viewport in
document order (prompt, options and the pinned steps column marked, text
painted under a pinned panel dropped), every DOM change the command caused
with IN VIEW / ABOVE VIEW (N px) / BELOW VIEW / UNDER <what covers it>, the
heights before and after of the containers a fold changed, the options, and
a WARNINGS line. "In view" is what is painted (`elementFromPoint`), so a
change under the pinned steps panel or the pinned prompt is not in view.
The whole acceptance script takes about five minutes per device.

**The visibility scan** (`scripts/visibility_scan.js`, report in
`round6/visibility_scan.md` with the failing screenshots under
`round6/shots/`) plays the script on both devices and, at nine mapping
states (after `draw a vertical line`, three steps placed, after `apply`, on
the campfire, the house and the wise man), the display deviations —
collapse/expand the steps, the story, the unmapped, a chip, `remember`,
`set aside`/`resume`, `erase` — taking each back with Undo (which the app
does without an animation). It asserts after every command: (a) the prompt
is in view; (b) the topmost change is in view with the prompt, or at the
top of the view when they cannot both fit; (c) a fold changed a height in
view; (d) no overshoot past the topmost change; (e) no mid-animation frame
with the prompt off-screen that settles somewhere very different.

**Before fixing**: desktop 174 of 286 commands failing, phone 164 of 286;
the prompt out of view after 107 (desktop) / 93 (phone) commands. The worst
were the chips: `expand the campfire story` at the wise man's board scrolled
8,600 px (desktop) / 13,000 px (phone) away from the change; `pick up the
chalk` on the phone scrolled 2,000 px up to the lesson board folding into
its chip and left the prompt and the new board 1,300 px below; `put down
the chalk` left the prompt 7,000 px below. The mechanism was Phase B8's
rule, "scroll to the topmost retroactive change when it and the prompt do
not fit": a fold far above (a chip, a class on a column) was the topmost
change, so the view went there and the prompt went away; and on every
keystroke the browser then scrolled the focused input back into view (a
second motion, a jump). Folds were instant, so a person had nothing to see:
`collapse the steps` on the phone changed the pinned panel's contents under
its own scrollbar, `expand the story` unfolded rows above the view.

**The prompt is pinned.** Weighed: the alternative (never pin; scroll to the
change and let the player scroll back) is the state the author found
confusing, and every check in (a)–(e) has the prompt in view as its first
term. `#story-hole { position: sticky; bottom: 0 }` (board.css): the prompt,
its options and its controls stay at the bottom of the view whenever their
place in the transcript is below it, and the page scrolls the transcript to
show the change above them. Sticky, not fixed, so the prompt keeps its place
in the flow (at the cursor ¶ during transcription, in the ledger during
mapping, SPEC §8) and is pinned only from below: the constraint is the
container that holds it (`.left`, `.ledger`, the story), which must have its
top in the view for the prompt to pin — the scroll rule keeps it so. The
typeahead is in the flow and capped (40vh, 24vh on the phone; it scrolls on
its own, the selection kept inside it), the hole has a minimum height so
the page's end does not shift as the options change, and its indent is
padding so the pinned prompt covers what it stands over. On the phone the
pinned steps panel is 36vh (was 45), leaving a band for the story between
the two pinned things.

**One scroll rule** (`UI/animation.ts`, `scroll_target_after`), decided on
the final layout before the animation starts and run as one smooth motion
with it:

- nothing changed outside the prompt: the prompt at the bottom
  (`scroll_down`), the new frame above it;
- something changed above (a badge, a fold, the notation revealed): if the
  topmost such change and the prompt fit, the prompt at the bottom with the
  change above it; if they do not fit and the response at the prompt is
  short (a line or two — the change above *is* the response), the topmost
  change at the top of the view, under any pinned panel, the prompt pinned
  at the bottom; if the response is itself long (a board opened, an apply
  text, a reprint) it is read from its top, the prompt pinned below;
- the prompt's line wins when even it cannot stay in view with the change
  (its options may be cut; a change inside the pinned column has the column
  fully in view instead, scrolled inside);
- never past the change; a class change that shows nothing (a voice class
  on a column, a bookkeeping class on a frame) is not a change; a change
  that will not be in view where the view goes is made at once, with no
  transition, and if none of the changes above will be shown the view is
  re-set at once so that what is in view stays put.

"In view" is measured by trying: the scroll is set to the candidate for a
moment and `elementFromPoint` asked (sticky panels and the pinned prompt
count as covering; a column that scrolls on its own is scrolled). Natural
positions are read with the sticky things made static for a moment
(`#terminal.measuring`). The input is focused with `preventScroll`, an undo
stands at the prompt, and the page is held at its final height while new
nodes grow so the motion is not cut short.

**Folds animate** (board.css, `FOLDS ANIMATE`): what a fold hides shrinks
over 300 ms before it is hidden and what an unfold shows grows from
nothing — the notation, the ¶s (each now marked `folded` by `story_ops`, so
the page animates each and scrolls to the first), a chip's columns and
ledger, the unmapped rows, the column drawn by `draw a vertical line`. The
engine gives a node marked `--is-collapsing` its measured height at the
start of the animation (per node now, not per story). So `collapse the
steps` visibly shrinks the pinned panel and `expand the steps` visibly grows
it, and the column comes fully into view when it and the prompt cannot both
fit.

**A production-build bug found on the way.** esbuild's `--minify` defines
`NODE_ENV=production`, under which typestyle drops debug names and hashes a
style's properties only: the three empty marker styles
(`animation_pre_compute`, `animation_start`, `animation_active`) were one
and the same class in every production build, so the appear animation's
"start at 0, then transition" never ran as written, and the fold animation
could not either. The markers are plain class names now
(`animation-pre-compute`, `-start`, `-active`, and `eph-new`, whose rules
history.css already carried); venience.html gets the same, checked.

**After** (`round6/after/visibility_scan.md`): desktop 14 of 286, phone 25
of 286, all of them (e) — the prompt leaving the bottom of the view for
the length of a transition while rows fold or unfold in view or a chip
2,000 px above reopens with the prompt far below, and returning; (a)–(d)
are clean on both devices: the prompt is in view after every command, the
change with it or at the top, every fold visible, no overshoot. The harness
also confirms one smooth motion per command (the typeahead shrinking at
submit was the second; the hole's minimum height stops it) and no motion
while the page is idle (a first cut of the visibility probe itself clamped
the scroll by undoing a fold for a moment; both probes now keep the scroll).

**Tests**: `tests/test_visibility.ts` runs the scan sampled — the campfire
to `draw a vertical line` with the steps and story folds there on the
desktop, the opening on the phone — in about 50 s, skipped with a message
when Playwright's Chromium or dist/fire.js is missing. The screenshots under
`screenshots/` and `screenshots/phone/` are regenerated.

**Known costs of the rule**, by design: when a change far above is shown
with the prompt pinned, the command's own one-line response sits under the
pinned prompt (the scan counts this as seen); a long reprint or apply text
moves the view by more than a screen (the harness warns JUMP); while
content grows or folds in view, the prompt may leave the bottom for the
length of the transition and return (check (e)) — pinning from above as
well would float the prompt over unconverted rows, so it was not done.

## Phase B11: the browser critique (round 6, critique 10)

`round6/critique_10_browser.md` played the whole script on both devices and
looked at the screenshots: the prompt stayed in view and the whooshes were
gone, but what a mapping player most needs — the badge landing on a row,
the rows unfolding — was still out of view in the moments the author was
playing, and on the phone the pinned panel ballooned during every command.
All eight defects taken, with the critic's own changes where given:

1. **The prompt pins over the whole board.** `.board .ledger { display:
   contents }`: the ledger makes no box, so the sticky prompt's containing
   block is the board and it can pin over the rows above the ledger. The
   engine finds the containing block by skipping `display: contents`
   parents. This alone frees `expand the story`, `expand the unmapped`, the
   first `map`s and `apply` to show their rows with the prompt pinned.
2. **A change inside a pinned column never steers the page** while another
   change is outside one (the reference's natural top is the column's top,
   so it was always "the topmost change"); the lead is the topmost change
   outside pinned columns, and every changed node inside a column is
   scrolled into the column's own view at the target.
3. **No inline max-height on nodes that keep their own height** (the steps
   column, the prompt and its typeahead): `animate()` skips them in both
   passes, so the phone panel no longer swells to 580 px and snaps back.
4. The desktop `map` typeahead below the fold is cured by 1 (the hole pins
   up into the board as the options grow).
5. **A board reopening around the prompt** (`expand <sequence>` at the
   root) is read from its top with the prompt pinned below, whatever its
   height. Mid-mapping the hole stays with the open board (the mapping's
   frames must print in that board's ledger, SPEC §8, so moving the hole
   into the reopened chip's ledger was not done) and the line says where
   the board is: "The campfire story unfolds, above the house in the
   woods."
6. **Phone: the steps first**, pinned over the rows and the ledger alike:
   the board is a flex column (title, steps, rule, rows, then the ledger's
   frames and the prompt, `.columns` and `.ledger` making no box), the
   steps `order: -2`, so the panel's sticky range is the whole board and it
   stays through a long ledger; `apply` and `set aside` show rows and panel,
   not a bare ledger.
7. **Desktop `expand the steps` moves nothing but the panel's inside**:
   when every change is inside a column that is already in view, the page
   keeps its scroll (or the prompt's, when the response at the prompt is
   long) and the column scrolls itself; the page moves only when the column
   is not in view at all.
8. `put down the chalk` after the Pillaging: its frame gets the `closing`
   class, so the house chip keeps it in view like `say all set`'s.

Also: the unmapped rows are marked one by one (`unmapped-folded`, set by
`rows_ops`, as `folded` on the ¶s; the board's `story-collapsed` and
`unmapped-collapsed` no longer hide rows themselves, so that each row's own
class change is one the eye can see), so `collapse the unmapped` animates
each row and the view goes to the first; every marked node is measured
before the folds close (whether a class change shows is judged on the final
layout); a change at the top of a frame is shown from the frame's top (the
reprints had their own `> remember …` line cut); a command's changes
accumulate across its animation stages, so a later stage cannot undo an
earlier stage's view; folds ease out over 350 ms; the chip barcode is one
line on the phone; options are 3.4em tall on touch screens and Undo padded.

Two things the visibility probe found because it asks whether a class
change can be seen: the rows' coloured bands (`.frame.band-N`) had never
shown, outranked by `.board .left .frame`'s transparent border — they show
now; and the same probe in the harness marks such changes "(no visible
effect)" in the reports.

**The `let it follow` cue** (`round6/tester_3_phone.md`: a phone tester at
the campfire's "The fire starts, spreading first to the kindling and then
the logs." never saw that `let it follow` was the way on). A
consequence-only ¶ (one of the story's `follows`) carries the ↳ it will
have once attached from the start (dimmer until then), and while it is the
cursor ¶ a caption under it in the board's register: "(a consequence of the
last command)". Display only (`prose_node` adds `follows-line`; board.css
draws both); the command stays `let it follow`. The harness reads the text a
stylesheet draws before or after a block, so its reports show the ↳ and the
caption.

The scan's "in view" rule no longer passes a change because its tall
container intersects the view: a class change on a container taller than
half the view is not a place (its rows are), and a folded row counts at the
place it had (`FOLDED IN VIEW` / `FOLDED ABOVE VIEW` in the harness).

Looked at (the critic's deviation scripts at the campfire, the house and the
wise man, both devices; `round6/critique_10_browser.md`'s acceptance
criteria): `expand the story` shows the ¶s unfolding in view with the
prompt pinned; the first `map` shows its badge at the top with the prompt
pinned on both devices; `apply`/`set aside` on the phone show rows under the
pinned panel; the panel stays 36vh through the animation; desktop `expand
the steps` moves the page 0–20 px and unfolds inside the column.

@@B11AFTER@@

Left as they were: the command's own echo still lands under the pinned
prompt when a change far above is shown (the critic's "shadow" suggestion —
a placeholder line at the prompt — is a larger change to the prompt); the
desktop column is still pushed up by the columns' end while the ledger is
read; two scroll motions on the phone after a tap (the tap's own scroll).
