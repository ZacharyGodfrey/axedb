---
title: "{{profile.name}}"
description: "Career stats for {{profile.name}}"
---

{{>siteHeader}}

(section

{{>profileHeader}}

section)

(section

{{#profile.stats}}

## Career Stats

(card

### Score Per Axe

|                      |                                  |
|:---------------------|:--------------------------------:|
| **Overall**          | {{overall.scorePerAxe}}          |
| **Hatchet Bullseye** | {{hatchet.bullseye.scorePerAxe}} |
| **Hatchet Clutch**   | {{hatchet.clutch.scorePerAxe}}   |
| **Big Axe Bullseye** | {{bigAxe.bullseye.scorePerAxe}}  |
| **Big Axe Clutch**   | {{bigAxe.clutch.scorePerAxe}}    |

card)

### Hatchet Breakdown

<div class="grid stack fill-fill items-y-stretch">
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

<div class="grid stack fill-fill items-y-stretch">
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

{{/profile.stats}}

section)

(section

## Seasons

(card

{{#profile.seasons}}

=> [{{name}}](s/{{seasonId}})

{{/profile.seasons}}

card)

section)