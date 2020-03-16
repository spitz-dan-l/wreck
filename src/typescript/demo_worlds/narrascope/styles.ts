import * as TypeStyle from 'typestyle';
import { rgb_rule } from '../../UI/styles';

export const insight_text_class = TypeStyle.style(
    rgb_rule(255, 215, 0)
)

function make_class_for_animation(name: string, animation: string) {
    return TypeStyle.style({
        $debugName: name,
        animationName: animation,
        animationDuration: '2s',
        animationIterationCount: 'infinite'
    });
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
    'would_start_interpreting',
    would_start_interpreting_animation
);

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
    interpreting_animation
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
    'would_interpret_facet',
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
    'would_cite_facet',
    would_cite_facet_animation
);

export const interpreting_and_facet_class = TypeStyle.style({
    $debugName: 'interpreting_and_facet',
    animationName: [interpreting_animation, would_interpret_facet_animation],
    animationDuration: ['2s', '2s'],
    animationIterationCount: ['infinite', 'infinite']
});
