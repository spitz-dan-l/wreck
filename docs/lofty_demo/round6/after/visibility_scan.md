# The visibility scan

What a person sees after each command, measured in the browser (`scripts/visibility_scan.js`, driver `scripts/browse_fire.js`). Every command of the acceptance script, and the display deviations at the mapping states, on the desktop (1280x800) and the phone (iPhone 16 Pro, 402x874). The checks:

- **(a)** the prompt is in view once the page has settled;
- **(b)** the changed nodes are in view, or the topmost change is in view with the prompt, or (when they cannot fit) the topmost change is in view and the prompt is one scroll below;
- **(c)** an expand/collapse changed the height of something inside the viewport;
- **(d)** the scroll did not overshoot the topmost change;
- **(e)** no mid-animation sample had the prompt off-screen while it settled on-screen somewhere very different.

"In view" counts what is painted: a change under the pinned steps panel is not in view. A class change with no visible effect (a bookkeeping class) is not a change; a class change on a container taller than half the view (a board folding its rows) is not a place, its rows are, and a folded row counts at the place it had; when the response at the prompt is long (a board opened, a reprint) it may stand in for a fold far above it; and when the topmost change is too far above for even the prompt's line to stay in view with it, the prompt wins (and (d) does not apply). A command's own echo line under the pinned prompt is the known cost of showing a change far above it. Screenshots are the viewport after settling (`…a.png` is ~150 ms after submit); those listed here are copied under `shots/`, the rest are regenerated into `browse/scan/` by the scan.

## Totals

| device | commands checked | failing | (a) prompt in view | (b) change in view | (c) fold visible | (d) no overshoot | (e) no jump | deviations not offered | time |
|---|---|---|---|---|---|---|---|---|---|
| desktop | 286 | 8 | 0 | 7 | 0 | 3 | 1 | 22 | 571 s |
| phone | 286 | 2 | 0 | 2 | 0 | 1 | 0 | 22 | 623 s |

## desktop: the worst

- **desktop command 46: `expand the campfire story`** — (b) topmost change BELOW VIEW by 2737 px: div.frame.you "> expand the campfire storyThe campfire story unfolds.". Scroll 2932 → 2048 (1 motion(s)), page 5621 px. shots/desktop/a046.png
- **desktop house: after apply: `expand the steps`** — (b) topmost change ABOVE VIEW by 100 px: div.notation "> lay the tinderA small patch of tinder is placed in the hea". Scroll 5267 → 5267 (0 motion(s)), page 6892 px. shots/desktop/d083_01_expand_the_steps.png
- **desktop command 190: `set aside the second solution`** — (b) topmost change FOLDED ABOVE VIEW by 100 px: div.spoken. Scroll 9241 → 6523 (1 motion(s)), page 10214 px. shots/desktop/a190.png

## desktop: every failure

- **desktop command 46: `expand the campfire story`** — (b) topmost change BELOW VIEW by 2737 px: div.frame.you "> expand the campfire storyThe campfire story unfolds.". Scroll 2932 → 2048 (1 motion(s)), page 5621 px. shots/desktop/a046.png
- **desktop house: after apply: `expand the steps`** — (b) topmost change ABOVE VIEW by 100 px: div.notation "> lay the tinderA small patch of tinder is placed in the hea". Scroll 5267 → 5267 (0 motion(s)), page 6892 px. shots/desktop/d083_01_expand_the_steps.png
- **desktop command 87: `erase the sparking of the tinder`** — (b) topmost change FOLDED ABOVE VIEW by 96 px: div.targets; (d) scrolled -96 px past the topmost change. Scroll 4824 → 5630 (1 motion(s)), page 7291 px. shots/desktop/a087.png
- **desktop command 92: `map the sparking of the tinder to the lighting of the rag`** — (b) topmost change ABOVE VIEW by 96 px: div.reference.step-4.held "→ the lighting of the rag"; (d) scrolled -96 px past the topmost change. Scroll 4463 → 5039 (1 motion(s)), page 6901 px. shots/desktop/a092.png
- **desktop command 122: `map the laying of the tinder to the turning dry and hot`** — (b) topmost change ABOVE VIEW by 26 px: div.reference.step-1.held "→ the turning dry and hot". Scroll 7108 → 7100 (1 motion(s)), page 8033 px. shots/desktop/a122.png
- **desktop command 190: `set aside the second solution`** — (b) topmost change FOLDED ABOVE VIEW by 100 px: div.spoken. Scroll 9241 → 6523 (1 motion(s)), page 10214 px. shots/desktop/a190.png
- **desktop command 193: `set aside the first solution`** — (b) topmost change FOLDED ABOVE VIEW by 86 px: div.spoken; (d) scrolled -86 px past the topmost change. Scroll 7048 → 7223 (1 motion(s)), page 10550 px. shots/desktop/a193.png
- **desktop command 206: `try the Pillaging on the house in the woods`** — (e) at 304 ms the prompt was at -7850 px, settled at 568 px. Scroll 12303 → 4175 (1 motion(s)), page 16979 px. shots/desktop/a206.png, mid-animation shots/desktop/a206a.png

Deviations not offered at their state (not played): `collapse the unmapped` (campfire: after draw a vertical line), `remember the campfire story` (campfire: after draw a vertical line), `expand the campfire story` (campfire: after draw a vertical line), `set aside the mapping` (campfire: after draw a vertical line), `erase the laying of the tinder` (campfire: after draw a vertical line), `remember the campfire story` (campfire: three steps placed), `expand the campfire story` (campfire: three steps placed), `set aside the mapping` (campfire: three steps placed), `remember the campfire story` (campfire: after apply), `expand the campfire story` (campfire: after apply), `erase the laying of the tinder` (campfire: after apply), `collapse the unmapped` (house: after draw a vertical line), `set aside the mapping` (house: after draw a vertical line), `erase the laying of the tinder` (house: after draw a vertical line), `set aside the mapping` (house: three steps placed), `erase the laying of the tinder` (house: after apply), `collapse the unmapped` (wise man: after draw a vertical line), `set aside the mapping` (wise man: after draw a vertical line), `erase the laying of the tinder` (wise man: after draw a vertical line), `set aside the mapping` (wise man: three steps placed), `set aside the mapping` (wise man: after apply), `erase the laying of the tinder` (wise man: after apply).

## phone: the worst

- **phone command 46: `expand the campfire story`** — (b) topmost change BELOW VIEW by 4228 px: div.frame.you "> expand the campfire storyThe campfire story unfolds.". Scroll 5977 → 2633 (1 motion(s)), page 7747 px. shots/phone/a046.png
- **phone command 87: `erase the sparking of the tinder`** — (b) topmost change FOLDED ABOVE VIEW by 114 px: div.targets; (d) scrolled -113 px past the topmost change. Scroll 8360 → 9533 (1 motion(s)), page 12174 px. shots/phone/a087.png

## phone: every failure

- **phone command 46: `expand the campfire story`** — (b) topmost change BELOW VIEW by 4228 px: div.frame.you "> expand the campfire storyThe campfire story unfolds.". Scroll 5977 → 2633 (1 motion(s)), page 7747 px. shots/phone/a046.png
- **phone command 87: `erase the sparking of the tinder`** — (b) topmost change FOLDED ABOVE VIEW by 114 px: div.targets; (d) scrolled -113 px past the topmost change. Scroll 8360 → 9533 (1 motion(s)), page 12174 px. shots/phone/a087.png

Deviations not offered at their state (not played): `collapse the unmapped` (campfire: after draw a vertical line), `remember the campfire story` (campfire: after draw a vertical line), `expand the campfire story` (campfire: after draw a vertical line), `set aside the mapping` (campfire: after draw a vertical line), `erase the laying of the tinder` (campfire: after draw a vertical line), `remember the campfire story` (campfire: three steps placed), `expand the campfire story` (campfire: three steps placed), `set aside the mapping` (campfire: three steps placed), `remember the campfire story` (campfire: after apply), `expand the campfire story` (campfire: after apply), `erase the laying of the tinder` (campfire: after apply), `collapse the unmapped` (house: after draw a vertical line), `set aside the mapping` (house: after draw a vertical line), `erase the laying of the tinder` (house: after draw a vertical line), `set aside the mapping` (house: three steps placed), `erase the laying of the tinder` (house: after apply), `collapse the unmapped` (wise man: after draw a vertical line), `set aside the mapping` (wise man: after draw a vertical line), `erase the laying of the tinder` (wise man: after draw a vertical line), `set aside the mapping` (wise man: three steps placed), `set aside the mapping` (wise man: after apply), `erase the laying of the tinder` (wise man: after apply).

