/*
    The confusion scan as a standing test (Phase B9). A player taps what the
    typeahead offers, in any order; `demo_worlds/fire/scan.ts` walks that
    space and reports every offered command that does nothing, says something
    untrue, prints nothing, throws, repeats itself, or leaves the lesson
    unfinishable. This runs it over a sample of the acceptance states — every
    one of them takes a quarter of an hour, and each state also covers every
    one-command deviation from the script there — and fails on anything not
    allowed below, with the reason it is allowed.

    DEAD END is a reachability proof: from the state each command leaves
    behind, the scanner plays its way forward to the next scene boundary. On
    top of that, the deviation classes listed here (a trap, a wrong map, a
    set aside, an erase, a different voice, a fold in the middle of the
    board) are each played all the way to l. 481.

    The whole scan is `node scripts/confusion_scan.js`, whose report is
    `docs/lofty_demo/round5/confusion_scan.md`.
*/
import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import 'mocha';
import { commands, Finding, FindingKind, reaches_end, reaches_next_scene, replay, scan, step } from 'demo_worlds/fire/scan';
import { FireWorld } from 'demo_worlds/fire';
import { ACCEPTANCE_SCRIPT } from './test_fire_walkthrough';

// The early states (where the author found "The steps unfold" unfolding
// nothing), then one state in twenty-five, then the last.
const SAMPLED = (i: number) => i < 6 || i % 25 === 0 || i === ACCEPTANCE_SCRIPT.length;

// What the scan may still report, and why it is right to. A finding is
// allowed when its kind matches and its command starts with `command`.
const ALLOWED: { kind: FindingKind, command: string, why: string }[] = [
    {
        kind: 'NOISE', command: '',
        why: 'a mapping state offers one `map <step> to <event>` per pair, which is the puzzle itself; '
            + 'the commands that advance are still the first ones the typeahead lists'
    }
];

function allowed(f: Finding): boolean {
    return ALLOWED.some(a => a.kind === f.kind && f.command.startsWith(a.command));
}

function describe_finding(f: Finding): string {
    const reached = f.reached_by.length === 0 ? '(the opening)' : `after ${f.reached_by.length}: …${f.reached_by.slice(-2).join(' | ')}`;
    return `${f.kind} — "${f.command}" ${reached}\n    ${f.why}\n    printed: ${f.printed}`;
}

// A deviation from the acceptance script: play its first `after` commands, then these.
interface Deviation { name: string; after: number; then: string[] }

const DEVIATIONS: Deviation[] = [
    // The author's case: at "The fire starts…" the friends cannot command the
    // fire and the story must be let to follow. Spring the trap, or fold the
    // board mid-story, and the lesson must still finish.
    { name: 'the campfire trap at the consequence-only ¶', after: 19, then: ['spread to the kindling'] },
    { name: 'the campfire folded mid-board', after: 19, then: ['collapse the story'] },
    // A wrong map, then an erase of a step already placed.
    { name: 'a wrong map and an erase', after: 30, then: ['map the ash left behind to the second singing', 'erase the laying of the tinder'] },
    // The house: the children's line tried in the family's voice, at the pause.
    { name: 'the house at the pause, in the wrong voice', after: 63, then: ['light the rag'] },
    // The house applied, then set aside: the mapping reopens with its placements.
    { name: 'the house set aside after apply', after: 83, then: ['set aside the mapping'] },
    // The forest: the board's own fire lent the Voice of Fire (trap V4).
    { name: 'the forest, the Voice of Fire on a story line', after: 101, then: ['speak as the Voice of Fire'] },
    // The wise man: the second solution set aside and the first resumed.
    { name: 'the wise man, first solution resumed', after: 187, then: ['set aside the second solution', 'resume the first solution'] }
];


function played(d: Deviation): FireWorld {
    let w = replay(ACCEPTANCE_SCRIPT.slice(0, d.after))[d.after];
    for (const command of d.then) {
        const next = step(w, command);
        assert.ok(next !== undefined, `"${command}" (${d.name}) is not accepted; on offer: ${commands(w).join(' | ')}`);
        w = next!;
    }
    return w;
}

describe('the confusion scan', function () {
    this.timeout(300000);

    let findings: Finding[];
    let states: number;

    before(() => {
        const report = scan({ script: ACCEPTANCE_SCRIPT, at: SAMPLED });
        findings = report.findings;
        states = report.states.length;
    });

    it('scans the sampled acceptance states', () => {
        assert.ok(states >= 12, `only ${states} states were scanned`);
    });

    for (const kind of ['THROW', 'NO-OP', 'EMPTY', 'DEAD END', 'REPEAT'] as FindingKind[]) {
        it(`offers no ${kind}`, () => {
            const found = findings.filter(f => f.kind === kind && !allowed(f));
            assert.equal(found.length, 0, `\n  ${found.map(describe_finding).join('\n  ')}\n`);
        });
    }

    it('keeps the option lists readable', () => {
        const found = findings.filter(f => f.kind === 'NOISE' && !allowed(f));
        assert.equal(found.length, 0, `\n  ${found.map(describe_finding).join('\n  ')}\n`);
    });

    it('leaves the lesson finishable after every kind of deviation', () => {
        for (const d of DEVIATIONS) {
            const reach = reaches_next_scene(played(d));
            assert.ok(reach.ok, `after ${d.name} the next scene is out of reach`);
        }
    });

    it('plays the whole lesson through to l. 481 from a deviation in the first story', () => {
        // The one full proof: from the campfire's trap, every scene to the end is played.
        const reach = reaches_end(played(DEVIATIONS[0]));
        assert.ok(reach.ok, 'the end is out of reach from the campfire trap');
        assert.ok(reach.path[reach.path.length - 1] === 'say Ok, I guess', reach.path.slice(-3).join(' | '));
    });

    it('never offers a way past a consequence-only ¶ but letting it follow', () => {
        // The friends cannot command the fire, and `sing` (the next line's own
        // command) is not on offer either: the ¶ can only be let to follow.
        const w = replay(ACCEPTANCE_SCRIPT.slice(0, 19))[19];
        const offered = commands(w).filter(c => !c.startsWith('remember ') && !c.startsWith('expand ') && !c.startsWith('collapse '));
        assert.deepEqual(offered.sort(), ['let it follow', 'spread to the kindling']);
    });

    it('keeps the screenshot and scan drivers on the acceptance script', () => {
        const file = path.resolve(__dirname, '../../docs/lofty_demo/round2/acceptance_script.json');
        assert.deepEqual(JSON.parse(fs.readFileSync(file, 'utf8')), ACCEPTANCE_SCRIPT);
    });
});
