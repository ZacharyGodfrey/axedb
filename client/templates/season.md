---
title: "{{season.name}} | {{profile.name}}"
description: "Season stats for {{profile.name}} in {{season.name}}"
---

{{>profileHeader}}

(~

### Season Stats

{{season.year}} &bull; **{{season.name}}**

{{#season.stats}}

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{bigAxe.clutch.scorePerAxe}} |

{{/season.stats}}

~)

(~

### Weeks

{{#season.weeks}}
- [Week {{weekId}}](/{{profile.profileId}}/s/{{season.seasonId}}/w/{{weekId}})
{{/season.weeks}}

~)