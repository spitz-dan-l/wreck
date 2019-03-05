import {
    // FuckDict,
    FuckSet,
    ValidatedString,
    ValidString,
    set_enabled,
    is_enabled,
    chain_update,
    infer_literal_array
} from '../datatypes';

import {
    CommandHandler,
    HistoryInterpretationOp,
    World
} from '../commands';

import {
    CommandParser,
    DisplayEltType,
    with_early_stopping,
    PhraseDSLValidator
} from '../parser'

import {
    VenienceWorldCommandHandler,
    VenienceWorldCommandResult,
    VenienceWorldHistoryInterpreter,
    wrap_handler
} from './venience_world';

import {
    tokenize,
    wrap_in_div
} from '../text_tools';

const ObserverMomentIDs = infer_literal_array(
    'imagining 0',
    'imagining 1',
    'imagining 2',
    'imagining 3',
    'imagining 4',
    'imagining 5',
    'home 1',
    'home silenced',
    'home listened',
    'outside 1',
    'outside 2',
    'outside 3',
    'outside 4',
    'outside 4, death',
    'outside 5',
    'outside 5, death',
    'dark pool 1',
    'dark pool 2',
    'dark pool 3',
    'dark pool 4',
    'dark pool 5',
    'dark pool 5, death',
    'dark pool 6'
)


export type ObserverMomentID = typeof ObserverMomentIDs[number];

const PerceptionIDs = infer_literal_array(
    'myself',
    'merfolk',
    'family',
    'researcher',
    'dark pool',
    'failed experiments',
    'experiment',
    'broadcaster'
);

export type PerceptionID = typeof PerceptionIDs[number];


const ContentionIDs = infer_literal_array(
    // ch1
    'tangle, 1',
    'tangle, 2',
    'tangle, 3',
    'tangle, failure'
)

export type ContentionID = typeof ContentionIDs[number];



export type TransitionList = (
    [ValidatedString<PhraseDSLValidator>[], ObserverMomentID][]
);
export type TransitionListI = {
    transitions: TransitionList,
};

export type Transitions = TransitionListI | (
    VenienceWorldCommandHandler
    & { dest_oms: ObserverMomentID[] }
);

export function are_transitions_declarative(t: Transitions): t is TransitionListI {
    return (t as TransitionListI).transitions !== undefined;
}

export type InterpretationList = {[key in ObserverMomentID]?: HistoryInterpretationOp};

export type InterpretationListI = {
    interpretations?: InterpretationList
};

export type Interpretations = InterpretationListI | VenienceWorldHistoryInterpreter;

export function has_interpretations(i: Partial<Interpretations>): i is Interpretations {
    return (i as any).interpretations !== undefined || (i as any).interpret_history !== undefined;
}

export function are_interpretations_declarative(i: Interpretations): i is InterpretationListI {
    return (i as InterpretationListI).interpretations !== undefined;
}

export type ObserverMoment = {
    id: ObserverMomentID | ObserverMomentID[],
    enter_message?: string,
    short_enter_message?: string,
} & Transitions & Interpretations;

export type Perception = {
    id: PerceptionID,
    content: string
}

// export type Recitation = {
//     id: RecitationID,
//     contents: string[]
// }

export function index_oms(oms: ObserverMoment[]): {[K in ObserverMomentID]: ObserverMoment}{
    // let result = new FuckDict<ObserverMomentID, ObserverMoment>();
    let result: Partial<{[K in ObserverMomentID]: ObserverMoment}> = {};
    for (let om of oms){
        if (are_transitions_declarative(om)) {
            for (let [cmd, dest] of om.transitions) {
                for (let phrase of cmd) {
                    if (!PhraseDSLValidator.validate(phrase)) {
                        throw `Transition phrase "${phrase}" in ObserverMoment ${om.id} has ~ or * or & somewhere other than the start.`;
                    }
                }
            }
        }
        if (om.id in result) {
            throw `Duplicate ObserverMoment provided for ${om.id}`;
        }
        if (typeof om.id === 'string'){
            result[om.id] = om;
        } else {
            for (let om_id of om.id) {
                result[om_id] = om;
            }
        }
    }

    for (let om_id of ObserverMomentIDs) {
        if (!(om_id in result)) {
            throw `Missing ObserverMoment: ${om_id}`;
        }
    }

    //second/third pass, typecheck em
    let pointed_to = new Set<ObserverMomentID>();
    for (let om of oms) {
        let dest_oms: ObserverMomentID[];
        if (are_transitions_declarative(om)) {
            dest_oms = om.transitions.map(([cmd, om_id]) => om_id);
        } else {
            dest_oms = om.dest_oms;
        }

        for (let om_id of dest_oms) {
            if (om_id !== null) {
                if (!(om_id in result)) {
                    throw `om "${om.id}" has transition to non-existant om "${om_id}"`;
                }
                pointed_to.add(om_id);
            }
        }
    }

    for (let om of oms.slice(1)) {
        let om_ids: ObserverMomentID[];
        if (typeof om.id === 'string') {
            om_ids = [om.id];
        } else {
            om_ids = om.id;
        }
        for (let om_id of om_ids) {
            if (!pointed_to.has(om_id)) {
                throw `om "${om.id}" is unreachable (and not the first in the list).`;
            }
        }
    }
    
    return <{[K in ObserverMomentID]: ObserverMoment}>result;
}

export function index_perceptions(perceptions: Perception[]): {[K in PerceptionID]: Perception} {
    let result: Partial<{[K in PerceptionID]: Perception}> = {};
    for (let p of perceptions) {
        if (!(p.id in result)) {
            result[p.id] = p;
        } else {
            throw `Duplicate perception definition for ${p.id}`;
        }
    }

    for (let p of PerceptionIDs) {
        if (!(p in result)) {
            throw `Missing PerceptionID: ${p}`;
        }
    }

    return <{[K in PerceptionID]: Perception}>result;
}

// Syntax shortcuts:
// * = keyword
// & = option

// export let tower_oms = index_oms([
//     {
//         id: 'base, from path',
//         enter_message: `<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>
//         <br /><br />
//         The viewing tower sits twenty feet inset from the footpath, towards the Mystic River.
//         The grass leading out to it is brown with wear.`,
//         transitions: [
//             [['approach', 'the viewing tower'], 'base, regarding tower']]
//     },
//     {
//         id: 'base, regarding tower',
//         enter_message: `The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.
//             <br /><br />
//             A wooden stairway set between the first two rows of columns leads upward.`,
//         transitions: [
//             [['climb', 'the stairs'], 'stairs 1, ascending']]
//     },
//     {
//         id: 'stairs 1, ascending',
//         enter_message: `As you ascend, the ground below you recedes.
//             <br /><br />
//             <div class="meditation-1">
//                 You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:
//                 <br /><br />
//                 "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
//                 <br /> <br />
//             </div>
//             The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
//         transitions: [
//             [['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'],
//             [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
//     },
//     {
//         id: 'platform 1, ascending',
//         enter_message: `You catch glimpses of the grass, trees, and the Mystic River as you make your way across.
//             <br /><br />
//             <div class="meditation-1">
//             You continue reading:
//             <br /><br />
//             "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
//             <br /><br />
//             </div>
//             The platform terminates, and another wooden stairway to the left leads further up the tower.`,
//         transitions: [
//             [['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
//     },
//     {
//         id: 'stairs 2, ascending',
//         enter_message: `They feel solid under your feet, dull thuds sounding with each step.
//             <br /><br />
//             <div class="meditation-1">
//             "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
//             <br /><br />
//             </div>
//             The stairs terminate in another left-branching platform.`,
//         transitions: [
//             [['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'],
//             [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
//     },
//     {
//         id: 'platform 2, ascending',
//         enter_message: `You make your way across the weathered wood.
//             <br /><br />
//             <div class="meditation-1">
//             "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
//             <br /><br />
//             </div>
//             A final wooden stairway to the left leads up to the top of the tower.`,
//         transitions: [
//             [['turn', 'left', 'and climb the stairs'], 'top, arriving'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
//     },
//     {
//         id: 'top, arriving',
//         enter_message: `You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
//         transitions: [
//             [['survey', 'the area'], 'top, surveying'],
//             [['descend', 'the stairs'], 'platform 2, ascending']]
//     },
//     {
//         id: 'top, surveying',
//         enter_message: `You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
//             <br /><br />
//             You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
//             <br /><br />
//             You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
//             <br /><br />
//             <div class="meditation-1">
//             "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
//             </div>`,
//         transitions: [
//             [['descend', 'the stairs'], 'stairs 3, descending']]
//     },
//     {
//         id: 'stairs 3, descending',
//         enter_message: `Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.
//             <br /><br />
//             <div class="meditation-1">
//             "Do not fret, my dear. Return to the madness of life after your brief respite."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'],
//             [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
//     },
//     {
//         id: 'platform 2, descending',
//         enter_message: `The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.
//             <div class="meditation-1">
//             <br /><br />
//             "Expect to forget; to be turned around; to become tangled up."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
//     },
//     {
//         id: 'stairs 2, descending',
//         enter_message: `The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.
//             <div class="meditation-1">
//             <br /><br />
//             "Find some joy in it; some exhilaration."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'],
//             [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
//     },
//     {
//         id: 'platform 1, descending',
//         enter_message: `You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.
//             <div class="meditation-1">
//             <br /><br />
//             "And know that you have changed, dear. That your ascent has taught you something."
//             </div>`,
//         transitions: [
//             [['turn', 'right', 'and descend the stairs'], 'base, regarding path'],
//             [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
//     },
//     {
//         id: 'base, regarding path',
//         enter_message: `What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?
//             <br /><br />
//             <i>(End of demo. Thanks for playing!)</i>`,
//         transitions: []
//     }
// ]);