import { StoryNode, Path, FoundNode } from "./story";
import { StaticMap, StaticNameIndexFor, static_names } from "../static_resources";

// Static Registry for story queries
export interface StoryQueryTypes {
}

export const StoryQueryName: StaticNameIndexFor<StoryQueryTypes> = {
    // This object has to be edited when new entries are added to StoryQueryTypes
    // The editor will basically fill it in for you
    'eph': null,
    'frame': null,
    'has_class': null,
    'story_hole': null,
    'story_root': null
}

export type StoryQuery = (story: StoryNode) => FoundNode[];

export type StoryQueryBuilder<Q extends keyof StoryQueryTypes> =
    (params: StoryQueryTypes[Q]) => StoryQuery;

export type StoryQueries = {
    [K in keyof StoryQueryTypes]: StoryQueryBuilder<K>
};

export const StoryQueryIndex = new StaticMap<StoryQueries>(StoryQueryName);

export type StoryQuerySpec = {
    [K in keyof StoryQueryTypes]: {
        name: K,
        parameters: StoryQueryTypes[K]
    }
}[keyof StoryQueryTypes];

export function compile_query(query_spec: StoryQuerySpec): StoryQuery {
    return StoryQueryIndex.get(query_spec.name)(query_spec.parameters as any);
}

export function query<Q extends keyof StoryQueryTypes>(name: Q, parameters: StoryQueryTypes[Q]): StoryQuerySpec {
    return { name, parameters } as StoryQuerySpec;
}