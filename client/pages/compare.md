---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div x-data="{ left: { data: null, stats: null }, right: { data: null, stats: null } }" x-cloak>
  <div class="grid stack fill-2 items-y-stretch">
    <div class="card" x-data="left">
      <p>Competitor:</p>
      <select x-on:change="data = await getProfile($event.target.value); stats = getStats(data, '')">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select x-on:change="stats = getStats(data, $event.target.value)">
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
      <select x-on:change="data = await getProfile($event.target.value); stats = getStats(data, '')">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select x-on:change="stats = getStats(data, $event.target.value)">
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
    </tbody>
  </table>
</div>

section)

<script src="//unpkg.com/alpinejs" defer></script>

<script>
  const DATA = {{{json}}};

  console.log(DATA);

  const getProfile = async (profileId) => {
    console.log(profileId);

    if (!profileId) {
      return null;
    }

    const data = await fetch(`/${profileId}.json`).then(x => x.json());

    console.log(data);

    return data;
  };

  const getStats = (data, seasonId) => {
    if (!seasonId) {
      return data.stats;
    }

    const season = data.seasons.find(x => `${x.seasonId}` === seasonId);

    return season?.stats;
  };
</script>