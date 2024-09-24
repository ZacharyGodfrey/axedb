---
title: "{{season.name}} | {{profile.name}}"
description: "Season stats for {{profile.name}} in {{season.name}}"
---

{{>siteHeader}}

{{>profileHeader}}

{{#season}}

(~

Year: **{{year}}**

Season: **{{name}}**

~)

### Season Stats

(~

{{#stats}}

#### Score Per Axe

|                      |                                        |
|:---------------------|:--------------------------------------:|
| **Overall**          | {{stats.overall.scorePerAxe}}          |
| **Hatchet Bullseye** | {{stats.hatchet.bullseye.scorePerAxe}} |
| **Hatchet Clutch**   | {{stats.hatchet.clutch.scorePerAxe}}   |
| **Big Axe Bullseye** | {{stats.bigAxe.bullseye.scorePerAxe}}  |
| **Big Axe Clutch**   | {{stats.bigAxe.clutch.scorePerAxe}}    |

{{/stats}}

~)

(~

### Weeks

{{#weeks}}
- [Week {{weekId}}](/{{profile.profileId}}/s/{{seasonId}}/w/{{weekId}})
{{/weeks}}

~)

{{/season}}