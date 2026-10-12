// A tiny example world: the green room, the blue guy, and a ferryman who will
// only take you across if you can show him something kind you did.

import { Game, type Context } from './engine.ts';

export function makeGame(): Game {
    const game = new Game({ start: 'green' });

    // --- Places --------------------------------------------------------------

    game.addPlace('green', {
        description: ctx => ctx.get('took guy')
            ? 'A green room. It feels emptier than it should.'
            : 'A green room. A blue guy is here.',
        exits: { out: 'hall' },
    });

    game.addPlace('hall', {
        description: 'A narrow hall. Through the door to the green room you can hear humming.',
        exits: { in: 'green', south: 'dock' },
    });

    game.addPlace('dock', {
        description: 'A dock on a slow river. A ferryman leans on his pole.',
        exits: { north: 'hall' },
    });

    game.addPlace('far shore', {
        description: 'The far shore. Nothing here yet but the idea of a story.',
    });

    // --- Actions -------------------------------------------------------------

    const guyHere = (ctx: Context) => !ctx.get('took guy');

    game.addAction({
        patterns: 'examine|x room',
        at: 'green',
        tags: ['saw room'],
        run: () => 'The room is green. There is a guy in it.',
    });

    game.addAction({
        patterns: ['examine|x guy', 'examine|x blue guy'],
        at: 'green',
        when: guyHere,
        tags: ['met guy'],
        run: () => 'The guy is blue. He seems like a weird guy.',
    });

    game.addAction({
        patterns: ['help guy', 'help him'],
        at: 'green',
        when: guyHere,
        tags: ['helped guy'],
        run: () => 'You help him straighten the rug. He hums, pleased.',
    });

    game.addAction({
        patterns: ['get|take guy', 'get|take blue guy'],
        at: 'green',
        when: guyHere,
        tags: ['took guy'],
        run: ctx => {
            ctx.set('took guy');
            return 'You take the guy.';
        },
    });

    // Finding a veniograph you didn't record: events you never saw.
    game.addAction({
        patterns: 'listen at door',
        at: 'hall',
        when: ctx => !ctx.get('heard humming'),
        run: ctx => {
            ctx.set('heard humming');
            ctx.give(ctx.game.makeVeniograph("the guy's morning", [
                { actor: 'the blue guy', place: 'green', command: 'sweep floor',
                  output: 'He sweeps the green floor.', tags: ['at home'] },
                { actor: 'the blue guy', place: 'green', command: 'hum',
                  output: 'He hums the same four notes, over and over.', tags: ['at home'] },
            ]));
            return "You listen. Somehow you come away carrying the guy's morning.";
        },
    });

    game.addAction({
        patterns: ['talk to ferryman', 'ask ferryman'],
        at: 'dock',
        run: () => '"Show me something kind you did," he says, "and I\'ll take you across."',
    });

    // The fallback for showing him something that isn't kind. The veniograph
    // verb below, which only accepts kind ones, is tried before this.
    game.addAction({
        patterns: 'show {v:veniograph} to ferryman',
        at: 'dock',
        run: ctx => `He looks through ${ctx.v!.name} and shakes his head.`,
    });

    // --- Veniograph properties -----------------------------------------------

    game.defineProperty('weird', v => v.has('met guy'),
        'a bit weird, because the guy was weird');
    game.defineProperty('lucrative', v => v.has('took guy'),
        'a bit lucrative, because you gained something');
    game.defineProperty('kind', v => v.has('helped guy') && !v.has('took guy'),
        'warm, because you helped');
    game.defineProperty('homely', v => v.has('at home') && v.actors().includes('the blue guy'),
        'homely, because someone lives there');
    game.defineProperty('attentive', v => v.inOrder('saw room', 'met guy'));

    // A non-boolean property, with its own description.
    game.defineProperty<string>('pace', {
        compute: v => v.length <= 1 ? 'brief' : v.length <= 4 ? 'steady' : 'long',
        describe: pace => pace === 'long' ? 'long, and a little blurred' : undefined,
    });

    // --- Veniograph verbs ----------------------------------------------------

    game.addVeniographVerb({
        patterns: 'show {v:veniograph} to ferryman',
        at: 'dock',
        requires: 'kind',
        run: ctx => `He looks through ${ctx.v!.name} and nods.\n\n` + ctx.move('far shore'),
    });

    game.addVeniographVerb({
        patterns: 'ponder weirdness',
        requires: 'weird',
        run: ctx => `You turn ${ctx.v!.name} over. Was the guy weird, or were you?`,
    });

    game.addVeniographVerb({
        patterns: 'put guy back',
        at: 'green',
        requires: 'homely',
        when: ctx => Boolean(ctx.get('took guy')),
        tags: ['returned guy', 'helped guy'],
        run: ctx => {
            ctx.set('took guy', false);
            return 'Remembering him at home, you put the guy back. He picks up his broom.';
        },
    });

    // Any veniograph of your own can be done again, wherever you are.
    game.addVeniographVerb({
        patterns: 'do {v:veniograph} again',
        requires: v => v.recorded,
        run: ctx => ctx.replay(ctx.v!),
    });

    // Recording could depend on the world (a device you have to find, etc).
    game.canRecord = ctx => ctx.place === 'far shore' ? 'Nothing here will hold still.' : true;

    return game;
}
