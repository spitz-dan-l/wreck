// Plays the first commands of the acceptance script at an iPhone-sized viewport
// and screenshots after each, to see what a phone player sees.
//   npm run build-dev:fire && node scripts/screenshot_phone.js [count] [outdir]
const fs = require('fs');
const http = require('http');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const playwright = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');
const COUNT = parseInt(process.argv[2] || '9', 10);
const OUT = process.argv[3] || path.join(ROOT, 'docs', 'lofty_demo', 'screenshots', 'phone');
const EXTRA = (process.env.EXTRA || '').split('|').filter(Boolean);
const SCRIPT = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'lofty_demo', 'round2', 'acceptance_script.json'), 'utf8'));
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json' };
function serve(dir) {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            const file = path.join(dir, decodeURIComponent(req.url.split('?')[0]));
            fs.readFile(file, (err, data) => {
                if (err) { res.writeHead(404); res.end(); return; }
                res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream' });
                res.end(data);
            });
        });
        server.listen(0, '127.0.0.1', () => resolve(server));
    });
}
async function main() {
    fs.mkdirSync(OUT, { recursive: true });
    const server = await serve(path.join(ROOT, 'dist'));
    const port = server.address().port;
    const browser = await playwright.chromium.launch();
    const device = playwright.devices['iPhone 15 Pro'] || { viewport: { width: 402, height: 874 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true };
    const context = await browser.newContext({ ...device, deviceScaleFactor: 2 });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') { errors.push('console: ' + m.text()); } });
    await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.goto(`http://127.0.0.1:${port}/fire.html`);
    await page.waitForSelector('#story-hole input', { state: 'attached' });
    const unlocked = () => page.waitForFunction(() => {
        const s = window.devtools && window.devtools.ui_state;
        return s !== undefined && !s.animation_state.lock_input;
    }, undefined, { timeout: 20000 });
    const cmds = SCRIPT.slice(0, COUNT).concat(EXTRA);
    await unlocked();
    await page.screenshot({ path: path.join(OUT, `00_start.png`) });
    for (let i = 0; i < cmds.length; i++) {
        const cmd = cmds[i];
        await unlocked();
        const before = await page.evaluate(() => window.devtools.ui_state.command_result.world.index);
        await page.keyboard.type(cmd);
        await page.keyboard.press('Enter');
        try {
            await page.waitForFunction(b => window.devtools.ui_state.command_result.world.index === b + 1, before, { timeout: 10000 });
        } catch (e) { throw new Error(`Command ${i} "${cmd}" was not accepted.`); }
        await unlocked();
        await page.waitForTimeout(300);
        const name = String(i + 1).padStart(2, '0') + '_' + cmd.replace(/[^a-z0-9]+/gi, '_').slice(0, 30) + '.png';
        await page.screenshot({ path: path.join(OUT, name) });
        const info = await page.evaluate(() => {
            const t = document.getElementById('terminal');
            const right = document.querySelector('.board .right');
            const r = right && right.getBoundingClientRect();
            return { scrollTop: t.scrollTop, scrollHeight: t.scrollHeight, clientHeight: t.clientHeight, docWidth: document.documentElement.scrollWidth, right: r && { top: r.top, height: r.height, width: r.width } };
        });
        console.log(name, JSON.stringify(info));
    }
    if (errors.length) { console.log('ERRORS:\n' + errors.join('\n')); }
    await browser.close();
    server.close();
}
main().catch(e => { console.error(e); process.exit(1); });
