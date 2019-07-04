import { map_values } from './utils';

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

export type ResourcesFor<T> = {
    [K in keyof T]?: StaticResource<T[K]>
}

export class StaticResourceRegistry<T extends {}> {
    kind: 'StaticResourceRegistry';

    sealed = false;
    resources: ResourcesFor<T> = {};

    create<K extends keyof T>(name: K, value?: T[K]): StaticResource<T[K]> {
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

    seal() {
        if (this.sealed) {
            throw new Error('Tried to reseal resource registry.');
        }
        this.assert_initialized();

        Object.values(this.resources).forEach((r: StaticResource<any>) => {
            let value = r.get();
            if ((value instanceof StaticIndex) && !value.sealed) {
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
}

type Finalizer<T> = (obj: T) => T;

export class StaticIndex<Obj> {
    private index: Obj[] = [];
    
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
        
        if (this.finalizers === undefined) {
            debugger;
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

