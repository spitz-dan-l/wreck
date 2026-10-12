# Veniograph scaffold

A small, dependency-free engine for trying out veniographs: objects that hold
a run of events (action–consequence pairs) from the game's history.

```
node veniograph/play.ts           # play the example world
node veniograph/play.ts < cmds    # run a script of commands
node --test veniograph/test.ts    # tests
```

Needs Node 22.18+ (runs TypeScript directly). Separate from the main engine in
`src/typescript`.

| File | What it is |
|---|---|
| `engine.ts` | The engine: places, actions, history, recording, properties, verbs |
| `example.ts` | A tiny world using every feature. Copy it to start your own |
| `play.ts` | Terminal player |
| `test.ts` | Tests, which also serve as usage examples |

## Places

```ts
const game = new Game({ start: 'green' });

game.addPlace('green', {
    description: ctx => ctx.get('took guy') ? 'An empty green room.' : 'A green room. A blue guy is here.',
    exits: { out: 'hall' },
    tags: ['indoors'],              // added to every event that happens here
});
```

## Actions

```ts
game.addAction({
    patterns: ['get|take guy', 'get|take blue guy'],
    at: 'green',                    // place id(s); omit for everywhere
    when: ctx => !ctx.get('took guy'),
    tags: ['took guy'],             // facts about the event, for properties
    run: ctx => {
        ctx.set('took guy');
        return 'You take the guy.';
    },
});
```

Patterns: `examine|x` matches either word; `{name}` binds any words;
`{v:veniograph}` binds the name of a carried veniograph; `{dir:exit}` binds an
exit. Articles and apostrophes are ignored. The first match wins, in this
order: veniograph verbs, then your other actions, then the built-ins.

Every handled command becomes an `Event`: `{ n, command, action, args, output, place, actor, tags }`.
Each event is tagged automatically with `at:<place>` and `did:<action id>`,
plus the place's tags, the action's `tags`, and anything added with
`ctx.tag(...)` in `run`. Use `record: false` for commands that shouldn't be
events, like `help`.

`ctx` gives you `get/set` (flags), `tag`, `look`, `move(placeId)`,
`carrying()`, `give(v)`, `takeAway(v)`, `replay(v)`, `v` (the veniograph in
play), and `game`.

## Recording

Players type `record` / `start recording`, then `stop recording [as <name>]`.
From code, use `game.startRecording()` and `game.stopRecording(name?)`. The
start and stop commands are not part of the veniograph. To control when
recording is allowed:

```ts
game.canRecord = ctx => ctx.get('has device') ? true : "You have nothing to record with.";
```

Veniographs the player finds instead of records:

```ts
ctx.give(ctx.game.makeVeniograph("the guy's morning", [
    { actor: 'the blue guy', place: 'green', command: 'sweep floor', output: 'He sweeps.', tags: ['at home'] },
]));
```

## Properties (computed from contents)

```ts
game.defineProperty('weird', v => v.has('met guy'), 'a bit weird, because the guy was weird');

game.defineProperty<string>('pace', {
    compute: v => v.length <= 4 ? 'steady' : 'long',
    describe: pace => pace === 'long' ? 'long, and a little blurred' : undefined,
});
```

The optional text or `describe` result appears under "It felt:" when the
player remembers the veniograph. Queries for writing rules: `v.has(tag)`,
`v.count(tag)`, `v.inOrder(...tags)`, `v.places()`, `v.actors()`,
`v.commands()`, `v.mentions(text)`, `v.length`, `v.recorded`, `v.events`, and
other properties via `v.is(id)` / `v.prop(id)`.

## Veniograph verbs

Verbs that exist only while the player carries a veniograph that meets
`requires` (a property id or a test):

```ts
game.addVeniographVerb({
    patterns: 'show {v:veniograph} to ferryman',
    at: 'dock',
    requires: 'kind',
    run: ctx => `He looks through ${ctx.v!.name} and nods.`,
});

game.addVeniographVerb({
    patterns: 'ponder weirdness',     // no slot: any carried weird veniograph enables it
    requires: v => v.is('weird'),
    run: ctx => `You turn ${ctx.v!.name} over.`,
});
```

If the pattern names a veniograph, that one must meet the requirement.
Otherwise the verb falls through to the next matching action, which is how
the ferryman can say no.

## Built-ins

`look`, `go <exit>` / `<exit>`, `inventory`, `remember <v>`, `record`,
`stop recording [as <name>]`, `rename <v> as <name>`, `help` (lists the
patterns available right now, veniograph verbs included). Any of them can be
overridden by adding an action with the same pattern.
