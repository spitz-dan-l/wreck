import { history_array } from "history";
import { make_consecutive, stages, stage_keys } from "lib/stages";
import { update } from "lib/utils";
import { apply_story_updates_all, Story, StoryUpdatePlan, StoryUpdateSpec, compile_story_update_group_ops } from "story";
import { World } from "world";
import { eph_new, animation_pre_compute, animation_start, animation_active } from './styles';
import { GLOBAL_DEV_TOOLS } from 'devtools';

declare module 'devtools' {
    interface GlobalDevTools {
        // The last scroll decision, for the browser harness (scripts/browse_fire.js).
        last_scroll?: unknown;
    }
}

export type AnimationState = {
    update_plan: StoryUpdatePlan['effects'],
    current_stage: number | undefined,
    current_story: Story | undefined,
    lock_input: boolean
}
  
export const empty_animation_state: AnimationState = {
    update_plan: stages(),
    current_stage: undefined,
    current_story: undefined,
    lock_input: false
};
  
// The changes of the command being animated, across its stages (each stage
// animates and decides the scroll; the decision is over everything the
// command changed so far, so that a later stage does not undo an earlier
// stage's view). Element to its natural top when it was marked.
let command_changes = new Map<HTMLElement, number>();

export function new_animation_state(world: World, previous_world: World | undefined): AnimationState {
    command_changes = new Map();
    // produce a new AnimationState object according to the changes, with stage set to the lowest included stage
    const index_threshold = previous_world ? previous_world.index : -1;//world.index - 1;
    const new_frames = history_array(world).filter(w => w.index > index_threshold).reverse();
    const story_updates = make_consecutive(new_frames.map(w => compile_story_update_group_ops(w.story_updates).effects));
    let stages = stage_keys(story_updates);
    let current_stage: number | undefined = stages[0];
    return {
        update_plan: story_updates,
        current_stage,
        current_story: new_frames[0].story,
        lock_input: stages.length > 0 };
}
  
export function advance_animation(state: AnimationState, next_story: Story) {
    let stages = stage_keys(state.update_plan);
    let next_stage = stages[stages.indexOf(state.current_stage!) + 1];
    return update(state, {
        current_stage: next_stage,
        current_story: next_story,
        lock_input: next_stage !== undefined
    });
}

export function final_story(world: World) {
    return apply_story_updates_all(world.story, world.story_updates);
}

export function compute_possible_effects(world: World, possible_world: World): StoryUpdateSpec[] {
    const p_worlds = history_array(possible_world).filter(w => w.index >= world.index);
    return p_worlds.reverse().flatMap(p => compile_story_update_group_ops(p.story_updates).would_effects);
} 

// export function compute_possible_effects(world: World, possible_world: World): ReversibleUpdateSpec[] {
//     const p_worlds = history_array(possible_world).filter(w => w.index > world.index);

//     const result: StoryUpdateSpec[] = [];
//     for (const p_world of p_worlds) {
//         for (const w_ef of p_world.story_updates.would_effects) {
//             const matches = compile_story_query(w_ef.query)(p_world.story);
//             for (const [m, p] of matches) {
//                 if (!is_story_node(m)) {
//                     continue;
//                 }
//                 if (find_node(world.story, (n => is_story_node(n) && n.key === m.key)) !== null) {
//                     result.push(story_update(
//                         story_query('key', m.key),
//                         w_ef.op
//                     ))
//                 }
//             }
//         }
//     }
//     return result;
// }

export function animate(comp_elt: HTMLElement) {
    return new Promise<void>((resolve) => {
        // Momentarily apply the animation-pre-compute class
        // to accurately measure the target maxHeight
        // and check for the custom --is-collapsing property
        // (This is basically an abomination and I am sorry.)
        //
        comp_elt.classList.add(animation_pre_compute);

        walkElt(comp_elt, (e) => { if (!keeps_own_height(e)) { e.dataset.maxHeight = `${e.scrollHeight}px`; } });

        // A node that is about to be hidden (a fold: --is-collapsing set on it
        // by the stylesheet while it is still displayed) gets its measured
        // max-height at the start of the animation, so that the transition to
        // 0 has somewhere to start from; every other node gets it a frame
        // later, so that a new node's transition from 0 has somewhere to go.
        for (const marked of comp_elt.querySelectorAll<HTMLElement>('[class*="eph_adding_"], [class*="eph_removing_"]')) {
            walkElt(marked, e => {
                if (getComputedStyle(e).getPropertyValue('--is-collapsing').trim() === '1') {
                    e.dataset.isCollapsing = '1';
                }
            });
        }
        // Where each changed node stands before the folds close (a folded node
        // has no box afterwards, but its top does not move). Every marked node:
        // whether a class change shows is judged on the final layout, not here,
        // where the stylesheet keeps the folding nodes displayed to measure them.
        const natural_tops = natural_positions(marked_elements(comp_elt));

        comp_elt.classList.remove(animation_pre_compute);

        // The page is now laid out as it will be when the animation ends (the
        // folds closed, the new nodes at full size): decide where the view
        // goes and start moving, so the motion and the change are one.
        const target = scroll_target_after(comp_elt, natural_tops);
        scroll_to_target(target);
        const terminal = terminal_elt();
        const final_height = terminal === null ? 0 : terminal.scrollHeight;

        // A change that will not be in view is made at once: a fold closed, a
        // node at its full size, nothing in transition (history.css .eph-unseen).
        const unseen = target === undefined ? [] : target.unseen;
        for (const e of unseen) {
            walkElt(e, d => {
                d.classList.add('eph-unseen');
                d.dataset.unseen = has_box(d) ? 'grown' : 'folded';
            });
        }

        comp_elt.classList.add(animation_start);

        walkElt(comp_elt, (e) => {
            if (e.dataset.maxHeight === undefined) {
                return;
            }
            if (e.dataset.unseen === 'folded') {
                e.style.maxHeight = '0px';
            } else if (e.dataset.isCollapsing === '1' || e.dataset.unseen === 'grown') {
                e.style.maxHeight = e.dataset.maxHeight as any;
            }
        });
        // The new nodes start from nothing, which makes the page shorter than
        // it will be; hold its final height so the motion is not cut short.
        if (terminal !== null) {
            const shrunk = final_height - terminal.scrollHeight;
            if (shrunk > 0) {
                comp_elt.style.paddingBottom = `${shrunk}px`;
            }
        }
        requestAnimationFrame(() => {
            walkElt(comp_elt, (e) => {
                if (e.dataset.maxHeight !== undefined && e.dataset.isCollapsing !== '1' && e.dataset.unseen === undefined) {
                    e.style.maxHeight = e.dataset.maxHeight as any;
                }
            });

            comp_elt.classList.add(animation_active);

            setTimeout(() => {
                comp_elt.classList.remove(animation_start, animation_active);

                walkElt(comp_elt, (e) => {
                    e.style.maxHeight = '';
                    delete e.dataset.maxHeight;
                    delete e.dataset.isCollapsing;
                    delete e.dataset.unseen;
                    e.classList.remove('eph-unseen');
                });

                comp_elt.style.paddingBottom = '';
                // Finish the motion if anything cut it short.
                scroll_to_target(target);
                resolve();
            }, 700)
        });
    });
}

// A node that scrolls on its own or is pinned (the steps column, the prompt
// and its typeahead) keeps the height its stylesheet gives it: an inline
// max-height would let the phone's pinned panel balloon during every
// animation (Phase B11).
function keeps_own_height(e: HTMLElement): boolean {
    return e.id === 'story-hole' || e.matches('#story-hole *, .columns .right, .columns .right *');
}

function walkElt(elt: HTMLElement, f: (e: HTMLElement) => void){
    let children = elt.children;
    for (let i = 0; i < children.length; i++) {
        let child = children.item(i);
        walkElt(child as HTMLElement, f);
    }
    f(elt);
}

/*
    SCROLLING (Phase B10). One rule, after the animation, in one smooth motion:

    - Nothing changed outside the prompt: scroll so the prompt is at the bottom
      (`scroll_down`), the new frame above it.
    - Something changed above (a badge, a fold, the notation revealed): if the
      topmost such change and the prompt fit in the view together, scroll so
      the prompt is at the bottom and the change is above it. If they do not
      fit, and the response at the prompt is short (a line or two: the change
      above is the response), scroll so the topmost change is at the top of
      the view, under any pinned panel; the prompt, pinned at the bottom of
      the view by the stylesheet (`#story-hole { position: sticky }`), stays in
      sight. If the response at the prompt is itself long (a new board, an
      apply text, a reprint), it wins and the prompt scrolls to the bottom.
    - Never past the change: the change's top is never above the view's top.
    - A class change that shows nothing (a bookkeeping class) is not a change.

    The target is decided on the final layout before the animation starts and
    the motion runs with it (one motion, the change and the view arriving
    together); if the page was shorter while new nodes grew, the motion is
    finished when they have.

    "In view" is what is painted: a change under the pinned steps column or
    the pinned prompt is not in view, and a change inside a column that
    scrolls on its own is scrolled into that column's view.

    Chromium and Safari both apply sticky offsets to getBoundingClientRect,
    so natural positions are read with the sticky elements made static for a
    moment (`#terminal.measuring`).
*/
const SCROLL_MARGIN_PX = 8;
const SHORT_RESPONSE_EM = 9;
const PROMPT_LINE_EM = 4;   // the prompt's own line and its first option: what must stay in view of the pinned prompt

function terminal_elt(): HTMLElement | null {
    return document.getElementById('terminal');
}

function measuring<T>(f: () => T): T {
    const t = terminal_elt();
    if (t === null) {
        return f();
    }
    t.classList.add('measuring');
    try {
        return f();
    } finally {
        t.classList.remove('measuring');
    }
}

function doc_top(e: HTMLElement, t: HTMLElement): number {
    return e.getBoundingClientRect().top - t.getBoundingClientRect().top + t.scrollTop;
}

// The classes this command added to and removed from a node, by its markers.
function class_changes(e: HTMLElement): { added: string[], removed: string[] } {
    const added: string[] = [], removed: string[] = [];
    e.classList.forEach(c => {
        if (c.startsWith('eph_adding_')) { added.push(c.slice('eph_adding_'.length)); }
        if (c.startsWith('eph_removing_')) { removed.push(c.slice('eph_removing_'.length)); }
    });
    return { added, removed };
}

const LOOKS = ['display', 'visibility', 'opacity', 'color', 'background-color', 'border-left-color', 'border-top-color', 'border-bottom-color', 'text-decoration-line', 'font-weight', 'font-style'];

function looks(e: HTMLElement): string {
    const cs = getComputedStyle(e);
    return LOOKS.map(p => cs.getPropertyValue(p)).join('|') + '|' + e.offsetHeight;
}

// Does the class change on this node show? (A voice class on a column, a
// bookkeeping class on a frame: the same to the eye, so not a place to look.)
function class_change_shows(e: HTMLElement): boolean {
    const { added, removed } = class_changes(e);
    if (added.length === 0 && removed.length === 0) {
        return true;
    }
    // Undoing a fold for a moment can make the page shorter and clamp the scroll: keep it.
    const t = terminal_elt();
    const scroll = t === null ? 0 : t.scrollTop;
    const after = looks(e);
    for (const c of added) { e.classList.remove(c); }
    for (const c of removed) { e.classList.add(c); }
    const before = looks(e);
    for (const c of added) { e.classList.add(c); }
    for (const c of removed) { e.classList.remove(c); }
    if (t !== null && t.scrollTop !== scroll) {
        t.scrollTop = scroll;
    }
    return before !== after;
}

function has_change_marker(e: HTMLElement): boolean {
    let changed = false;
    e.classList.forEach(c => {
        if (c.startsWith('eph_adding_') || c.startsWith('eph_removing_') || c === eph_new) {
            changed = true;
        }
    });
    return changed;
}

// The nodes this command changed, outside the prompt, outermost only. A node
// that holds the prompt counts only when it is new (a board opened around the
// prompt): a class on the board is not a place to look. `shows` asks whether
// a class change can be seen; the marked nodes are collected without that
// question where the layout is not the final one.
function marked_elements(comp_elt: HTMLElement, shows: boolean = false): HTMLElement[] {
    const hole = document.getElementById('story-hole');
    const all: HTMLElement[] = [];
    walkElt(comp_elt, e => {
        if (e === comp_elt || (hole !== null && (e === hole || hole.contains(e)))) {
            return;
        }
        if (hole !== null && e.contains(hole) && !e.classList.contains(eph_new)) {
            return;
        }
        // A line (the rule beside the column) is not a place to look.
        const r = e.getBoundingClientRect();
        if ((r.width > 0 || r.height > 0) && (r.width <= 4 || r.height <= 4)) {
            return;
        }
        if (has_change_marker(e) && (!shows || e.classList.contains(eph_new) || class_change_shows(e))) {
            all.push(e);
        }
    });
    return all.filter(e => !all.some(o => o !== e && o.contains(e)));
}

function changed_elements(comp_elt: HTMLElement): HTMLElement[] {
    return marked_elements(comp_elt, true);
}

function has_box(e: HTMLElement): boolean {
    const r = e.getBoundingClientRect();
    return r.width > 0 || r.height > 0;
}

// The natural tops of the nodes that have a box (a node hidden by the
// stylesheet is not a place a person can look).
function natural_positions(elts: HTMLElement[]): Map<HTMLElement, number> {
    const t = terminal_elt();
    const result = new Map<HTMLElement, number>();
    if (t === null) {
        return result;
    }
    measuring(() => {
        for (const e of elts) {
            if (has_box(e)) {
                result.set(e, doc_top(e, t));
            }
        }
    });
    return result;
}

function clamp_scroll(t: HTMLElement, top: number): number {
    return Math.max(0, Math.min(top, t.scrollHeight - t.clientHeight));
}

// The scroll at which the prompt's bottom is at the bottom of the view.
function scroll_down_target(t: HTMLElement): number {
    const hole = document.getElementById('story-hole');
    const bottom = hole === null ? document.querySelector('.typeahead .footer') as HTMLElement | null : hole;
    if (bottom === null) {
        return t.scrollHeight;
    }
    return measuring(() => clamp_scroll(t, t.scrollTop + bottom.getBoundingClientRect().bottom - t.getBoundingClientRect().bottom));
}

function scroll_terminal_to(t: HTMLElement, top: number) {
    if (Math.abs(top - t.scrollTop) < 2) {
        return;
    }
    t.scrollTo({ top, behavior: 'smooth' });
}

// Where the view goes, and what will not be in view when it gets there:
// those changes have no reason to animate, and if none of the changes above
// will be shown the view has no reason to move visibly either — it is
// re-set at once, so that what is in view stays put while the page changes
// above it.
export type ScrollTarget = { top: number, unseen: HTMLElement[], instant: boolean } | undefined;

function scroll_to_target(target: ScrollTarget) {
    const t = terminal_elt();
    if (t === null || target === undefined) {
        return;
    }
    const top = clamp_scroll(t, target.top);
    if (target.instant) {
        if (Math.abs(top - t.scrollTop) >= 2) {
            t.scrollTo({ top, behavior: 'auto' });
        }
        return;
    }
    scroll_terminal_to(t, top);
}

export function scroll_down() {
    const t = terminal_elt();
    if (t === null) {
        return;
    }
    scroll_terminal_to(t, scroll_down_target(t));
}

// The pinned, self-scrolling column an element is in (or is).
function sticky_panel_of(e: HTMLElement): HTMLElement | null {
    let p: HTMLElement | null = e;
    while (p !== null && p.id !== 'terminal') {
        if (getComputedStyle(p).position === 'sticky') {
            return p;
        }
        p = p.parentElement;
    }
    return null;
}

// Is the element painted in the view at the current scroll? A box that is
// covered (the pinned steps column, the pinned prompt, a column's own
// scrolling) is not.
function painted_in_view(e: HTMLElement, top_if_boxless: number, t: HTMLElement): boolean {
    // A node folded inside a pinned column has no box, and its place in the
    // flow says nothing under a sticky offset: its step stands for it.
    if (!has_box(e) && sticky_panel_of(e) !== null && e.parentElement !== null && has_box(e.parentElement)) {
        return painted_in_view(e.parentElement, top_if_boxless, t);
    }
    const v = t.getBoundingClientRect();
    const r = e.getBoundingClientRect();
    const hole = document.getElementById('story-hole');
    const covers = (hit: Element | null) =>
        hit !== null && !e.contains(hit) && !hit.contains(e)
        && ((hole !== null && hole.contains(hit)) || hit.closest('.columns .right') !== null || sticky_panel_of(e) !== null);
    if (r.width === 0 && r.height === 0) {
        // Folded: its top is where it was; look at what is painted there.
        const y = top_if_boxless - t.scrollTop + v.top;
        if (y < v.top || y > v.bottom - SCROLL_MARGIN_PX) {
            return false;
        }
        const parent = e.parentElement;
        const x = parent === null ? v.left + 40 : Math.min(v.right - 1, parent.getBoundingClientRect().left + 20);
        const hit = document.elementFromPoint(x, Math.min(v.bottom - 1, y + 4));
        return !(hit !== null && ((hole !== null && hole.contains(hit)) || (hit.closest('.columns .right') !== null && !hit.contains(e))));
    }
    const top = Math.max(r.top, v.top), bottom = Math.min(r.bottom, v.bottom);
    const visible = bottom - top;
    if (visible < Math.min(r.height, 24)) {
        return false;
    }
    // Painted anywhere along its visible part: a tall node whose middle is
    // under the pinned prompt still shows above it.
    const x = Math.min(Math.max(r.left + Math.min(r.width / 2, 40), v.left + 1), v.right - 1);
    for (const y of [top + Math.min(16, visible / 2), (top + bottom) / 2, bottom - Math.min(16, visible / 2)]) {
        if (!covers(document.elementFromPoint(x, y))) {
            return true;
        }
    }
    return false;
}

// Scroll a column that scrolls on its own so that the element is inside the
// part of the column that is in the view.
function reveal_in_panel(e: HTMLElement, panel: HTMLElement, t: HTMLElement) {
    const v = t.getBoundingClientRect();
    const pr = panel.getBoundingClientRect();
    const top = Math.max(pr.top, v.top), bottom = Math.min(pr.bottom, v.bottom);
    const r = e.getBoundingClientRect();
    if (r.top < top + SCROLL_MARGIN_PX) {
        panel.scrollTop += r.top - top - SCROLL_MARGIN_PX;
    } else if (r.bottom > bottom - SCROLL_MARGIN_PX) {
        panel.scrollTop += Math.min(r.bottom - bottom + SCROLL_MARGIN_PX, r.top - top - SCROLL_MARGIN_PX);
    }
}

export function scroll_target_after(comp_elt: HTMLElement, natural_tops: Map<HTMLElement, number>): ScrollTarget {
    const t = terminal_elt();
    const hole = document.getElementById('story-hole');
    if (t === null || hole === null) {
        return undefined;
    }
    // What changed and can be seen: a box now, or a box before it folded —
    // in this stage, joined to the command's earlier stages.
    for (const e of changed_elements(comp_elt)) {
        if (e.isConnected && (has_box(e) || natural_tops.has(e))) {
            command_changes.set(e, natural_tops.has(e) ? natural_tops.get(e)! : measuring(() => doc_top(e, t)));
        }
    }
    const changed = [...command_changes.keys()].filter(e => e.isConnected);
    if (changed.length === 0) {
        return { top: scroll_down_target(t), unseen: [], instant: false };
    }
    const s0 = t.scrollTop;
    const s_down = scroll_down_target(t);
    const view_height = t.clientHeight;
    const em = parseFloat(getComputedStyle(t).fontSize) || 12;

    // Natural positions now (the folds closed): what was measured at the start
    // for nodes that no longer have a box.
    const tops = measuring(() => new Map(changed.map(e =>
        [e, has_box(e) ? doc_top(e, t) : command_changes.get(e)!] as const)));
    const hole_bottom = measuring(() => doc_top(hole, t) + hole.offsetHeight);

    // What is in view when the prompt is at the bottom.
    t.scrollTop = s_down;
    const far = changed.filter(e => !painted_in_view(e, tops.get(e)!, t));
    const near = changed.filter(e => !far.includes(e));

    let target = s_down;
    // The scroll that puts the change at the top of the view, under any pinned panel.
    const scroll_to_top_of = (change: HTMLElement): number => {
        const panel = sticky_panel_of(change);
        let s: number;
        if (panel !== null) {
            // A change inside a pinned column: the column fully in view, as
            // near the prompt as its pinning allows, and the change inside it.
            const [panel_top, columns_bottom] = measuring(() => {
                const parent = panel.parentElement || panel;
                return [doc_top(panel, t), doc_top(parent, t) + parent.offsetHeight];
            });
            s = Math.max(panel_top - SCROLL_MARGIN_PX, Math.min(s_down, columns_bottom - panel.offsetHeight));
        } else {
            // The command's own line belongs with the response under it: a change at the top of a frame is shown from the frame's top.
            const frame = change.closest('.frame') as HTMLElement | null;
            let top = tops.get(change)!;
            if (frame !== null && frame !== change) {
                const frame_top = measuring(() => doc_top(frame, t));
                if (top - frame_top <= 6 * em) {
                    top = frame_top;
                }
            }
            s = top - SCROLL_MARGIN_PX;
            // Under a pinned panel at that scroll? Then below the panel.
            t.scrollTop = clamp_scroll(t, s);
            const v = t.getBoundingClientRect();
            const r = change.getBoundingClientRect();
            const x = Math.min(v.right - 1, (r.width > 0 ? r.left : (change.parentElement || t).getBoundingClientRect().left) + 20);
            const hit = document.elementFromPoint(x, v.top + SCROLL_MARGIN_PX + 4);
            const cover = hit === null ? null : hit.closest('.columns .right');
            if (cover !== null && !cover.contains(change) && getComputedStyle(cover).position === 'sticky') {
                s -= cover.getBoundingClientRect().bottom - v.top;
            }
        }
        return clamp_scroll(t, s);
    };
    // The pinned prompt cannot leave the column or ledger that holds it: the
    // scroll must keep that container's top high enough for the prompt's
    // line to sit at the bottom of the view (its options may be cut).
    let container = hole.parentElement || hole;
    while (container.parentElement !== null && getComputedStyle(container).display === 'contents') {
        container = container.parentElement;
    }
    const s_min_for_prompt = measuring(() => doc_top(container, t)) + Math.min(hole.offsetHeight, PROMPT_LINE_EM * em) - view_height + SCROLL_MARGIN_PX;
    const with_prompt = (s: number, change: HTMLElement): number => {
        if (s >= s_min_for_prompt) {
            return s;
        }
        // Lower the view until the prompt can pin, if the change stays in view.
        const panel = sticky_panel_of(change);
        if (panel !== null) {
            // Inside a pinned column: enough of the column left in view to scroll the change into.
            t.scrollTop = clamp_scroll(t, s_min_for_prompt);
            const v = t.getBoundingClientRect();
            const pr = panel.getBoundingClientRect();
            const room = Math.min(pr.bottom, v.bottom) - Math.max(pr.top, v.top);
            return room >= change.getBoundingClientRect().height + SCROLL_MARGIN_PX * 3 ? clamp_scroll(t, s_min_for_prompt) : s_down;
        }
        const bottom = tops.get(change)! + change.getBoundingClientRect().height;
        return bottom > s_min_for_prompt + SCROLL_MARGIN_PX * 3 ? clamp_scroll(t, s_min_for_prompt) : s_down;
    };

    // A board reopening around the prompt (a chip expanded) is the response,
    // however long: read from its top, the prompt pinned below.
    const reopened = [...comp_elt.querySelectorAll<HTMLElement>('.board.eph_removing_chip')].find(b => b.contains(hole));
    // Changes inside a pinned column never steer the page while another change
    // is outside one: the column is in view wherever the page stops beside it,
    // and scrolls on its own to show its change. It leads only when every
    // change is inside it and the column is not in view at all.
    const outside_panels = far.filter(e => sticky_panel_of(e) === null);
    if (reopened !== undefined) {
        tops.set(reopened, measuring(() => doc_top(reopened, t)));
        target = with_prompt(scroll_to_top_of(reopened), reopened);
    } else if (far.length > 0) {
        far.sort((a, b) => tops.get(a)! - tops.get(b)!);
        let lead: HTMLElement | undefined = outside_panels.sort((a, b) => tops.get(a)! - tops.get(b)!)[0];
        if (lead === undefined) {
            // Can the column show every far change at this scroll, by scrolling itself?
            const revealable_at = (scroll: number) => {
                t.scrollTop = scroll;
                const v = t.getBoundingClientRect();
                return far.every(e => {
                    const panel = sticky_panel_of(e)!;
                    if (panel === e) {
                        // The column itself appearing: any fair part of it in view shows it.
                        const pr = e.getBoundingClientRect();
                        return Math.min(pr.bottom, v.bottom) - Math.max(pr.top, v.top) >= Math.min(pr.height, view_height / 4);
                    }
                    const pr = panel.getBoundingClientRect();
                    const top = Math.max(pr.top, v.top), bottom = Math.min(pr.bottom, v.bottom);
                    // A folded node has no box: its step's box stands for it.
                    const r = (has_box(e) ? e : (e.parentElement || e)).getBoundingClientRect();
                    if (bottom - top < Math.min(r.height, 3 * em) + 2 * SCROLL_MARGIN_PX) {
                        return false;
                    }
                    if (r.top < top + SCROLL_MARGIN_PX) {
                        return panel.scrollTop >= top + SCROLL_MARGIN_PX - r.top - 1;
                    }
                    if (r.bottom > bottom - SCROLL_MARGIN_PX) {
                        return panel.scrollHeight - panel.scrollTop - panel.clientHeight >= r.bottom - bottom + SCROLL_MARGIN_PX - 1;
                    }
                    return true;
                });
            };
            // The column changes in place: where it can show the change already the page need not move at all.
            if (near.length === 0 || near.every(e => sticky_panel_of(e) !== null || e.getBoundingClientRect().height <= SHORT_RESPONSE_EM * em)) {
                if (revealable_at(s0)) {
                    target = s0;
                } else if (!revealable_at(s_down)) {
                    lead = far[0];
                }
            } else if (!revealable_at(s_down)) {
                lead = far[0];
            }
        }
        if (lead !== undefined) {
            const s_change = scroll_to_top_of(lead);
            const fits = hole_bottom - s_change <= view_height;
            const short_response = near.every(e => e.getBoundingClientRect().height <= SHORT_RESPONSE_EM * em);
            if (fits) {
                target = s_down;
            } else if (short_response) {
                target = with_prompt(s_change, lead);
            } else {
                target = s_down;
            }
        }
    }
    // A long response (a reprint, an apply text, a board opened) is read from
    // its top, the prompt pinned below it. (A column that scrolls on its own
    // is not a response.)
    const near_outside = near.filter(e => sticky_panel_of(e) === null).sort((a, b) => tops.get(a)! - tops.get(b)!);
    if (reopened === undefined && target === s_down && near_outside.length > 0) {
        const s_top = scroll_to_top_of(near_outside[0]);
        if (hole_bottom - s_top > view_height) {
            target = with_prompt(s_top, near_outside[0]);
        }
    }
    // At the target: every change inside a pinned column scrolled into the
    // column's view, and what will not be in view where the view is going.
    t.scrollTop = clamp_scroll(t, target);
    for (const e of changed) {
        const panel = sticky_panel_of(e);
        if (panel !== null) {
            reveal_in_panel(e, panel, t);
        }
    }
    const unseen = changed.filter(e => !painted_in_view(e, tops.get(e)!, t));
    const instant = far.length > 0 && far.every(e => unseen.includes(e));
    t.scrollTop = s0;
    if (GLOBAL_DEV_TOOLS.DEBUG) {
        const describe = (e: HTMLElement) => `${e.tagName.toLowerCase()}.${[...e.classList].filter(c => !c.startsWith('eph_')).slice(0, 3).join('.')} "${(e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40)}"${tops.has(e) ? ' @' + Math.round(tops.get(e)!) : ''}`;
        GLOBAL_DEV_TOOLS.last_scroll = {
            from: s0, to: target, s_down, hole_bottom, view_height, s_min_for_prompt,
            far: far.map(describe), near: near.map(describe), unseen: unseen.map(describe), instant,
            lead_outside_panels: outside_panels.length, reopened: reopened !== undefined
        };
    }
    return { top: target, unseen, instant };
}
