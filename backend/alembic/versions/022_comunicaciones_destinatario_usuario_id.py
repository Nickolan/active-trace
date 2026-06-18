"""022 — Add destinatario_usuario_id to comunicaciones

Revision ID: 022
Revises: 021
Create Date: 2026-06-18

Agrega columna destinatario_usuario_id (UUID nullable, FK usuario.id) a la
tabla comunicaciones para permitir consultar comunicaciones recibidas por
un usuario sin descifrar el campo destinatario (que está cifrado AES-256).
"""

from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects.postgresql import UUID

revision: str = "022"
down_revision: Union[str, None] = "021"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "comunicaciones",
        sa.Column(
            "destinatario_usuario_id",
            UUID(as_uuid=True),
            sa.ForeignKey("usuario.id", ondelete="SET NULL"),
            nullable=True,
        ),
    )
    op.create_index(
        "ix_comunicaciones_destinatario_usuario_id",
        "comunicaciones",
        ["destinatario_usuario_id"],
    )


def downgrade() -> None:
    op.drop_index(
        "ix_comunicaciones_destinatario_usuario_id",
        table_name="comunicaciones",
    )
    op.drop_column("comunicaciones", "destinatario_usuario_id")
