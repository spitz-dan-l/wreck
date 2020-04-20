import { gist, Gist, gists_equal, gist_to_string, render_gist, ValidTags, match, Gists, bottom_up } from "gist";
import { history_array } from "history";
import { update, keys, included } from "lib";
import { stages } from "lib/stages";
import { Parser, ParserThread } from "parser";
import { createElement, Hole, story_updater, Updates as S } from "story";
import { is_simulated, search_future } from "supervenience";
import { Action } from "../action";
import { get_facets, render_facet_list } from "../facet";
import { lock_and_brand, resource_registry, Venience } from "../prelude";
import { interpreting_class, unfocused_class, would_start_interpreting_class, would_stop_interpreting_class } from "../styles";
import { get_thread_maker } from "../supervenience_spec";
import { INNER_ACTION_IDS } from "./inner_action";


declare module '../prelude' {
    export interface StaticActionGistTypes {
        contemplate: [{ subject: ValidTags }];
    }
}

const global_lock = resource_registry.get('global_lock', false);
let metaphor_lock = global_lock('Metaphor');


function begin_contemplation(world: Venience, parser: Parser) {
    if (world.previous === undefined) {
        return parser.eliminate();
    }

    let contemplatable_worlds: Venience[] = history_array(world).filter(w => w.gist !== undefined && w.gist[0] !== 'contemplate');
    
    let gists: Gist[] = [];
    for (let w of contemplatable_worlds) {
        if (gists.findIndex(g2 => gists_equal(w.gist!, g2)) === -1) {
            gists.push(w.gist!);
        }
    }

    parser.label_context = { interp: true, filler: true };

    const immediate_world: Venience | undefined = (world.previous.gist !== undefined && world.previous.gist[0] !== 'contemplate') ?
        world.previous :
        undefined;

    const direct_thread = make_direct_thread(world, immediate_world);

    if (gists.length === 1 || is_simulated(indirect_simulator, world)) {
        return direct_thread(parser);
    }

    const indirect_thread = make_indirect_thread(world, immediate_world, gists);

    const result = parser.split([direct_thread, indirect_thread]);
    return result
}


function make_direct_thread(world: Venience, immediate_world: Venience | undefined): ParserThread<Venience> {
    return (parser) => {
        if (immediate_world === undefined) {
            return parser.eliminate();
        }
        return parser.consume(['contemplate', render_gist.command_noun_phrase(immediate_world.gist!)], () =>
        parser.submit(() => {

        const index = immediate_world.index;

        const observable_facets = get_facets(world, immediate_world.gist!);

        return update(world,
            w => metaphor_lock.lock(w, index),
            {
                current_interpretation: index,
                gist: () => gist('contemplate', { subject: immediate_world.gist! }),
                story_updates: story_updater(
                    S.map_worlds(world, (w, frame) =>
                        frame.css({
                            [unfocused_class]: w.index < index
                        })),
                    S.frame(index).apply(s => [
                        s.css({
                            [interpreting_class]: true
                        }),
                        s.would().css({
                            [would_start_interpreting_class]: true
                        })
                    ]),
                    S.action(<div>
                        You contemplate {render_gist.noun_phrase(immediate_world.gist!)}. A sense of focus begins to permeate your mind.
                    </div>),
                    S.description(
                        render_facet_list(observable_facets))
                )
            }
        );
    }))};
}

const indirect_simulator = 'indirect_contemplation';
                
function make_indirect_thread(world: Venience, immediate_world: Venience | undefined, gists: Gist[]): ParserThread<Venience> {
    return (parser) =>
        parser.consume({
            tokens: 'contemplate',
            labels: {interp: true, filler: true}
        }, () => {
        const indirect_threads: ParserThread<Venience>[] = gists.map((g: Gist) => () => {
            const indirect_search_id = `contemplate-indirect-${world.index}-${gist_to_string(g)}`;

            if (immediate_world !== undefined && gists_equal(g, immediate_world.gist!)) {
                return parser.eliminate();
            }

            let matched = match(g)(['remember', { subject: ['action description']}]);
            const target_gist = gist('contemplate', {
                subject: matched ? gist('notes', {subject: matched[1].subject}) : g
            });

            // move the next story hole inside the current frame
            world = update(world, {
                story_updates: story_updater(
                    S.group_name('init_frame').apply(s => [
                        s.story_hole().remove(),
                        s.add(<Hole />)
                    ])
                )
            });

            const result = search_future({
                thread_maker: get_thread_maker(),
                goals: [w => !!w.gist && gists_equal(w.gist, target_gist)],
                max_steps: 2,
                space: [w => w.gist && gist_to_string(w.gist)],
                search_id: indirect_search_id,
                simulator_id: indirect_simulator,
                command_filter: (w, cmd) => {
                    let would_contemplate = cmd[0] && cmd[0].token === 'contemplate';

                    if (w.gist && gists_equal(w.gist, target_gist[1].subject)) {
                        return would_contemplate;
                    }
                    return !would_contemplate;
                }
            }, world);

            if (result.result === undefined) {
                return parser.eliminate();
            }

            return parser.consume({
                tokens: render_gist.command_noun_phrase(g),
                labels: {interp: true, filler: true}
            }, () =>
            parser.submit(() =>
                update(result.result!, {
                    story_updates: story_updater(
                        S.frame(world.index).css({ [unfocused_class]: false })
                    )
                })
            ));
        });

        return parser.split(indirect_threads);
        });
}

function end_contemplation(world: Venience, parser: Parser) {
    return parser.consume({
        tokens: 'end_contemplation',
        labels: {interp: true, filler: true}
    }, () => parser.submit(() =>
    update(world,
        metaphor_lock.release,
        {
            story_updates: story_updater(
                S.group_name('init_frame').apply(s => [
                    s.story_hole().remove(),
                    s.story_root().add(<Hole />)
                ]),
                S.map_worlds(world, (w, frame) =>
                    frame.css({ [unfocused_class]: false })),
                S.frame(world.current_interpretation!).apply(s => [
                    s.css({
                        [interpreting_class]: false
                    }),
                    s.would().css({
                        [would_stop_interpreting_class]: true
                    })
                ]),
                S.action('Your mind returns to a less focused state.')
            ),
            current_interpretation: undefined,
            has_tried: _ => {
                let result = _;

                for (const action_gist of _.keys()) {
                    if (included(action_gist[0], keys(INNER_ACTION_IDS))) {
                        result = result.set(action_gist, false);
                    }
                }

                return result;
            }
        }
    )));
}

Action({
    id: 'contemplate',
    render_impls: {
        noun_phrase: (g) => bottom_up(g)(
            (tag, {subject}) => `your contemplation of ${subject}`,
            render_gist.noun_phrase
        ),
        command_noun_phrase: (g) => bottom_up(g)(
            (tag, {subject}) => ['my_contemplation_of', subject],
            render_gist.command_noun_phrase
        )
    },

    memory_prompt_impls: {
        noun_phrase: (g) => 'something meditative',
        command_noun_phrase: (g) => 'something_meditative',
    },

    description_noun_phrase: 'contemplation',
    description_command_noun_phrase: 'contemplation',

    description: "The ability to consciously observe the contents of one's own experience.",
    katya_quote: <div>
        "Wake up, my dear. Attend to the world around you. <strong>Contemplate</strong> its nature."
    </div>,
    memory: <div>
        Katya took you to the <a target="_blank" href="https://en.wikipedia.org/wiki/Mauna_Kea_Observatories">Mauna Kea Observatories</a> in Hawaii once, to study the astronomers at work.
        <br/>
        There was to be little time to relax or sleep in; astronomers are busy folk.
    </div>,

    puffer: lock_and_brand('Metaphor', {
        handle_command: stages(
            [2, (world, parser) => {
                if (!world.has_acquired.get('contemplate')) {
                    return parser.eliminate();
                }
                
                if (world.current_interpretation === undefined) {
                    return begin_contemplation(world, parser);
                } else {
                    return end_contemplation(world, parser);
                }
            }]
        ),
    })
});