/*
    Mapping (SPEC §4, §6, §7): with the vertical line drawn, the player maps
    steps of the board's pattern onto its events, erases placements, applies
    the mapping, and sets it aside or resumes it. A placement puts a badge
    on the row and a reference under the step; applying prints the apply
    text (the first time), lets the Fire speak under each step and
    annotates the mapped rows (in the transcript and in knowledge); setting
    aside reverses all of that and hollows the badges; resuming redoes it.
    What the roles have been is read from the history (world.ts readings).

    Setting aside the last pass of a story (or its only one) reopens that
    mapping with its placements kept, so the player can change their mind
    (l. 140); setting aside an earlier pass opens the next one (L7). Two
    mappings are never lit at once.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { graft, remove_gists, story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { EVENT_NAMES, Mapping, Pass, passes, StorySpec, SUB_SEQUENCES } from '../data';
import {
    annotation_node, apply_ops, applied_gist, erase_ops, event_gist, paragraphs, place_ops, reference_text, rendition_text, rows_ops, solid_ops, unapply_ops
} from '../board';
import { capitalised } from '../names';
import { apply as judge_apply, erase, new_mapping, participants, place, placed, step_of, violations } from '../judge';
import {
    applied_mapping, board_story, converted, ended, event_frame, FireWorld, has_said, has_said_applied, mappings_on, open_mapping, pattern_for, pattern_of,
    phase, phrase, replace_mapping, set_aside_mappings, voice_runs
} from '../world';
import { nudge_frame } from './transcription';
import { exact } from 'gist';

// "the mapping", or where the story has two solutions "the first solution" / "the second solution".
function label(story: StorySpec, m: Mapping): string {
    return passes(story, m.voice).length > 1 ? `the ${m.pass} solution` : 'the mapping';
}

// The board's rows as the story's mappings make them (bands, the unmapped bar, the empty voice runs).
export function rows_of(w: FireWorld, story: StorySpec, mappings: Mapping[] = w.mappings): StoryUpdaterSpec[] {
    return rows_ops(
        story, pattern_for(story), mappings.filter(m => m.story === story.id), e => event_frame(w, story, e),
        w.collapsed.includes(`${story.id}:unmapped`), voice_runs(w, story)
    );
}

function do_map(w: FireWorld, story: StorySpec, mapping: Mapping, step: number, event: number): FireWorld {
    const verdict = place(story, pattern_of(mapping), mapping, step, event, set_aside_mappings(w, story));
    if (!verdict.ok) {
        return nudge_frame(w, verdict.nudge);
    }
    const mappings = replace_mapping(w.mappings, mapping, verdict.mapping);
    const name = EVENT_NAMES[story.id][event - 1];
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            S.consequence(paragraphs([reference_text(name), ...(verdict.mark === undefined ? [] : [verdict.mark])])),
            place_ops(story, mapping, step, event, event_frame(w, story, event)!, name, placed(mapping, step)),
            rows_of(w, story, mappings)
        )
    });
}

function do_erase(w: FireWorld, story: StorySpec, mapping: Mapping, step: number): FireWorld {
    const mappings = replace_mapping(w.mappings, mapping, erase(mapping, step));
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            S.consequence(paragraphs([`${capitalised(step_of(pattern_of(mapping), step).name)} is erased.`])),
            erase_ops(story, mapping, step, placed(mapping, step)!),
            rows_of(w, story, mappings)
        )
    });
}

// The consequences of an applied mapping (SPEC §7.2–3): the Fire's rendition
// as the frame's description and under the steps, the annotations on the
// rows and in knowledge; `unlight` takes them away again.
function light_ops(w: FireWorld, story: StorySpec, m: Mapping) {
    const pattern = pattern_of(m);
    const parts = participants(story, pattern, m);
    return {
        knowledge: (k: FireWorld['knowledge']) => parts.reduce((acc, p) =>
            graft(acc, exact(event_gist(story.id, p.event)), annotation_node(story.id, p.event, m.id, p.role)), k),
        story_updates: story_updater(
            S.description(rendition_text(story, pattern, parts, m.id)),
            apply_ops(story, pattern, m, parts, e => event_frame(w, story, e))
        )
    };
}

function unlight_ops(story: StorySpec, m: Mapping) {
    return {
        knowledge: (k: FireWorld['knowledge']) => remove_gists(k, { tag: 'annotation', params: { seq: story.id, id: m.id } }),
        story_updates: story_updater(unapply_ops(story, m))
    };
}

// Applying a mapping (or resuming one): its consequences, and what the pass
// brings with it. The apply text and `apply_after` print on the first apply
// of the pass (SPEC §7.1); a resume says so in one line; a later apply
// prints the rendition alone. The literal solution registers "the two
// lines" as a sequence of its own, and the last of two solutions finishes
// and titles the story's sequence (SPEC §5.4).
function light(w: FireWorld, story: StorySpec, m: Mapping, how: 'first' | 'again' | 'resume'): FireWorld {
    const lit: Mapping = { ...m, status: 'applied' };
    const after = how === 'first' ? story.apply_after?.[m.pass] ?? [] : [];
    const consequence = how === 'first' ? story.apply_text[m.pass] ?? []
        : how === 'resume' ? [`${capitalised(label(story, m))} is resumed; the badges solid.`]
        : [];
    const all_passes = passes(story, m.voice);
    const now_finished = [
        ...SUB_SEQUENCES.filter(sub => sub.story === story.id && sub.pass === m.pass).map(sub => sub.id),
        ...(all_passes.length > 1 && m.pass === all_passes[all_passes.length - 1] ? [story.id] : [])
    ].filter(id => !w.finished.includes(id));
    let next = update(w, {
        gist: () => applied_gist(story.id, m.pass),
        mappings: _ => replace_mapping(_, m, lit),
        finished: _ => [..._, ...now_finished],
        story_updates: story_updater(
            consequence.length > 0 ? S.consequence(paragraphs(consequence)) : [],
            // l. 465 comes after the Fire's rendition (SPEC §5.4): the prompt category prints last.
            after.length > 0 ? S.prompt(paragraphs(after)) : []
        )
    });
    next = update(next, light_ops(next, story, lit));
    return update(next, { story_updates: story_updater(rows_of(next, story)) });
}

function do_apply(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const result = judge_apply(story, pattern_of(mapping), mapping, set_aside_mappings(w, story));
    if (!result.ok) {
        return nudge_frame(w, result.nudge);
    }
    return light(w, story, mapping, has_said_applied(w, story, mapping.pass) ? 'again' : 'first');
}

// `set aside`: the mapping's consequences are undone and its badges hollow.
// The last pass (or the only one) reopens with its placements kept; an
// earlier pass is set aside and the next pass opens, its placements kept if
// it has been held before.
function do_set_aside(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    let next = update(w, {
        story_updates: story_updater(S.consequence(paragraphs([`${capitalised(label(story, mapping))} is set aside; the badges hollow.`])))
    });
    next = update(next, unlight_ops(story, mapping));
    const all_passes = passes(story, mapping.voice);
    const next_pass: Pass | undefined = all_passes[all_passes.indexOf(mapping.pass) + 1];
    if (next_pass === undefined) {
        return update(next, { mappings: _ => replace_mapping(_, mapping, { ...mapping, status: 'open' }) });
    }
    next = update(next, { mappings: _ => replace_mapping(_, mapping, { ...mapping, status: 'set aside' }) });
    const held = mappings_on(next, story).find(m => m.pass === next_pass);
    next = update(next, {
        mappings: _ => held === undefined
            ? [..._, new_mapping(story, pattern_of(mapping), next_pass, w.index)]
            : replace_mapping(_, held, { ...held, status: 'open' })
    });
    return update(next, { story_updates: story_updater(rows_of(next, story)) });
}

// `resume` a set-aside mapping: it is lit again; the mapping open meanwhile keeps its placements, set aside (its badges hollow).
function do_resume(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const open = open_mapping(w, story);
    let next = w;
    if (open !== undefined) {
        next = update(next, {
            mappings: _ => replace_mapping(_, open, { ...open, status: 'set aside' }),
            story_updates: story_updater(solid_ops(story, open, false))
        });
    }
    return light(next, story, mapping, 'resume');
}

// Whether `set aside` is offered for this applied mapping (SPEC §6, §9): for a
// story with two solutions, the first only once the line that asks for the second is said.
function may_set_aside(w: FireWorld, story: StorySpec, m: Mapping): boolean {
    if (ended(w)) {
        return false;
    }
    if (m.pass === 'first' && story.set_aside_after !== undefined && passes(story, m.voice).length > 1) {
        return has_said(w, story.set_aside_after);
    }
    return true;
}

export const mapping_puffer: Puffer<FireWorld> = {
    handle_command: (world, parser) => {
        const story = board_story(world);
        if (story === undefined || phase(world, story) !== 'mapping') {
            return parser.eliminate();
        }
        const threads: ParserThread<FireWorld>[] = [];
        const pattern = pattern_for(story);
        const open = open_mapping(world, story);
        const applied = applied_mapping(world, story);
        const names = EVENT_NAMES[story.id];
        const transcribed = converted(world, story);

        if (open !== undefined) {
            for (const step of pattern.steps) {
                for (let n = 1; n <= transcribed; n++) {
                    threads.push(p =>
                        p.consume(['map', GAP, phrase(step.name), GAP, 'to', GAP, phrase(names[n - 1])], () =>
                        p.submit(() => do_map(world, story, open, step.index, n))));
                }
            }
            for (const placement of open.placements) {
                threads.push(p =>
                    p.consume(['erase', GAP, phrase(step_of(pattern, placement.step).name)], () =>
                    p.submit(() => do_erase(world, story, open, placement.step))));
            }
            threads.push(p =>
                p.consume(['apply', GAP, phrase(pattern.voice.name)], () =>
                p.submit(() => do_apply(world, story, open))));
        }
        if (applied !== undefined && may_set_aside(world, story, applied)) {
            threads.push(p =>
                p.consume(['set_aside', GAP, phrase(label(story, applied))], () =>
                p.submit(() => do_set_aside(world, story, applied))));
        }
        if (applied === undefined && !ended(world)) {
            for (const m of set_aside_mappings(world, story)) {
                threads.push(p =>
                    p.consume(['resume', GAP, phrase(label(story, m))], () =>
                    p.submit(() => do_resume(world, story, m))));
            }
            // A complete open mapping can be resumed as it stands: the no-edit shortcut for apply.
            if (open !== undefined && violations(story, pattern, open, set_aside_mappings(world, story)).length === 0) {
                threads.push(p =>
                    p.consume(['resume', GAP, phrase(label(story, open))], () =>
                    p.submit(() => light(world, story, open, has_said_applied(world, story, open.pass) ? 'resume' : 'first'))));
            }
        }
        return parser.split(threads);
    }
};
