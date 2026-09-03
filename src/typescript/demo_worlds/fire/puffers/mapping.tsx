/*
    Mapping (SPEC §4, §6, §7): with the vertical line drawn, the player maps
    steps of the Voice of Fire onto the board's events, erases placements,
    applies the mapping, and sets it aside or resumes it. Applying prints
    the apply text, lets the Fire speak the story in its own terms,
    annotates the mapped rows (in the transcript and in knowledge), and
    fills the roles; setting aside reverses all of that; resuming redoes it.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { createElement, graft, story_updater, Updates as S } from 'story';
import { update } from 'lib/utils';
import { Mapping, StepIndex, STORIES, StorySpec, TWO_LINES, VOICE_OF_FIRE } from '../data';
import { apply as judge_apply, erase, participants, place, role_entries } from '../judge';
import { event_names } from '../names';
import { annotation, annotation_gist, event_gist, exact_gist, paragraphs, remove_gists, rendition, spoken_gist } from '../board';
import {
    applied_mapping, board_story, event_frame, FireWorld, open_mapping, phrase, replace_mapping, scene_of, set_aside_mappings
} from '../world';
import { nudge_frame } from './transcription';

const FIRE = VOICE_OF_FIRE;

function mapping_scene(w: FireWorld, story: StorySpec): boolean {
    return w.scene === scene_of(story, 'mapping') || w.scene === scene_of(story, 'second');
}

// "the mapping", or for the wise man "the first solution" / "the second solution".
function label(story: StorySpec, m: Mapping): string {
    return story.id === 'wise_man' ? `the ${m.pass} solution` : 'the mapping';
}

function do_map(w: FireWorld, story: StorySpec, mapping: Mapping, step: StepIndex, event: number): FireWorld {
    const verdict = place(story, FIRE, mapping, step, event, set_aside_mappings(w, story));
    if (!verdict.ok) {
        return nudge_frame(w, verdict.nudge);
    }
    return update(w, {
        mappings: _ => replace_mapping(_, mapping, verdict.mapping),
        story_updates: story_updater(verdict.mark === undefined ? [] : S.consequence(paragraphs([verdict.mark])))
    });
}

function do_erase(w: FireWorld, mapping: Mapping, step: StepIndex): FireWorld {
    return update(w, { mappings: _ => replace_mapping(_, mapping, erase(mapping, step)) });
}

// The consequences of an applied mapping (SPEC §7.2–4), added to the world; `undo` takes them away again.
function consequences(w: FireWorld, story: StorySpec, m: Mapping, undo: boolean): FireWorld {
    const parts = participants(story, FIRE, m, set_aside_mappings(w, story));
    const entries = role_entries(parts, story.title);
    if (undo) {
        return update(w, {
            roles: r => {
                const result = { ...r };
                for (const e of entries) {
                    result[e.role] = (result[e.role] ?? []).filter(x => x.where !== e.where);
                }
                return result;
            },
            knowledge: k => remove_gists(k, { tag: 'annotation', params: { seq: story.id, pass: m.pass } }),
            story_updates: story_updater(
                S.has_gist(exact_gist(spoken_gist(story.id, m.pass))).remove(),
                S.has_gist({ tag: 'annotation', params: { seq: story.id, pass: m.pass } }).remove()
            )
        });
    }
    return update(w, {
        roles: r => {
            const result = { ...r };
            for (const e of entries) {
                result[e.role] = [...(result[e.role] ?? []), e];
            }
            return result;
        },
        knowledge: k => parts.reduce((acc, p) =>
            graft(acc, exact_gist(event_gist(story.id, p.event)), annotation(story.id, p.event, m.pass, p.role)), k),
        story_updates: story_updater(
            S.description(rendition(story, FIRE, parts, m.pass)),
            parts.map(p => S.frame(event_frame(w, story.id, p.event)!)
                .first(S.has_class('input-text'))
                .add(annotation(story.id, p.event, m.pass, p.role)))
        )
    });
}

function do_apply(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const result = judge_apply(story, FIRE, mapping, set_aside_mappings(w, story));
    if (!result.ok) {
        return nudge_frame(w, result.nudge);
    }
    let next = update(w, {
        mappings: _ => replace_mapping(_, mapping, result.mapping),
        story_updates: story_updater(S.consequence(paragraphs(story.apply_text[mapping.pass] ?? [])))
    });
    next = consequences(next, story, result.mapping, false);
    if (story.id === TWO_LINES.story && mapping.pass === 'first') {
        // The literal solution registers "the two lines" as a sequence of its own (SPEC §5.4).
        next = update(next, {
            sequences: { [TWO_LINES.id]: () => ({ events: TWO_LINES.events.map(e => event_frame(w, story.id, e)!), finished: true }) }
        });
    }
    if (story.id === 'wise_man' && mapping.pass === 'second') {
        // The figurative apply finishes and titles the wise man's story (SPEC §5.4).
        next = update(next, { sequences: { [story.id]: { finished: true } } });
    }
    return next;
}

function do_set_aside(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    let next = consequences(w, story, mapping, true);
    const aside: Mapping = { ...mapping, status: 'set aside' };
    next = update(next, { mappings: _ => replace_mapping(_, mapping, aside) });
    // The next pass opens if the story has a table for it.
    const next_pass = 'second';
    if (story.candidates[FIRE.voice.id]?.[next_pass] !== undefined && open_mapping(next, story) === undefined) {
        next = update(next, {
            mappings: _ => [..._, { voice: FIRE.voice.id, sequence: story.id, pass: next_pass, placements: [], status: 'open' as const }]
        });
    }
    return next;
}

function do_resume(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const resumed: Mapping = { ...mapping, status: 'applied' };
    // Any mapping still open on this board is dropped: the resumed one is the story's reading again.
    let next = update(w, {
        mappings: _ => replace_mapping(_, mapping, resumed).filter(m => !(m.sequence === story.id && m.status === 'open'))
    });
    next = consequences(next, story, resumed, false);
    return next;
}

// Whether `set aside` is offered for this applied mapping (SPEC §6, §9): for
// the wise man's first solution, only once Katya has asked for the second.
function may_set_aside(w: FireWorld, story: StorySpec): boolean {
    if (w.ended) {
        return false;
    }
    if (story.id === 'wise_man') {
        return w.scene === scene_of(story, 'second');
    }
    return true;
}

export const mapping_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const story = board_story(world);
        if (story === undefined || !mapping_scene(world, story)) {
            return parser.eliminate();
        }
        const threads: ParserThread<FireWorld>[] = [];
        const open = open_mapping(world, story);
        const applied = applied_mapping(world, story);
        const names = event_names(story, STORIES);
        const transcribed = world.sequences[story.id]?.events.length ?? 0;

        if (open !== undefined) {
            for (const step of FIRE.steps) {
                for (let n = 1; n <= transcribed; n++) {
                    threads.push(p =>
                        p.consume(['map', GAP, phrase(step.name), GAP, 'to', GAP, phrase(names[n - 1])], () =>
                        p.submit(() => do_map(world, story, open, step.index, n))));
                }
            }
            for (const placement of open.placements) {
                const step = FIRE.steps[placement.step - 1];
                threads.push(p =>
                    p.consume(['erase', GAP, phrase(step.name)], () =>
                    p.submit(() => do_erase(world, open, placement.step))));
            }
            threads.push(p =>
                p.consume(['apply', GAP, phrase(FIRE.voice.name)], () =>
                p.submit(() => do_apply(world, story, open))));
        }
        if (applied !== undefined && may_set_aside(world, story)) {
            threads.push(p =>
                p.consume(['set_aside', GAP, phrase(label(story, applied))], () =>
                p.submit(() => do_set_aside(world, story, applied))));
        }
        if (applied === undefined && !world.ended) {
            for (const m of set_aside_mappings(world, story)) {
                threads.push(p =>
                    p.consume(['resume', GAP, phrase(label(story, m))], () =>
                    p.submit(() => do_resume(world, story, m))));
            }
        }
        return parser.split(threads);
    }
};
