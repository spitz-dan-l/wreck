import { map_values, from_entries, construct_from_keys, keys } from './utils';

export class StaticResource<ValueType> {
    kind: 'StaticResource';

    initialized = false;

    resource_name: string;
    value: ValueType;

    constructor(resource_name: string, value?: ValueType) {
        this.resource_name = resource_name;

        if (value !== undefined) {
            this.initialized = true;
            this.value = value;
        }
    }

    initialize(value: ValueType) {
        if (this.initialized) {
            throw new Error('Tried to reinitialize '+this.resource_name);
        }
        this.value = value;
        this.initialized = true;
    }

    get() {
        if (!this.initialized) {
            throw new Error('Tried to get uninitialized resource '+this.resource_name);
        }
        return this.value;
    }

    assert_initialized() {
        if (!this.initialized) {
            throw new Error(`Assert failed: ${this.resource_name} not initialized.`);
        }
    }
}

export type StaticNameIndex = readonly string[] & { readonly 0: string };

export type NameOf<N extends StaticNameIndex> = N[number];

export type StaticNameIndexFor<T extends {}> = {
    [K in keyof T]: null
};

export function static_names<T extends {}>(...names: (keyof StaticNameIndexFor<T>)[]): StaticNameIndexFor<T> {
    return null as any;
}

export type ResourcesFor<T> = {
    [K in keyof T]: StaticResource<T[K]>
}

export type Mapper<T> = <K extends keyof T>(x: T[K]) => T[K];

export class StaticMap<T extends {}> {
    kind: 'StaticResourceRegistry';

    sealed = false;
    resources: ResourcesFor<T>;
    
    constructor(static_name_index: StaticNameIndexFor<T>, mappers?: Mapper<T>[]);
    constructor(readonly static_name_index: Record<keyof T, null>, readonly mappers: Mapper<T>[]=[]) {
        this.resources = {} as ResourcesFor<T>;
        for (let name of keys(static_name_index)) {
            this.create(name);
        }
    }

    private create<K extends keyof T>(name: K, value?: T[K]): StaticResource<T[K]> {
        if (this.sealed) {
            throw new Error('Tried to create new resources on a sealed registry.');
        }

        if (name in this.resources) {
            throw new Error('Tried to create resource with duplicate name: '+name);
        }
        let resource = new StaticResource(<string>name, value);
        this.resources[name] = resource;
        return resource;
    }

    register_mapper(mapper: Mapper<T>) {
        if (this.sealed) {
            throw new Error('Tried to register a mapper after the map was sealed.');
        }

        for (const name of keys(this.static_name_index)) {
            const resource = this.resources[name]
            if (!resource.initialized) {
                continue;
            }

            const value = resource.get();
            resource.value = mapper(value);
        }

        this.mappers.push(mapper);
    }

    initialize<K extends keyof T>(name: K, value: T[K]): T[K] {
        if (this.sealed) {
            throw new Error('Tried to create new resources on a sealed registry.');
        }

        if (!(name in this.resources)) {
            throw new Error('Tried to initialize uncreated resource: '+name);
        }
        let resource = this.get_resource(name);
        let processed = this.mappers.reduce((acc, f) => f(acc), value);
        resource.initialize(processed);//value);
        return processed;//value;
    }

    seal() {
        if (this.sealed) {
            throw new Error('Tried to reseal resource registry.');
        }
        this.assert_initialized();

        Object.values(this.resources).forEach((r: StaticResource<any>) => {
            let value = r.get();
            if ((value instanceof StaticMap || value instanceof StaticIndex) && !value.sealed) {
                value.seal();
            }
        });

        this.sealed = true;
    }

    assert_initialized() {
        Object.values(this.resources).forEach((r: StaticResource<any>) => {
            r.assert_initialized();
        });
    }

    get<K extends keyof T>(name: K, assert_sealed=true): T[K] {
        if (assert_sealed && !this.sealed) {
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
        if (assert_sealed && !this.sealed) {
            throw new Error('Tried to get all resources before the registry was sealed.');
        }

        return construct_from_keys(keys(this.static_name_index), name => this.get(name, assert_sealed));
    }
}

type ValueMapper<T> = (obj: T) => T;

export class StaticIndex<T> {
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

    seal() {
        if (this.sealed) {
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
