---
title: Use d[key] for required dictionary keys
impact: CRITICAL
impactDescription: Fail fast with KeyError instead of silently returning None
tags: python, dictionaries, error-handling
---

Use `d[key]` for required dictionary keys to fail fast with `KeyError` instead of `d.get(key)` which silently returns `None`.

Bad:
```python
def get_username(data: dict) -> str:
    return data.get("username")  # Can return None when username is required
```

Good:
```python
def get_username(data: dict) -> str:
    return data["username"]  # Clearly shows username is required, fails fast
```
