---
title: "Match {{match.matchId}} &bull; {{profile.name}}"
description: "Match stats for {{profile.name}} in Match {{match.matchId}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

## Match Info

(card

**Year**\
{{season.year}}

**Season**\
{{season.name}}

**Week**\
{{week.weekId}}

**Match**\
{{match.matchId}}

card)

section)

(section

{{#match.stats}}

## Match Stats

{{>stats}}

{{/match.stats}}

section)

(section

## Rounds

{{#match.rounds}}

(card

Coming soon...

card)

{{/match.rounds}}

section)