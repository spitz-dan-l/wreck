import {StoryNode, DeepFragment} from './story';

import {A, O} from 'ts-toolbelt';

export namespace JSX {
    export type Element = StoryNode;

    interface ElementChildrenAttribute {
		children;
    }

	type FilterProperties<E extends {}> = Partial<Omit<E,
		// NOTE: tried adding a filter to remove readonly keys, it was too slow
		| O.SelectKeys<E, (...a: any) => any>
		| 'children'
		| 'style'
		| 'dataset'
	>>

	type Styles = Partial<Omit<CSSStyleDeclaration,
		O.SelectKeys<CSSStyleDeclaration, (...a: any) => any>
	>>

	export type IntrinsicElements = A.Compute<{
		[K in keyof HTMLElementTagNameMap]: FilterProperties<HTMLElementTagNameMap[K]> & {
			children?: DeepFragment[],
			style?: Styles,
			dataset?: Record<string, any>
		}
	}>
}