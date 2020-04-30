interface _LruCache<K, V> {
    has(key: K): boolean;
    get(key: K): V | undefined;
    set(key: K, value: V): void;
}

const DEFAULT_MAX_SIZE = 20;

export class LruCacheObj<K extends object, V> implements _LruCache<K, V> {
    private key_order: K[] = [];
    private map: WeakMap<K, V> = new WeakMap();
    constructor(private max_size: number=DEFAULT_MAX_SIZE) {
    }

    has(key: K) {
        return this.map.has(key);
    }

    get(key: K) {
        if (!this.has(key)) {
            return undefined;
        }
        this.move_to_front(key);
        return this.map.get(key);
    }

    private move_to_front(key: K) {
        const idx = this.key_order.indexOf(key);
        if (idx === -1) {
            throw new Error("Tried to move a key to the front which isn't even there.");
        }
        if (idx !== this.key_order.length - 1) {
            this.key_order.push(...this.key_order.splice(idx, 1));
        }
    }

    set(key: K, value: V) {
        if (!this.has(key)) {
            if (this.key_order.length === this.max_size) {
                const shed_key = this.key_order.shift()!;
                this.map.delete(shed_key);
                // console.count('shed a key in lru');
            }
            this.key_order.push(key);
            this.map.set(key, value);
        } else {
            this.move_to_front(key);
        }
    }
}