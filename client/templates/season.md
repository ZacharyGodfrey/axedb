---
title: "{{season.name}} | {{profile.name}}"
description: "{{season.name}} stats"
---

{{>profileHeader}}

(~

### Season Stats

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