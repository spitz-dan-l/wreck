/*

    This module provides the highest level abstractions about game state and history.
    TODO: rename from commands to world?

    It defines what comprises the game state, including
        user input
        parse results
        current world state
        current world message
        past world states/messages
        history interpretation tags

    Notable concerns:
        All game state has to be serializable (for save/load)
            Meaning, functions/closures either can't be part of the state, or we need to define a serialization protocol for them
        Infinite undo (so all previous states must be saved at all time)



*/

import {
    array_last,
    update,
    Updater
} from './datatypes';

import {
    raw,
    RawInput,
    Parser,
    ParseResult,
    Parsing
} from './parser2';

import * as assert from 'assert';

// TODO: We probably want a data structure for this
// Question is how DOM-like will it wind up being and should we just use the DOM
type Message = string;

type InterpretationLabel = string;
type InterpretationOp =
    { kind: 'Add', label: InterpretationLabel } |
    { kind: 'Remove', label: InterpretationLabel };
export type Interpretations = { readonly [k: number]: readonly InterpretationLabel[] };


function apply_interpretation_op(interp: readonly InterpretationLabel[], op: InterpretationOp): readonly InterpretationLabel[] {
    if (op.kind === 'Add'){
        if (interp.indexOf(op.label) === -1) {
            return [...interp, op.label];
        }
    }
    if (op.kind === 'Remove'){
        let idx = interp.indexOf(op.label);
        if (idx !== -1) {
            let new_interp = [...interp];
            new_interp.splice(idx, 1);
            return new_interp
        }
    }

    return interp;
}

function apply_interpretation_ops(interp: readonly InterpretationLabel[], ops: InterpretationOp[]): readonly InterpretationLabel[] {
    return ops.reduce(apply_interpretation_op, interp);
}

export interface World {
    readonly message: Message | undefined,
    readonly parsing: Parsing | undefined,
    readonly previous: this | null,
    readonly index: number,
    readonly interpretations: Interpretations
}

// TODO: need a more concise and cute term than "object level"
export type ObjectLevel<W extends World> =
        Pick<W, Exclude<keyof W, 'parsing' | 'previous' | 'index' | 'interpretations'>>;

export function object_level<W extends World>(w: W): ObjectLevel<W> {
    // const updater: Updater<World> = { parsing: undefined, previous: undefined, index: undefined, interpretations: undefined };

    // return update<World>(w, updater)
    return <ObjectLevel<W>> <unknown> update<World>(w, { parsing: undefined, previous: undefined, index: undefined, interpretations: undefined });
}

export type CommandHandler<W extends World> = (parser: Parser, world: ObjectLevel<W>) => ObjectLevel<W>;
export type HistoryInterpreter<W extends World> = (old_world: ObjectLevel<W>, new_world: ObjectLevel<W>) => InterpretationOp[] | undefined;

const INITIAL_WORLD: World = {
    message: undefined,
    parsing: undefined,
    previous: null,
    index: 0,
    interpretations: {}
};

// Helper to return INITIAL_WORLD constant as any kind of W type.
export function get_initial_world<W extends World>(): Pick<W, keyof World> {
    return INITIAL_WORLD;
}

export type WorldSpec<W extends World> = {
    readonly initial_world: W,

    // Should return a new world with world set to the new world's prev
    readonly handle_command: CommandHandler<W>,
    
    // Given an historically previous world and the current (new) world,
    // return any history interpretation ops to be applied to the previous world
    readonly interpret_history: HistoryInterpreter<W>
}

// TODO: Need a cute name for "World and also stuff that is not part of the world, its history or interpretations about it, that God uses to keep things going"
// This type contains a bit more information than a World.
// It didn't make sense to add extra parsing and possible world attributes to world,
// Since they can change every keystroke while the world only changes on the scale of
// valid command submissions.
// IMO World is a good level of abstraction currently.
export type CommandResult<W extends World> = {
    kind: 'CommandResult',
    parsing: Parsing,
    world: W | null,
    possible_world: W | null
};

export function apply_command<W extends World>(spec: WorldSpec<W>, world: W, command: RawInput): CommandResult<W> {
    // First handle the command
    let result = Parser.run_thread(command, p => spec.handle_command(p, world) as W);

    if (result.kind === 'NotParsed') {
        let possible_world: W | null = null;
        // TODO: Do a bunch more validation here to make sure we're good
        if (result.parsing.view.submittable) {
            possible_world = apply_command(spec, world, update(command, { submit: true })).world;
        }
        return {
            kind: 'CommandResult',
            parsing: result.parsing,
            world: world,
            possible_world
        };
    }

    let next_state: W = result.result;
    next_state = <W>update(next_state as World, {
        previous: _ => world,
        parsing: _ => result.parsing,
        index: _ => _ + 1
    });

    // Next apply history interp            
    let hist_state: W | null = next_state;
    while (hist_state !== null) {
        let ops = spec.interpret_history(hist_state, next_state);
        if (ops !== undefined) {
            let old_interp = next_state.interpretations[hist_state.index] || [];
            let new_interp: readonly InterpretationLabel[] | undefined = apply_interpretation_ops(old_interp, ops);
            if (old_interp !== new_interp) {
                if (new_interp.length === 0) {
                    new_interp = undefined;
                }
                next_state = <W>update(next_state as World, {
                    interpretations: { [hist_state.index]: new_interp }
                });
            }
        }
        hist_state = hist_state.previous;
    }

    let next_parsing = apply_command(spec, next_state, raw('', false)).parsing;
    return {
        kind: 'CommandResult',
        parsing: next_parsing,
        world: next_state,
        possible_world: null
    };
}

export function world_driver<W extends World>(spec: WorldSpec<W>): [CommandResult<W>, (world: W, command: RawInput) => CommandResult<W>] {
    function update(world: W, command: RawInput) {
        return apply_command(spec, world, command);
    }

    let initial_result = update(spec.initial_world, raw('', false));

    return [initial_result, update];

}


/*
TODO:
    World Validator, tests out a world by fully traversing its command space
        - Find any states that produced invalid commands
            Raised an error given an input
            Did not accept a submit token at the end


*/