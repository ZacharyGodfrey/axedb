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

## Season Details

(card

**Year**\
{{year}}

**Season**\
{{name}}

card)

section)

(section

{{#stats}}

## Season Stats

{{>stats}}

{{/stats}}

section)

<!--
(section

## Weeks

{{#weeks}}

{{>week}}

{{/weeks}}

section)
-->

{{/season}}

<script>
  const DATA = {{{json}}};
</script>