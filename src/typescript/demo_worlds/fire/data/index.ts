/*
    All the data of the demo in one place: the voices, the two abstract
    sequences, the four stories in lesson order, and small lookups over them.
*/
import { StoryEventSpec, StorySpec } from './types';
import { CAMPFIRE } from './campfire';
import { HOUSE } from './house';
import { FOREST } from './forest';
import { WISE_MAN } from './wise_man';
import { VOICE_OF_FIRE } from './voice_of_fire';
import { PILLAGING } from './pillaging';

export * from './types';
export * from './voices';
export { VOICE_OF_FIRE, FIRE_ROLES } from './voice_of_fire';
export { PILLAGING } from './pillaging';
export { CAMPFIRE, HOUSE, FOREST, WISE_MAN };

export const STORIES: StorySpec[] = [CAMPFIRE, HOUSE, FOREST, WISE_MAN];
export const ABSTRACT_SEQUENCES = [VOICE_OF_FIRE, PILLAGING];

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

// The prose lines that `let it follow` appends to this event: the follows
// lines after its ¶ and before the next converted ¶.
export function followed_lines(story: StorySpec, index: number): number[] {
    const e = event(story, index);
    const next = story.events.find(o => o.prose > e.prose);
    return story.follows.filter(f => f > e.prose && (next === undefined || f < next.prose));
}

// Every paragraph of the event's consequence, the followed lines included.
export function event_consequence(story: StorySpec, index: number): string[] {
    return [
        ...event(story, index).consequence,
        ...followed_lines(story, index).map(f => story.prose[f - 1])
    ];
}
