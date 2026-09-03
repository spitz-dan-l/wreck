/*
    The judge (SPEC §4): pure functions that check a placement of a step onto
    an event, or a whole mapping at apply, against the rules L1–L7, and choose
    the nudge Katya says when one fails. Nothing here touches world state.

    L5 (voice-indifference) is kept structurally: no function in this file
    reads an event's voice.

    The rules, in the order a placement is checked:
      L3 order       every step in after(s) lands no later than s
      L7 spoken for  the event is not a target of a set-aside mapping
      L4 candidacy   (s, e) is a row of the candidate table for this pass
      L6 sharing     two steps on one event only if it absorbs both
    and at apply, L1 (every step placed) before all of the above. L2 (one
    target per step) holds by construction: placing a placed step moves it.
*/
import { AbstractSequence, Candidate, CandidateRows, Mapping, Pass, Placement, StepIndex, StoryEventSpec, StorySpec } from './data/types';

export type Rule = 'L1' | 'L3' | 'L4' | 'L6' | 'L7';

export interface Accepted {
    ok: true;
    mapping: Mapping;
    step: StepIndex;
    event: number;
    role: string;
    derives: string;
    mark?: string;
}

export interface Rejected {
    ok: false;
    rule: Rule;
    step?: StepIndex;
    event?: number;
    nudge: string;
}

export type Verdict = Accepted | Rejected;

// What a step's role turned out to be, once a mapping is applied.
export interface Participant {
    step: StepIndex;
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

function step_of(voice: AbstractSequence, index: StepIndex) {
    const step = voice.steps.find(s => s.index === index);
    if (step === undefined) {
        throw new Error(`${voice.voice.name} has no step ${index}.`);
    }
    return step;
}

function event_of(story: StorySpec, index: number): StoryEventSpec | undefined {
    return story.events.find(e => e.index === index);
}

function absorbs(story: StorySpec, event: number): StepIndex[] {
    return event_of(story, event)?.absorbs ?? [];
}

function placed(mapping: Mapping, step: StepIndex): number | undefined {
    return mapping.placements.find(p => p.step === step)?.event;
}

function raw_rows(story: StorySpec, voice: AbstractSequence, pass: Pass): CandidateRows {
    return story.candidates[voice.voice.id]?.[pass] ?? {};
}

function is_set_aside_here(story: StorySpec, voice: AbstractSequence, m: Mapping): boolean {
    return m.status === 'set aside' && m.sequence === story.id && m.voice === voice.voice.id;
}

// The events that a set-aside mapping of this voice onto this story has taken (L7).
export function spoken_for(story: StorySpec, voice: AbstractSequence, set_aside: Mapping[]): number[] {
    const events = new Set<number>();
    for (const m of set_aside) {
        if (is_set_aside_here(story, voice, m)) {
            for (const p of m.placements) {
                events.add(p.event);
            }
        }
    }
    return [...events].sort((a, b) => a - b);
}

// Which pass the next mapping of this voice onto this story is (SPEC §2).
export function pass_for(story: StorySpec, voice: AbstractSequence, mappings: Mapping[]): Pass {
    return mappings.some(m => is_set_aside_here(story, voice, m)) ? 'second' : 'first';
}

// The candidate table for this pass, with the spoken-for events removed (L7).
export function candidates_for(story: StorySpec, voice: AbstractSequence, pass: Pass, set_aside: Mapping[]): CandidateRows {
    const taken = spoken_for(story, voice, set_aside);
    const rows = raw_rows(story, voice, pass);
    const result: CandidateRows = {};
    for (const step of voice.steps) {
        result[step.index] = (rows[step.index] ?? []).filter(c => !taken.includes(c.event));
    }
    return result;
}

export function new_mapping(story: StorySpec, voice: AbstractSequence, pass: Pass): Mapping {
    return { voice: voice.voice.id, sequence: story.id, pass, placements: [], status: 'open' };
}

function with_placement(mapping: Mapping, step: StepIndex, event: number): Mapping {
    const placements: Placement[] = [...mapping.placements.filter(p => p.step !== step), { step, event }];
    placements.sort((a, b) => a.step - b.step);
    return { ...mapping, placements };
}

export function erase(mapping: Mapping, step: StepIndex): Mapping {
    return { ...mapping, placements: mapping.placements.filter(p => p.step !== step) };
}

// NUDGES

// The nudge for a failed placement, by SPEC §4's priority: the candidate
// row's own nudge, if the row exists but another rule failed; else the
// authored nudge for (story, step, event) in this pass; else the default
// for the rule that failed (L3 when a step lands before one of the
// preparation steps it must follow; otherwise, and for L4 and L7, the
// step's own default).
function nudge_for(
    story: StorySpec, voice: AbstractSequence, pass: Pass,
    rule: Rule, step: StepIndex, event: number,
    row: Candidate | undefined, before_root: boolean
): string {
    if (row?.nudge !== undefined) {
        return row.nudge;
    }
    const authored = story.nudges.find(n => n.step === step && n.event === event && (n.pass === undefined || n.pass === pass));
    if (authored !== undefined) {
        return authored.text;
    }
    const step_default = voice.default_nudges.step[step] ?? voice.default_nudges.L1;
    switch (rule) {
        case 'L3': return before_root ? voice.default_nudges.L3 : step_default;
        case 'L6': return voice.default_nudges.L6;
        case 'L1': return voice.default_nudges.L1;
        case 'L4':
        case 'L7': return step_default;
    }
}

// THE RULES

// Every rule that the placement of `step` within `mapping` (which already
// contains it) breaks, in the order the rules are checked; [] if none.
function check_placement(
    story: StorySpec, voice: AbstractSequence, mapping: Mapping, step: StepIndex, set_aside: Mapping[]
): Rejected[] {
    const event = placed(mapping, step);
    if (event === undefined) {
        throw new Error(`Step ${step} is not placed.`);
    }
    const rows = candidates_for(story, voice, mapping.pass, set_aside);
    const row = rows[step]?.find(c => c.event === event);
    const broken: Rejected[] = [];
    const reject = (rule: Rule, before_root = false) =>
        broken.push({ ok: false, rule, step, event, nudge: nudge_for(story, voice, mapping.pass, rule, step, event, row, before_root) });

    // L3: everything this step follows lands no later than it, and it lands
    // no later than everything that follows it. A "root" step is one that
    // follows nothing: the preparation of the fuel.
    const is_root = (s: StepIndex) => step_of(voice, s).after.length === 0;
    const before = step_of(voice, step).after.find(earlier => {
        const e = placed(mapping, earlier);
        return e !== undefined && e > event;
    });
    const after = voice.steps.find(later => {
        const e = placed(mapping, later.index);
        return later.after.includes(step) && e !== undefined && event > e;
    });
    if (before !== undefined) {
        reject('L3', is_root(before));
    } else if (after !== undefined) {
        reject('L3', is_root(step));
    }

    // L7, L4
    if (spoken_for(story, voice, set_aside).includes(event)) {
        reject('L7');
    } else if (row === undefined) {
        reject('L4');
    }

    // L6
    const sharers = mapping.placements.filter(p => p.event === event && p.step !== step).map(p => p.step);
    if (sharers.length > 0) {
        const absorbed = absorbs(story, event);
        if (!absorbed.includes(step) || sharers.some(s => !absorbed.includes(s))) {
            reject('L6');
        }
    }
    return broken;
}

// Place a step on an event; the mapping is unchanged if the placement is rejected.
export function place(
    story: StorySpec, voice: AbstractSequence, mapping: Mapping, step: StepIndex, event: number, set_aside: Mapping[] = []
): Verdict {
    if (event_of(story, event) === undefined) {
        throw new Error(`${story.title} has no event ${event}.`);
    }
    const next = with_placement(mapping, step, event);
    const broken = check_placement(story, voice, next, step, set_aside);
    if (broken.length > 0) {
        return broken[0];
    }
    const row = candidates_for(story, voice, mapping.pass, set_aside)[step]!.find(c => c.event === event)!;
    return {
        ok: true,
        mapping: next,
        step,
        event,
        role: step_of(voice, step).role,
        derives: row.derives,
        ...(row.mark === undefined ? {} : { mark: row.mark })
    };
}

// Every rule the whole mapping breaks, L1 first, then by step.
export function violations(story: StorySpec, voice: AbstractSequence, mapping: Mapping, set_aside: Mapping[] = []): Rejected[] {
    const result: Rejected[] = [];
    for (const step of voice.steps) {
        if (placed(mapping, step.index) === undefined) {
            result.push({ ok: false, rule: 'L1', step: step.index, nudge: voice.default_nudges.L1 });
        }
    }
    for (const p of mapping.placements) {
        result.push(...check_placement(story, voice, mapping, p.step, set_aside));
    }
    return result;
}

// What each step's role has become, for a mapping whose placements are all candidate rows.
export function participants(story: StorySpec, voice: AbstractSequence, mapping: Mapping, set_aside: Mapping[] = []): Participant[] {
    const rows = candidates_for(story, voice, mapping.pass, set_aside);
    return mapping.placements.map(p => {
        const row = rows[p.step]?.find(c => c.event === p.event);
        if (row === undefined) {
            throw new Error(`Step ${p.step} on event ${p.event} is not a candidate row.`);
        }
        return { step: p.step, event: p.event, role: step_of(voice, p.step).role, derives: row.derives };
    });
}

// Apply the mapping: every rule must hold for the whole of it (L1 included).
export function apply(story: StorySpec, voice: AbstractSequence, mapping: Mapping, set_aside: Mapping[] = []): Applied | Rejected {
    const broken = violations(story, voice, mapping, set_aside);
    if (broken.length > 0) {
        return broken[0];
    }
    return {
        ok: true,
        mapping: { ...mapping, status: 'applied' },
        participants: participants(story, voice, mapping, set_aside)
    };
}

// LOAD-TIME LINTS
// Each returns the problems found, or [] if the data is clean.

export function lint_sequence(voice: AbstractSequence): string[] {
    const problems: string[] = [];
    const name = voice.voice.name;
    voice.steps.forEach((step, i) => {
        if (step.index !== i + 1) {
            problems.push(`${name}: step ${i + 1} has index ${step.index}.`);
        }
        for (const a of step.after) {
            if (a === step.index || !voice.steps.some(s => s.index === a)) {
                problems.push(`${name}: step ${step.index} follows a step ${a} that does not exist.`);
            }
        }
        if (!voice.roles.includes(step.role)) {
            problems.push(`${name}: step ${step.index} has the role "${step.role}", which the sequence does not have.`);
        }
        if (voice.default_nudges.step[step.index] === undefined) {
            problems.push(`${name}: step ${step.index} has no default nudge.`);
        }
    });
    return problems;
}

export function lint_story(story: StorySpec, voice: AbstractSequence): string[] {
    const problems: string[] = [];
    const title = story.title;
    const n_prose = story.prose.length;
    const has_event = (e: number) => event_of(story, e) !== undefined;

    // Events: contiguous, in prose order, spoken by the story's voices.
    story.events.forEach((e, i) => {
        if (e.index !== i + 1) {
            problems.push(`${title}: event ${i + 1} has index ${e.index}.`);
        }
        if (!story.voices.includes(e.voice)) {
            problems.push(`${title}: event ${e.index} is spoken by ${e.voice}, which the story does not offer.`);
        }
        if (e.prose < 1 || e.prose > n_prose) {
            problems.push(`${title}: event ${e.index} converts ¶ ${e.prose}, which does not exist.`);
        }
        if (i > 0 && e.prose < story.events[i - 1].prose) {
            problems.push(`${title}: event ${e.index} converts an earlier ¶ than event ${e.index - 1}.`);
        }
        if (e.consequence.length === 0) {
            problems.push(`${title}: event ${e.index} has no consequence.`);
        }
    });

    // Every ¶ is converted or followed, never both; a followed ¶ has an event before it.
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
    }

    // Candidate tables.
    const table = story.candidates[voice.voice.id];
    if (table !== undefined) {
        for (const pass of Object.keys(table) as Pass[]) {
            const rows = table[pass]!;
            for (const step of voice.steps) {
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
        // L6 lint: an event that absorbs steps is a candidate for each of them
        // (in some pass), or the absorption can never be used.
        for (const e of story.events) {
            for (const s of e.absorbs ?? []) {
                if (!voice.steps.some(step => step.index === s)) {
                    problems.push(`${title}: event ${e.index} absorbs a step ${s} that ${voice.voice.name} does not have.`);
                    continue;
                }
                const listed = Object.values(table).some(rows => rows[s]?.some(c => c.event === e.index));
                if (!listed) {
                    problems.push(`${title}: event ${e.index} absorbs step ${s} but is never a candidate for it.`);
                }
            }
        }
    }

    // Authored nudges point at real events, and never at a candidate row of their pass (where they could never be said).
    for (const n of story.nudges) {
        if (!has_event(n.event)) {
            problems.push(`${title}: a nudge for step ${n.step} points at event ${n.event}, which does not exist.`);
        }
        for (const pass of n.pass === undefined ? (['first', 'second'] as Pass[]) : [n.pass]) {
            if (raw_rows(story, voice, pass)[n.step]?.some(c => c.event === n.event)) {
                problems.push(`${title}: the nudge for step ${n.step} on event ${n.event} is a candidate row in the ${pass} pass, so it can never be said.`);
            }
        }
    }
    for (const r of story.apply_reply ?? []) {
        if (!has_event(r.event)) {
            problems.push(`${title}: an apply reply points at event ${r.event}, which does not exist.`);
        }
    }
    return problems;
}
