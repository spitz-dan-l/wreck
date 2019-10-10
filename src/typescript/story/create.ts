import {AllHTMLAttributes, MergeWithHTMLProps, HTMLElementTags, remove_custom_props} from '../jsx_utils';
import {StoryNode, Fragment, DeepFragment, StoryNodeTypes} from './story';
import { split_tokens } from '../text_tools';

export namespace JSX {
    export type Element = Fragment;

    export interface ElementChildrenAttribute {
		children;
    }

	export type IntrinsicElements = {
		[K in HTMLElementTags]: MergeWithHTMLProps<NodeProps>
	}
}

// creating story trees
export type NodeProps = (
	| {
		type?: undefined
		children?: DeepFragment,
		data?: StoryNode['data']
	}
	| {
		[K in keyof StoryNodeTypes]: {
			type: K,
			children?: DeepFragment<StoryNodeTypes[K]>,
			data?: StoryNodeTypes[K]['data']
		}
	}[keyof StoryNodeTypes]
) & {
	className?: string
}
;

type StoryNodeTypeForProps<P extends NodeProps> = P['type'] extends keyof any ? StoryNodeTypes[P['type']] : StoryNode;

export type RendererBaseProps<Node extends StoryNode=StoryNode> = { children?: Fragment<Node>[] };

export type StoryRenderer<P extends {}, Node extends StoryNode=StoryNode> = (props: P & RendererBaseProps<Node>) => Node;

export function createElement<P extends {}, N extends StoryNode=StoryNode>(tag: StoryRenderer<P, N>, props: P, ...deep_children: DeepFragment<N>[]): N;
export function createElement<P extends NodeProps>(tag: string, props: MergeWithHTMLProps<P>, ...deep_children: DeepFragment<StoryNodeTypeForProps<P>>[]): StoryNodeTypeForProps<P>;
export function createElement(tag: string | StoryRenderer<{}>, props: MergeWithHTMLProps<NodeProps>, ...deep_children: DeepFragment[]): StoryNode {
    const children = deep_children.flat(Infinity);
    if (typeof(tag) === 'function') {
        return tag({...props, children})
    } 
    
    const classes: Record<string, boolean> = {};
    if (props.className) {
        for (const c of split_tokens(props.className)) {
            classes[c] = true;
        }
    }

    let data: {};
    if (props.data) {
        data = props.data;
    } else {
        data = {}
    }

    const attributes = remove_custom_props(props, {'data': null, 'type': null, 'className': null, 'children': null});
   
    return {
        kind: 'StoryNode',
        tag,
        classes,
        attributes,
        data,
        children: children.flat(Infinity)
    }
}

import JSX_ = JSX;
export declare namespace createElement {
    export import JSX = JSX_;
}
