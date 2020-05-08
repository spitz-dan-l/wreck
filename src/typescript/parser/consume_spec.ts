import { array_last, drop_keys } from "lib/utils";
import { split_tokens } from "lib/text_utils";

export const SUBMIT = Symbol('SUBMIT');
export type SUBMIT = typeof SUBMIT;
export type Token = string | SUBMIT;

export const NEVER_TOKEN = Symbol('NEVER');
export type TaintedToken = Token | typeof NEVER_TOKEN;

export type TokenAvailability =
    'Available' | 'Used' | 'Locked';

export const AVAILABILITY_ORDER = {
    'Available': 0,
    'Used': 1,
    'Locked': 2
} as const

export type TokenLabels = {
    [label: string]: boolean
};

export type RawConsumeSpec = {
    kind: 'RawConsumeSpec';
    token: Token;
    availability: TokenAvailability;
    labels: TokenLabels;
}

export type TaintedRawConsumeSpec = Omit<RawConsumeSpec, 'token'> & {
    token: TaintedToken;
}

export const GAP: unique symbol = Symbol('GAP');
export type GAP = typeof GAP;

export type ConsumeSpec =
    string |
    SUBMIT |
    ConsumeSpecObj |
    ConsumeSpecArray;

type ConsumeSpecArray = (ConsumeSpec | GAP)[];

type ConsumeSpecObj = {
    tokens: ConsumeSpec,
    labels?: TokenLabels,
    used?: boolean,
    locked?: boolean
};

export type ConsumeSpecOverrides = Omit<ConsumeSpecObj, 'tokens'>;

export function process_consume_spec(spec: ConsumeSpec, overrides?: ConsumeSpecOverrides): RawConsumeSpec[][] {
    if (spec instanceof Array) {
        return process_array(spec, overrides);
    } else if (typeof(spec) === 'object') {
        return process_object(spec, overrides);
    } else if (spec === SUBMIT) {
        return [[{
            kind: 'RawConsumeSpec',
            token: SUBMIT,
            labels: {},
            availability: 'Available'
        }]];
    } else { // if (typeof(spec) === 'string') {
        return process_string(spec, overrides);
    }
}

function process_array(spec: ConsumeSpecArray, overrides?: ConsumeSpecOverrides): RawConsumeSpec[][] {
    if (spec.length === 0) {
        throw new Error('Received an empty ConsumeSpec array.');
    }

    const result: RawConsumeSpec[][] = [];
    let current_chunk: RawConsumeSpec[] = [];

    function is_submit(chunk: RawConsumeSpec[]) {
        return array_last(chunk)?.token === SUBMIT;
    }

    for (const s of spec) {
        if (is_submit(current_chunk)) {
            throw new Error('Invalid SUBMIT_TOKEN placement in ConsumeSpec. Must only occur at the end.');
        }
        
        if (s === GAP) {
            if (current_chunk.length === 0) {
                throw new Error('Invalid GAP_TOKEN placement in ConsumeSpec. No LHS found for the gap to apply to.');
            } else {
                result.push(current_chunk);
                current_chunk = [];
            }
        } else {
            const next_chunks = process_consume_spec(s, overrides);
            const c = next_chunks.shift()!;
            if (is_submit(c)) {
                result.push(current_chunk);
                current_chunk = c;
            } else {
                current_chunk.push(...c);
                if (next_chunks.length > 0) {
                    result.push(current_chunk, ...next_chunks.slice(0, -1));
                    current_chunk = [...next_chunks.pop()!];
                }
            }
        }
    }
    if (current_chunk.length === 0) {
        throw new Error('Invalid GAP_TOKEN placement in ConsumeSpec. No RHS found for the gap to apply to.');
    } else {
        result.push(current_chunk);
    }
    return result;
}

function process_object(spec: ConsumeSpecObj, overrides?: ConsumeSpecOverrides): RawConsumeSpec[][] {
    const spec_: ConsumeSpecObj = {...spec};

    if (overrides) {
        if (overrides.used !== undefined) {
            spec_.used = overrides.used;
        }
        if (overrides.locked !== undefined) {
            spec_.locked = overrides.locked
        }

        if (overrides.labels) {
            spec_.labels = {...spec.labels, ...overrides.labels};
        }
    }

    return process_consume_spec(spec.tokens, drop_keys(spec_, 'tokens'))
}

function process_string(spec: string, overrides?: ConsumeSpecOverrides): RawConsumeSpec[][] {
    const chunks = split_tokens(spec);
    if (chunks.length === 0) {
        throw new Error('Invalid string in ConsumeSpec - string was empty or all whitespace');
    }

    let labels: TokenLabels = overrides?.labels ?? {};
    let availability: TokenAvailability = 'Available';
        
    if (overrides?.used) {
        availability = 'Used';
    }

    if (overrides?.locked) {
        availability = 'Locked'
    }

    return chunks.map(chunk => {
        const tokens = chunk.split('_');
        if (tokens.some(t => t === '')) {
            throw new Error('Invalid string in ConsumeSpec. String contained an underscore without a valid LHS or RHS: ' +chunk);
        }
        return tokens.map(t => ({
            kind: 'RawConsumeSpec',
            token: t,
            availability,
            labels
        }));
    });
}