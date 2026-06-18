---
title: Change column types safely in SQLAlchemy
impact: HIGH
impactDescription: Prevents table locks and downtime during column type changes
tags: postgresql, sqlalchemy, alembic, migrations, schema-changes
---

When changing a column type that requires a table rewrite, follow these steps:

1. Create a new column with the desired type
2. Write to both columns during the transition period
3. Backfill data from the old column to the new column
4. Move reads from the old column to the new column
5. Stop writing to the old column
6. Drop the old column

Bad:

```python
def upgrade():
    # Directly changing a column type can cause table locks
    op.alter_column('users', 'some_column',
                    type_=sa.String(50),
                    existing_type=sa.Integer())
```

Good:

```python
# Migration 1: Add new column

def upgrade():
    op.add_column('users', sa.Column('some_column_new', sa.String(50)))
```

```python
# Migration 2: Complete the transition (after backfilling data)

def upgrade():
    op.drop_column('users', 'some_column')
    op.alter_column('users', 'some_column_new', new_column_name='some_column')
```
