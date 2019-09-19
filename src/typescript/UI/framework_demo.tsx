/** @jsx createElement */
import { createElement, Renderer, UpdateComponent, Component, ComponentFor, Props, Getter, is_component } from './framework';

import { ParsedText } from './ParsedText';
import { Parsing } from '../parser';

type ParsedText = ComponentFor<typeof ParsedText>

export type PromptProps = {parsing: Parsing, locked: boolean};
export type Prompt = Component<PromptProps>;



const prompt_input: Getter<Prompt, HTMLInputElement> = (root) =>
    root.querySelector('input')!;

const prompt_text: Getter<Prompt, ParsedText> = (root) =>
    root.querySelector('span')!.children[0]! as ParsedText;

const prompt_cursor: Getter<Prompt, Cursor> = (root) =>
    root.querySelector('span')!.children[1] as Cursor;


export const Prompt: Renderer<PromptProps> = (props, old?) => {
    if (old === undefined) {
        let result = <div class="prompt">
            <input value={props.parsing.raw.text} />
            <span>
                <ParsedText parsing={props.parsing} />
                <Cursor locked={props.locked} />
            </span>
        </div>;

        prompt_input(result as Prompt).addEventListener('input', (e) => {
           console.log((e.target as HTMLInputElement).value);
        });

        return result;
    }

    if (props.parsing.raw.text !== old.old_props.parsing.raw.text) {
        const input = prompt_input(old.old_root);
        input.value = props.parsing.raw.text;

        const parsed_text = prompt_text(old.old_root);
        parsed_text.replaceWith(<ParsedText parsing={props.parsing} />);
    }

    const cursor = prompt_cursor(old.old_root);
    cursor[UpdateComponent]!({
        locked: old.old_props.locked
    })

    return old.old_root;
}

type CursorProps = { locked: boolean };
type Cursor = Component<CursorProps>;

const Cursor: Renderer<CursorProps> = ({locked}, old?) => {
    if (old === undefined || old.old_props.locked !== locked) {
        return <span className={locked ? '' : "blinking-cursor"}>
            {String.fromCharCode(locked ? 8943 : 9608)}
        </span>;
    }
    return old.old_root;
}

const c1 = <div></div>;
const c = <Cursor locked={true} />

if (is_component(c)) {
    const x = c[UpdateComponent];
}