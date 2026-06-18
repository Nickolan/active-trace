---
title: Avoid generic except clauses
impact: HIGH
impactDescription: Prevents hiding unexpected errors
tags: python, exceptions, error-handling
---

Avoid generic `except:` clauses to prevent hiding unexpected errors.

Bad:
```python
try:
    result = risky_operation()
except:  # Catches everything including KeyboardInterrupt, SystemExit
    pass
```

Good:
```python
try:
    result = risky_operation()
except ValueError:
    handle_value_error()
except OSError:
    handle_os_error()
```
