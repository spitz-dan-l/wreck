import * as TypeStyle from 'typestyle';

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

// Plain class names, not typestyle styles: typestyle hashes a style's
// properties, so three markers made from empty styles were one and the same
// class in production builds (where the debug names are dropped), and the
// appear animation below never ran as written. The rules for these live in
// dist/history.css (the engine's) and dist/board.css (the board's folds).
export const animation_pre_compute = 'animation-pre-compute';
export const animation_start = 'animation-start';
export const animation_active = 'animation-active';

// A node added by this command, animated in by history.css's .eph-new rules.
export const eph_new = 'eph-new';
