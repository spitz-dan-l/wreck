import {
    FuckDict,
    FuckSet
} from '../datatypes';

import {
    CommandHandler,
    WorldType
} from '../commands';

import {
    CommandParser
} from '../parser';

import {
    VenienceWorldCommandHandler
} from './venience_world';

export type TransitionList = [string[], ObserverMomentID][];
export type TransitionListI = { transitions: TransitionList };

export type Transitions = TransitionListI | (
    VenienceWorldCommandHandler
    & { target_oms: ObserverMomentID[] }
);

export function has_transition_list(t: Transitions): t is TransitionListI {
    return (t as TransitionListI).transitions !== undefined;
}

export type ObserverMoment = {
    id: ObserverMomentID,
    message: string
} & Transitions;

function index_oms(oms: ObserverMoment[]): FuckDict<ObserverMomentID, ObserverMoment>{
    let result = new FuckDict<ObserverMomentID, ObserverMoment>();

    for (let om of oms){
        result.set(om.id, om);
    }

    //second/third pass, typecheck em
    let pointed_to: FuckSet<ObserverMomentID> = new FuckDict();
    for (let om of oms) {
        let dest_oms: ObserverMomentID[];
        if (has_transition_list(om)) {
            dest_oms = om.transitions.map(([cmd, om_id]) => om_id);
        } else {
            dest_oms = om.target_oms;
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

export type ObserverMomentID = (
    // Alcove
    'bed, sleeping 1' |
    'bed, awakening 1' |
    'bed, sitting up 1' |
    'bed, lying down 1' |

    'bed, sleeping 2' |
    'bed, awakening 2' |
    'bed, sitting up 2' |
    'bed, looking around' |
    
    'desk, sitting down' |
    'desk, opening the envelope' |
    'desk, trying to understand' |
    'desk, considering the sense of panic' |
    'desk, searching for the notes' |
    
    'grass, slipping further' |
    'grass, considering the sense of dread' |
    'grass, asking 1' |
    'grass, asking 2' |
    
    'alcove, beginning interpretation' |
    'alcove, interpreting 1' |
    'alcove, interpreting 2' |
    'alcove, interpreting 3' |
    'alcove, ending interpretation' |
    
    'alcove, entering the forest' |

    // Tower
    'base, from path' | 
    'base, regarding tower' |
    'stairs 1, ascending' |
    'platform 1, ascending' |
    'stairs 2, ascending' |
    'platform 2, ascending' |
    'top, arriving' |
    'top, surveying' |
    'stairs 3, descending' |
    'platform 2, descending' |
    'stairs 2, descending' |
    'platform 1, descending' |
    'base, regarding path'
);

// // Alcove
//     'bed, sleeping 1' |
//     'bed, awakening 1' |
//     'bed, sitting up 1' |
//     'bed, lying down 1' |

//     'bed, sleeping 2' |
//     'bed, awakening 2' |
//     'bed, sitting up 2' |
//     'bed, looking around' |
    
//     'desk, sitting down' |
//     'desk, opening the envelope' |
//     'desk, trying to understand' |
//     'desk, considering the sense of panic' |
//     'desk, searching for the notes' |
    
//     'grass, slipping further' |
//     'grass, considering the sense of dread' |
//     'grass, asking 1' |
//     'grass, asking 2' |
    
//     'grass, beginning interpretation' |
//     'grass, interpreting 1' |
//     'grass, interpreting 2' |
//     'grass, interpreting 3' |
//     'grass, ending interpretation' |
    
//     'alcove, entering the forest' |

// Syntax shortcuts:
// * = keyword
// & = option

export let alcove_oms = index_oms([
    {
        id: 'bed, sleeping 1',
        message: '',
        transitions: [
            [['*awaken'], 'bed, awakening 1']]
    },
    {
        id: 'bed, awakening 1',
        message: 'You awaken in your bed.',
        transitions: [
            [['*sit', '&up'], 'bed, sitting up 1']]
    },
    {
        id: 'bed, sitting up 1',
        message: `You push yourself upright, blankets falling to your waist. You squint and see only the palest light of dawn. Crickets chirp in the forest bordering your alcove.
        <br /><br />
        Your body still feels heavy with sleep.
        <br /><br />
        Perhaps you’ll doze until the sun rises properly.`,
        transitions: [
            [['*lie', '&down'], 'bed, lying down 1']]
    },
    {
        id: 'bed, lying down 1',
        message: `Yes, no reason to be up now.
        <br /><br />
        You slide back under the blankets. The autumn breeze cools your face.`,
        transitions: [
            [['*sleep', 'until', '&sunrise'], 'bed, sleeping 2']]
    },
    {
        id: 'bed, sleeping 2',
        message: `You dream of<br /><br />
        <i>calamity,</i><br /><br />
        a <i>shattered mirror,</i><br /><br />
        an <i>ice-covered mountain,</i><br /><br />
        <div class="interp">and <i>her voice.</i></div>`,
        transitions: [
            [['*awaken'], 'bed, awakening 2']]
    },
    {
        id: 'bed, awakening 2',
        message: `You awaken in your bed.`,
        transitions: [
            [['*sit', '&up'], 'bed, sitting up 2']]
    },
    {
        id: 'bed, sitting up 2',
        message: `As you do, the first ray of sun sparkles through the trees, hitting your face. Your alcove begins to come to life.`,
        transitions: [
            [['*look', '&around'], 'bed, looking around']]
    },
    {
        id: 'bed, looking around',
        message: `You turn and dangle your knees off the bed. Your feet brush against the damp grass on the ground.
        <br /><br />
        You see your desk and chair a few paces away, in the center of the alcove.
        <br /><br />
        On all sides you are surrounded by trees.`,
        transitions: [
            [['*sit', 'at', '&the desk'], 'desk, sitting down']]
    },
    {
        id: 'desk, sitting down',
        message: `You pace across the grass and take your seat at the leather-bound study chair.
        <br /><br />
        On the desk is a large parchment envelope, bound in twine.`,
        transitions: [
            [['*open', '&the envelope'], 'desk, opening the envelope']]
    },
    {
        id: 'desk, opening the envelope',
        message: `You undo the twine, leaving it in a loop on the desk.
        <br /><br />
        You unfold the envelope’s flap.
        <br /><br />
        It’s empty. But it shouldn’t be.`,
        transitions: [
            [['*try', 'to', '&understand'], 'desk, trying to understand']]
    },
    {
        id: 'desk, trying to understand',
        message: `A panic comes over you. Without your notes, how will you continue your work?
        <br /><br />
        How will you understand? How will you honor Katya’s memory?`,
        transitions: [
            [['*consider', 'the', 'sense of', '&panic'], 'desk, considering the sense of panic']]
    },
    {
        id: 'desk, considering the sense of panic',
        message: `<div class="interp">
        Katya used to say that panic was like slipping down an ice-covered mountain face.
        <br /><br />
        It throws one particular path into relief: the path to the bottom.
        </div>`,
        transitions: [
            [['*search', 'for', '&the notes'], 'desk, searching for the notes']]
    },
    {
        id: 'desk, searching for the notes',
        message: `You look in the envelope again.
        <br /><br />
        You look in the grass under the desk, under the chair.
        <br /><br />
        You strip your bed, finding nothing within the folds.
        <br /><br />
        <div class="interp">
        You can feel yourself slipping down an icy hill.
        </div>`,
        transitions: [
            [['*slip', 'further'], 'grass, slipping further']]
    },
    {
        id: 'grass, slipping further',
        message: `Thoughts of dread, of a terrible, empty future, fill your mind.
        <br /><br />
        You curl up on the grass beneath you, holding yourself.`,
        transitions: [
            [['*consider', 'the sense of', '&dread'], 'grass, considering the sense of dread']]
    },
    {
        id: 'grass, considering the sense of dread',
        message: `<div class="interp">
        <i>"Catch your breath, dear,"</i> Katya would say. <i>"The mountain, the ice, they are here to tell you something."</i>
        </div>`,
        transitions: [
            [['tell', 'me', '&what?'], 'grass, asking 1']]
    },
    {
        id: 'grass, asking 1',
        message: `<div class="interp">
        <i>"That you are capable of a great deal of care, my dear.
        <br /><br />
        That your capacity to experience meaning is as energetic as a body sliding down a mountain."</i>
        </div>`,
        transitions: [
            [['what', 'should', 'I', '&do?'], 'grass, asking 2']]
    },
    {
        id: 'grass, asking 2',
        message: `<div class="interp"><i>
        "Judge the direction of gravity. Judge the slickness of the ice.
        <br /><br />
        "Survey the horizon.
        <br /><br />
        "And then, choose where to go."
        </i></div>`,
        transitions: [
            [['begin', '*interpretation'], 'alcove, beginning interpretation']]
    },
    {
        id: 'alcove, beginning interpretation',
        message: `
        <div class="face-of-it">
        A nervous energy buzzes within your mind.
        <br />
        <br />
        </div>
        <div class="interp-alcove-1">
        Care. Orientation. Like gravity binds a body to the earth, your vulnerability binds you to a sense of meaning within the world. You have a <i>compass</i>.
        <br />
        <br />
        </div>
        <div class="face-of-it">
        Your notes are gone.
        <br />
        <br />
        </div>
        <div class="interp-alcove-2">
        Your effort to organize and understand everything Katya taught you, over the years. If they are truly gone, it is a great setback.
        <br />
        <br />
        But the ice is not impossibly slick; the rock face not impossibly sheer. You have your mind. She still whispers to you, even now, <i>my dear.</i>
        <br />
        <br />
        </div>
        <div class="face-of-it">
        You are alone in a grassy alcove in the forest.
        </div>
        <div class="interp-alcove-3">
        <br />
        Indeed. And perhaps it is time to leave. To venture forth from the confines of this sanctuary you have constructed.
        <br /><br />
        Your view of the horizon is occluded by the trees, from in here. Set out, seeking <i>new vantages.</i>
        </div>`,
        transitions: [
            [['*judge', '&the direction of gravity'], 'alcove, interpreting 1']]
    },
    {
        id: 'alcove, interpreting 1',
        message: ``,
        transitions: [
            [['*judge', '&the slickness of the ice'], 'alcove, interpreting 2']]
    },
    {
        id: 'alcove, interpreting 2',
        message: ``,
        transitions: [
            [['*survey', '&the horizon'], 'alcove, interpreting 3']]
    },
    {
        id: 'alcove, interpreting 3',
        message: ``,
        transitions: [
            [['end', '*interpretation'], 'alcove, ending interpretation']]
    },
    {
        id: 'alcove, ending interpretation',
        message: `A sense of purpose exists within you. It had been occluded by the panic, but you can feel it there, now.
        <br /><br />
        You do not know precisely what awaits you, out there. You have slept and worked within this alcove for such a long time. You are afraid to leave.
        <br /><br />
        But your sense of purpose compels you. To go. To seek. To try to understand.`,
        transitions: [
            [['*enter', 'the', '&forest'], 'alcove, entering the forest']]
    },
    {
        id: 'alcove, entering the forest',
        message: `What lies within the forest, and beyond? What will it be like, out there?
        <br /><br />
        <i>(End of demo. Thanks for playing!)</i>`,
        transitions: []
    },
]);

export let tower_oms = index_oms([
    {
        id: 'base, from path',
        message: `<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>
        <br /><br />
        The viewing tower sits twenty feet inset from the footpath, towards the Mystic River.
        The grass leading out to it is brown with wear.`,
        transitions: [
            [['approach', 'the viewing tower'], 'base, regarding tower']]
    },
    {
        id: 'base, regarding tower',
        message: `The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.
            <br /><br />
            A wooden stairway set between the first two rows of columns leads upward.`,
        transitions: [
            [['climb', 'the stairs'], 'stairs 1, ascending']]
    },
    {
        id: 'stairs 1, ascending',
        message: `As you ascend, the ground below you recedes.
            <br /><br />
            <div class="meditation-1">
                You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:
                <br /><br />
                "We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."
                <br /> <br />
            </div>
            The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
        transitions: [
            [['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'],
            [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
    },
    {
        id: 'platform 1, ascending',
        message: `You catch glimpses of the grass, trees, and the Mystic River as you make your way across.
            <br /><br />
            <div class="meditation-1">
            You continue reading:
            <br /><br />
            "From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."
            <br /><br />
            </div>
            The platform terminates, and another wooden stairway to the left leads further up the tower.`,
        transitions: [
            [['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
    },
    {
        id: 'stairs 2, ascending',
        message: `They feel solid under your feet, dull thuds sounding with each step.
            <br /><br />
            <div class="meditation-1">
            "It can feel like a deliverance when one reaches such a vantage after much aimless wandering."
            <br /><br />
            </div>
            The stairs terminate in another left-branching platform.`,
        transitions: [
            [['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'],
            [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
    },
    {
        id: 'platform 2, ascending',
        message: `You make your way across the weathered wood.
            <br /><br />
            <div class="meditation-1">
            "The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."
            <br /><br />
            </div>
            A final wooden stairway to the left leads up to the top of the tower.`,
        transitions: [
            [['turn', 'left', 'and climb the stairs'], 'top, arriving'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
    },
    {
        id: 'top, arriving',
        message: `You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
        transitions: [
            [['survey', 'the area'], 'top, surveying'],
            [['descend', 'the stairs'], 'platform 2, ascending']]
    },
    {
        id: 'top, surveying',
        message: `You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.
            <br /><br />
            You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.
            <br /><br />
            You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.
            <br /><br />
            <div class="meditation-1">
            "But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."
            </div>`,
        transitions: [
            [['descend', 'the stairs'], 'stairs 3, descending']]
    },
    {
        id: 'stairs 3, descending',
        message: `Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.
            <br /><br />
            <div class="meditation-1">
            "Do not fret, my dear. Return to the madness of life after your brief respite."
            </div>`,
        transitions: [
            [['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'],
            [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
    },
    {
        id: 'platform 2, descending',
        message: `The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.
            <div class="meditation-1">
            <br /><br />
            "Expect to forget; to be turned around; to become tangled up."
            </div>`,
        transitions: [
            [['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
    },
    {
        id: 'stairs 2, descending',
        message: `The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.
            <div class="meditation-1">
            <br /><br />
            "Find some joy in it; some exhilaration."
            </div>`,
        transitions: [
            [['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'],
            [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
    },
    {
        id: 'platform 1, descending',
        message: `You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.
            <div class="meditation-1">
            <br /><br />
            "And know that you have changed, dear. That your ascent has taught you something."
            </div>`,
        transitions: [
            [['turn', 'right', 'and descend the stairs'], 'base, regarding path'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
    },
    {
        id: 'base, regarding path',
        message: `What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?
            <br /><br />
            <i>(End of demo. Thanks for playing!)</i>`,
        transitions: []
    }
]);