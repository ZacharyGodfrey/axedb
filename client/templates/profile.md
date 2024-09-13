---
title: "{{profile.name}}"
description: "IATF Premier axe throwing data for {{profile.name}}"
---

{{>profileHeader}}

(~

### Career Stats

{{^profile.stats}}

No stats have been analyzed for this profile yet.

{{/profile.stats}}

{{#profile.stats}}

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{bigAxe.clutch.scorePerAxe}} |

{{/profile.stats}}

~)

(~

### Seasons

{{^profile.seasons.length}}

No seasons have been collected for this profile yet.

{{/profile.seasons.length}}

{{#profile.seasons.length}}

| Year | Name |
|:----:|------|
{{#profile.seasons}}
| {{year}} | [{{name}}](s/{{seasonId}}) |
{{/profile.seasons}}

{{/profile.seasons.length}}

~)