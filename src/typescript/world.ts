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

import { infer_message_labels, Message, INITIAL_MESSAGE, standard_render } from './message';
import { Parser, Parsing, raw, RawInput } from './parser';
import { deep_equal, update } from './utils';
import { Interpretations, pre_interp } from './interpretation';

export interface World {
    readonly message: Message,
    readonly parsing: Parsing | undefined,
    readonly previous: this | null,
    readonly index: number,
    readonly interpretations: Interpretations,
}

// TODO: need a more concise and cute term than "object level"
export type MetaLevelKeys = 'parsing' | 'previous' | 'index' | 'interpretations';
export type ObjectLevelKeys = 'message';


export type ObjectLevel<W extends World> = Omit<W, MetaLevelKeys>;
export type ObjectLevelWorld = Pick<World, ObjectLevelKeys>;

export type WorldUpdater<W extends World> = (world: W) => W;

export type CommandHandler<W extends World> = (world: W, parser: Parser) => W;

export type Narrator<W extends World> = (new_world: W, old_world: W) => W;


const INITIAL_WORLD: World = {
    message: INITIAL_MESSAGE,
    parsing: undefined,
    previous: null,
    index: 0,
    interpretations: {},
};

// Helper to return INITIAL_WORLD constant as any kind of W type.
export function get_initial_world<W extends World>(): Pick<W, keyof World> {
    return <W>INITIAL_WORLD;
}

export type WorldSpec<W extends World> = {
    readonly initial_world: W,

    // prepare the world for the command
    readonly pre?: WorldUpdater<W>,

    // Should return a new world with world set to the new world's prev
    readonly handle_command: CommandHandler<W>,

    // update the world after handling the command
    readonly post?: Narrator<W>,

    readonly css_rules?: string[]
}

export function make_world_spec<W extends World>(spec: {
    initial_world: W,
    pre?: WorldUpdater<W>,
    handle_command: CommandHandler<W>,
    post?: Narrator<W>,
    css_rules?: string[]
}): WorldSpec<W> {
    return <WorldSpec<W>>spec;
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
    world: W,
    possible_world: W | null
};

export function apply_command<W extends World>(spec: WorldSpec<W>, world: W, command: RawInput): CommandResult<W>;
export function apply_command(spec: WorldSpec<World>, world: World, command: RawInput): CommandResult<World> {
    let next_state = world;

    next_state = update(next_state, {
        previous: _ => world,
        index: _ => _ + 1,
        message: INITIAL_MESSAGE,
        interpretations: pre_interp
    });

    if (spec.pre !== undefined) {
        next_state = <World> spec.pre(next_state);
    }

    // First handle the command
    let result = Parser.run_thread(command, (p) => spec.handle_command(next_state, p));

    if (result.kind === 'NotParsed') {
        let possible_world: World | null = null;
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

    next_state = update(<World>result.result, {
        parsing: _ => result.parsing,
    });
    
    if (spec.post !== undefined) {
        next_state = <World>spec.post(next_state, world);
    }

    let next_parsing = apply_command(spec, next_state, raw('', false)).parsing;
    return {
        kind: 'CommandResult',
        parsing: next_parsing,
        world: next_state,
        possible_world: null
    };
}

export function world_driver<W extends World>(spec: WorldSpec<W>): [CommandResult<W>, (world: W, command: RawInput) => CommandResult<W>, string[]?] { //, Renderer] {
    function update(world: W, command: RawInput) {
        return apply_command(spec, world, command);
    }

    let initial_result = update(spec.initial_world, raw('', false));

    return [initial_result, update, spec.css_rules]

}

/*
TODO:
    World Validator, tests out a world by fully traversing its command space
        - Find any states that produced invalid commands
            Raised an error given an input
            Did not accept a submit token at the end


*/