---
title: ""
description: "Accuracy stats for IATF Premier axe throwing"
---

<header class="text-center">
  <h1 class="huge">AxeDB</h1>
  <p>Accuracy stats for <strong>IATF Premier</strong> axe throwing</p>
</header>

(section

## Global Stats

(card

We have analyzed **{{throwCount}}** throws from **{{profiles.length}}** competitors across **{{matchCount}}** matches.

card)

section)

(section

## Competitors

{{#profiles}}

(card

<div class="grid stack auto-fill items-y-center">
  <div>
    <a href="/{{profileId}}">
      <img alt="{{name}}" src="data:image/png;base64,{{image}}" class="size100">
    </a>
  </div>
  <div>
    <p>
      <a href="/{{profileId}}">{{name}}</a>
    </p>
    <p>SPA: {{stats.overall.scorePerAxe}}</p>
  </div>
</div>

card)

{{/profiles}}

section)