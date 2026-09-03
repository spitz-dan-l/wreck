/*
    Reflection: focusing on one earlier frame, whose facets can then be
    interpreted with the inner actions until the player ends the reflection.

    The direct form, "begin reflection on X", is available when X is the
    frame immediately before. The indirect form, "reflect on X", uses a
    future search to first bring X into recent history.
*/
import { child, exact, gist, Gist, gists_equal, gist_to_string, match, render_gist } from 'gist';
import { find_index, history_array } from 'history';
import { stages } from 'lib/stages';
import { included, update } from 'lib/utils';
import { GAP, Parser, ParserThread, RawConsumeSpec, SUBMIT } from 'parser';
import { createElement, Hole, story_updater, Updates as S } from 'story';
import { is_in_any_simulation, search_future } from 'supervenience';
import { Action } from '../action';
import { ActionID, global_lock, INNER_ACTION_IDS, lock_puffer, Venience } from '../prelude';
import { interpreting_class, unfocused_class, would_start_interpreting_class, would_stop_interpreting_class } from '../styles';
import { get_thread_maker } from '../supervenience_spec';
import { get_facets, render_facet_list } from './facet';

const metaphor_lock = global_lock('Metaphor');

// Only frames produced by these actions can be reflected on.
const REFLECTABLE_ACTION_IDS: ActionID[] = ['consider', 'remember', 'notes'];

function is_reflectable(w: Venience): boolean {
    return w.gist !== undefined && included(w.gist.tag, REFLECTABLE_ACTION_IDS);
}

function begin_reflection(world: Venience, parser: Parser) {
    if (world.previous === undefined) {
        return parser.eliminate();
    }

    const reflectable_worlds = history_array(world).filter(is_reflectable);

    const gists: Gist[] = [];
    for (const w of reflectable_worlds) {
        if (!gists.some(g => gists_equal(w.gist, g))) {
            gists.push(w.gist!);
        }
    }

    parser.label_context = { interp: true, filler: true };

    const immediate_world = is_reflectable(world.previous) ? world.previous : undefined;

    const direct_thread = make_direct_thread(world, immediate_world);

    // The indirect form runs its own future search, so it is never offered
    // inside a simulation (nested searches are far too expensive).
    if (gists.length === 1 || is_in_any_simulation(world)) {
        return direct_thread(parser);
    }

    return parser.split([direct_thread, make_indirect_thread(world, immediate_world, gists)]);
}

function list_facets(world: Venience): Venience {
    if (world.current_interpretation === undefined) {
        throw new Error('Tried to list facets outside of a reflection.');
    }
    const interp_world = find_index(world, world.current_interpretation);
    if (interp_world === undefined) {
        throw new Error('The frame under reflection could not be found.');
    }

    return update(world, {
        story_updates: story_updater(
            S.description(render_facet_list(get_facets(world, interp_world)))
        )
    });
}

function make_list_facets_thread(world: Venience): ParserThread<Venience> {
    return (parser) =>
        parser.consume('facets', () =>
        parser.submit(() =>
        list_facets(world)));
}

function make_direct_thread(world: Venience, immediate_world: Venience | undefined): ParserThread<Venience> {
    return (parser) => {
        if (immediate_world === undefined) {
            return parser.eliminate();
        }
        const subject = immediate_world.gist!;
        const index = immediate_world.index;

        return parser.consume(['begin_reflection on', render_gist.command_noun_phrase(subject), SUBMIT], () =>
            update(world,
                w => metaphor_lock.lock(w, index),
                {
                    current_interpretation: index,
                    gist: () => gist('reflect', { subject }),
                    story_updates: story_updater(
                        S.map_worlds(world, (w, frame) =>
                            frame.css({ [unfocused_class]: w.index < index })),
                        S.frame(index).css({ [interpreting_class]: true }),
                        S.frame(index).would().css({ [would_start_interpreting_class]: true }),
                        S.action(<div>
                            You analyze {render_gist.noun_phrase(subject)}. A sense of focus begins to permeate your mind.
                        </div>)
                    )
                },
                list_facets
            ));
    };
}

const indirect_simulator = 'indirect_reflection';

// The consume spec 'begin_reflection on' is tokenized as 'begin', 'reflection', 'on'.
function is_begin_reflection_command(cmd: RawConsumeSpec[]): boolean {
    return cmd[0]?.token === 'begin' && cmd[1]?.token === 'reflection';
}

function make_indirect_thread(world: Venience, immediate_world: Venience | undefined, gists: Gist[]): ParserThread<Venience> {
    return (parser) =>
        parser.consume({
            tokens: 'reflect_on',
            labels: { interp: true, filler: true }
        }, () => {
            const indirect_threads: ParserThread<Venience>[] = gists.map((g) => () => {
                const search_id = `reflect-indirect-${world.index}-${gist_to_string(g)}`;

                if (immediate_world !== undefined && gists_equal(g, immediate_world.gist)) {
                    return parser.eliminate();
                }

                // A memory can only be remembered once, so reflect on the notes about it instead.
                const subject = match(g, { tag: 'remember', children: { subject: { tag: 'action description' } } })
                    ? gist('notes', { subject: child(g, 'subject') })
                    : g;
                const target = gist('reflect', { subject });

                // move the next story hole inside the current frame
                const world_with_hole = update(world, {
                    story_updates: story_updater(
                        S.group_name('init_frame').story_hole().remove(),
                        S.group_name('init_frame').add(<Hole />, true)
                    )
                });

                const result = search_future({
                    thread_maker: get_thread_maker(),
                    goals: [w => gists_equal(w.gist, target)],
                    max_steps: 2,
                    space: [w => w.gist && gist_to_string(w.gist)],
                    search_id,
                    simulator_id: indirect_simulator,
                    command_filter: (w, cmd) => {
                        // Only reflect once we've reached the target; never reflect on anything else along the way.
                        if (gists_equal(w.gist, subject)) {
                            return is_begin_reflection_command(cmd);
                        }
                        return !is_begin_reflection_command(cmd);
                    }
                }, world_with_hole);

                if (result.result === undefined) {
                    return parser.eliminate();
                }

                return parser.consume({
                    tokens: render_gist.command_noun_phrase(g),
                    labels: { interp: true, filler: true }
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

function make_end_reflection_thread(world: Venience): ParserThread<Venience> {
    return (parser) => parser.consume({
        tokens: 'end_reflection',
        labels: { interp: true, filler: true }
    }, () => parser.submit(() => update(world, metaphor_lock.release, {
        story_updates: story_updater(
            S.group_name('init_frame').story_hole().remove(),
            S.group_name('init_frame').story_root().add(<Hole />, true),
            S.map_worlds(world, (w, frame) => frame.css({ [unfocused_class]: false })),
            S.frame(world.current_interpretation!).css({ [interpreting_class]: false }),
            S.frame(world.current_interpretation!).would().css({ [would_stop_interpreting_class]: true }),
            S.action(<div>Your mind returns to a less focused state.</div>)
        ),
        current_interpretation: undefined,
        // The inner actions can be tried afresh in the next reflection.
        has_tried: _ => _.set_many(_.keys()
            .filter(action => included(action.tag, INNER_ACTION_IDS))
            .map(action => [action, false]))
    })));
}

Action({
    id: 'reflect',
    render: {
        noun_phrase: g => `your reflection on ${render_gist.noun_phrase(child(g, 'subject'))}`,
        command_noun_phrase: g => ['my_reflection_on', GAP, render_gist.command_noun_phrase(child(g, 'subject'))]
    },

    memory_prompt: {
        noun_phrase: 'something meditative',
        command_noun_phrase: 'something_meditative'
    },

    description_noun_phrase: 'reflection',
    description_command_noun_phrase: 'reflection',

    description: "The ability to consciously unpack the contents of one's own experience.",
    katya_quote: <div>
        "Wake up, my dear. Attend to the world around you. <strong>Reflect on</strong> its nature."
    </div>,
    memory: <div>
        Katya took you to the <a target="_blank" href="https://en.wikipedia.org/wiki/Mauna_Kea_Observatories">Mauna Kea Observatories</a> in Hawaii once, to study the astronomers at work.
        <br/>
        There was to be little time to relax or sleep in; astronomers are busy folk.
    </div>,

    puffer: lock_puffer('Metaphor', {
        handle_command: stages(
            [2, (world, parser) => {
                if (!world.has_acquired.get('reflect')) {
                    return parser.eliminate();
                }

                if (world.current_interpretation === undefined) {
                    return begin_reflection(world, parser);
                }
                return parser.split([
                    make_list_facets_thread(world),
                    make_end_reflection_thread(world)
                ]);
            }]
        ),
    })
});
