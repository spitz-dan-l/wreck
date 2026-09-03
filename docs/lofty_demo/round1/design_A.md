# Design A — Mechanics first: the Voice of Fire as a rules system

All line numbers cite `dist/posts/puzzle_lofty.md`. Tags: **[D]** the document demands it, **[I]** the document implies it, **[A]** I am adding it.

## 0. The central interpretive move

The document's five steps are usually read as five different kinds of object (events, sequences, abstract sequences, mappings). I read them as **one kind of object at two levels of abstraction**, and I want to defend that reading because everything else in this design follows from it.

Footnote 1 says every phenomenon has "one or more first-person-perspectives associated with them which imperatively command them into being. That is why the 'standard notation of the field' precisely resembles the 'imperative command, declarative consequence' grammatical form of traditional parser games" (l. 495). Katya "rewrites" the eight chalkboard statements "in the standard notation" (l. 182–216) as eight `> command` / consequence pairs. So the Voice of Fire is not a different data type from the campfire story. It is a **sequence of events issued by an abstract voice**, whose participants are *roles* (tinder, kindling, …) instead of concrete nouns. That is why the author calls it a *Voice*, and why the forest lesson teaches "disembodied and abstract voices" (l. 419) in the same breath: a disembodied voice (the weather) and an abstract voice (Fire) are the same mechanism with different participants. **[I]**

Consequences of this move: the player converts stories into notation *by issuing commands as the story's voices* (l. 498: "you need to switch to the right perspective in order to issue the right imperative commands from it"); a mapping is a relation between two event sequences; the player's own transcript is already in the notation and so is already mappable (l. 501). One data type, one board, one grammar.

## 1. Events

```ts
type VoiceId = 'you' | 'the friends' | 'the family' | 'the children' | 'the seed'
             | 'the weather' | 'the fire' | 'the man' | 'the followers' | 'Fire';
type Voice = { id: VoiceId, name: string,
               kind: 'embodied' | 'disembodied' | 'abstract', color: string };

type Event = {
  seq: SequenceId, index: number,          // position within its sequence
  voice: VoiceId,
  command: Gist,                           // e.g. lay(object: tinder, place: pit)
  consequence: Fragment,                   // authored prose (story tree)
  participants: ParticipantId[],           // nouns the event touches
  annotations: Annotation[]                // grafted later by mappings (see §4)
};
```

**Naming (the deferred noun-phrase problem, l. 58).** The document answers it without noticing: the chalkboard column is *nominalized commands* — "The laying of the tinder" for `> lay the tinder` (l. 166 / l. 185), "the getting of the guy" for `> get guy` (l. 44–49). So an event's noun phrase is rendered from its command gist by a gist renderer (the existing `render_gist.noun_phrase` machinery): `lay(object: tinder)` → "the laying of the tinder"; `hurl(object: rag, target: roof)` → "the hurling of the rag onto the roof". The chalkboard and the notation are two renderings of the same data. **[I]**

**Disambiguation.** The campfire transcription contains two `> sing` events (l. 290, l. 298). Rule: when two events in the *same sequence* share a noun phrase, ordinal prefixes are added ("the first singing", "the later singing"); when the ambiguity is across voices, the voice is prefixed ("the children's hurling…"). Because the grammar is author-defined and every valid phrase appears in typeahead (heresies essay: "transparent discoverability of valid inputs"), the player never has to guess a disambiguator. **[A]**

**Referring.** `remember <event>` prints the command and consequence verbatim plus its annotations (l. 44–56). In the classroom it is spelled `reread`, keeping `remember` free for the player's own history. **[A]**

## 2. Sequences and the assembly flow

```ts
type Sequence = { id: SequenceId, title: string, events: Event[],
                  summary?: Fragment,          // what the whole "felt" like (l. 92–96)
                  source?: { seq: SequenceId, from: number, to: number } }; // a selection
```

The document withholds the "flow" for building a sequence (l. 68). In this demo there are exactly two ways a sequence comes to exist, and both are things the document shows the player doing:

1. **Transcription.** The player converts a prose story into notation "in a column on the left of the board" (l. 248, l. 348, l. 383). Mechanically: the prose lines sit in the left column; the current line is highlighted; the prompt is *in the voice* of some perspective (shown as a colored prompt glyph); typeahead offers the commands that voice can issue for this line; issuing one prints the authored consequence and advances. Some lines need two commands (l. 232 → `light a match`, `touch the flame to the tinder`, l. 280–288). Some lines need a *different* voice before any command is offered (§4). This is the sequence-assembly flow: **you assemble a sequence by enacting it.** **[I]**
2. **Selection.** `select from <event> to <event>` makes a sub-sequence, the "two lines" of the wise man (l. 455–463). It is a real object with its own name and can be mapped. **[D]**

A sequence's *summary* is not authored per sequence; it is *produced by mappings* (§4). Before any mapping, "the campfire story" has no summary. After the Voice of Fire is applied, it does. That is the only way the demo makes "information about the sequence as a whole, that isn't necessarily present in any of its constituent events" (l. 98) into a game consequence rather than prose.

## 3. Abstract sequences ("voices") as data

```ts
type RoleId = 'tinder' | 'kindling' | 'firewood' | 'ember' | 'flame' | 'blaze' | 'ash';
type Step = {
  index: number, chalk: string,                // "The laying of the kindling over the tinder"
  command: Gist,                               // lay(object: kindling, over: tinder)
  consequence: Fragment,                       // "A layer of kindling is added over the tinder."
  mentions: RoleId[], introduces?: RoleId,     // step 4 introduces 'ember'
  after: number[]                              // partial order: steps that must precede
};
type AbstractSequence = { voice: Voice /* kind: 'abstract' */, roles: Role[], steps: Step[] };

const VOICE_OF_FIRE: AbstractSequence = { voice: FIRE, roles: [...],
  steps: [ {1, lay tinder,            mentions:[tinder],           after:[]},
           {2, lay kindling,          mentions:[kindling,tinder],  after:[]},
           {3, stack firewood,        mentions:[firewood,kindling],after:[]},
           {4, spark tinder,          mentions:[tinder], introduces:'ember',  after:[1]},
           {5, spread to kindling,    mentions:[ember,kindling], introduces:'flame', after:[2,4]},
           {6, spread to firewood,    mentions:[flame,firewood], introduces:'blaze', after:[3,5]},
           {7, burn,                  mentions:[blaze],            after:[6]},
           {8, reduce to ash,         mentions:[blaze], introduces:'ash', after:[7]} ] };
```

The eight chalkboard statements (l. 166–180) and the eight notation pairs (l. 185–215) are stored once and rendered twice. The partial order (`after`) follows `puzzle_scratch0.txt` ("the following 3 can happen in any order"; the burning "happen[s] in succession"). The .md, which is authoritative, presents a strict list, but its own examples only make sense under the partial order: the family builds foundation, frame, then roof (l. 324–326) — firewood, kindling, tinder in *reverse* — and the mapping is still "acceptable" (l. 383). **[I]**

The Pillaging (l. 108–114) is a second `AbstractSequence` with three steps and four roles. It costs forty lines of data. Its existence in the data proves voices are a *type*, not a special case (see §9).

## 4. The mapping puzzle as rules

```ts
type Mapping = {
  voice: AbstractSequence, target: Sequence,
  bindings: Map<RoleId, ParticipantId | undefined>,      // "the tinder is the rag"
  steps:    Map<StepIndex, EventIndex | undefined>,      // "the sparking is the hurling"
  status: 'open' | 'applied' | 'set aside'
};
```

**Legality** (checked incrementally, every time a binding or step is placed):

- **L1 Totality.** When *applied*, every step is placed and every role bound. While *open*, holes are fine. **[I]**
- **L2 Many-to-one, not one-to-many.** Several steps may share one event; a step lands on exactly one event; concrete events may stay unmapped. This is forced by the document: steps 4–6 all live in `touch the flame to the tinder` (l. 284–288), and in the wise man's literal solution steps 1–3 land on the pyre's construction and 4–8 on its lighting (l. 455–463). Unmapped events (travel, dig, sing, sleep) are what makes it "not quite a one-to-one mapping" (l. 313). **[D]**
- **L3 Order.** For `s' ∈ after(s)`, `steps[s'].index ≤ steps[s].index` (≤ because of L2). **[I]**
- **L4 Participation.** For each step `s` and each role `r ∈ mentions(s)`, `bindings[r] ∈ participants(steps[s])`, **or** the story's *stand-in table* says this event may stand in for `r`. The stand-in table is the author's "manual fudge factor" (l. 537), made explicit and per-story:

```ts
type StandIn = { seq: SequenceId, event: number, role: RoleId, binding?: ParticipantId,
                 nudge_if_absent?: string };
// wise man, figurative:
{ seq:'wise man', event: 2 /* acquire wisdom */,     role:'tinder',   binding:'his wisdom' },
{ seq:'wise man', event: 12 /* mythologize death */, role:'ember',    binding:'the myth' },
{ seq:'wise man', event: 8  /* die unexpectedly */,  role:'ember',    binding:'the myth' }, // both answers legal (l. 477)
```

- **L5 Voice-indifference.** Nothing in L1–L4 mentions which voice issued the event. This is a *deliberate absence*, and it is the whole point of the house lesson: "these details are not relevant from the perspective of the Voice of Fire" (l. 387). Voice matters for transcription (you cannot issue `hurl the rag` as the family) and never for mapping. **[D]**

**Judging and nudging.** There is no end-of-puzzle grading. Every placement is checked at once against L2–L4 and the board colors it green (consistent), amber (consistent but leaves a hole), or red with a nudge. Nudges are generated from the violated rule plus role-specific authored text (l. 540):

| Violation | Nudge (authored per role, templated per rule) |
|---|---|
| L4, role `tinder`, event lacks binding | "The tinder is the first thing to catch. Nothing here catches." |
| L3, spark before tinder laid | "The Fire cannot spark what has not yet been laid." |
| L2, one step on two events | "One voice, one utterance. Choose." |
| L4 with stand-in `nudge_if_absent` | wise man: "Wisdom is not wood. But what *is* the wood, here?" |

**Applying** (`apply the Voice of Fire`), legal only when L1 holds, has these consequences, each one a visible state change rather than prose:

1. The eight steps are re-rendered with bindings substituted and *spoken by Fire* into the right column: "> lay the rag … The rag is lit on the end of a stick." This is the sequence's new **summary** — "the summary of all the events in the sequence" (l. 66), text present in no single event. **[D]**
2. Each mapped concrete event is retroactively **annotated** (grafted, via `story/knowledge.ts`'s `graft`) with its step and color, in the past column *and* in knowledge, so `reread the hurling of the rag` later shows "— the sparking of the tinder, in the Voice of Fire." (l. 136: "it ought to change how the player considers … in any future attempts".) **[D]**
3. **Knowledge:** the role becomes a topic. `consider the tinder` lists everything that has been tinder so far: "a patch of tinder; an oil-soaked rag; a dead tree; the tinder of a pyre; a man's wisdom." This is the accumulating disposition change (l. 134). **[I]**
4. **Available actions:** Katya's next story is offered only after an apply. Mappings "must be applied … because moving forward without it would be … intolerable" (l. 132). **[D]**
5. **Future mappings:** the stand-in rows for the wise man's figurative solution are *unlocked* by having applied the forest mapping (the lesson that intention is irrelevant). Before that, `the tinder is his wisdom` is red: "You have not yet seen a fire that no one lit." **[A]**, justified by l. 134 ("downstream consequences … on future mappings they are able to find").

**Voice switches in the notation and the mapping.** Transcription state carries `current_voice`. The command `speak as the children` (typeahead lists only voices the current story line admits) switches it; the board draws a horizontal colored bar labeled with the voice, and the prompt glyph changes color — Katya's "visual notation" (l. 350). Disembodied voices (`the weather`, `the seed`) get a hollow glyph; the abstract voice (`Fire`) an outlined one. The mapping ignores all of it (L5). The forest lesson is where the player first issues commands *as Fire* ("> spread to the brush"), so the abstract voice is taught by *speaking it*, not by being told about it. **[I]**

**Changing your mind, as a mechanic.** Three commands, no undo:

- `reconsider the tinder` — unbinds one role; every placed step that depended on it turns amber, nothing is lost; rebinding re-validates. Introduced gently (l. 140) in the house story, where both `the rag` and `the thatch` are legal and Katya's answer is the same either way.
- `set aside this mapping` — an applied mapping becomes `'set aside'`: still listed, still colored (dimmed), its annotations retracted from knowledge but not from the board. Required for the wise man (§6, beat 5).
- `resume the literal solution` — reverses `set aside`.

**Two mutually exclusive interpretations in turn.** Literal vs figurative on the wise man is mutually exclusive by the rules: the two mappings disagree on every binding and every step, and `bindings` is a function, so they cannot coexist in one `Mapping`. The player must apply the literal one (Katya demands it, l. 453), set it aside, build the figurative one, apply it — and the board then shows both bands, one dimmed, one lit. Is that enough? Alone, no: it is the *same* puzzle solved twice, not a case where the *first* reading blocks progress. So I add a second, cheaper instance earlier **[A]**: in the house story, mapping `the tinder is the rag` makes step 1 land on a *children's* event, which the player's own transcription placed *after* the roof was built — fine under L3's partial order. But Katya then asks the moral-indifference question (l. 385–391) and, to "recognise" it, the player must `reconsider the tinder` to `the thatch` and see that the Fire's spoken summary is *just as sad*. The second reading is required to unlock the forest story. Same mechanic, low stakes, then high stakes.

## 5. The player's own actions (footnote 1)

**For, minimally.** The footnote says the player's actions "will become subject to mapping and interpretation later in the game" (l. 501) — later, so it is not demanded by the demo. But the *representation* that makes it possible is free under §0: the player's commands in the classroom (`transcribe`, `speak as`, `bind`, `apply`, `set aside`) are `Event`s in the same store, voice `'you'`. What I add is one optional coda **[A]**: after "Ok, I guess" (l. 481), Katya says "One more, for next time — find the Voice of Fire in *today's lesson*," and the player's own transcript appears in the left column. Tinder = the hearth example; kindling = the campfire; firewood = the three harder stories; spark = "find the second solution"; ash = "you don't really see it." It is solvable with the rules already built, needs one stand-in table, and demonstrates extensibility toward the full game. It is the first thing I would cut if short; the representation is the last.

## 6. Scope and walkthrough

Authored prose: every Katya line and every story line in l. 160–481 (verbatim). Puzzles: four transcriptions, five mappings (campfire, house, forest, wise man ×2), two voice switches, one selection. The parser is the only input; the board is the only display.

```
┌──────────────────────────────────────┬─────────────────────────────────┐
│ THE CAMPFIRE STORY          (story)  │ THE VOICE OF FIRE       (voice) │
│ ▸ A group of friends takes a…        │ ① The laying of the tinder   ●──┼─▶ 4
│ ● [the friends] > travel to the woods│ ② The laying of the kindling ●──┼─▶ 5
│   You all make your way out…     [+] │ ③ The stacking of the firewood●─┼─▶ 6
│ ● > gather tinder, kindling, firewood│ ④ The sparking of the tinder  ●─┼─▶ 8
│ ● > dig a pit                        │ ⑤ …ember to the kindling      ●─┼─▶ 8
│ ● > lay the tinder in the pit   ①    │ ⑥ …flame to the firewood      ●─┼─▶ 8
│ ● > pile the kindling           ②    │ ⑦ The consumption of all      ●─┼─▶ 10
│ ● > stack the logs              ③    │ ⑧ The ash left behind         ○   │
│ ● > light a match                    │ tinder = the tinder   ember = ?  │
│ ● > touch the flame to the tinder ④⑤⑥│ kindling = the kindling  …       │
│ ● > sing                             ├─────────────────────────────────┤
│ ● > add logs to the fire        ⑦    │ > the ash left behind is the sl▏│
│ ● > sing                             │   ▸ the sleeping in tents        │
│ ● > sleep in tents                   │   ▸ the second singing           │
└──────────────────────────────────────┴─────────────────────────────────┘
```
Left: transcription (each event collapsible `[+]`, colored by voice, step badges appear as placed). Right: the voice, with role bindings; below, the prompt with typeahead. Requirements at l. 152 — side by side, colors per chunk, expand/collapse — all satisfied.

**Beat 0 — The lesson opens (prose, one command).** Classroom text l. 160–162. `read the board` → the eight statements (l. 166–180). `read the standard notation` → Katya rewrites; the board now shows chalk and notation as two views of one column. `reread the sparking of the tinder` prints step 4 verbatim, proving steps are objects.

**Beat 1 — The campfire.** Katya tells it (l. 220–242, prose). Player: "Ah, I see…" (l. 244) is a command: `say that the story is contained within this one` (offered in typeahead; l. 246 follows).

```
> transcribe the campfire story
The story appears on the left of the board, line by line. You take the chalk.
  ▸ "A group of friends takes a weekend trip to camp in the woods."
[the friends] > travel to the woods
You all make your way out of town, in cars piled full of food, tents and musical instruments.
You arrive at the campground in the woods.
  ▸ "As it darkens outside, they gather tinder, kindling and firewood."
[the friends] > gather tinder, kindling and firewood
...
  ▸ "One of them lights a match, and carefully touches its flame to the tinder."
[the friends] > light a match
The match head flickers into a tiny flame.
[the friends] > touch the flame to the tinder
The tinder burns quickly on contact with the flame.
The fire starts, spreading first to the kindling and then the logs.
```
Then `draw the line` (l. 309) opens the mapping; bindings are trivial (`the tinder is the tinder`) and typeahead pre-sorts matching nouns. A deliberate wrong placement, to show the nudge:
```
> the ash left behind is the second singing
✗ The singing is not ash. What is left behind, afterward, when no one is tending?
> the ash left behind is the sleeping in tents
✓ ⑧ → the sleeping in tents   (its consequence: "The remaining embers fizzle out, leaving behind ash.")
> apply the Voice of Fire
The Fire speaks, in the right column:
  > lay the tinder        A patch of fluffy tinder is placed in the pit.
  ...
  > reduce to ash         The remaining embers fizzle out, leaving behind ash.
"All set," you say. "Structurally nearly identical, as you said. Not quite a one-to-one mapping, but close."
"Indeed," she agrees. "Close enough for our purposes today. Now, consider another story, my dear..."
```

**Beat 2 — The house.** Prose l. 318–342, "quite a sad story" (l. 344–346, the player's line is a command). Transcribe as `the family` (l. 352–381) until the children's line:
```
  ▸ "Egging each other on, one of the children lights an oil-soaked rag…"
[the family] > _
  (typeahead: wait · speak as the children)
> wait
Nothing the family does here makes this happen. Whose hands hold the stick?
> speak as the children
━━━━━━━━━━━━━━━━━━━━ the children ━━━━━━━━━━━━━━━━━━━━
[the children] > light the rag
[the children] > hurl it onto the roof
[the children] > scatter
━━━━━━━━━━━━━━━━━━━━ the fire ━━━━━━━━━━━━━━━━━━━━━━━━   (Katya: "And now no one. Speak as the fire.")
[the fire] > spread to the thatch
```
Mapping: `the tinder is the rag` (or `the thatch`), kindling the thatch/frame, firewood the walls; apply. The player's mutter (l. 385) and Katya's reply (l. 387) print; `say that it knows nothing of morality` / "Indeed not" (l. 389–391). Then Katya: "Now change your mind about the tinder." `reconsider the tinder` → `the tinder is the thatch` → the Fire re-speaks. Forest unlocks.

**Beat 3 — The forest.** Prose l. 395–417. Transcription with `speak as the seed`, `speak as the weather`, `speak as the lightning`, `speak as the fire` — the prompt has no one's hands in it. Mapping: tinder = the dead tree, kindling = the dead brush, firewood = the trees; apply. Katya: "There were no people. There were still voices. And the last voice you spoke in — was it not the one on the right of the board?" (teaching abstract voices, l. 419).

**Beat 4 — The wise man, literal.** Prose l. 423–449. Transcribe (voices: the man, the followers). "That's an awful lot of extra story" (l. 451) is a command; then `select from the building of the pyre to the reduction to ash` → a two-event sequence; map all eight steps onto its two events (L2); apply. Katya: "Now, my dear, please find the second solution" (l. 465–469).

**Beat 5 — The wise man, figurative.**
```
> set aside the literal solution
The two lines dim on the board. The Fire falls silent, but its words remain, faint.
> map the Voice of Fire onto the wise man's story
> the tinder is his wisdom
✓ (stand-in: the acquiring of wisdom)
> the sparking of the tinder is the dying unexpectedly
✓ ④ → the dying                (also legal: the mythologizing of his death)
...
> apply the Voice of Fire
"Katya, I have to say, it seems this second solution hardly fits the spirit of the Voice of Fire."   (l. 473–477, all four objections, the ash objection last)
"These are all good questions, my dear. In time, we will answer them all. For now, recognize that the Voice of Fire fits on both levels."
> say ok, I guess
"Ok, I guess," you mutter. But you don't really see it.
```
Both bands are on the board; `consider the ash` now lists "a pile of black ash; a field of ash; the forest; a man's body; a distorted doctrine."

## 7. Engine: reuse, and exactly what

Reuse the engine; rebuild the demo world and the history view.

**Keep, unchanged:** `world.tsx` (immutable linked history is the event store for free), `puffer.ts`, `lock.ts` (a transcription and a mapping each own the command space, as reflection does now), `parser/` (author-defined grammar with typeahead is not optional — it is the heresies essay, and it is what makes event disambiguation a non-problem), `gist/` (events, steps, roles, bindings are all gists; noun-phrase rendering solves §1), `story/` including `knowledge.ts` (`graft` is exactly "annotate the past event retroactively"), `UI/components/{input_prompt,typeahead,parsed_text}.tsx`, `UI/framework`.

**Keep for tests only:** `supervenience.ts`. `search_future` should verify that both wise-man solutions and both house tinders are reachable from any state, and that no state is a dead end (`post_conf_notes.txt` l. 25–28 wanted exactly this).

**Replace:** `demo_worlds/narrascope/*` (content), `reflect/` (a one-column ancestor of the board), `UI/components/history.tsx` (frames still exist, but render into columns keyed by `Event.seq`). Estimated 3–4k lines of new TypeScript, most of it data.

## 8. Additions, and what I would never cut

**Add ("optionally more"):** The Pillaging as data plus one failing mapping (§9); `consider <role>` accumulation; the coda in §5; a `show the mapping as Fire's transcript` toggle. **Cut first, in order:** coda; Pillaging attempt; role accumulation prose. **Never cut:** the incremental judge with nudges (the mapping *is* the game); many-to-one with unmapped events (the document's own solutions are illegal without it); voice switching as a player command (the footnote says it becomes important game-mechanically); `set aside`/`reconsider` (principles at l. 140); the two wise-man solutions coexisting on one board; the Fire speaking the summary on apply (it is the only place "sequence summary" becomes a consequence).

## 9. The open question: the green room and The Pillaging

The green room transcript should **not** be in the demo. The author calls it "purposefully simple, contrived" (l. 28) and "ham-fisted" (l. 136); the Katya story is its replacement — the Voice of Fire *is* the Pillaging done properly, and both are "a sad story" (l. 120, l. 344). Putting the toy next to the real thing would weaken the real thing.

The Pillaging as a **voice object** should be in the demo, for a mechanics reason: a system with one voice cannot demonstrate that voices are a type, and the document's most falsifiable claim about mappings — "They might find that they cannot" (l. 124) — is never exercised by the Fire lessons, all of which succeed. So: on Katya's shelf sit two voices; after the house story the player may `map The Pillaging onto the house story`, and it **fails legally**: the children enter nothing and take nothing; L4 goes red at step 3 with the nudge "What did they take?", and there is no stand-in. Katya: "Not every voice fits every story, my dear. That is a lesson for another day." Ten lines of data, one nudge, and the demo has shown a mapping that does not exist — which is the half of the mechanic the story omits.
