"""Tests unitarios para schemas de Rol (C-26 asignacion-roles-usuarios).

Verifica:
- extra='forbid' en todos los schemas
- Validacion de campos requeridos
- Tipos correctos
"""

from __future__ import annotations

from uuid import UUID, uuid4

import pytest
from pydantic import ValidationError


class TestRolReadSchema:
    """Tests para RolRead."""

    def test_valid_minimal(self):
        from app.schemas.rol import RolRead

        uid = uuid4()
        data = RolRead(id=uid, codigo="ADMIN", nombre="Administrador")
        assert data.id == uid
        assert data.codigo == "ADMIN"
        assert data.nombre == "Administrador"

    def test_extra_fields_forbidden(self):
        from app.schemas.rol import RolRead

        with pytest.raises(ValidationError):
            RolRead(
                id=uuid4(),
                codigo="ADMIN",
                nombre="Administrador",
                campo_extra="no permitido",
            )

    def test_id_must_be_uuid(self):
        from app.schemas.rol import RolRead

        with pytest.raises(ValidationError):
            RolRead(id="no-un-uuid", codigo="X", nombre="Y")


class TestRolAsignarRequestSchema:
    """Tests para RolAsignarRequest."""

    def test_valid(self):
        from app.schemas.rol import RolAsignarRequest

        uid = uuid4()
        data = RolAsignarRequest(rol_id=uid)
        assert data.rol_id == uid

    def test_extra_fields_forbidden(self):
        from app.schemas.rol import RolAsignarRequest

        with pytest.raises(ValidationError):
            RolAsignarRequest(rol_id=uuid4(), campo_extra="no permitido")

    def test_missing_rol_id_raises(self):
        from app.schemas.rol import RolAsignarRequest

        with pytest.raises(ValidationError):
            RolAsignarRequest()
