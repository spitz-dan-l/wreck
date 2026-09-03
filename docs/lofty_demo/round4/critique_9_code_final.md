# Critique 9 — round-4 code review of the Voice of Fire build (final)

Reviewed at `4a5d180`: `round3/critique_7_code.md`, `IMPLEMENTATION_NOTES.md`
(B4, B5a, B5b), all of `src/typescript/demo_worlds/fire/` (3,379 lines: 19
files, of which the seven `data/` files are 1,127 lines of literals),
`tests/test_fire_*.ts` (1,217 lines), `dist/board.css` (342), the engine diff
`a53b53a..HEAD` on `story/knowledge.ts`, `UI/components/input_prompt.tsx` and
`dist/global.css`, and README's Architecture section. `npm test`: 59 passing,
1 pending, 1 m 06 s. `npm run build:fire`: clean, and its `dist/fire.js` was
byte-identical to the committed one (later in the review a dev build,
`build-dev:fire`, appeared in the working tree at 08:45; it was not made by
this review and is left as found). Every claim marked *probed* was
reproduced by a scratch driver over the compiled build (`build/`, the same
modules the tests load); nothing was modified.

The bar is the owner's: drastically simple types, plain data, small surface
area, and one or two pristine implementations that extend into the full game.

---

## 1. Verification of the round-3 review

| # | Round-3 finding | Now | Acceptable? |
|---|---|---|---|
| D1 | Third mapping shares a pass; gists collide | Fixed. `Mapping.id` (the creating frame's index) keys badge/reference/rendition/annotation gists; the [C6] rule reopens the last pass instead of opening a third mapping. *Probed*: 363 non-frame gist nodes in the final tree, 0 duplicates. | Yes |
| D2 | Duplicate annotations per role | Fixed. `apply_ops` annotates per `role_entries` of each event group; the board test asserts `flame, blaze, ash` on the scattering. | Yes |
| D3 | Bands never removed | Fixed. `rows_ops` derives `mapped`/`band-n` from the mappings after every map/erase/apply/set-aside/resume; the erase test asserts no band. | Yes |
| D4 | Remainder underline persists | Fixed. CSS scoped to `.prose.cursor .piece.remainder`; `advance_cursor_ops` clears the class. | Yes |
| D5 | `expand the steps` not first; reprints toggled | Fixed. `collapsed: ['steps']` seeded; every display op goes through `in_right_columns()`; `sequence_passage` is never folded. Tested. | Yes |
| D6 | Stale unmapped count | Fixed. The bar is rebuilt with a derived count in `rows_ops`; test 9 → 8. | Yes |
| D7 | "The followers has" | Fixed differently: the wording no longer needs agreement ("No line here for the fire, my dear."). `Voice.plural`, added for D7, is now **dead data** (a type field and seven entries, read nowhere). | Yes; delete `plural` |
| D8 | `role_name('their home')` | Fixed (`/^[a-z]+$/`). Tested. | Yes |
| D9a–d | `with_ordinal` throws; L4 fallback; `participants` cross-mapping; `reopened` | All fixed: numeric fallback, `l1_nudge` + lint for `{step}`, `participants` reads its own pass, `reopened` replaced by a `violations` check. | Yes |
| S1 | Stop storing the derivable | Done: `frame_voices`, `remainder`, `said`, `ended`, `scene` gone; `phase()`, `remainder()`, `has_said()` derived. | Yes (see §3 for what still remains) |
| S2 | Id per mapping | Done. | Yes |
| S3 | Derive the scene | Done: `lesson` is one integer over `BEAT`, `phase(w, story)` is derived. | Yes |
| S4 | Ordered line lists | Done differently: one `SCRIPT` with a "first unsaid line" rule; `requires` closures remain on nine lines. | Yes |
| S5 | One grouping | Done: `group_by_event`. | Yes |
| S6 | Drop `reopened` | Done. | Yes |
| S7 | Names once | Done: `EVENT_NAMES` at load. | Yes |
| S8 | Dead code | Done for the listed items. New dead code has appeared (§3). | Mostly |
| S9 | Split `lint_story` | Done: `lint_events` / `lint_prose` / `lint_tables`. No function is over 60 lines now (longest code: `lint_tables` 53, `mapping_puffer.handle_command` 50, `remember_puffer.handle_command` 47). | Yes |
| S10 | Carat span | Declined with a stated reason (two extra ops per hole move). | Acceptable |

The engine diff is three things: `knowledge.ts` (new since the baseline, 136
lines, general, documented; `remove_gists` is the inverse of `graft` as
recommended), the `input_prompt.tsx` value comparison (the demo's one fix,
`4ef8b09`; the `.element`/`.child`/`ui()` lines in the same diff are the
earlier engine simplification `600994a`, not the demo's), and a font
fallback in `global.css`. All three are justified and minimal.

---

## 2. Defects (confirmed, ranked)

**D1. A board opened while a chip is expanded is built inside the chip.**
`chip_ops` (B5b D3) moves the hole into a reopened chip's ledger when no
board is open. New frames are created where the hole is
(`init_story_updates`), and `open_board_ops` inserts the new board after the
current frame. So, from the walkthrough's state after `expand the campfire
story`:

    listen
    say that it is a sad story
    pick up the chalk
    collapse the campfire story

*Probed*: the `listen` frame lands at path `[12,2,19]`, inside the campfire
ledger `[12,2]`; the house board is created at `[12,2,22]`, nested in the
campfire board; the hole is inside the house's left column (one hole — the
invariant holds). `collapse the campfire story` is still offered
(`s.id !== w.board`), and after it the campfire board carries `chip` with the
house board and the hole beneath it. `dist/board.css` then applies
`.board.chip .columns { display: none }` to *every* descendant `.columns`,
the house board's included: the ¶s, the frames and the prompt disappear from
the page while the world goes on accepting commands (`speak as the family`,
`pack` play headlessly). The transcript is also wrong in the text form: the
house story is told inside the campfire's ledger, and the chip's "last
ledger frame" rule now shows Katya's house story under the campfire chip
instead of l. 313–315.

Cause: "the hole is in a chip" is not a world fact, only the hole's
position, so nothing that later creates a frame or a board knows to leave
the chip first — and the frame already exists by the time any handler
runs, so no handler can. Fixes: (a) drop the hole move from `chip_ops` (one
argument) and bring the reopened board into view another way, or (b) make
"a chip is expanded while no board is open" a world fact (a finished story
absent from `collapsed` already is) and have every non-display command
collapse it first, which needs an engine hook before the frame is created.
(a) is the honest choice until the engine has a "move frame" op. The board
test checks `expand` then `collapse` only.

**D2. A classroom line without a `CLASSROOM_EVENTS` entry crashes the parser
on the next keystroke.** `classroom_events()` (`remember.tsx:108`) does
`CLASSROOM_EVENTS[f.command].name` for every classroom gist in the history,
and it runs inside `handle_command`. *Probed*: with the entry for `look at
the board` removed, the walkthrough's second command throws `TypeError:
Cannot read properties of undefined (reading 'name')` — every keystroke
after the line is said would. Unreachable with today's data (all nineteen
`SCRIPT` commands have entries), but it is exactly the path a fifth story's
lines take, and nothing lints it. Fix: put `name`/`feeling` on the `Line`
itself (the line is the data; the side table is a second copy keyed by the
command string), or one lint in the collision test.

**D3. Collapsing one expanded chip moves the hole away from another.**
*Probed*: with no board open, `expand the campfire story`, `expand the house
in the woods` (hole in the house ledger), then `collapse the campfire story`
moves the hole to the root although the house is still expanded
(`chip_ops` decides from `w.board === undefined` alone). Minor; same root as
D1.

Nothing else confirmed. *Probed and clean*: every exported data object
deep-frozen before play — the 221-command walkthrough and three full
enumerations run without a write (the only `push`/`sort` calls on data are
at module load, building `fuel_nudges` and `EVENT_NAMES`); exactly one hole
at all 221 worlds; `role_history`, `applied_mapping` and the `object`/`say`
typeaheads (which evaluate every `Line.locked`) at all 222 worlds without a
throw — the `!` in `readings()` are safe because an `applied` gist is set in
the same update that sets the mapping's status, and a stored mapping's
placements are always rows of its own pass.

---

## 3. Fresh review

**Stored vs derived.** `FireWorld` has ten fields. Of these, three are still
derivable from the history the frames puffer already labels:
`sequences[id].events` is the list of frames whose gist is `event(id, n)` —
the same walk `classroom_commands` does for `classroom` gists;
`taught: ['disembodied','abstract']` is "a `speak_as` gist of that kind
exists"; `voice` is the last `speak_as` gist since the board opened.
`cursor` is *not* derivable because `let it follow` frames carry no gist
(only a class). Keeping `sequences` is defensible for speed, but it means
the demo has two mechanisms for "which frames are this sequence's" — a
stored list for stories and a derived list for the classroom — and the
player's-own-history extension (§5) will want one.

**Duplicated logic.** Three history walks with the same loop
(`classroom_commands`, `voice_runs`, `readings`); the unmapped count twice
(`display.tsx: unmapped_count`, `rows_ops`) through two entry points; step
lookup three ways (`step_of`, `voice.steps[step - 1]` ×2,
`voice.steps.find` in `board.tsx`); story-by-id three ways (`data.story()`,
inline `STORIES.find` ×2, `board_story`); `sequence_of` and
`voice_of_mapping` are one function; capitalisation three times
(`capitalised`, judge `step_name`, `remember_role`); `has_line_here`
re-inlined at `transcription.tsx:147`; `new_mapping` beside a hand-built
literal in `do_set_aside`; `barcode_node` and `rows_ops.steps_on` computing
"steps on event"; `remember_event`'s role loop, which is
`role_entries(participants(...).filter(p => p.event === n))`.

**Dead code.** `Voice.plural`; `sequence_of`; `story()`; `pass_for`
(tests only); `Accepted.step/event/role` (world code reads `mapping`,
`derives`, `mark` only); the `voice-<slug>` class put on every event frame
(`transcription.tsx:46` — no CSS rule matches `.frame.voice-*`); the `held`
class (no rule; harmless as a name for "neither solid nor hollow").

**Per-story `if`s.** None in the puffers except the classroom `SCRIPT`,
which is data. The three closures beside it are the residue: `second_lit`
and `objection` (wise man), `both_tinders` (house). `both_tinders`
hard-codes `'the oil-soaked rag'` and `'the thatch'` — copies of two
`derives` strings in `house.ts`; if either is reworded the line locks for
ever with no test failing but the walkthrough's. It should read the data:
"every first-pass candidate of step 1 has been the tinder of an applied
house mapping". `REACHED` (`transcription.tsx`) and `LINE_TEXT` (`katya.ts`)
are two more side tables keyed by story id; a fifth story is three data
files plus two side-table entries plus its `SCRIPT` lines.

**Hard-coded eight.** `rows_ops` loops `for (let s = 1; s <= 8; s++)` to
emit `band-n`, and `StepIndex = 1 | … | 8` fixes the width of every voice at
the type level. The board code otherwise takes an `AbstractSequence`;
`rows_ops` should too (it needs the steps for nothing else). `StepIndex` as
a union of eight literals is the one type in the world that is cleverer than
its data: `number` plus the existing index lint says the same.

**Naming.** "Sequence" means five things: the judge's `Sequence` (a story
seen by the judge), `Mapping.sequence` (a story *id*), `AbstractSequence`
(a voice with steps), `SequenceState` (a transcription), `SubSequenceSpec`.
"Voice" means two: `Voice` (id, name, kind) and the judge's/board's
`voice: AbstractSequence`, hence `voice.voice.name` throughout. Two renames
would end most of it: `Mapping.sequence → story`, and the judge/board
parameter `voice: AbstractSequence → pattern` (Katya's own word, l. 162).
`consequences(w, story, m, undo)` is two functions behind a boolean.
`Notation { none?, absent?, folded? }` is a four-state enum spelled as three
optional flags; `notation: 'none' | 'absent' | 'folded' | 'shown'` is
plainer. `Line.beat: number | number[]` exists for one line.

**Functions over 60 lines.** None. `SCRIPT` (53) and the data literals are
data. Good.

**Gist uniqueness.** Holds where addressed (probed). Two observations:
`rendition_text(seq, id)` is not unique after a second apply of one mapping
(a node per apply frame) but is only ever addressed by pattern, which is
what `unapply_ops` wants; and `targets(seq, n)`/`spoken(seq, n)`/`step(seq,
n)` would collide for two voices on one board (unchanged from round 3;
see §5).

**The engine change.** `knowledge.ts` is clean and general. `has_revealed`
and `gist_descendants` are used only by narrascope — fine. `lookup` returns
a nested copy when no top-level passage exists and throws on ambiguity;
the demo never hits the nested case.

---

## 4. Simplifications (ranked, with sketches)

**S1. One history walk (~20 lines saved, three functions become one).**

    function frames_with(w: FireWorld, tag: string): { frame: number, params: {...} }[]
        // walk w.previous, collect h.gist where tag matches, oldest first, WeakMap-cached
    classroom_commands = frames_with(w, 'classroom').map(...)
    voice_runs(w, story) = frames_with(w, 'speak_as').filter(seq).map(f => f.frame)
    readings(w) = frames_with(w, 'applied').map(...)

Caching `readings` this way also stops `both_tinders`/`has_said_applied`
recomputing participants for every applied frame on every keystroke.

**S2. Derive `sequences[id].events` from the `event` gists (~15 lines, one
field and one invariant fewer).** `event_frame(w, id, n)` becomes a lookup
into `frames_with(w, 'event')`. `finished` stays (it is a lesson fact, set
by the close or the last pass); or better, `finished: string[]` on the
world, like `collapsed`. With S1's cache this is as fast as the array.

**S3. Put the classroom line's name and feeling on the `Line` (~10 lines
and one side table; fixes D2).** `Line.name`, `Line.feeling?`; the
`classroom` gist carries the name; `classroom_events` reads gists only. The
same for `LINE_TEXT` and `REACHED`: `StorySpec.line_text?: QuotedKey` and
`StorySpec.reached?: { [prose]: string[] }` — a fifth story then touches
`STORIES` and `SCRIPT` and nothing else.

**S4. `rows_ops` takes the voice; drop `StepIndex` (~5 lines, one type).**
`bands[`band-${s.index}`]` over `voice.steps`; `StepIndex = number`. The
`{ [s in StepIndex]?: … }` tables become `{ [step: number]: … }`.

**S5. Delete the dead and fold the doubles (~40 lines).** `plural`,
`sequence_of`, `story()`, `Accepted.step/event/role`, the frame `voice-*`
class; `voice_of_mapping` → `sequence_of`; one `step_of`; one
`capitalised`; `has_line_here` at its second site; `new_mapping` in
`do_set_aside`; `unmapped_count` → the display puffer calls `rows(...)`.

**S6. `both_tinders` from data (~3 lines, removes two string copies).**

    const tinders = HOUSE.candidates[LESSON_VOICE.voice.id]!.first![1]!.map(c => c.derives);
    const read = role_history(w, 'tinder').filter(r => r.where === HOUSE.title).map(r => r.what);
    return tinders.every(t => read.includes(t));

**S7. Two renames (0 lines).** `Mapping.sequence → story`;
`voice: AbstractSequence → pattern`.

**S8. `consequences(w, story, m, undo)` → `light_ops`/`unlight_ops`
returning updates (~0 net).** Both callers already sit inside `update()`.

Taken together, ~90 lines off 3,379 and two fewer fields; more importantly,
one mechanism for "which frames are this sequence's" and no side tables.

---

## 5. Extension readiness

**A fifth story.** Today: a `data/fifth.ts`; an entry in `STORIES`; four
`SCRIPT` lines (told / ready / pick up / put down) with their four
`CLASSROOM_EVENTS` entries (D2 if forgotten); optional `LINE_TEXT`/`REACHED`
entries; and the lints and the collision test do the rest. The [C6]
mapping rule, `map_after`, `set_aside_after` and `step_nudges` make a
two-solution story pure data. With S3 it is one file plus four lines.
**Ready.**

**A second voice (the Pillaging with a table).** The judge is generic and
`lint_story(story, PILLAGING)` already runs. The world reads
`Mapping.voice`/`voice_for(story)` rather than the constant; `LESSON_VOICE`
is named once. What remains: `voice_for` picks *the* voice with a table (one
per board), the right column is built for one voice, and `step/targets/
spoken(seq, n)` gists have no voice in them; `remember` offers only the
lesson voice's steps and roles; `rows_ops` counts to eight. A second voice
*on the same board* is a day: voice in those three gists, `steps_column`
per voice, `mappings_on(w, story, voice)`. A second voice *on its own board*
(a different story) is data plus the `remember` offering. **Half ready**,
and the half missing is mechanical.

**The player's own history as a sequence.** The judge takes a `Sequence`
(`id`, `title`, `events[{index, absorbs?}]`, `candidates`, `nudges`), so a
classroom sequence is `{ id: TODAYS_LESSON, events: classroom_commands(w)
.map(...), candidates: <authored>, nudges: [] }` — round 3's narrowing was
done. The block is the board: `board_node`/`prose_node` assume
`story.prose`, `event_frame` reads `sequences`, `EVENT_NAMES` is keyed by
story id. With S2 (frames from gists) the classroom's frames and a story's
are the same kind of thing and a board without prose is a `board_node`
whose left column is the transcript. **Judge ready, board not**; about two
days, none in the judge.

---

## 6. Tests

**Robust.** Expectations are scoped to the frame (`expect`) or the tree
(`expect_tree`) and built from the data; traps check enumerability, nudge
and a state snapshot; every quoted line is checked against the .md; the
board tests read the tree by gist; the walkthrough is played once and
cached per world (`story_of`, `commands`); the L5 and L7 tests fail if the
rule is deleted; the fifth house mapping, both wise-man directions, erase
and re-map, reprint isolation, and the count after a later map are all
pinned — the round-3 gaps are closed.

**Still brittle.** `world_after(cmd, nth)` addresses states by the n-th
occurrence of a command (`'apply the Voice of Fire', 5`; `'let it
follow', 4`): inserting a step earlier silently re-targets every later
board test; a `label` on the `Step` and `world_at(label)` is ten lines.
Nothing loads `board.css`, so D1's disappearance is invisible to the suite.
Untested: D1's sequence; two chips expanded; every `Line` having a
`CLASSROOM_EVENTS` name (D2); `remember <event>` on the wise man with both
solutions held.

**Time.** *Probed*: the whole 221-command walkthrough plays in 7.3 s. The
rest of the fire suite's ~46 s is command enumeration: `traverse_thread`
costs 24 ms at the campfire and 2.7 s at any wise-man state (241 commands,
the parser re-run per prefix); 48 walkthrough steps enumerate (every trap
does `commands(before)`), and beat 5's 22 s is about eight wise-man
enumerations. The cheap win: nearly every use is `commands(w).includes(x)`.
A single non-submitting parse decides that (*probed*: `apply_command(spec,
w, raw(cmd, false)).parsing.view.submittable` agrees with the enumeration
on all 241 commands at the wise-man state, and rejects the non-commands) and
costs ~120 ms there. So:

    function accepts(w: FireWorld, cmd: string): boolean {
        return apply_command(fire_world_spec, w, raw(cmd, false)).parsing.view.submittable;
    }

and `commands(w).includes(x)` → `accepts(w, x)` everywhere but the three
early `deepEqual`s on the whole list (which are cheap states). Beat 5 goes
from ~22 s to ~4 s and the suite from 66 s to roughly 25 s; the
`candidates_enumerable` checks (twenty `accepts` each) are the residue.
About fifteen lines in the test helper, no world change. The 120 ms parse
itself is engine cost (241 threads per parse), not the world's.

---

## 7. `board.css`

342 lines; every selector is matched by a class the code emits or the engine
renders (`.story`, `.frame`, `.input-text`, `.output-text`, `.parsed-text`,
`.typeahead .option.locked .token.lock` all checked). Dead or redundant:
`.prose.cursor .piece.remainder { --alpha-color: 1 }` (line 95) repeats
line 88–92; `.prose.done { --alpha-color: 0.55 }` restates the `.prose`
base and is a no-op; the fifteen carat rules remain by decision (S10). The
`held` badge state and the `voice-*` frame classes are emitted without
rules (the first is fine, the second is dead emission). Two lines to delete.

---

## 8. The paragraph for the top of `demo_worlds/fire/index.ts`

> *How this world is built.* Everything the lesson can say is data under
> `data/`: the voices, the two abstract sequences with their steps, roles
> and nudges, the four stories with their prose, events and candidate tables,
> and Katya's lines verbatim. The world state (`world.ts`) is a handful of
> plain fields — the lesson's beat, the open board and its cursor, the
> transcribed sequences, the mappings, the knowledge tree — and everything
> else is derived, mostly from the gists that label the frames of the
> history: which lines have been said, which voice speaks, what the roles
> have been. Six puffers each own one verb family: the classroom script,
> transcription at the board, mapping, remembering, expand/collapse, and the
> frame labelling they all rely on. The judge (`judge.ts`) is pure functions
> over a `Sequence` and a `Mapping`, ranking the rules L1–L7 and choosing the
> nudge. The board (`board.tsx`) is story nodes addressed by gist and story
> ops on them, so the page and the tests see the same tree. Adding a story is
> a data file and its lines in the script; adding a voice is a data file and
> a candidate table; nothing in the puffers names a story.

That last sentence is nearly true (§3: three closures and two side tables).

---

## 9. The three smallest changes that would most improve the code

1. **`accepts(w, cmd)` in the test helpers** (~15 lines): the suite drops
   from 66 s to ~25 s, which changes how often it is run.
2. **Revert the hole move in `chip_ops`** (one argument) until the engine
   can move a frame: fixes D1 and D3 at the cost of the reopened board not
   scrolling into view — or, if the UI ruling must stand, auto-collapse
   expanded chips in `open_board`/`told`, which needs the engine hook.
3. **Names and feelings onto `Line`, `line_text`/`reached` onto `StorySpec`**
   (~25 lines moved, three tables gone): fixes D2 and makes the fifth story
   one file plus four script lines.

If a fourth is allowed: S1's `frames_with`, which is also the door to the
own-history extension.

---

## 10. Verdict on "pristine"

The round-3 verdict was "good, honest, not yet pristine", and the four
things it asked for were done: display state is derived from the mapping,
gists are unique where addressed, the scene machine is one integer and one
derived phase, the judge reads a `Sequence`. The types are drastically
simple (one union of eight literals is the only one that overreaches); the
data files are exactly the visible tables the owner asked for; no function
is over 60 lines; the world is never mutated; the invariants hold under a
221-command probe; the tests are derived from the data and pin the states
that were wrong last round.

What keeps it short of the word is small and specific: one real defect
(D1) from the newest UI ruling, whose root is that "the hole is in a chip"
is not a fact the world knows; one latent trap (D2) the fifth story will
walk into; two mechanisms for "which frames belong to this sequence"
(`sequences[].events` beside the gist walks); three side tables and three
closures that are the last non-data per-story knowledge; and ~40 lines of
dead or doubled code left behind by the fixes. None of it is structural.
The judge and the data are pristine now; `world.ts` and `board.tsx` are one
short pass (S1–S5, ~90 lines out) from it; the classroom puffer is a script
table with three closures it should not need. Do §9's three changes and
S1/S2, and this is the implementation to extend the full game from.
