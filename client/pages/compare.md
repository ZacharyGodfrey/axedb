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
        <td x-text="left.stats?.hatchet?.bullseye?.percent[5]"></td>
        <th colspan="2">Bullseye %</th>
        <td x-text="right.stats?.hatchet?.bullseye?.percent[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.count[5]"></td>
        <th colspan="2">5</th>
        <td x-text="right.stats?.hatchet?.bullseye?.count[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.count[3]"></td>
        <th colspan="2">3</th>
        <td x-text="right.stats?.hatchet?.bullseye?.count[3]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.count[1]"></td>
        <th colspan="2">1</th>
        <td x-text="right.stats?.hatchet?.bullseye?.count[1]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.count[0]"></td>
        <th colspan="2">0</th>
        <td x-text="right.stats?.hatchet?.bullseye?.count[0]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.bullseye?.attempts"></td>
        <th colspan="2">Attempts</th>
        <td x-text="right.stats?.hatchet?.bullseye?.attempts"></td>
      </tr>
      <tr>
        <td colspan="4">&nbsp;</td>
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
        <td x-text="left.stats?.hatchet?.clutch?.percent[5]"></td>
        <th colspan="2">Touch Clutch %</th>
        <td x-text="right.stats?.hatchet?.clutch?.percent[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.percent[7]"></td>
        <th colspan="2">Premier Clutch %</th>
        <td x-text="right.stats?.hatchet?.clutch?.percent[7]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.count[7]"></td>
        <th colspan="2">7</th>
        <td x-text="right.stats?.hatchet?.clutch?.count[7]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.count[5]"></td>
        <th colspan="2">5</th>
        <td x-text="right.stats?.hatchet?.clutch?.count[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.count[0]"></td>
        <th colspan="2">0</th>
        <td x-text="right.stats?.hatchet?.clutch?.count[0]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.hatchet?.clutch?.attempts"></td>
        <th colspan="2">Attempts</th>
        <td x-text="right.stats?.hatchet?.clutch?.attempts"></td>
      </tr>
      <tr>
        <td colspan="4">&nbsp;</td>
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
        <td x-text="left.stats?.bigAxe?.bullseye?.percent[5]"></td>
        <th colspan="2">Bullseye %</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.percent[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.bullseye?.count[5]"></td>
        <th colspan="2">5</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.count[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.bullseye?.count[3]"></td>
        <th colspan="2">3</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.count[3]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.bullseye?.count[1]"></td>
        <th colspan="2">1</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.count[1]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.bullseye?.count[0]"></td>
        <th colspan="2">0</th>
        <td x-text="right.stats?.bigAxe?.bullseye?.count[0]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.hatchet?.attempts"></td>
        <th colspan="2">Attempts</th>
        <td x-text="right.stats?.bigAxe?.hatchet?.attempts"></td>
      </tr>
      <tr>
        <td colspan="4">&nbsp;</td>
      </tr>
      <tr>
        <th colspan="4">Big Axe Clutch</th>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.scorePerAxe"></td>
        <th colspan="2">Score Per Axe</th>
        <td x-text="right.stats?.bigAxe?.clutch?.scorePerAxe"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.percent[5]"></td>
        <th colspan="2">Touch Clutch %</th>
        <td x-text="right.stats?.bigAxe?.clutch?.percent[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.percent[7]"></td>
        <th colspan="2">Premier Clutch %</th>
        <td x-text="right.stats?.bigAxe?.clutch?.percent[7]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.count[7]"></td>
        <th colspan="2">7</th>
        <td x-text="right.stats?.bigAxe?.clutch?.count[7]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.count[5]"></td>
        <th colspan="2">5</th>
        <td x-text="right.stats?.bigAxe?.clutch?.count[5]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.count[0]"></td>
        <th colspan="2">0</th>
        <td x-text="right.stats?.bigAxe?.clutch?.count[0]"></td>
      </tr>
      <tr>
        <td x-text="left.stats?.bigAxe?.clutch?.attempts"></td>
        <th colspan="2">Attempts</th>
        <td x-text="right.stats?.bigAxe?.clutch?.attempts"></td>
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