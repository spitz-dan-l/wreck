# Brief: turning "Core puzzle mechanics in Venience World" into a proper game demo

You are one agent in a multi-agent design loop. Designers propose, critics
argue the proposals against the source document, designers respond, and the
orchestrator synthesizes a spec that then gets implemented and reviewed over
several rounds. The end goal is one or two pristine demo implementations that
have been honed through many rounds of feedback and that lend themselves to
extension into the full game the author envisioned.

## The author's request (verbatim)

> The document only describes an excerpt from a larger game, so any demo needs
> to have the full contents described by the doc, optionally more but never
> less. The perspective and philosophy described in that document still rings
> true today and captures the core of what I wanted this project to become.
> ... Debate between agents on the right way to interpret the document and
> what to build that truly honors it. The demo can reuse all, some or none of
> the existing codebase and engine. The end goal is one or two pristine
> implementations that have been honed through many rounds of feedback,
> review, debate, implementation, and that also lend themselves well to
> extension into the full game I originally envisioned.

## Source material (read all of it, in this order)

1. `dist/posts/puzzle_lofty.md` — THE document. Read it twice. Everything is
   judged against it.
2. `dist/puzzle_scratch/puzzle_scratch0.txt` … `puzzle_scratch3.txt` — the
   author's working notes from the same period (rough, contradictory in
   places; the .md is authoritative where they disagree).
3. `dist/posts/heresies.html` — the author's essay on their philosophy of IF.
4. `dist/posts/supervenience.txt`, `dist/posts/reflection.txt`,
   `dist/posts/analogies.txt`, `dist/posts/compound_actions.txt`,
   `dist/posts/post_conf_notes.txt` — related design notes. Skim.
5. `README.md` (Architecture section) and the current engine under
   `src/typescript/` — in particular `demo_worlds/narrascope/` (the existing
   demo: consider/remember/reflect/facets, ~1,300 lines), `story/`,
   `gist/`, `parser.ts`, `puffer.ts`, `world.ts`, `supervenience.ts`,
   `UI/`. `node scripts/play.js "consider Sam" "begin reflection on ..."`
   plays the current demo headlessly; `npm test` runs the tests.
   You may play with it, but do not modify anything under `src/`.

## What "the full contents described by the doc" means (minimum bar)

The document has two halves. Both must be honored.

The first half lays out a five-step mechanic plus design principles:
  1. a parser game generates a history of action–consequence pairs ("events");
  2. events are game objects (nameable, e.g. "remember the getting of the guy");
  3. sequences of events are game objects (verbatim replay plus a summary that
     is not present in any single event);
  4. abstract narrative sequences (patterns like The Pillaging, The Voice of
     Fire) are game objects;
  5. puzzles are about mapping concrete event sequences onto abstract ones, and
     the consequences of doing so (mappings change disposition, belief,
     knowledge, available actions, and future mappings);
  plus: you can always change your mind; some puzzles require entertaining two
  mutually exclusive interpretations in turn; reflection/interpretation is the
  core puzzle, not cutscenes; and the UI must NOT be a linear terminal: the
  mapping must be visible side by side as it is built, with colors for the
  chunks of abstraction, expand/collapse of text.

The second half is a story that "could be read as a retelling from a segment
of the game": Katya's lesson on the Voice of Fire. The demo must contain ALL
of it, playable, not merely readable:
  - the 8 steps of the Voice of Fire, both as the chalkboard statements and in
    "standard notation" (imperative command / declarative consequence);
  - the campfire story, converted by the player to standard notation and
    mapped, nearly one-to-one, to the Voice of Fire;
  - the house-in-the-woods story, where the intentional voice switches from
    the family to the children, with visual notation for voice switches, and a
    mapping with genuine ambiguity (is the tinder the rag or the thatch?) and
    the moral-indifference exchange;
  - the forest-fire story, with no people and no intentions, teaching
    disembodied and abstract voices;
  - the wise man's story, where the literal solution uses only two lines, and
    then the second, figurative solution (wisdom = tinder, central followers =
    kindling, wider community = firewood, mythologizing = spark, distorted
    doctrine = ash), with the player's objections and Katya's "it fits on both
    levels";
  - and the footnotes are canon about intent: every phenomenon has one or more
    first-person perspectives that "imperatively command it into being", which
    is why the notation looks like a parser transcript; the player's own
    actions become subject to mapping later; wrong mapping attempts should
    nudge; "which voice fits this story" is a future puzzle type; players
    do not author their own voices.

Whether the illustrative green-room / The Pillaging examples from the first
half must also appear in the demo is an open question for debate. Argue it.

## Ground rules for every agent

- Quote the document when you make a claim about what it wants. Cite line
  numbers from `puzzle_lofty.md`.
- Distinguish clearly between (a) what the document demands, (b) what it
  implies, and (c) what you are adding. Additions are allowed ("optionally
  more") but never at the cost of (a).
- Be concrete. Sample transcripts, sample UI sketches in ASCII, sample data
  structures. Vague praise of "reflection" is worthless.
- Prefer designs that a single implementer can build in TypeScript in the
  browser in a few thousand lines and that a critic can play through end to
  end.
- Say what you would cut if you had to, and what you would never cut.
