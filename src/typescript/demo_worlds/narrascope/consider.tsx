import { createElement, story_updater, Updates as S, Fragment, is_story_node, StoryNode } from "story";
import { TopicID, resource_registry, STATIC_TOPIC_IDS, Venience } from "./prelude";
import { bottom_up, RenderImplsForPattern, GistRenderer, gist, render_gist, Gists } from "gist";
import { GistAssoc } from "knowledge";
import { StaticMap } from "lib/static_resources";
import { Action, action_consume_spec } from "./action";
import { keys, update, included } from "lib/utils";
import { ParserThread } from "parser";

type TopicGists = { [K in TopicID]: [] };
declare module 'gist' {
    export interface StaticGistTypes extends TopicGists {
    }
}

interface Consider {
    can_consider: GistAssoc<boolean, TopicID>;
}

declare module './prelude' {
    export interface Venience extends Consider {
    }
    
    export interface StaticResources {
        initial_world_consider: Consider;
        topic_index: StaticMap<{ [T in TopicID]: Topic }>;
    }

    export interface StaticActionGistTypes {
        consider: [{ subject: TopicID }];
    }
}

resource_registry.initialize('initial_world_consider', {
    can_consider: new GistAssoc([
        { key: gist('the present moment'), value: true },
        { key: gist('Sam'), value: true },
        { key: gist('yourself'), value: true },
    ])
});

const topic_index = resource_registry.initialize('topic_index', new StaticMap(STATIC_TOPIC_IDS));

// export type Topic = 
//     & {
//         [ID in TopicID]: {
//             id: ID,
//             render_impls?: RenderImplsForPattern<ID>
//         }
//     }[TopicID]
//     & {
//         story: Fragment
//     };

export type Topic = StoryNode & { data: { gist: Gists[TopicID] }}

export function assert_is_topic(x: Fragment): asserts x is Topic {
    if (!is_story_node(x)) {
        throw new Error('Topic must actually be a StoryNode even though the type says any Fragment. (JSX limitation.)');
    }

    if (!included(x.data.gist?.[0], keys(STATIC_TOPIC_IDS))) {
        throw new Error('StoryNode must have a gist and its tag must be a topic id.');
    }
}

const init_knowledge = resource_registry.get_resource('initial_world_knowledge');

export function Topic(topic: Fragment) {
    assert_is_topic(topic);

    const topic_id: TopicID = topic.data.gist![0];
    init_knowledge.update(k => k.ingest(topic));

    topic_index.initialize(topic_id, topic);

    return topic;
}

Action({
    id: 'consider',
    render_impls: {
        noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => `your impression of ${subject}`,
            render_gist.noun_phrase
        ),
        command_noun_phrase: g => bottom_up(g)(
            (tag, {subject}) => ['my_impression_of', subject],
            render_gist.command_noun_phrase,
        ),
        command_verb_phrase: g => bottom_up(g)(
            (tag, {subject}) => ['consider', subject],
            render_gist.command_verb_phrase
        )
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
            for (const topic of keys(STATIC_TOPIC_IDS)) {
                const topic_gist = [topic] as Gists[TopicID];
                if (world.can_consider.get(topic_gist)) {
                    threads.push(() => {
                        const action_gist = gist('consider', {subject: topic_gist});
                        return (
                            parser.consume(action_consume_spec(action_gist, world), () =>
                            parser.submit(() =>
                            update(world, {
                                gist: () => action_gist,
                                story_updates: story_updater(
                                    S.description(world.knowledge.get(topic_gist)!)
                                )
                            })))
                        );
                    })
                }
            }
            return parser.split(threads);
        }
    }
})