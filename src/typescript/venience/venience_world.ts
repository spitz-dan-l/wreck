import {
    CommandResult,
    InterstitialUpdateResult,
    HistoryInterpretationOp,
    WorldType
} from '../commands'

import {
    CommandParser,
    with_early_stopping,
    consume_option_stepwise_eager
} from '../parser'

import {
    FuckDict,
    FuckSet
} from '../datatypes';

import {untokenize} from '../text_tools';

type ObserverMomentID = string;

type ObserverMoment = {
    id: ObserverMomentID,
    message: string,
    transitions: [string[], ObserverMomentID][]
};

function index_oms(oms: ObserverMoment[]): FuckDict<ObserverMomentID, ObserverMoment>{
    let result = new FuckDict<ObserverMomentID, ObserverMoment>();

    for (let om of oms){
        result.set(om.id, om);
    }

    //second/third pass, typecheck em
    let pointed_to: FuckSet<ObserverMomentID> = new FuckDict();
    for (let om of oms) {
        for (let [cmd, om_id] of om.transitions) {
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

let tower_oms = index_oms([
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

//instead of homes, boxes

// Charlotte
// Southern rural culture
// Pacifier, baby's clothes, blanket
// Medical writeup, printed out

// Ben
// New england mist, trees
// All notes
// Musical score of numbers

// Danielle
// Coffee mug
// 

type VenienceWorldState = {
    experiences?: ObserverMomentID[],
    history_index?: number,
    remembered_meditation?: boolean
}

export class VenienceWorld implements WorldType<VenienceWorld>{

    readonly experiences: ObserverMomentID[];
    readonly history_index: number;
    
    readonly remembered_meditation: boolean;

    constructor({experiences, history_index, remembered_meditation}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = ['base, from path'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = false;
        }

        this.experiences = experiences;
        this.history_index = history_index;
        this.remembered_meditation = remembered_meditation;
    }

    update({experiences, history_index, remembered_meditation}: VenienceWorldState) {
        if (experiences === undefined) {
            experiences = this.experiences;
        }
        if (history_index === undefined) {
            history_index = this.history_index;
        }
        if (remembered_meditation === undefined) {
            remembered_meditation = this.remembered_meditation;
        }

        return new VenienceWorld({experiences, history_index, remembered_meditation});
    }

    current_om(): ObserverMomentID {
        for (let i = this.experiences.length - 1; i >= 0; i--) {
            let exp = this.experiences[i]
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null history.";
    }

    handle_command(parser: CommandParser) {
        let world = this;
        return with_early_stopping(function*(parser: CommandParser) {
            let om = tower_oms.get(world.current_om());

            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd)

            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }

            let cmd_choice = yield* consume_option_stepwise_eager(parser, cmd_options);

            yield parser.done();

            let om_id_choice = world.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });

            return {world: world.update({
                        experiences: [...world.experiences, om_id_choice],
                        history_index: world.history_index + 1
                    })};
        })(parser);
    }

    interstitial_update() {
        let result: CommandResult<VenienceWorld> = {};
        let world_update: VenienceWorldState = {};

        let message_parts: string[] = [];

        let om_descr = tower_oms.get(this.current_om()).message;

        message_parts.push(om_descr);

        if (this.experiences.length > 0) {
            let loop_idx = this.experiences.indexOf(this.current_om());
            if (loop_idx !== this.experiences.length - 1) {
                let new_experiences = this.experiences.slice().fill(null, loop_idx + 1);
                world_update.experiences = new_experiences;
            }
        }

        if (this.current_om() === 'top, surveying') {
            world_update.remembered_meditation = true;
        }

        if (message_parts.length > 0) {
            result.message = document.createElement('div');
            result.message.innerHTML = message_parts.join('\n\n');
        }

        if (Object.keys(world_update).length > 0){
            result.world = this.update(world_update);
        }

        return result;
    }

    interpret_history(history_elt: InterstitialUpdateResult<VenienceWorld>): HistoryInterpretationOp {
        
        let interp_op: HistoryInterpretationOp = [];

        if (this.experiences[history_elt.world.history_index] === null) {
            interp_op.push({'add': 'forgotten'});
        }

        if (this.remembered_meditation && history_elt.message !== undefined) {
            let notes = history_elt.message.querySelectorAll('.meditation-1');
            if (notes.length > 0){
                console.log('enabling meditation on an elt');
                interp_op.push({'add': 'meditation-1-enabled'});
            }
        }

        return interp_op;
    }
}
