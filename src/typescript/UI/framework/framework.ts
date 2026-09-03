/*
    A minimal UI framework. Components are plain DOM elements. A renderer
    creates a component from its props, or, when given the previous props
    and the previous element, updates that element in place (or replaces it).

    Child components are declared with a getter (how to find the child in
    the parent's DOM), a prop mapper (the child's props from the parent's),
    and the child's renderer.

    make_ui() runs a reducer loop: actions are dispatched, the state is
    reduced, and the root component is re-rendered on the next tick.
*/

export type Props = {};

export type BaseProps = { children?: (HTMLElement | Text)[] };

export type Renderer<P extends Props> = (props: P & BaseProps, old?: { old_props: P & BaseProps, old_root: Component<P> }) => Component<P>;

export interface Component<P extends Props> extends HTMLElement {
    __component_brand: P
}

export type PropsFor<Comp> = Comp extends Component<infer P> ? P & BaseProps : never;
export type RendererFor<Comp> = Comp extends Component<infer P> ? Renderer<P> : never;

export type Getter<Root extends Component<Props>, E extends HTMLElement> = (root: Root) => E;

export type PropMapper<C1 extends Component<Props>, C2 extends Component<Props>> = (props: PropsFor<C1>) => PropsFor<C2>;

export type Updater<C1 extends Component<Props>, C2 extends Component<Props>> =
    (props: PropsFor<C1>, old?: { old_props: PropsFor<C1>, old_root: C1 }) => C2;

export type ElementHelpers<C1 extends Component<Props>, C2 extends HTMLElement> = { get: Getter<C1, C2> };

export type ChildHelpers<C1 extends Component<Props>, C2 extends Component<Props>> = {
    get: Getter<C1, C2>,
    map: PropMapper<C1, C2>,
    render: Updater<C1, C2>
};

export function make_updater<C1 extends Component<Props>, C2 extends Component<Props>>(
    getter: Getter<C1, C2>,
    prop_mapper: PropMapper<C1, C2>,
    renderer: RendererFor<C2>
): Updater<C1, C2> {
    const render = renderer as unknown as (props: PropsFor<C2>, old?: { old_props: PropsFor<C2>, old_root: C2 }) => C2;

    return (props, old?) => {
        if (!old) {
            return render(prop_mapper(props));
        }

        const old_child_root = getter(old.old_root);
        if (!old_child_root) {
            console.warn('old child root may have disappeared. Check your getter logic.');
        }
        const result = render(prop_mapper(props), {
            old_props: prop_mapper(old.old_props),
            old_root: old_child_root
        });
        if (result !== old_child_root) {
            old_child_root.replaceWith(result);
        }
        return result;
    };
}

// Helpers for declaring the children of a component of type C1.
export function child_declarator_for<C1 extends Component<Props>>() {
    return {
        // A plain element within the component.
        element: <C2 extends HTMLElement>(getter: Getter<C1, C2>): ElementHelpers<C1, C2> => ({ get: getter }),

        // A child component, rendered from a mapping of the parent's props.
        child: <C2 extends Component<Props>>(getter: Getter<C1, C2>, mapper: PropMapper<C1, C2>, renderer: RendererFor<C2>): ChildHelpers<C1, C2> => ({
            get: getter,
            map: mapper,
            render: make_updater(getter, mapper, renderer)
        })
    };
}

export type UI<State extends Props, Action> = {
    initialize: (init_state: State) => Component<State>,
    dispatch: (action: Action) => void,
    effect: (f: () => void) => void,
    effect_promise: () => Promise<void>
}

import { GLOBAL_DEV_TOOLS } from "devtools";

declare module 'devtools' {
    interface GlobalDevTools {
        ui_state?: unknown;
    }
}

export function make_ui<State extends Props, Action>(
    renderer: Renderer<State>,
    reducer: (state: State, action: Action) => State,
    debug: boolean = false
): UI<State, Action> {
    let old_state: State | undefined = undefined;
    let component: Component<State> | undefined = undefined;

    let rendering = false;

    function initialize(initial_state: State) {
        if (component !== undefined) {
            throw new Error('multiple calls to initialize().');
        }
        old_state = initial_state;
        return render();
    }

    let render_task: ReturnType<typeof setTimeout> | undefined = undefined;

    const action_queue: Action[] = [];
    const effect_queue: (() => void)[] = [];

    function dispatch(action: Action) {
        if (old_state === undefined) {
            throw new Error('dispatch function was called before initializer.');
        }
        action_queue.push(action);

        if (render_task === undefined) {
            render_task = setTimeout(render);
        }
    }

    function effect(f: () => void) {
        if (old_state === undefined) {
            throw new Error('effect function was called before initializer.');
        }
        if (!rendering) {
            throw new Error('effect() was called outside of a render');
        }

        effect_queue.push(f);
    }

    function effect_promise() {
        return new Promise<void>(resolve => effect(resolve));
    }

    function render(): Component<State> {
        if (old_state === undefined) {
            throw new Error('dispatch or effect function was called before initializer.');
        }
        render_task = undefined;

        let new_state = old_state;
        while (action_queue.length > 0) {
            new_state = reducer(new_state, action_queue.shift()!);
        }

        rendering = true;
        if (component === undefined) {
            component = renderer(old_state);
        }
        if (new_state !== old_state) {
            const result = renderer(new_state, { old_props: old_state, old_root: component });
            if (result !== component) {
                component.replaceWith(result);
            }
            component = result;
            old_state = new_state;
            // for debugging
            if (debug) {
                GLOBAL_DEV_TOOLS.ui_state = old_state;
            }
        }

        requestAnimationFrame(() => {
            rendering = false;
            while (effect_queue.length > 0) {
                effect_queue.shift()!();
            }
        });

        return component;
    }

    return {
        initialize,
        dispatch,
        effect,
        effect_promise
    };
}
