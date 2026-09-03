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
    name: string;           // short name used in commands: "the laying of the tinder"
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
    // What Katya says when a placement fails and nothing more specific is authored (SPEC §10).
    default_nudges: {
        step: { [s in StepIndex]?: string };   // when the placement is not a candidate (L4, L7)
        L1: string;                            // apply with a step unplaced
        L3: string;                            // a step placed before a preparation step it must follow
        L6: string;                            // two steps on one event that does not absorb both
    };
}

// An event of a story, as authored: the imperative the player issues and what follows.
export interface StoryEventSpec {
    index: number;              // 1-based position in the sequence
    voice: VoiceId;             // who must speak it (transcription)
    command: string;            // the imperative the player issues
    consequence: string[];      // paragraphs; `let it follow` lines are added by event_consequence()
    prose: number;              // which prose line (¶) it converts (a ¶ may yield two events)
    remainder?: string;         // for the first event of a two-event ¶: the tail the second one converts
    absorbs?: StepIndex[];      // may carry all of these steps at once (L6)
    name?: string;              // overrides the nominalised event name
    authored?: true;            // the consequence was written by the implementer, not quoted from the .md
}

// A row of a candidate table: step -> event is allowed, and derives this participant.
export interface Candidate {
    event: number;
    derives: string;    // the participant this placement makes the step's role: "the thatch"
    nudge?: string;     // said if this row is chosen but another rule fails
    mark?: string;      // said when this row is placed ("His death. Very well. Hold that.")
}

export type CandidateRows = { [s in StepIndex]?: Candidate[] };
export type CandidateTable = { [pass in Pass]?: CandidateRows };

// An authored nudge for a placement that is not a candidate row.
export interface Nudge {
    step: StepIndex;
    event: number;
    pass?: Pass;        // undefined: any pass
    text: string;
}

// An imperative offered Locked during transcription, with what Katya says about it.
export interface Trap {
    command: string;
    prose?: number;     // undefined: at any ¶
    voice?: VoiceId;    // the voice in which it is offered Locked; undefined: any
    nudge: string;
}

export interface StorySpec {
    id: string;
    title: string;                                  // "the campfire story"
    prose: string[];                                // the ¶ lines, verbatim from the .md
    events: StoryEventSpec[];
    voices: VoiceId[];                              // offered by `speak as`
    follows: number[];                              // prose lines that are consequence-only
    traps: Trap[];
    candidates: { [voice: VoiceId]: CandidateTable };  // keyed by the abstract sequence's voice id
    nudges: Nudge[];
    feelings: string[];                             // the "It felt:" list
    apply_text: { [pass in Pass]?: string };
    apply_reply?: { step: StepIndex, event: number, text: string }[];   // Katya's one line after apply, by placement
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
