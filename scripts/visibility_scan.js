// The visibility scan: what a person sees after every command, checked.
//
//   npm run build-dev:fire
//   node scripts/visibility_scan.js [--device desktop|phone|both] [--out docs/lofty_demo/round6] [--sample N] [--no-deviations] [--limit N]
//   node scripts/visibility_scan.js --from-json OUT/scan_desktop.json --from-json OUT/scan_phone.json   (the report only)
//
// Drives dist/fire.html through the whole acceptance script on the desktop and
// on the phone (scripts/browse_fire.js is the driver), and at several mapping
// states (after `draw a vertical line`, with three steps placed, after `apply`,
// on the campfire, the house and the wise man) also plays the display
// deviations — `collapse the steps` / `expand the steps`, the story, the
// unmapped rows, `remember the campfire story`, a chip's expand/collapse, `set
// aside` / `resume`, `erase` — taking each back with Undo. After every command
// it asserts:
//
//   (a) the prompt is in view once the page has settled;
//   (b) the changed nodes are in view, or the topmost change is in view with
//       the prompt, or (when they cannot fit) the topmost change is in view and
//       the prompt is one scroll below; a long response at the prompt (a board
//       opened, a reprint) may stand in for a change far above it, and when
//       the topmost change is too far for even the prompt's line to stay in
//       view with it, the prompt wins;
//   (c) an expand/collapse changed the height of something inside the viewport;
//   (d) the scroll did not overshoot the topmost change (its top above the view);
//   (e) no mid-animation sample had the prompt off-screen while it settled
//       on-screen somewhere very different (a jump).
//
// Screenshots of every command go to browse/scan/<device>/ (not committed);
// those of the failures are copied under OUT/shots/<device>/, and the findings
// are written to OUT/visibility_scan.md. --sample N records one acceptance
// command in N (the rest are played without screenshots); --limit N stops the
// script after N commands (for a quick run).
const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const driver = require('./browse_fire');

const SCRIPT = JSON.parse(fs.readFileSync(driver.ACCEPTANCE, 'utf8'));

// The deviation states: after this many commands of the script (1-based count).
function states(script) {
    const draws = [];
    script.forEach((c, i) => { if (c === 'draw a vertical line') { draws.push(i); } });
    const named = ['campfire', 'house', 'forest', 'wise man'];
    const out = [];
    draws.forEach((d, n) => {
        if (n === 2) { return; } // the forest is not in the brief
        let maps = 0, third = -1, apply = -1;
        for (let i = d + 1; i < script.length; i++) {
            if (script[i].startsWith('map ') && third < 0) { maps++; if (maps === 3) { third = i; } }
            if (script[i] === 'apply the Voice of Fire') { apply = i; break; }
        }
        out.push({ after: d + 1, name: `${named[n]}: after draw a vertical line` });
        out.push({ after: third + 1, name: `${named[n]}: three steps placed` });
        out.push({ after: apply + 1, name: `${named[n]}: after apply` });
    });
    return out;
}

const DEVIATIONS = [
    ['collapse the steps', 'expand the steps'],
    ['collapse the story', 'expand the story'],
    ['collapse the unmapped', 'expand the unmapped'],
    ['remember the campfire story'],
    ['expand the campfire story', 'collapse the campfire story'],
    ['set aside the mapping', 'resume the mapping'],
    ['erase the laying of the tinder']
];

const FOLD = /^(expand|collapse) /;

function check(result) {
    const a = result.after;
    const H = a.viewport;
    // The changes a person could see, outside the prompt; a class change with no visible effect is not one,
    // and the command's own echo under the pinned prompt is the known cost of showing a change far above.
    const own_echo = c => c.where.startsWith('UNDER') && /^div\.frame/.test(c.description) && c.description.includes('"> ' + result.cmd.slice(0, 24));
    // A class change on a container taller than half the view (a board folding its rows) is not a place: its rows are.
    const container = c => !c.kinds.includes('added') && c.height_after > H / 2;
    const outside = a.changes.filter(c => !c.in_hole && c.where !== 'HIDDEN' && c.visible && !own_echo(c) && !container(c));
    const topmost = outside[0];
    const prompt_in = a.prompt.where === 'IN VIEW';
    // In view by its own box (a folded row: by the place it had), its top inside the view.
    const shown = c => (c.where === 'IN VIEW' && (c.rect === null || c.rect.top >= -8)) || c.where === 'FOLDED IN VIEW';
    const all_in = outside.every(shown);
    const top_in = topmost !== undefined && shown(topmost);
    // When the response at the prompt is long (a board opened, a reprint), it is what the person asked for:
    // the topmost new node in view with the prompt will do, a fold far above being secondary.
    // A board reopening around the prompt (a chip losing `chip`) is the response as much as a reprint is.
    const topmost_added = outside.find(c => (c.kinds.includes('added') || (c.class_diff || '').includes('-chip')) && c.height_after > 9 * 12);
    const long_response = topmost_added !== undefined;
    const prompt_one_scroll = a.prompt.where === 'BELOW VIEW' && a.prompt.px <= H;
    const checks = {};
    checks.a = { ok: prompt_in, detail: prompt_in ? '' : `prompt ${a.prompt.where}${a.prompt.px ? ' by ' + a.prompt.px + ' px' : ''}` };
    // When the topmost change is too far above for even the prompt's line to stay in view with it, the prompt and the nearest of the changes.
    const cannot_fit = topmost !== undefined && (topmost.where === 'ABOVE VIEW' || topmost.where === 'FOLDED ABOVE VIEW') && a.prompt.rect !== null && topmost.px + a.prompt.rect.top > H - 40;
    const b_ok = outside.length === 0 || all_in || (top_in && (prompt_in || prompt_one_scroll)) || (long_response && shown(topmost_added) && prompt_in)
        || (cannot_fit && prompt_in);
    checks.b = { ok: b_ok, detail: b_ok ? '' : (topmost ? `topmost change ${topmost.where}${topmost.px ? ' by ' + topmost.px + ' px' : ''}: ${topmost.description}` : '') };
    if (FOLD.test(result.cmd)) {
        const moved = [...a.changes.filter(c => !c.in_hole), ...a.regions].filter(x => x.height_before !== null && x.height_before !== x.height_after);
        const seen = moved.some(x => x.where === 'IN VIEW');
        checks.c = { ok: moved.length > 0 && seen, detail: moved.length === 0 ? 'no height changed' : seen ? '' : `the region that changed height is ${moved[0].where}` };
    }
    const m = driver.motion(result);
    const overshoot = topmost !== undefined && topmost.rect !== null && m.net > 0 && topmost.rect.top < -8 && !(long_response && shown(topmost_added)) && !cannot_fit;
    checks.d = { ok: !overshoot, detail: overshoot ? `scrolled ${topmost.rect.top} px past the topmost change` : '' };
    const samples = a.samples;
    const final = samples[samples.length - 1];
    const final_on = final && final.prompt_top !== null && final.prompt_top >= 0 && final.prompt_bottom <= H;
    let jump = null;
    if (final_on) {
        for (const s of samples.slice(0, -1)) {
            if (s.prompt_top === null) { continue; }
            const off = s.prompt_bottom < 0 || s.prompt_top > H;
            if (off && Math.abs(s.prompt_top - final.prompt_top) > H / 2) { jump = s; break; }
        }
    }
    checks.e = { ok: jump === null, detail: jump ? `at ${jump.t} ms the prompt was at ${jump.prompt_top} px, settled at ${final.prompt_top} px` : '' };
    const failed = Object.entries(checks).filter(([, c]) => !c.ok).map(([k]) => k);
    // How far the person is from what they need to see: the prompt and the topmost change.
    const severity = (prompt_in ? 0 : a.prompt.px) + (topmost && topmost.where !== 'IN VIEW' ? topmost.px : 0) + (checks.c && !checks.c.ok ? 400 : 0);
    return { checks, failed, severity, warnings: driver.warnings(result), motion: m };
}

async function scan_device(device, opts) {
    const phone = device === 'phone';
    const shots = path.join(ROOT, 'browse', 'scan', device);
    fs.mkdirSync(shots, { recursive: true });
    const session = await driver.open({ phone });
    const rows = [];
    const started = Date.now();
    const limit = Math.min(opts.limit, SCRIPT.length);
    const at = new Map(states(SCRIPT).map(s => [s.after, s.name]));
    const record = (name) => ({ dir: shots, name });
    try {
        for (let i = 0; i < limit; i++) {
            const cmd = SCRIPT[i];
            const n = i + 1;
            const recorded = n % opts.sample === 0 || at.has(n) || n <= 6 || n === limit;
            const name = `a${String(n).padStart(3, '0')}`;
            const result = await driver.play(session, cmd, recorded ? record(name) : undefined);
            if (!result.entered.accepted) { throw new Error(`Command ${n} "${cmd}" was not accepted on the ${device}.`); }
            if (recorded) {
                rows.push({ kind: 'script', n, state: `after ${n}`, cmd, result, verdict: check(result), shot: path.join(shots, name + '.png'), mid: path.join(shots, name + 'a.png') });
            }
            if (opts.progress) { opts.progress(`${device} ${n}/${limit} ${cmd.slice(0, 40)}`); }
            if (at.has(n) && opts.deviations) {
                const state = at.get(n);
                for (let j = 0; j < DEVIATIONS.length; j++) {
                    const seq = DEVIATIONS[j];
                    // opts.deviations may be a predicate over a sequence (the sampled test plays two).
                    if (typeof opts.deviations === 'function' && !opts.deviations(seq)) { continue; }
                    let taken = 0;
                    for (let k = 0; k < seq.length; k++) {
                        const dname = `d${String(n).padStart(3, '0')}_${j}${k}_${seq[k].replace(/[^a-z]+/gi, '_').slice(0, 24)}`;
                        const r = await driver.play(session, seq[k], record(dname));
                        if (!r.entered.accepted) {
                            rows.push({ kind: 'deviation', n, state, cmd: seq[k], result: r, verdict: null, shot: null, offered: false });
                            break;
                        }
                        taken++;
                        rows.push({ kind: 'deviation', n, state, cmd: seq[k], result: r, verdict: check(r), shot: path.join(shots, dname + '.png'), mid: path.join(shots, dname + 'a.png'), offered: true });
                        if (opts.progress) { opts.progress(`${device} ${n}/${limit} deviation: ${seq[k]}`); }
                    }
                    for (let k = 0; k < taken; k++) { await driver.undo(session); }
                }
            }
        }
    } finally {
        await session.close();
    }
    return { device, rows, seconds: Math.round((Date.now() - started) / 1000), errors: session.errors };
}

const LETTERS = { a: 'prompt in view', b: 'change in view', c: 'fold visible', d: 'no overshoot', e: 'no jump' };

function summarize(runs) {
    const out = [];
    for (const run of runs) {
        const checked = run.rows.filter(r => r.verdict !== null);
        const failing = checked.filter(r => r.verdict.failed.length > 0);
        const counts = {};
        for (const r of checked) { for (const k of r.verdict.failed) { counts[k] = (counts[k] || 0) + 1; } }
        const not_offered = run.rows.filter(r => r.kind === 'deviation' && r.offered === false);
        out.push({ device: run.device, checked: checked.length, failing: failing.length, counts, not_offered: not_offered.length, seconds: run.seconds, rows: failing, errors: run.errors });
    }
    return out;
}

function markdown(runs, opts) {
    const lines = [];
    lines.push('# The visibility scan');
    lines.push('');
    lines.push('What a person sees after each command, measured in the browser (`scripts/visibility_scan.js`, driver `scripts/browse_fire.js`). Every command of the acceptance script, and the display deviations at the mapping states, on the desktop (1280x800) and the phone (iPhone 16 Pro, 402x874). The checks:');
    lines.push('');
    lines.push('- **(a)** the prompt is in view once the page has settled;');
    lines.push('- **(b)** the changed nodes are in view, or the topmost change is in view with the prompt, or (when they cannot fit) the topmost change is in view and the prompt is one scroll below;');
    lines.push('- **(c)** an expand/collapse changed the height of something inside the viewport;');
    lines.push('- **(d)** the scroll did not overshoot the topmost change;');
    lines.push('- **(e)** no mid-animation sample had the prompt off-screen while it settled on-screen somewhere very different.');
    lines.push('');
    lines.push('"In view" counts what is painted: a change under the pinned steps panel is not in view. A class change with no visible effect (a bookkeeping class) is not a change; a class change on a container taller than half the view (a board folding its rows) is not a place, its rows are, and a folded row counts at the place it had; when the response at the prompt is long (a board opened, a reprint) it may stand in for a fold far above it; and when the topmost change is too far above for even the prompt\'s line to stay in view with it, the prompt wins (and (d) does not apply). A command\'s own echo line under the pinned prompt is the known cost of showing a change far above it. Screenshots are the viewport after settling (`…a.png` is ~150 ms after submit); those listed here are copied under `shots/`, the rest are regenerated into `browse/scan/` by the scan.');
    lines.push('');
    const sums = summarize(runs);
    lines.push('## Totals');
    lines.push('');
    lines.push('| device | commands checked | failing | ' + Object.entries(LETTERS).map(([k, v]) => `(${k}) ${v}`).join(' | ') + ' | deviations not offered | time |');
    lines.push('|---|---|---|' + Object.keys(LETTERS).map(() => '---').join('|') + '|---|---|');
    for (const s of sums) {
        lines.push(`| ${s.device} | ${s.checked} | ${s.failing} | ${Object.keys(LETTERS).map(k => s.counts[k] || 0).join(' | ')} | ${s.not_offered} | ${s.seconds} s |`);
    }
    lines.push('');
    for (const s of sums) {
        lines.push(`## ${s.device}: the worst`);
        lines.push('');
        const worst = [...s.rows].sort((x, y) => y.verdict.severity - x.verdict.severity).slice(0, 3);
        for (const r of worst) { lines.push(row_md(r, opts)); }
        lines.push('');
        lines.push(`## ${s.device}: every failure`);
        lines.push('');
        for (const r of s.rows) { lines.push(row_md(r, opts)); }
        lines.push('');
        const skipped = runs.find(x => x.device === s.device).rows.filter(r => r.kind === 'deviation' && r.offered === false);
        if (skipped.length) {
            lines.push(`Deviations not offered at their state (not played): ${skipped.map(r => `\`${r.cmd}\` (${r.state})`).join(', ')}.`);
            lines.push('');
        }
        if (s.errors.length) { lines.push('Page errors: ' + s.errors.join('; ')); lines.push(''); }
    }
    return lines.join('\n') + '\n';
}

function row_md(r, opts) {
    const v = r.verdict;
    const a = r.result.after;
    const failed = v.failed.map(k => `(${k}) ${v.checks[k].detail || LETTERS[k]}`).join('; ');
    const shot = r.copied ? path.relative(opts.out, r.copied) : path.relative(ROOT, r.shot);
    const mid = r.copied_mid ? path.relative(opts.out, r.copied_mid) : path.relative(ROOT, r.mid);
    return `- **${r.result.device} ${r.kind === 'deviation' ? r.state : 'command ' + r.n}: \`${r.cmd}\`** — ${failed}. Scroll ${r.result.before.scrollTop} → ${a.scrollTop} (${v.motion.motions} motion(s)), page ${a.scrollHeight} px. ${shot}${v.failed.includes('e') ? `, mid-animation ${mid}` : ''}`;
}

function copy_failures(runs, opts) {
    for (const run of runs) {
        const dir = path.join(opts.out, 'shots', run.device);
        fs.rmSync(dir, { recursive: true, force: true });
        const failing = run.rows.filter(r => r.verdict !== null && r.verdict.failed.length > 0);
        if (failing.length === 0) { continue; }
        fs.mkdirSync(dir, { recursive: true });
        const sorted = [...failing].sort((x, y) => y.verdict.severity - x.verdict.severity);
        for (const r of sorted.slice(0, opts.copy)) {
            const base = path.basename(r.shot, '.png');
            r.copied = path.join(dir, base + '.png');
            fs.copyFileSync(r.shot, r.copied);
            if (r.verdict.failed.includes('e')) {
                r.copied_mid = path.join(dir, base + 'a.png');
                fs.copyFileSync(r.mid, r.copied_mid);
            }
        }
    }
}

function parse_args(argv) {
    const opts = { device: 'both', out: path.join(ROOT, 'docs', 'lofty_demo', 'round6'), sample: 1, deviations: true, limit: Infinity, copy: 40, from_json: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--device') { opts.device = argv[++i]; }
        else if (a === '--out') { opts.out = path.resolve(argv[++i]); }
        else if (a === '--sample') { opts.sample = parseInt(argv[++i], 10); }
        else if (a === '--limit') { opts.limit = parseInt(argv[++i], 10); }
        else if (a === '--copy') { opts.copy = parseInt(argv[++i], 10); }
        else if (a === '--no-deviations') { opts.deviations = false; }
        else if (a === '--from-json') { opts.from_json.push(path.resolve(argv[++i])); }
        else { throw new Error('Unknown argument ' + a); }
    }
    return opts;
}

async function main() {
    const opts = parse_args(process.argv.slice(2));
    opts.progress = s => process.stderr.write(`\r${s.padEnd(70).slice(0, 70)}`);
    const devices = opts.device === 'both' ? ['desktop', 'phone'] : [opts.device];
    const runs = [];
    fs.mkdirSync(opts.out, { recursive: true });
    // --from-json FILE...: no scanning, just the report over saved runs (e.g. a desktop and a phone run made in parallel).
    for (const f of opts.from_json) { runs.push(JSON.parse(fs.readFileSync(f, 'utf8'))); }
    if (opts.from_json.length === 0) {
        for (const d of devices) {
            const run = await scan_device(d, opts);
            runs.push(run);
            fs.writeFileSync(path.join(opts.out, `scan_${d}.json`), JSON.stringify(run));
        }
    }
    process.stderr.write('\n');
    copy_failures(runs, opts);
    const md = markdown(runs, opts);
    const file = path.join(opts.out, 'visibility_scan.md');
    fs.writeFileSync(file, md);
    const sums = summarize(runs);
    for (const s of sums) {
        console.log(`${s.device}: ${s.failing} of ${s.checked} commands fail — ${Object.entries(s.counts).map(([k, n]) => `(${k}) ${n}`).join(', ') || 'none'}; ${s.seconds} s`);
    }
    console.log(`Report: ${path.relative(ROOT, file)}`);
    process.exitCode = sums.some(s => s.failing > 0) ? 1 : 0;
}

module.exports = { scan_device, check, states, DEVIATIONS, summarize, markdown, SCRIPT };

if (require.main === module) {
    main().catch(e => { console.error(e); process.exit(1); });
}
