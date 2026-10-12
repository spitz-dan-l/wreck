// Veniograph scaffold.
//
// A game is a set of places and actions. Every command the player enters that
// some action handles becomes an event (an action-consequence pair) in the
// history. While recording, the events pile up; when recording stops they are
// sealed into a veniograph, an object the player carries. What a veniograph is
// like (its properties) is computed from its contents by rules you define, and
// verbs you define can require the player to carry a veniograph with a given
// property.

// ---------------------------------------------------------------------------
// Events

export interface Event {
    readonly n: number;                // position in its history, from 0
    readonly command: string;          // what was typed, as typed
    readonly action: string;           // id of the action that handled it
    readonly args: Readonly<Args>;     // slot values the pattern bound
    readonly output: string;           // the consequence, as printed
    readonly place: string;            // where it happened
    readonly actor: string;            // who did it; "you" unless authored
    readonly tags: readonly string[];  // facts about the event, for properties
}

// An event written by hand, for veniographs the player finds or is given
// rather than records.
export interface EventSpec {
    command: string;
    output: string;
    actor?: string;
    place?: string;
    tags?: string[];
}

export type Args = Record<string, string>;

// ---------------------------------------------------------------------------
// Places

export interface PlaceSpec {
    name?: string;
    description: string | ((ctx: Context) => string);
    exits?: Record<string, string>;    // exit word -> place id
    tags?: string[];                   // added to every event that happens here
}

// ---------------------------------------------------------------------------
// Actions and veniograph verbs

// A property id (the veniograph must have a truthy value for it) or a test.
export type Requirement = string | ((v: Veniograph) => boolean);

export interface ActionSpec {
    // Patterns the command must match. Words match themselves; "examine|x"
    // matches either; "{name}" binds one or more words; "{name:veniograph}"
    // binds the name of a carried veniograph; "{name:exit}" binds an exit of
    // the current place. Articles (the, a, an) are ignored everywhere.
    patterns: string | string[];
    id?: string;                       // defaults to the first pattern
    at?: string | string[];            // place ids; omit for everywhere
    when?: (ctx: Context) => boolean;  // extra availability test
    requires?: Requirement;            // see VeniographVerbSpec
    tags?: string[];                   // added to the event
    record?: boolean;                  // false: not an event (e.g. "help")
    run: (ctx: Context, args: Args) => string;
}

// A verb that exists only while the player carries a veniograph meeting
// `requires`. If the pattern has a {..:veniograph} slot, the veniograph named
// there must meet it; otherwise any carried one that meets it enables the
// verb. Either way it is ctx.v inside run().
export interface VeniographVerbSpec extends ActionSpec {
    requires: Requirement;
}

// ---------------------------------------------------------------------------
// Properties

export interface PropertySpec<T = unknown> {
    compute: (v: Veniograph) => T;
    // A line for "It felt:" when remembering, or undefined for none.
    describe?: (value: T, v: Veniograph) => string | undefined;
}

// ---------------------------------------------------------------------------
// Veniographs

export class Veniograph {
    name: string;
    readonly events: readonly Event[];
    readonly recorded: boolean;        // false for authored (found) ones
    private readonly game: Game;

    constructor(game: Game, name: string, events: readonly Event[], recorded: boolean) {
        this.game = game;
        this.name = name;
        this.events = events;
        this.recorded = recorded;
    }

    get length(): number {
        return this.events.length;
    }

    // Content queries, for writing property rules.

    has(tag: string): boolean {
        return this.events.some(e => e.tags.includes(tag));
    }

    count(tag: string): number {
        return this.events.filter(e => e.tags.includes(tag)).length;
    }

    // True if events with these tags occur in this order (not necessarily
    // adjacent), each tag matched by a later event than the one before.
    inOrder(...tags: string[]): boolean {
        let i = 0;
        for (const e of this.events) {
            if (i < tags.length && e.tags.includes(tags[i])) {
                i++;
            }
        }
        return i === tags.length;
    }

    places(): string[] {
        return unique(this.events.map(e => e.place));
    }

    actors(): string[] {
        return unique(this.events.map(e => e.actor));
    }

    commands(): string[] {
        return this.events.map(e => e.command);
    }

    // Case-insensitive search of commands and outputs.
    mentions(text: string): boolean {
        const t = text.toLowerCase();
        return this.events.some(e =>
            e.command.toLowerCase().includes(t) || e.output.toLowerCase().includes(t));
    }

    // Properties.

    prop<T = unknown>(id: string): T {
        return this.game.propertyValue(this, id) as T;
    }

    is(id: string): boolean {
        return Boolean(this.prop(id));
    }

    props(): Record<string, unknown> {
        const result: Record<string, unknown> = {};
        for (const id of this.game.properties.keys()) {
            result[id] = this.prop(id);
        }
        return result;
    }

    feelings(): string[] {
        const lines: string[] = [];
        for (const [id, spec] of this.game.properties) {
            if (spec.describe === undefined) {
                continue;
            }
            const line = spec.describe(this.prop(id), this);
            if (line) {
                lines.push(line);
            }
        }
        return lines;
    }

    meets(req: Requirement): boolean {
        return typeof req === 'string' ? this.is(req) : req(this);
    }

    transcript(): string {
        return this.events.map(e => {
            const who = e.actor === 'you' ? '' : `(${e.actor}) `;
            return `> ${who}${e.command}\n${e.output}`;
        }).join('\n\n');
    }
}

// ---------------------------------------------------------------------------
// The context an action runs in

export class Context {
    readonly game: Game;
    readonly command: string;          // as typed
    // The veniograph in play: the one named in the command, else the one that
    // enabled a veniograph verb.
    readonly v: Veniograph | undefined;
    // Every veniograph the command named, by slot.
    readonly named: Readonly<Record<string, Veniograph>>;
    readonly tags: string[] = [];
    readonly depth: number;

    constructor(game: Game, command: string, v: Veniograph | undefined, named: Record<string, Veniograph>, depth: number) {
        this.game = game;
        this.command = command;
        this.v = v;
        this.named = named;
        this.depth = depth;
    }

    get place(): string {
        return this.game.location;
    }

    get<T = unknown>(flag: string): T | undefined {
        return this.game.flags[flag] as T | undefined;
    }

    set(flag: string, value: unknown = true): void {
        this.game.flags[flag] = value;
    }

    // Add facts to the event this command produces.
    tag(...tags: string[]): void {
        this.tags.push(...tags);
    }

    look(): string {
        return this.game.look();
    }

    move(to: string): string {
        this.game.placeSpec(to);
        this.game.location = to;
        return this.look();
    }

    carrying(): readonly Veniograph[] {
        return this.game.carried;
    }

    give(v: Veniograph): void {
        this.game.give(v);
    }

    takeAway(v: Veniograph): void {
        this.game.takeAway(v);
    }

    // Do again, here and now, everything a veniograph's events did. The
    // consequences are new; they become part of this command's output, and
    // their tags part of its event.
    replay(v: Veniograph): string {
        if (this.depth >= 3) {
            return 'It folds in on itself, and you lose the thread.';
        }
        const parts: string[] = [];
        for (const e of v.events) {
            const r = this.game.execute(e.command, this.depth + 1);
            parts.push(`> ${e.command}\n${r ? r.output : this.game.unknown}`);
            if (r) {
                this.tags.push(...r.tags);
            }
        }
        return parts.join('\n\n');
    }
}

// ---------------------------------------------------------------------------
// The game

interface Action {
    id: string;
    spec: ActionSpec;
    patterns: Token[][];
    builtin: boolean;
}

interface Executed {
    command: string;
    action: string;
    args: Args;
    output: string;
    place: string;
    tags: string[];
    record: boolean;
}

export class Game {
    location: string;
    flags: Record<string, unknown> = {};
    readonly history: Event[] = [];
    readonly carried: Veniograph[] = [];
    readonly places = new Map<string, PlaceSpec>();
    readonly properties = new Map<string, PropertySpec<any>>();
    private readonly actions: Action[] = [];
    private readonly builtins: Action[] = [];
    private recordingFrom: number | null = null;
    private running = false;
    private evaluating = new Map<Veniograph, Set<string>>();
    private untitled = 0;

    unknown = "You can't do that here.";
    // Return a string to refuse to start recording, with that as the reason.
    canRecord: (ctx: Context) => true | string = () => true;

    constructor(options: { start: string }) {
        this.location = options.start;
        addBuiltins(this);
    }

    // --- Authoring -------------------------------------------------------

    addPlace(id: string, spec: PlaceSpec): this {
        this.places.set(id, spec);
        return this;
    }

    addAction(spec: ActionSpec): this {
        this.actions.push(makeAction(spec, false));
        return this;
    }

    addVeniographVerb(spec: VeniographVerbSpec): this {
        return this.addAction(spec);
    }

    // Built-ins are tried after everything you add, so you can override them.
    addBuiltin(spec: ActionSpec): this {
        this.builtins.push(makeAction(spec, true));
        return this;
    }

    // defineProperty('weird', v => v.has('met-guy'), 'a bit weird')
    // defineProperty('tone', { compute: v => ..., describe: t => ... })
    defineProperty<T>(id: string, spec: PropertySpec<T>): this;
    defineProperty(id: string, test: (v: Veniograph) => unknown, feeling?: string): this;
    defineProperty(id: string, spec: PropertySpec<any> | ((v: Veniograph) => unknown), feeling?: string): this {
        if (typeof spec === 'function') {
            spec = {
                compute: spec,
                describe: feeling === undefined ? undefined : value => value ? feeling : undefined,
            };
        }
        this.properties.set(id, spec);
        return this;
    }

    // A veniograph that was never recorded: found, given, overheard.
    makeVeniograph(name: string, events: EventSpec[]): Veniograph {
        return new Veniograph(this, name, events.map((e, n) => ({
            n,
            command: e.command,
            action: 'authored',
            args: {},
            output: e.output,
            place: e.place ?? '',
            actor: e.actor ?? 'you',
            tags: [...(e.place ? [`at:${e.place}`] : []), ...(e.tags ?? [])],
        })), false);
    }

    // --- Recording -------------------------------------------------------

    get recording(): boolean {
        return this.recordingFrom !== null;
    }

    startRecording(): void {
        // Inside a command, the command's own event is not pushed yet, and
        // should not be part of the recording.
        this.recordingFrom = this.history.length + (this.running ? 1 : 0);
    }

    // Seals the events since startRecording() into a carried veniograph.
    // Returns undefined if nothing happened.
    stopRecording(name?: string): Veniograph | undefined {
        if (this.recordingFrom === null) {
            return undefined;
        }
        const events = this.history.slice(this.recordingFrom);
        this.recordingFrom = null;
        if (events.length === 0) {
            return undefined;
        }
        const v = new Veniograph(this, this.freshName(name), events, true);
        this.give(v);
        return v;
    }

    give(v: Veniograph): void {
        if (!this.carried.includes(v)) {
            this.carried.push(v);
        }
    }

    takeAway(v: Veniograph): void {
        const i = this.carried.indexOf(v);
        if (i >= 0) {
            this.carried.splice(i, 1);
        }
    }

    findCarried(name: string): Veniograph | undefined {
        const key = words(name).join(' ');
        return this.carried.find(v => words(v.name).join(' ') === key);
    }

    // --- Playing ---------------------------------------------------------

    run(command: string): string {
        this.running = true;
        let r: Executed | null;
        try {
            r = this.execute(command, 0);
        } finally {
            this.running = false;
        }
        if (r === null) {
            return words(command).length === 0 ? '' : this.unknown;
        }
        if (r.record) {
            this.history.push({
                n: this.history.length,
                command: r.command,
                action: r.action,
                args: r.args,
                output: r.output,
                place: r.place,
                actor: 'you',
                tags: unique(r.tags),
            });
        }
        return r.output;
    }

    look(): string {
        const place = this.placeSpec(this.location);
        const ctx = new Context(this, '', undefined, {}, 0);
        const desc = typeof place.description === 'string' ? place.description : place.description(ctx);
        const exits = Object.keys(place.exits ?? {});
        const lines = [desc];
        if (exits.length > 0) {
            lines.push(`Exits: ${exits.join(', ')}.`);
        }
        if (this.recording) {
            lines.push('(You are recording.)');
        }
        return lines.join('\n');
    }

    // The patterns of every action available right now.
    available(): string[] {
        const result: string[] = [];
        for (const a of this.ordered()) {
            if (!this.placeOk(a.spec)) {
                continue;
            }
            const req = a.spec.requires;
            // Without a named veniograph to check, show a veniograph verb if
            // any carried veniograph would enable it.
            const v = req === undefined ? undefined : this.carried.find(c => c.meets(req));
            if (req !== undefined && v === undefined) {
                continue;
            }
            const ctx = new Context(this, '', v, {}, 0);
            if (a.spec.when && !a.spec.when(ctx)) {
                continue;
            }
            result.push(...asArray(a.spec.patterns));
        }
        return unique(result);
    }

    // Finds and runs the action for a command without adding to the history.
    execute(command: string, depth: number): Executed | null {
        const input = words(command);
        if (input.length === 0) {
            return null;
        }
        const place = this.location;
        for (const a of this.ordered()) {
            if (!this.placeOk(a.spec)) {
                continue;
            }
            for (const pattern of a.patterns) {
                const m = matchPattern(pattern, input, this);
                if (m === null) {
                    continue;
                }
                const v = this.inPlay(a.spec, m);
                if (v === null) {
                    continue;
                }
                const ctx = new Context(this, command, v, m.named, depth);
                if (a.spec.when && !a.spec.when(ctx)) {
                    continue;
                }
                const output = a.spec.run(ctx, m.args);
                return {
                    command: command.trim(),
                    action: a.id,
                    args: m.args,
                    output,
                    place,
                    tags: [
                        `at:${place}`,
                        `did:${a.id}`,
                        ...(this.places.get(place)?.tags ?? []),
                        ...(a.spec.tags ?? []),
                        ...ctx.tags,
                    ],
                    record: a.spec.record !== false,
                };
            }
        }
        return null;
    }

    // --- Internals -------------------------------------------------------

    placeSpec(id: string): PlaceSpec {
        const place = this.places.get(id);
        if (place === undefined) {
            throw new Error(`No place with id "${id}"`);
        }
        return place;
    }

    exits(): Record<string, string> {
        const result: Record<string, string> = {};
        for (const [word, to] of Object.entries(this.places.get(this.location)?.exits ?? {})) {
            result[words(word).join(' ')] = to;
        }
        return result;
    }

    propertyValue(v: Veniograph, id: string): unknown {
        const spec = this.properties.get(id);
        if (spec === undefined) {
            throw new Error(`No veniograph property "${id}"`);
        }
        const busy = this.evaluating.get(v) ?? new Set<string>();
        if (busy.has(id)) {
            throw new Error(`Veniograph property "${id}" depends on itself`);
        }
        busy.add(id);
        this.evaluating.set(v, busy);
        try {
            return spec.compute(v);
        } finally {
            busy.delete(id);
        }
    }

    // Veniograph verbs first, then your actions, then built-ins.
    private ordered(): Action[] {
        return [
            ...this.actions.filter(a => a.spec.requires !== undefined),
            ...this.actions.filter(a => a.spec.requires === undefined),
            ...this.builtins,
        ];
    }

    private placeOk(spec: ActionSpec): boolean {
        return spec.at === undefined || asArray(spec.at).includes(this.location);
    }

    // The veniograph in play for a match: undefined if none is involved,
    // null if the action requires one and none qualifies.
    private inPlay(spec: ActionSpec, m: Match): Veniograph | undefined | null {
        const named = Object.values(m.named)[0];
        const req = spec.requires;
        if (req === undefined) {
            return named;
        }
        if (named !== undefined) {
            return named.meets(req) ? named : null;
        }
        return this.carried.find(c => c.meets(req)) ?? null;
    }

    freshName(name: string | undefined): string {
        let base = name?.trim();
        if (!base) {
            base = `veniograph ${++this.untitled}`;
        }
        let candidate = base;
        for (let i = 2; this.findCarried(candidate); i++) {
            candidate = `${base} ${i}`;
        }
        return candidate;
    }
}

// ---------------------------------------------------------------------------
// Built-in commands

function addBuiltins(game: Game): void {
    game.addBuiltin({
        id: 'look',
        patterns: ['look', 'l'],
        run: ctx => ctx.look(),
    });
    game.addBuiltin({
        id: 'go',
        patterns: ['go {dir:exit}', '{dir:exit}'],
        run: (ctx, args) => ctx.move(ctx.game.exits()[args.dir]),
    });
    game.addBuiltin({
        id: 'inventory',
        patterns: ['inventory', 'i'],
        run: ctx => {
            if (ctx.carrying().length === 0) {
                return "You aren't carrying any veniographs.";
            }
            return 'You are carrying:\n' + ctx.carrying()
                .map(v => `  - ${v.name} (${v.length} event${v.length === 1 ? '' : 's'})`)
                .join('\n');
        },
    });
    game.addBuiltin({
        id: 'remember',
        patterns: ['remember {v:veniograph}', 'read {v:veniograph}'],
        run: ctx => {
            const v = ctx.v!;
            const parts = ['It went like this:\n\n' + indent(v.transcript())];
            const feelings = v.feelings();
            if (feelings.length > 0) {
                parts.push('It felt:\n' + feelings.map(f => `    - ${f}`).join('\n'));
            }
            return parts.join('\n\n');
        },
    });
    game.addBuiltin({
        id: 'start recording',
        patterns: ['start|begin recording', 'record'],
        tags: ['meta'],
        run: ctx => {
            if (ctx.game.recording) {
                return 'You are already recording.';
            }
            const ok = ctx.game.canRecord(ctx);
            if (ok !== true) {
                return ok;
            }
            ctx.game.startRecording();
            return 'You begin recording. What happens now will be kept.';
        },
    });
    game.addBuiltin({
        id: 'stop recording',
        patterns: ['stop recording as {name}', 'stop recording', 'stop'],
        tags: ['meta'],
        run: (ctx, args) => {
            if (!ctx.game.recording) {
                return "You aren't recording.";
            }
            // Keep the name as typed, articles and all.
            const typed = /\bas\s+(.+)$/i.exec(ctx.command.trim());
            const v = ctx.game.stopRecording(typed ? typed[1] : args.name);
            if (v === undefined) {
                return 'You stop recording. Nothing happened, so there is nothing to keep.';
            }
            return `You stop recording. You now carry ${v.name}, a veniograph of ${v.length} event${v.length === 1 ? '' : 's'}.`;
        },
    });
    game.addBuiltin({
        id: 'rename',
        patterns: ['rename {v:veniograph} as|to {name}', 'call {v:veniograph} {name}'],
        run: (ctx, args) => {
            const old = ctx.v!.name;
            ctx.v!.name = ctx.game.freshName(args.name);
            return `${old} is now called ${ctx.v!.name}.`;
        },
    });
    game.addBuiltin({
        id: 'help',
        patterns: ['help', 'verbs'],
        record: false,
        run: ctx => 'You could:\n' + ctx.game.available().map(p => `  ${p}`).join('\n'),
    });
}

// ---------------------------------------------------------------------------
// Patterns

const ARTICLES = new Set(['the', 'a', 'an']);

export function words(text: string): string[] {
    return text
        .toLowerCase()
        .replace(/'/g, '')
        .replace(/[^a-z0-9\s-]/g, ' ')
        .split(/\s+/)
        .filter(w => w !== '' && !ARTICLES.has(w));
}

type SlotType = 'text' | 'veniograph' | 'exit';

type Token =
    | { kind: 'word', options: string[] }
    | { kind: 'slot', name: string, type: SlotType };

interface Match {
    args: Args;
    named: Record<string, Veniograph>;
}

function makeAction(spec: ActionSpec, builtin: boolean): Action {
    const patterns = asArray(spec.patterns);
    if (patterns.length === 0) {
        throw new Error('An action needs at least one pattern');
    }
    const id = spec.id ?? patterns[0].split(/\s+/).map(w => w.split('|')[0]).join(' ');
    return { id, spec, patterns: patterns.map(parsePattern), builtin };
}

function parsePattern(pattern: string): Token[] {
    const tokens: Token[] = [];
    for (const part of pattern.trim().split(/\s+/)) {
        const slot = /^\{(\w+)(?::(\w+))?\}$/.exec(part);
        if (slot) {
            const type = (slot[2] ?? 'text') as SlotType;
            if (!['text', 'veniograph', 'exit'].includes(type)) {
                throw new Error(`Unknown slot type "${type}" in pattern "${pattern}"`);
            }
            tokens.push({ kind: 'slot', name: slot[1], type });
            continue;
        }
        const options = part.split('|').map(o => words(o).join(' ')).filter(o => o !== '');
        if (options.length > 0) {
            tokens.push({ kind: 'word', options });
        }
    }
    return tokens;
}

function matchPattern(tokens: Token[], input: string[], game: Game): Match | null {
    const args: Args = {};
    const named: Record<string, Veniograph> = {};
    const exits = game.exits();

    function go(i: number, j: number): boolean {
        if (i === tokens.length) {
            return j === input.length;
        }
        const t = tokens[i];
        if (t.kind === 'word') {
            return j < input.length && t.options.includes(input[j]) && go(i + 1, j + 1);
        }
        for (let k = j + 1; k <= input.length; k++) {
            const text = input.slice(j, k).join(' ');
            if (t.type === 'veniograph') {
                const v = game.findCarried(text);
                if (v === undefined) {
                    continue;
                }
                named[t.name] = v;
            } else if (t.type === 'exit' && !(text in exits)) {
                continue;
            }
            args[t.name] = text;
            if (go(i + 1, k)) {
                return true;
            }
        }
        delete args[t.name];
        delete named[t.name];
        return false;
    }

    return go(0, 0) ? { args, named } : null;
}

// ---------------------------------------------------------------------------
// Utilities

function asArray<T>(x: T | T[]): T[] {
    return Array.isArray(x) ? x : [x];
}

function unique<T>(xs: T[]): T[] {
    return [...new Set(xs)];
}

function indent(text: string): string {
    return text.split('\n').map(l => l === '' ? '' : '    ' + l).join('\n');
}
