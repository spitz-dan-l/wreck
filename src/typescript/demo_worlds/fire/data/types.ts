/*
    The data types of the Voice of Fire demo (SPEC §3): voices, abstract
    sequences and their steps, the authored stories with their events and
    candidate tables, and the mappings the player builds on the board.

    Everything here is plain data, so that it can live inside world state.
*/

export type VoiceKind = 'embodied' | 'disembodied' | 'abstract';
export type VoiceId = string;   // 'the friends', 'the children', 'time', 'you', ...

export interface Voice {
    id: VoiceId;
    name: string;
    kind: VoiceKind;
}

export type StepIndex = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export const STEP_INDICES: StepIndex[] = [1, 2, 3, 4, 5, 6, 7, 8];

export type Pass = 'first' | 'second';
export const PASSES: Pass[] = ['first', 'second'];

// One step of an abstract sequence, in both of its forms.
export interface Step {
    index: StepIndex;
    chalk: string;          // "The laying of the tinder"                (l. 166–180)
    name: string;           // authored short name used in commands: "the laying of the tinder"
    command: string;        // "lay the tinder"                          (l. 185–215)
    consequence: string;    // "A small patch of tinder is placed in the hearth."
    role: string;           // the role this step is about (one of the sequence's roles)
    after: StepIndex[];     // partial order: the steps that must land no later than this one
}

// An abstract sequence is a voice with steps (SPEC §2): the Voice of Fire, the Pillaging.
export interface AbstractSequence {
    voice: Voice;
    steps: Step[];
    roles: string[];
    // What Katya says when a placement fails (SPEC §10): the rule's own
    // text for L1, L3, L6 and L7, and a default per step for L4.
    nudges: {
        step: { [s in StepIndex]?: string };
        L1: string;
        L3: string;
        L6: string;
        L7: string;
        L7_step: { [s in StepIndex]?: string };   // L7 wording that differs for a step (the ash)
    };
}

// An event of a story, as authored: the imperative the player issues and what follows.
export interface StoryEventSpec {
    index: number;              // 1-based position in the sequence
    voices: VoiceId[];          // who may speak it (transcription); the demo authors one entry everywhere
    command: string;            // the imperative the player issues
    name: string;               // authored nominalisation, without ordinal: "the laying of the tinder in the pit"
    consequence: string[];      // paragraphs; `let it follow` lines are added by event_consequence()
    prose: number;              // which prose line (¶) it converts (a ¶ may yield two events)
    remainder?: string;         // for the first event of a two-event ¶: the tail the second one converts
    absorbs?: StepIndex[];      // may carry all of these steps at once (L6)
    authored?: true;            // the consequence was written by the implementer, not quoted from the .md
}

// A row of a candidate table: step -> event is allowed, and derives this participant.
export interface Candidate {
    event: number;
    derives: string;    // the participant this placement makes the step's role: "the thatch"
    mark?: string;      // said when this row is placed ("His death. Very well. Hold that.")
}

export type CandidateRows = { [s in StepIndex]?: Candidate[] };
export type CandidateTable = { [pass in Pass]?: CandidateRows };

// An authored nudge for a placement that is not a candidate row (L4).
export interface Nudge {
    step: StepIndex;
    event: number;
    text: string;
}

// A wrong option offered during transcription: Available, and issuing it
// prints the nudge as the frame's consequence and changes nothing else.
export interface Trap {
    command: string;
    prose?: number;     // undefined: at any ¶
    voice?: VoiceId;    // the voice in which it is offered; undefined: any
    nudge: string;
}

export interface StorySpec {
    id: string;
    title: string;                                  // "the campfire story"
    prose: string[];                                // the ¶ lines, verbatim from the .md
    events: StoryEventSpec[];
    voices: VoiceId[];                              // offered by `speak as`, in this order
    follows: number[];                              // prose lines that are consequence-only
    traps: Trap[];
    candidates: { [voice: VoiceId]: CandidateTable };  // keyed by the abstract sequence's voice id
    nudges: Nudge[];
    feelings: string[];                             // the "It felt:" list
    grafted_feeling?: string;                       // a last feeling, added only at the end of the lesson
    apply_text: { [pass in Pass]?: string[] };      // paragraphs; the .md's own sentences where it has them
}

// A named part of a story's sequence, rememberable on its own ("the two lines").
export interface SubSequenceSpec {
    id: string;
    title: string;
    story: string;
    events: number[];
    feelings: string[];
}

export interface Placement {
    step: StepIndex;
    event: number;
}

export type MappingStatus = 'open' | 'applied' | 'set aside';

export interface Mapping {
    voice: VoiceId;         // the abstract sequence
    sequence: string;       // the story id
    pass: Pass;
    placements: Placement[];
    status: MappingStatus;
}
