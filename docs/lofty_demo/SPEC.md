# The Voice of Fire — demo specification (v1)

Synthesized from round 1 of the design loop: three proposals
(`round1/design_{A,B,C}.md`), two critiques (`round1/critique_1_textual.md`,
`round1/critique_2_play_build.md`) and three rebuttals (`round1/rebuttal_{A,B,C}.md`).
Bare line numbers cite `dist/posts/puzzle_lofty.md`. Engine paths are under
`src/typescript/`.

Where the round-1 documents converged, this spec records the convergence.
Where they still disagreed, §13 lists the ruling and the reason.

---

## 0. What the demo is

A stand-alone, playable version of the classroom lesson at l. 160–481, in
which every act of interpretation the player character performs in the story
is a command the player issues, on a two-column chalkboard, judged by a
general mapping rule with authored nudges. It contains the whole lesson and
every mechanic of the first half of the document. It reuses the engine
(parser, world, story tree, gists, knowledge, puffers, locks, UI framework)
and none of the narrascope world.

**Never cut** (from every round-1 document's never-cut list, intersected
with the critics' demands):

1. All four stories, every line, every Katya line verbatim and in order.
2. The eight steps of the Voice of Fire in both forms, always both visible
   (collapse/expand), each a rememberable object.
3. Every event of every story issued by the player as an imperative in a
   chosen voice (l. 498); `speak as <voice>` as a player act with a visible
   mark (l. 350).
4. The judge (§4) with rule-generated, authored nudges (l. 540); many-to-one
   with unmapped events (l. 313, 455–463); the partial order on steps 1–3.
5. `apply` as an explicit act with visible consequences (l. 128–136), gating
   the next story (l. 132).
6. `set aside` / `resume` with both wise-man solutions on one board at the
   end, one lit and one dimmed (l. 140, 152, 479).
7. Every player-character line at l. 244, 313, 344, 348, 385, 389, 451, 467,
   473–477 (four separate objections), 481 as a command; `say that you see
   it` offered and Locked; "But you don't really see it" as the consequence
   of the player's own command.
8. `remember <event>` verbatim plus a feeling; `remember <sequence>` verbatim
   replay plus an "It felt:" list; `remember <role>` accumulating what has
   been tinder, kindling, ... across applied mappings.
9. Two columns side by side, colour per chunk of abstraction (distinct from
   the voice mark), expand/collapse (l. 152).
10. The player's own commands visibly in the same notation, with a `You`
    voice mark (l. 495, 501).

---

## 1. Content inventory (the minimum bar, and where each item lives)

| Element | Where |
|---|---|
| History of the player's action–consequence pairs (l. 5–30) | The transcript. Every frame is an event; board rows are frames. |
| Events nameable, `remember` verbatim + feeling (l. 38–56) | §7. Player classroom events carry authored feelings; story events carry their mapping annotation. |
| Sequences assembled, named, replayed + "It felt" (l. 64–98) | §7. Each finished board is a sequence titled by Katya. |
| Abstract sequences as a type, ≥2 instances (l. 102–120) | §3. The Voice of Fire and The Pillaging; the latter on the shelf, `remember the Pillaging`. |
| Mapping with consequences; forced application; downstream effects (l. 122–136) | §4, §6. |
| Always change your mind; two exclusive interpretations in turn (l. 140) | `erase`, `set aside`, `resume`; the wise man. |
| Reflection as the core puzzle, not cutscenes (l. 142) | Every character line is a command. |
| Non-linear UI: side by side, colours, expand/collapse (l. 146–152) | §8. |
| 8 steps, chalk form (l. 166–180) and notation (l. 185–215) | §3, §8: collapsed/expanded views of one column. |
| Campfire: told, contained, converted, mapped nearly 1:1 (l. 220–315) | §5.1, §9 beat 1. |
| House: sad story, voice switch with visual notation, rag/thatch ambiguity, moral indifference (l. 318–391) | §5.2, §9 beat 2. |
| Forest: no people, disembodied and abstract voices in the notation (l. 395–419) | §5.3, §9 beat 3. |
| Wise man: two-line literal solution; figurative second solution; four objections; "fits on both levels"; "you don't really see it" (l. 423–481) | §5.4, §9 beats 4–5. |
| Footnote 1: perspectives command phenomena; notation = parser form; own actions mappable later (l. 495–513) | Voice on every event; `You` mark; the data permits multiple voices per event. |
| Footnote 3: fudge factors; nudges; "which voice fits" deferred; no authoring voices (l. 537–546) | Candidate tables are the fudge factors; nudges; the Pillaging never gates. |

Not included, by ruling (§13): the green-room transcript and the blue guy;
the narrascope world and its verbs (consider, scrutinize, hammer, volunteer,
notes); any Katya line not in the .md, except the three speeches in §10
that the .md summarises rather than quotes (l. 350, 419, and the house's
burning lines).

---

## 2. Vocabulary of the design

- **Event**: a frame. Command gist, voice, consequence fragment(s). Named by
  nominalising the command ("the laying of the tinder in the pit"); repeats
  within one sequence get ordinals ("the first singing", "the second singing").
- **Sequence**: an ordered list of events with a title and, once finished,
  an "It felt" list. One per story board, plus "today's lesson" (the
  player's own frames), which is never mapped in the demo.
- **Voice**: who commands. `kind: 'embodied' | 'disembodied' | 'abstract'`.
  Embodied: a body and a will (the friends, the family, the children, the
  boy, the man, the followers, the closest followers, You). Disembodied: a
  thing without a will (the seed, the tree, the forest, the weather, the
  fire, the books). Abstract: no body at all (the season, time, the Voice of
  Fire, The Pillaging).
- **Abstract sequence** (a *voice* with steps): steps with a chalk form, a
  notation form (command + consequence), a partial order, and roles.
- **Role**: tinder, kindling, firewood, ember, flame, blaze, ash. The player
  never binds roles; they are *derived* from placements (§4).
- **Mapping**: a placement of steps onto events of one sequence, plus a
  status: `open`, `applied`, `set aside`.
- **Pass**: for a given (voice, sequence), the set of mappings already
  applied-and-set-aside. Empty on the first attempt.

---

## 3. Data

```ts
type VoiceKind = 'embodied' | 'disembodied' | 'abstract';
type VoiceId = string;                       // 'the friends', 'the children', 'time', 'you', ...
interface Voice { id: VoiceId; name: string; kind: VoiceKind; }

type StepIndex = 1|2|3|4|5|6|7|8;
interface Step {
  index: StepIndex;
  chalk: string;        // "The laying of the tinder"                      (l. 166–180)
  name: string;         // short name used in commands: "the laying of the tinder"
  command: string;      // "lay the tinder"                                (l. 185–215)
  consequence: string;  // "A small patch of tinder is placed in the hearth."
  role: Role;           // the role this step is *about*: 1 tinder, 2 kindling, 3 firewood,
                        // 4 ember, 5 flame, 6 blaze, 7 blaze, 8 ash
  after: StepIndex[];   // partial order: {4:[1], 5:[2,4], 6:[3,5], 7:[6], 8:[7]}; 1–3: []
}
interface AbstractSequence { voice: Voice; steps: Step[]; }   // Voice of Fire: 8 steps; Pillaging: 3

interface StoryEventSpec {         // authored, per story
  index: number;                   // 1-based position in the sequence
  voice: VoiceId;                  // who must speak it (transcription)
  command: string;                 // the imperative the player issues
  consequence: string[];           // paragraphs; extra paragraphs come from `let it follow`
  absorbs?: StepIndex[];           // may carry more than one step (L6)
  prose: number;                   // which prose line (¶) it converts (a ¶ may yield 2 events)
}

interface Candidate { event: number; derives: string; nudge?: string; mark?: string; }
type CandidateTable = { [pass in 'first' | 'second']?: { [s in StepIndex]: Candidate[] } };
interface StorySpec {
  id: string; title: string;                 // "the campfire story"
  prose: string[];                           // the ¶ lines, verbatim from the .md
  events: StoryEventSpec[];
  voices: VoiceId[];                         // offered by `speak as`
  follows: number[];                         // prose lines that are consequence-only
  candidates: { [voice: VoiceId]: CandidateTable };
  feelings: string[];                        // the "It felt:" list
  apply_text: { [pass: string]: string };
}

interface Placement { step: StepIndex; event: number; }
interface Mapping {
  voice: VoiceId; sequence: string; pass: 'first' | 'second';
  placements: Placement[];
  status: 'open' | 'applied' | 'set aside';
}

interface FireWorld extends World {
  scene: SceneId;                     // where in the lesson we are (gates typeahead)
  voice?: VoiceId;                    // current speaking voice at the board
  board?: string;                     // the open sequence id
  cursor?: number;                    // next unconverted ¶ index
  remainder?: string;                 // unconverted tail of the current ¶ (two-event lines)
  sequences: { [id: string]: { events: number[] /* frame indices */, finished: boolean } };
  mappings: Mapping[];
  roles: { [role in Role]: { what: string; where: string }[] };   // accumulated on apply
  collapsed: Set<string>;             // ids of collapsed things (display only)
  taught: Set<'voice' | 'bodiless'>;
  knowledge: Knowledge;
}
```

Gists on story nodes (for `S.has_gist(...)` addressing): `board(seq)`,
`prose(seq, n)`, `voice_bar(seq, n)`, `step(seq, n)`, `targets(seq, n)`,
`spoken(seq, n)`, `ledger(seq)`, `lesson_board`. Frames keep the engine's
frame index; a frame that is a story event also carries `event(seq, n)`.

---

## 4. The judge

A placement `P(s) = e` is checked immediately when issued. An `apply`
requires all rules to hold for the whole mapping.

- **L1 Totality** (apply only). Every step is placed.
- **L2 One target.** A step lands on exactly one event. Events may be
  unmapped. Several steps may share an event subject to L6.
- **L3 Order.** For every `s' ∈ after(s)`: `P(s').index ≤ P(s).index`.
- **L4 Candidacy.** `(s, e)` is a row of the candidate table for this
  (voice, sequence, pass). The tables are the "manual fudge factors" (l. 537),
  visible as data.
- **L5 Voice-indifference.** No rule reads the voice of `e` (l. 387, 391).
- **L6 Sharing.** If `P(s) = P(s') = e` for `s ≠ s'`, then `s, s' ∈ absorbs(e)`.
  Load-time lint: an event may appear in the table for two steps only if it
  absorbs both.
- **L7 Spoken for.** In the second pass, an event that is a target of a
  set-aside mapping is removed from the table (l. 134).

**Nudges.** A rejected placement prints, as a frame in the ledger, in this
priority: the authored `nudge` on the matching candidate row if the row
exists but another rule failed (L3/L6); else an authored nudge keyed to
`(story, step, event)` if one exists; else the step's default nudge (§10);
never a bare refusal. A placement that succeeds but leaves the mapping
incomplete is silent (the board shows the badge). A candidate row may carry
a `mark`: an accepting line Katya says when it is placed (the wise man's
"His death. Very well. Hold that.").

**Demonstration** (must be encoded as unit tests, §11):

- Admitted: every mapping the document draws (§5 tables), both house
  tinders, both wise-man passes, both wise-man sparks.
- Rejected: all eight steps on `light the pyre` (L4 for 1–3; L6); "the
  laying of the tinder → the gathering" (L4); anything on either `sing`
  (neither singing is a candidate for any step; L4); "spread to the
  firewood" above "spread to the kindling" (L3); spark before fuel (L3);
  two fuel steps on one plain event (L6); the literal ash in the second
  pass (L7); apply with a hole (L1).

---

## 5. The stories: prose, events, voices, candidate tables

Consequences quoted from the .md are verbatim. Consequences marked *(author)*
must be written by the implementer in the document's register (short
declaratives, second person for embodied voices, no adjectives the .md would
not use). Every ¶ is a prose line from the .md, verbatim.

Typeahead rule for transcription: the typeahead for the cursor ¶ offers the
imperatives listed for that ¶ **in the current voice**, plus `let it follow`
where listed, plus `speak as <voice>` for every voice in `voices` once
voices are taught (§9), plus any Locked traps listed. An imperative that
belongs to another voice is offered **Locked** with the generic nudge
"The <current voice> do not <imperative>, my dear. Who does?" only where
listed as a trap; otherwise it is simply not offered.

### 5.1 The campfire story — voice: the friends (embodied)

| ¶ | Prose (l.) | Events |
|---|---|---|
| 1 | 220 | e1 `travel to the woods` — l. 253–255 |
| 2 | 222 | e2 `gather tinder, kindling and firewood` — l. 259–262 |
| 3 | 224 | e3 `dig a pit in the ground` — l. 266 |
| 4 | 226 | e4 `lay the tinder in the pit` — l. 270 |
| 5 | 228 | e5 `pile the kindling over the tinder` — l. 274 |
| 6 | 230 | e6 `stack the logs over the kindling` — l. 278 |
| 7 | 232 | e7 `light a match` — l. 282; then e8 `touch the flame to the tinder` — l. 286 (remainder "and carefully touches its flame to the tinder" highlighted after e7) |
| 8 | 234 | `let it follow` → second paragraph of e8, l. 288. Trap: `spread to the kindling` Locked: "The friends do not command the fire, my dear." |
| 9 | 236 | e9 `sing` — l. 292 |
| 10 | 238 | e10 `add logs to the fire` — l. 296 |
| 11 | 240 | e11 `sing` — l. 300; then e12 `sleep in tents` — l. 304 |
| 12 | 242 | `let it follow` → second paragraph of e12, l. 306 |

Absorbs: e8 [4,5,6].
Candidates (first pass): s1→{e4 · the tinder}; s2→{e5 · the kindling};
s3→{e6 · the logs}; s4→{e8 · the ember}; s5→{e8 · the flame}; s6→{e8 · the blaze};
s7→{e10 · the blaze}; s8→{e12 · a pile of ash}.
Authored nudges: (s8, e11) "The singing is not ash. What is left behind,
afterward, when no one is tending?"; (s7, e7) "The match is a small thing.
Look for the hearth burning bright and hot, for a time."; (s4, e7) "Lit,
but not yet touched to anything. Find the touch."
Feelings: "It felt: — a bit warm, because they sang; — a bit neat, because
the fire was built to be burnt."
Apply text: "You step back. The evening in the woods and the hearth on the
board are the same shape. It is pleasant, the way a rhyme is pleasant."

### 5.2 The house in the woods — voices: the family, the children (embodied)

| ¶ | Prose (l.) | Events |
|---|---|---|
| 1 | 318 | e1 `pack` — l. 356; e2 `travel` — l. 360 |
| 2 | 320 | e3 `travel` — l. 364; e4 `travel` — l. 368–370 |
| 3 | 322 | e5 `cut wood` — l. 374; e6 `dig a hole` — l. 378 |
| 4 | 324 | e7 `build the foundation` *(author)*; e8 `raise the frame` *(author)* |
| 5 | 326 | e9 `lay walls and a roof` *(author; must mention thatch)* |
| 6 | 328 | e10 `move in` *(author)* |
| 7 | 330 | `let it follow` (e10, ¶ verbatim) |
| 8 | 332 | `let it follow` (e10, ¶ verbatim) |
| 9 | 334 | **Pause.** In the family's voice the typeahead offers `light the rag` Locked (nudge V1, §10) and `ask what the right thing to do is` (l. 348). After Katya's speech (l. 350, §10): `speak as the children`. Then e11 `light the rag` *(author)*; e12 `hurl it onto the roof` *(author)*; e13 `scatter` *(author)* |
| 10 | 336 | `let it follow` (e13). Trap: `spread to the thatch` Locked (nudge V2). Katya's line on the burning lines (§10) prints once here. |
| 11 | 338 | `let it follow` (e13) |
| 12 | 340 | `let it follow` (e13) |
| 13 | 342 | `let it follow` (e13) |

Absorbs: e12 [4]; e13 [5,6,7,8].
Candidates (first pass): s1→{e11 · the oil-soaked rag; e9 · the thatch};
s2→{e9 · the thatch; e8 · the frame}; s3→{e8 · the frame; e7 · the foundation};
s4→{e12 · the burning stick}; s5→{e13 · the flame on the thatch}; s6→{e13 · the
blaze in the frame}; s7→{e13 · the blaze}; s8→{e13 · a field of ash}.
L6 keeps e7, e8, e9 distinct across steps 1–3, so tinder = thatch forces
kindling = frame and firewood = foundation; tinder = rag admits thatch/frame
or frame/foundation.
Authored nudges: (s1, e5) "Wood that is cut is not yet laid."; (s4, e11)
"Lit, but not yet touched to anything. What does it fall upon?"
Feelings: "It felt: — sad, because it was a home; — a bit cold, because the
pattern did not mind; — unfinished, because the tinder is still two things."
Apply text: "You read the story again from the top. The house is fuel now;
you cannot read it any other way. The family are within the blaze. The story
has gone cool in your hands, and the pattern is warm."
Katya's reply after apply differs by tinder (one sentence each, *(author)*,
before the player's l. 385 command is offered): rag — "The rag. Very well.";
thatch — "The thatch. Very well." (Deliberately the same shape: it does not
matter to her, which is the lesson.)

### 5.3 The forest fire — voices: the seed, the tree, the forest, the weather, the fire (disembodied); the season, time (abstract)

| ¶ | Prose (l.) | Events |
|---|---|---|
| 1 | 395 | [the seed] e1 `take root` *(author)* |
| 2 | 397 | [the season] e2 `turn` *(author: "…and a sapling rises forth.")* |
| 3 | 399 | [the tree] e3 `grow` *(author)* |
| 4 | 401 | [the tree] e4 `sprout leaves and seeds` *(author)* |
| 5 | 403 | [the forest] e5 `spread` *(author)* |
| 6 | 405 | [time] e6 `pass` *(author: "The trees flourish, a forest.")* |
| 7 | 407 | [the weather] e7 `turn dry and hot` *(author; must mention dead trees and dead brush)* |
| 8 | 409 | [the weather] e8 `bring a thunderstorm` *(author: "A lightning bolt strikes a dead tree, and it begins to burn.")* |
| 9 | 411 | [the fire] e9 `spread to the dead brush` *(author)* |
| 10 | 413 | [the fire] e10 `burn in a growing circle` *(author)* |
| 11 | 415 | [the fire] e11 `consume the forest` *(author)* |
| 12 | 417 | [the fire] e12 `stop at the rivers` *(author: "…The forest burns down to ash.")* |

The forest begins with **no voice**: the prompt is empty and the typeahead
offers only `speak as <voice>` for the seven voices and the trap `speak as
the Voice of Fire` (nudge V4, §10). Each ¶ accepts the voice listed; the
imperatives of other voices are not offered. On the first `speak as` of an
abstract voice (the season or time) and on the first disembodied one, Katya's
l. 419 speech prints (§10), split across the two occasions as marked there.

Absorbs: e7 [1,2]; e9 [5,6].
Candidates: s1→{e7 · the dead brush}; s2→{e7 · the dead trees}; s3→{e5 · the
trees; e6 · the forest}; s4→{e8 · the lightning}; s5→{e9 · the flame}; s6→{e9 ·
the fire in the trees; e10 · the fire in the trees}; s7→{e10 · the blaze; e11 ·
the blaze}; s8→{e12 · the forest, as ash}.
Authored nudges: (s1, e1) "A seed is not laid to burn. What here is dry?";
(s4, e7) "Dry is not lit. What strikes?"
Feelings: "It felt: — like nothing, because no one wanted it; — inevitable,
because the board said so; — a bit familiar, because the thin voices sounded
like the one on the right."
Apply text: "The forest grew for a hundred years so that it could burn for a
day. That is what the board says. The board is not wrong."

### 5.4 The wise man's story — voices: the boy, the man, the followers, the closest followers (embodied); the books (disembodied); time (abstract)

| ¶ | Prose (l.) | Events |
|---|---|---|
| 1 | 423 | [the boy] e1 `be born` *(author: "…to parents of no consequence.")* |
| 2 | 425 | [the boy] e2 `grow up and acquire wisdom` *(author)* |
| 3 | 427 | [the man] e3 `seek answers to old questions` *(author)* |
| 4 | 429 | [the man] e4 `gain a small circle of seekers` *(author)* |
| 5 | 431 | [the followers] e5 `grow in number` *(author)* |
| 6 | 433 | [the man] e6 `give speeches` *(author)* |
| 7 | 435 | [the followers] e7 `write down his teachings` *(author)* |
| 8 | 437 | [the man] e8 `die unexpectedly` *(author)* |
| 9 | 439 | [the closest followers] e9 `construct a pyre and lay his body on it` *(author)* |
| 10 | 441 | [the followers] e10 `attend the funeral` *(author)* |
| 11 | 443 | [the closest followers] e11 `light the pyre` — consequence: ¶ 11 verbatim |
| 12 | 445 | [the closest followers] e12 `adjust and embellish his words` *(author: must end "His death becomes mythologized.")* |
| 13 | 447 | [the books] e13 `spread across the land`; [the books] e14 `be read and repeated and reprinted` *(author)* |
| 14 | 449 | [time] e15 `pass` *(author: "The words are interpreted and reinterpreted until they hardly resemble the original ideas at all.")* |

Absorbs: e9 [1,2,3]; e11 [4,5,6,7,8]; e12 [4,5].
Candidates, first pass (literal): s1→{e9 · the pyre's tinder}; s2→{e9 · the
pyre's kindling}; s3→{e9 · the pyre's wood}; s4→{e11 · the flame}; s5→{e11 ·
the flame}; s6→{e11 · the blaze}; s7→{e11 · the blaze}; s8→{e11 · his body, as ash}.
Authored nudge (any of s1–s3 on e2, e4, e5): "Wood, my dear. You are looking
for wood. There are only two lines in which anything burns. Find them; the
rest will keep."
Candidates, second pass (figurative; the literal mapping set aside; L7 removes
e9, e11): s1→{e2 · his wisdom}; s2→{e4 · his central followers}; s3→{e5 · the
wider community}; s4→{e12 · the myth of his death; e8 · his death, mark "His
death. Very well. Hold that."}; s5→{e12 · the distortions}; s6→{e13 · the
books}; s7→{e14 · the echoes}; s8→{e15 · the distorted doctrine}.
Authored nudge (s8, e11 in the second pass): "That is the first solution's
ash. It is spoken for. Where does the wisdom end up?"
Feelings: "It felt: — a bit relieving, at first, because only two lines
burned; — then not, because all of them did; — unconvincing, because you
don't really see it."
Apply texts: literal — "Two lines, boxed. The rest of the man's life stands
outside the box, unburnt. You are relieved, and you notice that you are
relieved."; figurative — "It locks. Wisdom, circle, community, myth,
distortion, echo, ash. The whole man's life is in the box now, and nothing
is outside it."

### 5.5 The Pillaging (l. 108–114) — data only

Steps: 1 "Someone lives in their home" / `live in your home`; 2 "The Pillager
enters their home" / `enter their home`; 3 "The Pillager takes things from
their home" / `take things from their home`. Consequences *(author)*, one
line each. Roles: Someone, their home, the Pillager, things taken. It sits on
the shelf (§9 beat 0) and is rememberable. It has **no candidate table** in
v1; `try the Pillaging on the house in the woods` is optional-more (§12).

---

## 6. Commands (the whole grammar)

Verb first, always. Every command below is discoverable in the typeahead at
the moments §9 says. Nothing is ever hidden; wrong options are shown Locked
where §5/§9 list a trap.

| Command | When | Effect |
|---|---|---|
| `look at the board` | beat 0 | The blank board and the shelf. |
| `listen` | when Katya has something next | Prints her next prose block. |
| `say that <line>` / `ask <line>` / `object that <line>` | as scripted in §9 | The character's line, verbatim from the .md, then Katya's reply. |
| `pick up the chalk` | after l. 246 and each "consider another story" | Opens the story board, moves the hole in. |
| `speak as <voice>` | at the board, during transcription | Sets the voice; draws the voice bar. |
| `<imperative>` | at the board, cursor ¶ | Writes the event; advances the cursor (or the remainder). |
| `let it follow` | where §5 lists it | Appends the ¶ as a paragraph of the previous event. |
| `draw a vertical line` | when the last ¶ is converted | Reveals the rule and the right column (the eight steps, from knowledge); moves the hole to the ledger. |
| `map <step> to <event>` | during mapping | Judged (§4). Success: badge on the row, `→ event` under the step. |
| `erase <step>` | during mapping | Removes that placement (no residue that the judge reads). |
| `apply the Voice of Fire` | L1 holds | §7. |
| `set aside the first solution` / `resume the first solution` | wise man, after l. 469 | Dims/relights; second pass opens/closes. |
| `say all set` | after apply (l. 313) | Katya's reply; titles the sequence; collapses the board to a chip; hole back to the root. |
| `expand <thing>` / `collapse <thing>` | any time a board is open or after | Things: `the story` (all ¶), `the steps` (notation of the right column), `the unmapped` (rows with no badge), `<event>` (its consequence), `<sequence>` (a chip). Display only. |
| `remember <event | sequence | role | the Voice of Fire | the Pillaging>` | any time | §7. |
| `say that you see it` | after l. 479 | **Locked.** |
| `say Ok, I guess` | after l. 479 | l. 481. |
| `write it down` | the coda | The end. |

Names in the grammar: steps by `Step.name`; events by nominalised command
with ordinals; sequences by title; roles by `the tinder` … `the ash`.
A load-time test asserts that no event name equals a step name or a
sequence name. `map <step> to <event>` separates the two slots with `to`,
so they never share a slot.

---

## 7. Consequences of acting

**`map` success**: the row gets a numbered badge in the step's colour and a
band; the step gets `→ <event name>` in the same colour. Several steps on one
row: several badges. **`erase`**: the badge and reference go.

**`apply`** (from the ledger, in order, as staged story updates):
1. The apply text for this pass (§5) prints as the frame's consequence.
2. Under each step in the right column, the Fire speaks: `› <step command>
   — <derived participant>` and, indented, the target event's consequence
   text, all in the fire's colour (this is the sequence's summary in the
   pattern's terms; l. 66, 98). Nothing new is authored for it.
3. Each mapped row's command line gets a fire-coloured annotation
   `— the <role>` (the derived participant's role); knowledge is grafted
   with the same annotation under the event, so `remember <event>` later
   shows it (l. 136).
4. `roles[role]` gains `{ what: derived, where: sequence title }` for every
   step's role.
5. The scene advances: Katya's next line becomes available (l. 313 exchange,
   or the l. 385 command, etc.).
Badges of an applied mapping are solid; of a set-aside one, hollow and 30%.

**`remember <event>`**: the frame's command and consequence verbatim, then
its feeling: authored for the player's classroom events (§10), and for story
events "— the <role>, in the Voice of Fire" if mapped and applied, else
"It felt like nothing yet. It has not been read."
**`remember <sequence>`**: every event verbatim (collapsed to command lines
with `expand` available) then "It felt:" with the authored list (§5) plus one
generated line per applied mapping: "— like the Voice of Fire, because the
tinder was <derived>".
**`remember <role>`**: "The tinder has been: a patch of tinder, in the
campfire story; an oil-soaked rag, in the house in the woods; …" (nothing:
"Nothing has been the tinder yet.")
**`remember the Voice of Fire`** / **`the Pillaging`**: the steps in both forms.

**`speak as`**: the voice bar (§8) and the carat change; the first time the
voice notation is taught (l. 350), every frame of the player's own so far
gets the `You` voice bar retroactively (display only; `S.map_worlds`).

---

## 8. The board (story-tree shape and rendering)

One story tree. Dialogue frames are children of the root as now. The lesson
board (beat 0) and each story board are nodes in the root at their
chronological position. No second renderer: every visible change is a story
op on a gist-addressed node, so the engine's staged/animated updates drive
the board (`update.tsx` addresses the DOM by path from the story root).

```
<div class="story">
  <frame …>                                        classroom and dialogue
  <div class="board lesson" gist=lesson_board>      beat 0: only a right column
  <div class="board" gist=board('campfire')>
    <div class="board-title">the campfire story</div>
    <div class="columns">
      <div class="left">
        <div class="voice-bar kind-embodied" gist=voice_bar('campfire',1)>the friends</div>
        <div class="prose" gist=prose('campfire',1)>A group of friends…</div>
        <frame class="event voice-the-friends">    › travel to the woods / consequence
        <div class="prose" gist=prose('campfire',7)>…<span class="remainder">and carefully…</span></div>
        <frame class="event">                       › light a match
        <frame class="event">                       › touch the flame to the tinder
        <div class="follows">↳ The fire starts…</div>
        <hole/>                                     during transcription
      </div>
      <div class="rule hidden"/>
      <div class="right hidden">
        <div class="step" gist=step('campfire',1)>
          <div class="chalk">The laying of the tinder</div>
          <div class="notation collapsed">› lay the tinder<br/>A small patch…</div>
          <div class="targets" gist=targets('campfire',1)/>
          <div class="spoken" gist=spoken('campfire',1)/>
        </div> ×8
      </div>
    </div>
    <div class="ledger" gist=ledger('campfire')/>   hole lives here during mapping
  </div>
  <frame …>                                         dialogue after `say all set`
  <hole/>
</div>
```

- The board is **inline, full width**, at its place in the transcript; the
  columns are a flex row (left ~60%, right ~40%); the right column is
  `position: sticky; top: 0` inside the board so it stays visible while the
  left scrolls. No fixed panels, no SVG, no hover glow in v1 (§12).
- Badges: `<span class="badge step-4 solid">4</span>` added into the row's
  input line; bands are classes on the row; reference nodes added into
  `.targets`; the Fire's rendition into `.spoken`. Held vs applied is
  `solid`/`hollow`. Collapse/expand are classes.
- Voice bar: a horizontal bar with the voice's name, solid for embodied,
  dashed for disembodied, double-ruled for abstract; the carat inside the
  hole shows the same name and style via CSS on the enclosing `.left`
  voice class (`parsed_text.tsx`'s Carat stays untouched).
- The hole moves three times per board, using the `reflect.tsx` trick
  (`story_hole().remove()` then `add(<Hole/>)`/`insert_after`): into `.left`
  after the cursor ¶ on `pick up the chalk` and after each conversion; into
  `.ledger` on `draw a vertical line`; back to the root on `say all set`.
  During transcription the prompt is physically at the cursor row.
- `say all set` collapses the board to a chip (title + a barcode of the
  badges, in order). `expand <sequence>` reopens it. The wise man's board
  is left expanded at the end. Colour palette per step (chunks of
  abstraction, l. 152): 1 straw, 2 tan, 3 bark, 4 orange, 5 red, 6 deep red,
  7 crimson, 8 grey. Voice marks never use fill colour.
- Katya's dialogue always prints as ordinary frames at the root, except her
  nudges and marks during mapping, which print in the ledger.

---

## 9. Beat by beat

**Beat 0 — the classroom.** l. 160 prints. Typeahead: `look at the board`,
`listen`. `look at the board`: "The board is blank. Beside it, on a shelf,
sit the rolled boards of past lessons. One is labelled The Pillaging."
(`remember the Pillaging` now available.) `listen`: l. 162; the lesson
board appears with the eight chalk statements (l. 166–180) in the right
column. `listen`: l. 182; each statement gains its notation (collapsed);
`expand the steps` shows l. 185–215. `remember the laying of the tinder`
etc. available. `listen`: l. 218 and the campfire ¶s (l. 220–242) print as
prose in a frame. Typeahead: `say that the Voice of Fire is contained in
this one` → l. 244–246. `pick up the chalk` → l. 248 "She beckons you up.";
the campfire board opens; the lesson board collapses to a chip; the ¶s
appear in the left column; the hole moves in; the typeahead offers only
`speak as the friends`.

**Beat 1 — the campfire.** Transcription per §5.1: one option per row, two
on ¶7 and ¶11, `let it follow` on ¶8 and ¶12, the one Locked trap on ¶8.
`draw a vertical line` → l. 309–311 (the rule and the steps appear).
Mapping: eight `map`s; the two authored nudges wait. `apply the Voice of
Fire` → apply text; the Fire speaks; roles fill. `say all set` → l. 313–315
("Now, consider another story, my dear..."); Katya titles it "the campfire
story"; the board becomes a chip. Katya: "Remember it now, my dear, as one
thing." *(author, one line)* — `remember the campfire story` is offered
(not required). `listen` → the house ¶s.

**Beat 2 — the house.** `say that it is a sad story` → l. 344–346. `pick up
the chalk` → `speak as the family` → transcription per §5.2 to ¶9; the
pause; `ask what the right thing to do is` → l. 348, then Katya's voice
speech (§10) and the `You` bars appear retroactively; `speak as the
children`; e11–e13; ¶10 trap and Katya's burning-lines line; four `let it
follow`s. `draw a vertical line`. Mapping with a real choice of tinder;
`apply` is required (the typeahead offers nothing else that advances);
apply text; Katya's one-line reply by tinder. `object that there is no
clear tinder` → l. 385–387; `say that it knows nothing of the morality of
the burning either` → l. 389–391. `say all set` → Katya: "Now, consider
another story, my dear..." *(reuse l. 315's sentence)*; chip. `listen` →
forest ¶s (l. 393 "Katya continues the lesson with another story..." prints
first).

**Beat 3 — the forest.** `pick up the chalk`; empty voice; `speak as …` with
the Voice-of-Fire trap; Katya's bodiless-voices speech (§10) at the first
disembodied and first abstract voice; transcription; line; mapping
(loose); `apply`; apply text; no exchange (the .md has none). `say all set`
→ l. 421 "And now, the final story for today's lesson," and `listen` →
wise man ¶s.

**Beat 4 — the wise man, literal.** `pick up the chalk`; transcription with
its voice switches; `draw a vertical line`; `say that the Voice of Fire is
contained in just two lines` → l. 451–453 "Indeed. So, write it out."; eight
`map`s onto e9 and e11 (the "Wood, my dear" nudge guards); `apply` → literal
apply text; `collapse the unmapped` offered (thirteen rows fold to one bar).
Katya: l. 465 "Now, my dear, please find the second solution."

**Beat 5 — the wise man, figurative.** `ask what she means` → l. 467–469.
`set aside the first solution` (badges go hollow; the second pass opens;
L7). Eight `map`s along §5.4's second-pass table; the spark's two rows; the
"spoken for" nudge guards e11. `apply` → figurative apply text; both
solutions on the board, second solid, first hollow. Then, in any order, the
four `object that …` commands (§10), each printing only its own sentence
from l. 473–477; "Why so, my dear?" (l. 475) after the first; l. 479 after
the last. Typeahead then: `say that you see it` **Locked**, `say Ok, I
guess`. The latter → l. 481 as the consequence of the player's command:
`"Ok, I guess," you mutter.` then, after a beat, `But you don't really see
it.` `remember the saying of Ok, I guess` is available.

**Coda** *(author, §10)*: Katya rolls up the first three boards; the wise
man's stays, both solutions on it; beneath it the player's own frames in
their own colour; `write it down` → "You open your notebook and write: The
Voice of Fire." End. (Optional-more after this point: §12.)

---

## 10. Authored prose the .md does not supply

All in the document's register: short declaratives, "my dear", no
exclamation marks, no explanations from Katya beyond these. Taken from
`round1/rebuttal_C.md` §4 with the critics' corrections applied.

**Katya on voice switches (at l. 350):**
> "Every line is spoken by someone, my dear. The one who says *pack* is the
> one who packs; the consequence is reported back to them and no one else.
> When the one who speaks changes, we say so above the line, and we change
> the ink." She draws a short bar across the column and writes THE CHILDREN
> beneath it, in a second colour. "We do not write why they speak. We do not
> write whether they should. We write who. Now issue their command."

**Katya on the house's burning lines (at ¶10):**
> "There is no one left to speak, my dear. The children have run. Let these
> lines follow from what they did. We will find a voice for such things
> another day."

**Katya on disembodied voices (first disembodied `speak as` in the forest):**
> "Who lays the brush, my dear?" "No one. It fell." "The notation has no
> line for no one. Something must command the bolt, or the bolt cannot be
> written." She writes the name above the line, in a colour you have not
> seen her use, with a broken bar. "When nothing wants a thing, we lend it a
> voice anyway. The weather's. The fire's. A voice without a body and
> without a wish."

**Katya on abstract voices (first abstract `speak as` in the forest):**
> "And *the season is right*? *Time passes*?" "Those are voices too, my
> dear, of a thinner kind. The season commands; time commands. They have no
> body and no place. Write them with a double bar." She glances at the
> right-hand column. "You will notice how much such a voice sounds like the
> one we are looking for. Notice it. Do not write it there."

**Transcription nudges:**
- V1, a family imperative at ¶9 (`light the rag` Locked): "You are still
  speaking as the family, my dear. Would the family light the rag? Change
  the voice, then command."
- V2, `spread to the thatch` at ¶10 (Locked): "The children have run, my dear."
- V3, the forest with no voice (any imperative before `speak as`): not
  offered; the prompt shows only `speak as`.
- V4, `speak as the Voice of Fire` on a story line: "Not the one on the
  board, my dear. That one we are looking for. Lend the story a fire of its
  own; it will have no body either, and you will hear how alike they sound."

**Default mapping nudges, by step (used when no authored row/nudge matches):**
- s1 tinder: "The tinder is the first thing to catch. Nothing here catches."
- s2 kindling / s3 firewood: "Wood, my dear. You are looking for what will
  be fuel."
- s4 ember: "What was touched to the tinder? Find the touch."
- s5/s6 spreading: "The Voice of Fire proceeds in order. It does not reach
  the firewood before the kindling has caught."
- s7 burning: "Look for the hearth burning bright and hot, for a time."
- s8 ash: "What is left behind, afterward, when no one is tending?"
- L3 (any spark or spreading before its fuel): "A spark before the fuel is
  laid? Fire is patient. It waits for the preparation. It will wait for you."
- L6 (two fuel steps on one plain event): "Gathered is not laid. What is
  laid first, and what over it?"
- L1 at apply: "The Voice of Fire does not skip, my dear. Something is
  missing from the board."

**Player classroom event feelings:**
- the picking up of the chalk: "It felt like nothing. It was chalk. It felt a
  bit like being watched, because she was."
- the drawing of the vertical line: "It felt a bit decisive, because there
  was no line, and then there was."
- the saying of Ok, I guess: "It felt a bit like a lie, because it was one,
  told politely."
- any other classroom event: "It felt like nothing in particular."

**The objections (l. 473–477), as commands, each printing its own sentence:**
- `object that there is no fire` → "Katya, I have to say, it seems this
  second solution hardly fits the spirit of the Voice of Fire." — then, if
  first: "Why so, my dear?" — then "There's no fire, no wood, no burning
  directly involved."
  (If not first, the first sentence is omitted and only "There's no fire…"
  prints.)
- `object that the fireplace is too abstract` → "The structure of the
  fireplace is so abstract- the man's wisdom? His 'legitimate following'?"
- `object that the spark is the myth, not the death` (or `…the death, not
  the myth`, by placement) → "And the timing doesn't seem to add up; the man
  dies, but then they turn him into a myth. So which event is the spark? His
  actual death? Or the mythological version of his death?"
- `object that the ash is still structured` → "And the so-called 'ash' at
  the end; while it may no longer resemble the original knowledge of the
  man, it is still highly structured; more structured than a pile of ash."
- After the last: l. 479 verbatim.

**The coda:**
> Katya rolls the first three boards into the corner, one at a time. The
> wise man's board she leaves as it is: the two lines of the first solution,
> dimmed; the whole of his life in the second, lit.
>
> Beneath it, in the notation, in your own colour, is the afternoon:
> everything you said, and everything that followed.
>
> She does not map it. Neither do you. Not yet.

`> write it down` → "You open your notebook and write: The Voice of Fire."

---

## 11. Engine plan

**New**: `src/typescript/demo_worlds/fire/` —
`data/voices.ts`, `data/voice_of_fire.ts`, `data/pillaging.ts`,
`data/campfire.ts`, `data/house.ts`, `data/forest.ts`, `data/wise_man.ts`,
`data/katya.ts` (every Katya and character line, keyed), `judge.ts`
(L1–L7, nudge selection, pure functions over `StorySpec`/`Mapping`),
`names.ts` (nominalisation, ordinals, collision check), `world.ts` (the
`FireWorld` interface, initial world), `board.tsx` (story ops that build and
mutate boards), `puffers/*.tsx` (classroom, transcription, mapping,
remember, dialogue), `styles.ts`, `index.ts` exporting
`new_fire_world()`. Entry points `entry_points/build_fire_{dev,prod}.tsx`
→ `dist/fire.js`; page `dist/fire.html`; stylesheet `dist/board.css`.
`package.json`: `build:fire`, `build-dev:fire`. `scripts/play.js` gains
`PLAY_WORLD=fire`. Narrascope stays untouched and still builds.

**Reuse unchanged**: `parser/`, `world.tsx`, `history.ts`, `puffer.ts`,
`lock.ts`, `gist/`, `story/` (including `knowledge.ts` for grafting and
`remember`), `UI/` (framework, components, animation). Engine changes are
allowed only if a general bug or a general gap is found; log each in the
implementation notes.

**Tests** (`tests/test_fire.ts`):
1. Judge unit tests: every admitted/rejected case in §4 and §5, including
   both house tinders, both wise-man passes, both sparks, L7.
2. Name collision test (§6).
3. A full-walkthrough test that plays the entire demo by commands and
   asserts, at each beat, that the expected .md line appears in the output
   (`to_basic_text`), that Locked options are Locked, and that the end state
   has both wise-man mappings (`applied` and `set aside`).
4. Reachability: at scripted states (after each transcription; after each
   set-aside), `traverse_thread` enumerates the commands and the test
   asserts every §5 candidate placement is enumerable and every trap is
   present and Locked. No `search_future` near the board.
5. Existing tests keep passing.

**Acceptance for v1**: `npm test` green; `node scripts/play.js` walkthrough
script reaches "But you don't really see it."; `dist/fire.html` renders in
headless Chromium with the campfire board showing two columns and badges
(screenshot committed under `docs/lofty_demo/screenshots/`).

---

## 12. Deferred, optional-more, and cut order

**Polish, after v1 passes review** (in order): SVG lines between badges and
references (a DOM-reading overlay, never world state); hover highlighting
via revived would-effects; a fixed right-hand board panel; narrow layout;
phrase-level targets inside a consequence; C's recolouring of the left
column on apply ("the home" → "the fuel").

**Optional-more** (only after everything in §0–§11 passes review):
`try the Pillaging on the house in the woods` after l. 481 and before
`write it down`: reopens the house chip with the Pillaging's three steps in
the right column; L4 fails at step 2 ("They came upon it. Did they go in?")
and step 3 ("What did they take?"); Katya: "Not every voice fits every
story, my dear. That is a lesson for another day." This is the only place
l. 124 ("they might find that they cannot") is ever true. It never gates.

**Cut order if v1 runs long**: `remember` of the classroom events'
feelings (keep the three authored ones); the lesson-board chip; the barcode
on chips; `expand <sequence>` reopening; the `mark` mechanism.
**Never cut**: §0.

---

## 13. Rulings on what was still disputed

| Dispute | Ruling | Why |
|---|---|---|
| Campfire conversion: one command (C) or player-issued (A, Critic 1)? | Player-issued, one option per row, two traps. | l. 498; the pause at l. 348 needs a dozen prior utterances as the friends. |
| Mapping targets: events (A) or prose lines (C) or phrases (B)? | Events. Phrases deferred. | l. 122; the player's own history has no prose. `absorbs` covers l. 461. |
| Both wise-man solutions lit at once? | No; one applied, one set aside, both visible. | l. 140 "in turn"; l. 479, 152 require the end state to show both. |
| House burning lines: the fire (A), follows (B), the family (C)? | `let it follow` under `scatter`. | l. 419 is the first story that needs a bodiless voice; l. 286–288, 302–306 are the .md's own device. |
| Story-fire vs the Voice of Fire | Distinct objects; the trap V4 keeps them so; Katya remarks on kinship. | Critic 1 D1; l. 309–311. |
| Recolouring the story on apply (C) | Deferred; badges, annotations, apply text, and the Fire's rendition carry it. | Authoring cost and fragility; nothing in the .md requires word substitution. |
| Katya's reply to rag vs thatch | Same shape, one word different. | l. 387: it does not matter to her. Differing replies (B) would make it matter. |
| Green room | Function yes (the player's own events are rememberable with feelings), content no. | l. 28, 136; Critic 1 D5. |
| The Pillaging | Data and visible object; failing mapping optional-more. | l. 102 plural; l. 543 defers "which voice fits". |
| Fixed board panel (B) vs inline board | Inline in v1. | Fewer moving parts; the columns, not the panel, are what l. 152 demands. |
| Fire's rendition on apply: authored (A) or generic (this spec) | Generic: step command + derived participant + target consequence. | Keeps the "summary in the pattern's terms" without forty new lines of prose. |
| A second, engine-free implementation | Not in this round. | The loop converged on one design; a second build is worth doing only if the engine fights it, which round 2 will show. |
