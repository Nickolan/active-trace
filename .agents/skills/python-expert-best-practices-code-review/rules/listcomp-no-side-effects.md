---
title: List comprehensions must produce a value
impact: MEDIUM
impactDescription: Prevents confusing list comprehensions used only for side effects
tags: python, comprehensions, clarity
---

List comprehensions must produce a value you use (no side-effect listcomps).

Bad:
```python
[print(item) for item in items]  # Side effect in list comprehension
```

Good:
```python
for item in items:
    print(item)  # Clear intent
```
