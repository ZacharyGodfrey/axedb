---
type: "page"
title: "All Throws"
description: ""
---

(~

## {{meta.title}}

~)

(~

| Season | Week | Match | Opponent | Round | Throw | Tool | Target | Score |
|:------:|:----:|:-----:|:--------:|:-----:|:-----:|:----:|:------:|:-----:|
{{#throwData.throws}}
| {{seasonId}} | {{week}} | {{matchId}} | {{opponentId}} | {{round}} | {{throw}} | {{tool}} | {{target}} | {{score}} |
{{/throwData.throws}}

~)