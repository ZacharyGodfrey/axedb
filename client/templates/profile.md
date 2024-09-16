---
title: "{{profile.name}}"
description: "IATF Premier axe throwing data for {{profile.name}}"
---

{{>profileHeader}}

(~

### Stats

{{^profile.seasons.length}}

No stats have been analyzed for this profile yet.

{{/profile.seasons.length}}

{{#profile.seasons.length}}

#### Score Per Axe

|   | Hatchet Bullseye | Hatchet Clutch | Big Axe Bullseye | Big Axe Clutch |
|:--|:----------------:|:--------------:|:----------------:|:--------------:|
{{#profile.stats}}
| **Career** | **{{hatchet.bullseye.scorePerAxe}}** | **{{hatchet.clutch.scorePerAxe}}** | **{{bigAxe.bullseye.scorePerAxe}}** | **{{bigAxe.clutch.scorePerAxe}}** |
{{/profile.stats}}
{{#profile.seasons}}
| [{{year}} {{name}}](s/{{seasonId}}) | {{stats.hatchet.bullseye.scorePerAxe}} | {{stats.hatchet.clutch.scorePerAxe}} | {{stats.bigAxe.bullseye.scorePerAxe}} | {{stats.bigAxe.clutch.scorePerAxe}} |
{{/profile.seasons}}

{{/profile.seasons.length}}

~)