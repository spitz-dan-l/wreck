import { split_tokens } from '../text_tools';

export const StoryHole: unique symbol = Symbol('StoryHole');
export type StoryHole = typeof StoryHole;

export type Fragment = string | StoryNode | StoryHole;
export type DeepFragment = Fragment | DeepFragmentArray;
interface DeepFragmentArray extends Array<DeepFragment> {};

export type StoryNode = {
    kind: 'StoryNode',
    tag: string,
    classes: Record<string, boolean>,
    attributes: Record<string, any>,
    dataset: Record<string, any>,
    children: Fragment[]
}

export function is_story_node(x: Fragment): x is StoryNode {
    return (x as any).kind === 'StoryNode';
}

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
export {JSX} from './JSX';
export declare namespace createElement {
    export import JSX = JSX_;
}

type StoryPredicate = (n: StoryNode) => boolean;

// Find subnodes within a story
export function find_node(node: StoryNode, predicate: StoryPredicate): StoryNode | null {
    if (predicate(node)) {
        return node;
    }
    for (const child of node.children) {
        if (is_story_node(child)) {
            const result = find_node(child, predicate);
            if (result !== null) {
                return result;
            }
        }
    }
    return null;
}

export function find_all_nodes(node: StoryNode, predicate: StoryPredicate): StoryNode[] {
    const result: StoryNode[] = [];
    if (predicate(node)) {
        result.push(node);
    }
    for (const child of node.children) {
        if (is_story_node(child)) {
            result.push(...find_all_nodes(child, predicate));
        }
    }
    return result;
}

export function find_path(node: StoryNode, predicates: StoryPredicate[]): StoryNode | null {
    if (predicates.length === 0) {
        return node;
    }

    const xs = find_all_nodes(node, predicates[0])
    for (const x of xs) {
        const c = find_path(x, predicates.slice(0));
        if (c !== null && c !== x) {
            return c;
        }
    }

    return null;
}

export function find_all_path(node: StoryNode, predicates: StoryPredicate[]): StoryNode[] {
    if (predicates.length === 0) {
        return [node];
    }

    const result: StoryNode[] = [];
    const xs = find_all_nodes(node, predicates[0]);
    for (const x of xs) {
        const cs = find_all_path(x, predicates.slice(0));
        result.push(...cs.filter(c => c !== x));
    }
    return result;
}

export type Path = number[];

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
        if (c === StoryHole) {
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