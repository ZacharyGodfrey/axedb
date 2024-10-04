---
title: ""
description: "Accuracy stats for IATF Premier axe throwing"
---

<header class="text-center">
  <h1 class="huge">AxeDB</h1>
  <p>IATF Premier Accuracy Stats</p>
</header>

(section

## Competitors

{{#profiles}}

(card

<div class="grid stack auto-fill-auto items-y-center">
  <div>
    <a href="/profile/{{profileId}}">
      <img alt="{{name}}" src="/{{profileId}}.webp" class="size100">
    </a>
  </div>
  <div>
    <h3>
      <a href="/profile/{{profileId}}">{{name}}</a>
    </h3>
  </div>
  <div>
    <p>#<strong>{{rank}}</strong> | <strong>{{scorePerAxe}}</strong> SPA</p>
  </div>
</div>

card)

{{/profiles}}

section)