// Usage: node scripts/search_stats.js [give_up_after]   (after `npm run compile`)
// Runs the narrascope future searches used by the tests and prints their stats and timing.
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
require('tsconfig-paths').register({ baseUrl: path.join(ROOT, 'build'), paths: {} });
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
globalThis.window = dom.window; globalThis.document = dom.window.document;
for (const m of ['log']) { console[m] = () => {}; }
const { new_venience_world } = require('demo_worlds/narrascope');
const { goals, space, command_filter } = require('demo_worlds/narrascope/supervenience_spec');
const { search_future } = require('supervenience');
const give_up_after = process.argv[2] ? parseInt(process.argv[2]) : undefined;
const { initial_result, thread_maker } = new_venience_world();
const variants = {
    'end goal only, dimensions': { goals: [goals[goals.length - 1]], space },
    'subgoals + dimensions': { goals, space },
    'subgoals + dimensions + command filter': { goals, space, command_filter },
};
for (const [name, spec] of Object.entries(variants)) {
    const t0 = Date.now();
    let out;
    try {
        const r = search_future({ simulator_id: 'playtester', thread_maker, give_up_after, ...spec }, initial_result.world);
        out = `${r.status} ${JSON.stringify(r.stats)}`;
    } catch (e) { out = 'ERROR ' + e.message; }
    process.stdout.write(`${name}: ${out} (${((Date.now() - t0) / 1000).toFixed(1)}s)\n`);
}
