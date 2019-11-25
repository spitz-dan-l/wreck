import { HTMLElementTags, MergeWithHTMLProps, set_attributes, remove_custom_props } from "../../lib/jsx_utils";
import { Renderer, Props, BaseProps } from "./framework";


export declare namespace JSX {
    export type Element = HTMLElement;

    export interface ElementChildrenAttribute {
		children: any;
    }

	type IntrinsicProps = {
		children?: CreateElementChildDeep
	}

	export type IntrinsicElements = {
		[K in HTMLElementTags]: MergeWithHTMLProps<IntrinsicProps>
	}
}

export type CreateElementChild = HTMLElement | string;

type CreateElementChildDeep = CreateElementChild | CreateElementChildArrayDeep;
interface CreateElementChildArrayDeep extends Array<CreateElementChildDeep> {}

// interface Props {
// 	children?: CreateElementChildDeep
// }

export function createElement<P extends Props>(type: Renderer<P>, props: P, ...children: CreateElementChildDeep[]): HTMLElement;
export function createElement(type: string, props: MergeWithHTMLProps<Props>, ...children: CreateElementChildDeep[]): HTMLElement;
export function createElement<P extends Props>(type: Renderer<P> | string, props: MergeWithHTMLProps<P>, ...children_deep: CreateElementChildDeep[]): HTMLElement {
	const children: CreateElementChild[] = flat_deep(children_deep); //.flat(Infinity);
	const all_props: P & BaseProps = {...props, children};
	
	if (typeof type === 'string') {
		return intrinsic_element_renderer(type, all_props);
	} else {
		return type(all_props);
	}
}

export import JSX_ = JSX;
import { flat_deep } from "../../lib/utils";
export declare namespace createElement {
	export import JSX = JSX_;
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
