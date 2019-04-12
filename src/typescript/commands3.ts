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

import {starts_with, tokenize, untokenize, normalize_whitespace, split_tokens} from './text_tools';

import {
    // Annotatable,
    // annotate,
    // Disablable,
    // unwrap,
    // get_annotation,
    // with_annotatable,
    // with_disablable,
    // set_enabled,
    // is_enabled,
    chain_update,
    chain_object,
    array_last,
    update,
    Updater,
    DeepImmutable
} from './datatypes';

import { Parser, Token, ParseResult, NoMatch, is_match, is_parse_result_valid } from './parser2';


namespace World4 {
    // TODO: We probably want a data structure for this
    // Question is how DOM-like will it wind up being and should we just use the DOM
    type message = string;

    type InterpretationLabel = string;
    type InterpretationNode = {
        readonly labels: readonly InterpretationLabel[],
        previous: InterpretationNode
    }

    type InterpretationOp =
        { kind: 'Add', label: InterpretationLabel } |
        { kind: 'Remove', label: InterpretationLabel };

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
        readonly message: string,
        readonly parses: ParseResult[],
        readonly previous: this,
        readonly current_interpretation: InterpretationNode
    }

    // TODO: need a more concise and cute term than "object level"
    export type ObjectLevel<W extends World> =
            Pick<W, Exclude<keyof W, 'parses' | 'previous' | 'current_interpretation'>>;
    
    export function object_level<W extends World>(w: W): ObjectLevel<W> {
        let updater: Updater<World> = { parses: undefined, previous: undefined, current_interpretation: undefined };

        return <ObjectLevel<W>> update(w, updater)
    }

    export class WorldDriver<W extends World> {
        current_world: W;
        possible_world: W;

        constructor(
            readonly initial_world: W,

            // Should return a new world with world set to the new world's prev
            readonly handle_command: (parser: Parser, world: ObjectLevel<W>) => ObjectLevel<W>,

            // Given an historically previous world and the current (new) world,
            // return any history interpretation ops to be applied to the previous world
            readonly interpret_history: (old_world: ObjectLevel<W>, new_world: ObjectLevel<W>) => InterpretationOp[]
        ) { 
            this.current_world = initial_world;
            
            this.apply_command([], false); //populate this.current_state
        }

        apply_command(cmd: Token[], commit: boolean = true) {
            let prev_state = this.current_world;
            
            // First handle the command
            let [maybe_next_state, parses] = Parser.run_thread(cmd, p => this.handle_command(p, prev_state) as W);

            if (!is_match(maybe_next_state)) {
                return; // TODO do more here
            }
            let next_state: W = maybe_next_state;
            next_state = <W>update(next_state as World, { previous: prev_state, parses });;
            
            // Next apply history interp
            next_state = <W>update(next_state as World, {
                current_interpretation: { labels: [], previous: next_state.current_interpretation }
            });;
            
            let hist_state = next_state;
            let hist_interp = next_state.current_interpretation;
            let parent_link: InterpretationNode = null; // null means root, aka next_state.current_interpretation.
            while (hist_state !== null) {
                let ops = this.interpret_history(hist_state, next_state);

                if (ops !== undefined) {
                    let new_hist_interp = update(hist_interp, {
                        labels: _ => apply_interpretation_ops(_, ops)
                    });

                    // unnecessary optimization but w/e
                    if (new_hist_interp !== hist_interp) {
                        if (parent_link === null) {
                            next_state = <W>update(next_state as World, { current_interpretation: hist_interp });
                        } else {
                            parent_link.previous = hist_interp;
                        }
                    }
                }

                hist_state = hist_state.previous;
                parent_link = hist_interp;
                hist_interp = hist_interp.previous;
            }
            
            // Next pop this in this.possible_world and either commit or don't.
            







            let result: PostProcessedCommandResult<T> = apply_command(prev_state.world, cmd);
             
            result.index = prev_state.index + 1;

            this.current_state = result;

            if (this.current_state.parses.some(is_parse_result_valid)) {
                this.possible_history = apply_history_interpretation([...this.history, this.current_state], this.current_state.world);
                if (commit) {
                    this.commit();
                }
            } else {
                this.possible_history = this.history;
            }
            return result;
        }

        commit() {
            //save previous history for posterity
            this.previous_histories.push(this.history);

            //filter out any disabled history
            this.history = [...this.possible_history] //this.possible_history.filter(is_enabled); //.map(x => annotate(x, 1));

            this.apply_command('', false);
            return this.current_state;
        }
    }
}




//     update_state<X extends typeof World2>(updater: Updater<T>): this {
//         let new_state = update(<T>this.state, updater);

//         return new (<any>this.constructor)(new_state)
//     }
    
// }



export interface CommandHandler<T> {
    handle_command(this: World<T>, parser: Parser): CommandResult<T>
}

export interface HistoryInterpreter<T> {
    interpret_history(this: World<T>, history_elt: InterstitialUpdateResult<T>): HistoryInterpretationOp
}

export abstract class World<T> implements CommandHandler<T>, Partial<HistoryInterpreter<T>> {
    abstract handle_command: (this: World<T>, parser: Parser) => CommandResult<T>;
    abstract interstitial_update?(command_message?: HTMLElement): InterstitialUpdateResult<T>;
    abstract interpret_history?(history: InterstitialUpdateResult<T>): HistoryInterpretationOp;

    readonly state: T;
    constructor(state?: T){
        this.state = state;
    }

    update(state_updates: T, replace_keys?: string[]): this {
        let new_state = chain_update(this.state, state_updates, replace_keys);
        return new (this.constructor as any)(new_state);
    }
}

export type InterstitialUpdateResult<T> = {
    world?: World<T>;
    message?: HTMLElement;
} | undefined;

export type CommandResult<T> = InterstitialUpdateResult<T> & {
    parses?: ParseResult[];
} | undefined;

export type HistoryInterpretation = string[];

export type HistoryInterpretationOp = ({'add': string} | {'remove': string})[];

export type PostProcessedCommandResult<T> = CommandResult<T> & {
    index?: number;
    message_classes?: HistoryInterpretation;
}

export interface Command<T> {
    command_name: Token[];
    execute: (world: World<T>, parser: Parser) => CommandResult<T>;
}

export function apply_command<T> (world: World<T>, cmd: string) {
    let [tokens, splits] = tokenize(cmd);
    let [cmd_result, parses] = Parser.run_thread(world.handle_command, tokens);

    let result: CommandResult<T> = {parses: parses, world: world};
    
    if (!(cmd_result instanceof NoMatch)) {
        if (cmd_result.world !== undefined) {
            result.world = cmd_result.world;
        }
        if (cmd_result.message !== undefined) {
            result.message = cmd_result.message;
        }

        result = apply_interstitial_update(result);
    }

    return result;
}

function apply_interstitial_update<T>(result: CommandResult<T>): CommandResult<T> {
    if (result.world.interstitial_update !== undefined) {
        let res2 = result.world.interstitial_update();
        if (res2 !== undefined) {
            if (res2.world !== undefined) {
                result.world = res2.world;
            }
            if (res2.message !== undefined) { 
                //assume they updated the original message in some way   
                result.message = res2.message;
            }
        }
    }
    return result;
}

class HistoryInterpretationError extends Error {};

function apply_history_interpretation_op(interp: HistoryInterpretation, op: HistoryInterpretationOp): HistoryInterpretation {
    if (op === undefined || op.length === 0){
        return interp;
    }
    let new_interp: HistoryInterpretation;
    if (interp === undefined) {
        new_interp = [];
    } else {
        new_interp = [...interp];
    }
    for (let o of op) {
        if (o['add'] !== undefined){
            let message_class = o['add'];
            if (new_interp.indexOf(message_class) === -1) {
                new_interp.push(message_class);
            }
        }
        if (o['remove'] !== undefined){
            let message_class = o['remove'];
            let idx = new_interp.indexOf(message_class);
            if (idx !== -1) {
                new_interp.splice(idx, 1);
            }
        }
    }
    return new_interp;
}

function apply_history_interpretation<T>(history: PostProcessedCommandResult<T>[], world: World<T>): PostProcessedCommandResult<T>[] {
    if (world.interpret_history === undefined) {
        return history;
    } else {
        let history_input = history.map(({world, message}) => ({world, message}));

        let interp_ops = history_input.map(world.interpret_history, world);

        let new_history = [];
        for (let i = 0; i < interp_ops.length; i++) {
            let new_elt = {...history[i]};
            let msg_clss = new_elt.message_classes;
            let op = interp_ops[i];
            new_elt.message_classes = apply_history_interpretation_op(msg_clss, op);
            new_history.push(new_elt);
        }
        return new_history;
    }
}



/*
    So this is almost a decent abstraction as-is.

    TODO: get rid of all the different varieties of CommandResult. Just 1
    TODO: getting the initial result in the constructor is ugly
    TODO: reconcile the existing code which expects strings vs the new parser code which expects tokens

    TODO: Should the world maybe just be the ssingle data structure that has the message and the history tags?
*/
export class WorldDriver<T> {
    previous_histories: PostProcessedCommandResult<T>[][] = [];

    history: PostProcessedCommandResult<T>[];

    possible_history: PostProcessedCommandResult<T>[];
    current_state: CommandResult<T>;

    constructor (initial_world: World<T>) {
        let initial_result: PostProcessedCommandResult<T> = {world: initial_world};
        initial_result = apply_interstitial_update(initial_result);
        initial_result.index = 0;
        this.history = apply_history_interpretation([initial_result], initial_world);
 
        this.apply_command('', false); //populate this.current_state
    }

    apply_command(cmd: string, commit: boolean = true) {
        let prev_state = array_last(this.history); //unwrap(this.history[this.history.length - 1]);
        let result: PostProcessedCommandResult<T> = apply_command(prev_state.world, cmd);
         
        result.index = prev_state.index + 1;

        this.current_state = result;

        if (this.current_state.parses.some(is_parse_result_valid)) {
            this.possible_history = apply_history_interpretation([...this.history, this.current_state], this.current_state.world);
            if (commit) {
                this.commit();
            }
        } else {
            this.possible_history = this.history;
        }
        return result;
    }

    commit() {
        //save previous history for posterity
        this.previous_histories.push(this.history);

        //filter out any disabled history
        this.history = [...this.possible_history] //this.possible_history.filter(is_enabled); //.map(x => annotate(x, 1));

        this.apply_command('', false);
        return this.current_state;
    }
}
