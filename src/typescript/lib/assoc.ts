export type Assoc<K, V> = {
    key: K,
    value: V
}

interface AssocListConstructor<K, V, A extends AssocList<K, V>> {
    new (data: Assoc<K, V>[]): A
}

export class AssocList<K, V> {
    ['constructor']: AssocListConstructor<K, V, this>;
    constructor(public data: Assoc<K, V>[]) {}

    key_equals(k1: K, k2: K): boolean {
        return k1 === k2;
    }

    find_index(k: K): number {
        return this.data.findIndex(
            ({key}) => this.key_equals(key, k));
    }

    filter(predicate: (k: K) => boolean) {
        return new (this.constructor)(this.data.filter(
            ({key}) => predicate(key)
        ));
    }

    set(k: K, v: V): this {
        const idx = this.find_index(k);
        const new_data = [...this.data];
        if (idx === -1) {
            new_data.push({ key: k, value: v });
        } else {
            new_data[idx] = { key: new_data[idx].key, value: v };
        }

        return new (this.constructor)(new_data);
    }

    get(k: K): V | undefined {
        const idx = this.find_index(k);
        if (idx === -1) {
            return undefined;
        } else {
            return this.data[idx].value;
        }
    }

    map(f: (v: V, k: K) => V): this {
        const new_data = this.data.map((entry) => ({
            key: entry.key,
            value: f(entry.value, entry.key)
        }));

        return new (this.constructor)(new_data);
    }

    [Symbol.iterator](): IterableIterator<Assoc<K, V>> {
        return this.data[Symbol.iterator]()
    }

    keys() {
        return this.data.map(e => e.key);
    }

    values() {
        return this.data.map(e => e.value);
    }
}

