---
title: "{{season.name}} &bull; {{profile.name}}"
description: "Season stats for {{profile.name}} in {{season.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#season}}

## Season Info

(card

**Year**\
{{year}}

**Name**\
{{name}}

card)

{{/season}}

section)

(section

{{#season.stats}}

## Season Stats

(card

### Overall

|                      |                                  |
|:---------------------|:--------------------------------:|
| **Total Throws**     | {{overall.attempts}}             |
| **Total Score**      | {{overall.totalScore}}           |
| **Score Per Axe**    | {{overall.scorePerAxe}}          |
| **Hatchet Bullseye** | {{hatchet.bullseye.scorePerAxe}} |
| **Hatchet Clutch**   | {{hatchet.clutch.scorePerAxe}}   |
| **Big Axe Bullseye** | {{bigAxe.bullseye.scorePerAxe}}  |
| **Big Axe Clutch**   | {{bigAxe.clutch.scorePerAxe}}    |

card)

(card

### Hatchet

#### Bullseye Breakdown

| Score | Count |
|:-----:|:-----:|
| 5 | {{hatchet.bullseye.breakdown.5}} |
| 3 | {{hatchet.bullseye.breakdown.3}} |
| 1 | {{hatchet.bullseye.breakdown.1}} |
| 0 | {{hatchet.bullseye.breakdown.0}} |

#### Clutch Breakdown

| Score | Count |
|:-----:|:-----:|
| 7 | {{hatchet.clutch.breakdown.7}} |
| 5 | {{hatchet.clutch.breakdown.5}} |
| 0 | {{hatchet.clutch.breakdown.0}} |

card)

(card

### Big Axe

#### Bullseye Breakdown

| Score | Count |
|:-----:|:-----:|
| 5 | {{bigAxe.bullseye.breakdown.5}} |
| 3 | {{bigAxe.bullseye.breakdown.3}} |
| 1 | {{bigAxe.bullseye.breakdown.1}} |
| 0 | {{bigAxe.bullseye.breakdown.0}} |

#### Clutch Breakdown

| Score | Count |
|:-----:|:-----:|
| 7 | {{bigAxe.clutch.breakdown.7}} |
| 5 | {{bigAxe.clutch.breakdown.5}} |
| 0 | {{bigAxe.clutch.breakdown.0}} |

card)

{{/season.stats}}

section)

(section

## Weeks

(card

{{#season.weeks}}
- [Week {{weekId}}](/{{profile.profileId}}/s/{{season.seasonId}}/w/{{weekId}})
{{/season.weeks}}

card)

section)