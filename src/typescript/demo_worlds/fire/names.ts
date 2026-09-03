/*
    Names for events (SPEC §2, §6): a command is nominalised into a noun
    phrase ("lay the tinder in the pit" -> "the laying of the tinder in the
    pit"), repeats within one sequence get ordinals ("the first singing"),
    and no event name may equal a step name or a sequence title.
*/
import { AbstractSequence, StorySpec } from './data/types';

// The command that adds a paragraph to the previous event. It is not an event and never gets a name.
export const LET_IT_FOLLOW = 'let it follow';

// Gerunds the spelling rules below would get wrong.
const IRREGULAR_GERUNDS: { [verb: string]: string } = {
    be: 'being',
    die: 'dying',
    lie: 'lying',
    tie: 'tying',
    see: 'seeing',
    travel: 'traveling'
};

// Every verb that begins a command (or a coordinated clause of one) in the demo.
const VERBS = new Set([
    'lay', 'stack', 'spark', 'spread', 'burn', 'reduce',
    'live', 'enter', 'take',
    'travel', 'gather', 'dig', 'pile', 'light', 'touch', 'sing', 'add', 'sleep',
    'pack', 'cut', 'build', 'raise', 'move', 'hurl', 'scatter',
    'turn', 'grow', 'sprout', 'pass', 'bring', 'consume', 'stop',
    'be', 'acquire', 'seek', 'gain', 'give', 'write', 'die', 'construct', 'attend', 'adjust', 'embellish'
]);

// Particles that stay with the verb: "write down his teachings" -> "the writing down of his teachings".
// ("in" and "on" are treated as prepositions instead: "move in", "sleep in tents".)
const PARTICLES = new Set(['up', 'down', 'out', 'off', 'away', 'back']);

// Words after which no "of" is inserted: prepositions, and the adverbs and
// adjectives the commands use as complements ("die unexpectedly", "turn dry").
const NO_OF = new Set([
    'to', 'in', 'on', 'at', 'into', 'onto', 'across', 'over', 'under', 'for', 'with', 'from', 'by', 'through', 'about',
    'unexpectedly', 'dry', 'hot', 'born', 'read', 'and'
]);

const ORDINALS = ['first', 'second', 'third', 'fourth', 'fifth', 'sixth', 'seventh', 'eighth', 'ninth', 'tenth'];

export function gerund(verb: string): string {
    const irregular = IRREGULAR_GERUNDS[verb];
    if (irregular !== undefined) {
        return irregular;
    }
    if (verb.endsWith('ie')) {
        return verb.slice(0, -2) + 'ying';
    }
    if (verb.endsWith('e') && !verb.endsWith('ee')) {
        return verb.slice(0, -1) + 'ing';
    }
    if (is_monosyllabic_cvc(verb)) {
        return verb + verb[verb.length - 1] + 'ing';
    }
    return verb + 'ing';
}

// "dig", "stop", "cut": one syllable, ending consonant-vowel-consonant (not w, x or y).
function is_monosyllabic_cvc(verb: string): boolean {
    const vowel = (c: string) => 'aeiou'.includes(c);
    const syllables = verb.replace(/[^aeiouy]+/g, ' ').trim().split(' ').length;
    if (syllables !== 1 || verb.length < 3) {
        return false;
    }
    const [a, b, c] = verb.slice(-3);
    return !vowel(a) && vowel(b) && !vowel(c) && !'wxy'.includes(c);
}

// The noun phrase for a command; undefined for `let it follow`.
export function nominalise(command: string): string | undefined {
    if (command === LET_IT_FOLLOW) {
        return undefined;
    }
    const clauses = split_clauses(command.split(' '));
    return 'the ' + clauses.map(nominalise_clause).join(' and ');
}

// "grow up and acquire wisdom" -> ["grow up", "acquire wisdom"]: split at an "and" that starts a new verb.
function split_clauses(words: string[]): string[][] {
    const clauses: string[][] = [[]];
    for (let i = 0; i < words.length; i++) {
        if (words[i] === 'and' && i + 1 < words.length && VERBS.has(words[i + 1]) && clauses[clauses.length - 1].length > 0) {
            clauses.push([]);
            continue;
        }
        clauses[clauses.length - 1].push(words[i]);
    }
    return clauses;
}

function nominalise_clause(words: string[]): string {
    const [verb, ...rest] = words;
    let head = gerund(verb);
    if (rest.length > 0 && PARTICLES.has(rest[0])) {
        head += ' ' + rest.shift();
    }
    if (rest.length === 0) {
        return head;
    }
    if (verb === 'be' || NO_OF.has(rest[0])) {
        return [head, ...rest].join(' ');
    }
    return [head, 'of', ...rest].join(' ');
}

// The names of a story's events, in order, with ordinals where a name repeats.
export function event_names(story: StorySpec): string[] {
    const bare = story.events.map(e => {
        const name = e.name ?? nominalise(e.command);
        if (name === undefined) {
            throw new Error(`The command "${e.command}" cannot name an event.`);
        }
        return name;
    });
    return bare.map((name, i) => {
        const same = bare.filter(n => n === name).length;
        if (same === 1) {
            return name;
        }
        const nth = bare.slice(0, i).filter(n => n === name).length;
        if (nth >= ORDINALS.length) {
            throw new Error(`Too many events named "${name}" in ${story.title}.`);
        }
        return `the ${ORDINALS[nth]} ${name.replace(/^the /, '')}`;
    });
}

export function event_name(story: StorySpec, index: number): string {
    return event_names(story)[index - 1];
}

// Every name in the grammar that an event name could be confused with.
export function reserved_names(stories: StorySpec[], sequences: AbstractSequence[]): string[] {
    return [
        ...stories.map(s => s.title),
        ...sequences.map(s => s.voice.name),
        ...sequences.flatMap(s => s.steps.map(step => step.name))
    ];
}

// Load-time check (SPEC §6): problems found, or [] if the names are all distinct.
export function name_collisions(stories: StorySpec[], sequences: AbstractSequence[]): string[] {
    const problems: string[] = [];
    const reserved = reserved_names(stories, sequences);
    const seen = new Map<string, string>();
    for (const r of reserved) {
        if (seen.has(r)) {
            problems.push(`"${r}" names two different things.`);
        }
        seen.set(r, 'reserved');
    }
    for (const story of stories) {
        const names = event_names(story);
        for (const name of names) {
            if (reserved.includes(name)) {
                problems.push(`The event "${name}" in ${story.title} has the same name as a step or a sequence.`);
            }
            if (names.filter(n => n === name).length > 1) {
                problems.push(`Two events in ${story.title} are both named "${name}".`);
            }
        }
    }
    return problems;
}
