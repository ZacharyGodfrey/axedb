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

=> [{{name}}](s/{{seasonId}})

{{/seasons}}

card)

section)

<script>
  const profile = {{{json}}};
</script>