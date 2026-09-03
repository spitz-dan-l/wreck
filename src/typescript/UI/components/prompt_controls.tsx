// Tap controls beside the prompt, for screens without a keyboard: backspace
// the last token, clear the prompt, and enter the command. Each is a plain
// dispatch of the same actions the keyboard produces.
import { createElement, Component, Renderer } from "../framework";
import { ui } from '../prelude';

export type PromptControlsProps = {
    text: string,
    submittable: boolean,
    locked: boolean
};

export type PromptControls = Component<PromptControlsProps>;

// The prompt's text without its last token (and the space before it).
export function without_last_token(text: string): string {
    return text.replace(/\s*\S+\s*$/, '');
}

export const PromptControls: Renderer<PromptControlsProps> = (props, old?) => {
    const dispatch = ui().dispatch;

    function classes(enabled: boolean, name: string) {
        return 'control ' + name + (enabled ? '' : ' disabled');
    }
    function render_classes(root: HTMLElement, p: PromptControlsProps) {
        const has_text = p.text.trim() !== '';
        (root.querySelector('.backspace') as HTMLElement).className = classes(has_text && !p.locked, 'backspace');
        (root.querySelector('.clear') as HTMLElement).className = classes(has_text && !p.locked, 'clear');
        (root.querySelector('.enter') as HTMLElement).className = classes(p.submittable && !p.locked, 'enter');
    }

    if (old === undefined) {
        let current = props;
        const root = <div className="prompt-controls">
            <div className="control backspace" title="delete the last word" on={{
                click: () => { if (current.text.trim() !== '') { dispatch({ kind: 'ChangeText', text: without_last_token(current.text) }); } }
            }}>{String.fromCharCode(9003)}</div>
            <div className="control clear" title="clear" on={{
                click: () => { if (current.text.trim() !== '') { dispatch({ kind: 'ChangeText', text: '' }); } }
            }}>{String.fromCharCode(10005)}</div>
            <div className="control enter" title="enter" on={{
                click: () => { if (current.submittable) { dispatch({ kind: 'Submit' }); } }
            }}>{String.fromCharCode(8629)}</div>
        </div> as PromptControls & { current: PromptControlsProps };
        // The handlers read the latest props through this slot.
        Object.defineProperty(root, 'current', { get: () => current, set: (p: PromptControlsProps) => { current = p; } });
        render_classes(root, props);
        return root;
    }

    (old.old_root as PromptControls & { current: PromptControlsProps }).current = props;
    if (props.text !== old.old_props.text || props.submittable !== old.old_props.submittable || props.locked !== old.old_props.locked) {
        render_classes(old.old_root, props);
    }
    return old.old_root;
}
