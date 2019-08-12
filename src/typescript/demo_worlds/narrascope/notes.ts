import { Gists, render_gist_text, Gist, gist, render_gist_command } from '../../gist';
import { resource_registry, Venience, NoteID, Puffers, StaticNoteIDs } from './prelude';
import {} from './metaphor';
import { update } from '../../update';
import { appender, map, bound_method } from '../../utils';
import { message_updater, MessageUpdateSpec, Fragment } from '../../message';
import { find_index } from '../../interpretation';
import Handlebars from 'handlebars';
import { StaticIndex, StaticResourceRegistry } from '../../static_resources';
import { ParserThread } from '../../parser';
import { capitalize } from '../../text_tools';

type NoteGists = { [K in NoteID]: undefined };

declare module '../../gist' {
    export interface GistSpecs extends NoteGists {
        notes: undefined;
        'notes about': { topic: Gist<NoteID> };
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
    note_id: NoteID,
    description: () => Fragment
}

interface Notes {
    has_written_down: Map<NoteID, boolean>;
    has_read: Map<NoteID, boolean>;
}

declare module './prelude' {
    export interface Venience extends Notes {}

    export interface StaticResources {
        initial_world_notes: Notes;
        note_index: StaticResourceRegistry<Record<NoteID, NoteEntry>>;
    }
}

resource_registry.initialize('initial_world_notes', {
    has_written_down: map(),
    has_read: map()
});

const note_index = resource_registry.initialize('note_index', new StaticResourceRegistry(StaticNoteIDs)) //new StaticIndex()).get();

Handlebars.registerHelper('index_matches', (world: Venience, target: number, options) => {
    return world.index === target
});

export function add_to_notes(world: Venience, note_id: NoteID) {
    const entry = note_index.get(note_id)

    return update(world,
        { has_written_down: map([note_id, true]) },
        message_updater({prompt: [`You write about ${capitalize(render_gist_text(gist(note_id)))} in your <strong>notes</strong>.`]})
    )    
}

Puffers({
    handle_command: {
        kind: 'Stages',
        3: (world, parser) => {
            if (Object.values(note_index.all()).every(n => !world.has_written_down.get(n.note_id))) {
                return parser.eliminate();
            }

            const list_thread: ParserThread<Venience> = (() => 
            
            parser.consume({
                tokens: 'notes',
                used: Object.values(note_index.all()).every(n => !world.has_written_down.get(n.note_id) || world.has_read.get(n.note_id))
            }, () => parser.submit(() =>
            update(world,
                { gist: gist('notes') },
                message_updater({ description: [
                    `You have written down notes about the following:`,
                    Object.values(note_index.all())
                        .filter(n => world.has_written_down.get(n.note_id))
                        .map(n => `<blockquote>${capitalize(render_gist_text(gist(n.note_id)))}</blockquote>`)
                        .join('')
                ]})
            ))));

            let specific_threads: ParserThread<Venience>[] = [];
            
            for (const entry of Object.values(note_index.all())) {
                if (!world.has_written_down.get(entry.note_id)) {
                    continue;
                }

                specific_threads.push(() =>
                parser.consume({
                    tokens: ['notes about', render_gist_command(gist(entry.note_id))],
                    used: world.has_read.get(entry.note_id)
                }, () =>
                parser.submit(() => {
                const g = gist(entry.note_id);
                return update(world,
                    {
                        has_read: map([entry.note_id, true]),
                        gist: () => gist('notes about', { topic: g })
                    },
                    message_updater({ description: [`<strong>${capitalize(render_gist_text(g))}</strong>`, entry.description()] })
                )})));
            }

            return parser.split([list_thread, ...specific_threads]);
        }
    }
});

export const Notes = (spec: NoteEntry) =>
    note_index.initialize(spec.note_id, spec);