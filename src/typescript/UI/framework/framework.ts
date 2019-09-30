import {JSX as JSX_} from './JSX';

export type Props = {};
export type AllProps<P extends Props> = P & { children?: Element[] }

export type Renderer<P extends Props> = (props: P, old?: {old_props: P, old_root: Component<P>}) => Component<P>;
export type RendererFor<Comp> = Comp extends Component<infer P> ? Renderer<P> : never;

export interface Component<P extends Props> extends HTMLElement {
    __brand: P
}

export type ComponentFor<Rend> = Rend extends Renderer<infer P> ? Component<P> : never;
export type Getter<Root extends Component<Props>, E extends HTMLElement> = (root: Root) => E;
export type PropsFor<Comp> = Comp extends Component<infer P> ? P : never;

export type PropMapper<
    Comp1 extends Component<Props>,
    Comp2 extends Component<Props>
> = (props: PropsFor<Comp1>) => PropsFor<Comp2>;

export function update_component<P extends Props>(renderer: Renderer<P>, props: P, old: { old_props: P, old_root: Component<P>}) {
    const result = renderer(props, old);

    if (result !== old.old_root) {
        old.old_root.replaceWith(result);
    }

    return result;
}

export type Updater<
    C1 extends Component<Props>,
    C2 extends Component<Props>
> = (props: PropsFor<C1>, old?: {old_props: PropsFor<C1>, old_root: C1}) => C2;

export function make_updater<
    P1 extends Props,
    P2 extends Props
>(
    getter: Getter<Component<P1>, Component<P2>>,
    prop_mapper: PropMapper<Component<P1>, Component<P2>>,
    renderer: RendererFor<Component<P2>>
): Updater<Component<P1>, Component<P2>> {
    return (props: P1, old?: { old_props: P1, old_root: Component<P1>}) => {
        if (!old) {
            return renderer(prop_mapper(props));
        }

        return update_component(
            renderer,
            prop_mapper(props),
            {
                old_props: prop_mapper(old.old_props),
                old_root: getter(old.old_root)
            }
        );
    }
}

import {A} from 'ts-toolbelt';

export type ElementHelpers<C1 extends Component<Props>, C2 extends HTMLElement> = A.Compute<{ get: Getter<C1, C2> }>
export type ChildHelpers<C1 extends Component<Props>, C2 extends Component<Props>> = A.Compute<{
    get: Getter<C1, C2>,
    map: PropMapper<C1, C2>,
    render: Updater<C1, C2>
}>

export function declare_child<C1 extends Component<Props>, C2 extends HTMLElement>(getter: Getter<C1, C2>): ElementHelpers<C1, C2>;
export function declare_child<C1 extends Component<Props>, C2 extends Component<{}>>(getter: Getter<C1, C2>, mapper: PropMapper<C1, C2>, renderer: RendererFor<C2>): ChildHelpers<C1, C2>;
export function declare_child<C1 extends Component<Props>, C2 extends Component<{}>>(getter: Getter<C1, C2>, mapper?: PropMapper<C1, C2>, renderer?: RendererFor<C2>) {
    let result: any = {get: getter};
    if (mapper !== undefined) {
        result.map = mapper;
    }

    if (renderer !== undefined) {
        result.render = make_updater(getter, mapper!, renderer);
    }

    return result;
}

export function child_declarator_for<C1 extends Component<Props>>() {
    function child_declarator_for_inner<C2 extends HTMLElement>(getter: Getter<C1, C2>): ElementHelpers<C1, C2>;
    function child_declarator_for_inner<C2 extends Component<{}>>(getter: Getter<C1, C2>, mapper: PropMapper<C1, C2>, renderer: RendererFor<C2>): ChildHelpers<C1, C2>;
    function child_declarator_for_inner<C2 extends Component<{}>>(getter: Getter<C1, C2>, mapper?: PropMapper<C1, C2>, renderer?: RendererFor<C2>) {
        return declare_child(getter, mapper!, renderer as RendererFor<C2>);
    }
    return child_declarator_for_inner;
}

export type UI<State, Action> = {
    initialize: (init_state: State) => Component<State>,
    dispatch: (action: Action) => void,
    effect: (f: () => void) => void
}

export function make_ui<State, Action>(
    renderer: Renderer<State>,
    reducer: (state: State, action: Action) => State
): UI<State, Action> {
    let old_state: State;
    let component: Component<State>;

    function initialize(initial_state: State) {
        component = renderer(initial_state);
        old_state = initial_state;
        return component;
    }

    let render_promise: Promise<void> | null = null;
    const action_queue: Action[] = [];
    const effect_queue: (() => void)[] = [];
    
    function dispatch(action: Action) {
        // if (old_state === undefined) {
        //     throw new Error('dispatch function was called before initializer.');
        // }
        action_queue.push(action);

        if (render_promise === null) {
            render_promise = Promise.resolve().then(render);
        }
    }

    function effect(f: () => void) {
        // if (old_state === undefined) {
        //     throw new Error('effect function was called before initializer.');
        // }
        effect_queue.push(f);

        if (render_promise === null) {
            render_promise = Promise.resolve().then(render);
        }
    }

    function render() {
        if (old_state === undefined) {
            throw new Error('dispatch or effect function was called before initializer.');
        }
        render_promise = null;

        let new_state = old_state;
        while (action_queue.length > 0) {
            new_state = reducer(new_state, action_queue.shift()!);
        }

        if (new_state !== old_state) {
            component = update_component(
                renderer,
                new_state,
                {
                    old_props: old_state,
                    old_root: component
                }
            );

            old_state = new_state;
        }

        while (effect_queue.length > 0) {
            effect_queue.shift()!();
        }
    } 

    return {
        initialize,
        dispatch,
        effect
    };
}

export function createElement<P extends Props>(type: Renderer<P> | string, props: P, ...children: any[]): JSX_.Element {
    const all_props: AllProps<P> = {...props, children};
    
    let result: JSX_.Element;
    if (typeof type === 'string') {
        result = intrinsic_element_renderer(type)(all_props);
    } else {
        result = type(all_props);
    }
    
    return result;
}

export {JSX} from './JSX';
// export import JSX_ = JSX;
export declare namespace createElement {
    // export {JSX} from './JSX';
    export import JSX = JSX_;
}

export function update_class<E extends HTMLElement>(elt: E, options: { add?: string[], remove?: string[] }) {
    if (options.add) {
        options.add.forEach(c => {
            elt.classList.add(c);
        })
    }

    if (options.remove) {
        options.remove.forEach(c => {
            elt.classList.remove(c);
        });
    }

    return elt;
}

export const intrinsic_element_renderer = (tag: string) =>
    (props: any) => {
        const node = document.createElement(tag) as unknown as HTMLElement;
        applyElementProps(node, props);
        appendChildrenRecursively(node, props.children);
        return node;
    }

function appendChildrenRecursively(node: HTMLElement, children: any[]): void {
    for (const child of children) {
        if (child instanceof Node) {   // Is it an HTML or SVG element?
            node.appendChild(child);
        }
        else if (Array.isArray(child)) {   // example: <div>{items}</div>
            appendChildrenRecursively(node, child);
        }
        else if (child === false) {
            // The value false is ignored, to allow conditional display using && operator
        }
        else if (child != null) {   // if item is not null or undefined
            node.appendChild(document.createTextNode(child));
        }
    }
}

function applyElementProps(node: HTMLElement, props: Object): void {
    for (const prop in props) {
        if (prop === 'children') {
            continue;
        }  
        const value = props[prop];
        if (value == null)   // if value is null or undefined
            continue;
        if (prop === 'ref') {
            if (typeof value === 'function') {
                value(node);
            }
            else {
                throw new Error("'ref' must be a function");
            }
        }
        else if (eventMap.hasOwnProperty(prop)) {
            node[eventMap[prop]] = value;
        }
        else if (typeof value === 'function') {
            node.addEventListener(prop, value);
        }
        else if (prop === 'style' && typeof value === 'object') {   // Example: <div style={{height: "20px"}}></div>
            for (const styleName in value) {
                (<HTMLElement>node).style[styleName] = value[styleName];
            }
        }
        else {
            const name = attribMap.hasOwnProperty(prop) ? attribMap[prop] : prop;
            if (name in node && typeof value === 'object') {
                // pass object-valued attributes to Web Components
                node[name] = value;   // value is set without any type conversion
            }
            else {
                node.setAttribute(name, value);   // value will be converted to string
            }
        }
    }
}

const attribMap = {
    'htmlFor': 'for',
    'className': 'class',
    'defaultValue': 'value',
    'defaultChecked': 'checked'
};

const eventMap = {
    // Clipboard events
    'onCopy': 'oncopy',
    'onCut': 'oncut',
    'onPaste': 'onpaste',
    // Keyboard events
    'onKeyDown': 'onkeydown',
    'onKeyPress': 'onkeypress',
    'onKeyUp': 'onkeyup',
    // Focus events
    'onFocus': 'onfocus',
    'onBlur': 'onblur',
    // Form events
    'onChange': 'onchange',
    'onInput': 'oninput',
    'onSubmit': 'onsubmit',
    // Mouse events
    'onClick': 'onclick',
    'onContextMenu': 'oncontextmenu',
    'onDoubleClick': 'ondblclick',
    'onDrag': 'ondrag',
    'onDragEnd': 'ondragend',
    'onDragEnter': 'ondragenter',
    'onDragExit': 'ondragexit',
    'onDragLeave': 'ondragleave',
    'onDragOver': 'ondragover',
    'onDragStart': 'ondragstart',
    'onDrop': 'ondrop',
    'onMouseDown': 'onmousedown',
    'onMouseEnter': 'onmouseenter',
    'onMouseLeave': 'onmouseleave',
    'onMouseMove': 'onmousemove',
    'onMouseOut': 'onmouseout',
    'onMouseOver': 'onmouseover',
    'onMouseUp': 'onmouseup',
    // Selection events
    'onSelect': 'onselect',
    // Touch events
    'onTouchCancel': 'ontouchcancel',
    'onTouchEnd': 'ontouchend',
    'onTouchMove': 'ontouchmove',
    'onTouchStart': 'ontouchstart',
    // UI events
    'onScroll': 'onscroll',
    // Wheel events
    'onWheel': 'onwheel',
    // Media events
    'onAbort': 'onabort',
    'onCanPlay': 'oncanplay',
    'onCanPlayThrough': 'oncanplaythrough',
    'onDurationChange': 'ondurationchange',
    'onEmptied': 'onemptied',
    'onEncrypted': 'onencrypted',
    'onEnded': 'onended',
    'onLoadedData': 'onloadeddata',
    'onLoadedMetadata': 'onloadedmetadata',
    'onLoadStart': 'onloadstart',
    'onPause': 'onpause',
    'onPlay': 'onplay',
    'onPlaying': 'onplaying',
    'onProgress': 'onprogress',
    'onRateChange': 'onratechange',
    'onSeeked': 'onseeked',
    'onSeeking': 'onseeking',
    'onStalled': 'onstalled',
    'onSuspend': 'onsuspend',
    'onTimeUpdate': 'ontimeupdate',
    'onVolumeChange': 'onvolumechange',
    'onWaiting': 'onwaiting',
    // Image events
    'onLoad': 'onload',
    'onError': 'onerror'
};