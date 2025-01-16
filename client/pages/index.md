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

(card

<table>
  <thead>
    <tr>
      <th>Rank</th>
      <th>Name</th>
      <th>Score Per Axe</th>
    </tr>
  </thead>
  <tbody>
    {{#profiles}}
    <tr>
      <td class="text-center">
        <strong>{{rank}}</strong>
      </td>
      <td>
        <a href="/{{profileId}}">{{name}}</a>
      </td>
      <td class="text-center">
        <strong>{{scorePerAxe}}</strong>
      </td>
    </tr>
    {{/profiles}}
  </tbody>
</table>

card)

section)