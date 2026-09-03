/*
    Mapping (SPEC §4, §6, §7): with the vertical line drawn, the player maps
    steps of the Voice of Fire onto the board's events, erases placements,
    applies the mapping, and sets it aside or resumes it. A placement puts a
    badge on the row and a reference under the step; applying prints the
    apply text, lets the Fire speak under each step, annotates the mapped
    rows (in the transcript and in knowledge), and fills the roles; setting
    aside reverses all of that and hollows the badges; resuming redoes it.
*/
import { GAP, ParserThread } from 'parser';
import { Puffer } from 'puffer';
import { graft, story_updater, StoryUpdaterSpec, Updates as S } from 'story';
import { update } from 'lib/utils';
import { Mapping, StepIndex, STORIES, StorySpec, TWO_LINES, VOICE_OF_FIRE } from '../data';
import { apply as judge_apply, erase, participants, place, placed, role_entries } from '../judge';
import { event_names } from '../names';
import {
    annotation_node, apply_ops, erase_ops, event_gist, exact_gist, mapped_rows_ops, paragraphs, place_ops, reference_text, remove_gists,
    rendition_text, unapply_ops
} from '../board';
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

// The rows holding a badge, across every mapping of the board, as classes (for `collapse the unmapped`).
function rows_ops(w: FireWorld, story: StorySpec, mappings: Mapping[]): StoryUpdaterSpec[] {
    const mapped = mappings.filter(m => m.sequence === story.id).flatMap(m => m.placements.map(p => p.event));
    return mapped_rows_ops(story, mapped, e => event_frame(w, story.id, e));
}

function do_map(w: FireWorld, story: StorySpec, mapping: Mapping, step: StepIndex, event: number): FireWorld {
    const verdict = place(story, FIRE, mapping, step, event, set_aside_mappings(w, story));
    if (!verdict.ok) {
        return nudge_frame(w, verdict.nudge);
    }
    const mappings = replace_mapping(w.mappings, mapping, verdict.mapping);
    const name = event_names(story, STORIES)[event - 1];
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            S.consequence(paragraphs([reference_text(name), ...(verdict.mark === undefined ? [] : [verdict.mark])])),
            place_ops(story, step, mapping.pass, event, event_frame(w, story.id, event)!, name, placed(mapping, step)),
            rows_ops(w, story, mappings)
        )
    });
}

function do_erase(w: FireWorld, story: StorySpec, mapping: Mapping, step: StepIndex): FireWorld {
    const mappings = replace_mapping(w.mappings, mapping, erase(mapping, step));
    return update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            erase_ops(story, step, mapping.pass, placed(mapping, step)!),
            rows_ops(w, story, mappings)
        )
    });
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
            story_updates: story_updater(unapply_ops(story, m.pass))
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
            graft(acc, exact_gist(event_gist(story.id, p.event)), annotation_node(story.id, p.event, m.pass, p.role)), k),
        story_updates: story_updater(
            S.description(rendition_text(story, FIRE, parts, m.pass)),
            apply_ops(story, FIRE, parts, m.pass, e => event_frame(w, story.id, e))
        )
    });
}

function do_apply(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const result = judge_apply(story, FIRE, mapping, set_aside_mappings(w, story));
    if (!result.ok) {
        return nudge_frame(w, result.nudge);
    }
    const after = story.apply_after?.[mapping.pass] ?? [];
    let next = update(w, {
        mappings: _ => replace_mapping(_, mapping, result.mapping),
        story_updates: story_updater(
            S.consequence(paragraphs(story.apply_text[mapping.pass] ?? [])),
            // l. 465 comes after the Fire's rendition (SPEC §5.4): the prompt category prints last.
            after.length === 0 ? [] : S.prompt(paragraphs(after))
        )
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

// `set aside` (SPEC §6): where the story has a second-pass table, the
// mapping is set aside and the second pass opens (L7); where it has none,
// the mapping returns to open with its placements kept, so that the
// player can change their mind (l. 140).
function do_set_aside(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    let next = consequences(w, story, mapping, true);
    const has_second_pass = story.candidates[FIRE.voice.id]?.second !== undefined;
    if (!has_second_pass) {
        const reopened: Mapping = { ...mapping, status: 'open', reopened: true };
        return update(next, { mappings: _ => replace_mapping(_, mapping, reopened) });
    }
    const aside: Mapping = { ...mapping, status: 'set aside' };
    next = update(next, { mappings: _ => replace_mapping(_, mapping, aside) });
    if (open_mapping(next, story) === undefined) {
        next = update(next, {
            mappings: _ => [..._, { voice: FIRE.voice.id, sequence: story.id, pass: 'second' as const, placements: [], status: 'open' as const }]
        });
    }
    return next;
}

function do_resume(w: FireWorld, story: StorySpec, mapping: Mapping): FireWorld {
    const resumed: Mapping = { ...mapping, status: 'applied' };
    // Any mapping still open on this board is dropped: the resumed one is the story's reading again.
    const dropped = w.mappings.filter(m => m.sequence === story.id && m.status === 'open');
    const mappings = replace_mapping(w.mappings, mapping, resumed).filter(m => !dropped.includes(m));
    let next = update(w, {
        mappings: () => mappings,
        story_updates: story_updater(
            dropped.flatMap(m => m.placements.map(p => erase_ops(story, p.step, m.pass, p.event))),
            rows_ops(w, story, mappings)
        )
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
                    p.submit(() => do_erase(world, story, open, placement.step))));
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
            // A reopened mapping can be resumed as it was: the no-edit shortcut for apply.
            if (open !== undefined && open.reopened) {
                threads.push(p =>
                    p.consume(['resume', GAP, phrase(label(story, open))], () =>
                    p.submit(() => do_apply(world, story, open))));
            }
        }
        return parser.split(threads);
    }
};
