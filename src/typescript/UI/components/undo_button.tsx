import { World } from "../../world";
import { createElement, Component, Renderer } from "../framework/framework";
import { ui_resources } from '../prelude';

export type UndoProps = {
    world: World,
    undo_selected: boolean
};

export type UndoButton = Component<UndoProps>;
export const UndoButton: Renderer<UndoProps> = ({world, undo_selected}, old?) => {
    const dispatch = ui_resources.get('dispatch');
    
    function get_undo_class() {
        let classes = ['undo-button'];
        if (undo_selected) {
            classes.push('selected');
        }
        if (world.previous === null) {
            classes.push('disabled');
        }

        return classes.join(' ');
    }

    if (old === undefined) {
        return <div
            className={get_undo_class()}
            onMouseOver={() => dispatch({kind: 'SelectUndo'})}
            onClick={() => { dispatch({kind: 'SelectUndo'}); dispatch({kind: 'Submit'}); }}
        >
            {String.fromCharCode(10226)} Undo
        </div> as UndoButton;
    }

    if (world.previous !== old.old_props.world.previous
        || undo_selected !== old.old_props.undo_selected) {
        old.old_root.className = get_undo_class();
    }

    return old.old_root;
}