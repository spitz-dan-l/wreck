export type Func = (...args: any) => unknown;

export type DomainMappedFunction<Keys extends keyof any> = {
    [K in Keys]: Func
}

export type DomainMappedParameters<Keys extends keyof any> = {
    [K in Keys]: Parameters<Func>
}

export type DomainMappedReturnType<Keys extends keyof any> = {
    [K in Keys]: ReturnType<Func>
}

export type DMFConstituents<Keys extends keyof any> = {
    [K in Keys]: {
        'Parameters': Parameters<Func> //DomainMappedParameters<Keys>[K],
        'ReturnType': ReturnType<Func> //DomainMappedReturnType<Keys>[K]
    }
}

export type ParametersFor<Funcs extends DomainMappedFunction<keyof Funcs>> = {
    [K in keyof Funcs]: Parameters<Funcs[K]>
};
export type ReturnTypesFor<Funcs extends DomainMappedFunction<keyof Funcs>> = {
    [K in keyof Funcs]: ReturnType<Funcs[K]>
};

export type ConstituentsFor<DMF extends DomainMappedFunction<any>> = {
    [K in keyof DMF]: {
        'Parameters': Parameters<DMF[K]>,
        'ReturnType': ReturnType<DMF[K]>
    }
}

export type ConstructDMF<C extends DMFConstituents<any>> = {
    [K in keyof C]: (...params: C[K]['Parameters']) => C[K]['ReturnType']
}

export type ReplaceReturn<Funcs extends DomainMappedFunction<keyof Funcs>, Out> = ConstructDMF<{
    [K in keyof ConstituentsFor<Funcs>]: {
        'Parameters': ConstituentsFor<Funcs>[K]['Parameters'],
        'ReturnType': Out
    }
}>

export type DSLPropImpl<Funcs extends DomainMappedFunction<keyof Funcs>> =
    <K extends keyof Funcs>(k: K) => (...params: ParametersFor<Funcs>[K]) => ReturnTypesFor<Funcs>[K];

export type DSLCall<Funcs extends Func> = (...params: Parameters<Funcs>) => ReturnType<Funcs>;

export type DSLProps<Funcs extends DomainMappedFunction<keyof Funcs>> = {
    readonly [K in keyof Funcs]: (...params: Parameters<Funcs[K]>) => ReturnType<Funcs[K]>;
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