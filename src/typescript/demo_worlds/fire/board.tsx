/*
    The story nodes and story ops of the board (SPEC §8): the gists that
    address its parts, the passages the knowledge tree holds (the steps in
    both forms, each story event), the printed forms of the columns, the
    Fire's rendition on apply, and the annotations. Phase B1 prints all of
    it flat, as frames at the root; B2 moves it into board nodes, changing
    only this file.
*/
import { exact, gist, Gist, GistPattern, match } from 'gist';
import { createElement, Fragment, is_story_node, Knowledge, StoryNode } from 'story';
import { AbstractSequence, event_consequence, Step, StoryEventSpec, StorySpec } from './data';
import { Participant } from './judge';

// GISTS

export const board_gist = (seq: string): Gist => gist('board', undefined, { seq });
export const prose_gist = (seq: string, n: number): Gist => gist('prose', undefined, { seq, n });
export const event_gist = (seq: string, n: number): Gist => gist('event', undefined, { seq, n });
export const step_gist = (voice: string, n: number): Gist => gist('step', undefined, { voice, n });
export const sequence_gist = (voice: string): Gist => gist('abstract sequence', undefined, { voice });
export const spoken_gist = (seq: string, pass: string): Gist => gist('spoken', undefined, { seq, pass });
export const annotation_gist = (seq: string, n: number, pass: string, role: string): Gist =>
    gist('annotation', undefined, { seq, n, pass, role });
export const classroom_gist = (command: string): Gist => gist('classroom', undefined, { command });

// TEXT

export function paragraphs(ps: string[]): StoryNode[] {
    return ps.map(p => <div>{p}</div> as StoryNode);
}

// One step in both forms: the chalk statement, and beneath it the notation.
export function step_passage(seq: AbstractSequence, step: Step, with_notation: boolean): StoryNode {
    return <div gist={step_gist(seq.voice.id, step.index)} className="step">
        <div className="chalk">{step.chalk}</div>
        {with_notation ? <div className="notation">
            <div className="command">{'> ' + step.command}</div>
            <div>{step.consequence}</div>
        </div> : []}
    </div> as StoryNode;
}

// The right column: every step of the sequence.
export function chalk_column(seq: AbstractSequence, with_notation: boolean): StoryNode {
    return <div gist={sequence_gist(seq.voice.id)} className="right">
        {seq.steps.map(s => step_passage(seq, s, with_notation))}
    </div> as StoryNode;
}

// A story as told: its ¶s, one after another.
export function prose_told(story: StorySpec): StoryNode {
    return <div className="told">
        {story.prose.map(p => <div>{p}</div>)}
    </div> as StoryNode;
}

// The board at open: its title and the ¶s of the left column.
export function board_open(story: StorySpec): StoryNode {
    return <div gist={board_gist(story.id)} className="board">
        <div className="board-title">{story.title}</div>
        {story.prose.map((p, i) => <div gist={prose_gist(story.id, i + 1)} className="prose">{p}</div>)}
    </div> as StoryNode;
}

// The knowledge passage for a story event: its command and its whole consequence.
export function event_passage(story: StorySpec, e: StoryEventSpec): StoryNode {
    return <div gist={event_gist(story.id, e.index)} className="event">
        <div className="command">{'> ' + e.command}</div>
        {paragraphs(event_consequence(story, e.index))}
    </div> as StoryNode;
}

// The Fire speaks (SPEC §7.2): under each step, its command, the derived
// participant, and the target event's consequence.
export function rendition(story: StorySpec, seq: AbstractSequence, parts: Participant[], pass: string): StoryNode {
    return <div gist={spoken_gist(story.id, pass)} className="spoken">
        {parts.map(p => {
            const step = seq.steps.find(s => s.index === p.step)!;
            return <div className="spoken-step">
                <div>{`> ${step.command} — ${p.derives}`}</div>
                <blockquote>{paragraphs(event_consequence(story, p.event))}</blockquote>
            </div>;
        })}
    </div> as StoryNode;
}

// The fire-coloured note on a mapped row (SPEC §7.3).
export function annotation(seq: string, n: number, pass: string, role: string): StoryNode {
    return <div gist={annotation_gist(seq, n, pass, role)} className="annotation">{`— the ${role}`}</div> as StoryNode;
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

export const exact_gist = exact;
