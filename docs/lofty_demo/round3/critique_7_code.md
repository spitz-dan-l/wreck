# Critique 7 — code review of the Voice of Fire build (round 3)

Reviewed at `32f4125`: `README.md` (Architecture), `SPEC.md` v1.2,
`IMPLEMENTATION_NOTES.md`, all of `src/typescript/demo_worlds/fire/` (3,174
lines), `tests/test_fire_*.ts` (963 lines), the two entry points,
`dist/board.css`, `scripts/screenshot_fire.js`, and the one engine change
(`4ef8b09`, `UI/components/input_prompt.tsx`). Compared against `puffer.ts`,
`lock.ts`, `story/update/dsl.tsx`, `story/knowledge.ts`, `gist/gist.ts`,
`parser/parser.ts` and `demo_worlds/narrascope/`. `npm test`: 50 passing, 1
pending (the pre-existing narrascope skip), 1 m. `npm run build:fire`: clean,
`dist/fire.js` byte-identical to the committed one. Every defect below was
reproduced with a scratch driver over the compiled build (the same harness as
`scripts/play.js`); the command sequences are given so they can be replayed
with `PLAY_WORLD=fire node scripts/play.js …`. Nothing was modified.

The bar is the owner's: drastically simple types, no clever type-level
programming, small surface area, plain data over abstraction; one or two
pristine implementations that extend into the full game.

---

## 1. Defects (ranked)

**D1. The board loses a reference when a third mapping shares a pass.**
Board nodes are addressed by `reference_gist(seq, step, pass)` and
`badge_gist(seq, event, step, pass)` — the *pass* stands in for the mapping.
But `do_set_aside` on the wise man's second solution creates a fresh empty
mapping that is also `pass: 'second'` (`mapping.tsx:151`), and `map` is
offered on it (122 rows). Input, after the acceptance script up to `collapse
the unmapped`:

    set aside the second solution
    map the sparking of the tinder to the dying unexpectedly
    resume the second solution

`place_ops` does `at(reference_gist('wise_man', 4, 'second')).remove()`,
which removes the *set-aside* second solution's reference under step 4 and
puts the new mapping's there; `do_resume` then erases the dropped mapping's
placements by the same gist. Result (probed): the world says the second
solution is applied with s4 → e12, but under step 4 the board shows only the
hollow first-solution reference; "→ the adjusting of his words" is gone for
good, and the eight solid references become seven. The same dead-end mapping
also prints the mark `"His death. Very well. Hold that," says Katya.` for a
placement that can lead nowhere (no other step is placeable, `apply` fails
L1), and the objections vanish meanwhile. The invariant "gists unique where
addressed" is broken because two mappings can carry the same `(seq, pass)`.
Fix: give `Mapping` an `id` and key the badge/reference/rendition/annotation
gists by it; or do not open a third mapping when both passes are already
held (offer only `resume`). The second is the smaller change and the better
design: a set-aside second solution has nothing to pass into.

**D2. Duplicate annotations on rows that carry two steps of one role.**
`apply_ops` adds one `annotation_node(seq, event, pass, role)` per
*participant*, but the gist is per *role*. House e13 holds steps 5–8
(flame, blaze, blaze, ash): the board row reads `— the flame — the blaze —
the blaze — the ash` while `graft` deduplicates the knowledge passage, so
`remember the scattering` reads `— the flame — the blaze — the ash`
(probed). The wise man's e11 row reads `— the ember — the flame — the blaze
— the blaze — the ash` after the literal apply. The transcript and the
memory of the same event disagree, which is exactly what §7.3 says must not
happen. Fix: annotate per `role_entries`-style dedup (one node per (event,
role)), as the knowledge already does.

**D3. Bands are never removed.** `place_ops` adds `band-<step>` to the row;
`erase_ops` removes the badge and the reference but not the band. After
`map the laying of the tinder to the laying of the tinder in the pit` then
`erase the laying of the tinder`, the e4 frame still carries `band-1: true`
(probed), so the row keeps its straw left border with no badge; a moved step
leaves its colour on the old row. `mapped_rows_ops` contains
``[`band-${'x'}`]: false`` — a literal `band-x` class that is never true —
which looks like an abandoned attempt at this very cleanup. Fix: compute
bands from the mapping in `mapped_rows_ops` (it already recomputes `mapped`
on every map/erase/resume) and drop them from `place_ops`.

**D4. The remainder underline never goes away.** `light_remainder_ops`
sets `remainder` on the piece; nothing clears it, and the CSS rule
`.prose .piece.remainder { --alpha-color: 1; text-decoration: underline }`
is not scoped to `.cursor`. After `touch the flame to the tinder`, ¶7's
piece-1 still has `remainder: true` with the ¶ `done` (probed), and
`1_campfire_applied.png` shows "and carefully touches its flame to the
tinder." and "The friends retreat to their tents." underlined and bright on
a finished board. Fix: scope the rule to `.prose.cursor .piece.remainder`,
or clear the class in `advance_cursor_ops`.

**D5. `expand the steps` cannot be said first.** The notation is created
with class `collapsed` (`step_node`), but `world.collapsed` does not contain
`'steps'`, so `display_puffer` offers `collapse the steps` — which sets a
class that is already set, a visual no-op — and only after that `expand the
steps`. §9 beat 0 says `expand the steps` shows l. 185–215; it is not
offered at any point until the player has issued the no-op. Probed at the
house's mapping state: offered `['collapse the steps']`, notation classes
`{notation, collapsed}` before and after. The toggle also flips every
`.notation` in the tree, including the gist-stripped reprints inside
`remember the Voice of Fire` frames (§3 says reprints must not be touched by
later ops; stripping gists does not protect them from `has_class` queries).
Fix: seed `collapsed: ['steps']`, and scope `steps_ops` to the boards.

**D6. The unmapped bar's count goes stale.** The bar text is fixed at
toggle time; a later `map` on the same board leaves "▸ 6 events" while the
`mapped` classes update (probed). Minor, but it is stored display state
that should be derived.

**D7. "The followers has no line here, my dear."** The I8 nudge
capitalises the voice name and uses a singular verb; every embodied voice
but "the boy" and "the man" is plural. Spec wording, but Katya would not
say it. Minor.

**D8. `role_name('their home')` → `'the their home'`.** The collision set
therefore contains "the their home" and "the things taken", not the roles
"as written" the notes claim. Not player-visible in v1 (the Pillaging's
roles are never offered to `remember`) but it becomes visible the day the
Pillaging is mapped. Latent.

**D9. Latent traps, unreachable in this content.** (a) `with_ordinal`
throws at the eleventh repeat of a name; it runs inside `handle_command` on
every keystroke (`classroom_events`), so an eleventh `listen` would crash
the parser, not print a message — only unreachable because scenes offer
`listen` five times. (b) `nudge_for`'s L4 fallback returns `nudges.L1` with
`{step}` unreplaced; the lint makes it unreachable. (c) `participants()`
prunes candidates by L7 against *other* set-aside mappings, so
`resume` (which does not re-judge) would throw "not a candidate row" if a
second-pass row ever overlapped a first-pass target; the tables happen to be
disjoint. The derived participant of a placement should not depend on other
mappings. (d) `reopened: true` survives `apply` on the mapping (spread), so
an applied mapping can carry a flag that means "open".

Nothing mutates immutable data: every world update goes through `update()`,
story ops return new trees, `remove_gists`/`strip_gists` copy. The hole
invariant holds (the engine throws otherwise, and the board test checks
it). Index arithmetic in `followed_lines`, `prose_pieces`, `event_names`
and the cursor is correct; I found no off-by-one. `traverse_thread` still
enumerates every candidate at every state (the tests check it).

---

## 2. Simplifications (ranked, with sketches)

**S1. Stop storing what can be derived (~40 lines, four fields, several
invariants).** `FireWorld` has fifteen fields; four are dead or redundant:

- `frame_voices` is written in `issue_event` and never read anywhere.
- `remainder` is written in three places and read only by the walkthrough
  test; it is a pure function of `(story, converted)`:
  `story.events[converted - 1]?.remainder` when the next event shares the ¶.
- `said` duplicates history: `classroom_events()` already walks
  `w.previous` for frames with a `classroom` gist. `has_said(w, cmd)` is
  `classroom_events(w).some(e => e.command === cmd)`.
- `ended` is `w.scene === 'end'`.

Also `board` is implied by `scene` (`"<story>:<phase>"`), and
`sequences[id].finished` by the phase. Removing the first four is mechanical
and removes the invariants that keep them in step.

**S2. One id per mapping, not a pass label (fixes D1; ~0 net lines).**

    interface Mapping { id: number; voice; sequence; pass; placements; status }
    badge_gist(seq, event, step, id); reference_gist(seq, step, id); …

`pass` stays as data (the judge needs it); the board addresses mappings by
`id`. `label()` then reads `pass` for its wording and nothing else.

**S3. Derive the scene instead of setting it in four places (~30 lines).**
`scene` is assigned by `say_line` (`next`), `open_board`, `draw_line` and
`finish_board`, and read by string comparison in every puffer. Within a
story the phase is a function of state:

    function phase(w, story): 'transcribing' | 'lined' | 'mapping' | 'done' {
        if (w.sequences[story.id]?.finished) return 'done';
        if (w.board !== story.id) return 'told';           // or 'ready'
        if (w.cursor! <= story.prose.length) return 'transcribing';
        return mappings_on(w, story).length === 0 ? 'lined' : 'mapping';
    }

What is genuinely not derivable is *which beat of the lesson we are in*
(told vs ready vs done is a matter of which lines have been said), and that
is one integer: `lesson: number`, an index into an ordered list of beats.
Then `scene_of` and the 31 scene strings go, and `SCRIPT` lines say
`beat: 4` instead of `scene: scene_of(HOUSE, 'told')`. The special phases
(`second` for the wise man, `lined` gating `map` behind l. 451) become
`requires` on the two lines that need them.

**S4. Ordered line lists instead of `has_said` chains (~25 lines).** The
four objections and the two house lines are strictly ordered; today each
carries a `requires` that checks the previous was said and this one was
not. Data can say that:

    { beat: 8, sequence: ['object that there is no fire', 'object that the fireplace is too abstract',
                          <spark objection by placement>, 'object that the ash is still structured'] }

and one rule offers the first unsaid line. `spark_said`, `objections_open`,
`spark_is` and six `requires` closures fold into it.

**S5. One grouping for the Fire's rendition (~15 lines).** `rendition_node`
(board, "consequence only under the first sharer") and `rendition_text`
(frame, "steps grouped by event") implement the same grouping twice, and
`apply_ops` reimplements it a third time with `seen_events`. One
`group_by_event(parts): Participant[][]` feeds both renderers.

**S6. Drop `reopened` (~8 lines).** Offer `resume the mapping` whenever the
open mapping has no violations (`violations(...).length === 0`); it is then
"the no-edit shortcut for apply" by definition, with no flag to keep in
step (D9d).

**S7. Compute names once, at load (~15 lines).** `event_names(story,
STORIES)` is called at ~10 sites, always with `STORIES`, guarded by a
module-level `Map` cache with a `stories.length > 1` special case for the
L5 test. `data/index.ts` can export `EVENT_NAMES: { [story: string]:
string[] }` computed once; `names.ts` keeps the pure functions.

**S8. Dead code (~25 lines).** `STEP_INDICES`, `PASSES`, `finished_stories`,
the `export { board_story }` re-export in `classroom.tsx`, `exact_gist`
(an alias of `exact`), `band-x`, `frame_voices`, `remainder`; `event()` in
`data/index.ts` and `event_of()` in `judge.ts` are the same lookup; `Rule`
includes `'L1'` in `nudge_for` although L1 nudges are built in
`violations`.

**S9. `lint_story` is 116 lines.** Split by subject (events, ¶ coverage,
tables); no behaviour change. The next longest is `SCRIPT` (107 lines of
data, fine) and `mapping_puffer.handle_command` (50).

**S10. The CSS carat rules.** Fifteen per-voice `content:` rules exist
because the story-op DSL can only toggle classes. A single node
`<span class="carat-voice">the children</span>` inserted by `speak_as_ops`
next to the hole (or a `data-voice` op, §4) would replace them.

Type-wise the code meets the bar: no generics of its own, no conditional
types, one small union (`MappingStatus`), `SceneId = string`. The one type
doing a data job is `SceneId` (S3). `CandidateTable = { [pass]?: { [step]?:
Candidate[] } }` is the right shape for "visible fudge factors".

---

## 3. Extensibility

**A second voice (the Pillaging with a candidate table).** The judge is
generic: every function takes an `AbstractSequence`, the nudges live on it,
`Step.role` is a string, `candidates` is keyed by voice id, and
`lint_story(story, PILLAGING)` already runs. The world is not: `const FIRE =
VOICE_OF_FIRE` in `mapping.tsx` and `remember.tsx`; `mappings_on()` in
`world.ts` filters by `VOICE_OF_FIRE.voice.id`; `draw_line` opens a mapping
for the Fire; the grammar is `apply the Voice of Fire`; `board_node` builds
the right column from one `fire`; `step_gist(seq, n)` would collide between
two voices on one board; `remember_story` hard-codes "because the tinder
was" and `placed(applied, 1)`; `remember_role` offers `FIRE_ROLES`. About
twelve sites, none deep. The change that pays for all of them: put the
voice on the board (`world.voice_on_board`, or a right column per voice
keyed `step(seq, voice, n)`), read `Mapping.voice` everywhere the constant
is read, and make the roles line generic (`step 1's role was <derived>`).

**A fifth story.** Add `data/fifth.ts` to `STORIES`, four `SCRIPT` lines
(told/ready/pick up/put down), entries in `LINE_TEXT` and `REACHED`; the
collision test and the lints do the rest. This is already data-and-little-
code. The `story.id === 'wise_man'` checks in `mapping.tsx` (×3) and
`transcription.tsx` (×1) are the only per-story code and would not fire;
they should become data (`StorySpec.solutions: 2`, `StorySpec.map_after:
'say that … two lines'`).

**A non-classroom scene.** The board, judge, names and `remember` are
scene-free. `classroom.tsx` is not: `Line.says` is typed `QuotedKey[]` over
one `QUOTED` table, `in_beat_0` and the `next` chain are the classroom's.
With S3/S4 the classroom becomes one `BEATS` table, and a second scene is a
second table plus its own `QUOTED`. Medium.

**The player's own history as a mappable sequence.** `sequences[id].events`
is already a list of frame indices and "today's lesson" is a named
constant; `event_frame` and `place_ops` address rows by frame, so the board
ops would work on classroom frames. The blocker is the judge's parameter:
`place`/`apply` take a `StorySpec` but read only `events[].index`,
`events[].absorbs`, `candidates`, `nudges`, `title`. Narrow it to

    interface Sequence { id; title; events: { index; absorbs? }[]; candidates; nudges }

(`StorySpec extends Sequence`) and a classroom sequence is a `Sequence`
built from `classroom_events(w)` plus an authored table. Small change, high
value; do it before the judge grows.

**A "which voice fits" puzzle.** `candidates[voice]` missing → `raw_rows`
returns `{}` → every placement fails L4 with the voice's own default nudges
("They came upon it. Did they go in?"). The judge is ready; what is missing
is the second-voice work above and a `try <voice> on <story>` line. The
`mark` mechanism gives Katya's "Not every voice fits" a place to live.

**The scene machine.** `world.scene` will not scale: it is a flat string
set in four places, compared in six, and it encodes three different things
(lesson beat, board phase, wise-man sub-phase). A lock is *not* the
replacement: `lock.ts` gives one owner the whole command space, but this
lesson interleaves classroom lines with board commands on purpose (l. 348
between ¶8 and ¶9, the objections inside the ledger, `remember` anywhere).
`gate_puffer` would tidy the three board puffers' first lines but not the
state. The replacement is S3: an integer beat into a data table plus a
derived board phase. That is a scene table, and it is what the classroom
puffer is already three-quarters of.

**Board ops outside this lesson.** `board.tsx` takes `StorySpec` +
`AbstractSequence` + `Participant` and strings; the hole moves,
badges/references, chips, expand/collapse are lesson-free. Two couplings:
`prose_node`/`board_node` assume a story has `prose`, and the gists assume
one voice per board. With the `Sequence` split and a voice in the gists it
is a reusable "two-column mapping board".

---

## 4. Engine fit

The world uses the engine as intended and better than narrascope in places:
six small puffers baked by `make_puffer_world_spec`; every visible change is
a story op on a gist-addressed node, so tests and the page see the same
tree; the hole-moving trick from `reflect.tsx` is used exactly as written;
`knowledge.ts`'s `ingest`/`graft`/`lookup_or_throw` carry the annotations
and `remember`; `frames_puffer` uses "the frame's gist is what was done"
the way narrascope's `gist` field does. Two deliberate departures: no lock
(right, see §3) and commands are strings rather than gists rendered by
`GistRenderer` — `classroom_gist(command)` carries the raw command as a
param. That is simpler and fits the owner's taste; the cost is that
`remember` cannot dispatch on meaning, only on the string, which is fine
here.

**The engine change** (`input_prompt.tsx`) is minimal, general and
justified: comparing the DOM input's value instead of the last rendered
props is the correct fix for a real bug (a submit within one render tick
left the command in the input), reproduced on narrascope, and it changes
nothing for the interactive path.

**Gaps the demo papers over (recommendations, not work):**

1. `remove_gists(root, pattern)` (`board.tsx`) is the inverse of
   `knowledge.graft` and belongs beside it.
2. `update()` treats `Set` as opaque, so `collapsed`/`taught` are arrays;
   a `Set`-aware branch (or a documented convention) would end that.
3. Story ops can only toggle classes: the fifteen carat CSS rules and the
   `voice-<slug>` class scheme exist because there is no `set_attr`/`data`
   op. One op would remove a stylesheet's worth of rules.
4. A frame cannot be moved after the fact (notes, B2): `say all set`'s
   reply lands in the ledger and the chip CSS shows "the ledger's last
   frame" to compensate. A `move` op (or letting `finish_board` run before
   the frame is created, a stage-0 `pre`) would make the chip honest.
5. `ingest` throws on a duplicate gist; worlds that may reopen a board need
   `ingest_if_absent`. `lookup` likewise conflates "nested copy" with
   "top-level passage".
6. Class-toggle ops on `has_class('notation')` reach into gist-stripped
   reprints (D5): stripping gists does not isolate a reprint. A
   `reprint` marker the queries respect, or scoping every display op to a
   board, is the engine-level answer.
7. The typeahead has no grouping by slot: 96–122 `map` rows at every
   mapping state. The parser supports `[verb, GAP, slot, GAP, 'to', GAP,
   slot]`; a grouped view is a UI feature the full game will need.

---

## 5. Tests

**Robust:** the walkthrough's expectations are built from the data
(`QUOTED`, `event_name`, `apply_text`), so a prose edit cannot silently
break them; traps are checked for enumerability, nudge, *and* a state
snapshot; candidate enumerability is asserted at five states; the L7 test
fails if L7 is deleted; the verbatim test checks every quoted string
against the .md; the board tests inspect the tree by gist, not by text.

**Brittle or weak:** (a) `expect` matches against the *whole transcript*
(`text(w)`), so an expectation is satisfied by any earlier printing — e.g.
`expect: ['thatch']` after `lay walls and a roof` is met by the story ¶
printed at `listen`; only some steps use `frame_text`. (b) One 350-step
`it` (49 s): the first failure hides everything after it, and `check`s
cannot be run in isolation. (c) Two vacuous assertions in
`test_fire_board.ts`: `assert.ok(!has(before!, 'voices-taught') || true)`
and `maps++; assert.ok(maps > 0)`. (d) `test_fire_board` replays the
walkthrough four times from scratch to reach four states.

**Untested, and it matters:** every defect in §1 is in untested territory —
erase and re-map on the board (D3), the set-aside/map/resume path (D1),
annotations on rows with duplicate roles (D2), the CSS (D4: nothing loads
`board.css`; the screenshot script is not part of `npm test` and needs a
global Playwright), the initial `collapse`/`expand` state and reprint
isolation (D5), the unmapped count after a later map (D6). Also untested:
`expand <sequence>` on a chip, `remember <role>` when nothing has been it,
`remember the Pillaging`, the forest's reopened `set aside`, the fifth
legal house mapping *in play*, `speak as` refusals in the house after l.
350, applying twice, and the board tree after `put down the chalk` on the
house (the chip's "last ledger frame" rule).

---

## 6. Verdict

This is a good, honest build: the data files are exactly the plain,
visible tables the owner asked for; the judge is 400 lines of pure
functions with the rules named and ordered; the types are drastically
simple; the engine is used, not fought; the tests are derived from the
data. It is not yet *pristine*. What stands between it and that word:

1. Four board-state bugs (D1–D4) that share one cause — display state that
   is *accumulated* by ops instead of *derived* from the mapping, and gists
   that are not unique where addressed. Recompute bands/annotations from
   the mapping, key by mapping id, and they go together (~1 day).
2. Redundant state (S1) and a stringly scene machine set in four places
   (S3/S4). Both are the kind of thing that turns a second story or a
   second voice into a hunt through `requires` closures.
3. The judge's parameter is `StorySpec` when it reads a `Sequence` (§3);
   that one narrowing is what makes "map your own afternoon" a data change.
4. Tests that pin the board's *state after change* (erase, resume, second
   set-aside), and expectations scoped to the frame.

Do those four and the 3,200 lines will be closer to 2,900, with fewer
fields, fewer flags and no per-story `if`s — and the extensions in §3
become additions of data with a handful of lines each.
