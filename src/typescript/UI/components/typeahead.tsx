import { ui_resources } from "../prelude";
import { Renderer, createElement, Component } from "../framework";
import { TypeaheadOption, Parsing, Token, TokenAvailability, TokenMatch } from "../../parser";
import { isEqual } from "lodash";

export type TypeaheadProps = {
    parsing: Parsing,
    typeahead_index: number,
    undo_selected: boolean
}

export type Typeahead = Component<TypeaheadProps>;
export const Typeahead: Renderer<TypeaheadProps> = ({parsing, typeahead_index, undo_selected}, old?) => {
    const dispatch = ui_resources.get('dispatch');

    function handleMouseOver(i: number) {
        dispatch({
            kind: 'SelectTypeahead',
            index: i
        });
    }
    function handleClick(i: number) {
        dispatch({
            kind: 'SelectTypeahead',
            index: i
        });

        dispatch({
            kind: 'Submit'
        });
        // unclear if we need to call dispatch twice or just once
    }
    function whitespace(s: string) {
        return s.replace(/./g, ' ');//'&nbsp;');
    }
    function convert_token(s: Token) {
        if (typeof s === 'string') {
            return s;
        }
        // If we're here, s is SUBMIT_TOKEN.
        return String.fromCharCode(8629); // curving down arrow indicator
    }

    function cssify_availability(availability: TokenAvailability): string {
        switch (availability) {
            case 'Available':
                return 'available';
            case 'Used':
                return 'used';
            case 'Locked':
                return 'locked';
        }
    }

    function get_option_class(option: TypeaheadOption, index: number, selected_index: number, undo_selected: boolean): string {
        let classes = ['option', cssify_availability(option.availability)];
        if (index === selected_index && !undo_selected) {
            classes.push('selected');
        }
        return classes.join(' ');
    }

    function get_option_token_class(match: TokenMatch | undefined): string {
        if (match === undefined) {
            return '';
        }

        let classes = ['token', cssify_availability(match.expected.availability)];
        for (let [label, on] of Object.entries(match.expected.labels)) {
            if (on) {
                classes.push(label);
            }
        }
        return classes.join(' ');
    }

    function grid(parsing: Parsing) {
        return parsing.view.typeahead_grid;
    }

    if (!old || !isEqual(grid(parsing), grid(old.old_props.parsing))) {
        return <ul className="typeahead">
            {grid(parsing).map((option, i) =>
                <li
                    on={{
                        mouseover: () => handleMouseOver(i),
                        click: () => handleClick(i)
                    }}
                    className={get_option_class(option, i, typeahead_index, undo_selected)}
                >
                    <span>{'  '}</span>
                    { option.option.map((m, j) =>
                        <span className={get_option_token_class(m)}>
                            { m === undefined ?
                                parsing.whitespace[j] + whitespace(convert_token(parsing.tokens[j])) :
                                (j >= parsing.whitespace.length || j !== 0 && parsing.whitespace[j] === '' ?
                                ' ' :
                                parsing.whitespace[j]) + convert_token(m.expected.token) }
                        </span>
                    ) }
                    { option.availability === 'Locked' ? <Lock /> : '' }
                </li>
            )}
            <li className='footer'>&nbsp;</li>
        </ul> as Typeahead;
    }

    if (old.old_props.typeahead_index !== typeahead_index
        || old.old_props.undo_selected !== undo_selected) {
        
            grid(old.old_props.parsing).forEach((t, i) => {
            old.old_root.children[i].className = get_option_class(t, i, typeahead_index, undo_selected);
        });
    }

    return old.old_root;
};

const Lock = () => <span className="token lock">
    {' ' + String.fromCharCode(8416)}
</span>;