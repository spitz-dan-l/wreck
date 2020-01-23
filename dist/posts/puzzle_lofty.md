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

### First: Events are game objects too.

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

### Second: Sequences of events are game objects too.

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

### Third: Abstract narrative sequences are game objects too.

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

### Fourth (last): Puzzles are about mapping sequences of events to abstract narrative sequences, and the consequences of making those mappings.

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

You know from my (previous demo)[https://venienceworld.com/dist/venience.html] that my engine has word-highlighting, autocomplete, animated text, expanding text from previous entries in the history, etc: 

There will be even further departures from the traditional stuff in order to get some of this stuff to work well in the game UI.

Mapping from events to narrative abstractions would never work in a strictly linear, top-down terminal UI. You need to be able to see the whole mapping as you build it up, how each concrete event maps to each abstract one. You need to see them side by side, possibly with colors to indicate the distinct chunks of narrative abstraction you're mapping each event to. You need to be able to expand and collapse chunks of text you don't care about at the moment.

I expect to get the UI for this completely wrong on my first try. But I believe doing it right is definitely possible. I think I have to prioritize generating the contents of the puzzles themselves over making the UI reasonable for now, though. I'm running very short on time until March 15, and I think actual puzzles need to take priority, if I'm to convince anyone this game is actually something new.