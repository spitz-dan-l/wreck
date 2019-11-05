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