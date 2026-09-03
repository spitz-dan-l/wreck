/*
    The board (SPEC §8): the story nodes that make it up, the gists that
    address its parts, and the story ops that build and change it. Every
    visible change is a story op on a gist-addressed node, so the engine's
    staged updates drive the board in the page and in the tests alike.

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
import { exact, gist, Gist, GistPattern, match } from 'gist';
import { createElement, Fragment, Hole, is_story_node, Knowledge, StoryNode, StoryUpdaterSpec, Updates as S, UpdatesBuilder } from 'story';
import { AbstractSequence, event_consequence, Mapping, Step, StoryEventSpec, StorySpec, voice as voice_of, VoiceId } from './data';
import { Participant } from './judge';

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
export const badge_gist = (seq: string, event: number, step: number, pass: string): Gist =>
    gist('badge', undefined, { seq, event, step, pass });
export const reference_gist = (seq: string, step: number, pass: string): Gist =>
    gist('reference', undefined, { seq, step, pass });
export const rendition_gist = (seq: string, step: number, pass: string): Gist =>
    gist('rendition', undefined, { seq, step, pass });
export const annotation_gist = (seq: string, n: number, pass: string, role: string): Gist =>
    gist('annotation', undefined, { seq, n, pass, role });
export const unmapped_gist = (seq: string): Gist => gist('unmapped', undefined, { seq });
export const rendition_text_gist = (seq: string, pass: string): Gist => gist('rendition_text', undefined, { seq, pass });
export const classroom_gist = (command: string): Gist => gist('classroom', undefined, { command });

export const exact_gist = exact;

// "the closest followers" -> "the-closest-followers", for class names.
export function slug(text: string): string {
    return text.toLowerCase().replace(/[^a-z0-9]+/g, '-');
}

// NODES

export function paragraphs(ps: string[]): StoryNode[] {
    return ps.map(p => <div>{p}</div> as StoryNode);
}

// One step in both forms: the chalk statement, its notation (folded), and
// the places where its targets and the Fire's rendition will go.
export function step_node(seq: string, step: Step, notation_absent: boolean, omit_notation = false): StoryNode {
    return <div gist={step_gist(seq, step.index)} className={`step step-${step.index}`}>
        <div className="chalk">{step.chalk}</div>
        {omit_notation ? [] : <div className={'notation collapsed' + (notation_absent ? ' absent' : '')}>
            <div className="command">{'> ' + step.command}</div>
            <div>{step.consequence}</div>
        </div>}
        <div gist={targets_gist(seq, step.index)} className="targets"></div>
        <div gist={spoken_gist(seq, step.index)} className="spoken"></div>
    </div> as StoryNode;
}

export function steps_column(seq: string, fire: AbstractSequence, hidden: boolean, notation_absent: boolean): StoryNode {
    return <div gist={right_gist(seq)} className={'right' + (hidden ? ' hidden' : '')}>
        {fire.steps.map(s => step_node(seq, s, notation_absent))}
    </div> as StoryNode;
}

// The passage for an abstract sequence: its steps in both forms, or in the chalk form alone.
export function sequence_passage(seq: AbstractSequence, with_notation = true): StoryNode {
    return <div gist={sequence_gist(seq.voice.id)} className="right">
        {seq.steps.map(s => step_node(seq.voice.id, s, false, !with_notation))}
    </div> as StoryNode;
}

// Beat 0's board: only a right column, the chalk statements first, the notation after the second `listen`.
export function lesson_board_node(fire: AbstractSequence): StoryNode {
    return <div gist={lesson_board_gist()} className="board lesson">
        <div className="board-title">{fire.voice.name}</div>
        <div className="columns">
            {steps_column('lesson', fire, false, true)}
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
export function board_node(story: StorySpec, fire: AbstractSequence): StoryNode {
    return <div gist={board_gist(story.id)} className="board">
        <div className="board-title">{story.title}</div>
        <div className="columns">
            <div gist={left_gist(story.id)} className="left">
                {story.prose.map((_, i) => prose_node(story, i + 1))}
            </div>
            <div gist={rule_gist(story.id)} className="rule hidden"></div>
            {steps_column(story.id, fire, true, false)}
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

// The knowledge passage for a story event: its command and its whole consequence.
export function event_passage(story: StorySpec, e: StoryEventSpec): StoryNode {
    return <div gist={event_gist(story.id, e.index)} className="event">
        <div className="command">{'> ' + e.command}</div>
        {paragraphs(event_consequence(story, e.index))}
    </div> as StoryNode;
}

// A badge is "held" when placed, solid once applied, hollow once set aside.
export function badge_node(seq: string, event: number, step: number, pass: string): StoryNode {
    return <span gist={badge_gist(seq, event, step, pass)} className={`badge step-${step} held`}>{String(step)}</span> as StoryNode;
}

export function reference_node(seq: string, step: number, pass: string, event_name: string): StoryNode {
    return <div gist={reference_gist(seq, step, pass)} className={`reference step-${step} held`}>{'→ ' + event_name}</div> as StoryNode;
}

export function reference_text(event_name: string): string {
    return '→ ' + event_name;
}

// The Fire speaks (SPEC §7.2): under a step, its command and the derived
// participant; the target event's consequence once, under the first of the
// steps that share it.
export function rendition_node(story: StorySpec, fire: AbstractSequence, p: Participant, pass: string, with_consequence: boolean): StoryNode {
    const step = fire.steps.find(s => s.index === p.step)!;
    return <div gist={rendition_gist(story.id, p.step, pass)} className={`rendition step-${p.step}`}>
        <div>{`> ${step.command} — ${p.derives}`}</div>
        {with_consequence ? <blockquote>{paragraphs(event_consequence(story, p.event))}</blockquote> : []}
    </div> as StoryNode;
}

// The same, as one text: the steps grouped by the event they share, its consequence once (SPEC §7.2).
export function rendition_text(story: StorySpec, fire: AbstractSequence, parts: Participant[], pass: string): StoryNode {
    const groups: Participant[][] = [];
    for (const p of parts) {
        const last = groups[groups.length - 1];
        if (last !== undefined && last[0].event === p.event) {
            last.push(p);
        } else {
            groups.push([p]);
        }
    }
    return <div gist={rendition_text_gist(story.id, pass)} className="spoken-text">
        {groups.map(g => <div className="spoken-group">
            {g.map(p => <div>{`> ${fire.steps.find(s => s.index === p.step)!.command} — ${p.derives}`}</div>)}
            <blockquote>{paragraphs(event_consequence(story, g[0].event))}</blockquote>
        </div>)}
    </div> as StoryNode;
}

// The voice bar as text, for the `speak as` frame.
export function voice_bar_text(voice: VoiceId): string {
    return `— ${voice_of(voice).name} —`;
}

export function coda_node(text: string[]): StoryNode {
    return <div className="coda">{paragraphs(text)}</div> as StoryNode;
}

// The fire-coloured note on a mapped row (SPEC §7.3).
export function annotation_node(seq: string, n: number, pass: string, role: string): StoryNode {
    return <span gist={annotation_gist(seq, n, pass, role)} className="annotation">{`— the ${role}`}</span> as StoryNode;
}

// The chip's barcode: every badge of the board's mappings, in the order of the events.
export function barcode_node(story: StorySpec, mappings: Mapping[]): StoryNode {
    const badges: StoryNode[] = [];
    for (const e of story.events) {
        for (const m of mappings) {
            for (const p of m.placements) {
                if (p.event === e.index) {
                    const look = m.status === 'applied' ? 'solid' : m.status === 'set aside' ? 'hollow' : 'held';
                    badges.push(<span className={`badge step-${p.step} ${look}`}>{String(p.step)}</span> as StoryNode);
                }
            }
        }
    }
    return <span className="barcode">{badges}</span> as StoryNode;
}

export function unmapped_bar_node(seq: string, count: number): StoryNode {
    return <div gist={unmapped_gist(seq)} className="unmapped-bar">{`▸ ${count} events not in the mapping`}</div> as StoryNode;
}

// A copy of a node with no gists and no frame index, so that later ops never land on the reprint (SPEC §3).
export function strip_gists(node: Fragment): Fragment {
    if (!is_story_node(node)) {
        return node;
    }
    return { ...node, data: {}, children: node.children.map(strip_gists) };
}

// Remove every node whose gist matches, anywhere beneath the root: the inverse of graft().
export function remove_gists(root: Knowledge, pattern: GistPattern): Knowledge {
    const visit = (n: Fragment): Fragment => {
        if (!is_story_node(n)) {
            return n;
        }
        const children = n.children
            .filter(c => !(is_story_node(c) && match(c.data.gist, pattern)))
            .map(visit);
        return { ...n, children };
    };
    return visit(root) as Knowledge;
}

// OPS
// Each returns story updates; the hole moves are never animated (the reflect.tsx trick).

export function move_hole_after(target: UpdatesBuilder): StoryUpdaterSpec[] {
    return [S.story_hole().remove(), target.insert_after(<Hole />, true)];
}

export function move_hole_into(target: UpdatesBuilder): StoryUpdaterSpec[] {
    return [S.story_hole().remove(), target.add(<Hole />, true)];
}

const at = (g: Gist) => S.has_gist(exact(g));

// Beat 0: the lesson board appears after the current frame (only its chalk statements).
export function show_lesson_board_ops(fire: AbstractSequence): StoryUpdaterSpec[] {
    return [S.frame().insert_after(lesson_board_node(fire))];
}

// Beat 0: each statement gains its notation (folded).
export function reveal_notation_ops(): StoryUpdaterSpec[] {
    return [S.has_class('notation').css({ absent: false })];
}

// `pick up the chalk`: the lesson board folds to a chip; the story's board opens after the current frame; the hole goes in after ¶1.
export function open_board_ops(story: StorySpec, fire: AbstractSequence): StoryUpdaterSpec[] {
    return [
        at(lesson_board_gist()).css({ chip: true }),
        S.frame().insert_after(board_node(story, fire)),
        ...move_hole_after(at(prose_gist(story.id, 1)))
    ];
}

// The cursor moves from ¶ `from` to ¶ `to` (which may be past the end): the hole follows it.
export function advance_cursor_ops(story: StorySpec, from: number, to: number): StoryUpdaterSpec[] {
    if (from === to) {
        return [];
    }
    return [
        at(prose_gist(story.id, from)).css({ cursor: false, done: true }),
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

// A placement: a badge on the row, a band on it, a reference under the step. A moved step loses its old badge first.
export function place_ops(
    story: StorySpec, step: number, pass: string, event: number, frame: number, event_name: string, previous_event: number | undefined
): StoryUpdaterSpec[] {
    return [
        ...(previous_event === undefined ? [] : erase_ops(story, step, pass, previous_event)),
        S.frame(frame).first(S.has_class('input-text')).add(badge_node(story.id, event, step, pass)),
        S.frame(frame).css({ [`band-${step}`]: true }),
        at(reference_gist(story.id, step, pass)).remove(),
        at(targets_gist(story.id, step)).add(reference_node(story.id, step, pass, event_name))
    ];
}

export function erase_ops(story: StorySpec, step: number, pass: string, event: number): StoryUpdaterSpec[] {
    return [
        at(badge_gist(story.id, event, step, pass)).remove(),
        at(reference_gist(story.id, step, pass)).remove()
    ];
}

// Which rows (frames and ¶s) hold a badge: kept as a class for `collapse the unmapped`.
export function mapped_rows_ops(story: StorySpec, mapped_events: number[], frame_of: (event: number) => number | undefined): StoryUpdaterSpec[] {
    return story.events.flatMap(e => {
        const on = mapped_events.includes(e.index);
        const frame = frame_of(e.index);
        return [
            ...(frame === undefined ? [] : [S.frame(frame).css({ mapped: on, [`band-${'x'}`]: false })]),
            at(prose_gist(story.id, e.prose)).css({ mapped: on || story.events.some(o => o.prose === e.prose && mapped_events.includes(o.index)) })
        ];
    });
}

// `apply`: the Fire speaks under each step; each mapped row is annotated; the badges of this pass are solid.
export function apply_ops(story: StorySpec, fire: AbstractSequence, parts: Participant[], pass: string, frame_of: (event: number) => number | undefined): StoryUpdaterSpec[] {
    const seen_events = new Set<number>();
    return [
        ...parts.map(p => {
            const first = !seen_events.has(p.event);
            seen_events.add(p.event);
            return at(spoken_gist(story.id, p.step)).add(rendition_node(story, fire, p, pass, first));
        }),
        ...parts.map(p => S.frame(frame_of(p.event)!).first(S.has_class('input-text')).add(annotation_node(story.id, p.event, pass, p.role))),
        ...solid_ops(story, pass, true)
    ];
}

// `set aside`: the rendition and the annotations of this pass go; its badges hollow.
export function unapply_ops(story: StorySpec, pass: string): StoryUpdaterSpec[] {
    return [
        S.has_gist({ tag: 'rendition', params: { seq: story.id, pass } }).remove(),
        S.has_gist({ tag: 'rendition_text', params: { seq: story.id, pass } }).remove(),
        S.has_gist({ tag: 'annotation', params: { seq: story.id, pass } }).remove(),
        ...solid_ops(story, pass, false)
    ];
}

function solid_ops(story: StorySpec, pass: string, solid: boolean): StoryUpdaterSpec[] {
    return [
        S.has_gist({ tag: 'badge', params: { seq: story.id, pass } }).css({ solid, hollow: !solid, held: false }),
        S.has_gist({ tag: 'reference', params: { seq: story.id, pass } }).css({ solid, hollow: !solid, held: false })
    ];
}

// The coda (SPEC §9): its own node after the last frame.
export function coda_ops(text: string[]): StoryUpdaterSpec[] {
    return [S.frame().insert_after(coda_node(text))];
}

// `say all set`: the board folds to a chip with its barcode; the hole returns to the root.
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
    return [S.has_class('notation').css({ collapsed })];
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
