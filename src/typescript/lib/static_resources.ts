import { F } from 'ts-toolbelt';
import { construct_from_keys, keys } from './utils';

type StaticResourceState = 'Uninitialized' | 'Initialized' | 'Sealed';

export const IsSealed: unique symbol = Symbol('IsSealed');
export type IsSealed = typeof IsSealed;

export const Seal: unique symbol = Symbol('Seal');
export type Seal = typeof Seal;

export interface Sealable {
    [IsSealed](): boolean;
    [Seal](): void;
}

function is_sealable(x: any): x is Sealable {
    return (IsSealed in x) && (Seal in x);
}

type OnSealCallback<T> = (x: T) => void;

export class StaticResource<ValueType> implements Sealable {
    kind: 'StaticResource';

    state: StaticResourceState = 'Uninitialized';

    resource_name: string;
    
    value: ValueType;

    on_seal_callbacks: ((v: ValueType) => void)[] = [];

    constructor(resource_name: string) {
        this.resource_name = resource_name;
    }

    assert_state<S extends StaticResourceState>(expected_state: S) {
        if (this.state !== expected_state) {
            throw new Error(`Assert failed: ${this.resource_name} was expected to have state ${expected_state}. Actual state: ${this.state}`);
        }
    }

    [IsSealed]() {
        return this.state === 'Sealed';
    }

    initialize(value: ValueType) {
        this.assert_state('Uninitialized');
        this.value = value;
        this.state = 'Initialized';
    }

    update(f: (v: ValueType) => ValueType) {
        this.assert_state('Initialized');
        this.value = f(this.value);
    }

    [Seal]() {
        this.assert_state('Initialized');

        if (is_sealable(this.value) && !this.value[IsSealed]()) {
            this.value[Seal]();
        }

        this.on_seal_callbacks.forEach(cb => cb(this.value));

        this.state = 'Sealed';
    }

    get(assert_sealed=true): ValueType {
        if (assert_sealed) {
            this.assert_state('Sealed');
        }
        return this.value;
    }

    on_seal(f: (v: ValueType) => void) {
        this.on_seal_callbacks.push(f);
    }
}

export type StaticNameIndex<Name extends keyof any> = { [K in Name]: unknown };

export type NameOf<Index extends StaticNameIndex<any>> = Index extends StaticNameIndex<infer N> ? N : never;

export type StaticNameIndexFor<T extends {}> = { [K in keyof T]: unknown };

export type ResourcesFor<T> = {
    [K in keyof T]: StaticResource<T[K]>
}

export type Mapper<T> = <K extends keyof T>(x: T[K]) => T[K];


export class StaticMap<T extends {}> implements Sealable {
    kind: 'StaticResourceRegistry';

    sealed = false;
    resources: ResourcesFor<T>;
    
    constructor(static_name_index: F.NoInfer<StaticNameIndexFor<T>>, mappers?: Mapper<T>[]);
    constructor(readonly static_name_index: Record<keyof T, null>, readonly mappers: Mapper<T>[]=[]) {
        this.resources = {} as ResourcesFor<T>;
        for (let name of keys(static_name_index)) {
            this.create(name);
        }
    }

    private create<K extends keyof T>(name: K): StaticResource<T[K]> {
        if (this.sealed) {
            throw new Error('Tried to create new resources on a sealed registry.');
        }

        if (name in this.resources) {
            throw new Error('Tried to create resource with duplicate name: '+name);
        }
        let resource = new StaticResource<T[K]>(<string>name);
        this.resources[name] = resource;
        return resource;
    }

    initialize<K extends keyof T>(name: K, value: T[K], ...on_seal_callbacks: OnSealCallback<T[K]>[]): T[K] {
        if (this.sealed) {
            throw new Error('Tried to create new resources on a sealed registry.');
        }

        if (!(name in this.resources)) {
            throw new Error('Tried to initialize uncreated resource: '+name);
        }
        let resource = this.get_resource(name);
        let processed = this.mappers.reduce((acc, f) => f(acc), value);
        resource.initialize(processed);
        
        on_seal_callbacks.forEach(cb => resource.on_seal(cb));
        
        return processed;
    }

    [IsSealed]() {
        return this.sealed;
    }

    [Seal]() {
        if (this[IsSealed]()) {
            throw new Error('Tried to reseal resource registry.');
        }
        this.assert_contents_initialized();

        Object.values(this.resources).forEach((r: StaticResource<any>) => {
            if (!r[IsSealed]()) {
                r[Seal]();
            }
        });

        this.sealed = true;
    }

    assert_contents_initialized() {
        Object.values(this.resources).forEach((r: StaticResource<any>) => {
            r.assert_state('Initialized');
        });
    }

    get<K extends keyof T>(name: K, assert_sealed=true): T[K] {
        if (assert_sealed && !this[IsSealed]()) {
            throw new Error(`Tried to get resource value for ${name} before registry was sealed.`);
        }
        if (this.resources[name] === undefined) {
            throw new Error('Tried to get unrecognized resource: '+name);
        }
        return (this.resources[name] as StaticResource<T[K]>).get()
    }

    get_resource<K extends keyof T>(name: K): StaticResource<T[K]> {
        if (this.resources[name] === undefined) {
            throw new Error('Tried to get unrecognized resource: '+name);
        }
        return (this.resources[name] as StaticResource<T[K]>)
    }

    all(assert_sealed=true): T {
        if (assert_sealed && !this[IsSealed]()) {
            throw new Error('Tried to get all resources before the registry was sealed.');
        }

        return construct_from_keys(keys(this.static_name_index), name => this.get(name, assert_sealed));
    }
}

type ValueMapper<T> = (obj: T) => T;

export class StaticIndex<T> implements Sealable {
    index: T[] = [];
    
    sealed = false;

    constructor(readonly mappers: ValueMapper<T>[]=[]) {
    }

    register_mapper(mapper: ValueMapper<T>) {
        if (this.sealed) {
            throw new Error('Tried to register a mapper after the index was sealed.');
        }

        this.index = this.index.map(mapper);
        this.mappers.push(mapper);
    }

    add(t: T): T {
        if (this.sealed) {
            throw new Error('Tried to add an element after the index was sealed.');
        }
        
        t = this.mappers.reduce((acc, f) => f(acc), t);

        this.index.push(t);
        return t;
    }

    find(f: (obj: T) => boolean, assert_sealed=true): T | undefined {
        if (assert_sealed && !this.sealed) {
            throw new Error('Tried to look up the index before it was sealed.');
        }
        return this.index.find(f);
    }

    all(assert_sealed=true): T[] {
        if (assert_sealed && !this.sealed) {
            throw new Error('Tried to look up the index before it was sealed.');
        }
        return this.index;
    }

    [IsSealed]() {
        return this.sealed;
    }

    [Seal]() {
        if (this[IsSealed]()) {
            throw new Error('Tried to reseal index.');
        }
        this.sealed = true;
    }
}

export class Pool<T, Init extends any[]> {
    private pool: T[] = [];
    private book: boolean[] = [];

    constructor(
        private allocator: () => T,
        private initializer: (t: T, ...params: Init) => void,
    ) {}

    grow(n: number) {
        for (let i = 0; i < n; i++) {
            this.pool.push(this.allocator());
            this.book.push(false);
        }
        return this;
    }

    create(...params: Init) {
        const i = this.book.indexOf(false);
        if (i === -1) {
            throw new Error('Pool ran out of free slots');
        }
        this.book[i] = true;
        
        const result = this.pool[i];
        this.initializer(result, ...params);
        
        return result;
    }

    free(obj: T) {
        const i = this.pool.indexOf(obj);
        if (i === -1) {
            throw new Error('Tried to free something not found in pool.');
        }
        this.book[i] = false;
    }
}
