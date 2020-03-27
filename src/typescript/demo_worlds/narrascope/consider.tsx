import { createElement, story_updater, Updates as S, Fragment, is_story_node } from "story";
import { TopicID, resource_registry, STATIC_TOPIC_IDS, Venience } from "./prelude";
import { GistRenderMethodsImpl, GistRenderer, gist, render_gist } from "gist";
import { GistAssoc } from "knowledge";
import { StaticMap } from "lib/static_resources";
import { Action } from "./action";
import { keys, update } from "lib/utils";
import { ParserThread } from "parser";

type TopicGists = { [K in TopicID]: {} };
declare module 'gist' {
    export interface StaticGistTypes extends TopicGists {
    }
}

declare module './prelude' {
    export interface Venience {
        can_consider: GistAssoc<boolean, TopicID>
    }
    
    export interface StaticResources {
        initial_world_can_consider: GistAssoc<boolean, TopicID>;
        topic_index: StaticMap<{ [T in TopicID]: Topic }>;
    }

    export interface StaticActionGistTypes {
        consider: { 
            children: { subject: TopicID }
        };
    }
}

const topic_index = resource_registry.initialize('topic_index', new StaticMap(STATIC_TOPIC_IDS));

export type Topic =
    & {
        [ID in TopicID]: {
            id: ID,
            render_impls: GistRenderMethodsImpl<ID>
        }
    }[TopicID]
    & {
        story: Fragment
    };

const init_knowledge = resource_registry.get_resource('initial_world_knowledge');

export function Topic(topic: Topic) {
    if (!is_story_node(topic.story)) {
        throw new Error('Story must actually be a StoryNode even though the type says any Fragment. (JSX limitation.)');
    }

    if (topic.story.data.gist?.tag !== topic.id) {
        throw new Error('Story must have the same gist as the topic id.');
    }

    init_knowledge.update(k => k.ingest(topic.story));

    GistRenderer(topic.id, topic.render_impls);

    topic_index.initialize(topic.id, topic);

    return topic;
}

Action({
    id: 'consider',
    render_impls: {
        noun_phrase: {
            order: 'BottomUp',
            impl: (tag, {subject}) => `your impression of ${subject}`
        },
        command_noun_phrase: {
            order: 'BottomUp',
            impl: (tag, {subject}) => ['my_impression_of', subject]
        },
        command_verb_phrase: {
            order: 'BottomUp',
            impl: (tag, {subject}) => ['consider', subject]
        }
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
                const topic_gist = gist(topic);
                if (world.can_consider.get(topic_gist)) {
                    threads.push(() => {
                        const action_gist = gist('consider', {subject: topic});
                        return (
                            parser.consume(render_gist.command_verb_phrase(action_gist), () =>
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