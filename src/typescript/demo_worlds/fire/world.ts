/*
    The world state of the Voice of Fire demo (SPEC §3): which beat of the
    lesson we are in, the open board and the cursor on it, the sequences
    transcribed so far, the mappings, and the knowledge tree. Everything
    else — the board's phase, the remainder of a two-event ¶, which lines
    have been said, what the roles have been — is derived, mostly from the
    gists that label the frames of the history.
    Plus the grammar helpers the puffers share.
*/
import { Gist } from 'gist';
import { ConsumeSpec, GAP } from 'parser';
import { Knowledge } from 'story';
import { World } from 'world';
import { AbstractSequence, ABSTRACT_SEQUENCES, Mapping, Pass, STORIES, StorySpec, VoiceId, VOICE_OF_FIRE } from './data';
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

// The voice on the lesson board: the one whose steps Katya writes in beat 0.
export const LESSON_VOICE = VOICE_OF_FIRE;

export interface SequenceState {
    events: number[];       // the frame index of each event, in order
    finished: boolean;
}

export interface FireWorld extends World {
    readonly lesson: number;                        // the current beat (BEAT)
    readonly gist: Gist | undefined;                // what the player just did; labels the frame
    readonly voice: VoiceId | undefined;            // current speaking voice at the board
    readonly board: string | undefined;             // the open story id
    readonly cursor: number | undefined;            // next unconverted ¶ (1-based)
    readonly sequences: { [id: string]: SequenceState };
    readonly mappings: Mapping[];
    readonly collapsed: string[];                   // ids of collapsed things (display only)
    readonly taught: string[];                      // 'voice' | 'disembodied' | 'abstract'
    readonly knowledge: Knowledge;
}

// DERIVED STATE

export function ended(w: FireWorld): boolean {
    return w.lesson === BEAT.end;
}

export function board_story(w: FireWorld): StorySpec | undefined {
    return w.board === undefined ? undefined : STORIES.find(s => s.id === w.board);
}

// Where a story's board is: closed; converting its ¶s; converted, awaiting
// the vertical line; lined, awaiting the line that opens the mapping (the
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

export function converted(w: FireWorld, story: StorySpec): number {
    return w.sequences[story.id]?.events.length ?? 0;
}

// The unconverted tail of the cursor ¶, once its first event has been issued.
export function remainder(w: FireWorld, story: StorySpec): string | undefined {
    const n = converted(w, story);
    const last = story.events[n - 1];
    const next = story.events[n];
    return last !== undefined && next !== undefined && next.prose === last.prose ? last.remainder : undefined;
}

// The frame index of a transcribed story event, or undefined if it has not been issued yet.
export function event_frame(w: FireWorld, story_id: string, n: number): number | undefined {
    return w.sequences[story_id]?.events[n - 1];
}

// The classroom commands said so far, oldest first: the frames labelled with
// a `classroom` gist (the world's own frame included; the frames puffer
// clears the gist before each command).
export interface ClassroomCommand { frame: number; command: string; beat: number; }

// Worlds are immutable, and the parser asks many times per keystroke: the walk is done once per world.
const classroom_cache = new WeakMap<FireWorld, ClassroomCommand[]>();

export function classroom_commands(w: FireWorld): ClassroomCommand[] {
    const cached = classroom_cache.get(w);
    if (cached !== undefined) {
        return cached;
    }
    const found: ClassroomCommand[] = [];
    for (let h: FireWorld | undefined = w; h !== undefined; h = h.previous) {
        const g = h.gist;
        if (g !== undefined && g.tag === 'classroom') {
            found.push({ frame: h.index, command: g.params!.command as string, beat: g.params!.beat as number });
        }
    }
    found.reverse();
    classroom_cache.set(w, found);
    return found;
}

export function has_said(w: FireWorld, command: string): boolean {
    return classroom_commands(w).some(c => c.command === command);
}

// READINGS: every apply in the history, oldest first (the frames labelled `applied(seq, pass)`).

export interface Reading {
    story: StorySpec;
    pass: Pass;
    parts: Participant[];   // what the mapping lit at that frame made of the roles
}

export function readings(w: FireWorld): Reading[] {
    const found: Reading[] = [];
    for (let h: FireWorld | undefined = w; h !== undefined; h = h.previous) {
        const g = h.gist;
        if (g !== undefined && g.tag === 'applied') {
            const story = STORIES.find(s => s.id === g.params!.seq)!;
            const m = h.mappings.find(x => x.sequence === story.id && x.pass === g.params!.pass)!;
            found.push({ story, pass: m.pass, parts: participants(story, voice_of_mapping(m), m) });
        }
    }
    return found.reverse();
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
            const current = lit !== undefined && participants(r.story, voice_of_mapping(lit), lit).some(p => p.role === role && p.derives === entry.what);
            result.push({ what: entry.what, where: entry.where, current });
        }
    }
    return result;
}

// MAPPINGS

export function mappings_on(w: FireWorld, story: StorySpec): Mapping[] {
    return w.mappings.filter(m => m.sequence === story.id);
}

export function open_mapping(w: FireWorld, story: StorySpec): Mapping | undefined {
    return mappings_on(w, story).find(m => m.status === 'open');
}

export function applied_mapping(w: FireWorld, story: StorySpec): Mapping | undefined {
    return mappings_on(w, story).find(m => m.status === 'applied');
}

export function set_aside_mappings(w: FireWorld, story: StorySpec): Mapping[] {
    return mappings_on(w, story).filter(m => m.status === 'set aside');
}

// The abstract sequence a mapping is of.
export function voice_of_mapping(m: Mapping): AbstractSequence {
    return ABSTRACT_SEQUENCES.find(s => s.voice.id === m.voice)!;
}

// The voice a story's board maps: the one whose candidate table it has (one voice per board).
export function voice_for(story: StorySpec): AbstractSequence {
    return ABSTRACT_SEQUENCES.find(s => story.candidates[s.voice.id] !== undefined) ?? LESSON_VOICE;
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
