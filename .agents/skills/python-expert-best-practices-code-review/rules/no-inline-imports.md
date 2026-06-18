---
title: Place imports at the top of the file
impact: MEDIUM
impactDescription: Improves readability and follows PEP 8
tags: python, imports, style
---

Place all import statements at the top of the file.

Bad:
```python
def process_data():
    import json  # Inline import
    return json.dumps({"key": "value"})
```

Good:
```python
import json

def process_data():
    return json.dumps({"key": "value"})
```
