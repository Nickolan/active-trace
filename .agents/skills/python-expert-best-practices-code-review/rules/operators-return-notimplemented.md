---
title: Return NotImplemented for unsupported operand types
impact: CRITICAL
impactDescription: Ensures proper operator chaining and error messages
tags: python, operators, error-handling
---

Return `NotImplemented` for unsupported operand types in operator overloads. Design `+` and `+=` intentionally.

Bad:
```python
class Vector:
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        raise TypeError("Unsupported operand type")  # Breaks operator chaining
```

Good:
```python
class Vector:
    def __add__(self, other):
        if isinstance(other, Vector):
            return Vector(self.x + other.x, self.y + other.y)
        return NotImplemented  # Python handles type errors properly
```
