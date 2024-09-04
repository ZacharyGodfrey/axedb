---
type: "page"
title: "Season Stats"
description: ""
---

(~

## {{meta.title}}

There are currently {{throwData.seasons.length}} recorded seasons.

~)

{{#throwData.seasons}}

(~

### {{name}}

|Hatchet||Big Axe|
|:-:|:-:|:-:|
| {{hatchetBullseyeHitPercent}} | Bullseye % | {{bigAxeBullseyeHitPercent}} |
| {{hatchetClutchHitPercent}} | Clutch % | {{bigAxeClutchHitPercent}} |

~)

{{/throwData.seasons}}