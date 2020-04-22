import { gensym } from '../lib/gensym';
import { gist, Gist } from 'gist';
import { HTMLElementTags, MergeWithHTMLProps, remove_custom_props } from '../lib/jsx_utils';
import { split_tokens } from '../lib/text_utils';
import { DeepFragment, Fragment, StoryNode } from './story';
import { flat_deep } from '../lib/utils';

export namespace JSX {
    export type Element = Fragment;

    export interface ElementChildrenAttribute {
		children: any;
    }

	export type IntrinsicElements = {
		[K in HTMLElementTags]: MergeWithHTMLProps<NodeProps>
	}
}

// creating story trees
export type NodeProps = (
	& {
		type?: undefined
		children?: DeepFragment,
        frame_index?: number,
        gist?: Gist
	}
    & {
        className?: string
    }
);

// type StoryNodeTypeForProps<P extends NodeProps> = P['type'] extends keyof any ? StoryNodeTypes[P['type']] : StoryNode;

export type RendererBaseProps = { children?: Fragment[] };

export type StoryRenderer<P extends {}> = (props: P & RendererBaseProps) => StoryNode;

export function createElement<P extends {}>(tag: StoryRenderer<P>, props: P, ...deep_children: DeepFragment[]): StoryNode;
export function createElement<P extends NodeProps>(tag: string, props: MergeWithHTMLProps<P>, ...deep_children: DeepFragment[]): StoryNode;
export function createElement(tag: string | StoryRenderer<{}>, props: MergeWithHTMLProps<NodeProps>, ...deep_children: DeepFragment[]): StoryNode {
    props = props || {};
    const children = flat_deep(deep_children);
    // const children = deep_children.flat(Infinity);
    if (typeof(tag) === 'function') {
        return tag({...props, children})
    }
    
    const classes: Record<string, boolean> = {};
    if (props.className) {
        for (const c of split_tokens(props.className)) {
            classes[c] = true;
        }
    }

    let data: StoryNode['data'] = {};
    if (props.frame_index !== undefined) {
        data.frame_index = props.frame_index;
    }
    if (props.gist !== undefined) {
        data.gist = props.gist;
    }

    const key = gensym();

    const attributes = remove_custom_props(props, {'frame_index': null, 'gist': null, 'type': null, 'className': null, 'children': null});
   
    return {
        kind: 'StoryNode',
        key,
        tag,
        classes,
        attributes,
        data,
        children
    }
}

import JSX_ = JSX;
export declare namespace createElement {
    export import JSX = JSX_;
}
