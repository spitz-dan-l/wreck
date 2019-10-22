import { StoryNode, Fragment, is_story_hole } from "./story";
import { set_attributes } from "../jsx_utils";

// This is pretty ugly, but there's not a good enough reason to
// do something fancier yet
export const StoryHoleDom: HTMLElement = document.createElement('div');
StoryHoleDom.id = 'story-hole';


// Convert Story to DOM
export function story_to_dom(story: StoryNode): HTMLElement;
export function story_to_dom(story: string): Text;
export function story_to_dom(story: Fragment): HTMLElement | Text;
export function story_to_dom(story: Fragment): HTMLElement | Text {
    if (typeof story === 'string') {
        return document.createTextNode(story);
    } else if (is_story_hole(story)) {
        return StoryHoleDom;
    }
    const elt = document.createElement(story.tag);

    for (const [class_name, on] of Object.entries(story.classes)) {
        if (on) {
            elt.classList.add(class_name);
        }
    }

    for (const [data_attr, val] of Object.entries(story.data)) {
        elt.dataset[data_attr] = '' + val;
    }

    set_attributes(elt, story.attributes);

    for (const c of story.children) {
        elt.appendChild(story_to_dom(c));
    }

    return elt;
}