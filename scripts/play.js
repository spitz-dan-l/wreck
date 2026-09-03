// Usage: [PLAY_FULL=1] node scripts/play.js "cmd1" "cmd2" ...   (after `npm run compile`)
// Applies commands to a fresh narrascope world, printing each frame's text and the commands available afterwards.
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
require('tsconfig-paths').register({ baseUrl: path.join(ROOT, 'build'), paths: {} });
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
globalThis.window = dom.window; globalThis.document = dom.window.document;
const { new_venience_world, venience_world_spec } = require('demo_worlds/narrascope');
const { raw, traverse_thread } = require('parser');
const { make_update_thread } = require('world');
const { to_basic_text, apply_story_updates_all, Updates: S } = require('story');

function frame_text(world, index) {
    const story = apply_story_updates_all(world.story, world.story_updates);
    const full = to_basic_text(story);
    return full;
}
function available(world) {
    const cmds = traverse_thread(make_update_thread(venience_world_spec, world));
    return Object.keys(cmds);
}
let { initial_result, update } = new_venience_world();
let result = initial_result;
const cmds = process.argv.slice(2);
let prev_past = '';
function show() {
    const story = apply_story_updates_all(result.world.story, result.world.story_updates);
    const frames = S.frame().query(story).map(([node]) => to_basic_text(node));
    const past = frames.slice(0, -1).join('\n');
    if (prev_past !== '' && !past.startsWith(prev_past)) {
        console.log('(earlier frames were changed retroactively)');
    }
    prev_past = past;
    console.log(frames[frames.length - 1].replace(/\n +/g, ' ').trimEnd());
}
show();
for (const cmd of cmds) {
    console.log(`\n### > ${cmd}`);
    const r = update(result.world, raw(cmd, true));
    if (r.world === result.world) { console.log('!!! command not accepted'); }
    result = r;
    show();
}
if (process.env.PLAY_FULL) {
    console.log('\n### full story:');
    console.log(to_basic_text(apply_story_updates_all(result.world.story, result.world.story_updates)).replace(/\n +/g, ' '));
}
console.log('\n### available commands:');
for (const c of available(result.world)) console.log('  ' + c);
