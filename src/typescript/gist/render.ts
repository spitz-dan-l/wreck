/*
    Rendering gists as text, for three purposes:
        noun_phrase          - "your impression of Sam", used in prose
        command_noun_phrase  - "my_impression_of sam", used inside commands
        command_verb_phrase  - "consider sam", the command for an action gist

    Renderers are registered per gist pattern. A default renderer (stage 5)
    handles gists with no children or parameters by printing their tag.
*/
import { ConsumeSpec } from 'parser';
import { Gist, GistDispatcher, GistPattern, gist_to_string } from './gist';

export type GistRenderings = {
    noun_phrase: string,
    command_noun_phrase: ConsumeSpec,
    command_verb_phrase: ConsumeSpec
};

export type RenderImpls = {
    [K in keyof GistRenderings]?: (g: Gist) => GistRenderings[K]
};

const dispatchers = {
    noun_phrase: new GistDispatcher<string>(),
    command_noun_phrase: new GistDispatcher<ConsumeSpec>(),
    command_verb_phrase: new GistDispatcher<ConsumeSpec>()
};

export function GistRenderer(pattern: GistPattern, impls: RenderImpls, stage: number = 0): void {
    if (impls.noun_phrase !== undefined) {
        dispatchers.noun_phrase.add(pattern, impls.noun_phrase, stage);
    }
    if (impls.command_noun_phrase !== undefined) {
        dispatchers.command_noun_phrase.add(pattern, impls.command_noun_phrase, stage);
    }
    if (impls.command_verb_phrase !== undefined) {
        dispatchers.command_verb_phrase.add(pattern, impls.command_verb_phrase, stage);
    }
}

export const render_gist = {
    noun_phrase: (g: Gist): string => dispatchers.noun_phrase.dispatch(g),
    command_noun_phrase: (g: Gist): ConsumeSpec => dispatchers.command_noun_phrase.dispatch(g),
    command_verb_phrase: (g: Gist): ConsumeSpec => dispatchers.command_verb_phrase.dispatch(g)
};

function is_atomic(g: Gist) {
    return Object.keys(g.children ?? {}).length === 0 && Object.keys(g.params ?? {}).length === 0;
}

GistRenderer({}, {
    noun_phrase: (g) => {
        if (!is_atomic(g)) {
            throw new Error(`No noun_phrase renderer matched the compound gist ${gist_to_string(g)}`);
        }
        return g.tag;
    },
    command_noun_phrase: (g) => {
        if (!is_atomic(g)) {
            throw new Error(`No command_noun_phrase renderer matched the compound gist ${gist_to_string(g)}`);
        }
        return g.tag.replace(/ /g, '_');
    },
    command_verb_phrase: (g) => {
        throw new Error(`No command_verb_phrase renderer matched the gist ${gist_to_string(g)}`);
    }
}, 5);
