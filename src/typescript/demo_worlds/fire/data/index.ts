/*
    All the data of the demo in one place: the voices, the two abstract
    sequences, the four stories in lesson order, the sub-sequence, the event
    names computed once, and small lookups over them.
*/
import { AbstractSequence, Pass, StoryEventSpec, StorySpec, SubSequenceSpec } from './types';
import { CAMPFIRE } from './campfire';
import { HOUSE } from './house';
import { FOREST } from './forest';
import { TWO_LINES, WISE_MAN } from './wise_man';
import { VOICE_OF_FIRE } from './voice_of_fire';
import { PILLAGING } from './pillaging';
import { event_names } from '../names';

export * from './types';
export * from './voices';
export { VOICE_OF_FIRE, FIRE_ROLES } from './voice_of_fire';
export { PILLAGING } from './pillaging';
export { CAMPFIRE, HOUSE, FOREST, WISE_MAN, TWO_LINES };

export const STORIES: StorySpec[] = [CAMPFIRE, HOUSE, FOREST, WISE_MAN];
export const SUB_SEQUENCES: SubSequenceSpec[] = [TWO_LINES];
export const ABSTRACT_SEQUENCES: AbstractSequence[] = [VOICE_OF_FIRE, PILLAGING];

// The player's own frames, as a sequence (SPEC §2). Never mapped in the demo.
export const TODAYS_LESSON = "today's lesson";

// Every event's name in the grammar, with ordinals and qualification (SPEC §6), computed once.
export const EVENT_NAMES: { [story: string]: string[] } = {};
for (const s of STORIES) {
    EVENT_NAMES[s.id] = event_names(s, STORIES);
}

export function story(id: string): StorySpec {
    const s = STORIES.find(s => s.id === id);
    if (s === undefined) {
        throw new Error(`There is no story with the id ${id}.`);
    }
    return s;
}

export function event(story: StorySpec, index: number): StoryEventSpec {
    const e = story.events.find(e => e.index === index);
    if (e === undefined) {
        throw new Error(`${story.title} has no event ${index}.`);
    }
    return e;
}

// The passes a story's table has for a voice: one, or two where a second solution exists.
export function passes(story: StorySpec, voice: string): Pass[] {
    const table = story.candidates[voice] ?? {};
    return (['first', 'second'] as Pass[]).filter(p => table[p] !== undefined);
}

// The prose lines that `let it follow` appends to this event: a
// consequence-only ¶ belongs to exactly one event, the last event whose ¶
// precedes it (SPEC §7).
export function followed_lines(story: StorySpec, index: number): number[] {
    const e = event(story, index);
    return story.follows.filter(f => f > e.prose && !story.events.some(o => o.index > e.index && o.prose < f));
}

// Every paragraph of the event's consequence, the followed lines included.
export function event_consequence(story: StorySpec, index: number): string[] {
    return [
        ...event(story, index).consequence,
        ...followed_lines(story, index).map(f => story.prose[f - 1])
    ];
}
