---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div class="grid stack fill-2 items-y-stretch">
  <div>{{>compareSide}}</div>
  <div>{{>compareSide}}</div>
</div>

section)

<script src="//unpkg.com/alpinejs" defer></script>

<script>
  const DATA = {{{json}}};

  console.log(DATA);

  const getProfile = async (profileId) => {
    const data = await fetch(`/${profileId}.json`).then(x => x.json());

    console.log(data);

    return data;
  };
</script>