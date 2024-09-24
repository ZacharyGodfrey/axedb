---
title: "{{profile.name}}"
description: "Career stats for {{profile.name}}"
---

{{>siteHeader}}

{{>profileHeader}}

{{#profile}}

### Career Stats

(~

{{#stats}}

#### Score Per Axe

|                      |                                  |
|:---------------------|:--------------------------------:|
| **Overall**          | {{overall.scorePerAxe}}          |
| **Hatchet Bullseye** | {{hatchet.bullseye.scorePerAxe}} |
| **Hatchet Clutch**   | {{hatchet.clutch.scorePerAxe}}   |
| **Big Axe Bullseye** | {{bigAxe.bullseye.scorePerAxe}}  |
| **Big Axe Clutch**   | {{bigAxe.clutch.scorePerAxe}}    |

{{/stats}}

~)

### Seasons

(~

{{#seasons}}
- [{{year}} &bull; {{name}}](s/{{seasonId}})
{{/seasons}}

~)

{{/profile}}