import { Gists, render_gist_text } from '../../gist';
import { resource_registry, Venience } from './prelude';
import {} from './metaphor';
import { update } from '../../update';
import { appender } from '../../utils';
import { message_updater, MessageUpdateSpec } from '../../message';
import { find_index } from '../../interpretation';
import Handlebars from 'handlebars';

declare module '../../gist' {
    export interface GistSpecs {
        notes: undefined;
        'notes about': { topic: Gist };
    }
}

Gists({
    tag: 'notes',
    text: () => 'your notes',
    command: () => 'my_notes'
});

Gists({
    tag: 'notes about',
    text: ({topic}) => `your notes about ${topic}`,
    command: ({topic}) => ['my_notes about', topic]
});

export type NoteEntry = {
    index: number
}

interface Notes {
    notes: NoteEntry[]
}

declare module './prelude' {
    export interface Venience extends Notes {}

    export interface StaticResources {
        initial_world_notes: Notes
    }
}


resource_registry.create('initial_world_notes', {
    notes: []
});

Handlebars.registerHelper('index_matches', (world: Venience, target: number, options) => {
    return world.index === target
});

export function add_to_notes(world: Venience, index?: number) {
    if (index === undefined) {
        index = world.index;
    }

    let msg: string;

    if (index === world.index) {
        msg = 'You write this down in your notes.';
        
    } else {
        const target_world = find_index(world, index)!;
        msg = `You write about ${render_gist_text(target_world.gist!)} in your notes.`;
    }
    let msg_update: MessageUpdateSpec = {
        [index === world.index ? 'prompt' : 'action']: [`
            {{#if {{ index_matches @world ${world.index} }} }}
                ${msg}
            {{/if}}
        `]
    }
    return update(world,
        { notes: appender({ index }) },
        message_updater(msg_update)
    );
}

// TODO Command Handler for displaying notes goes here.