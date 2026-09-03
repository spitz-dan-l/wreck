/*
    Considering a topic prints the player's impression of it: the topic's
    passage from the knowledge base, including anything reflection has
    revealed about it so far.
*/
import { child, gist, Gist, render_gist } from 'gist';
import { included, update } from 'lib/utils';
import { GAP, ParserThread } from 'parser';
import { createElement, is_story_node, lookup_or_throw, StoryNode, story_updater, Updates as S } from 'story';
import { Action, action_consume_spec } from './action';
import { add_initial_knowledge, TOPIC_IDS, TopicID, Venience } from './prelude';

export type Topic = StoryNode & { data: { gist: Gist & { tag: TopicID } } };

export function is_topic(x: StoryNode): x is Topic {
    return included(x.data.gist?.tag, TOPIC_IDS);
}

// Declare a topic: a passage whose gist is one of the topic ids.
export function Topic(story: StoryNode): Topic {
    if (!is_story_node(story) || !is_topic(story)) {
        throw new Error('A Topic must be a story node whose gist tag is a topic id.');
    }
    return add_initial_knowledge(story);
}

Action({
    id: 'consider',
    render: {
        noun_phrase: g => `your impression of ${render_gist.noun_phrase(child(g, 'subject'))}`,
        command_noun_phrase: g => ['my_impression_of', GAP, render_gist.command_noun_phrase(child(g, 'subject'))],
        command_verb_phrase: g => ['consider', GAP, render_gist.command_noun_phrase(child(g, 'subject'))]
    },

    description_noun_phrase: 'consideration',
    description_command_noun_phrase: 'consideration',

    description: 'Your cursory experience of the world.',
    katya_quote: <div>
        "We cannot help but have initial impressions. <strong>Considering</strong> them is automatic. They're always there to root us to reality."
    </div>,

    memory: <div>
        Of course, she went on to tell you that initial impressions were almost never to be trusted.
    </div>,

    puffer: {
        handle_command: (world, parser) => {
            const threads: ParserThread<Venience>[] = [];
            for (const topic of TOPIC_IDS) {
                const topic_gist = gist(topic);
                if (!world.can_consider.get(topic_gist)) {
                    continue;
                }
                threads.push(() => {
                    const action = gist('consider', { subject: topic_gist });
                    return (
                        parser.consume(action_consume_spec(action, world), () =>
                        parser.submit(() =>
                        update(world, {
                            gist: () => action,
                            story_updates: story_updater(
                                S.description(lookup_or_throw(world.knowledge, topic_gist))
                            )
                        })))
                    );
                });
            }
            return parser.split(threads);
        }
    }
});
