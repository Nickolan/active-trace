---
title: Avoid unnecessary comments for self-documenting code
impact: LOW
impactDescription: Reduces noise when code is already clear
tags: python, comments, style
---

Avoid unnecessary comments for self-documenting code.

Bad:
```python
# Increment the counter by 1
count = count + 1
```

Good:
```python
count = count + 1  # Code speaks for itself
```
