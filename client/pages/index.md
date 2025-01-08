---
title: ""
description: "Accuracy stats for IATF Premier axe throwing"
---

<header class="text-center">
  <h1 class="huge">AxeDB</h1>
  <p>IATF Premier Accuracy Stats</p>
</header>

(section

## Global Stats

(card

AxeDB has analyzed **{{stats.formatted.throws}}** throws from **{{stats.formatted.profiles}}** competitors so far.

card)

section)

(section

## Competitors

{{#profiles}}

(card

<div class="grid stack auto-fill-auto items-y-center">
  <div>
    <a href="/{{profileId}}">
      <img alt="{{name}}" src="/{{profileId}}.webp" class="size100">
    </a>
  </div>
  <div>
    <h3>
      <a href="/{{profileId}}">{{name}}</a>
    </h3>
  </div>
  <div>
    <p>#<strong>{{rank}}</strong> | <strong>{{scorePerAxe}}</strong> <abbr title="Score Per Axe">SPA</abbr></p>
  </div>
</div>

card)

{{/profiles}}

section)