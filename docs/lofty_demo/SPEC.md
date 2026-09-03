# The Voice of Fire — demo specification (v1.1)

Synthesized from round 1 of the design loop: three proposals
(`round1/design_{A,B,C}.md`), two critiques (`round1/critique_1_textual.md`,
`round1/critique_2_play_build.md`), three rebuttals (`round1/rebuttal_{A,B,C}.md`),
and the spec critique (`round1/critique_3_spec.md`), whose thirteen defects
and fourteen risks are all applied here (v1.0 → v1.1; the changes are marked
`[C3]`). Bare line numbers cite `dist/posts/puzzle_lofty.md`. Engine paths
are under `src/typescript/`.

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
6. `set aside` / `resume` on any applied mapping, with both wise-man
   solutions on one board at the end, one lit and one dimmed (l. 140, 152, 479).
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
11. Wrong attempts are *utterable*: every trap is an Available command whose
    consequence is a nudge and which advances nothing (l. 540). Only
    `say that you see it` is Locked. `[C3 D1]`

---

## 1. Content inventory (the minimum bar, and where each item lives)

| Element | Where |
|---|---|
| History of the player's action–consequence pairs (l. 5–30) | The transcript. Every frame is an event; board rows are frames. |
| Events nameable, `remember` verbatim + feeling (l. 38–56) | §7. Player classroom events carry authored feelings; story events carry their mapping annotation. |
| Sequences assembled, named, replayed + "It felt" (l. 64–98) | §7. Each finished board is a sequence; "the two lines" of the wise man is a sub-sequence. |
| Abstract sequences as a type, ≥2 instances (l. 102–120) | §3. The Voice of Fire and The Pillaging; the latter on the shelf, `remember the Pillaging`. |
| Mapping with consequences; forced application; downstream effects (l. 122–136) | §4, §7. |
| Always change your mind; two exclusive interpretations in turn (l. 140) | `erase`, re-`map`, `set aside`, `resume`; the wise man. |
| Reflection as the core puzzle, not cutscenes (l. 142) | Every character line is a command. |
| Non-linear UI: side by side, colours, expand/collapse (l. 146–152) | §8. |
| 8 steps, chalk form (l. 166–180) and notation (l. 185–215) | §3, §8: collapsed/expanded views of one column. |
| Campfire: told, contained, converted, mapped nearly 1:1 (l. 220–315) | §5.1, §9 beat 1. |
| House: sad story, voice switch with visual notation, rag/thatch ambiguity, moral indifference (l. 318–391) | §5.2, §9 beat 2. |
| Forest: no people, disembodied and abstract voices in the notation (l. 395–419) | §5.3, §9 beat 3. |
| Wise man: two-line literal solution; figurative second solution; four objections; "fits on both levels"; "you don't really see it" (l. 423–481) | §5.4, §9 beats 4–5. |
| Footnote 1: perspectives command phenomena; notation = parser form; own actions mappable later (l. 495–513) | Voices on every event (a list); `You` mark. |
| Footnote 3: fudge factors; nudges; "which voice fits" deferred; no authoring voices (l. 537–546) | Candidate tables are the fudge factors; nudges; the Pillaging never gates. |

Not included, by ruling (§13): the green-room transcript and the blue guy;
the narrascope world and its verbs (consider, scrutinize, hammer, volunteer,
notes). **The only prose not in the .md** is: the authored consequences §5
marks *(author)*; the four Katya speech blocks in §10 (voice switches,
burning lines, disembodied voices, abstract voices); the transcription and
mapping nudges; one mark; the shelf sentence; the classroom feelings; the
"It felt" lists; two one-sentence apply lines (campfire, house); and the
one-sentence coda. Nothing else is invented; in particular Katya has no
lines between the .md's lines. `[C3 D7]`

---

## 2. Vocabulary of the design

- **Event**: a frame. Command gist, voices, consequence fragment(s). Named by
  an authored `name` (a nominalisation of the command: "the laying of the
  tinder in the pit"); repeats within one sequence get ordinals ("the first
  singing", "the second singing"); repeats across sequences are qualified
  ("the passing, in the forest fire"). `[C3 D6]`
- **Sequence**: an ordered list of events with a title and, once finished,
  an "It felt" list. One per story board, plus "the two lines" (§5.4), plus
  "today's lesson" (the player's own frames), which is never mapped.
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
- **Pass**: for a given (voice, sequence), `first` while no mapping on it
  has been set aside; `second` once one has.

---

## 3. Data

```ts
type VoiceKind = 'embodied' | 'disembodied' | 'abstract';
type VoiceId = string;                       // 'the friends', 'the children', 'time', 'you', ...
interface Voice { id: VoiceId; name: string; kind: VoiceKind; }

type StepIndex = 1|2|3|4|5|6|7|8;
type Role = 'tinder'|'kindling'|'firewood'|'ember'|'flame'|'blaze'|'ash';
interface Step {
  index: StepIndex;
  chalk: string;        // "The laying of the tinder"                      (l. 166–180)
  name: string;         // authored short name used in commands: "the laying of the tinder"
  command: string;      // "lay the tinder"                                (l. 185–215)
  consequence: string;  // "A small patch of tinder is placed in the hearth."
  role: Role;           // 1 tinder, 2 kindling, 3 firewood, 4 ember, 5 flame, 6 blaze, 7 blaze, 8 ash
  after: StepIndex[];   // partial order: {4:[1], 5:[2,4], 6:[3,5], 7:[6], 8:[7]}; 1–3: []
}
interface AbstractSequence { voice: Voice; steps: Step[]; }   // Voice of Fire: 8 steps; Pillaging: 3

interface StoryEventSpec {         // authored, per story
  index: number;                   // 1-based position in the sequence
  voices: VoiceId[];               // who may speak it; the demo authors one entry everywhere   [C3 D5]
  command: string;                 // the imperative the player issues
  name: string;                    // authored nominalisation, without ordinal                  [C3 D6]
  consequence: string[];           // paragraphs; extra paragraphs come from `let it follow`
  absorbs?: StepIndex[];           // may carry more than one step (L6)
  prose: number;                   // which ¶ it converts (a ¶ may yield 2 events)
}

interface Candidate { event: number; derives: string; mark?: string; }
type CandidateTable = { [pass in 'first' | 'second']?: { [s in StepIndex]: Candidate[] } };
interface StorySpec {
  id: string; title: string;                 // "the campfire story"
  prose: string[];                           // the ¶ lines, verbatim from the .md
  events: StoryEventSpec[];
  voices: VoiceId[];                         // offered by `speak as`, in this order
  follows: number[];                         // ¶s that are consequence-only
  traps: Trap[];                             // Available wrong options with nudges (§5, §10)
  candidates: { [voice: VoiceId]: CandidateTable };
  nudges: { step: StepIndex; event: number; text: string }[];   // authored (story, step, event) nudges
  feelings: string[];                        // the "It felt:" list
  apply_text: { [pass: string]: string };    // the .md's own sentence where it has one (§5)
}
interface Trap { prose: number; voice?: VoiceId; command: string; nudge: string; }

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
  roles: { [role in Role]: { what: string; where: string }[] };   // accumulated on apply, deduped per (role, sequence)
  collapsed: Set<string>;             // ids of collapsed things (display only)
  taught: Set<'voice' | 'disembodied' | 'abstract'>;
  knowledge: Knowledge;
}
```

Gists on story nodes (for `S.has_gist(...)` addressing): `board(seq)`,
`prose(seq, n)`, `voice_bar(seq, n)`, `step(seq, n)`, `targets(seq, n)`,
`spoken(seq, n)`, `ledger(seq)`, `lesson_board`. Frames keep the engine's
frame index; a frame that is a story event also carries `event(seq, n)`.
Reprints made by `remember` carry no gists (so later ops do not land on
them). `[C3 R3]`

---

## 4. The judge

A placement `P(s) = e` is checked immediately when issued, **in the order
L3 → L7 → L4 → L6**, reporting the first failure, so that an order mistake
gets the order nudge even when the event is not a candidate, and a sharing
mistake on a legitimate candidate (house e9 held by steps 1 and 2) gets the
sharing nudge. `[C3 D3; Phase A]` An `apply` requires all rules to hold for the whole
mapping; `apply` is offered throughout mapping and fails L1 with its nudge
when there is a hole. `[C3 D4]` Re-`map`ping an already placed step replaces
the placement (l. 140). `[C3 R9]`

- **L1 Totality** (apply only). Every step is placed.
- **L2 One target.** A step lands on exactly one event. Events may be
  unmapped. Several steps may share an event subject to L6.
- **L3 Order.** For every `s' ∈ after(s)`: `P(s').index ≤ P(s).index`. At
  placement time only prerequisites already placed are compared (an
  unplaced prerequisite is not a failure); at apply, all of them.
- **L4 Candidacy.** `(s, e)` is a row of the candidate table for this
  (voice, sequence, pass) after L7. The tables are the "manual fudge
  factors" (l. 537), visible as data.
- **L5 Voice-indifference.** No rule reads the voices of `e` (l. 387, 391).
- **L6 Sharing.** If `P(s) = P(s') = e` for `s ≠ s'`, then `s, s' ∈ absorbs(e)`.
  There is **no** load-time lint: an event may be listed as an alternative
  for several steps (house e8, e9; forest e10) without absorbing them; L6
  bites only when two steps actually hold it. `[C3 D2]`
- **L7 Spoken for.** In the second pass, an event that is a target of a
  set-aside mapping is removed from the table. The second-pass tables list
  such events (§5.4 lists e9 and e11) so that L7 is what removes them and
  the "spoken for" nudge fires on an L7 failure; a test must fail if L7 is
  deleted. `[C3 R1]`

**Nudges.** A rejected placement prints, as a frame in the ledger, in this
priority: the rule-specific text for L1, L2, L3, L6, L7 (§10); else, for L4,
an authored `(story, step, event)` nudge if one exists; else the step's
default nudge (§10); never a bare refusal. A placement that succeeds but
leaves the mapping incomplete is silent (the board shows the badge). A
candidate row may carry a `mark`: an accepting line Katya says when it is
placed (the wise man's "His death. Very well. Hold that.").

**Demonstration** (encoded as unit tests, §11):

- Admitted: every mapping the document draws (§5 tables); all four legal
  house mappings; both wise-man passes; both wise-man sparks; the rag as
  both tinder and spark.
- Rejected: all eight steps on `light the pyre` (L6 for 1–3 since e11
  absorbs only 4–8; L4 in any case); "the laying of the tinder → the
  gathering" (L4); anything on either `sing` (L4); step 6 on `stack the logs`
  after step 5 on `touch the flame` (L3 with the order nudge — reachable
  because L3 is checked before L4); the spark on `light a match` after
  nothing laid is fine at placement (unplaced prerequisites) but `apply`
  then fails L1; two fuel steps on one plain event, e.g. steps 1 and 2 on
  `gather` (L6 with the sharing nudge); the literal ash in the second pass
  (L7, "spoken for"); apply with a hole (L1).

---

## 5. The stories: prose, events, voices, candidate tables

Consequences quoted from the .md are verbatim. Consequences marked *(author)*
must be written by the implementer in the document's register (short
declaratives, second person for embodied voices, no adjectives the .md would
not use). Every ¶ is a prose line from the .md, verbatim.

**Typeahead rule for transcription.** The typeahead for the cursor ¶ offers:
the imperatives listed for that ¶ **in the current voice**; `let it follow`
where listed; the traps listed for that ¶ (Available; issuing one prints
its nudge as the frame's consequence and changes nothing else); and
`speak as <voice>`. At board open, `speak as` offers only the story's first
voice; from l. 350 on it offers every voice in `voices` and may be used mid
board. `[C3 D1, D12]`

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
| 8 | 234 | `let it follow` → second paragraph of e8, l. 288. Trap: `spread to the kindling` → "The friends do not command the fire, my dear." |
| 9 | 236 | e9 `sing` — l. 292 |
| 10 | 238 | e10 `add logs to the fire` — l. 296 |
| 11 | 240 | e11 `sing` — l. 300; then e12 `sleep in tents` — l. 304 |
| 12 | 242 | `let it follow` → second paragraph of e12, l. 306 |

Names: the traveling to the woods; the gathering of tinder, kindling and
firewood; the digging of a pit; the laying of the tinder in the pit; the
piling of the kindling; the stacking of the logs; the lighting of a match;
the touching of the flame to the tinder; the singing (×2, ordinals); the
adding of logs to the fire; the sleeping in tents.
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
Apply text: "The evening in the woods and the hearth on the board are the
same shape." `[C3 R7]`

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
| 9 | 334 | **Pause.** In the family's voice the typeahead offers the trap `light the rag` (nudge V1) and `ask what the right thing to do is` (l. 348). After Katya's speech (l. 350, §10) and the voice bars' appearance: `speak as the children`. Then e11 `light the rag` *(author)*; e12 `hurl it onto the roof` *(author)*; e13 `scatter` *(author)* |
| 10 | 336 | `let it follow` (e13). Trap: `spread to the thatch` (nudge V2). Katya's burning-lines line (§10) prints once when ¶10 is reached. |
| 11 | 338 | `let it follow` (e13) |
| 12 | 340 | `let it follow` (e13) |
| 13 | 342 | `let it follow` (e13) |

Names: the packing; the traveling (×3, ordinals); the cutting of wood; the
digging of a hole; the building of the foundation; the raising of the
frame; the laying of walls and a roof; the moving in; the lighting of the
rag; the hurling of the rag onto the roof; the scattering.
Absorbs: e11 [1,4]; e13 [5,6,7,8]. `[C3 D2, R5]`
Candidates (first pass): s1→{e11 · the oil-soaked rag; e9 · the thatch};
s2→{e9 · the thatch; e8 · the frame}; s3→{e8 · the frame; e7 · the foundation};
s4→{e12 · the burning stick; e11 · the lit rag}; s5→{e13 · the flame on the
thatch}; s6→{e13 · the blaze in the frame}; s7→{e13 · the blaze}; s8→{e13 · a
field of ash}.
Legal mappings: rag with (thatch, frame), (thatch, foundation) or (frame,
foundation), each with the spark on e12 or e11; thatch with (frame,
foundation), spark on e12. L6 keeps e7, e8, e9 distinct across steps 1–3.
Authored nudges: (s1, e5) "Wood that is cut is not yet laid."
Feelings: "It felt: — sad, because it was a home; — a bit cold, because the
pattern did not mind; — unfinished, because the tinder is still two things."
Apply text: l. 383's last sentence, verbatim: "You struggle a bit more to
map the steps from the Voice of Fire to the steps of this story. It's less
clear what part of the house is the tinder, or the kindling, or the
firewood. Nevertheless, you find an acceptable mapping." `[C3 D8]`
Katya says nothing about which tinder was chosen. `[C3 D7]`

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

Names: the taking root; the turning of the season; the growing; the
sprouting of leaves and seeds; the spreading of the forest; the passing of
time; the turning dry and hot; the bringing of a thunderstorm; the spreading
to the dead brush; the burning in a growing circle; the consuming of the
forest; the stopping at the rivers. (Cross-sequence repeats such as `pass`
are qualified in the grammar: "the passing of time, in the forest fire".)

The forest begins with **no voice**: the prompt is empty and the typeahead
offers only `speak as <voice>` for the seven voices and the trap `speak as
the Voice of Fire` (nudge V4, §10). Each ¶ accepts the voice listed; the
imperatives of other voices are not offered. Katya's disembodied-voices
speech (§10) prints on the first `speak as` of a disembodied voice (¶1, the
seed); her abstract-voices speech on the first `speak as` of an abstract
voice (¶2 at the earliest). `[C3 D11]`

Absorbs: e7 [1,2]; e9 [5,6].
Candidates: s1→{e7 · the dead brush}; s2→{e7 · the dead trees}; s3→{e5 · the
trees; e6 · the forest}; s4→{e8 · the lightning}; s5→{e9 · the flame}; s6→{e9 ·
the fire in the trees; e10 · the fire in the trees}; s7→{e10 · the blaze; e11 ·
the blaze}; s8→{e12 · the forest, as ash}.
Authored nudges: (s1, e1) "A seed is not laid to burn. What here is dry?";
(s4, e7) "Dry is not lit. What strikes?"
Feelings: "It felt: — like nothing, because no one wanted it; — a bit
familiar, because the thin voices sounded like the one on the right."
Apply text: l. 419's sentences, verbatim: "There are no people in this story,
no intentions at all. The forest is not a well-constructed fireplace at all,
but the conditions of nature happened to conspire to burn it down." `[C3 D8, R7]`

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
| 11 | 443 | [the closest followers] e11 `light the pyre` — consequence: ¶11 verbatim |
| 12 | 445 | [the closest followers] e12 `adjust and embellish his words` *(author: must end "His death becomes mythologized.")* |
| 13 | 447 | [the books] e13 `spread across the land`; [the books] e14 `be read and repeated and reprinted` *(author)* |
| 14 | 449 | [time] e15 `pass` *(author: "The words are interpreted and reinterpreted until they hardly resemble the original ideas at all.")* |

Names: the being born; the growing up and acquiring of wisdom; the seeking
of answers; the gaining of a small circle; the growing in number; the
giving of speeches; the writing down of his teachings; the dying
unexpectedly; the constructing of the pyre; the attending of the funeral;
the lighting of the pyre; the adjusting of his words; the spreading across
the land; the being read and repeated and reprinted; the passing of time
(qualified: "in the wise man's story").
Absorbs: e9 [1,2,3]; e11 [4,5,6,7,8]; e12 [4,5].
Candidates, first pass (literal): s1→{e9 · the pyre's tinder}; s2→{e9 · the
pyre's kindling}; s3→{e9 · the pyre's wood}; s4→{e11 · the flame}; s5→{e11 ·
the flame}; s6→{e11 · the blaze}; s7→{e11 · the blaze}; s8→{e11 · his body, as ash}.
Authored nudges: (any of s1–s3 on e2, e4, e5) "Wood, my dear. You are
looking for wood. There are only two lines in which anything burns. Find
them; the rest will keep."; (any of s1–s3 on e11) "It burns here, my dear.
Where was it built?"
Candidates, second pass (figurative): the first-pass rows **plus**
s1→{e2 · his wisdom}; s2→{e4 · his central followers}; s3→{e5 · the wider
community}; s4→{e12 · the myth of his death; e8 · his death, mark "His death.
Very well. Hold that."}; s5→{e12 · the distortions}; s6→{e13 · the books};
s7→{e14 · the echoes}; s8→{e15 · the distorted doctrine}. L7 removes e9 and
e11 because the literal mapping is set aside; placing on them fires the L7
nudge "That is the first solution's ash. It is spoken for. Where does the
wisdom end up?" (the ash wording is used for s8; other steps get "That line
is spoken for, my dear. It belongs to the first solution."). `[C3 R1]`
Feelings: "It felt: — a bit relieving, at first, because only two lines
burned; — then not, because all of them did;" and, grafted only when l. 481
is said: "— unconvincing, because you don't really see it." `[C3 D10]`
Apply texts, verbatim from the .md: literal — l. 455–463: "You do. Just
[¶9 verbatim] and [¶11 verbatim] participate in the mapping." followed by
l. 465 as its last paragraph; figurative — l. 471 in full ("It takes you
some time, but you gradually work it out. …"). `[C3 D8, R14]`
The literal `apply` also registers **"the two lines"** (e9, e11) as a
rememberable sub-sequence with the feeling "It felt: — contained, because
everything else stood outside." `[C3 R13]` The figurative `apply` finishes
and titles the sequence "the wise man's story". `[C3 D10]`

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
the moments §9 says. Nothing is ever hidden; traps are Available and print
their nudge.

| Command | When | Effect |
|---|---|---|
| `look at the board` | beat 0 | The blank board and the shelf. |
| `listen` | when Katya has something next | Prints her next prose block. |
| `say that <line>` / `ask <line>` / `object that <line>` | as scripted in §9 | The character's line, verbatim from the .md, then Katya's reply. |
| `pick up the chalk` | after l. 246 and each "consider another story" | Opens the story board (titled at open `[C3 R8]`), moves the hole in. |
| `speak as <voice>` | at the board, during transcription (§5 availability) | Sets the voice; from l. 350 on, draws the voice bar. |
| `<imperative>` | at the board, cursor ¶ | Writes the event; advances the cursor (or the remainder). A trap prints its nudge and advances nothing. |
| `let it follow` | where §5 lists it | Appends the ¶ as a paragraph of the previous event. |
| `draw a vertical line` | when the last ¶ is converted | Reveals the rule and the right column (the eight steps, from knowledge); moves the hole to the ledger. |
| `map <step> to <event>` | during mapping | Judged (§4). Success: badge on the row, `→ event` under the step. Replaces an earlier placement of the step. |
| `erase <step>` | during mapping | Removes that placement (no residue that the judge reads). |
| `apply the Voice of Fire` | during mapping, always offered | §7; fails L1 with its nudge when incomplete. |
| `set aside the mapping` / `resume the mapping` (wise man: `… the first solution`, `… the second solution`) | after any `apply` | Reverses/redoes §7's consequences; badges hollow/solid; opens/closes the second pass. `[C3 D9]` |
| `say all set` | after an applied mapping (l. 313) | Katya's reply; finishes the sequence; collapses the board to a chip; hole back to the root. |
| `expand <thing>` / `collapse <thing>` | any time a board is open or after | Things: `the story` (all ¶), `the steps` (notation of the right column), `the unmapped` (rows with no badge), `<event>` (its consequence), `<sequence>` (a chip). Display only. |
| `remember <event | sequence | role | the Voice of Fire | the Pillaging>` | any time | §7. |
| `say that you see it` | after l. 479 | **Locked.** |
| `say Ok, I guess` | after l. 479 | l. 481. The end. |

Names in the grammar: steps by `Step.name`; events by `name` with ordinals
within a sequence and qualification across sequences; sequences by title;
roles by `the tinder` … `the ash`; voices by name. **A load-time test asserts
that one global set** — step names, all event names of all sequences (after
ordinals and qualification), sequence titles, role names, voice names — has
no duplicates. `map <step> to <event>` separates the two slots with `to`.
`[C3 D6]`

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
   `— the <role>`; knowledge is grafted with the same annotation under the
   event, so `remember <event>` later shows it (l. 136).
4. `roles[role]` gains `{ what: derived, where: sequence title }` for every
   step's role, deduplicated per (role, sequence). `[C3 R10]`
5. The scene advances: Katya's next line becomes available.
Badges of an applied mapping are solid; of a set-aside one, hollow and 30%.
**`set aside`** reverses 2–4 by the same ops (the rendition and annotations
removed, the roles entries dropped) and hollows the badges; **`resume`**
redoes them. `[C3 D9]`

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

**Voice notation (l. 350)**: no voice bar is drawn before Katya's speech.
When it prints, the bars for every voice used so far (the friends on the
campfire chip, the family on the open board) and the `You` bar on every
frame of the player's own appear retroactively (`S.map_worlds` +
`has_gist(voice_bar(...))`), and from then on `speak as` draws a bar. `[C3 D12]`

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
    <div class="board-title">the campfire story</div>   (barcode node added on `say all set`)
    <div class="columns">
      <div class="left">
        <div class="voice-bar kind-embodied hidden" gist=voice_bar('campfire',1)>the friends</div>
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
  `position: sticky; top: 0; align-self: flex-start` inside the board so it
  stays visible while the left scrolls (the scroll container is `#terminal`;
  verify `scroll_down` still reaches the typeahead inside `.left`). `[C3 R2]`
  No fixed panels, no SVG, no hover glow in v1 (§12).
- Badges: `<span class="badge step-4 solid">4</span>` added into the row's
  input line; bands are classes on the row; reference nodes added into
  `.targets`; the Fire's rendition into `.spoken`. Held vs applied is
  `solid`/`hollow`. Collapse/expand are classes. The chip barcode is a node
  added into `.board-title`. `[C3 R12]`
- Voice bar: a horizontal bar with the voice's name, solid for embodied,
  dashed for disembodied, double-ruled for abstract; the carat inside the
  hole shows the same name and style via CSS on the enclosing `.left`
  voice class (`parsed_text.tsx`'s Carat stays untouched).
- The hole moves three times per board, using the `reflect.tsx` trick
  (`story_hole().remove()` then `add(<Hole/>)`/`insert_after`): into `.left`
  after the cursor ¶ on `pick up the chalk` and after each conversion; into
  `.ledger` on `draw a vertical line`; back to the root on `say all set`.
  During transcription the prompt is physically at the cursor row.
- **Frames print wherever the hole is**: at the root between boards; in
  `.left` during transcription (so l. 348–350 sit between ¶8 and ¶9 of the
  house board, which is where the .md puts the pause); in `.ledger` during
  mapping (nudges, marks, apply texts, the objections). `[C3 D13]`
- `say all set` collapses the board to a chip (title + barcode). `expand
  <sequence>` reopens it. The wise man's board is left expanded at the end.
  Colour palette per step (chunks of abstraction, l. 152): 1 straw, 2 tan,
  3 bark, 4 orange, 5 red, 6 deep red, 7 crimson, 8 grey. Voice marks never
  use fill colour.

---

## 9. Beat by beat

**Beat 0 — the classroom.** l. 160 prints. Typeahead: `look at the board`,
`listen`. `look at the board`: "The board is blank. On a shelf beside it are
the rolled boards of past lessons; one is labelled The Pillaging."
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
on ¶7 and ¶11, `let it follow` on ¶8 and ¶12, the one trap on ¶8.
`draw a vertical line` → l. 309–311 (the rule and the steps appear).
Mapping: eight `map`s; the three authored nudges wait. `apply the Voice of
Fire` → apply text; the Fire speaks; roles fill. `say all set` → l. 313–315
("Now, consider another story, my dear..."); the board becomes a chip
titled "the campfire story"; `remember the campfire story` is offered.
`listen` → the house ¶s (l. 318–342).

**Beat 2 — the house.** `say that it is a sad story` → l. 344–346. `pick up
the chalk` → `speak as the family` → transcription per §5.2 to ¶9; the
pause; the trap `light the rag` (V1) is there to be tried; `ask what the
right thing to do is` → l. 348 then "Indeed," says Katya (l. 350's first
word) and her voice speech (§10); the voice bars appear retroactively;
`speak as the children`; e11–e13; ¶10's trap and Katya's burning-lines line;
four `let it follow`s. `draw a vertical line`. Mapping with a real choice of
tinder; `apply` is required (nothing else advances); apply text (l. 383).
`object that there is no clear tinder` → l. 385–387; `say that it knows
nothing of the morality of the burning either` → l. 389–391. `say all set`
→ chip; l. 393 "Katya continues the lesson with another story..." `listen`
→ forest ¶s.

**Beat 3 — the forest.** `pick up the chalk`; empty voice; `speak as …` with
the Voice-of-Fire trap; Katya's two speeches at their triggers (§5.3);
transcription; line; mapping (loose); `apply`; apply text (l. 419). No
exchange (the .md has none). `say all set` → l. 421 "And now, the final story
for today's lesson," and `listen` → wise man ¶s.

**Beat 4 — the wise man, literal.** `pick up the chalk`; transcription with
its voice switches; `draw a vertical line`; `say that the Voice of Fire is
contained in just two lines` → l. 451–453 "Indeed. So, write it out."; eight
`map`s onto e9 and e11 (the "Wood, my dear" nudge guards); `apply` → l.
455–463 then l. 465 "Now, my dear, please find the second solution."
`collapse the unmapped` is offered (thirteen rows fold to one bar).

**Beat 5 — the wise man, figurative.** `ask what she means` → l. 467–469.
`set aside the first solution` (badges go hollow; the second pass opens;
L7). Eight `map`s along §5.4's second-pass table; the spark's two rows; the
"spoken for" nudge guards e9/e11. `apply` → l. 471; both solutions on the
board, second solid, first hollow; the sequence is finished and titled.
Then the four `object that …` commands **in the .md's order** (each is
offered only after the previous; `[C3 R4]`), each printing only its own
sentence from l. 473–477; "Why so, my dear?" (l. 475) after the first; l.
479 after the last. Typeahead then: `say that you see it` **Locked**, `say
Ok, I guess`. The latter → l. 481 as the consequence of the player's
command: `"Ok, I guess," you mutter.` then, after a beat, `But you don't
really see it.`; the last feeling is grafted; `remember the saying of Ok, I
guess` is available.

**Coda** (one flat sentence, no command follows): "Beneath the board, in
your own colour, is the afternoon: everything you said, and everything that
followed." The wise man's board stays open above it with both solutions;
the `You` bars are on every frame of the player's own. The demo ends there,
on the board, with `remember` still available. `[C3 R7]`

---

## 10. Authored prose the .md does not supply

All in the document's register: short declaratives, "my dear", no
exclamation marks, no explanations from Katya beyond these, no player
lines inside Katya's blocks. `[C3 D7, D11, R6, R7]`

**Katya on voice switches (at l. 350, after "Indeed,"):**
> "Every line is spoken by someone, my dear. The one who says *pack* is the
> one who packs; the consequence is reported back to them and no one else.
> When the one who speaks changes, we say so above the line, and we change
> the ink." She draws a short bar across the column and writes THE CHILDREN
> beneath it, in a second colour. "We do not write why they speak. We write
> who. Now issue their command."

**Katya on the house's burning lines (when ¶10 is reached):**
> "There is no one left to speak, my dear. The children have run. Let these
> lines follow from what they did. We will find a voice for such things
> another day."

**Katya on disembodied voices (first disembodied `speak as`, the seed):**
> "Who takes root, my dear? No one, you would say. The notation has no line
> for no one. Something must command the seed, or the seed cannot be
> written." She writes THE SEED above the line, in a colour you have not seen
> her use, with a broken bar. "When nothing wants a thing, we lend it a voice
> anyway. The seed's. The weather's. The fire's. A voice without a body and
> without a wish."

**Katya on abstract voices (first abstract `speak as`, the season or time):**
> "The season is right, my dear. Time passes. Those are voices too, of a
> thinner kind. The season commands; time commands. They have no body and no
> place. Write them with a double bar."

**Transcription traps (Available; the nudge is the frame's consequence):**
- V1, `light the rag` in the family's voice at ¶9: "You are still speaking
  as the family, my dear. Would the family light the rag? Change the voice,
  then command."
- V2, `spread to the thatch` in the children's voice at ¶10: "The children
  have run, my dear."
- V3, the campfire's `spread to the kindling` at ¶8: "The friends do not
  command the fire, my dear."
- V4, `speak as the Voice of Fire` on a story line: "Not the one on the
  board, my dear. That one we are looking for. Lend the story a fire of its
  own."

**Rule nudges:**
- L1 at apply: "The Voice of Fire does not skip, my dear. Something is
  missing from the board."
- L2 (a step already placed elsewhere is re-mapped): silent; the placement
  moves.
- L3: "The Voice of Fire proceeds in order, my dear. It does not reach the
  firewood before the kindling has caught."
- L6: "One line cannot be two things at once, my dear. What was laid
  first, and what over it?"
- L7: s8 — "That is the first solution's ash. It is spoken for. Where does
  the wisdom end up?"; other steps — "That line is spoken for, my dear. It
  belongs to the first solution."

**Default L4 nudges, by step:**
- s1 tinder: "The tinder is the first thing to catch. Nothing here catches."
- s2 kindling / s3 firewood: "Wood, my dear. You are looking for what will
  be fuel."
- s4 ember: "What was touched to the tinder? Find the touch."
- s5/s6 spreading: "The fire spreads from what has caught to what has not.
  Find the catching."
- s7 burning: "Look for the hearth burning bright and hot, for a time."
- s8 ash: "What is left behind, afterward, when no one is tending?"

**Player classroom event feelings** (flat, like l. 53):
- the picking up of the chalk: "It felt a bit ordinary, because it was chalk."
- the drawing of the vertical line: "It felt a bit decisive, because there
  was no line, and then there was."
- the saying of Ok, I guess: "It felt a bit untrue, because it was."
- any other classroom event: "It felt like nothing in particular."

**The objections (l. 473–477), as commands, in order, each printing its own
sentence:**
1. `object that there is no fire` → "Katya, I have to say, it seems this
   second solution hardly fits the spirit of the Voice of Fire." — "Why so,
   my dear?" — "There's no fire, no wood, no burning directly involved."
2. `object that the fireplace is too abstract` → "The structure of the
   fireplace is so abstract- the man's wisdom? His 'legitimate following'?"
3. `object that the spark is the myth, not the death` (or `…the death, not
   the myth`, by placement) → "And the timing doesn't seem to add up; the man
   dies, but then they turn him into a myth. So which event is the spark? His
   actual death? Or the mythological version of his death?"
4. `object that the ash is still structured` → "And the so-called 'ash' at
   the end; while it may no longer resemble the original knowledge of the
   man, it is still highly structured; more structured than a pile of ash."
   — then l. 479 verbatim.

**The shelf** (beat 0): "The board is blank. On a shelf beside it are the
rolled boards of past lessons; one is labelled The Pillaging."

**The coda**: "Beneath the board, in your own colour, is the afternoon:
everything you said, and everything that followed."

---

## 11. Engine plan

**New**: `src/typescript/demo_worlds/fire/` —
`data/types.ts`, `data/voices.ts`, `data/voice_of_fire.ts`,
`data/pillaging.ts`, `data/campfire.ts`, `data/house.ts`, `data/forest.ts`,
`data/wise_man.ts`, `data/katya.ts` (every Katya and character line,
keyed), `judge.ts` (L1–L7, nudge selection, pure functions), `names.ts`
(ordinals, qualification, collision check), `world.ts` (the `FireWorld`
interface, initial world), `board.tsx` (story ops that build and mutate
boards), `puffers/*.tsx` (classroom, transcription, mapping, remember,
dialogue), `styles.ts`, `index.ts` exporting `new_fire_world()`. Entry
points `entry_points/build_fire_{dev,prod}.tsx` → `dist/fire.js`; page
`dist/fire.html`; stylesheet `dist/board.css`. `package.json`:
`build:fire`, `build-dev:fire`. `scripts/play.js` gains `PLAY_WORLD=fire`.
Narrascope stays untouched and still builds.

**Reuse unchanged**: `parser/`, `world.tsx`, `history.ts`, `puffer.ts`,
`lock.ts`, `gist/`, `story/` (including `knowledge.ts` for grafting and
`remember`), `UI/` (framework, components, animation). Engine changes are
allowed only if a general bug or a general gap is found; log each in the
implementation notes.

**Tests** (`tests/test_fire_*.ts`):
1. Judge unit tests: every admitted/rejected case in §4 and §5, including
   all four house mappings, the rag as spark, both wise-man passes, both
   sparks, L7 (a test that fails if L7 is removed), L3 reachability, L6.
2. Global name-collision test (§6).
3. Verbatim test: every .md-quoted passage in the data is found in
   `dist/posts/puzzle_lofty.md` (whitespace-normalised).
4. A full-walkthrough test that plays the entire demo by commands and
   asserts, at each beat, that the expected .md line appears in the output
   (`to_basic_text`), that every trap is enumerable and Available and, when
   issued, prints its nudge and does not advance, that `say that you see
   it` is Locked, and that the end state has both wise-man mappings
   (`applied` and `set aside`).
5. Reachability: at scripted states (after each transcription; after each
   set-aside), `traverse_thread` enumerates the commands and the test
   asserts every §5 candidate placement is enumerable. No `search_future`
   near the board.
6. Existing tests keep passing.

**Acceptance for v1**: `npm test` green; `node scripts/play.js` walkthrough
script reaches "But you don't really see it."; keystroke parse time at the
wise man's mapping state measured and under ~30 ms `[C3 R11]`; `dist/fire.html`
renders in headless Chromium with the campfire board showing two columns and
badges (screenshot committed under `docs/lofty_demo/screenshots/`).

---

## 12. Deferred, optional-more, and cut order

**Polish, after v1 passes review** (in order): SVG lines between badges and
references (a DOM-reading overlay, never world state); hover highlighting
via revived would-effects; a fixed right-hand board panel; narrow layout;
phrase-level targets inside a consequence; C's recolouring of the left
column on apply ("the home" → "the fuel").

**Optional-more** (only after everything in §0–§11 passes review):
`try the Pillaging on the house in the woods` after l. 481: reopens the
house chip with the Pillaging's three steps in the right column; L4 fails
at step 2 ("They came upon it. Did they go in?") and step 3 ("What did they
take?"); Katya: "Not every voice fits every story, my dear. That is a lesson
for another day." This is the only place l. 124 ("they might find that they
cannot") is ever true. It never gates.

**Cut order if v1 runs long**: `remember` of the classroom events'
feelings (keep the three authored ones); the lesson-board chip; the barcode
on chips; `expand <sequence>` reopening; the `mark` mechanism; "the two
lines" sub-sequence.
**Never cut**: §0.

---

## 13. Rulings on what was still disputed

| Dispute | Ruling | Why |
|---|---|---|
| Campfire conversion: one command (C) or player-issued (A, Critic 1)? | Player-issued, one option per row, one trap. | l. 498; the pause at l. 348 needs a dozen prior utterances as the friends. |
| Mapping targets: events (A) or prose lines (C) or phrases (B)? | Events. Phrases deferred. | l. 122; the player's own history has no prose. `absorbs` covers l. 461. |
| Both wise-man solutions lit at once? | No; one applied, one set aside, both visible. | l. 140 "in turn"; l. 479, 152 require the end state to show both. |
| House burning lines: the fire (A), follows (B), the family (C)? | `let it follow` under `scatter`. | l. 419 is the first story that needs a bodiless voice; l. 286–288, 302–306 are the .md's own device. |
| Story-fire vs the Voice of Fire | Distinct objects; trap V4 keeps them so; the forest's feeling carries the kinship. | Critic 1 D1; l. 309–311; no invented Katya remark. |
| Recolouring the story on apply (C) | Deferred; badges, annotations, apply text, and the Fire's rendition carry it. | Authoring cost and fragility; nothing in the .md requires word substitution. |
| Katya's reply to rag vs thatch | None. | l. 387: it does not matter to her; the .md gives her no line there. |
| Green room | Function yes (the player's own events are rememberable with feelings), content no. | l. 28, 136; Critic 1 D5. |
| The Pillaging | Data and visible object; failing mapping optional-more. | l. 102 plural; l. 543 defers "which voice fits". |
| Fixed board panel (B) vs inline board | Inline in v1. | Fewer moving parts; the columns, not the panel, are what l. 152 demands. |
| Fire's rendition on apply: authored (A) or generic | Generic: step command + derived participant + target consequence. | Keeps the "summary in the pattern's terms" without forty new lines of prose. |
| Locked traps (v1.0) vs Available traps | Available, printing a nudge, advancing nothing. | The engine cannot enter a Locked token; l. 540 wants the wrong attempt to *produce a message*. |
| Apply texts: authored (v1.0) or the .md's | The .md's sentence wherever it has one (house 383, forest 419, wise man 455–465, 471); one flat authored sentence for the campfire. | The document already narrates those moments; talking over it is less, not more. |
| The coda | One flat sentence, no command, end on the board. | The .md ends at l. 481; the `You` frames beneath the board are the hook to the full game, and need no narration. |
| A second, engine-free implementation | Not in this round. | The loop converged on one design; a second build is worth doing only if the engine fights it, which round 2 will show. |
