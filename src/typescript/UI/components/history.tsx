import { World } from "../../world";
import { createElement, Component, Renderer } from "../framework";
import { ui_resources } from '../prelude';
import { is_compound_world } from "../../history";
import { AnimationState } from "../animation";

type HistoryProps = {
    world: World,
    possible_world: World | null,
    animation_state: AnimationState,
    undo_selected: boolean
}
  
export type History = Component<HistoryProps>;  
export const History: Renderer<HistoryProps> = ({world, possible_world, animation_state, undo_selected}) => {
    const dispatch = ui_resources.get('dispatch');
    const effect = ui_resources.get('effect');
  
    const animation_stage = animation_state.current_stage;
  
    effect(() => {
      if (animation_stage === undefined) {
        return;
      }
  
      let current_changes = animation_state.changes.label_changes.get(animation_stage)!;
  
      let ps = Promise.all(Object.entries(current_changes).map(([i, changes]) =>
        animate(elt_index.current[i as unknown as number], changes)
      ))
  
      ps.then(() => {
        dispatch({ kind: 'AdvanceAnimation' });
      });
    });
  
    let worlds: MaybeCompoundWorld<World>[] = group_compound_worlds(world); //history_array(world).reverse();
  
    let result = worlds.map((w, i) => {
  
      return <HistoryElt
              key={is_compound_world(w) ? w.root.index : w.index}
              world={w}
              current_interpretations={world.interpretations}
              possible_interpretations={possible_world === null ? {} : possible_world.interpretations}
              animation_state={animation_state}
              elt_index={elt_index}
              undo_selected={undo_selected}
              would_undo={i === worlds.length - 1}
            />;
    });
  
    return <div className="history">
      { result }
    </div>
  };
  
  type HistoryEltProps = {
    world: MaybeCompoundWorld<World>,
    current_interpretations: Interpretations,
    possible_interpretations: Interpretations,
    animation_state: AnimationState,
    elt_index: React.MutableRefObject<{ [index: number]: HTMLDivElement }>,
    undo_selected: boolean,
    would_undo: boolean
  }
  const HistoryElt: React.FunctionComponent<HistoryEltProps> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
    if (is_compound_world(world)) {
      return <CompoundHistoryElt
        world={world}
        current_interpretations={current_interpretations}
        possible_interpretations={possible_interpretations}
        animation_state={animation_state}
        elt_index={elt_index}
        undo_selected={undo_selected}
        would_undo={would_undo}
      />
    } else {
      return <AtomicHistoryElt
        world={world}
        current_interpretations={current_interpretations}
        possible_interpretations={possible_interpretations}
        animation_state={animation_state}
        elt_index={elt_index}
        undo_selected={undo_selected}
        would_undo={would_undo}
  
      />
    }
  };
  
  const CompoundHistoryElt: React.FunctionComponent<HistoryEltProps & {world: CompoundWorld<World>}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
    return <div className="compound">
      { world.root.parsing !== undefined ? <ParsedText parsing={world.root.parsing} /> : '' }
      <div className="children">
        { world.children.map(w => <HistoryElt
            key={is_compound_world(w) ? w.root.index : w.index}
            world={w}
            current_interpretations={current_interpretations}
            possible_interpretations={possible_interpretations}
            animation_state={animation_state}
            elt_index={elt_index}
            undo_selected={undo_selected}
            would_undo={would_undo}
          />) }
      </div>
    </div>;
  }
  
  const AtomicHistoryElt: React.FunctionComponent<HistoryEltProps & {world: World}> = ({world, current_interpretations, possible_interpretations, animation_state, elt_index, undo_selected, would_undo}) => {
    const labels = current_interpretations[world.index] || {};
    const possible_labels = possible_interpretations[world.index] || {};
  
    let ref = React.useCallback((node: HTMLDivElement) => {
      elt_index.current[world.index] = node;
    }, []);
  
    let animation_stage = animation_state.current_stage;
  
    let class_labels: { [label: string]: boolean };
    if (animation_stage === undefined) {
      class_labels = map_values(filter_values(labels, v => typeof(v.value) !== 'symbol'), v => v.value as boolean);
    } else {
      if (
        animation_state.changes.base_state[world.index] &&
        animation_state.changes.base_state[world.index].get(animation_stage)
      ) {
        class_labels = animation_state.changes.base_state[world.index].get(animation_stage)!;
      } else {
        class_labels = {};
      }
    }
  
    if (possible_labels !== undefined) {
      for (let l of key_union(labels, possible_labels)) {
        if (label_value(possible_labels, l) &&
              (!label_value(labels, l) ||
               label_value(possible_labels, l) !== label_value(labels, l))) {
          class_labels[`would-add-${l}`] = true;
        } else if (!label_value(possible_labels, l) && label_value(labels, l) === true) {
          class_labels[`would-remove-${l}`] = true;
        }
      }
    }
  
    if (undo_selected && would_undo) {
      class_labels['would-add-forgotten'] = true;
    }
  
    let className = Object.entries(class_labels).filter(([k, v]) => v === true).map(([k, v]) => k).join(' ');
  
    let rendering= render_message(
      world,
      map_values(class_labels, v => ({ kind: 'Interpretation', value: v })),
      possible_labels
    );
  
    return <div ref={ref} className={className}>
      { world.parsing !== undefined ? <ParsedText parsing={world.parsing} /> : '' }
      <OutputText rendering={rendering} />
    </div>;
  }