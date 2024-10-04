---
title: "{{profile.name}}"
description: "Career stats for {{profile.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#profile.stats}}

## Career Stats

{{>stats}}

{{/profile.stats}}

section)

(section

## Seasons

(card

{{#profile.seasons}}

=> [{{name}}](s/{{seasonId}})

{{/profile.seasons}}

card)

section)

<script>
  const profile = {{{profileJson}}};
</script>