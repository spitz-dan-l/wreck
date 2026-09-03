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
import { child, exact, gist, GistMap, GistRenderer, render_gist } from 'gist';
import { map, update } from 'lib/utils';
import { GAP } from 'parser';
import { make_puffer_world_spec } from 'puffer';
import { createElement, lookup_or_throw, StoryNode, story_updater, Updates as S } from 'story';
import { get_initial_world, world_driver } from 'world';

import { action_description } from './action';
import { Topic } from './consider';
import { ActionHandler, all_puffers, get_initial_knowledge, global_lock, Puffers, unlocked_puffer, Venience } from './prelude';
import { apply_facet_interpretation, Exposition, facet } from './reflect';
import { make_memory_available } from './remember';
import { insight_text_class } from './styles';
import { set_world_spec } from './supervenience_spec';
import './notes';

/*
    GISTS

    Topics ('Sam', 'yourself', ...) and the facets nested inside them are
    plain gists. Two more tags are used for revealed text:
        description - a passage describing some part of a topic (e.g. the notebook, within "yourself")
        insight     - text revealed by successfully interpreting a facet; never itself a facet
*/

GistRenderer({ tag: 'the present moment' }, {
    noun_phrase: () => 'the present moment',
    command_noun_phrase: () => 'the_present_moment'
});

GistRenderer({ tag: 'Sam' }, {
    noun_phrase: () => 'Sam',
    command_noun_phrase: () => 'sam'
});

GistRenderer({ tag: 'yourself' }, {
    noun_phrase: () => 'yourself',
    command_noun_phrase: () => 'myself'
});

GistRenderer({ tag: 'your notebook' }, {
    noun_phrase: () => 'your notebook',
    command_noun_phrase: () => 'my_notebook'
});

GistRenderer({ tag: 'your history with Sam' }, {
    noun_phrase: () => 'your history with Sam',
    command_noun_phrase: () => 'my_history_with_Sam'
});

GistRenderer({ tag: 'your friendship with Sam' }, {
    noun_phrase: () => 'your friendship with Sam',
    command_noun_phrase: () => 'my_friendship_with_Sam'
});

GistRenderer({ tag: "Sam's demeanor" }, {
    noun_phrase: () => "Sam's demeanor",
    command_noun_phrase: () => "Sam's_demeanor"
});

GistRenderer({ tag: 'the old affinity' }, {
    noun_phrase: () => 'the old affinity you once had for each other',
    command_noun_phrase: () => 'the_old_affinity'
});

GistRenderer({ tag: 'your drifting apart' }, {
    noun_phrase: () => 'your drifting apart',
    command_noun_phrase: () => 'our_drifting_apart'
});

GistRenderer({ tag: 'your culpability' }, {
    noun_phrase: () => 'your culpability',
    command_noun_phrase: () => 'my_culpability'
});

GistRenderer({ tag: 'description' }, {
    noun_phrase: g => render_gist.noun_phrase(child(g, 'subject')),
    command_noun_phrase: g => render_gist.command_noun_phrase(child(g, 'subject'))
});

GistRenderer({ tag: 'insight' }, {
    noun_phrase: g => `your insight about ${render_gist.noun_phrase(child(g, 'subject'))}`,
    command_noun_phrase: g => ['my_insight_about', GAP, render_gist.command_noun_phrase(child(g, 'subject'))]
});

/*
    TOPICS
*/

Topic(<div gist={gist('the present moment')}>
    You and Sam are sitting together on the bus.
</div> as StoryNode);

Topic(<div gist={gist('Sam')}>
    <div gist={gist('your friendship with Sam')}>
        An old friend on his way to work.
    </div>
    <div gist={gist("Sam's demeanor")}>
        He glances at you, smiling vaguely.
    </div>
</div> as StoryNode);

Topic(<div gist={gist('yourself')}>
    You haven't entirely woken up.
    <br/>
    <div gist={gist('description', { subject: gist('your notebook') })}>
        A <strong>thick notebook</strong> sits in your lap.
    </div>
</div> as StoryNode);

Topic(<div gist={gist('your notebook')}>
    You keep it with you at all times.
    <br/>
    It is filled with the words of someone very wise, who you once knew.
</div> as StoryNode);

Topic(<div gist={gist('your history with Sam')}>
    You've known Sam since you both arrived in Boston about 10 years ago.
    <br/>
    You were studying under Katya, and he was doing agricultural engineering a few buildings over.
    <div gist={gist('your drifting apart')}>
        At some point along the way, you drifted apart.
    </div>
</div> as StoryNode);

/*
    CONSIDERING
*/

// Considering yourself for the first time makes your notebook a topic.
ActionHandler({ tag: 'consider', children: { subject: { tag: 'yourself' } } }, action => w => {
    if (w.has_tried.get(action)) {
        return w;
    }
    return update(w, {
        can_consider: _ => _.set(gist('your notebook'), true)
    });
});

// Considering your notebook makes your memory of note-taking available,
// and changes how the notebook is described from then on.
ActionHandler({ tag: 'consider', children: { subject: { tag: 'your notebook' } } }, action => w => {
    if (w.has_tried.get(action)) {
        return w;
    }
    return update(w, {
        knowledge: k => {
            const yourself = lookup_or_throw(k, gist('yourself'));
            const described = S.has_gist({ tag: 'description', children: { subject: { tag: 'your notebook' } } })
                .replace_children(['Your notebook sits in your lap.']);
            return { ...k, children: k.children.map(c => c === yourself ? apply_to(yourself, described) : c) };
        },
        story_updates: story_updater(S.prompt(<div>
            Each day you try to <strong>remember something</strong> that she told you, and write it down.
        </div>))
    }, make_memory_available(action_description('notes')));
});

// Considering Sam for the first time makes your memory of reflection available.
ActionHandler({ tag: 'consider', children: { subject: { tag: 'Sam' } } }, action => w => {
    if (w.has_tried.get(action)) {
        return w;
    }
    return update(w, make_memory_available(action_description('reflect')));
});

/*
    REFLECTING ON SAM

    Merely reflecting on your impression of Sam for the first time reveals that
    something is wrong, and makes the memory of scrutiny available.
*/

const something_is_wrong = <div gist={gist('the old affinity')} className={insight_text_class}>
    ...Something is wrong.
</div> as StoryNode;

ActionHandler({ tag: 'reflect', children: { subject: { tag: 'consider', children: { subject: { tag: 'Sam' } } } } }, () => w => {
    if (w.has_chill) {
        return w;
    }
    // The facet list has already been printed for this frame, so announce the facet that has just been revealed.
    const new_facet = facet(gist('the old affinity'));
    return update(w,
        w => apply_facet_interpretation(w, {
            facet: gist('Sam'),
            revealed: something_is_wrong,
            commentary: (frame) => [
                frame.consequence(<div>A chill comes over you.</div>),
                frame.consequence(<div>
                    Something about Sam is <i>incorrect</i>.
                    <br/>
                    You can feel the discordance in your bones. It scares you.
                </div>),
                frame.description(<div>
                    You notice a new facet:
                    <blockquote gist={new_facet}>
                        {render_gist.noun_phrase(new_facet)}
                    </blockquote>
                </div>)
            ]
        }),
        { has_chill: true },
        make_memory_available(action_description('scrutinize'))
    );
});

/*
    INTERPRETING SAM
*/

ActionHandler({ tag: 'scrutinize', children: { facet: { tag: "Sam's demeanor" } } },
    Exposition({
        revealed: <blockquote gist={gist('insight', { subject: gist("Sam's demeanor") })} className={insight_text_class}>
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
                make_memory_available(action_description('hammer'))
            );
        }
    })
);

ActionHandler({ tag: 'hammer', children: { facet: { tag: 'your friendship with Sam' } } },
    Exposition({
        revealed: <blockquote gist={gist('insight', { subject: gist('your friendship with Sam') })} className={insight_text_class}>
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
                can_consider: _ => _.set(gist('your history with Sam'), true)
            });
        }
    })
);

/*
    INTERPRETING YOUR HISTORY WITH SAM
*/

ActionHandler({ tag: 'hammer', children: { facet: { tag: 'your drifting apart' } } },
    Exposition({
        revealed: <blockquote gist={gist('your culpability')} className={insight_text_class}>
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

ActionHandler({ tag: 'scrutinize', children: { facet: { tag: 'your culpability' } } },
    Exposition({
        revealed: <blockquote gist={gist('insight', { subject: gist('your culpability') })} className={insight_text_class}>
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
                make_memory_available(action_description('volunteer'))
            );
        }
    })
);

/*
    VOLUNTEERING
*/

ActionHandler({ tag: 'volunteer', children: { facet: { tag: 'the old affinity' } } },
    Exposition({
        revealed: <blockquote gist={gist('insight', { subject: gist('the old affinity') })} className={insight_text_class}>
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

const outro_lock = global_lock('Outro');

// Not locked to an owner itself (it has to be able to take the lock away from
// the reflection puffers), so it checks the puzzle state by hand.
Puffers(unlocked_puffer({
    pre: world => {
        if (world.has_volunteered) {
            return outro_lock.lock(world);
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
}));

/*
    THE WORLD
*/

export { Venience } from './prelude';

const initial_world: Venience = {
    ...get_initial_world<Venience>(),
    owner: undefined,
    gist: undefined,
    current_interpretation: undefined,
    knowledge: get_initial_knowledge(),
    has_acquired: map(['consider', true], ['remember', true]),
    has_tried: GistMap.empty(),
    could_remember: [],
    can_consider: GistMap.of(
        [gist('the present moment'), true],
        [gist('Sam'), true],
        [gist('yourself'), true]
    ),
    has_chill: false,
    has_recognized_something_wrong: false,
    is_curious_about_history: false,
    has_admitted_negligence: false,
    has_unpacked_culpability: false,
    has_volunteered: false,
    end: false
};

// The opening text is the story for "the present moment", printed into frame 0.
const initial_world_with_opening = update(initial_world, {
    story_updates: story_updater(S.description(
        lookup_or_throw(initial_world.knowledge, gist('the present moment'))
    ))
});

export const venience_world_spec = make_puffer_world_spec(initial_world_with_opening, all_puffers());
set_world_spec(venience_world_spec);

export function new_venience_world() {
    return world_driver(venience_world_spec);
}

// Apply a story update to a single node.
import { apply_story_updates_all, Story, StoryUpdateCompilationOp } from 'story';
function apply_to(node: StoryNode, ...updates: StoryUpdateCompilationOp[]): StoryNode {
    return apply_story_updates_all(node as Story, updates);
}
