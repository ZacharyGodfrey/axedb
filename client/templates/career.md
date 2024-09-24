---
title: "{{profile.name}}"
description: "Career stats for {{profile.name}}"
---

{{>siteHeader}}

{{>profileHeader}}

{{^profile.seasons.length}}

No stats have been analyzed for this profile yet.

{{/profile.seasons.length}}


{{#profile.seasons.length}}

{{#profile}}

### Career Stats

(~

#### Score Per Axe

|   |   |
|:--|:-:|
| Overall          | {{stats.overall.scorePerAxe}} |
| Hatchet Bullseye | {{stats.hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch   | {{stats.hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye | {{stats.bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch   | {{stats.bigAxe.clutch.scorePerAxe}} |

~)

### Seasons

(~

{{#seasons}}
- [{{year}} {{name}}](s/{{seasonId}})
{{/seasons}}

~)

{{/profile}}

{{/profile.seasons.length}}