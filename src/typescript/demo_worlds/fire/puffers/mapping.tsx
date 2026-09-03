/*
    Mapping (SPEC §4, §6, §7): with the vertical line drawn, the player maps
    steps of the board's voice onto its events, erases placements, applies
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
import { EVENT_NAMES, Mapping, Pass, passes, StepIndex, StorySpec, SUB_SEQUENCES } from '../data';
import { annotation_node, apply_ops, applied_gist, erase_ops, event_gist, paragraphs, place_ops, reference_text, rendition_text, rows_ops, unapply_ops } from '../board';
import { apply as judge_apply, erase, participants, place, placed, violations } from '../judge';
import {
    applied_mapping, board_story, ended, event_frame, FireWorld, has_said, has_said_applied, mappings_on, open_mapping, phase, phrase,
    replace_mapping, set_aside_mappings, voice_for, voice_of_mapping
} from '../world';
import { nudge_frame } from './transcription';
import { exact } from 'gist';

// "the mapping", or where the story has two solutions "the first solution" / "the second solution".
function label(story: StorySpec, m: Mapping): string {
    return passes(story, m.voice).length > 1 ? `the ${m.pass} solution` : 'the mapping';
}

function rows(w: FireWorld, story: StorySpec, mappings: Mapping[]): StoryUpdaterSpec[] {
    return rows_ops(story, mappings.filter(m => m.sequence === story.id), e => event_frame(w, story.id, e), w.collapsed.includes(`${story.id}:unmapped`));
}

function do_map(w: FireWorld, story: StorySpec, mapping: Mapping, step: StepIndex, event: number): FireWorld {
    const verdict = place(story, voice_of_mapping(mapping), mapping, step, event, set_aside_mappings(w, story));
    if (!verdict.ok) {
        return nudge_frame(w, verdict.nudge);
    }
    const mappings = replace_mapping(w.mappings, mapping, verdict.mapping);
    const name = EVENT_NAMES[story.id][event - 1];
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            S.consequence(paragraphs([reference_text(name), ...(verdict.mark === undefined ? [] : [verdict.mark])])),
            place_ops(story, mapping, step, event, event_frame(w, story.id, event)!, name, placed(mapping, step)),
            rows(w, story, mappings)
        )
    });
}

function do_erase(w: FireWorld, story: StorySpec, mapping: Mapping, step: StepIndex): FireWorld {
    const mappings = replace_mapping(w.mappings, mapping, erase(mapping, step));
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            erase_ops(story, mapping, step, placed(mapping, step)!),
            rows(w, story, mappings)
        )
    });
}

// The consequences of an applied mapping (SPEC §7.2–3), added to the world; `undo` takes them away again.
function consequences(w: FireWorld, story: StorySpec, m: Mapping, undo: boolean): FireWorld {
    const voice = voice_of_mapping(m);
    const parts = participants(story, voice, m);
    if (undo) {
        return update(w, {
            knowledge: k => remove_gists(k, { tag: 'annotation', params: { seq: story.id, id: m.id } }),
            story_updates: story_updater(unapply_ops(story, m))
        });
    }
    return update(w, {
        knowledge: k => parts.reduce((acc, p) =>
            graft(acc, exact(event_gist(story.id, p.event)), annotation_node(story.id, p.event, m.id, p.role)), k),
        story_updates: story_updater(
            S.description(rendition_text(story, voice, parts, m.id)),
            apply_ops(story, voice, m, parts, e => event_frame(w, story.id, e))
        )
    });
}

// Applying a mapping (or resuming one): its consequences, and what the pass brings with it.
function light(w: FireWorld, story: StorySpec, m: Mapping, with_text: boolean): FireWorld {
    const lit: Mapping = { ...m, status: 'applied' };
    const after = story.apply_after?.[m.pass] ?? [];
    let next = update(w, {
        gist: () => applied_gist(story.id, m.pass),
        mappings: _ => replace_mapping(_, m, lit),
        story_updates: story_updater(
            with_text ? S.consequence(paragraphs(story.apply_text[m.pass] ?? [])) : [],
            // l. 465 comes after the Fire's rendition (SPEC §5.4): the prompt category prints last.
            with_text && after.length > 0 ? S.prompt(paragraphs(after)) : []
        )
    });
    next = consequences(next, story, lit, false);
    next = update(next, { story_updates: story_updater(rows(next, story, next.mappings)) });
    for (const sub of SUB_SEQUENCES) {
        // The literal solution registers "the two lines" as a sequence of its own (SPEC §5.4).
        if (sub.story === story.id && sub.pass === m.pass && next.sequences[sub.id] === undefined) {
            next = update(next, {
                sequences: { [sub.id]: () => ({ events: sub.events.map(e => event_frame(w, story.id, e)!), finished: true }) }
            });
        }
    }
    const all_passes = passes(story, m.voice);
    if (all_passes.length > 1 && m.pass === all_passes[all_passes.length - 1]) {
        // The last solution's apply finishes and titles the sequence (SPEC §5.4).
        next = update(next, { sequences: { [story.id]: { finished: true } } });
    }
    return next;
}

// The apply text is printed on the first apply of a pass only (SPEC §7.1); later applies print the rendition alone.
function do_apply(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const result = judge_apply(story, voice_of_mapping(mapping), mapping, set_aside_mappings(w, story));
    if (!result.ok) {
        return nudge_frame(w, result.nudge);
    }
    return light(w, story, mapping, !has_said_applied(w, story, mapping.pass));
}

// `set aside`: the mapping's consequences are undone and its badges hollow.
// The last pass (or the only one) reopens with its placements kept; an
// earlier pass is set aside and the next pass opens, its placements kept if
// it has been held before.
function do_set_aside(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    let next = consequences(w, story, mapping, true);
    const all_passes = passes(story, mapping.voice);
    const next_pass: Pass | undefined = all_passes[all_passes.indexOf(mapping.pass) + 1];
    if (next_pass === undefined) {
        return update(next, { mappings: _ => replace_mapping(_, mapping, { ...mapping, status: 'open' }) });
    }
    next = update(next, { mappings: _ => replace_mapping(_, mapping, { ...mapping, status: 'set aside' }) });
    const held = mappings_on(next, story).find(m => m.pass === next_pass);
    const opened: Mapping = held ?? { id: w.index, voice: mapping.voice, sequence: story.id, pass: next_pass, placements: [], status: 'open' };
    next = update(next, {
        mappings: _ => held === undefined ? [..._, opened] : replace_mapping(_, held, { ...held, status: 'open' })
    });
    return update(next, { story_updates: story_updater(rows(next, story, next.mappings)) });
}

// `resume` a set-aside mapping: it is lit again; the mapping open meanwhile keeps its placements, set aside.
function do_resume(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const open = open_mapping(w, story);
    let next = w;
    if (open !== undefined) {
        next = update(next, { mappings: _ => replace_mapping(_, open, { ...open, status: 'set aside' }) });
    }
    return light(next, story, mapping, false);
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
        const voice = voice_for(story);
        const open = open_mapping(world, story);
        const applied = applied_mapping(world, story);
        const names = EVENT_NAMES[story.id];
        const transcribed = world.sequences[story.id]?.events.length ?? 0;

        if (open !== undefined) {
            for (const step of voice.steps) {
                for (let n = 1; n <= transcribed; n++) {
                    threads.push(p =>
                        p.consume(['map', GAP, phrase(step.name), GAP, 'to', GAP, phrase(names[n - 1])], () =>
                        p.submit(() => do_map(world, story, open, step.index, n))));
                }
            }
            for (const placement of open.placements) {
                const step = voice.steps[placement.step - 1];
                threads.push(p =>
                    p.consume(['erase', GAP, phrase(step.name)], () =>
                    p.submit(() => do_erase(world, story, open, placement.step))));
            }
            threads.push(p =>
                p.consume(['apply', GAP, phrase(voice.voice.name)], () =>
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
            if (open !== undefined && violations(story, voice, open, set_aside_mappings(world, story)).length === 0) {
                threads.push(p =>
                    p.consume(['resume', GAP, phrase(label(story, open))], () =>
                    p.submit(() => light(world, story, open, !has_said_applied(world, story, open.pass)))));
            }
        }
        return parser.split(threads);
    }
};
