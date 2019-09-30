import { World } from "../../world";
import { createElement, Component, Renderer } from "../framework/framework";
import { ui_resources } from '../prelude';
import { is_compound_world, MaybeCompoundWorld, group_compound_worlds } from "../../history";
import { AnimationState, animate, update_history_view, start_animations, set_history_view, compute_possible_labels } from "../animation";
import { apply_story_updates, FrameUpdate, with_eph_effects } from "../../text";
import { merge_stages } from "../../stages";
import { update } from "../../update";
import { map_values } from "../../utils";

type HistoryProps = {
    world: World,
    possible_world: World | null,
    animation_state: AnimationState,
    undo_selected: boolean
}

export type History = Component<HistoryProps>;  
export const History: Renderer<HistoryProps> = (props, old?) => {
    const dispatch = ui_resources.get('dispatch');
    const effect = ui_resources.get('effect');
  
    let root: History;

    if (!old) {
        root = <div className="history" /> as History;
        set_history_view(root, props.world.story);
    } else {
        root = old.old_root;
    }

    if (props.animation_state.current_stage !== undefined) {
        const story = update_history_view(
            root,
            props.animation_state.story_updates.get(props.animation_state.current_stage)!
        );
        effect(() => {
            let p = Promise.resolve(start_animations(root, story));
            
            p.then(() => {
                dispatch({ kind: 'AdvanceAnimation' });
            });
        });
    }
    
    if (!old) {
        return root;
    }
    
    // We did an undo. delete extra elements.
    if (props.world.index < old.old_props.world.index) {
        let w = old.old_props.world;
        while (w.index > props.world.index) {
            const elt = root.querySelector(`[data-index="${w.index}"`)!;
            elt.remove();
            w = w.previous!;
        }
    }

    // dim the most recent frame if undo is selected.
    if (props.world.index === old.old_props.world.index &&
        props.undo_selected !== old.old_props.undo_selected) {
        root.querySelector(`[data-index="${props.world.index}"]`)!.classList.toggle('would-undo');
    }

    if (show_possible_css(props) !== show_possible_css(old.old_props)) {
        const updates: FrameUpdate[] = [
            // reverse the old possible labels
            ...possible_css_updates(old.old_props)
                .map(u => update(u, {
                    op: {
                        updates: _ => map_values(_, v => !v)
                    }
                })),
            // apply the new updates
            ...possible_css_updates(props)
        ];
        
        if (updates.length > 0) {
            with_eph_effects(false, () => {
                update_history_view(root, updates);
            });
        }
        
    }
    /*
        Todos
            - compound history
    */

    return root;
}

function show_possible_css(props: HistoryProps) {
    return props.undo_selected ? null : props.possible_world;
}

function possible_css_updates(props: HistoryProps) {
    if (props.undo_selected || props.possible_world === null) {
        return [];
    }
    return compute_possible_labels(props.possible_world);
}
//     let worlds: MaybeCompoundWorld<World>[] = group_compound_worlds(world); //history_array(world).reverse();
  
//     let result = worlds.map((w, i) => {
//       return <HistoryElt
//             key={is_compound_world(w) ? w.root.index : w.index}
//             world={w}
//             current_frame={world.interpretations}
//             possible_interpretations={possible_world === null ? {} : possible_world.interpretations}
//             animation_state={animation_state}
//             elt_index={elt_index}
//             undo_selected={undo_selected}
//             would_undo={i === worlds.length - 1}
//         />;
//     });
  
//     return <div className="history">
//       { result }
//     </div>
// };
  
// type HistoryEltProps = {
//     world: MaybeCompoundWorld<World>,
//     current_frame: HTMLElement,
//     possible_frame: HTMLElement, 
//     animation_state: AnimationState,
//     undo_selected: boolean,
//     would_undo: boolean
// }
// const HistoryElt: React.FunctionComponent<HistoryEltProps> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
//     if (is_compound_world(world)) {
//         return <CompoundHistoryElt
//             world={world}
//             current_interpretations={current_interpretations}
//             possible_interpretations={possible_interpretations}
//             animation_state={animation_state}
//             elt_index={elt_index}
//             undo_selected={undo_selected}
//             would_undo={would_undo}
//         />
//     } else {
//         return <AtomicHistoryElt
//             world={world}
//             current_interpretations={current_interpretations}
//             possible_interpretations={possible_interpretations}
//             animation_state={animation_state}
//             elt_index={elt_index}
//             undo_selected={undo_selected}
//             would_undo={would_undo}
//         />
//     }
// };
  
// const CompoundHistoryElt: React.FunctionComponent<HistoryEltProps & {world: CompoundWorld<World>}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
//     return <div className="compound">
//         { world.root.parsing !== undefined ? <ParsedText parsing={world.root.parsing} /> : '' }
//         <div className="children">
//             { world.children.map(w => <HistoryElt
//                 key={is_compound_world(w) ? w.root.index : w.index}
//                 world={w}
//                 current_interpretations={current_interpretations}
//                 possible_interpretations={possible_interpretations}
//                 animation_state={animation_state}
//                 elt_index={elt_index}
//                 undo_selected={undo_selected}
//                 would_undo={would_undo}
//             />) }
//         </div>
//     </div>;
// }
  
// const AtomicHistoryElt: React.FunctionComponent<HistoryEltProps & {world: World}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
//     const labels = current_interpretations[world.index] || {};
//     const possible_labels = possible_interpretations[world.index] || {};
  
//     let ref = React.useCallback((node: HTMLDivElement) => {
//         elt_index.current[world.index] = node;
//     }, []);
  
//     let animation_stage = animation_state.current_stage;
  
//     let class_labels: { [label: string]: boolean };
//     if (animation_stage === undefined) {
//         class_labels = map_values(filter_values(labels, v => typeof(v.value) !== 'symbol'), v => v.value as boolean);
//     } else {
//         if (
//             animation_state.changes.base_state[world.index] &&
//             animation_state.changes.base_state[world.index].get(animation_stage)
//         ) {
//             class_labels = animation_state.changes.base_state[world.index].get(animation_stage)!;
//         } else {
//             class_labels = {};
//         }
//     }
  
//     if (possible_labels !== undefined) {
//         for (let l of key_union(labels, possible_labels)) {
//             if (label_value(possible_labels, l) &&
//                 (!label_value(labels, l) ||
//                 label_value(possible_labels, l) !== label_value(labels, l))) {
//                 class_labels[`would-add-${l}`] = true;
//             } else if (!label_value(possible_labels, l) && label_value(labels, l) === true) {
//                 class_labels[`would-remove-${l}`] = true;
//             }
//         }
//     }
  
//     if (undo_selected && would_undo) {
//         class_labels['would-add-forgotten'] = true;
//     }
  
//     let className = Object.entries(class_labels).filter(([k, v]) => v === true).map(([k, v]) => k).join(' ');
  
//     let rendering= render_message(
//         world,
//         map_values(class_labels, v => ({ kind: 'Interpretation', value: v })),
//         possible_labels
//     );
  
//     return <div ref={ref} className={className}>
//         { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
//         <OutputText rendering={rendering} />
//     </div>;
//   }