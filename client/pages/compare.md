---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div class="card" x-data="compare" x-cloak>
  <table class="fixed">
    <thead>
      <tr>
        <th colspan="2" x-data="left">
          <select x-on:change="data = await getData($event.target.value); stats = getStats(data, '')">
            <option value="">Competitor</option>
            {{#profiles}}
            <option value="{{profileId}}">{{name}}</option>
            {{/profiles}}
          </select>
          <select x-on:change="stats = getStats(data, $event.target.value)">
            <option value="">Career</option>
            <optgroup label="Seasons">
              <template x-for="season in data?.seasons || []">
                <option x-bind:value="season.seasonId" x-text="season.name"></option>
              </template>
            </optgroup>
          </select>
        </th>
        <th colspan="2" x-data="right">
          <select x-on:change="data = await getData($event.target.value); stats = getStats(data, '')">
            <option value="">Competitor</option>
            {{#profiles}}
            <option value="{{profileId}}">{{name}}</option>
            {{/profiles}}
          </select>
          <select x-on:change="stats = getStats(data, $event.target.value)">
            <option value="">Career</option>
            <optgroup label="Seasons">
              <template x-for="season in data?.seasons || []">
                <option x-bind:value="season.seasonId" x-text="season.name"></option>
              </template>
            </optgroup>
          </select>
        </th>
      </tr>
    </thead>
    <tbody class="text-center" x-show="left.stats !== null && right.stats !== null">
      <tr>
        <th colspan="4">Hatchet Bullseye</th>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.scorePerAxe"></td>
        <th colspan="2">Score Per Axe</th>
        <td x-text="right.stats?.hatchet?.bullseye?.scorePerAxe"></td>
      </tr>
      <tr>
        <th colspan="4">Hatchet Clutch</th>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.scorePerAxe"></td>
        <th colspan="2">Score Per Axe</th>
        <td x-text="right.stats?.hatchet?.clutch?.scorePerAxe"></td>
      </tr>
      <tr>
        <th colspan="4">Big Axe Bullseye</th>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.bullseye?.scorePerAxe"></td>
        <th colspan="2">Score Per Axe</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.scorePerAxe"></td>
      </tr>
      <tr>
        <th colspan="4">Big Axe Clutch</th>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.scorePerAxe"></td>
        <th colspan="2">Score Per Axe</th>
        <td x-text="right.stats?.bigAxe?.clutch?.scorePerAxe"></td>
      </tr>
    </tbody>
  </table>
</div>

section)

<script src="//unpkg.com/alpinejs" defer></script>

<script>
  const compare = {
    left: {
      data: null,
      stats: null
    },
    right: {
      data: null,
      stats: null
    }
  };

  const getData = async (profileId) => {
    return await fetch(`/${profileId}.json`).then(x => x.json()).catch(() => null);
  };

  const getStats = (data, seasonId) => {
    const timeFrame = !seasonId ? data : data.seasons.find(x => `${x.seasonId}` === seasonId);

    return timeFrame?.stats ?? null;
  };
</script>