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

const dim_x = 4;
const dim_y = 3;

const location_descriptions = new FuckDict<Point2, string>([
    [[0,0], 'Origin Point']
])

type VenienceWorldState = {
    readonly location?: Point2,
    readonly has_seen?: Matrix2
}

export class VenienceWorld implements WorldType<VenienceWorld>{
    // readonly state: VenienceWorldState;
    readonly location: Point2;
    readonly has_seen: Matrix2;
    readonly loop_erasure_index: number;
    readonly loop_erasure_message: string;

    constructor({location, has_seen}: VenienceWorldState) {
        if (location === undefined) {
            location = [0, 0];
        }
        if (has_seen === undefined) {
            has_seen = zeros(dim_x, dim_y);
        }

        this.location = location;
        this.has_seen = has_seen;
    }

    update({location, has_seen}: VenienceWorldState) {
        if (location === undefined) {
            location = this.location;
        }
        if (has_seen === undefined) {
            has_seen = this.has_seen;
        }

        return new VenienceWorld({location, has_seen});
    }

    get_commands(){
        let commands: Disablable<Command<VenienceWorld>>[] = [];
        commands.push(go_cmd);
        return commands;
    }

    interstitial_update() {
        let [x, y] = this.location;
        if (!this.has_seen.get(x, y)) {
            let new_has_seen = this.has_seen.copy();
            new_has_seen.set(x, y, 1);
            
            return {
                world: this.update({has_seen: new_has_seen}),
                message: location_descriptions.get(this.location) || undefined
            };
        }
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
