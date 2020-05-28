import * as TypeStyle from 'typestyle';
import { rgb_rule, alpha_rule, animation_start, animation_active } from '../../UI/styles';

export const insight_text_class = TypeStyle.style(
    rgb_rule(255, 215, 0)
)

function make_class_for_animation(name: string, animation: string, extra_rules?: TypeStyle.types.NestedCSSProperties) {
    return TypeStyle.style({
        $debugName: name,
        animationName: animation,
        animationDuration: '2s',
        animationIterationCount: 'infinite',
        ...extra_rules
    });
}

const outline_defaults: TypeStyle.types.NestedCSSProperties = {
    outlineStyle: 'solid',
    outlineWidth: '1px',
    outlineOffset: '5px'
}

const would_start_interpreting_animation = TypeStyle.keyframes({
    $debugName: 'would_start_interpreting',
    '0%': {
        outlineColor: '#00000000'
    },
    '50%': {
        outlineColor: 'ivory'
    },
    '100%': {
        outlineColor: '#00000000'
    }
});

export const would_start_interpreting_class = make_class_for_animation(
    'eph-would_start_interpreting',
    would_start_interpreting_animation,
    outline_defaults
);

export const would_stop_interpreting_class = TypeStyle.style({
    $debugName: 'eph-would_stop_interpreting'
    // TODO
})


const interpreting_animation = TypeStyle.keyframes({
    $debugName: 'interpreting',
    '0%': {
        outlineColor: 'ivory'
    },
    '50%': {
        outlineColor: '#72d2e5'
    },
    '100%': {
        outlineColor: 'ivory'
    }
});

export const interpreting_class = make_class_for_animation(
    'interpreting',
    interpreting_animation,
    outline_defaults
);


const would_interpret_facet_animation = TypeStyle.keyframes({
    $debugName: 'would_interpret_facet',
    '0%': {
        backgroundColor: 'black'
    },
    '50%': {
        backgroundColor: 'midnightblue'
    },
    '100%': {
        backgroundColor: 'black'
    }
});

export const would_interpret_facet_class = make_class_for_animation(
    'eph-would_interpret_facet',
    would_interpret_facet_animation
);


const would_cite_facet_animation = TypeStyle.keyframes({
    $debugName: 'would_cite_facet',
    '0%': {
        backgroundColor: 'black'
    },
    '50%': {
        backgroundColor: 'dimgray'
    },
    '100%': {
        backgroundColor: 'black'
    }
});

export const would_cite_facet_class = make_class_for_animation(
    'eph-would_cite_facet',
    would_cite_facet_animation
);


export const cite_facet_class = TypeStyle.style({
    $debugName: 'eph-cite_facet',
    backgroundColor: 'dimgray'
    // TODO
});

export const interpret_facet_class = TypeStyle.style({
    $debugName: 'eph-interpret_facet',
    
    $nest: {
        [`.${animation_start} &`]: {
            backgroundColor: 'darkgoldenrob'
        },
        [`.${animation_start}.${animation_active} &`]: {
            backgroundColor: 'inherit',
            transition: 'background-color 700ms linear'
        }
    }
});

export const misinterpret_facet_class = TypeStyle.style({
    $debugName: 'eph-misinterpret_facet',
    
    $nest: {
        [`.${animation_start} &`]: {
            backgroundColor: 'firebrick'
        },
        [`.${animation_start}.${animation_active} &`]: {
            backgroundColor: 'inherit',
            transition: 'background-color 700ms linear'
        }
    }
})

// Have to manually merge interpreting_animation and would_interpret_facet_animation
// into a new class, because css will not do the right thing for an element
// with both classes.
// TODO: need some rule somewhere that recognizes when to swap out the
//  pair of classes and substitutes this single merged class.
export const interpreting_and_facet_class = TypeStyle.style({
    $debugName: 'interpreting_and_facet',
    animationName: [interpreting_animation, would_interpret_facet_animation],
    animationDuration: ['2s', '2s'],
    animationIterationCount: ['infinite', 'infinite']
});


export const unfocused_class = TypeStyle.style(
    alpha_rule(0.4),
    {
        $nest: {
            '& .frame:not(&)': {
                ...alpha_rule(1.0)
            }

        }
    }
)