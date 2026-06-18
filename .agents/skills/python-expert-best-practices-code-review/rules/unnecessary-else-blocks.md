---
title: Avoid unnecessary else blocks after return/break/continue
impact: LOW
impactDescription: Reduces nesting and improves readability
tags: python, control-flow, style
---

Avoid unnecessary else blocks after return/break/continue statements.

Bad:
```python
def check_value(value: int) -> str:
    if value > 0:
        return "positive"
    else:
        return "non-positive"
```

Good:
```python
def check_value(value: int) -> str:
    if value > 0:
        return "positive"
    return "non-positive"
```
