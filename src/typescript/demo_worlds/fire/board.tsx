/*
    The board (SPEC §8): the story nodes that make it up, the gists that
    address its parts, and the story ops that build and change it. Every
    visible change is a story op on a gist-addressed node, so the engine's
    staged updates drive the board in the page and in the tests alike. What
    a mapping puts on the board (badges, references, renditions,
    annotations) is keyed by the mapping's id, so every gist is unique
    where it is addressed.

    Shape:
      <div class="board" gist=board(seq)>
        <div class="board-title">…</div>            (+ a barcode node once it is a chip)
        <div class="columns">
          <div class="left"  gist=left(seq)>        ¶s, voice bars, event frames, the hole while transcribing
          <div class="rule"  gist=rule(seq)>
          <div class="right" gist=right(seq)>       the eight steps: chalk, notation, targets, spoken
        </div>
        <div class="ledger" gist=ledger(seq)>       the hole while mapping: nudges, apply texts, dialogue
      </div>
*/
import { exact, gist, Gist } from 'gist';
import { createElement, Fragment, Hole, is_story_node, StoryNode, StoryUpdaterSpec, Updates as S, UpdatesBuilder } from 'story';
import { AbstractSequence, event_consequence, Mapping, Step, StoryEventSpec, StorySpec, voice as voice_of, VoiceId } from './data';
import { group_by_event, Participant, role_entries } from './judge';

// GISTS

export const lesson_board_gist = (): Gist => gist('lesson_board');
export const board_gist = (seq: string): Gist => gist('board', undefined, { seq });
export const left_gist = (seq: string): Gist => gist('left', undefined, { seq });
export const rule_gist = (seq: string): Gist => gist('rule', undefined, { seq });
export const right_gist = (seq: string): Gist => gist('right', undefined, { seq });
export const ledger_gist = (seq: string): Gist => gist('ledger', undefined, { seq });
export const prose_gist = (seq: string, n: number): Gist => gist('prose', undefined, { seq, n });
export const voice_bar_gist = (seq: string, n: number): Gist => gist('voice_bar', undefined, { seq, n });
export const event_gist = (seq: string, n: number): Gist => gist('event', undefined, { seq, n });
export const step_gist = (seq: string, n: number): Gist => gist('step', undefined, { seq, n });
export const targets_gist = (seq: string, n: number): Gist => gist('targets', undefined, { seq, n });
export const spoken_gist = (seq: string, n: number): Gist => gist('spoken', undefined, { seq, n });
export const sequence_gist = (voice: string): Gist => gist('abstract sequence', undefined, { voice });
export const badge_gist = (seq: string, event: number, step: number, id: number): Gist =>
    gist('badge', undefined, { seq, event, step, id });
export const reference_gist = (seq: string, step: number, id: number): Gist =>
    gist('reference', undefined, { seq, step, id });
export const rendition_gist = (seq: string, step: number, id: number): Gist =>
    gist('rendition', undefined, { seq, step, id });
export const rendition_text_gist = (seq: string, id: number): Gist => gist('rendition_text', undefined, { seq, id });
export const annotation_gist = (seq: string, n: number, id: number, role: string): Gist =>
    gist('annotation', undefined, { seq, n, id, role });
export const unmapped_gist = (seq: string): Gist => gist('unmapped', undefined, { seq });
export const classroom_gist = (command: string, beat: number): Gist => gist('classroom', undefined, { command, beat });
export const applied_gist = (seq: string, pass: string): Gist => gist('applied', undefined, { seq, pass });

// "the closest followers" -> "the-closest-followers", for class names.
export function slug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// NODES

export function paragraphs(ps: string[]): StoryNode[] {
    return ps.map(p => <div>{p}</div> as StoryNode);
}

// One step in both forms: the chalk statement, its notation (folded, or
// absent until Katya writes it), and the places where its targets and the
// Fire's rendition will go.
export function step_node(seq: string, step: Step, notation: 'folded' | 'absent' | 'none'): StoryNode {
    return <div gist={step_gist(seq, step.index)} className={`step step-${step.index}`}>
        <div className="chalk">{step.chalk}</div>
        {notation === 'none' ? [] : <div className={'notation collapsed' + (notation === 'absent' ? ' absent' : '')}>
            <div className="command">{'> ' + step.command}</div>
            <div>{step.consequence}</div>
        </div>}
        <div gist={targets_gist(seq, step.index)} className="targets"></div>
        <div gist={spoken_gist(seq, step.index)} className="spoken"></div>
    </div> as StoryNode;
}

export function steps_column(seq: string, voice: AbstractSequence, hidden: boolean, notation: 'folded' | 'absent'): StoryNode {
    return <div gist={right_gist(seq)} className={'right' + (hidden ? ' hidden' : '')}>
        {voice.steps.map(s => step_node(seq, s, notation))}
    </div> as StoryNode;
}

// The passage for an abstract sequence, as `remember` prints it: its steps in both forms, or in the chalk form alone.
export function sequence_passage(voice: AbstractSequence, with_notation = true): StoryNode {
    return <div gist={sequence_gist(voice.voice.id)} className="steps-memory">
        {voice.steps.map(s => step_node(voice.voice.id, s, with_notation ? 'folded' : 'none'))}
    </div> as StoryNode;
}

// Beat 0's board: only a right column, the chalk statements first, the notation after the second `listen`.
export function lesson_board_node(voice: AbstractSequence): StoryNode {
    return <div gist={lesson_board_gist()} className="board lesson">
        <div className="board-title">{voice.voice.name}</div>
        <div className="columns">
            {steps_column('lesson', voice, false, 'absent')}
        </div>
    </div> as StoryNode;
}

// A ¶ as pieces: for a two-event ¶, the part each event converts, so that the remainder can be lit.
export function prose_pieces(story: StorySpec, n: number): string[] {
    const events = story.events.filter(e => e.prose === n);
    const pieces: string[] = [];
    let rest = story.prose[n - 1];
    for (const e of events) {
        if (e.remainder === undefined || !rest.endsWith(e.remainder) || rest === e.remainder) {
            break;
        }
        pieces.push(rest.slice(0, rest.length - e.remainder.length).trimEnd());
        rest = e.remainder;
    }
    pieces.push(rest);
    return pieces;
}

function prose_node(story: StorySpec, n: number): StoryNode {
    const pieces = prose_pieces(story, n);
    return <div gist={prose_gist(story.id, n)} className={'prose' + (n === 1 ? ' cursor' : '')}>
        {pieces.flatMap((p, i) => [i === 0 ? [] : ' ', <span className={`piece piece-${i}`}>{p}</span>])}
    </div> as StoryNode;
}

// A story's board at open: the ¶s in the left column, the rule and the right column hidden.
export function board_node(story: StorySpec, voice: AbstractSequence): StoryNode {
    return <div gist={board_gist(story.id)} className="board">
        <div className="board-title">{story.title}</div>
        <div className="columns">
            <div gist={left_gist(story.id)} className="left">
                {story.prose.map((_, i) => prose_node(story, i + 1))}
            </div>
            <div gist={rule_gist(story.id)} className="rule hidden"></div>
            {steps_column(story.id, voice, true, 'folded')}
        </div>
        <div gist={ledger_gist(story.id)} className="ledger"></div>
    </div> as StoryNode;
}

// A story as told, in a dialogue frame: its ¶s one after another.
export function prose_told(story: StorySpec): StoryNode {
    return <div className="told">
        {story.prose.map(p => <div>{p}</div>)}
    </div> as StoryNode;
}

export function voice_bar_node(seq: string, n: number, voice: VoiceId): StoryNode {
    const v = voice_of(voice);
    return <div gist={voice_bar_gist(seq, n)} className={`voice-bar kind-${v.kind} voice-${slug(voice)}`}>{v.name}</div> as StoryNode;
}

// The voice bar as text, for the `speak as` frame.
export function voice_bar_text(voice: VoiceId): string {
    return `— ${voice_of(voice).name} —`;
}

// The knowledge passage for a story event: its command and its whole consequence.
export function event_passage(story: StorySpec, e: StoryEventSpec): StoryNode {
    return <div gist={event_gist(story.id, e.index)} className="event">
        <div className="command">{'> ' + e.command}</div>
        {paragraphs(event_consequence(story, e.index))}
    </div> as StoryNode;
}

// A badge is "held" when placed, solid once applied, hollow once set aside.
function badge_node(seq: string, event: number, step: number, id: number): StoryNode {
    return <span gist={badge_gist(seq, event, step, id)} className={`badge step-${step} held`}>{String(step)}</span> as StoryNode;
}

function reference_node(seq: string, step: number, id: number, event_name: string): StoryNode {
    return <div gist={reference_gist(seq, step, id)} className={`reference step-${step} held`}>{reference_text(event_name)}</div> as StoryNode;
}

export function reference_text(event_name: string): string {
    return '→ ' + event_name;
}

function step_line(voice: AbstractSequence, p: Participant): string {
    return `> ${voice.steps.find(s => s.index === p.step)!.command} — ${p.derives}`;
}

// The Fire speaks (SPEC §7.2): under a step, its command and the derived
// participant; the target event's consequence once, under the first of the
// steps that share it.
function rendition_node(story: StorySpec, voice: AbstractSequence, p: Participant, id: number, with_consequence: boolean): StoryNode {
    return <div gist={rendition_gist(story.id, p.step, id)} className={`rendition step-${p.step}`}>
        <div>{step_line(voice, p)}</div>
        {with_consequence ? <blockquote>{paragraphs(event_consequence(story, p.event))}</blockquote> : []}
    </div> as StoryNode;
}

// The same, as one text: the steps grouped by the event they share, its consequence once.
export function rendition_text(story: StorySpec, voice: AbstractSequence, parts: Participant[], id: number): StoryNode {
    return <div gist={rendition_text_gist(story.id, id)} className="spoken-text">
        {group_by_event(parts).map(g => <div className="spoken-group">
            {g.map(p => <div>{step_line(voice, p)}</div>)}
            <blockquote>{paragraphs(event_consequence(story, g[0].event))}</blockquote>
        </div>)}
    </div> as StoryNode;
}

// The fire-coloured note on a mapped row (SPEC §7.3): one per (event, role).
export function annotation_node(seq: string, n: number, id: number, role: string): StoryNode {
    return <span gist={annotation_gist(seq, n, id, role)} className="annotation">{`— the ${role}`}</span> as StoryNode;
}

export function coda_node(text: string[]): StoryNode {
    return <div className="coda">{paragraphs(text)}</div> as StoryNode;
}

// The chip's barcode: every badge of the board's mappings, in the order of the events.
function barcode_node(story: StorySpec, mappings: Mapping[]): StoryNode {
    const badges: StoryNode[] = [];
    for (const e of story.events) {
        for (const m of mappings) {
            for (const p of m.placements) {
                if (p.event === e.index) {
                    badges.push(<span className={`badge step-${p.step} ${m.status === 'applied' ? 'solid' : 'hollow'}`}>{String(p.step)}</span> as StoryNode);
                }
            }
        }
    }
    return <span className="barcode">{badges}</span> as StoryNode;
}

function unmapped_bar_node(seq: string, count: number): StoryNode {
    return <div gist={unmapped_gist(seq)} className="unmapped-bar">{`▸ ${count} events not in the mapping`}</div> as StoryNode;
}

// A copy of a node with no gists and no frame index, so that later ops never land on the reprint (SPEC §3).
export function strip_gists(node: Fragment): Fragment {
    if (!is_story_node(node)) {
        return node;
    }
    return { ...node, data: {}, children: node.children.map(strip_gists) };
}

// OPS
// Each returns story updates; the hole moves are never animated (the reflect.tsx trick).

function move_hole_after(target: UpdatesBuilder): StoryUpdaterSpec[] {
    return [S.story_hole().remove(), target.insert_after(<Hole />, true)];
}

function move_hole_into(target: UpdatesBuilder): StoryUpdaterSpec[] {
    return [S.story_hole().remove(), target.add(<Hole />, true)];
}

const at = (g: Gist) => S.has_gist(exact(g));
// The boards' right columns (the lesson board's included), and nothing reprinted by `remember`.
const in_right_columns = () => S.has_gist({ tag: 'right' });

// Beat 0: the lesson board appears after the current frame (only its chalk statements).
export function show_lesson_board_ops(voice: AbstractSequence): StoryUpdaterSpec[] {
    return [S.frame().insert_after(lesson_board_node(voice))];
}

// Beat 0: each statement gains its notation (folded).
export function reveal_notation_ops(): StoryUpdaterSpec[] {
    return [in_right_columns().has_class('notation').css({ absent: false })];
}

// `pick up the chalk`: the lesson board folds to a chip; the story's board opens after the current frame; the hole goes in after ¶1.
export function open_board_ops(story: StorySpec, voice: AbstractSequence): StoryUpdaterSpec[] {
    return [
        at(lesson_board_gist()).css({ chip: true }),
        S.frame().insert_after(board_node(story, voice)),
        ...move_hole_after(at(prose_gist(story.id, 1)))
    ];
}

// The cursor moves from ¶ `from` to ¶ `to` (which may be past the end): the hole follows it, and the remainder is done with.
export function advance_cursor_ops(story: StorySpec, from: number, to: number): StoryUpdaterSpec[] {
    if (from === to) {
        return [];
    }
    return [
        at(prose_gist(story.id, from)).css({ cursor: false, done: true }),
        at(prose_gist(story.id, from)).children(S.has_class('piece')).css({ remainder: false }),
        ...(to <= story.prose.length
            ? [at(prose_gist(story.id, to)).css({ cursor: true }), ...move_hole_after(at(prose_gist(story.id, to)))]
            : [])
    ];
}

// After the first event of a two-event ¶: its remainder is what is left to convert.
export function light_remainder_ops(story: StorySpec, n: number, piece: number): StoryUpdaterSpec[] {
    return [at(prose_gist(story.id, n)).children(S.has_class(`piece-${piece}`)).css({ remainder: true })];
}

export function follow_ops(story: StorySpec, n: number): StoryUpdaterSpec[] {
    return [at(prose_gist(story.id, n)).css({ followed: true })];
}

// `speak as`: a voice bar after the command's frame, the hole after the bar, the left column's voice class for the carat.
export function speak_as_ops(story: StorySpec, frame_index: number, voice: VoiceId, previous: VoiceId | undefined): StoryUpdaterSpec[] {
    const classes: { [cls: string]: boolean } = { [`voice-${slug(voice)}`]: true, spoken: true };
    if (previous !== undefined) {
        classes[`voice-${slug(previous)}`] = false;
    }
    return [
        S.frame().insert_after(voice_bar_node(story.id, frame_index, voice)),
        ...move_hole_after(at(voice_bar_gist(story.id, frame_index))),
        at(left_gist(story.id)).css(classes)
    ];
}

// l. 350: the voice notation is taught; the bars drawn so far and the You marks appear.
export function teach_voices_ops(): StoryUpdaterSpec[] {
    return [S.story_root().css({ 'voices-taught': true })];
}

// `draw a vertical line`: the rule and the right column appear; the hole moves to the ledger.
export function draw_line_ops(story: StorySpec): StoryUpdaterSpec[] {
    return [
        at(rule_gist(story.id)).css({ hidden: false }),
        at(right_gist(story.id)).css({ hidden: false }),
        ...move_hole_into(at(ledger_gist(story.id)))
    ];
}

// A placement: a badge on the row and a reference under the step. A moved step loses its old badge first.
export function place_ops(
    story: StorySpec, m: Mapping, step: number, event: number, frame: number, event_name: string, previous_event: number | undefined
): StoryUpdaterSpec[] {
    return [
        ...(previous_event === undefined ? [] : erase_ops(story, m, step, previous_event)),
        S.frame(frame).first(S.has_class('input-text')).add(badge_node(story.id, event, step, m.id)),
        at(targets_gist(story.id, step)).add(reference_node(story.id, step, m.id, event_name))
    ];
}

export function erase_ops(story: StorySpec, m: Mapping, step: number, event: number): StoryUpdaterSpec[] {
    return [
        at(badge_gist(story.id, event, step, m.id)).remove(),
        at(reference_gist(story.id, step, m.id)).remove()
    ];
}

// The rows' bands and `mapped` classes, and the unmapped bar's count, all
// derived from the board's mappings; called after every map, erase, set
// aside and resume.
export function rows_ops(
    story: StorySpec, mappings: Mapping[], frame_of: (event: number) => number | undefined, unmapped_folded: boolean
): StoryUpdaterSpec[] {
    const steps_on = (event: number) => mappings.flatMap(m => m.placements.filter(p => p.event === event).map(p => p.step));
    const mapped = story.events.filter(e => steps_on(e.index).length > 0).map(e => e.index);
    const ops = story.events.flatMap(e => {
        const frame = frame_of(e.index);
        const steps = steps_on(e.index);
        const bands: { [cls: string]: boolean } = { mapped: steps.length > 0 };
        for (let s = 1; s <= 8; s++) {
            bands[`band-${s}`] = steps.some(x => x === s);
        }
        return [
            ...(frame === undefined ? [] : [S.frame(frame).css(bands)]),
            at(prose_gist(story.id, e.prose)).css({ mapped: story.events.some(o => o.prose === e.prose && mapped.includes(o.index)) })
        ];
    });
    const transcribed = story.events.filter(e => frame_of(e.index) !== undefined).length;
    return [...ops, ...unmapped_ops(story, unmapped_folded, transcribed - mapped.length)];
}

// `apply`: the Fire speaks under each step; each mapped row is annotated (once per role); the badges are solid.
export function apply_ops(story: StorySpec, voice: AbstractSequence, m: Mapping, parts: Participant[], frame_of: (event: number) => number | undefined): StoryUpdaterSpec[] {
    return [
        ...group_by_event(parts).flatMap(g =>
            g.map((p, i) => at(spoken_gist(story.id, p.step)).add(rendition_node(story, voice, p, m.id, i === 0)))),
        ...group_by_event(parts).flatMap(g =>
            role_entries(g, story.title).map(r =>
                S.frame(frame_of(g[0].event)!).first(S.has_class('input-text')).add(annotation_node(story.id, g[0].event, m.id, r.role)))),
        ...solid_ops(story, m, true)
    ];
}

// `set aside`: the rendition and the annotations of the mapping go; its badges hollow.
export function unapply_ops(story: StorySpec, m: Mapping): StoryUpdaterSpec[] {
    return [
        S.has_gist({ tag: 'rendition', params: { seq: story.id, id: m.id } }).remove(),
        S.has_gist({ tag: 'rendition_text', params: { seq: story.id, id: m.id } }).remove(),
        S.has_gist({ tag: 'annotation', params: { seq: story.id, id: m.id } }).remove(),
        ...solid_ops(story, m, false)
    ];
}

function solid_ops(story: StorySpec, m: Mapping, solid: boolean): StoryUpdaterSpec[] {
    return [
        S.has_gist({ tag: 'badge', params: { seq: story.id, id: m.id } }).css({ solid, hollow: !solid, held: false }),
        S.has_gist({ tag: 'reference', params: { seq: story.id, id: m.id } }).css({ solid, hollow: !solid, held: false })
    ];
}

// The coda (SPEC §9): its own node after the last frame.
export function coda_ops(text: string[]): StoryUpdaterSpec[] {
    return [S.frame().insert_after(coda_node(text))];
}

// `say all set` / `put down the chalk`: the board folds to a chip with its barcode; the hole returns to the root.
export function finish_board_ops(story: StorySpec, mappings: Mapping[]): StoryUpdaterSpec[] {
    return [
        at(board_gist(story.id)).css({ chip: true }),
        at(board_gist(story.id)).children(S.has_class('board-title')).add(barcode_node(story, mappings)),
        ...move_hole_into(S.story_root())
    ];
}

// DISPLAY ONLY (SPEC §6 expand/collapse)

export function chip_ops(story: StorySpec, on: boolean): StoryUpdaterSpec[] {
    return [at(board_gist(story.id)).css({ chip: on })];
}

export function steps_ops(collapsed: boolean): StoryUpdaterSpec[] {
    return [in_right_columns().has_class('notation').css({ collapsed })];
}

export function story_ops(story: StorySpec, collapsed: boolean): StoryUpdaterSpec[] {
    return [at(board_gist(story.id)).css({ 'story-collapsed': collapsed })];
}

export function event_ops(frame: number, collapsed: boolean): StoryUpdaterSpec[] {
    return [S.frame(frame).css({ collapsed })];
}

export function unmapped_ops(story: StorySpec, collapsed: boolean, count: number): StoryUpdaterSpec[] {
    return [
        at(board_gist(story.id)).css({ 'unmapped-collapsed': collapsed }),
        at(unmapped_gist(story.id)).remove(),
        ...(collapsed ? [at(left_gist(story.id)).add(unmapped_bar_node(story.id, count))] : [])
    ];
}
