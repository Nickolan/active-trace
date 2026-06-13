"""UserRolRepository — repository for user ↔ role assignments."""
from uuid import UUID, uuid4

from sqlalchemy import and_, delete, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models.rol import Rol
from app.models.user_rol import UserRol
from app.repositories.base import BaseRepository


class UserRolRepository(BaseRepository[UserRol]):
    """Repository for user-role assignments (tenant-scoped).

    Args:
        session: Sesión async de SQLAlchemy.
        tenant_id: UUID del tenant — filtra todas las queries.
    """

    def __init__(self, session: AsyncSession | None, tenant_id: UUID) -> None:
        super().__init__(session=session, model=UserRol, tenant_id=tenant_id)

    async def get_role_codigos_for_user(self, user_id: UUID) -> list[str]:
        """Retorna los códigos de roles asignados a un usuario.

        Realiza JOIN user_rol → rol para obtener los códigos.
        Siempre scoped al tenant del repositorio.
        """
        stmt = (
            select(Rol.codigo)
            .select_from(UserRol)
            .join(Rol, UserRol.rol_id == Rol.id)
            .where(
                and_(
                    UserRol.user_id == user_id,
                    UserRol.tenant_id == self.tenant_id,
                    Rol.deleted_at.is_(None),
                )
            )
        )
        result = await self.session.execute(stmt)
        return [row[0] for row in result.all()]

    async def get_all_active(self) -> list[Rol]:
        """Retorna todos los roles activos del tenant (deleted_at IS NULL).

        Returns:
            Lista de instancias Rol activas para el tenant del repositorio.
        """
        stmt = select(Rol).where(
            and_(
                Rol.tenant_id == self.tenant_id,
                Rol.deleted_at.is_(None),
            )
        )
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def get_roles_for_user(self, user_id: UUID) -> list[Rol]:
        """Retorna los roles asignados al usuario (JOIN user_rol → rol).

        Filtra al tenant del repositorio. Excluye roles soft-deleted.

        Args:
            user_id: UUID del usuario.

        Returns:
            Lista de instancias Rol asignadas al usuario.
        """
        stmt = (
            select(Rol)
            .select_from(UserRol)
            .join(Rol, UserRol.rol_id == Rol.id)
            .where(
                and_(
                    UserRol.user_id == user_id,
                    UserRol.tenant_id == self.tenant_id,
                    Rol.deleted_at.is_(None),
                )
            )
        )
        result = await self.session.scalars(stmt)
        return list(result.all())

    async def get_assignment(self, user_id: UUID, rol_id: UUID) -> UserRol | None:
        """Retorna la asignacion user_rol si existe, None si no.

        Args:
            user_id: UUID del usuario.
            rol_id: UUID del rol.

        Returns:
            Instancia UserRol o None.
        """
        stmt = select(UserRol).where(
            and_(
                UserRol.user_id == user_id,
                UserRol.rol_id == rol_id,
                UserRol.tenant_id == self.tenant_id,
            )
        )
        return await self.session.scalar(stmt)

    async def assign_role(self, user_id: UUID, rol_id: UUID) -> UserRol:
        """Asigna un rol a un usuario."""
        inst = UserRol(
            id=uuid4(),
            user_id=user_id,
            rol_id=rol_id,
            tenant_id=self.tenant_id,
        )
        self.session.add(inst)
        await self.session.flush()
        return inst

    async def remove_role(self, user_id: UUID, rol_id: UUID) -> bool:
        """Elimina la asignacion user_rol.

        Args:
            user_id: UUID del usuario.
            rol_id: UUID del rol.

        Returns:
            True si la fila existia y fue eliminada, False si no existia.
        """
        stmt = (
            delete(UserRol)
            .where(
                and_(
                    UserRol.user_id == user_id,
                    UserRol.rol_id == rol_id,
                    UserRol.tenant_id == self.tenant_id,
                )
            )
            .returning(UserRol.id)
        )
        result = await self.session.execute(stmt)
        deleted = result.fetchone()
        return deleted is not None
