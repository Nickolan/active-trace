---
title: No mutable defaults in function parameters
impact: CRITICAL
impactDescription: Prevents unexpected shared state across function calls
tags: python, functions, bugs, common-mistakes
---

No mutable defaults in function/method parameters. Use `None` and assign inside.

Bad:
```python
def add_item(item: str, items: list = []) -> list:
    items.append(item)
    return items  # items list is shared across all calls!
```

Good:
```python
def add_item(item: str, items: list | None = None) -> list:
    if items is None:
        items = []
    items.append(item)
    return items
```
