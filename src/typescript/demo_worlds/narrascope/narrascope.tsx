/*
    The narrascope demo: a short scene on a bus with an old friend, Sam.

    The player has no physical actions. Instead they consider their impressions,
    reflect on them, and apply the inner actions Katya taught them (scrutinize,
    hammer, volunteer) to the facets of those impressions. Each successful
    interpretation reveals text retroactively in the frame under reflection,
    unlocks the next memory, and moves the puzzle state forward:

        consider Sam ──▶ remember reflection ──▶ reflect on Sam (a chill) ──▶
        remember scrutiny ──▶ scrutinize Sam's demeanor ──▶
        remember the Hammer ──▶ hammer your friendship with Sam ──▶
        consider your history with Sam ──▶ hammer your drifting apart ──▶
        scrutinize your culpability ──▶ remember the Volunteer ──▶
        volunteer to foster the old affinity ──▶ "How are you, Sam?"
*/
import { bottom_up, EXACT, GistRenderer, render_gist, ValidTags } from 'gist';
import { knowledge_gist } from 'knowledge';
import { Seal } from 'lib/static_resources';
import { update } from 'lib/utils';
import { GAP } from 'parser';
import { make_puffer_world_spec } from 'puffer';
import { createElement, story_updater, StoryNode, Updates as S } from 'story';
import { get_initial_world, WorldSpec, world_driver } from 'world';

import { ActionHandler } from './action';
import { Topic } from './consider';
import { Puffers, resource_registry, Venience } from './prelude';
import { apply_facet_interpretation, Exposition } from './reflect';
import { make_memory_available } from './remember';
import { insight_text_class } from './styles';
import './notes';


interface PuzzleState {
    has_chill: boolean;
    has_recognized_something_wrong: boolean;
    is_curious_about_history: boolean;
    has_admitted_negligence: boolean;
    has_unpacked_culpability: boolean;
    has_volunteered: boolean;
    end: boolean;
}

declare module './prelude' {
    export interface Venience extends PuzzleState {}

    export interface StaticResources {
        initial_world_narrascope: PuzzleState
    }
}

resource_registry.initialize('initial_world_narrascope', {
    has_chill: false,
    has_recognized_something_wrong: false,
    is_curious_about_history: false,
    has_admitted_negligence: false,
    has_unpacked_culpability: false,
    has_volunteered: false,
    end: false
});

const init_knowledge = resource_registry.get('initial_world_knowledge');

/*
    GISTS

    Topic gists ('Sam', 'yourself', ...) are declared in prelude/consider.
    The gists below name the facets nested inside the topics, and the kinds of
    text that get revealed when facets are interpreted.
*/
declare module 'gist' {
    export interface StaticGistTypes {
        'your friendship with Sam': [];
        "Sam's demeanor": [];
        'the old affinity': [];
        'your drifting apart': [];
        'your culpability': [];
        // A passage describing some part of a topic (e.g. the notebook, within "yourself").
        description: [{ subject: ValidTags }];
        // Text revealed by successfully interpreting a facet. Never itself a facet.
        insight: [{ subject: ValidTags }];
    }
}

GistRenderer(['the present moment'], {
    noun_phrase: () => 'the present moment',
    command_noun_phrase: () => 'the_present_moment'
});

GistRenderer(['Sam'], {
    noun_phrase: () => 'Sam',
    command_noun_phrase: () => 'sam'
});

GistRenderer(['yourself'], {
    noun_phrase: () => 'yourself',
    command_noun_phrase: () => 'myself'
});

GistRenderer(['your notebook'], {
    noun_phrase: () => 'your notebook',
    command_noun_phrase: () => 'my_notebook'
});

GistRenderer(['your history with Sam'], {
    noun_phrase: () => 'your history with Sam',
    command_noun_phrase: () => 'my_history_with_Sam'
});

GistRenderer(['your friendship with Sam'], {
    noun_phrase: () => 'your friendship with Sam',
    command_noun_phrase: () => 'my_friendship_with_Sam'
});

GistRenderer(["Sam's demeanor"], {
    noun_phrase: () => "Sam's demeanor",
    command_noun_phrase: () => "Sam's_demeanor"
});

GistRenderer(['the old affinity'], {
    noun_phrase: () => 'the old affinity you once had for each other',
    command_noun_phrase: () => 'the_old_affinity'
});

GistRenderer(['your drifting apart'], {
    noun_phrase: () => 'your drifting apart',
    command_noun_phrase: () => 'our_drifting_apart'
});

GistRenderer(['your culpability'], {
    noun_phrase: () => 'your culpability',
    command_noun_phrase: () => 'my_culpability'
});

GistRenderer(['description'], {
    noun_phrase: g => bottom_up(g)(
        (tag, {subject}) => subject,
        render_gist.noun_phrase
    ),
    command_noun_phrase: g => bottom_up(g)(
        (tag, {subject}) => subject,
        render_gist.command_noun_phrase
    )
});

GistRenderer(['insight'], {
    noun_phrase: g => bottom_up(g)(
        (tag, {subject}) => `your insight about ${subject}`,
        render_gist.noun_phrase
    ),
    command_noun_phrase: g => bottom_up(g)(
        (tag, {subject}) => ['my_insight_about', GAP, subject],
        render_gist.command_noun_phrase
    )
});

GistRenderer(['Katya on'], {
    noun_phrase: g => bottom_up(g)(
        (tag, {action_description}) => `Katya's words on ${action_description}`,
        render_gist.noun_phrase
    ),
    command_noun_phrase: g => bottom_up(g)(
        (tag, {action_description}) => ["Katya's_words_on", GAP, action_description],
        render_gist.command_noun_phrase
    )
});

/*
    TOPICS
*/

Topic(<div gist={["the present moment"]}>
    You and Sam are sitting together on the bus.
</div>);

Topic(<div gist={["Sam"]}>
    <div gist={["your friendship with Sam"]}>
        An old friend on his way to work.
    </div>
    <div gist={["Sam's demeanor"]}>
        He glances at you, smiling vaguely.
    </div>
</div>);

Topic(<div gist={["yourself"]}>
    You haven't entirely woken up.
    <br/>
    <div gist={['description', { subject: ['your notebook']}]}>
        A <strong>thick notebook</strong> sits in your lap.
    </div>
</div>);

Topic(<div gist={["your notebook"]}>
    You keep it with you at all times.
    <br/>
    It is filled with the words of someone very wise, who you once knew.
</div>);

Topic(<div gist={["your history with Sam"]}>
    You've known Sam since you both arrived in Boston about 10 years ago.
    <br/>
    You were studying under Katya, and he was doing agricultural engineering a few buildings over.
    <div gist={['your drifting apart']}>
        At some point along the way, you drifted apart.
    </div>
</div>);

/*
    REVEALED TEXT

    Ingested into the knowledge base up front, so that it can be grafted beneath
    the relevant facet when the player interprets it.
*/
function Revealed(story: StoryNode): StoryNode {
    init_knowledge.update(k => k.ingest(story));
    return story;
}

const something_is_wrong = Revealed(
    <div gist={['the old affinity']} className={insight_text_class}>
        ...Something is wrong.
    </div> as StoryNode
);

/*
    CONSIDERING
*/

// Considering yourself for the first time makes your notebook a topic.
ActionHandler(['consider', {subject: ['yourself']}], g => w => {
    if (!w.has_tried.get(g)) {
        return update(w, {
            can_consider: _ => _.set(['your notebook'], true)
        })
    }
    return w;
});

// Considering your notebook makes your memory of note-taking available,
// and changes how the notebook is described from then on.
ActionHandler(['consider', { subject: ['your notebook'] }],
    g => w => {
        if (!w.has_tried.get(g)) {
            const descr_gist = knowledge_gist(
                ['description', { subject: ['your notebook']}],
                ['yourself']
            );
            
            return update(w, {
                knowledge: k => k.update([EXACT, descr_gist], (s) => [
                    s.replace_children(['Your notebook sits in your lap.'])
                ]),
            }, make_memory_available(['action description', undefined, { action: 'notes' }]));
        }
        return w;
    }
);

// Considering Sam for the first time makes your memory of reflection available.
ActionHandler(['consider', { subject: ['Sam']}], g => w => {
    if (!w.has_tried.get(g)) {
        return update(w, make_memory_available(['action description', undefined, { action: 'reflect' }]));
    }
    return w;
});

/*
    REFLECTING ON SAM

    Merely reflecting on your impression of Sam for the first time reveals that
    something is wrong, and makes the memory of scrutiny available.
*/
ActionHandler(['reflect', { subject: ['consider', { subject: ['Sam'] }] }], g => w => {
    if (w.has_chill) {
        return w;
    }
    return update(w,
        w => apply_facet_interpretation(w, {
            parent_gist: knowledge_gist(['Sam'], g[1].subject),
            child_gist: something_is_wrong.data.gist!,
            commentary: (frame) => [
                frame.consequence(<div>A chill comes over you.</div>),
                frame.consequence(<div>
                    Something about Sam is <i>incorrect</i>.
                    <br/>
                    You can feel the discordance in your bones. It scares you.
                </div>)
            ]
        }),
        { has_chill: true },
        make_memory_available(['action description', undefined, { action: 'scrutinize' }])
    );
});

/*
    INTERPRETING SAM
*/

// Scrutinizing Sam's demeanor
ActionHandler(['scrutinize', { facet: ['facet', { knowledge: ['knowledge', { content: ["Sam's demeanor"] }] }] }],
    Exposition({
        revealed_child_story: <blockquote gist={['insight', { subject: ["Sam's demeanor"] }]} className={insight_text_class}>
            Something about his smile feels... false. A lie.
            <br/>
            And his eyes. Flicking here and there. Noncommital. Nervous.
        </blockquote> as StoryNode,
        commentary: (action, frame) => [
            frame.consequence(<div>
                You are struck by the alarming incongruence of his demeanor.
                <br/>
                The initial pleasant, mild impression, revealed upon further scrutiny to be a veneer, a mask, a lie.
            </div>)
        ],
        world_updater: (action, w) => {
            if (w.has_recognized_something_wrong) {
                return w;
            }
            return update(w,
                { has_recognized_something_wrong: true },
                make_memory_available(['action description', undefined, { action: 'hammer' }])
            );
        }
    })
);

// Hammering against your friendship with Sam
ActionHandler(['hammer', { facet: ['facet', { knowledge: ['knowledge', { content: ['your friendship with Sam'] }] }] }],
    Exposition({
        revealed_child_story: <blockquote gist={['insight', { subject: ['your friendship with Sam'] }]} className={insight_text_class}>
            You realize how long it's been since you've seen him anywhere other than the bus.
        </blockquote> as StoryNode,
        commentary: (action, frame) => [
            frame.action(<div>You ask yourself a hard question: <i>Is Sam really your friend?</i></div>),
            frame.consequence(<div>You realize you don't know anymore.</div>),
            frame.prompt(<div>You'll have to <strong>consider your history</strong>.</div>)
        ],
        world_updater: (action, w) => {
            if (w.is_curious_about_history) {
                return w;
            }
            return update(w, {
                is_curious_about_history: true,
                can_consider: _ => _.set(['your history with Sam'], true)
            });
        }
    })
);

/*
    INTERPRETING YOUR HISTORY WITH SAM
*/

// Hammering against your drifting apart
ActionHandler(['hammer', { facet: ['facet', { knowledge: ['knowledge', { content: ['your drifting apart'] }] }] }],
    Exposition({
        revealed_child_story: <blockquote gist={['your culpability']} className={insight_text_class}>
            It wasn't mutual. It was <i>you</i>.
        </blockquote> as StoryNode,
        commentary: (action, frame) => [
            frame.consequence(<div>
                You force yourself to look the truth in the eye: <i>You</i> bowed out of the friendship.
                <br/>
                There was nothing mutual about it. You sidelined him without explanation.
            </div>)
        ],
        world_updater: (action, w) => update(w, { has_admitted_negligence: true })
    })
);

// Scrutinizing your culpability
ActionHandler(['scrutinize', { facet: ['facet', { knowledge: ['knowledge', { content: ['your culpability'] }] }] }],
    Exposition({
        revealed_child_story: <blockquote gist={['insight', { subject: ['your culpability'] }]} className={insight_text_class}>
            After Katya left, you turned inward. Closed off.
            <br/>
            You stopped being curious about people like Sam.
        </blockquote> as StoryNode,
        commentary: (action, frame) => [
            frame.consequence(<div>
                There's no doubt you did it out of self-preservation.
                <br/>
                There's also no doubt he deserved better.
                <br/>
                You wince at the guilt.
            </div>)
        ],
        world_updater: (action, w) => {
            if (w.has_unpacked_culpability) {
                return w;
            }
            return update(w,
                { has_unpacked_culpability: true },
                make_memory_available(['action description', undefined, { action: 'volunteer' }])
            );
        }
    })
);

/*
    VOLUNTEERING
*/

ActionHandler(['volunteer', { facet: ['facet', { knowledge: ['knowledge', { content: ['the old affinity'] }] }] }],
    Exposition({
        revealed_child_story: <blockquote gist={['insight', { subject: ['the old affinity'] }]} className={insight_text_class}>
            Indeed. It's time to try to do something about it.
        </blockquote> as StoryNode,
        commentary: (action, frame) => [
            frame.consequence(<div>You turn in your seat, and look him in the eyes, and say,</div>)
        ],
        world_updater: (action, w) => update(w, { has_volunteered: true })
    })
);

/*
    OUTRO
*/

const outro_lock = resource_registry.get('global_lock').get_pre_runtime()('Outro');

// Not locked to an owner itself (it has to be able to take the lock away from
// the reflection puffers), so it checks the puzzle state by hand.
Puffers({
    role_brand: true,

    pre: world => {
        if (world.has_volunteered) {
            return update(world, w => outro_lock.lock(w));
        }
        return world;
    },

    handle_command: (world, parser) => {
        if (!world.has_volunteered || world.end) {
            return parser.eliminate();
        }

        return parser.consume('How are you, Sam?', () =>
            parser.submit(() =>
                update(world, {
                    end: true,
                    story_updates: story_updater(S.consequence(<div>
                        <div className={insight_text_class}>
                            VENIENCE WORLD
                        </div>
                        A work of interactive fiction
                        <br/>
                        by Daniel Spitz
                        <br/><br/>
                        Thank you for playing the demo!
                    </div>))
                })
            )
        );
    }
});

export { Venience } from './prelude';

resource_registry.get('gist_renderer_dispatchers')[Seal]();
resource_registry.get('initial_world_knowledge')[Seal]();

let initial_venience_world: Venience = {
    ...get_initial_world<Venience>(),
    ...resource_registry.get('initial_world_prelude').get_pre_runtime(),
    ...resource_registry.get('initial_world_metaphor').get_pre_runtime(),
    ...resource_registry.get('initial_world_consider').get_pre_runtime(),
    ...resource_registry.get('initial_world_narrascope').get_pre_runtime(),
    ...resource_registry.get('initial_world_memories').get_pre_runtime()
};

// The opening text is the story for "the present moment", printed into frame 0.
initial_venience_world = update(initial_venience_world, {
    story_updates: story_updater(S.description(
        init_knowledge.get().get_exact(['the present moment'])!)
    )
});

const puffer_index = resource_registry.get('puffer_index').get_pre_runtime();
export const venience_world_spec = make_puffer_world_spec(initial_venience_world, puffer_index.all(false));

export function new_venience_world() {
    return world_driver(venience_world_spec);
}

declare module './prelude' {
    export interface StaticResources {
        venience_world_spec: WorldSpec<Venience>;
    }
}

resource_registry.initialize('venience_world_spec', venience_world_spec);
resource_registry[Seal]();
