---
title: "Week {{week.weekId}} &bull; {{season.name}} &bull; {{profile.name}}"
description: "Week stats for {{profile.name}} in Week {{week.weekId}} of {{season.name}}"
---

{{#week}}

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#stats}}

## Week Stats

{{>stats}}

{{/stats}}

section)

(section

## Week Details

(card

**Year**\
{{season.year}}

**Season**\
{{season.name}}

**Week**\
{{weekId}}

card)

## Matches

(card

{{#matches}}

=> [{{matchId}}](/{{profile.profileId}}/m/{{matchId}})

{{/matches}}

card)

section)

{{/week}}