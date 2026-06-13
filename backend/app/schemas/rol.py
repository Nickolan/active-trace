"""Schemas Pydantic v2 para Roles (C-26 asignacion-roles-usuarios).

Convención del proyecto:
- ``*Read``    → respuesta de salida del endpoint.
- ``*Request`` → body de entrada del endpoint.
- ``model_config = ConfigDict(extra='forbid')`` (REGLA DURA #5).
"""

from __future__ import annotations

from uuid import UUID

from pydantic import BaseModel, ConfigDict


class RolRead(BaseModel):
    """Representación de un Rol retornada por la API.

    Attributes:
        id: UUID del rol.
        codigo: Código corto del rol (ej. ``"ADMIN"``).
        nombre: Nombre legible del rol (ej. ``"Administrador"``).
    """

    model_config = ConfigDict(extra="forbid")

    id: UUID
    codigo: str
    nombre: str


class RolAsignarRequest(BaseModel):
    """Body de ``POST /api/admin/usuarios/{usuario_id}/roles``.

    Attributes:
        rol_id: UUID del rol a asignar al usuario.
    """

    model_config = ConfigDict(extra="forbid")

    rol_id: UUID
