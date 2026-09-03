/*
    The world state of the Voice of Fire demo (SPEC §3): where in the lesson
    we are, the open board and the cursor on it, the sequences transcribed
    so far, the mappings and what applying them has made the roles, and the
    knowledge tree. Plus small lookups over it and the grammar helpers the
    puffers share.
*/
import { Gist } from 'gist';
import { ConsumeSpec, GAP } from 'parser';
import { Knowledge } from 'story';
import { World } from 'world';
import { Mapping, STORIES, StorySpec, VoiceId, VOICE_OF_FIRE } from './data';
import { RoleEntry } from './judge';

export type SceneId = string;

export interface SequenceState {
    events: number[];       // the frame index of each event, in order
    finished: boolean;
}

export interface FireWorld extends World {
    readonly scene: SceneId;                        // where in the lesson we are (gates the typeahead)
    readonly gist: Gist | undefined;                // what the player just did; labels the frame
    readonly voice: VoiceId | undefined;            // current speaking voice at the board
    readonly board: string | undefined;             // the open story id
    readonly cursor: number | undefined;            // next unconverted ¶ (1-based)
    readonly remainder: string | undefined;         // unconverted tail of the cursor ¶ (two-event lines)
    readonly sequences: { [id: string]: SequenceState };
    readonly frame_voices: { [frame: number]: VoiceId };   // who spoke each story event
    readonly mappings: Mapping[];
    readonly roles: { [role: string]: RoleEntry[] };       // accumulated on apply
    readonly collapsed: string[];                   // ids of collapsed things (display only)
    readonly taught: string[];                      // 'voice' | 'disembodied' | 'abstract'
    readonly said: string[];                        // the classroom lines said so far
    readonly ended: boolean;                        // l. 481 has been said
    readonly knowledge: Knowledge;
}

// LOOKUPS

export function board_story(w: FireWorld): StorySpec | undefined {
    return w.board === undefined ? undefined : STORIES.find(s => s.id === w.board);
}

export function scene_of(story: StorySpec, phase: 'told' | 'ready' | 'transcribing' | 'lined' | 'mapping' | 'second' | 'done'): SceneId {
    return `${story.id}:${phase}`;
}

export function has_said(w: FireWorld, command: string): boolean {
    return w.said.includes(command);
}

export function converted(w: FireWorld, story: StorySpec): number {
    return w.sequences[story.id]?.events.length ?? 0;
}

// The frame index of a transcribed story event, or undefined if it has not been issued yet.
export function event_frame(w: FireWorld, story_id: string, n: number): number | undefined {
    return w.sequences[story_id]?.events[n - 1];
}

function mappings_on(w: FireWorld, story: StorySpec): Mapping[] {
    return w.mappings.filter(m => m.sequence === story.id && m.voice === VOICE_OF_FIRE.voice.id);
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
