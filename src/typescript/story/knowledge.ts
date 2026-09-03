/*
    Knowledge is just a story tree: the canonical text of everything the
    game can talk about, each passage labelled with a gist.

    Topics are children of the root. When the player considers a topic, the
    topic's subtree is printed into the current frame. When an interpretation
    reveals something about a passage, the revealed text is grafted beneath
    the passage here *and* in the frames where it has already been printed,
    so both the past and any future printing of it agree.

    Passages are addressed by their gist. Within a knowledge tree (and within
    a frame) a gist should identify one passage.
*/
import { Gist, GistPattern, exact, gists_equal, gist_to_string, match } from 'gist';
import { createElement } from './create';
import { find_all_nodes, FoundNode, Fragment, is_story_node, StoryNode, structurally_equal } from './story';

export type Knowledge = StoryNode;

export function empty_knowledge(): Knowledge {
    return createElement('div', { className: 'knowledge' });
}

export type GistNode = StoryNode & { data: { gist: Gist } };

export function is_gist_node(n: Fragment): n is GistNode {
    return is_story_node(n) && n.data.gist !== undefined;
}

// Every node beneath (and including) root whose gist matches, in document order.
export function find_gists(root: Fragment, pattern: GistPattern): FoundNode<GistNode>[] {
    return find_all_nodes(root, (n): n is GistNode => is_gist_node(n) && match(n.data.gist, pattern));
}

// Every gist-bearing node strictly beneath root, in document order.
export function gist_descendants(root: Fragment): GistNode[] {
    return find_gists(root, {}).map(([n]) => n).filter(n => n !== root);
}

// The nearest gist-bearing descendants of root: the gist nodes you reach
// without passing through another gist node.
export function gist_children(root: Fragment): GistNode[] {
    if (!is_story_node(root)) {
        return [];
    }
    const result: GistNode[] = [];
    for (const c of root.children) {
        if (is_gist_node(c)) {
            result.push(c);
        } else {
            result.push(...gist_children(c));
        }
    }
    return result;
}

// Add a top-level passage. Its gist must be new.
export function ingest(knowledge: Knowledge, story: StoryNode): Knowledge {
    const g = story.data.gist;
    if (g === undefined) {
        throw new Error('Tried to add a story without a gist to the knowledge base.');
    }
    if (knowledge.children.some(c => is_gist_node(c) && gists_equal(c.data.gist, g))) {
        throw new Error(`The knowledge base already has a passage for ${gist_to_string(g)}.`);
    }
    return { ...knowledge, children: [...knowledge.children, story] };
}

// The passage for a gist: a top-level passage with exactly that gist, or
// else the passage nested anywhere with that gist. A passage may be nested
// in several places (the same node embedded in several top-level passages);
// that is fine as long as all the copies say the same thing.
export function lookup(knowledge: Knowledge, g: Gist): StoryNode | undefined {
    const top = knowledge.children.find(c => is_gist_node(c) && gists_equal(c.data.gist, g));
    if (top !== undefined) {
        return top as StoryNode;
    }
    const found = find_gists(knowledge, exact(g)).map(([n]) => n);
    if (found.some(n => !structurally_equal(n, found[0]))) {
        throw new Error(`Ambiguous knowledge lookup: ${found.length} different passages have the gist ${gist_to_string(g)}.`);
    }
    return found[0];
}

export function lookup_or_throw(knowledge: Knowledge, g: Gist): StoryNode {
    const result = lookup(knowledge, g);
    if (result === undefined) {
        throw new Error(`No passage in the knowledge base has the gist ${gist_to_string(g)}.`);
    }
    return result;
}

// Does the passage for `parent` already contain `child_gist` directly beneath it?
export function has_revealed(knowledge: Knowledge, parent: GistPattern, child_gist: Gist): boolean {
    return find_gists(knowledge, parent).some(([n]) =>
        gist_children(n).some(c => gists_equal(c.data.gist, child_gist)));
}

// Remove every node whose gist matches, anywhere beneath the root: the
// inverse of graft() (a revealed passage taken back).
export function remove_gists(root: Knowledge, pattern: GistPattern): Knowledge {
    const visit = (n: Fragment): Fragment => {
        if (!is_story_node(n)) {
            return n;
        }
        const children = n.children
            .filter(c => !(is_story_node(c) && match(c.data.gist, pattern)))
            .map(visit);
        return { ...n, children };
    };
    return visit(root) as Knowledge;
}

// Append `child` beneath every passage matching `parent` that doesn't have it
// yet. Deliberately multi-target: a passage embedded in several places (such
// as an action's description inside both the notes and the memory of it) is
// revealed everywhere at once.
export function graft(knowledge: Knowledge, parent: GistPattern, child: StoryNode): Knowledge {
    const child_gist = child.data.gist;
    if (child_gist === undefined) {
        throw new Error('Tried to graft a story without a gist into the knowledge base.');
    }
    const visit = (n: Fragment): Fragment => {
        if (!is_story_node(n)) {
            return n;
        }
        const children = n.children.map(visit);
        const matches = is_gist_node(n) && match(n.data.gist, parent);
        const already = matches && gist_children(n).some(c => gists_equal(c.data.gist, child_gist));
        if (matches && !already) {
            children.push(child);
        }
        return { ...n, children };
    };
    return visit(knowledge) as Knowledge;
}
