---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div x-data="STATE" x-cloak>
  <div class="grid stack fill-2 items-y-stretch">
    <div class="card" x-data="left">
      <p>Competitor:</p>
      <select x-on:change="data = await getData($event.target.value); stats = getStats(data, '')">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select x-on:change="timeFrame = getTimeFrame($event.target.value); stats = getStats(data, $event.target.value)">
        <option value="">Career</option>
        <optgroup label="Seasons">
          <template x-for="season in data?.seasons || []">
            <option x-bind:value="season.seasonId" x-text="season.name"></option>
          </template>
        </optgroup>
      </select>
    </div>
    <div class="card" x-data="right">
      <p>Competitor:</p>
      <select x-on:change="data = await getData($event.target.value); stats = getStats(data, '')">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select x-on:change="timeFrame = getTimeFrame($event.target.value); stats = getStats(data, $event.target.value)">
        <option value="">Career</option>
        <optgroup label="Seasons">
          <template x-for="season in data?.seasons || []">
            <option x-bind:value="season.seasonId" x-text="season.name"></option>
          </template>
        </optgroup>
      </select>
    </div>
  </div>
  <table x-show="left.stats !== null && right.stats !== null">
    <tbody>
      <tr>
        <th x-text="left.data.profile.name"></th>
        <th x-text="right.data.profile.name"></th>
      </tr>
      <tr>
        <th x-text="left.timeFrame"></th>
        <th x-text="right.timeFrame"></th>
      </tr>
    </tbody>
  </table>
</div>

section)

<script src="//unpkg.com/alpinejs" defer></script>

<script>
  const STATE = {
    left: {
      data: null,
      stats: null,
      timeFrame: 'Career'
    },
    right: {
      data: null,
      stats: null,
      timeFrame: 'Career'
    }
  };

  const getData = async (profileId) => {
    return await fetch(`/${profileId}.json`).then(x => x.json()).catch(() => null);
  };

  const getTimeFrame = (seasonId) => {
    if (!seasonId) {
      return 'Career';
    }

    const season = data.seasons.find(x => `${x.seasonId}` === seasonId);

    return season.name;
  };

  const getStats = (data, seasonId) => {
    const timeFrame = !seasonId ? data : data.seasons.find(x => `${x.seasonId}` === seasonId);

    return timeFrame?.stats ?? null;
  };
</script>