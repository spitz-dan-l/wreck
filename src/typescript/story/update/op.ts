import { Fragment, is_story_node } from "../story";
import { story_to_dom } from '../dom';

import { Effects } from "../../effect_utils";

import { update, append, map_values } from "../../utils";
import { ParametersFor } from "../../dsl_utils";
import { Gist, gist_to_string } from "../../gist";
import { P } from "ts-toolbelt/out/types/src/Object/_api";

export type StoryOp = (story_elt: Fragment, effects?: Effects<HTMLElement | Text>) => Fragment | Fragment[]

export interface StoryOps {
    add: (children: Fragment | Fragment[], no_animate?: boolean) => StoryOp;
    remove: () => StoryOp;
    css: (updates: CSSUpdates) => StoryOp;
    remove_eph: () => StoryOp;
    replace: (replacement: Fragment[]) => StoryOp;
    insert_after: (siblings: Fragment | Fragment[], no_animate?: boolean) => StoryOp;
    set_gist: (gist: Gist) => StoryOp;
}

export type CSSUpdates = {
    [class_name: string]: boolean;
};

export type StoryOpParams = ParametersFor<StoryOps>;

export type StoryOpSpecs = {
    [K in keyof StoryOpParams]: {
        name: K,
        parameters: StoryOpParams[K]
    }
};

export type StoryOpSpec = StoryOpSpecs[keyof StoryOpSpecs];

export function story_op<O extends keyof StoryOpParams>(name: O, ...parameters: StoryOpParams[O]): StoryOpSpec {
    return  { name, parameters } as StoryOpSpecs[O];
}

export const StoryUpdateOps: StoryOps = {
    add: (children, no_animate?) => (parent, effects?) => {
        if (!is_story_node(parent)) {
            throw new Error('Tried to append children to terminal node '+JSON.stringify(parent));
        }
        if (children instanceof Array) {
            return children.reduce((p, c) => StoryUpdateOps.add(c, no_animate)(p, effects), parent);
        }
        
        if (!no_animate && is_story_node(children)){
            children = update(children, {
                classes: { ['eph-new']: true }
            });
        }
        
        if (effects) {
            effects.push(dom => {
                const child_dom = story_to_dom(children as Fragment);
                dom.appendChild(child_dom);
            });
        }
        return update(parent, {
            children: append(children)
        });
    },
    insert_after: (nodes, no_animate?) => (elt, effects?) => {
        if (!no_animate) {
            const add_animation_class = (node: Fragment) => {
                if (!is_story_node(node)) {
                    return node;
                }
                return update(node, {
                    classes: { ['eph-new']: true }
                })
            }
            
            if (nodes instanceof Array) {
                nodes = nodes.map(add_animation_class);
            } else {
                nodes = add_animation_class(nodes);
            }
        }
        if (effects) {
            effects.push(dom => {
                if (nodes instanceof Array) {
                    dom.replaceWith(dom, ...nodes.map(story_to_dom));    
                } else {
                    dom.replaceWith(dom, story_to_dom(nodes));
                }
            })
        }
        if (nodes instanceof Array) {
            return [elt, ...nodes];
        } else {
            return [elt, nodes];
        }
    },
    css: (updates) => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode '+JSON.stringify(elt));
        }
        updates = {...updates};
        for (const [cls, on] of Object.entries(updates)) {
            if (!!on !== !!elt.classes[cls]) {
                updates[`eph-${on ? 'adding' : 'removing'}-${cls}`] = true;
            }
        }
        if (effects) {
            effects.push(dom => {
                for (const [cls, on] of Object.entries(updates)) {
                    (dom as HTMLElement).classList.toggle(cls, on);
                }
            });
        }
        return update(elt, {
            classes: updates
        });
    },
    remove_eph: () => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode '+JSON.stringify(elt));
        }
        
        return update(elt, {
            classes: _ => map_values(_, (on, cls) => {
                if (on && cls.startsWith('eph-')) {
                    if (effects) {
                        effects.push(dom => {
                            (dom as HTMLElement).classList.remove(cls);
                        });
                    }
                    return false;
                }
                return on;

            })
        });
    },
    remove: () => (elt, effects?) => {
        if (effects) {
            effects.push(dom => dom.remove());
        }
        return [];
    },
    replace: (replacement) => (elt, effects?) => {
        if (effects) {
            effects.push(dom => {
                if (replacement instanceof Array) {
                    dom.replaceWith(...replacement.map(story_to_dom));    
                } else {
                    dom.replaceWith(story_to_dom(replacement));
                }
            });
        }
        return replacement;
    },
    set_gist: (gist) => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update the gist on a non-story-node element.');
        }
        if (effects) {
            effects.push(dom => {
                (dom as HTMLElement).dataset.gist = gist_to_string(gist);
            });
        }
        return update(elt, {
            data: { gist: () => gist }
        })
    }
}

export function compile_story_update_op(op_spec: StoryOpSpec): StoryOp {
    return (StoryUpdateOps[op_spec.name] as (...params: StoryOpSpec['parameters']) => StoryOp)(...op_spec.parameters);
}

