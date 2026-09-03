import { HTMLElementTags, MergeWithHTMLProps, set_attributes, remove_custom_props } from "../../lib/jsx_utils";
import { Renderer, Props, BaseProps } from "./framework";


export type CreateElementChild = HTMLElement | string;

type CreateElementChildDeep = CreateElementChild | CreateElementChildArrayDeep;
interface CreateElementChildArrayDeep extends Array<CreateElementChildDeep> {}

// interface Props {
// 	children?: CreateElementChildDeep
// }

export function createElement<P extends Props>(type: Renderer<P>, props: P, ...children: CreateElementChildDeep[]): HTMLElement;
export function createElement(type: string, props: MergeWithHTMLProps<Props>, ...children: CreateElementChildDeep[]): HTMLElement;
export function createElement<P extends Props>(type: Renderer<P> | string, props: MergeWithHTMLProps<P>, ...children_deep: CreateElementChildDeep[]): HTMLElement {
	const children = flat_deep(children_deep) as CreateElementChild[];
	const all_props = {...props, children} as unknown as P & BaseProps;
	
	if (typeof type === 'string') {
		return intrinsic_element_renderer(type, all_props);
	} else {
		return type(all_props);
	}
}

import { flat_deep } from "../../lib/utils";

// The JSX types for files that use this createElement as their jsxFactory.
export declare namespace createElement {
	export namespace JSX {
		export type Element = HTMLElement;

		export interface ElementChildrenAttribute {
			children: unknown;
		}

		type IntrinsicProps = {
			children?: CreateElementChildDeep
		}

		export type IntrinsicElements = {
			[K in HTMLElementTags]: MergeWithHTMLProps<IntrinsicProps>
		}
	}
}

export const intrinsic_element_renderer = (tag: string, props: MergeWithHTMLProps<Props & BaseProps>) => {
	const node = document.createElement(tag);
	
	const html_props = remove_custom_props(props, {children: null});
	set_attributes(node, html_props);
	
	if (props.children){
		for (const child of props.children) {
			if (child instanceof Node) {
				node.appendChild(child);
			}
			else if (child) {
				node.appendChild(document.createTextNode(child));
			}
		}
	}
	return node;
}
