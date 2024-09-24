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

| Overall | Hatchet Bullseye | Hatchet Clutch | Big Axe Bullseye | Big Axe Clutch |
|:-------:|:----------------:|:--------------:|:----------------:|:--------------:|
| {{stats.overall.scorePerAxe}} | {{stats.hatchet.bullseye.scorePerAxe}} | {{stats.hatchet.clutch.scorePerAxe}} | {{stats.bigAxe.bullseye.scorePerAxe}} | {{stats.bigAxe.clutch.scorePerAxe}} |

~)

### Seasons

(~

{{#seasons}}
- [{{year}} {{name}}](s/{{seasonId}})
{{/seasons}}

~)

{{/profile}}

{{/profile.seasons.length}}