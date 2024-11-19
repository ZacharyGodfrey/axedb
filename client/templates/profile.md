---
title: "{{profile.name}}"
description: "Career stats for {{profile.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#stats}}

## Career Stats

{{>stats}}

{{/stats}}

section)

(section

## Seasons

(card

{{#seasons}}

=> [{{name}}](/{{profile.profileId}}/s/{{seasonId}})

{{/seasons}}

card)

section)

<script>
  const DATA = {{{json}}};
</script>