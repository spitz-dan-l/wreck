import { Gensym } from "../gensym";
import { StaticMap, StaticNameIndexFor } from "../static_resources";
import { find_node, FoundNode, Fragment, is_story_node, Path, StoryNode, story_lookup_path } from "./story";

// Static Registry for story queries
export interface StoryQueryTypes {
}

export const StoryQueryName: StaticNameIndexFor<StoryQueryTypes> = {
    // This object has to be edited when new entries are added to StoryQueryTypes
    // The editor will basically fill it in for you
    'key': null,
    'path': null,
    'eph': null,
    'frame': null,
    'has_class': null,
    'story_hole': null,
    'story_root': null,
    first: null
}

export type StoryQuery = (story: Fragment) => FoundNode[];

export type StoryQueryBuilder<Q extends keyof StoryQueryTypes> =
    (params: StoryQueryTypes[Q]) => StoryQuery;

export type StoryQueries = {
    [K in keyof StoryQueryTypes]: StoryQueryBuilder<K>
};

export const StoryQueryIndex = new StaticMap<StoryQueries>(StoryQueryName);

export type StoryQuerySpec<Key extends keyof StoryQueryTypes=keyof StoryQueryTypes> = {
    [K in Key]: {
        name: K,
        parameters: StoryQueryTypes[K]
    }
}[Key];

export function compile_query<K extends keyof StoryQueryTypes>(query_spec: StoryQuerySpec<K>): StoryQuery {
    const query = StoryQueryIndex.get(query_spec.name)(query_spec.parameters as any);
    return (story: StoryNode) => query(story);   
}

export function query<Q extends keyof StoryQueryTypes>(name: Q, parameters: StoryQueryTypes[Q]): StoryQuerySpec<Q> {
    return { name, parameters } as StoryQuerySpec<Q>;
}


export interface StoryQueryTypes {
    path: { path: Path };
    key: { key: Gensym };
    first: { subquery: StoryQuerySpec }
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
        const results = compile_query(subquery)(root);
        return results.slice(0,1);
    })