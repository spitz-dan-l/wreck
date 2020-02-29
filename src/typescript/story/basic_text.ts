import { Fragment } from "./story";

export function to_basic_text(story: Fragment, previous_text = ''): string {
    let separator: string = '';
    let added_text: string = '';
    if (typeof story === 'string') {
        const n = document.createTextNode(story);
        added_text = n.textContent || '';
        separator = ' ';
    } else if (story.kind === 'StoryHole') {
        added_text = '> ';
        separator = '\n';
    } else {
        if (story.tag === 'span') {
            separator = ' ';
        } else {
            separator = '\n';
        }
    
        for (const child of story.children) {
            added_text += to_basic_text(child, added_text);
        }
    }
    
    if (added_text.length > 0 && previous_text.length > 0) {
        return separator + added_text;
    }
    return added_text;
}