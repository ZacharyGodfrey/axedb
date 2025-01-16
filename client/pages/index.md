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
      <th>
        <abbr title="Score Per Axe">SPA</abbr>
      </th>
    </tr>
  </thead>
  <tbody>
    {{#profiles}}
    <tr>
      <td>
        <span>#<strong>{{rank}}</strong></span>
      </td>
      <td>
        <a href="/{{profileId}}">{{name}}</a>
      </td>
      <td>
        <strong>{{scorePerAxe}}</strong>
      </td>
    </tr>
    {{/profiles}}
  </tbody>
</table>

card)

section)