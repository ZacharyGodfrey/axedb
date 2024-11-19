---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

## Compare

<div class="grid stack fill-2 items-y-stretch" x-data="DATA">
  <div>{{>compareSide}}</div>
  <div>{{>compareSide}}</div>
</div>

section)

<script>
  const DATA = {{{json}}};

  console.log(DATA);

  const selectProfile = (element) => {
    const profileId = element.value;

    console.log(profileId);
  };
</script>