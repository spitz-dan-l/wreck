/*
    A gist is a small, structured description of what a piece of story is
    "about". Story nodes can carry a gist, which lets the game refer to
    passages of text by their meaning: "your impression of Sam", "Sam's
    demeanor", "Katya's words on scrutiny".

    Gists compose: a gist can have named child gists, and a few plain
    parameters. They are plain data, so they can live inside world state.
*/

export type GistParams = { readonly [name: string]: string | number | boolean };
export type GistChildren = { readonly [name: string]: Gist };

export interface Gist {
    readonly tag: string;
    readonly children?: GistChildren;
    readonly params?: GistParams;
}

export function gist(tag: string, children?: GistChildren, params?: GistParams): Gist {
    const result: { tag: string, children?: GistChildren, params?: GistParams } = { tag };
    if (children !== undefined && Object.keys(children).length > 0) {
        result.children = children;
    }
    if (params !== undefined && Object.keys(params).length > 0) {
        result.params = params;
    }
    return result;
}

// The named child of a gist. Throws if it isn't there.
export function child(g: Gist, name: string): Gist {
    const c = g.children?.[name];
    if (c === undefined) {
        throw new Error(`Gist ${gist_to_string(g)} has no child named ${name}.`);
    }
    return c;
}

// The named parameter of a gist. Throws if it isn't there.
export function param(g: Gist, name: string): string | number | boolean {
    const p = g.params?.[name];
    if (p === undefined) {
        throw new Error(`Gist ${gist_to_string(g)} has no parameter named ${name}.`);
    }
    return p;
}

export function gists_equal(a: Gist | undefined, b: Gist | undefined): boolean {
    if (a === b) {
        return true;
    }
    if (a === undefined || b === undefined) {
        return false;
    }
    if (a.tag !== b.tag) {
        return false;
    }
    const ap = a.params ?? {}, bp = b.params ?? {};
    for (const k of key_union(ap, bp)) {
        if (ap[k] !== bp[k]) {
            return false;
        }
    }
    const ac = a.children ?? {}, bc = b.children ?? {};
    for (const k of key_union(ac, bc)) {
        if (!gists_equal(ac[k], bc[k])) {
            return false;
        }
    }
    return true;
}

// A canonical, readable rendering, e.g. `consider(subject: Sam)` or `action description[action=notes]`.
// Equal gists always render to the same string, so it doubles as a map key.
export function gist_to_string(g: Gist): string {
    let result = g.tag;
    if (g.children !== undefined && Object.keys(g.children).length > 0) {
        const parts = Object.keys(g.children).sort().map(k => `${k}: ${gist_to_string(g.children![k])}`);
        result += `(${parts.join(', ')})`;
    }
    if (g.params !== undefined && Object.keys(g.params).length > 0) {
        const parts = Object.keys(g.params).sort().map(k => `${k}=${String(g.params![k])}`);
        result += `[${parts.join(', ')}]`;
    }
    return result;
}

function key_union(a: object, b: object): string[] {
    return [...new Set([...Object.keys(a), ...Object.keys(b)])];
}

/*
    PATTERNS

    A pattern is plain data (so that it can live inside world state), one of:
      - a partial gist: an object which matches any gist with the same tag (if
        given), whose listed children match the listed child patterns (null
        means "must be absent"), and whose listed parameters have the listed
        values. Unlisted children and parameters are unconstrained.
      - { exact: gist }, matching exactly that gist.
      - { any_of: [patterns] }, matching if any of them match.
*/
export interface GistPatternObject {
    readonly tag?: string;
    readonly children?: { readonly [name: string]: GistPattern | null };
    readonly params?: GistParams;
}

export type GistPattern =
    | GistPatternObject
    | { readonly exact: Gist }
    | { readonly any_of: readonly GistPattern[] };

export function match(g: Gist | undefined, pattern: GistPattern): boolean {
    if (g === undefined) {
        return false;
    }
    if ('exact' in pattern) {
        return gists_equal(g, pattern.exact);
    }
    if ('any_of' in pattern) {
        return pattern.any_of.some(p => match(g, p));
    }
    if (pattern.tag !== undefined && pattern.tag !== g.tag) {
        return false;
    }
    if (pattern.params !== undefined) {
        for (const [k, v] of Object.entries(pattern.params)) {
            if (g.params?.[k] !== v) {
                return false;
            }
        }
    }
    if (pattern.children !== undefined) {
        for (const [k, p] of Object.entries(pattern.children)) {
            const c = g.children?.[k];
            if (p === null) {
                if (c !== undefined) {
                    return false;
                }
            } else if (!match(c, p)) {
                return false;
            }
        }
    }
    return true;
}

// Matches exactly this gist, no more and no less.
export function exact(g: Gist): GistPattern {
    return { exact: g };
}

// Matches if any of the patterns match.
export function any_of(...patterns: GistPattern[]): GistPattern {
    return { any_of: patterns };
}

/*
    An immutable map keyed by gist (by value, not identity).
*/
export class GistMap<V> {
    private constructor(private readonly entries_: ReadonlyMap<string, { key: Gist, value: V }>) {}

    static empty<V>(): GistMap<V> {
        return new GistMap<V>(new Map());
    }

    static of<V>(...entries: [Gist, V][]): GistMap<V> {
        return GistMap.empty<V>().set_many(entries);
    }

    get(g: Gist): V | undefined {
        return this.entries_.get(gist_to_string(g))?.value;
    }

    has(g: Gist): boolean {
        return this.entries_.has(gist_to_string(g));
    }

    set(g: Gist, value: V): GistMap<V> {
        return this.set_many([[g, value]]);
    }

    set_many(entries: [Gist, V][]): GistMap<V> {
        const m = new Map(this.entries_);
        for (const [key, value] of entries) {
            m.set(gist_to_string(key), { key, value });
        }
        return new GistMap(m);
    }

    delete(g: Gist): GistMap<V> {
        const m = new Map(this.entries_);
        m.delete(gist_to_string(g));
        return new GistMap(m);
    }

    keys(): Gist[] {
        return [...this.entries_.values()].map(e => e.key);
    }

    entries(): [Gist, V][] {
        return [...this.entries_.values()].map(e => [e.key, e.value]);
    }

    size(): number {
        return this.entries_.size;
    }
}

/*
    DISPATCH

    A list of (pattern, implementation) rules. Rules are ordered by stage
    (lowest first) and, within a stage, most recently added first.

    find_all() returns every matching rule; if a fallthrough stage is given,
    rules at or after that stage are only consulted when nothing earlier
    matched, and only the first of them is taken. That gives "default
    behavior" rules.
*/
export type DispatchRule<V> = {
    pattern: GistPattern,
    impl: (g: Gist) => V,
    stage: number
};

export class GistDispatcher<V> {
    private rules: DispatchRule<V>[] = [];

    add(pattern: GistPattern, impl: (g: Gist) => V, stage: number = 0): void {
        const idx = this.rules.findIndex(r => r.stage >= stage);
        const rule = { pattern, impl, stage };
        if (idx === -1) {
            this.rules.push(rule);
        } else {
            this.rules.splice(idx, 0, rule);
        }
    }

    find(g: Gist): ((g: Gist) => V) | undefined {
        return this.rules.find(r => match(g, r.pattern))?.impl;
    }

    find_all(g: Gist, fallthrough_stage?: number): ((g: Gist) => V)[] {
        const result: ((g: Gist) => V)[] = [];
        for (const rule of this.rules) {
            const is_fallthrough = fallthrough_stage !== undefined && rule.stage >= fallthrough_stage;
            if (is_fallthrough && result.length > 0) {
                break;
            }
            if (match(g, rule.pattern)) {
                result.push(rule.impl);
                if (is_fallthrough) {
                    break;
                }
            }
        }
        return result;
    }

    dispatch(g: Gist): V {
        const impl = this.find(g);
        if (impl === undefined) {
            throw new Error('No rule matched the gist ' + gist_to_string(g));
        }
        return impl(g);
    }

    dispatch_all(g: Gist, fallthrough_stage?: number): V[] {
        return this.find_all(g, fallthrough_stage).map(impl => impl(g));
    }
}

// A dispatcher whose rules are updaters of some value, applied in sequence.
export class GistUpdateDispatcher<T> extends GistDispatcher<(t: T) => T> {
    apply_all(g: Gist, t: T, fallthrough_stage?: number): T {
        return this.dispatch_all(g, fallthrough_stage).reduce((acc, f) => f(acc), t);
    }
}
