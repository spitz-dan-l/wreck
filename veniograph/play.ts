// Play the example in a terminal:  node veniograph/play.ts
// Or feed it a script:             node veniograph/play.ts < commands.txt

import { createInterface } from 'node:readline';
import { makeGame } from './example.ts';

const game = makeGame();
const rl = createInterface({ input: process.stdin, output: process.stdout, prompt: '> ' });
const echo = !process.stdin.isTTY;

console.log(game.look());
console.log('(Type "help" for what you can do, "quit" to leave.)\n');
rl.prompt();

for await (const command of rl) {
    if (echo) {
        console.log(command);
    }
    if (command.trim() === 'quit') {
        break;
    }
    const output = game.run(command);
    if (output) {
        console.log(output + '\n');
    }
    rl.prompt();
}
rl.close();
