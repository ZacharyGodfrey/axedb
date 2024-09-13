---
title: "Season Stats"
description: ""
---

(~

## Seasons

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