/*
    Remembering (SPEC §7): an event verbatim with its feeling, a sequence
    verbatim with its "It felt:" list, a role with everything it has been,
    or an abstract sequence in both of its forms. Reprints carry no gists.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, Fragment, lookup_or_throw, StoryNode, story_updater, Updates as S } from 'story';
import { update } from 'lib/utils';
import { ABSTRACT_SEQUENCES, AbstractSequence, EVENT_NAMES, STORIES, StorySpec, SUB_SEQUENCES } from '../data';
import { AUTHORED, CLASSROOM_EVENTS } from '../data/katya';
import { participants, step_of } from '../judge';
import { ordinal_names, role_name } from '../names';
import { event_gist, paragraphs, sequence_passage, step_gist, strip_gists } from '../board';
import { applied_mapping, BEAT, classroom_commands, ended, FireWorld, has_said, LESSON_VOICE, phrase, voice_of_mapping } from '../world';

function remembered(w: FireWorld, body: Fragment[]): FireWorld {
    return update(w, { story_updates: story_updater(S.description(<div className="memory">{body}</div>)) });
}

function feelings_list(lines: string[]): StoryNode {
    return <div className="feelings">
        <div>It felt:</div>
        {lines.map(l => <div>{`— ${l}`}</div>)}
    </div> as StoryNode;
}

// STORY EVENTS

function remember_event(w: FireWorld, story: StorySpec, n: number): FireWorld {
    const passage = strip_gists(lookup_or_throw(w.knowledge, event_gist(story.id, n)));
    const applied = applied_mapping(w, story);
    const roles: string[] = [];
    for (const p of applied?.placements ?? []) {
        const role = step_of(voice_of_mapping(applied!), p.step).role;
        if (p.event === n && !roles.includes(role)) {
            roles.push(role);
        }
    }
    const feeling = roles.length > 0
        ? [`It felt like ${roles.map(role_name).join(', and ')}, in ${voice_of_mapping(applied!).voice.name}.`]
        : AUTHORED.nothing_yet;
    return remembered(w, [...paragraphs(AUTHORED.went_like_this), passage, ...paragraphs(feeling)]);
}

// SEQUENCES

function sequence_body(w: FireWorld, story: StorySpec, events: number[], feelings: string[]): Fragment[] {
    const passages = events.map(n => strip_gists(lookup_or_throw(w.knowledge, event_gist(story.id, n))));
    return [...paragraphs(AUTHORED.went_like_this), ...passages, feelings_list(feelings)];
}

function remember_story(w: FireWorld, story: StorySpec): FireWorld {
    const feelings = [...story.feelings];
    if (ended(w) && story.grafted_feeling !== undefined) {
        feelings.push(story.grafted_feeling);
    }
    const applied = applied_mapping(w, story);
    if (applied !== undefined) {
        const voice = voice_of_mapping(applied);
        const first = participants(story, voice, applied).find(p => p.step === voice.steps[0].index);
        if (first !== undefined) {
            feelings.push(`like ${voice.voice.name}, because ${role_name(first.role)} was ${first.derives}`);
        }
    }
    return remembered(w, sequence_body(w, story, story.events.map(e => e.index), feelings));
}

// ROLES

function remember_role(w: FireWorld, role: string): FireWorld {
    const entries = w.roles[role] ?? [];
    const name = role_name(role);
    const text = entries.length === 0
        ? `Nothing has been ${name} yet.`
        : `${name[0].toUpperCase()}${name.slice(1)} has been: ${entries.map(e => `${e.what}, in ${e.where}`).join('; ')}.`;
    return remembered(w, paragraphs([text]));
}

// ABSTRACT SEQUENCES AND STEPS

// The lesson's voice in the chalk form alone until Katya has written the notation (l. 182).
function remember_sequence(w: FireWorld, seq: AbstractSequence): FireWorld {
    const with_notation = seq !== LESSON_VOICE || w.lesson > BEAT.chalk;
    return remembered(w, [strip_gists(sequence_passage(seq, with_notation))]);
}

function remember_step(w: FireWorld, n: number): FireWorld {
    return remembered(w, [strip_gists(lookup_or_throw(w.knowledge, step_gist(LESSON_VOICE.voice.id, n)))]);
}

// CLASSROOM EVENTS

interface ClassroomEvent { frame: number; name: string; feeling: string[]; }

// The player's own rememberable frames so far, with ordinals over the whole lesson.
export function classroom_events(w: FireWorld): ClassroomEvent[] {
    const found = classroom_commands(w);
    const names = ordinal_names(found.map(f => CLASSROOM_EVENTS[f.command].name));
    return found.map((f, i) => ({
        frame: f.frame,
        name: names[i],
        feeling: CLASSROOM_EVENTS[f.command].feeling === undefined ? AUTHORED.nothing_in_particular : [CLASSROOM_EVENTS[f.command].feeling!]
    }));
}

function remember_classroom_event(w: FireWorld, e: ClassroomEvent): FireWorld {
    const found = S.frame(e.frame).query(w.story);
    const reprint = found.length === 0 ? [] : [strip_gists(found[0][0])];
    return remembered(w, [...paragraphs(AUTHORED.went_like_this), ...reprint, ...paragraphs(e.feeling)]);
}

// WHAT CAN BE REMEMBERED

export const remember_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const threads: ParserThread<FireWorld>[] = [];
        const offer = (name: string, f: () => FireWorld) =>
            threads.push(p => p.consume(['remember', GAP, phrase(name)], () => p.submit(f)));

        // The lesson's voice once it is on the board; its steps and roles once they have their notation (SPEC §9).
        if (world.lesson >= BEAT.chalk) {
            offer(LESSON_VOICE.voice.name, () => remember_sequence(world, LESSON_VOICE));
        }
        if (world.lesson >= BEAT.notation) {
            for (const step of LESSON_VOICE.steps) {
                offer(step.name, () => remember_step(world, step.index));
            }
            for (const role of LESSON_VOICE.roles) {
                offer(role_name(role), () => remember_role(world, role));
            }
        }
        if (has_said(world, 'look at the board')) {
            for (const seq of ABSTRACT_SEQUENCES.filter(s => s !== LESSON_VOICE)) {
                offer(seq.voice.name, () => remember_sequence(world, seq));
            }
        }
        // Story events, once transcribed; stories, once finished; sub-sequences, once registered.
        for (const story of STORIES) {
            const state = world.sequences[story.id];
            if (state === undefined) {
                continue;
            }
            for (let n = 1; n <= state.events.length; n++) {
                offer(EVENT_NAMES[story.id][n - 1], () => remember_event(world, story, n));
            }
            if (state.finished) {
                offer(story.title, () => remember_story(world, story));
            }
        }
        for (const sub of SUB_SEQUENCES) {
            if (world.sequences[sub.id] !== undefined) {
                const story = STORIES.find(s => s.id === sub.story)!;
                offer(sub.title, () => remembered(world, sequence_body(world, story, sub.events, sub.feelings)));
            }
        }
        // The player's own classroom events.
        for (const e of classroom_events(world)) {
            offer(e.name, () => remember_classroom_event(world, e));
        }
        return parser.split(threads);
    }
};
