import {
    ObserverMoment,
    Perception,
    PerceptionID
} from '../observer_moments';

import {
    wrap_handler,
    VenienceWorldCommandResult
} from '../venience_world';

import {
    tokenize,
    wrap_in_div
} from '../../text_tools';

import {
    set_enabled,
    is_enabled,
    annotate
} from '../../datatypes';

import {
    CommandParser,
    DisplayEltType,
    combine
} from '../../parser';

let ch1_oms: () => ObserverMoment[] = () => [
    {
        id: 'alone in the woods',
        enter_message: `Chapter 1 - A Sense Of Direction
        <br />
        <br />
        You are alone in the woods in midmorning.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            // let cmd_options = [];
            // let display: DisplayEltType.keyword;

            let look_handler = this.make_look_handler([
                [['around'], 'forest, general'],
                [['at', 'myself'], 'self, 1']
            ]);

            let other_handler = wrap_handler(function*(parser: CommandParser){
                yield parser.consume_exact(['go']);
            })

            return combine.call(this, parser, [look_handler, other_handler]);
            // cmd_options.push(annotate(['look'], {enabled: look_handler !== false, display}));
            // cmd_options.push(annotate(['go'], {display}));

            // let cmd = yield parser.consume_option(cmd_options);

            // if (cmd === 'look' && look_handler !== false) {
            //     return look_handler.call(this, parser);
            // }




            // let option = yield parser.consume_option(look_options);
            // yield parser.done();

            // let result2: VenienceWorldCommandResult = {};
            // if (option === 'around') {
            //     result.message = wrap_in_div(`
            //     The sun trickles through the thick brush.
            //     <br />
            //     <br />
            //     The growth of the forest surrounds you in every direction.`);
            // } else {
            //     result.message = wrap_in_div(`
            //     You are wearing a perfectly dignified pair of silk pajamas.`);
            // }
            
            // result.world = this.update({
            //     om_state: {
            //         ['alone in the woods']: {
            //             has_looked: {
            //                 [option]: true
            //             }
            //         }
            //     }
            // });

            // return result;
        }),
        dest_oms: ['alone in the woods']
    }
];

let ch1_perceptions: () => Perception[] = () => [
    {
        id: 'forest, general',
        content: `
        The sun trickles through the thick brush.
        <br />
        <br />
        The growth of the forest surrounds you in every direction.`
    }
]

export default {
    observer_moments: ch1_oms,
    perceptions: ch1_perceptions
};