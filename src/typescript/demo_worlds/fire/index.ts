/*
    The Voice of Fire demo: the world assembled from its puffers, with the
    initial knowledge (the two abstract sequences in both forms) and the
    opening line (l. 160) already printed.
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

function initial_knowledge(): Knowledge {
    let k = empty_knowledge();
    for (const seq of ABSTRACT_SEQUENCES) {
        k = ingest(k, sequence_passage(seq));
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
    sequences: {},
    mappings: [],
    collapsed: ['steps'],       // the steps' notation is folded until `expand the steps`
    taught: [],
    knowledge: initial_knowledge()
};

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
