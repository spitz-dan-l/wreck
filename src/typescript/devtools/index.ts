function maybe_get_css_rules(s: CSSStyleSheet) {
    try {
        return s.cssRules;
    } catch (e) {
        return undefined;
    }
}

export const get_matched_css_rules = (el: Element, css: StyleSheetList = el.ownerDocument!.styleSheets) =>
    Array.from(css).flatMap((s: CSSStyleSheet) => maybe_get_css_rules(s) ? Array.from(s.cssRules) : [])
    .filter((r): r is CSSStyleRule => r instanceof CSSStyleRule && el.matches(r.selectorText));


export interface GlobalDevTools {
    DEBUG?: boolean;
    get_matched_css_rules?: typeof get_matched_css_rules;
}

export const GLOBAL_DEV_TOOLS: GlobalDevTools = {
    get_matched_css_rules: get_matched_css_rules
}

declare global {
    var devtools: GlobalDevTools
}

globalThis.devtools = GLOBAL_DEV_TOOLS;
