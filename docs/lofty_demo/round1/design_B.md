# Design B — The board is the interface, the prompt is the chalk

Lens: UI-first. Everything below is judged against `dist/posts/puzzle_lofty.md` (cited as `l. N`). I mark claims as **demanded** (the doc says it), **implied** (the doc needs it to work), or **added** (mine).

## 0. The one structural claim

**The chalkboard is a projection of the history, not a separate widget.** Every row on the board is a frame the player produced by issuing a command (l. 501: "everything that the player does is enacted through issuing commands in this way"). The left column is the subsequence of frames written at the board in a story's voice(s); the right column is a sequence object (the Voice of Fire, l. 166–216); the lines are `mapping` records in world state. The transcript and the board show the *same* frames in two arrangements: linear/temporal on the left, side-by-side/structural on the right (l. 152: "see the whole mapping as you build it up ... side by side"). Nothing on the board can exist that was not typed, and nothing typed at the board is hidden from the transcript.

This is why the parser can stay exactly what it is (typeahead, word highlighting, `Used`/`Locked` dimming — `parser.ts`, `typeahead.tsx`) while the UI stops being a terminal (l. 146).

## 1. Layout

### Desktop (≥ 1100px)

```
┌─────────────────────────────┬──────────────────────────────────────────────────────────┐
│ CLASSROOM                   │ THE BOARD                                                │
│ (transcript, scrolls)       │ ┌ the friends ─────────────────────────┐│┌ Voice of Fire ┐ │
│                             │ │ ¶ They lay the tinder in the middle…  ││ 1 the laying   │ │
│ Katya: "Show it now, on     │ │ › lay the tinder in the pit         ●─┼┼─● of the tinder │ │
│ the board."                 │ │   You place a patch of fluffy tinder ││   ▸ (collapsed)│ │
│                             │ │ ¶ They pile the kindling on over it.  ││ 2 the laying   │ │
│ ▸ at the board: the campfire│ │ › pile the kindling over the tinder ●─┼┼─● of the       │ │
│   ├ › travel to the woods   │ │   You gently pile the thin, dry…     ││   kindling…    │ │
│   ├ › gather tinder, …      │ │ ¶ One of them lights a match, and…   ││ 3 …            │ │
│   ├ › dig a pit             │ │ › light a match                   ●─┐││ 4 the sparking │ │
│   ├ › lay the tinder ▮      │ │   The match head flickers…          ├┼┼─● of the tinder │ │
│   ├ › pile the kindling ▮   │ │ › touch the flame to the tinder   ●─┘││                │ │
│   │  …                      │ │   The tinder burns quickly…          ││ 5 the spreading│ │
│                             │ │   The fire starts, spreading first ●─┼┼─● of the ember  │ │
│                             │ │   to the kindling and then the logs ●─┼┼─● 6 …          │ │
│                             │ │ ▸ 2 events not in the mapping         ││ 7 …            │ │
├─────────────────────────────┤ └───────────────────────────────────────┘│└───────────────┘ │
│ the friends › touch the fl▌ │                                            (svg lines layer)│
│   touch the flame to the tinder ↵                                                        │
│   follows from lighting the match                                                        │
└─────────────────────────────┴──────────────────────────────────────────────────────────┘
```

- **Transcript** (left, ~34%): the existing history DOM (`history.tsx`), scrolling, with animated new text. Dialogue frames render in full. Board-work frames render as a *ledger*: one line per command, indented under a parent "at the board: <story>" frame (the nested-frame CSS in `dist/history.css` `.story .frame .frame` already anticipates this), each with a colour chip (▮) once mapped.
- **Board** (right, ~66%): three vertical regions — left column (story in standard notation), the vertical line (drawn by a command, see §2b), right column (Voice steps). The right column is *inside* the board, not a separate pane, because the doc's board is one surface (l. 248, 309–311).
- **Prompt**: pinned to the bottom of the transcript column, never inside the scrolling history (departure from `app.tsx`, where the prompt lives in `#story-hole`). The carat carries the current voice (§2a). Typeahead unfolds upward from the prompt.
- **Where the prose story lives**: as the `¶` layer of each left-column row (added). Katya's story is spoken in the transcript first (l. 218–242), then "beckons you up" (l. 248) and the lines reappear on the board as faint chalk, one row each, waiting to be converted. Converting a row does not delete the prose; it collapses to a one-line `¶` header above the event. This is the doc's "expand and collapse chunks of text you don't care about" (l. 152) applied where it matters most: you care about the prose while converting and about the notation while mapping.

### Narrow (< 700px)

```
┌───────────────────────────────┐
│ ▸ classroom (drawer, 1 line)  │   ← transcript collapses to a drawer; tap/`read` to open
├───────────────────────────────┤
│ the friends      │ Voice of F.│   ← board keeps TWO columns, always. Never stack them.
│ › lay the tinder ●┼● 1 tinder │     Consequences collapsed to first line; steps show
│ › pile the kindl.●┼● 2 kindl. │     number + two words. Horizontal scroll inside the board
│ › stack the logs ●┼● 3 wood   │     if a row overflows; the page never scrolls sideways.
│ › light a match  ●┐│          │
│ › touch the flame●┴┼● 4 spark │
│ ▸ 4 unmapped     │ 5 ember   │
├───────────────────────────────┤
│ the friends › _               │   ← prompt fixed at bottom; typeahead overlays the board
└───────────────────────────────┘
```

The side-by-side is the non-negotiable part of the doc's UI demand (l. 152), so at narrow widths the *text* gives way (collapse) rather than the *arrangement*.

### Lines, colours, chunks

- **Lines are SVG** (added, but the doc says "draw a line", l. 311). An `<svg>` overlay sits on the board; each row and each step has an anchor element; lines are cubic Béziers from the right edge of the left column to the left edge of the right column, recomputed on resize/scroll/collapse from `getBoundingClientRect`. Lines are the exact correspondence.
- **Colour bands are the chunks** (demanded, l. 152 "colors to indicate the distinct chunks of narrative abstraction"). Each Voice step has a colour, and the palette is diegetic and grouped: fuel steps 1–3 in pale straw / tan / bark-brown; spark 4 in bright orange; spreading 5–6 in flame red; burning 7 in deep red; ash 8 in grey. A mapped row gets a left-edge band in the step's colour; a row mapped to two steps (campfire `touch the flame`, whose second paragraph is both 5 and 6, l. 288) gets a split band. Bands survive collapse; lines are hidden when a row is folded into a "▸ N events not in the mapping" bar and the bar shows the bands stacked as a barcode.
- **Voice notation** (demanded, l. 350 "visual notation"): a gutter bracket runs down the left of the left column, labelled with the voice's name. Embodied voices (the friends, the family, the children, the followers) are solid brackets. Disembodied voices (the weather, the fire, the seed — l. 419) are dashed brackets with the name in italics. Abstract voices (the Voice of Fire itself, which "commands" `lay the tinder` on the right, l. 185) are double-ruled. A voice switch is a bracket ending and a new one beginning, with a ⟂ tick and the new name — the mark Katya "shows you" (l. 350). The prompt carat shows the same name in the same style, so the notation on the board and the notation you are typing in are one system.

## 2. Interaction flow

### 2a. Converting prose to standard notation — what is the puzzle?

The consequence text is authored (declarative, l. 495 "imperative command, declarative consequence"). The player supplies the **imperative**, and the puzzle is three decisions the prose does not make for you:

1. **Segmentation.** One prose line is not one event. l. 232 ("lights a match, and carefully touches its flame") becomes two events (l. 280–286). l. 234 ("The fire starts, spreading…") is not an event at all: it is the *second consequence paragraph* of `touch the flame to the tinder` (l. 286–288). l. 240 becomes `sing` + `sleep in tents`, and l. 242's ash is a consequence of sleeping (l. 302–306). Choosing where the imperatives fall is the work.
2. **Voice.** Who commands this? Wrong voice → nudge (l. 540 "wrong attempts at mapping ... nudge them in the right direction"; I extend the nudge to conversion, added). E.g. at l. 334 with the carat still `the family ›`, every family imperative is `Locked`; the typeahead shows the lock glyph (existing `Lock` in `typeahead.tsx`) and the consequence-less nudge "The family does not hurl the rag."
3. **Command vs consequence.** Some prose is only ever a consequence. The `follows` option (added) attaches the line under the cursor to the previous event as a further paragraph.

Flow: the board keeps a **cursor row** (the first unconverted `¶`). The prompt's typeahead is the author-defined grammar for that row in the current voice (`heresies.html`: "the author specifies the entire set of valid inputs"): 2–4 imperatives, the `follows` option, and `speak as <voice>` once voices are taught. Enter writes the event: the `¶` collapses, the `›` command and its consequence chalk in (existing `eph_new` animation), the cursor moves down. The transcript gains a ledger line. `expand ¶` / `collapse ¶` and `expand <event>` / `collapse <event>` are commands; clicking a row does the same by filling the prompt (§3).

Transcript view of the same act:

```
▸ at the board: the campfire story
  the friends › light a match
      The match head flickers into a tiny flame.
  the friends › touch the flame to the tinder
      The tinder burns quickly on contact with the flame.
      ↳ The fire starts, spreading first to the kindling and then the logs.   (follows)
```

### 2b. Drawing a mapping line

Direction follows the doc: from the step on the right to the part of the story on the left (l. 311). The command is the chalk act:

```
> draw a vertical line                       (creates the right column; l. 309)
> draw from the laying of the tinder to the laying of the tinder in the pit
> draw from the sparking of the tinder to the lighting of the match
> draw from the sparking of the tinder to the touching of the flame to the tinder
> draw from the spreading of the ember to "the fire starts, spreading first to the kindling"
```

Events are named by nominalisation of their command (l. 45 "the getting of the guy"). Steps are already nominalised on the board (l. 166–180). **Targets can be an event or a gist-tagged phrase inside a consequence** (implied: l. 461 packs steps 4–8 into one line, so sub-event anchoring is required for the wise man's literal solution). The engine's facets are exactly this: gist-labelled passages inside a frame (`reflect/facet.tsx::get_facets`). Typeahead for the second argument lists events in board order with their `›` command, then the tagged phrases of the event under the cursor.

One step → many targets and many steps → one target are both legal; that is the "not quite one-to-one" (l. 313) and the reason bands can split.

### 2c. Changing your mind; two solutions side by side

- `erase the line from <step>` (diegetic; l. 140 "you can *always* change your mind"). The engine's Undo button stays for typos; erasing is a real frame that the transcript records and that Katya can react to.
- **Second column** (demanded, l. 465–471): `draw a second column` adds a second Voice-of-Fire column to the right of the first. Solution I keeps solid lines; solution II is drawn dashed. Only one solution is **applied** at a time (`apply the figurative solution`, `apply the literal solution`), the other is **held**: its lines dim to 30% and its bands hollow out. This realises "entertain two apparently mutually exclusive interpretations *in turn*" (l. 140) as a literal toggle, and gives step-5 consequences a place to attach: which Katya lines and which objections are available depends on which solution is applied (l. 134). `compare solutions` lights both at once, for reading, not for applying.

```
│ the wise man's story              ││ Voice of Fire · I (literal)  ││ Voice of Fire · II (figurative)
│ › grow up and acquire wisdom    ●─╫┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┼┼─● 1 tinder
│ › gain a small circle of seekers●─╫┼─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─┼┼─● 2 kindling
│ ▸ 6 events not in solution I      ││                              ││
│ › construct the pyre, lay his body●┼┼─● 1 2 3                      ││
│ › light the pyre                  ││                              ││
│     "the pyre is lit"           ●─┼┼─● 4                          ││
│     "from tinder to kindling"   ●─┼┼─● 5   …                       ││
```

## 3. Parser and board coexist

- **Every board action is a typed command.** Convert, `follows`, `speak as`, `draw`, `erase`, `expand`, `collapse`, `apply`, `title`. No exception; footnote 1 (l. 495–501) is the reason the notation exists.
- **Clicking is typing.** Clicking a step inserts `draw from <step> to ` into the prompt; clicking an event completes it; clicking a `¶` inserts `expand`/`collapse`. This is what `typeahead.tsx::handleClick` already does (dispatch `SelectTypeahead` then `Submit`), generalised to board elements. A click never bypasses the parser, so the transcript is complete and clicks give the same `Used`/`Locked` feedback as typing.
- **Autocomplete over board vocabulary.** Options render with the row's colour chip and board index (`⑤ the laying of the tinder in the pit`), using parser *labels* (`consume({tokens, labels: {step3: true}})` → CSS class on the token; `parsed_text.tsx::get_class_name` already turns labels into classes). While an option is highlighted, the corresponding row and step glow on the board and the frame glows in the transcript: this is the engine's `would()` mechanism (`dsl.tsx::would`, `would_cite_facet_class`), applied to board anchors as well as story nodes.
- **Voice carat.** `parsed_text.tsx::Carat` is a hard-coded `> `. It becomes a voice-aware carat: `the family ›`, `the children ›`, `the fire ›` (dashed underline for disembodied). Katya/dialogue frames use the plain `>`.
- **Transcript of a board session** is mostly ledger lines (one per command) under a parent frame; the board is the expanded view. `expand the campfire story` in the transcript unfolds the ledger into full standard notation inline (existing expand animation, `animation.ts::animate`), which is the doc's "expanding text from previous entries" (l. 148).

## 4. Events and sequences as objects, visually

- **Naming.** Every frame gets a gerund gist rendered by the existing `GistRenderer` machinery (`gist/render.ts`): command `lay the tinder in the pit` → noun `the laying of the tinder in the pit`, command-noun `the_laying_of the_tinder in_the_pit`. Disambiguation of the two `sing` events (l. 58) by board index: `the first singing`, `the second singing`.
- **Remembering.** `remember the touching of the flame to the tinder` prints the frame verbatim into the transcript (l. 47–53) plus "It felt: — quick, because the tinder took at once." When remembered, the board row it came from pulses (would-effect on the anchor).
- **Sequences.** Finishing a board and saying `all set` (l. 313) names the sequence (Katya titles it: "the campfire story"). `remember the campfire story` replays every frame verbatim with the summary "It felt: — warm; — trivially neat, because the story was built to be burnt" (l. 92–96: a summary not in any event). The board rolls into a **chip** in the transcript: name + barcode of the mapping's bands in order. The barcode is the sequence-as-single-entity: you can see at a glance that the house story's barcode has the same eight colours in the same order as the campfire's but its bands are narrower and interrupted.
- **Highlighting a sequence.** Typing a sequence's name (even partially) brackets its frames in the transcript with the same bracket glyph the board uses for voices, labelled with the name. Sequences and voices share one visual grammar: a bracket is "these frames, as one thing".

## 5. What the existing UI can and cannot do

Reuse verbatim: `parser/` (threads, typeahead grid, `Used`/`Locked`, labels), `world.tsx`/`history.ts` (immutable frames; the board is `history_array(world).filter(w => w.board === id)`), `story/` (story tree, gist-tagged passages, staged updates, `would()` effects, `graft` for retroactive reveals — the "It felt" summaries and mapping annotations are grafted under frames exactly as `inner_action.tsx` grafts insights), `gist/` (naming), `puffer.ts`/`lock.ts` (a `Board` owner locks the command space to board verbs while at the board, as `Metaphor` does in `reflect.tsx`), `UI/framework` (the diff-by-props component model is fine), `animation.ts` (expand/collapse measurement), the `--rgb-color/--alpha-color` scheme (`global.css`) for dimming held solutions.

Cannot serve as-is:
1. **Single column.** `app.tsx` renders one `.story` with the prompt inside `#story-hole`. Needs a two-pane root and a pinned prompt. The story model already supports moving the hole (`reflect.tsx` moves it inside a frame), so the *model* is ready; the components are not.
2. **No board component.** New `Board` renderer reading `AppState.command_result.world`, plus a `Lines` SVG child; both follow the `child_declarator_for` pattern.
3. **No voice in the prompt.** `Carat` must take the world's `voice`.
4. **Typeahead options have no chips.** Small change: labels → colour class; option rows get a leading `<span class="chip step-3">`.
5. **Nesting is display-only.** `World` is a flat list; ledger nesting is a `board` tag on frames, rendered as nesting. Do not restructure the history (the `compound_actions.txt` note reaches the same conclusion: keep the single line of atomic events, group at display time).
6. **Narrascope world**: drop entirely (consider/reflect/facets are a different puzzle); keep `Action`/`ActionHandler`/knowledge patterns from `prelude.ts`, `action.tsx`.

Recommendation: **fresh UI layer on the existing engine core.** Roughly: `Board` + `Lines` + `Ledger` + voice-aware prompt ≈ 900–1,200 lines; world/content (four stories, voices, mapping rules, Katya's lines, nudges) ≈ 1,800–2,200 lines. Supervenience/future search is not needed for the demo and should stay out of the hot path.

World-state additions (sketch):

```ts
interface Lofty extends World {
  voice: VoiceId | undefined;            // carat; every frame records the voice it was issued in
  board: BoardId | undefined;            // which board session this frame belongs to (ledger nesting)
  cursor: number | undefined;            // index of the ¶ row awaiting conversion
  prose: Record<BoardId, ProseLine[]>;   // { text, converted_into: frame indices, remainder }
  mappings: Mapping[];                   // { board, solution: 1|2, step: 1..8, target: { frame, gist? } }
  applied: Record<BoardId, 1|2>;
  collapsed: Set<Gensym>;                // rows/¶s/steps folded
  sequences: Record<BoardId, { title, feelings: string[] }>;
}
```

## 6. Walkthrough, beat by beat

**Beat 0 — the classroom.** Transcript: l. 160–162. Board: empty green, a stub of chalk. Prompt `> ` offers `listen`, `look at the board`, `pick up the chalk`. The player takes two or three of these. (These frames exist so that step 2 of the mechanic can be taught on the player's *own* actions, §8.)

**Beat 1 — Katya writes.** `listen`: the right column chalks in the eight statements (l. 166–180), collapsed. `listen` again: "She rewrites this in the standard notation" (l. 182) — each step gains a `▸` and `expand the laying of the tinder` reveals `› lay the tinder / A small patch of tinder is placed in the hearth.` (l. 185–187). The player learns expand/collapse on the Voice column before they need it. Katya: "remember the picking up of the chalk" — the player does; verbatim + "It felt: — chalky." Events are objects (l. 38–56) taught on the player's own history.

**Beat 2 — the campfire story.** `listen`: l. 220–242 speak into the transcript and ghost onto the left column as `¶` rows. Prompt offers `I see the Voice of Fire within it` (l. 244). Katya: "Show it now, on the board" (l. 246). Carat becomes `the friends ›`; the bracket appears, unlabelled-then-labelled. The board takes focus; the transcript shrinks.

**Beat 3 — conversion.** Cursor on `¶ A group of friends takes a weekend trip`. Typeahead: `travel to the woods`, `pack the cars`. Choose; consequence l. 253–255 chalks in; `¶` collapses. … At `¶ One of them lights a match, and carefully touches…`: typeahead `light a match`, `touch the flame to the tinder`. Choosing `light a match` leaves "…and carefully touches its flame to the tinder" highlighted as remainder; next choose `touch the flame to the tinder`. Cursor on `¶ The fire starts…`: typeahead `follows from touching the flame to the tinder` (grey) and `spread to the kindling` (Locked: "The friends do not command the fire."). Twelve events in all (l. 251–306).

**Beat 4 — the vertical line and the mapping.** `draw a vertical line` (l. 309): the Voice column slides in beside the story. Eight `draw from … to …` commands; lines and bands appear; the two `sing`s, `travel`, `gather`, `dig` stay uncoloured. `collapse the unmapped` folds them. `all set` → l. 313–315 exchange. Katya titles the sequence; the board rolls into a chip in the transcript with an eight-band barcode; the board clears.

**Beat 5 — the house in the woods.** l. 318–342 ghost in. Convert as `the family ›`: `pack`, `travel` ×3, `cut wood`, `dig a hole` (l. 354–378), then (author-added, l. 383 "you complete the translation") `build the foundation`, `raise the frame`, `lay walls and a roof`, `move in`, `let time pass`. At `¶ One day, a small group of children…` the family typeahead is all Locked. The prompt offers `ask about the voice` (l. 348). Katya: "Indeed" (l. 350); the ⟂ mark and `speak as the children` appear. `speak as the children`: carat and bracket change. `happen upon the house`, `light the rag`, `hurl it onto the roof`, `scatter`. The four burning lines (l. 336–342): no voice has been taught for them, so the only legal move is `follows` ×4 under `hurl it onto the roof` — the consequences pile up under the children's last act. (Interpretive claim: this is *why* the forest story comes next; Katya remarks "we will need better voices for that" and the debt is paid in beat 6.) Mapping: `draw from the laying of the tinder to the lighting of the rag` **or** `…to "the thatch of the house's roof"` — both accepted (l. 537 "manual fudge factors"), and Katya's reply differs. The player's mutter (l. 385) is a command `object: is the tinder the rag or the thatch?`; Katya l. 387; `and the morality?` l. 389; `Indeed not` l. 391. Feelings on `all set`: "— sad; — uneasy, because the burning was done by someone else."

**Beat 6 — the forest fire.** l. 395–417. Katya teaches disembodied voices (l. 419): `speak as the seed`, `speak as the weather`, `speak as the tree`, `speak as the forest`, `speak as the fire`. Dashed brackets, italic carats. The fire's `spread to the dead brush`, `spread to more trees`, `burn`, `stop at the rivers`, `reduce to ash` are commands from a voice with no body — and they are the same imperatives the Voice of Fire uses on the right (l. 201–215), which is the lesson. Mapping: tinder → "dead brush" phrase; kindling → "many trees die"; firewood → `flourish`; spark → `strike the dead tree`; 5–8 → the fire's events. Feelings: "— indifferent; — inevitable, because no one wanted it."

**Beat 7 — the wise man.** l. 423–449, fifteen `¶`s, voices `the boy/the man`, `the followers`, `the closest followers`, `the multitudes`, `the central followers`, `the books`, `time`. Literal solution: only `construct the pyre and lay his body` and `light the pyre` participate (l. 451–463); `collapse the unmapped` folds thirteen rows to one bar, which is the visual punchline of "an awful lot of extra story" (l. 451). Katya: "find the second solution" (l. 465). `draw a second column`. `apply the figurative solution` and draw: tinder → `acquire wisdom`, kindling → `gain a small circle`, firewood → `attract more followers`, spark → `mythologize his death`, 5 → "adjust his words", 6 → `spread across the land`, 7 → "read and repeated and reprinted", 8 → "hardly resemble the original ideas" (l. 471). The unmapped bar shrinks to two rows; solution I's rows are now the ones hollowed out. Objections are commands: `object: there is no fire`, `object: which event is the spark?` (the typeahead offers `draw from the sparking to the dying` as an alternative and accepts it), `object: ash is not so structured` (l. 477). Katya l. 479. `ok, I guess` (l. 481). Both columns stay lit for a moment, then solution II flickers — "But you don't really see it."

**Coda.** `remember the wise man's story`: verbatim, "It felt: — unconvincing, because you don't really see it." The transcript now holds four chips with four barcodes; the demo ends on the board, not on a cutscene (l. 142).

## 7. Additions, and what I would never cut

Added beyond the doc: the `¶` layer and cursor row; `follows`; the voice carat; `speak as`; the literal/figurative *apply* toggle; `collapse the unmapped`; barcode chips; conversion nudges; per-story feelings; hover/would highlighting between board, typeahead, and transcript; the "burning lines have no voice yet" pedagogy in beat 5.

Would cut first, if forced: barcode chips; hover glow; the forest story's five distinct disembodied voices (collapse to `the weather` and `the fire`); `remember` of individual board events (keep `remember` of sequences).

Never cut: the two-column board with drawn lines and colour bands (l. 152, 309–311); all four stories with all their lines (author's request: "never less"); the voice-switch notation and the carat that enforces it (l. 348–350, 495–498); the second column and the in-turn toggle (l. 140, 465–471); the player's objections as commands rather than prose (l. 142, 477); the moral-indifference exchange (l. 385–391).

## 8. Open question: the green room and The Pillaging

Split them. **The green room's *function* is required; its *content* is not.** Steps 2 and 3 (l. 38–98) are taught in the doc on a four-event history the player made themselves. The Voice of Fire lesson cannot teach `remember the X-ing of the Y` and expand/collapse at the same moment it teaches conversion and mapping — that is three UI ideas in one beat. So beat 0–1 give the player three or four trivial classroom actions (pick up the chalk, look at the board) and Katya has them `remember the picking up of the chalk`. That is the green room transposed into the classroom, and it honours l. 501 (the player's own actions become mappable) more directly than a blue guy would. **The Pillaging should not appear** as a playable second abstraction: the doc calls the example "ham-fisted" (l. 136), the "which voice fits this story" puzzle is explicitly deferred (l. 543), and a second Voice on the right column would dilute the one lesson the demo exists to teach. Katya may name it once, as a Voice for another day.

## 9. Claims I expect to be attacked

1. The board is a projection of the history; rows are frames; no board state exists outside commands.
2. Conversion is a segmentation-and-voice puzzle, not transcription; `follows` is a command.
3. Mapping targets are events *or* gist-tagged phrases; the wise man's literal solution requires the latter.
4. Only one solution is applied at a time; "in turn" is a literal toggle with consequences.
5. The house story's burning lines are deliberately left voiceless (`follows`) to motivate the forest story.
6. Both rag and thatch are accepted; ambiguity is resolved by Katya's reply, not by rejection.
7. Fresh UI layer, reused engine core; drop narrascope.
8. Green room: function yes, content no; The Pillaging: no.
