/*
    The world state of the Voice of Fire demo (SPEC §3): which beat of the
    lesson we are in, the open board and the cursor on it, the sequences
    finished, the mappings, and the knowledge tree. Everything else — the
    board's phase, the remainder of a two-event ¶, which lines have been
    said, which frames are a story's events, what the roles have been — is
    derived from the gists that label the frames of the history, in one
    cached walk (`frames_with`). Plus the grammar helpers the puffers share.
*/
import { Gist } from 'gist';
import { ConsumeSpec, GAP } from 'parser';
import { Knowledge } from 'story';
import { World } from 'world';
import { AbstractSequence, ABSTRACT_SEQUENCES, Mapping, Pass, passes, STORIES, story, StorySpec, VoiceId, VOICE_OF_FIRE } from './data';
import { Participant, participants, role_entries } from './judge';

// The beats of the lesson (SPEC §9), in order. `lesson` is the index of the current one.
export const BEAT = {
    classroom: 0, chalk: 1, notation: 2,
    campfire_told: 3, campfire_ready: 4, campfire: 5, campfire_done: 6,
    house_told: 7, house_ready: 8, house: 9, house_done: 10,
    forest_ready: 11, forest: 12, forest_done: 13,
    wise_man_ready: 14, wise_man: 15,
    end: 16
};

// The pattern on the lesson board: the one whose steps Katya writes in beat 0.
export const LESSON_VOICE = VOICE_OF_FIRE;

export interface FireWorld extends World {
    readonly lesson: number;                        // the current beat (BEAT)
    readonly gist: Gist | undefined;                // what the player just did; labels the frame
    readonly voice: VoiceId | undefined;            // current speaking voice at the board
    readonly board: string | undefined;             // the open story id
    readonly cursor: number | undefined;            // next unconverted ¶ (1-based)
    readonly finished: string[];                    // ids of the sequences finished (stories closed, sub-sequences registered)
    readonly mappings: Mapping[];
    readonly collapsed: string[];                   // ids of collapsed things (display only)
    readonly taught: string[];                      // 'voice' | 'disembodied' | 'abstract'
    readonly knowledge: Knowledge;
}

// THE HISTORY

export interface Labelled {
    frame: number;
    params: { [key: string]: string | number };
}

// The frames labelled with a gist of this tag, oldest first (the world's own
// frame included; the frames puffer clears the gist before each command).
// Worlds are immutable and the parser asks many times per keystroke: the
// walk is done once per world.
const frames_cache = new WeakMap<FireWorld, { [tag: string]: Labelled[] }>();

export function frames_with(w: FireWorld, tag: string): Labelled[] {
    let by_tag = frames_cache.get(w);
    if (by_tag === undefined) {
        by_tag = {};
        for (let h: FireWorld | undefined = w; h !== undefined; h = h.previous) {
            const g = h.gist;
            if (g !== undefined) {
                (by_tag[g.tag] ??= []).push({ frame: h.index, params: (g.params ?? {}) as Labelled['params'] });
            }
        }
        for (const found of Object.values(by_tag)) {
            found.reverse();
        }
        frames_cache.set(w, by_tag);
    }
    return by_tag[tag] ?? [];
}

// DERIVED STATE

export function ended(w: FireWorld): boolean {
    return w.lesson === BEAT.end;
}

export function board_story(w: FireWorld): StorySpec | undefined {
    return w.board === undefined ? undefined : story(w.board);
}

// The chip expanded while no board is open (at most one: expanding another
// collapses it). While one is, only display commands and `remember` are
// offered, so no frame or board is ever created inside a chip's ledger. At
// the end the last board stays open and counts as none.
export function expanded_chip(w: FireWorld): StorySpec | undefined {
    if (w.board !== undefined && !ended(w)) {
        return undefined;
    }
    return STORIES.find(s => s.id !== w.board && w.finished.includes(s.id) && !w.collapsed.includes(`${s.id}:chip`));
}

// Where a story's board is: closed; converting its ¶s; converted, awaiting
// the vertical line; lined, awaiting the line that lets the mapping begin (the
// wise man's l. 451); or mapping.
export type Phase = 'closed' | 'transcribing' | 'converted' | 'lined' | 'mapping';

export function phase(w: FireWorld, story: StorySpec): Phase {
    if (w.board !== story.id || w.cursor === undefined) {
        return 'closed';
    }
    if (w.cursor <= story.prose.length) {
        return 'transcribing';
    }
    if (mappings_on(w, story).length === 0) {
        return 'converted';
    }
    if (story.map_after !== undefined && !has_said(w, story.map_after)) {
        return 'lined';
    }
    return 'mapping';
}

// The frames of a story's events, in order: the frames labelled `event(seq, n)`.
export function event_frames(w: FireWorld, story: StorySpec): number[] {
    return frames_with(w, 'event').filter(f => f.params.seq === story.id).map(f => f.frame);
}

export function converted(w: FireWorld, story: StorySpec): number {
    return event_frames(w, story).length;
}

// The frame index of a transcribed story event, or undefined if it has not been issued yet.
export function event_frame(w: FireWorld, story: StorySpec, n: number): number | undefined {
    return event_frames(w, story)[n - 1];
}

// The unconverted tail of the cursor ¶, once its first event has been issued.
export function remainder(w: FireWorld, story: StorySpec): string | undefined {
    const n = converted(w, story);
    const last = story.events[n - 1];
    const next = story.events[n];
    return last !== undefined && next !== undefined && next.prose === last.prose ? last.remainder : undefined;
}

// The classroom commands said so far, oldest first, with the beat they were said in and their names for `remember`.
export interface ClassroomCommand { frame: number; command: string; beat: number; name: string; feeling: string; }

export function classroom_commands(w: FireWorld): ClassroomCommand[] {
    return frames_with(w, 'classroom').map(f => ({
        frame: f.frame, command: f.params.command as string, beat: f.params.beat as number, name: f.params.name as string, feeling: f.params.feeling as string
    }));
}

export function has_said(w: FireWorld, command: string): boolean {
    return classroom_commands(w).some(c => c.command === command);
}

// The frames of a story's `speak as` commands, oldest first: where its voice bars stand.
export function voice_runs(w: FireWorld, story: StorySpec): number[] {
    return frames_with(w, 'speak_as').filter(f => f.params.seq === story.id).map(f => f.frame);
}

// READINGS: every apply in the history, oldest first (the frames labelled `applied(seq, pass)`).

export interface Reading {
    story: StorySpec;
    pass: Pass;
    parts: Participant[];   // what the mapping lit at that frame made of the roles
}

const readings_cache = new WeakMap<FireWorld, Reading[]>();

export function readings(w: FireWorld): Reading[] {
    let found = readings_cache.get(w);
    if (found === undefined) {
        found = [];
        for (let h: FireWorld | undefined = w; h !== undefined; h = h.previous) {
            const g = h.gist;
            if (g !== undefined && g.tag === 'applied') {
                const s = story(g.params!.seq as string);
                const m = h.mappings.find(x => x.story === s.id && x.pass === g.params!.pass)!;
                found.push({ story: s, pass: m.pass, parts: participants(s, pattern_of(m), m) });
            }
        }
        found.reverse();
        readings_cache.set(w, found);
    }
    return found;
}

// Whether this pass of a story has been applied before (its apply text has been printed).
export function has_said_applied(w: FireWorld, story: StorySpec, pass: Pass): boolean {
    return readings(w).some(r => r.story === story && r.pass === pass);
}

// What a role has been (SPEC §7): a history of readings, one per (sequence,
// participant), oldest first; a reading is current if the sequence's lit
// mapping still makes it so, else it was set aside.
export interface RoleReading {
    what: string;
    where: string;      // the sequence's title
    current: boolean;
}

export function role_history(w: FireWorld, role: string): RoleReading[] {
    const result: RoleReading[] = [];
    for (const r of readings(w)) {
        const entry = role_entries(r.parts, r.story.title).find(e => e.role === role);
        if (entry !== undefined && !result.some(x => x.what === entry.what && x.where === entry.where)) {
            const lit = applied_mapping(w, r.story);
            const current = lit !== undefined && participants(r.story, pattern_of(lit), lit).some(p => p.role === role && p.derives === entry.what);
            result.push({ what: entry.what, where: entry.where, current });
        }
    }
    return result;
}

// Whether a story's sequence is finished and titled: its board closed, or (the wise man) its last solution applied.
export function sequence_finished(w: FireWorld, story: StorySpec): boolean {
    const all = passes(story, pattern_for(story).voice.id);
    return w.finished.includes(story.id) || (all.length > 1 && has_said_applied(w, story, all[all.length - 1]));
}

// MAPPINGS

// The mappings on a story's board; of one pattern, if given.
export function mappings_on(w: FireWorld, story: StorySpec, pattern?: AbstractSequence): Mapping[] {
    return w.mappings.filter(m => m.story === story.id && (pattern === undefined || m.voice === pattern.voice.id));
}

export function open_mapping(w: FireWorld, story: StorySpec, pattern?: AbstractSequence): Mapping | undefined {
    return mappings_on(w, story, pattern).find(m => m.status === 'open');
}

export function applied_mapping(w: FireWorld, story: StorySpec): Mapping | undefined {
    return mappings_on(w, story).find(m => m.status === 'applied');
}

export function set_aside_mappings(w: FireWorld, story: StorySpec): Mapping[] {
    return mappings_on(w, story).filter(m => m.status === 'set aside');
}

// The pattern (abstract sequence) a mapping is of.
export function pattern_of(m: Mapping): AbstractSequence {
    return ABSTRACT_SEQUENCES.find(s => s.voice.id === m.voice)!;
}

// A story's own pattern: the lesson's, where the story has a table for it.
export function pattern_for(story: StorySpec): AbstractSequence {
    return story.candidates[LESSON_VOICE.voice.id] === undefined ? ABSTRACT_SEQUENCES.find(s => story.candidates[s.voice.id] !== undefined) ?? LESSON_VOICE : LESSON_VOICE;
}

// The pattern the board is mapping with now: the latest mapping's (the Pillaging, tried after the end), else the story's own.
export function board_pattern(w: FireWorld, story: StorySpec): AbstractSequence {
    const latest = mappings_on(w, story).slice(-1)[0];
    return latest === undefined ? pattern_for(story) : pattern_of(latest);
}

// Replace the mapping that `is` (by identity) with `replacement`.
export function replace_mapping(mappings: Mapping[], is: Mapping, replacement: Mapping): Mapping[] {
    return mappings.map(m => m === is ? replacement : m);
}

// GRAMMAR HELPERS

// A multi-word name as one chunk of a consume spec: "the campfire story" -> "the_campfire_story".
export function phrase(text: string): string {
    return text.split(' ').join('_');
}

// The consume spec for an imperative or a trap: "speak as X" keeps its verb as its own chunk.
export function command_spec(command: string): ConsumeSpec {
    if (command.startsWith('speak as ')) {
        return ['speak_as', GAP, phrase(command.slice('speak as '.length))];
    }
    return phrase(command);
}
