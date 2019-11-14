import { gist, Gists, render_gist_command_noun_phrase, render_gist_noun_phrase } from '../../gist';
import { createElement, story_updater, Fragment, Updates } from '../../story';
// import { Fragment, message_updater } from '../../message';
import { ParserThread } from '../../parser';
import { StaticMap } from '../../static_resources';
import { capitalize } from '../../text_utils';
import { update } from '../../update';
import { map } from '../../utils';
import { } from './metaphor';
import { NoteID, Puffers, resource_registry, StaticNoteIDs, Venience } from './prelude';
import { stages } from '../../stages';

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
        note_index: StaticMap<Record<NoteID, NoteEntry>>;
    }
}

resource_registry.initialize('initial_world_notes', {
    has_written_down: map(),
    has_read: map()
});

const note_index = resource_registry.initialize('note_index', new StaticMap(StaticNoteIDs));

export function add_to_notes(world: Venience, note_id: NoteID) {
    const entry = note_index.get(note_id)

    return update(world,
        { has_written_down: map([note_id, true]) },
        story_updater(
            Updates.prompt(<div>
                You write about {capitalize(render_gist_noun_phrase(gist(note_id)))} in your <strong>notes</strong>.
            </div>)
        )
    );
}

Puffers({
    handle_command: stages(
        [3, (world, parser) => {
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
                story_updater(Updates.description(<div>
                    You have written down notes about the following:
                    {Object.values(note_index.all())
                        .filter(n => world.has_written_down.get(n.note_id))
                        .map(n => <blockquote>{capitalize(render_gist_noun_phrase(gist(n.note_id)))}</blockquote>)
                        .join('')}
                    </div>
                ))
            ))));

            let specific_threads: ParserThread<Venience>[] = [];
            
            for (const entry of Object.values(note_index.all())) {
                if (!world.has_written_down.get(entry.note_id)) {
                    continue;
                }

                specific_threads.push(() =>
                parser.consume({
                    tokens: ['notes about', render_gist_command_noun_phrase(gist(entry.note_id))],
                    used: world.has_read.get(entry.note_id)
                }, () =>
                parser.submit(() => {
                const g = gist(entry.note_id);
                return update(world,
                    {
                        has_read: map([entry.note_id, true]),
                        gist: () => gist('notes about', { topic: g })
                    },
                    story_updater(Updates.description(<div>
                        <strong>${capitalize(render_gist_noun_phrase(g))}</strong>
                        {entry.description()}
                    </div>))
                )})));
            }

            return parser.split([list_thread, ...specific_threads]);
        }]
    )
});

export const Notes = (spec: NoteEntry) =>
    note_index.initialize(spec.note_id, spec);