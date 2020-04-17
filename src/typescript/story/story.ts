import { Gensym } from '../lib/gensym';
import { HTMLAttributesWithout } from '../lib/jsx_utils';
import { update } from '../lib/update';
import { NodeProps } from './create';
import  {setAutoFreeze, produce} from 'immer';
import { Gist } from 'gist';
import { map, zip, zipLongest } from 'iterative';
import {dangerous_assert, type_or_kind_name} from '../lib/type_predicate_utils';
import { deep_equal, drop_keys } from '../lib';

export type StoryHole = { kind: 'StoryHole' };

export type Fragment = string | StoryNode | StoryHole;
export type DeepFragment = Fragment | DeepFragmentArray;
interface DeepFragmentArray extends Array<DeepFragment> {};

export interface StoryNode {
    kind: 'StoryNode',
    key: Gensym,
    tag: string,
    classes: Record<string, boolean>,
    attributes: HTMLAttributesWithout<NodeProps>
    data: {
        frame_index?: number,
        gist?: Gist
    },
    children: Fragment[]
}

export function is_story_node(x: Fragment): x is StoryNode {
    return (x as any).kind === 'StoryNode';
}
export function is_story_hole(x: Fragment): x is StoryHole {
    return (x as any).kind === 'StoryHole';
}


// Find subnodes within a story
export type StoryPredicate = (n: Fragment) => boolean;
export type StoryTypePredicate<F extends Fragment> = (n: Fragment) => n is F;


export type Path = number[];
export function is_path_empty(x: Path): x is [] {
    return x.length === 0;
}
export function is_path_full(x: Path): x is [number, ...number[]] {
    return x.length > 0;
}

export type FoundNode<F extends Fragment=Fragment> = [F, Path];

export function find_node<F extends Fragment>(node: Fragment, predicate: StoryTypePredicate<F>): FoundNode<F> | undefined
export function find_node(node: Fragment, predicate: StoryPredicate): FoundNode | undefined;
export function find_node(node: Fragment, predicate: StoryPredicate): FoundNode | undefined {
    if (predicate(node)) {
        return [node, []];
    }
    if (is_story_node(node)) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            const result = find_node(child, predicate);
            if (result !== undefined) {
                const [target, path] = result;
                return [target, [i, ...path]];
            }
        }
    }
    return undefined;
}

export function find_all_nodes<F extends Fragment>(node: Fragment, predicate: StoryTypePredicate<F>): FoundNode<F>[];
export function find_all_nodes(node: Fragment, predicate: StoryPredicate): FoundNode[];
export function find_all_nodes(node: Fragment, predicate: StoryPredicate): FoundNode[] {
    const result: FoundNode[] = [];
    
    type FrontierEntry = {
        node: Fragment,
        path: number[],
        child_pos: number | undefined
    }
    
    const frontier: FrontierEntry[] = [{
        node,
        path: [],
        child_pos: undefined
    }];

    while (frontier.length > 0) {
        const fe = frontier[frontier.length - 1];
        const n = fe.node;
        const p = fe.path;
            

        if (fe.child_pos === undefined) {
            if (predicate(fe.node)) {
                result.push([n, p]);
            }
    
            if (!is_story_node(n) || n.children.length === 0) {
                frontier.pop();
                continue
            }
            fe.child_pos = 0;
        } else {
            if (fe.child_pos === (n as StoryNode).children.length - 1) {
                frontier.pop();
                continue;
            }
            fe.child_pos++;
            
        }

        const child_pos = fe.child_pos;
        const children = (n as StoryNode).children;
        frontier.push({
            node: children[child_pos],
            path: [...p, child_pos],
            child_pos: undefined
        });
    
    }
    return result;
}

export function find_all_nodes_recursive(node: Fragment, predicate: StoryPredicate): FoundNode[] {
    const result: FoundNode[] = [];
    
    if (predicate(node)) {
        result.push([node, []]);
    }
    if (is_story_node(node)) {
        for (let i = 0; i < node.children.length; i++) {
            const child = node.children[i];
            result.push(...find_all_nodes(child, predicate)
                .map(([n, p]) =>
                    [n, [i, ...p]] as FoundNode));
        }
    }
    return result;
}

// Find from a sequence of predicates. Makes it easy to get querySelector-like behavior.
export function find_chain(node: Fragment, predicates: StoryPredicate[]): FoundNode | undefined {
    if (predicates.length === 0) {
        return [node, []];
    }

    const xs = find_all_nodes(node, predicates[0])
    for (const [x, p] of xs) {
        const c = find_chain(x, predicates.slice(0));
        if (c !== undefined && c[0] !== x) {
            return [c[0], [...p, ...c[1]]];
        }
    }

    return undefined;
}

export function find_all_chain(node: Fragment, predicates: StoryPredicate[]): FoundNode[] {
    if (predicates.length === 0) {
        return [[node, []]];
    }

    const result: FoundNode[] = [];
    const xs = find_all_nodes(node, predicates[0]);
    for (const [x, p] of xs) {
        const cs = find_all_chain(x, predicates.slice(0));
        result.push(...cs
            .filter(([c, cp]) => c !== x)
            .map(([c, cp]) => [c, [...p, ...cp]] as FoundNode));
    }
    return result;
}

export function story_lookup_path(node: Fragment, path: Path): Fragment | undefined {
    if (path.length === 0) {
        return node;
    }
    if (!is_story_node(node)) {
        throw new Error('Cannot traverse children of terminal node '+JSON.stringify(node));
    }
    const i = path[0]
    if (i >= node.children.length) {
        return undefined;
    }

    const c = node.children[i];
    return story_lookup_path(c, path.slice(0));
} 

export function path_to(parent: Fragment, target: Fragment): Path | undefined {
    if (parent === target) {
        return [];
    }
    if (is_story_node(parent)) {
        for (let i = 0; i < parent.children.length; i++) {
            const child = parent.children[i];
            const p = path_to(child, target);
            if (p === undefined) {
                continue;
            }
            return [i, ...p];
        }
    }
    return undefined;
}

export function parent_path(root: Fragment, path: Path): Fragment[] {
    if (path.length === 0) {
        return [root];
    }

    if (!is_story_node(root)) {
        throw new Error('Element in path had no children.');
    }
    const child = root.children[path[0]];
    
    return [root, ...parent_path(child, path.slice(1))]
}

// updating story nodes
export function replace_in<S extends StoryNode>(parent: S, path: Path, updated: StoryNode): S;
export function replace_in<N extends Fragment | undefined>(parent: Fragment, path: [], updated: N): N;
export function replace_in<N extends Fragment>(parent: N, path: [number, ...Path], updated: Fragment | undefined): N;
export function replace_in<N extends Fragment>(parent: Fragment, path: Path, updated: Fragment): Fragment;
export function replace_in(parent: Fragment, path: Path, updated: Fragment | undefined): Fragment | undefined;
export function replace_in(parent: Fragment, path: Path, updated: Fragment | undefined): Fragment | undefined  {
    if (path.length === 0) {
        return updated;
    }
    if (!is_story_node(parent)) {
        throw new Error('Tried to replace a child of a non-node.');
    }

    const i = path[0];
    return update(parent, {
        children: {
            [i]: _ => replace_in(_, path.slice(1), updated)
        }
    });
}

export function splice_in(parent: Fragment, path: Path, updated: Fragment[]): Fragment | undefined  {
    if (path.length === 0) {
        if (updated.length > 1) {
            throw new Error('Tried to replace single top-level node with a list of fragments.');
        }
        return updated[0];
    }
    if (!is_story_node(parent)) {
        throw new Error('Tried to replace a child of a non-node.');
    }
    if (path.length === 1) {
        return update(parent, {
            children: _ => {
                const result = [..._]
                result.splice(path[0], 1, ...updated);
                return result;
            }
        })
    }
    return update(parent, {
        children: {
            [path[0]]: _ => splice_in(_, path.slice(1), updated)
        }
    });
}

export function structurally_equal(story1: Fragment, story2: Fragment): boolean {
    if (story1 === story2) {
        return true;
    }

    const tk1 = type_or_kind_name(story1), tk2 = type_or_kind_name(story2);
    if (tk1 !== tk2) {
        return false;
    }

    if (tk1 === 'StoryHole') {
        return true;
    }

    dangerous_assert<StoryNode>(story1);
    dangerous_assert<StoryNode>(story2);

    if (!deep_equal(drop_keys(story1, 'key'), drop_keys(story2, 'key'))) {
        return false;
    }

    for (const [c1, c2] of zipLongest(story1.children, story2.children)) {
        if (c1 === undefined || c2 === undefined) {
            return false;
        }
        if (!(structurally_equal(c1, c2))) {
            return false;
        }
    }
    return true;
}