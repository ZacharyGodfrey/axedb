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

  const getProfile = async (event) => {
    // const data = await fetch(`/${event.value}.json`).then(x => x.json());

    console.log(event);
  };
</script>