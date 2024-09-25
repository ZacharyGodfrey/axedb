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

{{>stats}}

{{/season.stats}}

section)

(section

## Weeks

(card

{{#season.weeks}}

=> [Week {{weekId}}](/{{profile.profileId}}/s/{{season.seasonId}}/w/{{weekId}})

{{/season.weeks}}

card)

section)