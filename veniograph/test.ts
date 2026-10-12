// node --test veniograph/test.ts

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from './engine.ts';
import { makeGame } from './example.ts';

function play(game: Game, ...commands: string[]): string {
    return commands.map(c => game.run(c)).at(-1)!;
}

test('a recording holds the events between start and stop, not the commands themselves', () => {
    const game = makeGame();
    play(game, 'look', 'record', 'examine room', 'x guy', 'stop recording as the green room');
    const v = game.findCarried('green room')!;
    assert.equal(v.name, 'the green room');
    assert.deepEqual(v.commands(), ['examine room', 'x guy']);
    assert.equal(game.history.length, 5);
});

test('recording and stopping can be driven from code', () => {
    const game = makeGame();
    game.startRecording();
    play(game, 'examine room');
    const v = game.stopRecording()!;
    assert.equal(v.name, 'veniograph 1');
    assert.deepEqual(v.commands(), ['examine room']);
});

test('recording nothing makes no veniograph', () => {
    const game = makeGame();
    assert.match(play(game, 'record', 'stop'), /nothing to keep/);
    assert.equal(game.carried.length, 0);
});

test('properties are computed from contents, and describe how it felt', () => {
    const game = makeGame();
    play(game, 'record', 'examine room', 'examine guy', 'help guy', 'stop recording as kindness');
    const v = game.findCarried('kindness')!;
    assert.equal(v.is('weird'), true);
    assert.equal(v.is('kind'), true);
    assert.equal(v.is('attentive'), true);
    assert.equal(v.prop('pace'), 'steady');
    assert.match(play(game, 'remember kindness'), /It felt:\n {4}- a bit weird.*\n {4}- warm/);
});

test('a veniograph verb exists only while carrying a veniograph that meets it', () => {
    const game = makeGame();
    assert.equal(play(game, 'ponder weirdness'), game.unknown);
    assert.ok(!game.available().includes('ponder weirdness'));
    play(game, 'record', 'examine guy', 'stop');
    assert.ok(game.available().includes('ponder weirdness'));
    assert.match(play(game, 'ponder weirdness'), /Was the guy weird/);
});

test('a named veniograph must itself meet the verb, else a plainer action takes over', () => {
    const game = makeGame();
    play(game, 'record', 'take guy', 'stop recording as theft');
    play(game, 'out', 'south');
    assert.match(play(game, 'show theft to ferryman'), /shakes his head/);
    assert.equal(game.location, 'dock');
});

test('a kind veniograph gets you across', () => {
    const game = makeGame();
    play(game, 'record', 'help guy', 'stop recording as kindness', 'out', 'south');
    assert.match(play(game, 'show kindness to ferryman'), /nods/);
    assert.equal(game.location, 'far shore');
    assert.equal(play(game, 'record'), 'Nothing here will hold still.');
});

test('a found veniograph holds events you never saw, and enables verbs', () => {
    const game = makeGame();
    play(game, 'take guy', 'out', 'listen at door');
    const v = game.findCarried("guy's morning")!;
    assert.deepEqual(v.actors(), ['the blue guy']);
    assert.equal(v.recorded, false);
    assert.equal(v.is('homely'), true);
    play(game, 'in');
    assert.match(play(game, 'put guy back'), /picks up his broom/);
    assert.match(game.look(), /A blue guy is here/);
    assert.ok(game.history.at(-1)!.tags.includes('returned guy'));
});

test('doing a veniograph again replays its commands here, with new consequences', () => {
    const game = makeGame();
    play(game, 'record', 'examine room', 'take guy', 'stop recording as theft');
    const out = play(game, 'do theft again');
    assert.match(out, /> examine room\nThe room is green/);
    assert.match(out, /> take guy\nYou can't do that here/);
    assert.ok(game.history.at(-1)!.tags.includes('saw room'));
});

test('help is not an event', () => {
    const game = makeGame();
    play(game, 'help');
    assert.equal(game.history.length, 0);
});
