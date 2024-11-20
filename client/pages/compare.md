---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div class="card" x-data="compare" x-cloak>
  <table class="fixed">
    <tbody>
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
      <tr>
        <th colspan="4">Hatchet Bullseye</th>
      </tr>
      <tr>
        <th x-text="left.stats?.hatchet?.bullseye?.scorePerAxe"></th>
        <th colspan="2">Score Per Axe</th>
        <th x-text="right.stats?.hatchet?.bullseye?.scorePerAxe"></th>
      </tr>
      <tr>
        <th colspan="4">Hatchet Clutch</th>
      </tr>
      <tr>
        <th x-text="left.stats?.hatchet?.clutch?.scorePerAxe"></th>
        <th colspan="2">Score Per Axe</th>
        <th x-text="right.stats?.hatchet?.clutch?.scorePerAxe"></th>
      </tr>
      <tr>
        <th colspan="4">Big Axe Bullseye</th>
      </tr>
      <tr>
        <th x-text="left.stats?.bigAxe?.bullseye?.scorePerAxe"></th>
        <th colspan="2">Score Per Axe</th>
        <th x-text="right.stats?.bigAxe?.bullseye?.scorePerAxe"></th>
      </tr>
      <tr>
        <th colspan="4">Big Axe Clutch</th>
      </tr>
      <tr>
        <th x-text="left.stats?.bigAxe?.clutch?.scorePerAxe"></th>
        <th colspan="2">Score Per Axe</th>
        <th x-text="right.stats?.bigAxe?.clutch?.scorePerAxe"></th>
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