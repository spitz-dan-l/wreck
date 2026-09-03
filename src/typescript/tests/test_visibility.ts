/*
    The visibility scan as a standing test (Phase B10), sampled: what a person
    sees in the browser after a command. The scan (`scripts/visibility_scan.js`,
    driver `scripts/browse_fire.js`) plays the acceptance script into
    dist/fire.html in headless Chromium and checks, after every command, that
    the prompt is in view, that the topmost change is in view with it (or at
    the top of the view when they cannot both fit), that a fold changed a
    height inside the view, that the scroll did not overshoot the change, and
    that no mid-animation frame lost the prompt to a jump.

    The whole scan is `node scripts/visibility_scan.js` (about ten minutes per
    device); this plays the campfire up to `draw a vertical line` with the
    steps and story folds there on the desktop, and the opening on the phone.
    It needs dist/fire.js built (`npm run build-dev:fire` or `npm run
    build:fire`) and Playwright's Chromium; without the browser it is skipped
    with a message, not failed.
*/
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import 'mocha';

const ROOT = path.resolve(__dirname, '..', '..');
const PLAYWRIGHT = process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright';

function browser_available(): string | undefined {
    if (!fs.existsSync(PLAYWRIGHT)) {
        return `Playwright is not at ${PLAYWRIGHT} (set PLAYWRIGHT_MODULE)`;
    }
    if (!fs.existsSync(path.join(ROOT, 'dist', 'fire.js'))) {
        return 'dist/fire.js is not built (npm run build-dev:fire)';
    }
    try {
        const pw = require(PLAYWRIGHT);
        const exe = pw.chromium.executablePath();
        if (!fs.existsSync(exe)) {
            return `Chromium is not at ${exe} (set PLAYWRIGHT_BROWSERS_PATH)`;
        }
    } catch (e) {
        return `Playwright could not be loaded: ${(e as Error).message}`;
    }
    return undefined;
}

type Row = { kind: string, n: number, state: string, cmd: string, verdict: { failed: string[], checks: { [k: string]: { ok: boolean, detail: string } } } | null, offered?: boolean };

function failures(rows: Row[]): string[] {
    return rows
        .filter(r => r.verdict !== null && r.verdict.failed.length > 0)
        .map(r => `${r.state} \`${r.cmd}\`: ${r.verdict!.failed.map(k => `(${k}) ${r.verdict!.checks[k].detail}`).join('; ')}`);
}

describe('the visibility scan (sampled, in the browser)', function () {
    this.timeout(180000);
    const missing = browser_available();
    if (missing !== undefined) {
        it('is skipped: ' + missing, function () { this.skip(); });
        return;
    }
    const scan = require(path.join(ROOT, 'scripts', 'visibility_scan.js'));

    it('desktop: the campfire to the vertical line, the steps and the story folded there', async () => {
        const run = await scan.scan_device('desktop', {
            limit: 26, sample: 1,
            deviations: (seq: string[]) => seq[0] === 'collapse the steps' || seq[0] === 'collapse the story'
        });
        const bad = failures(run.rows);
        assert.deepStrictEqual(bad, [], 'commands after which a person would not see what happened:\n' + bad.join('\n'));
        assert.ok(run.rows.filter((r: Row) => r.kind === 'deviation' && r.offered).length >= 4, 'the folds were played');
        assert.deepStrictEqual(run.errors, []);
    });

    it('phone: the opening', async () => {
        const run = await scan.scan_device('phone', { limit: 6, sample: 1, deviations: false });
        const bad = failures(run.rows);
        assert.deepStrictEqual(bad, [], 'commands after which a person would not see what happened:\n' + bad.join('\n'));
        assert.deepStrictEqual(run.errors, []);
    });
});
