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

<script>
  const DATA = {{{json}}};

  console.log(DATA);

  const selectProfile = async (element) => {
    const data = await fetch(`/${element.value}.json`).then(x => x.json());

    console.log(data);
  };
</script>