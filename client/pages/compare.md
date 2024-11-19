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

<script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>

<script>
  const DATA = {{{json}}};

  console.log(DATA);
</script>