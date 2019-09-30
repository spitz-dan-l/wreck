import { Parsing } from '../../parser';
import { child_declarator_for, Component, createElement, Renderer } from '../framework/framework';
import { ui_resources } from '../prelude';
import { ParsedText } from './parsed_text';


export type InputPromptProps = {parsing: Parsing, locked: boolean};
export type InputPrompt = Component<InputPromptProps>;

const input_prompt_child = child_declarator_for<InputPrompt>();

const input_prompt_input = input_prompt_child((root) => root.querySelector('input')!)

const input_prompt_text = input_prompt_child<ParsedText>(
    (root) => root.querySelector('.parsed-text')! as ParsedText,
    ({parsing}) => ({parsing}),
    ParsedText);

const input_prompt_cursor = input_prompt_child(
    (root) => root.querySelector('.cursor')! as Cursor,
    ({locked}) => ({locked}),
    (props, old?) => Cursor(props, old));

export const InputPrompt: Renderer<InputPromptProps> = (props, old?) => {
    const dispatch = ui_resources.get('dispatch');

    if (old === undefined) {
        let result = <div class="input-prompt">
            <input value={props.parsing.raw.text} />
            <span>
                <input_prompt_text.render {...props} />
                <input_prompt_cursor.render {...props} />
            </span>
        </div> as InputPrompt;

        input_prompt_input.get(result).addEventListener('input', (e) => {
            dispatch({
                kind: 'ChangeText',
                text: (e.target as HTMLInputElement).value
            });
        });

        return result;
    }

    if (props.parsing.raw.text !== old.old_props.parsing.raw.text) {
        const input = input_prompt_input.get(old.old_root);
        input.value = props.parsing.raw.text;

        input_prompt_text.render(props, old);
    }

    input_prompt_cursor.render(props, old);

    return old.old_root;
}

type CursorProps = { locked: boolean };
type Cursor = Component<CursorProps>;

const Cursor: Renderer<CursorProps> = ({locked}, old?) => {
    if (old === undefined || old.old_props.locked !== locked) {
        return <span className={'cursor ' + (locked ? '' : "blinking-cursor")}>
            {String.fromCharCode(locked ? 8943 : 9608)}
        </span> as Cursor;
    }
    return old.old_root;
}