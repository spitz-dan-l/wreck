import * as TypeStyle from 'typestyle';
import {px} from 'csx';

declare module 'typestyle/lib/types' {
    interface CSSProperties {
        '--alpha-color'?: string,
        '--rgb-color'?: string
    }
}

export function rgb_rule(r: number, g: number, b: number): TypeStyle.types.CSSProperties {
    return {
        '--rgb-color': `${r}, ${g}, ${b}`
    }
}

export function alpha_rule(a: number): TypeStyle.types.CSSProperties {
    return {
        '--alpha-color': `${a}`
    }
}

export function compute_color_rule(): TypeStyle.types.CSSProperties {
    return {
        color: 'rgba(var(--rgb-color),var(--alpha-color))'
    }
}

export const animation_pre_compute = TypeStyle.style({ $debugName: 'animation_pre_compute' });
export const animation_start = TypeStyle.style({ $debugName: 'animation_start' });
export const animation_active = TypeStyle.style({ $debugName: 'animation_active' });

export const eph_new = TypeStyle.style({
    $debugName: 'eph_new',
    $nest: {
        [`.story.${animation_start} &`]: {
            opacity: 0.01,
            maxHeight: px(0)
        },

        [`.story.${animation_start}.${animation_active} &`]: {
            opacity: 1.0,
            transition: 'max-height 400ms linear, opacity 300ms ease-in',
            transitionDelay: '0ms, 400ms'
        }
    }
})