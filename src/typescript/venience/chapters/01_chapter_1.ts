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
    DisplayEltType
} from '../../parser';

let ch1_oms: () => ObserverMoment[] = () => [
    {
        id: 'alone in the woods',
        enter_message: `Chapter 1 - A Sense Of Direction
        <br />
        <br />
        You are alone in the woods in midmorning.`,
        handle_command: wrap_handler(function*(parser: CommandParser) {
            // let state = this.state.om_state['alone in the woods'] || {};
            // let has_looked: {[key: string]: boolean} = state.has_looked || {};
            
            // let look_options = ['around', 'at myself'].map(c =>
            //     set_enabled(tokenize(c)[0], !(has_looked[c] || false))
            // );

            let cmd_options = [];
            let display: DisplayEltType.keyword;

            let look_options: PerceptionID[] = [
                'forest, general',
                'self, 1'
            ];
            if (look_options.every(x => this.state.has_regarded[x])) {
                cmd_options.push(annotate(['look'], {enabled: false, display}));
            } else {
                cmd_options.push(annotate(['look'], {enabled: true, display}));
            }
            cmd_options.push(['go']);

            yield parser.consume_option(cmd_options);

            //if command is look
            return this.look_handler([
                [['around'], 'forest, general'],
                [['at', 'myself'], 'self, 1']
            ]).call(this, parser);



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