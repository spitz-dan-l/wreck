/**
 * TODO: Add Links to components, so that
 *  - Don't need to keep getter logic in sync with structure changes
 *  - When a component gets re-rendered, any links will auto update to the new version?
 */


export type Props = {};

export type BaseProps = { children?: (HTMLElement | Text)[] };

export type Renderer<P extends Props> = (props: P & BaseProps, old?: {old_props: P & BaseProps, old_root: Component<P>}) => Component<P>;
export type RendererFor<Comp> = Comp extends Component<infer P> ? Renderer<P> : never;

export interface Component<P extends Props> extends HTMLElement {
    __component_brand: P
}

export type ComponentFor<Rend> = Rend extends Renderer<infer P> ? Component<P> : never;
export type Getter<Root extends Component<Props>, E extends HTMLElement> = (root: Root) => E;
export type PropsFor<Comp> = Comp extends Component<infer P> ? P & BaseProps : never;

export type PropMapper<
    Comp1 extends Component<Props>,
    Comp2 extends Component<Props>
> = (props: PropsFor<Comp1>) => PropsFor<Comp2>;

export function update_component<P extends Props>(renderer: Renderer<P>, props: P & BaseProps, old: { old_props: P & BaseProps, old_root: Component<P>}) {
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
    return (props: P1 & BaseProps, old?: { old_props: P1 & BaseProps, old_root: Component<P1>}) => {
        if (!old) {
            return renderer(prop_mapper(props));
        }

        const old_child_root = getter(old.old_root);
        if (!old_child_root){
            console.warn('old child root may have disappeared. Check your getter logic.');
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
    effect: (f: () => void) => void,
    effect_promise: () => Promise<void>
}

import {GlobalDevTools, GLOBAL_DEV_TOOLS} from "devtools";

declare module 'devtools' {
    interface GlobalDevTools {
        ui_state?: unknown;
    }
}

export function make_ui<State, Action>(
    renderer: Renderer<State>,
    reducer: (state: State, action: Action) => State,
    debug: boolean=false
): UI<State, Action> {
    let old_state: State | undefined = undefined;
    let component: Component<State>;

    let rendering = false;

    function initialize(initial_state: State) {
        if (component !== undefined) {
            throw new Error('multiple calls to initialize().');
        }
        old_state = initial_state;
        return render();
    }

    let render_task: number | undefined = undefined;
    
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

    function render() {
        // console.time('render');
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
            component = update_component(
                renderer,
                new_state,
                {
                    old_props: old_state,
                    old_root: component
                }
            );
            old_state = new_state;
            // for debugging
            if (debug) {
                GLOBAL_DEV_TOOLS.ui_state = old_state;
            }
        }
        
        requestAnimationFrame(() => {
            // console.time('effects');
            rendering = false;
            while (effect_queue.length > 0) {
                effect_queue.shift()!();
            }
            // console.timeEnd('effects');
        });
        // console.timeEnd('render');

        return component;
    }

    return {
        initialize,
        dispatch,
        effect,
        effect_promise
    };
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
