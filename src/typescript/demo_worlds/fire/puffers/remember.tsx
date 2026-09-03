/*
    Remembering (SPEC §7): an event verbatim with its feeling, a sequence
    verbatim with its "It felt:" list, a role with everything it has been,
    or an abstract sequence in both of its forms. Reprints carry no gists.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, Fragment, lookup_or_throw, StoryNode, story_updater, Updates as S } from 'story';
import { update } from 'lib/utils';
import { ABSTRACT_SEQUENCES, AbstractSequence, FIRE_ROLES, STORIES, StorySpec, SUB_SEQUENCES, VOICE_OF_FIRE } from '../data';
import { AUTHORED, CLASSROOM_EVENTS } from '../data/katya';
import { placed, step_of } from '../judge';
import { event_names, ordinal_names, role_name } from '../names';
import { event_gist, paragraphs, sequence_gist, step_gist, strip_gists } from '../board';
import { applied_mapping, FireWorld, phrase } from '../world';

const FIRE = VOICE_OF_FIRE;

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
        const role = step_of(FIRE, p.step).role;
        if (p.event === n && !roles.includes(role)) {
            roles.push(role);
        }
    }
    const feeling = roles.length > 0
        ? roles.map(r => `— the ${r}, in ${FIRE.voice.name}`)
        : AUTHORED.nothing_yet;
    return remembered(w, [passage, ...paragraphs(feeling)]);
}

// SEQUENCES

function sequence_body(w: FireWorld, story: StorySpec, events: number[], feelings: string[]): Fragment[] {
    const passages = events.map(n => strip_gists(lookup_or_throw(w.knowledge, event_gist(story.id, n))));
    return [...passages, feelings_list(feelings)];
}

function remember_story(w: FireWorld, story: StorySpec): FireWorld {
    const feelings = [...story.feelings];
    if (w.ended && story.grafted_feeling !== undefined) {
        feelings.push(story.grafted_feeling);
    }
    const applied = applied_mapping(w, story);
    if (applied !== undefined) {
        const tinder = placed(applied, 1);
        const derived = story.candidates[FIRE.voice.id]?.[applied.pass]?.[1]?.find(c => c.event === tinder)?.derives;
        feelings.push(`like ${FIRE.voice.name}, because the tinder was ${derived}`);
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

function remember_sequence(w: FireWorld, seq: AbstractSequence): FireWorld {
    return remembered(w, [strip_gists(lookup_or_throw(w.knowledge, sequence_gist(seq.voice.id)))]);
}

function remember_step(w: FireWorld, n: number): FireWorld {
    return remembered(w, [strip_gists(lookup_or_throw(w.knowledge, step_gist(FIRE.voice.id, n)))]);
}

// CLASSROOM EVENTS

interface ClassroomEvent { frame: number; name: string; feeling: string[]; }

// The player's own rememberable frames so far, with ordinals over the whole lesson.
export function classroom_events(w: FireWorld): ClassroomEvent[] {
    const found: { frame: number, command: string }[] = [];
    for (let h: FireWorld | undefined = w.previous; h !== undefined; h = h.previous) {
        const g = h.gist;
        if (g !== undefined && g.tag === 'classroom') {
            found.push({ frame: h.index, command: g.params!.command as string });
        }
    }
    found.reverse();
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
    return remembered(w, [...reprint, ...paragraphs(e.feeling)]);
}

// WHAT CAN BE REMEMBERED

export const remember_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const threads: ParserThread<FireWorld>[] = [];
        const offer = (name: string, f: () => FireWorld) =>
            threads.push(p => p.consume(['remember', GAP, phrase(name)], () => p.submit(f)));

        // The Voice of Fire once it is on the board; its steps and roles once they have their notation (SPEC §9).
        if (world.scene !== 'classroom') {
            offer(FIRE.voice.name, () => remember_sequence(world, FIRE));
        }
        if (world.scene !== 'classroom' && world.scene !== 'chalk') {
            for (const step of FIRE.steps) {
                offer(step.name, () => remember_step(world, step.index));
            }
            for (const role of FIRE_ROLES) {
                offer(role_name(role), () => remember_role(world, role));
            }
        }
        if (world.said.includes('look at the board')) {
            for (const seq of ABSTRACT_SEQUENCES.filter(s => s !== FIRE)) {
                offer(seq.voice.name, () => remember_sequence(world, seq));
            }
        }
        // Story events, once transcribed; stories, once finished; sub-sequences, once registered.
        for (const story of STORIES) {
            const state = world.sequences[story.id];
            if (state === undefined) {
                continue;
            }
            const names = event_names(story, STORIES);
            for (let n = 1; n <= state.events.length; n++) {
                offer(names[n - 1], () => remember_event(world, story, n));
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
