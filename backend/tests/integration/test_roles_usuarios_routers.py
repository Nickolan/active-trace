"""Tests E2E de API para asignacion de roles a usuarios (C-26).

Cubre:
  GET  /api/admin/roles
  GET  /api/admin/usuarios/{id}/roles
  POST /api/admin/usuarios/{id}/roles
  DELETE /api/admin/usuarios/{id}/roles/{rol_id}

Requiere PostgreSQL real (DATABASE_URL_TEST en el entorno).
"""

from __future__ import annotations

from uuid import UUID, uuid4

import pytest
import pytest_asyncio
from httpx import AsyncClient
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.security import create_access_token
from app.models.usuario import Usuario
from tests.conftest import db_available

pytestmark = [
    pytest.mark.skipif(
        not db_available(),
        reason="Requiere PostgreSQL: definir DATABASE_URL_TEST en el entorno",
    ),
]

_DEV_TENANT_ID = UUID("00000000-0000-0000-0000-000000000001")
_OTHER_TENANT_ID = UUID("00000000-0000-0000-0000-000000000002")
_SECRET_KEY = "a" * 64


# ── Helpers ────────────────────────────────────────────────────────────────


def _admin_token() -> str:
    """JWT con rol ADMIN (tiene admin:gestionar-usuarios)."""
    return create_access_token(
        user_id=uuid4(),
        tenant_id=_DEV_TENANT_ID,
        secret_key=_SECRET_KEY,
        roles=["ADMIN"],
    )


def _alumno_token() -> str:
    """JWT con rol ALUMNO (NO tiene admin:gestionar-usuarios)."""
    return create_access_token(
        user_id=uuid4(),
        tenant_id=_DEV_TENANT_ID,
        secret_key=_SECRET_KEY,
        roles=["ALUMNO"],
    )


async def _seed_rbac(db_session: AsyncSession) -> None:
    """Seed minimo: permiso + rol ADMIN + vinculo."""
    perm_id = uuid4()
    await db_session.execute(
        text(
            "INSERT INTO permiso (id, codigo, descripcion, created_at) "
            "VALUES (:id, :codigo, :descripcion, now()) "
            "ON CONFLICT (codigo) DO NOTHING"
        ),
        {
            "id": perm_id,
            "codigo": "admin:gestionar-usuarios",
            "descripcion": "Gestionar usuarios",
        },
    )

    rol_id = uuid4()
    await db_session.execute(
        text(
            "INSERT INTO rol (id, tenant_id, codigo, nombre, "
            "descripcion, created_at, updated_at) "
            "VALUES (:id, :tenant_id, :codigo, :nombre, "
            ":descripcion, now(), now()) "
            "ON CONFLICT (tenant_id, codigo) DO NOTHING"
        ),
        {
            "id": rol_id,
            "tenant_id": _DEV_TENANT_ID,
            "codigo": "ADMIN",
            "nombre": "Administrador",
            "descripcion": "Admin",
        },
    )

    await db_session.execute(
        text(
            "INSERT INTO rol_permiso (id, tenant_id, rol_id, permiso_id, created_at) "
            "VALUES (:id, :tenant_id, :rol_id, :permiso_id, now()) "
            "ON CONFLICT DO NOTHING"
        ),
        {
            "id": uuid4(),
            "tenant_id": _DEV_TENANT_ID,
            "rol_id": rol_id,
            "permiso_id": perm_id,
        },
    )
    await db_session.commit()


async def _seed_rol(
    db_session: AsyncSession,
    codigo: str,
    nombre: str,
    tenant_id: UUID = _DEV_TENANT_ID,
) -> UUID:
    """Inserta un rol en la DB y retorna su UUID."""
    rid = uuid4()
    await db_session.execute(
        text(
            "INSERT INTO rol (id, tenant_id, codigo, nombre, "
            "descripcion, created_at, updated_at) "
            "VALUES (:id, :tenant_id, :codigo, :nombre, :desc, now(), now()) "
            "ON CONFLICT (tenant_id, codigo) DO NOTHING"
        ),
        {
            "id": rid,
            "tenant_id": tenant_id,
            "codigo": codigo,
            "nombre": nombre,
            "desc": nombre,
        },
    )
    await db_session.commit()
    # Obtener el ID real (puede haber conflicto)
    result = await db_session.execute(
        text("SELECT id FROM rol WHERE tenant_id=:tid AND codigo=:codigo"),
        {"tid": tenant_id, "codigo": codigo},
    )
    row = result.fetchone()
    return UUID(str(row[0]))


async def _seed_usuario(db_session: AsyncSession, email: str) -> tuple[UUID, UUID]:
    """Inserta un users (auth) + usuario (dominio) vinculados en el tenant dev.

    Retorna (domain_uid, auth_uid):
    - domain_uid: usuario.id — usar en paths de URL (/api/admin/usuarios/{id}/...)
    - auth_uid: users.id — usar en inserts directos a user_rol

    El usuario dominio se inserta via ORM para que EncryptedColumn cifre el email.
    """
    auth_uid = uuid4()
    await db_session.execute(
        text(
            "INSERT INTO users (id, tenant_id, email, password_hash, "
            "is_active, totp_enabled, created_at, updated_at) "
            "VALUES (:id, :tenant_id, :email, :hash, true, false, now(), now())"
        ),
        {
            "id": auth_uid,
            "tenant_id": _DEV_TENANT_ID,
            "email": email,
            "hash": "placeholder_hash",
        },
    )
    await db_session.flush()

    domain_uid = uuid4()
    db_session.add(
        Usuario(
            id=domain_uid,
            tenant_id=_DEV_TENANT_ID,
            nombre="Test",
            apellidos="User",
            email=email,
            estado="Activo",
            auth_user_id=auth_uid,
        )
    )
    await db_session.commit()
    return domain_uid, auth_uid


@pytest.fixture(autouse=True)
def _patch_env(monkeypatch):
    monkeypatch.setenv("SECRET_KEY", _SECRET_KEY)
    monkeypatch.setenv("ENCRYPTION_KEY", "b" * 32)
    monkeypatch.setenv("DATABASE_URL", "placeholder")


# ===========================================================================
# 4.1 — GET /api/admin/roles
# ===========================================================================


class TestGetRoles:
    """GET /api/admin/roles — lista roles activos del tenant."""

    @pytest_asyncio.fixture(autouse=True)
    async def _setup(self, db_session: AsyncSession, seed_dev_tenant: None) -> None:
        await _seed_rbac(db_session)

    async def test_returns_roles_for_tenant(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Retorna los roles activos del tenant del usuario autenticado."""
        await _seed_rol(db_session, "PROFESOR", "Profesor")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.get("/api/admin/roles", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert isinstance(body, list)
        codigos = [r["codigo"] for r in body]
        assert "PROFESOR" in codigos or "ADMIN" in codigos

    async def test_returns_403_without_permission(self, client: AsyncClient) -> None:
        """Sin permiso admin:gestionar-usuarios → 403."""
        headers = {"Authorization": f"Bearer {_alumno_token()}"}
        resp = await client.get("/api/admin/roles", headers=headers)
        assert resp.status_code == 403

    async def test_response_has_required_fields(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Cada rol en la respuesta tiene id, codigo, nombre."""
        await _seed_rol(db_session, "COORD", "Coordinador")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.get("/api/admin/roles", headers=headers)
        assert resp.status_code == 200
        for rol in resp.json():
            assert "id" in rol
            assert "codigo" in rol
            assert "nombre" in rol


# ===========================================================================
# 4.2 — GET /api/admin/usuarios/{id}/roles
# ===========================================================================


class TestGetUsuarioRoles:
    """GET /api/admin/usuarios/{id}/roles."""

    @pytest_asyncio.fixture(autouse=True)
    async def _setup(self, db_session: AsyncSession, seed_dev_tenant: None) -> None:
        await _seed_rbac(db_session)

    async def test_returns_empty_list_when_no_roles(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Usuario sin roles → lista vacia."""
        domain_uid, _auth_uid = await _seed_usuario(db_session, f"noroles-{uuid4()}@test.com")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.get(f"/api/admin/usuarios/{domain_uid}/roles", headers=headers)
        assert resp.status_code == 200
        assert resp.json() == []

    async def test_returns_404_for_unknown_user(self, client: AsyncClient) -> None:
        """Usuario inexistente → 404."""
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.get(
            f"/api/admin/usuarios/{uuid4()}/roles", headers=headers
        )
        assert resp.status_code == 404

    async def test_returns_assigned_roles(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Usuario con un rol asignado → aparece en la respuesta."""
        domain_uid, auth_uid = await _seed_usuario(db_session, f"withroles-{uuid4()}@test.com")
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol Test")
        # Asignar el rol directamente usando auth_uid (FK → users.id)
        await db_session.execute(
            text(
                "INSERT INTO user_rol (id, user_id, rol_id, tenant_id, created_at) "
                "VALUES (:id, :user_id, :rol_id, :tenant_id, now())"
            ),
            {
                "id": uuid4(),
                "user_id": auth_uid,
                "rol_id": rol_id,
                "tenant_id": _DEV_TENANT_ID,
            },
        )
        await db_session.commit()

        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.get(f"/api/admin/usuarios/{domain_uid}/roles", headers=headers)
        assert resp.status_code == 200
        body = resp.json()
        assert len(body) == 1
        assert str(rol_id) == body[0]["id"]


# ===========================================================================
# 4.3 — POST /api/admin/usuarios/{id}/roles
# ===========================================================================


class TestPostUsuarioRoles:
    """POST /api/admin/usuarios/{id}/roles — asignacion de rol."""

    @pytest_asyncio.fixture(autouse=True)
    async def _setup(self, db_session: AsyncSession, seed_dev_tenant: None) -> None:
        await _seed_rbac(db_session)

    async def test_assign_role_success(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Asignacion exitosa → 200."""
        domain_uid, _auth_uid = await _seed_usuario(db_session, f"assign-{uuid4()}@test.com")
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol Asig")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.post(
            f"/api/admin/usuarios/{domain_uid}/roles",
            json={"rol_id": str(rol_id)},
            headers=headers,
        )
        assert resp.status_code == 200

    async def test_assign_role_idempotent(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Asignar el mismo rol dos veces no duplica la fila → 200 ambas veces."""
        domain_uid, _auth_uid = await _seed_usuario(db_session, f"idem-{uuid4()}@test.com")
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol Idem")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        payload = {"rol_id": str(rol_id)}

        resp1 = await client.post(
            f"/api/admin/usuarios/{domain_uid}/roles", json=payload, headers=headers
        )
        assert resp1.status_code == 200

        resp2 = await client.post(
            f"/api/admin/usuarios/{domain_uid}/roles", json=payload, headers=headers
        )
        assert resp2.status_code == 200

    async def test_assign_role_unknown_user_returns_404(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Usuario dominio inexistente → 404."""
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol 404u")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.post(
            f"/api/admin/usuarios/{uuid4()}/roles",
            json={"rol_id": str(rol_id)},
            headers=headers,
        )
        assert resp.status_code == 404

    async def test_assign_role_wrong_tenant_returns_404(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Rol de otro tenant → 404."""
        domain_uid, _auth_uid = await _seed_usuario(db_session, f"wrongtenant-{uuid4()}@test.com")

        # Insertar tenant alternativo
        await db_session.execute(
            text(
                "INSERT INTO tenant (id, tenant_id, nombre, created_at, updated_at) "
                "VALUES (:id, :tid, :nombre, now(), now()) "
                "ON CONFLICT DO NOTHING"
            ),
            {
                "id": _OTHER_TENANT_ID,
                "tid": _OTHER_TENANT_ID,
                "nombre": "Other Tenant",
            },
        )
        await db_session.commit()

        # Crear rol en otro tenant
        other_rol_id = uuid4()
        await db_session.execute(
            text(
                "INSERT INTO rol (id, tenant_id, codigo, nombre, "
                "descripcion, created_at, updated_at) "
                "VALUES (:id, :tenant_id, :codigo, :nombre, :desc, now(), now())"
            ),
            {
                "id": other_rol_id,
                "tenant_id": _OTHER_TENANT_ID,
                "codigo": "OTHER",
                "nombre": "Other Rol",
                "desc": "Other",
            },
        )
        await db_session.commit()

        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.post(
            f"/api/admin/usuarios/{domain_uid}/roles",
            json={"rol_id": str(other_rol_id)},
            headers=headers,
        )
        assert resp.status_code == 404


# ===========================================================================
# 4.4 — DELETE /api/admin/usuarios/{id}/roles/{rol_id}
# ===========================================================================


class TestDeleteUsuarioRol:
    """DELETE /api/admin/usuarios/{id}/roles/{rol_id}."""

    @pytest_asyncio.fixture(autouse=True)
    async def _setup(self, db_session: AsyncSession, seed_dev_tenant: None) -> None:
        await _seed_rbac(db_session)

    async def test_remove_role_success(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Remover rol existente → 200."""
        domain_uid, auth_uid = await _seed_usuario(db_session, f"delrole-{uuid4()}@test.com")
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol Del")
        # Insertar en user_rol usando auth_uid (FK → users.id)
        await db_session.execute(
            text(
                "INSERT INTO user_rol (id, user_id, rol_id, tenant_id, created_at) "
                "VALUES (:id, :user_id, :rol_id, :tenant_id, now())"
            ),
            {
                "id": uuid4(),
                "user_id": auth_uid,
                "rol_id": rol_id,
                "tenant_id": _DEV_TENANT_ID,
            },
        )
        await db_session.commit()

        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.delete(
            f"/api/admin/usuarios/{domain_uid}/roles/{rol_id}", headers=headers
        )
        assert resp.status_code == 200

    async def test_remove_nonexistent_assignment_returns_404(
        self, client: AsyncClient, db_session: AsyncSession
    ) -> None:
        """Asignacion inexistente → 404."""
        domain_uid, _auth_uid = await _seed_usuario(db_session, f"notassigned-{uuid4()}@test.com")
        rol_id = await _seed_rol(db_session, f"ROL-{uuid4().hex[:4]}", "Rol NoAsig")
        headers = {"Authorization": f"Bearer {_admin_token()}"}
        resp = await client.delete(
            f"/api/admin/usuarios/{domain_uid}/roles/{rol_id}", headers=headers
        )
        assert resp.status_code == 404
