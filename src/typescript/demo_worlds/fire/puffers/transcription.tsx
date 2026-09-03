/*
    Transcription (SPEC §5, §6): at the open board, the player speaks as a
    voice and issues each ¶'s imperative in that voice, or lets a ¶ follow
    from the previous event. Traps are offered too; they print their nudge
    and change nothing. The prompt sits at the cursor ¶ (the hole moves
    down the left column), each event's frame lands under its ¶, and when
    the last ¶ is converted the player draws the vertical line.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, story_updater, Updates as S } from 'story';
import { update } from 'lib/utils';
import { StoryEventSpec, StorySpec, voice as voice_of, VoiceId } from '../data';
import { AUTHORED, LINE_TEXT, QUOTED } from '../data/katya';
import { new_mapping } from '../judge';
import {
    advance_cursor_ops, classroom_gist, draw_line_ops, event_gist, follow_ops, light_remainder_ops, paragraphs, slug, speak_as_ops, voice_bar_text
} from '../board';
import { board_story, command_spec, converted, FireWorld, phase, phrase, voice_for } from '../world';

// Katya's line when a ¶ is reached during transcription (the house's burning lines, SPEC §5.2).
const REACHED: { [story: string]: { [prose: number]: string[] } } = {
    house: { 10: AUTHORED.burning_lines }
};

function reached(story: StorySpec, from: number, to: number) {
    const text = REACHED[story.id]?.[to];
    return from !== to && text !== undefined ? S.consequence(paragraphs(text)) : [];
}

// Issue the next event of the cursor ¶ in the current voice.
function issue_event(w: FireWorld, story: StorySpec, e: StoryEventSpec): FireWorld {
    const cursor = w.cursor!;
    const next = story.events[converted(w, story) + 1];
    const same_line = next !== undefined && next.prose === e.prose;
    const new_cursor = same_line ? cursor : cursor + 1;
    // Which piece of the ¶ this event converts: how many of its events came before it.
    const piece = story.events.filter(o => o.prose === e.prose && o.index < e.index).length;
    return update(w, {
        gist: () => event_gist(story.id, e.index),
        sequences: { [story.id]: { events: _ => [..._, w.index] } },
        cursor: new_cursor,
        story_updates: story_updater(
            S.consequence(paragraphs(e.consequence)),
            S.frame().css({ event: true, [`voice-${slug(w.voice!)}`]: true }),
            reached(story, cursor, new_cursor),
            same_line ? light_remainder_ops(story, e.prose, piece + 1) : [],
            advance_cursor_ops(story, cursor, new_cursor)
        )
    });
}

// `let it follow`: the cursor ¶ becomes a paragraph of the previous event
// (in knowledge, see event_consequence); the frame shows what followed.
function follow(w: FireWorld, story: StorySpec): FireWorld {
    const cursor = w.cursor!;
    return update(w, {
        cursor: cursor + 1,
        story_updates: story_updater(
            S.consequence(<div className="follows">{'↳ ' + story.prose[cursor - 1]}</div>),
            reached(story, cursor, cursor + 1),
            follow_ops(story, cursor),
            advance_cursor_ops(story, cursor, cursor + 1)
        )
    });
}

// A trap: the nudge is the frame's consequence; nothing else changes.
export function nudge_frame(w: FireWorld, nudge: string): FireWorld {
    return update(w, {
        story_updates: story_updater(S.consequence(paragraphs([nudge])))
    });
}

// Whether the voice has the cursor ¶'s line: the next event to issue is spoken by it.
function has_line_here(w: FireWorld, story: StorySpec, v: VoiceId): boolean {
    const next = story.events[converted(w, story)];
    return next !== undefined && next.prose === w.cursor && next.voices.includes(v);
}

// `speak as`: sets the voice and draws its bar (in the text form too, once
// Katya has taught the notation at l. 350). A voice with no line at the
// cursor is refused with a nudge (SPEC §10); at a consequence-only ¶ no one
// speaks. The first disembodied and the first abstract voice that have a
// line bring Katya's speeches (SPEC §5.3), the abstract one followed by
// l. 419's last sentence.
function speak_as(w: FireWorld, story: StorySpec, v: VoiceId): FireWorld {
    const voice = voice_of(v);
    if (story.follows.includes(w.cursor!)) {
        return nudge_frame(w, 'No one speaks here, my dear. Let it follow.');
    }
    if (!has_line_here(w, story, v)) {
        return nudge_frame(w, `No line here for ${voice.name}, my dear. Who acts?`);
    }
    const kind = voice.kind;
    const speech = kind === 'disembodied' ? AUTHORED.disembodied : kind === 'abstract' ? [...AUTHORED.abstract, ...QUOTED.l419b] : undefined;
    const teach = speech !== undefined && !w.taught.includes(kind);
    return update(w, {
        voice: v,
        taught: _ => teach ? [..._, kind] : _,
        story_updates: story_updater(
            w.taught.includes('voice') ? S.consequence(paragraphs([voice_bar_text(v)])) : [],
            teach ? S.consequence(paragraphs(speech!)) : [],
            speak_as_ops(story, w.index, v, w.voice)
        )
    });
}

// The voices `speak as` offers (SPEC §5): the story's first until the voice notation is taught, then all of them.
function speakable_voices(w: FireWorld, story: StorySpec): VoiceId[] {
    const all = w.taught.includes('voice') ? story.voices : story.voices.slice(0, 1);
    return all.filter(v => v !== w.voice);
}

// `draw a vertical line`: the rule and the right column appear, the hole moves to the ledger, and the mapping opens.
function draw_line(w: FireWorld, story: StorySpec): FireWorld {
    const key = LINE_TEXT[story.id];
    return update(w, {
        gist: () => classroom_gist('draw a vertical line', w.lesson),
        mappings: _ => [..._, new_mapping(story, voice_for(story), 'first', w.index)],
        story_updates: story_updater(
            key === undefined ? [] : S.consequence(paragraphs(QUOTED[key])),
            draw_line_ops(story)
        )
    });
}

export const transcription_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const story = board_story(world);
        const at = story === undefined ? 'closed' : phase(world, story);
        if (story === undefined || (at !== 'transcribing' && at !== 'converted')) {
            return parser.eliminate();
        }
        const threads: ParserThread<FireWorld>[] = [];
        const cursor = world.cursor!;

        if (at === 'converted') {
            threads.push(p => p.consume('draw_a_vertical_line', () => p.submit(() => draw_line(world, story))));
            return parser.split(threads);
        }

        const next = story.events[converted(world, story)];
        if (next !== undefined && next.prose === cursor && world.voice !== undefined && next.voices.includes(world.voice)) {
            threads.push(p => p.consume(phrase(next.command), () => p.submit(() => issue_event(world, story, next))));
        }
        if (story.follows.includes(cursor)) {
            threads.push(p => p.consume('let_it_follow', () => p.submit(() => follow(world, story))));
        }
        for (const trap of story.traps) {
            if ((trap.prose === undefined || trap.prose === cursor) && (trap.voice === undefined || trap.voice === world.voice)) {
                threads.push(p => p.consume(command_spec(trap.command), () => p.submit(() => nudge_frame(world, trap.nudge))));
            }
        }
        for (const v of speakable_voices(world, story)) {
            threads.push(p => p.consume(['speak_as', GAP, phrase(v)], () => p.submit(() => speak_as(world, story, v))));
        }
        return parser.split(threads);
    }
};
