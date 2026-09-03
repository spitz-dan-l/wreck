// Usage: node scripts/confusion_scan.js [--every N] [--out FILE]   (after `npm run compile`)
//
// Runs the confusion scan (demo_worlds/fire/scan.ts) over the initial world and
// every state of the acceptance script (docs/lofty_demo/round2/acceptance_script.json),
// applying every command the typeahead offers at each one, and writes the report.
// --every N scans one state in N (a quick look); the default scans them all.
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
require('tsconfig-paths').register({ baseUrl: path.join(ROOT, 'build'), paths: {} });
const { JSDOM } = require('jsdom');
const dom = new JSDOM();
globalThis.window = dom.window; globalThis.document = dom.window.document;
const { scan, report_markdown } = require('demo_worlds/fire/scan');

const args = process.argv.slice(2);
const value = flag => { const i = args.indexOf(flag); return i < 0 ? undefined : args[i + 1]; };
const every = Number(value('--every') ?? 1);
const out = value('--out') ?? path.join(ROOT, 'docs/lofty_demo/round5/confusion_scan.md');

const script = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs/lofty_demo/round2/acceptance_script.json'), 'utf8'));

const started = Date.now();
const report = scan({
    script,
    at: i => i % every === 0 || i === script.length,
    on_state: (i, total, options) => process.stderr.write(`\r${i}/${total} (${options} options)   `)
});
process.stderr.write('\n');

const seconds = Math.round((Date.now() - started) / 1000);
const text = report_markdown(report, 'The confusion scan') + `\nScanned in ${seconds} s.\n`;
fs.writeFileSync(out, text);
console.log(`${report.findings.length} findings in ${seconds} s → ${path.relative(ROOT, out)}`);
for (const kind of ['THROW', 'NO-OP', 'EMPTY', 'DEAD END', 'REPEAT', 'NOISE']) {
    console.log(`  ${kind}: ${report.findings.filter(f => f.kind === kind).length}`);
}
