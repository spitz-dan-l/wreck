export const TagName: unique symbol = Symbol();
export type TagName = typeof TagName;

type ADTSpec = {
    [K in string]: object;
} & {
    [TagName]: string
};

type DropTag<Spec extends ADTSpec> = Omit<Spec, TagName>;

type ADTTypeErrors<Spec extends ADTSpec> =
    string extends Spec[TagName] ?
        ['Invalid TagName. Must be a string literal, got', Spec[TagName]] :
        DropTag<Spec> extends infer S ?
            { [K in keyof S]:
                S[K] extends { [T in Spec[TagName]]: any } ?
                    ['Invalid spec for', K, 'has a', Spec[TagName], 'property.'] :
                    never
            }[keyof S] :
            never;

type ADTValues<Spec extends ADTSpec> =
    DropTag<Spec> extends infer S ?
        { [K in keyof S]:
            K extends TagName ? never :
            { [T in Spec[TagName]]: K } & S[K]
        }[keyof S] :
        never;

export type ADT<Spec extends ADTSpec> = 
    ADTTypeErrors<Spec> extends infer Errors ?
    
    [Errors] extends [never] ?
        ADTValues<Spec> :
        { __TypeError: Errors } :    
    never;

type OptionalArg<T> =
    object extends T ? T | void : T;

type ADTConstructors<Spec extends ADTSpec> = 
    DropTag<Spec> extends infer S ?
        { [K in keyof S]:
            (data: OptionalArg<S[K]>) => ADT<Spec>
        } :
        never;

export function make_adt<Spec extends ADTSpec>(
    tag_name: Spec[TagName],
    check: ADTTypeErrors<Spec> extends never ? null : ADTTypeErrors<Spec>
): ADTConstructors<Spec> {
    return new Proxy({} as ADTConstructors<Spec>, {
        get: <K extends keyof Spec>(x: unknown, tag: K) =>
            (props: OptionalArg<Spec[K]>) =>
                ({ [tag_name]: tag, ...props }) as unknown as ADT<Spec>
    });
}


const ctors = make_adt<{
    [TagName]: 'kind',
    horse: {},
    horse2: {legs?: number}
}>('kind', null);