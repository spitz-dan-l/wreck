# Critique 2 — the player and the builder

*Critic 2 attacks the three round-1 proposals as a player (what do I type, is there a decision, does the ending land) and as the implementer who would have to build them on the engine under `src/typescript/`. Fidelity to the document is not my job; playability, discoverability, feasibility, extensibility and risk are. Line numbers cite `dist/posts/puzzle_lofty.md`.*

## 0. What the engine actually gives you (facts all three proposals lean on, some wrongly)

I read the engine and played the demo (`node scripts/play.js "consider Sam" "remember something meditative" "reflect on my impression of sam" ...`). Six facts govern feasibility:

1. **Every valid command is enumerable, and the typeahead shows all of them.** `traverse_thread` walks the whole grammar; the typeahead grid is the set of partial parses. Nothing is hidden. Every puzzle in every proposal is therefore solvable by arrowing through options. That is by design (the heresies essay), so the question for each proposal is not "can it be brute-forced" but "is the wrong option tempting, and does choosing it say something".
2. **The parser re-runs the entire thread from scratch once per leaf branch** (`Parser.run_thread` restarts on every `split`). Cost is linear in the number of distinct commands. Narrascope peaks at ~15 threads and a command costs 0–17 ms. A mapping grammar with 8 steps × 15 events + 7 roles × 20 participants is ~250 threads. Probably fine (the handlers are trivial), but it is 15× anything the engine has run, and every keystroke pays it.
3. **`Parser.run_thread` throws `Ambiguous parse` if two threads accept the same text.** All three proposals name events by nominalising commands ("the laying of the tinder"). The Voice of Fire's step 1 is *also* "the laying of the tinder" (l. 166). Any grammar that puts step names and event names in the same slot will throw the first time an author names a campfire event `lay the tinder`.
4. **The story tree must mirror the DOM one-to-one.** Story updates are applied to the DOM by *path from the story root* (`dom_lookup_path` in `update.tsx`); `History` renders `story_to_dom(story)` once and then mutates. A second rendering of the same frames (a "board" that is a projection of history) cannot be animated by the existing machinery; only a board that *is* a subtree of the story tree can.
5. **`would()` effects are dead.** `dsl.tsx` produces `PushWouldUpdate`s and `animation.ts` computes them, but the code that renders them in `history.tsx` (lines 53–89) is commented out. Any proposal that says "hover glow via `would()`" is reviving an abandoned feature.
6. **The prompt lives inside the story hole**, and `reflect.tsx` already moves the hole inside a frame (giving nested frames; `dist/history.css` styles `.story .frame .frame`). A pinned prompt outside the story is a real change to `app.tsx`, `animation.ts::scroll_down` and the hole logic.

One more play observation: the current demo's reflection loop is clunky (you get "you might remember something focused" *inside* a reflection where `remember` is locked, so you must `end reflection`, `remember`, and re-reflect; the indirect `reflect on` silently executed three commands for me). Whatever we build must not repeat that: a lock must never hide the command the prompt just told you about.

---

## 1. Design A — mechanics first

### Player pass

**Beat 0.** `read the board`, `read the standard notation`, `reread the sparking of the tinder`. Three clicks. No decision, but it proves steps are objects in under a minute. Fine.

**Beat 1, campfire transcription.** The prompt is in the friends' voice and the typeahead offers "the commands that voice can issue for this line". For the campfire the doc's own transcription is one command per line except `light a match` / `touch the flame` (l. 280–288). If the typeahead offers one or two options per line, this is twelve clicks of "pick the obvious thing". A concedes as much ("assemble a sequence by enacting it"), but that is transcription, not play. ~3 minutes.

**Beat 1, mapping.** Fifteen commands: seven role bindings plus eight step placements. In the campfire the nouns are literally *tinder*, *kindling*, *firewood*, so bindings are `the tinder is the tinder` and typeahead "pre-sorts matching nouns". The incremental green/amber/red board means the honest play pattern is: pick, look at the colour, pick again. That is brute force with feedback. Does it matter? Here, no; the doc says this one is trivial (l. 246). But A has to bind *ember, flame, blaze, ash* too (the roles table in §3 has seven; `introduces:'ember'`), and I cannot tell from the text what the ember is bound to in the campfire ("the fire"? "the tinder"?). If the roles the player never sees in the prose must be bound, the campfire mapping becomes fifteen commands of guesswork. Cut those four roles from the binding step or derive them.

The one deliberately wrong placement in the sample (`the ash left behind is the second singing` → "The singing is not ash. What is left behind, afterward, when no one is tending?") is the best-written nudge in any proposal: it rejects, and it says *why in the voice's own terms*. That is what nudges should be.

**Beat 2, house.** `speak as the children` is offered in typeahead next to `wait`, and `wait` produces "Whose hands hold the stick?" — a tempting wrong option with a nudge. Good. The mapping's real decision is rag vs thatch, and both are legal. Then Katya says "Now change your mind about the tinder" and the player types `reconsider the tinder`. **This is not a change of mind; it is a dictated toggle.** The player has no reason of their own to reconsider, and the payoff ("the Fire's summary is just as sad") is a sentence they read, not something they notice. It teaches the verb, which is worth something, but A sells it as the doc's "gentle introduction" (l. 140) and it is not.

**Beat 3, forest.** Four voice switches (`the seed`, `the weather`, `the lightning`, `the fire`) with typeahead listing "only voices the current line admits". If a line admits one voice this is a click; if two, the choice is cosmetic because L5 says mapping ignores voice. So the forest is twelve lines of transcription whose only lesson is delivered by Katya's closing line. **This is the single most boring stretch in A**: the longest story to transcribe, the fewest decisions, and a mapping that is indifferent to everything you just did.

**Beat 4–5, wise man.** `select from the building of the pyre to the reduction to ash` is the one command the player must *discover* rather than transcribe, and since it is in the typeahead, they will. Mapping eight steps onto two events under L2 is quick. `set aside the literal solution` → build the figurative one. Both bands on the board, one dimmed — this is the doc's "in turn" done as visible state, and it is the right shape. The four objections are all offered as commands; the player clicks through them; "say ok, I guess". The ending lands because the board shows both solutions and `consider the ash` lists five ashes. **Best moment in A**: `consider the ash` → "a pile of black ash; a field of ash; the forest; a man's body; a distorted doctrine." That is the accumulating disposition change (l. 134) as a game object, and no other proposal has it.

The coda (map the Voice of Fire onto today's lesson) is clever and I would still cut it: "ash = you don't really see it" is the author winking, and the demo should end on the mutter.

**Playtime:** 45–70 minutes, of which perhaps 25 are transcription and role binding.

### Builder pass

**Reuse unchanged:** `world.tsx`, `puffer.ts`, `lock.ts`, `parser/`, `gist/`, `story/` (including `knowledge.ts` — `graft` is exactly the retroactive annotation A needs). Correct as claimed.

**Extend:** `history.tsx` — but not the way A says. "Frames render into columns keyed by `Event.seq`" is a second arrangement of the same story nodes, which fact 4 forbids. The board must be a subtree of the story tree (a persistent `.board` node beside the frames), with rows as story nodes carrying gists so `S.has_gist(...)` updates and animates them. A does not notice this; it is a day's redesign, not a blocker.

**New:** the judge (L1–L4, ~150 lines), the transcription puffer (~250), the mapping puffer and grammar (~300), the board renderer (~400), voices/roles/steps data (~200), four stories as events with command gists, consequences and participants (~900), nudges and Katya (~500). Roughly 3,000–3,500 lines. A's estimate is honest.

**Riskiest piece: the participant data, not the code.** L4 says a role may bind to a participant of the event a step lands on. "Participants" is authored per event. Two implementers would author it differently and get different games — and the rule is under-constrained in both directions:

- *Counterexample 1 (silly mapping accepted).* Campfire event 2, `gather tinder, kindling and firewood`, has participants {tinder, kindling, firewood}. Steps 1–3 have `after: []`. So `the laying of the tinder is the gathering` satisfies L2, L3 and L4, and the board goes green. The laying is not the gathering, and no nudge fires.
- *Counterexample 2 (silly mapping accepted).* Wise man event `light the pyre`: its consequence literally says "from tinder to kindling to wood … reduced to ash". If its participants include those words (and for the literal solution they must, or steps 5–8 cannot land there), then **all eight steps mapped onto `light the pyre`** pass L2 (many-to-one is legal), L3 (all indices equal, ≤ holds) and L4. That is the "all eight steps to one line" degenerate solution, and A's rules accept it.
- *All eight to `sing`* is correctly rejected by L4 (no role is a participant of singing). So the rules reject the obviously silly and accept the subtly silly.
- *The figurative solution is admitted only by the stand-in table*, i.e., every figurative binding is hand-authored. That is honest (l. 537, "manual fudge factors") but it means the general rule contributes nothing to the puzzle the demo exists for. Fine, if stated plainly.

The fix is one more rule: **L6, no two of steps 1–3 (or 4–8) may share an event unless the event is author-flagged `compound`** (`touch the flame`, `construct the pyre`, `light the pyre`, the two wise-man book lines). Ten lines, and both counterexamples die.

Second risk: `supervenience.ts` as a test oracle. A wants `search_future` to verify both wise-man solutions are reachable from every state. BFS over a mapping grammar with ~250 branching commands and no declared narrative dimensions is the exact explosion `supervenience_spec.ts` warns about ("including [tried commands] makes the number of distinct states exponential"). Use `traverse_thread` at scripted states instead; do not put future search near the board.

Third: the `Ambiguous parse` throw (fact 3). A's disambiguation rule covers same-sequence collisions but not step-name vs event-name collisions. Needs a test.

A single implementer can build A in a few thousand lines. Yes.

### Extensibility

The strongest of the three. Voices are a type (`AbstractSequence`), the Pillaging exists as data and fails legally, roles become knowledge topics, and the player's own frames are already `Event`s in the same store. "Which voice fits" is running the judge across voices — already there. Non-classroom settings: the *transcription flow* (prose line → command) is classroom-bound, but the event store and judge are not. What would be thrown away: the stand-in table does not scale (one row per role per story per pass), but the document says that is expected.

---

## 2. Design B — the board is the interface

### Player pass

**Beats 0–1.** `listen`, `listen`, `remember the picking up of the chalk` → "It felt: — chalky." Three clicks that teach expand/collapse and event naming before they are needed. Sound pedagogy; the tone ("chalky") is a hair too cute and I would let Katya be dry instead.

**Beat 3, conversion.** This is where B is better than A: conversion is a real three-way decision per row — *where the imperatives fall* (`light a match` then `touch the flame`), *who speaks* (family imperatives are `Locked` with the glyph and a nudge when the children act), *command vs consequence* (`follows`). "The fire starts, spreading…" is the trap: `spread to the kindling` is offered but Locked ("The friends do not command the fire"), and `follows` is right. Because the Locked glyph is visible, the player will pick the unlocked option — but choosing *between* `light a match` and `follows` for the match line is a genuine reading of the prose. Two to four options per row, ~12 rows: ~4 minutes and I was thinking the whole time. Good.

**Beat 4, mapping.** `draw a vertical line`, then eight `draw from <step> to <event or tagged phrase>`. Here B has a hole I could not play through: **there are no mapping rules.** §2b says one-to-many and many-to-one are both legal; §6 says rag *or* thatch are "both accepted" with different Katya replies; nothing says what is *rejected*. Either everything is accepted (no puzzle; "not quite one-to-one" becomes "anything") or the implementer writes a per-story whitelist of acceptable targets per step (a puzzle with exactly the degrees of freedom the author remembered to list). Two implementers would build two different games. `draw from the burning to the second singing` — what happens? B does not say. This is the flag for B.

The sub-event targets (gist-tagged phrases inside a consequence, needed so steps 4–8 can land inside "The pyre is lit…", l. 461) are a nice idea and the engine supports them (facets are exactly this). But B's typeahead rule — "tagged phrases of the event under the cursor" — refers to a cursor that only exists during conversion. During mapping there is no cursor, so either every tagged phrase in the story is offered (very long lists) or the player has to learn a focus command B never names.

**Beat 5, house.** The burning lines (l. 336–342) are forced to `follows` because "no voice has been taught yet", and Katya says "we will need better voices for that". As a player this is the *most* interesting design choice in B — a deliberate debt paid in the forest — and also a small cheat: the doc's own house transcript exists only up to `dig a hole` (l. 352–381), so nothing forbids `the fire` here, and A and C both let the player speak as the fire in the house. I would keep B's version; it is the only place a proposal turns the forest story into a *need*.

**Beat 6–7.** Forest: five disembodied voices (`the seed`, `the weather`, `the tree`, `the forest`, `the fire`), dashed brackets, italic carats. Lovely to look at, but as in A there is nothing to decide. Wise man: fifteen rows, seven voices ("the boy/the man", "the followers", "the closest followers", "the multitudes", "the central followers", "the books", "time"). **Most boring stretch in B:** those fifteen conversion rows before the literal mapping, each one "pick the unlocked verb". Then the punchline: `collapse the unmapped` folds thirteen rows into one bar — **B's best moment**, the visual version of "an awful lot of extra story" (l. 451). The second column, the literal/figurative *apply* toggle, and the objections as commands are all right. The ending ("solution II flickers — But you don't really see it", then four barcode chips) lands.

**Does change of mind happen?** `erase the line` exists but nothing ever makes me use it; the required change of mind is the apply toggle, which is the doc's one (l. 465). Same as A minus A's dictated toggle. Fine.

**Playtime:** 50–70 minutes.

### Builder pass

B claims "fresh UI layer on the existing engine core, ~900–1,200 UI lines". I count more, and two of B's load-bearing claims are wrong about this engine:

1. **"The board is a projection of the history; rows are frames."** Fact 4: story updates hit the DOM by path from the story root. Frames cannot be rendered twice (ledger in the transcript *and* row on the board) and still be animated. B has to choose: either the ledger line *is* the frame (moved into a board subtree, styled two ways), or the board is a dumb re-render from `world.mappings` on every command with no animation. Either is buildable; neither is what B describes, and the cost lands on B's own selling point (animated chalk).
2. **Hover glow "is the engine's `would()` mechanism".** Fact 5: it is dead code. Reviving reversible would-effects is a design problem the author abandoned, not a small change. Cut it; colour the typeahead option with label classes (which *do* work — `get_option_token_class` in `typeahead.tsx`) and skip the glow.

Then the genuinely new work: **SVG lines** anchored by `getBoundingClientRect`, recomputed after every animation stage (the `animate()` max-height transition runs 700 ms per stage), on collapse, and on resize. ~150–250 lines plus a `ResizeObserver`/rAF loop. Nobody has drawn a line in this engine. Doable, fiddly, and the first thing that will look wrong in a demo video. **This is B's riskiest piece.** The **pinned prompt** outside the hole touches `app.tsx`, `scroll_down`, and the hole-moving logic in the reflect pattern — moderate. The **voice carat** is trivial (`Carat` is a hard-coded `> `). **Typeahead chips** are small. **Ledger nesting** via moving the hole into a parent frame is exactly the `reflect.tsx` trick and the CSS exists — B is right about that one. The **mapping judge** is absent and must be written (~150 lines + data). The narrow layout is extra CSS I would drop.

Revised estimate: UI 1,500–2,000, world/content 2,000–2,500 → 4,000–4,500. A single implementer can build it, but it is the largest and the one most likely to ship with a broken-looking board.

### Extensibility

Board sessions tagged on frames generalise: the player's own frames are already frames, so a "board of today's lesson" is a filter. The `prose: Record<BoardId, ProseLine[]>` + cursor model is classroom-only; non-classroom rows need another source. A whitelist judge does not extend to "which voice fits". Thrown away later: the prose/cursor model, the whitelist; kept: board-as-filter, ledger, bands.

---

## 3. Design C — the lesson is a seduction

### Player pass

**Beat 1.** `convert the story` fills the whole left column in one command; then eight `map` commands with nudges 1–2 waiting. The campfire is over in four minutes and it was the *mapping*, not transcription, that I did. **This is the best pacing of the three.** C is honest that story 1 is on rails and spends the player's attention where the doc puts it ("Trivially so", l. 246).

**Beat 2, house.** Conversion halts at the children; `light the rag` as the family gets nudge 3, a tempting wrong option with a reply that teaches. `speak as the children`; then the burning lines can hang off `scatter` *or* return to the family (`> sleep` / "The roof above you is ablaze") — a real decision with two authored consequences that colour the exchange. The `[You]` band appears on my own frames, silently. Mapping: rag/thatch real; nudge 4 waits. `apply the mapping` is required and recolours the story ("the home" → "the fuel"). Then the exchange, player-issued. This beat is the strongest single beat in any proposal.

**Beat 3, forest.** Empty prompt; you must `speak as` something. The typeahead lists `the forest`, `the tree`, `the weather`, `the fire` — and `the Voice of Fire`, which is the tempting wrong option with the best nudge in the document set ("Not yet, my dear. The Voice of Fire is what we are looking for, not what we are writing"). That is how you make a decision under transparent discoverability: put the wrong answer in the list and make choosing it mean something. Mapping is "loose"; no exchange; silence. Good.

**Beat 4, wise man.** "Conversion with several voice switches, unassisted" — fifteen lines; C never says how many options per line, so I assume B-style menus. **Most boring stretch in C**, same as B. Literal mapping with nudge 6 ("Wood, my dear"), `apply`, "you notice that you are relieved". Then the second-solution transcript: eight `map`s along a fixed spine (one freedom: `the man dies` vs `mythologized`, accepted-and-remembered), four objections as commands (all offered; I clicked through them, but each has its own reply, so clicking through is reading), and then:

```
> say that you see it            (dimmed; you cannot say it)
> say "Ok, I guess"
```

**Best moment in all three proposals.** The engine renders it for free (`Locked` availability shows the lock glyph; `Used` merely dims and is still enterable, so implement it as Locked). The ending lands harder than A's or B's because the last decision is one I am shown I cannot make.

**Beat 5.** `write it down`. One command, one paragraph. Fine.

**Does change of mind happen?** `unmap` leaves a strike-through residue — "you cannot un-see" — which is the only proposal where changing your mind *costs* something visible. But nothing requires it except the set-aside before the second solution. As in A and B, the required reinterpretation is the doc's one.

**Brute force.** Here C has the same hole as B, worse: "map <step> to <line>… Consistent sets are accepted" with no definition of consistent. Nudges are `when(story, mapping, pass)` closures — a per-story, per-pass list. Nudge 7 rejects the literal ash in the figurative pass; nothing rejects `map the burning to "sing"` in story 1, or all eight steps to `travel`. Unless a default rule exists, the figurative solution "locks" after any eight maps. **Flag: two implementers would build different games**, one accepting everything not explicitly nudged, one hardcoding l. 471.

**Playtime:** 35–50 minutes, shortest of the three.

### Builder pass

C reuses the parts of the engine that are actually cheap: retroactive frame edits (`S.map_worlds(world, (w, frame) => frame.css(...))` is one line, exactly what `reflect.tsx` does to unfocus), `replace_children` for recolouring, css ops for strike-through residue, `Locked` for the unsayable line, the `notes`/acquired-action pattern for voices in the notebook, `interpretation_effects` group staging so retroactive changes animate before present text. All ~10–30 lines each. The board is "one new UI component"; C's ASCII draws the lines as text (`----+--> line 9`), so no SVG. C's board has the same fact-4 constraint as the others but C's left column is *naturally* a story subtree (converted lines are nodes), so it fits.

The cost is prose. `Line.options[]` gives every story line two to four (voice, command, consequence) triples — ~55 lines × ~3 options, each needing a consequence or nudge, plus both-voice consequences for the house's four burning lines, plus five "apply" texts, plus split Katya replies. Call it 1,500 lines of authored data on top of ~1,500 of code. 3,000–3,500 total. The riskiest piece is not technical; it is that **the judge does not exist** and the nudge closures are not a judge.

A single implementer can build C. Yes, and fastest.

### Extensibility

Weakest. `Story.lines[].options` and `conversion: Voice[]` are prose-bound; there is no representation under which the player's own history could be "converted" (it is already notation, and C has no mapping mechanism for frames, only for `Line`s). Nudge closures do not generalise to a second voice. The good hooks are small: voices as acquired inner actions in `notes`; the `[You]` band. Thrown away later: `Line`, `Story`, `Nudge.when`, and most of the authored branches.

---

## 4. Comparison

Scores 1–5. *Risk* is scored so that 5 = lowest risk.

| | A (mechanics) | B (UI) | C (narrative) |
|---|---|---|---|
| **Playability** — decisions per minute, pacing, ending | 3 — real consequences (`consider the ash`, Fire speaks), but 25 min of transcription and role binding; dictated `reconsider` | 3 — conversion is a real puzzle; mapping has no rules; wise-man conversion is a slog; `collapse the unmapped` and chips are strong | 4 — best pacing (campfire in one command), tempting wrong options with the best nudges, the unsayable line; wise-man conversion still a slog |
| **Discoverability** — do I know what to type | 4 — typeahead in voice, `wait`/`speak as` pairing; `select` must be noticed | 5 — clicking is typing, chips, Locked glyphs, voice carat | 4 — same typeahead; the empty forest prompt is the one place the player could stall (deliberately) |
| **Feasibility** on this engine | 4 — mostly data; board-as-subtree redesign needed; supervenience test plan infeasible | 2 — board-as-projection and `would()` glow contradict the engine; SVG lines and pinned prompt are new territory; no judge | 4 — cheapest code, most prose; no judge |
| **Extensibility** | 5 — voices are a type, roles are topics, frames are events, Pillaging fails legally | 3 — board-as-filter generalises; prose/cursor and whitelist do not | 2 — `Line`/`Story`/closures are throwaway; `notes` hook is good |
| **Risk** (5 = low) | 3 — L4 accepts subtly silly mappings; ambiguous-parse collisions; 250-thread grammar unmeasured | 2 — lines, hover, layout, and an undefined judge, all at once | 3 — undefined judge; authoring volume; nothing technical |
| Playtime | 45–70 min | 50–70 min | 35–50 min |
| Most boring stretch | forest transcription | wise-man conversion | wise-man conversion |
| Best moment | `consider the ash` / Fire re-speaks the story | `collapse the unmapped` | the dimmed `say that you see it` |

Only A has a mapping rule that can be tested; it is wrong in two places and fixable in one. B and C have no rule, which is the single most important thing round 2 must settle: **without a general judge there is no puzzle, only a whitelist with a costume.**

---

## 5. Recommended synthesis

Build on **A's data model and judge**, with **C's pacing, nudges and ending**, and **B's conversion decisions and board grammar**, on a board that lives *inside the story tree*.

1. **Skeleton: A's `Event` / `Sequence` / `AbstractSequence` / `Mapping` with rules L1–L5.** It is the only proposal with a judge, and the only one whose "player's own transcript is already mappable" is true in the data rather than in a paragraph.
2. **Add L6 to close A's counterexamples:** no two steps may share an event unless the event is author-flagged `compound` (campfire `touch the flame`; wise man `construct the pyre`, `light the pyre`, and the two book lines). This rejects "the laying is the gathering" and "all eight steps on `light the pyre`" while keeping every mapping the document actually draws.
3. **Replace A's free-form `participants` with an explicit per-story role-candidate table** (`role → [participant, pass?]`). Same data, but the fudge factor is *visibly* data, the figurative solution is a row with `pass: 'figurative'`, and two implementers get the same game. Drop the ember/flame/blaze/ash bindings from what the player must type; derive them from the step placement.
4. **Pace like C:** the campfire is `convert the story` (one command) followed by mapping. Conversion decisions (segmentation, voice, `follows`) start with the house, where the document itself starts them (l. 348).
5. **Conversion like B from the house on:** two to four imperatives per row, `follows` for consequence-only lines, wrong-voice imperatives shown `Locked` with a nudge. Keep B's "burning lines have no voice yet" in the house so the forest is a need, not another example.
6. **Every decision point gets a tempting wrong option with an authored nudge** (C's nudges 1–8, A's "The singing is not ash"). Transparent discoverability means the puzzle lives in the *meaning* of choosing wrong, so write the nudges before the correct paths.
7. **Objections are commands** (all three agree); split Katya's replies across them as C does, but keep the document's closing sentence intact.
8. **The unsayable line:** `say that you see it` offered as `Locked`, then `say "Ok, I guess"`. Ten lines of code. Never cut.
9. **Apply has two visible consequences:** the Fire re-speaks the mapped story in the right column (A), and the left column is recoloured in the fire's terms with a strike-through residue if unmapped (C). Both are `replace_children`/css ops on gist-tagged nodes.
10. **`consider <role>` accumulation** (A): the tinder, the ash, etc. as knowledge topics that list everything they have been. ~60 lines, and the only mechanic that makes l. 134 a game object.
11. **Two solutions:** A's `set aside` / `resume` with both bands on one board, the inactive one dimmed (B's 30 %). Skip the second physical column unless the first board is finished early.
12. **Drop A's dictated `reconsider the tinder` in the house.** Keep the rag/thatch choice with differing Katya replies (B/C); keep `reconsider` available and have Katya mention it once. The required change of mind is the wise man's set-aside — the document's own.
13. **Board = a persistent subtree of the story tree** (`.board` beside the frames), rows as gist-bearing story nodes, two columns by CSS grid. This is the only way the existing staged/animated updates drive the board (fact 4). Do not write a second renderer of the same frames.
14. **No SVG lines in the first build.** The mapping is numbered colour badges on the left rows and matching bands on the right steps (A's ①, B's bands). Add Bézier lines as polish once everything else runs; they are the piece most likely to be wrong on a first try, and the document expected that (l. 154).
15. **Do not revive `would()` hover.** Colour typeahead options with label classes instead.
16. **Keep the prompt in the story hole; move the hole into the board's left column during transcription** (the `reflect.tsx` trick). That yields B's nested ledger for free and avoids the pinned-prompt refactor.
17. **Voice switching:** `speak as <voice>` as a command, a coloured voice bar in the column, a voice-aware carat (trivial change to `Carat`). Where the document admits more than one voice (house burning lines, forest), admit both and author both consequences; include C's `the Voice of Fire` trap in the forest. Mapping remains voice-indifferent (A's L5).
18. **Keep the Pillaging as data and one failing mapping** (A §9) *only if* the judge is general (points 1–3); it is the ten-line proof that the judge is not a whitelist. Cut the green-room content; keep one `remember the picking up of the chalk` to teach event naming on the player's own action (B).
19. **Engine guards before content:** (a) a test that no step name collides with any event nominalisation (fact 3); (b) measure keystroke parse time with the wise-man mapping grammar and, if it exceeds ~30 ms, put a verb prefix (`map`, `bind`) first so threads die at token one; (c) test reachability of both wise-man solutions with `traverse_thread` at scripted states, not `search_future`.
20. **Cut first if short:** A's coda mapping the lesson itself; B's barcode chips and narrow layout; C's family-voice branch for the house's last lines; the second physical column. **Never cut:** the judge with nudges, many-to-one with unmapped events, `speak as`, set-aside with both bands visible, the Fire speaking on apply, `consider <role>`, the unsayable line, "But you don't really see it."
