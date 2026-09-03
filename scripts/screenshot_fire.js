// Plays the Voice of Fire demo in headless Chromium and takes screenshots.
//
//   npm run build-dev:fire && node scripts/screenshot_fire.js
//
// Serves dist/ on a local port, types every command of the acceptance
// script (docs/lofty_demo/round2/acceptance_script.json) into the prompt,
// waits for each animation to finish, screenshots the states SPEC section
// 11 names into docs/lofty_demo/screenshots/, and fails on any page error
// or console error, or if the final page does not say the last line.
const fs = require('fs');
const http = require('http');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const playwright = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');

// `node scripts/screenshot_fire.js --phone` plays the same script at an iPhone-sized
// viewport (touch, narrow) and writes the screenshots under screenshots/phone/.
const PHONE = process.argv.includes('--phone');
const OUT = path.join(ROOT, 'docs', 'lofty_demo', 'screenshots', ...(PHONE ? ['phone'] : []));
const SCRIPT = JSON.parse(fs.readFileSync(path.join(ROOT, 'docs', 'lofty_demo', 'round2', 'acceptance_script.json'), 'utf8'));

// The states to screenshot: after this command (its nth occurrence), scrolled to this element.
const SHOTS = [
    { after: 'apply the Voice of Fire', nth: 1, file: '1_campfire_applied.png', target: '[data-gist="board[seq=\\"campfire\\"]"]' },
    { after: 'ask what the right thing to do is', nth: 1, file: '2_house_pause.png', target: '#story-hole', above: 900 },
    { after: 'speak as the fire', nth: 1, file: '3_forest_voices.png', target: '[data-gist="board[seq=\\"forest\\"]"]' },
    { after: 'collapse the unmapped', nth: 3, file: '4_wise_man_both_solutions.png', target: '[data-gist="board[seq=\\"wise_man\\"]"]' },
    { after: 'say Ok, I guess', nth: 1, file: '5_the_end.png', target: '#story-hole', above: 1200 },
    { after: 'map the taking of things from their home to the hurling of the rag onto the roof', nth: 1, file: '6_pillaging_attempt.png', target: '#story-hole', above: 2500, height: 2700 }
];

const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json', '.png': 'image/png' };

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
    const server = await serve(path.join(ROOT, 'dist'));
    const port = server.address().port;
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext(PHONE
        ? { ...(playwright.devices['iPhone 15 Pro'] || { viewport: { width: 393, height: 659 }, isMobile: true, hasTouch: true }), deviceScaleFactor: 2 }
        : { viewport: { width: 1400, height: 1500 } });
    const page = await context.newPage();
    fs.mkdirSync(OUT, { recursive: true });
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') { errors.push('console: ' + m.text()); } });
    // The font comes from the web; answer for it so the run does not depend on the network.
    await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.goto(`http://127.0.0.1:${port}/fire.html`);
    await page.waitForSelector('#story-hole input', { state: 'attached' });

    // The app locks its input while an animation plays (the opening included); its
    // state is published on window.devtools once the first render has settled.
    const unlocked = () => page.waitForFunction(() => {
        const s = window.devtools && window.devtools.ui_state;
        return s !== undefined && !s.animation_state.lock_input;
    }, undefined, { timeout: 20000 });

    // Ensure the acceptance script still includes every command the screenshots wait for.
    const seen = {};
    let shot_index = 0;
    for (let i = 0; i < SCRIPT.length; i++) {
        const cmd = SCRIPT[i];
        await unlocked();
        const index_before = await page.evaluate(() => window.devtools.ui_state.command_result.world.index);
        await page.keyboard.type(cmd);
        await page.keyboard.press('Enter');
        // The command is accepted when the world's index advances; then its animation plays.
        try {
            await page.waitForFunction(before => window.devtools.ui_state.command_result.world.index === before + 1, index_before, { timeout: 10000 });
        } catch (e) {
            throw new Error(`Command ${i} "${cmd}" was not accepted.`);
        }
        await unlocked();
        seen[cmd] = (seen[cmd] || 0) + 1;
        for (const shot of SHOTS) {
            if (shot.after === cmd && seen[cmd] === shot.nth) {
                await page.waitForTimeout(300);
                await page.evaluate(({ target, above }) => {
                    const terminal = document.getElementById('terminal');
                    const el = document.querySelector(target);
                    const top = el.getBoundingClientRect().top + terminal.scrollTop - 40;
                    terminal.scrollTop = above === undefined ? top : Math.max(0, el.getBoundingClientRect().top + terminal.scrollTop - above);
                }, shot);
                await page.waitForTimeout(200);
                // A tall shot (the house board with both pattern columns and the ledger): a taller viewport for this one.
                if (shot.height !== undefined && !PHONE) {
                    await page.setViewportSize({ width: 1400, height: shot.height });
                    await page.waitForTimeout(200);
                }
                await page.screenshot({ path: path.join(OUT, shot.file) });
                if (shot.height !== undefined && !PHONE) {
                    await page.setViewportSize({ width: 1400, height: 1500 });
                }
                console.log(`screenshot ${++shot_index}: ${shot.file} (after "${cmd}")`);
            }
        }
    }

    const text = await page.evaluate(() => document.body.innerText);
    if (!text.includes("But you don't really see it.")) {
        throw new Error('The final page does not contain the last line.');
    }
    if (errors.length > 0) {
        throw new Error('Errors in the page:\n' + errors.join('\n'));
    }
    console.log(`Played ${SCRIPT.length} commands with no errors; ${shot_index} screenshots in ${OUT}.`);
    await browser.close();
    server.close();
}

main().catch(e => { console.error(e); process.exit(1); });
