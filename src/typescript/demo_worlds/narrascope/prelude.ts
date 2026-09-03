/*
    Shared definitions for the narrascope demo: the world state, the lock,
    and the registries that the other modules fill in as they load
    (puffers, initial knowledge, action handlers). narrascope.tsx assembles
    the world from them last.
*/
import { Gist, GistMap, GistPattern, GistUpdateDispatcher } from 'gist';
import { update } from 'lib/utils';
import { lock_builder } from 'lock';
import { Puffer } from 'puffer';
import { empty_knowledge, ingest, Knowledge, StoryNode } from 'story';
import { World } from 'world';

export const TOPIC_IDS = ['the present moment', 'Sam', 'yourself', 'your notebook', 'your history with Sam'] as const;
export type TopicID = (typeof TOPIC_IDS)[number];

export const ACTION_IDS = ['consider', 'reflect', 'notes', 'remember', 'scrutinize', 'hammer', 'volunteer'] as const;
export type ActionID = (typeof ACTION_IDS)[number];

// Actions that can only be taken while reflecting, on a facet of the frame under reflection.
export const INNER_ACTION_IDS = ['scrutinize', 'hammer', 'volunteer'] as const;
export type InnerActionID = (typeof INNER_ACTION_IDS)[number];

export type Owner = 'Metaphor' | 'Outro';

export interface Venience extends World {
    // Which part of the game currently owns the command space, if any.
    readonly owner: Owner | undefined;

    // What the player just did. Set by the command, used to label the frame and to trigger action handlers.
    readonly gist: Gist | undefined;

    // The index of the frame under reflection, if any.
    readonly current_interpretation: number | undefined;

    // The canonical text of everything the player can consider, as revealed so far.
    readonly knowledge: Knowledge;

    readonly has_acquired: Map<ActionID, boolean>;
    readonly has_tried: GistMap<boolean>;
    readonly could_remember: readonly Gist[];
    readonly can_consider: GistMap<boolean>;

    // Puzzle progress.
    readonly has_chill: boolean;
    readonly has_recognized_something_wrong: boolean;
    readonly is_curious_about_history: boolean;
    readonly has_admitted_negligence: boolean;
    readonly has_unpacked_culpability: boolean;
    readonly has_volunteered: boolean;
    readonly end: boolean;
}

// LOCK

export const global_lock = lock_builder<Venience, Owner>({
    owner: (w) => w.owner,
    set_owner: (w, owner) => update(w, { owner })
});

// PUFFERS

export type VeniencePuffer = Puffer<Venience> & {
    // Set once a lock has been applied (or deliberately not), so that Puffers() doesn't add one.
    lock_applied?: true
};

const PUFFERS: VeniencePuffer[] = [];

// Register puffers. A puffer with no lock applied gets the default one:
// it only runs when nobody owns the command space.
export function Puffers(...puffers: VeniencePuffer[]): void {
    for (const p of puffers) {
        PUFFERS.push(p.lock_applied ? p : lock_puffer(undefined, p));
    }
}

export function all_puffers(): VeniencePuffer[] {
    return [...PUFFERS];
}

// Only run the puffer when `owner` holds the lock (or, for undefined, when nobody does).
export function lock_puffer(owner: Owner | undefined, puffer: Puffer<Venience>): VeniencePuffer {
    return { ...global_lock(owner).lock_puffer(puffer), lock_applied: true };
}

// A puffer that runs regardless of who holds the lock.
export function unlocked_puffer(puffer: Puffer<Venience>): VeniencePuffer {
    return { ...puffer, lock_applied: true };
}

// INITIAL KNOWLEDGE

let initial_knowledge: Knowledge = empty_knowledge();

// Register a passage the player can know about from the start. Returns the passage.
export function add_initial_knowledge<S extends StoryNode>(story: S): S {
    initial_knowledge = ingest(initial_knowledge, story);
    return story;
}

export function get_initial_knowledge(): Knowledge {
    return initial_knowledge;
}

// ACTION HANDLERS
// Run after a command whose gist matches, to give it its consequences.

export const ACTION_HANDLERS = new GistUpdateDispatcher<Venience>();

// Handlers at this stage or later are defaults: they only run when nothing earlier matched.
export const ACTION_HANDLER_FALLTHROUGH_STAGE = 5;

export function ActionHandler(pattern: GistPattern, impl: (action: Gist) => (w: Venience) => Venience, stage?: number): void {
    ACTION_HANDLERS.add(pattern, impl, stage);
}

export function handle_action(action: Gist, w: Venience): Venience {
    return ACTION_HANDLERS.apply_all(action, w, ACTION_HANDLER_FALLTHROUGH_STAGE);
}
