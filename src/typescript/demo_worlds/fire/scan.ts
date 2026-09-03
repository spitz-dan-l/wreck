/*
    The confusion scan (Phase B9). A player taps what the typeahead offers,
    in whatever order they like; this walks that space and reports where an
    offered command does nothing, says something untrue, prints nothing at
    all, throws, repeats itself, or leaves the lesson unfinishable.

    From a state it enumerates every command the parser accepts (the
    typeahead's option list is the ground truth of what can be tapped),
    applies each one, and compares three things across the command: the
    world's own fields, the whole story tree rendered as a tag-and-class
    signature (so a fold that folds nothing shows up as no change at all),
    and the text the new frame printed. Scanning every state along a script
    therefore also scans every one-command deviation from it.

    DEAD END is a reachability proof, not a look-ahead: from the state a
    command leaves behind, `can_reach` searches forward over advancing
    commands only and must actually play its way to the next scene boundary
    (the next apply, the next board closed, the next beat). `reaches_end`
    chains those hops to l. 481. The search generates its moves from the
    world and the candidate tables rather than from the parser, because
    enumerating a mapping state costs seconds and lists a hundred `map`s of
    which two or three are candidates.

    The scan is pure: it plays a fresh world and never touches the page.
*/
import { Parser, raw, traverse_thread } from 'parser';
import { apply_story_updates_all, find_all_nodes, Fragment, is_story_hole, is_story_node, Story, StoryNode, to_basic_text } from 'story';
import { make_update_thread } from 'world';
import { EVENT_NAMES } from './data';
import { candidates_for, placed } from './judge';
import { fire_world_spec } from './index';
import { SCRIPT } from './puffers/classroom';
import {
    board_pattern, board_story, classroom_commands, converted, ended, FireWorld, frames_with, open_mapping, phase, readings, set_aside_mappings
} from './world';

export type FindingKind = 'NO-OP' | 'EMPTY' | 'DEAD END' | 'THROW' | 'REPEAT' | 'NOISE';

export interface Finding {
    kind: FindingKind;
    at: number;             // how many commands of the script reach the state
    reached_by: string[];   // the commands that reach the state
    command: string;        // the command that produced the finding ('' for NOISE)
    printed: string;        // what its frame printed
    why: string;
}

// PLAYING

// One command, applied without the parser's follow-up empty parse: the world
// after it, or undefined if it was refused. The frame carries no input text,
// so a frame's whole text is what the command printed.
export function step(w: FireWorld, command: string): FireWorld | undefined {
    const result = Parser.run_thread(raw(command, true), make_update_thread(fire_world_spec, w));
    return result.kind === 'NotParsed' ? undefined : result.result;
}

export function initial_world(): FireWorld {
    return fire_world_spec.initial_world;
}

// The states a script passes through: worlds[i] is reached by the first i commands.
export function replay(script: string[]): FireWorld[] {
    const worlds = [initial_world()];
    let w = worlds[0];
    for (const command of script) {
        const next = step(w, command);
        if (next === undefined) {
            throw new Error(`the script's command "${command}" (${worlds.length}) was refused`);
        }
        w = next;
        worlds.push(w);
    }
    return worlds;
}

// Every command the world accepts, in the order the puffers offer them.
const enumerated = new WeakMap<FireWorld, string[]>();

export function commands(w: FireWorld): string[] {
    let found = enumerated.get(w);
    if (found === undefined) {
        found = Object.keys(traverse_thread(make_update_thread(fire_world_spec, w)));
        enumerated.set(w, found);
    }
    return found;
}

// The first token of every option, from one empty parse: cheap where enumerating everything is not.
export function verbs(w: FireWorld): string[] {
    const grid = Parser.run_thread(raw('', false), make_update_thread(fire_world_spec, w)).parsing.view.typeahead_grid;
    return grid.map(o => String(o.option.find(m => m !== undefined)!.expected.token));
}

// WHAT A COMMAND DID

const stories = new WeakMap<FireWorld, Story>();

export function story_of(w: FireWorld): Story {
    let story = stories.get(w);
    if (story === undefined) {
        story = apply_story_updates_all(w.story, w.story_updates);
        stories.set(w, story);
    }
    return story;
}

function normalise(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

// The frame a command wrote, wherever the hole put it.
function frame_of(story: Story, index: number): StoryNode | undefined {
    const found = find_all_nodes(story, n => is_story_node(n) && n.data.frame_index === index);
    return found.length === 0 ? undefined : found[0][0] as StoryNode;
}

// What the frame printed: its output, without the echoed command.
export function printed_text(w: FireWorld): string {
    const frame = frame_of(story_of(w), w.index);
    if (frame === undefined) {
        return '';
    }
    const output = frame.children.find(c => is_story_node(c) && c.classes['output-text']);
    return normalise(to_basic_text(output ?? frame));
}

// Everything the page would show, as tags and the classes that are on: a
// fold, a badge going solid, a band, a hole moving. One frame may be left
// out (the frame of the command being judged, which is new by construction).
function signature(node: Fragment, skip_frame: number): string {
    if (typeof node === 'string') {
        return node;
    }
    if (is_story_hole(node)) {
        return '<hole/>';
    }
    if (node.data.frame_index === skip_frame) {
        return '';
    }
    const on = Object.keys(node.classes).filter(c => node.classes[c]).sort().join('.');
    return `<${node.tag}${on === '' ? '' : '.' + on}>${node.children.map(c => signature(c, skip_frame)).join('')}</${node.tag}>`;
}

// The world's own state, display bookkeeping apart (`collapsed` says what is
// folded, but whether anything folded is a question for the tree).
function state_fields(w: FireWorld): string {
    return JSON.stringify({
        lesson: w.lesson, voice: w.voice, board: w.board, cursor: w.cursor,
        finished: w.finished, taught: w.taught, mappings: w.mappings
    });
}

// A state's own signature and fields, taken once however many commands are tried from it.
const signatures = new WeakMap<FireWorld, { tree: string, fields: string }>();

function state_of(w: FireWorld): { tree: string, fields: string } {
    let found = signatures.get(w);
    if (found === undefined) {
        found = { tree: signature(story_of(w), -1), fields: state_fields(w) };
        signatures.set(w, found);
    }
    return found;
}

export interface Effect {
    printed: string;
    state_changed: boolean;         // a world field other than the display bookkeeping
    tree_changed(): boolean;        // anything the page would show, outside the new frame
}

// Signing a whole story is the one costly thing here (thousands of nodes by
// the end) and most commands are judged by their text and their fields
// alone, so the signature is only taken when it is asked for.
export function effect_of(before: FireWorld, after: FireWorld): Effect {
    const was = state_of(before);
    let tree: boolean | undefined;
    return {
        printed: printed_text(after),
        state_changed: was.fields !== state_fields(after),
        tree_changed: () => tree ??= was.tree !== signature(story_of(after), after.index)
    };
}

// REACHABILITY

const is_display = (command: string) => command.startsWith('expand ') || command.startsWith('collapse ');
const is_quiet = (command: string) => is_display(command) || command.startsWith('remember ');

// The classroom lines of this beat (the script's own beat window), with the
// one whose wording follows the board. Trying all thirty at every node of
// the search would cost more than the search.
function script_commands(w: FireWorld): string[] {
    return SCRIPT
        .filter(line => w.lesson >= line.beat && w.lesson <= (line.through ?? line.beat))
        .map(line => typeof line.command === 'string' ? line.command : line.command(w));
}

// The commands that could move the lesson on from here: the classroom
// script, and whatever the open board's phase allows. A superset of what is
// really offered — a command the world refuses simply fails — generated from
// the world because the parser's own enumeration is hundreds of options and
// seconds of work at a mapping state.
export function advancing_moves(w: FireWorld): string[] {
    const moves = script_commands(w);
    const story = board_story(w);
    if (story === undefined) {
        return moves;
    }
    const at = phase(w, story);
    if (at === 'transcribing') {
        moves.push('let it follow', ...story.voices.map(v => `speak as ${v}`));
        const next = story.events[converted(w, story)];
        if (next !== undefined) {
            moves.push(next.command);
        }
    } else if (at === 'converted') {
        moves.push('draw a vertical line');
    } else if (at === 'mapping') {
        const pattern = board_pattern(w, story);
        const open = open_mapping(w, story, pattern);
        moves.push(`apply ${pattern.voice.name}`);
        if (open !== undefined) {
            const rows = candidates_for(story, pattern, open.pass, set_aside_mappings(w, story));
            for (const s of pattern.steps) {
                for (const c of rows[s.index] ?? []) {
                    moves.push(`map ${s.name} to ${EVENT_NAMES[story.id][c.event - 1]}`);
                }
                if (placed(open, s.index) !== undefined) {
                    moves.push(`erase ${s.name}`);
                }
            }
        }
        for (const what of ['the mapping', 'the first solution', 'the second solution']) {
            moves.push(`set aside ${what}`, `resume ${what}`);
        }
    }
    return moves;
}

// Two states are the same for the search when the lesson, the board, and
// everything said, converted and placed are the same. What is folded is not
// part of it. (The converted events are needed as well as the cursor: two
// events of one ¶ leave the cursor where it was.)
function search_key(w: FireWorld): string {
    return JSON.stringify([
        w.lesson, w.board, w.cursor, w.voice, w.finished, w.taught,
        w.mappings.map(m => [m.id, m.pass, m.status, m.placements.map(p => [p.step, p.event])]),
        classroom_commands(w).map(c => c.command),
        frames_with(w, 'event').map(f => `${f.params.seq}:${f.params.n}`)
    ]);
}

// How far along the lesson is: the search takes the furthest state first.
function progress(w: FireWorld): number {
    const story = board_story(w);
    const placed_steps = w.mappings.reduce((n, m) => n + m.placements.length, 0);
    return w.lesson * 100000 + w.finished.length * 10000 + readings(w).length * 5000
        + (story === undefined ? 0 : converted(w, story)) * 100 + placed_steps * 10;
}

// The scene the lesson is in: the beat, the boards closed, and the passes
// that have been applied at all. The next scene boundary is the next time
// one of these goes up. (Passes, not applies: setting a mapping aside and
// resuming it applies again, and a measure that counted those would let the
// search call the same scene "the next one" for ever.)
export function stage(w: FireWorld): [number, number, number] {
    const passes = new Set(readings(w).map(r => `${r.story.id}:${r.pass}`));
    return [w.lesson, w.finished.length, passes.size];
}

const past = (a: [number, number, number], b: [number, number, number]) => a.some((x, i) => x > b[i]);

export interface Reach {
    ok: boolean;
    path: string[];         // the commands that get there
    expanded: number;
}

// Best-first search over advancing commands: proof by play. `ok` means the
// path was really played to a state the goal accepts; a search that runs out
// of budget reports `false` and how far it looked, which is a suspicion, not
// a proof of the contrary.
export function can_reach(start: FireWorld, goal: (w: FireWorld) => boolean, budget = 400): Reach {
    if (goal(start)) {
        return { ok: true, path: [], expanded: 0 };
    }
    const seen = new Set([search_key(start)]);
    const frontier: { w: FireWorld, path: string[] }[] = [{ w: start, path: [] }];
    let expanded = 0;
    while (frontier.length > 0 && expanded < budget) {
        frontier.sort((a, b) => progress(b.w) - progress(a.w));
        const node = frontier.shift()!;
        expanded++;
        for (const command of advancing_moves(node.w)) {
            let next: FireWorld | undefined;
            try {
                next = step(node.w, command);
            } catch {
                continue;
            }
            if (next === undefined) {
                continue;
            }
            const key = search_key(next);
            if (seen.has(key)) {
                continue;
            }
            seen.add(key);
            const path = [...node.path, command];
            if (goal(next)) {
                return { ok: true, path, expanded };
            }
            frontier.push({ w: next, path });
        }
    }
    return { ok: false, path: [], expanded };
}

// The next scene boundary: the next apply, the next board closed, the next beat.
export function reaches_next_scene(w: FireWorld, budget = 400): Reach {
    const from = stage(w);
    return can_reach(w, next => past(stage(next), from), budget);
}

function replay_from(w: FireWorld, path: string[]): FireWorld {
    let here = w;
    for (const command of path) {
        here = step(here, command)!;
    }
    return here;
}

// The end of the lesson (l. 481), one scene at a time: every hop is really
// played, so `ok` here means the whole way through was played.
export function reaches_end(w: FireWorld, budget = 400, hops = 40): Reach {
    const path: string[] = [];
    let here = w;
    for (let hop = 0; !ended(here); hop++) {
        if (hop >= hops) {
            return { ok: false, path, expanded: path.length };
        }
        const next = reaches_next_scene(here, budget);
        if (!next.ok) {
            return { ok: false, path, expanded: next.expanded };
        }
        path.push(...next.path);
        here = replay_from(here, next.path);
    }
    return { ok: true, path, expanded: path.length };
}

// CLASSIFYING

// A fold that claims a count folds nothing when the count is zero, and hides
// the whole column when everything is unmapped.
function unmapped_claim(before: FireWorld, after: FireWorld): string | undefined {
    const bar = /▸ (\d+) events? (?:not in the mapping|in neither solution)/.exec(normalise(to_basic_text(story_of(after))));
    if (bar === null) {
        return undefined;
    }
    if (bar[1] === '0') {
        return 'the bar it draws reads "▸ 0 events": every row is in the mapping, so nothing folds';
    }
    const placed_steps = before.mappings.filter(m => m.story === before.board).reduce((n, m) => n + m.placements.length, 0);
    return placed_steps === 0 ? 'nothing is mapped, so it folds every row of the story' : undefined;
}

interface Judged {
    kind: FindingKind | undefined;
    why: string;
}

function judge(before: FireWorld, after: FireWorld, command: string, e: Effect): Judged {
    if (is_display(command)) {
        // Display commands say what they did; if the tree is as it was, they did not do it.
        if (!e.tree_changed()) {
            return { kind: 'NO-OP', why: `it prints "${e.printed}" and nothing on the board changes` };
        }
        const claim = command.endsWith('the unmapped') ? unmapped_claim(before, after) : undefined;
        if (claim !== undefined) {
            return { kind: 'NO-OP', why: `it prints "${e.printed}" but ${claim}` };
        }
        return { kind: undefined, why: '' };
    }
    if (e.printed === '') {
        return e.state_changed || e.tree_changed()
            ? { kind: 'EMPTY', why: 'it changes the scene and prints no consequence at all' }
            : { kind: 'NO-OP', why: 'it prints nothing and changes nothing' };
    }
    return { kind: undefined, why: '' };
}

// THE SCAN

export interface ScanOptions {
    script: string[];
    at?: (index: number) => boolean;    // which states to scan (default: all)
    noise_limit?: number;               // more options than this, with the advancing ones buried, is noise
    reach_budget?: number;              // expansions a reachability proof may take
    per_verb_proofs?: number;           // how many commands of one verb, at one state, are proved
    on_state?: (index: number, total: number, options: number) => void;
}

export interface ScanReport {
    findings: Finding[];
    states: number[];       // the indices scanned
    options: number;        // how many offered commands were applied
    proofs: number;         // how many reachability searches were run
}

export function scan(options: ScanOptions): ScanReport {
    const { script } = options;
    const at = options.at ?? (() => true);
    const noise_limit = options.noise_limit ?? 12;
    const budget = options.reach_budget ?? 400;
    const per_verb_proofs = options.per_verb_proofs ?? 6;
    const worlds = replay(script);
    const findings: Finding[] = [];
    const states: number[] = [];
    let applied = 0;
    let proofs = 0;
    // A state's future depends on its key alone, so one proof serves every
    // command (at any state) that leads to the same key.
    const proved = new Map<string, boolean>();

    for (let i = 0; i < worlds.length; i++) {
        if (!at(i)) {
            continue;
        }
        states.push(i);
        const before = worlds[i];
        const reached_by = script.slice(0, i);
        const offered = commands(before);
        options.on_state?.(i, worlds.length, offered.length);
        const say = (kind: FindingKind, command: string, printed: string, why: string) =>
            findings.push({ kind, at: i, reached_by, command, printed, why });
        const per_verb: { [verb: string]: number } = {};

        // NOISE: a list too long to read, or one where the way on is buried under the display commands.
        const advancing = offered.findIndex(c => !is_quiet(c));
        if (offered.length > noise_limit && advancing > 3) {
            say('NOISE', '', '', `${offered.length} options, and the first that advances anything ("${offered[advancing] ?? 'none'}") is number ${advancing + 1}`);
        }
        const per_event = offered.filter(c => /^(expand|collapse) the /.test(c) && !/(story|steps|unmapped)$/.test(c));
        if (per_event.length > 6) {
            say('NOISE', '', '', `${per_event.length} per-event expand/collapse options: "${per_event[0]}" … "${per_event[per_event.length - 1]}"`);
        }

        for (const command of offered) {
            applied++;
            let after: FireWorld | undefined;
            try {
                after = step(before, command);
            } catch (err) {
                say('THROW', command, '', `${err instanceof Error ? err.message : String(err)}`);
                continue;
            }
            if (after === undefined) {
                say('NO-OP', command, '', 'it is offered by the typeahead but refused when submitted');
                continue;
            }
            let e: Effect;
            let verdict: Judged;
            try {
                e = effect_of(before, after);
                verdict = judge(before, after, command, e);
            } catch (err) {
                say('THROW', command, '', `${err instanceof Error ? err.message : String(err)}`);
                continue;
            }
            if (verdict.kind !== undefined) {
                say(verdict.kind, command, e.printed, verdict.why);
            }

            // What is on offer follows the world's own fields (and, for a
            // chip, what is folded): a command that leaves both alone leaves
            // the way on as it found it, so the costly checks are skipped.
            if (!e.state_changed && !is_display(command)) {
                continue;
            }

            // DEAD END: the lesson cannot be carried on from where this
            // command leaves the player. After l. 481 there is nothing left
            // to carry on to, and that is the point. A hundred `map`s at one
            // state leave a hundred states to prove: a few of each verb is
            // the sample, and a state already proved is free.
            const key = search_key(after);
            const verb = command.split(' ')[0];
            const nth = (per_verb[verb] = (per_verb[verb] ?? 0) + 1);
            if (!ended(after) && (nth <= per_verb_proofs || proved.has(key))) {
                let ok = proved.get(key);
                if (ok === undefined) {
                    proofs++;
                    const reach = reaches_next_scene(after, budget);
                    ok = reach.ok;
                    proved.set(key, ok);
                }
                if (!ok) {
                    say('DEAD END', command, e.printed,
                        'no play from here reaches the next scene: the next apply, the next board closed or the next beat');
                }
            }

            // REPEAT: the same command again, with the same effect again.
            if (!is_quiet(command) && e.state_changed && e.printed !== '') {
                let again: FireWorld | undefined;
                try {
                    again = step(after, command);
                } catch {
                    again = undefined;
                }
                if (again !== undefined) {
                    const e2 = effect_of(after, again);
                    if (e2.printed === e.printed && e2.state_changed) {
                        say('REPEAT', command, e.printed, 'issued twice in a row it advances twice, printing the same thing both times');
                    }
                }
            }
        }
    }
    return { findings, states, options: applied, proofs };
}

// THE REPORT

function reproduce(f: Finding): string {
    const all = [...f.reached_by, ...(f.command === '' ? [] : [f.command])];
    if (all.length <= 10) {
        return `PLAY_WORLD=fire node scripts/play.js ${all.map(c => JSON.stringify(c)).join(' ')}`;
    }
    const last = f.reached_by.slice(-2).map(c => JSON.stringify(c)).join(', ');
    const then = f.command === '' ? 'the option list there' : `then ${JSON.stringify(f.command)}`;
    return `the acceptance script's first ${f.reached_by.length} commands (… ${last}), ${then}`;
}

const ORDER: FindingKind[] = ['THROW', 'NO-OP', 'EMPTY', 'DEAD END', 'REPEAT', 'NOISE'];

export function report_markdown(r: ScanReport, title: string): string {
    const lines: string[] = [`# ${title}`, ''];
    lines.push(`${r.states.length} states scanned, ${r.options} offered commands applied, ${r.proofs} reachability searches run.`, '');
    lines.push(ORDER.map(k => `${k} ${r.findings.filter(f => f.kind === k).length}`).join(' · '), '');
    for (const kind of ORDER) {
        const found = r.findings.filter(f => f.kind === kind);
        if (found.length === 0) {
            continue;
        }
        lines.push(`## ${kind} (${found.length})`, '');
        for (const f of found) {
            lines.push(`- **\`${f.command === '' ? `(the option list after ${f.at} commands)` : f.command}\`** — ${f.why}`);
            if (f.printed !== '') {
                lines.push(`  - printed: "${f.printed.length > 300 ? f.printed.slice(0, 300) + '…' : f.printed}"`);
            }
            lines.push(`  - reach it: ${reproduce(f)}`);
        }
        lines.push('');
    }
    return lines.join('\n');
}
