# Core puzzle mechanics in Venience World

### First: A parser game generates a history

So the core puzzle mechanism I have in mind for Venience World is something that can only properly work in a game world that shares various properties of the "traditional" IF parser games. It leverages the idea that these games build up a "history" (or "narrative") of sequential action-consequence pairs.

E.g.

```
> examine room

The room is green. There is a guy in it.

> examine guy

The guy is blue. He seems like a weird guy.

> get guy

You take the guy.

> inventory

You are carrying:
  - the guy
```

In this (purposefully simple, contrived) example, the game history is a sequence of four action-consequence pairs. The first pair is the examination of the room, the second is the examination of the guy, the third is getting the guy, the fourth is checking your inventory.

It is important to mention that, while the overwhelming majority of traditional parser games are oriented around manipulating physical objects in a physical map of connected rooms, this need not be the case, and specifically *isn't* the case in Venience World. The important property here is that a history of action-consequence pairs be built up sequentially to "tell a story".

(I could get into what the orientation of Venience World will be in this regard, but it's a whole nother topic, and some of it might become apparent below anyways.)

So. A puzzle mechanic that uses the fact that playing the game implicitly generates a sequence of action-consequence pairs. To shorten my terminology, I'm gonna call an action-consequence pair an "event". (Could quibble about the word choice but w/e, not important.)

From here, there are couple additional steps to getting to the puzzle mechanic.

### Second: Events are game objects too.

That is, you can refer to them by name, and "do things with them" in the commands the player can enter.

As a concrete example, the player might be able to do:

```
> remember the getting of the guy

It went like this:

    > get guy

    You take the guy.

It felt a bit weird, because the guy was weird.
```

So above, "the getting of the guy" is the noun phrase naming the previous event in which the player got the guy. The action of remembering the event, in this case, caused the contents of the event to be printed out again verbatim, and also we get a description of how the player character remembers it feeling at the time.

(Skipping the digression about the problem of disambiguating multiple identically-named past events, or quibbling over better phrasings for referring to this event, because it's definitely a soluble problem and it's not the point here.)

So, we can now refer to events like we can any other "game object". What can we do with this to make puzzles?

There are a lot of possibilities but I have a specific intention for Venience World...

### Third: Sequences of events are game objects too.

That is, you can assemble a sequence of events, and treat it either as each event in the sequence, or as a single entity, the summary of all the events in the sequence. You can refer to the summary as a noun phrase.

I'm not going to show what it might look like to construct a sequence from scratch, but assume there's a way to do it (this is one of my UI design problems - I have an approach in mind but it's hard to describe or demonstrate through a single "mockup" – it's a flow). Now, you can refer to that sequence by name. So e.g.:

```
> remember my time spent in the green room

It went like this:

    > examine room

    The room is green. There is a guy in it.

    > examine guy

    The guy is blue. He seems like a weird guy.

    > get guy

    You take the guy.

    > inventory

    You are carrying:
      - the guy

It felt:
    - a bit educational, because you learned about the room
    - a bit weird, because the guy was weird
    - a bit lucrative, because you gained something
```

Ok, cool. We can refer to sequences of events, see them printed out verbatim, and we can also get information about the sequence as a whole, that isn't necessarily present in any of its constituent events.

Again, there's a lot of places you can go from here to get to puzzles, but still I have something very particular in mind...

### Fourth: Abstract narrative sequences are game objects too.

A popular example of an abstract narrative sequence is The Hero's Journey. It is a pattern which can be matched against many, arguably infinitely many, sequences of "raw narrative events".

For my purposes, The Hero's Journey is definitely too complicated, and too specific, to include in Venience World. Consider instead the following, freshly-constructed abstract narrative sequence, The Pillaging:

```
- Someone lives in their home.

- The Pillager enters their home.

- The Pillager takes things from their home.
```

The Pillaging is an abstract narrative sequence consisting of three events, and a number of abstract objects referred to by the events: Someone, their home, The Pillager, things taken.

Like The Hero's Journey, The Pillaging could map to infinitely many sequences of raw events.

The Pillaging is a sad story. A story of evil, oppression, victimization.

### Fifth (last): Puzzles are about mapping sequences of events to abstract narrative sequences, and the consequences of making those mappings.

A player might find that they can plausibly map a given concrete sequence of events to the abstract ones of The Pillaging. (They might find that they cannot; it depends on how the mapping mechanics work and what concrete events they have to work with. This is a good thing; challenging puzzles require degrees of freedom.)

Plausibly, one could find a mapping between My Time Spent In The Green Room, and The Pillaging. Nearly, but not quite, a one-to-one mapping, with the player character as the The Pillager. Whether the mapping should really hold depends on a lot of currently-unavailable context. But it's possible to entertain the idea that it's a good mapping. People are good at filling in those gaps, at considering a hypothetical scenario that would make the mapping work.

Sometimes people are prone to apply such a mapping prematurely, and have it alter how they're able to conceive of or interact with the thing they've mapped.

Sometimes, when a mapping is well-applied, many things seem to fall into place. New understanding is gained, about the subject of the mapping, but perhaps also about other things in the world.

Sometimes, a mapping *must be applied*, even if you aren't positive about it yet, because moving forward without it would be paralyzing, or intractable, or otherwise intolerable.

So, there are consequences to finding and applying these mappings. They will change the way your player character interprets their world – sometimes for the better, sometimes for the worse, sometimes neutrally – and these changes in disposition, belief and knowledge will have downstream consequences, on the actions they can take, and on future mappings they are able to find in things.

So, while the example is quite ham-fisted, I hope the point is made- the player can, using the affordances of the game, find themself to have been a Pillager, the blue guy a victim, the green room his home. That's a bit of a dramatic moment, and it ought to change how the player considers themself, the blue guy, and the green room, in any future attempts at mapping events containing those things to other narrative patterns.

### Some design principles

I intend to design Venience World so that you can *always* change your mind. You can misinterpret something initially, and get stuck until you realize you must need to change your mind about something to progress (and yes, I intend to introduce this concept to the player gently and gracefully early in the game, but that's for another day). To go a step further, I intend to make changing your mind *required* for some puzzles – you must entertain two apparently mutually exclusive interpretations in turn in order to progress.

I intend for Venience World to be about reflecting on things and interpreting them, and changing your mind and reinterpreting. I want the *core puzzles* in the game to be about doing this, rather than have all the reflection happen "statically" or in cutscenes or chunks of prewritten prose.

### Finally, forget everything you know about parser game UIs

The examples of hypothetical game output I've been using have a very close resemblance to traditional parser game output. It's linear, top-to-bottom, very terminal-like. Don't assume Venience World will look anything like that.

You know from my previous demo (https://venienceworld.com/dist/venience.html) that my engine has word-highlighting, autocomplete, animated text, expanding text from previous entries in the history, etc: 

There will be even further departures from the traditional stuff in order to get some of this stuff to work well in the game UI.

Mapping from events to narrative abstractions would never work in a strictly linear, top-down terminal UI. You need to be able to see the whole mapping as you build it up, how each concrete event maps to each abstract one. You need to see them side by side, possibly with colors to indicate the distinct chunks of narrative abstraction you're mapping each event to. You need to be able to expand and collapse chunks of text you don't care about at the moment.

I expect to get the UI for this completely wrong on my first try. But I believe doing it right is definitely possible. I think I have to prioritize generating the contents of the puzzles themselves over making the UI reasonable for now, though. I'm running very short on time until March 15, and I think actual puzzles need to take priority, if I'm to convince anyone this game is actually something new.



# A short story that could be read as a retelling from a segment of the game

You're sitting in a small classroom with Katya, your advisor. Today she is giving a lesson on what she calls the Voice of Fire.

"It's a pattern in abstract phenomenology," she explains. "We'll start with a basic example."

She starts by writing a series of statements on the chalkboard:

> The laying of the tinder
>
> The laying of the kindling over the tinder
>
> The stacking of the firewood over the kindling
>
> The sparking of the tinder, creating an ember
>
> The spreading of the ember to the kindling, creating a flame
>
> The spreading of the flame to the firewood, creating a blaze
>
> The consumption of all within the blaze
>
> The ash left behind

She rewrites this in the standard notation of the field:

```
> lay the tinder

A small patch of tinder is placed in the hearth.

> lay the kindling

A layer of kindling is added over the tinder.

> stack the firewood

Logs of firewood are stacked systematically over the kindling.

> spark the tinder

A single spark is added to the tinder. It catches and forms an ember.

> spread to the kindling

The ember glows, spreading to the kindling above. The kindling is acquired by a growing flame.

> spread to the firewood

The flame grows, and reaches the firewood, setting it alight. The blaze glows, feeding on the wooden fuel.

> burn

The blaze continues to spread through the logs, arranged perfectly to give themselves up to the burning. The hearth burns bright and hot, for a time.

> reduce to ash

As the wooden fuel is spent, the blaze dies down, gradually dwindling to nothing. A pile of black ash is left behind in the hearth.
```

"Now," she says. "Consider this story:"

> A group of friends takes a weekend trip to camp in the woods.
>
> As it darkens outside, they gather tinder, kindling and firewood.
>
> They dig a pit in the ground.
>
> They lay the tinder in the middle of the pit.
>
> They pile the kindling on over it.
>
> They stack the logs in layers over the kindling.
>
> One of them lights a match, and carefully touches its flame to the tinder.
>
> The fire starts, spreading first to the kindling and then the logs.
>
> The group begins to sing an old song together.
>
> The fire burns brightly for awhile, and the friends tend to it, adding more logs periodically, as they continue to sing and tell stories.
>
> As it grows late, they stop adding wood, and the flame dwindles. The friends retreat to their tents.
>
> The remaining embers fizzle out, leaving behind ash.

"Ah, I see that the story from the Voice of Fire is contained within this one," you say.

"Indeed, my dear. Trivially so. Show it now, on the board," she says.

She beckons you up. First you convert the story to the standard notation in a column on the left of the board:

```
> travel to the woods

You all make your way out of town, in cars piled full of food, tents and musical instruments.

You arrive at the campground in the woods.

> gather tinder, kindling and firewood

As it begins to grow dark, your group searches for and finds:
  - tinder
  - kindling
  - firewood

> dig a pit in the ground

You dig a pit, a foot deep and 3 feet in diameter.

> lay the tinder in the pit

You place a patch of fluffy tinder in the pit.

> pile the kindling over the tinder

You gently pile the thin, dry sticks of kindling over the tinder.

> stack the logs over the kindling

You stack several layers of logs, in square fashion, over the pile of kindling.

> light a match

The match head flickers into a tiny flame.

> touch the flame to the tinder.

The tinder burns quickly on contact with the flame.

The fire starts, spreading first to the kindling and then the logs.

> sing

You all begin to sing an old song together.

> add logs to the fire

The fire burns brightly for awhile, and your group tends to it, adding more logs periodically, as you continue to sing and tell stories.

> sing

As your group sings late into the night, you stop adding wood, and the flame dwindles.

> sleep in tents

Your group, growing weary, crawl into their tents to sleep.

The remaining embers fizzle out, leaving behind ash.
```

Next you draw a vertical line, creating a second column.

In the second column you list the successive steps of the Voice of Fire. For each step, you draw a line between the step on the right, and the part of the story on the left to which it corresponds.

"All set," you say. "Structurally nearly identical, as you said. Not quite a one-to-one mapping, but close."

"Indeed," she agrees. "Close enough for our purposes today. Now, consider another story, my dear..."


> A young family moves out of the city.
>
> After some travel, they find a clearing in the woods, away from everything and everyone they've ever known.
>
> They begin to cut the trees in the surrounding wood. They begin to dig into the ground in the clearing.
>
> They build a wooden foundation into the ground, and upon this structure a frame for the house that they will make.
>
> They toil for weeks, chopping and laying wood over the frame, building walls and a roof.
>
> Once ready, the young family moves into their new home.
>
> Time passes.
>
> One day, a small group of children happens upon the house while wandering through the woods.
>
> Egging each other on, one of the children lights an oil-soaked rag on the end of a stick. He hurls it onto the roof of the house. The children scatter frantically into the woods.
>
> The flame from the burning stick spreads to the thatch of the house's roof. Soon, the whole roof is ablaze.
>
> The fire spreads to roof's frame, and the roof falls in.
>
> The whole house burns to the ground, the family trapped within.
>
> A field of ash is all that remains the next morning.

"Well," you say, "That's quite a sad story."

"Indeed. Can you find the Voice of Fire within it?"

"Let's see..." you say. Once again, you approach the board, converting each line of the story to the standard notation. When you reach the point where the children fling the torch onto the roof, you pause. "What is the right thing to do here? The source of the intentional voice has changed. It's no longer from the family's perspective that things are happening. It's the children's."

"Indeed," says Katya. She shows you how to indicate voice switches using visual notation. [1]

You complete the translation of the story. Then, as before, you add a vertical line and a new column. You struggle a bit more to map the steps from the Voice of Fire to the steps of this story. It's less clear what part of the house is the tinder, or the kindling, or the firewood. Nevertheless, you find an acceptable mapping.

"Quite a bit different, this time," you mutter. "There's not a clear answer for what's tinder, or kindling, or firewood. Is the tinder the oil-soaked rag, or the thatch on the roof? And in this case, the so-called 'fireplace' wasn't purposefully built up to be burnt; it was a family's home. The burning was done by someone else."

"Quite right," says Katya. "But these details are not relevant from the perspective of the Voice of Fire, my dear. It knows only of the preparation of the fuel, and the burning of the fuel. It knows nothing of the purposes or intentions behind these actions. It simply proceeds. A pattern."

"And it seems to know nothing of the morality of the burning, either," you say.

"Indeed not," she says.

Katya continues the lesson with another story...

> A seed takes root in fertile ground.
>
> The season is right, and the weather is right, and a sapling rises forth.
>
> It grows, and time passes, and the weather is right, and it lives to become a tree.
>
> The tree sprouts leaves and seeds, and the season changes, and the seeds fall to the ground and the leaves protect them.
>
> Gradually, more trees sprout and grow and spread.
>
> Much time passes. The trees flourish, a forest.
>
> The weather becomes dry and hot, and the forest suffers. Many trees die and the ground is covered in dead brush.
>
> The weather happens to bring a thunderstorm. A lightning bolt strikes a dead tree, and it begins to burn.
>
> The flame spreads to the dead brush on the ground, and out to more trees.
>
> The fire burns in a rapidly-growing circle around the lightning strike.
>
> The forest is consumed in fire. Trees and brush are burnt to the ground.
>
> The flame stops at rivers and sand and rocks. The forest burns down to ash.

You repeat the exercise. There are no people in this story, no intentions at all. The forest is not a well-constructed fireplace at all, but the conditions of nature happened to conspire to burn it down[2]. Katya teaches you about disembodied and abstract voices in the standard notation.

"And now, the final story for today's lesson," says Katya...

> A boy is born to parents of no consequence.
>
> The boy is curious, charismatic, intelligent. He grows up and acquires wisdom.
>
> As a man, he seeks answers to old questions. Questions of purpose, consciousness, the dynamics of reality.
>
> The man gains a small circle of like-minded seekers who listen to him, astounded by his ideas.
>
> The man's followers grow in number. Word of his wisdom spreads, attracting more followers.
>
> The man begins to give speeches to more and more devoted followers. He begins to repeat himself. His words become ear-worms, ever more viral and convincing.
>
> Some of his followers begin to write down the wise man's teachings.
> 
>The man dies unexpectedly.
>
> His closest followers construct a great funeral pyre, and lay his body on it.
>
> The wise man's funeral is attended by multitudes of his followers.
>
> The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash.
>
> The most central followers continue to write the dead man's words, and in time they adjust his words, and embellish the stories about him, in the interest of reaching as many people as possible. His death becomes mythologized.
>
> Books spread across the land. The words that are distorted echoes of the wise man's ideas are read and repeated and reprinted.
>
> Time passes. The words are interpretted and reinterpretted until they hardly resemble the original ideas at all.

"That's an awful lot of extra story," you mutter, performing the exercise on the board again. "In fact, I think the entirety of the Voice of Fire's story is contained in just two lines from this sequence."

"Indeed. So, write it out," says Katya.

You do. Just

>His closest followers construct a great funeral pyre, and lay his body on it.

and

> The pyre is lit. The flame spreads from tinder to kindling to wood, and consumes the dead man's body. His followers weep and cry out and sing. Eventually, the flame is gone. The wise man's body is reduced to ash. 

participate in the mapping.

"Now, my dear, please find the second solution," says Katya.

"The second? What do you mean?"

"The figurative solution, my dear. The one without any literal mention of wood or flame," she says.

It takes you some time, but you gradually work it out. The construction of the fireplace is the replication of the man's wisdom within his mind (tinder), his initial and central followers (kindling), and the wider community of followers (firewood). The mythologizing of his death marks the spark, which yields ever increasing distortions to his ideology, which spread through his original community and beyond. At the end, his wisdom has become ash, spread far and wide across the adherents to the book.

"Katya, I have to say, it seems this second solution hardly fits the spirit of the Voice of Fire."

"Why so, my dear?"

"There's no fire, no wood, no burning directly involved. The structure of the fireplace is so abstract- the man's wisdom? His 'legitimate following'? And the timing doesn't seem to add up; the man dies, but then they turn him into a myth. So which event is the spark? His actual death? Or the mythological version of his death? And the so-called 'ash' at the end; while it may no longer resemble the original knowledge of the man, it is still highly structured; more structured than a pile of ash."

"These are all good questions, my dear. In time, we will answer them all. For now, recognize that the Voice of Fire fits on both levels."

"Ok, I guess," you mutter. But you don't really see it. [3]

[1]:
> faun  4:02 PM
>Why track the voice? What does it matter who sees when we can instead talk about what happened (Is that the point)
>I'd think the voice of fire probably cares a lot about which part is the kindling, if it cares about anything.
>
>bageldaughter  4:04 PM
>I think you're asking about the switch from the family's voice to the children's?
>
>faun  4:04 PM
>yes, why focus on that
>
>bageldaughter  4:08 PM
>It has to do with the way all events are conveyed in the "standard notation"- all phenomena have one or more first-person-perspectives associated with them which imperatively command them into being. That is why the "standard notation of the field" precisely resembles the "imperative command, declarative consequence" grammatical form of traditional parser games. It becomes important later, both game-mechanically, and narratively.
>
>4:09
>In order to properly convert a story to the notation, you need to switch to the right perspective in order to issue the right imperative commands from it
>
>4:10
>It means that, since everything that the player does is enacted through issuing commands in this way, their own actions will become subject to mapping and interpretation later in the game
>
>faun  4:11 PM
>hmm I see.. you're prepared for events that had multiple witnesses, none obviously more prominent than the others yes
>
>bageldaughter  4:11 PM
>yeah :slightly_smiling_face:
>
>faun  4:12 PM
>eric and andy saw A, then andy and hank saw B, who saw B, either name must be valid
>
>bageldaughter  4:12 PM
>Yes

[2]:
> faun  4:30 PM
> (is it true that natural forest fires start during rain)
>
> bageldaughter  4:30 PM
> Yeah, during thunderstorms
>
> 4:31
> I double checked that. I have to read more about it. My guess is the canopy initially protects the fire from the moisture

[3]:
> faun  5:14 PM
> It's quite beautiful. Seems like it will give people metaphysics. Eventually. I guess you'll have to bridge all the way to bayes. I've known people who do 'story thinking' and they can really just believe anything they want to believe.
> The mappings do seem too flexible for an automated, strictly testing system to support them.
>
> bageldaughter  5:15 PM
>Thanks!!
>
> 5:15
> And yeah, that bit is gonna be challenging design-wise
>
> 5:16
> Right now I'm expecting to have to use some manual fudge factors to get the matching to work in different contexts
>
> 5:17
> I intend for the player's wrong attempts at mapping to produce messages that nudge them in the right direction
>
> 5:19
> And yeah I've thought about how this system is limited. One puzzle type that isn't alluded to here is "which voice works for this story", which gets you a little towards critically assessing how good a given model is, picking between models, etc
>
> 5:20
> But I don't think I'm going to include the ability to create your own voices, and improve them over time, which would be the fully general, super-thinker ability
