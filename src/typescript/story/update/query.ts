
import { ParametersFor } from "../../lib/dsl_utils";
import { Gensym } from "../../lib/gensym";
import { StaticMap, StaticNameIndexFor } from "../../lib/static_resources";
import { included } from "../../lib/utils";
import { find_all_nodes, find_node, FoundNode, Fragment, is_story_hole, is_story_node, Path, StoryNode, story_lookup_path } from "../story";
import { GistPattern, match } from "../../gist";


export type StoryQuery = (story: Fragment) => FoundNode[];

// // Static Registry for story queries to be extended by others
// export interface StoryQueries {
// }

// // You have to edit this structure any time StoryQueries gets extended
// export const StoryQueryName: StaticNameIndexFor<StoryQueries> = {
//     // This object has to be edited when new entries are added to StoryQueryTypes
//     // The editor will basically fill it in for you
//     'eph': null,
//     'first': null,
//     'frame': null,
//     'has_class': null,
//     'key': null,
//     'path': null,
//     'story_hole': null,
//     'story_root': null,
//     'chain': null,
//     'children': null,
//     'has_gist': null
// }

// export const StoryQueryIndex = new StaticMap<StoryQueries>(StoryQueryName);

export type StoryQuerySpecs = {
    [K in keyof StoryQueries]: {
        name: K,
        parameters: Parameters<StoryQueries[K]>
    }
}
export type StoryQuerySpec = StoryQuerySpecs[keyof StoryQuerySpecs];

export function compile_story_query(query_spec: StoryQuerySpec): StoryQuery {
    if (query_spec === undefined) {
        debugger;
    }
    const f = StoryQueries[query_spec.name];
    const query = f.apply(null, query_spec.parameters);
    return query;
}

export function story_query<Q extends keyof StoryQueries>(name: Q, ...parameters: ParametersFor<StoryQueries>[Q] extends [] ? [] : never): StoryQuerySpec;
export function story_query<Q extends keyof StoryQueries>(name: Q, parameters: ParametersFor<StoryQueries>[Q]): StoryQuerySpec;
export function story_query<Q extends keyof StoryQueries>(name: Q, parameters: any[] = []): StoryQuerySpec {
    return { name, parameters } as StoryQuerySpec;
}

export interface StoryQueries {
    path: (path: Path) => StoryQuery;
    key: (key: Gensym) => StoryQuery;
    first: (query: StoryQuerySpec) => StoryQuery;
    first_level: (query: StoryQuerySpec) => StoryQuery;
    story_root: () => StoryQuery;
    story_hole: () => StoryQuery;
    eph: () => StoryQuery;
    has_class: (cls: string | RegExp) => StoryQuery;
    frame: (index?: number | number[]) => StoryQuery;
    chain: (...queries: StoryQuerySpec[]) => StoryQuery;
    children: (subquery?: StoryQuerySpec) => StoryQuery;
    has_gist: (pat: GistPattern) => StoryQuery;
}

export const StoryQueries: StoryQueries = {
    path: (path) =>
        root => {
            const result: FoundNode[] = []
            const found = story_lookup_path(root, path)
            if (found !== undefined) {
                result.push([found, path]);
            }
            return result;
        },
    key: (key) =>
        root => {
            const result: FoundNode[] = []
            const found = find_node(root, n => is_story_node(n) && n.key === key);
            if (found !== undefined) {
                result.push(found);
            }
            return result;
        },
    first: (subquery) =>
        root => {
            const results = compile_story_query(subquery)(root);
            return results.slice(0,1);
        },
    first_level: (subquery) =>
        root => {
            const results = compile_story_query(subquery)(root);

            function is_prefix(p1: Path, p2: Path): boolean {
                if (p1.length > p2.length) {
                    return false;
                }
                for (let i = 0; i < p1.length; i++) {
                    if (p1[i] !== p2[i]) {
                        return false;
                    }
                }
                return true;
            }
            return results.filter(r1 => !results.some(r2 =>
                r1 !== r2 && is_prefix(r2[1], r1[1])));
        },
    story_root: () => story => [[story, []]],
    story_hole: () =>
        (story) => {
            const result = find_all_nodes(story, n => is_story_hole(n));
            if (result.length !== 1) {
                throw new Error(`Found ${result.length} story holes. There should only ever be one.`);
            }
            return result;
        },
    eph: () =>
        (story) => find_all_nodes(story, eph_predicate),
    has_class: (cls) => 
        (story) => find_all_nodes(story,
            (n) => is_story_node(n) &&
                (typeof(cls) === 'string'
                    ? !!n.classes[cls]
                    : Object.entries(n.classes)
                        .some(([c, on]) =>
                            on && (cls as RegExp).test(c)))),
    frame: (index?) =>
        (story) => {
            let found: FoundNode[];
            // if index is null, find the highest frame
            if (index === undefined) {
                return latest_frame(story);
            } else if (index instanceof Array) {
                return find_all_nodes(story,
                    (n) => is_story_node(n) && included(n.data.frame_index, index));
            } else {
                return find_all_nodes(story,
                    (n) => is_story_node(n) && n.data.frame_index === index);
            }
        },
    chain: (...queries) =>
        (story) => {
            if (queries.length === 0) {
                return [[story, []]];
            }
            const results = compile_story_query(queries[0])(story);
            return results
                .flatMap(([n1, p1]) =>
                    StoryQueries['chain'](...queries.slice(1))(n1)
                        .map(([n2, p2]) => [n2, [...p1, ...p2]] as FoundNode)
            );
        },
    children: (subquery?) =>
        (story) => {
            if (!is_story_node(story)){
                return [];
            }
            const result = story.children.map((child, i) => [child, [i]] as FoundNode);
            if (subquery !== undefined) {
                const q = compile_story_query(subquery);
                return result.filter(([n, p]) => 
                    q(n).find(([f, p]) => f === n) !== undefined
                );
            }
            return result;
        },
    has_gist: (pat) => 
        (story) => find_all_nodes(story,
            (n) => is_story_node(n) && n.data.gist !== undefined && match(n.data.gist)(pat))
}

// StoryQueryIndex.initialize('path', (path) =>
//     root => {
//         const result: FoundNode[] = []
//         const found = story_lookup_path(root, path)
//         if (found !== null) {
//             result.push([found, path]);
//         }
//         return result;
//     });

// StoryQueryIndex.initialize('key', (key) =>
//     root => {
//         const result: FoundNode[] = []
//         const found = find_node(root, n => is_story_node(n) && n.key === key);
//         if (found !== null) {
//             result.push(found);
//         }
//         return result;
//     });

// StoryQueryIndex.initialize('first', (subquery) =>
//     root => {
//         const results = compile_story_query(subquery)(root);
//         return results.slice(0,1);
//     });

// StoryQueryIndex.initialize('story_root', () => story => [[story, []]]);

// StoryQueryIndex.initialize('story_hole', () =>
//     (story) => {
//         const result = find_all_nodes(story, n => is_story_hole(n));
//         if (result.length !== 1) {
//             throw new Error(`Found ${result.length} story holes. There should only ever be one.`);
//         }
//         return result;
//     })

export const eph_predicate = (n: Fragment) => {
    if (!is_story_node(n)) {
        return false;
    }

    for (const cls in n.classes) {
        if (n.classes[cls] && cls.startsWith('eph-')) {
            return true;
        }
    }

    return false;
}

// StoryQueryIndex.initialize('eph', () =>
//     (story) => find_all_nodes(story, eph_predicate));


// StoryQueryIndex.initialize('has_class', (cls) => 
//     (story) => find_all_nodes(story,
//         (n) => is_story_node(n) &&
//             (typeof(cls) === 'string'
//                 ? !!n.classes[cls]
//                 : Object.entries(n.classes)
//                     .some(([c, on]) =>
//                         on && (cls as RegExp).test(c)))));

// StoryQueryIndex.initialize('has_gist', (gist_pat) =>
//     (story) => find_all_nodes(story,
//         (n) => is_story_node(n) && gist_matches())
// )

function is_frame_predicate(n: Fragment) {
    return is_story_node(n) && n.data.frame_index !== undefined;
}
function latest_frame(story: Fragment) {
    if (!is_story_node(story)) {
        return [];
    }
    const frames = find_all_nodes(story, is_frame_predicate);
    if (frames.length > 0) {
        let max_frame: FoundNode = frames[0];
        for (let i = 1; i < frames.length; i++) {
            const f = frames[i];
            if ((max_frame[0] as StoryNode).data.frame_index! < (f[0] as StoryNode).data.frame_index!) {
                max_frame = f;
            }
        }
        return [max_frame];
    } else {
        return [];
    }
}

// StoryQueryIndex.initialize('frame', (index?) =>
//     (story) => {
//         let found: FoundNode[];
//         // if index is null, find the highest frame
//         if (index === undefined) {
//             return latest_frame(story);
//         } else if (index instanceof Array) {
//             return find_all_nodes(story,
//                 (n) => is_story_node(n) && included(n.data.frame_index, index));
//         } else {
//             return find_all_nodes(story,
//                 (n) => is_story_node(n) && n.data.frame_index === index);
//         }
//     });

// StoryQueryIndex.initialize('chain', (...queries) =>
//     (story) => {
//         if (queries.length === 0) {
//             return [[story, []]];
//         }
//         const results = compile_story_query(queries[0])(story);
//         return results
//             // .filter(([n1,]) => n1 !== story)
//             .flatMap(([n1, p1]) =>
//                 StoryQueryIndex.get('chain')(...queries.slice(1))(n1)
//                     .map(([n2, p2]) => [n2, [...p1, ...p2]] as FoundNode)
//         );
//     });

// StoryQueryIndex.initialize('children', (subquery?) =>
//     (story) => {
//         if (!is_story_node(story)){
//             return [];
//         }
//         const result = story.children.map((child, i) => [child, [i]] as FoundNode);
//         if (subquery !== undefined) {
//             const q = compile_story_query(subquery);
//             return result.filter(([n, p]) => 
//                 q(n).find(([f, p]) => f === n) !== undefined
//             );
//         }
//         return result;
//     });