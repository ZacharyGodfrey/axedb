---
title: "All Throws"
description: ""
---

(~

## Throws

The following is a flat table of all {{throwData.throws.length}} recorded throws.

~)

(~

| Season | Week | Match | Opponent | Round | Throw | Tool | Target | Score |
|:------:|:----:|:-----:|:--------:|:-----:|:-----:|:----:|:------:|:-----:|
{{#throwData.throws}}
| {{seasonId}} | {{week}} | {{matchId}} | {{opponentId}} | {{round}} | {{throw}} | {{tool}} | {{target}} | {{score}} |
{{/throwData.throws}}

~)