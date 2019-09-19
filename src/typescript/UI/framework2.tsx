/** @jsx createElement */
import { createElement } from './framework';

export type Props = {};

export type Component<P extends Props> = (props: P) => ComponentElement<P>;

export const Update: unique symbol = Symbol('UpdateComponent');
export interface ComponentElement<P extends Props> extends Element {
    [Update]: (props: P) => ComponentElement<P>;
}

import { ParsedText } from './ParsedText';
import { Parsing } from '../parser';

export type PromptProps = {parsing: Parsing, locked: boolean};
export const Prompt: Component<PromptProps> = (props) => {
    let result = <div class="prompt">
        <input value={props.parsing.raw.text} />
        <span>
            <ParsedText parsing={props.parsing} />
            <Cursor locked={props.locked} />
        </span>
    </div> as ComponentElement<PromptProps>;

    result.querySelector('input')!.addEventListener('input', (e) => {
        console.log((e.target as HTMLInputElement).value);
    });

    result[Update] = (new_props) => {
        if (new_props.parsing.raw.text !== props.parsing.raw.text) {
            const input = result.querySelector('input')!;
            input.value = props.parsing.raw.text;
    
            const parsed_text = result.querySelector('span')!.children[0]!;
            parsed_text.replaceWith(<ParsedText parsing={props.parsing} />);
        }
    
        if (props.locked !== props.locked) {
            const cursor = result.querySelector('span')!.children[1] as ElementFor<typeof Cursor>;
            cursor[Update]({locked: props.locked})
        }
    
        return result;            
    }

    return result;
}

type CursorProps = { locked: boolean };
const Cursor: Component<CursorProps> = ({locked}) =>
    <span className={locked ? '' : "blinking-cursor"}>
        {String.fromCharCode(locked ? 8943 : 9608)}
    </span>;

const c = <Cursor locked={true} />

const x = c[UpdateComponent];
