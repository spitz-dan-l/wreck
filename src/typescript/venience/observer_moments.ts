import {
    FuckDict,
    FuckSet,
    StringValidator,
    ValidatedString,
    ValidString,
    set_enabled,
    is_enabled,
    chain_update
} from '../datatypes';

import {
    CommandHandler,
    World
} from '../commands';

import {
    CommandParser,
    DisplayEltType,
    with_early_stopping,
    consume_option_stepwise_eager
} from '../parser'

import {
    VenienceWorldCommandHandler,
    VenienceWorldCommandResult,
    wrap_handler
} from './venience_world';

import {
    tokenize,
    wrap_in_div
} from '../text_tools';

export class PhraseValidator extends StringValidator {
    is_valid(s: ValidatedString<this>): s is ValidString<this> {
        let toks = tokenize(s)[0];
        if (toks.slice(1).some(t => 
            t.startsWith('*') || t.startsWith('&'))) {
            return false;
        }
        return true;
    }
}

export type TransitionList = (
    [ValidatedString<PhraseValidator>[], ObserverMomentID][]
);
export type TransitionListI = {
    transitions: TransitionList,
};

export type Transitions = TransitionListI | (
    VenienceWorldCommandHandler
    & { dest_oms: ObserverMomentID[] }
);

export function is_declarative(t: Transitions): t is TransitionListI {
    return (t as TransitionListI).transitions !== undefined;
}

export type ObserverMoment = {
    id: ObserverMomentID,
    enter_message?: string,
} & Transitions;

export type Perception = {
    id: PerceptionID,
    content: string
}

export function index_oms(oms: ObserverMoment[]): FuckDict<ObserverMomentID, ObserverMoment>{
    let result = new FuckDict<ObserverMomentID, ObserverMoment>();

    for (let om of oms){
        if (is_declarative(om) && om.transitions.length === 1) {
            for (let [cmd, dest] of om.transitions[0]) {
                for (let phrase of cmd) {
                    if (!PhraseValidator.validate(phrase)) {
                        throw `Phrase ${phrase} in single-transition ObserverMoment ${om.id} has * or & somewhere other than the start.`;
                    }
                }
            }
        }
        if (result.has_key(om.id)) {
            throw `Duplicate ObserverMoment provided for ${om.id}`;
        }
        result.set(om.id, om);
    }

    for (let om of ObserverMomentIDs) {
        if (!result.has_key(om)) {
            throw `Missing ObserverMoment: ${om}`;
        }
    }

    //second/third pass, typecheck em
    let pointed_to: FuckSet<ObserverMomentID> = new FuckDict();
    for (let om of oms) {
        let dest_oms: ObserverMomentID[];
        if (is_declarative(om)) {
            dest_oms = om.transitions.map(([cmd, om_id]) => om_id);
        } else {
            dest_oms = om.dest_oms;
        }

        for (let om_id of dest_oms) {
            if (!result.has_key(om_id)) {
                throw `om "${om.id}" has transition to non-existant om "${om_id}"`;
            }
            pointed_to.set(om_id, undefined);
        }
    }

    for (let om of oms.slice(1)) {
        if (!pointed_to.has_key(om.id)) {
            throw `om "${om.id}" is unreachable (and not the first in the list).`;
        }
    }
    
    return result;
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

type ObserverMomentIDs = [
    'bed, sleeping 1',
    'bed, awakening 1',
    'bed, sitting up 1',
    'bed, lying down 1',

    'bed, sleeping 2',
    'bed, awakening 2',
    'bed, sitting up 2',
    
    'desk, sitting down',
    'desk, opening the envelope',
    'desk, trying to understand',
    'desk, considering the sense of panic',
    'desk, searching for the notes',
    
    'grass, slipping further',
    'grass, considering the sense of dread',
    'grass, asking 1',
    'grass, asking 2',
    
    'alcove, beginning interpretation',
    'alcove, interpreting 1',
    'alcove, interpreting 2',
    'alcove, interpreting 3',
    'alcove, ending interpretation',
    
    'alcove, entering the forest',

    'title',

    //ch1
    'alone in the woods'

];

const ObserverMomentIDs: ObserverMomentIDs = [
    'bed, sleeping 1',
    'bed, awakening 1',
    'bed, sitting up 1',
    'bed, lying down 1',

    'bed, sleeping 2',
    'bed, awakening 2',
    'bed, sitting up 2',
    
    'desk, sitting down',
    'desk, opening the envelope',
    'desk, trying to understand',
    'desk, considering the sense of panic',
    'desk, searching for the notes',
    
    'grass, slipping further',
    'grass, considering the sense of dread',
    'grass, asking 1',
    'grass, asking 2',
    
    'alcove, beginning interpretation',
    'alcove, interpreting 1',
    'alcove, interpreting 2',
    'alcove, interpreting 3',
    'alcove, ending interpretation',
    
    'alcove, entering the forest',

    'title',

    //ch1
    'alone in the woods'
]

export type ObserverMomentID = ObserverMomentIDs[number];


type PerceptionIDs = [
    'alcove, general',
    'self, 1',
    'forest, general'
];

const PerceptionIDs: PerceptionIDs = [
    'alcove, general',
    'self, 1',
    'forest, general'
];

export type PerceptionID = PerceptionIDs[number];

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