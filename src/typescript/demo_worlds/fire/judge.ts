/*
    The judge (SPEC §4): pure functions that check a placement of a step onto
    an event, or a whole mapping at apply, against the rules L1–L7, and choose
    the nudge Katya says when one fails. It reads a `Sequence` — events and
    what they absorb, the candidate tables, the authored nudges — and nothing
    else of a story, so any sequence of events with a table can be judged.

    L5 (voice-indifference) is kept structurally: no function in this file
    reads an event's voices.

    The rules, in the order a placement is checked:
      L3 order       every placed step in after(s) lands no later than s
      L7 spoken for  the event is not a target of a set-aside mapping
      L4 candidacy   (s, e) is a row of the candidate table for this pass
      L6 sharing     two steps on one event only if it absorbs both
    and at apply, L1 (every step placed) before all of the above. L2 (one
    target per step) holds by construction: placing a placed step moves it.
*/
import { AbstractSequence, CandidateRows, Mapping, Pass, Placement, Sequence, StorySpec } from './data/types';
import { capitalised } from './names';

export type Rule = 'L1' | 'L3' | 'L4' | 'L6' | 'L7';
type PlacementRule = Exclude<Rule, 'L1'>;

export interface Accepted {
    ok: true;
    mapping: Mapping;
    derives: string;
    mark?: string;
}

export interface Rejected {
    ok: false;
    rule: Rule;
    step?: number;
    event?: number;
    nudge: string;
}

export type Verdict = Accepted | Rejected;

// What a step's role turned out to be, once a mapping is applied.
export interface Participant {
    step: number;
    event: number;
    role: string;
    derives: string;
}

export interface Applied {
    ok: true;
    mapping: Mapping;
    participants: Participant[];
}

// LOOKUPS

export function step_of(pattern: AbstractSequence, index: number) {
    const step = pattern.steps.find(s => s.index === index);
    if (step === undefined) {
        throw new Error(`${pattern.voice.name} has no step ${index}.`);
    }
    return step;
}

function absorbs(seq: Sequence, event: number): number[] {
    return seq.events.find(e => e.index === event)?.absorbs ?? [];
}

export function placed(mapping: Mapping, step: number): number | undefined {
    return mapping.placements.find(p => p.step === step)?.event;
}

// The candidate table for a pass, as authored.
function raw_rows(seq: Sequence, pattern: AbstractSequence, pass: Pass): CandidateRows {
    return seq.candidates[pattern.voice.id]?.[pass] ?? {};
}

function is_set_aside_here(seq: Sequence, pattern: AbstractSequence, m: Mapping): boolean {
    return m.status === 'set aside' && m.story === seq.id && m.voice === pattern.voice.id;
}

// The events that a set-aside mapping of this voice onto this sequence has taken (L7).
export function spoken_for(seq: Sequence, pattern: AbstractSequence, set_aside: Mapping[]): number[] {
    const events = new Set<number>();
    for (const m of set_aside) {
        if (is_set_aside_here(seq, pattern, m)) {
            for (const p of m.placements) {
                events.add(p.event);
            }
        }
    }
    return [...events].sort((a, b) => a - b);
}

// The candidate table for this pass, with the spoken-for events removed (L7).
export function candidates_for(seq: Sequence, pattern: AbstractSequence, pass: Pass, set_aside: Mapping[]): CandidateRows {
    const taken = spoken_for(seq, pattern, set_aside);
    const rows = raw_rows(seq, pattern, pass);
    const result: CandidateRows = {};
    for (const step of pattern.steps) {
        result[step.index] = (rows[step.index] ?? []).filter(c => !taken.includes(c.event));
    }
    return result;
}

export function new_mapping(seq: Sequence, pattern: AbstractSequence, pass: Pass, id: number): Mapping {
    return { id, voice: pattern.voice.id, story: seq.id, pass, placements: [], status: 'open' };
}

function with_placement(mapping: Mapping, step: number, event: number): Mapping {
    const placements: Placement[] = [...mapping.placements.filter(p => p.step !== step), { step, event }];
    placements.sort((a, b) => a.step - b.step);
    return { ...mapping, placements };
}

export function erase(mapping: Mapping, step: number): Mapping {
    return { ...mapping, placements: mapping.placements.filter(p => p.step !== step) };
}

// NUDGES

// The nudge for a failed placement (SPEC §4): the rule's own text for L3,
// L6 and L7; for L4, the authored (sequence, step, event) nudge if there is
// one, else the sequence's default for this pass, else the step's default.
function nudge_for(seq: Sequence, pattern: AbstractSequence, rule: PlacementRule, step: number, event: number, pass: Pass): string {
    const nudges = pattern.nudges;
    switch (rule) {
        case 'L3': return nudges.L3;
        case 'L6': return nudges.L6;
        case 'L7': return nudges.L7_step[step] ?? nudges.L7;
        case 'L4': {
            const authored = seq.nudges.find(n => n.step === step && n.event === event);
            return authored?.text ?? seq.step_nudges?.[pass]?.[step] ?? nudges.step[step] ?? l1_nudge(pattern, step);
        }
    }
}

function l1_nudge(pattern: AbstractSequence, step: number): string {
    return pattern.nudges.L1.replace('{step}', capitalised(step_of(pattern, step).name));
}

// THE RULES

// Every rule that the placement of `step` within `mapping` (which already
// contains it) breaks, in the order the rules are checked; [] if none.
function check_placement(
    seq: Sequence, pattern: AbstractSequence, mapping: Mapping, step: number, set_aside: Mapping[]
): Rejected[] {
    const event = placed(mapping, step);
    if (event === undefined) {
        throw new Error(`Step ${step} is not placed.`);
    }
    const broken: Rejected[] = [];
    const reject = (rule: PlacementRule) =>
        broken.push({ ok: false, rule, step, event, nudge: nudge_for(seq, pattern, rule, step, event, mapping.pass) });

    // L3: every placed step this one follows lands no later than it, and it
    // lands no later than every placed step that follows it.
    const before = step_of(pattern, step).after.some(earlier => {
        const e = placed(mapping, earlier);
        return e !== undefined && e > event;
    });
    const after = pattern.steps.some(later => {
        const e = placed(mapping, later.index);
        return later.after.includes(step) && e !== undefined && event > e;
    });
    if (before || after) {
        reject('L3');
    }

    // L7, L4
    const rows = candidates_for(seq, pattern, mapping.pass, set_aside);
    if (spoken_for(seq, pattern, set_aside).includes(event)) {
        reject('L7');
    } else if (!rows[step]!.some(c => c.event === event)) {
        reject('L4');
    }

    // L6
    const sharers = mapping.placements.filter(p => p.event === event && p.step !== step).map(p => p.step);
    if (sharers.length > 0) {
        const absorbed = absorbs(seq, event);
        if (!absorbed.includes(step) || sharers.some(s => !absorbed.includes(s))) {
            reject('L6');
        }
    }
    return broken;
}

// Place a step on an event; the mapping is unchanged if the placement is rejected.
export function place(
    seq: Sequence, pattern: AbstractSequence, mapping: Mapping, step: number, event: number, set_aside: Mapping[] = []
): Verdict {
    if (!seq.events.some(e => e.index === event)) {
        throw new Error(`${seq.title} has no event ${event}.`);
    }
    const next = with_placement(mapping, step, event);
    const broken = check_placement(seq, pattern, next, step, set_aside);
    if (broken.length > 0) {
        return broken[0];
    }
    const row = raw_rows(seq, pattern, mapping.pass)[step]!.find(c => c.event === event)!;
    return { ok: true, mapping: next, derives: row.derives, ...(row.mark === undefined ? {} : { mark: row.mark }) };
}

// Every rule the whole mapping breaks, L1 first, then by step.
export function violations(seq: Sequence, pattern: AbstractSequence, mapping: Mapping, set_aside: Mapping[] = []): Rejected[] {
    const result: Rejected[] = [];
    for (const step of pattern.steps) {
        if (placed(mapping, step.index) === undefined) {
            result.push({ ok: false, rule: 'L1', step: step.index, nudge: l1_nudge(pattern, step.index) });
        }
    }
    for (const p of mapping.placements) {
        result.push(...check_placement(seq, pattern, mapping, p.step, set_aside));
    }
    return result;
}

// What each step's role has become: the participant its own table row derives.
// (Reads only the mapping's own pass, never other mappings: a placement's
// participant does not change when a sibling is set aside.)
export function participants(seq: Sequence, pattern: AbstractSequence, mapping: Mapping): Participant[] {
    const rows = raw_rows(seq, pattern, mapping.pass);
    return mapping.placements.map(p => {
        const row = rows[p.step]?.find(c => c.event === p.event);
        if (row === undefined) {
            throw new Error(`Step ${p.step} on event ${p.event} is not a candidate row.`);
        }
        return { step: p.step, event: p.event, role: step_of(pattern, p.step).role, derives: row.derives };
    });
}

// Apply the mapping: every rule must hold for the whole of it (L1 included).
export function apply(seq: Sequence, pattern: AbstractSequence, mapping: Mapping, set_aside: Mapping[] = []): Applied | Rejected {
    const broken = violations(seq, pattern, mapping, set_aside);
    if (broken.length > 0) {
        return broken[0];
    }
    return {
        ok: true,
        mapping: { ...mapping, status: 'applied' },
        participants: participants(seq, pattern, mapping)
    };
}

// The participants grouped by the event they share, in step order (SPEC §7.2).
export function group_by_event(parts: Participant[]): Participant[][] {
    const groups: Participant[][] = [];
    for (const p of parts) {
        const group = groups.find(g => g[0].event === p.event);
        if (group === undefined) {
            groups.push([p]);
        } else {
            group.push(p);
        }
    }
    return groups;
}

// What the roles gain when a mapping is applied (SPEC §7.4): one entry per
// (role, sequence), the first step's participant where several steps share a role.
export interface RoleEntry {
    role: string;
    what: string;
    where: string;
}

export function role_entries(parts: Participant[], where: string): RoleEntry[] {
    const result: RoleEntry[] = [];
    for (const p of parts) {
        if (!result.some(r => r.role === p.role)) {
            result.push({ role: p.role, what: p.derives, where });
        }
    }
    return result;
}

// LOAD-TIME LINTS
// Each returns the problems found, or [] if the data is clean.

export function lint_sequence(pattern: AbstractSequence): string[] {
    const problems: string[] = [];
    const name = pattern.voice.name;
    pattern.steps.forEach((step, i) => {
        if (step.index !== i + 1) {
            problems.push(`${name}: step ${i + 1} has index ${step.index}.`);
        }
        for (const a of step.after) {
            if (a === step.index || !pattern.steps.some(s => s.index === a)) {
                problems.push(`${name}: step ${step.index} follows a step ${a} that does not exist.`);
            }
        }
        if (!pattern.roles.includes(step.role)) {
            problems.push(`${name}: step ${step.index} has the role "${step.role}", which the sequence does not have.`);
        }
        if (pattern.nudges.step[step.index] === undefined) {
            problems.push(`${name}: step ${step.index} has no default nudge.`);
        }
    });
    if (!pattern.nudges.L1.includes('{step}')) {
        problems.push(`${name}: the L1 nudge does not name the missing step.`);
    }
    return problems;
}

// Events: contiguous, in prose order, spoken by the story's voices, named, with a consequence.
function lint_events(story: StorySpec): string[] {
    const problems: string[] = [];
    const title = story.title;
    story.events.forEach((e, i) => {
        if (e.index !== i + 1) {
            problems.push(`${title}: event ${i + 1} has index ${e.index}.`);
        }
        if (e.voices.length === 0) {
            problems.push(`${title}: event ${e.index} has no voice.`);
        }
        for (const v of e.voices) {
            if (!story.voices.includes(v)) {
                problems.push(`${title}: event ${e.index} is spoken by ${v}, which the story does not offer.`);
            }
        }
        if (e.prose < 1 || e.prose > story.prose.length) {
            problems.push(`${title}: event ${e.index} converts ¶ ${e.prose}, which does not exist.`);
        }
        if (i > 0 && e.prose < story.events[i - 1].prose) {
            problems.push(`${title}: event ${e.index} converts an earlier ¶ than event ${e.index - 1}.`);
        }
        if (e.consequence.length === 0) {
            problems.push(`${title}: event ${e.index} has no consequence.`);
        }
        if (e.name === '') {
            problems.push(`${title}: event ${e.index} has no name.`);
        }
    });
    return problems;
}

// Every ¶ is converted or followed, never both; a followed ¶ has an event before it; traps sit on real ¶s and voices.
function lint_prose(story: StorySpec): string[] {
    const problems: string[] = [];
    const title = story.title;
    const n_prose = story.prose.length;
    for (let n = 1; n <= n_prose; n++) {
        const converted = story.events.some(e => e.prose === n);
        const followed = story.follows.includes(n);
        if (converted && followed) {
            problems.push(`${title}: ¶ ${n} is both converted and consequence-only.`);
        }
        if (!converted && !followed) {
            problems.push(`${title}: ¶ ${n} is neither converted nor consequence-only.`);
        }
        if (followed && !story.events.some(e => e.prose < n)) {
            problems.push(`${title}: ¶ ${n} follows nothing.`);
        }
    }
    for (const f of story.follows) {
        if (f < 1 || f > n_prose) {
            problems.push(`${title}: follows ¶ ${f}, which does not exist.`);
        }
    }
    for (const t of story.traps) {
        if (t.prose !== undefined && (t.prose < 1 || t.prose > n_prose)) {
            problems.push(`${title}: a trap is set at ¶ ${t.prose}, which does not exist.`);
        }
        if (t.voice !== undefined && !story.voices.includes(t.voice)) {
            problems.push(`${title}: a trap is set in the voice of ${t.voice}, which the story does not offer.`);
        }
    }
    return problems;
}

// The candidate tables for a voice: every step has rows on real events, once
// each; an apply text per pass; an absorbed step is a candidate somewhere;
// an authored nudge is not a row in every pass.
function lint_tables(story: StorySpec, pattern: AbstractSequence): string[] {
    const problems: string[] = [];
    const title = story.title;
    const has_event = (e: number) => story.events.some(ev => ev.index === e);
    const table = story.candidates[pattern.voice.id];
    if (table === undefined) {
        return problems;
    }
    const passes = Object.keys(table) as Pass[];
    for (const pass of passes) {
        const rows = table[pass]!;
        for (const step of pattern.steps) {
            const cands = rows[step.index];
            if (cands === undefined || cands.length === 0) {
                problems.push(`${title}, ${pass} pass: step ${step.index} has no candidates.`);
                continue;
            }
            const seen = new Set<number>();
            for (const c of cands) {
                if (!has_event(c.event)) {
                    problems.push(`${title}, ${pass} pass: step ${step.index} may land on event ${c.event}, which does not exist.`);
                }
                if (seen.has(c.event)) {
                    problems.push(`${title}, ${pass} pass: step ${step.index} lists event ${c.event} twice.`);
                }
                seen.add(c.event);
            }
        }
        if (story.apply_text[pass] === undefined) {
            problems.push(`${title}: no apply text for the ${pass} pass.`);
        }
    }
    for (const e of story.events) {
        for (const s of e.absorbs ?? []) {
            if (!pattern.steps.some(step => step.index === s)) {
                problems.push(`${title}: event ${e.index} absorbs a step ${s} that ${pattern.voice.name} does not have.`);
                continue;
            }
            if (!passes.some(pass => table[pass]![s]?.some(c => c.event === e.index))) {
                problems.push(`${title}: event ${e.index} absorbs step ${s} but is never a candidate for it.`);
            }
        }
    }
    for (const n of story.nudges) {
        if (!has_event(n.event)) {
            problems.push(`${title}: a nudge for step ${n.step} points at event ${n.event}, which does not exist.`);
        }
        if (passes.every(pass => table[pass]![n.step]?.some(c => c.event === n.event))) {
            problems.push(`${title}: the nudge for step ${n.step} on event ${n.event} is a candidate row in every pass, so it can never be said.`);
        }
    }
    return problems;
}

export function lint_story(story: StorySpec, pattern: AbstractSequence): string[] {
    return [...lint_events(story), ...lint_prose(story), ...lint_tables(story, pattern)];
}
