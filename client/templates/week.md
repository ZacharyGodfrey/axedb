---
title: "Week {{week.weekId}} &bull; {{season.name}} &bull; {{profile.name}}"
description: "Week stats for {{profile.name}} in Week {{week.weekId}} of {{season.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

## Week Info

(card

**Year**\
{{season.year}}

**Season**\
{{season.name}}

**Week**\
{{week.weekId}}

card)

section)

(section

{{#week.stats}}

## Week Stats

{{>stats}}

{{/week.stats}}

section)

(section

## Matches

(card

{{#week.matches}}

=> [{{matchId}}](/{{profile.profileId}}/m/{{matchId}})

{{/week.matches}}

card)

section)