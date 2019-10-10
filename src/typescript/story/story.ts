import { split_tokens } from '../text_tools';
import { AllHTMLAttributes, set_attributes } from '../jsx_utils';
import { update } from '../update';
import { HTMLAttributesWithout } from '../jsx_utils';
import { NodeProps } from './create';


export type StoryHole = { kind: 'StoryHole' };

export type Fragment<Node extends StoryNode=StoryNode> = string | Node | StoryHole;
export type DeepFragment<Node extends StoryNode=StoryNode> = Fragment<Node> | DeepFragmentArray<Node>;
interface DeepFragmentArray<Node extends StoryNode=StoryNode> extends Array<DeepFragment<Node>> {};

export interface StoryNode {
    kind: 'StoryNode',
    tag: string,
    classes: Record<string, boolean>,
    attributes: HTMLAttributesWithout<NodeProps>
    data: { frame_index?: number },
    children: Fragment<this>[]
}

export interface StoryNodeTypes {
    StoryNode: StoryNode;
}

type ValidStoryNodeTypes<T> = {
    [K in keyof T]: T[K] extends StoryNode ? never : K;
}[keyof T];

const InvalidStoryNodeTypes: never = <ValidStoryNodeTypes<StoryNodeTypes>><unknown>null;

export function is_story_node<Node extends StoryNode=StoryNode>(x: Fragment<Node>): x is Node {
    return (x as any).kind === 'StoryNode';
}
export function is_story_hole(x: Fragment): x is StoryHole {
    return (x as any).kind === 'StoryHole';
}


// Find subnodes within a story
export type StoryPredicate = (n: StoryNode) => boolean;

export type Path = number[];
export function is_path_empty(x: Path): x is [] {
    return x.length === 0;
}
export function is_path_full(x: Path): x is [number, ...number[]] {
    return x.length > 0;
}

export type FoundNode = [StoryNode, Path];

export function find_node(node: StoryNode, predicate: StoryPredicate): FoundNode | null {
    if (predicate(node)) {
        return [node, []];
    }
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (is_story_node(child)) {
            const result = find_node(child, predicate);
            if (result !== null) {
                const [target, path] = result;
                return [target, [i, ...path]];
            }
        }
    }
    return null;
}

export function find_all_nodes(node: StoryNode, predicate: StoryPredicate): FoundNode[] {
    const result: FoundNode[] = [];
    if (predicate(node)) {
        result.push([node, []]);
    }
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (is_story_node(child)) {
            result.push(...find_all_nodes(child, predicate)
                .map(([n, p]) =>
                    [n, [i, ...p]] as FoundNode));
        }
    }
    return result;
}

// Find from a sequence of predicates. Makes it easy to get querySelector-like behavior.
export function find_chain(node: StoryNode, predicates: StoryPredicate[]): FoundNode | null {
    if (predicates.length === 0) {
        return [node, []];
    }

    const xs = find_all_nodes(node, predicates[0])
    for (const [x, p] of xs) {
        const c = find_chain(x, predicates.slice(0));
        if (c !== null && c[0] !== x) {
            return [c[0], [...p, ...c[1]]];
        }
    }

    return null;
}

export function find_all_chain(node: StoryNode, predicates: StoryPredicate[]): FoundNode[] {
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

export function story_get(node: StoryNode, path: Path): StoryNode | null {
    if (path.length === 0) {
        return node;
    }

    const i = path[0]
    if (i >= node.children.length) {
        return null;
    }

    const c = node.children[i];
    if (!is_story_node(c)) {
        return null;
    }

    return story_get(c, path.slice(0));
} 

export function path_to(parent: StoryNode, target: StoryNode): Path | null {
    if (parent === target) {
        return [];
    }

    for (let i = 0; i < parent.children.length; i++) {
        const child = parent.children[i];
        if (!is_story_node(child)) {
            continue;
        }
        const p = path_to(child, target);
        if (p === null) {
            continue;
        }
        return [i, ...p];
    }

    return null;
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

// Convert Story to DOM
export function story_to_dom(story: StoryNode) {
    const elt = document.createElement(story.tag);

    for (const [class_name, on] of Object.entries(story.classes)) {
        if (on) {
            elt.classList.add(class_name);
        }
    }

    for (const [data_attr, val] of Object.entries(story.data)) {
        elt.dataset[data_attr] = '' + val;
    }

    set_attributes(elt, story.attributes);

    for (const c of story.children) {
        if (is_story_hole(c)) {
            const placeholder = document.createElement('div');
            placeholder.id = 'story-hole';
            elt.appendChild(placeholder);
        } else if (typeof(c) === 'string') {
            elt.appendChild(document.createTextNode(c));
        } else {
            elt.appendChild(story_to_dom(c));
        }
    }

    return elt;
}