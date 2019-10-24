import { Gensym } from "../../gensym";
import { StaticMap, StaticNameIndexFor } from "../../static_resources";
import { find_node, FoundNode, Fragment, is_story_node, Path, StoryNode, story_lookup_path, find_all_nodes, is_story_hole } from "../story";
import { map_puffer } from "../../puffer";
import { map_values } from "../../utils";
import { Story } from "./update";
import { ParametersFor } from "../../dsl_utils";


export type StoryQuery = (story: Fragment) => FoundNode[];

// Static Registry for story queries
export interface StoryQueries {
}

export const StoryQueryName: StaticNameIndexFor<StoryQueries> = {
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

export type StoryQueryParams = ParametersFor<StoryQueries>;

// export type StoryQueryBuilders = {
//     [Q in keyof StoryQueries]: (...params: StoryQueries[Q]) => StoryQuery
// }

// export type StoryQueryBuilder<Q extends keyof StoryQueryTypes> = StoryQueryBuilders[Q];

// export type StoryQueryBuilder<Q extends keyof StoryQueryTypes> =
//     (...params: Parameters<StoryQueryTypes[Q]>) => StoryQuery;

// export type StoryQueries = {
//     [K in keyof StoryQueries]: (...params: StoryQueries[Q]) => StoryQuery //StoryQueryBuilders[K] //StoryQueryBuilder<K>
// };

export const StoryQueryIndex = new StaticMap<StoryQueries>(StoryQueryName);

// export type StoryQuerySpecs = {
//     [K in keyof StoryQueryParams]: {
//         name: K,
//         parameters: StoryQueryParams[K]
//     }
// };
// export type StoryQuerySpec = {
//     [K in keyof StoryQueryParams]: {
//         name: K,
//         parameters: StoryQueryParams[K]
//     }
// }[keyof StoryQueryParams];

// export type StoryQuerySpec = StoryQuerySpecs[keyof StoryQuerySpecs];
export type StoryQuerySpecs = {
    [K in keyof StoryQueries]: {
        name: K,
        parameters: Parameters<StoryQueries[K]>
    }
}
export type StoryQuerySpec = StoryQuerySpecs[keyof StoryQuerySpecs];


export function compile_story_query(query_spec: StoryQuerySpec): StoryQuery {
    const query = ((StoryQueryIndex.get(query_spec.name)) as (...args: StoryQuerySpec['parameters']) => StoryQuery)(...query_spec.parameters);
    return (story: StoryNode) => query(story);   
}

export function story_query<Q extends keyof StoryQueries>(name: Q, ...parameters: ParametersFor<StoryQueries>[Q]): StoryQuerySpec {
    return { name, parameters } as StoryQuerySpec;
}
// export function story_query<Q extends keyof StoryQueries>(name: Q, ...parameters: StoryQueryParams[Q]): StoryQuerySpec {
//     return { name, parameters } as StoryQuerySpec;
// }

export interface StoryQueries {
    path: (path: Path) => StoryQuery;
    key: (key: Gensym) => StoryQuery;
    first: (query: StoryQuerySpec) => StoryQuery;
    story_root: () => StoryQuery;
    story_hole: () => StoryQuery;
    eph: () => StoryQuery;
    has_class: (cls: string | RegExp) => StoryQuery;
    frame: (index?: number, subquery?: StoryQuerySpec) => StoryQuery;
    chain: (...queries: StoryQuerySpec[]) => StoryQuery
}
StoryQueryIndex.initialize('path', (path) =>
    root => {
        const result: FoundNode[] = []
        const found = story_lookup_path(root, path)
        if (found !== null) {
            result.push([found, path]);
        }
        return result;
    });

StoryQueryIndex.initialize('key', (key) =>
    root => {
        const result: FoundNode[] = []
        const found = find_node(root, n => is_story_node(n) && n.key === key);
        if (found !== null) {
            result.push(found);
        }
        return result;
    });

StoryQueryIndex.initialize('first', (subquery) =>
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

StoryQueryIndex.initialize('has_class', (cls) =>
    (story) => find_all_nodes(story,
        (n) => is_story_node(n) &&
            (typeof(cls) === 'string'
                ? !!n.classes[cls]
                : Object.entries(n.classes)
                    .some(([c, on]) =>
                        on && (cls as RegExp).test(c)))));

StoryQueryIndex.initialize('frame', (index?, subquery?) =>
    (story) => {
        let found: FoundNode | null = null;
        // if index is null, find the highest frame
        if (index === undefined) {
            const frames = find_all_nodes(story,
                n => is_story_node(n) && n.data.frame_index !== undefined);
            if (frames.length > 0) {
                for (const f of frames) {
                    if (found === null) {
                        found = f;
                    } else if ((found[0] as StoryNode).data.frame_index! < (f[0] as StoryNode).data.frame_index!) {
                        found = f;
                    }
                }
            }
        } else {
            found = find_node(story,
                (n) => is_story_node(n) && n.data.frame_index === index);
        }
        if (found === null) {
            return [];
        }
        if (subquery === undefined) {
            return [found];
        }
        const [frame, path] = found;
        return compile_story_query(subquery)(frame)
            .map(([n, p]) => [n, [...path, ...p]] as FoundNode);
    });

StoryQueryIndex.initialize('chain', (...queries) =>
    (story) => {
        if (queries.length === 0) {
            return [[story, []]];
        }
        const results = compile_story_query(queries[0])(story);
        return results
            .filter(([n1,]) => n1 !== story)
            .flatMap(([n1, p1]) =>
                StoryQueryIndex.get('chain')(...queries.slice(1))(n1)
                    .map(([n2, p2]) => [n2, [...p1, ...p2]] as FoundNode)
        );
    });
