/*
    Story queries select nodes within a story tree. They are represented as
    plain data ({name, parameters}) so that they can live in world state, and
    compiled to functions when applied.
*/
import { GistPattern, match } from 'gist';
import { Gensym } from 'lib/gensym';
import { included } from 'lib/utils';
import { find_all_nodes, find_node, FoundNode, Fragment, is_story_hole, is_story_node, Path, StoryNode, story_lookup_path } from '../story';

export type StoryQuery = (story: Fragment) => FoundNode[];

export type StoryQueryName = keyof typeof StoryQueries;

export type StoryQuerySpec = {
    name: StoryQueryName,
    parameters: unknown[]
};

export function story_query<N extends StoryQueryName>(name: N, parameters: Parameters<(typeof StoryQueries)[N]>): StoryQuerySpec {
    return { name, parameters };
}

export function compile_story_query(spec: StoryQuerySpec): StoryQuery {
    const f = StoryQueries[spec.name] as (...params: unknown[]) => StoryQuery;
    return f(...spec.parameters);
}

export const StoryQueries = {
    path: (path: Path): StoryQuery =>
        root => {
            const found = story_lookup_path(root, path);
            return found === undefined ? [] : [[found, path]];
        },

    key: (key: Gensym): StoryQuery =>
        root => {
            const found = find_node(root, n => is_story_node(n) && n.key === key);
            return found === undefined ? [] : [found];
        },

    // The first result of the subquery.
    first: (subquery: StoryQuerySpec): StoryQuery =>
        root => compile_story_query(subquery)(root).slice(0, 1),

    // The results of the subquery that are not nested inside another result.
    first_level: (subquery: StoryQuerySpec): StoryQuery =>
        root => {
            const results = compile_story_query(subquery)(root);
            return results.filter(r1 => !results.some(r2 => r1 !== r2 && is_prefix(r2[1], r1[1])));
        },

    story_root: (): StoryQuery => story => [[story, []]],

    story_hole: (): StoryQuery =>
        story => {
            const result = find_all_nodes(story, n => is_story_hole(n));
            if (result.length !== 1) {
                throw new Error(`Found ${result.length} story holes. There should only ever be one.`);
            }
            return result;
        },

    // Nodes carrying ephemeral (animation) classes.
    eph: (): StoryQuery => story => find_all_nodes(story, eph_predicate),

    has_class: (cls: string | RegExp): StoryQuery =>
        story => find_all_nodes(story, n =>
            is_story_node(n) && (typeof cls === 'string'
                ? !!n.classes[cls]
                : Object.entries(n.classes).some(([c, on]) => on && cls.test(c)))),

    // Frames by index; with no index, the latest frame.
    frame: (index?: number | number[]): StoryQuery =>
        story => {
            if (index === undefined) {
                return latest_frame(story);
            }
            const indices = index instanceof Array ? index : [index];
            return find_all_nodes(story, n => is_story_node(n) && included(n.data.frame_index, indices));
        },

    // Run each query within the results of the previous one.
    chain: (...queries: StoryQuerySpec[]): StoryQuery =>
        story => {
            if (queries.length === 0) {
                return [[story, []]];
            }
            const [first, ...rest] = queries;
            const results = compile_story_query(first)(story).flatMap(([n1, p1]) =>
                StoryQueries.chain(...rest)(n1).map(([n2, p2]) => [n2, [...p1, ...p2]] as FoundNode));
            const uniq: FoundNode[] = [];
            for (const r of results) {
                if (!uniq.some(([n]) => n === r[0])) {
                    uniq.push(r);
                }
            }
            return uniq;
        },

    // Direct children, optionally only those the subquery matches.
    children: (subquery?: StoryQuerySpec): StoryQuery =>
        story => {
            if (!is_story_node(story)) {
                return [];
            }
            const result = story.children.map((child, i) => [child, [i]] as FoundNode);
            if (subquery === undefined) {
                return result;
            }
            const q = compile_story_query(subquery);
            return result.filter(([n]) => q(n).some(([f]) => f === n));
        },

    has_gist: (pattern: GistPattern): StoryQuery =>
        story => find_all_nodes(story, n => is_story_node(n) && match(n.data.gist, pattern))
};

function is_prefix(p1: Path, p2: Path): boolean {
    return p1.length <= p2.length && p1.every((x, i) => x === p2[i]);
}

export function eph_predicate(n: Fragment): boolean {
    return is_story_node(n) && Object.entries(n.classes).some(([cls, on]) => on && cls.startsWith('eph'));
}

function latest_frame(story: Fragment): FoundNode[] {
    const frames = find_all_nodes(story, n => is_story_node(n) && n.data.frame_index !== undefined);
    let latest: FoundNode | undefined = undefined;
    for (const f of frames) {
        if (latest === undefined || (f[0] as StoryNode).data.frame_index! > (latest[0] as StoryNode).data.frame_index!) {
            latest = f;
        }
    }
    return latest === undefined ? [] : [latest];
}
