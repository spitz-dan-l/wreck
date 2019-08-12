import { map_values, from_entries, construct_from_keys } from './utils';

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

import {U, A, T} from 'ts-toolbelt';

type ReadOnly<T> = {
    +readonly [K in keyof T]: T[K]
}
export type StaticNameIndexFor<T extends {}> = Readonly<U.TupleOf<keyof T>>;

export type ResourcesFor<T> = {
    [K in keyof T]?: StaticResource<T[K]>
}

export class StaticResourceRegistry<T extends {}> {
    readonly kind: 'StaticResourceRegistry';

    sealed = false;
    readonly resources: ResourcesFor<T> = {};
    
    constructor(static_name_index: StaticNameIndexFor<T>, mappers?: (<K extends keyof T>(x: T[K]) => T[K])[]);
    constructor(readonly static_name_index: readonly (keyof T)[], readonly mappers: (<K extends keyof T>(x: T[K]) => T[K])[]=[]) {
        for (let name of static_name_index) {
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
            if ((value instanceof StaticResourceRegistry || value instanceof StaticIndex) && !value.sealed) {
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

        return construct_from_keys(this.static_name_index, name => this.get(name, assert_sealed));
    }
}

type Finalizer<T> = (obj: T) => T;

export class StaticIndex<Obj> {
    public index: Obj[] = [];
    
    finalizers: Finalizer<Obj>[];

    sealed = false;

    constructor(finalizers?: Finalizer<Obj>[]) {
        if (finalizers !== undefined) {
            this.finalizers = finalizers;
        } else {
            this.finalizers = [];
        }
    }

    register_finalizer(finalizer: Finalizer<Obj>) {
        if (this.sealed) {
            throw new Error('Tried to register a finalizer after the index was sealed.');
        }

        this.index = this.index.map(finalizer);
        this.finalizers.push(finalizer);
    }    

    add(t: Obj): Obj {
        if (this.sealed) {
            throw new Error('Tried to add an element after the index was sealed.');
        }
        
        t = this.finalizers.reduce((acc, f) => f(acc), t);

        this.index.push(t);
        return t;
    }

    find(f: (obj: Obj) => boolean, assert_sealed=true): Obj | undefined {
        if (assert_sealed && !this.sealed) {
            throw new Error('Tried to look up the index before it was sealed.');
        }
        return this.index.find(f);
    }

    all(assert_sealed=true): Obj[] {
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
