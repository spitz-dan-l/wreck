"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const commands_1 = require("../commands");
const parser_1 = require("../parser");
const datatypes_1 = require("../datatypes");
const text_tools_1 = require("../text_tools");
const observer_moments_1 = require("./observer_moments");
const _00_prologue_1 = require("./chapters/00_prologue");
const _01_chapter_1_1 = require("./chapters/01_chapter_1");
exports.wrap_handler = (handler) => function (parser) { return parser_1.with_early_stopping(handler.bind(this))(parser); };
class VenienceWorld extends commands_1.World {
    constructor({ experiences, history_index, om_state, has_regarded, has_understood, has_visited }) {
        if (experiences === undefined) {
            experiences = ['bed, sleeping 1'];
        }
        if (history_index === undefined) {
            history_index = 0;
        }
        if (om_state === undefined) {
            om_state = {};
        }
        if (has_regarded === undefined) {
            has_regarded = {};
        }
        if (has_understood === undefined) {
            has_understood = {};
        }
        if (has_visited === undefined) {
            has_visited = {};
        }
        super({ experiences, history_index, om_state, has_regarded, has_understood, has_visited });
    }
    current_om() {
        for (let i = this.state.experiences.length - 1; i >= 0; i--) {
            let exp = this.state.experiences[i];
            if (exp !== null) {
                return exp;
            }
        }
        throw "Somehow got a fully null or empty history.";
    }
    get_om_state(om_id) {
        return this.state.om_state[om_id] || {};
    }
    get_current_om_state() {
        return this.get_om_state(this.current_om());
    }
    transition_to(dest, dest_om_state, message) {
        let update = {
            experiences: [...this.state.experiences, dest],
            history_index: this.state.history_index + 1,
            has_visited: { [dest]: true }
        };
        if (dest_om_state !== undefined) {
            update.om_state = {
                [dest]: dest_om_state
            };
        }
        let result = {
            world: this.update(update)
        };
        if (message !== false) {
            if (message === undefined) {
                let msg;
                let dest_om = VenienceWorld.observer_moments[dest];
                if (this.state.has_visited[dest] && dest_om.short_enter_message !== undefined) {
                    msg = dest_om.short_enter_message;
                }
                else {
                    msg = dest_om.enter_message;
                }
                if (msg !== undefined) {
                    result.message = text_tools_1.wrap_in_div(msg);
                }
            }
            else {
                result.message = message;
            }
        }
        return result;
    }
    get handle_command() {
        return exports.wrap_handler(function* (parser) {
            let om = VenienceWorld.observer_moments[this.current_om()];
            if (!observer_moments_1.are_transitions_declarative(om)) {
                //dispatch to a more specific handler
                return om.handle_command.call(this, parser);
            }
            // we know these are valid because we indexed them
            // too lazy/busy to thread the validity tag up thru the types :(
            let cmd_options = om.transitions.map(([cmd, om_id]) => cmd);
            if (cmd_options.length === 0) {
                yield parser.done();
                return;
            }
            let cmd_choice = parser_1.consume_declarative_dsl(parser, cmd_options);
            if (cmd_choice !== false) {
                yield parser.done();
            }
            let om_id_choice = this.current_om();
            om.transitions.forEach(([cmd, om_id]) => {
                if (cmd_choice === text_tools_1.untokenize(cmd)) {
                    om_id_choice = om_id;
                }
            });
            return this.transition_to(om_id_choice);
        });
    }
    make_look_consumer(look_options, enabled = true) {
        return exports.wrap_handler(function* (parser) {
            let cmd_enabled = enabled && !look_options.every(([cmd, t]) => this.state.has_regarded[t]);
            yield parser.consume_option([datatypes_1.annotate(['look'], {
                    enabled: cmd_enabled,
                    display: parser_1.DisplayEltType.keyword
                })]);
            // let options = look_options.map(([opt_toks, t]) => {
            //     if (this.state.has_regarded[t]) {
            //         return ['~' + opt_toks[0], ...opt_toks.slice(1)];
            //     } else {
            //         return opt_toks;
            //     }
            // });
            // let opt = yield consume_option_stepwise_eager(parser, options);
            // yield parser.done();
            let options = look_options.map(([opt_toks, t]) => datatypes_1.annotate(opt_toks, {
                enabled: !(this.state.has_regarded[t] || false),
                display: parser_1.DisplayEltType.filler
            }));
            let opt = yield parser.consume_option(options);
            yield parser.done();
            let target = null;
            for (let [opt_toks, t] of look_options) {
                if (text_tools_1.untokenize(opt_toks) === opt) {
                    target = t;
                    break;
                }
            }
            return this.regard(target);
        });
    }
    regard(perception_id, formatter) {
        if (formatter === undefined) {
            formatter = text_tools_1.wrap_in_div;
        }
        let result = {
            world: this.update({
                has_regarded: {
                    [perception_id]: true
                }
            }),
            message: formatter(VenienceWorld.perceptions[perception_id].content)
        };
        return result;
    }
    // make_understand_consumer(understand_options: [string[], ContentionID][], enabled=true) {
    //     return wrap_handler(function*(parser: CommandParser){
    //         let cmd_enabled = enabled && !understand_options.every(([cmd, t]) => this.state.has_regarded[t])
    //         yield parser.consume_option([annotate(['try'], {
    //             enabled: cmd_enabled,
    //             display: DisplayEltType.filler
    //         })]);
    //         yield parser.consume_filler(['to']);
    //         // let options = look_options.map(([opt_toks, t]) => {
    //         //     if (this.state.has_regarded[t]) {
    //         //         return ['~' + opt_toks[0], ...opt_toks.slice(1)];
    //         //     } else {
    //         //         return opt_toks;
    //         //     }
    //         // });
    //         // let opt = yield consume_option_stepwise_eager(parser, options);
    //         // yield parser.done();
    //         let options = understand_options.map(([opt_toks, t]) =>
    //             set_enabled(opt_toks, !(this.state.has_contended_with[t] || false))
    //         );
    //         let opt = yield parser.consume_option(options);
    //         yield parser.done();
    //         let target: ContentionID = null;
    //         for (let [opt_toks, t] of understand_options) {
    //             if (untokenize(opt_toks) === opt) {
    //                 target = t;
    //                 break;
    //             }
    //         } 
    //         let result: VenienceWorldCommandResult = {
    //             world: this.update({
    //                 has_contended_with: {
    //                     [target]: true
    //                 }
    //             }),
    //             message: wrap_in_div(VenienceWorld.perceptions[target].content)
    //         };
    //         return result;
    //     });
    // }
    interstitial_update(message) {
        let result = {};
        let world_update = {};
        // apply loop erasure
        // if (this.state.experiences.length > 0) {
        //     let loop_idx = this.state.experiences.indexOf(this.current_om());
        //     if (loop_idx !== this.state.experiences.length - 1) {
        //         let new_experiences = this.state.experiences.slice().fill(null, loop_idx + 1, this.state.experiences.length - 1);
        //         world_update.experiences = new_experiences;
        //     }
        // }
        if (Object.keys(world_update).length > 0) {
            result.world = this.update(world_update);
        }
        return result;
    }
    interpret_history(history_elt) {
        // apply loop erasure mechanic
        // if (this.state.experiences[history_elt.world.state.history_index] === null) {
        //     return [{'add': 'forgotten'}];
        // }
        // apply the OM-specific interpretation
        let om = VenienceWorld.observer_moments[this.current_om()];
        if (observer_moments_1.has_interpretations(om)) {
            if (observer_moments_1.are_interpretations_declarative(om)) {
                return om.interpretations[history_elt.world.current_om()];
            }
            else {
                return om.interpret_history.call(this, history_elt);
            }
        }
    }
}
VenienceWorld.observer_moments = observer_moments_1.index_oms([
    ..._00_prologue_1.default.observer_moments(),
    ..._01_chapter_1_1.default.observer_moments()
]);
VenienceWorld.perceptions = observer_moments_1.index_perceptions([
    ..._00_prologue_1.default.perceptions(),
    ..._01_chapter_1_1.default.perceptions()
]);
exports.VenienceWorld = VenienceWorld;
//# sourceMappingURL=venience_world.js.map