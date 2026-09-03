/*
    Actions are the verbs of the demo. Each one has a description (what
    Katya said about it, and what it confers) which the player learns by
    remembering it, can reread in their notes, and can reflect on.
*/
import { child, exact, Gist, gist, GistRenderer, param, RenderImpls, render_gist } from 'gist';
import { capitalize } from 'lib/text_utils';
import { map, update } from 'lib/utils';
import { ConsumeSpec, GAP } from 'parser';
import { gate_puffer } from 'puffer';
import { createElement, Fragment, StoryNode, story_updater, Updates as S } from 'story';
import { ActionHandler, ActionID, add_initial_knowledge, handle_action, Puffers, unlocked_puffer, Venience, VeniencePuffer } from './prelude';
import { Exposition } from './reflect/inner_action';
import { insight_text_class } from './styles';

export type Action = {
    id: ActionID,

    // How to render gists tagged with this action, e.g. "your impression of Sam" / "consider sam".
    render: RenderImpls,

    // The vague prompt for remembering this action, e.g. "something focused".
    memory_prompt?: { noun_phrase: string, command_noun_phrase: ConsumeSpec },

    // The name of the action as a thing, e.g. "scrutiny".
    description_noun_phrase: string,
    description_command_noun_phrase: ConsumeSpec,

    description: Fragment,
    katya_quote: Fragment,

    // Revealed by scrutinizing Katya's words.
    memory?: Fragment,

    puffer?: VeniencePuffer
};

export const ACTIONS = new Map<ActionID, Action>();

export function action_description(id: ActionID): Gist {
    return gist('action description', undefined, { action: id });
}

export function katya_on(id: ActionID): Gist {
    return gist('Katya on', { action_description: action_description(id) });
}

export function Action(spec: Action): Action {
    GistRenderer_for_action(spec);

    const descr = action_description(spec.id);
    const katya = katya_on(spec.id);

    // The description of the action, as it appears in memories and notes.
    const description = add_initial_knowledge(
        <div gist={descr}>
            <div gist={katya} className={insight_text_class}>
                {spec.katya_quote}
            </div>
            <br />
            {capitalize(spec.description_noun_phrase)} confers:
            <blockquote>
                {spec.description}
            </blockquote>
        </div> as StoryNode
    );

    add_initial_knowledge(
        <div gist={gist('notes', { subject: descr })}>
            <strong>{capitalize(spec.description_noun_phrase)}</strong>
            {description}
        </div> as StoryNode
    );

    add_initial_knowledge(
        <div gist={gist('remember', { subject: descr })}>
            You close your eyes, and hear Katya's voice:
            {description}
        </div> as StoryNode
    );

    if (spec.memory !== undefined) {
        // Scrutinizing Katya's words reveals the memory behind them.
        ActionHandler({ tag: 'scrutinize', children: { facet: exact(katya) } }, Exposition({
            revealed: <blockquote gist={gist('remember', { subject: katya })} className={insight_text_class}>
                {spec.memory}
            </blockquote> as StoryNode,
            commentary: (action, frame) => [
                frame.consequence(<div>The memory comes back to you more fully.</div>)
            ]
        }));
    }

    if (spec.puffer !== undefined) {
        // (gate_puffer keeps any lock the puffer already has.)
        Puffers(gate_puffer((w: Venience) => !!w.has_acquired.get(spec.id), spec.puffer));
    }

    ACTIONS.set(spec.id, spec);
    return spec;
}

function GistRenderer_for_action(spec: Action) {
    const descr = action_description(spec.id);

    GistRenderer({ tag: spec.id }, spec.render);

    GistRenderer(exact(descr), {
        noun_phrase: () => spec.description_noun_phrase,
        command_noun_phrase: () => spec.description_command_noun_phrase
    });

    if (spec.memory_prompt !== undefined) {
        const prompt = spec.memory_prompt;
        GistRenderer({ tag: 'memory prompt', children: { memory: { tag: 'remember', children: { subject: exact(descr) } } } }, {
            noun_phrase: () => prompt.noun_phrase,
            command_noun_phrase: () => prompt.command_noun_phrase
        });
    }
}

GistRenderer({ tag: 'Katya on' }, {
    noun_phrase: g => `Katya's words on ${render_gist.noun_phrase(child(g, 'action_description'))}`,
    command_noun_phrase: g => ["Katya's_words_on", GAP, render_gist.command_noun_phrase(child(g, 'action_description'))]
});

// The command for an action gist, dimmed once it has been tried.
export function action_consume_spec(action: Gist, world: Venience): ConsumeSpec {
    return {
        tokens: render_gist.command_verb_phrase(action),
        used: world.has_tried.get(action)
    };
}

// After each command: label the frame with the action's gist, run its handlers, and note that it has been tried.
Puffers(unlocked_puffer({
    pre: world => update(world, { gist: undefined }),

    post: (w2) => {
        const action = w2.gist;
        if (action === undefined) {
            return w2;
        }
        w2 = update(w2, {
            story_updates: story_updater(S.frame().set_gist(action))
        });
        w2 = handle_action(action, w2);
        return update(w2, {
            has_tried: _ => _.set(action, true)
        });
    }
}));

// Remembering an action's description makes the action available.
ActionHandler({ tag: 'remember', children: { subject: { tag: 'action description' } } },
    (action) => (world) => {
        const id = param(child(action, 'subject'), 'action') as ActionID;
        return update(world, {
            has_acquired: map([id, true])
        });
    }
);
