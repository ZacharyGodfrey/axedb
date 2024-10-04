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

{{#matches}}

<div class="card">
  <div class="grid items-y-center">
    <div>
      <img alt="{{opponent.name}}" src="/{{opponent.id}}.webp" class="size100">
    </div>
    <div>
      <p>
        <a href="/profile/{{profile.profileId}}/m/{{matchId}}">{{opponent.name}}</a>
      </p>
    </div>
  </div>
</div>

{{/matches}}

section)

{{/week}}