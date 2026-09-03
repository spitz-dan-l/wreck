# Design C: the lesson is a seduction, and the demo must let the player refuse it

*Lens: narrative-and-philosophy-first. All line numbers refer to `dist/posts/puzzle_lofty.md`. Throughout, (a) marks what the document demands, (b) what it implies, (c) what I am adding.*

## 0. Thesis

The Voice of Fire lesson is not a tutorial in a mapping tool. It is the story of a student being handed a power that "knows nothing of the purposes or intentions behind these actions" (387) and "nothing of the morality of the burning" (389), discovering how well it works, and then, at the moment it works *best*, on the man's wisdom rather than his body, refusing to see it (481). Every mechanic in the demo must serve that arc: competence, unease, vertigo, and a refusal that the game records as an event in the player's own transcript. A demo that reproduces the four stories with correct edges drawn between columns but lets the player feel nothing but "I found the answer" is mechanically faithful and spiritually hollow. This proposal is built to make that demo impossible to ship.

## 1. What the document's philosophy is

In one paragraph: **Understanding a thing is speaking its history in another voice.** Every phenomenon is a sequence of events, each "imperatively commanded into being" by some first-person perspective (495); a pattern like the Voice of Fire is itself such a perspective, "a pattern in abstract phenomenology" (162), a voice with no body that can be found speaking inside other histories. To interpret is to re-issue a history's commands from the pattern's perspective and see whether they fit. The fit is neither true nor false, and the pattern is indifferent to who acted, why, and whether it was good; it "simply proceeds" (387). But the fit has consequences *on the interpreter*: it "will change the way your player character interprets their world" (134), can be revised ("you can *always* change your mind", 140), and must sometimes be forced ("a mapping *must be applied*, even if you aren't positive", 132). The game is that act, performed live rather than "in cutscenes or chunks of prewritten prose" (142); and since the interpreter's own commands are in the same notation, "their own actions will become subject to mapping and interpretation later in the game" (501).

Weighing the candidates the brief lists:

- *Phenomenology as pattern-matching over first-person histories* is the **mechanism**: footnote 1 says the notation "precisely resembles the 'imperative command, declarative consequence' grammatical form" because "all phenomena have one or more first-person-perspectives ... which imperatively command them into being" (495). Note what that implies about the Voice of Fire: its notation is in the imperative (`> lay the tinder`, 185). Someone commands. The fire does. The scratch confirms the pattern is a voice with active and passive phases: the last steps "happen in succession with no actions from the voice of the fire, but they should correspond to narrative actions in the mapped voice" (`puzzle_scratch0.txt`, 12). That is why the campfire is "not quite one-to-one" (313): `sing`, `add logs`, `sing` supply human actions where the fire only proceeds.
- *The moral indifference of patterns* is the **emotional center**: the one exchange the author wrote twice (`puzzle_scratch3.txt`, 92–95; 385–391), and the scratch's commentary questions are all moral: "Is it bad? Is it intentional?" (`puzzle_scratch1.txt`, 24–31).
- *Interpretation has consequences and can be revised* is the **thesis of the first half** (128–140), enacted in the second by the two solutions.
- *The player's own actions are a text* is the **pivot to the full game** (501), and explains why the demo ends in resistance: the next thing to be mapped is the player.
- *The game is about reflecting, not doing* is the **form** (142), and why a classroom, where there is nothing to do but interpret, is the right demo.

The reading that holds all five: the lesson teaches a beautiful, cold instrument, and "But you don't really see it" (481) is not the lesson failing; it is the lesson's result. Faun, the author's own critic in footnote 3, says so from outside: people who do "story thinking" "can really just believe anything they want to believe" (527). The author does not rebut this; he promises "fudge factors" and "nudges" (537–540). The document knows the instrument is dangerous. The demo should know it too. The scratch supplies the line Katya never says in the final text, the demo's hidden motto: "If it is not necessarily purposeful, and not necessarily good or bad ... then why is it the Voice of Fire? ... Because, my dear, sometimes fire fits best." (`puzzle_scratch1.txt`, 31–33).

## 2. Katya, the player character, and the arc

Katya is neither villain nor sage; she is a teacher who is genuinely unbothered. "Indeed not" (391) is the coldest line in the document because it is so warm. She never argues; she asks for the next mapping. The narrascope demo confirms the register: "Take a hammer to your assumptions, my dear. If they are ill-founded, let them crumble." (`base_handlers.tsx`, 399). The player character is a devoted student who is *good* at this: they see the containment before being told (244), spot the voice switch unprompted (348), find the two-line solution unprompted (451). Their resistance is not incompetence. It is the first time the instrument turns on something they love: a wise man whose "closest followers ... write the dead man's words" (445). The narrascope notebook is "filled with the words of someone very wise, who you once knew" (`narrascope.tsx`, 130). The student is a central follower; the figurative solution maps onto them. That is what they don't want to see. (This is (b); the demo should not state it, only leave the notebook on the desk.)

The four stories escalate, and what the **player**, not the character, should feel at each:

1. **Campfire (218–315), trivial containment.** Competence and pleasure. The UI is learned; the one thought is the "not quite one-to-one" tail. Katya's "Trivially so" (246) sets a tone the player will miss later.
2. **House (318–391), ambiguity and the voice switch.** Unease turning into a small horror. The player pauses at the children (348), learns the notation, then finds the mapping works *too* easily: the home is fuel. They must commit to a tinder while unsure (132). Then the exchange; the player wants Katya to say more than "Indeed not," and she does not.
3. **Forest (395–419), no intentions.** Vertigo. There is no one to speak as; the player must lend the weather a voice. The instrument works with no subject at all, and the Voice of Fire is revealed as itself a bodiless voice, which is why it can be found anywhere.
4. **Wise man (423–481), the double solution.** Relief (only two lines burn), then dread when Katya asks for the second solution, then reluctant admiration as the figurative mapping locks, then the player's own objections, answered gently and left unresolved. The last available command is "Ok, I guess."

The resistance is earned because the player has, by then, done all four mappings with their own hands and felt each one work. It points forward because the last thing on the board is their own transcript.

## 3. What the player does, and where the freedom lives

Two acts: conversion to notation, and drawing lines. Honesty about rails:

**Conversion is not typing.** A story line is converted by choosing *who speaks* (a voice) and *which imperative* they issue (from a short menu of two to four verbs, in the engine's typeahead style); the declarative consequence is generated. This follows the heresies essay ("the author ... specifies the entire set of valid inputs ... explicitly") and footnote 1: "you need to switch to the right perspective in order to issue the right imperative commands from it" (498). The interpretive content of conversion is the voice.

- Story 1: **on rails**, one command, `convert the story`. The doc has the character do it silently and Katya call it trivial (246–248). Its job is to show the notation, not test it.
- Story 2: conversion **halts** at line 334; the player must `speak as the children` before any imperative is accepted. Then a real choice: lines 336–342 have no human actor. The burning can hang off the children's `scatter` as consequences (the doc's own device: the campfire's ash is a consequence of `sleep in tents`, 302–306) or the voice can return to the family (`> sleep` / "The roof above you is ablaze."). Both accepted; they colour the exchange differently. (c)
- Story 3: **every line needs a voice and there are no people.** Leaving the voice empty, reusing `the family`, or speaking as `the Voice of Fire` itself all nudge (§6). `the forest`, `the tree`, `the weather`, `the fire` are accepted. "Disembodied and abstract voices" (419) are taught by the player's failed attempts, not by a paragraph.
- Story 4: voices switch often (the boy, the man, the followers, the closest followers), unprompted.

**Mapping** is `map <step> to <line>`, or a click on a step then a line; the same command either way. Degrees of freedom, since "challenging puzzles require degrees of freedom" (124):

- Story 1: one valid mapping except at the tail (`burn` to `add logs`, `reduce to ash` to `sleep in tents`), and the three spreading steps all to `touch the flame to the tinder` (288). Many-to-one is legal; the doc does it.
- Story 2: tinder is the rag *or* the thatch (385); kindling and firewood are roof and frame, or roof and house. Consistent sets are accepted; Katya's consequence text differs. The player must apply one to proceed.
- Story 3: brush, dead trees, living trees; the bolt is the spark. Loose.
- Story 4, literal: exactly two lines (457, 461); anything outside them is nudged away. Figurative: the doc's mapping (471) is the spine, with one freedom: the spark may be `the man dies` or `his death becomes mythologized`, and Katya's answer to the timing objection depends on which (§6).

**Wrong attempts nudge** (540): a Katya line or the character's mutter, never "Invalid mapping" (§6).

**What is on rails, and why it is fine:** Katya's dialogue; she is the fixed point. The character's objections are *not* on rails: they are commands built from the mapping (`object that the spark is his death`), so the player composes each objection by pointing at the cell they distrust. "Ok, I guess" is the only exit; §4 argues that is the point.

## 4. Changing your mind, and holding two

The doc distinguishes changing your mind (140) from being *required* to entertain "two apparently mutually exclusive interpretations in turn" (140). Both need dramatizing.

**Change of mind.** An applied mapping is not a checkmark; it *recolours the story*, the doc's "alter how they're able to conceive of ... the thing they've mapped" (128). Applying the house mapping rewrites the left column in the fire's terms: "the home" becomes "the fuel"; the last consequence gains "all within the blaze" (178). `unmap` restores the words but leaves a residue, a dimmed strike-through of the fire's reading, using the engine's retroactive-text machinery. You can always change your mind; you cannot un-see. That is what changing your mind costs here, and it is cheap to build.

**Holding two.** The two solutions are mutually exclusive on the board: the spark cannot be both "The pyre is lit" and "His death becomes mythologized"; the ash cannot be both his body and his words. The first solution is boxed as *the first solution* and set aside; the second is drawn in a fresh column beside it, both visible and coloured, per "you need to be able to see the whole mapping as you build it up" (152). The nudges *change* between passes: in the literal pass, kindling mapped to "a small circle of like-minded seekers" gets "Wood, my dear. You are looking for wood."; in the figurative pass the same mapping locks. The rules of a fit are relative to the voice being lent. For the character, holding both means having seen a body burn and a wisdom burn on the same board in the same colours, with Katya's verdict that the difference is not the pattern's concern (479). They cannot unhold the second; they can only refuse to say they see it.

## 5. Seeding footnote 1

The smallest sufficient thing: **the player's own prompt is already in the standard notation, and the demo makes that visible at exactly one moment.** When Katya teaches voice-switch notation in story 2, the voice tag she introduces (a small-caps header and a colour band, like the doc's `The Family` header at 352) is *retroactively applied to every frame of the player's transcript so far*, tagged `You`. The narrascope engine already does retroactive edits to past frames (`inner_action.tsx`, 297–330). Nothing is said. The player notices, or does not, that their afternoon has the same shape as the campers' evening. The final beat says one sentence (see §8). Beyond that: the player's `notes` gain an entry, `The Voice of Fire`, alongside the actions Katya has taught, so that voices are acquired the way `scrutinize` and `hammer` are acquired in the current demo (`action.tsx`, 232–240). That is the extension hook: voices are inner actions applied to histories, and the first history to be interpreted with them, in the full game, is the player's.

## 6. Prose the document does not supply

All in the document's register: Katya's short declaratives, "my dear," the character's mutters, no exclamation marks.

**Katya teaches voice switches (at 350):**

> "Every line of the notation is spoken by someone, my dear. The one who says *pack* is the one who packs. That is all a voice is: the one who commands, and the one to whom the consequence is reported. When the one who speaks changes, we say so above the line, and we change the ink." She writes THE CHILDREN above the empty space, in a second colour. "We do not write why they speak. We do not write whether they should. We write who. Now issue their command."

**Katya teaches disembodied and abstract voices (at 419):**

> "Who lays the brush, my dear?"
> "No one. It fell."
> "The notation has no line for no one. Something must command the bolt, or the bolt cannot be written." She writes THE WEATHER above the line, in a colour you have not seen her use. "When nothing wants a thing, we lend it a voice anyway. The weather's. The forest's. A voice without a body and without a wish. It will not object to being spoken for; that is what makes it useful."
> "And the Voice of Fire?"
> "Is such a voice, my dear. It has no body at all. That is why it can be found speaking in every one of these stories, and why it will never once tell you what it wanted."

**Nudges (wrong attempts):**

1. Spark mapped before fuel is laid (any story): *"A spark before the fuel is laid, my dear? Fire is patient. It waits for the preparation. It will wait for you."*
2. `burn` mapped to `light a match` (story 1): *"The match is a small thing. Look for the hearth burning bright and hot, for a time."*
3. Issuing `light the rag` while still speaking as the family (story 2): *"You are still speaking as the family, my dear. Would the family light the rag? Change the voice, then command."*
4. `spread to the firewood` mapped above `spread to the kindling` (story 2): *"The Voice of Fire proceeds in order. It does not reach the frame before the thatch has caught."*
5. Voice left empty on the lightning line (story 3): *"The notation has no line for no one. Lend it a voice."* Voice given as `the Voice of Fire` for a story line (story 3): *"Not yet, my dear. The Voice of Fire is what we are looking for, not what we are writing. Write the story in its own voices first. Then we will see whether the fire speaks in it too."*
6. Kindling mapped to `gains a small circle of seekers` during the literal pass (story 4): *"Wood, my dear. You are looking for wood. There are only two lines in which anything burns. Find them; the rest will keep."*
7. Ash mapped to `reduced to ash` during the figurative pass (story 4): *"That is the first solution's ash. It is spoken for. Where does the wisdom end up?"*
8. Spark mapped to `the man dies` during the figurative pass: accepted, but with Katya's mark: *"His death. Very well. Hold that; we will return to it."* (This is a fudge factor, 537, made visible: the game accepts and remembers.)

**Consequence text when a mapping is applied** (the doc's "many things seem to fall into place", 130, and its opposite):

- Story 1: *You step back. The evening in the woods and the hearth on the board are the same shape. It is pleasant, the way a rhyme is pleasant.*
- Story 2: *You read the story again from the top. The house is fuel now; you cannot read it any other way. The family are within the blaze. The story has gone cool in your hands, and the pattern is warm.*
- Story 3: *The forest grew for a hundred years so that it could burn for a day. That is what the board says. The board is not wrong.*
- Story 4, literal: *Two lines, boxed. The rest of the man's life stands outside the box, unburnt. You are relieved, and you notice that you are relieved.*
- Story 4, figurative: *It locks. Wisdom, circle, community, myth, distortion, echo, ash. The whole man's life is in the box now, and nothing is outside it.*

**The second solution, in full** (465–481, with the player's commands):

```
"Now, my dear, please find the second solution," says Katya.

> ask what she means

"The second? What do you mean?"

"The figurative solution, my dear. The one without any literal
mention of wood or flame."

You look at the board. Two lines are boxed as THE FIRST SOLUTION.
Katya draws a third column beside them, and waits.

> set the first solution aside

The box stays on the board. The lines you drew from it go grey.
The Voice of Fire's eight steps stand empty again on the right.

> map the laying of the tinder to "he grows up and acquires wisdom"

Katya nods. The line is drawn in the first colour.

> map the laying of the kindling to "a small circle of like-minded seekers"

You expect her to say "wood." She does not.

> map the stacking of the firewood to "the man's followers grow in number"
> map the sparking of the tinder to "his death becomes mythologized"
> map the spreading to the kindling to "the most central followers adjust his words"
> map the spreading to the firewood to "books spread across the land"
> map the burning to "the words are read and repeated and reprinted"
> map the ash to "until they hardly resemble the original ideas at all"

It locks. Wisdom, circle, community, myth, distortion, echo, ash.
The whole man's life is in the box now, and nothing is outside it.

Katya says nothing. She looks at you.

> object that there is no fire in the second solution

"Katya, I have to say, it seems this second solution hardly fits
the spirit of the Voice of Fire. There's no fire, no wood, no
burning directly involved."

"Why so, my dear?"

> object that the fireplace is too abstract

"The structure of the fireplace is so abstract. The man's wisdom?
His 'legitimate following'?"

"Is a hearth less a hearth for being made of people?"

> object that the spark is his death, not his myth

"And the timing doesn't add up. The man dies, but then they turn
him into a myth. So which event is the spark? His actual death,
or the mythological version of his death?"

"It depends how you look at it, my dear. You looked at it one way
on the board. You may look at it the other. In either case the
pattern fits."

> object that the ash is still structured

"And the so-called ash at the end; while it may no longer resemble
the original knowledge of the man, it is still highly structured.
More structured than a pile of ash."

"These are all good questions, my dear. In time, we will answer
them all. For now, recognize that the Voice of Fire fits on both
levels."

> say that you see it            (dimmed; you cannot say it)
> say "Ok, I guess"

"Ok, I guess," you mutter.

But you don't really see it.
```

Two honesty notes. The .md has Katya answer all the objections at once (479); splitting her replies across the objections is (c), "Is a hearth less a hearth for being made of people?" is mine, and "It depends how you look at it" is the scratch's line (`puzzle_scratch3.txt`, 193), kept because it is the only place the author lets Katya concede that the spark is a matter of looking. The .md's own sentence still closes the exchange. The dimmed command is (c), and it is the one addition I would defend hardest. The engine already dims commands it will not accept (`action.tsx`, 206–211, `used`). Showing the player the sentence they cannot say is the entire lesson in one line of UI.

## 7. Framing: the classroom stands alone

The doc calls the story "a retelling from a segment of the game" (158), a segment; the narrascope demo is set after Katya has left ("After Katya left, you turned inward", `narrascope.tsx`, 299). Wrapping the lesson as a memory on the bus would subordinate it to Sam, dilute it with a second vocabulary (consider, scrutinize, hammer) the doc never mentions, and make the `[You]` seed of §5 ambiguous. The classroom is complete and present-tense (160). Stand alone. Reuse the *engine*, not the world: "my dear," `notes`, acquired abilities, retroactive reveal, coloured spans, typeahead, dimmed commands; its retroactive story edits and gist-labelled frames are the two things this demo most needs, and the two-column board is one new UI component over them. Leave one object on the desk for the full game to pick up: the notebook, which the player may `consider` and which says only "You write down what she says."

## 8. Beat-by-beat walkthrough

UI (the doc's mandate at 152; ASCII):

```
+------------------------------------------+---------------------------+
|  THE STORY (notation)                    |  THE VOICE OF FIRE        |
|  [The Family]                            |                           |
|  > pack                                  |  1 lay the tinder     ----+--> line 9
|    You gather what you need...   [v]     |  2 lay the kindling   ----+--> line 10
|  > travel                        [>]     |  3 stack the firewood ----+--> line 11
|  ...                                     |  4 spark the tinder   ----+--> line 12
|  [The Children]                          |  5 spread to kindling ----+--> line 13
|  > light the rag                         |  6 spread to firewood ----+--> line 13
|    An oil-soaked rag flares...           |  7 burn               ----+--> line 14
|  > hurl it onto the roof                 |  8 reduce to ash      ----+--> line 15
+------------------------------------------+---------------------------+
|  > map the sparking of the tinder to _                               |
+----------------------------------------------------------------------+
```

Each abstract step has a colour, which the mapped line takes as a left border; `[v]`/`[>]` expand and collapse consequences; voice headers are coloured margin bands. The player's prompt, below, acquires a `[You]` band in beat 2.

**Beat 0. The board.** `read the board`; Katya writes the eight statements (166–180), then "rewrites this in the standard notation of the field" (182): each statement becomes its imperative and consequence in place, animated. `ask about the notation` yields only "Imperative command, declarative consequence, my dear. Someone commands; the world reports."

**Beat 1. Campfire.** Katya reads the story (218–242). `say that the Voice of Fire is contained in this one` (244); "Indeed, my dear. Trivially so. Show it now, on the board." `convert the story` fills the left column at once (250–307) under one band, THE FRIENDS. Then eight `map` commands, nudges 1–2 waiting to be tripped:

```
> map the burning to "add logs to the fire"

The line is drawn. The fire burns brightly for a while, and the
group tends to it. The Voice of Fire does not sing; it burns while
they do.

> map the ash to "sleep in tents"

"All set," you say. "Structurally nearly identical, as you said.
Not quite a one-to-one mapping, but close."

"Indeed," she agrees. "Close enough for our purposes today."
```

Applying is automatic here; `apply the mapping` is explicit from story 2 on, when it has a cost.

**Beat 2. The house.** Story read (318–342). `say that it is a sad story`; "Indeed. Can you find the Voice of Fire within it?" `convert the story` runs through THE FAMILY and stops at line 334, prompt empty, band ended. `light the rag` gets nudge 3; `ask what the right thing to do is` (348) gets the voice-switch speech (§6). `speak as the children`; the band changes; at line 336 the player may `speak as the family` again. The `[You]` band appears on the player's own frames, silently. Mapping: the tinder is a real choice; nudge 4 waits. `apply the mapping` is required and the character is not sure (132). Consequence text (§6). Then the exchange, player-issued:

```
> object that the fireplace was a home

"Quite a bit different, this time," you mutter. "There's not a
clear answer for what's tinder, or kindling, or firewood. Is the
tinder the oil-soaked rag, or the thatch on the roof? And the
so-called 'fireplace' wasn't purposefully built up to be burnt;
it was a family's home. The burning was done by someone else."

"Quite right," says Katya. "But these details are not relevant
from the perspective of the Voice of Fire, my dear. It knows only
of the preparation of the fuel, and the burning of the fuel. It
knows nothing of the purposes or intentions behind these actions.
It simply proceeds. A pattern."

> say that it knows nothing of the morality of the burning

"Indeed not," she says.
```

**Beat 3. The forest.** Story read (395–417). `convert the story` produces nothing: no band, an empty prompt. The player must `speak as ...` before the first line; nudge 5 guards `no one` and `the Voice of Fire`; the disembodied-voice speech (§6) triggers on the lightning line. Mapping is loose. Consequence text. No exchange; the doc has none, and silence after "it will never once tell you what it wanted" is better than dialogue.

**Beat 4. The wise man.** Story read (423–449). Conversion with several voice switches, unassisted. `say that only two lines contain the Voice of Fire` (451); "Indeed. So, write it out." Literal mapping, nudge 6 guarding it, `apply`, consequence text. Then the second-solution transcript of §6 in full, ending on the dimmed command and "But you don't really see it."

**Beat 5 (c), the seed.** One paragraph, and the end:

```
Katya erases the four stories, one at a time. The eight steps of
the Voice of Fire she leaves. Beneath the board, in the notation,
in your own colour, is the afternoon: everything you said, and
everything that followed.

She does not map it. Neither do you. Not yet.

> write it down

You open your notebook and write: The Voice of Fire.
```

**Added beyond the doc:** the retroactive `[You]` band; the dimmed "say that you see it"; objections as commands over mapping cells; the accepted-and-remembered "his death" spark; the family/children choice for the house's last lines; the five consequence texts; the coda. **Never cut:** the eight steps in both forms; all four stories, every line; the voice switch as something the player must *do*; the rag/thatch choice; the forest's empty prompt; the two boxed solutions side by side; player-issued objections; "But you don't really see it." **Cut first if forced:** the family branch in story 2, then the choice of spark.

## 9. The green room and The Pillaging

Not as playable content. The doc calls the green room "purposefully simple, contrived" (28) and the Pillaging example "quite ham-fisted" (136); the second half is the author's own replacement for it (158). Building the green room spends the player's first minutes on a joke the author apologized for. The Pillaging is more tempting, since the house story is nearly one and "which voice works for this story" (543) would make a fine second puzzle; but the author says that puzzle type "isn't alluded to here" (543), and this is "today's lesson" (421) on one voice. A second voice turns *find the fire in this* into *pick a pattern*, the full game's next step. What the first half demands is honored elsewhere: events and sequences as objects with a summary not in any event (46–98) are the mapping cells and the coda's transcript; consequences of mapping (122–136) are the recoloured stories. One gesture allowed: `notes` lists `The Pillaging (last week)` above `The Voice of Fire (today)`, unmapped, so the player knows this is a school.

## 10. Data, briefly

```ts
type Voice = { name: string; kind: 'embodied' | 'disembodied' | 'abstract'; colour: string };
type Step  = { cmd: string; consequence: string; passive?: boolean };      // Voice of Fire: 8 steps
type Line  = { text: string; options: { voice: Voice; cmd: string; consequence: string }[] };
type Story = { title: string; lines: Line[]; conversion: (Voice | undefined)[]; chosen: number[] };
type Mapping = { step: number; line: number }[];
type Solution = { mapping: Mapping; name?: 'the first solution'; applied: boolean };
type Nudge = { when: (s: Story, m: Mapping, pass: 'literal'|'figurative') => boolean; text: string };
```

A few thousand lines: one new board component over the existing story tree and parser, whose dimming, typeahead, gist-labelled frames and retroactive updates are all reused. The engine's world is not.
