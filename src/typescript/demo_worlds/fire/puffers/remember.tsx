/*
    Remembering (SPEC §7): an event verbatim with its feeling, a sequence
    verbatim with its "It felt:" list, a role with everything it has been,
    a pattern in both of its forms, or one of the player's own classroom
    events. Reprints carry no gists.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, Fragment, lookup_or_throw, StoryNode, story_updater, Updates as S } from 'story';
import { update } from 'lib/utils';
import { ABSTRACT_SEQUENCES, AbstractSequence, EVENT_NAMES, STORIES, story as story_of, StorySpec, SUB_SEQUENCES } from '../data';
import { AUTHORED } from '../data/katya';
import { participants, role_entries } from '../judge';
import { capitalised, ordinal_names, role_name } from '../names';
import { event_gist, paragraphs, sequence_passage, step_gist, strip_gists } from '../board';
import {
    applied_mapping, BEAT, classroom_commands, converted, ended, FireWorld, has_said, LESSON_VOICE, pattern_for, pattern_of, phrase, readings, role_history,
    sequence_finished
} from '../world';

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

// The event's passage, and how it felt: the roles the lit mapping gives it;
// else, from the history of readings, the roles its latest set-aside reading
// gave it, marked; else nothing yet.
function remember_event(w: FireWorld, story: StorySpec, n: number): FireWorld {
    const passage = strip_gists(lookup_or_throw(w.knowledge, event_gist(story.id, n)));
    const applied = applied_mapping(w, story);
    const lit = applied === undefined ? undefined : participants(story, pattern_of(applied), applied).filter(p => p.event === n);
    const reading = lit !== undefined && lit.length > 0
        ? { parts: lit, current: true }
        : readings(w).filter(r => r.story === story && r.parts.some(p => p.event === n)).map(r => ({ parts: r.parts.filter(p => p.event === n), current: false })).pop();
    const feeling = reading === undefined
        ? AUTHORED.nothing_yet
        : [`It felt like ${role_entries(reading.parts, story.title).map(r => role_name(r.role)).join(', and ')}, in ${pattern_for(story).voice.name}${reading.current ? '.' : '; set aside.'}`];
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
        const pattern = pattern_of(applied);
        const first = participants(story, pattern, applied).find(p => p.step === pattern.steps[0].index);
        if (first !== undefined) {
            // The road not taken (SPEC §7): what the first step's role was in earlier readings of this pass, latest first.
            const before: string[] = [];
            for (const r of readings(w).filter(r => r.story === story && r.pass === applied.pass).reverse()) {
                const was = r.parts.find(p => p.step === first.step)?.derives;
                if (was !== undefined && was !== first.derives && !before.includes(was)) {
                    before.push(was);
                }
            }
            feelings.push(`like ${pattern.voice.name}, because ${role_name(first.role)} was ${[first.derives, ...before].join(', and before that ')}`);
        }
    }
    return remembered(w, sequence_body(w, story, story.events.map(e => e.index), feelings));
}

// ROLES

// A history of readings, the set-aside ones kept and marked (SPEC §7).
function remember_role(w: FireWorld, role: string): FireWorld {
    const entries = role_history(w, role);
    const name = role_name(role);
    const text = entries.length === 0
        ? `Nothing has been ${name} yet.`
        : `${capitalised(name)} has been: ${entries.map(e => `${e.what}, in ${e.where}${e.current ? '' : ', set aside'}`).join('; ')}.`;
    return remembered(w, paragraphs([text]));
}

// PATTERNS AND STEPS

// The lesson's pattern in the chalk form alone until Katya has written the notation (l. 182).
function remember_pattern(w: FireWorld, pattern: AbstractSequence): FireWorld {
    const with_notation = pattern !== LESSON_VOICE || w.lesson > BEAT.chalk;
    return remembered(w, [strip_gists(sequence_passage(pattern, with_notation))]);
}

function remember_step(w: FireWorld, n: number): FireWorld {
    return remembered(w, [strip_gists(lookup_or_throw(w.knowledge, step_gist(LESSON_VOICE.voice.id, LESSON_VOICE.voice.id, n)))]);
}

// CLASSROOM EVENTS

interface ClassroomEvent { frame: number; name: string; feeling: string }

// The player's own rememberable frames so far, with ordinals over the whole
// lesson. Only the three with an authored feeling (SPEC §10, §12's cut
// order): "the listening" and its like had nothing of their own to say, and
// one entry per line said filled the option list (Phase B9).
export function classroom_events(w: FireWorld): ClassroomEvent[] {
    const found = classroom_commands(w);
    const names = ordinal_names(found.map(f => f.name));
    return found.map((f, i) => ({ frame: f.frame, name: names[i], feeling: f.feeling })).filter(e => e.feeling !== '');
}

function remember_classroom_event(w: FireWorld, e: ClassroomEvent): FireWorld {
    const found = S.frame(e.frame).query(w.story);
    const reprint = found.length === 0 ? [] : [strip_gists(found[0][0])];
    return remembered(w, [...paragraphs(AUTHORED.went_like_this), ...reprint, ...paragraphs([e.feeling])]);
}

// WHAT CAN BE REMEMBERED

export const remember_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const threads: ParserThread<FireWorld>[] = [];
        const offer = (name: string, f: () => FireWorld) =>
            threads.push(p => p.consume(['remember', GAP, phrase(name)], () => p.submit(f)));

        // The lesson's pattern once it is on the board; its steps and roles once they have their notation (SPEC §9).
        if (world.lesson >= BEAT.chalk) {
            offer(LESSON_VOICE.voice.name, () => remember_pattern(world, LESSON_VOICE));
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
            for (const pattern of ABSTRACT_SEQUENCES.filter(s => s !== LESSON_VOICE)) {
                offer(pattern.voice.name, () => remember_pattern(world, pattern));
            }
        }
        // Story events, once transcribed; stories, once finished; sub-sequences, once registered.
        for (const story of STORIES) {
            for (let n = 1; n <= converted(world, story); n++) {
                offer(EVENT_NAMES[story.id][n - 1], () => remember_event(world, story, n));
            }
            if (sequence_finished(world, story)) {
                offer(story.title, () => remember_story(world, story));
            }
        }
        for (const sub of SUB_SEQUENCES) {
            if (world.finished.includes(sub.id)) {
                offer(sub.title, () => remembered(world, sequence_body(world, story_of(sub.story), sub.events, sub.feelings)));
            }
        }
        // The player's own classroom events.
        for (const e of classroom_events(world)) {
            offer(e.name, () => remember_classroom_event(world, e));
        }
        return parser.split(threads);
    }
};
