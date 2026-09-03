/*
    Every line of the lesson that is not a story or a step: Katya's and the
    player character's lines verbatim from the .md (QUOTED, keyed by line),
    and the prose SPEC §10 authors where the .md has none (AUTHORED).
*/

// Each value is a list of paragraphs. Every paragraph here appears verbatim in the document.
export const QUOTED = {
    l160: ["You're sitting in a small classroom with Katya, your advisor. Today she is giving a lesson on what she calls the Voice of Fire."],
    l162: [`"It's a pattern in abstract phenomenology," she explains. "We'll start with a basic example."`],
    l164: ['She starts by writing a series of statements on the chalkboard:'],
    l182: ['She rewrites this in the standard notation of the field:'],
    l218: ['"Now," she says. "Consider this story:"'],
    l244: ['"Ah, I see that the story from the Voice of Fire is contained within this one," you say.'],
    l246: ['"Indeed, my dear. Trivially so. Show it now, on the board," she says.'],
    l248: ['She beckons you up. First you convert the story to the standard notation in a column on the left of the board:'],
    l309: [
        'Next you draw a vertical line, creating a second column.',
        'In the second column you list the successive steps of the Voice of Fire. For each step, you draw a line between the step on the right, and the part of the story on the left to which it corresponds.'
    ],
    l313: ['"All set," you say. "Structurally nearly identical, as you said. Not quite a one-to-one mapping, but close."'],
    l315: ['"Indeed," she agrees. "Close enough for our purposes today. Now, consider another story, my dear..."'],
    l344: ['"Well," you say, "That\'s quite a sad story."'],
    l346: ['"Indeed. Can you find the Voice of Fire within it?"'],
    l348: [`"Let's see..." you say. Once again, you approach the board, converting each line of the story to the standard notation. When you reach the point where the children fling the torch onto the roof, you pause. "What is the right thing to do here? The source of the intentional voice has changed. It's no longer from the family's perspective that things are happening. It's the children's."`],
    l350: ['"Indeed," says Katya.'],
    l350b: ['She shows you how to indicate voice switches using visual notation.'],
    l383: ['You complete the translation of the story. Then, as before, you add a vertical line and a new column.'],
    l385: [`"Quite a bit different, this time," you mutter. "There's not a clear answer for what's tinder, or kindling, or firewood. Is the tinder the oil-soaked rag, or the thatch on the roof? And in this case, the so-called 'fireplace' wasn't purposefully built up to be burnt; it was a family's home. The burning was done by someone else."`],
    l387: ['"Quite right," says Katya. "But these details are not relevant from the perspective of the Voice of Fire, my dear. It knows only of the preparation of the fuel, and the burning of the fuel. It knows nothing of the purposes or intentions behind these actions. It simply proceeds. A pattern."'],
    l389: ['"And it seems to know nothing of the morality of the burning, either," you say.'],
    l391: ['"Indeed not," she says.'],
    l393: ['Katya continues the lesson with another story...'],
    l419: ['You repeat the exercise.'],
    l419b: ['Katya teaches you about disembodied and abstract voices in the standard notation.'],
    l421: ['"And now, the final story for today\'s lesson," says Katya...'],
    l451: [`"That's an awful lot of extra story," you mutter, performing the exercise on the board again. "In fact, I think the entirety of the Voice of Fire's story is contained in just two lines from this sequence."`],
    l453: ['"Indeed. So, write it out," says Katya.'],
    l467: ['"The second? What do you mean?"'],
    l469: ['"The figurative solution, my dear. The one without any literal mention of wood or flame," she says.'],
    l473: ['"Katya, I have to say, it seems this second solution hardly fits the spirit of the Voice of Fire."'],
    l475: ['"Why so, my dear?"'],
    l477_fire: ['"There\'s no fire, no wood, no burning directly involved."'],
    l477_abstract: ['"The structure of the fireplace is so abstract- the man\'s wisdom? His \'legitimate following\'?"'],
    l477_spark: ['"And the timing doesn\'t seem to add up; the man dies, but then they turn him into a myth. So which event is the spark? His actual death? Or the mythological version of his death?"'],
    l477_ash: ['"And the so-called \'ash\' at the end; while it may no longer resemble the original knowledge of the man, it is still highly structured; more structured than a pile of ash."'],
    l479: ['"These are all good questions, my dear. In time, we will answer them all. For now, recognize that the Voice of Fire fits on both levels."'],
    l481: ['"Ok, I guess," you mutter.', "But you don't really see it."]
};

export type QuotedKey = keyof typeof QUOTED;

// SPEC §10: the only prose Katya says that the .md does not give her.
export const AUTHORED = {
    shelf: ['The board is blank. On a shelf beside it are the rolled boards of past lessons; one is labelled The Pillaging.'],
    voice_switches: [
        '"Every line is spoken by someone, my dear. The one who says pack is the one who packs; the consequence is reported back to them and no one else. When the one who speaks changes, we say so above the line, and we change the ink."',
        'She draws a short bar across the column and writes THE CHILDREN beneath it, in a second colour.',
        '"We do not write why they speak. We write who. Now issue their command."'
    ],
    burning_lines: [
        '"There is no one left to speak, my dear. The children have run. Let these lines follow from what they did. We will find a voice for such things another day."'
    ],
    disembodied: [
        '"Who takes root, my dear? No one, you would say. The notation has no line for no one. Something must command the seed, or the seed cannot be written."',
        'She writes THE SEED above the line, in a colour you have not seen her use, with a broken bar.',
        '"When nothing wants a thing, we lend it a voice anyway. The seed\'s. The weather\'s. The fire\'s. A voice without a body and without a wish."'
    ],
    abstract: [
        '"The season is right, my dear. Time passes. Those are voices too, of a thinner kind. The season commands; time commands. They have no body and no place. Write them with a double bar."'
    ],
    coda: ['Beneath the board, in your own colour, is the afternoon: everything you said, and everything that followed.'],
    nothing_yet: ['It felt like nothing yet. It has not been read.'],
    went_like_this: ['It went like this:'],
    nothing_in_particular: ['It felt like nothing in particular.']
};
