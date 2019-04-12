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

import { Parser, Token, ParseResult, NoMatch, is_match, is_parse_result_valid } from './parser2';


// TODO: We probably want a data structure for this
// Question is how DOM-like will it wind up being and should we just use the DOM
type Message = string;

type InterpretationLabel = string;
type InterpretationOp =
    { kind: 'Add', label: InterpretationLabel } |
    { kind: 'Remove', label: InterpretationLabel };
type Interpretations = { readonly [k: number]: readonly InterpretationLabel[] };


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
    readonly message: Message,
    readonly parses: ParseResult[],
    readonly previous: this,
    readonly index: number,
    readonly interpretations: Interpretations
}

// TODO: need a more concise and cute term than "object level"
export type ObjectLevel<W extends World> =
        Pick<W, Exclude<keyof W, 'parses' | 'previous' | 'index' | 'interpretations'>>;

export function object_level<W extends World>(w: W): ObjectLevel<W> {
    let updater: Updater<World> = { parses: undefined, previous: undefined, index: undefined, interpretations: undefined };

    return <ObjectLevel<W>> update(w, updater)
}

export class WorldDriver<W extends World> {
    current_world: W;
    possible_world: W;
    can_commit: boolean = false;

    constructor(
        readonly initial_world: W,

        // Should return a new world with world set to the new world's prev
        readonly handle_command: (parser: Parser, world: ObjectLevel<W>) => ObjectLevel<W>,

        // Given an historically previous world and the current (new) world,
        // return any history interpretation ops to be applied to the previous world
        readonly interpret_history: (old_world: ObjectLevel<W>, new_world: ObjectLevel<W>) => InterpretationOp[]
    ) { 
        this.current_world = initial_world;
        this.apply_command([], false);
    }

    apply_command(cmd: Token[], commit: boolean = true) {
        let prev_state = this.current_world;
        
        // First handle the command
        let [maybe_next_state, parses] = Parser.run_thread(cmd, p => this.handle_command(p, prev_state) as W);

        if (!is_match(maybe_next_state)) {
            this.can_commit = false;
            this.possible_world = <W>update(this.current_world as World, {
                message: null,
                parses,
                previous: this.current_world,
                index: _ => _ + 1
            });
            return;
        }
        let next_state: W = maybe_next_state;
        next_state = <W>update(next_state as World, { previous: prev_state, parses, index: _ => _ + 1 });;

        // Next apply history interp            
        let hist_state = next_state;
        while (hist_state !== null) {
            let ops = this.interpret_history(hist_state, next_state);
            if (ops !== undefined) {
                let old_interp = next_state.interpretations[hist_state.index];
                let new_interp = apply_interpretation_ops(old_interp, ops);
                if (old_interp !== new_interp) {
                    next_state = <W>update(next_state as World, {
                        interpretations: { [hist_state.index]: new_interp }
                    });
                }
            }
            hist_state = hist_state.previous;
        }
        
        // Next pop this in this.possible_world and either commit or don't.
        this.possible_world = next_state;
        this.can_commit = true;
        if (commit) {
            this.commit();
        }
    }

    commit() {
        if (!this.can_commit) {
            throw new Error('Tried to commit an invalid command. The UI should prevent this.');
        }
        this.current_world = this.possible_world;
        this.apply_command([], false);
    }
}