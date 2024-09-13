---
title: "{{name}}"
description: "IATF Premier axe throwing data for {{name}}"
---

(~

## ![{{name}}](data:image/png;base64,{{image}}) {{name}}

ID: {{profileId}}

~)

(~

### Career Stats

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{stats.hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{stats.hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{stats.bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{stats.bigAxe.clutch.scorePerAxe}} |

~)

(~

### Seasons

| Year | Name |
|:----:|------|
{{#seasons}}
| {{year}} | [{{name}}]({{seasonId}}) |
{{/seasons}}

~)