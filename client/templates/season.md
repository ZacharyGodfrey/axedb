---
title: "{{season.name}} &bull; {{profile.name}}"
description: "Season stats for {{profile.name}} in {{season.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#season}}

## Season Info

(card

**Year**\
{{year}}

**Name**\
{{name}}

card)

{{/season}}

section)

(section

{{#season.stats}}

## Season Stats

(card

### Score Per Axe

<table>
  <tbody>
    <tr>
      <th align="left">Overall</th>
      <td align="center">{{overall.scorePerAxe}}</td>
    </tr>
    <tr>
      <th align="left">Hatchet Bullseye</th>
      <td align="center">{{hatchet.bullseye.scorePerAxe}}</td>
    </tr>
    <tr>
      <th align="left">Hatchet Clutch</th>
      <td align="center">{{hatchet.clutch.scorePerAxe}}</td>
    </tr>
    <tr>
      <th align="left">Big Axe Bullseye</th>
      <td align="center">{{bigAxe.bullseye.scorePerAxe}}</td>
    </tr>
    <tr>
      <th align="left">Big Axe Clutch</th>
      <td align="center">{{bigAxe.clutch.scorePerAxe}}</td>
    </tr>
  </tbody>
</table>

card)

### Hatchet Breakdown

<div class="grid stack fill-2 items-y-stretch">
  <div class="card">
    <h4>Bullseye</h4>
    <table>
      <thead>
        <tr>
          <th align="center">Score</th>
          <th align="center">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td align="center">5</td>
          <td align="center">{{hatchet.bullseye.breakdown.5}}</td>
        </tr>
        <tr>
          <td align="center">3</td>
          <td align="center">{{hatchet.bullseye.breakdown.3}}</td>
        </tr>
        <tr>
          <td align="center">1</td>
          <td align="center">{{hatchet.bullseye.breakdown.1}}</td>
        </tr>
        <tr>
          <td align="center">0</td>
          <td align="center">{{hatchet.bullseye.breakdown.0}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="card">
    <h4>Clutch</h4>
    <table>
      <thead>
        <tr>
          <th align="center">Score</th>
          <th align="center">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td align="center">7</td>
          <td align="center">{{hatchet.clutch.breakdown.7}}</td>
        </tr>
        <tr>
          <td align="center">5</td>
          <td align="center">{{hatchet.clutch.breakdown.5}}</td>
        </tr>
        <tr>
          <td align="center">0</td>
          <td align="center">{{hatchet.clutch.breakdown.0}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

### Big Axe  Breakdown

<div class="grid stack fill-2 items-y-stretch">
  <div class="card">
    <h4>Bullseye</h4>
    <table>
      <thead>
        <tr>
          <th align="center">Score</th>
          <th align="center">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td align="center">5</td>
          <td align="center">{{bigAxe.bullseye.breakdown.5}}</td>
        </tr>
        <tr>
          <td align="center">3</td>
          <td align="center">{{bigAxe.bullseye.breakdown.3}}</td>
        </tr>
        <tr>
          <td align="center">1</td>
          <td align="center">{{bigAxe.bullseye.breakdown.1}}</td>
        </tr>
        <tr>
          <td align="center">0</td>
          <td align="center">{{bigAxe.bullseye.breakdown.0}}</td>
        </tr>
      </tbody>
    </table>
  </div>
  <div class="card">
    <h4>Clutch</h4>
    <table>
      <thead>
        <tr>
          <th align="center">Score</th>
          <th align="center">Count</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td align="center">7</td>
          <td align="center">{{bigAxe.clutch.breakdown.7}}</td>
        </tr>
        <tr>
          <td align="center">5</td>
          <td align="center">{{bigAxe.clutch.breakdown.5}}</td>
        </tr>
        <tr>
          <td align="center">0</td>
          <td align="center">{{bigAxe.clutch.breakdown.0}}</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>

{{/season.stats}}

section)

(section

## Weeks

(card

{{#season.weeks}}

=> [Week {{weekId}}](/{{profile.profileId}}/s/{{season.seasonId}}/w/{{weekId}})

{{/season.weeks}}

card)

section)