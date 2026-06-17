"""Router de Guardias — registro y consulta de guardias de atención (C-13).

Endpoints:
- POST /api/guardias — registrar guardia.
- GET /api/guardias — listar guardias con filtros.
- PATCH /api/guardias/{guardia_id} — editar estado/comentarios.
- GET /api/guardias/exportar — exportar guardias.
"""

from __future__ import annotations

from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.dependencies import (
    UserContext,
    get_db,
    require_permission,
)
from app.core.exceptions import BusinessError
from app.models.usuario import Usuario
from app.schemas.guardias import (
    GuardiaCreate,
    GuardiaListResponse,
    GuardiaResponse,
    GuardiaUpdate,
)
from app.services.guardia_service import GuardiaService

router = APIRouter(
    prefix="/api/guardias",
    tags=["guardias"],
)


async def _resolve_usuario_id(
    db: AsyncSession, user_id: UUID
) -> UUID:
    """Resuelve un user_id a ``usuario.id``.

    El JWT puede contener ``users.id`` (auth) o directamente ``usuario.id``
    (tests). Probamos ambas vias:
    1. Si ``user_id`` ya es un ``usuario.id`` → lo retorna directo.
    2. Si no, busca por ``usuario.auth_user_id == user_id``.
    """
    row = await db.get(Usuario, user_id)
    if row is not None:
        return row.id

    result = await db.execute(
        select(Usuario.id).where(Usuario.auth_user_id == user_id)
    )
    row = result.scalar_one_or_none()
    if row is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Perfil de usuario no encontrado",
        )
    return row


def _build_service(
    db: AsyncSession, ctx: UserContext
) -> GuardiaService:
    return GuardiaService(
        session=db,
        tenant_id=ctx.tenant_id,
        actor_id=ctx.user_id,
        roles=ctx.roles,
    )


@router.post("", status_code=status.HTTP_201_CREATED)
async def registrar_guardia(
    body: GuardiaCreate,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(require_permission("guardias:registrar")),
) -> dict:
    """Registra una nueva guardia."""
    usuario_id = await _resolve_usuario_id(db, ctx.user_id)
    service = _build_service(db, ctx)
    service.actor_id = usuario_id
    try:
        return await service.registrar_guardia(datos=body)
    except BusinessError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("")
async def listar_guardias(
    materia_id: UUID | None = Query(None),
    usuario_id: UUID | None = Query(None),
    desde: date | None = Query(None),
    hasta: date | None = Query(None),
    estado: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(require_permission("guardias:registrar")),
) -> dict:
    """Lista guardias con filtros."""
    actor_usuario_id = await _resolve_usuario_id(db, ctx.user_id)
    service = _build_service(db, ctx)
    service.actor_id = actor_usuario_id
    result = await service.listar_guardias(
        materia_id=materia_id,
        usuario_id=usuario_id,
        desde=desde,
        hasta=hasta,
        estado=estado,
    )
    return result


@router.patch("/{guardia_id}")
async def editar_guardia(
    guardia_id: UUID,
    body: GuardiaUpdate,
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(require_permission("guardias:registrar")),
) -> dict:
    """Edita estado y/o comentarios de una guardia."""
    usuario_id = await _resolve_usuario_id(db, ctx.user_id)
    service = _build_service(db, ctx)
    service.actor_id = usuario_id
    try:
        return await service.editar_guardia(guardia_id, body)
    except BusinessError as exc:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(exc),
        ) from exc


@router.get("/exportar")
async def exportar_guardias(
    materia_id: UUID | None = Query(None),
    usuario_id: UUID | None = Query(None),
    desde: date | None = Query(None),
    hasta: date | None = Query(None),
    estado: str | None = Query(None),
    db: AsyncSession = Depends(get_db),
    ctx: UserContext = Depends(require_permission("guardias:ver-admin")),
) -> list:
    """Exporta guardias con filtros (requiere guardias:ver-admin)."""
    actor_usuario_id = await _resolve_usuario_id(db, ctx.user_id)
    service = _build_service(db, ctx)
    service.actor_id = actor_usuario_id
    return await service.exportar_guardias(
        materia_id=materia_id,
        usuario_id=usuario_id,
        desde=desde,
        hasta=hasta,
        estado=estado,
    )
