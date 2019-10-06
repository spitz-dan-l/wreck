import { StoryNode, Path } from "./story";
import { StaticMap, StaticNameIndexFor } from "../static_resources";

// Static Registry for story queries
export interface StoryQueryTypes {
    find_class: { class: string };
    selector: { selector: string };
}

export const StoryQueryName: StaticNameIndexFor<StoryQueryTypes> = [
    // This array has to be edited when new entries are added to StoryQueryTypes
    // The editor will basically fill it in for you
    'find_class',
    'selector'
];

export type StoryQuery = (story: StoryNode) => [StoryNode, Path][];

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

export function build_query(query: StoryQuerySpec): StoryQuery {
    return StoryQueryIndex.get(query.name)(query.parameters as any);
}