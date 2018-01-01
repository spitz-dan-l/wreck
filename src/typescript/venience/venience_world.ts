import {
    CommandResult,
    Command,
    WorldType
} from '../commands'

import {
    Token,
    CommandParser,
    with_early_stopping,
    consume_option_stepwise_eager
} from '../parser'

import {
    FuckDict,
    FuckSet,
    Disablable,
    set_enabled,
    unwrap,
    with_disablable,
    Point2,
    Matrix2,
    arrays_fuck_equal,
    zeros
} from '../datatypes';

import {capitalize, tokenize, split_tokens, untokenize, random_choice, dedent} from '../text_tools';

import {CutsceneData, Cutscene, build_cutscene} from '../cutscenes';

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
        message: dedent`<i>(Welcome to the demo! This game doesn't have a proper name yet.)</i>

        The viewing tower sits twenty feet inset from the footpath, towards the Mystic River. The grass leading out to it is brown with wear.`,
        transitions: [
            [['approach', 'the viewing tower'], 'base, regarding tower']]
    },
    {
        id: 'base, regarding tower',
        message: dedent`The viewing tower stands tall and straight. Its construction is one of basic, stable order. A square grid of thick wooden columns rooted deep within the ground rises up before you; the foundation of the tower.

            A wooden stairway set between the first two rows of columns leads upward.`,
        transitions: [
            [['climb', 'the stairs'], 'stairs 1, ascending']]
    },
    {
        id: 'stairs 1, ascending',
        message: dedent`As you ascend, the ground below you recedes.

            You rifle through your notes to another of Katya’s meditations, this one on Vantage Points:

            <i>"We wander, for the most part, within a tangled, looping mess of thought; a ball of lint."</i>

            The stairway terminates at a flat wooden platform leading around a corner to the left, along the next edge of the tower.`,
        transitions: [
            [['turn', 'left', 'and proceed along the platform'], 'platform 1, ascending'],
            [['turn', 'around', 'and descend the stairs'], 'base, regarding tower']]
    },
    {
        id: 'platform 1, ascending',
        message: dedent`You catch glimpses of the grass, trees, and the Mystic River as you make your way across.

            You continue reading:

            <i>"From within the tangle, we feel lost. It is only when we find a vantage outside of the central tangle, looking over it, that we might sort out the mess in our minds."</i>

            The platform terminates, and another wooden stairway to the left leads further up the tower.`,
        transitions: [
            [['turn', 'left', 'and climb the stairs'], 'stairs 2, ascending'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 1, ascending']]
    },
    {
        id: 'stairs 2, ascending',
        message: dedent`They feel solid under your feet, dull thuds sounding with each step.

            <i>"It can feel like a deliverance when one reaches such a vantage after much aimless wandering."</i>

            The stairs terminate in another left-branching platform.`,
        transitions: [
            [['turn', 'left', 'and proceed along the platform'], 'platform 2, ascending'],
            [['turn', 'around', 'and descend the stairs'], 'platform 1, ascending']]
    },
    {
        id: 'platform 2, ascending',
        message: dedent`You make your way across the weathered wood.

            <i>"The twisting fibres of our journey are put into perspective. We see how one piece of the path relates to another. It is peaceful from up there."</i>

            A final wooden stairway to the left leads up to the top of the tower.`,
        transitions: [
            [['turn', 'left', 'and climb the stairs'], 'top, arriving'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 2, ascending']]
    },
    {
        id: 'top, arriving',
        message: dedent`You reach the top. A grand visage of the Mystic River and Macdonald Park extends before you in all directions.`,
        transitions: [
            [['survey', 'the area'], 'top, surveying'],
            [['descend', 'the stairs'], 'platform 2, ascending']]
    },
    {
        id: 'top, surveying',
        message: dedent`You survey the looping fibres of path around the park, the two wooden bridges at either end, and the frozen river carving your vantage in two.

            You see the path you took to reach this viewing tower. You see it continue further onward, into MacDonald Park, and branch, curving into the brush by the river.

            You see the wooden footbridge crossing the river that you are destined to walk across, if you are ever to return to your study, and transcribe your experiences.

            <i>"But do not be fooled; all there is to do, once one has stood above the tangle for a while, and surveyed it, is to return to it."</i>`,
        transitions: [
            [['descend', 'the stairs'], 'stairs 3, descending']]
    },
    {
        id: 'stairs 3, descending',
        message: dedent`Your view of the surrounding park and river is once again obscured by the weathered wood of the viewing tower, rising up around you.

            <i>"Do not fret, my dear. Return to the madness of life after your brief respite."</i>`,
        transitions: [
            [['turn', 'right', 'and proceed along the platform'], 'platform 2, descending'],
            [['turn', 'around', 'and ascend the stairs'], 'top, surveying']]
    },
    {
        id: 'platform 2, descending',
        message: dedent`The wooden beams of the viewing tower seem more like a maze now than an orderly construction. They branch off of each other and reconnect at odd angles.

            <i>"Expect to forget; to be turned around; to become tangled up."</i>`,
        transitions: [
            [['turn', 'right', 'and descend the stairs'], 'stairs 2, descending'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 3, descending']]
    },
    {
        id: 'stairs 2, descending',
        message: dedent`The light of the sun pokes through odd gaps in the tangles of wood, making you squint at irregular intervals.

            <i>"Find some joy in it; some exhilaration."</i>`,
        transitions: [
            [['turn', 'right', 'and proceed along the platform'], 'platform 1, descending'],
            [['turn', 'around', 'and ascend the stairs'], 'platform 2, descending']]
    },
    {
        id: 'platform 1, descending',
        message: dedent`You know where you must go from here, roughly. The footpath will branch into thick brush up ahead. And a ways beyond that brush, a wooden footbridge.

            <i>"And know that you have changed, dear. That your ascent has taught you something."</i>`,
        transitions: [
            [['turn', 'right', 'and descend the stairs'], 'base, regarding path'],
            [['turn', 'around', 'and proceed along the platform'], 'stairs 2, descending']]
    },
    {
        id: 'base, regarding path',
        message: dedent`What lies within the brush you know you will enter, but which you can no longer see from this low vantage? What will it be like to walk across the footbridge?

            <i>(End of demo. Thanks for playing!)</i>`,
        transitions: []
    }
]);

function transitions_to_commands(transitions: [string, ObserverMomentID][]): Command<VenienceWorld>[] {
    return transitions.map(([cmd, next_om_id]) => ({
        command_name: split_tokens(cmd),
        execute: with_early_stopping(function*(world: VenienceWorld, parser: CommandParser){
            yield parser.done();

            return {
                world: world.update({
                    current_om: next_om_id
                })
            }
        })
    }));
} 

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
    current_om?: ObserverMomentID,
    has_seen?: FuckDict<ObserverMomentID, boolean>,
}

export class VenienceWorld implements WorldType<VenienceWorld>{
    readonly current_om: ObserverMomentID;
    readonly has_seen: FuckDict<ObserverMomentID, boolean>;
    
    constructor({current_om, has_seen}: VenienceWorldState) {
        if (current_om === undefined) {
            current_om = 'base, from path';
        }
        if (has_seen === undefined) {
            has_seen = new FuckDict<ObserverMomentID, boolean>();
        }

        this.current_om = current_om;
        this.has_seen = has_seen;
    }

    update({current_om, has_seen}: VenienceWorldState) {
        if (current_om === undefined) {
            current_om = this.current_om;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }

        return new VenienceWorld({current_om, has_seen});
    }

    handle_command(parser: CommandParser) {
        let world = this;
        return with_early_stopping(function*(parser: CommandParser) {
            let om = tower_oms.get(world.current_om);

            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd)

            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }

            let cmd_choice = yield* consume_option_stepwise_eager(parser, cmd_options);

            yield parser.done();

            let om_id_choice = world.current_om;
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });

            return {world: world.update({
                        current_om: om_id_choice
                    })};
        })(parser);
    }

    interstitial_update() {
        let result: CommandResult<VenienceWorld> = {};
        let world_update: VenienceWorldState = {};

        let message_parts: string[] = [];

        let om_descr = tower_oms.get(this.current_om).message;

        message_parts.push(om_descr);

        if (!this.has_seen.get(this.current_om)) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(this.current_om, true);
            world_update.has_seen = new_has_seen;
        } else {
            //historoony
            let world = this;
            function update_history(history: CommandResult<VenienceWorld>[]): Disablable<CommandResult<VenienceWorld>>[] {
                let new_history = history.map((x) => set_enabled(x, true));

                let pos;
                for (pos = history.length - 1; pos >= 0; pos--) {
                    if (history[pos].world.current_om == world.current_om) {
                        break;
                    } else {
                        new_history[pos] = set_enabled(new_history[pos], false);
                    }
                }

                new_history[pos] = with_disablable(new_history[pos], (res) => {
                    let new_res = {...res}; //copy it so we aren't updating the original history entry
                    return new_res;
                })

                return new_history;
            }
            return {history_updater: update_history};
        }

        if (message_parts.length > 0) {
            result.message = message_parts.join('\n\n');
        }

        if (Object.keys(world_update).length > 0){
            result.world = this.update(world_update);
        }

        return result;
    }
}