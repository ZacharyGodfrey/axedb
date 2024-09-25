---
title: ""
description: "Accuracy stats for IATF Premier axe throwing"
---

<header class="text-center">
  <h1 class="huge">AxeDB</h1>
  <p>Accuracy stats for <strong>IATF Premier</strong> axe throwing</p>
</header>

(section

## Competitors

{{#profiles}}

(card

<div class="grid stack auto-fill-auto items-y-center">
  <div>
    <a href="/{{profileId}}">
      <img alt="{{name}}" src="data:image/png;base64,{{image}}" class="size100">
    </a>
  </div>
  <div>
    <h3>
      <a href="/{{profileId}}">{{name}}</a>
    </h3>
  </div>
  <div>
    <p>#<strong>{{rank}}</strong> &bull; <strong>{{stats.overall.scorePerAxe}}</strong> SPA</p>
  </div>
</div>

card)

{{/profiles}}

section)