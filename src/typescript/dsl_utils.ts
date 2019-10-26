import {A, C, F} from 'ts-toolbelt';
import { Updater, lazy_map_values } from './utils';
import { update } from './update';
import { Context } from 'mocha';

// Structural types (to be extended in the rest of the types)
export type Func = (...args: unknown[]) => unknown;

export type DomainMappedFunction<Keys extends keyof any> = {
    [K in Keys]: Func
}

export type DMFParameters<Keys extends keyof any> = {
    [K in Keys]: Parameters<Func>
}

export type DMFReturnType<Keys extends keyof any> = {
    [K in Keys]: ReturnType<Func>
}

export type DMFConstituents<Keys extends keyof any> = {
    [K in Keys]: {
        'Parameters': Parameters<Func>
        'ReturnType': ReturnType<Func>
    }
}



export type ParametersFor<Funcs extends DomainMappedFunction<keyof Funcs>> = A.Try<{
    [K in keyof Funcs]: Parameters<Funcs[K]>
}, DMFParameters<keyof Funcs>>;

export type ReturnTypesFor<Funcs extends DomainMappedFunction<keyof Funcs>> = A.Try<{
    [K in keyof Funcs]: ReturnType<Funcs[K]>
}, DMFReturnType<keyof Funcs>>;

export type ConstituentsFor<DMF extends DomainMappedFunction<any>> = A.Try<{
    [K in keyof DMF]: {
        'Parameters': Parameters<DMF[K]>,
        'ReturnType': ReturnType<DMF[K]>
    }
}, DMFConstituents<keyof DMF>>;

export type ConstructDMF<C extends DMFConstituents<any>> = A.Try<{
    [K in keyof C]: (...params: C[K]['Parameters']) => C[K]['ReturnType']
}, DomainMappedFunction<keyof C>>;

export type ReplaceReturn<Funcs extends DomainMappedFunction<keyof Funcs>, Out> = A.Try<ConstructDMF<{
    [K in keyof ConstituentsFor<Funcs>]: {
        'Parameters': ConstituentsFor<Funcs>[K]['Parameters'],
        'ReturnType': Out
    }
}>, DomainMappedFunction<keyof Funcs>>;

export type DSLPropImpl<Funcs extends DomainMappedFunction<keyof Funcs>> =
    <K extends keyof Funcs>(k: K) => (...params: ParametersFor<Funcs>[K]) => ReturnTypesFor<Funcs>[K];

export type DSLCall<Funcs extends Func> = (...params: Parameters<Funcs>) => ReturnType<Funcs>;

export type DSLProps<Funcs extends DomainMappedFunction<keyof Funcs>> = {
    readonly [K in keyof Funcs]: Funcs[K]//(...params: Parameters<Funcs[K]>) => ReturnType<Funcs[K]>;
}

export type DSL<Funcs extends DomainMappedFunction<keyof Funcs>> =
    Funcs extends Func
        ? DSLProps<Funcs> & DSLCall<Funcs>
        : DSLProps<Funcs>;

export function make_dsl<Funcs extends (DomainMappedFunction<keyof Funcs>) & Func>(prop_builder: DSLPropImpl<Funcs>, call_builder: DSLCall<Funcs>): DSL<Funcs>;
export function make_dsl<Funcs extends DomainMappedFunction<keyof Funcs>>(prop_builder: DSLPropImpl<Funcs>): DSLProps<Funcs>;
export function make_dsl<Funcs extends DomainMappedFunction<keyof Funcs>>(prop_builder: DSLPropImpl<Funcs>, call_builder?: any): DSLProps<Funcs> {
    const handlers: ProxyHandler<DSLProps<Funcs>> = {
        get: <K extends keyof Funcs>(a: unknown, name: K) =>
            prop_builder(name)
    };

    if (call_builder !== undefined) {
        handlers.apply = (target, t, args) => call_builder(...args)
    }
    return new Proxy({} as DSLProps<Funcs>, handlers);
}


// Contextual functions. Lets us mix pure functional style with a nonlocal context determined by the call stack

export type ContextualFunction<Context, F extends Func> =
    & ((...params: Parameters<F>) => ReturnType<F>)
    & {
        __brand: 'ContextualFunction',
        with_context?: (new_initial_context: Context) => ContextualFunction<Context, F>
    };

export type ContextOf<CF extends ContextualFunction<any, any>> = CF extends ContextualFunction<infer C, any> ? C : never;

// Typescript doesn't seem to support symbols as object keys in this way.
// But it's the fastest way to do it so we're doing it.
const CONTEXT_MAP = {} as Record<any, unknown>;

// export function contextual_function<Context>(init_context?: Context) {
//     return <F extends Func>(decl: (get_context: () => Context) => F) => {
//         const with_context = ((init_context: Context | undefined): ContextualFunction<Context, F> => {
//             if (init_context === undefined) {
//                 throw new Error('Contextual Function was invoked without binding it to a context.');
//             }
//             let key: symbol;

//             function set_context(c: Context, pre_init=false) {
//                 if (!pre_init && !Object.getOwnPropertySymbols(CONTEXT_MAP).includes(key)) {
//                     throw new Error('Funny business detected. Called set_context outside the call of the contextual function.');
//                 }
//                 CONTEXT_MAP[key as any] = c;
//                 return c;
//             }

//             function get_context(): Context {
//                 if (!Object.getOwnPropertySymbols(CONTEXT_MAP).includes(key)) {
//                     throw new Error('Funny business detected. Called get_context outside the call of the contextual function.');
//                 }
//                 return CONTEXT_MAP[key as any] as Context;
//             }

//             const contextual_function = ((...params: Parameters<F>) => {
//                 key = Symbol();
//                 set_context(init_context, true);
                
//                 const f = decl(get_context);
                
//                 const result = f(...params) as ReturnType<F>;
//                 // const context = CONTEXT_MAP[key as any] as Context | undefined;
//                 delete CONTEXT_MAP[key as any];
//                 return result;
//             }) as ContextualFunction<Context, F>;
//             contextual_function.with_context = with_context;
//             return contextual_function;
//         });
//         return with_context(init_context);
//     }
// } 
export function contextual_function<Context, F extends Func>(decl: (get_context: () => Context) => F, init_context?: Context) {
    const with_context = ((init_context: Context | undefined): ContextualFunction<Context, F> => {
        if (init_context === undefined) {
            throw new Error('Contextual Function was invoked without binding it to a context.');
        }
        let key: symbol;

        function set_context(c: Context, pre_init=false) {
            if (!pre_init && !Object.getOwnPropertySymbols(CONTEXT_MAP).includes(key)) {
                throw new Error('Funny business detected. Called set_context outside the call of the contextual function.');
            }
            CONTEXT_MAP[key as any] = c;
            return c;
        }

        function get_context(): Context {
            if (!Object.getOwnPropertySymbols(CONTEXT_MAP).includes(key)) {
                throw new Error('Funny business detected. Called get_context outside the call of the contextual function.');
            }
            return CONTEXT_MAP[key as any] as Context;
        }

        const contextual_function = ((...params: Parameters<F>) => {
            key = Symbol();
            set_context(init_context, true);
            
            const f = decl(get_context);
            
            const result = f(...params) as ReturnType<F>;
            // const context = CONTEXT_MAP[key as any] as Context | undefined;
            delete CONTEXT_MAP[key as any];
            return result;
        }) as ContextualFunction<Context, F>;
        contextual_function.with_context = with_context;
        return contextual_function;
    });
    return with_context(init_context);
}

function is_contextual_function<CF extends ContextualFunction<any, any>>(cf: CF): cf is CF & { with_context: NonNullable<CF['with_context']>}  {
    return (cf as any).with_context !== undefined;
}


export function with_context<Context, F extends Func>(cf: ContextualFunction<Context, F>, new_context: F.NoInfer<Context>): ContextualFunction<Context, F> {
    if (is_contextual_function(cf)) {
        return cf.with_context(new_context);
    }
    return cf;
    
}

export function bind<Context, F extends Func, R>(cf: ContextualFunction<Context, F>, f2: (cf: ContextualFunction<Context, F>) => R) {
    return contextual_function((ctx: () => Context) => () => {
        return f2(with_context(cf, ctx()));
    });
}

export function bind_all<Context, F extends Func, CFs extends Record<string, ContextualFunction<Context, F>>, R>(cfs: CFs, f2: (cfs: CFs) => R) {
    return contextual_function((ctx: () => Context) => () => {
        const c = ctx();
        const bound_cfs = lazy_map_values(cfs, (cf) => with_context(cf, c) as any);
        return f2(bound_cfs);
    });
}
