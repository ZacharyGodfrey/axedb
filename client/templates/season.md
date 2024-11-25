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

**Season**\
{{name}}

card)

## Weeks

{{#weeks}}

<details>
  <summary>{{name}}</summary>
  <div>
    {{#stats}}
    {{>stats}}
    {{/stats}}
  </div>
</details>

{{/weeks}}

## Matches

(card

{{#matches}}

=> [Match {{matchId}}](m/{{matchId}})

{{/matches}}

card)

section)

{{/season}}

<script>
  const DATA = {{{json}}};
</script>