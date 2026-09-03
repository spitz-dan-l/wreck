// A browser harness for testers: plays commands into the Voice of Fire page the
// way a person does and records what a person would see after each one.
//
//   npm run build-dev:fire
//   node scripts/browse_fire.js [--phone] [--out DIR] [--hires] [--skip N] [--acceptance | --script FILE] "cmd 1" "cmd 2" ...
//
// Loads dist/fire.html in headless Chromium (desktop 1280x800, or with --phone an
// iPhone 16 Pro: 402x874, DPR 3, touch). For each command in turn it enters the
// command as a player would (on the phone by tapping the typeahead options and
// the Enter control, falling back to typing; on the desktop by typing and
// Enter), waits until the animation lock is released and the page has been
// stable (no DOM mutation, no scroll) for 300 ms, and records to DIR:
//
//   NN.png      the viewport after the command has settled
//   NNa.png     the viewport ~150 ms after submit (what the motion looks like)
//   report.md   per command: the scroll before and after, the page height, the
//               text visible in the viewport (prompt and typeahead lines marked,
//               the pinned steps column marked), the DOM changes the command
//               caused and whether each is in view, the typeahead options, and
//               a WARNINGS line.
//
// --acceptance plays docs/lofty_demo/round2/acceptance_script.json (the given
// commands follow it); --script FILE plays a JSON list; --skip N plays the first
// N commands of the list without recording (to reach a state quickly). --hires
// writes screenshots in device pixels (the default is CSS pixels, which keeps a
// phone run small).
//
// The file is also a module: visibility_scan.js drives the same session
// (`open`, `play`, `undo`, `settle`, `observe`).
const fs = require('fs');
const http = require('http');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const playwright = require(process.env.PLAYWRIGHT_MODULE || '/opt/node22/lib/node_modules/playwright');

const ACCEPTANCE = path.join(ROOT, 'docs', 'lofty_demo', 'round2', 'acceptance_script.json');
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.map': 'application/json', '.png': 'image/png' };

const DEVICES = {
    desktop: { viewport: { width: 1280, height: 800 } },
    phone: {
        viewport: { width: 402, height: 874 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1'
    }
};

const STABLE_MS = 300;          // no mutation and no scroll for this long = settled
const SETTLE_TIMEOUT_MS = 8000; // upper bound on waiting for a settle
const MID_ANIMATION_MS = 150;   // the NNa.png screenshot

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

// Installed in the page once: a mutation observer and a scroll listener on
// #terminal, a 50 ms sampler of the scroll and the prompt's position while a
// command plays, and the measurements the report is made of.
function instrument() {
    const terminal = document.getElementById('terminal');
    const st = { changes: new Map(), last_mutation: 0, last_scroll: 0, samples: [], sampler: null, t0: 0, before: new Map(), next_id: 1 };
    const now = () => performance.now();
    function note(el, kind, old_class) {
        if (!(el instanceof Element)) { return; }
        let e = st.changes.get(el);
        if (!e) { e = { kinds: new Set(), old_class: undefined }; st.changes.set(el, e); }
        e.kinds.add(kind);
        if (kind === 'class' && e.old_class === undefined) { e.old_class = old_class || ''; }
    }
    const observer = new MutationObserver(records => {
        st.last_mutation = now();
        for (const r of records) {
            if (r.type === 'childList') {
                for (const n of r.addedNodes) { note(n.nodeType === 1 ? n : n.parentElement, 'added'); }
                if (r.removedNodes.length > 0) { note(r.target, 'children removed'); }
            } else if (r.type === 'attributes') {
                note(r.target, 'class', r.oldValue);
            }
        }
    });
    observer.observe(terminal, { subtree: true, childList: true, attributes: true, attributeFilter: ['class'], attributeOldValue: true });
    terminal.addEventListener('scroll', () => { st.last_scroll = now(); });

    const view = () => terminal.getBoundingClientRect();
    const locked = () => { const s = window.devtools && window.devtools.ui_state; return s === undefined || s.animation_state.lock_input; };
    const world_index = () => window.devtools.ui_state.command_result.world.index;
    const prompt = () => document.querySelector('#story-hole .input-prompt');
    const collapse = s => s.replace(/\s+/g, ' ').trim();
    const NOISE = c => /^(eph_|eph-|animation_)/.test(c);
    const classes = el => [...el.classList].filter(c => !NOISE(c));

    // Is the point inside `el` (or the prompt's hole) the thing actually painted there?
    function painted(el, x, y) {
        const hit = document.elementFromPoint(x, y);
        if (hit === null) { return false; }
        return el === hit || el.contains(hit) || hit.contains(el);
    }
    function occluder(el, x, y) {
        const hit = document.elementFromPoint(x, y);
        if (hit === null || el === hit || el.contains(hit) || hit.contains(el)) { return undefined; }
        return hit.closest('.columns .right') ? 'the steps panel' : describe(hit);
    }
    function describe(el) {
        const cls = classes(el).slice(0, 3).join('.');
        const text = collapse(el.textContent || '').slice(0, 60);
        return `${el.tagName.toLowerCase()}${cls ? '.' + cls : ''}${text ? ' "' + text + '"' : ''}`;
    }
    // Where an element stands relative to the viewport. Sticky panels count as
    // covering: a change painted under the steps panel is not in view.
    function position(el) {
        const v = view();
        const r = el.getBoundingClientRect();
        if (r.width === 0 && r.height === 0) { return { where: 'HIDDEN', px: 0, rect: null }; }
        const top = Math.max(r.top, v.top), bottom = Math.min(r.bottom, v.bottom);
        const visible = Math.max(0, bottom - top);
        const rect = { top: Math.round(r.top - v.top), bottom: Math.round(r.bottom - v.top), height: Math.round(r.height) };
        if (visible >= Math.min(r.height, 24) && visible > 0) {
            const x = Math.min(Math.max(r.left + Math.min(r.width / 2, 40), v.left + 1), v.right - 1);
            const y = (top + bottom) / 2;
            const under = occluder(el, x, y);
            if (under !== undefined) { return { where: 'UNDER ' + under.toUpperCase(), px: 0, rect }; }
            return { where: 'IN VIEW', px: 0, rect };
        }
        if (r.bottom <= v.top + 24) { return { where: 'ABOVE VIEW', px: Math.round(v.top - r.top), rect }; }
        return { where: 'BELOW VIEW', px: Math.round(r.bottom - v.bottom), rect };
    }
    function prompt_position() {
        const p = prompt();
        if (p === null) { return { where: 'MISSING', px: 0, rect: null }; }
        return position(p);
    }
    function sample() {
        const v = view();
        const p = prompt();
        const r = p ? p.getBoundingClientRect() : null;
        st.samples.push({
            t: Math.round(now() - st.t0),
            scrollTop: Math.round(terminal.scrollTop),
            scrollHeight: terminal.scrollHeight,
            prompt_top: r ? Math.round(r.top - v.top) : null,
            prompt_bottom: r ? Math.round(r.bottom - v.top) : null,
            locked: locked()
        });
    }
    function id_of(el) {
        if (!el.dataset.vf) { el.dataset.vf = String(st.next_id++); }
        return el.dataset.vf;
    }
    // The heights of every element of the story, before a command.
    function snapshot() {
        st.before = new Map();
        const v = view();
        for (const el of terminal.querySelectorAll('.story, .story *')) {
            const r = el.getBoundingClientRect();
            st.before.set(id_of(el), { h: Math.round(r.height), top: Math.round(r.top - v.top + terminal.scrollTop) });
        }
    }
    function start() {
        st.changes = new Map();
        st.samples = [];
        st.t0 = now();
        st.last_mutation = st.last_scroll = 0;
        snapshot();
        if (st.sampler !== null) { clearInterval(st.sampler); }
        st.sampler = setInterval(sample, 50);
        sample();
    }
    function stop() {
        if (st.sampler !== null) { clearInterval(st.sampler); st.sampler = null; }
        sample();
    }
    function status() {
        const t = now();
        return {
            locked: locked(),
            index: world_index(),
            since_mutation: st.last_mutation === 0 ? Infinity : t - st.last_mutation,
            since_scroll: st.last_scroll === 0 ? Infinity : t - st.last_scroll,
            scrollTop: terminal.scrollTop
        };
    }
    function options() {
        return [...document.querySelectorAll('#story-hole .typeahead li.option')].map((li, i) => {
            const v = view();
            const r = li.getBoundingClientRect();
            return {
                index: i,
                text: collapse(li.textContent.replace(/[↵⃐⊘]/g, ' ')),
                submits: li.textContent.includes('↵'),
                locked: li.classList.contains('locked'),
                in_view: r.top >= v.top && r.bottom <= v.bottom
            };
        });
    }
    function prompt_text() { const i = document.querySelector('#story-hole input'); return i ? i.value : ''; }
    function set_prompt_text(text) {
        const i = document.querySelector('#story-hole input');
        i.value = text;
        i.dispatchEvent(new Event('input', { bubbles: true }));
    }
    function enter_control() {
        const c = document.querySelector('#story-hole .prompt-controls .enter');
        if (c === null) { return 'none'; }
        return getComputedStyle(c.parentElement).display === 'none' ? 'none' : (c.classList.contains('disabled') ? 'disabled' : 'enabled');
    }
    // Block-level text in the viewport, in document order.
    function visible_text() {
        const v = view();
        const lines = [];
        const block_cache = new Map();
        function block_of(el) {
            let e = el;
            while (e && e !== terminal) {
                if (block_cache.has(e)) { return block_cache.get(e); }
                const d = getComputedStyle(e).display;
                if (d !== 'inline' && d !== 'inline-block' && d !== 'contents') { block_cache.set(el, e); return e; }
                e = e.parentElement;
            }
            return terminal;
        }
        const walker = document.createTreeWalker(terminal, NodeFilter.SHOW_TEXT);
        let node;
        let current = null;
        while ((node = walker.nextNode())) {
            if (node.nodeValue.trim() === '') { continue; }
            const el = node.parentElement;
            if (el === null) { continue; }
            const range = document.createRange();
            range.selectNodeContents(node);
            const r = range.getBoundingClientRect();
            if (r.height < 3 || r.width === 0) { continue; }
            if (r.bottom <= v.top || r.top >= v.bottom) { continue; }
            const cs = getComputedStyle(el);
            if (cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) { continue; }
            const x = Math.min(Math.max(r.left + 2, v.left + 1), v.right - 1);
            const y = Math.min(Math.max((Math.max(r.top, v.top) + Math.min(r.bottom, v.bottom)) / 2, v.top + 1), v.bottom - 1);
            const under = occluder(el, x, y);
            const block = block_of(el);
            const tag = el.closest('.input-prompt') ? 'PROMPT' : el.closest('.typeahead') ? 'OPTION' : el.closest('.prompt-controls') ? 'CONTROL' : el.closest('.columns .right') ? 'STEPS' : el.closest('.undo-button') ? 'UNDO' : '';
            const cut = (r.top < v.top ? ' (cut at top)' : '') + (r.bottom > v.bottom ? ' (cut at bottom)' : '');
            if (current !== null && current.block === block && current.under === under && current.tag === tag) {
                current.text += ' ' + collapse(node.nodeValue);
                current.cut = current.cut || cut;
            } else {
                current = { block, tag, under, text: collapse(node.nodeValue), cut, top: Math.round(r.top - v.top) };
                lines.push(current);
            }
        }
        return lines.map(l => ({ tag: l.tag, under: l.under, text: l.text + l.cut, top: l.top }));
    }
    // What changed during the command, where it stands now, and how tall it was before.
    function changes() {
        const v = view();
        const hole = document.getElementById('story-hole');
        const result = [];
        const els = [...st.changes.keys()].filter(el => el.isConnected);
        for (const el of els) {
            const e = st.changes.get(el);
            const kinds = [...e.kinds];
            if (kinds.includes('class')) {
                const before = new Set((e.old_class || '').split(/\s+/).filter(c => c && !NOISE(c)));
                const after = new Set(classes(el));
                const added = [...after].filter(c => !before.has(c));
                const removed = [...before].filter(c => !after.has(c));
                if (added.length === 0 && removed.length === 0) {
                    e.kinds.delete('class');
                } else {
                    e.class_diff = [...added.map(c => '+' + c), ...removed.map(c => '-' + c)].join(' ');
                }
            }
            if (e.kinds.size === 0) { continue; }
            // The hole moving is the prompt moving; a container that only lost children (the hole, ephemeral markers) is not a change a person sees.
            if (e.kinds.size === 1 && e.kinds.has('children removed') && (el.classList.contains('story') || (hole !== null && el.contains(hole)))) { continue; }
            // An added node inside another added node is the same change.
            if (e.kinds.has('added') && els.some(o => o !== el && o.contains(el) && st.changes.get(o).kinds.has('added'))) { continue; }
            const in_hole = hole !== null && hole.contains(el);
            const pos = position(el);
            const before = st.before.get(el.dataset.vf);
            const r = el.getBoundingClientRect();
            result.push({
                description: el === hole ? 'the prompt (#story-hole)' : describe(el),
                kinds: [...e.kinds],
                class_diff: e.class_diff,
                in_hole,
                where: pos.where,
                px: pos.px,
                rect: pos.rect,
                doc_top: Math.round(r.top - v.top + terminal.scrollTop),
                height_before: before ? before.h : null,
                height_after: Math.round(r.height)
            });
        }
        result.sort((a, b) => a.doc_top - b.doc_top);
        return result;
    }
    // The heights, before and after, of the containers around a change (the
    // step, the steps column, the board): a fold must show up here.
    function region_heights(selector_list) {
        const v = view();
        const out = [];
        for (const el of [...st.changes.keys()].filter(e => e.isConnected)) {
            for (const sel of selector_list) {
                const anc = el.closest(sel);
                if (anc && !out.some(o => o.el === anc)) {
                    const r = anc.getBoundingClientRect();
                    const before = st.before.get(anc.dataset.vf);
                    out.push({ el: anc, selector: sel, height_before: before ? before.h : null, height_after: Math.round(r.height), top: Math.round(r.top - v.top), bottom: Math.round(r.bottom - v.top), where: position(anc).where });
                }
            }
        }
        return out.map(o => ({ selector: o.selector, description: describe(o.el).slice(0, 80), height_before: o.height_before, height_after: o.height_after, top: o.top, bottom: o.bottom, where: o.where }));
    }
    function observe() {
        const v = view();
        return {
            scrollTop: Math.round(terminal.scrollTop),
            scrollHeight: terminal.scrollHeight,
            viewport: Math.round(v.height),
            prompt: prompt_position(),
            enter_control: enter_control(),
            options: options(),
            text: visible_text(),
            changes: changes(),
            regions: region_heights(['.step', '.columns .right', '.columns .left', '.board']),
            samples: st.samples,
            sticky: [...document.querySelectorAll('.columns .right')].map(el => {
                const r = el.getBoundingClientRect();
                return { top: Math.round(r.top - v.top), bottom: Math.round(r.bottom - v.top), height: Math.round(r.height), sticky: getComputedStyle(el).position === 'sticky' };
            }).filter(s => s.sticky && s.bottom > 0 && s.top < v.height)
        };
    }
    function scroll_to_prompt() {
        const f = document.querySelector('.typeahead .footer');
        if (f) { f.scrollIntoView({ behavior: 'instant', block: 'end' }); }
    }
    window.__vf = { start, stop, status, options, prompt_text, set_prompt_text, enter_control, observe, scroll_to_prompt, world_index, locked, prompt_position };
}

async function open({ phone = false, hires = false } = {}) {
    const server = await serve(path.join(ROOT, 'dist'));
    const port = server.address().port;
    const browser = await playwright.chromium.launch();
    const context = await browser.newContext(phone ? DEVICES.phone : DEVICES.desktop);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', e => errors.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') { errors.push('console: ' + m.text()); } });
    await page.route('**/fonts.googleapis.com/**', r => r.fulfill({ status: 200, contentType: 'text/css', body: '' }));
    await page.goto(`http://127.0.0.1:${port}/fire.html`);
    await page.waitForSelector('#story-hole input', { state: 'attached' });
    await page.waitForFunction(() => window.devtools && window.devtools.ui_state !== undefined);
    await page.evaluate(instrument);
    const session = {
        page, browser, server, phone, hires, errors,
        device: phone ? 'phone' : 'desktop',
        screenshot_options: { scale: hires ? 'device' : 'css' },
        async close() { await browser.close(); server.close(); }
    };
    await settle(session);
    return session;
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

// Wait until the animation lock is released and the page has been stable for STABLE_MS.
async function settle(session, timeout = SETTLE_TIMEOUT_MS) {
    const started = Date.now();
    let last;
    while (Date.now() - started < timeout) {
        last = await session.page.evaluate(() => window.__vf.status());
        if (!last.locked && last.since_mutation >= STABLE_MS && last.since_scroll >= STABLE_MS) {
            return { settled: true, ms: Date.now() - started };
        }
        await sleep(50);
    }
    return { settled: false, ms: Date.now() - started, last };
}

const norm = s => s.replace(/\s+/g, ' ').trim();

// Enter a command as a player does. Returns { accepted, how, submitted_at }.
async function enter(session, cmd) {
    const { page } = session;
    const before = await page.evaluate(() => window.__vf.world_index());
    const accepted = async (ms) => {
        try {
            await page.waitForFunction(b => window.__vf.world_index() === b + 1, before, { timeout: ms });
            return true;
        } catch (e) { return false; }
    };
    const target = norm(cmd);
    if (session.phone) {
        const taps = [];
        for (let attempt = 0; attempt < 16; attempt++) {
            const options = await page.evaluate(() => window.__vf.options());
            const typed = norm(await page.evaluate(() => window.__vf.prompt_text()));
            // The option that is the whole command, else the longest one that is a prefix of it.
            let best = null;
            for (const o of options) {
                if (o.locked) { continue; }
                if (o.text === target || target.startsWith(o.text + ' ')) {
                    if (best === null || o.text.length > best.text.length) { best = o; }
                }
            }
            if (best === null || best.text.length <= typed.length) { break; }
            taps.push(best.text);
            await page.tap(`#story-hole .typeahead li.option >> nth=${best.index}`);
            const submitted_at = Date.now();
            if (best.submits && best.text === target) {
                if (await accepted(1500)) { return { accepted: true, how: `tapped ${taps.length} option(s)`, submitted_at }; }
                break;
            }
            await page.waitForFunction(t => window.__vf.prompt_text().replace(/\s+/g, ' ').trim() !== t, typed, { timeout: 1500 }).catch(() => undefined);
        }
        // Whatever the options did not cover: type it, then the Enter control (or the key).
        const typed = norm(await page.evaluate(() => window.__vf.prompt_text()));
        if (typed !== target) {
            await page.evaluate(() => window.__vf.set_prompt_text(''));
            await page.keyboard.type(cmd);
        }
        const control = await page.evaluate(() => window.__vf.enter_control());
        let submitted_at;
        if (control === 'enabled') {
            await page.tap('#story-hole .prompt-controls .enter');
            submitted_at = Date.now();
        } else {
            await page.keyboard.press('Enter');
            submitted_at = Date.now();
        }
        const ok = await accepted(2000);
        return { accepted: ok, how: (taps.length ? `tapped ${taps.length} option(s), then ` : '') + (typed !== target ? 'typed' : 'kept the text') + (control === 'enabled' ? ' and tapped Enter' : ' and pressed Enter'), submitted_at };
    }
    await page.keyboard.type(cmd);
    await page.keyboard.press('Enter');
    const submitted_at = Date.now();
    const ok = await accepted(2000);
    return { accepted: ok, how: 'typed and pressed Enter', submitted_at };
}

// Play one command, record it, and return the observation.
//   record: { dir, name } writes name.png, namea.png; without it only the observation is returned.
async function play(session, cmd, record) {
    const { page } = session;
    await page.evaluate(() => window.__vf.start());
    const before = await page.evaluate(() => window.__vf.status());
    const entered = await enter(session, cmd);
    let mid = null;
    if (record) {
        const wait = MID_ANIMATION_MS - (Date.now() - entered.submitted_at);
        if (wait > 0) { await sleep(wait); }
        mid = { at: Date.now() - entered.submitted_at };
        await page.screenshot({ path: path.join(record.dir, record.name + 'a.png'), ...session.screenshot_options });
    }
    const settled = await settle(session);
    await page.evaluate(() => window.__vf.stop());
    const obs = await page.evaluate(() => window.__vf.observe());
    if (record) {
        await page.screenshot({ path: path.join(record.dir, record.name + '.png'), ...session.screenshot_options });
    }
    if (!entered.accepted) {
        await page.evaluate(() => window.__vf.set_prompt_text(''));
        await settle(session, 2000);
    }
    return { cmd, entered, mid, settled, before: { scrollTop: Math.round(before.scrollTop) }, after: obs, device: session.device };
}

// Take the last command back (Left toggles the undo selection, Enter takes it), clear the prompt, and stand at the prompt.
async function undo(session) {
    const { page } = session;
    const before = await page.evaluate(() => window.__vf.world_index());
    await page.keyboard.press('ArrowLeft');
    await page.keyboard.press('Enter');
    await page.waitForFunction(b => window.__vf.world_index() === b - 1, before, { timeout: 3000 });
    await page.evaluate(() => window.__vf.set_prompt_text(''));
    await sleep(50);
    await page.evaluate(() => window.__vf.scroll_to_prompt());
    await settle(session, 2000);
}

// The scroll trajectory: how many separate motions, the largest step between samples, the net move.
function motion(result) {
    const s = result.after.samples;
    let motions = 0, largest = 0, moving = false, quiet = 0;
    for (let i = 1; i < s.length; i++) {
        const d = Math.abs(s[i].scrollTop - s[i - 1].scrollTop);
        largest = Math.max(largest, d);
        if (d > 0) {
            if (!moving) { motions++; moving = true; }
            quiet = 0;
        } else if (moving) {
            quiet += s[i].t - s[i - 1].t;
            if (quiet >= 150) { moving = false; }
        }
    }
    return { motions, largest, net: result.after.scrollTop - result.before.scrollTop };
}

function warnings(result) {
    const a = result.after;
    const out = [];
    if (!result.entered.accepted) { out.push(`NOT ACCEPTED: the command was not taken (${result.entered.how})`); }
    if (!result.settled.settled) { out.push(`NOT SETTLED after ${result.settled.ms} ms`); }
    const outside = a.changes.filter(c => !c.in_hole);
    for (const c of outside) {
        if (c.where !== 'IN VIEW' && c.where !== 'HIDDEN') { out.push(`OUT OF VIEW: ${c.where}${c.px ? ' (' + c.px + ' px)' : ''} ${c.description}`); }
    }
    const m = motion(result);
    if (outside.length === 0 && a.changes.length > 0 && m.net !== 0 && a.prompt.where !== 'IN VIEW') {
        out.push(`SCROLLED AWAY FROM THE PROMPT (${m.net > 0 ? '+' : ''}${m.net} px) while only the prompt changed`);
    }
    if (Math.abs(m.net) > a.viewport) { out.push(`JUMP: scrolled ${m.net > 0 ? '+' : ''}${m.net} px, more than the viewport (${a.viewport} px)`); }
    if (m.motions > 1) { out.push(`SEVERAL SCROLL MOTIONS: ${m.motions}`); }
    if (a.prompt.where !== 'IN VIEW') { out.push(`PROMPT NOT IN VIEW: ${a.prompt.where}${a.prompt.px ? ' (' + a.prompt.px + ' px)' : ''}`); }
    return out;
}

function report_block(index, result, name) {
    const a = result.after;
    const m = motion(result);
    const lines = [];
    lines.push(`## ${index}. \`${result.cmd}\`  (${result.device})`);
    lines.push('');
    lines.push(`- entered: ${result.entered.how}${result.entered.accepted ? '' : ' — NOT ACCEPTED'}; settled in ${result.settled.ms} ms${result.settled.settled ? '' : ' (TIMED OUT)'}`);
    lines.push(`- scroll: ${result.before.scrollTop} → ${a.scrollTop} (net ${m.net > 0 ? '+' : ''}${m.net} px; ${m.motions} motion(s), largest step ${m.largest} px); page ${a.scrollHeight} px, viewport ${a.viewport} px`);
    lines.push(`- prompt: ${a.prompt.where}${a.prompt.rect ? ` at ${a.prompt.rect.top}–${a.prompt.rect.bottom} px` : ''}; pinned steps panel: ${a.sticky.length ? a.sticky.map(s => `${s.top}–${s.bottom} px`).join(', ') : 'none'}`);
    if (name) { lines.push(`- screenshots: ${name}.png (settled), ${name}a.png (${result.mid ? result.mid.at : MID_ANIMATION_MS} ms after submit)`); }
    const outside = a.changes.filter(c => !c.in_hole);
    const inside = a.changes.filter(c => c.in_hole);
    lines.push(`- changes: ${outside.length} outside the prompt${inside.length ? `, ${inside.length} in the prompt/typeahead` : ''}`);
    for (const c of outside) {
        const where = c.where + (c.px ? ` (${c.px} px)` : '') + (c.rect ? ` at ${c.rect.top}–${c.rect.bottom}` : '');
        const h = c.height_before !== null && c.height_before !== c.height_after ? `; height ${c.height_before} → ${c.height_after}` : '';
        lines.push(`  - ${where}: ${c.description} [${c.kinds.join(', ')}${c.class_diff ? ': ' + c.class_diff : ''}${h}]`);
    }
    const folds = a.regions.filter(r => r.height_before !== null && r.height_before !== r.height_after);
    if (folds.length) {
        lines.push(`- containers whose height changed:`);
        for (const r of folds) { lines.push(`  - ${r.selector} ${r.height_before} → ${r.height_after} px, ${r.where} at ${r.top}–${r.bottom}: ${r.description}`); }
    }
    lines.push(`- typeahead: ${a.options.length ? a.options.map(o => (o.in_view ? '' : '(off screen) ') + o.text + (o.locked ? ' [locked]' : '')).join(' | ') : 'none'}`);
    lines.push('- visible text:');
    lines.push('```');
    for (const t of a.text) {
        if (t.under) { continue; }
        lines.push(`${String(t.top).padStart(4)} ${t.tag ? '[' + t.tag + '] ' : ''}${t.text}`);
    }
    lines.push('```');
    const hidden = a.text.filter(t => t.under);
    if (hidden.length) { lines.push(`- text painted under ${hidden[0].under}: ${hidden.length} line(s), e.g. "${hidden[0].text.slice(0, 60)}"`); }
    const w = warnings(result);
    lines.push(`- WARNINGS: ${w.length ? w.join('; ') : 'none'}`);
    lines.push('');
    return lines.join('\n');
}

function parse_args(argv) {
    const opts = { phone: false, hires: false, out: undefined, skip: 0, script: undefined, acceptance: false, commands: [] };
    for (let i = 0; i < argv.length; i++) {
        const a = argv[i];
        if (a === '--phone') { opts.phone = true; }
        else if (a === '--hires') { opts.hires = true; }
        else if (a === '--acceptance') { opts.acceptance = true; }
        else if (a === '--out') { opts.out = argv[++i]; }
        else if (a === '--skip') { opts.skip = parseInt(argv[++i], 10); }
        else if (a === '--script') { opts.script = argv[++i]; }
        else { opts.commands.push(a); }
    }
    return opts;
}

async function main() {
    const opts = parse_args(process.argv.slice(2));
    let commands = [];
    if (opts.acceptance) { commands = JSON.parse(fs.readFileSync(ACCEPTANCE, 'utf8')); }
    if (opts.script) { commands = commands.concat(JSON.parse(fs.readFileSync(opts.script, 'utf8'))); }
    commands = commands.concat(opts.commands);
    if (commands.length === 0) {
        console.error('Usage: node scripts/browse_fire.js [--phone] [--out DIR] [--hires] [--skip N] [--acceptance | --script FILE] "cmd 1" "cmd 2" ...');
        process.exit(2);
    }
    const device = opts.phone ? 'phone' : 'desktop';
    const out = opts.out || path.join(ROOT, 'browse', device);
    fs.mkdirSync(out, { recursive: true });
    const report = path.join(out, 'report.md');
    fs.writeFileSync(report, `# What a person sees: ${device}\n\n${commands.length} command(s); viewport-only screenshots beside this file.\n\n`);
    const session = await open({ phone: opts.phone, hires: opts.hires });
    const started = Date.now();
    const total_warnings = [];
    try {
        await session.page.screenshot({ path: path.join(out, '00.png'), ...session.screenshot_options });
        for (let i = 0; i < commands.length; i++) {
            const cmd = commands[i];
            const n = i + 1;
            if (i < opts.skip) {
                const r = await play(session, cmd);
                if (!r.entered.accepted) { throw new Error(`Command ${n} "${cmd}" was not accepted while skipping ahead.`); }
                process.stdout.write(`\r${n}/${commands.length} (skipping)   `);
                continue;
            }
            const name = String(n).padStart(2, '0');
            const result = await play(session, cmd, { dir: out, name });
            const w = warnings(result);
            fs.appendFileSync(report, report_block(n, result, name) + '\n');
            const m = motion(result);
            console.log(`${n}/${commands.length} ${cmd.slice(0, 50).padEnd(50)} scroll ${result.before.scrollTop}→${result.after.scrollTop} prompt ${result.after.prompt.where}${w.length ? '  WARN: ' + w.join('; ') : ''}`);
            if (w.length) { total_warnings.push(`${n}. ${cmd}: ${w.join('; ')}`); }
        }
    } finally {
        await session.close();
    }
    const seconds = Math.round((Date.now() - started) / 1000);
    fs.appendFileSync(report, `\n## Summary\n\n${total_warnings.length} command(s) with warnings out of ${commands.length - opts.skip}; ${seconds} s.\n\n${total_warnings.map(w => '- ' + w).join('\n')}\n${session.errors.length ? '\nPage errors:\n' + session.errors.join('\n') + '\n' : ''}`);
    console.log(`${total_warnings.length} command(s) with warnings; ${seconds} s; report at ${path.relative(ROOT, report)}`);
    if (session.errors.length) { console.log('Page errors:\n' + session.errors.join('\n')); }
}

module.exports = { open, play, undo, settle, enter, observe: (session) => session.page.evaluate(() => window.__vf.observe()), warnings, motion, report_block, ACCEPTANCE, STABLE_MS };

if (require.main === module) {
    main().catch(e => { console.error(e); process.exit(1); });
}
