import {JSX as JSX_} from './JSX';

export import JSX = JSX_;

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

const svgElements = {
    'circle': true,
    'clipPath': true,
    'defs': true,
    'ellipse': true,
    'g': true,
    'image': true,
    'line': true,
    'linearGradient': true,
    'mask': true,
    'path': true,
    'pattern': true,
    'polygon': true,
    'polyline': true,
    'radialGradient': true,
    'rect': true,
    'stop': true,
    'svg': true,
    'text': true,
    'tspan': true
};

export const Fragment = "--fragment--";

export class Component<P> {
    constructor(protected props: P) {
    }

    public render(): JSX.Element {
        return <JSX.Element><unknown>null;
    }
}

export interface Props<T> {
    children?: any;
    ref?: (instance: T) => void;
}

export function createElement2<P extends Props<Component<P>>>(type: any, props: P, ...children: any[]): JSX.Element | JSX.Element[] {
    props = props || <P>{};
    let node: JSX.Element;
    if (type === Fragment) {
        return children;
    }
    else if (typeof type === 'function') {   // Is it either a component class or a functional component?
        const _props = { ...props, children } as P;
        if (type.prototype.render) {   // Is it a component class?
            const component: Component<P> = new type(_props);
            node = component.render();
            // applyComponentProps<P>(component, props);
        }
        else {   // It is a functional component
            node = type(_props);
        }
    }
    else {   // It is an HTML or SVG element
        // if (svgElements[type]) {
        //     node = document.createElementNS("http://www.w3.org/2000/svg", type);
        // }
        // else {
            node = document.createElement(type);
        // }
        applyElementProps(node, props);
        appendChildrenRecursively(node, children);
    }
    return node;
}

export function createElement<P extends Props<Component<P>>>(type: any, props: P, ...children: any[]): JSX.Element | JSX.Element[] {
    props = props || <P>{};
    let node: JSX.Element;
    if (type === Fragment) {
        return children;
    }
    else if (typeof type === 'function') {   // Is it either a component class or a functional component?
        const _props = { ...props, children } as P;
        node = type(_props);
        applyComponentProps<P>(node, props);
    } else {   // It is an HTML element
        node = document.createElement(type);
        applyElementProps(node, props);
        appendChildrenRecursively(node, children);
    }
    return node;
}
export declare namespace createElement {
    export import JSX = JSX_;
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

function applyComponentProps<P>(component: JSX.Element, f: any, props: Object): void {
    const ref = props['ref'];
    if (ref) {
        if (typeof ref === 'function') {
            ref(component);
        }
        else {
            throw new Error("'ref' must be a function");
        }
    }
}