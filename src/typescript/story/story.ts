import { split_tokens } from '../text_tools';

export type StoryHole = { kind: 'StoryHole' };

export type Fragment<Node extends StoryNode=StoryNode> = string | Node | StoryHole;
export type DeepFragment<Node extends StoryNode=StoryNode> = Fragment<Node> | DeepFragmentArray<Node>;
interface DeepFragmentArray<Node extends StoryNode=StoryNode> extends Array<DeepFragment<Node>> {};

export interface StoryNode {
    kind: 'StoryNode',
    tag: string,
    classes: Record<string, boolean>,
    attributes: Record<string, any>,
    dataset: Record<string, any>,
    children: Fragment<this>[]
}

export function is_story_node<Node extends StoryNode=StoryNode>(x: Fragment<Node>): x is Node {
    return (x as any).kind === 'StoryNode';
}
export function is_story_hole(x: Fragment): x is StoryHole {
    return (x as any).kind === 'StoryHole';
}


// creating story trees
type BaseProps = Record<string, any> & {
    className?: string,
    dataset?: Record<string, any>
};

export type StoryRenderer<P extends BaseProps> = (props: P & { children: Fragment[] }) => StoryNode;

export function createElement<P extends {}>(tag: StoryRenderer<P>, props: P, ...deep_children: DeepFragment[]): StoryNode;
export function createElement<P extends BaseProps>(tag: string, props: P, ...deep_children: DeepFragment[]): StoryNode;
export function createElement(tag: string | StoryRenderer<{}>, props: BaseProps, ...deep_children: DeepFragment[]): StoryNode {
    const children = deep_children.flat(Infinity);
    if (typeof(tag) === 'function') {
        return tag({...props, children})
    } 
    
    const classes: Record<string, boolean> = {};
    if (props.className) {
        for (const c of split_tokens(props.classes)) {
            classes[c] = true;
        }
    }

    let dataset: {};
    if (props.dataset) {
        dataset = props.dataset;
    } else {
        dataset = {}
    }

    const attributes = {...props};
    delete attributes.className;
    delete attributes.dataset;

    return {
        kind: 'StoryNode',
        tag,
        classes,
        attributes,
        dataset,
        children: children.flat(Infinity)
    }
}

import {JSX as JSX_} from './JSX';
import { update, ObjectUpdater, Updater } from '../update';
export {JSX} from './JSX';
export declare namespace createElement {
    export import JSX = JSX_;
}


// Find subnodes within a story
export type StoryPredicate = (n: StoryNode) => boolean;
export type Path = number[];

export function find_node(node: StoryNode, predicate: StoryPredicate): [StoryNode, Path] | null {
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

export function find_all_nodes(node: StoryNode, predicate: StoryPredicate): [StoryNode, Path][] {
    const result: [StoryNode, Path][] = [];
    if (predicate(node)) {
        result.push([node, []]);
    }
    for (let i = 0; i < node.children.length; i++) {
        const child = node.children[i];
        if (is_story_node(child)) {
            result.push(...find_all_nodes(child, predicate)
                .map(([n, p]) =>
                    [n, [i, ...p]] as [StoryNode, Path]));
        }
    }
    return result;
}

// Find from a sequence of predicates. Makes it easy to get querySelector-like behavior.
export function find_path(node: StoryNode, predicates: StoryPredicate[]): [StoryNode, Path] | null {
    if (predicates.length === 0) {
        return [node, []];
    }

    const xs = find_all_nodes(node, predicates[0])
    for (const [x, p] of xs) {
        const c = find_path(x, predicates.slice(0));
        if (c !== null && c[0] !== x) {
            return [c[0], [...p, ...c[1]]];
        }
    }

    return null;
}

export function find_all_path(node: StoryNode, predicates: StoryPredicate[]): [StoryNode, Path][] {
    if (predicates.length === 0) {
        return [[node, []]];
    }

    const result: [StoryNode, Path][] = [];
    const xs = find_all_nodes(node, predicates[0]);
    for (const [x, p] of xs) {
        const cs = find_all_path(x, predicates.slice(0));
        result.push(...cs
            .filter(([c, cp]) => c !== x)
            .map(([c, cp]) => [c, [...p, ...cp]] as [StoryNode, Path]));
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
export function replace_in(parent: StoryNode, path: Path, updated: StoryNode): StoryNode;
export function replace_in<N extends Fragment>(parent: Fragment, path: [], updated: N): N;
export function replace_in(parent: Fragment, path: Path, updated: Fragment): Fragment;
export function replace_in(parent: Fragment, path: Path, updated: Fragment): Fragment {
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

    for (const [data_attr, val] of Object.entries(story.dataset)) {
        elt.dataset[data_attr] = val as string;
    }

    for (const [prop, value] of Object.entries(story.attributes)) {
        if (prop === 'style') {
            for (const [attr, val] of Object.entries(value as {})) {
                elt.style[attr] = val;
            }
        }
        
        elt[prop] = value;
    }

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