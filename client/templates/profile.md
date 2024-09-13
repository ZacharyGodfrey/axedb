---
title: "{{name}}"
description: "IATF Premier axe throwing data for {{name}}"
---

<section>
  <div class="grid columns-auto-fill items-y-center">
    <div>
      <img src="data:image/png;base64,{{image}}" alt="{{name}}">
    </div>
    <div>
      <h2 id="{{name}}">{{name}}</h2>
      <p>ID: {{profileId}}</p>
    </div>
  </div>
</section>

(~

### Career Stats

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{stats.hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{stats.hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{stats.bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{stats.bigAxe.clutch.scorePerAxe}} |

~)

(~

### Seasons

| Year | Name |
|:----:|------|
{{#seasons}}
| {{year}} | [{{name}}]({{seasonId}}) |
{{/seasons}}

~)