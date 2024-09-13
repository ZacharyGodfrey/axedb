---
title: "Season"
description: "Season stats"
---

<section>
  <div class="grid columns-auto-fill items-y-center">
    <div>
      <img src="data:image/png;base64,{{profile.image}}" alt="{{profile.name}}" class="profilePic">
    </div>
    <div>
      <h2 id="{{profile.name}}">{{profile.name}}</h2>
      <p>ID: {{profile.profileId}}</p>
    </div>
  </div>

  <h3>Season</h3>

  <p>{{season.name}}</p>
</section>

(~

### Season Stats

{{^season.stats}}

No stats have been analyzed for this season yet.

{{/season.stats}}

{{#season.stats}}

| Key | Value |
|----:|:------|
| Hatchet Bullseye Score Per Axe | {{hatchet.bullseye.scorePerAxe}} |
| Hatchet Clutch Score Per Axe | {{hatchet.clutch.scorePerAxe}} |
| Big Axe Bullseye Score Per Axe | {{bigAxe.bullseye.scorePerAxe}} |
| Big Axe Clutch Score Per Axe | {{bigAxe.clutch.scorePerAxe}} |

{{/season.stats}}

~)