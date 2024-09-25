---
title: "{{season.name}} &bull; {{profile.name}}"
description: "Season stats for {{profile.name}} in {{season.name}}"
---

{{#season}}

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#stats}}

## Season Stats

{{>stats}}

{{/stats}}

section)

(section

## Season Details

(card

**Year**\
{{year}}

**Name**\
{{name}}

card)

## Weeks

(card

{{#weeks}}

=> [Week {{weekId}}](/{{profile.profileId}}/s/{{seasonId}}/w/{{weekId}})

{{/weeks}}

card)

section)

{{/season}}