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
    Disablable,
    set_enabled,
    unwrap,
    with_disablable,
    Point2,
    Matrix2,
    arrays_fuck_equal,
    zeros
} from '../datatypes';

import {capitalize, tokenize, split_tokens, untokenize, random_choice} from '../text_tools';

import {CutsceneData, Cutscene, build_cutscene} from '../cutscenes';

const dim_x = 3;
const dim_y = 3;

const location_descriptions = new FuckDict<Point2, string>([
    [[0,0], "Your Desk"],
    [[2,0], "Charlotte's Home"],
    [[0,2], "Ben's Home"], 
    [[2,2], "Danielle's Home"]
])

let initial_cutscene: [string, string][] = [
    [null,
     'You walk into a small alcove within the trees.\n\nOn the grass sits a small wooden desk and chair. On the desk is a thickly stuffed manilla envelope, wrapped shut by a length of brown twine, tied in a haphazard bow.'],

    ["sit at the desk",
     "The chair creeks quietly under your weight."],
    
    ['untie the bow',
     "It pulls loose easily."],
    
    ['unwrap the twine',
     'The manilla envelope bulges out as you pull away the twine and wrap it in a small loop.'],

    ['unfold the envelope flap',
     'As you do, your notes are revealed. Many pages of them, stuffed into the envelope.'],
];

const location_cutscenes = new FuckDict<Point2, CutsceneData>([
    [[0, 0], initial_cutscene]
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
    location?: Point2,
    has_seen?: Matrix2,
    cutscene?: Cutscene<VenienceWorld>
}

export class VenienceWorld implements WorldType<VenienceWorld>{
    // readonly state: VenienceWorldState;
    readonly location: Point2;
    readonly has_seen: Matrix2;
    readonly loop_erasure_index: number;
    readonly loop_erasure_message: string;

    readonly cutscene: Cutscene<VenienceWorld>;

    constructor({location, has_seen, cutscene}: VenienceWorldState) {
        if (location === undefined) {
            location = [0, 0];
        }
        if (has_seen === undefined) {
            has_seen = zeros(dim_x, dim_y);
        }
        if (cutscene === undefined) {
            cutscene = [];
        }

        this.location = location;
        this.has_seen = has_seen;
        this.cutscene = cutscene;
    }

    update({location, has_seen, cutscene}: VenienceWorldState) {
        if (location === undefined) {
            location = this.location;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }
        if (cutscene === undefined) {
            cutscene = this.cutscene;
        }

        return new VenienceWorld({location, has_seen, cutscene});
    }

    get_commands(){
        let commands: Disablable<Command<VenienceWorld>>[] = [];
        if (this.cutscene.length > 0) {
            commands.push(this.cutscene[0])
        } else {
            commands.push(go_cmd);
        }
        return commands;
    }

    interstitial_update() {
        let result: CommandResult<VenienceWorld> = {};
        let world_update: VenienceWorldState = {};

        let message_parts: string[] = [];

        let [x, y] = this.location;
        if (!this.has_seen.get(x, y)) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(x, y, 1);
            
            world_update.has_seen = new_has_seen;

            let loc_descr = location_descriptions.get(this.location);
            if (loc_descr !== null) {
                message_parts.push(loc_descr);
            }

            let loc_cutscene = location_cutscenes.get(this.location);
            if (loc_cutscene !== undefined){
                let cs = loc_cutscene.slice();
                if (cs[0][0] === null) { //if the first item in the cutscene data has a null command, put its message here and chop it off
                    message_parts.push(cs[0][1]);
                    cs.shift();
                }
                world_update.cutscene = build_cutscene(cs);
            }
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

const go_cmd: Command<VenienceWorld> = {
    command_name: ['go'],
    execute: with_early_stopping(
        function*(world: VenienceWorld, parser: CommandParser){
            let dir_options: Disablable<Token[]>[] = [];
            
            let [x, y] = world.location;
            dir_options.push(set_enabled(['north'], y > 0));
            dir_options.push(set_enabled(['south'], y < dim_y - 1));
            dir_options.push(set_enabled(['east'], x < dim_x - 1));
            dir_options.push(set_enabled(['west'], x > 0));
            
            let dir_word = yield parser.consume_option(dir_options);
            
            //TODO: add adverb component to end of command

            yield parser.done();

            let [dest_x, dest_y] = [x, y];

            switch (dir_word) {
            case 'north':
                dest_y--;
                break;
            case 'south':
                dest_y++;
                break
            case 'east':
                dest_x++;
                break;
            case 'west':
                dest_x--;
                break;
            }
            
            if (world.has_seen.get(dest_x, dest_y)) {
                // do loop erasure on history
                function update_history(history: CommandResult<VenienceWorld>[]): Disablable<CommandResult<VenienceWorld>>[] {
                    let new_history = history.map((x) => set_enabled(x, true));

                    let pos;
                    for (pos = history.length - 1; pos >= 0; pos--) {
                        if (arrays_fuck_equal(history[pos].world.location, [dest_x, dest_y])) {
                            break;
                        } else {
                            new_history[pos] = set_enabled(new_history[pos], false);
                        }
                    }

                    new_history[pos] = with_disablable(new_history[pos], (res) => {
                        let new_res = {...res}; //copy it so we aren't updating the original history entry
                        new_res.message += '\n\nYou consider leaving, but decide not to.';
                        return new_res;
                    })

                    return new_history;
                }
                return {history_updater: update_history};
            }

            let new_world = world.update({location: [dest_x, dest_y]});
            let message = capitalize(dir_word) + ' you go.';

            return {world: new_world, message: message};
        }
    )
}
