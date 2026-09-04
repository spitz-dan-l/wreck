/*
    The Voice of Fire demo.

    How this world is built. Everything the lesson can say is data under
    `data/`: the voices, the two patterns (abstract sequences) with their
    steps, roles and nudges, the four stories with their prose, events and
    candidate tables, and Katya's lines verbatim. The world state
    (`world.ts`) is a handful of plain fields — the lesson's beat, the open
    board and its cursor, the sequences finished, the mappings, the
    knowledge tree — and everything else is derived, mostly from the gists
    that label the frames of the history: which lines have been said, which
    frames are a story's events, where the voice bars stand, what the roles
    have been. Six puffers each own one verb family: the classroom script,
    transcription at the board, mapping, remembering, expand/collapse, and
    the frame labelling they all rely on. The judge (`judge.ts`) is pure
    functions over a `Sequence` and a `Mapping`, ranking the rules L1–L7 and
    choosing the nudge. The board (`board.tsx`) is story nodes addressed by
    gist and story ops on them, so the page and the tests see the same tree.
    Adding a story is a data file and its lines in the script; adding a
    pattern is a data file and a candidate table; nothing in the puffers
    names a story except the script.
*/
import { update } from 'lib/utils';
import { make_puffer_world_spec } from 'puffer';
import { empty_knowledge, ingest, Knowledge, story_updater, Updates as S } from 'story';
import { get_initial_world, world_driver } from 'world';
import { ABSTRACT_SEQUENCES } from './data';
import { QUOTED } from './data/katya';
import { paragraphs, sequence_passage } from './board';
import { FireWorld } from './world';
import { classroom_puffer } from './puffers/classroom';
import { display_puffer } from './puffers/display';
import { frames_puffer } from './puffers/frames';
import { mapping_puffer } from './puffers/mapping';
import { remember_puffer } from './puffers/remember';
import { transcription_puffer } from './puffers/transcription';

export { FireWorld } from './world';
export * from './data';

// The two patterns, in both forms, known from the start.
function initial_knowledge(): Knowledge {
    let k = empty_knowledge();
    for (const pattern of ABSTRACT_SEQUENCES) {
        k = ingest(k, sequence_passage(pattern));
    }
    return k;
}

const initial_world: FireWorld = {
    ...get_initial_world<FireWorld>(),
    lesson: 0,
    gist: undefined,
    voice: undefined,
    board: undefined,
    cursor: undefined,
    at_the_cursor: false,
    finished: [],
    mappings: [],
    collapsed: ['steps'],       // the steps' notation is folded until Katya rewrites it (the second `listen`)
    taught: [],
    knowledge: initial_knowledge()
};

// The opening line (l. 160) is already printed.
const initial_world_with_opening = update(initial_world, {
    story_updates: story_updater(S.description(paragraphs(QUOTED.l160)))
});

export const fire_world_spec = make_puffer_world_spec(initial_world_with_opening, [
    frames_puffer,
    classroom_puffer,
    transcription_puffer,
    mapping_puffer,
    remember_puffer,
    display_puffer
]);

export function new_fire_world() {
    return world_driver(fire_world_spec);
}
