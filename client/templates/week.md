---
title: "Week {{week.weekId}} | {{season.name}} | {{profile.name}}"
description: "Stats for {{profile.name}} in Week {{week.weekId}} of {{season.name}}"
---

{{>siteHeader}}

{{>profileHeader}}

[season]: /{{profile.profileId}}/s/{{season.seasonId}}

(~

### Week {{week.weekId}} Stats

{{season.year}} &bull; **[{{season.name}}][season]**

{{#week.stats}}

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{bigAxe.clutch.scorePerAxe}} |

{{/week.stats}}

~)