export type Props = {};

export type Renderer<P extends Props> = (props: P, old?: {old_props: P, old_root: Component<P>}) => Element;
export type RendererFor<Comp> = Comp extends Component<infer P> ? Renderer<P> : never;

export function renderer<P extends Props>(f: (props: P, old?: {old_props: P, old_root: Component<P>}) => Element) {
    return (props: P, old?: any) => {
        return apply(f, props, old);
    }
}

export const UpdateComponent: unique symbol = Symbol('UpdateComponent');

export interface Component<P extends Props> extends Element {
    [UpdateComponent]: (props: P) => Component<P>;
}
export type ComponentFor<Rend> = Rend extends Renderer<infer P> ? Component<P> : never;
export type Getter<Root extends Component<Props>, E extends Element> = (root: Root) => E;

export function is_component<P extends Props>(x: Element | Component<P>): x is Component<P> {
    return x[UpdateComponent] !== undefined;
}

export function apply<P extends Props>(renderer: Renderer<P>, props: P, old?: {old_props: P, old_root: Component<P>}): Component<P> {
    let result = renderer(props, old) as Component<P>;

    result[UpdateComponent] = (new_props) => apply(renderer, new_props, {old_props: props, old_root: result});
  
    if (old && result !== old.old_root) {
        old.old_root.replaceWith(result);
    }

    return result;
}

type _Element = Element;

export declare namespace JSX {
    export type Element = _Element;
    export interface IntrinsicElements {
        [tag: string]: any
    }
}

export function createElement<P extends Props>(type: Renderer<P> | string, props: P, ...children: any[]): JSX.Element {
    props = props || <P>{};
    const _props = { ...props, children } as P;
    
    let renderer: Renderer<P>;
    if (typeof type === 'string') {
        return IntrinsicElementRenderer(type)(_props);
    } else {
        return apply(type, _props);
    }
}

export import JSX_ = JSX;
export declare namespace createElement {
    export import JSX = JSX_;
}

export const IntrinsicElementRenderer = (tag: string): Renderer<any> =>
    (props) => {
        const node = document.createElement(tag) as unknown as JSX.Element;
        applyElementProps(node, props);
        appendChildrenRecursively(node, props.children);
        return node;
    }

function appendChildrenRecursively(node: JSX.Element, children: any[]): void {
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

function applyElementProps(node: JSX.Element, props: Object): void {
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