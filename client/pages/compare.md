---
title: "Compare"
description: "Compare competitors side-by-side."
---

{{>siteHeader}}

(section

<div class="grid stack fill-2 items-y-stretch">
  <div>{{>compareSide}}</div>
  <div>{{>compareSide}}</div>
</div>

section)

<script>
  const DATA = {{{json}}};

  console.log(DATA);
</script>