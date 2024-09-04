---
type: "page"
title: ""
description: "IATF Premier axe throwing data for Zachary Godfrey (alias: REDACTED)"
---

(~

## Welcome

This website is still being built. Please come back later. Thanks!

~)

(~

### Seasons

{{#throwData.seasons}}

#### {{name}}

|Hatchet||Big Axe|
|:-:|:-:|:-:|
| {{hatchetBullseyeHitPercent}} | Bullseye % | {{bigAxeBullseyeHitPercent}} |
| {{hatchetClutchHitPercent}} | Clutch % | {{bigAxeClutchHitPercent}} |

{{/throwData.seasons}}

~)

(~

### All Throws

|Season|Week|Match|Opponent|Round|Throw|Tool|Target|Score|
|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
{{#throwData.throws}}
| {{seasonId}} | {{week}} | {{matchId}} | {{opponentId}} | {{round}} | {{throw}} | {{tool}} | {{target}} | {{score}} |
{{/throwData.throws}}

~)