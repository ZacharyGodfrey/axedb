---
title: "Week {{week.weekId}} | {{season.name}} | {{profile.name}}"
description: "Stats for {{profile.name}} in Week {{week.weekId}} of {{season.name}}"
---

{{>profileHeader}}

(~



### Week Stats

{{season.year}} **{{season.name}}**

{{#season.stats}}

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{bigAxe.clutch.scorePerAxe}} |

{{/season.stats}}

~)