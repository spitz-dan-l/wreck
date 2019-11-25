import * as CSS from 'csstype';
import { entries, keys, set_prop, Entry } from './utils';


export type EventHandler<E extends Event> = (this: HTMLElement, ev: E) => any;
export type EventHandlers = {
    [K in keyof HTMLElementEventMap]?: EventHandler<HTMLElementEventMap[K]>
};

export interface CSSProperties extends CSS.Properties<string> {
    /**
     * The index signature was removed to enable closed typing for style
     * using CSSType. You're able to use type assertion or module augmentation
     * to add properties or an index signature of your own.
     *
     * For examples and more information, visit:
     * https://github.com/frenic/csstype#what-should-i-do-when-i-get-type-errors
     */
}

// All the WAI-ARIA 1.1 attributes from https://www.w3.org/TR/wai-aria-1.1/
interface AriaAttributes {
    /** Identifies the currently active element when DOM focus is on a composite widget, textbox, group, or application. */
    'aria-activedescendant'?: string;
    /** Indicates whether assistive technologies will present all, or only parts of, the changed region based on the change notifications defined by the aria-relevant attribute. */
    'aria-atomic'?: boolean | 'false' | 'true';
    /**
     * Indicates whether inputting text could trigger display of one or more predictions of the user's intended value for an input and specifies how predictions would be
     * presented if they are made.
     */
    'aria-autocomplete'?: 'none' | 'inline' | 'list' | 'both';
    /** Indicates an element is being modified and that assistive technologies MAY want to wait until the modifications are complete before exposing them to the user. */
    'aria-busy'?: boolean | 'false' | 'true';
    /**
     * Indicates the current "checked" state of checkboxes, radio buttons, and other widgets.
     * @see aria-pressed @see aria-selected.
     */
    'aria-checked'?: boolean | 'false' | 'mixed' | 'true';
    /**
     * Defines the total number of columns in a table, grid, or treegrid.
     * @see aria-colindex.
     */
    'aria-colcount'?: number;
    /**
     * Defines an element's column index or position with respect to the total number of columns within a table, grid, or treegrid.
     * @see aria-colcount @see aria-colspan.
     */
    'aria-colindex'?: number;
    /**
     * Defines the number of columns spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-colindex @see aria-rowspan.
     */
    'aria-colspan'?: number;
    /**
     * Identifies the element (or elements) whose contents or presence are controlled by the current element.
     * @see aria-owns.
     */
    'aria-controls'?: string;
    /** Indicates the element that represents the current item within a container or set of related elements. */
    'aria-current'?: boolean | 'false' | 'true' | 'page' | 'step' | 'location' | 'date' | 'time';
    /**
     * Identifies the element (or elements) that describes the object.
     * @see aria-labelledby
     */
    'aria-describedby'?: string;
    /**
     * Identifies the element that provides a detailed, extended description for the object.
     * @see aria-describedby.
     */
    'aria-details'?: string;
    /**
     * Indicates that the element is perceivable but disabled, so it is not editable or otherwise operable.
     * @see aria-hidden @see aria-readonly.
     */
    'aria-disabled'?: boolean | 'false' | 'true';
    /**
     * Indicates what functions can be performed when a dragged object is released on the drop target.
     * @deprecated in ARIA 1.1
     */
    'aria-dropeffect'?: 'none' | 'copy' | 'execute' | 'link' | 'move' | 'popup';
    /**
     * Identifies the element that provides an error message for the object.
     * @see aria-invalid @see aria-describedby.
     */
    'aria-errormessage'?: string;
    /** Indicates whether the element, or another grouping element it controls, is currently expanded or collapsed. */
    'aria-expanded'?: boolean | 'false' | 'true';
    /**
     * Identifies the next element (or elements) in an alternate reading order of content which, at the user's discretion,
     * allows assistive technology to override the general default of reading in document source order.
     */
    'aria-flowto'?: string;
    /**
     * Indicates an element's "grabbed" state in a drag-and-drop operation.
     * @deprecated in ARIA 1.1
     */
    'aria-grabbed'?: boolean | 'false' | 'true';
    /** Indicates the availability and type of interactive popup element, such as menu or dialog, that can be triggered by an element. */
    'aria-haspopup'?: boolean | 'false' | 'true' | 'menu' | 'listbox' | 'tree' | 'grid' | 'dialog';
    /**
     * Indicates whether the element is exposed to an accessibility API.
     * @see aria-disabled.
     */
    'aria-hidden'?: boolean | 'false' | 'true';
    /**
     * Indicates the entered value does not conform to the format expected by the application.
     * @see aria-errormessage.
     */
    'aria-invalid'?: boolean | 'false' | 'true' | 'grammar' | 'spelling';
    /** Indicates keyboard shortcuts that an author has implemented to activate or give focus to an element. */
    'aria-keyshortcuts'?: string;
    /**
     * Defines a string value that labels the current element.
     * @see aria-labelledby.
     */
    'aria-label'?: string;
    /**
     * Identifies the element (or elements) that labels the current element.
     * @see aria-describedby.
     */
    'aria-labelledby'?: string;
    /** Defines the hierarchical level of an element within a structure. */
    'aria-level'?: number;
    /** Indicates that an element will be updated, and describes the types of updates the user agents, assistive technologies, and user can expect from the live region. */
    'aria-live'?: 'off' | 'assertive' | 'polite';
    /** Indicates whether an element is modal when displayed. */
    'aria-modal'?: boolean | 'false' | 'true';
    /** Indicates whether a text box accepts multiple lines of input or only a single line. */
    'aria-multiline'?: boolean | 'false' | 'true';
    /** Indicates that the user may select more than one item from the current selectable descendants. */
    'aria-multiselectable'?: boolean | 'false' | 'true';
    /** Indicates whether the element's orientation is horizontal, vertical, or unknown/ambiguous. */
    'aria-orientation'?: 'horizontal' | 'vertical';
    /**
     * Identifies an element (or elements) in order to define a visual, functional, or contextual parent/child relationship
     * between DOM elements where the DOM hierarchy cannot be used to represent the relationship.
     * @see aria-controls.
     */
    'aria-owns'?: string;
    /**
     * Defines a short hint (a word or short phrase) intended to aid the user with data entry when the control has no value.
     * A hint could be a sample value or a brief description of the expected format.
     */
    'aria-placeholder'?: string;
    /**
     * Defines an element's number or position in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-setsize.
     */
    'aria-posinset'?: number;
    /**
     * Indicates the current "pressed" state of toggle buttons.
     * @see aria-checked @see aria-selected.
     */
    'aria-pressed'?: boolean | 'false' | 'mixed' | 'true';
    /**
     * Indicates that the element is not editable, but is otherwise operable.
     * @see aria-disabled.
     */
    'aria-readonly'?: boolean | 'false' | 'true';
    /**
     * Indicates what notifications the user agent will trigger when the accessibility tree within a live region is modified.
     * @see aria-atomic.
     */
    'aria-relevant'?: 'additions' | 'additions text' | 'all' | 'removals' | 'text';
    /** Indicates that user input is required on the element before a form may be submitted. */
    'aria-required'?: boolean | 'false' | 'true';
    /** Defines a human-readable, author-localized description for the role of an element. */
    'aria-roledescription'?: string;
    /**
     * Defines the total number of rows in a table, grid, or treegrid.
     * @see aria-rowindex.
     */
    'aria-rowcount'?: number;
    /**
     * Defines an element's row index or position with respect to the total number of rows within a table, grid, or treegrid.
     * @see aria-rowcount @see aria-rowspan.
     */
    'aria-rowindex'?: number;
    /**
     * Defines the number of rows spanned by a cell or gridcell within a table, grid, or treegrid.
     * @see aria-rowindex @see aria-colspan.
     */
    'aria-rowspan'?: number;
    /**
     * Indicates the current "selected" state of various widgets.
     * @see aria-checked @see aria-pressed.
     */
    'aria-selected'?: boolean | 'false' | 'true';
    /**
     * Defines the number of items in the current set of listitems or treeitems. Not required if all elements in the set are present in the DOM.
     * @see aria-posinset.
     */
    'aria-setsize'?: number;
    /** Indicates if items in a table or grid are sorted in ascending or descending order. */
    'aria-sort'?: 'none' | 'ascending' | 'descending' | 'other';
    /** Defines the maximum allowed value for a range widget. */
    'aria-valuemax'?: number;
    /** Defines the minimum allowed value for a range widget. */
    'aria-valuemin'?: number;
    /**
     * Defines the current value for a range widget.
     * @see aria-valuetext.
     */
    'aria-valuenow'?: number;
    /** Defines the human readable text alternative of aria-valuenow for a range widget. */
    'aria-valuetext'?: string;
}

interface HTMLAttributes extends AriaAttributes {
    // React-specific Attributes
    // defaultChecked?: boolean;
    // defaultValue?: string | number | string[];
    // suppressContentEditableWarning?: boolean;
    // suppressHydrationWarning?: boolean;

    on?: EventHandlers;

    // Standard HTML Attributes
    accessKey?: string;
    className?: string;
    contentEditable?: boolean;
    contextMenu?: string;
    dir?: string;
    draggable?: boolean;
    hidden?: boolean;
    id?: string;
    lang?: string;
    placeholder?: string;
    slot?: string;
    spellCheck?: boolean;
    style?: CSSProperties;
    tabIndex?: number;
    title?: string;

    // Unknown
    inputMode?: string;
    is?: string;
    radioGroup?: string; // <command>, <menuitem>

    // WAI-ARIA
    role?: string;

    // RDFa Attributes
    about?: string;
    datatype?: string;
    inlist?: any;
    prefix?: string;
    property?: string;
    resource?: string;
    typeof?: string;
    vocab?: string;

    // Non-standard Attributes
    autoCapitalize?: string;
    autoCorrect?: string;
    autoSave?: string;
    color?: string;
    itemProp?: string;
    itemScope?: boolean;
    itemType?: string;
    itemID?: string;
    itemRef?: string;
    results?: number;
    security?: string;
    unselectable?: 'on' | 'off';
}

export interface AllHTMLAttributes extends HTMLAttributes {
    // Standard HTML Attributes
    accept?: string;
    acceptCharset?: string;
    action?: string;
    allowFullScreen?: boolean;
    allowTransparency?: boolean;
    alt?: string;
    as?: string;
    async?: boolean;
    autoComplete?: string;
    autoFocus?: boolean;
    autoPlay?: boolean;
    capture?: boolean | string;
    cellPadding?: number | string;
    cellSpacing?: number | string;
    charSet?: string;
    challenge?: string;
    checked?: boolean;
    cite?: string;
    classID?: string;
    cols?: number;
    colSpan?: number;
    content?: string;
    controls?: boolean;
    coords?: string;
    crossOrigin?: string;
    data?: string;
    dateTime?: string;
    default?: boolean;
    defer?: boolean;
    disabled?: boolean;
    download?: any;
    encType?: string;
    form?: string;
    formAction?: string;
    formEncType?: string;
    formMethod?: string;
    formNoValidate?: boolean;
    formTarget?: string;
    frameBorder?: number | string;
    headers?: string;
    height?: number | string;
    high?: number;
    href?: string;
    hrefLang?: string;
    htmlFor?: string;
    httpEquiv?: string;
    integrity?: string;
    keyParams?: string;
    keyType?: string;
    kind?: string;
    label?: string;
    list?: string;
    loop?: boolean;
    low?: number;
    manifest?: string;
    marginHeight?: number;
    marginWidth?: number;
    max?: number | string;
    maxLength?: number;
    media?: string;
    mediaGroup?: string;
    method?: string;
    min?: number | string;
    minLength?: number;
    multiple?: boolean;
    muted?: boolean;
    name?: string;
    nonce?: string;
    noValidate?: boolean;
    open?: boolean;
    optimum?: number;
    pattern?: string;
    placeholder?: string;
    playsInline?: boolean;
    poster?: string;
    preload?: string;
    readOnly?: boolean;
    rel?: string;
    required?: boolean;
    reversed?: boolean;
    rows?: number;
    rowSpan?: number;
    sandbox?: string;
    scope?: string;
    scoped?: boolean;
    scrolling?: string;
    seamless?: boolean;
    selected?: boolean;
    shape?: string;
    size?: number;
    sizes?: string;
    span?: number;
    src?: string;
    srcDoc?: string;
    srcLang?: string;
    srcSet?: string;
    start?: number;
    step?: number | string;
    summary?: string;
    target?: string;
    type?: string;
    useMap?: string;
    value?: string | string[] | number;
    width?: number | string;
    wmode?: string;
    wrap?: string;
}

export type HTMLElementTags = keyof HTMLElementTagNameMap;

export type HTMLAttributesWithout<T> = Omit<AllHTMLAttributes, keyof T>;

export type MergeWithHTMLProps<Props extends object> = Props & HTMLAttributesWithout<Props>

export function set_attributes(element: HTMLElement, attributes: AllHTMLAttributes): void {
    for (const [attr, value] of entries(attributes)) {
        if (attr === 'className') {
            element.setAttribute('class', value);
        } else if (attr === 'style') {
            const style = element.style as CSSProperties;
            for (const style_pair of entries(value as CSSProperties)) {
                set_prop(style, ...style_pair);
            }
        } else if (attr === 'on') {
            for (const [ev_name, handler] of entries(value as EventHandlers)) {
                element.addEventListener(ev_name, handler);
            }
        } else {
            element.setAttribute(attr, value);
        }   
    }
}

export function remove_custom_props<Props extends object>(props: MergeWithHTMLProps<Props>, custom_keys: Record<keyof Props, null>): HTMLAttributesWithout<Props> {
    const result = {...props};
    for (const k of keys(custom_keys)) {
        delete result[k];
    }
    return result;
}
