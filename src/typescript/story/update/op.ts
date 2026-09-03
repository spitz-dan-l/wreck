/*
    Story ops transform one node of a story tree. Like queries they are plain
    data ({name, parameters}), compiled when applied.

    Each op returns the new node (or nodes, when splicing), and, when given an
    Effects queue, also pushes the equivalent DOM mutation onto it. That is
    what lets the same op drive both the pure story tree and the animated page.
*/
import { Gist, gist_to_string } from 'gist';
import { Effects } from 'lib/effect_utils';
import { map_values, update } from 'lib/utils';
import { eph_new } from 'UI/styles';
import { story_to_dom } from '../dom';
import { Fragment, is_story_node } from '../story';

export type StoryOp = (story_elt: Fragment, effects?: Effects<HTMLElement | Text>) => Fragment | Fragment[];

export type CSSUpdates = { [class_name: string]: boolean };

export type StoryOpName = keyof typeof StoryOps;

export type StoryOpSpec = {
    name: StoryOpName,
    parameters: unknown[]
};

export function story_op<N extends StoryOpName>(name: N, parameters: Parameters<(typeof StoryOps)[N]>): StoryOpSpec {
    return { name, parameters };
}

export function compile_story_update_op(spec: StoryOpSpec): StoryOp {
    const f = StoryOps[spec.name] as (...params: unknown[]) => StoryOp;
    return f(...spec.parameters);
}

// Mark a newly added node so that it animates in.
function animate_new(node: Fragment): Fragment {
    if (!is_story_node(node)) {
        console.warn('Tried to animate adding a TextNode. Should be wrapped in a div or span.');
        return node;
    }
    return update(node, { classes: { [eph_new]: true } });
}

export const StoryOps = {
    add: (children: Fragment | Fragment[], no_animate?: boolean): StoryOp => (parent, effects?) => {
        if (!is_story_node(parent)) {
            throw new Error('Tried to append children to terminal node ' + JSON.stringify(parent));
        }
        const new_children = (children instanceof Array ? children : [children])
            .map(c => no_animate ? c : animate_new(c));
        if (effects) {
            effects.push(dom => {
                for (const c of new_children) {
                    dom.appendChild(story_to_dom(c));
                }
            });
        }
        return update(parent, { children: _ => [..._, ...new_children] });
    },

    insert_after: (siblings: Fragment | Fragment[], no_animate?: boolean): StoryOp => (elt, effects?) => {
        const nodes = (siblings instanceof Array ? siblings : [siblings])
            .map(n => no_animate ? n : animate_new(n));
        if (effects) {
            effects.push(dom => {
                dom.replaceWith(dom, ...nodes.map(story_to_dom));
            });
        }
        return [elt, ...nodes];
    },

    css: (updates: CSSUpdates): StoryOp => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode ' + JSON.stringify(elt));
        }
        const all_updates: CSSUpdates = { ...updates };
        // Mark classes that are changing, so the change can be animated.
        for (const [cls, on] of Object.entries(updates)) {
            if (!!on !== !!elt.classes[cls]) {
                all_updates[`eph_${on ? 'adding' : 'removing'}_${cls}`] = true;
            }
        }
        if (effects) {
            effects.push(dom => {
                for (const [cls, on] of Object.entries(all_updates)) {
                    (dom as HTMLElement).classList.toggle(cls, on);
                }
            });
        }
        return update(elt, { classes: all_updates });
    },

    remove_eph: (): StoryOp => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update CSS on non-StoryNode ' + JSON.stringify(elt));
        }
        return update(elt, {
            classes: _ => map_values(_, (on, cls) => {
                if (on && cls.startsWith('eph')) {
                    if (effects) {
                        effects.push(dom => { (dom as HTMLElement).classList.remove(cls); });
                    }
                    return false;
                }
                return on;
            })
        });
    },

    remove: (): StoryOp => (elt, effects?) => {
        if (effects) {
            effects.push(dom => dom.remove());
        }
        return [];
    },

    replace: (replacement: Fragment[]): StoryOp => (elt, effects?) => {
        if (effects) {
            effects.push(dom => {
                dom.replaceWith(...replacement.map(story_to_dom));
            });
        }
        return replacement;
    },

    replace_children: (replacement: Fragment[]): StoryOp => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to replace the children on a non-story-node element.');
        }
        if (effects) {
            effects.push(dom => {
                dom.childNodes.forEach(c => c.remove());
                for (const new_elt of replacement.map(story_to_dom)) {
                    dom.appendChild(new_elt);
                }
            });
        }
        return update(elt, { children: () => replacement });
    },

    set_gist: (g: Gist): StoryOp => (elt, effects?) => {
        if (!is_story_node(elt)) {
            throw new Error('Tried to update the gist on a non-story-node element.');
        }
        if (effects) {
            effects.push(dom => {
                (dom as HTMLElement).dataset.gist = gist_to_string(g);
            });
        }
        return update(elt, { data: { gist: () => g } });
    }
};
