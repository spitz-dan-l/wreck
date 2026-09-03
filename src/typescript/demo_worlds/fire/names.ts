/*
    Names in the grammar (SPEC §2, §6): every event has an authored name;
    repeats within one sequence get ordinals ("the first singing"), repeats
    across sequences are qualified ("the passing of time, in the forest
    fire"); and one global set of names — steps, events, sequences, roles,
    voices — must have no duplicates.
*/
import { AbstractSequence, StorySpec } from './data/types';

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

// "the singing" -> "the second singing".
export function with_ordinal(name: string, nth: number): string {
    if (nth >= ORDINALS.length) {
        throw new Error(`Too many things named "${name}".`);
    }
    return `the ${ORDINALS[nth]} ${name.replace(/^the /, '')}`;
}

// Give ordinals to the names that repeat within one list.
export function ordinal_names(names: string[]): string[] {
    return names.map((name, i) => {
        if (names.filter(n => n === name).length === 1) {
            return name;
        }
        return with_ordinal(name, names.slice(0, i).filter(n => n === name).length);
    });
}

// The names of a story's events, in order: with ordinals within the story,
// and qualified by the story's title where another story has the same name.
export function event_names(story: StorySpec, stories: StorySpec[]): string[] {
    const own = ordinal_names(story.events.map(e => e.name));
    const elsewhere = new Set(stories
        .filter(s => s.id !== story.id)
        .flatMap(s => ordinal_names(s.events.map(e => e.name))));
    return own.map(name => elsewhere.has(name) ? `${name}, in ${story.title}` : name);
}

export function event_name(story: StorySpec, index: number, stories: StorySpec[]): string {
    return event_names(story, stories)[index - 1];
}

// "tinder" -> "the tinder": how a role is named in the grammar.
export function role_name(role: string): string {
    return role.startsWith('the ') || /^[A-Z]/.test(role) ? role : `the ${role}`;
}

// Load-time check (SPEC §6): one global set of names, with no duplicates.
// `extra` holds names the data does not list (further sequence titles, the
// classroom events' names).
export function name_collisions(stories: StorySpec[], sequences: AbstractSequence[], extra: string[] = []): string[] {
    const names: { name: string, what: string }[] = [];
    for (const seq of sequences) {
        names.push({ name: seq.voice.name, what: 'an abstract sequence' });
        for (const step of seq.steps) {
            names.push({ name: step.name, what: `step ${step.index} of ${seq.voice.name}` });
        }
        for (const role of seq.roles) {
            names.push({ name: role_name(role), what: `a role of ${seq.voice.name}` });
        }
    }
    for (const story of stories) {
        names.push({ name: story.title, what: 'a story' });
        event_names(story, stories).forEach((name, i) =>
            names.push({ name, what: `event ${i + 1} of ${story.title}` }));
        for (const v of story.voices) {
            if (!names.some(n => n.name === v && n.what === 'a voice')) {
                names.push({ name: v, what: 'a voice' });
            }
        }
    }
    for (const name of extra) {
        names.push({ name, what: 'an extra name' });
    }

    const problems: string[] = [];
    const seen = new Map<string, string>();
    for (const { name, what } of names) {
        const other = seen.get(name);
        if (other !== undefined && !(other === 'an abstract sequence' && what === 'a voice')) {
            problems.push(`"${name}" names both ${other} and ${what}.`);
        }
        seen.set(name, what);
    }
    return problems;
}
