---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div x-data="{ left: { data: null }, right: { data: null } }" x-cloak>
  <div class="grid stack fill-2 items-y-stretch">
    <div class="card" x-data="left">
      <p>Competitor:</p>
      <select x-on:change="data = await getProfile($event.target.value);">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select>
        <option value="">Career</option>
        <template x-for="season in data?.seasons || []">
          <option x-bind:value="season.seasonId" x-text="season.name"></option>
        </template>
      </select>
    </div>
    <div class="card" x-data="right">
      <p>Competitor:</p>
      <select x-on:change="data = await getProfile($event.target.value);">
        <option value=""></option>
        {{#profiles}}
        <option value="{{profileId}}">{{name}}</option>
        {{/profiles}}
      </select>
      <p>Time Frame:</p>
      <select>
        <option value="">Career</option>
        <optgroup label="Seasons">
          <template x-for="season in data?.seasons || []">
            <option x-bind:value="season.seasonId" x-text="season.name"></option>
          </template>
        </optgroup>
      </select>
    </div>
  </div>
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
</script>