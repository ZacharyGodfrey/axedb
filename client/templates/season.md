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

|                      |                                  |
|:---------------------|:--------------------------------:|
| **Overall**          | {{overall.scorePerAxe}}          |
| **Hatchet Bullseye** | {{hatchet.bullseye.scorePerAxe}} |
| **Hatchet Clutch**   | {{hatchet.clutch.scorePerAxe}}   |
| **Big Axe Bullseye** | {{bigAxe.bullseye.scorePerAxe}}  |
| **Big Axe Clutch**   | {{bigAxe.clutch.scorePerAxe}}    |

{{/stats}}

~)

### Weeks

(~

{{#weeks}}
- [Week {{weekId}}](/{{profile.profileId}}/s/{{seasonId}}/w/{{weekId}})
{{/weeks}}

~)

{{/season}}