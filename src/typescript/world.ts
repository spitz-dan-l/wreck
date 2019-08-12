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

import { O } from 'ts-toolbelt';
import { Interpretations, pre_interp } from './interpretation';
import { INITIAL_MESSAGE, Message } from './message';
import { failed, Parser, ParserThread, ParseValue, Parsing, raw, RawInput } from './parser';
import { update } from './utils';

export interface World {
    readonly message: Message,
    readonly parsing: Parsing | undefined,
    readonly previous: this | null,
    readonly index: number,
    readonly interpretations: Interpretations,
    readonly parent: this | null,
    readonly child: this | null
}

export type WorldUpdater<W extends World> = (world: W) => W;

export type CommandHandler<W extends World> = (world: W, parser: Parser) => ParseValue<W>;

export type Narrator<W extends World> = (new_world: W, old_world: W) => W;


const INITIAL_WORLD: World = {
    message: INITIAL_MESSAGE,
    parsing: undefined,
    previous: null,
    index: 0,
    interpretations: {},
    parent: null,
    child: null
};

// Helper to return INITIAL_WORLD constant as any kind of W type.
export function get_initial_world<W extends World>(): Pick<W, keyof World> {
    return <W>INITIAL_WORLD;
}

export type WorldSpec<W extends World> = {
    // starting world state
    readonly initial_world: W,

    // prepare the world for the command
    readonly pre?: WorldUpdater<W>,

    // handle the command (including failing if the command is invalid)
    readonly handle_command: CommandHandler<W>,

    // update the world after handling the command
    readonly post?: Narrator<W>,

    // Any css rules used to display this world
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

export type CommandResult<W extends World> = {
    kind: 'CommandResult',
    parsing: Parsing,
    world: W,
    possible_world: W | null
};

export function update_thread_maker<W extends World>(spec: WorldSpec<W>) {
    return (world: W) => make_update_thread(spec, world);
}

export function make_update_thread<W extends World>(spec: WorldSpec<W>, world: W): ParserThread<W>;
export function make_update_thread(spec: WorldSpec<World>, world: World) {
    let next_state = world;

    next_state = update(next_state, {
        previous: _ => world,
        index: _ => _ + 1,
        message: () => INITIAL_MESSAGE,
        interpretations: pre_interp,
        parsing: () => undefined,
        parent: () => null,
        child: () => null
    });

    if (spec.pre !== undefined) {
        next_state = <World> spec.pre(next_state);
    }

    return function update_thread(parser: Parser) {
        let next_state2 = spec.handle_command(next_state, parser);
        if (failed(next_state2)) {
            return next_state2;
        }
        
        if (spec.post !== undefined) {
            next_state2 = <World>spec.post(next_state2, world);
        }

        return next_state2;
    }
}


export function apply_command<W extends World>(spec: WorldSpec<W>, world: W, command: RawInput): CommandResult<W>;
export function apply_command(spec: WorldSpec<World>, world: World, command: RawInput): CommandResult<World> {
    let thread = make_update_thread(spec, world);
    let result = Parser.run_thread(command, thread);
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

    let w: World = result.result;

    w = update(w, { parsing: () => result.parsing });

    // If this is a compound action, assign it as the parent to the children,
    // and return the last child instead of the parent.
    if (w.child !== null) {
        let c = w.child;
        while (c.index >= w.index) {
            (c as O.Writable<World, 'parent'>).parent = w;
            c = c.previous!;
        }
        w = w.child;
    }
    
    let next_parsing = apply_command(spec, w, raw('', false)).parsing;
    return {
        kind: 'CommandResult',
        parsing: next_parsing,
        world: w,
        possible_world: null
    };
}

export type WorldDriver<W extends World> = {
    initial_result: CommandResult<W>,
    update: (world: W, command: RawInput) => CommandResult<W>,
    thread_maker: (world: W) => ParserThread<W>,
    css_rules?: string[]
}

export function world_driver<W extends World>(spec: WorldSpec<W>): WorldDriver<W> {
    function update(world: W, command: RawInput) {
        return apply_command(spec, world, command);
    }

    let initial_result = update(spec.initial_world, raw('', false));

    let thread_maker = (world: W) => make_update_thread(spec, world);

    return {
        initial_result,
        update,
        thread_maker,
        css_rules: spec.css_rules
    }
}

/*
TODO:
    World Validator, tests out a world by fully traversing its command space
        - Find any states that produced invalid commands
            Raised an error given an input
            Did not accept a submit token at the end


*/