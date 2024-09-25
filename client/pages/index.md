---
title: ""
description: "Accuracy stats for IATF Premier axe throwing"
---

<header class="text-center">
  <h1 class="huge">AxeDB</h1>
  <p>Accuracy stats for <strong>IATF Premier</strong> axe throwing</p>
</header>

(section

## Quick Intro

(card

IATF axe throwing has four distinct disciplines which arise from the combination of two different tools (Hatchet and Big Axe) and two different targets (Bullseye and Clutch). A well-rounded and highly-skilled competitor will achieve a high degree of accuracy in each of these four disciplines.

Accuracy could be measured with a number of different metrics, but **AxeDB** focuses primarily on Score Per Axe. The more accurate a throw is, the higher its score will be; and the more consistently accurate a competitor is, the higher their average Score Per Axe will be.

**AxeDB** calculates each competitor's Score Per Axe at the round, match, week, season, and career levels for each of the four disciplines as well as an overall Score Per Axe that collapses their entire performance into a single number for comparison with other competitors.

card)

section)

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
    <p>
      <span>Score Per Axe:</span>
      <strong>{{stats.overall.scorePerAxe}}</strong>
    </p>
  </div>
</div>

card)

{{/profiles}}

section)