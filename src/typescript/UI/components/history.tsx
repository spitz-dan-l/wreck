import { World } from "../../world";
import { createElement, Component, Renderer } from "../framework";
import { ui_resources } from '../prelude';
import { is_compound_world, MaybeCompoundWorld, group_compound_worlds, history_array } from "../../history";
import { AnimationState, animate, final_story, compute_possible_effects } from "../animation";
import { apply_story_updates_all, StoryUpdateSpec, apply_story_updates_stage, story_to_dom, ReversibleUpdateSpec, story_update, query, story_op, remove_eph, Story } from "../../story";
import { merge_stages } from "../../stages";
import { map_values, array_last, update } from "../../utils";
import { Effects, request_animation_frame } from "../../effect_utils";

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
    const effect_promise = ui_resources.get('effect_promise');

    let root: History;

    if (!old) {
        const first_world = array_last(history_array(props.world))!;
        root = set_history_view_from_scratch(first_world.story);
    } else {
        root = old.old_root;
    }

    const anim = props.animation_state;
    if (anim.current_stage !== undefined) {
        const dom_effects = new Effects(root);
        
        let updated_story = apply_story_updates_stage(
            anim.current_story!,
            anim.update_plan.get(anim.current_stage)!,
            dom_effects
        );
        
        dom_effects.push(async dom => {
            await effect_promise();
            await animate(dom);
            return dom;
        })

        updated_story = remove_eph(updated_story, dom_effects);

        dom_effects.push(() => dispatch({ kind: 'AdvanceAnimation', next_story: updated_story }));
        return root;
    }

    let story = final_story(props.world);
    
    if (!old || props.world.index < old.old_props.world.index) {
        root = set_history_view_from_scratch(story, root) as History;
    }

    const would_effects: ReversibleUpdateSpec[] = [];
    // dim the most recent frame if undo is selected.
    if (props.world.index === (old ? old.old_props.world.index : undefined) &&
        props.undo_selected !== (old ? old.old_props.undo_selected : undefined)) {
        would_effects.push(story_update(
            query('frame', { index: props.world.index }),
            story_op('css', { updates: { 'would-undo': props.undo_selected }})
        ));        
    }

    if (!old || show_possible_effects(old.old_props) !== show_possible_effects(props)) {
        if (old) {
            // reverse the old possible labels
            const reversed_old_possible_effects = possible_effects(old.old_props)
                .map(u => update(u, { op: { parameters: {
                    updates: _ => map_values(_, v => !v)
                } } }));
            would_effects.push(...reversed_old_possible_effects);
        }
        would_effects.push(...possible_effects(props));
    }

    if (would_effects.length > 0) {
        const dom_effects = new Effects(root);
        story = apply_story_updates_stage(story, would_effects, dom_effects);
        remove_eph(story, dom_effects);
    }

    return root;
}

export function set_history_view_from_scratch(story: Story, root?: History): History {
    const result = story_to_dom(story);
    if (root) {
        root.replaceWith(result);
    }

    return result as History;
}

function show_possible_effects(props: HistoryProps) {
    return props.undo_selected ? null : props.possible_world;
}

function possible_effects(props: HistoryProps) {
    if (props.undo_selected || props.possible_world === null) {
        return [];
    }
    return compute_possible_effects(props.world, props.possible_world);
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