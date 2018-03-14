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
            let look_consumer = this.make_look_consumer([
                [['around'], 'forest, general'],
                [['at', 'myself'], 'self, 1']
            ]);

            let other_consumer = wrap_handler(function*(parser: CommandParser){
                yield parser.consume_exact(['go']);
                yield parser.invalidate();
            })

            return combine.call(this, parser, [look_consumer, other_consumer]);
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