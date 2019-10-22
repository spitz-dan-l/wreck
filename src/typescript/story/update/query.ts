import { Gensym } from "../../gensym";
import { StaticMap, StaticNameIndexFor } from "../../static_resources";
import { find_node, FoundNode, Fragment, is_story_node, Path, StoryNode, story_lookup_path, find_all_nodes, is_story_hole } from "../story";
import { map_puffer } from "../../puffer";
import { map_values } from "../../utils";
import { Story } from "./update";

// Static Registry for story queries
export interface StoryQueryTypes {
}

export const StoryQueryName: StaticNameIndexFor<StoryQueryTypes> = {
    // This object has to be edited when new entries are added to StoryQueryTypes
    // The editor will basically fill it in for you
    'eph': null,
    'first': null,
    'frame': null,
    'has_class': null,
    'key': null,
    'path': null,
    'story_hole': null,
    'story_root': null
}

export type StoryQuery = (story: Fragment) => FoundNode[];

export type StoryQueryBuilder<Q extends keyof StoryQueryTypes> =
    (params: StoryQueryTypes[Q]) => StoryQuery;

export type StoryQueries = {
    [K in keyof StoryQueryTypes]: StoryQueryBuilder<K>
};

export const StoryQueryIndex = new StaticMap<StoryQueries>(StoryQueryName);

export type StoryQuerySpecs = {
    [K in keyof StoryQueryTypes]: {
        name: K,
        parameters: StoryQueryTypes[K]
    }
};

export type StoryQuerySpec = StoryQuerySpecs[keyof StoryQuerySpecs];

export function compile_story_query<K extends keyof StoryQueryTypes>(query_spec: StoryQuerySpec): StoryQuery {
    const query = StoryQueryIndex.get(query_spec.name)(query_spec.parameters as any);
    return (story: StoryNode) => query(story);   
}

export function story_query<Q extends keyof StoryQueryTypes>(name: Q, parameters: StoryQueryTypes[Q]): StoryQuerySpec {
    return { name, parameters } as StoryQuerySpecs[Q];
}

export interface StoryQueryTypes {
    path: { path: Path };
    key: { key: Gensym };
    first: { subquery: StoryQuerySpec };
    story_root: void;
    story_hole: void;
    eph: void;
    has_class: { class: string | RegExp };
    frame: { index: number, subquery?: StoryQuerySpec };
}
StoryQueryIndex.initialize('path', ({path}) =>
    root => {
        const result: FoundNode[] = []
        const found = story_lookup_path(root, path)
        if (found !== null) {
            result.push([found, path]);
        }
        return result;
    });

StoryQueryIndex.initialize('key', ({key}) =>
    root => {
        const result: FoundNode[] = []
        const found = find_node(root, n => is_story_node(n) && n.key === key);
        if (found !== null) {
            result.push(found);
        }
        return result;
    });

StoryQueryIndex.initialize('first', ({subquery}) =>
    root => {
        const results = compile_story_query(subquery)(root);
        return results.slice(0,1);
    });

StoryQueryIndex.initialize('story_root', () => story => [[story, []]]);

StoryQueryIndex.initialize('story_hole', () =>
    (story) => {
        const result = find_all_nodes(story, n => is_story_hole(n));
        if (result.length !== 1) {
            throw new Error(`Found ${result.length} story holes. There should only ever be one.`);
        }
        return result;
    })

StoryQueryIndex.initialize('eph', () =>
    (story) => find_all_nodes(story,
        (n) => is_story_node(n) && Object.entries(n.classes)
            .some(([cls, on]) => on && cls.startsWith('eph-'))));

StoryQueryIndex.initialize('has_class', (params) =>
    (story) => find_all_nodes(story,
        (n) => is_story_node(n) &&
            (typeof(params.class) === 'string'
                ? !!n.classes[params.class]
                : Object.entries(n.classes)
                    .some(([cls, on]) =>
                        on && (params.class as RegExp).test(cls)))));

StoryQueryIndex.initialize('frame', ({index, subquery}) =>
    (story) => {
        const found = find_node(story,
            (n) => is_story_node(n) && n.data.frame_index === index);
        if (found === null) {
            return [];
        }
        if (subquery === undefined) {
            return [found];
        }
        const [frame, path] = found;
        return compile_story_query(subquery)(frame)
            .map(([n, p]) => [n, [...path, ...p]]);
    });
