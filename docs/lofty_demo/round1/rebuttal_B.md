# Rebuttal B — round 1

Bare line numbers are `puzzle_lofty.md`; engine citations are `path:line` under `src/typescript/`.

## 1. Objections against B

**C1-1 / C2 "mapping has no rules and no nudges; a whitelist with a costume."** CONCEDE, fully. B mistook 540 for a conversion promise. Change: every `draw` is judged by A's L1–L4 plus C2's L6 (no two of 1–3, or of 4–8, share an event unless it is author-flagged `compound`), with the partial order on 1–3 (D8). A refused `draw` produces a Katya nudge frame in the board ledger and no mark; C's nudges 1–8 and A's "The singing is not ash" are the authored text. The per-story stand-in table becomes C2's explicit role-candidate table with a `pass` column. `draw from the burning to the second singing` → L4 fails, "The singing is not ash. What is left behind, afterward, when no one is tending?" I keep B's *conversion* nudges (Locked imperatives with a message) as an addition; they are not a substitute.

**C1-2 "almost no consequences; no apply."** CONCEDE. `apply the mapping` is explicit from the house on and gates Katya's next story (132, D11); the campfire auto-applies on `all set`. Three visible consequences, all story ops on gist-tagged nodes: (i) A's Fire re-speaks the mapped story under each step in the right column (`S.has_gist(step n).add(<div class="spoken">› lay the rag …</div>)`); (ii) C's recolouring of the left column (`replace_children` on tagged spans: "your new home" → "the fuel"); (iii) A's `consider <role>` topics accumulating via `knowledge.ts:103 graft`. C's nudge 7 makes a prior applied mapping constrain the later one (134).

**C1-3 (344–346), C1-4 (fourth objection), C1-5 (467–469).** CONCEDE all three: `say that it is a sad story` / 346; `object that the fireplace is too abstract`; `ask what she means` / 469. Every player-character line in 160–481 is a command (C1 §4.20).

**C1-6 one step → many targets.** CONCEDE the rule, DEFEND the representation. 311 is singular, and re-reading 280–288 the spark lands on `touch the flame to the tinder` alone (the match is preparation, unmapped). So: a step lands on one target; many steps may share a target; events may be unmapped. What B needs to keep is the *split band* on a row that carries several steps (5 and 6 on one paragraph, 288). Phrase-level anchors are demoted to optional: with L2 + `compound`, steps 4–8 all land on `light the pyre` at event level, which is what 455–463 says ("just … two lines … participate"). C2's cursor objection is thereby moot: the target list during mapping is all events of the board in order, at most fifteen.

**C1-7 abstract voices never enter the left column.** CONCEDE. B conflated "abstract" with "the pattern". Definitions for the data: *embodied* = a body and a will; *disembodied* = a thing without a will (the seed, the weather, the fire in the story); *abstract* = no body at all (`time`, `the season`, the Voice of Fire). The forest transcription uses `the seed`, `the weather`, `time` (abstract, for "Much time passes", 405) and `the fire`; the story's fire and the pattern stay distinct objects (D1). C's `the Voice of Fire` trap in the forest is adopted.

**C1-8 "solution II flickers."** CONCEDE. The end state stays: both solutions on the board, applied one solid, held one hollow (D3). `say that you see it` is offered as `Locked` (glyph, cannot be entered — `parser/consume_spec.ts:11–18`, `typeahead.tsx:101`), then `say "Ok, I guess"`; "But you don't really see it" prints as the consequence of the player's own command.

**C2 fact 4: a frame cannot be rendered twice and still animate.** CONCEDE, and it is a real error in B §0. `story/update/update.tsx:76` addresses DOM by story-tree path (`dom_lookup_path`, line 34); `history.tsx:26` renders the tree once and mutates. A projection cannot be animated. I adopt C2's alternative in full (§4 below): the board is a persistent subtree of the story tree, the hole moves into it, and "the ledger line *is* the frame". The slogan survives in its true form: no board state exists that is not a story node produced by a command.

**C2 fact 5: `would()` hover is dead code.** CONCEDE. `history.tsx:52–89` is commented out. The *data* path is alive — `world.tsx:148–153` computes `possible_world` on every submittable keystroke and `animation.ts:50` compiles would-effects — so this is revivable, but it is polish, not a selling point. First build: typeahead options coloured by label classes (`typeahead.tsx:63–75`), no glow.

**C2: SVG lines are the riskiest piece; ship badges first.** CONCEDE. First build has no `<svg>`: numbered colour badges on rows, a `→ <event name>` reference node under each step, bands on both sides. Lines become a decoration layer that reads `data-step` attributes from the DOM and never touches world state; if it looks wrong in the demo video it is deleted, not debugged.

**C2: pinned prompt is a real refactor.** CONCEDE. The prompt stays in the hole (`app.tsx:102–109`). The hole moves (§4).

**C2 fact 2: ~250 threads per keystroke.** DEFEND, from the parser. A thread that runs out of input fails at that consume: `parser.ts:497–510` pushes partial matches, sets `failure = NO_MATCH`, returns. A nested `split` is only reached by branches that survived the tokens before it (`parser.ts:562–588`: a restart is issued *when the split is reached*). So `draw from <step> to <target>` costs one leaf at an empty prompt, eight leaves after `draw from`, and the fifteen target leaves only once a full step name is typed. Cost tracks the typed prefix, not the grammar size. C2's guard 19b (measure; verb prefix first) is still worth doing; the prefix is already the design.

**C2 fact 3: `Ambiguous parse`.** CONCEDE the guard. Steps and events never share a slot in B's grammar, but `expand <thing>` would. Rule: step names are only reachable via `step N` / `the Nth step` in slots that also take events; a test asserts no event nominalisation equals a step nominalisation.

**C2 "chalky", wise-man slog, `erase` never needed.** CONCEDE the tone (Katya is dry: "It felt like nothing. It was chalk."). The slog: keep every event player-issued (D2 over C2's rails; 498) but single-option rows are pre-selected in the typeahead so the routine stretch is Enter-with-reading, and the voice switches are the only stops. `erase` is needed once L1–L6 refuse things: a red placement is erased by the judge, and a *legal but regretted* one (rag → thatch) by the player.

## 2. Rulings

D1–D4, D6–D11: accept as written (B already sits on the winning side of D9). **D5**: accept the Pillaging as data and a visible object (a second `AbstractSequence`, forty lines, shelved and in `notes`), never on the critical path; A's failing map only if the judge is general, which it now is. I withdraw "The Pillaging: no". **D2**: accept, and note it also rules for B's `follows`/segmentation as a permitted addition whose representational needs are demanded regardless. **D3**: accept, with the correction that B's end state was wrong (flicker) and is now fixed.

## 3. Stolen, and refused

From A, into the synthesis: `Event`/`Sequence`/`AbstractSequence`/`Mapping` as the data model; L1–L4 with C2's L6; the partial order; the Fire re-speaking on apply; grafted annotations; `consider <role>`; the Pillaging as data. Wrong for the document: no visible player transcript (M1; 30, 501); `reread` for `remember` (45, 71); the dictated `reconsider the tinder` (contradicts 387 unless Katya says why); `speak as the fire` in the house (419 puts bodiless voices in the forest); colours by voice only (152); the coda that maps the lesson (cut).

From C: the tempting-wrong-option principle and nudges 1–8, above all 5 (the Voice-of-Fire trap) and 7 (pass-relative); apply-recolouring and its five consequence texts; the Locked `say that you see it`; Katya's two speeches for 350 and 419; the retroactive `[You]` band; voices acquired into `notes`. Wrong for the document: the one-command campfire (498; C1 D2); prose lines as mapping targets (122; the player's own history has no prose); the scratch's "It depends how you look at it" and the invented hearth line (479; D10); `unmap` residue if it ever constrains (140); the chalkboard form overwritten (182, both forms coexist); no `remember` at all (45–98).

## 4. Revised UI spec, verified against the engine

**Story-tree shape.** One root (`dsl.tsx:196–199`). Dialogue frames are children of the root as now. A board is a node in the root, created by Katya's "Show it now, on the board":

```
<div class="story">
  <frame 0…k>                                      classroom and dialogue
  <div class="board" gist=board(story:'campfire')>
    <div class="left">
      <div class="voice-bar kind-embodied" gist=voice('the friends')>the friends</div>
      <div class="prose" gist=prose('campfire',1)><span gist=seg(1,'a')>A group of friends…</span></div>
      <frame k+1 class="voice-friends">  input-text › travel to the woods / output-text consequence
      <div class="prose" gist=prose('campfire',7)><span gist=seg(7,'a')>…lights a match,</span><span gist=seg(7,'b')> and carefully touches…</span></div>
      <frame …>  › light a match
      <frame … class="follows">  ↳ The fire starts, spreading…
      <hole/>                                      during transcription
    </div>
    <div class="rule hidden"/>                     the vertical line
    <div class="right">
      <div class="step" gist=step(1)>
        <div class="chalk">The laying of the tinder</div>
        <div class="notation collapsed">› lay the tinder / A small patch…</div>
        <div class="targets"/>                     "→ the laying of the tinder in the pit" on draw
        <div class="spoken"/>                      the Fire's rendition on apply
      </div> ×8
    </div>
    <div class="ledger"/>                          hole lives here during mapping
  </div>
  <frame …>                                        dialogue after `all set`
  <hole/>
</div>
```

Gists follow the engine's plain-data form (`gist/gist.ts:20`); every node an update must find carries one, so `S.has_gist(exact(g))` (`dsl.tsx:65`) addresses it without paths. Frames nested in `.left` are found by `S.frame(i)` and `latest_frame` because both search the whole tree (`story/update/query.ts:74–81, 127–136`); `history.css` already styles `.story .frame .frame`.

**No second renderer.** Everything on the board is a story op, applied to the tree and the DOM by the same compiled update (`update.tsx:66–101`): rows *are* frames; badges are `<span class="badge step-4 solid">4</span>` nodes `add`ed into the row's `.input-text`; bands are classes (`css({ 'step-4': true })`); step references are nodes `add`ed to `.targets`; `erase` is `css({...: false})` plus `.has_class('badge').has_class('step-4').remove()` (`dsl.tsx:98–99`). Held vs applied is `solid`/`hollow` on badges, so both wise-man solutions live on one board with no second column. Expand/collapse of `¶`, consequences, steps and the unmapped fold are classes; `S.map_worlds` (`dsl.tsx:152`) over board frames without a `mapped` class implements `collapse the unmapped` exactly as `reflect.tsx:98–99` dims frames. The transition uses the `eph_adding_*` classes the css op emits (`op.ts:79–83`) with `animate()`'s max-height measurement (`animation.ts:88`).

**Two columns and the panel by CSS only.** `.board:not(.collapsed)` is `position: fixed; right: 0; top: 0; width: 62vw; height: 100vh; overflow: auto`, and `.story` gets `padding-right: 62vw`; `#terminal` is already an absolutely positioned scroll container (`dist/global.css`). Fixed positioning takes the board out of flow but not out of the DOM, so path-addressed updates are unaffected. `.left`/`.right` are flex children. A `.board.collapsed` reverts to static flow and shows only its title and badge row: finished boards become chips *inline in the transcript at their chronological position* with no extra nodes. At most one board is un-collapsed (world rule).

**Voice carat without engine changes.** `parsed_text.tsx:5` hard-codes `> `. Frames get `voice-<id>` and `kind-<kind>` classes from the world's `voice` at `post`; CSS `.frame.voice-children .parsed-text > span:first-child::before { content: "the children " }` prefixes past frames, and the same rule on `.left.voice-children` prefixes the live prompt inside the hole. Dashed underline for disembodied, small caps for abstract. Katya's ⟂ mark is the `.voice-bar` node's border.

**Moving the hole.** Three moves, all the `reflect.tsx:139–143 / 188–190` trick (`story_hole().remove()` then `add(<Hole/>, true)` or `insert_after`): (1) "Show it now" moves the hole into `.left` after the first `¶`; `init_story_updates` (`dsl.tsx:201–211`) then creates each transcription frame *at the hole*, i.e. under the current prose line; each conversion's `post` re-inserts the hole after the next unconverted `¶` (`insert_after`, `dsl.tsx:96`) so frames interleave with prose. (2) `draw a vertical line` reveals `.rule`, fills `.right` from knowledge, and moves the hole into `.ledger`, so `draw`/`erase`/`apply`/objection frames and Katya's nudges stack beneath the columns, never among the rows. (3) `all set` moves the hole to the story root (`story_root().add(<Hole/>, true)`), collapses the board, and the transcript continues. The prompt is physically at the cursor row during transcription and under the board during mapping, which is better than B's pinned prompt was.

**Transcript during and after.** During: the left pane shows dialogue up to "Show it now"; the board (fixed, right) holds the prompt. After: a chip in the flow, then Katya's next story. `remember the campfire story` re-prints from knowledge: events are `ingest`ed as written and `graft`ed under the sequence node (`knowledge.ts:58, 103`), feelings grafted on `all set`, and the reprint is `S.description(lookup_or_throw(knowledge, seq))`, the `remember.tsx:52–58` pattern. `remember the touching of the flame` is the same on one event.

**Deferred to polish, in order:** SVG lines (a DOM-reading overlay); hover glow (revive would-effects); the narrow layout (inline board, `max-height: 50vh`, sticky); barcode chips; phrase-level anchors; the second physical column. **Never deferred:** the judge and nudges; badges/bands; both Voice-of-Fire forms by collapse; `follows`; the hole in the board; `apply` with the three consequences; the Locked line.

**Estimate.** Board CSS + badge/ref/collapse ops ≈ 500; judge + candidate tables ≈ 250; transcription + mapping puffers ≈ 600; content (four stories, voices, nudges, Katya, feelings) ≈ 2,000. About 3,300–3,600, under C2's revised 4,000–4,500 because the two riskiest UI pieces are gone.
